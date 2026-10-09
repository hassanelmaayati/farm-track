const Structure = require("../models/structure");
const Animal = require("../models/animal");
const ApiError = require("./ApiError");

// Every lookup is scoped by `user`, so another user's ids behave exactly like missing ids (404).
const findOwnedStructure = async (userId, id) => {
  const structure = await Structure.findOne({ _id: id, user: userId });
  if (!structure) throw new ApiError(404, "Structure not found.");
  return structure;
};

const findOwnedAnimal = async (userId, id) => {
  const animal = await Animal.findOne({ _id: id, user: userId });
  if (!animal) throw new ApiError(404, "Animal not found.");
  return animal;
};

module.exports = { findOwnedStructure, findOwnedAnimal };
