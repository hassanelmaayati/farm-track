const { mongoUri, port } = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");

connectDB(mongoUri)
  .then(() => app.listen(port, () => console.log(`API listening on port ${port}`)))
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  });
