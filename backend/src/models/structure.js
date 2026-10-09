const mongoose = require("mongoose");

const STRUCTURE_TYPES = ["Barn", "Stable", "Coop", "Pen", "Pasture", "Other"];

const structureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: STRUCTURE_TYPES, required: true },
    notes: { type: String, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

const Structure = mongoose.model("Structure", structureSchema);
Structure.TYPES = STRUCTURE_TYPES;

module.exports = Structure;
