/* HOOKED — synthesized sound. Nothing loads from the network; it all comes from WebAudio.
   Ambience beds fade between scenes; effects are short one-shots. Starts only after a click. */
(function () {
  const A = HK.audio = { ctx: null, on: false, master: null, bus: {}, level: { amb: .9, music: .7 } };
  const BEDS = ['room', 'town', 'insects', 'water', 'street', 'car', 'breath', 'buzz'];
  let nb = null;

  function noise(ac, sec = 2) { const b = ac.createBuffer(1, ac.sampleRate * sec, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  function src(ac) { const s = ac.createBufferSource(); s.buffer = nb; s.loop = true; s.start(0, Math.random() * 1.5); return s; }
  function gain(ac, v, to) { const g = ac.createGain(); g.gain.value = v; if (to) g.connect(to); return g; }
  function filt(ac, type, f, q = 1) { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
  function lfo(ac, f, depth, target) { const o = ac.createOscillator(); o.frequency.value = f; const g = gain(ac, depth); o.connect(g); g.connect(target); o.start(); return o; }

  function build() {
    const ac = A.ctx = new (window.AudioContext || window.webkitAudioContext)();
    nb = noise(ac);
    A.master = gain(ac, .9, ac.destination);
    A.ambBus = gain(ac, A.level.amb, A.master);
    A.musicBus = gain(ac, A.level.music, A.master);
    A.fxBus = gain(ac, .9, A.master);
    BEDS.forEach(k => A.bus[k] = gain(ac, 0, A.ambBus));
    // room tone: dull air
    { const n = src(ac), f = filt(ac, 'lowpass', 300); n.connect(f); f.connect(gain(ac, .18, A.bus.room)); }
    // town: low rumble plus the odd passing car
    { const n = src(ac), f = filt(ac, 'lowpass', 170); n.connect(f); f.connect(gain(ac, .5, A.bus.town));
      const car = () => { if (!A.ctx) return; const t0 = ac.currentTime, s = src(ac), bp = filt(ac, 'bandpass', 300, 2), g = gain(ac, 0, A.bus.town); bp.frequency.setValueAtTime(260, t0); bp.frequency.linearRampToValueAtTime(820, t0 + 3); bp.frequency.linearRampToValueAtTime(240, t0 + 6); g.gain.linearRampToValueAtTime(.4, t0 + 3); g.gain.linearRampToValueAtTime(0, t0 + 6); s.connect(bp); bp.connect(g); s.stop(t0 + 6.2); setTimeout(car, 8000 + Math.random() * 12000); };
      setTimeout(car, 2500); }
    // insects: buzzing band, amplitude-chopped
    { const n = src(ac), bp = filt(ac, 'bandpass', 5200, 9), g = gain(ac, 0); lfo(ac, 26, .5, g.gain); lfo(ac, .21, .35, g.gain); n.connect(bp); bp.connect(g); g.connect(gain(ac, .35, A.bus.insects)); }
    // water: slow lapping
    { const n = src(ac), lp = filt(ac, 'lowpass', 520), g = gain(ac, .6); lfo(ac, .09, .3, g.gain); n.connect(lp); lp.connect(g); g.connect(gain(ac, .5, A.bus.water)); }
    // street: crickets
    { const o = ac.createOscillator(); o.frequency.value = 4400; const g = gain(ac, 0); const ch = ac.createOscillator(); ch.type = 'square'; ch.frequency.value = 18; const cg = gain(ac, .5); ch.connect(cg); cg.connect(g.gain); ch.start(); lfo(ac, .6, .4, g.gain); o.connect(g); g.connect(gain(ac, .02, A.bus.street)); o.start();
      const n = src(ac), f = filt(ac, 'lowpass', 220); n.connect(f); f.connect(gain(ac, .25, A.bus.street)); }
    // car: engine-off hush, a faint hum
    { const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = 58; o.connect(gain(ac, .05, A.bus.car)); o.start(); const n = src(ac), f = filt(ac, 'lowpass', 400); n.connect(f); f.connect(gain(ac, .12, A.bus.car)); }
    // breathing: filtered noise swelling in and out
    { const n = src(ac), bp = filt(ac, 'bandpass', 900, .8), g = gain(ac, .0); lfo(ac, .28, .5, g.gain); const g2 = gain(ac, .5); n.connect(bp); bp.connect(g); g.connect(g2); g2.connect(A.bus.breath); }
    // buzz: a low motor that sits under the insects
    { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 118; const lp = filt(ac, 'lowpass', 600); const g = gain(ac, .06); lfo(ac, 7, .02, g.gain); o.connect(lp); lp.connect(g); g.connect(A.bus.buzz); o.start(); }
    jazz(ac);
    score(ac);
  }

  // jazz: soft electric-piano chords with brushes, tape-wobbly. Stand-in for the score.
  function jazz(ac) {
    const out = gain(ac, 0, A.musicBus); A.jazzGain = out;
    const lp = filt(ac, 'lowpass', 2400); lp.connect(out);
    const wob = ac.createOscillator(); wob.frequency.value = .35; const wg = gain(ac, 4); wob.connect(wg); wob.start();
    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    const chords = [[50, 53, 57, 60, 64], [43, 53, 57, 59, 64], [48, 52, 55, 59, 62], [45, 49, 55, 58, 61]];
    const beat = 60 / 68; let bar = 0, next = ac.currentTime + .1;
    const note = (m, t, dur, v) => { const o = ac.createOscillator(), o2 = ac.createOscillator(), g = gain(ac, 0); o.frequency.value = mtof(m); o2.type = 'triangle'; o2.frequency.value = mtof(m) * 2; wg.connect(o.detune); const g2 = gain(ac, .08); o2.connect(g2); g2.connect(g); o.connect(g); g.connect(lp); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05); };
    const brush = t => { const s = ac.createBufferSource(); s.buffer = nb; const hp = filt(ac, 'highpass', 6000), g = gain(ac, 0); g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.001, t + .18); s.connect(hp); hp.connect(g); g.connect(lp); s.start(t, Math.random()); s.stop(t + .2); };
    const sched = () => {
      if (!A.ctx) return;
      if (A.jazzOn) while (next < ac.currentTime + 1.5) {
        const ch = chords[bar % chords.length];
        note(ch[0] - 12, next, beat * 3.6, .22);
        ch.slice(1).forEach((m, i) => note(m, next + i * .012, beat * 1.6, .07));
        ch.slice(1).forEach((m, i) => note(m, next + beat * 2.66 + i * .01, beat * 1.2, .05));
        for (let b = 0; b < 4; b++) { brush(next + b * beat); brush(next + b * beat + beat * .66); }
        next += beat * 4; bar++;
      } else next = ac.currentTime + .1;
      setTimeout(sched, 400);
    };
    sched();
  }


  // score: sparse solo piano with long room reverb. Original writing in the mellow, repeating
  // spirit of Sakamoto's music for Tony Takitani: slow arpeggios, a few held melody notes, lots of air.
  function impulse(ac, sec) {
    const n = ac.sampleRate * sec, b = ac.createBuffer(2, n, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); }
    return b;
  }
  function score(ac) {
    const out = gain(ac, 0, A.musicBus); A.scoreGain = out;
    const conv = ac.createConvolver(); conv.buffer = impulse(ac, 3.6); conv.connect(gain(ac, .5, out));
    const dry = gain(ac, .7, out), lp = filt(ac, 'lowpass', 2800), pre = gain(ac, 1);
    lp.connect(pre); pre.connect(dry); pre.connect(conv);
    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    const key = (m, t, v, dur) => {
      const f = mtof(m);
      [[1, 1, 1], [2, .34, .7], [3, .12, .5], [4, .05, .35]].forEach(([h, a, dk]) => {
        const o = ac.createOscillator(), g = gain(ac, 0); o.frequency.value = f * h * (1 + (h - 1) * .0007);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * a, t + .008);
        g.gain.exponentialRampToValueAtTime(v * a * .4, t + .3); g.gain.exponentialRampToValueAtTime(.0001, t + dur * dk + .4);
        o.connect(g); g.connect(lp); o.start(t); o.stop(t + dur * dk + .5);
      });
    };
    // A minor, 54 bpm. Each chord lasts two bars.
    const CH = [[45, 52, 59, 60], [41, 48, 52, 57], [48, 55, 59, 64], [43, 50, 55, 59], [45, 52, 60, 62], [38, 45, 53, 57], [41, 48, 55, 57], [40, 47, 52, 56]];
    const MEL = [
      [[0, 76, 2], [2, 74, 1], [3, 72, 1], [4, 71, 3], [7, 72, 1]],
      [[0, 69, 2.5], [2.5, 71, .5], [3, 72, 1], [4, 76, 4]],
      [[0, 79, 1.5], [1.5, 76, .5], [2, 74, 2], [4, 72, 2], [6, 71, 2]],
      [[0, 72, 1], [1, 71, 1], [2, 69, 4], [6, 64, 2]],
      [[0, 72, 3], [3, 74, 1], [4, 76, 2], [6, 74, 2]],
      [[0, 77, 2], [2, 76, 1], [3, 74, 1], [4, 72, 4]],
      [[0, 72, 1.5], [1.5, 71, .5], [2, 69, 2], [4, 67, 2], [6, 69, 2]],
      [[0, 68, 2], [2, 71, 2], [4, 69, 4]],
    ];
    const beat = 60 / 54; let i = 0, next = 0, started = false;
    const hum = () => (Math.random() - .5) * .03;
    const sched = () => {
      if (!A.ctx) return;
      if (A.scoreOn) {
        if (!started) { next = ac.currentTime + .2; started = true; }
        while (next < ac.currentTime + 2.5) {
          const ci = i % CH.length, ch = CH[ci], round = Math.floor(i / CH.length) % 3;
          for (let bar = 0; bar < 2; bar++) {
            const t0 = next + bar * beat * 4;
            key(ch[0] - (bar ? 0 : 12), t0 + hum(), .1, beat * 6);
            [ch[1], ch[2], ch[3], ch[2]].forEach((m, k) => key(m, t0 + beat * (1 + k * .75) + hum(), .045 + (k === 2 ? .01 : 0), beat * 4));
          }
          if (round > 0) MEL[ci].forEach(([b, m, d]) => key(m - (round === 2 ? 12 : 0), next + b * beat + hum(), .085, d * beat + 1.5));
          next += beat * 8; i++;
        }
      } else started = false;
      setTimeout(sched, 500);
    };
    sched();
  }

  A.toggle = async (want) => {
    const on = want == null ? !A.on : want;
    if (on && !A.ctx) { try { build(); } catch (e) { return false; } }
    if (!A.ctx) return false;
    if (on) await A.ctx.resume(); else await A.ctx.suspend();
    A.on = on; if (on && A.pendingBed) A.bed(A.pendingBed);
    return A.on;
  };
  /** fade the ambience beds to these levels (0..1), e.g. {insects:.8, water:.6} */
  A.bed = (lv, sec = 1.2) => {
    A.pendingBed = lv;
    if (!A.ctx) return;
    const t = A.ctx.currentTime;
    BEDS.forEach(k => A.bus[k].gain.setTargetAtTime(lv[k] || 0, t, sec / 3));
    A.jazzOn = !!lv.jazz;
    A.scoreOn = !!lv.score;
    A.scoreGain.gain.setTargetAtTime(lv.score ? lv.score * .9 : 0, t, sec / 2);
    A.jazzGain.gain.setTargetAtTime(lv.jazz ? lv.jazz * .16 : 0, t, sec / 3);
  };
  A.setLevel = (k, v) => { A.level[k] = v; if (!A.ctx) return; (k === 'amb' ? A.ambBus : A.musicBus).gain.setTargetAtTime(v, A.ctx.currentTime, .1); };

  // ---------------- one-shots ----------------
  const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0008, t + a + d); };
  function burst(f, q, peak, d, type = 'bandpass', at = 0) { const ac = A.ctx, t = ac.currentTime + at, s = ac.createBufferSource(); s.buffer = nb; const b = filt(ac, type, f, q), g = gain(ac, 0, A.fxBus); env(g, t, .005, peak, d); s.connect(b); b.connect(g); s.start(t, Math.random()); s.stop(t + d + .05); }
  function tone(f, peak, d, type = 'sine', at = 0, slide) { const ac = A.ctx, t = ac.currentTime + at, o = ac.createOscillator(), g = gain(ac, 0, A.fxBus); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); env(g, t, .01, peak, d); o.connect(g); o.start(t); o.stop(t + d + .05); }
  const FX = {
    bell: () => [2093, 2637, 3520, 5274].forEach((f, i) => tone(f, .07 / (i + 1), 1.3)),
    zippo: () => { burst(3200, 2, .3, .05); burst(1800, 1, .12, .4, 'bandpass', .12); },
    plop: () => { tone(420, .25, .18, 'sine', 0, 120); burst(900, 1, .08, .3, 'lowpass', .05); },
    ring: () => { for (let i = 0; i < 3; i++) { tone(1320, .06, .12, 'square', i * .5); tone(1760, .05, .12, 'square', i * .5 + .14); } },
    vibrate: () => { for (let i = 0; i < 2; i++) tone(150, .18, .35, 'sawtooth', i * .55); },
    beep: () => tone(880, .05, .12, 'square'),
    snip: () => burst(6000, 3, .25, .04),
    slurp: () => { burst(1400, 4, .18, .25); burst(900, 3, .12, .2, 'bandpass', .12); },
    page: () => burst(2500, .7, .15, .22, 'highpass'),
    rustle: () => burst(1800, .6, .12, .3),
    click: () => burst(4200, 3, .2, .03),
    hiss: () => burst(5000, .6, .12, 2.2, 'highpass'),
    crackle: () => { for (let i = 0; i < 10; i++) burst(3000 + Math.random() * 3000, 4, .12, .03, 'bandpass', Math.random() * .8); },
    bite: () => { burst(1200, 1, .2, .08); burst(700, 1, .14, .1, 'bandpass', .06); },
    whoosh: () => burst(800, .5, .2, .5, 'bandpass'),
    rec: () => { tone(988, .05, .08, 'sine'); tone(1318, .05, .1, 'sine', .1); },
    flip: () => { burst(2400, 3, .18, .04); tone(600, .05, .06, 'square', .04); },
  };
  A.fx = name => { if (!A.on || !A.ctx || !FX[name]) return; try { FX[name](); } catch (e) { /* ignore */ } };
})();
