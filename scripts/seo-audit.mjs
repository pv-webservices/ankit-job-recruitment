// Read-only technical SEO audit of the built site (dist/ by default).
// Usage: node scripts/seo-audit.mjs [distDir]
// Reports problems and exits 1 on failures. It never edits files, so it cannot
// touch forms, form scripts or their Google Sheets / Drive integration.
import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve, sep } from "node:path";

const PRODUCTION_ORIGIN = "https://ankitjobs.in";
const TITLE_MAX = 70; // brand suffix included; ~65 is the soft target
const DESCRIPTION_RANGE = [70, 170];
const FAVICONS = [
  "favicon.ico", "favicon-48x48.png", "favicon-96x96.png", "apple-touch-icon.png",
  "android-chrome-192x192.png", "android-chrome-512x512.png", "site.webmanifest",
];
const FORBIDDEN_ORIGINS = /https?:\/\/(?:localhost|127\.0\.0\.1|example\.(?:test|com)|[a-z0-9-]+\.vercel\.app|www\.ankitjobs\.in)/i;

const root = resolve(process.argv[2] || "dist");
const failures = [];
const warnings = [];
const fail = (msg) => failures.push(msg);
const warn = (msg) => warnings.push(msg);
const decode = (s = "") =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const exists = async (path) => (await stat(path).catch(() => null))?.isFile() ?? false;

async function listHtml(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await listHtml(path, out);
    else if (entry.name.endsWith(".html")) out.push(path);
  }
  return out;
}

const routeOf = (file) => {
  const rel = file.slice(root.length).split(sep).join("/");
  if (rel === "/404.html") return "/404.html";
  return rel.replace(/index\.html$/, "");
};

function headingIssues(html) {
  const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
  const issues = [];
  for (let i = 1; i < levels.length; i++)
    if (levels[i] > levels[i - 1] + 1) issues.push(`h${levels[i - 1]}→h${levels[i]}`);
  return issues;
}

