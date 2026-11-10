import { defineConfig } from "astro/config";

const site = process.env.PUBLIC_SITE_URL;
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
  build: { inlineStylesheets: "never" },
  vite: { build: { assetsInlineLimit: 0 } },
});
