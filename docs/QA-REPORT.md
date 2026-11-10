# Local verification — 10 November 2026

## Result and limits

The local static website is implemented and verified. It is **not approved for production launch**: secure registration processing, approved privacy/legal terms, final domain, service/process confirmation and district-data review remain open. No deployment or real contact/submission action was performed. The starting folder contained the original logo and no existing Git repository; no commit or remote push was created.

## Build and correctness

- Astro 7.4.8 static build: 17 HTML pages, plus robots and XML sitemap.
- Astro diagnostics: zero errors, warnings or hints.
- Node tests: four passing tests covering local calendar dates, birthday/leap-day age calculation, invalid/future DOB, formatted Indian mobile numbers, field/enum/consent validation and the complete state/district mapping.
- Static audit: unique titles/descriptions, one H1 per page, no broken internal routes/assets/anchors, Organization schema, no placeholder links, no fabricated vacancy/rating schema and collection-blocking security headers.
- npm dependency audit: zero known vulnerabilities at verification time. Clean `npm ci --ignore-scripts` supported; lifecycle scripts remain disabled.

## Browser checks

Automated Chrome sweep: all 16 ordinary content pages at 360, 390, 430, 768, 1024, 1280, 1440 and 1920px — **128 layout checks with no horizontal overflow**. The branded 404 was separately checked at an unknown URL with HTTP 404.

All 16 content pages were scanned using axe-core WCAG 2 A/AA, 2.1 AA and 2.2 AA tags: **zero automated accessibility violations**. This is not an accessibility certification or a full assistive-technology audit.

On both forms: twelve fields, empty/invalid errors, future DOB rejection, dependent district options and state-change reset, calculated readonly age, unchecked consent, optional alternative mobile, valid-form unavailable status, no outbound submission and no local/session storage. Form interactions were tested with the generated CSP execution and network restrictions. The HTTP-only local test server omits only `upgrade-insecure-requests`, because WebKit otherwise redirects its assets to an unavailable HTTPS port; the deployment headers retain that directive. Navigation opens/closes, Escape returns focus, page links navigate and FAQ summaries open by keyboard. Content and fallback navigation remain visible without JavaScript; the submission button stays disabled. No browser runtime/console errors were found in the completed sweep.

Cross-browser smoke/layout suite: all 16 content routes at 390 and 1440px in each engine, plus form district/DOB/error checks and mobile menu/Escape:

| Browser/engine | Version | Result |
| --- | --- | --- |
| Chrome | 156.0.8078.80 | Passed |
| Edge | 157.0.4341.46 | Passed |
| Firefox | 159.0 | Passed |
| WebKit | 27.2 | Passed |

Actual Safari on macOS/iOS and physical-device/assistive-technology testing remain unperformed. WebKit is a useful engine check, not a Safari-device verification.

## Visual review

Compared the supplied homepage reference with the rendered page, then refined hero text hierarchy, whole-group photo framing, gradient integration and mobile composition. Preserved original artwork and brand colors; retained the hero/form, highlights, service cards, process, navy/gold reasons strip, career banner and footer sequence. Mobile presents an uncropped full group image below the hero copy. Dedicated registration uses three fieldsets with comfortable 16px mobile controls.

Final desktop and mobile screenshots for homepage, services, registration and contact are in `output/playwright/`. `home-desktop.png` and `home-mobile.png` are the main deliverables. Some earlier iteration screenshots are also retained; use the final names.

The final pass also caught and fixed mobile fallback navigation being overridden without JavaScript, and Vite inlining a small font subset that the strict font CSP blocked. The fallback selectors now have sufficient specificity and font assets are emitted as local files. These remain covered by the browser and static audits; the CSP was not loosened.

## Performance

Lighthouse 13.6.0 against the local **production build**, Chrome headless, separate controlled mobile and desktop runs:

| Metric | Mobile | Desktop |
| --- | --- | --- |
| Performance | 95 | 100 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 66 | 66 |
| LCP | 2.1s | 0.6s |
| CLS | 0 | 0 |
| Total blocking time | 230ms | 0ms |

SEO is reduced by the intentional `noindex`/crawl-blocked preview, not a claim of an indexable deployed site. The separate approved-origin configuration test verified canonical/OG URLs, index/follow on normal public pages, a 13-entry sitemap, robots allowing crawling and continued noindex/exclusion for draft legal pages. The example test origin is isolated under ignored `output/seo-release-check/`; the deliverable `dist/` remains the safe preview.

Initial Lighthouse runs overlapped other browser work and scored 85 mobile / 95 desktop. They were unsuitable as controlled baselines; no performance fix was inferred from their variance. An earlier separate controlled run scored 94/100; the final font configuration was rerun sequentially and scored 95/100 as shown above. The one-point variation is not claimed as a measured optimization gain. All main scripts are small; there is no hydrated UI framework or animation library. WebP hero variants are about 34KB/91KB, and other representative photos are roughly 61–127KB. Fonts are hosted locally, with approximately 62KB combined Latin font transfer in the recorded run.

These are local lab measurements, not hosted Core Web Vitals or a real-user INP result. TBT is not INP. Recheck after hosting, compression/cache configuration and any future form integration.

## Reproduce

```powershell
npm ci --ignore-scripts
npm test
npm run check
npm run build
npm run audit:site
npm run test:browser
npm run preview -- --port 4322
# In a second terminal with the preview running:
npm run test:cross-browser
npm run test:seo
```

Raw reports: `output/playwright/qa-report.json`, `cross-browser-report.json`, `output/dependency-audit.json`, `output/lighthouse-mobile-final.json`, `output/lighthouse-desktop-final.json`.
