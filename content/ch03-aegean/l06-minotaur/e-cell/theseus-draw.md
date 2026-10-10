# Theseus, drawing back the sword

| | |
|---|---|
| Id | `theseus-draw` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 18 × 27 world px, 1 frame: his box, and 6 px of sword behind it and 3 over; faces right |
| Beat | `e-cell` |

## What it is

Theseus leaning back a little, the horn in his far hand (the code's far arm), his right arm drawn
back over his shoulder with the sword pointing back. The figure of `../a-door/theseus-kneel.md`.

As drawn (2026-10-10): his head a pixel back; his right arm out behind his shoulder to the elbow
and up, the fist behind his head with a pixel of clay between, and the blade, 6 px, from it back
and up at 45 degrees, all over the clay behind him. (The note first gave 17 × 25 with 5 px of
sword behind: the blade the same 6 px as in every other drawing needs 6 and 3.)

## Where it stands in the game

At the horn, 6 frames before each blow: L+70 to 75, and L+124 to 129.

## Must be right

- **Drawn back against clay first** (`../LEVEL.md`, beat e): the sword and the arm behind him, over
  the clay, clear of the bull, so the blow is seen coming: every pixel of the blade glaze, and no
  glaze of the bull within a pixel of it (`tests/minotaur-bull.spec.ts`).
- **The horn in his hand again**: the first draw is where he takes it back after the duck
  (`theseus-grip`).
- As `../a-door/theseus-kneel.md`, "Theseus, in every pose".

## Deliberately wrong

- **Two blows**, where the vases show one thrust (`../LEVEL.md`, Deliberately wrong).
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

As `../a-door/theseus-kneel.md`.

## Confidence

Design choice.
