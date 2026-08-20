const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const rateLimiter = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const urlRoutes = require("./routes/url");
const Url = require("./models/Url");
const logger = require("./utils/logger");
const config = require("./config");

const app = express();

let dbConnected = false;

app.use(async (_req, _res, next) => {
  if (dbConnected) {
    return next();
  }
  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    dbConnected = true;
    logger.info("MongoDB Atlas connected successfully");
    next();
  } catch (err) {
    logger.error("MongoDB connection error:", err.message);
    next(err);
  }
});

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
}));
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
