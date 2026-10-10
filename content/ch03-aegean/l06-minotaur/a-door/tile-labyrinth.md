# The labyrinth's masonry

| | |
|---|---|
| Id | `tile-labyrinth` |
| File | None, and none is wanted: drawn in code at 1 world px by rule (`../LEVEL.md`, Art, 2026-10-10). The id is wired to the painted-tile lookup, so a file would replace the rule everywhere; one painted tile cannot carry the rule's joints, so none is made |
| Size | 16 × 16 world px, 1 frame; the rule spans tiles |
| Beat | `a-door`, and every beat |

## What it is

Every solid tile in the level but the lip: the outer wall, the floors, roofs and walls of every
corridor, room and shaft, the pillar tops in the column, and the ground under the outside. Its
one variation is the floor course outside the outer face, x 0 to 79 and y 160 to 191, which is
the vase's foot under its panel: the ground line (`labyrinth-ground-line`) and the band of rays
(`labyrinth-rays`) on clay, standing on this rule's course line along y 191, with no joints. A
dilute-glaze wash with full-glaze course lines, as designed, laid by rule:

- **The wash**, `#7b4527`, over the whole of every stone tile.
- **Courses two tiles (32 px) high**, counted from the level's top: a tile in row `ty` is in
  course `floor(ty / 2)`.
- **Blocks two tiles (32 px) long**, so every block is square: a 1 px glaze joint down a
  tile's left column where `tx + floor(ty / 2)` is odd and the tile to its left is stone, so
  that each course's joints fall halfway along the blocks of the next. Where a stone ends on
  air there is no joint. In a tile with air over it the joint begins a pixel down: a floor's
  top row is wash from end to end, so nothing that stands on it touches a joint.
- **Course lines**: a 1 px glaze line (`#1f140e`) along the bottom row of a stone tile in a
  course's last row (`ty % 2 == 1`); and along the bottom row of any block with air under
  any of it, the whole block's length: where a ceiling meets a wall, its line runs on over
  the wall to the end of the block, a bed joint where the block sits on the stone below.
  Under the level and beyond its sides counts as stone, so no line runs along its edges.
- **Against the black**, the rule's one exception: no line of the masonry touches the
  vestibule's black (x 96 to 127, y 80 to 159), not even at a corner. Where the stone has that
  black under it, its bottom row is reserved clay instead of the underside line: y 79 from x 95
  to 128, so the joint at x 112 in that course ends at y 78, the lintel over the door opening
  (`labyrinth-face`) ends at x 94, and the bed line over P's roof starts at x 129. P's roof, the
  stone beside the black from y 80 to 95, has its left column in reserved clay, x 128 from y 79
  to 95, its course line included, which starts at x 129. The floor under the black keeps its
  wash top row, as every floor does, and its joints at x 96 and 128 begin at y 161. The hero's doorway frames its black with its own line
  and clay (`../e-cell/hero-doorway.md`); the floor's joint under it, at x 160, begins at y 657
  by the floor rule.
- **Nothing else**: no lit top, no grain, no wear, no crack, no shading, no light.

## Where it stands in the game

Behind and around everything, on every screen. On T_end's floor (course 18) the joints fall at
x 80, 112, 144 and 176, where the beast's data needs them: the snort's breath comes up through
the joint at x 112, and a puff rises at the one at x 80.

## Must be right

- **Identical things identical by construction** (pillar 4):
  - T_end's plain blocks, x 80 to 192, the bed block among them, pixel for pixel the same, joints
    and all (`tests/minotaur-snort.spec.ts`).
  - The two holes in each of Daedalus's rooms, pixel for pixel the same, stone, line and clay
    (`tests/minotaur-out.spec.ts`). One hole is against each end wall, so one jamb of each is
    over the room and the other over the wall: the line under a whole block over air is what
    gives both the same line, whichever course the ceiling is in (rows 26 and 32 are a course's
    first row, 29 and 35 its last).
  - Every hole the same plain hole, the hatch included: each one-tile floor has its underside
    line, and no hole has a rim, a grate or a mark.
- **Fewer and longer courses** than the rough build's one course a tile, which read as a castle's
  brick (ruled 2026-10-10). The blocks stay two tiles long: a longer block would lose the joint at
  x 112, the bed's, so the courses are made taller instead, to two tiles: square blocks.
- **No line of it ever touches another glaze shape**: two glaze shapes never touch without 1 px
  of clay between them (`../LEVEL.md`, Art, 2026-10-10). Wash is not glaze, so a figure may stand
  on it and the black may meet it; a line may not, hence the joints a pixel under every floor's
  top and the clay round the vestibule's black.
- **No lit top.** The rough's pale top on stone with air over it was light from above, which this
  chapter keeps for open sky (`../../CHAPTER.md`): the shafts and the hatch must never read as
  light wells.
- **Never Knossos**: no gypsum, no ashlar facing, no timber, no red-and-black columns; the pillar
  tops in the column are masonry and never Minoan columns.
- Wash, never full glaze over a stone: glaze is a person, the dark, a line.

## Deliberately wrong

- **The labyrinth's plan, in plain masonry only** (`../LEVEL.md`, Deliberately wrong): the section,
  its stone and its courses are the game's.
- **Black-figure for a section view**: the vases never draw the labyrinth in section; the masonry
  in the vases' palette is the game's.
- **One block for the whole level**, every course the same height and every block the same length.
- **Drawn, not painted.** Flat, unlit pixel art in code at 1 world px: the level is exempt from
  the painted style of `content/README.md` (soft interiors, light from the upper right), which
  black-figure is not (`../LEVEL.md`, Art, 2026-10-10).

## Sources

None for the stone: the labyrinth is Daedalus's building in the myth (Apollodorus 3.1.4; Ovid,
*Metamorphoses* 8.159–168, line numbers unverified), and no source describes its masonry.

## Confidence

Design choice. The course height of two tiles was chosen when the masonry was drawn
(2026-10-10), against three in this note as first written: blocks 32 px long and 48 high, in
running bond, were drawn and looked at, and read as upright planks or panels, not stone; square
blocks read as ashlar. Three tiles was chosen so that every room's ceiling was a course's last
row and both jambs of each hole carried a course line; with two, rows 26 and 32 are a course's
first row, and the line under a whole block over air gives both jambs the same line instead. So
are the joints that begin a pixel under a floor's top and the clay round the vestibule's black,
both for the clay-gap rule (2026-10-10, after a check of the notes): the rule as first written
drew the underside line along y 79 onto the black and put joints in the top row of the floor
under it.
