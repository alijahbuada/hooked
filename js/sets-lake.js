/* HOOKED — the lake, from three sides.
   World: lake to the north, sun rises in the east. His chair is west, hers east.
   A = from behind them looking north (his chair left).  S = from the waterline looking south (his chair right).
   W = from his end looking east along the shore (lake on the left). */
(function () {
  const { poly, ngon, mix, rng, clamp, lerp, line, limb, FOG } = HK;
  const L = HK.LAKE = { HZ: 150, SHORE: 252, FISH: 190, SEN: 280, ROD0: [150, 300], TIP0: [108, 172], BOB: [96, 206] };
  const { HZ, SHORE, FISH, SEN } = L;

  const R = rng(9);
  const HILLS = [[HZ - 18, 18, '#7f9a77', .38], [HZ - 6, 12, '#6c8a66', .16]].map(([base, amp, col, fog]) => { const pts = []; for (let x = -420; x <= 900; x += 34) pts.push([x, base - R() * amp]); return { pts, col, fog }; });
  const SHARDS = (() => { const r = rng(4), a = []; for (let i = 0; i < 26; i++) a.push([-200 + r() * 880, SHORE + 14 + r() * 140, 14 + r() * 30, i % 2]); return a; })();

  HK.skyBands = (c, sun = 0, top = '#8fbcd3', y1 = HZ) => {
    const tp = mix(top, '#a9cfe0', sun);
    for (let i = 0; i < 9; i++) { c.fillStyle = mix(tp, FOG, i / 8); c.fillRect(-400, -200 + i * (y1 + 200) / 9, 1300, (y1 + 200) / 9 + 1); }
  };
  HK.hills = (c, y = 0, tint) => {
    HILLS.forEach(({ pts, col, fog }) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], mx = (x0 + x1) / 2;
        const cc = tint ? mix(col, tint, .3) : col;
        poly(c, [[x0, y0 + y], [x1, y1 + y], [mx, HZ + 2 + y]], mix(i % 2 ? cc : mix(cc, '#ffffff', .12), FOG, fog));
        poly(c, [[x0, y0 + y], [mx, HZ + 2 + y], [x0, HZ + 2 + y]], mix(cc, FOG, fog + .08));
      }
    });
  };
  HK.sun = (c, x, y, r = 26) => { poly(c, ngon(x, y, r + 8, r + 8, 12), 'rgba(255,247,220,.35)'); poly(c, ngon(x, y, r, r, 12), '#fff7dc'); };
  HK.fogBand = (c, y, a = .55) => {
    const g = c.createLinearGradient(0, y - 40, 0, y + 40); g.addColorStop(0, 'rgba(239,230,204,0)'); g.addColorStop(.5, `rgba(239,230,204,${a})`); g.addColorStop(1, 'rgba(239,230,204,0)');
    c.fillStyle = g; c.fillRect(-400, y - 40, 1300, 80);
  };

  // ---------- A: from behind, looking north ----------
  function waterA(c, t, sun) {
    for (let i = 0; i < 7; i++) { const y0 = HZ + i * (SHORE - HZ) / 7; c.fillStyle = mix(FOG, '#6e979b', Math.min(1, .25 + i / 6 * .8)); c.fillRect(-400, y0, 1300, (SHORE - HZ) / 7 + 1); }
    const r = rng(Math.floor(t * 3)), sx = 360, top = HZ - 2 - sun * 40;
    for (let i = 0; i < 12; i++) { const y = HZ + 4 + i * 7, w = (26 - i * 1.6) * (0.6 + r() * .6); poly(c, [[sx - w, y], [sx + w, y], [sx + w * .8, y + 3], [sx - w * .8, y + 3]], 'rgba(255,250,230,.7)'); }
    HK.insects(c, t, 6, [40, HZ + 30, 380, 70]);
  }
  function shoreA(c) {
    poly(c, [[-400, SHORE + 8], [0, SHORE + 6], [120, SHORE + 2], [260, SHORE + 4], [400, SHORE - 2], [880, SHORE - 6], [880, 600], [-400, 600]], '#cdb98a');
    SHARDS.forEach(([x, y, s, k]) => poly(c, [[x, y], [x + s, y + 4], [x + s * .4, y + s * .5]], k ? '#c2ad7e' : '#d6c497'));
    for (let i = 0; i < 6; i++) { const x = 6 + i * 5; poly(c, [[x, 340], [x + 2, 340], [x + 4 + (i % 2) * 3, 284 + i * 5], [x + 3, 284 + i * 5]], '#7d8f5f'); }
    for (let i = 0; i < 5; i++) { const x = 440 + i * 6; poly(c, [[x, 345], [x + 2, 345], [x - 3 + (i % 2) * 4, 300 + i * 4], [x - 2, 300 + i * 4]], '#7d8f5f'); }
  }
  HK.fishBackSeat = (c, t, o = {}) => {
    const x = FISH, turn = o.turn || 0, ny = o.nod ? Math.sin(clamp(o.nod, 0, 1) * Math.PI) * 3 : 0;
    poly(c, [[x - 34, 268], [x - 28, 250], [x - 8, 244], [x + 8, 244], [x + 28, 250], [x + 34, 268]], '#5c7186');
    poly(c, [[x, 244], [x + 8, 244], [x + 28, 250], [x + 34, 268], [x, 268]], '#52667a');
    if (o.arms === 'cast') { const k = o.castK || 0; limb(c, [x + 24, 250], [x + 30, 238 - k * 10], 9, 8, '#52667a'); limb(c, [x + 30, 238 - k * 10], [x + 20, 226 - k * 6], 7, 6, '#b88a66'); }
    poly(c, [[x - 6, 236], [x + 6, 236], [x + 6, 248], [x - 6, 248]], '#a3774f');
    const hx = x + turn * 2, hy = 230 + ny;
    if (Math.abs(turn) > .05) { poly(c, ngon(hx + turn * 6.5, hy + 1, 7, 11, 8), '#b88a66'); poly(c, [[hx + turn * 6, hy + 5], [hx + turn * 13, hy + 6], [hx + turn * 12, hy + 8], [hx + turn * 6, hy + 8]], '#6d6862'); }
    poly(c, ngon(hx - turn * 1.5, hy, 12.5, 13, 8, Math.PI / 8), '#b88a66'); poly(c, [[hx - 12, hy + 2], [hx + 12, hy + 2], [hx + 9, hy + 11], [hx - 9, hy + 11]], '#9a958c');
    poly(c, [[hx - 13, hy - 4], [hx - 10, hy - 14], [hx, hy - 17], [hx + 10, hy - 14], [hx + 13, hy - 4]], '#b9a27c'); poly(c, [[hx, hy - 17], [hx + 10, hy - 14], [hx + 13, hy - 4], [hx, hy - 4]], '#a58f6b');
    if (Math.abs(turn) > .05) poly(c, [[hx + turn * 8, hy - 6], [hx + turn * 24, hy - 3], [hx + turn * 23, hy - 1], [hx + turn * 8, hy - 3]], '#a08a66');
    if (o.earCig) poly(c, [[hx + 11, hy - 3], [hx + 16, hy - 6], [hx + 17, hy - 5], [hx + 12, hy - 1]], '#f4f1e8');
    if (o.smoke) HK.smoke(c, hx + 12 + turn * 6, hy - 4, t);
  };
  HK.senBackSeat = (c, t, o = {}) => {
    const x = SEN, turn = o.turn || 0, doze = o.doze || 0, arms = o.arms || 'none', k = o.armK == null ? 1 : o.armK;
    const sh = [[x - 21, 252], [x + 21, 252]];
    const armTo = (side, el, ha) => { limb(c, sh[side], el, 7, 6, '#ece7dc'); limb(c, el, ha, 5, 4.2, '#c29372'); poly(c, ngon(ha[0], ha[1], 3, 3, 6), '#c29372'); };
    if (arms === 'open') { const a = k; armTo(0, [x - 32 - a * 6, 246 - a * 14], [x - 44 - a * 10, 236 - a * 26]); armTo(1, [x + 32 + a * 6, 246 - a * 14], [x + 44 + a * 10, 236 - a * 26]); }
    if (arms === 'stretch') { armTo(0, [x - 20, 230 - k * 6], [x - 12, 210 - k * 10]); armTo(1, [x + 20, 230 - k * 6], [x + 12, 210 - k * 10]); }
    poly(c, [[x - 27, 268], [x - 22, 252], [x - 6, 247], [x + 6, 247], [x + 22, 252], [x + 27, 268]], '#f2eee4'); poly(c, [[x, 247], [x + 6, 247], [x + 22, 252], [x + 27, 268], [x, 268]], '#dcd6c8');
    if (arms === 'reach') { const tx = lerp(x - 30, FISH + 16, k), ty = lerp(248, 232, k); limb(c, sh[0], [lerp(x - 30, x - 52, k), lerp(256, 240, k)], 7, 6, '#ece7dc'); limb(c, [lerp(x - 30, x - 52, k), lerp(256, 240, k)], [tx, ty], 5, 4.2, '#c29372'); poly(c, ngon(tx, ty, 3, 3, 6), '#c29372'); }
    poly(c, [[x - 5, 240], [x + 5, 240], [x + 5, 250], [x - 5, 250]], '#a97c5d');
    c.save(); c.translate(x, 248); c.rotate(doze * -0.32); c.translate(-x, -248);
    const hx = x + turn * 2;
    if (Math.abs(turn) > .05) { poly(c, ngon(hx + turn * 6, 237, 6.5, 10, 8), '#c29372'); c.strokeStyle = '#d6b14a'; c.lineWidth = .8; c.beginPath(); c.arc(hx + turn * 9, 243, 1.6, 0, Math.PI * 2); c.stroke(); }
    const bx = hx - turn * 1.5;
    poly(c, [[bx - 12, 232], [bx + 12, 232], [bx + 15, 262], [bx + 3, 265], [bx - 3, 265], [bx - 15, 262]], '#1e1c1b');
    poly(c, ngon(bx, 236, 12, 12.5, 8, Math.PI / 8), '#1e1c1b'); poly(c, [[bx - 3, 236], [bx + 2, 236], [bx + 1, 262], [bx - 4, 262]], '#2e2b29');
    c.restore();
    if (arms === 'cig') { poly(c, ngon(x + 12, 240, 3, 3, 6), '#c29372'); HK.smoke(c, x + 14, 236, t); }
    if (o.talk) { c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.2; const p = (t % 1.5) / 1.5; c.beginPath(); c.arc(x + 20, 228, 4 + p * 4, -0.8, 0.8); c.stroke(); }
    if (doze > .6) { c.fillStyle = 'rgba(52,70,94,.7)'; c.font = '700 9px "M PLUS Rounded 1c", sans-serif'; const p = (t % 2) / 2; c.globalAlpha = 1 - p; c.fillText('z', x + 16, 220 - p * 12); c.globalAlpha = 1; }
  };

  // rod in its holder, line to the bobber. r: {line, bob, bite, cast:{p,from,to}, bell, held}
  HK.rodA = (c, t, r = {}) => {
    let tip = L.TIP0.slice(), bob = (r.bob || L.BOB).slice(), under = false;
    const R0 = L.ROD0;
    if (r.held) { // held over his shoulder while casting: k 0 forward → 1 cocked back
      const k = r.held.k;
      const base = [FISH + 18, 262], ang = lerp(-2.05, -0.55, k), len = 150;
      tip = [base[0] + Math.cos(ang) * len, base[1] + Math.sin(ang) * len];
      poly(c, [[base[0] - 1.5, base[1]], [base[0] + 1.5, base[1]], [tip[0] + .7, tip[1]], [tip[0] - .7, tip[1]]], '#2a2a2a');
      if (r.held.fly != null) {
        const p = r.held.fly, to = r.held.to;
        bob = [lerp(tip[0], to[0], p), lerp(tip[1], to[1], p) - Math.sin(p * Math.PI) * 70];
        line(c, [tip, bob], 'rgba(255,255,255,.7)');
        poly(c, ngon(bob[0], bob[1], 3.5, 3.5, 6), '#e5672a');
      } else { line(c, [tip, [tip[0] + 2, tip[1] + 18]], 'rgba(255,255,255,.7)'); poly(c, ngon(tip[0] + 2, tip[1] + 20, 2.5, 2.5, 6), '#c9c2b0'); }
      return;
    }
    if (r.bite) { const k = Math.min(1, r.bite * 3); tip = [tip[0] - 6 * k, tip[1] + (16 + Math.sin(t * 22) * 4) * k]; under = Math.sin(t * 9) > -0.2; }
    poly(c, [[R0[0] - 1, R0[1] + 16], [R0[0] + 2, R0[1] + 16], [R0[0] + 3, R0[1] - 6], [R0[0], R0[1] - 6]], '#2a2a2a');
    poly(c, [[R0[0] - 1, R0[1]], [R0[0] + 1.5, R0[1]], [tip[0] + .8, tip[1]], [tip[0] - .8, tip[1]]], '#2a2a2a');
    if (r.bell) { const jig = r.bite ? Math.sin(t * 30) * 2 : 0; poly(c, ngon(tip[0] + jig, tip[1] + 4, 2.6, 2.6, 6), '#d6b14a'); }
    if (!r.line) return;
    const by = bob[1] + (r.bite ? 0 : Math.round(Math.sin(t * 1.6) * 1.5));
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(tip[0], tip[1]); c.quadraticCurveTo((tip[0] + bob[0]) / 2, Math.max(tip[1], by) + 6, bob[0], by - 4); c.stroke();
    const rip = r.bite ? 3 : 1;
    for (let k = 0; k < rip; k++) { const p = ((t * (r.bite ? 1.2 : .35)) + k / rip) % 1; c.strokeStyle = `rgba(255,255,255,${.6 * (1 - p)})`; c.lineWidth = 1.5; c.beginPath(); ngon(bob[0], bob[1] + 3, 6 + p * 34, 1.6 + p * 6, 10).forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.stroke(); }
    if (!under) { poly(c, ngon(bob[0], by - 1, 4, 4, 6), '#e5672a'); poly(c, ngon(bob[0], by + 2, 4, 2.4, 6), '#f4f1e8'); }
  };

  // threads pulled from the sky and the cocoon they weave
  HK.COCOON = [250, 96];
  HK.drawThreads = (c, t, T) => {
    const cc = HK.COCOON; c.save(); c.lineCap = 'round';
    T.threads.forEach(th => {
      const k = clamp(th.age / 2.2, 0, 1);
      c.strokeStyle = `rgba(255,255,255,${.75 * (1 - k * .6)})`; c.lineWidth = 1; c.beginPath();
      th.pts.forEach(([x, y], i) => { const nx = x + (cc[0] - x) * k + Math.sin(t * 2 + i) * .6, ny = y + (cc[1] - y) * k; i ? c.lineTo(nx, ny) : c.moveTo(nx, ny); });
      c.stroke();
    });
    if (T.drawing) { c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.2; c.beginPath(); T.drawing.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); }
    if (T.woven > 0) {
      const n = Math.min(T.woven, 7), rx = 4 + n * 1.6, ry = 7 + n * 2.6, sway = Math.sin(t * .9) * 1.5;
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cc[0], -200); c.lineTo(cc[0] + sway, cc[1] - ry); c.stroke();
      poly(c, ngon(cc[0] + sway, cc[1], rx + 6, ry + 6, 10), `rgba(255,250,228,${T.woven >= 6 ? .3 + Math.sin(t * 2.4) * .1 : .12})`);
      poly(c, ngon(cc[0] + sway, cc[1], rx, ry, 10, Math.PI / 10), 'rgba(255,253,244,.88)');
      c.strokeStyle = 'rgba(180,190,200,.6)'; for (let i = 0; i < n; i++) { c.beginPath(); c.ellipse(cc[0] + sway, cc[1] - ry + (i + 1) * (ry * 2 / (n + 1)), rx * .9, 1.2, 0, 0, Math.PI * 2); c.stroke(); }
    }
    c.restore();
  };

  /** Full A frame. o: {sun, fish:'seat'|'none', fishO, sen:'seat'|'none', senO, rod, sky(c) overlay, after(c) for standing figures, insects} */
  HK.lakeA = (c, t, o = {}) => {
    const sun = o.sun || 0, sy = HZ - 2 - sun * 40;
    HK.skyBands(c, sun); HK.sun(c, 360, sy); HK.hills(c);
    waterA(c, t, sun);
    if (o.sky) o.sky(c);
    if (o.wave) { const k = o.wave; for (let i = 0; i < 4; i++) { const y = SHORE - 6 - i * 9 + k * 10, a = (1 - k) * .7; line(c, [[SEN - 70 + i * 8, y], [SEN + 70 - i * 8, y]], `rgba(255,255,255,${a})`, 1.5); } }
    shoreA(c);
    if (o.under) o.under(c);
    HK.chairBack(c, FISH); if (o.fish === 'seat') HK.fishBackSeat(c, t, o.fishO || {});
    HK.chairBack(c, SEN); if (o.sen === 'seat') HK.senBackSeat(c, t, o.senO || {});
    if (o.rod !== false) HK.rodA(c, t, o.rod || {});
    if (o.after) o.after(c);
    HK.fogBand(c, HZ);
  };

  // ---------- S: from the waterline, looking south at the bank ----------
  const BUSH = (() => { const r = rng(21), a = []; for (let i = 0; i < 16; i++) a.push([-60 + r() * 600, 176 + r() * 40, 10 + r() * 16]); return a.sort((p, q) => p[1] - q[1]); })();
  HK.shoreS = (c, t, o = {}) => {
    HK.skyBands(c, .4, '#9cc6da', 160);
    poly(c, ngon(-10, 120, 60, 60, 12), 'rgba(255,247,220,.35)');
    const r = rng(33); const ridge = []; for (let x = -60; x <= 560; x += 40) ridge.push([x, 132 - r() * 22]);
    for (let i = 0; i < ridge.length - 1; i++) { const [x0, y0] = ridge[i], [x1, y1] = ridge[i + 1]; poly(c, [[x0, y0], [x1, y1], [x1, 172], [x0, 172]], mix(i % 2 ? '#8aa07c' : '#7d9572', FOG, .45)); }
    poly(c, [[-60, 168], [560, 162], [560, 240], [-60, 240]], '#b9ad7a');
    for (let i = 0; i < 14; i++) { const x = -40 + i * 42; poly(c, [[x, 166 + (i % 3) * 3], [x + 42, 164 + ((i + 1) % 3) * 3], [x + 30, 238]], i % 2 ? '#c2b583' : '#ab9f6c'); }
    [[70, 166, 1], [404, 160, 1.2]].forEach(([x, y, s]) => {
      poly(c, [[x - 2 * s, y], [x + 2 * s, y], [x + 1.5 * s, y - 34 * s], [x - 1.5 * s, y - 34 * s]], '#5d4d3a');
      poly(c, ngon(x, y - 44 * s, 22 * s, 18 * s, 7), '#6f8558'); poly(c, ngon(x + 6 * s, y - 50 * s, 15 * s, 13 * s, 6), '#7f9766'); poly(c, ngon(x - 9 * s, y - 38 * s, 12 * s, 10 * s, 6), '#5f7650');
    });
    BUSH.forEach(([x, y, s]) => { poly(c, ngon(x, y, s, s * .6, 6), '#7a8a56'); poly(c, ngon(x + s * .3, y - s * .25, s * .6, s * .4, 5), '#8d9c64'); });
    poly(c, [[-60, 232], [560, 226], [560, 420], [-60, 420]], '#cdb98a');
    SHARDS.forEach(([x, y, s, k]) => poly(c, [[x, y - 10], [x + s, y - 6], [x + s * .4, y - 10 + s * .5]], k ? '#c2ad7e' : '#d6c497'));
    HK.insects(c, t, 5, [20, 150, 440, 80]);
  };

  // ---------- W: from his end, looking east along the shore ----------
  HK.W_CHAIRS = { fish: [236, 214, .5], sen: [276, 194, .38] };
  HK.lakeW = (c, t, o = {}) => {
    HK.skyBands(c, .3, '#93c0d5', 152);
    HK.sun(c, 330, 138, 20);
    HK.hills(c, 2, '#9aa8a0');
    for (let i = 0; i < 8; i++) { const y0 = 152 + i * 26; c.fillStyle = mix(FOG, '#6e979b', Math.min(1, .25 + i / 7 * .8)); c.fillRect(-400, y0, 1300, 27); }
    const r = rng(Math.floor(t * 3));
    for (let i = 0; i < 10; i++) { const y = 156 + i * 6, w = (18 - i * 1.4) * (0.6 + r() * .6), x = 320 - i * 9; poly(c, [[x - w, y], [x + w, y], [x + w * .8, y + 2.5], [x - w * .8, y + 2.5]], 'rgba(255,250,230,.65)'); }
    poly(c, [[318, 152], [900, 150], [900, 600], [40, 600]], '#cdb98a');
    const sr = rng(7); for (let i = 0; i < 24; i++) { const k = sr(), y = 156 + k * k * 220, x = 330 - (y - 152) * 1.2 + 20 + sr() * (500 - (330 - (y - 152) * 1.2)), s = 4 + k * 26; poly(c, [[x, y], [x + s, y + s * .15], [x + s * .4, y + s * .3]], i % 2 ? '#c2ad7e' : '#d6c497'); }
    line(c, [[318, 152], [40, 600]], 'rgba(255,255,255,.55)', 1.5);
    for (let i = 0; i < 9; i++) { const x = 360 + i * 14, s = 6 + i; poly(c, ngon(x, 154 + i * .5, s, s * .45, 6), '#8d9c64'); }
    if (o.under) o.under(c);
    const F = HK.W_CHAIRS.fish, Sn = HK.W_CHAIRS.sen;
    // his rod, from beside his chair out over the water
    line(c, [[F[0] - 8, F[1] - 6], [F[0] - 70, F[1] - 52]], '#2a2a2a', 1.2);
    line(c, [[F[0] - 70, F[1] - 52], [F[0] - 120, F[1] + 10]], 'rgba(255,255,255,.5)', .6);
    HK.chairSide(c, Sn[0], Sn[1], Sn[2], true);
    if (o.sen !== 'none') HK.fig(c, 'sen', HK.POSE.senSeatSide(t), { x: Sn[0], y: Sn[1], s: Sn[2], view: 'side', flip: true, mouth: o.senTalk ? Math.abs(Math.sin(t * 7)) : 0, eyes: o.senEyes || 'open', shadow: false });
    HK.chairSide(c, F[0], F[1], F[2], true);
    if (o.after) o.after(c);
    HK.fogBand(c, 152, .45);
  };
})();
