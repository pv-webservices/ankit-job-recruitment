// Non-mutating browser QA for the built site (dist/).
// - Serves dist/ locally with real 404 status (like Vercel).
// - Blocks EVERY non-local request, so no form can reach Google Apps Script,
//   WhatsApp or any third party. Forms are inspected, never submitted.
// Usage: npm run build && node scripts/site-qa.mjs
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";

const DIST = resolve("dist");
const PORT = 4324;
const BASE = `http://127.0.0.1:${PORT}`;
const WIDTHS = [320, 375, 768, 1024, 1440];
const WHATSAPP = "https://wa.me/918348623389";
const TEL = "tel:+918348623389";
const MIN_TARGET = 24; // WCAG 2.2 AA target size (minimum)
const ROUTES = [
  "/", "/about-us/", "/our-services/", "/candidate-zone/", "/recruiter-zone/",
  "/current-openings/", "/industries-we-serve/", "/how-it-works/", "/contact-us/",
  "/faq/", "/privacy-policy/", "/terms-and-conditions/", "/disclaimer/", "/this-page-does-not-exist/",
];
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg",
  ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain",
  ".webmanifest": "application/manifest+json", ".json": "application/json",
};

const server = createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, BASE).pathname);
  const path = resolve(DIST, `.${url.endsWith("/") ? `${url}index.html` : url}`);
  if (!path.startsWith(DIST + sep)) return res.writeHead(403).end();
  const found = (await stat(path).catch(() => null))?.isFile();
  const file = found ? path : join(DIST, "404.html");
  res.writeHead(found ? 200 : 404, { "Content-Type": MIME[extname(file)] ?? "application/octet-stream" });
  res.end(await readFile(file));
});
await new Promise((ok) => server.listen(PORT, "127.0.0.1", ok));

const report = { blockedRequests: [], pages: [], failures: [], notes: [] };
const fail = (msg) => report.failures.push(msg);
const browser = await chromium.launch({ headless: true, channel: "chrome" });
try {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  await context.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith(BASE)) return route.continue();
    report.blockedRequests.push(`${route.request().method()} ${url}`);
    return route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    // The deliberate 404 route logs its own document 404; blocked third parties log ERR_FAILED.
    if (m.type() !== "error" || /net::ERR_FAILED/.test(m.text())) return;
    if (/status of 404/.test(m.text()) && page.url().includes("does-not-exist")) return;
    errors.push(`${page.url()}: ${m.text()}`);
  });
  page.on("request", (r) => r.method() !== "GET" && fail(`Unexpected ${r.method()} request: ${r.url()}`));

  const internalLinks = new Set();
  for (const route of ROUTES) {
    const response = await page.goto(BASE + route);
    const expected = route.includes("does-not-exist") ? 404 : 200;
    if (response.status() !== expected) fail(`${route}: HTTP ${response.status()} (expected ${expected})`);
    const entry = { route, status: response.status(), overflow: [], brokenImages: [], axe: [] };

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (overflow > 0) { entry.overflow.push(`${width}px:+${overflow}`); fail(`${route}: horizontal overflow at ${width}px (${overflow}px)`); }
      if (width === 375) {
        const small = await page.evaluate((min) => [...document.querySelectorAll('a[href^="tel:"], a[href*="wa.me"], .button, .menu-toggle')]
          .filter((el) => el.offsetParent !== null && getComputedStyle(el).display !== "inline") // inline links in a sentence are exempt (WCAG 2.5.8)
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ r }) => r.width > 0 && (r.width < min || r.height < min))
          .map(({ el, r }) => `${el.textContent.trim().slice(0, 30) || el.getAttribute("aria-label")} ${Math.round(r.width)}x${Math.round(r.height)}`), MIN_TARGET);
        for (const s of small) fail(`${route}: touch target below ${MIN_TARGET}px at 375px: ${s}`);
        entry.axe.push(...(await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze())
          .violations.map((v) => `375px ${v.id} (${v.nodes.length})`));
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    // Scroll through so lazy images load, then check every image decoded.
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); });
    await page.waitForLoadState("networkidle");
    entry.brokenImages = await page.evaluate(() => [...document.images].filter((i) => i.getAttribute("src") && i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
    for (const src of entry.brokenImages) fail(`${route}: broken image ${src}`);
    entry.axe.push(...(await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze())
      .violations.map((v) => `1440px ${v.id} (${v.nodes.length})`));
    for (const v of entry.axe) fail(`${route}: axe ${v}`);

    const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")));
    for (const href of links) {
      if (href.startsWith("/")) internalLinks.add(href.split("#")[0]);
      if (/wa\.me|whatsapp/i.test(href) && !href.startsWith(WHATSAPP)) fail(`${route}: unexpected WhatsApp URL ${href}`);
      if (href.startsWith("tel:") && href !== TEL) fail(`${route}: unexpected tel URL ${href}`);
    }
    entry.whatsappLinks = links.filter((h) => h.startsWith(WHATSAPP)).length;
    entry.telLinks = links.filter((h) => h === TEL).length;
    report.pages.push(entry);
  }

  for (const href of internalLinks) {
    const status = (await page.request.get(BASE + href)).status();
    if (status !== 200) fail(`Broken internal link ${href} (HTTP ${status})`);
  }
  report.notes.push(`Internal links checked: ${internalLinks.size}`);

  // Keyboard: first Tab lands on the skip link, which targets #main.
  await page.goto(BASE + "/");
  await page.keyboard.press("Tab");
  const skip = await page.evaluate(() => ({ cls: document.activeElement?.className, href: document.activeElement?.getAttribute("href") }));
  if (!/skip-link/.test(skip.cls) || skip.href !== "#main") fail(`Skip link is not the first focus stop (${JSON.stringify(skip)})`);

  // Forms: inspect only (never filled or submitted).
  for (const [route, selector] of [["/candidate-zone/", "[data-candidate-form]"], ["/recruiter-zone/", "form"]]) {
    await page.goto(BASE + route);
    const info = await page.evaluate((sel) => {
      const f = document.querySelector(sel);
      return f && { fields: f.querySelectorAll("input,select,textarea").length, required: f.querySelectorAll("[required]").length, file: f.querySelectorAll("input[type=file]").length };
    }, selector);
    report.notes.push(`${route} form (inspected, not submitted): ${JSON.stringify(info)}`);
    if (!info) fail(`${route}: form not found`);
  }

  if (errors.length) for (const e of [...new Set(errors)]) fail(`Browser console/page error: ${e}`);
} finally {
  await browser.close();
  server.close();
  await mkdir("output/site-qa", { recursive: true });
  await writeFile("output/site-qa/report.json", JSON.stringify(report, null, 2));
}

const uniqueBlocked = [...new Set(report.blockedRequests.map((r) => r.replace(/\?.*$/, "")))];
console.log(`Pages: ${report.pages.length} × widths ${WIDTHS.join("/")}. Blocked external requests: ${uniqueBlocked.length ? uniqueBlocked.join(", ") : "none"}.`);
for (const n of report.notes) console.log(`NOTE  ${n}`);
for (const p of report.pages) console.log(`${p.route.padEnd(28)} HTTP ${p.status}  wa:${p.whatsappLinks} tel:${p.telLinks}`);
for (const f of report.failures) console.log(`FAIL  ${f}`);
console.log(report.failures.length ? `${report.failures.length} failure(s).` : "PASS");
process.exit(report.failures.length ? 1 : 0);
