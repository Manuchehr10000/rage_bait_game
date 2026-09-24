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

Arrows or WASD to move, Space to jump, L to switch the headlamp off and on in the one cave
where it runs down (it only runs down while it burns), R to give up (it counts), M to mute, Enter for the
next level at the exit label. Esc returns to the map. Open `#cap-blanc`,
`#roc-aux-sorciers`, `#pech-merle`, `#rouffignac`, `#gargas`, `#abu-simbel`, `#philae` or
`#karnak` in the URL to start at that level.

A level is entered on foot: from the map or the exit label, the tourist walks in from off
the left edge of the screen to where the level starts him, and then the controls are his
(pillar 13). Where the level brings him in itself he starts on it (Philae, by boat), and
where the visit has already begun he is simply there (Rouffignac, off the train). Retries
start on the spot.

Dev tools, in every build except prod, so a point on screen can be named: a ruler on the
edges of a level, and the exact point under the mouse as `(X, Y)`. A click copies it with
the level in front, `karnak (96, 64)`, since Y = 0 differs from level to level. X is world
px from the start of the level; Y is px above the floor the tourist spawns on, negative
below it. G hides them. The world counts y downward, so `(X, Y)` is the world pixel at
x = X, y = spawn floor − Y.

They live in `src/dev/` and never reach a player. dev and main are one history, so the
source goes to main when dev is promoted; the code does not go to prod. The prod build
refuses to finish if anything from `src/dev/` is in its bundle, and CI builds prod on every
push to prove it.

`npm test` runs scripted playthroughs in headless Chromium. Each one checks a design
contract: the trap fires for the naive player and can be avoided by the one who remembers.
It builds the game first, every time, so it always tests the source as it is; so does
`npx playwright test` on a single file.

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
    entities.ts           the generic traps: falling, thrower, platform, water, sweep, crumble, pusher, conveyor, chaser, tipper, hazard, horse, roof, snare, train
    level.ts              level data types and the tile grid
    camera.ts             never scrolls left
    input.ts, audio.ts    keys; every sound synthesised with Web Audio, no files
    assets.ts             loads painted art from content/ manifests; falls back to code-drawn
    progress.ts           which levels this browser has cleared
  render/
    scene.ts              draws the world in world units; every sprite site asks for painted art first
    procedural.ts         the code-drawn sprites used until a painting exists
    frame.ts              one abstraction over painted and code-drawn frames (tourist, deaths)
    hud.ts                death counter and exit label, drawn in screen space
  map/
    atlas.ts              the tour: twelve chapters, sixty sites, where each is on Earth
    screen.ts             the tour map, the start screen
    geo.ts                coastlines, generated from Natural Earth by tools/build-coastlines.mjs
    monuments.ts          code-drawn chapter vignettes, used until a plate is painted
  dev/                    tools for building the game: the ruler and the pointer readout. Never in prod
  levels/
    index.ts              level order and URL hash lookup
    ch01-palaeolithic/    one file per level: geometry, decor, entity list
    ch02-egypt/
content/
  README.md               the designer's guide
  research/               the historical arc; outranks everything else on history
  ch01-palaeolithic/      CHAPTER.md, shared art, one folder per level with LEVEL.md,
  ch02-egypt/             assets.json, easter-eggs.md, and beat folders holding notes and paintings
  ch03-aegean/            CHAPTER.md only: decided, not built
  map/                    the tour map's art, and the twelve chapter plates in monuments/
  site/                   the tab icon's note
tools/
  check-assets.mjs        the manifest checker CI runs
  paint-monuments.mjs     paints the twelve chapter plates from tools/monument-painters/
  build-coastlines.mjs    regenerates src/map/geo.ts from Natural Earth
  favicon.mjs             the tab icon, generated at build time
tests/                    Playwright playthroughs, one file per level (Abu Simbel's is smoke.spec.ts),
                          plus the map, the audio, the dev tools and the level-data contracts
```

Rendering: the world is 320 × 180 units, rendered onto a canvas four times that size
(`ART_SCALE`) so painted art at 4x lands pixel for pixel, then scaled to the window.

## Status

Eight levels playable end to end, the five of chapter 1 (Cap Blanc, Roc-aux-Sorciers, Pech
Merle, Rouffignac, Gargas) and the first three of chapter 2 (Abu Simbel, Philae, Karnak),
with code-drawn art and procedural sound, from a tour map start screen.
Painted art arrives per asset through `content/`. No menu yet.
