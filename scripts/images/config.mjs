// Central image-generation configuration.
// Change model names, quality tiers or sizes here — nothing else needs rewriting.
// The API key is read ONLY from the OPENAI_API_KEY environment variable on the
// machine running this Node script. It is never bundled into the website.

export const imageConfig = Object.freeze({
  endpoint: "https://api.openai.com/v1/images/generations",
  models: Object.freeze({
    flare: process.env.OPENAI_IMAGE_MODEL_FLARE || "gpt-image-2.5-flare",
    sunburst: process.env.OPENAI_IMAGE_MODEL_SUNBURST || "gpt-image-2.5-sunburst",
  }),
  quality: Object.freeze({
    default: process.env.OPENAI_IMAGE_QUALITY_DEFAULT || "medium",
    premium: process.env.OPENAI_IMAGE_QUALITY_PREMIUM || "high",
  }),
  sizes: Object.freeze({
    square: "1024x1024",
    landscape: "1536x1024",
    portrait: "1024x1536",
  }),
  // Raw API output (kept out of the deployed site) and optimized web output.
  rawDir: "assets-src/generated",
  publicDir: "public/images",
  concurrency: 3,
  requestTimeoutMs: 240_000,
});

export function requireApiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.length < 20) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env (never commit it) and run: node --env-file=.env scripts/images/generate.mjs",
    );
  }
  return key;
}
