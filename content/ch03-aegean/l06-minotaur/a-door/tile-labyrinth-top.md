# The labyrinth's masonry, with air over it

| | |
|---|---|
| Id | `tile-labyrinth-top` |
| File | None, and none is wanted: drawn in code at 1 world px by rule (`../LEVEL.md`, Art, 2026-10-10) |
| Size | 16 × 16 world px, 1 frame |
| Beat | `a-door`, and every beat |

## What it is

A tile of the masonry with air over it: every floor he walks on, the roof's top and every
ledge. It is `tile-labyrinth`, by the same rule, and nothing else: the game asks for the id
because it asks every level for a `-top`.

## Where it stands in the game

Under his feet everywhere but the lip, and under the queue, where outside, x 0 to 79, the
floor course is the ground line and the rays under it (`labyrinth-ground-line`,
`labyrinth-rays`).

## Must be right

- **Identical to `tile-labyrinth`.** No lit top, no pale lip, no edge line on its top: the rough
  build's 2 px pale top was light from above (ruled away 2026-10-10, "no lit tops").
- No line along a floor's top: Theseus and the figures stand on it, and a glaze line there would
  touch their glaze feet. For the same reason the joints begin a pixel under it (`tile-labyrinth`).

## Deliberately wrong

As `tile-labyrinth`.

## Sources

As `tile-labyrinth`.

## Confidence

Design choice.
