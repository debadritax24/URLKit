const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const rateLimiter = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const urlRoutes = require("./routes/url");
const Url = require("./models/Url");
const logger = require("./utils/logger");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(rateLimiter);

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api", urlRoutes);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/:shortCode", async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    if (shortCode === "health" || shortCode === "api") {
      return next();
    }

    const record = await Url.findOne({ shortCode });
    if (!record) {
      return res.status(404).send("Short URL not found");
    }

    record.clicks += 1;
    await record.save();

    logger.info("Redirect", { shortCode, originalUrl: record.originalUrl });
    res.redirect(302, record.originalUrl);
  } catch (err) {
    next(err);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

module.exports = app;
