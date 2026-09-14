# Rage Bait Game

A deadpan, mean, browser-based 2D platformer for desktop. Chapters are historical places.
Every plaque tells the truth. Every level lies anyway.

Design rules are in [PILLARS.md](PILLARS.md). Read them before adding a trap.

## Run

```
npm install
npm run dev
```

Arrows or WASD to move, Space to jump, R to give up (it counts).

## Layout

- `src/player.ts` – physics tuning (`PHYS`). The one part of the game that never lies.
- `src/physics.ts` – axis-separated AABB collision against tiles and moving solids.
- `src/entities.ts` – the traps: colossus heads, baboon, relocation, sunbeam.
- `src/levels/abu-simbel.ts` – chapter 1, level 1 as data.
- `src/render.ts` – placeholder pixel art at 320×180, integer-scaled.
- `src/hud.ts` – death counter, plaques, exit label. Drawn in screen space so text stays crisp.

## Status

Grey-box prototype of level 1. Placeholder art, no audio, no menu. Playable end to end.
