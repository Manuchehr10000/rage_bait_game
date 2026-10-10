# The tongues over the door storey

| | |
|---|---|
| Id | `labyrinth-tongues` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 34 × 9 world px, 1 frame, its top-left at (42, 56) |
| Beat | `a-door` |

## What it is

A band of tongues, alternately black glaze and added red, hanging over the outside as on the
shoulder of an amphora over its figure panel. With the ground line under the figures, it frames
the first screen as the panel: a tourist in full colour walking into a museum vase.

- Five tongues from y 56 to 64, each 6 px wide with a pixel of clay between, x 42 to 75: glaze,
  red, glaze, red, glaze. x 76 to 79 is clay, so that the band never comes near the outer face's
  contour at x 80; x 0 to 41 is clay, the death counter's column.
- Each hangs: straight sides for seven rows, then its foot rounded over two, 4 px and then 2.
  Nothing over them: no line, no bar, no flat top across the band to read as a ledge; the band's
  top is the tongues' own tops, a pixel of clay between each.
- A red tongue is added red over the glaze, as on the vases: red (`#93321f`) inside a 1 px glaze
  contour down its sides and round its foot, open at its top.

## Where it stands in the game

Over the outside, in the clay above Ariadne and the kneeling hero. The camera's top is y 53 at
the spawn and rises to about y 37 on the jump over the knot, so the band is at the top of the
first screen and of the last, when he comes out past the tableau.

The HUD stays as it is (ruled 2026-10-10), and draws the death counter over the top left of every
level: DEATHS at view (6, 5), 6 px tall, and the numeral under it at (6, 11), 20 px tall. The
level is one screen wide, so a view x is a world x. As the camera rises and falls over the vault
and the knot, the band passes through the counter's rows: at the spawn the label lies over y 58
to 64, and with the camera at y 37 the numeral over y 48 to 68. So the band keeps out of the
counter's column instead, and begins at x 42. When the world was drawn (2026-10-10) the band ran
from x 0 and the counter covered nearly half of it, its dark label on the black and red tongues
cut from them only by its cream stroke; a check of the stage moved it. Measured in Chromium, the
counter's ink ends at x 29 to 35 with up to 99 deaths, in the fonts the HUD falls back to
(`tests/minotaur-out.spec.ts`). **Not measured:** Georgia, the HUD's first font, which this
project's machines do not have. If its bold figures are about as wide as DejaVu Serif's, a third
digit, at 100 deaths in one visit, would reach the first tongue, and only while the camera is up
at the door storey.

## Must be right

- **Out of his reach, and never a ledge** (ruled 2026-10-10). Nothing of him rises above y 68.2
  (a full jump from the back of the kneeling hero, his box's top at 146) or y 82.2 from the
  floor, so a band whose foot is at y 64 can never be touched. It is not solid, and nothing about
  it says it is: tongues hang, with no line or flat top over them.
- **The outside only**, x 42 to 75. Never over the labyrinth: over the vestibule and the passage
  it would lie on the section's stone, and in G0 a man standing on its floor has his head at y 64.
- **Never under the death counter** (2026-10-10), which stays as it is: the counter is pillar 7's,
  big and always there, and the band keeps right of its column.
- **Tongues, never a meander.** The meander is the labyrinth on the reverse of the Knossian
  staters (the research), and the labyrinth is never Knossos (`../../CHAPTER.md`, error dossier).
- Added red only over glaze: red on the clay is a contrast of 2.22, and close in hue (the
  research). Added red on a border, as everywhere in the level: never on a wound, a blow or the
  heap.
- Every glaze tongue is the same and every red one is the same.
- Still: it moves only as the world does.

## Deliberately wrong

- **An ornament band over a building in section**, the vase's shoulder over a door storey (ruled
  2026-10-10, "the level is the vase").
- **Drawn, not painted.** Flat, unlit pixel art in code at 1 world px: the level is exempt from
  the painted style of `content/README.md` (`../LEVEL.md`, Art, 2026-10-10).

## Sources

- The amphora's layout, through search extracts of collection records (Getty, Bristol, Ackland):
  palmette and lotus on the neck, tongues on the shoulder alternately black and red, the figure
  panel, then a black band and rays above the foot (the research, 2026-10-10).
- The meander as the labyrinth on the staters' reverse: Numista 398099 (https://numista.com/398099).

## Confidence

The layout: at search-extract level, from records not opened. No vase was looked at (designer's
ruling, 2026-10-10). **Not verified:** the tongues' shape and proportions on any particular vase;
the number, width and length here are the game's. This note first gave sixteen tongues 4 px
wide hanging from a glaze line. When the band was drawn (2026-10-10) the line went, for the
stage's direction that the tongues hang with no flat top (a thin line over clay is the shape of
a ledge he might jump to); drawn 4 px wide, the tongues read as a row of pills, so they were
made 6 px wide, their feet rounded over two rows. Then eleven tongues ran from x 0, under the
death counter, until the check of the stage moved the band right of it (2026-10-10); five keep
a glaze tongue at each end.
