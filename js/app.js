const days = [
  { id: "FRI", temp: 31, label: "Heavy Rain", icon: "rain" },
  { id: "SAT", temp: 33, label: "Partly Cloudy", icon: "suncloud" },
  { id: "SUN", temp: 28, label: "Thunder Storm", icon: "storm" },
  { id: "MON", temp: 30, label: "Showers", icon: "showers" },
  { id: "TUE", temp: 29, label: "Overcast", icon: "cloud" },
];

const cities = [
  "Bhubaneswar, Odisha",
  "Mumbai, Maharashtra",
  "Delhi NCR",
  "Chennai, Tamil Nadu",
  "Guwahati, Assam",
];

const reports = [
  { city: "Puri", event: "Cyclone watch", src: "#IMD", status: "Verified", kind: "ok" },
  { city: "Jaipur", event: "Heatwave", src: "Citizen", status: "Review", kind: "warn" },
  { city: "Guwahati", event: "Flooding", src: "API / CWC", status: "Verified", kind: "ok" },
  { city: "Chennai", event: "Thunderstorm", src: "X / Social", status: "Duplicate", kind: "bad" },
  { city: "Leh", event: "Strong winds", src: "AWS feed", status: "Verified", kind: "ok" },
  { city: "Ahmedabad", event: "Dust storm", src: "#IMD", status: "Pending", kind: "warn" },
];

function iconSvg(type) {
  const common = 'width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"';
  if (type === "rain") return `<svg ${common}><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/><path d="M6 13a5 5 0 019.5-2A4 4 0 0118 19H7a4 4 0 01-1-7.9"/></svg>`;
  if (type === "suncloud") return `<svg ${common}><circle cx="8" cy="8" r="3"/><path d="M7 16h10a3.5 3.5 0 00-.2-7 5 5 0 00-9.3 1.5"/></svg>`;
  if (type === "storm") return `<svg ${common}><path d="M6 14a5 5 0 019.5-2A4 4 0 0118 20H8"/><path d="M11 12l-2 5h3l-1.5 4"/></svg>`;
  if (type === "showers") return `<svg ${common}><path d="M7 16a4.5 4.5 0 119 0H7z"/><path d="M9 19v2M12 19v2M15 19v2"/></svg>`;
  return `<svg ${common}><path d="M6 16a5 5 0 019.6-2A4 4 0 0118 20H7"/></svg>`;
}

function renderCard(index) {
  const d = days[index];
  document.getElementById("cardTemp").innerHTML = `${d.temp}<sup>°</sup>`;
  document.getElementById("cardCond").innerHTML = `${iconSvg(d.icon)} ${d.label}`;
  document.getElementById("cardLoc").textContent = `📍 ${cities[index % cities.length]}.`;
  document.querySelectorAll(".day").forEach((el, i) => el.classList.toggle("active", i === index));
}

function renderFeed(list) {
  const root = document.getElementById("feed");
  root.innerHTML = list
    .map(
      (r) => `<article class="report">
        <div>${r.city}</div>
        <div><b>${r.event}</b><div style="color:var(--muted);font-size:12px">${r.src} · GPS tagged</div></div>
        <span class="badge ${r.kind}">${r.status}</span>
      </article>`
    )
    .join("");
}

function filterFeed() {
  const event = document.getElementById("eventFilter").value;
  const status = document.getElementById("statusFilter").value;
  const q = document.getElementById("locFilter").value.toLowerCase();
  renderFeed(
    reports.filter((r) => {
      const okEvent = event === "all" || r.event.toLowerCase().includes(event);
      const okStatus = status === "all" || r.status.toLowerCase() === status;
      const okLoc = !q || r.city.toLowerCase().includes(q);
      return okEvent && okStatus && okLoc;
    })
  );
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2800);
}

function boot() {
  const heroWind = VajraWind.attach(document.getElementById("windCanvas"), {
    count: 1600,
    mode: "storm",
  });
  const layerWind = VajraWind.attach(document.getElementById("layerCanvas"), {
    count: 2200,
    cols: 56,
    rows: 32,
    mode: "wind",
  });
  VajraGlobe.attach(document.getElementById("globe"));

  renderCard(2);
  document.querySelectorAll(".day").forEach((btn, i) => {
    btn.addEventListener("click", () => renderCard(i));
  });

  document.querySelectorAll("[data-layer]").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("[data-layer]").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      layerWind.setMode(chip.dataset.layer);
    });
  });

  ["eventFilter", "statusFilter", "locFilter"].forEach((id) => {
    document.getElementById(id).addEventListener("input", filterFeed);
  });
  renderFeed(reports);

  document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("navLinks").classList.toggle("open");
  });

  document.getElementById("accessForm").addEventListener("submit", (e) => {
    e.preventDefault();
    toast("Access request received. Vajra will reach your operations desk.");
    e.target.reset();
  });
  document.getElementById("citizenForm").addEventListener("submit", (e) => {
    e.preventDefault();
    toast("Citizen report queued for AI verification and IMD review.");
    e.target.reset();
  });

  const flash = document.getElementById("stormFlash");
  setInterval(() => {
    if (Math.random() > 0.72) {
      flash.style.opacity = "0.85";
      setTimeout(() => (flash.style.opacity = "0"), 120);
    }
  }, 1800);

  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    let n = 0;
    const step = Math.max(1, Math.floor(target / 60));
    const timer = setInterval(() => {
      n = Math.min(target, n + step);
      el.textContent = n.toLocaleString("en-IN");
      if (n >= target) clearInterval(timer);
    }, 24);
  });

  void heroWind;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
