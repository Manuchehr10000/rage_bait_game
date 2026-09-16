# The tour map

The start screen. One sheet, three instruments, and each of them answers exactly one
question:

- **the map**, left, 208 × 152 world px: *where on Earth*. Paper, land, one marker per
  stop. Nothing else. There is no route drawn through the chapters, because the tour's
  order is chronological and the map's order is geographical: France, Egypt, the Aegean,
  Persia, Italy, Mexico, Cambodia, Japan, Zimbabwe, Samarkand, England, France. A line
  through those twelve in order, over true coordinates, can only ever be a web. The one
  line the map is allowed is the leg from the previous stop to the selected one.
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
ribbon; the map only ever gets as busy as the game actually is.

## What the designer paints

Ids: `map-world` for the world, `map-chNN-slug` for each chapter (`map-ch02-egypt`,
`map-ch01-palaeolithic`, ...). Only the world and the built chapters are listed in
`assets.json`; add an entry when a chapter gets its first level.

Positions come from real latitude and longitude in `src/map/atlas.ts`, projected the
brochure way (equirectangular). The world map's frame is longitude −115 to 150 and
latitude 65 to −40, drawn into the 208 × 152 map box. A chapter map is fitted to its
five sites with a margin; ask for the exact frame before painting one, since it depends
on the site coordinates.

What must be right: coastlines, the Nile, and nothing else. What is deliberately wrong:
everything a brochure gets wrong: scale, the vignettes, the cheerful colour.

Note that a chapter whose sites sit close together — chapter 1's four caves are inside
sixty kilometres of each other — gets a map that is mostly empty, and that is correct.
The geography there carries no information, the ribbon and the panel carry the screen,
and an empty quiet map beats a busy confusing one.

## The vignettes

One monument per chapter, `src/map/monuments.ts`, drawn by the game as a flat silhouette
with no interior detail until somebody paints one. To paint one, add an entry for
`map-monument-chNN-slug` to `assets.json` with a note beside it, at 92 × 70 world px;
the painted version takes over automatically.

**Each vignette is one of that chapter's own five sites**, never a famous monument
borrowed from elsewhere, and never one the research rejected. Giza is not the vignette
for Egypt, because `content/research/arc.md` rejects Giza as a level.

| Ch | Site | What must be right about the outline |
|---|---|---|
| 1 | Gargas | A hand stencil, pigment blown around a hand: the rock is the ink and the hand is the void. All four fingers stop at a knuckle and the thumb is whole — Gargas is the cave of the incomplete hands. No finger stands proud of the others: a hand with one finger up is a gesture, and pillar 11 says the tourist is the joke, never the place. |
| 2 | Abu Simbel | Four seated colossi of Ramesses II, one doorway between the inner pair, and the second colossus broken off above the waist. **Deliberately wrong:** the cornice and the frieze of twenty-two baboons above the heads are left off, because in silhouette they would flatten the four figures into one trapezoid. |
| 3 | Mycenae | The Lion Gate: two uprights, one lintel, the relieving triangle above it, two lionesses flanking a column that is wider at the top than at the foot. |
| 4 | Persepolis | Apadana columns, the slenderest in the ancient world for their height, under a capital of two bull foreparts back to back with the roof beam in the saddle between. **Deliberately wrong:** the bulls' horns are left off, because two horns on a skyline at this size read as antennae. |
| 5 | Segesta | A Doric hexastyle temple standing complete on its hill, with both pediments and no cella: it was never finished. |
| 6 | Tikal | Temple I: nine terraces, a stair straight up the front, and a roof comb narrower than the temple under it and taller than it, carrying nothing and holding up nothing. Chosen over El Castillo so that the Americas do not read as a pyramid a second time after Egypt. |
| 7 | Angkor Wat | Five towers in a quincunx, so the elevation shows the central one tall and four lower, each shaped like a lotus bud, over the galleries and the causeway. |
| 8 | Himeji | A stone base curving outward at the foot, then storeys under roofs with the eaves turned up at the corners. Chosen over the Great Wall, which is a line and not a shape. |
| 9 | Great Zimbabwe | The conical tower seen over the enclosure wall, with the smaller second tower beside it that has largely fallen. Dry stone, no mortar, no door, no stair: solid all the way through. |
| 10 | Registan | The pishtaq: a pointed arch in a rectangular frame taller than the building behind it, a ribbed melon dome on a drum, a minaret at each corner. |
| 11 | The Iron Bridge | One semicircular arch of cast iron, the deck carried over the crown, and the rings in the spandrels. |
| 12 | Martello Towers | A squat brick drum, wider than it is tall, battered inward all the way up, with the cordon ring under a low straight parapet, one traversing gun on the roof, and a door on the first floor with nothing under it but a ladder that could be pulled up after you. A second tower stands down the shingle: a hundred and three of them went up along the south and east coasts, spaced so their guns overlapped, against an invasion that never came. **Deliberately wrong:** the gun's barrel is drawn longer than a 24-pounder's was, because at this size the true length is a nub and a tower with no gun on it is just a drum. |
