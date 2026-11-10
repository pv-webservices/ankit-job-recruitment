import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const generated = process.argv[2];
if (generated) {
  const assets = {
    hero: "exec-85b46c64-c353-4164-a682-50bee4b46e01.png",
    manpower: "exec-591bf20b-5d03-46fd-9d09-5514cf87f2bd.png",
    staffing: "exec-b3c472f5-0146-4572-a4f8-a849225156d4.png",
    placement: "exec-21b2986d-1e8f-4788-8935-9a69cf3f70d9.png",
    "bulk-hiring": "exec-589f8ab9-0ed7-4b32-a72e-1fecf4091dfa.png",
  };
  for (const [name, file] of Object.entries(assets)) {
    await sharp(join(generated, file))
      .resize({ width: name === "hero" ? 1536 : 960 })
      .webp({ quality: 84 })
      .toFile(`public/images/${name}.webp`);
    if (name === "hero")
      await sharp(join(generated, file))
        .resize({ width: 800 })
        .webp({ quality: 82 })
        .toFile("public/images/hero-800.webp");
  }
}
await sharp("website-logo-ankit-recruitment.jpeg")
  .resize({ width: 220 })
  .webp({ quality: 91 })
  .toFile("public/images/logo.webp");
await sharp("website-logo-ankit-recruitment.jpeg")
  .resize({ width: 64 })
  .png()
  .toFile("public/favicon.png");
await sharp("website-logo-ankit-recruitment.jpeg")
  .resize(630, 630, { fit: "contain", background: "#03142e" })
  .extend({ left: 285, right: 285, background: "#03142e" })
  .jpeg({ quality: 88 })
  .toFile("public/images/social-share.jpg");

const states = JSON.parse(await readFile("src/data/lgd-states.json", "utf8"));
const districts = JSON.parse(
  await readFile("src/data/lgd-districts.json", "utf8"),
);
const result = Object.fromEntries(
  states.map((state) => [
    state.name.replace(/^The Dadra/, "Dadra"),
    districts
      .filter((d) => d.stateCode === state.code)
      .map((d) => d.name)
      .sort(),
  ]),
);
if (
  states.length !== 36 ||
  Object.values(result).some((list) => !list.length) ||
  districts.length < 750
)
  throw new Error("Unexpected LGD dataset: review before replacing.");
await writeFile(
  "src/data/india-districts.json",
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  `Prepared optimized assets and ${states.length} states/UTs with ${districts.length} districts.`,
);
