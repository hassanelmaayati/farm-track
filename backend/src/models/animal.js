const mongoose = require("mongoose");

const STATUSES = ["Healthy", "Sick", "Sold", "Deceased", "Other"];

const animalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tagId: { type: String, trim: true },
    species: { type: String, required: true, trim: true },
    breed: { type: String, trim: true },
    birthdate: { type: Date },
    status: { type: String, enum: STATUSES, default: "Healthy" },
    notes: { type: String, trim: true },
    structure: { type: mongoose.Schema.Types.ObjectId, ref: "Structure", required: true, index: true },
    // Denormalised owner so list/filter/analytics queries can span structures in one query.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

// A tag ID is unique per owner (only when one is set).
animalSchema.index(
  { user: 1, tagId: 1 },
  { unique: true, partialFilterExpression: { tagId: { $type: "string" } } },
);

const Animal = mongoose.model("Animal", animalSchema);
Animal.STATUSES = STATUSES;

module.exports = Animal;
