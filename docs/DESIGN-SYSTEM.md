# Ankit Jobs & Staffing India — design system (v2 redesign)

The navy, white and gold identity comes from the original logo (`website-logo-ankit-recruitment.jpeg`), which is never redrawn. The red accent comes from the logo's stars. The v2 redesign keeps all business content, form logic and pages, and replaces the visual system.

## Files

`src/styles/global.css` imports focused files:

| File | Covers |
| --- | --- |
| `tokens.css` | Colours, fonts, type scale, radii, shadows, spacing, motion tokens |
| `base.css` | Reset, typography, layout primitives, eyebrow/lead helpers, reveal motion |
| `components.css` | Buttons, icon badges, chips, cards, check lists, image frames, notices, FAQ accordion, breadcrumbs, mobile snap rails |
| `chrome.css` | Top bar, sticky header, right-side drawer, footer, floating WhatsApp, mobile action bar |
| `form.css` | Candidate registration card, themed selects, validation states |
| `home.css` | Hero, marquee, audience paths, services bento, timeline, registration, locations, reasons, FAQ teaser, career band |
| `pages.css` | Inner-page hero, editorial splits, contact, services list, service detail, legal, 404 |

## Typography

- **Display:** Archivo Variable (weight + width axes), set slightly expanded for a sturdy, industrial-corporate voice. Its stylised ampersand is replaced with IBM Plex Sans's via a `unicode-range` face, using the same font file (no extra download).
- **Body and numerals:** IBM Plex Sans Variable. Its “1” has a flag and a foot serif, so it never reads as “I” in phone numbers or step numbers. `.num` adds tabular lining figures.
- **Wordmark:** Georgia bold, matching the serif lettering in the logo.

Headings have a small vertical padding so ascenders and descenders are never clipped.

## Colour tokens

Navy `#03142E`/`#061B4C`, royal blue `#064A9B`, bright blue `#0874C9`, gold `#FFC928` (CTAs, highlights), dark gold `#8F6800` (gold text on light backgrounds — meets 4.5:1), ice `#EEF5FD`, surface `#F6F8FC`, red `#C8102E` (wordmark only), WhatsApp `#25D366`.

## Layout

- Container: `min(1440px, 100% − 2 × gutter)`; gutter 16px on phones up to 72px on large screens. Hero, marquee, career band and dark sections are full-bleed.
- Section rhythm: `--section-y` = 64–124px.
- Radii: 10 / 16 / 24 / 32px and pills.

## Components and behaviour

- **Buttons:** pill shape, 52px default height (44px small). Hover = directional colour fill from the left, 2px lift and arrow nudge. No shine, glow or shimmer.
- **Header:** sticky and translucent; the desktop nav has an animated gold underline, a call icon and a Register Now CTA. Below 1024px it shows a menu button.
- **Drawer:** a right-side panel placed *outside* the sticky header, so `position: fixed` is always relative to the viewport, including after scrolling. It has a backdrop, Escape to close, a focus trap, focus return and a body scroll lock.
- **Mobile action bar:** Call and Register Now appear after 560px of scroll on phones; it is hidden on the registration page. The WhatsApp button moves up above it.
- **WhatsApp button:** 60px circle with a fixed 30px glyph (`flex: 0 0 30px`, never squeezed). On hover-capable devices a label slides out.
- **Selects:** custom navy chevron in a gold-tint pill (gold on focus), dashed disabled state for District until a State is chosen, and themed option colours. Phones use the native picker for usability.
- **Cards:** lift and image zoom on hover. Nothing depends on hover to reveal content, so touch works fully.
- **Mobile rails:** services and locations become swipeable scroll-snap rails below 768px, with a “Swipe” hint.

## Motion

- Hero: staggered rise-in (800ms) plus a one-off 1.8s settle zoom on the photo. On desktop the hero photo has a light parallax (`translate`, rAF-throttled).
- Sections: Intersection Observer reveal (opacity + 26px translate, staggered by `--delay`).
- Marquee: a single slow CSS loop that pauses on hover.
- `prefers-reduced-motion` disables all of the above, including smooth scrolling. There is no preloader; content is visible without JavaScript.

## Mobile hero

The hero photograph is shown crisp in its own framed block on phones. It is not blurred, darkened or placed under text. On desktop it fills the right 64% with a navy gradient on its left edge only.
