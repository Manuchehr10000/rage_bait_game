# The Minotaur's hand

| | |
|---|---|
| Id | `minotaur-hand` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | Up to 8 × 12 world px per frame (flat 8 × 6, holding 7 × 4, clawing 7 × 5, the palm 5 × 12, reaching 7 × 5), 5 frames, each hung from its wrist; drawn facing right, and flipped by the game to face left |
| Beat | `e-cell` |

## What it is

A man's hand, in glaze, much too big: the joke is that a man has hands. One incision, a line of
reserved clay, parts the thumb from the fingers. The frames:

0. Flat: 8 px long, its palm 4 high on the stone's top, the back of the hand rising to the wrist
   near its back end; the thumb laid forward along the top to the stone's front end, 3 px, parted
   from the hand by the incision at its root; and the fingers over the stone's edge and down its
   face, three of them, a pixel wide and a pixel apart, dark on the cream, two of them 2 px down
   and the last 1: a hand gripping the stone, its thumb one way and its fingers another, never a
   hoof's two and never a rake.
1. Holding: 7 × 4, under the stone's front, its fingers spread up across the stone's face, so
   that the stone shows cream between them: the stone up in its hand.
2. Clawing: 7 × 5, the fingers spread and hooked down, the thumb parted by the incision.
3. The palm: 5 × 12, upright and edge-on, the fingers up and the thumb out on its outer side,
   parted by the incision: the clap's two.
4. Reaching: frame 2 upside down, the fingers spread and hooked up, the near hand thrashing at
   the hero's chest after the first blow.

(Drawn 2026-10-10. The notes first had the flat hand 3 high, its thumb under the fingers, the
holding hand's fingers curled over the stone's top, and the palm 3 × 8: three rows left no room
for fingers that touch the stone apart, and fingers over the top would touch the contour. Then,
the same day, the flat hand was drawn 8 × 4 with three fingers and the thumb as four touches on
the stone's top, the thumb under the wrist; a check of the drawn bull read it, at the game's
scale, as a rake, a comb or a toed paw, the thumb where an animal's heel or dewclaw is, and it was
redrawn as above. Frame 4 was added then, when the near hand came to thrash in front of the hero:
hooked down over his chest it read as a fringe on his kilt.)

## Where it stands in the game

At the end of each arm (`minotaur-body`). Frame 0 along the top of each stone while it crouches,
over the stone's whole length: the near hand over x 100 to 107 and the far over x 110 to 117, its
palm on y 728 to 731, straight on the stone's top row (y 732), the thumb at the stone's front end
and the wrist near its back end, x 105 and x 115, and the fingers down the stone's face at x 102,
104 and 106 (and 112, 114, 116), y 732 and 733. The two hands are 2 px of clay apart. They stay
flat on their stones through the breath, which lifts the rest of it (`tests/minotaur-bull.spec.ts`).
From the grip until it sets it down, the near hand has the stone: frame 1, under it, while the
stone is up at its shoulder or over it, so that the arm comes up to it from below; frame 0,
gripping it from above, the palm on its top and the fingers down its face, while it is lower, the
arm straight down to it, so that no arm or elbow ever lies across the stone (2026-10-10: held under
it below the shoulder, the arm came down over the stone and left a few cream pixels of it). Frame
2 for the free right hand from L+46 to 67, and the far hand's in the flails; frame 3 on him in the
clap, one either side of him, with a line of clay between them and him; frame 4 the near hand's
in the flails, reaching up at Theseus's chest: at the front of it, between him and its head, its
top-left from its head's x and the floor, so that however its head tosses or it rears it is over
his box's columns 6 to 12 and rows 8 to 13, under his neck and over his hips, its thumb short of
its muzzle, and its arm, behind its head, never crosses him; and never on the wall's stone
(`tests/minotaur-bull.spec.ts`). (Drawn first over his box's columns −1 to 6, behind his chest,
it lay on his back and hips, and its fingers and their clay cut his kilt into a comb; at the
wall it went into the stone. A check of the hero stage found it, 2026-10-10.) The swat's hand is frame 0, flat
on top of him, carried down with him onto its brow or the floor, with a line of clay round it.
The free hand, once it has stopped clawing, goes down behind its head, unseen, and once the near
one has set the stone down, flat on its far stone; from then both hands are flat on their stones,
the near one on the stone where it set it. The heap's hand, flat on the floor beyond its stones,
has its fingers under the floor's line, unseen.

The near hand, on its stone or holding it, is in front of Theseus, who stands at the bull's head
with his feet by the near stone; the far hand is behind him (`minotaur-body`, Against Theseus).
Thrashing at his chest, the near hand is in front of him but for his two blows, when he lunges
in past it (`theseus-blow`). Its palms on the tourist, in the clap, have two pixels of clear clay
between them and Theseus.

The rough's anchor on a stone, the stone's x + 3 (`onStone` in `bullPose`, `src/render/scene.ts`),
was the place of its 5 px hand: an 8 px hand hung from it would overhang the near stone by 4 px
or reach across the gap onto the far one. The anchor moved, with the drawing, to the wrist over
the stone's back end, the stone's x + 6, and the hand is laid forward from it
(`src/render/bull.ts`); with the hand redrawn gripping, the wrist is at the stone's x + 5.

## Must be right

- **Hands, never hooves** (ruled 2026-10-10: "the bull's hands read as hands before the clap:
  human, oversized, flat on pale stones"). A thumb, fingers that end square or spread, a wrist
  narrower than the hand. Never a single notch at the tip, which is a cloven hoof; never a row of
  like prongs, which is a rake: the thumb goes one way and the fingers another
  (`tests/minotaur-bull.spec.ts`).
- **Seen before the clap**: flat on the cream stones, glaze on cream, from the first frame he is in
  the cell.
- **The palms flatten him**: two of them, 12 px, three quarters of him, either side of his 4 px
  sliver (`../../shared/bull-leaper-clapped.md`).
- **Each on its own stone, wholly**: never overhanging it, never reaching across the gap to the
  other.
- Glaze never touches glaze: where a hand lies flat on a stone, the stone's top row is cream under
  its palm instead of contour, its fingers' glaze where they go over the edge (`minotaur-stone`),
  and the stone's side gives way to clay where the last finger comes by it, so the hand touches
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
