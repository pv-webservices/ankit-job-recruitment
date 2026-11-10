import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
const root = resolve(process.argv[2] || "dist");
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else files.push(path);
  }
}
await walk(root);
const titles = new Set();
const descriptions = new Set();
let pages = 0;
for (const path of files.filter((path) => path.endsWith(".html"))) {
  const html = await readFile(path, "utf8");
  assert.equal(
    (html.match(/<h1\b/g) || []).length,
    1,
    `${path}: exactly one H1`,
  );
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  const description = html.match(
    /<meta name="description" content="([^"]+)"/s,
  )?.[1];
  assert.ok(title && !titles.has(title), `Missing/duplicate title: ${path}`);
  assert.ok(
    description && !descriptions.has(description),
    `Missing/duplicate description: ${path}`,
  );
  titles.add(title);
  descriptions.add(description);
  assert.ok(
    html.includes("application/ld+json"),
    `Organization schema: ${path}`,
  );
  assert.ok(!/href="#"/.test(html), `Placeholder link: ${path}`);
  assert.ok(
    !/JobPosting|AggregateRating|formsubmit|smtp/i.test(html),
    `Unsupported integration/claim: ${path}`,
  );
  for (const [, attr, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (value.startsWith("#")) {
      assert.ok(
        html.includes(`id="${value.slice(1)}"`),
        `Missing anchor ${value}: ${path}`,
      );
      continue;
    }
    if (!value.startsWith("/")) continue;
    const target = value.split(/[?#]/)[0];
    const file = join(
      root,
      target.endsWith("/") ? `${target}index.html` : target,
    );
    assert.ok(
      (await stat(file).catch(() => null))?.isFile(),
      `${attr} broken: ${value} in ${path}`,
    );
  }
  pages++;
}
const css = (
  await Promise.all(
    files
      .filter((file) => file.endsWith(".css"))
      .map((file) => readFile(file, "utf8")),
  )
).join("\n");
assert.ok(!css.includes('data:font'), 'Keep fonts as local files so the strict font CSP can load them.');
for (const [, url] of css.matchAll(
  /url\((?:"|')?(\/_astro\/[^)'"\s]+)(?:"|')?\)/g,
))
  assert.ok(files.includes(join(root, url)), `Missing CSS asset: ${url}`);
assert.ok(files.some((path) => path.endsWith("sitemap.xml")));
assert.ok(files.some((path) => path.endsWith("robots.txt")));
const headers = await readFile(join(root, "_headers"), "utf8");
assert.ok(headers.includes("form-action 'none'"));
assert.ok(headers.includes("connect-src 'none'"));
assert.ok(headers.includes("Content-Security-Policy"));
console.log(
  `PASS: ${pages} HTML pages; unique metadata, headings, internal links, assets, schema and collection-blocking security headers.`,
);
