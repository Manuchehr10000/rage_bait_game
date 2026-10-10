# The Minotaur's hand

| | |
|---|---|
| Id | `minotaur-hand` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 8 × 8 world px per frame, 4 frames in a horizontal strip, hung from its wrist; drawn facing right, and flipped by the game to face left |
| Beat | `e-cell` |

## What it is

A man's hand, in glaze, much too big: the joke is that a man has hands. One incision, a line of
reserved clay, parts the thumb from the fingers. The frames:

0. Flat: 8 px long and 3 high, along the bottom of the frame, the fingers forward and the thumb
   under them, lying on a stone.
1. Holding: the fingers curled over the top of the near stone.
2. Clawing: the fingers spread and hooked.
3. The palm, edge-on and upright, 3 × 8: the clap's two, and the swat's one.

## Where it stands in the game

At the end of each arm (`minotaur-body`). Frame 0 along the top of each stone while it crouches,
over the stone's whole length: the near hand over x 100 to 107 and the far over x 110 to 117, on
y 729 to 731, straight on the stone's top row (y 732), the fingers at the stone's front end and
the wrist over its back end, x 107 and x 117. The two hands are 2 px of clay apart. They stay flat
on their stones through the breath, which lifts the rest of it. Frame 1 on the raised stone from
the grip until it sets it down; frame 2 for the free right hand from L+46 to 67, and in the flails;
frame 3 on him in the clap, one either side of him, and the swat's, drawn over him with a line of
clay between them and him.

The rough's anchor on a stone, the stone's x + 3 (`onStone` in `bullPose`, `src/render/scene.ts`),
was the place of its 5 px hand: an 8 px hand hung from it would overhang the near stone by 4 px
or reach across the gap onto the far one. The anchor moves in code, with the drawing, to the
wrist over the stone's back end, the stone's x + 7, and the hand is laid forward from it.

## Must be right

- **Hands, never hooves** (ruled 2026-10-10: "the bull's hands read as hands before the clap:
  human, oversized, flat on pale stones"). A thumb, fingers that end square or spread, a wrist
  narrower than the hand. Never a single notch at the tip, which is a cloven hoof.
- **Seen before the clap**: flat on the cream stones, glaze on cream, from the first frame he is in
  the cell.
- **The palms flatten him**: two of them, as tall as half of him, either side of his 4 px sliver
  (`../../shared/bull-leaper-clapped.md`).
- **Each on its own stone, wholly**: never overhanging it, never reaching across the gap to the
  other.
- Glaze never touches glaze: where a hand lies flat on a stone, the stone's top row is cream under
  it from end to end instead of contour (`minotaur-stone`), so the hand lies on cream and touches
  none of the stone's glaze. Wherever else a hand comes down on or over a stone, it is the same,
  or the hand is in front, cut from the contour by a line of clay.
- The claw within the swat's column, x 100 to 112, and never crossing the stone's arc.

## Deliberately wrong

- **Oversized** (ruled 2026-10-10).
- **The clap, the claw and the swat** (`../LEVEL.md`, Deliberately wrong).
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

As `minotaur-body`: the rest of him human (Apollodorus 3.1.4); a stone held in its hand (MFA
60.1, BM 1843,1103.21, Getty 86.AE.60, Tampa 86.36).

## Confidence

Design choice, on the story's "the rest of him human". No vase was looked at.
