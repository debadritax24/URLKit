const mongoose = require("mongoose");
const logger = require("../utils/logger");
const config = require("./index");

const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(config.mongodbUri, options);
    logger.info("MongoDB Atlas connected successfully");
  } catch (err) {
    logger.error("MongoDB connection error:", err.message);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB runtime error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
};

module.exports = connectDB;
