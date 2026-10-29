/* HOOKED — every place that isn't the lake, plus the close-ups. */
(function () {
  const { poly, ngon, mix, rng, clamp, lerp, line, limb, rect, FOG, rgba } = HK;

  // offscreen layer for focus pulls: draw fn into a scratch canvas, then composite blurred
  let tmp = null;
  HK.layer = (c, blur, fn) => {
    if (!blur || blur < .2) return fn(c);
    if (!tmp) tmp = document.createElement('canvas');
    if (tmp.width !== c.canvas.width || tmp.height !== c.canvas.height) { tmp.width = c.canvas.width; tmp.height = c.canvas.height; }
    const g = tmp.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, tmp.width, tmp.height);
    g.setTransform(c.getTransform()); fn(g);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = `blur(${(blur * (HK.K || 2)).toFixed(1)}px)`; c.drawImage(tmp, 0, 0); c.filter = 'none'; c.restore();
  };

  // ---------------- bedroom ----------------
  const ROOM = {
    morning: { back: '#e6d39c', left: '#d2bd84', right: '#dbc78f', floor: '#b9a585', ceil: '#efe0b0', win: '#fff7dc', sheet: '#f4f1e8', sheetD: '#d9d1bd', wood: '#9a7650', ink: 0 },
    afternoon: { back: '#eeebe2', left: '#dedad0', right: '#e6e2d8', floor: '#cfc8b8', ceil: '#f6f4ee', win: '#ffffff', sheet: '#fbfaf6', sheetD: '#e2ddd0', wood: '#b49a78', ink: 0 },
    midnight: { back: '#3a4660', left: '#2f3a52', right: '#344059', floor: '#2a3246', ceil: '#323d55', win: '#9fb4d6', sheet: '#6f7f9c', sheetD: '#56647f', wood: '#3d3a42', ink: 1 },
  };
  HK.bedroom = (c, t, o = {}) => {
    const P = ROOM[o.light || 'morning'];
    poly(c, [[0, 0], [480, 0], [420, 40], [60, 40]], P.ceil);
    rect(c, 60, 40, 360, 212, P.back);
    poly(c, [[0, 0], [60, 40], [60, 252], [0, 302]], P.left);
    poly(c, [[480, 0], [420, 40], [420, 252], [480, 302]], P.right);
    poly(c, [[0, 302], [60, 252], [420, 252], [480, 302], [480, 360], [0, 360]], P.floor);
    // window on the right wall, blinds
    poly(c, [[430, 70], [468, 46], [468, 176], [430, 184]], P.win);
    for (let i = 0; i < 10; i++) { const k = i / 10; line(c, [[430, 74 + k * 108], [468, 52 + k * 120]], rgba(P.ink ? '#1d2440' : '#a08a5a', .45), 1.4); }
    // light falling across the bed and floor
    c.save(); c.globalAlpha = o.light === 'midnight' ? .18 : .22;
    poly(c, [[430, 70], [430, 184], [250, 330], [120, 300]], P.win);
    c.restore();
    // door on the left wall, with the hole
    poly(c, [[12, 106], [46, 118], [46, 262], [12, 286]], mix(P.left, '#ffffff', .12));
    poly(c, ngon(40, 194, 1.8, 2.2, 6), mix(P.wood, '#ffffff', .2));
    poly(c, ngon(28, 176, 4.4, 5.4, 7), mix(P.left, '#1d2124', .45));
    // photos above the bed
    [[132, 104, -.06], [170, 98, .05], [208, 108, -.03]].forEach(([x, y, a], i) => {
      c.save(); c.translate(x, y); c.rotate(a);
      rect(c, -13, -13, 26, 30, mix('#ffffff', P.back, .1)); rect(c, -11, -11, 22, 20, ['#9cc3d6', '#e6b98a', '#a9c08a'][i]);
      poly(c, ngon(-3, 2, 3, 3, 6), '#5c4a3a'); poly(c, ngon(5, 3, 2.4, 2.4, 6), '#5c4a3a');
      c.restore();
    });
    // nightstand, lamp, book
    poly(c, [[316, 214], [364, 214], [364, 266], [316, 266]], P.wood); poly(c, [[316, 214], [364, 214], [370, 208], [322, 208]], mix(P.wood, '#ffffff', .18));
    poly(c, [[336, 206], [346, 206], [344, 180], [338, 180]], mix(P.wood, '#1d2124', .3)); poly(c, [[326, 182], [356, 182], [350, 164], [332, 164]], o.light === 'midnight' ? '#e8d6a0' : '#f4ead0');
    if (o.light === 'midnight') { c.save(); c.globalAlpha = .12; poly(c, ngon(340, 190, 80, 50, 12), '#ffe8b0'); c.restore(); }
    if (o.book !== false) { poly(c, [[324, 207], [348, 205], [350, 210], [326, 212]], '#efe6cc'); poly(c, [[324, 207], [348, 205], [348, 207], [324, 209]], '#c2551f'); }
    else poly(c, [[300, 300], [326, 296], [330, 304], [304, 308]], '#efe6cc');
    // bed: headboard against the back wall, foot toward camera
    poly(c, [[96, 172], [312, 172], [312, 250], [96, 250]], P.wood); poly(c, [[96, 172], [312, 172], [312, 178], [96, 178]], mix(P.wood, '#ffffff', .2));
    poly(c, [[92, 236], [316, 236], [350, 306], [58, 306]], P.sheet);
    poly(c, [[58, 306], [350, 306], [350, 324], [58, 324]], P.sheetD);
    if (!o.made) { poly(c, ngon(150, 238, 34, 9, 8), mix(P.sheet, '#ffffff', .4)); poly(c, ngon(250, 238, 34, 9, 8), mix(P.sheet, '#ffffff', .4)); }
    if (o.lump) {
      const b = o.lump.breath || 0, z = o.lump.buzz || 0, jx = z ? (Math.random() - .5) * z * 2.4 : 0, jy = z ? (Math.random() - .5) * z * 1.6 : 0;
      poly(c, ngon(196 + jx * .3, 232, 13, 9, 8), '#1e1c1b'); poly(c, [[180, 228], [212, 226], [214, 236], [178, 238]], '#2e2b29');
      const top = 238 - b * 5;
      poly(c, [[150 + jx, 252], [178 + jx, top - 4 + jy], [228 + jx, top - 2 + jy], [268, top + 10], [300, 290], [96, 290]], mix(P.sheet, P.sheetD, .45));
      poly(c, [[178 + jx, top - 4 + jy], [228 + jx, top - 2 + jy], [222 + jx, top + 8], [184 + jx, top + 8]], mix(P.sheet, '#ffffff', .25));
      poly(c, [[268, top + 10], [300, 290], [282, 292], [258, top + 20]], P.sheetD);
    }
    if (o.light === 'midnight') HK.vignette(c, .45, '#0e1220');
    if (o.after) o.after(c);
  };

  // close-up: the foot of the bed, toes curling
  HK.toes = (c, t, k = 0) => {
    HK.bands(c, 0, 0, 480, 360, '#e6d39c', '#d6c08a', 6);
    poly(c, [[-20, 120], [500, 96], [500, 400], [-20, 400]], '#efe9da');
    for (let i = 0; i < 6; i++) { const x = -10 + i * 90; poly(c, [[x, 110 - i * 4], [x + 70, 104 - i * 4], [x + 50, 400], [x - 20, 400]], i % 2 ? '#e6dfcc' : '#f4f0e4'); }
    [[176, 1], [304, -1]].forEach(([fx, side], f) => {
      c.save(); c.translate(fx, 214); c.rotate(side * .06);
      poly(c, ngon(0, 30, 44, 70, 10), '#b98a6c');
      poly(c, ngon(0, 34, 36, 62, 10), '#d9ab8d');
      poly(c, ngon(-side * 6, 70, 22, 22, 8), '#e4b99c');
      const toes = [[-28, 13], [-12, 11], [3, 10], [17, 9], [29, 8]].map(([x, r]) => [x * side, r]);
      toes.forEach(([x, r], i) => {
        const ck = clamp(k * (1.1 - i * .08) + Math.sin(t * 2 + i) * .04, 0, 1), y = -30 - (i === 0 || i === 4 ? 0 : 6) + ck * 16;
        poly(c, ngon(x, y, r * .62, r * (.9 - ck * .35), 8), mix('#c99a7c', '#a87a5c', ck));
        poly(c, ngon(x, y - r * .3 + ck * 4, r * .4, r * (.35 - ck * .15), 6), '#e8c1a5');
      });
      c.restore();
    });
    poly(c, [[-20, 290], [120, 276], [250, 296], [380, 278], [500, 288], [500, 400], [-20, 400]], '#f7f4ec');
    poly(c, [[-20, 290], [120, 276], [250, 296], [380, 278], [500, 288], [500, 298], [380, 290], [250, 308], [120, 288], [-20, 302]], '#ffffff');
  };

  // abstract curves under the sheets
  HK.curves = (c, t) => {
    HK.bands(c, 0, 0, 480, 360, '#efe0b0', '#d9c48c', 5);
    for (let i = 0; i < 7; i++) {
      const y = 40 + i * 50, a = Math.sin(t * .4 + i) * 12;
      poly(c, [[-20, y + a], [120, y - 30 + a], [260, y + 10 - a], [400, y - 24 + a], [500, y], [500, y + 70], [-20, y + 70]], mix('#f7f2e4', '#d8cdb4', i / 6));
    }
    c.save(); c.globalAlpha = .9;
    poly(c, [[300, 360], [330, 250], [380, 196], [440, 182], [500, 190], [500, 360]], '#c9987a');
    poly(c, [[330, 250], [380, 196], [440, 182], [420, 200], [372, 220]], '#d9ab8d');
    c.restore();
    poly(c, [[180, 360], [260, 270], [360, 240], [420, 300], [400, 360]], '#efe9da');
  };

  HK.photos = (c, t) => {
    HK.bands(c, 0, 0, 480, 360, '#e9d7a2', '#dcc68e', 4);
    const shots = [
      [96, 150, -.08, (g) => { HK.bands(g, -46, -46, 92, 74, '#9cc3d6', '#e9e2c8', 4); rect(g, -46, 10, 92, 18, '#a7b36a'); [[-22, 6], [14, 8]].forEach(([x, y]) => { g.strokeStyle = '#2a2a2a'; g.lineWidth = 1.4; g.beginPath(); g.arc(x - 6, y, 6, 0, 7); g.stroke(); g.beginPath(); g.arc(x + 8, y, 6, 0, 7); g.stroke(); poly(g, ngon(x, y - 16, 4, 4, 6), '#6b4a36'); limb(g, [x, y - 12], [x + 2, y - 2], 4, 4, ['#e5672a', '#5c7186'][x > 0 ? 1 : 0]); }); }],
      [240, 140, .05, (g) => { HK.bands(g, -46, -46, 92, 74, '#a9cfe0', '#efe6cc', 4); rect(g, -46, -2, 92, 30, '#6e979b'); rect(g, -46, 16, 92, 12, '#cdb98a'); poly(g, [[-10, 16], [-6, 16], [-7, -18], [-9, -18]], '#3e4e62'); poly(g, ngon(-8, -22, 4, 4, 6), '#b88a66'); poly(g, [[4, 16], [8, 16], [8, 2], [4, 2]], '#e5672a'); poly(g, ngon(6, -2, 3, 3, 6), '#6b4a36'); line(g, [[-6, -10], [30, -26], [34, 6]], '#2a2a2a', .8); }],
      [384, 156, -.04, (g) => { HK.bands(g, -46, -46, 92, 74, '#c8d9e0', '#efe6cc', 4); poly(g, [[-30, 20], [-30, -10], [0, -32], [30, -10], [30, 20]], '#e8dcc0'); poly(g, [[-36, -8], [0, -36], [36, -8], [32, -4], [0, -30], [-32, -4]], '#8a5a3a'); rect(g, -20, -4, 14, 12, '#ffd774'); rect(g, 6, 2, 10, 18, '#8a5a3a'); rect(g, -46, 20, 92, 8, '#a7b36a'); }],
    ];
    shots.forEach(([x, y, a, fn]) => {
      c.save(); c.translate(x, y); c.rotate(a + Math.sin(t * .3 + x) * .005);
      poly(c, [[-56, -56], [56, -56], [58, 52], [-54, 54]], 'rgba(60,50,30,.18)');
      rect(c, -54, -54, 108, 108, '#fbf8ef'); c.save(); c.beginPath(); c.rect(-46, -46, 92, 74); c.clip(); fn(c); c.restore();
      poly(c, ngon(0, -50, 3, 3, 6), '#c2551f');
      c.restore();
    });
  };

  HK.bookFall = (c, t, k = 0) => {
    HK.bands(c, 0, 0, 480, 360, '#e6d39c', '#cdb98a', 5);
    poly(c, [[-20, 220], [500, 200], [500, 236], [-20, 260]], '#9a7650'); poly(c, [[-20, 260], [500, 236], [500, 400], [-20, 400]], '#86653f');
    poly(c, [[-20, 214], [500, 194], [500, 200], [-20, 220]], '#b39068');
    poly(c, [[60, 214], [130, 210], [126, 120], [64, 124]], '#efe2c0');
    const e = HK.ease(k), slide = clamp(e * 1.6, 0, 1), fall = clamp((e - .55) / .45, 0, 1);
    c.save(); c.translate(260 + slide * 120 + fall * 40, 196 + fall * fall * 260); c.rotate(fall * 1.4);
    poly(c, [[-70, -14], [70, -18], [74, 4], [-66, 8]], '#efe6cc'); poly(c, [[-70, -14], [70, -18], [70, -12], [-70, -8]], '#c2551f');
    poly(c, [[-66, 8], [74, 4], [74, 12], [-66, 16]], '#f8f4ea');
    HK.text(c, '1Q84', -40, -4, 14, '#26384f', 'left', 800);
    c.restore();
  };

  // ---------------- town (midday heat) ----------------
  const heat = (c, t, y0, y1) => { const r = rng(Math.floor(t * 8)); c.save(); c.globalAlpha = .18; for (let i = 0; i < 5; i++) { const y = y0 + r() * (y1 - y0); rect(c, 0, y, 480, 1.5, '#ffffff'); } c.restore(); };
  HK.townSidewalk = (c, t) => {
    HK.bands(c, 0, 0, 480, 180, '#dfe3d8', '#f1ead2', 5);
    poly(c, [[0, 160], [480, 150], [480, 190], [0, 190]], '#b8b49a');
    for (let i = 0; i < 6; i++) { const x = 220 + i * 46; poly(c, [[x, 150], [x + 30, 150], [x + 30, 118 - i * 3], [x, 118 - i * 3]], mix('#d7cdb3', '#c2b8a0', i % 2)); }
    poly(c, [[0, 360], [0, 200], [300, 168], [330, 168]], '#a39d88');
    const slabs = 7; for (let i = 0; i < slabs; i++) {
      const a = i / slabs, b = (i + 1) / slabs, f = k => [lerp(40, 316, Math.pow(k, .55)), lerp(360, 168, Math.pow(k, .55))], g = k => [lerp(330, 340, Math.pow(k, .55)), lerp(360, 168, Math.pow(k, .55))];
      const p0 = f(a), p1 = f(b), q0 = [lerp(480, 344, Math.pow(a, .55)), p0[1]], q1 = [lerp(480, 344, Math.pow(b, .55)), p1[1]];
      const lift = i === 2 ? 9 : i === 4 ? -4 : 0;
      poly(c, [[p0[0], p0[1] - (i === 2 ? 0 : 0)], [q0[0], q0[1] - lift], [q1[0], q1[1] - lift * .3], [p1[0], p1[1]]], i % 2 ? '#d8d2c0' : '#cfc8b4');
      if (i === 2) poly(c, [[q0[0], q0[1] - lift], [q0[0], q0[1]], [p0[0] + 40, p0[1]]], '#9b947f');
      const cx = lerp(p0[0], q0[0], .5), cy = p0[1] - 2;
      for (let w = 0; w < 4; w++) poly(c, [[cx - 6 + w * 4, cy], [cx - 4 + w * 4, cy], [cx - 4 + w * 5 + Math.sin(t * 2 + w + i) * 2, cy - 10 - w * 3 - (1 - a) * 10]], '#7d8f5f');
    }
    poly(c, [[344, 168], [480, 168], [480, 360], [470, 360]], '#a7b36a');
    for (let i = 0; i < 18; i++) { const x = 360 + i * 7, h = 20 + (i % 4) * 8; poly(c, [[x, 360 - i * 9], [x + 3, 360 - i * 9], [x + 1 + Math.sin(t + i) * 2, 360 - i * 9 - h]], '#8d9c64'); }
    for (let i = 0; i < 6; i++) { const k = Math.pow(i / 6, .6), x = lerp(470, 350, k), y = lerp(330, 168, k), h = lerp(90, 14, k); line(c, [[x, y], [x, y - h]], '#8b8b84', lerp(3, .8, k)); }
    heat(c, t, 140, 190);
  };
  HK.townStreet = (c, t) => {
    HK.bands(c, 0, 0, 480, 190, '#dce3dc', '#f1ead2', 5);
    poly(c, [[0, 360], [0, 220], [240, 176], [480, 220], [480, 360]], '#a39d88');
    poly(c, [[160, 360], [238, 178], [242, 178], [320, 360]], '#97917c');
    for (let i = 0; i < 6; i++) { const y = 360 - i * 32, k = Math.pow(i / 6, .7); poly(c, [[240 - 3 * (1 - k), lerp(360, 180, k)], [240 + 3 * (1 - k), lerp(360, 180, k)], [240 + 2 * (1 - k), lerp(340, 180, k)], [240 - 2 * (1 - k), lerp(340, 180, k)]], '#e6dba8'); }
    const blocks = [[0, 100, 120, '#d5b48c'], [100, 160, 80, '#c9c0a6'], [160, 214, 44, '#b9b29a']];
    blocks.forEach(([x0, x1, h, col]) => { const f = x => 220 - (x / 240) * 44; poly(c, [[x0, f(x0)], [x1, f(x1)], [x1, f(x1) - h * (1 - x1 / 300)], [x0, f(x0) - h * (1 - x0 / 300)]], col); });
    [[480, 380, 110, '#c7b9a0'], [380, 300, 80, '#d6c6a6'], [300, 262, 44, '#bdb59c']].forEach(([x0, x1, h, col]) => { const f = x => 220 - ((480 - x) / 240) * 44; poly(c, [[x0, f(x0)], [x1, f(x1)], [x1, f(x1) - h * (1 - (480 - x1) / 300)], [x0, f(x0) - h * (1 - (480 - x0) / 300)]], col); });
    rect(c, 30, 140, 50, 10, '#9a7f5e'); HK.text(c, 'CLOSED', 55, 145, 7, '#f4f1e8', 'center', 800);
    [[60, 220], [150, 200], [330, 200], [420, 220]].forEach(([x, y], i) => { const h = 150 - i % 2 * 40 - (x > 100 && x < 380 ? 60 : 0); line(c, [[x, y], [x, y - h]], '#5d4d3a', x > 100 && x < 380 ? 1.4 : 3); line(c, [[x - 10, y - h + 6], [x + 10, y - h + 6]], '#5d4d3a', 1.4); });
    c.strokeStyle = 'rgba(60,60,60,.6)'; c.lineWidth = .8; c.beginPath(); c.moveTo(60, 76); c.quadraticCurveTo(105, 100, 150, 106); c.moveTo(330, 106); c.quadraticCurveTo(375, 100, 420, 76); c.stroke();
    poly(c, [[340, 250], [420, 246], [424, 266], [336, 270]], '#8a6f5a'); poly(c, [[352, 236], [404, 234], [414, 248], [344, 250]], '#a38a72'); poly(c, ngon(352, 268, 7, 7, 8), '#26282b'); poly(c, ngon(410, 266, 7, 7, 8), '#26282b');
    for (let i = 0; i < 10; i++) { const x = 20 + i * 12; poly(c, [[x, 300 - i * 6], [x + 3, 300 - i * 6], [x + 1 + Math.sin(t + i) * 1.5, 280 - i * 6 - (i % 3) * 6]], '#8d9c64'); }
    heat(c, t, 150, 200);
  };
  HK.townWeeds = (c, t) => {
    HK.bands(c, 0, 0, 480, 360, '#ece4cc', '#d8cfb6', 4);
    rect(c, 0, 0, 480, 230, '#d2c6a8'); rect(c, 40, 30, 260, 170, '#b9c4c4'); rect(c, 40, 30, 260, 8, '#9a8f76');
    for (let i = 0; i < 4; i++) poly(c, [[60 + i * 64, 40], [90 + i * 64, 40], [50 + i * 64, 196], [20 + i * 64, 196]], 'rgba(255,255,255,.25)');
    c.save(); c.translate(190, 110); c.rotate(-.04); rect(c, -42, -16, 84, 32, '#f4f1e8'); HK.text(c, 'CLOSED', 0, 0, 16, '#9a3b1f', 'center', 800); c.restore();
    line(c, [[170, 94], [190, 70], [210, 94]], '#7a6d58', 1);
    poly(c, [[0, 230], [480, 230], [480, 250], [0, 250]], '#bfb39a'); poly(c, [[0, 250], [480, 250], [480, 360], [0, 360]], '#a39d88');
    for (let i = 0; i < 9; i++) line(c, [[i * 60 + 10, 252], [i * 60 + 30, 300], [i * 60 + 24, 360]], '#8a846f', 1);
    const r = rng(5);
    for (let i = 0; i < 60; i++) { const x = r() * 480, h = 40 + r() * 120, w = 3 + r() * 4, sw = Math.sin(t * 1.3 + i) * 4; poly(c, [[x, 250], [x + w, 250], [x + w * .5 + sw, 250 - h]], i % 3 ? '#7d8f5f' : '#9aa86c'); }
    heat(c, t, 0, 230);
  };

  // ---------------- under the tree (scene 2, day) ----------------
  HK.TREE = { trunk: 170, ground: 262, sen: 192 };
  HK.tree = (c, t, o = {}) => {
    HK.bands(c, 0, 0, 480, 200, '#8ec3dc', '#f3ecd2', 7);
    [[300, 192, 20], [360, 190, 14], [420, 194, 18]].forEach(([x, y, h]) => { poly(c, [[x - 16, y], [x + 16, y], [x + 16, y - h], [x - 16, y - h]], '#d8c6a0'); poly(c, [[x - 20, y - h], [x, y - h - 10], [x + 20, y - h]], '#a86f54'); });
    poly(c, [[0, 200], [480, 194], [480, 360], [0, 360]], '#a9b46c');
    for (let i = 0; i < 8; i++) poly(c, [[0, 214 + i * 20], [480, 208 + i * 20], [480, 214 + i * 20], [0, 222 + i * 20]], i % 2 ? '#a1ad66' : '#b0ba74');
    poly(c, ngon(150, 266, 170, 26, 14), 'rgba(60,80,40,.28)');
    const T = HK.TREE;
    poly(c, [[T.trunk - 12, T.ground + 4], [T.trunk + 12, T.ground + 4], [T.trunk + 8, 90], [T.trunk - 8, 90]], '#6b553e'); poly(c, [[T.trunk, T.ground + 4], [T.trunk + 12, T.ground + 4], [T.trunk + 8, 90], [T.trunk, 90]], '#5b4734');
    limb(c, [T.trunk, 120], [T.trunk - 60, 70], 9, 5, '#5b4734'); limb(c, [T.trunk + 4, 110], [T.trunk + 70, 64], 8, 4, '#5b4734');
    // bike leaning on the far side of the trunk
    const wheel = (x, y, spin) => { c.strokeStyle = '#26282b'; c.lineWidth = 2.6; c.beginPath(); c.arc(x, y, 17, 0, 7); c.stroke(); for (let i = 0; i < 4; i++) { const a = spin + i * Math.PI / 4; line(c, [[x + Math.cos(a) * 16, y + Math.sin(a) * 16], [x - Math.cos(a) * 16, y - Math.sin(a) * 16]], 'rgba(60,60,60,.7)', .6); } };
    const sp = o.spin == null ? t * 6 : o.spin;
    wheel(98, 246, sp); wheel(150, 246, 0);
    line(c, [[98, 246], [118, 214], [150, 246], [126, 246], [98, 246]], '#c2551f', 2.4); line(c, [[118, 214], [140, 212], [150, 246]], '#c2551f', 2.4);
    line(c, [[140, 212], [146, 200], [156, 198]], '#26282b', 2); line(c, [[114, 210], [124, 210]], '#26282b', 2.6);
    if (o.under) o.under(c);
    // canopy
    const r = rng(12);
    for (let i = 0; i < 26; i++) { const x = 20 + r() * 320, y = -20 + r() * 120, s = 30 + r() * 40; poly(c, ngon(x, y, s, s * .7, 6 + (i % 3), r() * 3), ['#5f7650', '#6f8558', '#7f9766', '#56704a'][i % 4]); }
    if (o.after) o.after(c);
    // dappled light
    c.save(); c.globalAlpha = .12 + Math.sin(t * .7) * .03; for (let i = 0; i < 9; i++) poly(c, ngon(60 + i * 40 + Math.sin(t * .6 + i) * 4, 250 + (i % 3) * 14, 10, 4, 6), '#fff7dc'); c.restore();
  };
  // a medium/close on Sen under the tree = the tree set zoomed
  HK.grassBits = (c, bits) => bits.forEach(b => { c.save(); c.translate(b.x, b.y); c.rotate(b.a); poly(c, [[-1, 0], [1, 0], [0, -7]], '#7d8f5f'); c.restore(); });

  HK.bookFace = (c, t, page = 0, o = {}) => {
    HK.bands(c, 0, 0, 480, 360, '#7f9766', '#a9b46c', 5);
    const r = rng(2); for (let i = 0; i < 18; i++) poly(c, ngon(r() * 480, r() * 360, 30 + r() * 40, 20 + r() * 30, 6), rgba(['#5f7650', '#8fa06e'][i % 2], .5));
    poly(c, [[150, 330], [170, 90], [240, 62], [310, 90], [330, 330]], '#1e1c1b');
    poly(c, [[160, 360], [180, 300], [300, 300], [320, 360]], '#f2eee4');
    c.save(); c.translate(240, 196);
    poly(c, [[-82, -112], [82, -112], [86, 112], [-78, 114]], 'rgba(30,30,30,.25)');
    poly(c, [[-80, -110], [80, -110], [80, 110], [-80, 110]], '#ece6d6');
    poly(c, ngon(0, 8, 46, 58, 9, Math.PI / 9), '#d4b49a'); poly(c, ngon(0, -36, 52, 30, 9), '#2c2a29'); poly(c, [[-50, -30], [-40, 50], [-56, 20]], '#2c2a29'); poly(c, [[50, -30], [40, 50], [56, 20]], '#2c2a29');
    [[-17, 4], [17, 4]].forEach(([x, y]) => poly(c, [[x - 7, y], [x + 7, y - 1], [x + 7, y + 2], [x - 7, y + 3]], '#2a2a2a'));
    poly(c, [[-3, 10], [3, 10], [4, 26], [-4, 26]], '#c49f86'); poly(c, [[-11, 40], [11, 40], [8, 44], [-8, 44]], '#9a4e46');
    HK.text(c, '1Q84', 0, -88, 26, '#26384f', 'center', 800);
    HK.text(c, 'BOOK 1', 0, 92, 9, '#6b7f99', 'center', 700);
    if (o.flip) { const k = o.flip; c.save(); c.globalAlpha = .9; poly(c, [[80, -110], [80 - k * 150, -110 - Math.sin(k * Math.PI) * 14], [80 - k * 150, 110 - Math.sin(k * Math.PI) * 6], [80, 110]], '#fbf8ef'); c.restore(); }
    c.restore();
    poly(c, ngon(156, 210, 12, 15, 7), '#c29372'); poly(c, ngon(324, 214, 12, 15, 7), '#c29372');
  };

  HK.phoneClose = (c, t, o = {}) => {
    HK.bands(c, 0, 0, 480, 360, '#9aa86c', '#b0ba74', 5);
    const r = rng(8); for (let i = 0; i < 30; i++) poly(c, [[r() * 480, 360], [r() * 480 + 4, 360], [r() * 480, 200 + r() * 120]], rgba('#7d8f5f', .4));
    const shake = o.buzz ? Math.sin(t * 60) * 2.4 : 0;
    c.save(); c.translate(240 + shake, 188); c.rotate(-.06);
    poly(c, [[-54, -100], [54, -100], [54, 100], [-54, 100]], '#1b1e22'); poly(c, [[-48, -90], [48, -90], [48, 90], [-48, 90]], o.buzz ? '#3a4a5e' : '#2b3442');
    if (o.buzz) {
      HK.text(c, 'incoming call', 0, -54, 10, '#cfd8e2', 'center', 500);
      poly(c, ngon(0, -16, 18, 18, 10), '#6b7f99'); poly(c, ngon(0, -22, 7, 7, 8), '#cfd8e2'); poly(c, ngon(0, -6, 11, 6, 8), '#cfd8e2');
      poly(c, ngon(-24, 56, 12, 12, 10), '#c2551f'); poly(c, ngon(24, 56, 12, 12, 10), '#5c9a62');
      const p = (t % 1) ; c.strokeStyle = `rgba(207,216,226,${1 - p})`; c.lineWidth = 1.5; c.beginPath(); c.arc(0, -16, 18 + p * 16, 0, 7); c.stroke();
    } else { HK.text(c, o.label || 'on call', 0, -54, 10, '#cfd8e2', 'center', 500); HK.text(c, o.time || '12:04', 0, -30, 18, '#ffffff', 'center', 700); }
    c.restore();
    poly(c, [[150, 360], [178, 250], [210, 270], [196, 360]], '#c29372'); poly(c, ngon(186, 262, 16, 22, 7), '#c29372');
  };

  // ---------------- lake close-ups ----------------
  const lakeBlur = (c) => { HK.bands(c, 0, 0, 480, 150, '#a9c9d6', FOG, 4); HK.bands(c, 0, 150, 480, 210, '#a3bcb4', '#6e979b', 4); };
  HK.rig = (c, t, n = 0) => {
    lakeBlur(c);
    line(c, [[60, 360], [420, -20]], '#2a2a2a', 6);
    line(c, [[240, -10], [240, 360]], 'rgba(255,255,255,.9)', 1.2);
    const items = [[1, '#8b8f94', 'weight'], [2, '#c2551f', 'bead'], [3, '#d6b14a', 'swivel']];
    items.forEach(([k, col, kind]) => {
      const p = clamp(n - k + 1, 0, 1), y = lerp(-30, 130 + k * 34, HK.ease(p));
      if (p <= 0) return;
      if (kind === 'weight') poly(c, [[240, y - 14], [250, y + 6], [240, y + 10], [230, y + 6]], col);
      if (kind === 'bead') poly(c, ngon(240, y, 6, 6, 8), col);
      if (kind === 'swivel') { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.ellipse(240, y, 4, 8, 0, 0, 7); c.stroke(); }
    });
    poly(c, [[150, 360], [200, 230], [232, 240], [210, 360]], '#b88a66'); poly(c, ngon(222, 234, 16, 12, 7), '#b88a66');
    poly(c, [[330, 360], [270, 250], [250, 262], [290, 360]], '#a3774f'); poly(c, ngon(258, 254, 14, 11, 7), '#b88a66');
    limb(c, [150, 360], [190, 290], 40, 36, '#5c7186', false);
  };
  HK.bait = (c, t, n = 0, focus = 0) => {
    HK.layer(c, focus * 3, g => {
      lakeBlur(g);
      poly(g, ngon(110, 250, 66, 30, 12), '#c9c2b0'); poly(g, ngon(110, 244, 58, 24, 12), '#f2a54b');
      const r = rng(3); for (let i = 0; i < 26; i++) poly(g, ngon(70 + r() * 80, 232 + r() * 24, 5, 4, 6), i % 2 ? '#f7c65e' : '#ee8f3a');
      poly(g, [[330, 220], [460, 200], [470, 300], [340, 320]], '#d8d2c0'); for (let i = 0; i < 3; i++) limb(g, [360 + i * 26, 230], [380 + i * 26, 300], 9, 7, '#e58aa0');
    });
    line(c, [[240, -10], [240, 150]], 'rgba(255,255,255,.95)', 1.2);
    c.strokeStyle = '#8b8f94'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(240, 150); c.lineTo(240, 210); c.arc(226, 210, 14, 0, Math.PI, false); c.lineTo(212, 196); c.stroke();
    if (n >= 1) poly(c, ngon(240, 176, 8, 7, 7), '#f7c65e');
    if (n >= 2) poly(c, ngon(240, 192, 8, 7, 7), '#ee8f3a');
    if (n >= 3) { limb(c, [234, 204], [226, 226], 9, 8, '#e58aa0'); poly(c, ngon(226, 228, 5, 5, 6), '#e58aa0'); }
  };
  HK.hem = (c, t, k = 0, snapped = false) => {
    HK.bands(c, 0, 0, 480, 360, '#f4f0e6', '#e6e0d2', 4);
    for (let i = 0; i < 40; i++) line(c, [[0, i * 9], [480, i * 9 + 4]], 'rgba(120,110,90,.06)', 1);
    poly(c, [[0, 230], [480, 210], [480, 228], [0, 250]], '#d8d1c2');
    poly(c, [[0, 250], [480, 228], [480, 360], [0, 360]], '#6f8fb5');
    for (let i = 0; i < 12; i++) line(c, [[i * 44, 250 - i * 2], [i * 44 + 10, 360]], 'rgba(255,255,255,.12)', 1);
    const sx = 250, sy = 222;
    if (!snapped) {
      c.strokeStyle = '#b5ad9c'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(sx, sy);
      const turns = k * 4; for (let i = 0; i <= 40; i++) { const u = i / 40, a = u * turns * Math.PI * 2; c.lineTo(sx + 50 * u + Math.cos(a) * 6 * u, sy + 30 * u + Math.sin(a) * 6 * u); } c.stroke();
    } else { line(c, [[sx, sy], [sx + 8, sy + 6]], '#b5ad9c', 2.4); line(c, [[352, 300], [372, 318], [366, 330]], '#b5ad9c', 2.4); }
    c.save(); c.translate(306, 256 + (snapped ? 10 : 0)); c.rotate(.5 + k * 1.5);
    poly(c, [[-8, -22], [8, -22], [8, 30], [-8, 30]], '#c29372'); poly(c, ngon(0, -22, 8, 6, 7), '#d1a080');
    c.restore();
    poly(c, [[320, 360], [330, 270], [380, 260], [420, 360]], '#c29372');
  };
  HK.feverBall = (c, t, k = 0) => {
    HK.bands(c, 0, 0, 480, 360, '#b7a6c8', '#f0d6c6', 6);
    poly(c, [[-20, 40], [500, 290], [500, 400], [-20, 400]], '#9b8fb4'); for (let i = 0; i < 8; i++) poly(c, [[-20 + i * 70, 40 + i * 35], [50 + i * 70, 74 + i * 35], [10 + i * 70, 400]], i % 2 ? '#a89cc0' : '#8f84aa');
    const bx = 60 + k * 300, by = 30 + k * 150 - 60, rr = 80, a = k * 12;
    for (let i = 0; i < 10; i++) { const p = ngon(bx, by, rr, rr, 10, a); poly(c, [[bx, by], p[i], p[(i + 1) % 10]], i % 2 ? '#e8e0f0' : '#cfc4e0'); }
    const fx = 300 + k * 140 + 40, fy = fx * .48 + 26;
    HK.fig(c, 'sen', HK.POSE.senWalk(t * 14), { x: fx, y: fy + 30, s: .45, view: 'side', shadow: false });
  };
  HK.feverCode = (c, t) => {
    rect(c, 0, 0, 480, 360, '#0d1a14');
    const r = rng(Math.floor(t * 6));
    for (let x = 0; x < 480; x += 22) for (let y = 0; y < 300; y += 18) { const d = Math.abs(x - 240) / 240; rect(c, x + 1, y + 1, 20, 16, d > .3 ? '#132a1f' : '#0f2219'); if (r() > .45) HK.text(c, String(Math.floor(r() * 10)), x + 11, y + 9, 9, rgba('#64e08c', .4 + r() * .6), 'center', 700); }
    poly(c, [[0, 300], [480, 300], [480, 360], [0, 360]], '#081009');
    HK.fig(c, 'sen', HK.POSE.senStand(), { x: 240, y: 330, s: .4, view: 'back', shadow: false });
  };

  // close-up of Sen asleep with the fisherman over her shoulder. focus 0 = on her, 1 = on him
  HK.catnap = (c, t, o = {}) => {
    const focus = o.focus || 0, F = o.fishMode || 'wave';
    HK.layer(c, (1 - focus) * 2.6, g => {
      HK.shoreS(g, t);
      HK.fig(g, 'fish', HK.POSE.fishPhone(t, F), { x: 120, y: 270, s: 1.05, view: 'side', phone: 'R', flip: false, cig: F === 'smoke', earCig: true });
    });
    HK.layer(c, focus * 3, g => {
      HK.fig(g, 'sen', HK.POSE.senSeatFront('rest'), { x: 318, y: 560, s: 4.2, view: 'front', eyes: o.eyes || 'closed', tilt: -.16, shadow: false, mouth: o.mouth || 0 });
    });
  };

  // ---------------- street, evening ----------------
  HK.street = (c, t, o = {}) => {
    HK.bands(c, 0, 0, 480, 220, '#5d6c8c', '#d89f7e', 8);
    [[0, 120, 110], [110, 90, 100], [200, 130, 90], [300, 100, 110], [400, 120, 100]].forEach(([x, h, w], i) => {
      poly(c, [[x, 220], [x, 220 - h + 30], [x + w / 2, 220 - h], [x + w, 220 - h + 30], [x + w, 220]], i % 2 ? '#4b5670' : '#525d78');
      if (i !== 2) rect(c, x + 22, 220 - h + 50, 14, 12, o.lit === false ? '#3f4860' : '#f2d48a');
    });
    line(c, [[440, 230], [440, 110], [420, 104]], '#2f3546', 3); poly(c, ngon(418, 108, 6, 3, 6), '#ffe9b0');
    c.save(); c.globalAlpha = .15; poly(c, [[418, 108], [380, 300], [470, 300]], '#ffe9b0'); c.restore();
    poly(c, [[0, 220], [480, 220], [480, 252], [0, 252]], '#9d978b'); poly(c, [[0, 252], [480, 252], [480, 258], [0, 258]], '#b3ad9f');
    poly(c, [[0, 258], [480, 258], [480, 360], [0, 360]], '#585d66');
    for (let i = 0; i < 8; i++) line(c, [[i * 64, 222], [i * 64 - 6, 252]], 'rgba(60,60,60,.4)', 1);
    if (o.glow) { const g = c.createRadialGradient(o.glow[0], o.glow[1], 4, o.glow[0], o.glow[1], o.glow[2]); g.addColorStop(0, 'rgba(255,214,150,.55)'); g.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = g; c.fillRect(0, 0, 480, 360); }
  };
  HK.snake = (c, t, x, y, k) => {
    const n = Math.floor(k * 18);
    let px = x, py = y;
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + Math.sin(i * .6) * 1.1; px += Math.cos(a) * 3.2; py += Math.sin(a) * 3.2; poly(c, ngon(px, py, 3.6, 3.6, 6, i), i % 2 ? '#1d1d1d' : '#2a2826'); }
    if (k > 0 && k < 1) { poly(c, ngon(x, y + 2, 4, 2, 6), '#ffb45c'); HK.smoke(c, px, py - 4, t, .45, 10); }
  };
  HK.sparks = (c, t, x, y, n = 26, reach = 30) => {
    const r = rng(Math.floor(t * 18));
    for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, l = 6 + r() * reach; line(c, [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], `rgba(255,${200 + r() * 55 | 0},${120 + r() * 80 | 0},${.6 + r() * .4})`, 1); }
    poly(c, ngon(x, y, 4, 4, 8), '#fffbe6');
  };

  // ---------------- car, night ----------------
  HK.car = (c, t, o = {}) => {
    rect(c, 0, 0, 480, 360, '#151a22');
    for (let i = 0; i < 6; i++) poly(c, ngon(30 + i * 90, 120 + (i % 2) * 16, 2.4, 2.4, 6), 'rgba(255,220,160,.7)');
    poly(c, ngon(400, 110, 26, 16, 8), 'rgba(220,60,50,.35)'); poly(c, ngon(400, 110, 14, 9, 8), 'rgba(255,240,240,.5)');
    poly(c, [[0, 150], [480, 140], [480, 360], [0, 360]], '#0f1218');
    // the window frame we look through
    c.save(); c.fillStyle = '#20262e'; c.beginPath(); c.rect(0, 0, 480, 360); HK.rr(c, 40, 40, 400, 210, 30); c.fill('evenodd'); c.restore();
    poly(c, [[0, 250], [480, 250], [480, 360], [0, 360]], '#2a313b'); poly(c, [[0, 250], [480, 250], [480, 258], [0, 258]], '#3a434f');
    // seat
    poly(c, [[90, 250], [120, 110], [170, 110], [176, 250]], '#2c2f36');
    if (o.after) o.after(c);
    // phone glow
    const gl = .35 + Math.sin(t * 3) * .08 + (Math.sin(t * 11) > .7 ? .1 : 0);
    const g = c.createRadialGradient(300, 150, 4, 300, 150, 120); g.addColorStop(0, `rgba(230,170,230,${gl})`); g.addColorStop(1, 'rgba(230,170,230,0)'); c.fillStyle = g; c.fillRect(0, 0, 480, 360);
    poly(c, [[360, 190], [400, 186], [404, 212], [364, 216]], '#13161b');
    poly(c, [[294, 152], [318, 150], [320, 168], [296, 170]], '#1b1e22'); poly(c, [[296, 154], [316, 152], [318, 166], [298, 168]], Math.sin(t * 4) > 0 ? '#e8b2d8' : '#a8c8f0');
  };
  HK.burger = (c, x, y, bites, s = 1) => {
    c.save(); c.translate(x, y); c.scale(s, s);
    poly(c, [[-14, 4], [14, 4], [12, 10], [-12, 10]], '#c98a3c');
    poly(c, [[-15, 0], [15, 0], [15, 4], [-15, 4]], '#5a2e1c'); poly(c, [[-16, -2], [16, -2], [15, 1], [-15, 1]], '#f2c12e');
    poly(c, ngon(0, -6, 15, 7, 10, Math.PI), '#d9993f');
    c.fillStyle = '#151a22'; for (let i = 0; i < bites; i++) { c.beginPath(); c.arc(14 - i * 5, -4 + (i % 2) * 3, 6, 0, 7); c.fill(); }
    c.restore();
  };
})();
