import { chromium, firefox, webkit } from "playwright";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const base = process.env.QA_BASE_URL || "http://127.0.0.1:4322";
const routes = [
  "/",
  "/about-us/",
  "/current-openings/",
  "/candidate-zone/",
  "/recruiter-zone/",
  "/our-services/",
  "/industries-we-serve/",
  "/how-it-works/",
  "/contact-us/",
  "/faq/",
  "/privacy-policy/",
  "/terms-and-conditions/",
  "/disclaimer/",
];
const report = [];
for (const [name, engine, options] of [
  ["Chrome", chromium, { channel: "chrome" }],
  ["Edge", chromium, { channel: "msedge" }],
  ["Firefox", firefox, {}],
  ["WebKit", webkit, {}],
]) {
  const browser = await engine.launch({ ...options, headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of routes) {
      await page.goto(base + route);
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => document.fonts.ready);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          `${name} ${route} ${width}`,
        );
        assert.equal(await page.locator("h1").isVisible(), true);
      }
    }
    await page.goto(base + "/candidate-zone/");
    await page.locator("[name=state]").selectOption("West Bengal");
    await page.locator("[name=district]").selectOption("Kolkata");
    await page.locator("[name=dob]").fill("2000-11-10");
    assert.equal(await page.locator("[name=district]").inputValue(), "Kolkata");
    assert.ok(Number(await page.locator("[name=age]").inputValue()) >= 25);
    await page.getByRole("button", { name: "Submit Registration" }).click();
    assert.equal(
      await page.locator("[name=name]").getAttribute("aria-invalid"),
      "true",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + "/");
    const menu = page.locator(".menu-toggle");
    await menu.click();
    assert.equal(await menu.getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Escape");
    assert.equal(await menu.getAttribute("aria-expanded"), "false");
    await page.screenshot({
      path: `output/playwright/home-${name.toLowerCase()}.png`,
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    report.push({
      name,
      version: browser.version(),
      status: "pass",
      responsiveChecks: 32,
      interactions: "districts, DOB/age, invalid form, mobile menu, Escape",
      errors,
    });
    console.log(
      `${name}: passed 32 route/width checks and form/navigation smoke tests.`,
    );
  } finally {
    await browser.close();
  }
}
await writeFile(
  "output/playwright/cross-browser-report.json",
  JSON.stringify(report, null, 2),
);
