/* HOOKED — core drawing helpers. Everything draws in a 480×360 logical frame. */
(function () {
  const HK = window.HK = {};
  HK.W = 480; HK.H = 360;
  HK.FOG = '#efe6cc';

  const cache = {};
  HK.hx = h => cache[h] || (cache[h] = (n => [n >> 16 & 255, n >> 8 & 255, n & 255])(parseInt(h.slice(1), 16)));
  HK.mix = (a, b, k) => {
    const A = HK.hx(a), B = HK.hx(b);
    const r = i => Math.round(A[i] + (B[i] - A[i]) * k).toString(16).padStart(2, '0');
    return '#' + r(0) + r(1) + r(2);
  };
  HK.rgba = (h, a) => { const [r, g, b] = HK.hx(h); return `rgba(${r},${g},${b},${a})`; };
  HK.rng = seed => () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  HK.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  HK.lerp = (a, b, k) => a + (b - a) * k;
  HK.ease = k => (k = HK.clamp(k, 0, 1), k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
  HK.ramp = (t, a, b) => HK.clamp((t - a) / (b - a), 0, 1);

  HK.poly = (c, pts, col) => {
    c.fillStyle = col; c.beginPath();
    for (let i = 0; i < pts.length; i++) i ? c.lineTo(pts[i][0], pts[i][1]) : c.moveTo(pts[i][0], pts[i][1]);
    c.closePath(); c.fill();
  };
  HK.ngon = (cx, cy, rx, ry, n, a0 = 0) => {
    const p = [];
    for (let i = 0; i < n; i++) { const a = a0 + i / n * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return p;
  };
  HK.rect = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  HK.line = (c, pts, col, w = 1) => {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
    pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
  };
  HK.bands = (c, x, y, w, h, top, bot, n) => {
    for (let i = 0; i < n; i++) { c.fillStyle = HK.mix(top, bot, n === 1 ? 0 : i / (n - 1)); c.fillRect(x, y + i * h / n, w, h / n + 1); }
  };
  // a limb is a quad between two joints, tapering, with a small cap at the far joint
  HK.limb = (c, a, b, wa, wb, col, cap = true) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    HK.poly(c, [[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2], [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]], col);
    if (cap) HK.poly(c, HK.ngon(b[0], b[1], wb / 2, wb / 2, 6), col);
  };
  HK.along = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  HK.rr = (c, x, y, w, h, r) => {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  HK.text = (c, s, x, y, size, col, align = 'left', weight = 700) => {
    c.font = `${weight} ${size}px "M PLUS Rounded 1c", "Trebuchet MS", sans-serif`;
    c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y);
  };
  // run a draw function inside a transform: zoom z about point (cx, cy), optionally shifted
  HK.zoom = (c, z, cx, cy, fn, ox = 0, oy = 0) => {
    c.save(); c.translate(cx + ox, cy + oy); c.scale(z, z); c.translate(-cx, -cy); fn(); c.restore();
  };
  HK.fade = (c, col, a) => { if (a <= 0) return; c.save(); c.globalAlpha = HK.clamp(a, 0, 1); HK.rect(c, -10, -10, HK.W + 20, HK.H + 20, col); c.restore(); };
  HK.vignette = (c, a, col = '#1d2124') => {
    const g = c.createRadialGradient(240, 180, 120, 240, 180, 330);
    g.addColorStop(0, HK.rgba(col, 0)); g.addColorStop(1, HK.rgba(col, a)); c.fillStyle = g; c.fillRect(0, 0, HK.W, HK.H);
  };
  HK.smoke = (c, x, y, t, a = .55, len = 12) => {
    c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = 1.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y);
    for (let i = 1; i < len; i++) c.lineTo(x + 2 + Math.sin(t * .8 + i * .6) * (1.5 + i * .45), y - i * 5);
    c.stroke();
  };
  HK.insects = (c, t, n, area, col = 'rgba(30,40,30,.75)') => {
    const [x0, y0, w, h] = area; c.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const x = x0 + ((i * 97 + t * (8 + i * 3)) % w), y = y0 + ((i * 37 + Math.sin(t * 2 + i) * 6) % h + h) % h;
      c.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  };
})();
