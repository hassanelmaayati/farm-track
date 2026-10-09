const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

const notFound = (req, res) => {
  res.status(404).json({ message: "Route not found." });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    return res.status(400).json({ message: "Validation failed.", details });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Invalid ${err.path}.` });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "That value is already in use.", details: err.keyValue });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON body." });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong." });
};

module.exports = { notFound, errorHandler };
