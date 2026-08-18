const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  shortCode: {
    length: 6,
    charset:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  },
};

module.exports = config;
