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

## Must be right

- **He leaves second**: the tourist is out first, and Theseus comes after with the body, never
  looking at him.
- **Seen in the black** by his reserved outline, cut from the body by clay.
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
