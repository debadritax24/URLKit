const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    shortCode: {
      type: String,
      required: [true, "Short code is required"],
      unique: true,
      index: true,
      trim: true,
      length: [6, "Short code must be 6 characters"],
    },
    originalUrl: {
      type: String,
      required: [true, "Original URL is required"],
      trim: true,
    },
    clicks: {
      type: Number,
      default: 0,
      min: [0, "Clicks cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

urlSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model("Url", urlSchema);
