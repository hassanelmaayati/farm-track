const mongoose = require("mongoose");
const LogEntry = require("../models/logEntry");
const ApiError = require("../utils/ApiError");
const pick = require("../utils/pick");
const { findOwnedAnimal } = require("../utils/ownership");

const FIELDS = ["date", "eventType", "description", "amount"];

// Recording a sale or death also updates the animal so the herd stays consistent.
const STATUS_FOR_EVENT = { Sold: "Sold", Died: "Deceased" };

const clean = (data) => {
  if ("amount" in data && (data.amount === "" || data.amount === null)) data.amount = undefined;
  return data;
};

const listForAnimal = async (req, res) => {
  const animal = await findOwnedAnimal(req.userId, req.params.animalId);
  const logs = await LogEntry.find({ animal: animal._id }).sort({ date: -1 });
  res.json({ logs });
};

// Cross-animal feed with optional eventType / date range filters.
const listAll = async (req, res) => {
  const filter = { user: new mongoose.Types.ObjectId(req.userId) };
  if (typeof req.query.eventType === "string" && req.query.eventType) {
    if (!LogEntry.EVENT_TYPES.includes(req.query.eventType)) throw new ApiError(400, "Invalid event type.");
    filter.eventType = req.query.eventType;
  }
  const { from, to } = req.query;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setUTCHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const logs = await LogEntry.find(filter).sort({ date: -1 }).limit(limit).populate("animal", "name tagId species");
  res.json({ logs });
};

const create = async (req, res) => {
  const animal = await findOwnedAnimal(req.userId, req.params.animalId);
  const log = await LogEntry.create({ ...clean(pick(req.body, FIELDS)), animal: animal._id, user: req.userId });

  const nextStatus = STATUS_FOR_EVENT[log.eventType];
  if (nextStatus && animal.status !== nextStatus) {
    animal.status = nextStatus;
    await animal.save();
  }
  res.status(201).json({ log, animal });
};

const findOwnedLog = async (userId, id) => {
  const log = await LogEntry.findOne({ _id: id, user: userId });
  if (!log) throw new ApiError(404, "Log entry not found.");
  return log;
};

const update = async (req, res) => {
  const log = await findOwnedLog(req.userId, req.params.id);
  log.set(clean(pick(req.body, FIELDS)));
  await log.save();
  res.json({ log });
};

const remove = async (req, res) => {
  const log = await findOwnedLog(req.userId, req.params.id);
  await log.deleteOne();
  res.status(204).end();
};

module.exports = { listForAnimal, listAll, create, update, remove };
