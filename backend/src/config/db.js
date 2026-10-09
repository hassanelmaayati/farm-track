const mongoose = require("mongoose");

const connectDB = async (uri) => {
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err.message);
  });
  mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
  });
  await mongoose.connect(uri);
};

module.exports = connectDB;
