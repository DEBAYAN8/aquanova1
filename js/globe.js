(function () {
  function project(lat, lon, rotY, rotX, r) {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lon + 180) * Math.PI) / 180 + rotY;
    let x = -r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.cos(phi);
    let z = r * Math.sin(phi) * Math.sin(theta);
    const cx = Math.cos(rotX);
    const sx = Math.sin(rotX);
    const y2 = y * cx - z * sx;
    const z2 = y * sx + z * cx;
    return { x, y: y2, z: z2 };
  }

  const land = [];
  for (let i = 0; i < 1800; i++) {
    const lat = -60 + Math.random() * 130;
    const lon = -170 + Math.random() * 340;
    const inIndia = lat > 6 && lat < 37 && lon > 68 && lon < 97;
    const blob =
      (lat > 0 && lat < 70 && lon > -20 && lon < 40) ||
      (lat > 10 && lat < 70 && lon > 60 && lon < 140) ||
      (lat > -35 && lat < 10 && lon > 10 && lon < 40) ||
      (lat > 25 && lat < 70 && lon > -130 && lon < -60) ||
      (lat > -40 && lat < 10 && lon > -80 && lon < -35) ||
      (lat > -40 && lat < -10 && lon > 110 && lon < 155) ||
      inIndia;
    if (blob) land.push({ lat, lon, india: inIndia });
  }

  const cities = [
    { lat: 28.6, lon: 77.2 },
    { lat: 19.07, lon: 72.87 },
    { lat: 22.57, lon: 88.36 },
    { lat: 13.08, lon: 80.27 },
    { lat: 12.97, lon: 77.59 },
    { lat: 17.38, lon: 78.48 },
    { lat: 23.02, lon: 72.57 },
  ];

  window.VajraGlobe = {
    attach(el) {
      const canvas = document.createElement("canvas");
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      el.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      let rotY = 1.85;
      let rotX = -0.18;
      let tx = 0;
      let ty = 0;

      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = el.clientWidth;
        const h = el.clientHeight;
        canvas.width = Math.max(1, w * dpr);
        canvas.height = Math.max(1, h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      window.addEventListener("resize", resize);
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5;
        ty = (e.clientY - r.top) / r.height - 0.5;
      });

      function frame() {
        const w = el.clientWidth;
        const h = el.clientHeight;
        const cx = w * 0.42;
        const cy = h * 0.52;
        const r = Math.min(w, h) * 0.38;
        rotY += 0.004 + tx * 0.01;
        rotX += (ty * 0.35 - 0.18 - rotX) * 0.04;
        ctx.clearRect(0, 0, w, h);

        const g = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, r * 0.2, cx, cy, r * 1.35);
        g.addColorStop(0, "rgba(180,120,255,0.28)");
        g.addColorStop(0.55, "rgba(77,228,255,0.08)");
        g.addColorStop(1, "rgba(5,8,22,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        const ocean = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.2, cx, cy, r);
        ocean.addColorStop(0, "#3a6bcc");
        ocean.addColorStop(0.7, "#10245a");
        ocean.addColorStop(1, "#070d24");
        ctx.fillStyle = ocean;
        ctx.fill();

        land.forEach((p) => {
          const v = project(p.lat, p.lon, rotY, rotX, r);
          if (v.z < 0) return;
          ctx.fillStyle = p.india ? "#3ee0a4" : "rgba(90, 180, 140, 0.85)";
          ctx.fillRect(cx + v.x, cy - v.y, p.india ? 2.2 : 1.5, p.india ? 2.2 : 1.5);
        });

        cities.forEach((c) => {
          const v = project(c.lat, c.lon, rotY, rotX, r);
          if (v.z < 0) return;
          ctx.beginPath();
          ctx.fillStyle = "#4de4ff";
          ctx.arc(cx + v.x, cy - v.y, 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(77,228,255,0.35)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx + v.x, cy - v.y, 8 + (Date.now() / 200) % 10, 0, Math.PI * 2);
          ctx.stroke();
        });

        ctx.strokeStyle = "rgba(180,200,255,0.25)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        requestAnimationFrame(frame);
      }
      frame();
    },
  };
})();
