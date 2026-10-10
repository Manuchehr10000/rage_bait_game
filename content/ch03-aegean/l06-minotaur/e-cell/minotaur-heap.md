# The heap

| | |
|---|---|
| Id | `minotaur-heap` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 54 × 24 world px, its top-left at (90, 712): drawn by code as the body is (`minotaur-body`), with the head's and the hand's drawings; facing left |
| Beat | `e-cell` |

## What it is

The Minotaur after the second blow, sunk over its knees: the body it crouched in, its back flat
on the solid and rounded at the shoulder and the rump, its near leg folded under it as a filled
wedge, the knee down on the floor ahead of the hip and the foot behind with its sole turned up;
its near arm thrown out forward over its head and the stones, its hand flat on the floor beyond
them; its neck down to its head, which is `minotaur-head` frame 2, lying on the floor before it.
All in flat glaze, with the body's two incisions (`minotaur-body`).

## Where it stands in the game

In the cell from L+130 to the end of the attempt, its body over x 114 to 144 and its top 24 px over
the floor. It is a solid: a man who falls back into the cell climbs out over it. The tableau at the
door is a second copy; the heap stays (`../LEVEL.md`, the closing tableau).

**How it lies against its stones.** Front to back: its head, then its arm, then its body, then
the stones. The head, `minotaur-head` frame 2, lies on the floor, its pixels within x 101 to 111
and y 727 to 735 (`headAt`, `src/engine/entities.ts`), across both stones: the near one where it
was set down, x 98 to 105, and the far one where it was let go, x 110 to 117, both y 732 to 735.
The arm goes up from the shoulder and over the head, and down beyond it to the floor. The head
and the arm are each cut from what is behind them by a 1 px line of reserved clay, corners
included, never round the root of the arm at the shoulder nor the head from its own neck; the
stones are behind everything, drawn only where nothing of it is, and where its glaze meets a
stone's contour the contour gives way to clay. What lies over a stone hides it. The head keeps
its place on the floor; nothing is re-pinned. (Drawn 2026-10-10: the note had the arm passing
behind the head; over the head, the head lying on the floor among the stones stays whole.)

When the camera goes on up with the tourist, two frames after the head is down, the floor and
the head on it leave the view (`Entity.keepsInView`): what is seen of the heap from then on is
its top.

## Must be right

- **Its top drawn on its solid**: the heap's 24 px over x 114 to 144 is what he stands on, its top
  row whole from x 118 to 141 (`tests/minotaur-bull.spec.ts`).
- **A body, never a rock**: a man's back and limbs, the bull's head on the floor before it.
- **Bloodless, and no added red** on it (`../LEVEL.md`): its damage shows only in how it lies.
- **It stays**, and nothing of it moves after its head has gone down.
- **The head whole**: the bull's head in front of everything else of it, so that the heap reads as
  the Minotaur.
- The head, the arm and the body cut from the stones by clay, and the arm from the head; every
  bent leg a filled wedge, never a Z or a 2.
- Nothing kills from L+106 on.

## Deliberately wrong

- **The body sinking into a 24 px heap** after two bloodless blows (`../LEVEL.md`, Deliberately
  wrong).
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

As `minotaur-body`.

## Confidence

Design choice.
