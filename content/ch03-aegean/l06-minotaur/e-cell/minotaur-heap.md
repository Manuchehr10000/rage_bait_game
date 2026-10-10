# The heap

| | |
|---|---|
| Id | `minotaur-heap` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 39 × 24 world px, its top-left at (105, 712): drawn by code as the body is (`minotaur-body`), with the head's drawing; facing left |
| Beat | `e-cell` |

## What it is

The Minotaur after the second blow, sunk over its knees and bowed forward, its head down on the
floor before it: its back flat on the solid from the shoulders to the rump, rounded at the
shoulder; the rump down to its heel at the far wall, with a notch where the heel sits under it;
under its back its folded leg, the knee down on the floor forward under its chest and the thigh
rising back from it to the belly; under its chest, before the thigh, clay; and its neck bowed
down out of its chest to its head, which is `minotaur-head` frame 2, lying on its cheek on the
floor, horns up at its back. Its arms are under it, unseen. One mass of flat glaze, and nothing
incised across it. (After the whole-level review, 2026-10-10: drawn first as the body it crouched
in, with its near arm thrown out over its head and the stones, the thigh's incision and the clay
between the thigh and the belly were two parallel diagonal lines across it that read as sword
cuts, where the blows are bloodless; the arm over the head, the stones and Theseus's feet hid the
head; and it rose in one frame from the 10 px it knelt at to its 24, so that it read as rising.
Now it kneels up before the blow, taller than the heap, `minotaur-body`, and slumps down into it.)

## Where it stands in the game

In the cell from L+130 to the end of the attempt, its body over x 114 to 143 and its top 24 px over
the floor. It is a solid: a man who falls back into the cell climbs out over it. The tableau at the
door is a second copy; the heap stays (`../LEVEL.md`, the closing tableau). For the 4 frames of the
second blow its head jerks up on its neck before its shoulders, and then lies down.

**How it lies against its stones.** Front to back: its head and neck, its body, then the stones.
The head, `minotaur-head` frame 2, lies on the floor, its pixels within x 105 to 115 and y 727 to
735 (`headAt`, `src/engine/entities.ts`), clear of Theseus's feet, which come to x 103, and over
the far stone where it was let go, x 110 to 117; the near one, where it was set down, x 98 to 105,
lies before it, both y 732 to 735. The head and its neck are cut from what is behind them by a
1 px line of reserved clay, corners included, but where the neck comes out of the chest; the
stones are behind everything, drawn only where nothing of it is, and where its glaze meets a
stone's contour the contour gives way to clay. What lies over a stone hides it. (The head lay at
x 101 to 111, across both stones and behind his feet, until the whole-level review, 2026-10-10.)

When the camera goes on up with the tourist, two frames after the head is down, the floor and
the head on it leave the view (`Entity.keepsInView`): what is seen of the heap from then on is
its top.

Theseus stands over it, in front of all of it, cut from it by his reserved line, corners
included, his feet before its head.

## Must be right

- **Its top drawn on its solid**: the heap's 24 px over x 114 to 144 is what he stands on, its top
  row whole from x 118 to 141 (`tests/minotaur-bull.spec.ts`).
- **A body, never a rock**: a man's back bowed over his folded leg, the bull's head on the floor
  before it, read whole whenever the floor is in view.
- **Bloodless, and no added red** on it (`../LEVEL.md`): its damage shows only in how it lies.
- **It stays**, and nothing of it moves after its head has gone down.
- **The head whole**: the bull's head in front of everything else of it, so that the heap reads as
  the Minotaur.
- The head and the body cut from the stones by clay, and the head from the body but at its
  neck; every bent leg a filled wedge, never a Z or a 2; nothing incised across it, which would
  read as a cut (`tests/minotaur-bull.spec.ts`).
- Nothing kills from L+106 on.

## Deliberately wrong

- **The body sinking into a 24 px heap** after two bloodless blows (`../LEVEL.md`, Deliberately
  wrong).
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

As `minotaur-body`.

## Confidence

Design choice.
