# Palaeolithic Europe, the chapter map

| | |
|---|---|
| Id | `map-ch01-palaeolithic` |
| File | `map-ch01-palaeolithic.png` (not painted yet: the game draws its own until this file exists) |
| Size | 208 × 152 world px, painted 832 × 608 |
| Beat | `.` |

## What it is

The south-west of France as the chapter's own brochure page: from Roc-aux-Sorciers on the
Anglin in the north to Gargas in the Pyrenean foothills in the south, with the Dordogne
caves between them. The Atlantic coast and the Gironde at the left edge, the Pyrenees
along the bottom. No pins, no route, no words. The game draws the site markers where the
sites really are; their order is the ribbon's business, not the map's.

## Where it stands in the game

Shown after the player picks the chapter on the world map, behind the pins, in the
208 × 152 map box on the left of the screen.

## Must be right

- The coast and the Gironde, where the frame reaches them. The game draws the coastline
  from the survey now, so there is a true line to paint over.
- The five caves where they are: three of them, Cap Blanc, Rouffignac and Pech Merle, are
  within sixty kilometres of each other and the other two are not.
- The frame: ask for the exact longitude and latitude bounds before painting; they
  are computed from the five sites in `src/map/atlas.ts`.

## Deliberately wrong

Brochure scale and colour. Most of the sheet is empty inland, and that is correct: the
geography of this chapter carries no information, and the ribbon and the panel carry the
screen.

## Easter eggs

None planned.

## Sources

The *Carte de Cassini* (1756–1815), public domain, for the rivers and the old names; any
pre-1930 Baedeker map of southern France.

## Confidence

High.
