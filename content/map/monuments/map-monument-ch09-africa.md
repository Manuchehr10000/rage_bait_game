# The conical tower, Great Zimbabwe

| | |
|---|---|
| Id | `map-monument-ch09-africa` |
| File | `map-monument-ch09-africa.png` |
| Size | 92 × 70 world px, painted 368 × 280 |
| Beat | `monuments` |
| Source | `tools/monument-painters/conical-tower.js`, painted by script; regenerate with `npm run map:monuments -- conical-tower` |

## What it is

The conical tower in the Great Enclosure at Great Zimbabwe, near Masvingo, Zimbabwe,
about 20.27 S, 30.93 E. The site was occupied from the 11th to the 15th century. The
Great Enclosure's outer wall is usually put in the 14th century. It was built by the
ancestors of Shona-speaking people.

The tower is solid dry-stone granite: about 9 to nearly 10 m tall and about 5.5 m across
the base, a truncated cone with a flat top. No door, window, stair, ledge or chamber. It
stands inside the enclosure, close to the south-east stretch of the outer wall, the
highest and best-built stretch. A second, smaller conical tower stands beside it. Its
summit was pushed over by a tree some time after 1891.

The viewer stands in the court round the tower, on its north-west side, at standing eye
height, and looks roughly south-east at the tower with the inside face of the outer wall
behind it. The painter puts the eye 2 m above the court and the tower 15 m away. This is
the view most photographs take. From outside, close to the wall, the tower is hidden or
shows at most as a sliver of its top, because the two are about the same height and stand
close together.

In the plate:

- **The great tower**, left of centre, from a little above the plate's foot to within a
  sixth of its top: about three quarters of the plate's height and a third of its width.
  It is painted 9.5 m tall, 5.5 m across the base and about 2.1 m across the top, so it is
  about 1.7 times as tall as it is wide. Its sides taper and swell very slightly. It is
  laid in bold level courses with dark dry joints. Each course is the front half of a
  level ring, so the courses bow upward above the eye, most strongly near the top, and a
  little downward at the foot. Short end joints stand about a course apart and crowd
  toward the edges. The right front is lit, the left flank in cool shade, with a soft
  terminator between. A thin sunlit arris runs under each joint on the lit side.
- **Its top** is flat and lit along its edge. It is broken in two places where blocks of
  the top course are gone: a low step across the left shoulder, and a notch right of
  centre.
- **The small tower**, to the right of the great one with a gap of court between them. It
  is the same masonry at 0.42 of the size, broken off in a steep ragged slope from about
  3 m on its left to about 1 m on its right. Six fallen blocks lie spilled at its right
  foot, one block painted once and stamped six times.
- **The outer wall's inside face**, right across the plate behind both towers, running
  out of both sides. It is painted 10.6 m tall. Its top is level in life. Because the
  viewer stands inside the ring, the wall is nearer at the frame edges, so in the picture
  its top sags a little toward the middle: just below the great tower's top behind the
  tower, about level with it at the edges. Its foot sits a narrow strip of court behind
  the towers' feet. It is a step darker and cooler than the towers, lit on the left and
  shading to cool on the right as the curve turns from the sun. It keeps only broad course
  bands, which close up toward the top where the battered face leans back and tips into
  the light. A bright capstone course, set back, with a dark step under it, runs along
  the top. Three soft ochre washes of lichen and iron staining sit low on the lit left
  stretch; two soft dark rain streaks hang from the top, one at each side.
- **The court**: level grey-tan granite sand, darker toward the viewer, with four patches
  of dry grass, two at the wall's foot and two broad ones in the foreground.
- **Shadows**: each tower throws a cool violet shadow back and to the left across the
  court to the wall's foot, then up the wall, narrowing to a rounded end. The great
  tower's climbs about half way up the wall; the small tower's climbs only a little. A contact
  shade sits under each tower's round foot and each fallen block.
- **Above the wall**: the set's brochure sky, clean blue, no cloud, a strip across the
  top. Two rounded miombo crowns stand beyond the wall, their trunks hidden by it: one at
  the upper left in the set's green, one at the upper right warmed toward the wine-red
  flush of msasa's new leaves, which reads as olive-brown.
- **Ink**: a dark line round both towers and the fallen blocks, a finer one along the
  wall's top against the sky. The wall face and the court have none.

## Where it stands in the game

The chapter 9 panel on the tour map: the plate that stands for Africa & the Indian Ocean,
the way a brochure prints one monument per page. The panel is the right-hand strip of the
start screen, and the game prints this plate in it, 92 × 70, whenever chapter 9 is the
chapter in view. The game lays paper under it, draws a thin keyline round it, and sets the
site's name, "Great Zimbabwe", beneath it, outside the plate. Chapter 9 has no built level
yet, so it has no chapter map, and the plate appears on the world map's panel only. Until
the painting is loaded, the game draws the flat silhouette `conical-tower` in
`src/map/monuments.ts` in its place.

