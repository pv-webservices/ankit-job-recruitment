# Candidate form — live collection is disabled

The homepage and registration page use the same twelve fields, validation module and browser controller. The dedicated form groups them by personal information, contact information, and education/location.

**No submission endpoint exists.** The form performs local validation and explicitly says details were not submitted. It does not create a success page. There is no SMTP, FormSubmit, data email, WhatsApp payload, localStorage, tracking or application logging. General WhatsApp and telephone links work independently.

`method="dialog"` prevents native navigation if JavaScript fails; the button is disabled until the controller attaches. Generated CSP also sets `form-action 'none'` and `connect-src 'none'`. This is a deliberate safety state. Do not enable a URL by changing an environment variable or only removing the notice.

## Before implementing live collection

Obtain the approved data purpose, necessity of each field (especially parents’ names, DOB and gender), retention/deletion periods, authorized recipients, processor/storage choice, candidate rights contact, age eligibility and final consent text. The draft privacy page lists these decisions. A privacy professional should review the final policy for the applicable Indian requirements; this repository makes no legal compliance claim.

Once the business approves a specific secure provider or handler, implement and review:

1. HTTPS POST with a small JSON body, a field allowlist and server-side length/type/enum validation. Recalculate age on the server; do not trust the readonly field.
2. State/district validation against the maintained snapshot, date validation, phone and email validation. Preserve Unicode names; encode on output.
3. Origin/CSRF checks appropriate to the chosen handler, spam controls and shared rate limiting with bounded request size and timeouts.
4. Encryption, least-privilege storage access, authorized-recipient controls and a defined deletion process covering backups.
5. No personal data in URLs, logs, analytics, error tracking or public responses. No external scripts can read form contents.
6. An idempotency key and disabled in-flight button to prevent duplicate submissions. Acknowledge success only after durable server confirmation, with a non-sensitive receipt ID.
7. Accessible loading, success, offline, timeout, validation and server-error feedback. Re-enable retry safely after failure; do not falsely claim a timed-out request was not received.
8. Update CSP narrowly for the approved endpoint, then update the privacy notice, consent, FAQs, no-JavaScript handling and integration tests on **both** pages.

Use synthetic test records in a staging endpoint first. Real candidate receipt and deletion testing require explicit authorization; none has been performed.

## Current validation decisions

- Indian mobile: 10 national digits starting 6–9; optional +91/91 prefix and common formatting separators.
- Alternative number: optional; the same validation when supplied.
- DOB: exact calendar date, future dates rejected; age uses the current **browser-local calendar date**, not UTC or elapsed milliseconds.
- Leap-day birthdays: age increments on 1 March during non-leap years. This is a display convention to confirm with the client, not a legal eligibility rule.
- Gender includes “Prefer not to say”; it is not used to determine eligibility.
- Whitespace-only names, invalid enum values, missing consent and cross-state district values are rejected.

## District data

Bundled locally: 36 states/union territories and 784 districts from a maintained LGD-derived repository, snapshot **23 September 2026**, retrieved 10 November 2026. See `src/data/lgd-metadata.json` and `docs/ASSETS-AND-SOURCES.md`. No candidate information or runtime request is sent to that source.

Administrative divisions can change. Compare with the current official LGD export and refresh/review the snapshot before live collection. Do not present the snapshot date as a guarantee that every subsequent administrative change is included.
