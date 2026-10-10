# The labyrinth's masonry

| | |
|---|---|
| Id | `tile-labyrinth` |
| File | None, and none is wanted: drawn in code at 1 world px by rule (`../LEVEL.md`, Art, 2026-10-10). The id is wired to the painted-tile lookup, so a file would replace the rule everywhere; one painted tile cannot carry the rule's joints, so none is made |
| Size | 16 × 16 world px, 1 frame; the rule spans tiles |
| Beat | `a-door`, and every beat |

## What it is

Every solid tile in the level but the lip: the outer wall, the floors, roofs and walls of every
corridor, room and shaft, the pillar tops in the column, and the ground under the outside. A
dilute-glaze wash with full-glaze course lines, as designed, laid by rule:

- **The wash**, `#7b4527`, over the whole of every stone tile.
- **Courses three tiles (48 px) high**, counted from the level's top: a tile in row `ty` is in
  course `floor(ty / 3)`.
- **Course lines**: a 1 px glaze line (`#1f140e`) along the bottom row of a stone tile in a
  course's last row (`ty % 3 == 2`), and along the bottom row of any stone tile with air under
  it, where the stone ends.
- **Blocks two tiles (32 px) long**: a 1 px glaze joint down a tile's left column where
  `tx + floor(ty / 3)` is odd and the tile to its left is stone, so that each course's joints fall
  halfway along the blocks of the next. Where a stone ends on air there is no joint.
- **Nothing else**: no lit top, no grain, no wear, no crack, no shading, no light.

## Where it stands in the game

Behind and around everything, on every screen. On T_end's floor (course 12) the joints fall at
x 80, 112, 144 and 176, where the beast's data needs them: the snort's breath comes up through
the joint at x 112, and a puff rises at the one at x 80.

## Must be right

- **Identical things identical by construction** (pillar 4):
  - T_end's plain blocks, x 80 to 192, the bed block among them, pixel for pixel the same, joints
    and all (`tests/minotaur-snort.spec.ts`).
  - The two holes in each of Daedalus's rooms, pixel for pixel the same, stone, course line and
    clay (`tests/minotaur-out.spec.ts`). Every room's ceiling (rows 26, 29, 32 and 35) is the last
    row of a course and has air under it, so each hole's jambs carry the course line.
  - Every hole the same plain hole, the hatch included: each one-tile floor has its underside
    line, and no hole has a rim, a grate or a mark.
- **Fewer and longer courses** than the rough build's one course a tile, which read as a castle's
  brick (ruled 2026-10-10). The blocks stay two tiles long: a longer block would lose the joint at
  x 112, the bed's, so the courses are made taller instead.
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

Design choice. The course height of three tiles is chosen here: it is the height at which all four
rooms' ceilings are a course's last row, which keeps their pinned holes identical with a course
line in them.
