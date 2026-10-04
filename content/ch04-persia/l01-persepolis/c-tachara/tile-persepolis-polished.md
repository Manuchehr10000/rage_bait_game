# A lintel of the Tachara, covered

| | |
|---|---|
| Id | `tile-persepolis-polished` |
| File | `tile-persepolis-polished.png` (not painted yet: the game draws its own until this file exists) |
| Size | 16 × 16 world px, painted 64 × 64 |
| Beat | `c-tachara` |

## What it is

A lintel of the Tachara with something solid laid on top of it. The game draws it as
`tile-persepolis-polished-top` without the sunlit line along its top.

## Where it stands in the game

Nowhere, as the level is built: both lintels have sky over them. The game draws any block of the
masonry with nothing under it in the Tachara's polished stone, as a lintel, and this is such a
block with another tile on it. It is listed because the code can ask for it.

## Must be right

- The same as `tile-persepolis-polished-top`, without its top edge, to the pixel, until it is
  used.

## Deliberately wrong

None.

## Sources

As `tile-persepolis-polished-top`.

## Confidence

Design choice. Nothing in the level shows it: ask before painting it.
