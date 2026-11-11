# Candidate & recruiter forms — Google Sheets + Drive

Both forms (Candidate Zone, Recruiter Zone) validate in the browser, then POST JSON to a
Google Apps Script web app bound to the Google Sheet **"Ankit Jobs - Website Applications"**.

- Rows go to the **Candidates** / **Recruiters** tabs (header row is created automatically).
- Optional uploads (resume / job description; PDF, Word, JPG, PNG, max 5 MB) are saved to the
  private Drive folder **"Ankit Jobs - Website Uploads"** and linked from the row.
- Each submission gets a reference (`C-XXXXXXXX` / `R-XXXXXXXX`) shown to the visitor.

## Pieces

| Where | What |
|---|---|
| `google-apps-script/Code.gs` | Source of the Apps Script (keep in sync with the online editor) |
| `src/data/site.ts` → `formEndpoint` | Web app `/exec` URL (override with `PUBLIC_FORM_ENDPOINT`) |
| `src/scripts/submit.ts` | Browser submit, base64 upload, timeout, duplicate-safe submission IDs |
| `src/lib/upload.mjs` | Upload type/size rules (tested in `tests/upload.test.mjs`) |
| `scripts/security-headers.mjs` | CSP `connect-src` allows only `script.google.com` / `script.googleusercontent.com` |

## Server-side protections (Code.gs)

Field allowlist, required-field and email checks, 1000-char cap, formula-injection guard
(`=`, `+`, `-`, `@` prefixed with `'`), MIME/size checks on uploads, honeypot field, script
lock for concurrent writes, and a 6-hour cache of submission IDs to ignore double submits.

## Changing the script

1. Edit `google-apps-script/Code.gs`, paste it into the Apps Script editor (Extensions → Apps Script from the Sheet), save.
2. **Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy.** Editing the
   existing deployment keeps the same `/exec` URL. A *new* deployment creates a new URL that must be
   copied into `formEndpoint`.

## Ownership

The Sheet, script and Drive folder currently belong to the Google account that authorised the
script. To move them to the business account, share/transfer the Sheet and Drive folder, then
re-create the deployment from that account and update `formEndpoint`.
