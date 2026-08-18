const logger = require("../utils/logger");
const config = require("../config");

const errorHandler = (err, req, res, _next) => {
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Validation failed", details: err.message });
  }

  if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(409).json({ error: "Duplicate entry" });
  }

  res.status(err.status || 500).json({
    error: config.nodeEnv === "production" ? "Internal server error" : err.message,
  });
};

module.exports = errorHandler;
