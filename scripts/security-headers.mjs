import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
const hashes = new Set();
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (entry.name.endsWith(".html")) {
      const html = await readFile(path, "utf8");
      for (const match of html.matchAll(
        /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g,
      ))
        hashes.add(
          `'sha256-${createHash("sha256").update(match[1]).digest("base64")}'`,
        );
    }
  }
}
await scan("dist");
const csp = `default-src 'self'; script-src 'self' ${[...hashes].join(" ")}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src https://script.google.com https://script.googleusercontent.com; form-action 'none'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests`;
const headers = {
  "Content-Security-Policy": csp,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000",
};
await writeFile(
  "dist/_headers",
  `/*\n${Object.entries(headers)
    .map(([name, value]) => `  ${name}: ${value}`)
    .join(
      "\n",
    )}\n\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/images/*\n  Cache-Control: public, max-age=86400\n`,
);
await writeFile(
  "dist/.htaccess",
  `Options -Indexes\nDirectoryIndex index.html\nErrorDocument 404 /404.html\n<IfModule mod_headers.c>\n${Object.entries(
    headers,
  )
    .map(([name, value]) => `  Header always set ${name} "${value}"`)
    .join(
      "\n",
    )}\n</IfModule>\n<IfModule mod_expires.c>\n  ExpiresActive On\n  ExpiresByType image/webp "access plus 1 day"\n  ExpiresByType font/woff2 "access plus 1 year"\n</IfModule>\n`,
);
console.log(
  "Generated CSP and security headers for Netlify/Cloudflare Pages and Apache.",
);
