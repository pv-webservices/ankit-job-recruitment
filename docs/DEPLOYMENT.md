# Deployment and launch handoff

## Release gates

This is a completed local website implementation with explicit release blockers, **not an approved production launch**. Before publication:

1. Confirm the public domain, canonical apex/www choice and hosting provider.
2. Approve actual service capabilities, locations and the proposed recruitment process. No vacancies, salaries, statistics, testimonials or office addresses have been invented.
3. Approve the privacy notice, terms and disclaimer. Draft pages currently remain noindex and are excluded from the sitemap.
4. Follow `FORM-INTEGRATION.md` to implement the approved secure collection mechanism if registration is to be enabled. An informational site may retain the unavailable state only if the business explicitly approves that launch scope.
5. Review/refresh the bundled 23 September 2026 LGD district snapshot against the current official export.

## Build

Stop this project's dev/preview servers before a clean `npm ci` on Windows so native compiler files are not locked.

```powershell
npm ci --ignore-scripts
npm test
npm run check
$env:PUBLIC_SITE_URL = 'https://your-approved-domain.in'
npm run build
npm run audit:site
```

Use the real approved domain, not the example above. `PUBLIC_SITE_URL` must be an HTTPS origin. Without it the safe preview build is noindex, robots disallows all crawling, canonical URLs are omitted and the sitemap has no entries. Do not publish that build expecting search visibility.

Upload **the contents of `dist/`** to the static document root. The site needs no Node process at runtime. Keep source, credentials, test results and private policies outside the document root. No form credentials are configured.

## Host configuration

- **Netlify / Cloudflare Pages:** build command `npm run build`, output directory `dist`, approved domain in environment. Retain generated `dist/_headers`; configure custom 404 fallback to `404.html`. Confirm that the provider applies the headers to HTML and asset responses.
- **Apache shared hosting:** retain generated `dist/.htaccess`, including hidden files. It configures the custom 404, directory indexes and security headers when the matching Apache modules/AllowOverride are enabled. Verify actual response headers; configuration files alone do not establish live enforcement.
- **Other static hosts:** configure the same headers from `dist/_headers` in the host’s native settings. Add a genuine 404 response using `404.html`; do not rewrite every request to the homepage. No SPA fallback is needed.

Security headers are generated after every build. Script hashes permit only the generated inline scripts. CSS currently permits inline styles for stagger timing. Outbound form requests and native form navigation are blocked while secure collection is unavailable. Do not loosen CSP broadly to integrate a form. HSTS is intended for an HTTPS host; confirm HTTPS works before serving the release.

Set compression (Brotli/gzip) at the host/CDN. Hashed `/_astro/` assets can use one-year immutable caching. Images have stable names and use a one-day cache; purge them if replacing media. Keep HTML short-lived/revalidated. Configure one-hop redirects to the selected HTTPS canonical host and add equivalent www/apex redirects at the edge/server. Do not invent a domain-specific redirect before the actual domain is chosen.

`/404/` is an error destination and should display the branded 404. Astro generates the standard `404.html` artifact. Configure the host to return it for unknown paths with HTTP 404; avoid a soft-404 200 response.

## Post-deployment verification

Verify public HTTPS, redirect behaviour, all routes, expected HTTP 404, real headers/CSP, images/fonts, canonical and Open Graph URLs, robots, sitemap, contact links, keyboard navigation and mobile layouts. Rerun Lighthouse on the actual hosted site under controlled conditions. Local scores do not establish production Core Web Vitals or INP.

After privacy/collection approval, test the chosen endpoint with synthetic data, including receipt, duplicate protection, spam/rate limits, error handling, access permissions and deletion. Do not assume a browser success screen proves secure durable receipt. No real messages, calls, emails or candidate submissions have been sent in this task.

## Search Console

After the domain and content are approved, verify domain ownership through an authorized DNS TXT record or the hosting provider’s supported method. Submit `/sitemap.xml`, inspect representative URLs and check that indexable pages return HTTP 200 without noindex. Submit only genuine vacancy pages if any are later provided. No Search Console verification, DNS change or Google indexing action has been performed.

## Rollback

Before replacing an existing document root, save a dated backup of the current site and its host configuration. Keep the matching release output and domain settings together. If needed, restore that backup, purge cached HTML/assets and recheck key routes/contact links. No existing production site was changed during development.
