# The Ulugh Beg Madrasa, for the tour map

| | |
|---|---|
| Id | `map-monument-ch10-islamic` |
| File | `map-monument-ch10-islamic.png` |
| Size | 92 × 70 world px, painted 368 × 280 |
| Beat | `monuments` |
| Source | `tools/monument-painters/iwan.js`, painted by script; regenerate with `npm run map:monuments -- iwan` |

## What it is

The Ulugh Beg Madrasa on the Registan in Samarkand, Uzbekistan, built 1417–20. It stands
on the west side of the square, so its main front faces roughly east. The plan is about
56 × 81 m, and the front is the 56 m side. It is the only one of the Registan's three
madrasas inside chapter 10's window. Sher-Dor (1619–1635/36) and Tilya-Kori (begun
1646–47) both come later, and neither is in the picture.

The view is a straight elevation of the east front from the middle of the square, on the
portal's axis, facing west. Sher-Dor is behind the viewer. Left to right is south to
north. The frame stops just outside the two front minarets, so Tilya-Kori's corner tower,
which stands just right of the north-east minaret, stays out. Verticals stay vertical.

The front is symmetrical. Left to right:

- The south-east minaret. A tall cylinder with a slight taper, in buff brick wound with a
  bold diamond lattice of cobalt and turquoise glaze. A cobalt band with a turquoise core
  runs under the crown and another near the foot, over a pale stone plinth. The crown is
  a flared stalactite ring in two tiers, each with a dark hollow underside hung with small
  turquoise pointed cells, a turquoise band on top. No lantern, no balcony, no spire.
- The south wing. A narrow flat wall of buff brick, half the portal's height, with a lit
  parapet edge. Two tiers of shallow pointed-head blind panels, one above the other, each
  a cobalt outline round a single turquoise lozenge. No arcades, no loggias, no deep
  niches, no door.
- The portal, the pishtaq, in the middle: a flat-topped rectangle, two-thirds of the
  front's width, the tallest mass of the building, with nothing on its top edge. A band
  of turquoise glaze with a darker core runs across its top and down both sides. On each
  pier, two tall pointed-head panels stacked, each with a cobalt lozenge under the head
  and a turquoise eight-point star below.
- Inside that, a rectangular frame round the arch. Above the arch the spandrels are a dark
  cobalt field of large white eight-point stars on turquoise rings, joined by turquoise
  strapwork. It is the loudest thing on the front.
- One pointed arch, about half the portal's width, its apex at four-fifths of the portal's
  height. A thin light-blue rope moulding runs round it and down both jambs, the twist
  painted as long calm steps, catching a warm light at its upper right.
- The iwan behind the arch: a recess, not a hole. The vault is in four shaded facets with
  a turquoise rib along the crown. The left inner face is lit, the right in shade. The
  back wall is lit, under its own pointed head, with the arch rim's shadow crossing its
  upper right, and one dark pointed door in a thin tile frame at its foot.
- A grey-white marble dado along the foot, over a low plinth.
- The north wing and the north-east minaret, the same as the south ones, stamped. The
  north-east minaret throws a narrow shadow across the north wing.

Below, the empty Registan paving in fired brick, pinkish buff, with two faint courses and
a darker band at the near edge. The building's shadow lies along its foot, broken at the
arch, and each minaret throws a long bar of shadow down and to the left. Above, the set's
cloudless sky in flat steps, about an eighth of the plate over the portal's top. An ink
line runs round the building and round each minaret.

The light is a June morning, about 7 a.m. solar time, from the east-north-east, behind
the viewer's right shoulder, so the front is lit almost square with a rake from the right.
That is the one real light that gives both the set's upper-right sun and a sunlit front:
from late morning the east front is in its own shadow. The proportions follow the
research at about 6.1 painted px to the metre.

## Where it stands in the game

The chapter 10 panel on the tour map: the plate that stands for the chapter. The panel is
the right-hand strip of the start screen, and the game prints this plate in it, 92 × 70,
whenever chapter 10 is the chapter in view. The game lays paper under it, draws a thin
keyline round it, and sets the site's name, Registan, beneath. Chapter 10 has no built
level yet, so it has no chapter map, and the plate appears on the world map only. Until
the painting is listed and loaded, the game draws the flat silhouette `iwan` in
`src/map/monuments.ts` in its place.

