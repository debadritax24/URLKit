require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const config = require("./config");
const logger = require("./utils/logger");

const server = http.createServer(app);

const start = async () => {
  await connectDB();

  const port = config.port;
  server.listen(port, () => {
    logger.info(`Server running on port ${port} [${config.nodeEnv}]`);
  });
};

const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", { reason: reason?.message || reason });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", { message: err.message, stack: err.stack });
  shutdown("uncaughtException");
});

start();
