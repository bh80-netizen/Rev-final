// Shared homepage/Sponsors color emphasis based on each partner’s visible position.
(() => {
  const marquee = document.querySelector(".sponsor-marquee");
  if (!marquee) return;

  const logos = [...marquee.querySelectorAll(".sponsor-group img, .sponsor-name")].map((image) => ({
    image,
    color: undefined,
  }));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let pointerInside = false;
  let frame = 0;

  function updateColors() {
    frame = 0;
    const bounds = marquee.getBoundingClientRect();
    const center = bounds.left + bounds.width / 2;
    const radius = Math.min(bounds.width * 0.38, 300);

    // Read all geometry before changing styles to avoid repeated layout work.
    const colors = logos.map(({ image }) => {
      const rect = image.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - center);
      const proximity = Math.max(0, 1 - distance / Math.max(radius, 1));
      return proximity * proximity * (3 - 2 * proximity);
    });
    logos.forEach((logo, index) => {
      if (logo.color === undefined || Math.abs(colors[index] - logo.color) > 0.001) {
        logo.color = colors[index];
        logo.image.style.setProperty("--sponsor-color", logo.color.toFixed(4));
      }
    });

    if (
      visible && !document.hidden && !reducedMotion.matches &&
      !pointerInside && !marquee.contains(document.activeElement)
    ) {
      frame = window.requestAnimationFrame(updateColors);
    }
  }

  function refresh() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    if (visible && !document.hidden) frame = window.requestAnimationFrame(updateColors);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      refresh();
    }).observe(marquee);
  } else {
    visible = true;
    refresh();
  }

  marquee.addEventListener("mouseenter", () => { pointerInside = true; refresh(); });
  marquee.addEventListener("mouseleave", () => { pointerInside = false; refresh(); });
  marquee.addEventListener("focusin", refresh);
  marquee.addEventListener("focusout", refresh);
  marquee.addEventListener("scroll", refresh, { passive: true });
  window.addEventListener("resize", refresh, { passive: true });
  document.addEventListener("visibilitychange", refresh);
  reducedMotion.addEventListener("change", refresh);
})();