The Registan is one of chapter 10's five candidate sites in `content/research/arc.md`,
listed with the Ulugh Beg Observatory as `samarkand_registan`, as the map README
requires. The chapter is a candidate, not locked, and the site has no level number yet.
This plate does not give it one.

`arc.md` lists a "leaning minaret" among the site's features. The research for this plate
found that both front minarets leaned and both were straightened, the north-eastern in
1932 and the south-eastern in 1965. The lean is the building before 1932. The plate shows
the building as it stands now, so both minarets are upright. The research asks that
`arc.md` say so; that has not been done. A level beat built on the lean would show the
building before 1932, and should say so in its own note.

The code silhouette has errors the research names, and none has been corrected yet. It
draws a dome on a drum centred over the portal: no dome rises above the Ulugh Beg portal,
and even at Sher-Dor the two domes flank the portal rather than sit on it. It leans the
minarets outward, under the comment "leaning very slightly outward as they do". It leaves
sky between the minarets and the portal, where flat wings belong. Its arch is 62% of the
portal's width, against about half. The chapter 10 row in `content/map/README.md` asks
for "a ribbed melon dome on a drum" and "a minaret at each corner". The ribbed domes on
drums are Sher-Dor's, and only the two front minarets stand at full height. The research
asks for the row to name the building, the Ulugh Beg Madrasa, since "the Registan" alone
invites the three-madrasa postcard view, and to add the two-thirds portal and the flat
wings. That has not been done either.

Respect gate. `arc.md` says the madrasas are now museums and gate 6 is largely clear for
the site. The courtyard photographs show visitors and souvenir stalls. Two cautions from
the research. Tilya-Kori's west wing is a mosque (the Soviet album calls it the city's
congregational mosque); the view crops Tilya-Kori, so it is out of frame. And the portal
carries a foundation inscription, so no lettering is invented anywhere on the plate.

## Must be right

- Exactly one building is in frame: the Ulugh Beg Madrasa. No second portal, no ribbed
  domes, no tiger mosaic, no Tilya-Kori corner tower.
- No dome of any kind: no ribbed melon dome, no dome on a drum, no turquoise dome, and no
  dome centred over the portal.
- The front is symmetrical: one central portal, one minaret at each end, one flat wing on
  each side between them.
- The portal is a flat-topped rectangle about two-thirds as wide as the whole front, with
  nothing standing on its top edge.
- The portal is the tallest mass of the building. Each wing reaches about half its height.
- One pointed arch, the Timurid two-centred arch: not horseshoe, not onion, not round.
  It is clearly narrower than the portal, about half its width, with broad piers either
  side, and its apex is well below the portal's top edge.
- A thin light-blue rope moulding edges the arch.
- The field above the arch is dark blue with large light stars.
- The iwan is a recess with a lit back wall and a door in it, not a hole through the
  building.
- The wings are flat walls with shallow panels: no arcades, loggias or deep arched niches.
  The two-storey arcades on the square belong to Tilya-Kori.
- The wings join the minarets to the portal. No sky between them.
- Exactly two minarets, both vertical, of the same height, with the same slight taper.
  Not leaning, and not splayed outward as a pair.
- The minaret crowns sit level with the portal's top edge: not towering over it, and not
  clearly short of it.
- Each minaret ends in a flared stalactite crown with no lantern, cupola, balcony or spire.
- The minaret shafts carry a diamond lattice in blue on buff brick.
- Buff brick is the ground colour of every wall. The blue is pattern on it, not solid tile.
- A pale grey-white marble dado runs along the foot of the portal.
- The front is in sunlight from the upper right. Morning, not afternoon and not backlit.
- The foreground is empty fired-brick paving: no people, stalls, lamps or stairs. The
  grand stair on the square is Sher-Dor's.
- The two minarets are one painting, stamped. So are the four pier panels, the four wing
  panels and the star tile of the spandrels (pillar 4).
- No legible writing anywhere, and no pseudo-Arabic.

## Deliberately wrong

- It is a full-frame plate, not a transparent sprite. Every pixel of the 368 × 280 is
  painted, sky to paving, because it sits in its own keyline frame on the panel and a gap
  would show the card through it. Level art is exported with transparency
  (`content/README.md`); this one is not, on purpose. `npm run map:monuments` fails the
  run if the plate leaves a gap.
