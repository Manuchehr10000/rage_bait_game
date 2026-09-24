# The tour map

The start screen. One sheet, three instruments, and each of them answers exactly one
question:

- **the map**, left, 208 × 152 world px: *where on Earth*. The title and the chapter
  header both sit in its bottom left corner, and the compass rose is out in the Indian
  Ocean, because the tourist stands on the selected marker with his head a good deal
  above it and the top left of a world map is the North Sea, which is where chapter 1
  puts him. A test walks all twelve chapters and all sixty sites and fails if anything
  printed on the map ends up where he is standing, the numbers in the pins included.
  Paper, land, one marker per stop. Nothing else. The world draws no line between
  chapters, not even one leg of a route, because the tour's order is chronological and
  the map's order is geographical: France, Egypt, the Aegean, Persia, Italy, Mexico,
  Cambodia, Japan, Zimbabwe, Samarkand, England, France. Any line through those twelve,
  over true coordinates, is a piece of a web. A chapter map is allowed one dotted line, the
  leg from the previous site to the selected one, and numbers each pin the way the ribbon
  numbers its bead, so the map and the ribbon name a site the same way.
- **the panel**, right, 112 × 152: *what is there*. The chapter, its dates, and a
  vignette of one of the chapter's own monuments, the way a brochure prints one.
- **the ribbon**, along the bottom, 320 × 28: *where in the tour you are*. Every stop on
  one straight rule, left to right, with departure marked at the left end. A stop you
  have finished is stamped solid, so progress fills in from the left, and the heavy rule
  measures how far you have got, never where the cursor is. Clearing a stop out of order
  stamps its bead and does not move the rule.

Both views use the same grammar: the world puts the twelve chapters on the ribbon, a
chapter puts its five sites on it in play order, with their names under the beads.
A chapter the player cannot enter is a faint dot on the map and a hollow bead on the
ribbon; the map only ever gets as busy as the game actually is. A site without a level
is a dot too, and a dot carries no number; it gets its pin and its number only while
it is selected.

## What the designer paints

Ids: `map-world` for the world, `map-chNN-slug` for each chapter (`map-ch02-egypt`,
`map-ch01-palaeolithic`, ...). Only the world and the built chapters are listed in
`assets.json`; add an entry when a chapter gets its first level.

The land the game draws underneath is not a guess. `src/map/geo.ts` is generated from
Natural Earth, which is public domain, by `npm run map:coastlines` — coastlines at
1:10m, lakes and the Nile at 1:50m, simplified hard in the open ocean and barely at all
within two and a half degrees of a site, because a chapter map draws the same data
twenty to fifty times larger. Do not edit that file by hand; run the tool, whose header
says where to get the source layers.

Positions come from real latitude and longitude in `src/map/atlas.ts`, projected the
brochure way (equirectangular). The world map's frame is longitude −115 to 150 and
latitude 65 to −40, drawn into the 208 × 152 map box. A chapter map is fitted to its
five sites with a margin; ask for the exact frame before painting one, since it depends
on the site coordinates.

What must be right: coastlines, the lakes, the Nile, and nothing else. What is
deliberately wrong: everything a brochure gets wrong: scale, the vignettes, the
cheerful colour.

Note that a chapter whose sites sit close together — three of chapter 1's five caves are
inside sixty kilometres of each other, and all five in the south-west of France — gets a
map that is mostly empty, and that is correct.
The geography there carries no information, the ribbon and the panel carry the screen,
and an empty quiet map beats a busy confusing one.

## The vignettes

One painted plate per chapter in the panel: 92 × 70 world px, painted 368 × 280,
filling its keyline frame edge to edge. Each is one of that chapter's own five sites,
never a famous monument borrowed from elsewhere and never one the research rejected.
Each plate has its note beside it in `monuments/`, with what must be right, what is
deliberately wrong, what is contested, and the sources; the note is the authority,
not this page.

| Ch | Plate | Note |
|---|---|---|
| 1 | Gargas, the hand in the niche | `monuments/map-monument-ch01-palaeolithic.md` |
| 2 | Abu Simbel, the Great Temple | `monuments/map-monument-ch02-egypt.md` |
| 3 | Mycenae, the Lion Gate | `monuments/map-monument-ch03-aegean.md` |
| 4 | Persepolis, the Apadana and its eastern stair | `monuments/map-monument-ch04-persia.md` |
| 5 | Segesta, the unfinished temple | `monuments/map-monument-ch05-classical.md` |
| 6 | Tikal, Temple I (architecture only: gate-6 ruling, arc.md §4) | `monuments/map-monument-ch06-americas.md` |
| 7 | Sigiriya, the lion's paws (Angkor Wat carries an unresolved gate-6 flag) | `monuments/map-monument-ch07-monsoon.md` |
| 8 | Himeji, from the south | `monuments/map-monument-ch08-east-asia.md` |
| 9 | Great Zimbabwe, the conical tower inside the Great Enclosure (walls and tower only: arc.md §4) | `monuments/map-monument-ch09-africa.md` |
| 10 | Registan, the Ulugh Beg Madrasa (the only one inside the chapter's dates) | `monuments/map-monument-ch10-islamic.md` |
| 11 | The Iron Bridge, from downstream | `monuments/map-monument-ch11-industrial.md` |
| 12 | Martello Towers, Dymchurch | `monuments/map-monument-ch12-napoleonic.md` |

**How they are made.** Each plate is painted by a script in `tools/monument-painters/`,
following the research in `tools/monument-painters/specs/`, and regenerated with
`npm run map:monuments` (or `-- <painter>` for one). The Abu Simbel plate is the
standard the others were matched to: flat brochure illustration, light from the upper
right, the shared sky and shadow colours from `_brush.js`. A plate is saved as an
indexed PNG and must stay under 64 kB, because all twelve load before the first
screen. A hand painting can replace any plate at the same size; drop the `source`
from its manifest entry and keep the `.aseprite` beside it as usual.

If a plate is missing, the map falls back to the flat silhouette in
`src/map/monuments.ts`. Those silhouettes predate the research and are placeholders
only.
