const navLinks = document.querySelectorAll("[data-nav]");
const page = document.body.dataset.page;
const mobileNavigation = document.querySelector(".mobile-nav");
const sponsorMarquee = document.querySelector(".sponsor-marquee");
const siteHeader = document.querySelector(".site-header");
const animatedHero = page === "about" ? document.querySelector(".hero") : null;
let scrollAnchor = Math.max(window.scrollY, 0);
let headerScrollFrame = 0;

function showHeader() {
  siteHeader?.classList.remove("is-hidden");
}

function updateHeaderVisibility() {
  headerScrollFrame = 0;
  if (!siteHeader) return;

  const currentScroll = Math.max(window.scrollY, 0);
  const movement = currentScroll - scrollAnchor;
  const heroAnimationEnd = animatedHero
    ? animatedHero.offsetTop + animatedHero.offsetHeight - window.innerHeight
    : 0;

  if (mobileNavigation?.open || currentScroll <= 18 || (animatedHero && currentScroll <= heroAnimationEnd)) {
    showHeader();
    scrollAnchor = currentScroll;
    return;
  }

  if (movement > 12) {
    siteHeader.classList.add("is-hidden");
    scrollAnchor = currentScroll;
  } else if (movement < -12) {
    showHeader();
    scrollAnchor = currentScroll;
  }
}

function handleHeaderScroll() {
  if (headerScrollFrame) return;
  headerScrollFrame = window.requestAnimationFrame(updateHeaderVisibility);
}

function syncCurrentNavigation() {
  const current = page === "about" && window.location.hash === "#faq" ? "faq" : page;

  navLinks.forEach((link) => {
    if (link.dataset.nav === current) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

window.addEventListener("scroll", handleHeaderScroll, { passive: true });
window.addEventListener("hashchange", () => {
  syncCurrentNavigation();
  showHeader();
});
mobileNavigation?.addEventListener("toggle", () => {
  if (mobileNavigation.open) showHeader();
  scrollAnchor = Math.max(window.scrollY, 0);
});
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (mobileNavigation) mobileNavigation.removeAttribute("open");
    showHeader();
  });
});
syncCurrentNavigation();

if (sponsorMarquee && "IntersectionObserver" in window) {
  const marqueeObserver = new IntersectionObserver(([entry]) => {
    sponsorMarquee.classList.toggle("is-visible", entry.isIntersecting);
  });
  marqueeObserver.observe(sponsorMarquee);
}
