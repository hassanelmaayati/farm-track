// Fills a demo account with a year of believable data: npm run seed
const { mongoUri } = require("./config/env");
const connectDB = require("./config/db");
const User = require("./models/user");
const Structure = require("./models/structure");
const Animal = require("./models/animal");
const LogEntry = require("./models/logEntry");

const DEMO = { username: "demo", password: "demo1234" };
const monthsAgo = (n, day = 10) => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - n, day));
};

const run = async () => {
  await connectDB(mongoUri);

  const existing = await User.findOne({ username: DEMO.username });
  if (existing) {
    const animals = await Animal.find({ user: existing._id }).distinct("_id");
    await LogEntry.deleteMany({ animal: { $in: animals } });
    await Animal.deleteMany({ user: existing._id });
    await Structure.deleteMany({ user: existing._id });
    await existing.deleteOne();
  }
  const user = await User.create(DEMO);

  const [barn, coop, pasture] = await Structure.create([
    { name: "Red Barn", type: "Barn", notes: "Main dairy barn", user: user._id },
    { name: "Hen House", type: "Coop", user: user._id },
    { name: "North Pasture", type: "Pasture", notes: "Rotational grazing", user: user._id },
  ]);

  const herd = [
    ["Bessie", "Cow", "Holstein", barn, 36, "Healthy"],
    ["Daisy", "Cow", "Jersey", barn, 30, "Healthy"],
    ["Clover", "Cow", "Jersey", pasture, 20, "Sick"],
    ["Ginger", "Goat", "Nubian", pasture, 14, "Healthy"],
    ["Pepper", "Goat", "Alpine", pasture, 9, "Healthy"],
    ["Henrietta", "Chicken", "Leghorn", coop, 11, "Healthy"],
    ["Penny", "Chicken", "Rhode Island Red", coop, 8, "Healthy"],
    ["Nugget", "Chicken", "Orpington", coop, 5, "Sold"],
    ["Old Tom", "Sheep", "Merino", pasture, 40, "Deceased"],
  ];

  const animals = await Animal.create(
    herd.map(([name, species, breed, structure, age, status], i) => ({
      name,
      species,
      breed,
      status,
      tagId: `FT-${String(i + 1).padStart(3, "0")}`,
      birthdate: monthsAgo(age),
      structure: structure._id,
      user: user._id,
    })),
  );
  const byName = Object.fromEntries(animals.map((a) => [a.name, a]));

  const log = (animal, monthsBack, eventType, amount, description) => ({
    animal: byName[animal]._id,
    user: user._id,
    date: monthsAgo(monthsBack),
    eventType,
    amount,
    description,
  });

  await LogEntry.create([
    log("Bessie", 10, "Vaccination", 35, "Annual booster"),
    log("Bessie", 3, "Vet Visit", 80, "Routine check"),
    log("Daisy", 7, "Vet Visit", 120, "Hoof trimming"),
    log("Clover", 1, "Vet Visit", 150, "Limping, treated for infection"),
    log("Ginger", 12, "Born", undefined, "Born on the farm"),
    log("Pepper", 8, "Vaccination", 20),
    log("Nugget", 4, "Sold", 18, "Sold at the farmers market"),
    log("Penny", 2, "Fed", 25, "Switched to layer pellets"),
    log("Old Tom", 6, "Died", undefined, "Old age"),
  ]);

  console.log(`Seeded. Log in with ${DEMO.username} / ${DEMO.password}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
