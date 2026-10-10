# The Minotaur's head

| | |
|---|---|
| Id | `minotaur-head` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 11 × 15 world px per frame, 3 frames in a horizontal strip: its 11 × 10 box and the 5 px of horns over it; drawn facing right, and flipped by the game to face left |
| Beat | `e-cell` |

## What it is

A bull's head in profile on the man's neck (`minotaur-body`): the muzzle forward and down, the
nostril and the eye reserved in the clay, the eye large and high, an ear, and the horns, 2 px
thick, up out of the head and forward at the tip, standing 5 px over its top. The frames:

0. Level: its head on its neck as it crouches and fights.
1. Tossed up: the muzzle raised and the horns hooking up and forward.
2. Down: laid on the floor before its heap, the horns up.

## Where it stands in the game

Its box's top-left is where the fight puts it: x 108 and y 712 crouched, with the back and the
lurch, a pixel up with the breath, tossing 2 to 7 px from the first blow. Frame 0 throughout, but
frame 1 when it tosses its head up at a tourist over its horns, and for the 4 frames its head
jerks up at the second blow; frame 2 from then on, at x 101 on the floor, across both stones and
in front of them, cut from their contours by clay (`minotaur-heap`). The neck between it and the
shoulders is the body's, drawn by code, and stretches when the head lunges out.

## Must be right

- **A bull's, in silhouette first**: the muzzle and the horns say bull before anything else.
- **Inside its box and its horns**: the head's 11 × 10 and the horns' 5 px over it are what reaches
  him, and what the toss hooks him with (`tests/minotaur-fight.spec.ts`).
- **The near horn where the hero holds it**: in frames 0 and 1 it passes through 3 px in from the
  box's left and 2 px over its top, where Theseus's left hand is.
- **A brow between the horns**, at its top's middle, flat enough for a swatted tourist to lie on.
- Horns of 2 px, never the rough's 1 px antennae.
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
