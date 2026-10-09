const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { clientOrigin, isProd } = require("./config/env");
const { requireAuth } = require("./middleware/auth");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
if (isProd) app.set("trust proxy", 1);

app.use(helmet());
// The auth cookie is SameSite=Lax and only this origin may make credentialed requests.
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", require("./routes/auth"));

// Everything below requires a valid session cookie.
app.use("/api", requireAuth);
app.use("/api/structures", require("./routes/structures"));
app.use("/api/animals", require("./routes/animals"));
app.use("/api/logs", require("./routes/logs"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/export", require("./routes/exports"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
