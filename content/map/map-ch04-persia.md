# Iron Age Near East & Persia, the chapter map

| | |
|---|---|
| Id | `map-ch04-persia` |
| File | `map-ch04-persia.png` (not painted yet: the game draws its own until this file exists) |
| Size | 208 × 152 world px, painted 832 × 608 |
| Beat | `.` |

## What it is

The chapter's own brochure page: western and southern Iran, from Behistun in the Zagros
above the Kermanshah plain, down to Susa on the Khuzestan plain, and south-east along the
mountains to the three Fars sites, Persepolis on the Marvdasht plain with Naqsh-e Rustam
just north of it, and Pasargadae further north-east. The head of the Persian Gulf runs
across the bottom; the south shore of the Caspian reaches into the top. Sea, land, paper. No
pins, no route, no words. The game draws a pin for each site with a level, numbered like its
bead on the ribbon, and a single dotted leg from the previous site to the selected one; the
order is the ribbon's business, not the map's, so no route is drawn through them all.
Persepolis is the only site with a level; the other four are plain dots, and get a pin and a
number only while selected. Naqsh-e Rustam and Pasargadae sit so close to Persepolis that
their pins are nudged off their true spots, each with a leader line back to it.

## Where it stands in the game

Shown after the player picks the chapter on the world map, behind the pins, in the 208 × 152
map box on the left of the screen. The chapter header is printed over its bottom left,
across the head of the Gulf.

## Must be right

- The Gulf coast, the one sea coast in the frame: the Kuwaiti and Saudi shore with Bubiyan
  along the bottom, the head of the Gulf at the Shatt al-Arab, and the Iranian shore running
  south-east past Bushehr and leaving the bottom edge near Bandar Moqam, at about 53.2° E
  (about two thirds of the way across); east of that only a sliver of the shore by Bandar
  Abbas comes back inside the bottom right corner. The game draws it from the survey now, so
  there is a true line to paint over.
- The south shore of the Caspian, across the top of the frame between about 49° and 54° E.
  The game does not draw it, on this map or on the world map: the survey line it draws has no
  ring for the Caspian, so its land runs on over the sea. That is an accidental error in the
  code-drawn land, not a choice, and it is no model for the painting: paint the shore from a
  map.
- Lake Urmia, in the top left corner. The game leaves it out, because its lakes keep only the
  large ones, and it has shrunk to a fraction of its old extent since the late 1990s, by how
  much changing from year to year. Ask before painting whether it is drawn, and at what
  extent.
- The five sites where they are: three close together in Fars and two far to the north-west.
  By the coordinates in `src/map/atlas.ts`, Naqsh-e Rustam is about 7 km north of Persepolis
  and Pasargadae about 40 km north-east, in straight lines; Susa is about 500 km from
  Persepolis, and Behistun about 250 km beyond Susa.
- The frame: ask for the exact longitude and latitude bounds before painting; they are
  computed from the five sites in `src/map/atlas.ts` (on 2026-10-03, about 42.8° to 57.9° E
  and 27.1° to 38.1° N).

## Deliberately wrong

Brochure scale and colour. Most of the sheet is the Zagros and the plateau with nothing on
it, and that is correct: the geography of this chapter carries no information beyond where
the five sites are, and the ribbon and the panel carry the screen. No river is drawn, not the
Tigris, the Euphrates, the Shatt al-Arab or the Karun, though a brochure of Persia would show
them: the tour map draws one river, the Nile (`content/map/README.md`).

## Sources

Natural Earth, public domain, for the line the game draws. Lord Curzon, *Persia and the
Persian Question* (1892), and its map; the Admiralty charts of the Persian Gulf. These two
are named from general knowledge and have not been looked at for this note.

## Confidence

High for the Gulf coast, which the game draws from the survey. Medium for the rest: the
Caspian's shore and Lake Urmia are not drawn by the game and were placed from general
knowledge of the region, and the historical sources above are not checked.
