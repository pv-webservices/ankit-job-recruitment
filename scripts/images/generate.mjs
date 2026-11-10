// Server-side image generation. Run from a trusted machine, never in the browser:
//   node --env-file=.env scripts/images/generate.mjs            (all missing images)
//   node --env-file=.env scripts/images/generate.mjs hero-kolkata --force
//   node scripts/images/generate.mjs --optimize-only            (re-encode existing PNGs)
import sharp from "sharp";
import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { imageConfig, requireApiKey } from "./config.mjs";
import { routeImageTask } from "./router.mjs";
import { imageTasks } from "./manifest.mjs";

const args = process.argv.slice(2);
const force = args.includes("--force");
const optimizeOnly = args.includes("--optimize-only");
const onlyIds = args.filter((a) => !a.startsWith("--"));
const tasks = onlyIds.length ? imageTasks.filter((t) => onlyIds.includes(t.id)) : imageTasks;

const exists = (path) => access(path).then(() => true, () => false);

async function requestImage(task, route, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), imageConfig.requestTimeoutMs);
  try {
    const response = await fetch(imageConfig.endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: route.model,
        prompt: task.prompt,
        size: route.size,
        quality: route.quality,
        n: 1,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = body?.error?.message || response.statusText;
      throw new Error(`${response.status} ${message}`);
    }
    const b64 = body?.data?.[0]?.b64_json;
    if (!b64) throw new Error("API response contained no image data");
    return Buffer.from(b64, "base64");
  } finally {
    clearTimeout(timer);
  }
}

async function optimize(task, pngPath) {
  for (const out of task.outputs) {
    const target = join(imageConfig.publicDir, `${task.id}${out.suffix}.webp`);
    const info = await sharp(pngPath)
      .resize({ width: out.width, withoutEnlargement: true })
      .webp({ quality: task.priority === "hero" ? 82 : task.priority === "key" ? 78 : 72, effort: 6 })
      .toFile(target);
    console.log(`  → ${target} ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
  }
}

async function runTask(task, apiKey) {
  const pngPath = join(imageConfig.rawDir, `${task.id}.png`);
  if (!optimizeOnly && (force || !(await exists(pngPath)))) {
    let route = routeImageTask(task);
    console.log(`[${task.id}] ${route.model} · ${route.quality} · ${route.size} — ${route.reasons.join("; ")}`);
    let buffer;
    try {
      buffer = await requestImage(task, route, apiKey);
    } catch (error) {
      if (route.tier !== "flare") throw error;
      // Escalate once to the premium model if the default model fails.
      route = routeImageTask({ ...task, flareFailed: true });
      console.warn(`[${task.id}] flare failed (${error.message}); retrying with ${route.model}`);
      buffer = await requestImage(task, route, apiKey);
    }
    await writeFile(pngPath, buffer);
  } else {
    console.log(`[${task.id}] using existing ${pngPath}`);
  }
  await optimize(task, pngPath);
}

await mkdir(imageConfig.rawDir, { recursive: true });
await mkdir(imageConfig.publicDir, { recursive: true });
const apiKey = optimizeOnly ? "" : requireApiKey();

const queue = [...tasks];
const failures = [];
await Promise.all(
  Array.from({ length: imageConfig.concurrency }, async () => {
    while (queue.length) {
      const task = queue.shift();
      try {
        await runTask(task, apiKey);
      } catch (error) {
        failures.push(task.id);
        console.error(`[${task.id}] FAILED: ${error.message}`);
      }
    }
  }),
);
if (failures.length) {
  console.error(`Failed: ${failures.join(", ")}`);
  process.exitCode = 1;
} else console.log("All images ready.");
