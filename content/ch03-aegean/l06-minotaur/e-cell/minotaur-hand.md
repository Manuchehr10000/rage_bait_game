# The Minotaur's hand

| | |
|---|---|
| Id | `minotaur-hand` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | Up to 8 × 12 world px per frame (flat 8 × 4, holding 7 × 4, clawing 7 × 5, the palm 5 × 12), 4 frames, each hung from its wrist; drawn facing right, and flipped by the game to face left |
| Beat | `e-cell` |

## What it is

A man's hand, in glaze, much too big: the joke is that a man has hands. One incision, a line of
reserved clay, parts the thumb from the fingers. The frames:

0. Flat: 8 px long and 4 high, lying on a stone, the back of the hand rising to the wrist at its
   back end, the fingers spread forward and down onto the stone, three of them and the thumb
   behind them, each touching the stone apart from the next: four touches, never a hoof's two.
   The incision runs up from the gap before the thumb.
1. Holding: 7 × 4, under the stone's front, its fingers spread up across the stone's face, so
   that the stone shows cream between them: the stone up in its hand.
2. Clawing: 7 × 5, the fingers spread and hooked down, the thumb parted by the incision.
3. The palm: 5 × 12, upright and edge-on, the fingers up and the thumb out on its outer side,
   parted by the incision: the clap's two.

(Drawn 2026-10-10. The notes first had the flat hand 3 high, its thumb under the fingers, the
holding hand's fingers curled over the stone's top, and the palm 3 × 8: three rows left no room
for fingers that touch the stone apart, and fingers over the top would touch the contour.)

## Where it stands in the game

At the end of each arm (`minotaur-body`). Frame 0 along the top of each stone while it crouches,
over the stone's whole length: the near hand over x 100 to 107 and the far over x 110 to 117, on
y 728 to 731, straight on the stone's top row (y 732), the fingers at the stone's front end and
the wrist over its back end, x 106 and x 116. The two hands are 2 px of clay apart. They stay
flat on their stones through the breath, which lifts the rest of it (`tests/minotaur-bull.spec.ts`).
Frame 1 on the near stone from the grip until it sets it down; frame 2 for the free right hand
from L+46 to 67, and in the flails; frame 3 on him in the clap, one either side of him, with a
line of clay between them and him. The swat's hand is frame 0, flat on top of him, carried down
with him onto its brow or the floor, with a line of clay round it. Once it has set the stone
down and stopped clawing, both hands go back down flat on their stones, the near one on the stone
where it set it.

The rough's anchor on a stone, the stone's x + 3 (`onStone` in `bullPose`, `src/render/scene.ts`),
was the place of its 5 px hand: an 8 px hand hung from it would overhang the near stone by 4 px
or reach across the gap onto the far one. The anchor moved, with the drawing, to the wrist over
the stone's back end, the stone's x + 6, and the hand is laid forward from it
(`src/render/bull.ts`).

## Must be right

- **Hands, never hooves** (ruled 2026-10-10: "the bull's hands read as hands before the clap:
  human, oversized, flat on pale stones"). A thumb, fingers that end square or spread, a wrist
  narrower than the hand. Never a single notch at the tip, which is a cloven hoof.
- **Seen before the clap**: flat on the cream stones, glaze on cream, from the first frame he is in
  the cell.
- **The palms flatten him**: two of them, 12 px, three quarters of him, either side of his 4 px
  sliver (`../../shared/bull-leaper-clapped.md`).
- **Each on its own stone, wholly**: never overhanging it, never reaching across the gap to the
  other.
- Glaze never touches glaze: where a hand lies flat on a stone, the stone's top row is cream under
  it from end to end instead of contour (`minotaur-stone`), so the hand lies on cream and touches
  none of the stone's glaze. Holding it, the hand is in front, cut from the contour by a line of
  clay, and its fingers lie on the cream.
- The claw within the swat's column, x 100 to 111, and on every frame of the heave a pixel of
  clay at least from the stone and the hand that holds it (`tests/minotaur-bull.spec.ts`).

## Deliberately wrong

- **Oversized** (ruled 2026-10-10).
- **The clap, the claw and the swat** (`../LEVEL.md`, Deliberately wrong).
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

As `minotaur-body`: the rest of him human (Apollodorus 3.1.4); a stone held in its hand (MFA
60.1, BM 1843,1103.21, Getty 86.AE.60, Tampa 86.36).

## Confidence

Design choice, on the story's "the rest of him human". No vase was looked at.
