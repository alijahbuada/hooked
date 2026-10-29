# HOOKED

A playable version of **HOOKED**, a short film by Alijah Jacob Buada (Twice Removed Productions), in a low-poly PS2-summer style.

- `index.html` — the film, all 9 scenes of the fifth draft, played beat by beat. Nothing bites until you stop trying.
- `lake.html` — free play: sit by the lake, cast, pull threads, catnap.

Everything is plain HTML, CSS and JavaScript. No build step, no dependencies, and all sound is synthesized in the browser.

## Put it on GitHub Pages

1. Create a new repository (for example `hooked`) and upload everything in this folder, keeping the `css/` and `js/` folders.
2. In the repository, go to **Settings → Pages**, set **Source** to *Deploy from a branch*, pick `main` and `/ (root)`, and save.
3. After a minute it's live at `https://<your-username>.github.io/hooked/`.

Link straight to a scene with `#scene-3` (and so on) at the end of the URL.

## Editing the script

All dialogue and action lines live in `js/script.js`, one scene per block, in the order of the screenplay. Change the text in quotes and push; nothing else needs to change.

- `S('…')` is Sen, `VO('…')` is Sen in voice-over, `F('Vietnamese', 'English')` is the fisherman, `M(…)` is his mother, `A('…')` is an action line.
- An `act` is the one small thing the viewer does in that shot. Every act finishes on its own after a few idle seconds, except the `wait` acts, which only finish while you do nothing.

Opening `index.html` by double-click works too; a local server is not required.
