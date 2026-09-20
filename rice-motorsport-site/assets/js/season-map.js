// ===== American Solar Challenge route map =====
// Stops and format follow the Electrek American Solar Challenge, run by the
// Innovators Educational Foundation: a track qualifier at Formula Sun Grand
// Prix, then a staged cross-country run with checkpoints and overnight stage
// stops between Minneapolis and Amarillo.
document.addEventListener("DOMContentLoaded", function () {
  if (typeof L === "undefined") return;

  const map = L.map("race-map", {
    center: [40.0, -95.0],
    zoom: 5,
    scrollWheelZoom: false, // prevents accidental zoom while scrolling the page
    zoomControl: true,
    attributionControl: true,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);

  function dot(size, fill, border, glow) {
    return L.divIcon({
      className: "",
      html:
        '<div style="width:' +
        size +
        "px;height:" +
        size +
        "px;background:" +
        fill +
        ";border:2px solid " +
        border +
        ";border-radius:50%;" +
        (glow ? "box-shadow:0 0 14px " + glow + ";" : "") +
        '"></div>',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  const terminusIcon = dot(24, "#b7c4ff", "#ffffff", "rgba(183,196,255,0.9)");
  const stageIcon = dot(19, "#2646ad", "#b7c4ff", "rgba(183,196,255,0.45)");
  const checkpointIcon = dot(14, "#1a1b22", "#8e909e", null);
  const trackIcon = dot(19, "#33343b", "#c4c5d5", null);

  // Off-route qualifier — drawn on the map but not part of the road line.
  const qualifier = {
    coords: [46.418, -94.273],
    title: "Formula Sun Grand Prix",
    detail: "Brainerd International Raceway · 3.1-mile road course",
    date: "Three days on track",
    kind: "Qualifier",
    icon: trackIcon,
  };

  // The cross-country route, in order.
  const route = [
    {
      coords: [44.9778, -93.265],
      title: "Minneapolis, MN",
      detail: "University of Minnesota · start line",
      date: "Day 1",
      kind: "Start",
      icon: terminusIcon,
    },
    {
      coords: [43.8014, -91.2396],
      title: "La Crosse, WI",
      detail: "Checkpoint · 30-minute hold",
      date: "Day 1",
      kind: "Checkpoint",
      icon: checkpointIcon,
    },
    {
      coords: [40.5142, -88.9906],
      title: "Normal, IL",
      detail: "Checkpoint · Illinois State University",
      date: "Days 2–3",
      kind: "Checkpoint",
      icon: checkpointIcon,
    },
    {
      coords: [38.8114, -89.9532],
      title: "Edwardsville, IL",
      detail: "Stage stop · overnight",
      date: "Days 3–4",
      kind: "Stage stop",
      icon: stageIcon,
    },
    {
      coords: [37.9514, -91.7713],
      title: "Rolla, MO",
      detail: "Checkpoint · 30-minute hold",
      date: "Day 4",
      kind: "Checkpoint",
      icon: checkpointIcon,
    },
    {
      coords: [37.1764, -94.3102],
      title: "Carthage, MO",
      detail: "Stage stop · overnight",
      date: "Days 5–6",
      kind: "Stage stop",
      icon: stageIcon,
    },
    {
      coords: [36.154, -95.9928],
      title: "Tulsa, OK",
      detail: "Checkpoint · 30-minute hold",
      date: "Day 6",
      kind: "Checkpoint",
      icon: checkpointIcon,
    },
    {
      coords: [35.412, -99.4043],
      title: "Elk City, OK",
      detail: "Stage stop · overnight",
      date: "Days 7–8",
      kind: "Stage stop",
      icon: stageIcon,
    },
    {
      coords: [35.222, -101.8313],
      title: "Amarillo, TX",
      detail: "Arts in the Sunset · finish line",
      date: "Day 8",
      kind: "Finish",
      icon: terminusIcon,
    },
  ];

  L.polyline(
    route.map(function (stop) {
      return stop.coords;
    }),
    { color: "#b7c4ff", weight: 2, opacity: 0.55, dashArray: "6 8" },
  ).addTo(map);

  function popupHTML(stop) {
    return (
      '<div style="font-family:Manrope,sans-serif;color:#e3e1eb;min-width:220px;">' +
      '<div style="font-family:Inter,sans-serif;color:#b7c4ff;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:8px;">' +
      stop.date +
      "</div>" +
      "<div style=\"font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17px;line-height:1.15;letter-spacing:-0.02em;margin-bottom:8px;color:#ffffff;\">" +
      stop.title +
      "</div>" +
      '<div style="font-size:12px;color:#c4c5d5;margin-bottom:14px;">' +
      stop.detail +
      "</div>" +
      '<div style="display:inline-block;background:#1a1b22;color:#b7c4ff;font-family:Inter,sans-serif;font-weight:700;font-size:10px;padding:5px 10px;text-transform:uppercase;letter-spacing:0.15em;">' +
      stop.kind +
      "</div>" +
      "</div>"
    );
  }

  const markers = route.concat([qualifier]).map(function (stop) {
    return L.marker(stop.coords, { icon: stop.icon }).addTo(map).bindPopup(popupHTML(stop));
  });

  map.fitBounds(L.featureGroup(markers).getBounds(), { padding: [60, 60] });

  // Scroll-wheel zoom only after a deliberate click, so the page still scrolls.
  map.on("click", function () {
    map.scrollWheelZoom.enable();
  });
  map.on("mouseout", function () {
    map.scrollWheelZoom.disable();
  });
});
