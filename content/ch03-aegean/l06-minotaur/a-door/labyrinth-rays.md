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
over it on the ground line from the first frame, before anything is pressed. It is on the last
screen too, when he comes back out past the closing tableau. Under it, the labyrinth's masonry
by its rule; Z1, the first corridor down, runs under it from x 64 at y 208.

**The camera keeps it whole** however high he goes (`LevelData.cameraKeeps`, y 194, after a check of
the rays, 2026-10-10): the rays, their course line and two rows of the masonry under it, so that the
line reads as their foot and not as the screen's edge. Rising after him, the camera stops with its
top at y 14, two rows of clay over the roof's line at y 16, so the roof's top still shows from G0
(`labyrinth-face`). In the clean run its top comes up to y 14.33 over the vault, 16.94 over the
knot, and holds at 14 for 32 frames along G0 on the way out. Without it the camera rose to 1.30 over
the vault, 12.93 over the knot and 0 along G0: from about frame 43 to 61 the rays were cut partway
up at the bottom of the screen and read as spikes rising out of its edge under a thin ledge, every
full jump outside did the same, and along G0, for about 60 frames, only their top 16 rows showed
under the queue. (This note said the camera rose "to about y 37" and the band stayed in view, which
was wrong.) The camera keeps nothing else from view but the top 14 rows of the level, clay over the
roof and outside. It moves nothing and times nothing: every position of the clean run is the same
with it.

**The death counter on the band: open, for the designer** (the same check, 2026-10-10). The
counter's ink is the top left of every screen, view x 5.6 to 29.1 and y 5.2 to 27.1 at up to 99
deaths, in the font this Chromium sets for Georgia. Wherever he is on the door storey or over it,
the camera's top is y 14 to 53, and the counter is on the clay over the queue, 80 rows or more over
the ground line. But looking down at Z1 the band is at the top of the screen, and the counter lies
on the ground line and the upper halves of the first four rays, x 0 to 30: in the clean run for 116
frames, about 1.9 s, from the drop into D0 (frames 167 to 282), and for 32 more on the climb from
the ledge at 320 to L_B (1037 to 1068); the way down is replayed before every death after the knot.
Its cream outline keeps it legible, but the ground line runs through "DEATHS" and the numeral stands
on the rays: the counter and the ornament meet, as they did when the tongues beside it read as
bunting. Left as built until the designer rules: accept it; or keep the counter's column clear,
which would start the rays at x 32, six of them, and not at the screen's edge. Pinned as built in
`tests/minotaur-out.spec.ts`.

**The reading at the spawn, for the designer** (the same check). The clay between the rays is the
air's colour, so with the band whole the 2 px ground line can read as a ledge over a pit of spikes,
though the ground line, the course line and the outer face close the band in (`labyrinth-clay`, its
one place of clay in solid ground). Not changed: it is the ruled picture, black rays on the vase's
clay, and the band of glaze the research puts with the rays was left out because in the ground it
would read as a hole (Deliberately wrong).

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
- **Whole on the screen** at the spawn's camera and however high he goes: never cut into spikes
  at the screen's bottom edge, its course line never the screen's last row (the camera's
  `cameraKeeps`, above).
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