- The brochure cheer. The sky is cloudless and cleaner than a real day's, and the glaze is
  more saturated than life. The research palette is pushed a little sunnier. The hex
  values are estimates read from photographs and then a design decision, not a
  measurement.
- The inscription bands are painted as rhythmic bands of glaze, never as letters: the
  frame band round the portal, and the bands under the crown and near the foot of each
  minaret. There are two reasons. There is no text inside a level. And invented Arabic on
  a religious building is either gibberish or says something nobody chose.
- The mosaic is simplified to a scale that reads at 92 × 70. The stars in the spandrels
  and on the piers are eight-pointed because an eight-point star reads at this size. The
  real point count is not claimed (see Contested). The strapwork, the lattice and the
  panel ornament are the painter's, not measured.
- The research names six glaze colours on the portal: light blue, dark blue, green,
  white, black and yellow. The plate uses light blue, dark blue and white. Green and
  yellow are left out, and black appears only mixed into the dark of the iwan door.
- The number of panels on each pier and each wing, and what is in them, are the plate's.
  The research gives the wings two tiers of panels; that much is right.
- The low unglazed dome cap behind the south wing is left off. From straight ahead at
  square level it would be at most a sliver above the parapet, and any bump there would
  read as the dome this plate exists to remove.
- The iwan is simplified to a shaded vault in four facets over a lit back wall with one
  pointed door. The two side entrances, the openwork grille (panjara) over the central
  door, the net-vault pattern and the opening above the door are dropped. The turquoise
  rib along the vault's crown and the marble dado carried into the iwan's side faces are
  the painter's; the research does not describe either.
- The marble dado runs along the foot of the wings as well as the portal. The research
  places it at the portal's foot; the painter reads the Soviet album's "base of the main
  facade" as the whole front. Check it against a photograph.
- The small doors at the foot of each wing are left out. At this size they would be about
  two pixels.
- Modern intrusions are left out: the floodlights along the portal's top edge, lamp
  posts, railings, the small steps and handrails at the wing doors, visitors and stalls.
- The lawns and conifers along the south flank are cropped out.
- The ground shadows fall down and to the left, the set's convention. With the sun behind
  the viewer's right shoulder, the true shadows would fall away from the viewer, against
  the building, not across the paving toward the front of the picture. The shadow the
  north-east minaret throws on the north wing is kept narrow, true to a sun only some 10
  degrees off square to the front.
- The portal stands slightly proud of the wings. In a straight elevation its side return
  cannot show, so only its thin shadow on the south wing and an ink edge say so.

## Contested

Keep these as disputes. None is settled by the plate.

- The minarets' lean. That both front minarets leaned and were straightened is agreed:
  the north-eastern in 1932 (V. G. Shukhov with M. F. Mauer; about 180 cm off vertical
  before), the south-eastern in 1965 (E. M. Gendel and E. O. Nelle). Still open: the
  Soviet album dates the second minaret's work to 1966–67 and calls it base reinforcement,
  not straightening. One travel-guide snippet says the minarets are "still flouting the
  perpendicular", which may mean a small lean remains. The plate paints both upright.
- When the minarets fell or lost their tops. The Soviet album says one fell and the others
  lost their tops in the 18th century. A travel-guide snippet says a minaret collapsed in
  1870, and the 1907 earthquake is said to have tilted them. Either way, only the two
  front minarets stand at full height today. The crowns are restorations.
- The minarets against the portal. The figures, about 33 m and about 34.7 m, both from
  secondary sources, put the crowns marginally below the portal's top. Photographs read
  level to slightly above, which may be perspective. The 33 m figure is quoted for all four
  minarets and may describe the original design, not today's restored crowns. The plate
  paints them level.
- The lost domes. The madrasa had four domed lecture halls at the corners. Their form is
  not known. The Soviet album says ribbed turquoise domes like Sher-Dor's "evidently"
  stood here too, which is an inference, not evidence. Not reconstructed here.
- The stars and Ulugh Beg's astronomy. That the star mosaic refers to his astronomy is a
  popular reading from guide and architecture-blog sources. No scholarly source for it was
  found, and star patterns are standard Timurid ornament. It is not a fact of this plate.
  The count of five- and ten-pointed stars comes from the same kind of source and is
  unverified.
