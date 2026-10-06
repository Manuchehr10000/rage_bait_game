# A guard of the east stair

| | |
|---|---|
| Id | `apadana-guard` |
| File | `apadana-guard.png` (not painted yet: the game draws its own until this file exists) |
| Size | 10 × 29 world px per frame, painted 40 × 116, 2 frames in a horizontal strip (80 × 116 total) |
| Beat | `d-apadana` |

## What it is

One of the eight guards of the central panel of the Apadana's east stair: four on each side of a
blank rectangle, facing in, each holding a spear upright (Livius, "Apadana East Stairs"). They are
"eight soldiers, dressed like Medes and Persians" (Livius, through a search extract). They stand
where the audience relief was, the king on his throne giving audience, which was taken out of the
centre of the stair in antiquity and set up in the Treasury, for reasons not known (Oxford Cabinet;
Livius). The game's guard has a fluted hat, a curled beard and a long robe, and holds the spear
upright in front of him. Frame 0 faces right (the left-hand file) and frame 1 faces left (the
right-hand file), each lit from the upper right, so frame 1 is not frame 0 flipped.

## Where it stands in the game

The guards are the level's second trick, 'The audience' (`../LEVEL.md`, "The tricks").

- **In the wall.** On the central projection's lower panel, under the plain band: at x 1140, 1149,
  1158 and 1167 facing right, and at 1192, 1201, 1210 and 1219 facing left, shoulder to shoulder,
  9 px apart, the blank between the two files from 1176 to 1192. Painted with its top-left at
  (x − 1, 82). The figure is the right-hand 9 × 28, his feet on the projection's base moulding at
  y 110, where the bottom row, his shadow, lies; the left column is shadow too. His body is the
  bottom 22 rows, from his hat to his feet, and the spear rises six more over his hat.
- **Out in the court.** On the clock all eight step out of the wall into the court where each is
  carved, stand there 0.6 s and step back. The game draws the same painting two pixels lower, so
  that his feet are on the court, with a dark edge round him from halfway out. Nothing fades. It
  makes the edge from the painting's own outline, so the painting must hold the figure alone, on
  transparency. He never moves sideways and never steps into the blank. While out he kills at a
  touch, by his body, 9 × 22; the spear is not part of it. Never solid.
- All eight are this one painting, in the wall and in the court: **identical to the pixel**
  (pillar 4).

## Must be right

- **One figure, eight times.** A guard who differed from the others would be read as the one that
  moves. All eight move, together.
- **As carved as everything else.** The same stone, the same depth of cut and the same light as
  the delegates, the sphinxes, the Gate's bulls and the king on the Tachara's jambs. Everything
  carved in the level has stayed a carving until now, and the trick is that these do not.
- Facing in, toward the blank, the spear upright and held in front of him.
- The Persian dress as the game draws it: the tall fluted hat, the beard in curls, the long robe
  in folds. Check it against the relief.
- Unpainted grey limestone, and crisp: the east stair lay under fallen mud brick until Herzfeld
  dug it out in 1931–34 (`../LEVEL.md`).
- No shadow cast on the court when he is out, only the thin dark edge (`content/README.md`).

## Deliberately wrong

- **One dress for all eight.** The real guards are Persians and Medes (Livius). Which stands where
  is not verified, so all eight are one stamp, the Persian, as on the map plate. When the order is
  checked the game can draw two, and every Persian will still be identical to every Persian.
- **They step out of the wall, stand in the court and step back, on a clock.** They are carved and
  have never moved.
- **The blank is as wide as the trick needs:** 16 px, 1.7 m, his own height (`../LEVEL.md`).

## Sources

- Livius, Persepolis: the Apadana's east stairs, and its pictures of the central frieze:
  https://www.livius.org/articles/place/persepolis/persepolis-photos/persepolis-apadana-east-stairs/
- Cabinet, University of Oxford, "The Apadana at Persepolis", with the audience relief:
  https://www.cabinet.ox.ac.uk/apadana-persepolis
- *Encyclopaedia Iranica*, "Apadana": https://www.iranicaonline.org/articles/apadana/
- ISAC, University of Chicago, Persepolis photographic archive:
  https://isac.uchicago.edu/collections/photographic-archives/persepolis/apadana . E. F. Schmidt,
  *Persepolis I* (1953, OIP 68): reference, rights in the plates to check. Herzfeld's photographs
  of 1931–34: reference only.
- No nineteenth-century plate shows the east stair: it was buried when Flandin & Coste drew.
- The tour map's research: `tools/monument-painters/specs/apadana.json`.

## Confidence

Eight guards, four a side, facing in with spears, in Persian and Median dress, round a blank:
search-extract level (Livius). **Not verified, so ask before painting:** their height; which are
Persian and which Median, and in what order; what each carries besides the spear; the blank's
width; the shape of the Persian hat on this panel.
