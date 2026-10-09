const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

// router.param handler: rejects malformed ObjectIds before they hit the database.
const validateId = (req, res, next, value, name) => {
  if (!mongoose.isValidObjectId(value)) throw new ApiError(400, `Invalid ${name}.`);
  next();
};

module.exports = validateId;
