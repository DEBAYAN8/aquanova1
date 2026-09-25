(function () {
  function makeField(cols, rows, t, mode) {
    const field = new Float32Array(cols * rows * 2);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const u = x / cols;
        const v = y / rows;
        const i = (y * cols + x) * 2;
        const a = Math.sin((u * 6 + t * 0.15) * Math.PI) + Math.cos((v * 5 - t * 0.1) * Math.PI);
        const b = Math.cos((u * 4 - v * 3 + t * 0.12) * Math.PI);
        let vx = a * 0.8 + (0.5 - v) * 0.6;
        let vy = b * 0.7 + (u - 0.55) * 0.45;
        if (mode === "waves") {
          vx = Math.sin(v * 18 + t * 1.6) * 0.15 + 0.9;
          vy = Math.sin(u * 10 + t) * 0.35;
        } else if (mode === "rain") {
          vx = 0.12;
          vy = 1.2 + Math.sin(u * 20 + t) * 0.2;
        } else if (mode === "temp") {
          vx = Math.sin(v * 8 + t * 0.2) * 0.4;
          vy = Math.cos(u * 8) * 0.4;
        } else if (mode === "storm") {
          const cx = u - 0.62;
          const cy = v - 0.38;
          const r = Math.max(0.08, Math.hypot(cx, cy));
          vx = -cy / r + a * 0.2;
          vy = cx / r + b * 0.2;
        }
        field[i] = vx;
        field[i + 1] = vy;
      }
    }
    return field;
  }

  function sample(field, cols, rows, x, y) {
    const gx = Math.max(0, Math.min(cols - 1.001, x));
    const gy = Math.max(0, Math.min(rows - 1.001, y));
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const tx = gx - x0;
    const ty = gy - y0;
    const i00 = (y0 * cols + x0) * 2;
    const i10 = (y0 * cols + Math.min(cols - 1, x0 + 1)) * 2;
    const i01 = (Math.min(rows - 1, y0 + 1) * cols + x0) * 2;
    const i11 = (Math.min(rows - 1, y0 + 1) * cols + Math.min(cols - 1, x0 + 1)) * 2;
    return [
      (field[i00] * (1 - tx) + field[i10] * tx) * (1 - ty) + (field[i01] * (1 - tx) + field[i11] * tx) * ty,
      (field[i00 + 1] * (1 - tx) + field[i10 + 1] * tx) * (1 - ty) + (field[i01 + 1] * (1 - tx) + field[i11 + 1] * tx) * ty,
    ];
  }

  function colorFor(speed, mode) {
    if (mode === "waves") return `hsla(190, 90%, ${55 + speed * 12}%, 0.7)`;
    if (mode === "rain") return `hsla(220, 80%, ${70 - speed * 8}%, 0.55)`;
    if (mode === "temp") return `hsla(${Math.max(0, 40 - speed * 18)}, 90%, 60%, 0.7)`;
    if (mode === "storm") return `hsla(275, 90%, ${62 + speed * 6}%, 0.75)`;
    return `hsla(${200 - speed * 18}, 90%, 65%, 0.7)`;
  }

  window.VajraWind = {
    attach(canvas, options = {}) {
      const ctx = canvas.getContext("2d");
      const cols = options.cols || 48;
      const rows = options.rows || 28;
      const count = options.count || 1400;
      let mode = options.mode || "wind";
      let particles = [];
      let field;
      let t = 0;
      let running = true;

      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function spawn() {
        const { width, height } = canvas.getBoundingClientRect();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          life: Math.random() * 80 + 40,
        };
      }

      function reset() {
        resize();
        particles = Array.from({ length: count }, spawn);
        ctx.fillStyle = "#050816";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      function frame() {
        if (!running) return;
        const rect = canvas.getBoundingClientRect();
        t += 0.016;
        if (Math.floor(t * 8) % 2 === 0) field = makeField(cols, rows, t, mode);
        ctx.fillStyle = "rgba(5, 8, 22, 0.09)";
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.lineWidth = 1.15;
        for (const p of particles) {
          const gx = (p.x / rect.width) * (cols - 1);
          const gy = (p.y / rect.height) * (rows - 1);
          const [vx, vy] = sample(field, cols, rows, gx, gy);
          const nx = p.x + vx * 6;
          const ny = p.y + vy * 6;
          const speed = Math.hypot(vx, vy);
          ctx.strokeStyle = colorFor(speed, mode);
          ctx.lineWidth = mode === "storm" ? 1.4 : 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          p.x = nx;
          p.y = ny;
          p.life -= 1;
          if (p.life < 0 || p.x < -20 || p.y < -20 || p.x > rect.width + 20 || p.y > rect.height + 20) {
            Object.assign(p, spawn());
          }
        }
        requestAnimationFrame(frame);
      }

      window.addEventListener("resize", reset);
      reset();
      field = makeField(cols, rows, 0, mode);
      frame();
      return {
        setMode(next) {
          mode = next;
        },
        stop() {
          running = false;
        },
      };
    },
  };
})();
