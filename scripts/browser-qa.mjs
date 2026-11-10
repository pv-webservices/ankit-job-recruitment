import { chromium, firefox, webkit } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createServer } from "node:http";
import { readFile, stat, writeFile, mkdir } from "node:fs/promises";
import { resolve, join, extname, sep } from "node:path";
import assert from "node:assert/strict";

const dist = resolve("dist");
const headerText = await readFile(join(dist, "_headers"), "utf8");
const headers = Object.fromEntries(
  headerText
    .split("\n\n")[0]
    .split("\n")
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(":");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);
// This test server is HTTP-only; production keeps HTTPS upgrade enforcement.
headers['Content-Security-Policy'] = headers['Content-Security-Policy'].replace('; upgrade-insecure-requests', '');
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
const server = createServer(async (req, res) => {
  try {
    let url = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (url === "/404/") url = "/404.html";
    const path = resolve(
      dist,
      `.${url.endsWith("/") ? `${url}index.html` : url}`,
    );
    if (!path.startsWith(dist + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    const exists = (await stat(path).catch(() => null))?.isFile();
    res.writeHead(exists ? 200 : 404, {
      ...headers,
      "Content-Type":
        mime[extname(exists ? path : "404.html")] || "application/octet-stream",
    });
    res.end(await readFile(exists ? path : join(dist, "404.html")));
  } catch {
    res.writeHead(500);
    res.end();
  }
});
await new Promise((resolve) => server.listen(4323, "127.0.0.1", resolve));
const base = "http://127.0.0.1:4323";
const routes = [
  "/",
  "/about-us/",
  "/services/",
  "/services/manpower-recruitment/",
  "/services/staffing-solutions/",
  "/services/career-placement/",
  "/services/bulk-hiring/",
  "/job-openings/",
  "/candidate-registration/",
  "/for-employers/",
  "/how-it-works/",
  "/contact-us/",
  "/faq/",
  "/privacy-policy/",
  "/terms-and-conditions/",
  "/disclaimer/",
];
const widths = [360, 390, 430, 768, 1024, 1280, 1440, 1920];
const report = {
  responsive: [],
  accessibility: [],
  functionality: [],
  browserErrors: [],
  crossBrowser: [],
};
await mkdir("output/playwright", { recursive: true });
let browser;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (error) => report.browserErrors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error" && !message.text().includes("404 (Not Found)")) report.browserErrors.push(message.text());
  });
  for (const route of routes) {
    await page.goto(base + route);
    await page.evaluate(() => document.fonts.ready);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      report.responsive.push({ route, width, overflow });
      assert.equal(
        overflow,
        false,
        `Horizontal overflow at ${route} / ${width}`,
      );
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    report.accessibility.push({
      route,
      violations: axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
    await page.evaluate(async () => {
      for (const img of document.querySelectorAll("img")) {
        img.loading = "eager";
      }
      await Promise.all(
        [...document.images].map((img) => img.decode().catch(() => {})),
      );
    });
    const broken = await page
      .locator("img")
      .evaluateAll((images) =>
        images
          .filter((img) => !img.complete || !img.naturalWidth)
          .map((img) => img.src),
      );
    assert.deepEqual(broken, [], `Broken images on ${route}`);
  }
  console.log(
    `Responsive checks passed: ${report.responsive.length}. Running form and navigation checks.`,
  );
  for (const route of ["/", "/candidate-registration/"]) {
    await page.goto(base + route);
    const form = page.locator("[data-candidate-form]");
    assert.equal(
      await form.locator("input:not([type=checkbox]),select").count(),
      12,
    );
    const requests = [];
    const onRequest = (req) => {
      if (req.method() !== "GET") requests.push(req.url());
    };
    page.on("request", onRequest);
    await form.getByRole("button", { name: "Submit Registration" }).click();
    assert.equal(
      await form.locator("[name=name]").getAttribute("aria-invalid"),
      "true",
    );
    for (const [name, value] of Object.entries({
      name: "QA Sample Candidate",
      fatherName: "QA Sample Father",
      motherName: "QA Sample Mother",
      mobile: "+91 83486 23389",
      email: "qa@example.test",
      dob: "2000-11-10",
    }))
      await form.locator(`[name=${name}]`).fill(value);
    await form.locator("[name=qualification]").selectOption("Graduate");
    await form.locator("[name=gender]").selectOption("Prefer not to say");
    await form.locator("[name=state]").selectOption("West Bengal");
    await form.locator("[name=district]").selectOption("Kolkata");
    await form.locator("[name=state]").selectOption("Odisha");
    assert.equal(await form.locator("[name=district]").inputValue(), "");
    assert.equal(
      await form
        .locator("[name=district] option")
        .filter({ hasText: /^Kolkata$/ })
        .count(),
      0,
    );
    await form.locator("[name=district]").selectOption("Khordha");
    await form.locator("[name=consent]").check();
    await form.getByRole("button", { name: "Submit Registration" }).click();
    assert.match(
      await form.getByRole("status").innerText(),
      /not been submitted or saved/,
    );
    assert.equal(await form.locator("[aria-invalid=true]").count(), 0);
    assert.equal(await form.locator("[name=age]").getAttribute("readonly"), "");
    await form.locator("[name=dob]").fill("2099-01-01");
    await form.getByRole("button", { name: "Submit Registration" }).click();
    assert.equal(
      await form.locator("[name=dob]").getAttribute("aria-invalid"),
      "true",
    );
    assert.deepEqual(
      requests,
      [],
      "Candidate data must never leave the browser.",
    );
    assert.deepEqual(
      await page.evaluate(() => ({
        local: localStorage.length,
        session: sessionStorage.length,
      })),
      { local: 0, session: 0 },
    );
    page.off("request", onRequest);
    report.functionality.push(
      `${route}: 12 fields, errors, district reset, valid preview, future DOB, readonly age, no network submission or browser storage`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/");
  const menu = page.locator(".menu-toggle");
  await menu.click();
  assert.equal(await menu.getAttribute("aria-expanded"), "true");
  await page.keyboard.press("Escape");
  assert.equal(await menu.getAttribute("aria-expanded"), "false");
  assert.equal(
    await menu.evaluate((el) => el === document.activeElement),
    true,
  );
  await menu.click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "About Us" })
    .click();
  assert.ok(page.url().endsWith("/about-us/"));
  report.functionality.push(
    "Mobile navigation opens, Escape closes with focus return, links navigate.",
  );
  await page.goto(base + "/faq/");
  const summary = page.locator("summary").nth(1);
  await summary.focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("details").nth(1).getAttribute("open"), "");
  report.functionality.push("FAQ opens using keyboard.");
  assert.equal((await page.goto(base + "/not-a-real-page/")).status(), 404);
  report.functionality.push(
    "Missing URL returns a real 404 with branded content.",
  );
  for (const [route, filename] of [
    ["/", "home"],
    ["/candidate-registration/", "registration"],
    ["/services/", "services"],
    ["/contact-us/", "contact"],
  ]) {
    for (const [width, label] of [
      [1440, "desktop"],
      [390, "mobile"],
    ]) {
      await page.setViewportSize({
        width,
        height: label === "desktop" ? 1000 : 844,
      });
      await page.goto(base + route);
      await page.evaluate(async () => {
        for (const img of document.images) img.loading = "eager";
        await Promise.all(
          [...document.images].map((img) => img.decode().catch(() => {})),
        );
      });
      await page.screenshot({
        path: `output/playwright/${filename}-${label}.png`,
        fullPage: true,
      });
    }
  }
  const noJS = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const noJSPage = await noJS.newPage();
  await noJSPage.goto(base + "/");
  assert.equal(await noJSPage.locator("h1").isVisible(), true);
  assert.equal(await noJSPage.getByRole('navigation', { name: 'Main navigation' }).isVisible(), true);
  assert.equal(
    await noJSPage
      .getByRole("button", { name: "Submit Registration" })
      .isDisabled(),
    true,
  );
  report.functionality.push(
    "Content remains visible without JavaScript; submission stays disabled.",
  );
  await noJS.close();
  await context.close();
  await browser.close();
  browser = undefined;
  for (const [name, engine, options] of [
    ["Edge", chromium, { channel: "msedge" }],
    ["Firefox", firefox, {}],
    ["WebKit", webkit, {}],
  ]) {
    let instance;
    try {
      instance = await engine.launch({ ...options, headless: true });
      const p = await instance.newPage({
        viewport: { width: 390, height: 844 },
      });
      await p.goto(base + "/candidate-registration/");
      await p.locator("[name=state]").selectOption("West Bengal");
      await p.locator("[name=district]").selectOption("Kolkata");
      assert.equal(await p.locator("[name=district]").inputValue(), "Kolkata");
      report.crossBrowser.push({
        name,
        status: "pass",
        version: instance.version(),
      });
    } catch (error) {
      report.crossBrowser.push({
        name,
        status: "unavailable or failed",
        error: error.message.slice(0, 300),
      });
    } finally {
      await instance?.close();
    }
  }
  const violations = report.accessibility.flatMap((entry) => entry.violations);
  console.log(
    `Accessibility violations: ${violations.length}. Browser errors: ${report.browserErrors.length}.`,
  );
  console.log(JSON.stringify(report.crossBrowser));
  assert.equal(
    violations.length,
    0,
    "Review output/playwright/qa-report.json for accessibility findings.",
  );
  assert.deepEqual(report.browserErrors, []);
  assert.ok(report.crossBrowser.every(result => result.status === 'pass'), 'Every installed browser must pass its smoke checks.');
} finally {
  await writeFile(
    "output/playwright/qa-report.json",
    JSON.stringify(report, null, 2),
  );
  await browser?.close();
  server.closeAllConnections();
  server.close();
}