Great Zimbabwe (`great_zimbabwe`; atlas 20.27 S, 30.93 E, which matches the site) is one
of the five candidate sites `content/research/arc.md` lists for chapter 9. The chapter is
a candidate, not locked, and the site has no level number. This plate does not give it
one.

Respect gate. `arc.md` flags a revered locus on the site, and the designer ruled on
2026-09-23: walls, passage and tower only, the revered locus out of frame on the tour map
and in any level. This plate is the first use of that ruling. It shows the outer wall and
the two towers, and no passage. `arc.md` does not name the locus. The research for this
plate takes it to be the Hill Complex: the granite hill north of the Great Enclosure,
formerly called the "Acropolis", with its walls, boulders and caves and its Eastern
Enclosure, where the soapstone birds stood. From this standpoint it lies behind the
viewer's left shoulder, and the wall would hide it anyway. The plate shows no hill, no
boulders on the skyline, no bird, no carved pillar, no person, no offering, pot or
ceremony, no grave. Nothing in it makes the enclosure a shrine, and it is never called by
Bent's name, "the Temple".

Several pieces of text around the plate are out of step with the research, and are left
for whoever owns them:

- The chapter 9 row of the vignettes table in `content/map/README.md` says "the conical
  tower seen over the enclosure wall". From outside, that is a sliver at best. The tower
  is seen from inside, in front of the wall.
- The silhouette's doc comment in `src/map/monuments.ts` says the same. The silhouette
  also draws the wall in front of the towers at about a third of the great tower's
  height, gives the great tower a domed top, and draws the small tower at about half the
  great tower's height. The wall is about the tower's height, the top is flat, and the
  small tower looks much smaller than that on the standard photographs.
- The research proposes three changes to `arc.md`: that the ruling name the revered locus
  as the Hill Complex, so no later designer has to guess; that the exclusion of
  foreign-builder attributions in section 7 cover every one of them, not only those before
  Bent; and that the imagery note for chapter 9 list the public-domain plates that exist
  for Great Zimbabwe (Mauch, Hall, Randall-MacIver) as well as Bent's. They are proposals.
  `arc.md` stands until it is changed.

## Must be right

- One large tower: a truncated cone with a flat top. Not pointed, not domed, not a spire.
- The large tower is about 1.6 to 1.8 times as tall as its base is wide.
- It tapers from foot to top. Its sides are straight or swell very slightly. Never
  concave, never a bulging beehive.
- No door, window, stair, ledge or opening anywhere on it. It is solid.
- A second, smaller tower beside it, lower, damaged at the top. Not a near-twin.
- Both towers stand inside the enclosure, in front of the inside face of the outer wall.
- The wall's top lands close to the great tower's top, just below or just above it, and
  well above the tower's mid-height. Never a low parapet with the tower rising far over it.
- The outer wall curves across the frame and its top is level. It has no corners.
- The wall's face leans back as it rises. It is about 5 m thick at the foot and tapers.
  Not vertical.
- All stonework is thin level courses of small rectangular blocks, laid dry. No mortar
  lines, no plaster, no large squared blocks.
- No chevron or zigzag anywhere: not on the tower, not on the inside face of the wall.
  The chevron band runs only near the top of the outer face of the south-eastern arc, and
  cannot be seen from inside.
- No dark bands of stone. The dark amphibolite courses belong only to the doorway in the
  old wall, which is not in frame.
- Warm pale grey granite with darker streaks. Not a cold blue-grey, not Egypt's yellow
  sandstone.
- No hill, rocky outcrop or boulders on the skyline.
- No soapstone bird and no carved stone pillar. None came from the Great Enclosure in any
  case.
- No people, no offerings, no ritual objects, no graves.
- Nothing Near Eastern, Phoenician or Sabaean in the styling. No temple framing, no altar,
  no palms, no jungle, no "King Solomon's Mines". A mid-century Rhodesian brochure would
  have printed that. This one does not.
- The trees beyond the wall are broad-leaved savanna trees. No palms.
- The fallen blocks are one block, stamped (pillar 4).
- No caption, date, letter or number in the plate.

## Deliberately wrong

- **A full-frame plate, not a transparent sprite.** It sits in its own keyline frame on
  the panel, so every pixel of the 368 × 280 is painted, sky to court, like a printed
  photograph. Level art is exported with transparency (`content/README.md`); this is not,
  on purpose. `npm run map:monuments` fails the run if any gap would show the card through
  it.
- **Brochure cheer.** The set's clean blue sky without a cloud, bluer than a dry-season
  sky over the plateau. The tower's lit stone is pushed a little sunnier than the
  research's granite, and the wall is warmed with a touch of ochre. The dry grass is
  greened toward the set's foliage. The hex values are a design decision, not a
  measurement.
