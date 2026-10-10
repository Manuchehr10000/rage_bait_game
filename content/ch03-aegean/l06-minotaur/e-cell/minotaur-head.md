# The Minotaur's head

| | |
|---|---|
| Id | `minotaur-head` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 11 × 15 world px per frame, 3 frames in a horizontal strip: its 11 × 10 box and the 5 px of horns over it; drawn facing right, and flipped by the game to face left |
| Beat | `e-cell` |

## What it is

A bull's head in profile on the man's neck (`minotaur-body`): a long face to a broad muzzle, the
nostril and the eye reserved in the clay, the eye high, an ear out behind, and the horns, 2 px
at every row, a bull's lyre: out of the poll sideways and curving up, to tips that stand up at the
box's sides, standing 5 px over its top, a pixel of clay between them over the brow; never a
goat's or an antelope's straight V. (After the whole-level review, 2026-10-10: built first rising
straight from the poll in a V to upright tips, they read as a goat's or an antelope's.) The frames:

0. Level: its head on its neck as it crouches and fights.
1. Tossed up: the muzzle raised and forward, the same lyre tipped back with it.
2. Down: lying on its cheek on the floor, the muzzle along it toward the front and the horns up
   at the back, two posts of 2 px, 3 rows high, their tips curving back a pixel, a pixel of clay
   between them and between the far one and its neck, the near one 6 px in on the box's top row; all of it in the box's first 9
   rows. (Drawn 2026-10-10. Drawn first as the level head with its horns cut short, it read as a
   lump among the stones. Then, after the whole-level review the same day, its horns were 1 px
   for their top two rows, the antennae this note forbids, in the heap and in the closing
   tableau's last frame; and set 2 px wide where they were, the far one touched its neck. This
   read "the box's lower 9 rows": it is the first 9, the heap's x 105 to 115 and y 727 to 735.)

## Where it stands in the game

Its box's top-left is where the fight puts it: x 108 and y 712 crouched, with the back and the
lurch, a pixel up with the breath, tossing 2 to 7 px from the first blow. Frame 0 throughout, but
frame 1 while it has a tourist on its horns, tossing him up, swung back under him over its own
back where its back reached him first (`minotaur-body`, the toss), and for the 4 frames its head
jerks up at the second blow; frame 2 from then on, at x 105 on the floor before the heap, clear of
Theseus's feet, which come to x 103, and in front of the far stone (`minotaur-heap`), and in the
closing tableau (`../f-thread/minotaur-dead.md`). (After the whole-level review, 2026-10-10: at
x 101, across both stones, it lay behind his feet and could not be read.) Kneeling up before the
second blow it is up before its shoulders, its box's top at y 711, in Theseus's hand.
The neck between it and the shoulders is the body's, drawn by code, and stretches when the head
lunges out, or tosses up at a man high over it. The arms, raised to claw or thrashing, go behind
it, so that it is always whole.

## Must be right

- **A bull's, in silhouette first**: the muzzle and the horns say bull before anything else.
- **Inside its box and its horns**: the head's 11 × 10 and the horns' 5 px over it are what reaches
  him, and what the toss hooks him with (`tests/minotaur-fight.spec.ts`).
- **The near horn where the hero holds it**: in frames 0 and 1 it passes through 3 px in from the
  box's left and 2 px over its top, where Theseus's left hand is (`tests/minotaur-bull.spec.ts`).
  In frame 2 its near horn is 6 px in and on the box's top row, where his hand has it in the
  tableau.
- **A brow between the horns**, at its top's middle, flat enough for a swatted tourist to lie on.
- Horns of 2 px, never the rough's 1 px antennae, in all three frames
  (`tests/minotaur-bull.spec.ts`).
- Nothing of it above y 688 before the fight.
- Bloodless; no added red.

## Deliberately wrong

- **The bull's head drawn as the game's**: no vase has been looked at for its shape.
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

As `minotaur-body`. The eye, frontal and large in a profile head in archaic painting (E. A.
Gardner, *Principles of Greek Art*, 1924: https://digi.ub.uni-heidelberg.de/diglit/gardner1924/0161);
at this size it is a dot.

## Confidence

**Not verified:** the shape of the Minotaur's horns and ears on the vases; whether its eye is drawn
frontal. No vase was looked at (designer's ruling, 2026-10-10).
