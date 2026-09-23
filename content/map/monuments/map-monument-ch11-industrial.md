# The Iron Bridge, for the tour map

| | |
|---|---|
| Id | `map-monument-ch11-industrial` |
| File | `map-monument-ch11-industrial.png` |
| Size | 92 × 70 world px, painted 368 × 280 |
| Beat | `monuments` |
| Source | `tools/monument-painters/iron-bridge.js`, painted by script; regenerate with `npm run map:monuments -- iron-bridge` |

## What it is

The Iron Bridge over the River Severn, in the Ironbridge Gorge near Coalbrookdale,
Shropshire. The first major cast-iron arch. Work began in November 1777. The masonry
abutments went up in 1777–78, the ribs first spanned the river on 2 July 1779, and the
bridge opened on 1 January 1781. One span of 100 ft 6 in (30.63 m), with no pier in the
river. Five ribs, each cast in two halves and bolted at the crown. No vehicle has crossed
since 18 June 1934. English Heritage's conservation of 2017–18 painted it a very dark
red-brown, which paint analysis found to be its first colour.

The view is the downstream face, which is the east face: the Severn flows west to east
here, from Buildwas to Coalport. The eye is low near the water, a short way downstream,
looking upstream, west. Left is south, the Broseley bank. Right is north, the town. The
face is squared up almost to an elevation, turned only enough to show the rear ribs
inside the opening.

Left to right:

- A riverside tree at the edge of the frame, over a stone pier the frame cuts. It hides
  the far end of the deck.
- One cast-iron land arch. Round-headed, two concentric rings on straight legs, standing
  on a stone plinth, with the towpath passing under it. Through it, a lit bank and the
  south woods.
- Behind the deck above the land arch, the tollhouse: a dark grey tile roof, a chimney on
  the gable, a strip of shaded upper wall under the eaves, and the gable end lit on its
  right. The deck and railing hide the rest.
- The south pier, plain buff-grey ashlar, up to the railing.
- The main span. At each end, a pair of iron uprights from the arch's foot to the deck,
  braced across near the foot and near the top, with an ogee loop between them: reverse
  curves drawn to a point at top and bottom. Beside the inner upright, one open ring under
  the deck, and a reverse curve from the upright down to the outer arc below it. Then the
  three concentric arcs of the face rib, with a few radial links between them. The
  innermost runs foot to foot and meets the deck at mid-span. The two outer arcs end in
  the deck short of the crown, each at its own point. Nothing stands between the arch and
  the deck across the middle of the span.
- Inside the arch mouth, four rear ribs recede as arcs in shade, each with its inner edge
  caught by light off the river: five ribs in all. Through the arch, the far reach of the
  gorge, paler, and the river going on under it.
- The deck over the whole length, rising gently to a slight peak over the crown. Along it,
  a railing: a top rail and a bottom rail, a few plain posts, and a comb of close-set thin
  bars with the woods showing through.
- At the right, a tall stone pier at the north corner, standing a little above the
  railing. Then the north abutment's masonry, its top at the roadway, running into the
  bank to the edge of the frame. A bush at its foot.

Behind, the wooded gorge as three rounded masses of broadleaf canopy, all of them above
the deck: the south spur on the left, turned from the sun; the far ridge, palest and
coolest, lowest over the river; the town spur on the right, in the sun, with two small
brick cottages up its side, gable on. A band of cloudless sky runs across the top, about
a fifth of the plate.

Below, the Severn across the full width, grey-green, with long pale ripples. The bridge
and its stone are reflected as a few flat tones, a little shallower than the bridge and
broken by bands of open water, so the arch and its image close into a ring. The arch
feet, the piers and the abutment throw shadows on the water, down and to the left. An ink
line runs round the ironwork, the stone and the tollhouse roof.

The light is the set's sun, from the upper right. For a view facing west that is a
north-easterly sun low over the viewer's right shoulder, which happens here on a summer
morning: near midsummer the sun stays north of due east until about 08:30 BST. The
research's photograph from this side, taken at 05:58 BST on 31 July 2020, shows the face
lit from the right. The upward and right-facing edges of the iron are lit warm; the
soffits and left-facing edges are turned cool. The south half of the ironwork is washed
cool and the north half warm, split at the crown. The iron's main face samples at
`#864b34`; under the arch it is `#5b2d20`.

The arcs are true semicircles on one centre at the springing line. The outer arc spans
220 of the plate's 368 px, 60% of its width. The crown sits a little right of centre, so
the south end, which carries more, fits in.

## Where it stands in the game

