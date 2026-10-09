const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

process.env.JWT_SECRET = "test-secret";
process.env.MONGODB_URI = "mongodb://placeholder";

let mongod;
let server;
let base;

// Tiny cookie-aware client: one instance per simulated user.
const client = () => {
  let cookie = "";
  const call = async (method, path, body) => {
    const res = await fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json", ...(cookie && { Cookie: cookie }) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    const text = await res.text();
    const isJson = res.headers.get("content-type")?.includes("json");
    return { status: res.status, body: isJson && text ? JSON.parse(text) : text, headers: res.headers };
  };
  return {
    get: (p) => call("GET", p),
    post: (p, b) => call("POST", p, b),
    put: (p, b) => call("PUT", p, b),
    del: (p, b) => call("DELETE", p, b),
  };
};

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  const app = require("../src/app");
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  server?.close();
  await mongoose.disconnect();
  await mongod?.stop();
});

const signup = async (name) => {
  const c = client();
  const res = await c.post("/auth/signup", { username: name, password: "secret123" });
  assert.equal(res.status, 201);
  return c;
};

test("auth: cookie is httpOnly, password never leaks, protected routes need a session", async () => {
  const anon = client();
  assert.equal((await anon.get("/structures")).status, 401);

  const res = await anon.post("/auth/signup", { username: "alice", password: "secret123" });
  assert.equal(res.status, 201);
  assert.match(res.headers.get("set-cookie"), /HttpOnly/i);
  assert.equal(res.body.user.password, undefined);

  assert.equal((await anon.get("/auth/me")).body.user.username, "alice");
  assert.equal((await client().post("/auth/login", { username: "alice", password: "nope" })).status, 401);
  assert.equal((await anon.post("/auth/signup", { username: "alice", password: "secret123" })).status, 409);
  assert.equal((await client().post("/auth/login", { username: { $ne: "" }, password: { $ne: "" } })).status, 400);

  await anon.post("/auth/logout");
  assert.equal((await anon.get("/auth/me")).status, 401);
});

test("users cannot read or modify each other's structures, animals or logs", async () => {
  const bob = await signup("bob");
  const eve = await signup("eve");

  const { body: s } = await bob.post("/structures", { name: "Red Barn", type: "Barn", user: "hacked" });
  const sid = s.structure._id;
  const { body: a } = await bob.post("/animals", { name: "Bessie", species: "Cow", structure: sid });
  const aid = a.animal._id;
  const { body: l } = await bob.post(`/animals/${aid}/logs`, { date: "2026-01-02", eventType: "Vet Visit" });

  assert.equal((await eve.get(`/structures/${sid}`)).status, 404);
  assert.equal((await eve.put(`/structures/${sid}`, { name: "Mine" })).status, 404);
  assert.equal((await eve.del(`/structures/${sid}`)).status, 404);
  assert.equal((await eve.get(`/animals/${aid}`)).status, 404);
  assert.equal((await eve.post("/animals", { name: "X", species: "Cow", structure: sid })).status, 404);
  assert.equal((await eve.get(`/animals/${aid}/logs`)).status, 404);
  assert.equal((await eve.put(`/logs/${l.log._id}`, { eventType: "Other" })).status, 404);
  assert.equal((await eve.del(`/logs/${l.log._id}`)).status, 404);
  assert.deepEqual((await eve.get("/animals")).body.animals, []);

  // Mass assignment: owner is ignored from the body.
  const { body: me } = await bob.get("/auth/me");
  const created = await bob.get(`/structures/${sid}`);
  assert.equal(created.body.structure.user, me.user._id);

  // Eve cannot move her animals into Bob's structure, nor bulk-touch Bob's animals.
  const { body: es } = await eve.post("/structures", { name: "Shed", type: "Other" });
  const { body: ea } = await eve.post("/animals", { name: "Eve cow", species: "Cow", structure: es.structure._id });
  assert.equal((await eve.post("/animals/bulk/move", { ids: [ea.animal._id], structure: sid })).status, 404);
  const bulk = await eve.post("/animals/bulk/status", { ids: [aid], status: "Sick" });
  assert.equal(bulk.body.matched, 0);
  assert.equal((await bob.get(`/animals/${aid}`)).body.animal.status, "Healthy");
});

