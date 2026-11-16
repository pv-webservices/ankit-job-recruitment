import { defineConfig } from "astro/config";

// Production origin. Vercel builds use this unless PUBLIC_SITE_URL overrides it.
// Set PUBLIC_SITE_URL=none to build a crawl-blocked preview (noindex, empty sitemap).
const PRODUCTION_ORIGIN = "https://ankitjobs.in";
const envSite = process.env.PUBLIC_SITE_URL?.trim();
const site = envSite === "none" ? undefined : envSite || PRODUCTION_ORIGIN;
if (site && (!/^https:\/\//.test(site) || new URL(site).pathname !== "/")) {
  throw new Error(
    "PUBLIC_SITE_URL must be an HTTPS origin, for example https://your-domain.in",
  );
}

export default defineConfig({
  site,
  output: "static",
  devToolbar: { enabled: false },
  trailingSlash: "always",
  redirects: {
    "/candidate-registration/": "/candidate-zone/",
    "/career/": "/current-openings/",
  },
  build: { inlineStylesheets: "never" },
  vite: { build: { assetsInlineLimit: 0 } },
});