const pages = [];
for (const file of await listHtml(root)) {
  const html = await readFile(file, "utf8");
  const route = routeOf(file);
  if (/<meta http-equiv="refresh"/.test(html)) continue; // redirect stubs (also 308 in vercel.json)
  const meta = (name) => decode(html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`))?.[1]);
  const page = {
    route,
    title: decode(html.match(/<title>(.*?)<\/title>/s)?.[1]),
    description: meta("description"),
    robots: meta("robots"),
    canonical: html.match(/<link rel="canonical" href="([^"]+)"/)?.[1],
    html,
  };
  page.indexable = /(^|,\s*)index\b/.test(page.robots ?? "") && !/noindex/.test(page.robots ?? "");
  pages.push(page);

  if (!page.title) fail(`${route}: missing <title>`);
  else if (page.title.length > TITLE_MAX) warn(`${route}: title ${page.title.length} chars`);
  if (!page.description) fail(`${route}: missing meta description`);
  else if (page.description.length < DESCRIPTION_RANGE[0] || page.description.length > DESCRIPTION_RANGE[1])
    warn(`${route}: description ${page.description.length} chars`);
  if (!page.robots) fail(`${route}: missing meta robots`);

  const h1 = (html.match(/<h1\b/g) || []).length;
  if (h1 !== 1) fail(`${route}: ${h1} H1 elements (expected 1)`);
  for (const issue of headingIssues(html)) warn(`${route}: heading level skipped (${issue})`);

  for (const [img] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="/.test(img)) fail(`${route}: <img> without alt: ${img.slice(0, 90)}`);
    if (!/\bwidth="\d+"/.test(img) || !/\bheight="\d+"/.test(img)) warn(`${route}: <img> without width/height: ${img.slice(0, 90)}`);
  }

  if (page.indexable) {
    const expected = new URL(route, PRODUCTION_ORIGIN).href;
    if (page.canonical !== expected) fail(`${route}: canonical ${page.canonical ?? "missing"} (expected ${expected})`);
    for (const og of ["og:title", "og:description", "og:url", "og:type", "og:image", "twitter:card"])
      if (!meta(og)) fail(`${route}: missing ${og}`);
    if (meta("og:url") !== expected) fail(`${route}: og:url does not match canonical`);
  } else if (page.canonical) {
    fail(`${route}: noindex page must not declare a canonical`);
  }

  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json); } catch { fail(`${route}: invalid JSON-LD`); }
  }
  if (!/application\/ld\+json/.test(html)) fail(`${route}: no structured data`);

  for (const [, link] of html.matchAll(/<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*href="([^"]+)"/g))
    if (!(await exists(join(root, link)))) fail(`${route}: head icon/manifest missing: ${link}`);

  for (const [, value] of html.matchAll(/\b(?:href|src)="(\/[^"#?]*)/g)) {
    const target = join(root, value.endsWith("/") ? `${value}index.html` : value);
    if (!(await exists(target))) fail(`${route}: broken internal link/asset ${value}`);
  }
  const bad = html.match(FORBIDDEN_ORIGINS);
  if (bad) fail(`${route}: non-production origin reference ${bad[0]}`);
}

for (const key of ["title", "description"]) {
  const seen = new Map();
  for (const page of pages) {
    if (!page[key]) continue;
    if (seen.has(page[key])) fail(`Duplicate ${key}: ${page.route} and ${seen.get(page[key])}`);
    seen.set(page[key], page.route);
  }
}

// robots.txt + sitemap consistency
const robots = await readFile(join(root, "robots.txt"), "utf8").catch(() => "");
if (!robots) fail("robots.txt missing");
if (/^Disallow:\s*\/\s*$/m.test(robots)) fail("robots.txt blocks the whole site");
if (!robots.includes(`Sitemap: ${PRODUCTION_ORIGIN}/sitemap.xml`)) fail("robots.txt does not reference the production sitemap");

const sitemap = await readFile(join(root, "sitemap.xml"), "utf8").catch(() => "");
if (!/^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(sitemap))
  fail("sitemap.xml missing or invalid root element");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (new Set(locs).size !== locs.length) fail("sitemap.xml has duplicate URLs");
const indexable = pages.filter((p) => p.indexable).map((p) => new URL(p.route, PRODUCTION_ORIGIN).href);
for (const loc of locs) {
  if (!loc.startsWith(`${PRODUCTION_ORIGIN}/`)) fail(`sitemap URL not on production origin: ${loc}`);
  if (!indexable.includes(loc)) fail(`sitemap lists a non-indexable or missing page: ${loc}`);
}
if (!indexable.length) fail("no indexable pages (was the build made with PUBLIC_SITE_URL=none?)");
for (const url of indexable) if (!locs.includes(url)) fail(`indexable page missing from sitemap: ${url}`);

// Favicons + manifest
for (const file of FAVICONS) if (!(await exists(join(root, file)))) fail(`missing ${file}`);
try {
  const manifest = JSON.parse(await readFile(join(root, "site.webmanifest"), "utf8"));
  for (const key of ["name", "short_name", "icons", "theme_color", "background_color"])
    if (!manifest[key]) fail(`site.webmanifest missing ${key}`);
  for (const icon of manifest.icons ?? [])
    if (!(await exists(join(root, icon.src)))) fail(`manifest icon missing: ${icon.src}`);
} catch { fail("site.webmanifest is not valid JSON"); }

// Host config (Vercel)
try {
  const vercel = JSON.parse(await readFile("vercel.json", "utf8"));
  const headerKeys = (vercel.headers ?? []).flatMap((h) => h.headers.map((x) => x.key));
  for (const key of ["X-Content-Type-Options", "Referrer-Policy", "X-Frame-Options"])
    if (!headerKeys.includes(key)) fail(`vercel.json missing ${key}`);
  if (vercel.trailingSlash !== true) fail("vercel.json trailingSlash should be true (matches astro.config)");
} catch { fail("vercel.json missing or invalid"); }

console.log(`SEO audit: ${pages.length} pages, ${indexable.length} indexable, ${locs.length} sitemap URLs.`);
for (const w of warnings) console.log(`WARN  ${w}`);
for (const f of failures) console.log(`FAIL  ${f}`);
if (failures.length) {
  console.log(`${failures.length} failure(s).`);
  process.exit(1);
}
console.log(`PASS (${warnings.length} warning(s)).`);
