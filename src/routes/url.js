const express = require("express");
const crypto = require("crypto");
const Url = require("../models/Url");
const validateUrl = require("../middleware/validateUrl");
const config = require("../config");
const logger = require("../utils/logger");

const router = express.Router();

const generateShortCode = (length = config.shortCode.length) => {
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += config.shortCode.charset[bytes[i] % config.shortCode.charset.length];
  }
  return code;
};

router.post("/shorten", validateUrl, async (req, res, next) => {
  try {
    const { url, customCode } = req.body;

    const existing = await Url.findOne({ originalUrl: url }).lean();
    if (existing && !customCode) {
      const base = `${req.protocol}://${req.get("host")}`;
      return res.json({ shortUrl: `${base}/${existing.shortCode}`, shortCode: existing.shortCode });
    }

    let shortCode;
    if (customCode && typeof customCode === "string" && customCode.trim() !== "") {
      shortCode = customCode.trim();

      if (shortCode.length < config.shortCode.minLength || shortCode.length > config.shortCode.maxLength) {
        return res.status(400).json({
          error: `Custom short code must be between ${config.shortCode.minLength} and ${config.shortCode.maxLength} characters`,
        });
      }

      if (!config.shortCode.pattern.test(shortCode)) {
        return res.status(400).json({
          error: "Custom short code can only contain letters, numbers, hyphens and underscores",
        });
      }

      if (await Url.exists({ shortCode })) {
        return res.status(409).json({ error: "That custom short code is already taken" });
      }
    } else {
      shortCode = generateShortCode();
      let attempts = 0;
      while ((await Url.exists({ shortCode })) && attempts < 10) {
        shortCode = generateShortCode();
        attempts++;
      }

      if (attempts >= 10) {
        return res.status(503).json({ error: "Unable to generate unique short code" });
      }
    }

    const record = await Url.create({ shortCode, originalUrl: url });
    const base = `${req.protocol}://${req.get("host")}`;

    logger.info("URL shortened", { shortCode, originalUrl: url });

    res.status(201).json({
      shortUrl: `${base}/${record.shortCode}`,
      shortCode: record.shortCode,
      originalUrl: record.originalUrl,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/stats/:shortCode", async (req, res, next) => {
  try {
    const record = await Url.findOne({ shortCode: req.params.shortCode }).lean();
    if (!record) {
      return res.status(404).json({ error: "Short URL not found" });
    }
    res.json({
      shortCode: record.shortCode,
      originalUrl: record.originalUrl,
      clicks: record.clicks,
      createdAt: record.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
