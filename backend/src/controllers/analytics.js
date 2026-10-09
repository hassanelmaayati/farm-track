const Animal = require("../models/animal");
const LogEntry = require("../models/logEntry");
const Structure = require("../models/structure");

const MONTHS = 12;
const EXPENSE_EVENTS = ["Vet Visit", "Vaccination", "Fed"];

const monthKey = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

const lastMonths = (count) => {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - 1 - i), 1));
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1) - 1);
    return { key: monthKey(start), start, end };
  });
};

const countBy = (items, pick) => {
  const map = new Map();
  for (const item of items) map.set(pick(item), (map.get(pick(item)) ?? 0) + 1);
  return [...map].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

const summary = async (req, res) => {
  const user = req.userId;
  const [animals, logs, structureCount] = await Promise.all([
    Animal.find({ user }).select("species status birthdate createdAt updatedAt").lean(),
    LogEntry.find({ user }).select("animal eventType date amount").lean(),
    Structure.countDocuments({ user }),
  ]);

  // When did each animal leave the herd? First Sold/Died log, else the last status change.
  const exitDates = new Map();
  for (const log of logs) {
    if (log.eventType !== "Sold" && log.eventType !== "Died") continue;
    const key = String(log.animal);
    const prev = exitDates.get(key);
    if (!prev || log.date < prev) exitDates.set(key, log.date);
  }
  const exitOf = (a) => exitDates.get(String(a._id)) ?? (["Sold", "Deceased"].includes(a.status) ? a.updatedAt : null);

  const months = lastMonths(MONTHS);
  const populationTrend = months.map(({ key, end }) => ({
    month: key,
    population: animals.filter((a) => {
      const joined = a.birthdate ?? a.createdAt;
      const left = exitOf(a);
      return joined <= end && !(left && left <= end);
    }).length,
  }));

  const finance = months.map(({ key }) => ({ month: key, revenue: 0, expenses: 0 }));
  const financeByMonth = new Map(finance.map((f) => [f.month, f]));
  for (const log of logs) {
    const bucket = financeByMonth.get(monthKey(new Date(log.date)));
    if (!bucket || !log.amount) continue;
    if (log.eventType === "Sold") bucket.revenue += log.amount;
    else if (EXPENSE_EVENTS.includes(log.eventType)) bucket.expenses += log.amount;
  }

  const sum = (key) => finance.reduce((total, f) => total + f[key], 0);
  const active = animals.filter((a) => !["Sold", "Deceased"].includes(a.status));

  res.json({
    totals: {
      structures: structureCount,
      animals: animals.length,
      activeAnimals: active.length,
      sick: animals.filter((a) => a.status === "Sick").length,
      revenue: sum("revenue"),
      expenses: sum("expenses"),
      net: sum("revenue") - sum("expenses"),
    },
    statusDistribution: countBy(animals, (a) => a.status),
    speciesDistribution: countBy(active, (a) => a.species),
    populationTrend,
    finance,
  });
};

module.exports = { summary };