The chapter 11 panel on the tour map: the plate that stands for the chapter. The panel is
the right-hand strip of the start screen, and the game prints this plate in it, 92 × 70,
whenever chapter 11 is the chapter in view. The game lays paper under it, draws a thin
keyline round it, and sets the site's name, "The Iron Bridge", beneath it, outside the
plate. Chapter 11 has no built level yet, so it has no chapter map, and the plate appears
on the world map's panel only. Until the painting is loaded, the game draws the flat
silhouette `iron-bridge` in `src/map/monuments.ts` in its place.

The Iron Bridge (`iron_bridge`; atlas 52.63 N, 2.49 W, which matches the bridge at
52.627 N, 2.486 W) is one of the five candidate sites `content/research/arc.md` lists for
chapter 11, the deliberately non-monumental chapter. The chapter is a candidate, not
locked, and the site has no level number yet. This plate does not give it one. `arc.md`
names the early cracks and ground-movement repairs as a flaw beat. That beat belongs to a
level; the plate shows none of it. The research found nothing wrong in `arc.md`'s chapter
11 entry. Its "Rooker engraving 1782" is William Ellis's engraving after Michael Angelo
Rooker's drawing, published by J. Phillips in London in 1782. The shorthand is acceptable;
"Ellis after Rooker" is the exact credit.

The code silhouette has errors the research names, and none has been corrected yet. It
draws four vertical struts from the arch to the deck, which do not exist: the spandrels
are filled by the two outer concentric arcs, the radial links, and a ring and ogees near
each end. Its arch has no abutments and its feet float above the drawn bank. Its deck is
a flat box. Its two ends are mirror images. The chapter 11 row in `content/map/README.md`,
"One semicircular arch of cast iron, the deck carried over the crown, and the rings in the
spandrels", is correct but leaves out what makes the outline this bridge. The research
asks for it to add the two outer arcs that end at the deck, the masonry abutments and the
south land arches. That has not been done either.

Respect gate. Clear, per the research: engineering, a scheduled monument and a working
footbridge. No worship, no graves, no atrocity. The Coalport ferry drowning of 1799
happened downstream at Coalport, and nothing of it is in frame. The no-text rule, not the
respect gate, keeps the cast inscription and the toll board out.

## Must be right

- One single arch spans the river. No pier stands in the water.
- The arch is a near-semicircle: round-topped, about twice as wide as it is high. Not
  pointed, not elliptical, not flattened.
- On the face rib, three concentric arcs. The innermost runs foot to foot and meets the
  deck at mid-span. The two outer arcs start at the feet and stop where they meet the
  deck, short of the crown.
- No vertical struts between the arch and the deck across the middle of the span.
- Vertical iron uprights at each end of the span, from the arch's foot up to the deck.
- One full ring, an open circle and not a solid disc, under the deck near each end beside
  the uprights. Two rings on the face, mirror images. None at the crown.
- Reverse-curve (ogee) members in the spandrel next to each ring and the uprights.
- The deck passes over the crown and rises gently to mid-span. Neither flat nor steeply
  humped.
- A see-through railing of close-set thin vertical bars along the deck edge.
- All the ironwork, railings included, is one very dark red-brown, a mahogany shade. Not
  grey, black, silver, pillar-box red or bright rust-orange.
- Further ribs recede behind the face rib as parallel arcs under the arch. If they can be
  counted, there are exactly five ribs.
- The iron springs from buff-grey stone masonry at both ends and the deck lands on stone.
  No brick in the bridge itself, and nothing floats.
- The two ends differ. At the left (south) end, beyond a stone pier, an iron land arch
  continues the bridge. The right (north) end runs straight into solid masonry.
- The tollhouse shows behind the left end of the deck, mostly hidden by it: a pitched dark
  grey roof, a chimney, a strip of upper wall. It stands at the south end on the upstream
  side, so from downstream the bridge hides all but its top. Nothing like it at the right
  end.
- Steep slopes of deciduous broadleaf trees rise above deck level on both sides. Sky shows
  only above them. No conifers.
- The river runs under the arch in the foreground and reflects it. Its water is green and
  grey, not blue.
- Any town houses are on the right (north) side only.
- No vehicles on the bridge.
- No second bridge and no cooling towers in view.
- No lettering anywhere, including on the ribs.
- Identical things are identical (pillar 4). The two ends of the face frame are one half
  painted and mirrored. The ring is painted once and stamped at both ends. The two
  cottages are one cottage, stamped. The railing's posts and bars are stamped.

## Deliberately wrong

- It is a full-frame plate, not a transparent sprite. Every pixel of the 368 × 280 is
  painted, sky to river, because it sits in its own keyline frame on the panel and a gap
  would show the card through it. Level art is exported with transparency
  (`content/README.md`); this one is not, on purpose. `npm run map:monuments` fails the run
  if the plate leaves a gap.
