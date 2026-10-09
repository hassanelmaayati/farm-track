const Animal = require("../models/animal");
const LogEntry = require("../models/logEntry");
const { toCsv } = require("../utils/csv");
const { buildAnimalFilter, buildAnimalSort } = require("../utils/animalFilters");
const { findOwnedAnimal } = require("../utils/ownership");

const sendCsv = (res, filename, csv) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
};

const stamp = () => new Date().toISOString().slice(0, 10);

const animals = async (req, res) => {
  const rows = await Animal.find(buildAnimalFilter(req.userId, req.query))
    .sort(buildAnimalSort(req.query))
    .populate("structure", "name type")
    .lean();
  const csv = toCsv(
    [
      { header: "Name", value: (a) => a.name },
      { header: "Tag ID", value: (a) => a.tagId },
      { header: "Species", value: (a) => a.species },
      { header: "Breed", value: (a) => a.breed },
      { header: "Structure", value: (a) => a.structure?.name },
      { header: "Status", value: (a) => a.status },
      { header: "Birthdate", value: (a) => a.birthdate },
      { header: "Notes", value: (a) => a.notes },
    ],
    rows,
  );
  sendCsv(res, `farmtrack-animals-${stamp()}.csv`, csv);
};

const logs = async (req, res) => {
  const filter = { user: req.userId };
  if (req.query.animal) filter.animal = (await findOwnedAnimal(req.userId, req.query.animal))._id;
  const rows = await LogEntry.find(filter).sort({ date: -1 }).populate("animal", "name tagId species").lean();
  const csv = toCsv(
    [
      { header: "Date", value: (l) => l.date },
      { header: "Animal", value: (l) => l.animal?.name },
      { header: "Tag ID", value: (l) => l.animal?.tagId },
      { header: "Species", value: (l) => l.animal?.species },
      { header: "Event", value: (l) => l.eventType },
      { header: "Amount", value: (l) => l.amount },
      { header: "Description", value: (l) => l.description },
    ],
    rows,
  );
  sendCsv(res, `farmtrack-logs-${stamp()}.csv`, csv);
};

// One row per animal with its current status and most recent health events.
const healthReport = async (req, res) => {
  const [rows, healthLogs] = await Promise.all([
    Animal.find(buildAnimalFilter(req.userId, req.query))
      .sort(buildAnimalSort(req.query))
      .populate("structure", "name")
      .lean(),
    LogEntry.find({ user: req.userId, eventType: { $in: ["Vet Visit", "Vaccination"] } })
      .select("animal eventType date")
      .lean(),
  ]);

  const stats = new Map();
  for (const log of healthLogs) {
    const key = String(log.animal);
    const s = stats.get(key) ?? { vet: null, vax: null, visits: 0 };
    if (log.eventType === "Vet Visit") {
      s.visits += 1;
      if (!s.vet || log.date > s.vet) s.vet = log.date;
    } else if (!s.vax || log.date > s.vax) {
      s.vax = log.date;
    }
    stats.set(key, s);
  }

  const csv = toCsv(
    [
      { header: "Name", value: (a) => a.name },
      { header: "Tag ID", value: (a) => a.tagId },
      { header: "Species", value: (a) => a.species },
      { header: "Structure", value: (a) => a.structure?.name },
      { header: "Status", value: (a) => a.status },
      { header: "Vet Visits", value: (a) => stats.get(String(a._id))?.visits ?? 0 },
      { header: "Last Vet Visit", value: (a) => stats.get(String(a._id))?.vet },
      { header: "Last Vaccination", value: (a) => stats.get(String(a._id))?.vax },
    ],
    rows,
  );
  sendCsv(res, `farmtrack-health-report-${stamp()}.csv`, csv);
};

module.exports = { animals, logs, healthReport };
