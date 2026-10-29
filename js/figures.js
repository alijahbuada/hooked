/* HOOKED — low-poly figures for Sen and the fisherman.
   A figure is a set of joints in local units (feet at 0, up is negative y).
   Side view faces +x; pass flip:true to face left. */
(function () {
  const { poly, ngon, limb, along, mix, rgba, line } = HK;

  const LOOK = HK.LOOK = {
    sen: { skin: '#c29372', skinD: '#a97c5d', hair: '#1e1c1b', hairL: '#2e2b29', top: '#f2eee4', topD: '#d8d1c2', bot: '#6f8fb5', botD: '#5a789d', shoe: '#c23b2e', clip: '#8a5a3a', hoop: '#d6b14a', head: 9.5 },
    fish: { skin: '#b88a66', skinD: '#9d744f', hair: '#9a958c', cap: '#b9a27c', capD: '#a08a66', top: '#5c7186', topD: '#4b5d71', bot: '#3e4e62', botD: '#323f50', shoe: '#2b2723', stache: '#6d6862', head: 10 },
  };

  const S = (x, y) => [x, y];
  // ---------------- poses ----------------
  const P = HK.POSE = {};
  const sinp = Math.sin, cosp = Math.cos;
  P.senStand = () => ({ head: S(0, -108), neck: S(0, -97), shL: S(-13, -93), shR: S(13, -93), elL: S(-17, -74), elR: S(17, -74), haL: S(-18, -56), haR: S(18, -56), hipL: S(-8, -60), hipR: S(8, -60), knL: S(-8, -30), knR: S(8, -30), ftL: S(-8, -2), ftR: S(8, -2) });
  P.senMarch = ph => {
    const a = Math.max(0, sinp(ph)), b = Math.max(0, -sinp(ph));
    return { head: S(0, -108 - (a + b) * 2), neck: S(0, -97), shL: S(-13, -93), shR: S(13, -93), elL: S(-18, -76 + b * 6), haL: S(-16 + a * 4, -58 - b * 16), elR: S(14, -84), haR: S(5, -100), hipL: S(-8, -60), hipR: S(8, -60), knL: S(-8, -31 - a * 15), ftL: S(-8, -2 - a * 22), knR: S(8, -31 - b * 15), ftR: S(8, -2 - b * 22) };
  };
  P.senWalk = ph => {
    const s = sinp(ph);
    return { head: S(2, -108), neck: S(0, -97), shL: S(-1, -93), shR: S(1, -93), elL: S(1 - s * 6, -75), haL: S(2 - s * 10, -57), elR: S(1 + s * 6, -75), haR: S(2 + s * 10, -57), hipL: S(-1, -60), hipR: S(1, -60), knL: S(1 - s * 7, -31), ftL: S(1 - s * 12, -2 - Math.max(0, -cosp(ph)) * 3), knR: S(1 + s * 7, -31), ftR: S(1 + s * 12, -2 - Math.max(0, cosp(ph)) * 3) };
  };
  P.senGround = (prop = 'shake', k = 0) => {
    const p = { head: S(-4, -61), neck: S(-6, -51), shL: S(-8, -46), shR: S(-6, -46), hipL: S(-2, -7), hipR: S(0, -7), knL: S(14, -29), knR: S(18, -31), ftL: S(27, -3), ftR: S(31, -3), elL: S(-2, -26), haL: S(6, -18), elR: S(2, -28), haR: S(10, -40) };
    if (prop === 'book') { p.elL = S(4, -36); p.haL = S(13, -56); p.elR = S(6, -38); p.haR = S(15, -56); p.head = S(-3, -61); }
    if (prop === 'phone') { p.elR = S(8, -44); p.haR = S(1, -60); p.elL = S(6, -20); p.haL = S(18, -10 + Math.sin(k * 9) * 3); }
    if (prop === 'bag') { p.elR = S(6, -24); p.haR = S(16, -12); p.elL = S(4, -26); p.haL = S(12, -16); p.head = S(0, -59); }
    if (prop === 'shoes') { p.knL = S(18, -27); p.knR = S(20, -29); p.ftL = S(24, -3); p.ftR = S(27, -4); p.elR = S(14, -32); p.haR = S(25, -6); p.elL = S(10, -34); p.haL = S(22, -8); p.head = S(4, -58); p.neck = S(0, -50); p.shL = S(-2, -46); p.shR = S(0, -46); }
    return p;
  };
  P.senLie = k => ({ head: S(-54, -9), neck: S(-45, -8), shL: S(-40, -9), shR: S(-40, -7), hipL: S(0, -9), hipR: S(0, -7), knL: S(5, -34 + Math.sin(k) * 2), knR: S(8, -36), ftL: S(6, -62 + Math.sin(k) * 3), ftR: S(12, -63), elR: S(-34, -22), haR: S(-49, -15), elL: S(-26, -3), haL: S(-12, -3) });
  P.senCrouch = (arm = 0) => ({ head: S(13, -76), neck: S(9, -66), shL: S(5, -62), shR: S(7, -62), hipL: S(-5, -26), hipR: S(-3, -26), knL: S(12, -34), knR: S(15, -35), ftL: S(5, -2), ftR: S(8, -2), elL: S(14, -40), haL: S(23, -30 - arm * 8), elR: S(16, -42), haR: S(25, -32 - arm * 12) });
  P.senSeatFront = (arms = 'rest', k = 0) => {
    const p = { head: S(0, -87), neck: S(0, -77), shL: S(-13, -73), shR: S(13, -73), hipL: S(-9, -40), hipR: S(9, -40), knL: S(-10, -33), knR: S(10, -33), ftL: S(-10, -2), ftR: S(10, -2), elL: S(-18, -53), haL: S(-10, -42), elR: S(18, -53), haR: S(10, -42) };
    if (arms === 'talk') { p.elR = S(19, -55); p.haR = S(14 + Math.sin(k * 3) * 4, -60 + Math.cos(k * 2.3) * 4); }
    return p;
  };
  P.senSeatSide = (k = 0) => ({ head: S(-2, -87), neck: S(-4, -77), shL: S(-6, -73), shR: S(-4, -73), hipL: S(-3, -38), hipR: S(-1, -38), knL: S(20, -34), knR: S(22, -35), ftL: S(23, -2), ftR: S(26, -2), elL: S(2, -54), haL: S(14, -46), elR: S(4, -55), haR: S(16 + Math.sin(k * 3) * 3, -52 + Math.cos(k * 2) * 3) });

  P.fishStand = () => ({ head: S(3, -119), neck: S(0, -108), shL: S(-1, -103), shR: S(1, -103), elL: S(1, -81), haL: S(3, -60), elR: S(2, -81), haR: S(4, -60), hipL: S(-1, -65), hipR: S(1, -65), knL: S(0, -33), knR: S(2, -33), ftL: S(1, -2), ftR: S(3, -2) });
  P.fishWalk = ph => {
    const s = sinp(ph);
    return { head: S(3, -119), neck: S(0, -108), shL: S(-1, -103), shR: S(1, -103), elL: S(1 - s * 6, -82), haL: S(2 - s * 10, -61), elR: S(1 + s * 6, -82), haR: S(2 + s * 10, -61), hipL: S(-1, -65), hipR: S(1, -65), knL: S(1 - s * 8, -33), ftL: S(1 - s * 14, -2 - Math.max(0, -cosp(ph)) * 3), knR: S(1 + s * 8, -33), ftR: S(1 + s * 14, -2 - Math.max(0, cosp(ph)) * 3) };
  };
  P.fishPhone = (k = 0, mode = 'calm') => {
    const p = P.fishStand();
    p.elR = S(8, -90); p.haR = S(7, -118);
    if (mode === 'smoke') { p.elL = S(6, -84); p.haL = S(11, -112); }
    if (mode === 'wave') { p.elL = S(10 + Math.sin(k * 5) * 3, -86); p.haL = S(20 + Math.sin(k * 5) * 8, -98 + Math.cos(k * 4) * 8); }
    if (mode === 'kick') { p.ftR = S(14 + Math.sin(k * 8) * 4, -6); p.knR = S(8, -34); }
    if (mode === 'scratch') { p.elL = S(-4, -100); p.haL = S(-3, -124); }
    return p;
  };
  P.fishBend = (k = 0) => ({ head: S(31, -86), neck: S(25, -82), shL: S(18, -80), shR: S(20, -79), hipL: S(-1, -58), hipR: S(1, -58), knR: S(24, -32), ftR: S(20, -2), knL: S(10, -8), ftL: S(-16, -3), elR: S(26, -46), haR: S(22 + Math.sin(k * 7) * 2, -12), elL: S(22, -48), haL: S(16 + Math.cos(k * 7) * 2, -10) });
  P.fishSeatFront = (arms = 'rest', k = 0) => {
    const p = { head: S(0, -95), neck: S(0, -84), shL: S(-15, -80), shR: S(15, -80), hipL: S(-10, -42), hipR: S(10, -42), knL: S(-11, -35), knR: S(11, -35), ftL: S(-12, -2), ftR: S(12, -2), elL: S(-20, -58), haL: S(-12, -45), elR: S(20, -58), haR: S(12, -45) };
    if (arms === 'tie') { p.elL = S(-19, -76); p.haL = S(-5, -91); p.elR = S(19, -76); p.haR = S(5, -91); }
    if (arms === 'stretch') { const w = 10 + k * 22; p.elL = S(-20 - k * 8, -70); p.haL = S(-w, -76); p.elR = S(20 + k * 8, -70); p.haR = S(w, -76); }
    if (arms === 'offer') { p.elL = S(-24, -66); p.haL = S(-40, -70); }
    if (arms === 'pat') { p.elL = S(-21, -60); p.haL = S(-8 + Math.sin(k * 6) * 4, -70); p.elR = S(21, -58); p.haR = S(10, -50 + Math.cos(k * 6) * 6); }
    if (arms === 'light') { p.elL = S(-18, -74); p.haL = S(-3, -90); p.elR = S(18, -74); p.haR = S(4, -89); }
    if (arms === 'smoke') { p.elL = S(-20, -70); p.haL = S(-5, -88); }
    return p;
  };

  // ---------------- drawing ----------------
  function torso(c, top, bot, wt, wb, col) {
    const dx = bot[0] - top[0], dy = bot[1] - top[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    poly(c, [[top[0] + nx * wt / 2, top[1] + ny * wt / 2], [bot[0] + nx * wb / 2, bot[1] + ny * wb / 2], [bot[0] - nx * wb / 2, bot[1] - ny * wb / 2], [top[0] - nx * wt / 2, top[1] - ny * wt / 2]], col);
  }
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

  function leg(c, who, L, hip, kn, ft, shade, view, flipFoot) {
    const k = shade ? .82 : 1, d = col => shade ? mix(col, '#1d2124', .22) : col;
    if (who === 'sen') {
      limb(c, hip, kn, 9.5, 7.5, d(L.skin));
      limb(c, kn, ft, 7.2, 5.2, d(L.skin));
      foot(c, who, L, ft, view, d, flipFoot);
      const end = along(hip, kn, .4);
      limb(c, hip, end, 12.5, 11.5, d(shade ? L.botD : L.bot), false);
      poly(c, ngon(end[0], end[1], 5.8, 1.8, 6), d(mix(L.bot, '#ffffff', .3)));
    } else {
      limb(c, hip, kn, 12.5, 10.5, d(shade ? L.botD : L.bot));
      limb(c, kn, ft, 10.5, 9.5, d(shade ? L.botD : L.bot));
      foot(c, who, L, ft, view, d, flipFoot);
    }
  }
  function foot(c, who, L, ft, view, d, flipFoot) {
    const [x, y] = ft;
    if (view === 'side') {
      if (who === 'sen') { poly(c, [[x - 3, y + 1], [x + 9, y + 1], [x + 9, y + 2.6], [x - 3, y + 2.6]], d(L.shoe)); poly(c, [[x - 3, y - 2], [x + 8, y - 1], [x + 8, y + 1], [x - 3, y + 1]], d(L.skin)); }
      else poly(c, [[x - 5, y - 6], [x + 4, y - 6], [x + 12, y - 1], [x + 12, y + 2.5], [x - 5, y + 2.5]], d(L.shoe));
    } else {
      if (who === 'sen') { poly(c, [[x - 4.5, y], [x + 4.5, y], [x + 4.5, y + 2.6], [x - 4.5, y + 2.6]], d(L.shoe)); poly(c, ngon(x, y - .5, 3.4, 2, 6), d(L.skin)); }
      else poly(c, [[x - 6.5, y - 6], [x + 6.5, y - 6], [x + 7.5, y + 2.5], [x - 7.5, y + 2.5]], d(L.shoe));
    }
  }
  function arm(c, who, L, sh, el, ha, shade, prop) {
    const d = col => shade ? mix(col, '#1d2124', .2) : col;
    if (who === 'sen') {
      const sl = along(sh, el, .5);
      limb(c, sh, el, 5.6, 5, d(L.skin));
      limb(c, el, ha, 5, 4.2, d(L.skin));
      limb(c, sh, sl, 8.6, 7.8, d(shade ? L.topD : L.top));
      poly(c, ngon(ha[0], ha[1], 3, 3, 6), d(L.skin));
    } else {
      limb(c, sh, el, 8.6, 7.8, d(shade ? L.topD : L.top));
      poly(c, ngon(el[0], el[1], 4.6, 4.6, 6), d(mix(L.top, '#ffffff', .18)));
      limb(c, el, ha, 6.6, 5.4, d(L.skin));
      poly(c, ngon(ha[0], ha[1], 3.6, 3.6, 6), d(L.skin));
    }
  }

  function head(c, who, L, h, view, o) {
    const r = L.head, [x, y] = h;
    c.save(); c.translate(x, y); if (o.tilt) c.rotate(o.tilt);
    if (who === 'sen') senHead(c, L, r, view, o); else fishHead(c, L, r, view, o);
    c.restore();
  }
  function eyes(c, view, r, o, cols) {
    const e = o.eyes || 'open', ink = '#1d1d1d';
    const xs = view === 'side' ? [r * .48] : [-r * .36, r * .36];
    xs.forEach(ex => {
      if (e === 'open') poly(c, [[ex - 1.1, -.4], [ex + 1.1, -.4], [ex + 1.1, 1.4], [ex - 1.1, 1.4]], ink);
      else if (e === 'squint') line(c, [[ex - 1.6, .6], [ex + 1.6, .2]], ink, 1);
      else line(c, [[ex - 1.6, .9], [ex, 1.5], [ex + 1.6, .9]], ink, .9);
    });
  }
  function mouth(c, view, r, o, ink = '#5a2a22') {
    const m = o.mouth || 0, mx = view === 'side' ? r * .62 : 0;
    poly(c, [[mx - 1.6, 5.2], [mx + 1.6, 5.2], [mx + 1.3, 5.6 + m * 2], [mx - 1.3, 5.6 + m * 2]], ink);
  }
  // hair worn down, to just past the shoulders
  function longHair(c, L, h, view, o) {
    const r = L.head; c.save(); c.translate(h[0], h[1]); if (o.tilt) c.rotate(o.tilt);
    if (view === 'side') poly(c, [[r * .3, -r - 1], [-r - 1.5, -r * .3], [-r - 3, r * 1.6], [-r - 1.5, r * 2.7], [-r * .2, r * 2.5], [r * .1, r * .8]], L.hair);
    else if (view === 'back') { poly(c, [[-r - 1, -r * .2], [r + 1, -r * .2], [r + 3, r * 2.7], [r * .2, r * 3], [-r * .2, r * 3], [-r - 3, r * 2.7]], L.hair); poly(c, [[-r * .3, 0], [r * .2, 0], [r * .1, r * 2.6], [-r * .4, r * 2.6]], L.hairL); }
    else poly(c, [[-r - 2, -r * .4], [r + 2, -r * .4], [r + 3.5, r * 2.5], [r * .5, r * 2.8], [-r * .5, r * 2.8], [-r - 3.5, r * 2.5]], L.hair);
    c.restore();
  }
  function senHead(c, L, r, view, o) {
    if (view === 'back') {
      poly(c, ngon(-r, 1, 1.8, 2.6, 6), L.skinD); poly(c, ngon(r, 1, 1.8, 2.6, 6), L.skinD);
      poly(c, ngon(0, 0, r, r * 1.04, 8, Math.PI / 8), L.hair);
      poly(c, [[-r * .7, -r * .3], [r * .7, -r * .3], [r * .3, r * .7], [-r * .3, r * .7]], L.hairL);

      return;
    }
    if (view === 'side') {
      poly(c, ngon(0, 0, r * .95, r, 8, Math.PI / 8), L.skin);
      poly(c, [[r * .86, -1], [r + 2.4, 2.2], [r * .84, 3.2]], L.skin);
      poly(c, [[r * .35, -r - 1], [r * .75, -r * .55], [r * .15, -r * .45], [-r * .2, r * .15], [-r * .55, r * .75], [-r - 1.4, r * .45], [-r - 1.4, -r * .45], [-r * .3, -r - 1.2]], L.hair);
      poly(c, [[-r * .2, -r * .2], [r * .15, r * .2], [-r * .05, r * 1.6], [-r * .7, r * 1.4]], L.hair);
      poly(c, [[r * .6, -r * .5], [r * .9, r * .1], [r * .5, -r * .2]], L.hair);
      poly(c, ngon(-r * .1, 1, 1.8, 2.4, 6), L.skinD);
      c.strokeStyle = L.hoop; c.lineWidth = .8; c.beginPath(); c.arc(-r * .1, 5, 1.6, 0, Math.PI * 2); c.stroke();
      eyes(c, 'side', r, o); mouth(c, 'side', r, o);
      return;
    }
    poly(c, ngon(0, -1, r + 1.6, r + 2.2, 8, Math.PI / 8), L.hair);
    poly(c, ngon(0, 0, r * .86, r, 8, Math.PI / 8), L.skin);
    poly(c, [[-r - 1, 0], [-r + .5, -r + .5], [0, -r - 2.4], [r - .5, -r + .5], [r + 1, 0], [r * .6, -r * .5], [r * .1, -r * .66], [-r * .4, -r * .42], [-r * .7, -r * .2]], L.hair);
    poly(c, [[-r * .85, -r * .3], [-r * .55, r * .4], [-r * .7, -r * .1]], L.hair); poly(c, [[r * .85, -r * .3], [r * .55, r * .3], [r * .7, -r * .05]], L.hair);
    poly(c, [[-r - 1.2, -r * .3], [-r * .55, -r * .5], [-r * .62, r * 1.3], [-r - 2, r * 1.5]], L.hair); poly(c, [[r + 1.2, -r * .3], [r * .5, -r * .55], [r * .66, r * 1.3], [r + 2, r * 1.5]], L.hair);
    c.strokeStyle = L.hoop; c.lineWidth = .8; [-1, 1].forEach(sx => { c.beginPath(); c.arc(sx * r * .9, 4.6, 1.6, 0, Math.PI * 2); c.stroke(); });
    eyes(c, 'front', r, o); mouth(c, 'front', r, o);
  }
  function fishHead(c, L, r, view, o) {
    if (view === 'back') {
      poly(c, ngon(-r, 1, 2, 2.8, 6), L.skinD); poly(c, ngon(r, 1, 2, 2.8, 6), L.skinD);
      poly(c, ngon(0, 0, r, r * 1.04, 8, Math.PI / 8), L.skin);
      poly(c, [[-r * .95, 1], [r * .95, 1], [r * .7, r * .62], [-r * .7, r * .62]], L.hair);
      poly(c, [[-r * .55, r * .62], [r * .55, r * .62], [r * .4, r * .95], [-r * .4, r * .95]], L.skinD);
      poly(c, [[-r - 1.2, -1], [-r + .5, -r + 1], [0, -r - 3], [r - .5, -r + 1], [r + 1.2, -1]], L.cap);
      poly(c, [[-3, -3.5], [3, -3.5], [3, -1], [-3, -1]], L.skinD);
      if (o.earCig) poly(c, [[r - 1, -3], [r + 4, -5.5], [r + 4.6, -4.4], [r - .4, -1.8]], '#f4f1e8');
      return;
    }
    if (view === 'side') {
      poly(c, ngon(0, 0, r * .95, r, 8, Math.PI / 8), L.skin);
      poly(c, [[r * .86, -1.5], [r + 3, 2.6], [r * .84, 3.6]], L.skin);
      poly(c, [[-r * .2, 3], [r * .9, 3.6], [r * .8, 8], [-r * .1, r * .9]], rgba(L.skinD, .55));
      poly(c, [[r * .4, 4.8], [r + .8, 4.8], [r + .6, 6.4], [r * .4, 6.6]], L.stache);
      poly(c, [[-r - 1, -2], [-r * .4, -2], [-r * .2, r * .7], [-r * .9, r * .6]], L.hair);
      poly(c, ngon(-r * .15, 1, 2, 2.8, 6), L.skinD);
      poly(c, [[-r - 1.2, -1.5], [-r * .6, -r + 1], [r * .2, -r - 3], [r * .9, -r + 1.5], [r + 1, -1.5]], L.cap);
      poly(c, [[r * .3, -2.6], [r + 7.5, -.8], [r + 7.5, .8], [r * .3, -.6]], L.capD);
      if (o.earCig) poly(c, [[-r * .5, -3.5], [r * .3, -6], [r * .35, -4.8], [-r * .45, -2.4]], '#f4f1e8');
      eyes(c, 'side', r, o);
      if (o.cig) { poly(c, [[r * .7, 6.4], [r + 6, 7.4], [r + 6, 8.6], [r * .7, 7.8]], '#f4f1e8'); poly(c, ngon(r + 6.6, 8, 1.2, 1.2, 6), '#e5672a'); }
      return;
    }
    poly(c, ngon(0, 0, r * .86, r, 8, Math.PI / 8), L.skin);
    poly(c, [[-r * .8, 2], [r * .8, 2], [r * .55, r * .95], [-r * .55, r * .95]], rgba(L.skinD, .5));
    poly(c, [[-4, 4.2], [4, 4.2], [4.6, 6.2], [-4.6, 6.2]], L.stache);
    poly(c, [[-r - .6, -2], [-r * .7, -2], [-r * .6, 3], [-r - .4, 2]], L.hair); poly(c, [[r + .6, -2], [r * .7, -2], [r * .6, 3], [r + .4, 2]], L.hair);
    poly(c, [[-r - 1.2, -2.2], [-r + .6, -r + .5], [0, -r - 3], [r - .6, -r + .5], [r + 1.2, -2.2]], L.cap);
    poly(c, ngon(0, -2.4, r + 3.5, 2.6, 10), L.capD);
    if (o.earCig) poly(c, [[r - .5, -4], [r + 4, -6.5], [r + 4.6, -5.4], [r, -2.8]], '#f4f1e8');
    line(c, [[-5, -1.6], [-2, -2]], '#6d6862', .9); line(c, [[2, -2], [5, -1.6]], '#6d6862', .9);
    eyes(c, 'front', r, o);
    if (o.cig) { poly(c, [[2, 6], [8, 7.6], [8, 8.8], [2, 7.2]], '#f4f1e8'); poly(c, ngon(8.6, 8.2, 1.2, 1.2, 6), '#e5672a'); }
  }

  /** Draw a full figure. o: {x,y,s,flip,view,eyes,mouth,tilt,cig,earCig,phone,earbuds,bag,prop} */
  HK.fig = function (c, who, p, o = {}) {
    const L = LOOK[who], view = o.view || 'front';
    c.save(); c.translate(o.x || 0, o.y || 0); c.scale((o.flip ? -1 : 1) * (o.s || 1), o.s || 1);
    if (o.shadow !== false) poly(c, ngon(view === 'side' ? 4 : 0, 1, who === 'sen' ? 18 : 20, 3.2, 10), 'rgba(60,50,30,.22)');
    const hip = mid(p.hipL, p.hipR), sh = mid(p.shL, p.shR);
    if (who === 'sen' && view !== 'back') longHair(c, L, p.head, view, o);
    if (view === 'side') {
      arm(c, who, L, p.shL, p.elL, p.haL, true);
      leg(c, who, L, p.hipL, p.knL, p.ftL, true, 'side');
      if (o.bag && who === 'sen') poly(c, [[hip[0] - 10, hip[1] - 4], [hip[0] - 1, hip[1] - 4], [hip[0] - 1, hip[1] + 6], [hip[0] - 10, hip[1] + 6]], '#4a3b2e');
      torso(c, sh, hip, who === 'sen' ? 14 : 21, who === 'sen' ? 15 : 19, L.top);
      leg(c, who, L, p.hipR, p.knR, p.ftR, false, 'side');
      limb(c, p.neck, p.head, who === 'sen' ? 6 : 7.5, who === 'sen' ? 5 : 6.5, L.skin, false);
      if (o.bag && who === 'sen') line(c, [[sh[0] + 3, sh[1] - 1], [hip[0] - 6, hip[1] - 2]], '#4a3b2e', 1.6);
      arm(c, who, L, p.shR, p.elR, p.haR, false);
    } else {
      leg(c, who, L, p.hipL, p.knL, p.ftL, view === 'back', view);
      leg(c, who, L, p.hipR, p.knR, p.ftR, false, view);
      limb(c, p.neck, p.head, who === 'sen' ? 6 : 7.5, who === 'sen' ? 5 : 6.5, view === 'back' ? L.skinD : L.skin, false);
      const w = Math.abs(p.shR[0] - p.shL[0]), wh = Math.abs(p.hipR[0] - p.hipL[0]);
      if (who === 'sen') {
        torso(c, [sh[0], sh[1] - 2], [hip[0], hip[1] + 2], w + 6, wh + 10, view === 'back' ? L.topD : L.top);
        if (view === 'front') { poly(c, [[-4, sh[1] - 3], [4, sh[1] - 3], [2, sh[1] + 2], [-2, sh[1] + 2]], L.skin); }
        if (o.bag && view === 'front') { line(c, [[p.shL[0] + 2, p.shL[1]], [p.hipR[0] + 6, p.hipR[1] - 2]], '#4a3b2e', 1.8); poly(c, [[p.hipR[0] + 2, p.hipR[1] - 6], [p.hipR[0] + 13, p.hipR[1] - 6], [p.hipR[0] + 13, p.hipR[1] + 4], [p.hipR[0] + 2, p.hipR[1] + 4]], '#4a3b2e'); }
      } else {
        torso(c, sh, hip, w + 8, wh + 10, view === 'back' ? L.topD : L.top);
        if (view === 'front') {
          poly(c, [[-5, sh[1] - 2], [5, sh[1] - 2], [0, sh[1] + 7]], mix(L.top, '#ffffff', .2)); poly(c, [[-2.4, sh[1] - 2], [2.4, sh[1] - 2], [0, sh[1] + 5]], L.skin);
          line(c, [[0, sh[1] + 7], [hip[0], hip[1] - 2]], L.topD, .8);
          poly(c, [[-12, sh[1] + 6], [-5, sh[1] + 6], [-5, sh[1] + 14], [-12, sh[1] + 14]], L.topD);
          if (o.pocketPhone !== false) poly(c, [[-11, sh[1] + 2], [-6, sh[1] + 2], [-6, sh[1] + 8], [-11, sh[1] + 8]], '#22262a');
        }
      }
      arm(c, who, L, p.shL, p.elL, p.haL, view === 'back');
      arm(c, who, L, p.shR, p.elR, p.haR, false);
      if (who === 'sen' && view === 'back') longHair(c, L, p.head, view, o);
    }
    if (o.earbuds && who === 'sen') { const hx = p.head[0], hy = p.head[1]; line(c, [[hx + (view === 'side' ? -1 : -8), hy + 3], [sh[0], sh[1] + 10], [hip[0] + 4, hip[1] - 4]], 'rgba(255,255,255,.85)', .7); if (view !== 'side') line(c, [[hx + 8, hy + 3], [sh[0], sh[1] + 10]], 'rgba(255,255,255,.85)', .7); }
    if (o.phone) { const [hx, hy] = o.phone === 'L' ? p.haL : p.haR; poly(c, [[hx - 2, hy - 7], [hx + 3, hy - 7], [hx + 3, hy + 2], [hx - 2, hy + 2]], who === 'fish' ? '#2a2f35' : '#1b1e22'); }
    if (o.prop) o.prop(c, p, L);
    head(c, who, L, p.head, view, o);
    c.restore();
  };

  // ---------------- chairs ----------------
  HK.chairBack = (c, x, ground = 334) => {
    const y = ground - 334;
    poly(c, [[x - 60, 334 + y], [x + 10, 330 + y], [x + 4, 340 + y], [x - 66, 342 + y]], 'rgba(90,80,50,.3)');
    poly(c, [[x - 27, 304 + y], [x - 23, 304 + y], [x + 26, 334 + y], [x + 22, 334 + y]], '#252a2e'); poly(c, [[x + 23, 304 + y], [x + 27, 304 + y], [x - 22, 334 + y], [x - 26, 334 + y]], '#1d2124');
    poly(c, [[x - 28, 252 + y], [x + 28, 252 + y], [x + 28, 308 + y], [x - 28, 308 + y]], '#33506e'); poly(c, [[x - 28, 252 + y], [x, 252 + y], [x, 308 + y], [x - 28, 308 + y]], '#3c5c7d');
    poly(c, [[x - 31, 248 + y], [x - 28, 248 + y], [x - 28, 310 + y], [x - 31, 310 + y]], '#20262b'); poly(c, [[x + 28, 248 + y], [x + 31, 248 + y], [x + 31, 310 + y], [x + 28, 310 + y]], '#20262b');
    poly(c, [[x - 42, 284 + y], [x - 28, 284 + y], [x - 28, 287 + y], [x - 42, 287 + y]], '#20262b'); poly(c, [[x + 28, 284 + y], [x + 42, 284 + y], [x + 42, 287 + y], [x + 28, 287 + y]], '#20262b');
  };
  // front-facing camp chair in local units, feet at 0; draw before the seated figure
  HK.chairFront = (c, x, y, s, front = false) => {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (!front) {
      poly(c, ngon(0, 1, 26, 4, 10), 'rgba(60,50,30,.22)');
      poly(c, [[-22, -86], [22, -86], [22, -40], [-22, -40]], '#33506e'); poly(c, [[-22, -86], [0, -86], [0, -40], [-22, -40]], '#3c5c7d');
      [-24, 22].forEach(px => poly(c, [[px, -90], [px + 2.6, -90], [px + 2.6, -38], [px, -38]], '#20262b'));
      poly(c, [[-22, -32], [-18, -32], [18, 0], [14, 0]], '#252a2e'); poly(c, [[18, -32], [22, -32], [-14, 0], [-18, 0]], '#1d2124');
      poly(c, [[-24, -44], [24, -44], [21, -34], [-21, -34]], '#2c4762');
    } else {
      poly(c, [[-32, -54], [-22, -54], [-22, -51], [-32, -51]], '#20262b'); poly(c, [[22, -54], [32, -54], [32, -51], [22, -51]], '#20262b');
      [-30, 28].forEach(px => poly(c, [[px, -52], [px + 2.4, -52], [px + 2.4, -36], [px, -36]], '#20262b'));
    }
    c.restore();
  };
  HK.chairSide = (c, x, y, s, flip) => {
    c.save(); c.translate(x, y); c.scale(flip ? -s : s, s);
    poly(c, ngon(6, 1, 24, 3.5, 10), 'rgba(60,50,30,.22)');
    poly(c, [[-14, -86], [-8, -86], [0, -38], [-6, -38]], '#2c4762');
    poly(c, [[-8, -42], [26, -40], [24, -32], [-6, -34]], '#33506e');
    poly(c, [[-6, -36], [-3, -36], [24, 0], [21, 0]], '#252a2e'); poly(c, [[22, -36], [25, -36], [-2, 0], [-5, 0]], '#1d2124');
    poly(c, [[-10, -58], [22, -56], [22, -53], [-10, -55]], '#20262b');
    c.restore();
  };
})();
