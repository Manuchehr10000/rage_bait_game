# Rage Bait Game

A deadpan, mean, browser-based 2D platformer for desktop. Chapters are historical places.
No text, no hints. The level is always the same. You learn by dying.

Design rules are in [PILLARS.md](PILLARS.md). Read them before adding a trap.

## Environments

| | Branch | Link |
|---|---|---|
| prod | `main` | https://manuchehr10000.github.io/rage_bait_game/ |
| dev | `dev` | https://manuchehr10000.github.io/rage_bait_game/dev/ |

Flow: work on a feature branch, open a pull request into `dev`, then promote `dev` to
`main` with a pull request when it has been played and survived. Every push to any branch
runs CI (typecheck, build, headless playthroughs). Every push to `main` or `dev` redeploys
both links. The footer of each page shows which environment and commit it is.

## Run

```
npm install
npm run dev
```

Arrows or WASD to move, Space to jump, R to give up (it counts), M to mute, Enter for the next level at the exit label. Open `#philae` or `#karnak` in the URL to start at that level.

`npm test` runs scripted playthroughs in headless Chromium (`tests/smoke.spec.ts`). Each one
checks a design contract: the trap fires for the naive player and can be avoided by the one
who remembers it.

## Layout

- `src/player.ts` – physics tuning (`PHYS`). The one part of the game that never lies.
- `src/physics.ts` – axis-separated AABB collision against tiles and moving solids.
- `src/levels/` – each level as data: geometry, decor, and a list of generic traps.
- `src/entities.ts` – the generic traps: falling object, thrower, moving platform, water, sweep, crumbling platform, pusher.
- `src/render.ts` – the scene: sky, lake, rock, facade, tiles, entities. 320×180, integer-scaled.
- `src/sprites.ts` – pixel-map sprites: the tourist, baboons, the colossi, the four gods.
- `src/audio.ts` – every sound, synthesised with Web Audio. No files.
- `src/hud.ts` – death counter and exit label. Drawn in screen space so text stays crisp.

## Status

Levels 1 to 3 playable end to end with pixel art and procedural sound. No menu yet.
