const mongoose = require("mongoose");

const EVENT_TYPES = ["Fed", "Vet Visit", "Vaccination", "Born", "Sold", "Died", "Other"];

const logEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    eventType: { type: String, enum: EVENT_TYPES, required: true },
    description: { type: String, trim: true },
    // Money in or out: sale price for "Sold", cost for "Vet Visit"/"Vaccination"/"Fed".
    amount: { type: Number, min: 0 },
    animal: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

const LogEntry = mongoose.model("LogEntry", logEntrySchema);
LogEntry.EVENT_TYPES = EVENT_TYPES;

module.exports = LogEntry;
