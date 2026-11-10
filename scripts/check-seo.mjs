import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const run = promisify(execFile);
const output = "output/seo-release-check";
const astroPackage = JSON.parse(
  await readFile("node_modules/astro/package.json", "utf8"),
);
await run(
  process.execPath,
  [`node_modules/astro/${astroPackage.bin.astro}`, "build", "--outDir", output],
  { env: { ...process.env, PUBLIC_SITE_URL: "https://example.test" } },
);
const home = await readFile(`${output}/index.html`, "utf8");
const robots = await readFile(`${output}/robots.txt`, "utf8");
const sitemap = await readFile(`${output}/sitemap.xml`, "utf8");
const legal = await readFile(`${output}/privacy-policy/index.html`, "utf8");
assert.ok(home.includes('rel="canonical" href="https://example.test/"'));
assert.ok(home.includes('name="robots" content="index, follow"'));
assert.ok(
  home.includes('content="https://example.test/images/social-share.jpg"'),
);
assert.ok(robots.includes("Allow: /"));
assert.ok(robots.includes("https://example.test/sitemap.xml"));
assert.equal((sitemap.match(/<loc>/g) || []).length, 13);
assert.ok(!sitemap.includes("privacy-policy"));
assert.ok(legal.includes('name="robots" content="noindex, follow"'));
const previewHome = await readFile("dist/index.html", "utf8");
const previewRobots = await readFile("dist/robots.txt", "utf8");
assert.ok(previewHome.includes('name="robots" content="noindex, follow"'));
assert.ok(!previewHome.includes('rel="canonical"'));
assert.ok(previewRobots.includes("Disallow: /"));
console.log(
  "PASS: approved-origin configuration generates canonical/OG URLs and 13 sitemap entries; default preview stays crawl-blocked; legal draft stays noindex. Test origin exists only under ignored output/.",
);
