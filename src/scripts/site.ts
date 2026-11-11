// Site-wide interactions: header state, right-side drawer, mobile action bar,
// scroll reveals and a light hero parallax. No libraries.
const header = document.querySelector<HTMLElement>(".site-header");
const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
const drawer = document.querySelector<HTMLElement>("#site-drawer");
const backdrop = document.querySelector<HTMLElement>(".drawer-backdrop");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

/* ---------- Drawer ---------- */
const focusables = () =>
  Array.from(
    drawer?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
  );

function setDrawer(open: boolean, returnFocus = true) {
  if (!drawer || !toggle) return;
  drawer.classList.toggle("is-open", open);
  backdrop?.classList.toggle("is-open", open);
  document.body.classList.toggle("is-locked", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  drawer.inert = !open;
  if (open) requestAnimationFrame(() => focusables()[0]?.focus());
  else if (returnFocus) toggle.focus();
}
if (drawer) drawer.inert = true;
toggle?.addEventListener("click", () =>
  setDrawer(toggle.getAttribute("aria-expanded") !== "true"),
);
drawer
  ?.querySelector(".drawer-close")
  ?.addEventListener("click", () => setDrawer(false));
backdrop?.addEventListener("click", () => setDrawer(false));
drawer
  ?.querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", () => setDrawer(false, false)));
document.addEventListener("keydown", (event) => {
  if (!drawer?.classList.contains("is-open")) return;
  if (event.key === "Escape") setDrawer(false);
  if (event.key === "Tab") {
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
});
matchMedia("(min-width: 1100px)").addEventListener("change", (e) => {
  if (e.matches && drawer?.classList.contains("is-open")) setDrawer(false, false);
});

/* ---------- Scroll state: header shadow + mobile action bar ---------- */
const mobileBar = document.querySelector<HTMLElement>(".mobile-bar");
const onRegistrationPage = location.pathname.startsWith("/candidate-zone") || location.pathname.startsWith("/recruiter-zone");
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle("is-scrolled", y > 24);
  const showBar = !onRegistrationPage && y > 560;
  mobileBar?.classList.toggle("is-visible", showBar);
  document.body.classList.toggle("has-mobile-bar", showBar);
  ticking = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true },
);
onScroll();

document
  .querySelectorAll("[data-year]")
  .forEach((el) => (el.textContent = String(new Date().getFullYear())));

/* ---------- Reveal on scroll ---------- */
if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
      el.classList.add("reveal-ready");
      observer.observe(el);
    }
  });
}

/* ---------- Hero parallax (desktop, motion allowed) ---------- */
const heroImg = document.querySelector<HTMLElement>("[data-parallax]");
if (heroImg && !reducedMotion.matches && matchMedia("(min-width: 900px)").matches) {
  let frame = 0;
  window.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900);
        heroImg.style.translate = `0 ${y * 0.12}px`;
      });
    },
    { passive: true },
  );
}
