document.addEventListener("DOMContentLoaded", () => {
  console.log("Rice Motorsport site loaded");
  initMobileNav();
});

function initMobileNav() {
  var btn = document.getElementById("nav-toggle");
  var menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;

  var bars = btn.querySelectorAll(".nav-bar");
  btn.addEventListener("click", function () {
    var open = !menu.classList.contains("hidden");
    if (open) {
      menu.classList.add("hidden");
      menu.classList.remove("flex");
    } else {
      menu.classList.remove("hidden");
      menu.classList.add("flex");
    }
    bars[0].style.transform = open ? "" : "translateY(8px) rotate(45deg)";
    bars[1].style.opacity = open ? "" : "0";
    bars[2].style.transform = open ? "" : "translateY(-8px) rotate(-45deg)";
  });
}
