const Animal = require("../models/animal");
const LogEntry = require("../models/logEntry");
const ApiError = require("../utils/ApiError");
const pick = require("../utils/pick");
const { findOwnedStructure, findOwnedAnimal } = require("../utils/ownership");
const { buildAnimalFilter, buildAnimalSort } = require("../utils/animalFilters");

const FIELDS = ["name", "tagId", "species", "breed", "birthdate", "status", "notes"];
const MAX_BULK = 500;

const emptyToUnset = (data) => {
  // Allow the client to clear optional fields by sending "" or null.
  for (const key of ["tagId", "breed", "birthdate", "notes"]) {
    if (key in data && (data[key] === "" || data[key] === null)) data[key] = undefined;
  }
  return data;
};

const list = async (req, res) => {
  const filter = buildAnimalFilter(req.userId, req.query);
  const animals = await Animal.find(filter)
    .sort(buildAnimalSort(req.query))
    .populate("structure", "name type");
  res.json({ animals });
};

const species = async (req, res) => {
  const values = await Animal.distinct("species", { user: req.userId });
  res.json({ species: values.sort((a, b) => a.localeCompare(b)) });
};

const show = async (req, res) => {
  const animal = await findOwnedAnimal(req.userId, req.params.id);
  await animal.populate("structure", "name type");
  res.json({ animal });
};

const create = async (req, res) => {
  const structure = await findOwnedStructure(req.userId, req.body?.structure);
  const animal = await Animal.create({
    ...emptyToUnset(pick(req.body, FIELDS)),
    structure: structure._id,
    user: req.userId,
  });
  res.status(201).json({ animal });
};

const update = async (req, res) => {
  const animal = await findOwnedAnimal(req.userId, req.params.id);
  const data = emptyToUnset(pick(req.body, FIELDS));
  if (req.body?.structure && String(req.body.structure) !== String(animal.structure)) {
    data.structure = (await findOwnedStructure(req.userId, req.body.structure))._id;
  }
  animal.set(data);
  await animal.save();
  res.json({ animal });
};

const remove = async (req, res) => {
  const animal = await findOwnedAnimal(req.userId, req.params.id);
  await LogEntry.deleteMany({ animal: animal._id });
  await animal.deleteOne();
  res.status(204).end();
};

// ---- bulk operations ----

const parseIds = (body) => {
  const ids = body?.ids;
  if (!Array.isArray(ids) || ids.length === 0) throw new ApiError(400, "Select at least one animal.");
  if (ids.length > MAX_BULK) throw new ApiError(400, `You can update at most ${MAX_BULK} animals at once.`);
  return ids;
};

const bulkMove = async (req, res) => {
  const ids = parseIds(req.body);
  const structure = await findOwnedStructure(req.userId, req.body.structure);
  const result = await Animal.updateMany(
    { _id: { $in: ids }, user: req.userId },
    { $set: { structure: structure._id } },
    { runValidators: true },
  );
  res.json({ matched: result.matchedCount, modified: result.modifiedCount });
};

const bulkStatus = async (req, res) => {
  const ids = parseIds(req.body);
  const { status } = req.body;
  if (!Animal.STATUSES.includes(status)) throw new ApiError(400, "Invalid status.");
  const result = await Animal.updateMany(
    { _id: { $in: ids }, user: req.userId },
    { $set: { status } },
    { runValidators: true },
  );
  res.json({ matched: result.matchedCount, modified: result.modifiedCount });
};

const bulkRemove = async (req, res) => {
  const ids = parseIds(req.body);
  const owned = await Animal.find({ _id: { $in: ids }, user: req.userId }).distinct("_id");
  await LogEntry.deleteMany({ animal: { $in: owned } });
  const result = await Animal.deleteMany({ _id: { $in: owned } });
  res.json({ deleted: result.deletedCount });
};

module.exports = { list, species, show, create, update, remove, bulkMove, bulkStatus, bulkRemove };