test("filters, bulk move/status/delete and cascade delete", async () => {
  const c = await signup("carol");
  const { body: s1 } = await c.post("/structures", { name: "Coop", type: "Coop" });
  const { body: s2 } = await c.post("/structures", { name: "Pasture 1", type: "Pasture" });
  const make = async (name, species, structure, extra = {}) =>
    (await c.post("/animals", { name, species, structure, ...extra })).body.animal;

  const hen1 = await make("Henny", "Chicken", s1.structure._id, { birthdate: "2025-03-01", tagId: "C-1" });
  const hen2 = await make("Penny", "Chicken", s1.structure._id, { birthdate: "2025-06-01" });
  const cow = await make("Moo", "Cow", s2.structure._id, { birthdate: "2020-01-01", status: "Sick" });

  assert.equal((await c.post("/animals", { name: "Dup", species: "Cow", tagId: "C-1", structure: s1.structure._id })).status, 409);

  const q = async (qs) => (await c.get(`/animals?${qs}`)).body.animals.map((a) => a.name).sort();
  assert.deepEqual(await q("species=chicken"), ["Henny", "Penny"]);
  assert.deepEqual(await q("status=Sick"), ["Moo"]);
  assert.deepEqual(await q(`structure=${s2.structure._id}`), ["Moo"]);
  assert.deepEqual(await q("from=2025-01-01&to=2025-04-01"), ["Henny"]);
  assert.deepEqual(await q("q=C-1"), ["Henny"]);
  assert.deepEqual(await q("q=.*"), []); // regex input is escaped
  assert.equal((await c.get("/animals?status=Bogus")).status, 400);

  const moved = await c.post("/animals/bulk/move", { ids: [hen1._id, hen2._id], structure: s2.structure._id });
  assert.equal(moved.body.modified, 2);
  assert.deepEqual(await q(`structure=${s2.structure._id}`), ["Henny", "Moo", "Penny"]);

  const status = await c.post("/animals/bulk/status", { ids: [hen1._id, hen2._id], status: "Sick" });
  assert.equal(status.body.modified, 2);
  assert.equal((await c.post("/animals/bulk/status", { ids: [hen1._id], status: "Nope" })).status, 400);
  assert.equal((await c.post("/animals/bulk/status", { ids: [] })).status, 400);

  await c.post(`/animals/${cow._id}/logs`, { date: "2026-02-01", eventType: "Vet Visit" });
  assert.equal((await c.del(`/structures/${s2.structure._id}`)).status, 204);
  assert.deepEqual(await q(""), []);
  assert.deepEqual((await c.get("/logs")).body.logs, []);
});

test("logs: Sold/Died update the animal; analytics and CSV exports", async () => {
  const c = await signup("dave");
  const { body: s } = await c.post("/structures", { name: "Barn", type: "Barn" });
  const { body: a } = await c.post("/animals", { name: "=cmd()", species: "Goat", structure: s.structure._id });
  const aid = a.animal._id;

  await c.post("/animals", { name: "Old Timer", species: "Goat", structure: s.structure._id, birthdate: "2024-01-01" });

  const now = new Date();
  const sold = await c.post(`/animals/${aid}/logs`, { date: now.toISOString(), eventType: "Sold", amount: 250 });
  assert.equal(sold.status, 201);
  assert.equal(sold.body.animal.status, "Sold");
  await c.post(`/animals/${aid}/logs`, { date: now.toISOString(), eventType: "Vet Visit", amount: 40 });
  assert.equal((await c.post(`/animals/${aid}/logs`, { date: "bad", eventType: "Sold" })).status, 400);
  assert.equal((await c.post(`/animals/${aid}/logs`, { date: now, eventType: "Sold", amount: -5 })).status, 400);

  const { body } = await c.get("/analytics/summary");
  assert.equal(body.totals.revenue, 250);
  assert.equal(body.totals.expenses, 40);
  assert.equal(body.totals.net, 210);
  assert.equal(body.totals.animals, 2);
  assert.equal(body.totals.activeAnimals, 1);
  assert.equal(body.populationTrend.length, 12);
  // The sold goat joined and left this month, so it never counts in a month-end snapshot.
  assert.equal(body.populationTrend.at(-1).population, 1);
  assert.equal(body.populationTrend.at(-2).population, 1);

  const csv = await c.get("/export/animals.csv");
  assert.equal(csv.status, 200);
  assert.match(csv.headers.get("content-type"), /text\/csv/);
  assert.match(csv.body, /^Name,Tag ID,Species/);
  assert.ok(csv.body.includes("'=cmd()"), "formula cells are neutralised");
  assert.match((await c.get("/export/logs.csv")).body, /Sold/);
  assert.match((await c.get("/export/health-report.csv")).body, /Last Vet Visit/);
});
