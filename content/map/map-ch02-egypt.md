# Egypt, the chapter map

| | |
|---|---|
| Id | `map-ch02-egypt` |
| File | `map-ch02-egypt.png` (not painted yet: the game draws its own until this file exists) |
| Size | 208 × 152 world px, painted 832 × 608 |
| Beat | `.` |

## What it is

The Nile from Abu Simbel in the south to Saqqara in the north, as the chapter's own
brochure page: the river, the desert either side, the Red Sea coast at the right edge,
Lake Nasser behind the High Dam. No pins, no route, no words. The game draws the site
markers where the sites really are; their order is the ribbon's business, not the map's,
so no route is drawn between them.

## Where it stands in the game

Shown after the player picks Egypt on the world map, behind the pins, in the 208 × 152
map box on the left of the screen.

## Must be right

- The Nile's course and the position of Lake Nasser. The game draws both from the
  survey now, so there is a true line to paint over.
- Abu Simbel and Philae drawn where they are now, on the lake shore and on Agilkia,
  not where they were built. The chapter gag depends on the coordinates being honest.
- The frame: ask for the exact longitude and latitude bounds before painting; they
  are computed from the five sites in `src/map/atlas.ts`.

## Deliberately wrong

Brochure scale and colour.

## Easter eggs

A faint dotted outline of the old Philae, under the water.

## Sources

The *Description de l'Égypte* atlas sheets; any pre-1930 Baedeker map of Egypt.

## Confidence

High.