- The brochure cheer. The sky is the set's shared cloudless sky, cleaner and bluer than
  the Severn Gorge usually gets. The research palette is pushed a little sunnier. The iron
  is shown in morning sun with warm lit edges, lighter than its local colour; its main face
  stays inside the midday range measured on the real railings.
- The paint is the fresh, even dark red-brown of 2018. A real mid-century brochure would
  have shown a weathered, unpainted bridge: it was not painted at all in the 20th century
  until 1980, and in 1950 it had not been cleaned or painted for many years. Red-brown is
  chosen because it is the colour the bridge wore new and the colour it wears now, so it
  is right at either end of the story.
- The river is paler than life. The Severn's dark olive is mixed toward the sky so the foot
  of the plate is not as heavy as the bridge. It reads grey-green, not blue.
- The face is squared up more than any riverbank standpoint allows, the way a brochure
  artist redraws a bridge, so it reads as an elevation.
- It is not the bridge of 1781. The plate shows the bridge as it stands now, and two of the
  things the research requires are later than the chapter's 1700–1800 window. The land
  arch was stone until repairs begun in 1800, then timber, and cast iron only from December
  1820, on the account the research follows (Cossons & Trinder; the dates are listed under
  Contested). The tollhouse is early 19th century by its list entry. They stay because they are
  what tells a viewer which end is which.
- The cast inscription along the outer ribs, "This Bridge was cast at Coalbrook-Dale and
  erected in the year MDCCLXXIX", is left off. There is no text in the game, and at 92 × 70
  it would be a smudge that reads as dirt.
- The radial links, the cross-bracing between the five ribs, and the dovetail and
  mortise-and-tenon joinery are reduced to a few strokes: eight links a side. The real
  count was not verified and does not survive at this size.
- The railing is simplified to a regular comb of bars between plain posts. The real posts
  carry cast decoration. The bars are painted soft, over a darkened screen of the woods,
  so the comb reads at panel size without turning to noise.
- The land arch's form is the painter's: two concentric rings on straight legs, three short
  links and a cross-tie. The research gives its material, number, side and dates, not its
  shape. The stone plinth under it and the stone pier at the frame edge beyond it are the
  painter's too; the research does not describe what stands between the two land arches.
- The ogee loop between the uprights and the curve under each ring are drawn from the
  research's description of the photographs, not measured.
- The second south land arch, the south approach, St Luke's church, the Tontine Hotel and
  the town's riverfront are cropped out by the frame or the trees.
- The small stone arch carrying a path through the north abutment is hidden behind the
  bush, not drawn. Its exact form was not verified.
- The town is two identical small brick cottages. They stand for the houses on the north
  bank and are not particular buildings.
- The toll board at the tollhouse, a table of tolls and so all text, is not shown.
- The cracks, some left alone and some pinned with wrought-iron straps, are not shown. They
  are invisible at this size and belong to the level's flaw beat, not the map.
- The tollhouse's brick and roof colours are estimates. The only photograph shows its walls
  in shade, and the roof tiles were not measured in sun.
- The shadows on the water fall down and to the left, the set's convention. With the sun
  behind the viewer's right shoulder, the true shadows would fall away from the viewer,
  under and behind the bridge.
- The light is split at the crown, the south half of the ironwork cool and the north half
  warm, as two flat washes. The split falls where each rib's two halves are bolted, but the
  split itself is a painting decision, not a measured light.
- The reflection is simplified to a few flat tones and made a little shallower than the
  bridge, so the ring closes inside the frame.

## Contested

Keep these as disputes. None is settled by the plate.

- Who designed it. The rings and ogees match a gazebo Pritchard rebuilt,
  which suggests the final design was his (Wikipedia 2017, citing Smith 1979). Smiles
  (1863) says Pritchard's plan used iron only at the crown and was set aside for a design
  by Darby's pattern-maker Thomas Gregory. Pevsner says the executed design is "probably
  Abraham Darby's". Open.
- The reading of William Williams's 1780 painting. Before 2018 it was read as rust on
  unpainted iron. English Heritage's 2018 paint analysis found the earliest coat was a dark
  red-brown lead oil paint and says the painting shows that paint, so the rust reading is
  superseded for the bridge's colour. Still open is how literally Williams recorded it: the
  other early colour images disagree in shade (Robertson 1788 "dark red", Varley c. 1802
  "reddy-brown", Westwood 1835 "pinkish"). Simple English Wikipedia dates the painting
  1777, which is wrong: it is 1780.
- The number of parts. Older accounts give "more than 800 castings of 12 basic types";
  later ones give "almost 1,700 individual components".
- The weight. 378½ tons (Encyclopaedia Britannica, 7th edition), 379 tons, and "nearly 400
  tons" in popular accounts. The figures are close.
