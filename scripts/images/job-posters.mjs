// Builds the web copies of each job poster from its original in assets-src/current-openings/.
// Output: public/images/current-openings/<name>-640.webp, -800.webp and <name>.webp (1200px).
// Usage: node scripts/images/job-posters.mjs
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import { join, parse } from "node:path";

const SOURCE_DIR = "assets-src/current-openings";
const OUTPUT_DIR = "public/images/current-openings";
const VARIANTS = [
  { suffix: "-640", width: 640, quality: 80 },
  { suffix: "-800", width: 800, quality: 80 },
  { suffix: "", width: 1200, quality: 82 },
];

const sources = (await readdir(SOURCE_DIR)).filter((file) => /\.(jpe?g|png|webp)$/i.test(file));
for (const file of sources) {
  const { name } = parse(file);
  for (const { suffix, width, quality } of VARIANTS) {
    await sharp(join(SOURCE_DIR, file))
      .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(join(OUTPUT_DIR, `${name}${suffix}.webp`));
  }
}
console.log(`Job posters built: ${sources.length} source image(s).`);
