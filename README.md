# Lost Tourist

A deadpan, mean, browser-based 2D platformer for desktop. Chapters are historical places,
drawn as exactly as we can manage. No text, no hints. The level is always the same. You
learn by dying.

Design rules are in [PILLARS.md](PILLARS.md). Read them before adding a trap.
Art and history live in [content/](content/README.md). Read that before drawing anything.

## Environments

| | Branch | Link |
|---|---|---|
| prod | `main` | https://losttourist.online |
| dev | `dev` | https://dev.losttourist.online |

Both are one Cloudflare Pages project, deployed per branch, so a push to `dev` leaves
prod alone and either side rolls back on its own. Only prod is indexable: the dev build
ships a `noindex` meta tag and an `X-Robots-Tag` header, and prod claims the canonical
URL.

Flow: work on a feature branch, open a pull request into `dev`, then promote `dev` to
`main` when it has been played and survived. Every push runs CI (typecheck, asset check,
build, headless playthroughs). Every push to `main` or `dev` redeploys that one link. The
footer of each page shows which environment and commit it is.

## Run

```
npm install
npm run dev
```

Arrows or WASD to move, Space to jump, L to switch the headlamp off and on once it is lit
(it only runs down while it burns), R to give up (it counts), M to mute, Enter for the
next level at the exit label. Esc returns to the map. Open `#cap-blanc`,
`#roc-aux-sorciers`, `#pech-merle`, `#philae` or `#karnak` in the URL to start at that level.

`npm test` runs scripted playthroughs in headless Chromium. Each one checks a design
contract: the trap fires for the naive player and can be avoided by the one who remembers.

`npm run assets:check` validates every art manifest against the files on disk.

## Layout

The engine knows nothing about Egypt. The levels are data. The art is files.

```
src/
  main.ts                 boots the game once the art has loaded
  game.ts                 the loop: fixed 60 Hz step, level sequence, deaths, HUD state
  engine/                 systems, with no knowledge of any level
    types.ts              constants (view size, tile, ART_SCALE), death causes, rects
    physics.ts            axis-separated AABB collision against tiles and moving solids
    player.ts             PHYS tuning. The one part of the game that never lies
    entities.ts           the generic traps: falling, thrower, platform, water, sweep, crumble, pusher, conveyor, chaser, tipper
    level.ts              level data types and the tile grid
    camera.ts             never scrolls left
    input.ts, audio.ts    keys; every sound synthesised with Web Audio, no files
    assets.ts             loads painted art from content/ manifests; falls back to code-drawn
  render/
    scene.ts              draws the world in world units; every sprite site asks for painted art first
    procedural.ts         the code-drawn sprites used until a painting exists
    frame.ts              one abstraction over painted and code-drawn frames (tourist, deaths)
    hud.ts                death counter and exit label, drawn in screen space
  levels/
    index.ts              level order and URL hash lookup
    ch01-palaeolithic/    one file per level: geometry, decor, entity list
    ch02-egypt/
content/
  README.md               the designer's guide
  research/               the historical arc; outranks everything else on history
  ch01-palaeolithic/      CHAPTER.md, shared art, one folder per level with LEVEL.md,
  ch02-egypt/             assets.json, easter-eggs.md, and beat folders holding notes and paintings
tools/
  check-assets.mjs        the manifest checker CI runs
tests/                    Playwright playthroughs, one file per level
```

Rendering: the world is 320 × 180 units, rendered onto a canvas four times that size
(`ART_SCALE`) so painted art at 4x lands pixel for pixel, then scaled to the window.

## Status

Six levels playable end to end (Cap Blanc, Roc-aux-Sorciers, Pech Merle; Abu Simbel,
Philae, Karnak) with code-drawn art and procedural sound, from a tour map start screen.
Painted art arrives per asset through `content/`. No menu yet.
