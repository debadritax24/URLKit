const validateUrl = (req, res, next) => {
  const { url } = req.body;

  if (!url || typeof url !== "string" || url.trim() === "") {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const parsed = new URL(url.trim());
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ error: "Only HTTP and HTTPS URLs are supported" });
    }
    req.body.url = url.trim();
    next();
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }
};

module.exports = validateUrl;
