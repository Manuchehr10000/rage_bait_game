# The tour map

The start screen. A world map in the style of a hotel-desk tour brochure, with one
numbered badge per chapter and a dotted route through them in chapter order; then,
once a chapter is chosen, that chapter's own map with its five sites as pins along the
route. The game draws the badges, pins, route, the tourist and every word. The designer
paints the paper and the land.

Ids: `map-world` for the world, and `map-chNN-slug` for each chapter (`map-ch02-egypt`,
`map-ch01-palaeolithic`, `map-ch03-aegean`, ...). Only the world and the built chapters
are listed in `assets.json`; add an entry when a chapter gets its first level.

Positions come from real latitude and longitude in `src/map/atlas.ts`, projected the
brochure way (equirectangular). The world map's frame is longitude −115 to 150 and
latitude 65 to −40. A chapter map is fitted to its five sites with a margin; ask for
the exact frame before painting one, since it depends on the site coordinates.

What must be right: coastlines, the Nile, and nothing else. What is deliberately wrong:
everything a brochure gets wrong: scale, the vignettes, the cheerful colour.
