const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    shortCode: {
      type: String,
      required: [true, "Short code is required"],
      unique: true,
      index: true,
      trim: true,
      minlength: [3, "Short code must be at least 3 characters"],
      maxlength: [30, "Short code must be at most 30 characters"],
      match: [
        /^[A-Za-z0-9_-]+$/,
        "Short code can only contain letters, numbers, hyphens and underscores",
      ],
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