- The height. "Rising to 60 feet above the river" (Wikipedia 2007; one secondary summary
  says to the deck above high water, not the arch's rise) against Ressler's "40 feet high",
  though Ressler also calls the arch rings semicircular. The plate follows the
  near-semicircle that every source and photograph agrees on, not a figure.
- The opening date. 1 January 1781 (Cossons & Trinder, via Wikipedia; local sources).
  Smiles (1863) says "opened for traffic in 1779", running it together with the erection.
- The land-arch dates. Smiles puts "two small land arches" on the Broseley side in 1800.
  Wikipedia 2007 has the south stone abutment demolished by 1802 and replaced by temporary
  timber arches. Wikipedia 2017, citing Cossons & Trinder, has timber from repairs begun in
  1800 and cast iron from December 1820.
- Where tolls were taken before the present tollhouse. Tolls were charged from 1 January
  1781, but the standing tollhouse is dated early 19th century by its list entry. Whether
  an earlier toll building stood there was not established.

## Sources

- Wikipedia, "The Iron Bridge", revision of January 2017, read from a copy on GitHub
  because Wikipedia was blocked. Cites Cossons & Trinder. The span, the five ribs, the
  weight and parts, the rings and ogees, the land arches and their dates, the repairs, the
  1902 parapet fall, the 1934 closure, tolls to 1950, the brick tollhouse, the town at the
  north end, Williams's painting "from mid-river".
- N. Cossons and B. Trinder, *The Iron Bridge: Symbol of the Industrial Revolution*
  (2002; first edition 1979). The standard monograph behind the Wikipedia facts. Not read
  directly.
- Stephen Ressler, *Understanding the World's Greatest Structures* (The Great Courses),
  lecture 14, transcript. The structural anatomy: five rib sets, three concentric arcs, the
  two outer ones stopping at the deck, end posts with braces, radial links, the rings, the
  slight peak of the deck, the carpentry joints.
- *Encyclopaedia Britannica*, 7th edition (1842), "Bridge" (Thomas Young), and 9th edition,
  "Bridges". Public domain. The span, the weight, "the exterior concentric arches which
  assist in supporting the roadway", each rib in two pieces. The 7th edition's measured
  elevation plate was not viewed.
- Samuel Smiles, *Industrial Biography* (1863). Public domain. The abutments of 1777–78;
  the land arches of 1800; Pritchard's plan and Gregory's.
- Wikipedia, "The Iron Bridge", 2007 Schools selection. The half-ribs; Buildwas upstream
  and Coalport downstream, which fixes the downstream face as the east face.
- English Heritage, press releases of May 2018 on the original colour, and on the
  reopening. Reached through search-result quotations only. The very dark red-brown lead
  oil paint, Crick-Smith's analysis, the mahogany shade, 2,400 litres, the match with
  Williams's painting.
- Historic England, list entry 1279735, the former toll house. Quoted in search results
  only. South end, built against the west side, red brick, three storeys with the upper at
  bridge level, tile roof, early 19th century.
- Shropshire Notebook, a local-history site, text and three dated photographs (April 2009,
  January 2020, July 2020), viewed and colour-sampled. The photographs are the
  photographer's copyright: reference only, never in the repo.
- William Williams, *The Iron Bridge* (1780), oil, Ironbridge Gorge Museum Trust. Not
  viewed.
- William Ellis after Michael Angelo Rooker, "The Cast Iron Bridge near Coalbrookdale",
  engraving, J. Phillips, London, 1782. Public domain. Named in `arc.md`. Not viewed.
- Nikolaus Pevsner, *Pioneers of Modern Design*. The attribution to Darby.
- EBSCO Research Starters, ITV News Central (the cooling towers, 6 December 2019) and
  Structurae (the Jackfield bridges). Search-result text only, used for single facts.

The full research, with links, is `tools/monument-painters/specs/iron-bridge.json`.

## Confidence

Medium-high, per the research's verification pass of 2026-09-23.

High: the structure (a single near-semicircular span of 100 ft 6 in, five ribs, three
concentric arcs on the face, end uprights, a ring and ogees near each end, the peaked
deck, masonry abutments, iron land arches at the south end only); the orientation (east
face downstream, the tollhouse south and west of the approach, the town north); the
red-brown since 2018 and grey for decades before it; English Heritage's finding that red-brown was the
first colour.

Low: the tollhouse's brick and roof colours, estimated from photographs in shade.

The painter's own and not checked against a source: the land arch's shape, the stone
plinth under it and the pier beyond it, the number of radial links, the size of the rings,
the exact line of the ogees, and the cottages.

Not verified: every direct fetch of a non-GitHub page was blocked, so English Heritage and
Historic England were read through search-result quotations. Before this note is marked
high, read the English Heritage press release and the Historic England entries 1279735
and 1015325 directly, and view the Williams painting and the Ellis-after-Rooker engraving.
