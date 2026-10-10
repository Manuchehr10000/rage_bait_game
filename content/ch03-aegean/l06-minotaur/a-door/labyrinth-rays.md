# The rays at the vase's foot

| | |
|---|---|
| Id | `labyrinth-rays` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 80 × 28 world px, 1 frame, its top-left at (0, 164): the door storey's floor course outside the outer face, from under the ground line down to the course line at y 191 |
| Beat | `a-door` |

## What it is

A band of black rays rising from below, as above the foot of an amphora, in the strip of ground
outside the door: under the ground line the figures stand on (`labyrinth-ground-line`), from the
screen's left edge to the labyrinth's outer face at x 80 (`labyrinth-face`). With the ground line,
it makes the first screen an amphora's panel: figures on their ground line over a band of rays,
and a tourist in full colour walking into it.

- Ten rays, tall triangles of glaze, points up: each 7 px wide at its base and 1 px at its point,
  26 rows tall, its point on y 164 and its base on y 189. One every 8 px from x 0: bases x 0 to
  6, 8 to 14, and so on to 72 to 78.
- Each widens a pixel at a time down from its point, on its left side and then its right: widths
  1 to 7 for 3, 4, 4, 4, 4, 4 and 3 rows. So each side is a straight slope in even steps, half a
  step from the other's, and no row widens on both sides at once: a ray, not a stack of blocks.
  No curve, no shading.
- They stand on a lower line, the masonry's course line along y 191 (`tile-labyrinth`), with a
  row of clay, y 190, between their bases and it. Their points stop under a row of clay, y 163,
  under the ground line's glaze.
- Clay between them, as on the vase: a pixel between their bases, widening to 7 at their points;
  x 79 is clay, beside the outer face.

## Where it stands in the game

The bottom of the first screen: at the spawn the camera's top is y 53 and its bottom y 233, so
the whole band is in view under the queue, Ariadne, the kneeling hero and the tourist, who stands
over it on the ground line from the first frame, before anything is pressed. The camera rises to
about y 37 over the vault and the knot, and the band stays in view. It is on the last screen
too, when he comes back out past the closing tableau. Under it, the labyrinth's masonry by its
rule; Z1, the first corridor down, runs under it from x 64 at y 208.

## Must be right

- **A band of black rays rising from below, as at an amphora's foot** (ruled 2026-10-10): tall
  glaze triangles, points up, standing on a lower line, with clay between them.
- **Never spikes, a hazard or a platform.** They are in the ground, under the floor he stands on
  from the first frame; the outside's floor is solid over the whole band, so nothing of him or of
  anyone reaches them. They are tall, 26 px against his 16, and slender, as many as fit, a frieze
  closed by the ground line over them, the course line under them and the outer face beside them.
  Nothing level runs across their points: no line, bar or flat top of their own to read as a
  ledge, and no gap in the ground line over them.
- **Never touching the outer face's glaze**, or any other glaze, corners included: x 79 is clay
  beside the face at x 80; a row of clay under the ground line and one over the course line; a
  pixel of clay between every two bases.
- **Visible at the spawn's camera**, whole, and whatever the camera does on the door storey.
- Every ray is the same, to the pixel, by construction.
- Glaze only: no added red, which is only on fillets and garment borders.
- **Rays, never a meander.** The meander is the labyrinth on the reverse of the Knossian staters
  (the research), and the labyrinth is never Knossos (`../../CHAPTER.md`, error dossier).
- Still: it moves only as the world does.

## Deliberately wrong

- **A vase's foot ornament as the ground outside a building**, under the panel's ground line, with
  the clay that is the level's air between its rays in solid ground (ruled 2026-10-10, "the level
  is the vase").
- **No black band.** The research puts a black band with the rays above an amphora's foot; here
  the heavier ground line over the rays is the only band, since a band of glaze in the ground
  would read as a hole.
- **Drawn, not painted.** Flat, unlit pixel art in code at 1 world px: the level is exempt from
  the painted style of `content/README.md` (`../LEVEL.md`, Art, 2026-10-10).

## Sources

- The amphora's layout, through search extracts of collection records (Getty, Bristol, Ackland):
  palmette and lotus on the neck, tongues on the shoulder alternately black and red, the figure
  panel, then a black band and rays above the foot, with reserved bands between friezes (the
  research, 2026-10-10).
- The meander as the labyrinth on the staters' reverse: Numista 398099 (https://numista.com/398099).

## Confidence

The layout: at search-extract level, from records not opened. No vase was looked at (designer's
ruling, 2026-10-10). **Not verified:** the rays' number, proportions and spacing on any vase;
ten, 7 by 26, are the game's. Chosen when they were drawn (2026-10-10), from trials at the
game's scale: rays 5 wide read as a picket fence, 9 or 11 wide as a row of trees or a saw, and
points 3 rows lower left a strip of clay over them like air over spikes; drawn symmetric, each
side stepping out on the same row as the other, widths 1, 3, 5 and 7, a ray read as a stack of
blocks, a pagoda.

**What this note replaces** (2026-10-10). Two notes of the first art pass:

- `labyrinth-tongues`: five tongues, glaze and added red, hanging over the outside at x 42 to 75
  and y 56 to 64, as on an amphora's shoulder over its panel. Built, the band read as bunting
  beside the death counter, which it was kept clear of only by standing right of the counter's
  column; it was replaced by these rays (designer, on a recommendation, 2026-10-10), and its
  decor, its drawing, its note, its manifest entry and its tests went with it.
- `labyrinth-lower-zone`: the same strip as plain wash with no joints, which ruled rays out as
  reading as spikes. The designer ruled the rays in (2026-10-10), and the strip is theirs.
