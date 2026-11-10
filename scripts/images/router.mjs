import { imageConfig } from "./config.mjs";

// Traits that genuinely need the premium model's precision.
const PREMIUM_TRAITS = new Set([
  "architecture",
  "interior",
  "industrial-machinery",
  "complex-lighting",
  "reference-image",
  "person-consistency",
  "product-consistency",
  "brand-placement",
  "detailed-commercial-scene",
]);

/**
 * Pick model, quality and size for one image task.
 * @param {{ priority: 'hero'|'key'|'support', orientation: 'square'|'landscape'|'portrait',
 *           subjects?: number, photoreal?: boolean, traits?: string[], flareFailed?: boolean }} task
 */
export function routeImageTask(task) {
  const traits = task.traits || [];
  const subjects = task.subjects || 0;
  const reasons = [];

  let tier = "flare";
  if (task.priority === "hero") reasons.push("homepage hero / high-priority banner");
  if (traits.some((t) => PREMIUM_TRAITS.has(t)))
    reasons.push(`detail-sensitive: ${traits.filter((t) => PREMIUM_TRAITS.has(t)).join(", ")}`);
  if (task.photoreal && subjects >= 3) reasons.push("photoreal multi-subject composition");
  if (task.flareFailed) reasons.push("flare output was insufficient");
  if (reasons.length) tier = "sunburst";
  else reasons.push("standard website imagery — cost-efficient default");

  const quality =
    task.priority === "hero" || task.priority === "key"
      ? imageConfig.quality.premium
      : imageConfig.quality.default;

  const size = imageConfig.sizes[task.orientation];
  if (!size) throw new Error(`Unknown orientation: ${task.orientation}`);

  return { model: imageConfig.models[tier], tier, quality, size, reasons };
}
