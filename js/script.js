/* HOOKED — the film, scene by scene, as playable beats.
   Text follows the fifth draft. A beat = one shot: what to draw, the lines over it, and
   (sometimes) one small action. Lines in `then` play after the action is done. */
(function () {
  const { POSE, ease, ramp, clamp, lerp, poly, ngon, line, LAKE } = HK;
  const A = text => ({ who: null, text });
  const S = (text, paren) => ({ who: 'SEN', text, paren });
  const VO = text => ({ who: 'SEN (V.O.)', text });
  const BANK = text => ({ who: 'BANK VOICE (V.O.)', text, fx: 'beep' });
  const F = (vi, en, paren, mode) => ({ who: 'FISHERMAN', text: vi, sub: en, paren, mode });
  const M = (vi, en, paren, mode) => ({ who: 'HIS MOTHER', text: vi, sub: en, paren, mode });

  const since = st => st.doneAt == null ? -1 : st.t - st.doneAt;

  // ---------- shared drawing for scene 2 (under the tree) ----------
  const cup = (lvl = 1) => (c, p) => { const [x, y] = p.haR; poly(c, [[x - 4.5, y - 9], [x + 4.5, y - 9], [x + 3.5, y + 5], [x - 3.5, y + 5]], '#f4f1e8'); poly(c, [[x - 5, y - 10], [x + 5, y - 10], [x + 5, y - 8], [x - 5, y - 8]], '#e6dfcf'); line(c, [[x + 1, y - 10], [x - 3, y - 20]], '#c2551f', 1.4); };
  const book = (c, p) => { const [x, y] = p.haL; poly(c, [[x - 4, y - 14], [x + 9, y - 16], [x + 9, y + 4], [x - 4, y + 6]], '#ece6d6'); poly(c, [[x - 4, y - 14], [x - 1, y - 14.4], [x - 1, y + 5.5], [x - 4, y + 6]], '#c2551f'); };
  const senUnderTree = (c, t, pose, o = {}) => HK.fig(c, 'sen', pose, Object.assign({ x: HK.TREE.sen, y: HK.TREE.ground, s: 1.35, view: 'side', bag: true }, o));
  const gear = k => (c, p) => {
    const [hx, hy] = p.haR, [fx, fy] = p.haL;
    poly(c, [[p.shL[0] - 20, p.shL[1] - 4], [p.shL[0] - 4, p.shL[1] - 6], [p.shL[0] - 2, p.shL[1] + 30], [p.shL[0] - 18, p.shL[1] + 30]], '#556b4a');
    line(c, [[hx, hy], [hx - 46, hy - 110 + Math.sin(k * 5) * 4]], '#2a2a2a', 1.6); line(c, [[hx + 2, hy], [hx - 36, hy - 116 + Math.cos(k * 5) * 4]], '#2a2a2a', 1.6);
    line(c, [[hx, hy], [hx + 26, hy - 40]], '#7a6d58', 1.6); c.strokeStyle = 'rgba(60,60,60,.7)'; c.lineWidth = 1; c.beginPath(); c.ellipse(hx + 32, hy - 50, 9, 13, .5, 0, 7); c.stroke();
    poly(c, [[fx - 8, fy], [fx + 8, fy], [fx + 6, fy + 16], [fx - 6, fy + 16]], '#e2dccb'); line(c, [[fx - 8, fy], [fx, fy - 6], [fx + 8, fy]], '#7a7a7a', 1);
  };

  // ---------- shared drawing for the lake from the water (S) ----------
  const drawS = (c, t, o) => {
    HK.shoreS(c, t);
    const seat = (who, x, pose, fo) => { HK.chairFront(c, x, 340, 1.9); if (pose) HK.fig(c, who, pose, Object.assign({ x, y: 340, s: 1.9, view: 'front', shadow: false }, fo)); HK.chairFront(c, x, 340, 1.9, true); };
    seat('sen', 150, o.sen === null ? null : (o.senPose || POSE.senSeatFront('rest')), Object.assign({ bag: true }, o.senO));
    seat('fish', 330, o.fish === null ? null : (o.fishPose || POSE.fishSeatFront('rest')), Object.assign({ earCig: true }, o.fishO));
    if (o.after) o.after(c);
  };
  const ZS = (c, z, cx, cy, fn) => HK.zoom(c, z, cx, cy, fn);

  // ---------- the scenes ----------
  HK.SCENES = [
    {
      n: 1, slug: 'INT. BEDROOM – MORNING', bed: { room: 1, birds: .45, tick: .5, breath: .35 },
      blurb: 'Sen wakes up and gets herself off before the day starts.',
      beats: [
        { alt: 'Her bedroom in morning light. Sen is a shape under the covers.', bed: { room: 1, birds: .55, tick: .55, town: .5, breath: .35 }, enter: () => HK.audio.rate(.8), draw: (c, st) => HK.bedroom(c, st.T, { light: 'morning', lump: { breath: .5 + Math.sin(st.T * 1.4) * .5 } }),
          lines: [A('SEN (real name Sena), late 20s, is stirring under the covers. Her hair is tousled and the room is still.'), A('Outside, the distant sounds of the town waking up.')] },
        { alt: 'The foot of the bed. Her toes curl.', bed: { room: 1, tick: .35, breath: .8 }, enter: () => HK.audio.rate(1.1), draw: (c, st) => HK.toes(c, st.T, clamp(.2 + Math.sin(st.T * 1.8) * .4 + st.t * .05, 0, 1)),
          lines: [A('Her breathing turns heavy. Her toes curl.')],
          act: { type: 'tap', prompt: 'Tap to cut away', auto: 7 } },
        { alt: 'An empty small-town street at midday.', bed: { cicada: .8, hum: .5, town: 1, birds: .25, breath: .3 }, draw: (c, st) => HK.townStreet(c, st.T), lines: [A('INTERCUT. Small town views.')], act: { type: 'tap', prompt: 'Tap to cut', auto: 5 } },
        { alt: 'A lopsided sidewalk with weeds in the cracks.', bed: { cicada: .9, mower: .7, birds: .3, breath: .3 }, draw: (c, st) => HK.townSidewalk(c, st.T), lines: [A('Lopsided sidewalks and outgrown weeds.')], act: { type: 'tap', prompt: 'Tap to cut', auto: 5 } },
        { alt: 'A closed shop window and tall weeds.', bed: { cicada: .7, hum: .8, town: .6, breath: .3 }, draw: (c, st) => HK.townWeeds(c, st.T), lines: [A('A palpable sense of stagnation.')], act: { type: 'tap', prompt: 'Tap to cut back', auto: 5 } },
        { alt: 'Back in the bedroom, the covers moving faster.', bed: { room: 1, tick: .45, birds: .3, breath: .9 }, enter: () => HK.audio.rate(1.45), draw: (c, st) => HK.bedroom(c, st.T, { light: 'morning', lump: { breath: .5 + Math.sin(st.T * 2.6) * .5 } }),
          lines: [A('Pregnant pauses between each breath. She goes on, awkwardly, for a while.')] },
        { alt: 'Abstract folds of sheet and skin.', bed: { room: 1, breath: 1 }, enter: () => HK.audio.rate(1.7), draw: (c, st) => HK.curves(c, st.T), lines: [A('INTERCUT. Indistinguishable body curves.')], act: { type: 'tap', prompt: 'Tap to cut', auto: 5 } },
        { alt: 'Three childhood photos pinned to the wall.', bed: { room: 1, tick: .6, birds: .2, breath: .5 }, enter: () => HK.audio.rate(1.2), draw: (c, st) => HK.photos(c, st.T), lines: [A('Childhood photos.')], act: { type: 'tap', prompt: 'Tap to cut', auto: 5 } },
        { alt: 'Her copy of 1Q84 slides off the nightstand.', bed: { room: 1, tick: .5, breath: .5 }, enter: () => HK.audio.rate(.9), draw: (c, st) => { const k = ramp(st.t, 1.2, 2.6); if (k > .85 && !st.fx) { st.fx = 1; HK.audio.fx('thump'); } HK.bookFall(c, st.T, k); }, lines: [A('1Q84 by Haruki Murakami falls off her nightstand.')], hold: 1.6 },
        { alt: 'Black. Only her breathing.', draw: (c) => HK.rect(c, 0, 0, 480, 360, '#121418'), lines: [A('We fade out on her heavy breathing.')], hold: 1.5, bed: { breath: .7, room: .6 }, enter: () => HK.audio.rate(.7) },
      ],
    },
    {
      n: 2, slug: 'EXT. TREE – DAY', bed: { birds: .7, cicada: .45, town: .6, insects: .15 },
      blurb: 'A milkshake, a book, two phone calls about a house being sold.',
      beats: [
        { alt: 'Sen sits under a big tree, panting, her bike leaning on the trunk with a wheel still spinning.',
          draw: (c, st) => HK.tree(c, st.T, { spin: 6 * (1 - Math.exp(-st.t * .25)) * 4, under: c2 => senUnderTree(c2, st.T, (p => (p.shL[1] += Math.sin(st.T * 5) * 1.2, p))(POSE.senGround('shake')), { prop: cup(1 - (st.hold || 0) * .6), mouth: .6 }) }),
          lines: [A('Sen is sweating and panting. Her bike leans against the tree, a wheel still spinning.'), A('She reveals her milkshake in a styrofoam cup.')],
          act: { type: 'hold', prompt: 'Hold to slurp', secs: 3, fx: 'slurp' } },
        { alt: 'Close on Sen digging through her crossbody bag for earbuds and her book.',
          draw: (c, st) => ZS(c, 2.1, 214, 218, () => HK.tree(c, st.T, { spin: 0, under: c2 => senUnderTree(c2, st.T, st.doneAt != null ? POSE.senGround('book') : POSE.senGround('bag', st.T), { earbuds: st.doneAt != null, prop: st.doneAt != null ? book : null }) })),
          lines: [A('She slurps for a while, then digs into her crossbody bag for her 1Q84 and her wired earbuds.')],
          act: { type: 'tap', prompt: 'Tap to plug them in', auto: 8, done: () => HK.audio.bed({ town: .2, insects: .2, jazz: .9 }) },
          then: [A('She plugs them in and plays music. She reads and slurps for a while.')] },
        { alt: 'The book cover, a woman’s face, held exactly over Sen’s face.', bed: { birds: .25, cicada: .15, jazz: .9 },
          draw: (c, st) => HK.bookFace(c, st.T, st.taps || 0, { flip: st.flipT != null ? ramp(st.t - st.flipT, 0, .5) : 0 }),
          lines: [A('The book cover features a woman’s face. It frames hers perfectly.')],
          act: { type: 'tap', n: 3, prompt: 'Tap to turn the page', auto: 8, onTap: st => { st.flipT = st.t; HK.audio.fx('page'); } } },
        { alt: 'A fisherman loaded with gear walks into frame and blocks Sen. He bends to tie his shoe while his phone reads out his bank balance.', bed: { birds: .5, cicada: .35, town: .5, jazz: .25 },
          enter: st => { st.walkEnd = 4.2; },
          draw: (c, st) => HK.tree(c, st.T, { spin: 0, under: c2 => senUnderTree(c2, st.T, POSE.senGround('book'), { earbuds: true, prop: book }), after: c2 => {
            const out = since(st), walkIn = clamp(st.t / st.walkEnd, 0, 1);
            let x = lerp(-70, 200, walkIn), pose, k = st.T;
            if (out >= 0) { x = lerp(200, 560, clamp((out - .8) / 4, 0, 1)); pose = out < .8 ? POSE.fishStand() : POSE.fishWalk(st.T * 7); }
            else pose = walkIn < 1 ? POSE.fishWalk(st.T * 7) : POSE.fishBend(st.T);
            HK.fig(c2, 'fish', pose, { x, y: 336, s: 1.75, view: 'side', earCig: true, prop: gear(k) });
          } }),
          lines: [A('An unnamed FISHERMAN, late 50s, walks by and covers Sen in the frame. A backpack, two fishing poles, a bucket, a net. His phone is on speaker.'), A('He bends over to tie his shoe. He’s struggling while holding everything.'),
            BANK('Your available balance is…'), BANK('…negative forty-one dollars and six cents.'), BANK('Your most recent transaction was…'), BANK('…an ATM withdrawal at…'), BANK('…Golden Lotus Casino for…'), BANK('…two hundred dollars. To hear more options, press—')],
          act: { type: 'tap', prompt: 'Tap to shut the phone off', auto: 4, fx: 'flip' },
          then: [A('He shuts off his flip phone, finishes tying his shoe, and walks out of frame.')], hold: 3.2 },
        { alt: 'Sen on her own phone call, pulling at the grass.', bed: { birds: .6, cicada: .45, town: .5 },
          draw: (c, st) => { ZS(c, 2, 214, 222, () => HK.tree(c, st.T, { spin: 0, under: c2 => { senUnderTree(c2, st.T, POSE.senGround('phone', st.drag ? st.T : 0), { earbuds: false, phone: 'R', mouth: st.talking ? Math.abs(Math.sin(st.T * 8)) * .8 : 0 }); HK.grassBits(c2, st.bits || []); } })); },
          enter: st => { st.bits = []; },
          update: (st, dt) => { st.talking = st.line && st.line.who === 'SEN'; st.bits.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 60 * dt; b.a += dt * 3; }); st.bits = st.bits.filter(b => b.y < 400); },
          lines: [A('We reveal Sen on her own phone call, mid-conversation. We can’t hear the other end.'), S('I know, what the hell.', 'sighs'), A('She pulls grass blades, manically.'),
            S('Remember my hot ass room? Felt like a microwave in the summer.'), S('Yellow ass lights too.', 'chuckles'),
            S('Yeah, all gone. Now it’s all white and bright like a hospital. Fixed the hole in the door too.'),
            S('Cuz you gotta stage it to sell it, that’s why. All white people furniture.'),
            S('Even here, I can still, like, faintly smell the carpet and seeping sunlight.'),
            S('All houses have their own, but you can’t really smell it if it’s yours unless you come home from a long trip.'),
            A('She rubs her fingers together, feeling the waxy chlorophyll. The other person talks for a while.'),
            S('Yeah, or when we would bike to Sonic too!', 'excitedly'), S('Damn! I thought we lived far apart then, but look now.'), S('See, it’s like you don’t know until it’s over.')],
          act: { type: 'drag', at: 'start', optional: true, dist: 600, prompt: 'Drag to pull at the grass', onDrag: (st, x, y) => { if (Math.random() < .35) st.bits.push({ x: 222 + Math.random() * 10, y: 258, vx: (Math.random() - .3) * 60, vy: -60 - Math.random() * 50, a: Math.random() * 3 }); if (Math.random() < .05) HK.audio.fx('rustle'); } } },
        { alt: 'Phone pinned to her shoulder, Sen pulls her shoes off.',
          draw: (c, st) => ZS(c, 2, 220, 226, () => HK.tree(c, st.T, { spin: 0, under: c2 => { senUnderTree(c2, st.T, POSE.senGround('shoes'), { mouth: st.line && st.line.who === 'SEN' ? Math.abs(Math.sin(st.T * 8)) * .7 : 0, tilt: .25 }); (st.shoes || []).forEach(s => { const k = clamp((st.t - s) / .8, 0, 1); poly(c2, [[260 + k * 40, 258 - Math.sin(k * Math.PI) * 30], [272 + k * 40, 258 - Math.sin(k * Math.PI) * 30], [272 + k * 40, 261 - Math.sin(k * Math.PI) * 30], [260 + k * 40, 261 - Math.sin(k * Math.PI) * 30]], '#27324a'); }); } })),
          lines: [A('She holds the phone to her ear with her shoulder and starts to take off her shoes.'), S('Nothing changes, though.'), S('I dunno.')],
          act: { type: 'tap', at: 'start', optional: true, n: 2, prompt: 'Tap to kick off a shoe', onTap: st => { (st.shoes = st.shoes || []).push(st.t); HK.audio.fx('rustle'); } } },
        { alt: 'Her phone buzzing with another call.',
          draw: (c, st) => HK.phoneClose(c, st.T, { buzz: st.doneAt == null, label: 'on call' }),
          enter: st => { st.ringT = 0; }, update: (st, dt) => { if (st.doneAt == null) { st.ringT -= dt; if (st.ringT <= 0) { st.ringT = 1.4; HK.audio.fx('vibrate'); } } },
          lines: [A('Her phone buzzes. She’s getting another call.'), S('Hold up, one sec.')],
          act: { type: 'tap', prompt: 'Tap to switch calls', auto: 6, fx: 'click' },
          then: [S('Yeah.'), S('Mhm.'), S('I dunno, whatever you want.'), S('I dunno, I dunno, ’kay bye.', 'rushing')] },
        { alt: 'Sen holds the phone out at arm’s length and squints at it.',
          draw: (c, st) => ZS(c, 2.4, 206, 206, () => HK.tree(c, st.T, { spin: 0, under: c2 => { const p = POSE.senGround('phone'); if (st.t < 3) { p.haR = [24, -52]; p.elR = [12, -44]; } senUnderTree(c2, st.T, p, { phone: 'R', eyes: st.t < 3 ? 'squint' : 'open', mouth: st.line && st.line.who === 'SEN' ? Math.abs(Math.sin(st.T * 8)) * .7 : 0 }); } })),
          lines: [A('She holds the phone out and squints at it before switching back.'), S('Hello? Yeah.'), S('Yeah, I’ll have to check out the one over here.', 'chuckles'), S('I don’t know where yet, but there’s a bait-and-tackle shop nearby.')] },
        { alt: 'Sen lies on her back under the tree with her feet in the air.', bed: { birds: .7, cicada: .5, town: .5 },
          draw: (c, st) => HK.tree(c, st.T, { spin: 0, under: c2 => HK.fig(c2, 'sen', POSE.senLie(st.T * .8), { x: 232, y: 268, s: 1.35, view: 'side', phone: 'R', tilt: -1.45 }) }),
          lines: [A('Sena lies out on her back, her feet in the sky. Her conversation goes on, out of earshot.')], hold: 2.4 },
      ],
    },
    {
      n: 3, slug: 'EXT. LAKE – DAWN', bed: { insects: .55, water: .6, birds: .35 },
      blurb: 'She sits down next to a stranger and talks about cocoons.',
      beats: [
        { alt: 'A wide, meek lake at dawn. The fisherman sits on the shore beside an empty camp chair.',
          draw: (c, st) => { const out = since(st); ZS(c, .8, 240, 250, () => HK.lakeA(c, st.T, { fish: 'seat', fishO: { earCig: true }, sen: out > 3.6 ? 'seat' : 'none', rod: { line: false }, after: c2 => { if (out >= 0 && out <= 3.6) HK.fig(c2, 'sen', POSE.senWalk(st.T * 6.5), { x: lerp(600, LAKE.SEN + 8, clamp(out / 3.4, 0, 1)), y: 338, s: 1.25, view: 'side', flip: true, bag: true }); } })); },
          lines: [A('A meek view. Not much movement besides the insects and the ripples in a mediocre lake.'), A('The unnamed fisherman, very unkempt, sits on the lip of the shore.')],
          act: { type: 'hot', hot: [272, 270, 38], prompt: 'Tap the empty chair', auto: 8 },
          then: [A('Sen walks over to him and parks herself in the empty chair beside him.')], hold: 1.2 },
        { alt: 'From behind the two chairs: their heads turn toward each other and away, again and again.', bed: { insects: 1, water: .45 },
          draw: (c, st) => { const k = Math.sin(st.T * 1.1), nod = st.line && st.line.text.includes('nod') ? ramp(st.lineT, .2, 1.4) : 0; HK.lakeA(c, st.T, { fish: 'seat', fishO: { turn: clamp(k * 1.6, -1, 1) * .9, nod, earCig: true }, sen: 'seat', senO: { turn: clamp(-k * 1.6 + .4, -1, 1) * -.9 }, rod: { line: false } }); },
          lines: [A('From afar, the two share an abnormally long, silent, awkward exchange of head turns.'), A('Like two owls of the night.'), A('He offers a faint nod.')],
          act: { type: 'wait', secs: 4, prompt: 'Sit still' },
          then: [A('The rubbing of insect legs swells. The two go still for a while.')] },
        { alt: 'Facing them from the water. He stretches fishing line to arm’s width, snips it, and ties a hook with his mouth, then offers it to her.',
          draw: (c, st) => { const k = st.t, arms = since(st) >= 0 || st.lineIdx >= 1 ? 'offer' : k < 3 ? 'stretch' : 'tie'; ZS(c, 1.35, 260, 250, () => drawS(c, st.T, { fishPose: POSE.fishSeatFront(arms, ease(clamp(k / 2, 0, 1))), fishO: { mouth: 0 }, senO: { eyes: 'open' } })); if (k > 2.9 && !st.snip) { st.snip = 1; HK.audio.fx('snip'); } },
          lines: [A('If we squint, we notice the fisherman stretch some fishing line out to his arm’s width. He snips it, then ties on a hook, using his mouth to help.'), A('He offers it to her.')],
          act: { type: 'choice', choices: ['Take it', 'I’ll just watch'], auto: 9 },
          then: [S('Oop, no it’s ’kay. I’ll just watch.')] },
        { alt: 'Close on his hands threading a bullet weight and a bead onto the line.',
          draw: (c, st) => HK.rig(c, st.T, (st.taps || 0) + (st.doneAt != null ? 0 : 0)),
          lines: [A('He threads a bullet weight and a bead onto the end of his main line, then connects the hook line to it.')],
          act: { type: 'tap', n: 3, prompt: 'Tap to thread it', auto: 8, onTap: () => HK.audio.fx('click') },
          then: [A('He looks like a puppeteer playing with strings.')] },
        { alt: 'From behind, Sen leans toward him to see what he’s doing.',
          draw: (c, st) => ZS(c, 1.45, 236, 250, () => HK.lakeA(c, st.T, { fish: 'seat', fishO: { earCig: true }, sen: 'seat', senO: { turn: -ease(clamp(st.t / 1.2, 0, 1)) }, rod: { line: false }, under: c2 => { } })),
          lines: [A('She leans over to see what he’s doing.')], hold: 1 },
        { alt: 'Close on the bait: two orange eggs and a cut pink worm on the hook. Focus pulls onto it.',
          draw: (c, st) => HK.bait(c, st.T, st.taps || 0, since(st) >= 0 ? ease(clamp(since(st) / 1.5, 0, 1)) : 0),
          lines: [A('A jar of PowerBait eggs. A pack of PowerBait worms. Two eggs and one worm, cut short, all hooked together.')],
          act: { type: 'tap', n: 3, prompt: 'Tap to bait the hook', auto: 8, onTap: () => HK.audio.fx('click') },
          then: [A('We pull focus on the bait, which now looks like a penis.')] },
        { alt: 'He cocks the pole back over his shoulder and casts. The bobber flies out and plops into the lake.',
          draw: (c, st) => { const out = since(st), fly = out >= 0 ? clamp(out / .9, 0, 1) : null; if (fly === 1 && !st.plop) { st.plop = 1; HK.audio.fx('plop'); }
            ZS(c, 1.25, 180, 240, () => HK.lakeA(c, st.T, { fish: 'seat', fishO: { arms: 'cast', castK: out >= 0 ? 1 - fly : st.pull || 0, earCig: true }, sen: 'seat', senO: { turn: -.3 }, rod: out >= 0 && fly >= 1 ? { line: true } : { held: { k: out >= 0 ? 1 - ease(fly * 2) : (st.pull || 0), fly: out >= 0 ? fly : null, to: LAKE.BOB } } })); },
          lines: [A('He gently cocks the pole back over his shoulder…')],
          act: { type: 'flick', prompt: 'Drag down to pull back, then let go', auto: 8 },
          then: [A('…then casts it forward. We hear the plop and imagine the sink.')] },
        { alt: 'The rod rests in its holder. He clips a small brass jingle bell to the tip.',
          draw: (c, st) => ZS(c, 1.6, 140, 220, () => HK.lakeA(c, st.T, { fish: 'seat', fishO: { earCig: true }, sen: 'seat', rod: { line: true, bell: st.doneAt != null } })),
          lines: [A('He places the pole into the holder and clips on a jingle bell, then retreats to his seat.')],
          act: { type: 'hot', hot: [140 + (108 - 140) * 1.6, 220 + (176 - 220) * 1.6, 32], prompt: 'Tap the tip to clip on the bell', auto: 7, fx: 'bell' } },
        { alt: 'Facing them from the water. He pats himself down, pulls out a pack of cigarettes and a Zippo, and lights up.',
          draw: (c, st) => { const out = since(st), lit = out >= .5; ZS(c, 1.35, 300, 250, () => drawS(c, st.T, { fishPose: POSE.fishSeatFront(out >= 0 ? (lit ? 'smoke' : 'light') : 'pat', st.T), fishO: { cig: out >= 0, earCig: out < 0 }, after: c2 => { if (out >= 0 && out < .9) { poly(c2, ngon(332, 165, 3, 5, 6), '#ffb45c'); } if (lit) HK.smoke(c2, 349, 164, st.T); } })); },
          lines: [A('Without a word, the fisherman pats himself down. A smoke break.'), A('A pack of cigarettes, then a Zippo lighter.')],
          act: { type: 'tap', prompt: 'Tap to light up', auto: 7, fx: 'zippo' },
          then: [A('He lights up. It’s just him smoking for a while.')] },
        { alt: 'From behind, both seated. Sen talks about a novel while he smokes. Threads can be pulled from the sky.',
          enter: st => { st.T2 = { threads: [], drawing: null, woven: 0 }; },
          update: (st, dt) => { const T = st.T2; T.threads.forEach(th => th.age += dt); const d = T.threads.filter(th => th.age > 2.2); if (d.length) { T.woven += d.length; T.threads = T.threads.filter(th => th.age <= 2.2); } },
          draw: (c, st) => HK.lakeA(c, st.T, { fish: 'seat', fishO: { smoke: true }, sen: 'seat', senO: { talk: st.line && st.line.who === 'SEN' }, rod: { line: true, bell: true }, sky: c2 => HK.drawThreads(c2, st.T, st.T2) }),
          lines: [A('She attempts to break the ice.'),
            S('Y’know, I’m reading this novel where these little spirit things come out from a dead goat’s mouth.'), S('They start to pull threads out of thin air.'), S('Pale, unearthly threads.'),
            S('These threads are so faint and almost transparent.'), S('The little spirits then begin to gather and weave them slowly.'),
            S('And miraculously, they begin to take shape and become a certain something.'), S('Something I could only vaguely describe as a cocoon.'),
            S('I imagined it as colorless and weightless, but the thought of it being conceived from thin air?'), S('Like, does the weight of a concept hold form as equally heavy in reality?')],
          act: { type: 'drag', at: 'start', optional: true, dist: 99999, prompt: 'Drag across the sky to pull a thread',
            onDown: (st, x, y) => { if (y < LAKE.HZ - 6) st.T2.drawing = [[x, y]]; },
            onDrag: (st, x, y) => { const D = st.T2.drawing; if (!D) return; const l = D[D.length - 1]; if (Math.hypot(x - l[0], y - l[1]) > 4 && D.length < 60) D.push([x, clamp(y, 4, LAKE.HZ - 4)]); },
            onUp: st => { const D = st.T2.drawing; st.T2.drawing = null; if (D && D.length > 6) st.T2.threads.push({ pts: D, age: 0 }); } } },
        { alt: 'He stands up mid-sentence and walks out of frame to the left. She keeps talking to his empty chair.',
          draw: (c, st) => { const k = st.t; HK.lakeA(c, st.T, { fish: 'none', sen: 'seat', senO: { talk: true }, rod: { line: true, bell: true }, after: c2 => { if (k < 1) HK.fig(c2, 'fish', POSE.fishStand(), { x: LAKE.FISH, y: 338, s: 1.28, view: 'back', earCig: false }); else if (k < 5) HK.fig(c2, 'fish', POSE.fishWalk(st.T * 7), { x: lerp(LAKE.FISH, -80, (k - 1) / 4), y: 338, s: 1.28, view: 'side', flip: true, cig: true }); } }); },
          lines: [A('Mid-conversation, the fisherman exits the frame and leaves her by herself.'), S('Conceptually, it doesn’t make sense, and yet, there the threaded cocoon is.')], hold: 1 },
        { alt: 'Close on a loose thread at the hem of her black tee. She twirls it around her finger.',
          draw: (c, st) => HK.hem(c, st.T, clamp((st.drag || 0) / 500, 0, 1), st.doneAt != null),
          lines: [A('She exhales loudly. A loose thread at the end of her shirt.')],
          act: { type: 'drag', dist: 500, prompt: 'Drag to twirl it around her finger', auto: 8, fx: 'snip' },
          then: [A('She twirls it around her finger and snaps it off.')] },
        { alt: 'Facing her from the water. Sen alone, his chair empty, staring at the dirt.',
          draw: (c, st) => ZS(c, 1.5, 170, 250, () => drawS(c, st.T, { fish: null, senPose: POSE.senSeatFront('talk', st.T), senO: { mouth: st.line && st.line.who === 'SEN' ? Math.abs(Math.sin(st.T * 8)) * .8 : 0, tilt: .12 } })),
          lines: [A('She fixates down at the dirt. She still hasn’t noticed his absence.'), S('Have you ever had a fever dream?'), S('I get these overwhelming sensory overloads at night.')] },
        { alt: 'A dream: a giant faceted ball rolls down a lavender slope after a tiny running Sen.',
          draw: (c, st) => HK.feverBall(c, st.T, clamp(st.t / 9, 0, 1)), bed: { insects: .3, water: .3, breath: .2 },
          lines: [S('This one time, a giant ball was rolling down a slope coming after me, and I just had to keep running and running.')], hold: 1 },
        { alt: 'A dream: a tall room walled with screens of changing green numbers.',
          draw: (c, st) => HK.feverCode(c, st.T), bed: { insects: .3, water: .2, buzz: .2 },
          lines: [S('Another time, there was this giant room with tall walls of computers.'), S('There were green numbers all around, calculating, coding, and rapidly changing in all sorts of ways.')] },
        { alt: 'Back on Sen, alone, talking to no one.',
          draw: (c, st) => ZS(c, 1.5, 170, 250, () => drawS(c, st.T, { fish: null, senPose: POSE.senSeatFront('talk', st.T), senO: { mouth: st.lineIdx === 0 ? clamp(Math.sin(st.lineT * 1.5), 0, 1) * 2.5 : st.line && st.line.who === 'SEN' ? Math.abs(Math.sin(st.T * 8)) * .8 : 0, eyes: st.lineIdx === 0 && st.lineT > .4 && st.lineT < 2 ? 'closed' : 'open' } })),
          lines: [A('She leaves a pregnant pause for a forced yawn.'),
            S('It’s like, without you even knowing it, all this internal non-atomic mind sludge just gets so aggressively dense…'),
            S('…and then the images just bake and break and play over your pupils like a projector over a screen.'),
            S('At first you find yourself here, and then you find yourself there.'),
            S('And then all of a sudden, woven together, is something I, too, would only be able to describe vaguely as a cocoon.'),
            S('Pale, unearthly, faint threads of my own hopes and fears woven into a certain something.', 'exhausted'),
            S('Never yet convinced that it will be a butterfly and not a moth.')] },
        { alt: 'From behind. Sen opens her arms to the lake; a gust pushes back off the water. She slumps into a nap.',
          draw: (c, st) => { const out = since(st), open = out >= 0 ? ease(clamp(out / 1, 0, 1)) * (1 - ease(clamp((out - 3) / 1, 0, 1))) : 0, wave = out > 1 ? clamp((out - 1) / 2, 0, 1) : 0, doze = st.napT != null ? ease(clamp((st.t - st.napT) / 2, 0, 1)) : 0;
            HK.lakeA(c, st.T, { fish: 'none', sen: 'seat', senO: { arms: open > .02 ? 'open' : 'none', armK: open, doze }, rod: { line: true, bell: true }, wave: wave > 0 && wave < 1 ? wave : 0 }); },
          update: st => { if (st.napT == null && st.line && st.line.text.startsWith('A faint laugh')) st.napT = st.t; },
          lines: [A('She looks out at the water and offers it her open arms.')],
          act: { type: 'tap', prompt: 'Tap to open her arms', auto: 6, fx: 'whoosh' },
          then: [A('It rejects her.'), S('I miss my old room.', 'sighs'), A('A faint laugh barely escapes her. She forces a nap: head back, arms crossed, slumped into the chair.')], hold: 2.5 },
      ],
    },
    {
      n: 4, slug: 'EXT. LAKE – SAME TIME', bed: { insects: .45, water: .45, birds: .3 },
      blurb: 'His end of the shore. His mother calls.',
      beats: [
        { alt: 'From his end of the shore. The fisherman stands in the foreground smoking; far off, Sena talks to his empty chair. His flip phone rings.',
          enter: st => { st.ringT = 2.5; },
          update: (st, dt) => { if (st.doneAt == null && st.lineIdx >= 1) { st.ringT -= dt; if (st.ringT <= 0) { st.ringT = 2; HK.audio.fx('ring'); } } },
          draw: (c, st) => { const on = st.doneAt != null; HK.lakeW(c, st.T, { senTalk: true, after: c2 => { const p = on ? POSE.fishPhone(st.T, 'smoke') : (q => (q.elL = [6, -84], q.haL = [11, -112], q))(POSE.fishStand()); HK.fig(c2, 'fish', p, { x: 400, y: 344, s: 1.5, view: 'side', flip: true, phone: on ? 'R' : null, cig: false, earCig: true }); HK.smoke(c2, 400 - 11 * 1.5, 344 - 113 * 1.5, st.T); } }); },
          lines: [A('Mid-conversation, he exits. We see him off to the side at a new angle, with Sena rambling to herself in the distance.'), A('He takes several puffs before his flip phone rings. It’s his mother. We can’t hear her.')],
          act: { type: 'tap', prompt: 'Tap to answer it', auto: 6, fx: 'flip' },
          then: [F('Ừm.', 'Yes.', 'exhales'), F('Ừm.', 'Mhm.'), F('Đàn bà thôi mà.', 'Just some woman.'), F('Tất nhiên là không. Con nhỏ này điên mà.', 'Surprisingly no. This bitch is crazy.'), F('Nó chỉ đang coi dây câu của tui thôi.', 'She’s just watching my line.')] },
        { alt: 'A slow push in on Sena, far down the shore, still talking to no one.',
          draw: (c, st) => { const z = lerp(1, 3.4, ease(clamp(st.t / 9, 0, 1))); HK.zoom(c, z, HK.W_CHAIRS.sen[0], HK.W_CHAIRS.sen[1] - 16, () => HK.lakeW(c, st.T, { senTalk: true })); },
          lines: [A('He squints toward Sena.'), A('We cut to a slow push in on Sena, still rambling.')], hold: 3 },
      ],
    },
    {
      n: 5, slug: 'INT. BEDROOM – AFTERNOON', bed: { room: 1, tick: .4, birds: .35, cicada: .2, town: .4 },
      blurb: 'A voice memo, recorded at a march.',
      beats: [
        { alt: 'Her bedroom in bright afternoon light. Sena marches back and forth recording a voice memo.',
          draw: (c, st) => { const x = 240 + Math.sin(st.T * .7) * 90, dir = Math.cos(st.T * .7) > 0; HK.bedroom(c, st.T, { light: 'afternoon', made: true, after: c2 => { HK.fig(c2, 'sen', POSE.senMarch(st.T * 5), { x, y: 330, s: 1.45, view: 'front', phone: 'R', flip: !dir }); if (st.hold > 0 && st.doneAt == null || (st.doneAt != null && st.line && st.line.who)) { poly(c2, ngon(30, 30, 5, 5, 10), Math.sin(st.T * 6) > 0 ? '#d0452a' : '#8a2e1c'); HK.text(c2, 'REC', 40, 30, 10, '#8a2e1c', 'left', 800); } } }); },
          lines: [A('Sena is in her bedroom wearing over-the-knee basketball shorts. We catch her in the middle of recording a voice memo.'), A('She paces back and forth, exaggerated, like a marching soldier.')],
          act: { type: 'hold', prompt: 'Hold to record', secs: 2, fx: 'rec' },
          then: [VO('Your personality replaces itself every seven years.'), VO('Which means I’ve been a stranger to myself at least three times.')] },
      ],
    },
    {
      n: 6, slug: 'EXT. STREET – EVENING', bed: { street: .8, town: .2 },
      blurb: 'A snake firework and a sparkler, alone.',
      beats: [
        { alt: 'Dusk on a residential sidewalk. Sena crouches over a black snake firework as it grows.',
          draw: (c, st) => { const out = since(st), k = out >= 0 ? clamp(out / 7, 0, 1) : 0; HK.street(c, st.T); HK.fig(c, 'sen', POSE.senCrouch(0), { x: 200, y: 304, s: 1.6, view: 'side', eyes: k > .3 ? 'squint' : 'open', mouth: k > .5 ? .4 : 0 }); HK.snake(c, st.T, 268, 304, k); },
          lines: [A('Sena is wearing cheap flip-flops and an enormous shirt. She is crouched over on the sidewalk.'), A('She’s watching one of those poopy snake fireworks.')],
          act: { type: 'tap', prompt: 'Tap to light it', auto: 6, fx: 'hiss' },
          then: [A('It’s anticlimactic, but oddly satisfying to her. It shows on her face.'), VO('I don’t even know what I look like without other people’s eyes.')], hold: 1 },
        { alt: 'Sena squats with a lit sparkler held up near her mouth like a cigarette. It lights her face.',
          draw: (c, st) => { const h = st.hold || 0, lit = h > 0 || st.doneAt != null, P = POSE.senCrouch(0); P.elR = [20, -50]; P.haR = [32, -50]; P.elL = [16, -42]; P.haL = [24, -34]; const tip = [200 + 46 * 1.6, 304 - 62 * 1.6]; ZS(c, 1.5, 240, 250, () => { HK.street(c, st.T, { glow: lit ? [tip[0], tip[1], 150] : null }); HK.fig(c, 'sen', P, { x: 200, y: 304, s: 1.6, view: 'side', eyes: lit ? 'open' : 'open', prop: (c2, p) => { line(c2, [p.haR, [46, -62]], '#3a3a3a', 1.1); } }); if (lit) HK.sparks(c, st.T, tip[0], tip[1], 26, 24); }); if (lit && Math.random() < .08) HK.audio.fx('crackle'); },
          lines: [A('Then she lights a sparkler for herself, squatting over.')],
          act: { type: 'hold', prompt: 'Hold to keep it lit', secs: 3 },
          then: [A('It almost looks like she’s smoking it. It illuminates her nicely.')], hold: 1.5 },
      ],
    },
    {
      n: 7, slug: 'INT. CAR – NIGHT', bed: { car: .9, street: .2 },
      blurb: 'An Ultimate Cheeseburger and anime in a parked car.',
      beats: [
        { alt: 'Through the car window at night: Sena eats a cheeseburger in the driver’s seat, legs splayed, lit by her phone.',
          draw: (c, st) => { const b = st.taps || 0; HK.car(c, st.T, { after: c2 => { const p = POSE.senSeatSide(0); p.knR = [17, -60]; p.ftR = [12, -40]; p.knL = [22, -36]; p.ftL = [26, -2]; const chew = st.biteT != null && st.t - st.biteT < .5; p.haR = chew ? [9, -82] : [16, -70]; p.elR = [16, -56]; p.haL = [20, -58]; p.elL = [9, -54]; HK.fig(c2, 'sen', p, { x: 170, y: 250, s: 1.55, view: 'side', mouth: chew ? 1 : 0, shadow: false }); HK.burger(c2, 170 + p.haR[0] * 1.55 + 4, 250 + p.haR[1] * 1.55 - 6, b, 1.1); } }); },
          lines: [A('Sena is eating an Ultimate Cheeseburger from Jack in the Box.'), A('Her legs are spread out funny, and she’s watching ecchi anime on her phone.')],
          act: { type: 'tap', at: 'start', n: 4, prompt: 'Tap to take a bite', auto: 10, onTap: st => { st.biteT = st.t; HK.audio.fx('bite'); } }, hold: 1.5 },
      ],
    },
    {
      n: 8, slug: 'INT. BEDROOM – MIDNIGHT', bed: { buzz: .7, room: 1, tick: .45 },
      blurb: 'Under the sheets. The buzzing turns into insects.',
      beats: [
        { alt: 'Her bedroom at midnight, blue and dark. The covers tremble.',
          update: st => { const k = clamp(st.t / 8, 0, 1); HK.audio.bed(HK.withScore({ buzz: .7 * (1 - k), insects: k * .9, room: 1 - k, tick: .45 * (1 - k) }), .5); },
          draw: (c, st) => HK.bedroom(c, st.T, { light: 'midnight', lump: { breath: .4 + Math.sin(st.T * 2) * .3, buzz: 1 - clamp(st.t / 9, 0, .7) } }),
          lines: [A('Sena is using her vibrator underneath the sheets.'), A('The vibration starts to match the buzzing of the insects.')], hold: 3 },
      ],
    },
    {
      n: 9, slug: 'EXT. LAKE – MOMENTS LATER', bed: { insects: .65, water: .5, birds: .3 },
      blurb: 'His mother, the cigarette, the bell.',
      beats: [
        { alt: 'Close on Sena asleep in her chair. Over her shoulder, the fisherman paces on the phone. Focus moves to him.',
          update: st => { if (st.lineIdx >= 1 && st.focusT == null) st.focusT = st.t; },
          draw: (c, st) => { const f = st.focusT != null ? ease(clamp((st.t - st.focusT) / 2.2, 0, 1)) : 0, mode = (st.line && st.line.mode) || (st.line && st.line.who === 'FISHERMAN' ? 'wave' : 'calm'); HK.catnap(c, st.T, { focus: f, fishMode: mode }); },
          lines: [A('A close-up of Sena’s catnap face. Over her shoulder, the fisherman is animatedly speaking with his mother over the phone.'), A('We pull focus on him. Now she is audible. The conversation is in Vietnamese.'),
            M('Tao thiệt không tin mày đi câu với con đĩ nào đó mà không lo cho con gái mày.', 'Can’t believe you’d go fishing with some whore and not take care of your own daughter.', 'exasperated'),
            F('Tui nói má rồi, tự nhiên nó ra đây chớ có phải lỗi tui.', 'I told you, she just appeared out of nowhere. Not my fault.', 'frustrated', 'wave'),
            M('Con đó hay con gái của mày?', 'That whore or your daughter?'),
            M('Đúng là thằng ngu. Gì cũng đổ hô người khác.', 'Foolish son. Nothing is ever your fault nowadays.'),
            M('Mày cũng hổng khá hơn con cá mà mày bắt hông nổi.', 'You’re no better than the trout you cannot catch.'),
            Object.assign(A('He is animatedly furious.'), { mode: 'wave' }),
            F('Bắt làm gì? Ra chợ mua cho nhanh. Tui gửi tiền về hoài.', 'Why fish when you can just buy it at the market? I send you money all the time.', null, 'wave'),
            F('Mệt quá!', 'Fuck’s sake.', null, 'wave'),
            M('Đồ ngu. Mày không thấy nhục sao? Lúc nào cũng muốn nhanh.', 'Foolish son. Have you no shame? Always in favor of quick fixes.'),
            M('Mày chẳng có kiên nhẫn. Bởi vậy làm sao mà đòi câu cá.', 'You have no patience. That is why a boy cannot fish.'),
            A('He throws out his cigarette and gulps.'),
            F('Tui có tự trọng. Tui kiếm tiền đàng hoàng. Mấy con cá trong ao này thì nhằm nhò gì.', 'I have my pride. I earn my way. I feed more than what shitty lake fish have to offer.', null, 'wave'),
            M('Thằng ngu. Mày, cha mày, rồi ông nội mày, cả đời cờ bạc.', 'Foolish son. You and your father and before, his father. Gambling your life away.', 'sighs'),
            M('Đồng tiền dơ dáy của mày chẳng đáng một xu. Hệt như cá ngoài chợ thôi.', 'Your crooked money is no good. Just like market fish.'),
            F('Má ngốc! Tui chơi bài cũng kiếm tiền về. Má biết gì chớ. Cả ngày chỉ ngồi không.', 'Stupid. I play the tables and I win it back. You’ve no idea. All you do is sit around.', 'laughs', 'wave'),
            Object.assign(A('There is a long pause.'), { waitIdle: 3.5, prompt: 'Don’t say anything' }),
            M('Dìa đi con. Không lâu nữa, con gái mày sẽ chẳng nhớ nổi mùi của mày đâu.', 'Come home, my son. Before long, your daughter will not remember what you smell like.'),
            Object.assign(A('He kicks at the gravel and scratches the back of his head.'), { mode: 'kick' }),
            F('Mùi khói thuốc với áo hôi hám có gì đâu mà nhớ?', 'Smoke and denim are not how a daughter should remember her father.', 'laughs', 'scratch'),
            M('Hổng phải mày nhớ ông mày như vậy sao?', 'That’s how you remember, no?', 'harshly'),
            A('He looks out to the lake, then at Sena, and then back at the ground beneath his feet.'),
            F('Thôi. Nói sau.', 'Tsk. Later.')] },
        { alt: 'From behind. He walks back from the left, lighting a new cigarette, and sits. Sena is still asleep.',
          draw: (c, st) => { const k = st.t; if (k > .6 && !st.z) { st.z = 1; HK.audio.fx('zippo'); } HK.lakeA(c, st.T, { fish: k > 4.4 ? 'seat' : 'none', fishO: { smoke: true }, sen: 'seat', senO: { doze: 1 }, rod: { line: true, bell: true }, after: c2 => { if (k <= 4.4) HK.fig(c2, 'fish', k < 1.2 ? POSE.fishPhone(st.T, 'smoke') : POSE.fishWalk(st.T * 7), { x: k < 1.2 ? -10 : lerp(-10, LAKE.FISH, (k - 1.2) / 3.2), y: 338, s: 1.28, view: 'side', cig: true }); if (k <= 4.4) HK.smoke(c2, (k < 1.2 ? -10 : lerp(-10, LAKE.FISH, (k - 1.2) / 3.2)) + 18, 186, st.T); } }); },
          lines: [A('He hangs up, lights another cigarette, then heads back to Sena.')], hold: 3.4 },
        { alt: 'From behind. Sena wakes and stretches, then reaches across and takes the cigarette from his mouth.',
          draw: (c, st) => { const out = since(st), stretch = st.t < 3 ? Math.sin(clamp(st.t / 3, 0, 1) * Math.PI) : 0, reach = out >= 0 ? Math.sin(clamp(out / 1.6, 0, 1) * Math.PI) : 0, hers = out >= .8;
            HK.lakeA(c, st.T, { fish: 'seat', fishO: { smoke: !hers }, sen: 'seat', senO: { doze: clamp(1 - st.t / 1.5, 0, 1), arms: reach > .02 ? 'reach' : (hers ? 'cig' : (stretch > .02 ? 'stretch' : 'none')), armK: reach > .02 ? reach : stretch }, rod: { line: true, bell: true } }); },
          lines: [A('She is waking up from her little catnap. She stretches while he finds his seat.')],
          act: { type: 'hot', hot: [LAKE.FISH + 12, 226, 28], prompt: 'Tap his cigarette', auto: 7 },
          then: [A('She reaches across for the cigarette in his mouth, takes it out gently, and puffs it, all while staring straight out at the lake.')], hold: 1 },
        { alt: 'From behind. He turns his face toward her and stares. Then both look at the water. Nothing bites until you stop doing anything.',
          enter: st => { st.bite = 0; },
          update: (st, dt) => { if (st.doneAt != null) { st.bite += dt; if (Math.floor(st.bite * 1.4) !== Math.floor((st.bite - dt) * 1.4)) HK.audio.fx('bell'); } },
          draw: (c, st) => { const out = since(st), look = st.lineIdx === 0 ? ease(clamp(st.lineT / 1.2, 0, 1)) : st.lineIdx === 1 ? 1 - ease(clamp(st.lineT / 1.5, 0, 1)) : 0, up = out > 2.2;
            HK.lakeA(c, st.T, { fish: up ? 'none' : 'seat', fishO: { turn: look * .9 }, sen: up ? 'none' : 'seat', senO: { arms: 'cig' }, rod: { line: true, bell: true, bite: out >= 0 ? st.bite : 0 }, after: c2 => { if (up) { const j = Math.sin(st.T * 14) * 2; HK.fig(c2, 'fish', POSE.fishStand(), { x: LAKE.FISH - 10 + j, y: 338, s: 1.28, view: 'back' }); HK.fig(c2, 'sen', POSE.senStand(), { x: LAKE.SEN - 6 - j, y: 338, s: 1.28, view: 'back' }); } } }); },
          lines: [A('He turns just his face toward her. He stares for a long time while she continuously puffs.'), A('He then looks out toward the lake as well.')],
          act: { type: 'wait', secs: 8, prompt: 'Wait for a bite' },
          then: [A('After a pregnant pause, the jingle bell on the pole begins to ring.'), A('They frantically get up.')], hold: 3 },
        { alt: 'The end.', draw: (c) => HK.rect(c, 0, 0, 480, 360, '#121418'), bed: { insects: .3, water: .2 }, lines: [A('THE END')], hold: 1.6, end: true },
      ],
    },
  ];
})();
