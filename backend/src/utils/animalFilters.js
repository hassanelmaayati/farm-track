const mongoose = require("mongoose");
const Animal = require("../models/animal");
const escapeRegex = require("./escapeRegex");
const ApiError = require("./ApiError");

const SORTS = ["name", "species", "status", "birthdate", "createdAt"];
const DATE_FIELDS = ["birthdate", "createdAt"];

const asString = (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

const parseDate = (v, label) => {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new ApiError(400, `Invalid ${label} date.`);
  return d;
};

// Builds a user-scoped Mongo filter from query-string params: q, status, species, structure, from, to, dateField.
const buildAnimalFilter = (userId, query) => {
  const filter = { user: new mongoose.Types.ObjectId(userId) };

  const q = asString(query.q);
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { tagId: rx }, { species: rx }, { breed: rx }];
  }

  const status = asString(query.status);
  if (status) {
    if (!Animal.STATUSES.includes(status)) throw new ApiError(400, "Invalid status.");
    filter.status = status;
  }

  const species = asString(query.species);
  if (species) filter.species = new RegExp(`^${escapeRegex(species)}$`, "i");

  const structure = asString(query.structure);
  if (structure) {
    if (!mongoose.isValidObjectId(structure)) throw new ApiError(400, "Invalid structure.");
    filter.structure = structure;
  }

  const from = asString(query.from);
  const to = asString(query.to);
  if (from || to) {
    const field = DATE_FIELDS.includes(query.dateField) ? query.dateField : "birthdate";
    filter[field] = {};
    if (from) filter[field].$gte = parseDate(from, "from");
    if (to) {
      const end = parseDate(to, "to");
      end.setUTCHours(23, 59, 59, 999);
      filter[field].$lte = end;
    }
  }

  return filter;
};

const buildAnimalSort = (query) => {
  const field = SORTS.includes(query.sort) ? query.sort : "name";
  return { [field]: query.order === "desc" ? -1 : 1, _id: 1 };
};

module.exports = { buildAnimalFilter, buildAnimalSort };