- **The site is empty.** No visitors, guides, walkways, signs, ropes or site museum. The
  brochure clears it of everything modern.
- **The court is tidied.** Clean sand and short grass. The old inner wall, the stepped
  platform, the remains of clay house floors and the plants growing on the walls are left
  out, so that the tower and the wall read at 92 × 70. If the true standpoint puts a
  stretch of the old wall between the viewer and the tower's foot, that stretch is left
  out too.
- **Courses are suggested, not counted.** The real courses are too fine to show one by
  one at this size. The tower's are about 0.55 m each, far fewer and bolder than the real
  ones. The wall keeps only broad bands, a step coarser again, so the detail stays on the
  tower.
- **The stone is cleaned up.** Lichen, iron staining and rain streaks are reduced to three
  ochre washes and two streaks on the wall, as a brochure's printing would.
- **The light follows the set.** It comes from the upper right, the set's rule, not the
  sun's computed position for this standpoint and date. As a sanity check only: facing
  roughly south-east in the late dry season, September to October, an afternoon sun in
  the west sits behind and to the right of the viewer, which loosely fits. In the mid dry
  season, June to July, the sun stands in the north, behind the viewer's left shoulder,
  and it would not.
- **The shadows are the painter's.** Their direction follows the set. The rounded end of
  the great tower's shadow on the wall, and how far it climbs, are placed for the picture,
  not projected from a flat-topped tower onto a battered face.
- **The wall is simplified.** One clean sweep of curve. Later repairs and reconstructed
  stretches are not told apart from original fabric. The top is plain; the bright
  set-back capstone course is the painter's.
- **The tower's top is plain.** It is painted as it stands now, flat and a little ragged.
  The dentelle course that once ran round it is gone and is not restored. The two gaps in
  the top course, and where they fall, are the painter's. At this size they can read as
  crenellations. They are missing blocks; nothing in the research gives the tower a
  battlemented top.
- **The small tower is provisional.** Its size (0.42 of the great tower, so about 4 m if
  whole and 2.3 m across the base), its side (the right), its gap from the great tower and
  the line of its break are the painter's, not checked against a measured plan. The six
  spilled blocks at its foot are the painter's too: nothing checked says any lie there
  today.
- **The standpoint is set, not surveyed.** The court's depth was not verified. The 15 m
  distance, the 2 m eye and the wall's 10.6 m are chosen within the ranges the research
  gives, so the wall's top lands just below the tower's.
- **The trees are generic.** Two rounded crowns, one warmed toward the msasa's late
  dry-season flush. No particular tree is claimed.
- **Indexed colour.** The plate is saved in 255 colours, chosen by the painter so the
  broad washes keep their gradations. The sky may still lie in bands.

## Contested

Keep these as disputes. None is settled by the plate.

- **The tower's size.** About 9 m (30 ft) in most summaries, "nearly 10 metres" in the
  Zimbabwe Field Guide; about 5.5 m (18 ft) across the base. Some of the difference may be
  the lost dentelle and top courses. The plate keeps the proportion and draws no ruler.
- **The outer wall's height, and which is higher near the tower.** Most summaries give a
  maximum of about 11 m. The Zimbabwe Field Guide gives 9.6 m at most and about 7 m on
  average, and says the tower "is a little higher than the Outer Wall at this point". Near
  the tower the two are about the same height; which is higher is unsettled. The plate
  puts the wall's top just below the tower's.
- **What the tower was for.** A symbolic granary standing for a ruler's tribute and
  generosity (the reading Garlake reports, following Shona tradition); a male symbol tied
  to initiation (Huffman 1996); a lookout. None is proven. The plate implies no use.
- **What the Great Enclosure was for.** A royal residence or the royal wives' quarters
  (Garlake 1973), or an initiation school (Huffman 1996). The colonial-era "Temple"
  reading is rejected, not contested.
- **The chevron.** Its position, near the top of the outer face of the south-eastern arc,
  about 9 m up, is not in dispute. What it means is: Huffman ties it to male authority and
  rain, and others differ. So is its length: "nearly 80 metres" in the Zimbabwe Field
  Guide; a figure of about 52 m also circulates and was not confirmed. Out of frame either
  way.
- **The chronology.** Huffman and Vogel (1991) give a sequence of Hill, then Great
  Enclosure, then Valley. Chirikure and others (2013, a Bayesian model) argue that
  construction overlapped.
- **The name.** *Dzimba dza mabwe*, houses of stone, or *dzimba woye*, venerated houses,
  used of chiefs' houses or graves. Both derivations are current.
- **The tower's top.** The Zimbabwe Field Guide says it "once had a dentelle pattern which
  is now gone". A low-reliability study page describes a dentelle frieze round the top as
  if it were there. The plate paints the top plain.
