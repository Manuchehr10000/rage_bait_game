# Theseus, dragging the body

| | |
|---|---|
| Id | `theseus-drag` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 12 × 24 world px per frame, 2 frames in a horizontal strip, his box; drawn facing right, and flipped by the game to face left, the way he walks |
| Beat | `f-thread` |

## What it is

Theseus in the closing tableau, leaning into the pull, his near hand swinging forward, the sword
at his hip, the dead Minotaur's horn in his far hand behind him: the code draws that arm, 2 px,
from his far shoulder to the horn. Two frames, a stride each way, changing every 6 px he goes. The
figure of `../a-door/theseus-kneel.md`.

## Where it stands in the game

From x 110, all of him in the black vestibule, to the post where he knelt, x 66 to 78, at 1 px a
frame: at the post 45 frames after the tourist's left edge passes x 80, and there he stops, the
stride's first frame held. In the vestibule he is drawn in a reserved outline, and nothing of him
is drawn in the passage behind it (`tests/minotaur-out.spec.ts`). Behind the tourist.

Stopped at the post, his far arm reaches back across it to the horn: from his far shoulder at
(72, 143), 2 px, to the horn at (88, 151), crossing the post, x 80 to 83, at about y 146 to 149,
its 2 × 2 hand on the horn at x 87 and 88, y 150 and 151 (as drawn, 2026-10-10; the horn moved
from (85, 149) when the dead head was drawn lying on its cheek, its horns at its back,
`minotaur-dead`). The arm is in front of the post, and a 1 px
line of reserved clay round it, corners included, his reserved outline carried over the post, breaks
the post's glaze edge at x 83 where it crosses and is cut into its wash
(`../a-door/labyrinth-doorpost.md`). The knot, on the post at x 80 and 81, y 148 to 150, and the
thread stay drawn over the arm, white on glaze: the knot he walks past on the way out is never
hidden. Past the post his arm and hand lie in front of the dead head, which gives way round them
by a line of clay, corners included (`minotaur-dead`; added after a check of the drawn bull,
2026-10-10, when his hand met the horn with no clay between).

## Must be right

- **He leaves second**: the tourist is out first, and Theseus comes after with the body, never
  looking at him.
- **Seen in the black** by his reserved outline, cut from the body by clay.
- **Cut from the post** where his far arm crosses it: glaze never touches glaze (`../LEVEL.md`,
  Art, 2026-10-10).
- **The horn in his far hand, behind him**, the body after him.
- The exit card, anchored right, never covers him or the body (`tests/minotaur-out.spec.ts`).
- As `../a-door/theseus-kneel.md`, "Theseus, in every pose".

## Deliberately wrong

- **The closing tableau as a staged second copy**, while the heap stays in the cell
  (`../LEVEL.md`, Deliberately wrong): Theseus dragging the body to the doorpost as the tourist
  passes.
- **By a horn**: not verified on the Aison cup.
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

As `minotaur-dead`.

## Confidence

As `minotaur-dead`.
