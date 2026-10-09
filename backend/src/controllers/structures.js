const mongoose = require("mongoose");
const Structure = require("../models/structure");
const Animal = require("../models/animal");
const LogEntry = require("../models/logEntry");
const pick = require("../utils/pick");
const { findOwnedStructure } = require("../utils/ownership");

const FIELDS = ["name", "type", "notes"];

const list = async (req, res) => {
  const structures = await Structure.find({ user: req.userId }).sort({ name: 1 }).lean();
  const counts = await Animal.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.userId) } },
    { $group: { _id: "$structure", count: { $sum: 1 } } },
  ]);
  const byStructure = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json({
    structures: structures.map((s) => ({ ...s, animalCount: byStructure.get(String(s._id)) ?? 0 })),
  });
};

const show = async (req, res) => {
  const structure = await findOwnedStructure(req.userId, req.params.id);
  const animals = await Animal.find({ structure: structure._id, user: req.userId }).sort({ name: 1 });
  res.json({ structure, animals });
};

const create = async (req, res) => {
  const structure = await Structure.create({ ...pick(req.body, FIELDS), user: req.userId });
  res.status(201).json({ structure });
};

const update = async (req, res) => {
  const structure = await findOwnedStructure(req.userId, req.params.id);
  structure.set(pick(req.body, FIELDS));
  await structure.save();
  res.json({ structure });
};

const remove = async (req, res) => {
  const structure = await findOwnedStructure(req.userId, req.params.id);
  const animalIds = await Animal.find({ structure: structure._id }).distinct("_id");
  await LogEntry.deleteMany({ animal: { $in: animalIds } });
  await Animal.deleteMany({ structure: structure._id });
  await structure.deleteOne();
  res.status(204).end();
};

module.exports = { list, show, create, update, remove };
