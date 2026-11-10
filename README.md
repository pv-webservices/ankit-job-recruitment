# Ankit Jobs & Staffing India

Astro 7 static, multipage recruitment business website based on the supplied homepage design. Original branding, navy/gold styling, local optimized imagery/fonts, shared components and lightweight native interactions.

## Run locally

Requires Node 22.12+ (Node 24 used for verification) and npm 11.17.0.

```powershell
npm ci --ignore-scripts
npm run dev
```

Local preview: http://127.0.0.1:4321/

On Windows, stop this project's dev/preview servers before running `npm ci` again; running servers can lock native compiler files.

```powershell
npm test
npm run check
npm run build
npm run audit:site
node scripts/browser-qa.mjs
npm run preview
```

Browser QA uses installed Chrome/Edge and Playwright Firefox/WebKit, serves the build with the generated security headers, and writes reports/screenshots under `output/playwright/`. If needed, install test engines with `npx playwright install firefox webkit`. WebKit testing is not equivalent to testing Safari on an Apple device.

No public domain has been supplied. By default all pages are noindex, robots blocks crawling and the sitemap is empty. After the domain and content are approved, set `PUBLIC_SITE_URL` to the approved HTTPS origin and rebuild. The build then generates canonical and social URLs and an indexable sitemap for approved public pages. Draft legal pages and the 404 remain noindex.

## Current release status

**Local implementation; not approved for production launch.** Candidate submission is unavailable; no candidate data leaves the browser. Secure processing, approved privacy/legal terms, service/process confirmation and the final domain remain outstanding. No jobs, salaries, reviews, ratings or performance claims have been invented. No deployment, real candidate registration, WhatsApp send, email send or phone call has been performed.

- [Design system](docs/DESIGN-SYSTEM.md)
- [Form integration and remaining decisions](docs/FORM-INTEGRATION.md)
- [Deployment instructions](docs/DEPLOYMENT.md)
- [Asset provenance and dataset sources](docs/ASSETS-AND-SOURCES.md)
- [Verification report](docs/QA-REPORT.md)

All npm package lifecycle scripts are disabled in `.npmrc`. The verified build does not require enabling third-party install scripts. Production output is `dist/`; do not upload source folders or `.env` files.