- **The Parallel Passage's mouth.** One summary starts it at the north-east entrance; an
  earlier draft of the research said the north entrance. Not in frame.
- **Not a dispute, an error.** Mauch's attribution of the ruins to the Queen of Sheba
  (1871), and Bent's and Hall's to Phoenicians, Arabs or Sabaeans (1892–1905), are the
  colonial misattribution that `arc.md` names. Randall-MacIver (1906) and Caton-Thompson
  (1931) are the correction. The plate carries none of it.

## Sources

- UNESCO World Heritage List no. 364, Great Zimbabwe National Monument (inscribed 1986).
  Site authority for identity, dates and significance. Not reached; cited, not re-read.
- Zimbabwe Field Guide, "The Great Enclosure at Great Zimbabwe in photographs – 2025" and
  related pages. Search summaries only. The tower "nearly 10 metres", "a little higher than
  the Outer Wall at this point", "plain" with "sloping sides swelling slightly"; the lost
  dentelle; the small tower's summit pushed over by a tree, almost intact in 1891; Bent's
  digging round the tower in 1891; the outer wall's 250 m, 9.6 m and 5 m; the chevron's
  length and height; the amphibolite doorway and the 7.6 m stepped platform.
- Wikipedia, "Great Zimbabwe"; Smarthistory, "Great Zimbabwe". Search summaries only.
  The 252 m circuit and 11 m maximum; the level courses of the best work; the tower at
  about 9 m by 5.5 m; the Parallel Passage.
- Peter S. Garlake, *Great Zimbabwe* (1973) and *Great Zimbabwe Described and Explained*
  (1982). The standard description and the main figures. In copyright; not opened.
- Gertrude Caton-Thompson, *The Zimbabwe Culture: Ruins and Reactions* (1931). Measured
  plans and sections; settled that the builders were African. Not public domain (US from
  1 January 2027). Not opened. The plan to check the small tower and the court against.
- David Randall-MacIver, *Mediaeval Rhodesia* (1906). Public domain. The preferred
  public-domain picture reference, and its text is right. Not opened.
- J. Theodore Bent, *The Ruined Cities of Mashonaland* (1892), plans by R. M. W. Swan;
  R. N. Hall, *Great Zimbabwe* (1905), and Hall and Neal, *The Ancient Ruins of Rhodesia*
  (1902). Public domain. The drawings and photographs show the ruin in 1891–1905. Use the
  pictures only, never the text or the captions.
- Carl Mauch, journals and plans of 1871, *Petermanns Geographische Mitteilungen*,
  Ergänzungsheft 37 (1874). Public domain. The earliest European plan. Pictures only.
- Anthony Whitty, "The origins of the stone architecture of Zimbabwe" (1961). The P and Q
  wall styles.
- Thomas N. Huffman, *Snakes and Crocodiles* (1996). Cited for the disputes, not as fact.
- Webber Ndoro, *Your Monument Our Shrine: The Preservation of Great Zimbabwe* (2001;
  ICCROM Conservation Studies 4, 2005). The site's sacred standing and the grounds for the
  respect gate. The 2005 edition was confirmed as a publication; its text was not re-read.
- Innocent Pikirayi, *The Zimbabwe Culture* (2001); Chirikure and Pikirayi, "Inside and
  outside the dry stone walls", *Antiquity* 82 (2008). Current synthesis.
- Chirikure, Pollard, Manyanga and Bandama, *Antiquity* 87 (2013); Huffman and Vogel,
  *South African Archaeological Bulletin* 46 (1991). The two sides of the chronology.
- Modern photographs: reference on screen only, never in the repo.

The full research, with links, is `tools/monument-painters/specs/conical-tower.json`.

## Confidence

Medium. Medium-high on shape and material; medium-low on exact figures and the
standpoint. Every page fetch was refused by the proxy, so every check rests on search
summaries, not read pages.

Confirmed that way: dry-stone granite with no mortar; rectangular blocks in level
courses; the outer wall about 250 m round and about 5 m thick at the foot, tapering; the
chevron on the outer face of the south-eastern arc only; the tower about 9 to nearly 10 m
by 5.5 m, solid, with no door, chamber or stair; the small tower exists and its summit
fell after 1891; the Parallel Passage leads to the tower; Ndoro's publication and the
site's sacred standing.

Not verified, and not disputed: the tower's top width; the small tower's size, side and
gap; the depth of the tower court and so the standpoint; rounded wall ends; the flat,
level wall top and whether monoliths or turrets once stood on it; the granite's colour
and every hex value; the vegetation.

Before the plate is called finished, check it against Caton-Thompson 1931, Garlake 1973
or the National Museums and Monuments of Zimbabwe plan for the small tower and the court,
and against Randall-MacIver's photographs and a modern colour photograph for the
tower's outline, its top and the stone.
