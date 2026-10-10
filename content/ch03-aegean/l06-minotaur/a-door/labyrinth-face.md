# The labyrinth's outer face

| | |
|---|---|
| Id | `labyrinth-face` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 240 × 176 world px, 1 frame, its top-left at (80, 16): lines only, down to y 191 |
| Beat | `a-door` |

## What it is

The outside of Daedalus's building, drawn as the vase painter draws an edge: a 1 px glaze
contour where its stone meets the clay outside.

- Down the outer face, x 80, from the roof at y 16 to the door's head at y 79.
- Along the top of the roof, y 16, from x 80 to 319, under the clay over the roof.
- The door's lintel, which this drawing does not draw: the masonry's own underside line over the
  door opening (`tile-labyrinth`), 1 px of glaze along y 79 from x 80 to 94. From x 95 the
  stone's bottom row is reserved clay over the vestibule's black, which stops it there.
- Under the threshold, down x 80 from y 164 to the course line at y 191, beside the band of
  rays under the ground line outside (`labyrinth-rays`): the labyrinth's wall going on down into
  the ground, and the rays' band's edge. It starts a row under the ground line's last clay row,
  y 163, so it never touches its glaze, not even at the corner (79, 162); it started on y 163
  while the ground line was 1 px (2026-10-10).

The stone inside the contour is the masonry by its rule (`tile-labyrinth`). Under the lintel is
the door opening, x 80 to 96: the post at its outer side (`labyrinth-doorpost`), then clay, then
the black vestibule from x 96.

## Where it stands in the game

The face over the door and the lintel are on the first screen (y 53 to 80 of the face at the
spawn). The roof's top is seen from G0 on the way out, when the camera is as high as it goes:
its top at y 14, two rows of clay over the roof's line, where it stops to keep the vase's foot
whole on the screen (`labyrinth-rays`, 2026-10-10).

## Must be right

- **Outside and inside are told apart by the wall alone**, since both are clay. The rough build
  read the clay door opening as a pilaster and the black vestibule as the door (its capture,
  2026-10-09): the contour and the lintel make the opening an opening.
- **The lintel stops at x 94**, a pixel short of the vestibule's black (x 96, y 80): two glaze
  shapes never touch without 1 px of clay between them, not even at a corner (`../LEVEL.md`, Art,
  2026-10-10). It is the masonry's underside line, and the masonry's rule stops it: y 79 is
  reserved clay from x 95 to 128 (`tile-labyrinth`, against the black). With the post's glaze
  edge it is one outline, the door's frame.
- The rays end at x 78, with clay at 79: they never touch it (`labyrinth-rays`).
- **Never Knossos**: no Knossian door, no red-and-black column, no light well, no meander
  (`../LEVEL.md`, Deliberately wrong; `../../CHAPTER.md`, error dossier).
- Nothing on the face: no ornament, no mark, no text (pillar 2).

## Deliberately wrong

- **The labyrinth's plan**, in plain masonry only (`../LEVEL.md`, Deliberately wrong), and its
  outside drawn as a line on the section's stone.
- **Drawn, not painted.** Flat, unlit pixel art in code at 1 world px: the level is exempt from
  the painted style of `content/README.md` (`../LEVEL.md`, Art, 2026-10-10).

## Sources

None: no source describes the labyrinth's outside. Ovid's building of misleading ways
(*Metamorphoses* 8.159–168, line numbers unverified) gives it no façade.

## Confidence

Invented, and a design choice.