- The arch span. About 18 m comes from the Soviet album alone. The apex at four-fifths of
  the portal's height is read from photographs only.
- The dates of the later madrasas vary by source: Sher-Dor 1619–1636 or 1619 to 1635/36;
  Tilya-Kori 1646–1660, or begun 1646–47 with parts never finished. Both are after 1600 on
  every version, which is why both are out of the picture.
- The observatory's dates. `arc.md` gives c. 1420–28. English Wikipedia's Samarkand text
  gives 1424–29. Vámbéry (1864) says begun 1440, which is wrong. The observatory is not in
  this plate.
- The front's exact bearing was not measured. The lighting hour assumes it faces due east;
  if the square's axis is turned, the hour moves.

## Sources

- *Bukhara. Samarkand*, a Soviet architectural album (Russian text with an English
  summary; after 1967; author not given in the transcription). The main source for the
  front: 1420; 56 × 81 m; the portal at two-thirds of the front; flat wings "without deep
  arches"; banna'i in light and dark blue on yellowish brick; six glaze colours on the
  portal; the pointed arch, about 18 m, framed by a rope moulding; the marble panel at
  the base; four corner minarets with stalactite crowns and no lanterns; the 18th-century
  losses; the 1932 and 1966–67 work.
- MIT OpenCourseWare 4.614, *Religious Architecture and Islamic Cultures* (2002), lecture
  notes on the Timurids: a four-iwan madrasa, four domed corner chambers, banna'i and
  mosaic faience.
- Russian Wikipedia, "Шухов, Владимир Григорьевич" and "Самарканд" (snapshots in a public
  text dump): the 1932 straightening; Ulugh Beg the western building, Sher-Dor the
  eastern.
- English Wikipedia, "Ulugh Beg Madrasa", and Russian Wikipedia, "Медресе Улугбека
  (Самарканд)". Search-result snippets only; fetching was blocked. The 34.7 m pishtaq,
  twice the height of the rest and two-thirds of the side; minarets about 33 m; the
  180 cm lean; three entrances at the back of the iwan, the central one closed by a
  panjara.
- Archnet, "Madrasah-i Ulugh Beg (Samarkand)". Search-result snippets only. The domed
  darskhanas; the second storey pulled down and rebuilt in the 1990s; the 1817–18
  earthquake; flat timber roofs under Emir Haydar; the 1932 and 1965 straightenings.
- IIAS, *The Newsletter* no. 95 (2023), "The Restored Splendours of Timurid Samarqand".
  Search-result snippets only. Mauer's project from 1920; Shukhov in 1932; Nelle and
  Gendel for the south-eastern minaret, 1965.
- Russian-language travel and news pages (kupibilet.ru, zarnews.uz, anhor.uz), and
  illustrarch and travel guides in English. Search-result snippets only; secondary and
  uncited, used only where they agree with the stronger sources.
- Arminius Vámbéry, *Travels in Central Asia* (1864). Public domain. By 1701 the madrasa
  was ruined enough for owls to live in the cells. His dates for the madrasa and the
  observatory are wrong.
- The Turkestan Album (1871–72), named in `arc.md` as the public-domain imagery for the
  site. Not reached.
- Modern photographs of the Registan: reference only, never in the repo.

The full research, with links, is `tools/monument-painters/specs/iwan.json`.

## Confidence

Medium-high for the outline, medium for the colour and the light.

High: the dates and the chapter window; the east-facing front on the west side of the
square; no high dome today; only the two front minarets at full height; both
straightened, the north-eastern in 1932 and the south-eastern in 1965; the portal at
two-thirds of the front and about twice the wings' height; the 56 × 81 m plan.

Medium: the crowns level with the portal; the arch span (one source) and its apex (from
photographs); the three entrances at the back of the iwan (one snippet); the palette,
estimated from photographs; the lighting hour, which assumes a due-east front.

Not verified: every page fetch was blocked, and the newer evidence is search-result
snippets, not pages read. The Turkestan Album was not seen. Not checked at all: the panel
counts and their ornament, the star-point count, the two-tier crown, the rib in the
vault, and the dado along the wings. Before anyone calls the plate finished, check the
crowns, the panels and the dado against a dated daylight photograph of the east front.
