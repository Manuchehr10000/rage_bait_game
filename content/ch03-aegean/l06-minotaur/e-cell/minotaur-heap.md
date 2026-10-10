# The heap

| | |
|---|---|
| Id | `minotaur-heap` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 54 × 24 world px, 1 frame, its top-left at (90, 712); drawn facing right, and flipped by the game to face left |
| Beat | `e-cell` |

## What it is

The Minotaur after the second blow, sunk over its knees: the hump of its back, its shoulder down in
front and its hips behind, a leg folded under it as a filled wedge, an arm thrown out forward over
the stones to the floor beyond them, all in flat glaze. Its head is `minotaur-head`, on the floor
before it; its stones lie where they were (`minotaur-stone`).

## Where it stands in the game

In the cell from L+130 to the end of the attempt, its body over x 114 to 144 and its top 24 px over
the floor. It is a solid: a man who falls back into the cell climbs out over it. The tableau at the
door is a second copy; the heap stays (`../LEVEL.md`, the closing tableau).

**How it lies against its stones.** Front to back: its head, then its body and the arm thrown
forward, then the stones. The head, `minotaur-head` frame 2, lies on the floor, its pixels within
x 101 to 111 and y 727 to 735 (`headAt`, `src/engine/entities.ts`), across both stones: the near one
where it was set down, x 98 to 105, and the far one where it was let go, x 110 to 117, both
y 732 to 735. The body's front, from x 114, lies over the far stone's back end; the arm passes over
them both and behind the head to the floor beyond. Each is cut from what is behind it by a 1 px line
of reserved clay round its own outline, corners included, wherever its glaze would meet glaze: the
stones' contours, and the arm where it goes behind the head; never the head from its own neck. What
lies over a stone hides it, so that little of the stones shows but the near one's front end,
x 98 and 99. The head keeps its place on the floor; nothing is re-pinned.

## Must be right

- **Its top drawn on its solid**: the heap's 24 px over x 114 to 144 is what he stands on.
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
