# The lip

| | |
|---|---|
| Id | `tile-labyrinth-threshold-top` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10). The id is wired to the painted-tile lookup; no file is made |
| Size | 16 × 16 world px, 1 frame, at (64, 576) |
| Beat | `d-hatch` |

## What it is

The dressed threshold before the hatch, the only fine stone in T_end's floor: one smooth block,
not coursed, in the dressed stone's paler tone (`#a8693e`), edged in a 1 px glaze contour. Its
top is worn into one shallow dish where the tribute stood, and in it two worn foot hollows:

- Its two ends, 2 px each, x 64 to 65 and 78 to 79, stand at the stone's full height, the
  contour along the top row, y 576.
- Between them, x 66 to 77, the top is worn a pixel down: the contour runs along y 577, and the
  air over it on y 576 is clay. One dish, its floor level, with no notch, step or point in it.
- In the dish two foot hollows, 4 px each, x 67 to 70 and 73 to 76, 2 px of the dressed stone
  between them: the stone under the contour there, on y 578, is worn paler (`#c48552`), one row
  and never a crescent.

Its edge at the hatch is cut square, the contour down x 64; along its underside, over the cell,
the contour is where the stone ends. Its right side is the plain block's joint at x 80, as every
block's is. (Redrawn 2026-10-11, on the designer's ruling that no shape reads as a letter, pillar
2: each hollow was 5 px wide and 2 deep, at 2 and 9 px from its left, the contour dipping into
each with a paler crescent under it, and the edge's two dips and three teeth read as a W or a
crown. That reading is superseded.)

## Where it stands in the game

T_end's floor, x 64 to 80, between the hatch (x 48 to 64) and the plain blocks. A step on it, his
box over x 64 to 80, rings, and brings the beast back at once. One puff of the clock rises at it
(`../c-way-down/beast-dust.md`). The tourist leaps from the plain block before it and never
touches it.

## Must be right

- **It reads as a stone, and a different one.** The snort's answer is to leap it, so he must see
  it as stone. In the rough it was 1.27 to 1 on the clay and its hollows were clay pixels that read
  as air, a second hole: the glaze contour, round its top and over its dish, is what makes it
  stone.
- **The one dressed stone** (`../LEVEL.md`, beat d): the plain blocks after it are pixel-identical
  to one another, and it is not them (`tests/minotaur-snort.spec.ts`).
- **Its worn hollows are the one wear in the level**, where the tribute stood before it went in.
- **No part of it reads as a letter or digit** (pillar 2; designer, 2026-10-11): the top's
  contour is one shallow dish between square ends, never dips with teeth between them, which read
  as a W or a crown; the hollows are paler stone under it, a row deep, never crescents, which side
  by side would make a w. Checked at native size and on the screen canvas at window scales 3 and
  5, and pinned pixel for pixel (`tests/minotaur-snort.spec.ts`).
- **No crack**: in this game a crack means "will give", and this stone never gives.
- The tourist's feet are not glaze, so its top contour may meet them.

## Deliberately wrong

- **The dressed threshold and its two foot hollows** (`../LEVEL.md`, Deliberately wrong: the
  snort, all invented), and the feeding hatch it stands before.
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

None: invented. The tribute itself is the story's (Apollodorus 3.15.8, unverified; Ovid,
*Metamorphoses* 8, every nine years, at search-extract level).

## Confidence

Invented, said plainly.
