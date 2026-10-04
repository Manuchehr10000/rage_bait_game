# The terrace's surface, covered

| | |
|---|---|
| Id | `tile-persepolis-court` |
| File | `tile-persepolis-court.png` (not painted yet: the game draws its own until this file exists) |
| Size | 16 × 16 world px, painted 64 × 64 |
| Beat | `b-gate` |

## What it is

The terrace's top course with something solid laid over it. The game draws it exactly as
`tile-persepolis-ashlar`: the court's dust lies only where the sky is.

## Where it stands in the game

Nowhere, as the level is built: every tile of the terrace's surface has sky over it. It is listed
because the code that draws the level's tiles can ask for it, and would if a later change laid a
tile on the terrace's surface.

## Must be right

- The same as `tile-persepolis-ashlar`, to the pixel, until it is used.

## Deliberately wrong

None.

## Sources

As `tile-persepolis-ashlar`.

## Confidence

Design choice. Nothing in the level shows it: ask before painting it.
