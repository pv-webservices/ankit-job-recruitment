# Ankit Jobs & Staffing India

Business website for **Ankit Jobs & Staffing India** — https://ankitjobs.in/

A static, multipage Astro site (no server at runtime) with job openings, services, candidate
and recruiter enquiry forms, and standalone call / WhatsApp contact links.

> **Forms are protected.** The Candidate Zone and Recruiter Zone forms send data to a Google
> Apps Script web app that writes to Google Sheets and stores uploads in Google Drive. Do not
> modify the forms, their scripts, the endpoint, or the Apps Script without a planned, tested
> change. See [docs/FORM-INTEGRATION.md](docs/FORM-INTEGRATION.md).

## Stack

| | |
|---|---|
| Framework | Astro 7 (`output: "static"`, `trailingSlash: "always"`) |
| Hosting | Vercel (`server: Vercel`). Live site matches `origin/main`; deploys are presumed to come from the GitHub repo `pv-webservices/ankit-job-recruitment` — confirm in the Vercel dashboard |
| Domain / DNS | `ankitjobs.in`, registered and DNS-hosted at Hostinger (`*.dns-parking.com` nameservers) |
| Canonical host | `https://ankitjobs.in` (apex). `www` redirects to apex via `vercel.json` |
| Forms | Google Apps Script → Google Sheets + Google Drive (unchanged by site maintenance) |

## Run locally

Requires Node 22.12+ (verified with Node 24) and npm 11.17.0.

```powershell
npm ci --ignore-scripts
npm run dev        # http://127.0.0.1:4321/
```

Stop dev/preview servers before running `npm ci` again on Windows (they lock native files).

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build into `dist/` (+ generates `_headers`/`.htaccess` for non-Vercel hosts) |
| `npm run preview` | Serve `dist/` locally |
| `npm test` | Unit tests (upload rules, registration/recruiter validation, district data) |
| `npm run check` | Astro/TypeScript type check |
| `npm run audit` | Build, then structural audit (`audit-build.mjs`) and technical SEO audit (`seo-audit.mjs`). Read-only — it never edits files |
| `npm run audit:seo` | SEO audit of the existing `dist/` only |
| `npm run test:seo` | Builds with a test origin and a `PUBLIC_SITE_URL=none` preview to check indexing rules |
| `npm run test:site` | Browser QA on `dist/`: 5 widths, axe (WCAG 2.1 AA), links, images, CTAs, 404. Blocks all external requests — forms are inspected, never submitted |
| `npm run test:browser` | Older full browser QA (Chrome/Edge/Firefox/WebKit). Its form-flow assertions predate the live Google integration and are out of date; it blocks the Google endpoint so it cannot write to the Sheet |
| `npm run images:posters` | Rebuild job poster WebP copies from `assets-src/current-openings/` |
| `npm run images:favicons` | Rebuild favicons from `assets-src/brand/ankit-jobs-logo-source.jpeg` |

## Folder structure

```
assets-src/            Originals and unused artwork — NOT deployed
  brand/               Approved logo source (favicons/logo/social image derive from it)
  current-openings/    Original job poster JPEGs
  generated/           AI-generated source PNGs for photos
  unused/              Web images no page references (kept for reference)
docs/                  Deployment, forms, design system, assets, Search Console guide
google-apps-script/    Code.gs — Apps Script source for the forms (Sheets + Drive)
public/                Copied as-is to the site root (favicons, manifest, images/)
scripts/               Build/QA scripts and image tools (scripts/images/)
src/
  components/          Header, Footer, PageHero, JobCard, forms (CandidateForm/RecruiterForm/FormField)
  data/                site.ts (business details, nav, form endpoint), jobs.ts, routes.ts, district data
  layouts/Layout.astro Shared <head>: SEO meta, canonical, Open Graph/Twitter, favicons, JSON-LD
  lib/, scripts/       Form validation, upload rules and submit logic (protected)
  pages/               One file per route, plus robots.txt.ts and sitemap.xml.ts
  styles/              CSS (tokens, base, components, pages, form.css)
tests/                 node:test unit tests
vercel.json            Redirects, trailing slash, security and cache headers on Vercel
```

## Deployment (Vercel)

1. Push to `main` on GitHub → Vercel builds (Astro preset, output `dist/`). Confirm the project's Git connection and build settings in the Vercel dashboard.
2. `astro.config.mjs` defaults the site origin to `https://ankitjobs.in`, so production builds get
   canonical URLs, `index, follow`, the real sitemap and an `Allow: /` robots.txt.
   - Override with `PUBLIC_SITE_URL=https://other-origin` if the domain ever changes.
   - `PUBLIC_SITE_URL=none` builds a crawl-blocked preview (noindex, `Disallow: /`, empty sitemap).
   - Vercel preview deployments (`*.vercel.app`) are additionally sent `X-Robots-Tag: noindex` by Vercel.
3. `vercel.json` adds: `www → apex` 308 redirect, `/index.html → /`, trailing-slash redirects,
   legacy URL redirects, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
   `Permissions-Policy`, and cache rules (`/_astro/*` immutable for 1 year, images 1 day).
   Vercel itself handles HTTP→HTTPS and HSTS.
4. The generated `dist/_headers` / `dist/.htaccess` (with a full CSP) are **not used by Vercel**;
   they only matter if the site is moved to Netlify/Cloudflare/Apache.

After each deploy, check the items in [docs/GOOGLE-SEARCH-CONSOLE.md](docs/GOOGLE-SEARCH-CONSOLE.md#1-pre-launch--post-deploy-checklist).

## Environment

Copy `.env.example` to `.env` for local-only values. Never commit `.env`.

- `PUBLIC_SITE_URL` — optional origin override (see above).
- `PUBLIC_FORM_ENDPOINT` — optional override of the Apps Script `/exec` URL. Leave unset; the
  default in `src/data/site.ts` is the live endpoint.
- `OPENAI_API_KEY` etc. — only for `npm run images:generate` (local image generation). Never
  expose to the browser or set it on Vercel.

## Contact links (independent of forms)

Defined once in `src/data/site.ts` → `business`:

- Phone: `+91 8348623389` → `tel:+918348623389`
- WhatsApp: `https://wa.me/918348623389` (plain chat link, no prefilled form data)

Header, footer, floating buttons, the mobile action bar and the 404 page all read these values.
They only open the phone dialler or WhatsApp; they never submit or forward form data.

## Further docs

- [Google Search Console setup & indexing plan](docs/GOOGLE-SEARCH-CONSOLE.md)
- [Forms: Google Sheets + Drive integration](docs/FORM-INTEGRATION.md)
- [Deployment notes](docs/DEPLOYMENT.md)
- [Design system](docs/DESIGN-SYSTEM.md)
- [Asset provenance](docs/ASSETS-AND-SOURCES.md)
