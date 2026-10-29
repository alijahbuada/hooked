/* HOOKED — the runtime: plays HK.SCENES beat by beat.
   Each beat: lines type out at film pace; an action (tap, hold, drag, flick, choice, hotspot, or waiting)
   may be needed to move on. Any action auto-completes after a stretch of idling so nobody gets stuck;
   a "wait" action is the reverse: it only completes while you do nothing. */
(function () {
  const { clamp } = HK;
  const $ = id => document.getElementById(id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = $('scene'), ctx = cv.getContext('2d');
  const box = $('box'), whoEl = $('who'), sayEl = $('say'), subEl = $('sub'), choicesEl = $('choices'), moreEl = $('more');
  const promptEl = $('prompt'), promptText = $('promptText'), meter = $('meter'), meterFill = $('meterFill'), tagEl = $('tag'), titleEl = $('title');
  const SC = HK.SCENES;

  let K = 2;
  function resize() { const r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2); K = HK.K = Math.max(1, Math.min(3, r.width * dpr / HK.W)); cv.width = Math.round(HK.W * K); cv.height = Math.round(HK.H * K); }
  new ResizeObserver(resize).observe(cv); resize();

  const G = { mode: 'title', T: 0, si: 0, bi: 0, beat: null, st: null, Q: [], phase: 'lines', postT: 0, idle: 0, card: 0, fadeIn: 0, act: null, actOn: false, thenAdded: false, speed: 1 };
  window.__hooked = G;

  // ---------------- lines ----------------
  const words = l => ((l.sub || l.text) || '').split(/\s+/).length;
  const lineDur = l => l.waitIdle ? 1e9 : clamp(1.6 + words(l) * .34, 2.4, 9);
  let typed = 0;
  function showLine() {
    const st = G.st, l = G.Q[st.lineIdx];
    st.line = l; st.lineT = 0; typed = reduce ? 1e9 : 0;
    whoEl.hidden = !l.who; whoEl.textContent = l.who || '';
    sayEl.classList.toggle('action', !l.who);
    paintLine();
    if (l.fx) HK.audio.fx(l.fx);
    if (l.prompt) showPrompt(l.prompt); else if (!G.actOn) hidePrompt();
  }
  function paintLine() {
    const l = G.st.line; if (!l) return;
    const n = Math.floor(typed);
    sayEl.textContent = '';
    if (l.paren) { const p = document.createElement('span'); p.className = 'paren'; p.textContent = `(${l.paren})`; sayEl.appendChild(p); }
    sayEl.appendChild(document.createTextNode(l.text.slice(0, n)));
    subEl.textContent = n >= l.text.length && l.sub ? l.sub : '';
    moreEl.hidden = n < l.text.length;
  }
  function nextLine() {
    const st = G.st;
    if (st.lineIdx + 1 < G.Q.length) { st.lineIdx++; showLine(); return; }
    st.lineIdx = G.Q.length; st.line = null;
    linesDone();
  }
  function linesDone() {
    const a = G.act, st = G.st;
    if (a && st.doneAt == null) {
      if (a.optional) { st.doneAt = st.t; addThen(); if (st.lineIdx < G.Q.length) return showLine(); return toPost(); }
      G.phase = 'act'; activateAct(); return;
    }
    if (addThen() && st.lineIdx < G.Q.length) { G.phase = 'lines'; return showLine(); }
    toPost();
  }
  function addThen() { if (G.thenAdded || !G.beat.then) return false; G.thenAdded = true; G.Q.push(...G.beat.then); return true; }
  function toPost() { G.phase = 'post'; G.postT = 0; hidePrompt(); moreEl.hidden = true; }

  // ---------------- actions ----------------
  function showPrompt(t) { promptText.textContent = t; promptEl.hidden = false; }
  function hidePrompt() { promptEl.hidden = true; promptEl.classList.remove('nudge'); meter.hidden = true; }
  function activateAct() {
    const a = G.act; if (!a || G.actOn) return;
    G.actOn = true; G.idle = 0;
    showPrompt(a.prompt + (a.n > 1 ? ` (${G.st.taps || 0}/${a.n})` : ''));
    meter.hidden = !(a.type === 'hold' || a.type === 'drag' && a.dist < 9999 || a.type === 'wait' || a.type === 'flick');
    if (a.type === 'choice') {
      choicesEl.innerHTML = '';
      a.choices.forEach((label, i) => { const b = document.createElement('button'); b.className = 'btn'; b.type = 'button'; b.textContent = label; b.addEventListener('click', e => { e.stopPropagation(); G.st.choice = i; complete(); }); choicesEl.appendChild(b); });
      choicesEl.querySelector('button').focus({ preventScroll: true });
    }
  }
  function complete(auto) {
    const a = G.act, st = G.st; if (!a || st.doneAt != null) return;
    st.doneAt = st.t; st.auto = !!auto; G.actOn = false; hidePrompt(); choicesEl.innerHTML = '';
    if (a.fx) HK.audio.fx(a.fx);
    if (a.done) a.done(st);
    if (G.phase === 'act') { if (addThen() && st.lineIdx < G.Q.length) { G.phase = 'lines'; showLine(); } else toPost(); }
    else addThen();
  }
  function meterK() {
    const a = G.act, st = G.st; if (!a) return 0;
    if (a.type === 'hold') return st.hold;
    if (a.type === 'drag') return (st.drag || 0) / a.dist;
    if (a.type === 'wait') return G.idle / a.secs;
    if (a.type === 'flick') return st.pull || 0;
    return 0;
  }

  // ---------------- flow ----------------
  // the piano score runs under every scene, except while Sen's earbuds are playing jazz
  const withScore = bed => bed.jazz ? bed : Object.assign({ score: .8 }, bed);
  HK.withScore = withScore;
  function startScene(i, bi = 0) {
    G.mode = 'play'; G.si = i; titleEl.hidden = true; box.hidden = false; box.classList.remove('idle');
    G.card = reduce ? 1.2 : 2.6; G.cardScene = SC[i];
    tagEl.hidden = false; tagEl.textContent = `${SC[i].n} · ${SC[i].slug}`;
    box.classList.add('idle'); hidePrompt();
    HK.audio.bed(withScore(SC[i].bed));
    G.pendingBeat = bi;
    try { history.replaceState(null, '', '#scene-' + SC[i].n); } catch (e) { /* file:// or sandbox */ }
    markCurrent();
  }
  function enterBeat(bi) {
    const sc = SC[G.si], b = sc.beats[bi];
    G.bi = bi; G.beat = b; G.act = b.act || null; G.actOn = false; G.thenAdded = false;
    G.st = { t: 0, T: G.T, lineIdx: 0, lineT: 0, line: null, taps: 0, hold: 0, drag: 0, pull: 0, doneAt: null };
    G.Q = (b.lines || []).slice(); G.phase = 'lines'; G.fadeIn = b.cut === 'fade' ? 1 : 0;
    box.classList.remove('idle'); choicesEl.innerHTML = '';
    HK.audio.bed(withScore(b.bed || sc.bed));
    cv.setAttribute('aria-label', b.alt || sc.slug);
    if (b.enter) b.enter(G.st);
    if (G.act && G.act.at === 'start') activateAct();
    if (G.Q.length) showLine(); else linesDone();
  }
  function nextBeat() {
    const sc = SC[G.si];
    if (G.beat.end) return showEnd();
    if (G.bi + 1 < sc.beats.length) return enterBeat(G.bi + 1);
    if (G.si + 1 < SC.length) return startScene(G.si + 1);
    showEnd();
  }
  function showEnd() { G.mode = 'end'; box.classList.add('idle'); hidePrompt(); openWin('endWin'); }

  // ---------------- input ----------------
  const toLogical = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * HK.W, (e.clientY - r.top) / r.height * HK.H]; };
  let drag = null;
  function primary(x, y, viaKey, fromBox) {
    G.idle = 0;
    if (G.mode !== 'play') return;
    if (G.card > 0) { G.card = Math.min(G.card, .35); return; }
    const a = G.act, st = G.st;
    if (G.actOn && st.doneAt == null && !(fromBox && G.phase === 'lines')) {
      if (a.type === 'tap') { st.taps++; if (a.onTap) a.onTap(st); if (a.n > 1) showPrompt(`${a.prompt} (${st.taps}/${a.n})`); if (st.taps >= (a.n || 1)) complete(); return; }
      if (a.type === 'hot') { if (viaKey || Math.hypot(x - a.hot[0], y - a.hot[1]) < a.hot[2] * 1.6) complete(); else promptEl.classList.add('nudge'); return; }
      if (a.type === 'choice') return;
      if (a.type === 'flick' && viaKey) { complete(); return; }
      if (a.type === 'drag' && viaKey) { st.drag += a.dist / 4; if (a.onKey) a.onKey(st); else if (a.onDrag) for (let i = 0; i < 6; i++) a.onDrag(st, 220, 250, 8, 0); if (a.dist < 9999 && st.drag >= a.dist) complete(); return; }
      if (a.type === 'hold' || a.type === 'drag' || a.type === 'flick' || a.type === 'wait') return;
    }
    if (G.phase === 'lines' && st.line) {
      if (typed < st.line.text.length) { typed = 1e9; paintLine(); return; }
      if (st.line.waitIdle) { promptEl.classList.add('nudge'); return; }
      nextLine(); return;
    }
    if (G.phase === 'post') G.postT = 99;
  }
  cv.addEventListener('pointerdown', e => {
    if (G.mode === 'title') return;
    const [x, y] = toLogical(e); G.idle = 0;
    const a = G.act, st = G.st;
    if (G.mode === 'play' && G.card <= 0 && G.actOn && st && st.doneAt == null) {
      if (a.type === 'hold') { st.hold = Math.min(1, st.hold + .12); st.holding = true; cv.setPointerCapture(e.pointerId); if (st.hold >= 1) complete(); return; }
      if (a.type === 'drag') { drag = { x, y }; if (a.onDown) a.onDown(st, x, y); cv.setPointerCapture(e.pointerId); return; }
      if (a.type === 'flick') { drag = { x, y, y0: y }; cv.setPointerCapture(e.pointerId); return; }
    }
    primary(x, y);
  });
  cv.addEventListener('pointermove', e => {
    if (!drag || !G.st) return;
    const [x, y] = toLogical(e), a = G.act, st = G.st; G.idle = 0;
    if (a.type === 'drag') { const d = Math.hypot(x - drag.x, y - drag.y); st.drag += d; if (a.onDrag) a.onDrag(st, x, y, x - drag.x, y - drag.y); drag.x = x; drag.y = y; if (a.dist < 9999 && st.drag >= a.dist) { drag = null; complete(); } }
    if (a.type === 'flick') st.pull = clamp((y - drag.y0) / 80, 0, 1);
  });
  function up() {
    const st = G.st; if (!st) return;
    st.holding = false;
    if (drag && G.act) { if (G.act.type === 'drag' && G.act.onUp) G.act.onUp(st); if (G.act.type === 'flick') { if (st.pull > .55) complete(); else st.pull = 0; } }
    drag = null;
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  box.addEventListener('click', e => { if (e.target.closest('button')) return; primary(-99, -99, false, true); });
  addEventListener('keydown', e => {
    G.idle = 0;
    if (anyOpen()) { if (e.key === 'Escape') closeWins(); return; }
    if (e.target.closest && e.target.closest('button, a, input, textarea')) return;
    if (G.mode !== 'play') return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (G.actOn && G.act.type === 'hold' && G.st.doneAt == null) { if (!e.repeat) { G.st.hold = Math.min(1, G.st.hold + .12); if (G.st.hold >= 1) complete(); } G.st.holding = true; return; }
      primary(-99, -99, true);
    }
  });
  addEventListener('keyup', e => { if ((e.key === ' ' || e.key === 'Enter') && G.st) G.st.holding = false; });
  ['wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => { G.idle = 0; }, { passive: true }));

  // ---------------- windows ----------------
  const wins = ['scenesWin', 'tackleWin', 'soundWin', 'endWin'];
  let lastFocus = null;
  const anyOpen = () => wins.some(id => !$(id).hidden);
  function openWin(id) { lastFocus = document.activeElement; wins.forEach(w => $(w).hidden = w !== id); const el = $(id); el.hidden = false; const f = el.querySelector('[aria-current="true"], .item[aria-selected="true"], button, a'); f && f.focus(); }
  function closeWins() { const wasEnd = !$('endWin').hidden; wins.forEach(w => $(w).hidden = true); G.idle = 0; if (lastFocus && lastFocus.focus) lastFocus.focus(); if (wasEnd && G.mode === 'end') toTitle(); }
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeWins));
  document.querySelectorAll('.scrim').forEach(s => s.addEventListener('pointerdown', e => { if (e.target === s) closeWins(); }));
  $('scenesBtn').addEventListener('click', () => openWin('scenesWin'));
  $('titleScenes').addEventListener('click', () => openWin('scenesWin'));
  $('tackleBtn').addEventListener('click', () => openWin('tackleWin'));
  $('soundBtn').addEventListener('click', () => openWin('soundWin'));
  $('endTackle').addEventListener('click', () => openWin('tackleWin'));
  $('endAgain').addEventListener('click', () => { wins.forEach(w => $(w).hidden = true); begin(0); });
  HK.renderTackle($('items'), $('detail'));

  const list = $('sceneList');
  SC.forEach((s, i) => {
    const li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.innerHTML = `<b>${s.n}</b><span class="s"></span><span class="d"></span>`;
    b.querySelector('.s').textContent = s.slug; b.querySelector('.d').textContent = s.blurb;
    b.addEventListener('click', () => { wins.forEach(w => $(w).hidden = true); begin(i); });
    li.appendChild(b); list.appendChild(li);
  });
  function markCurrent() { [...list.querySelectorAll('button')].forEach((b, i) => b.setAttribute('aria-current', String(G.mode === 'play' && i === G.si))); }

  // ---------------- sound ----------------
  const audioToggle = $('audioToggle'), soundBtn = $('soundBtn');
  let wantSound = true;
  function paintSound() { const on = HK.audio.on; audioToggle.setAttribute('aria-pressed', String(on)); audioToggle.textContent = on ? 'Turn sound off' : 'Turn sound on'; soundBtn.setAttribute('aria-pressed', String(on)); }
  audioToggle.addEventListener('click', async () => { wantSound = !HK.audio.on; const ok = await HK.audio.toggle(wantSound); if (!ok && wantSound) { audioToggle.textContent = 'Sound isn’t available here'; } paintSound(); paintTitleSound(); });
  [['vAmb', 'amb'], ['vMusic', 'music']].forEach(([id, k]) => { const el = $(id), out = el.nextElementSibling; el.addEventListener('input', () => { out.textContent = el.value; HK.audio.setLevel(k, el.value / 100); }); });

  const titleSound = $('titleSound');
  function paintTitleSound() { titleSound.setAttribute('aria-pressed', String(wantSound)); titleSound.textContent = wantSound ? 'Sound on · turn off' : 'Sound off · turn on'; }
  titleSound.addEventListener('click', async e => { e.stopPropagation(); wantSound = !wantSound; await HK.audio.toggle(wantSound); paintSound(); paintTitleSound(); });
  const wake = async e => {
    if (e.target.closest && e.target.closest('#titleSound, #audioToggle')) return;
    if (wantSound && !HK.audio.on) { await HK.audio.toggle(true); paintSound(); }
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev => removeEventListener(ev, wake, true));
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, wake, true));
  paintTitleSound();
  async function begin(i) {
    if (wantSound && !HK.audio.on) { await HK.audio.toggle(true); paintSound(); }
    startScene(i);
  }
  function toTitle() { G.mode = 'title'; titleEl.hidden = false; box.hidden = true; box.classList.add('idle'); tagEl.hidden = true; hidePrompt(); HK.audio.bed({ insects: .35, water: .45, score: .85 }); markCurrent(); }
  const hashScene = +((location.hash.match(/scene-(\d)/) || [])[1] || 0);
  if (hashScene > 1 && SC[hashScene - 1]) $('playBtn').textContent = `Play from scene ${hashScene}`;
  $('playBtn').addEventListener('click', () => begin(hashScene > 1 && SC[hashScene - 1] ? hashScene - 1 : 0));
  window.__hookedGo = (si, bi = 0) => { box.hidden = false; G.mode = 'play'; G.si = si; titleEl.hidden = true; tagEl.hidden = false; tagEl.textContent = `${SC[si].n} · ${SC[si].slug}`; G.card = 0; enterBeat(bi); };

  // ---------------- loop ----------------
  let last = performance.now();
  function step(now) {
    const dt = Math.min(.1, (now - last) / 1000) * (G.speed || 1); last = now;
    if (!document.hidden && !(anyOpen() && G.mode === 'play')) {
      G.T += dt;
      if (G.mode === 'play') tick(dt);
      render();
    }
    requestAnimationFrame(step);
  }
  function tick(dt) {
    if (G.card > 0) { G.card -= dt; if (G.card <= 0) { box.classList.remove('idle'); enterBeat(G.pendingBeat || 0); G.fadeIn = 1; } return; }
    const st = G.st, a = G.act;
    st.t += dt; st.T = G.T; st.lineT += dt; G.idle += dt;
    if (G.beat.update) G.beat.update(st, dt);
    // hold
    if (G.actOn && a.type === 'hold' && st.doneAt == null) {
      if (st.holding) { st.hold = Math.min(1, st.hold + dt / a.secs); st.fxT = (st.fxT || 0) - dt; if (st.fxT <= 0 && a.fx) { st.fxT = .9; HK.audio.fx(a.fx); } G.idle = 0; if (st.hold >= 1) complete(); }
    }
    // patience
    if (G.actOn && st.doneAt == null && G.phase === 'act') {
      if (a.type === 'wait') { if (G.idle >= a.secs) complete(); }
      else if (G.idle >= (a.auto || 10)) complete(true);
      else if (G.idle > 4) promptEl.classList.add('nudge');
    }
    if (G.actOn) { meterFill.style.width = (clamp(meterK(), 0, 1) * 100).toFixed(1) + '%'; }
    // lines
    if (G.phase === 'lines' && st.line) {
      if (typed < st.line.text.length) { typed += dt * 42; paintLine(); }
      const l = st.line;
      if (l.waitIdle) { meter.hidden = false; meterFill.style.width = (clamp(G.idle / l.waitIdle, 0, 1) * 100) + '%'; if (G.idle >= l.waitIdle && st.lineT > 1) { hidePrompt(); nextLine(); } }
      else if (st.lineT >= lineDur(l) && typed >= l.text.length) nextLine();
    }
    if (G.phase === 'post') { G.postT += dt; if (G.postT >= (G.beat.hold == null ? 1.2 : G.beat.hold)) nextBeat(); }
    if (G.fadeIn > 0) G.fadeIn = Math.max(0, G.fadeIn - dt * 2.5);
  }
  function render() {
    ctx.setTransform(K, 0, 0, K, 0, 0);
    if (G.mode === 'title' || (G.mode === 'end' && !G.st)) {
      HK.lakeA(ctx, G.T, { fish: 'seat', fishO: { smoke: true }, sen: 'seat', senO: { turn: Math.sin(G.T * .3) * .3 }, rod: { line: true, bell: true } });
      return;
    }
    if (G.card > 0) {
      HK.rect(ctx, 0, 0, HK.W, HK.H, '#121418');
      const a = clamp(Math.min(G.card / .4, (2.6 - G.card) / .4, 1), 0, 1), s = G.cardScene;
      ctx.globalAlpha = a;
      HK.text(ctx, `SCENE ${s.n}`, 240, 156, 11, '#9cb0c4', 'center', 800);
      HK.text(ctx, s.slug, 240, 182, 20, '#fffdf4', 'center', 800);
      ctx.globalAlpha = 1; return;
    }
    if (!G.beat) return;
    ctx.save(); G.beat.draw(ctx, G.st); ctx.restore();
    ctx.setTransform(K, 0, 0, K, 0, 0);
    const a = G.act, st = G.st;
    if (G.actOn && a.type === 'hot' && st.doneAt == null) {
      const p = (G.T % 1.4) / 1.4; ctx.strokeStyle = `rgba(255,253,244,${.9 - p * .7})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(a.hot[0], a.hot[1], a.hot[2] * (.6 + p * .5), 0, Math.PI * 2); ctx.stroke();
    }
    if (G.fadeIn > 0) HK.fade(ctx, '#121418', G.fadeIn);
  }
  box.classList.add('idle'); box.hidden = true;
  HK.audio.pendingBed = { insects: .35, water: .45, score: .85 };
  requestAnimationFrame(step);
})();
