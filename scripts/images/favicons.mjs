// Generates the favicon set from the approved brand logo (assets-src/brand/).
// Usage: node scripts/images/favicons.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const SOURCE = "assets-src/brand/ankit-jobs-logo-source.jpeg";
const BACKGROUND = "#000000"; // the logo artwork sits on solid black
const PNG_TARGETS = [
  ["public/favicon-48x48.png", 48],
  ["public/favicon-96x96.png", 96],
  ["public/favicon.png", 64],
  ["public/apple-touch-icon.png", 180],
  ["public/android-chrome-192x192.png", 192],
  ["public/android-chrome-512x512.png", 512],
];
const ICO_SIZES = [16, 32, 48];

// Trim the black margin around the round badge, then re-square it with a small inset.
const trimmed = await sharp(SOURCE).trim({ background: BACKGROUND, threshold: 24 }).toBuffer();
const { width, height } = await sharp(trimmed).metadata();
const side = Math.round(Math.max(width, height) * 1.04);
const square = await sharp(trimmed)
  .extend({
    top: Math.floor((side - height) / 2), bottom: Math.ceil((side - height) / 2),
    left: Math.floor((side - width) / 2), right: Math.ceil((side - width) / 2),
    background: BACKGROUND,
  })
  .flatten({ background: BACKGROUND })
  .toBuffer();

const render = (size) =>
  sharp(square).resize(size, size, { kernel: "lanczos3" }).sharpen({ sigma: size < 64 ? 0.6 : 0.4 })
    .png({ compressionLevel: 9, palette: true, quality: 92, effort: 10 }).toBuffer();

for (const [file, size] of PNG_TARGETS) await writeFile(file, await render(size));

// favicon.ico with PNG-encoded 16/32/48 entries (supported by all current browsers).
const images = await Promise.all(ICO_SIZES.map(render));
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach((img, i) => {
  const size = ICO_SIZES[i], at = 6 + 16 * i;
  header.writeUInt8(size, at); header.writeUInt8(size, at + 1);
  header.writeUInt16LE(1, at + 4); header.writeUInt16LE(32, at + 6);
  header.writeUInt32LE(img.length, at + 8); header.writeUInt32LE(offset, at + 12);
  offset += img.length;
});
await writeFile("public/favicon.ico", Buffer.concat([header, ...images]));
console.log(`Favicons generated from ${SOURCE} (${width}x${height} trimmed).`);
