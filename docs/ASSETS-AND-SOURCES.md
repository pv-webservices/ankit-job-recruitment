# Asset and data provenance

## Original client assets

- `website-logo-ankit-recruitment.jpeg`: supplied original logo; retained untouched in the project root. WebP logo, PNG favicon and JPEG social image are proportional web optimizations of this artwork, not redesigns.
- `C:/Users/hp/Downloads/Ankit Jobs Recruitment Homepage.png`: approved layout reference. Used for visual analysis and comparison; not shipped as a screenshot masquerading as a webpage.
- The pasted master development prompt is the project specification. Business contacts, service descriptions and location names come from that supplied brief.

## Generated representative photography

Built-in `image_gen` tool used; no API-key CLI fallback. The five generated originals were preserved under the tool’s generated-images folder and optimized WebP copies saved under `public/images/`. These portray fictional representative professionals, not actual company staff or placed candidates. The disclaimer states this explicitly. No AI logo generation or modification was requested.

| Project asset | Original output |
| --- | --- |
| `public/images/hero.webp`, `hero-800.webp` | `exec-85b46c64-c353-4164-a682-50bee4b46e01.png` |
| `public/images/manpower.webp` | `exec-591bf20b-5d03-46fd-9d09-5514cf87f2bd.png` |
| `public/images/staffing.webp` | `exec-b3c472f5-0146-4572-a4f8-a849225156d4.png` |
| `public/images/placement.webp` | `exec-21b2986d-1e8f-4788-8935-9a69cf3f70d9.png` |
| `public/images/bulk-hiring.webp` | `exec-589f8ab9-0ed7-4b32-a72e-1fecf4091dfa.png` |

Original folder: `C:/Users/hp/.codex/generated_images/01a1c60f-303f-7051-ae77-7bd4cfea3946/`. The website references only project-local optimized copies. `scripts/prepare-assets.mjs` documents the deterministic resizing/format conversion and logo optimization.

### Final prompts used

**Hero:** Use case: ads-marketing. Asset type: recruitment business website hero photograph, wide landscape 3:2. Create a polished photorealistic photograph of three fictional young adult Indian professionals, standing with friendly confident expressions: in foreground a woman in a tailored navy blazer and white shirt holding a dark portfolio at waist, behind her left a man in yellow hardhat and reflective safety vest, behind her right a man in light blue office shirt with folded arms. Frame all three from waist up with generous space around their heads; the group is centered towards right half, left 35 percent is clean deep navy blue negative space for website HTML text. Background a softly blurred modern workplace in blue tones, subtle warm sunlight on faces, premium corporate photography with natural skin texture. Lower edge fades naturally into deep navy. No text, no lettering, no logos, no branding, no watermarks. This is representative imagery, not real company employees. Composition must support a navy and gold recruitment homepage.

**Manpower:** A photorealistic editorial photograph for a recruitment website, landscape 3:2. Indian industrial technician wearing clean navy workwear, orange safety vest and white hardhat inspecting machinery in a bright modern factory. Natural confident expression, realistic workplace, medium wide composition, blue and warm gold palette, authentic details. No text, logos or watermark. Fictional representative professional.

**Staffing:** A photorealistic editorial photograph for an Indian staffing website, landscape 3:2. Indian woman customer support professional in smart blue business casual clothes wearing a headset, smiling naturally at her workstation in a bright modern office, other office staff softly blurred in background. Natural skin texture, professional commercial photography, blue and warm neutral palette. No text, logos or watermark. Fictional representative professionals.

**Placement:** A photorealistic editorial photograph for an Indian career placement website, landscape 3:2. Friendly Indian male recruiter in navy suit sitting across a desk from a young adult Indian female candidate, discussing a paper CV in a bright contemporary office, candid side view, both listening attentively, professional natural daylight, blue and neutral palette. No text, legible writing, logos or watermark. Fictional representative professionals.

**Bulk hiring:** A photorealistic editorial group photograph for an Indian workforce recruitment website, landscape 3:2. Four Indian adult professionals standing together in a bright industrial workplace: two technicians wearing yellow hardhats, a woman in smart blue office attire, a man in pale blue shirt. Friendly confident expressions, inclusive workforce, medium waist-up framing with heads fully visible, polished natural commercial photography, blue and gold palette. No text, logos or watermark. Fictional representative professionals.

## States and districts

Primary authority: [Government of India Local Government Directory](https://lgdirectory.gov.in/), with the official [OGD district resource](https://data.gov.in/resource/local-government-directory-lgd-districts).

Bundled data was obtained from the [maintainer’s LGD-derived repository](https://github.com/kalyangupta12/indian-cities-data), pinned at commit `ce94ea75b7afdadac76de78dce4286ed11bdf82f`. Its metadata identifies a 23 September 2026 archive containing 36 states/UTs and 784 districts. Source files are `src/data/lgd-states.json`, `lgd-districts.json`, and `lgd-metadata.json`; the compact dependent dropdown mapping is `india-districts.json`. The introductory “The” was omitted from the long Dadra and Nagar Haveli and Daman and Diu display name without changing district membership.

The source repository uses an MIT license; see the accompanying license file. Refresh from the current official export before enabling live collection. Runtime dropdowns work entirely from local data and make no third-party requests.

## Fonts, icons and implementation references

DM Sans and Manrope are locally hosted from Fontsource packages under SIL Open Font License; their package license files remain in the installed packages. Icons and the decorative skyline are a small consistent set of local SVG paths with no external icon service.

Astro static output and site-origin configuration follow the [official configuration reference](https://docs.astro.build/en/reference/configuration-reference/) and [environment variable guide](https://docs.astro.build/guides/environment-variables/). No client-side router, authentication or application platform was added.

## v2 redesign — OpenAI Image API assets (November 2026)

Generated server-side with `scripts/images/generate.mjs` (key read from `OPENAI_API_KEY` in `.env`; never bundled). Models, quality tiers and sizes are configured centrally in `scripts/images/config.mjs` and can be overridden with environment variables. `scripts/images/router.mjs` picks the model automatically: **gpt-image-2.5-sunburst** for the hero, architecture/detail-sensitive scenes or photoreal groups of three or more; otherwise **gpt-image-2.5-flare**. If Flare fails, the task is retried once on Sunburst. Each image's prompt, purpose, placement and alt text is in `scripts/images/manifest.mjs`. Raw PNGs are kept in `assets-src/generated/` (git-ignored). Optimised WebP renditions are in `public/images/`.

| Asset | Placement | Model · quality · size |
| --- | --- | --- |
| `hero-kolkata.webp`, `-960` | Homepage hero (Howrah Bridge, Kolkata) | sunburst · high · 1536×1024 |
| `loc-kolkata.webp` | Locations card | sunburst · medium · 1024×1536 |
| `loc-vizag.webp` | Locations card | flare · medium · 1024×1536 |
| `loc-odisha.webp` | Locations card (Konark wheel) | sunburst · medium · 1024×1536 |
| `jobseeker.webp` | Job-seeker path card, registration sections | flare · high · 1024×1536 |
| `employer.webp`, `-720` | Employer path card, For Employers hero | flare · medium · 1536×1024 |

All people shown are fictional representative professionals. The five v1 photographs (`hero`, `manpower`, `staffing`, `placement`, `bulk-hiring`) are reused. `logo-badge.webp` / `-2x` and `apple-touch-icon.png` are circular, transparent-edged crops of the original logo (no redrawing), so the logo is never clipped.

Regenerate: `npm run images:generate` (missing images only), `npm run images:generate -- hero-kolkata --force`, or re-encode only with `npm run images:optimize`.
