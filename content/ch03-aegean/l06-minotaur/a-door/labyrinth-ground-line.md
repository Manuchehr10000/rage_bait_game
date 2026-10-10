# The ground line

| | |
|---|---|
| Id | `labyrinth-ground-line` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 80 × 3 world px, 1 frame, its top-left at (0, 160) |
| Beat | `a-door` |

## What it is

The line the figures outside stand on, the panel's lower border: a 1 px glaze line between two
reserved lines of clay, over the outside's floor.

- y 160, the floor's top row: clay.
- y 161: glaze.
- y 162: clay.
- From x 0 to 79. Under it, the masonry (`labyrinth-lower-zone`).

## Where it stands in the game

Under the queue, Ariadne, Theseus kneeling at the post, and the tourist from the moment he walks
in. The floor's top is y 160, so the tourist and the figures stand on the clay row and the glaze
is a pixel under their feet.

## Must be right

- **Under the figures outside, a glaze ground line** (ruled 2026-10-10).
- **Clay between it and their feet.** The youths' glaze legs and the kneeling hero's knee and
  foot stand on y 159; a glaze line at y 160 would touch them, and two glaze shapes never touch
  without 1 px of clay between them (`../LEVEL.md`, Art, 2026-10-10). The clay under it cuts it
  from the masonry's wash, against which glaze alone reads weakly.
- **It ends at x 79**, at the outer face. The door opening, x 80 to 96, is the threshold: its
  floor is the masonry, and the tableau lays the Minotaur's head on the door opening's clay at
  x 82 to 93 (`tests/minotaur-out.spec.ts`).
- Straight, level and the same all along: no grass, stones, shadow or slope.

## Deliberately wrong

- **A vase panel's border used as the ground outside a building**, and the figures standing on
  it a pixel above the glaze (ruled 2026-10-10, "the level is the vase").
- **Drawn, not painted.** Flat, unlit pixel art in code at 1 world px: the level is exempt from
  the painted style of `content/README.md` (`../LEVEL.md`, Art, 2026-10-10).

## Sources

None found. The research found no source on the ground line itself; that black-figure figures
stand on the panel's lower border, with no landscape, is from its writer's own knowledge.

## Confidence

**Not verified:** the ground-line convention, and how a vase's panel border is drawn. Ruled by the
designer as the panel's border; its three rows are the game's.
