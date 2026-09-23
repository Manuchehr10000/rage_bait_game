# Himeji Castle, for the tour map

| | |
|---|---|
| Id | `map-monument-ch08-east-asia` |
| File | `map-monument-ch08-east-asia.png` |
| Size | 92 × 70 world px, painted 368 × 280 |
| Beat | `monuments` |
| Source | `tools/monument-painters/tiered-roofs.js`, painted by script; regenerate with `npm run map:monuments -- tiered-roofs` |

## What it is

Himeji Castle, Himeji-jō, the "White Egret Castle", on Himeyama hill in Himeji, Hyōgo,
Japan. The keep complex as it stands was built by Ikeda Terumasa in 1601–09. It is a
connected complex: one main keep at the south-east corner, three small keeps (the East,
the West and the Inui, or north-west), and four two-storey corridor-turrets joining them
in a square round a courtyard. The keeps are a timber frame coated in white lime plaster
from the stone to the eaves, under smoked grey clay tile.

The viewer stands near the south end of the Sannomaru, the big lawn just inside Otemon,
and looks north up at the hilltop. This is the postcard view, the white keep standing
over its walls. It is the one view that shows what tells Himeji from a generic
single-keep castle: the small keep beside the main keep. The view is turned a few degrees
so that the west faces show as narrow cool returns. Left to right is west to east.

Bottom up:

- A sliver of pale gravel at the foot of the wall, then the lawn, darker toward the
  viewer, and three calm masses of dark black pine across the bottom of the plate, each
  built of flat pads lit along their upper right edges.
- One tall stone wall under the whole complex, wider than the buildings on it. Its face is
  concave: nearly upright at the top, flaring outward at the foot, at both ends. It is
  laid in small irregular stones in courses that wander and break, with small wedge
  stones in the joints, low in contrast so it reads as one plane. Long-and-short corner
  stones run up each curved edge. The steep upper part is in shade and the flared foot is
  lit, so the curve reads as a change of value as well as an outline. At the left a
  narrow west return turns away into shade; at the right the east end stands in profile,
  lit.
- Along the top of the wall, under the small keeps, a low white plastered wall with a grey
  tile coping and a row of small dark loopholes at a fixed interval. It runs into the foot
  of the main keep.
- Right of centre, the main keep, the tallest and largest thing in the picture. Five roof
  tiers. The two lowest storeys are the broad lower block; the three above are set back on
  it, each narrower than the one below. On the south face, tier by tier:
  - tier 1: the widest storey, four windows, under a plain skirt roof with no gable;
  - tier 2: a large lattice window at the centre under a curved kara-hafu, a small window
    either side, under the great hip-and-gable roof of the lower block, whose gable ends
    rise in profile at each end of the roof;
  - tier 3: two triangular gables side by side, a window either side;
  - tier 4: one triangular gable at the centre, a window either side;
  - the top tier: a curved kara-hafu over the centre window, a window either side, and the
    top ridge running left to right with a grey fish ornament, a shachihoko, at each end.
- Left of the main keep and much lower, the West small keep: three roof tiers, the same
  white walls and grey roofs, a small pair of fish on its top ridge. Between it and the
  main keep, a low two-storey corridor-turret, two windows in its upper storey. The main
  keep's shadow falls across the corridor-turret and the right-hand end of the plastered
  wall.
- Further left and behind the West keep, the Inui small keep: three roof tiers, its upper
  storeys rising above the West keep's roofs, under a cool veil of distance, with the West
  keep's shadow on it.

Every storey is white plaster with one warm lit face and a narrow cool west return. Under
every roof runs a band of cool shadow on white: the soffit and the eave's own shadow.
That rhythm of white storey and shadow band is what makes the keep read as tiered. The
roofs are silver-grey with fine, muted white joint lines along the ridges and hips, and a
dark band of tile ends along each eave that thins to a slightly lifted tip at each corner.
The windows are small dark rectangles with vertical lattice bars, in rows.

Behind the wall's two ends, below its top, Himeyama's wooded slopes fall away in dark
green, so the castle plainly crowns the hill. Above, the set's clean blue sky with one
small white cloud high on the left, over the small keeps. A soft ink line runs round each
building and the wall. Late-morning sun from the upper right, which facing north is the
south-east, behind the viewer's right shoulder.

## Where it stands in the game

The chapter 8 panel on the tour map: the plate that stands for the chapter. The panel is
the right-hand strip of the start screen, and the game prints this plate in it, 92 × 70,
whenever chapter 8 is the chapter in view. The game lays paper under it, draws a thin
keyline round it, and sets the site's name, Himeji, beneath. Chapter 8 has no built level
yet, so it has no chapter map, and the plate appears on the world map only. Until the
painting is loaded, the game draws the flat silhouette `tiered-roofs` in
`src/map/monuments.ts` in its place.

The id comes from the chapter's slug, as `src/map/atlas.ts` builds it. The research and
the painter's header call the plate `map-monument-ch08-himeji`; it is the same plate.

Himeji Castle is one of chapter 8's five candidate sites in `content/research/arc.md`, as
the map README requires. The chapter is a candidate, not locked, and the site has no level
number yet. This plate does not give it one. The map README chose Himeji over the Great
Wall, which is a line and not a shape.

The code silhouette has errors the research names, and none has been corrected yet. Its
docstring says "five storeys of white plaster under six roofs", which is backwards: five
roof tiers outside over six floors inside, plus a basement. Its stone base is a straight
trapezoid under the comment "Straight, not domed": "not domed" is right, "straight" is
wrong, since the face is concave. It stands a thin central finial on the top, which reads
as a pagoda's; Himeji has a fish at each end of the ridge and nothing in the middle. It
draws a lone, mirror-symmetric keep of identical stacked roofs. The chapter 8 row in
`content/map/README.md` says "eaves turned up at the corners"; the research asks for that
to be qualified as a gentle lift, not a Chinese sweep, and for the row to name the five
tiers, the two grey fish and the small keeps to the left. That has not been done either.

Respect gate. `arc.md` lists Himeji with no gate 6 flag. The research for this plate
found that the top (sixth) floor of the main keep houses a shrine to Osakabe, a deity
worshipped on Himeyama before the castle was built. The castle's Osakabe shrine was moved
to the grounds of the Sōsha shrine in 1879, and the shrine on the keep's top floor was
re-established after that; it is still maintained. That is a place of active worship
inside the building. The plate shows only the exterior, and the shrine is out of frame.
The research recommends that `arc.md` note it, and that any level entering the keep's top
floor wait for a designer ruling. Neither has been done, and there is no ruling. The 1945
air raids killed civilians in the city; the castle is not a site of those deaths, and
nothing here touches them.

## Must be right

- The main keep has five main roof tiers. Roofs running all the way round count; gable
  roofs jutting from a tier do not.
- The main keep is the tallest and largest building in the picture.
- Each storey of the main keep is narrower than the one below it.
- The gables differ from tier to tier. The keep is not a stack of identical roofs like a
  pagoda, and it is not symmetrical about a spire.
- The south face shows both triangular gables and curved kara-hafu, and the top tier
  carries a kara-hafu under the top roof.
- The top ridge runs left to right across the picture and ends in two shachihoko, one at
  each end. There is no single central spike or finial.
- The shachihoko are grey fired tile like the roof, not gold. Gold is Nagoya.
- No gold anywhere on the buildings.
- Every building wall is white plaster from the stone to the eaves. No black boarding
  (that is Matsumoto, Okayama, Kumamoto) and no exposed brown timber.
- The band under every eave is cool shadow on white plaster, not brown rafters.
- The roofs are grey tile, silver-grey in sun with fine white joint lines. Not green
  copper, not blue, not black, not orange.
- The eaves lift only slightly at the corners. No sweeping upturned Chinese eaves.
- No storey has an outside balcony or railing.
- The main keep's windows are small dark rectangles in rows, not glass panes and not
  arched openings. The bell-shaped katōmado belong to the top floors of the small keeps,
  not the main keep.
- The West small keep stands to the left of the main keep, much lower, with three roof
  tiers, joined to it by a low connecting building. Small keeps on the right would be the
  view from the north.
- No smaller keep stands to the right of the main keep at the same depth. The East small
  keep is north of the main keep and hidden behind it from this side, so it is not in the
  picture.
- The stone wall's face is concave: steeper at the top than at the foot, flaring outward
  at the base. Not a straight slope and not domed.
- The stone wall is irregular fitted stones, not brick courses and not smooth blocks.
  Mixed warm grey and grey-brown with dark joints.
- The stone wall is lower than the buildings on it. The keep, not the wall, dominates.
- Only the base is stone. The keeps are plastered timber.
- The keep is on a hilltop. No moat water at its foot; the moats are far below and behind
  the viewer.
- Lit from the upper right: the south faces lit, the west returns and the left side of
  each gable in cool shade, never grey paint.
- Every window is one window, stamped. The fish are one fish, stamped at two sizes; the
  loopholes, the eave's corner profile, the corner stones and the pine pads are likewise
  each one shape, stamped (pillar 4).
- No Mount Fuji, which is some 400 km away. No red torii, no cherry blossom, no Otemon, no
  people, no lamps, no scaffolding, no signs.
- No legible writing anywhere.

## Deliberately wrong

- It is a full-frame plate, not a transparent sprite. Every pixel of the 368 × 280 is
  painted, sky to lawn, because it sits in its own keyline frame on the panel and a gap
  would show the card through it. Level art is exported with transparency
  (`content/README.md`); this one is not, on purpose. `npm run map:monuments` fails the
  run if the plate leaves a gap.
- The brochure cheer. The sky is cleaner and bluer than a real day's, with one tidy cloud,
  and the lawn and pines are the set's colours. The season is unspecified. The research
  palette is pushed a little sunnier: the plaster warmer, the tile a touch blue-green, the
  lit stone lighter and warmer than the research's warm grey. The hex values are a design
  decision, not a measurement.
- The several walled terraces between the Sannomaru and the keeps (the gates, the
  Bizen-maru and the keeps' own base) are compressed into one tall curved stone wall
  directly under the complex. At 92 × 70 the stacked terraces read as noise, and the
  concave face is the chapter's signature, so it gets one clean wall.
- The concavity is drawn much stronger than it is. The real change of angle is a few
  degrees, about 65 at the foot to about 70 near the top by one guide, which would read as
  a straight slope at this size. The exaggeration keeps the direction right: steep above,
  flared at the foot. Both ends of the wall flare alike; that outline is the plate's.
- The wall stands lower against the keep than the real base does. The main keep is about
  31.5 m on a stone base of 14.85 m; here the wall is kept low so the keep dominates.
- Otemon (a 1938 building), the Hishi-no-mon and the lower gates, the lower turrets
  (including the Kamiyamazato corner turret and the Ri-1 and Ri-2 corridor-turrets below
  the West small keep) and the Nishi-no-maru long corridor are left out, so the complex
  reads as one shape.
- The shachihoko are drawn at up to about twice their true size, so that two read as two.
  The smaller fish on the main keep's lower ridge ends (one guide counts eleven fish on
  the main keep) are left off.
- The small keeps carry the same fish, stamped smaller, on their top ridges. The research
  does not cover the small keeps' ridge ornaments; check them against a photograph and
  remove them if they are wrong.
- Window lattice, loopholes, crest tiles, gable pendants (gegyo) and individual tiles are
  reduced to dark marks and a few fine white joint lines, or left out. The loopholes are
  one small rectangle at a fixed interval; the real ones are circles, triangles and
  squares. The bell-shaped katōmado on the small keeps' top floors are drawn as the same
  rectangular windows as the rest.
- Tier 1 of the main keep's south face is drawn as a plain skirt roof with no gable,
  because the research could not verify what it carries. Plain is not a claim.
- The window counts and positions on each storey are the plate's, not counted from the
  building.
- The widths and heights of every storey, and of each keep against the others, are drawn,
  not measured.
- The Inui small keep's height above the West keep's roofs, and how much of it shows, are
  the plate's. The research gives its visibility from this spot at medium confidence.
- The view is turned a few degrees off due north so the west returns can show. Their
  width is not a measurement.
- The keeps are brochure white and the roof joint lines fine and a little muted. The
  castle was whitest at its reopening in March 2015; photographs from before 2009 show it
  much greyer, and the roof joint plaster was expected to darken within four or five
  years. No particular year is claimed.
- The wall's shadow falls down and to the left across the gravel, the lawn and the
  pines, the set's convention. With the sun behind the viewer's right shoulder, the true
  shadow falls away from the viewer, behind the wall.
- Himeyama's slopes are two calm dark shapes and the pines three masses of flat pads. No
  particular tree is claimed. Cherry blossom is left out on purpose; the cherry trees in
  the grounds are real but largely modern plantings.

## Contested

Keep these as disputes. None is settled by the plate.

- Founding date. Tradition gives an Akamatsu fort in 1333 and a castle by Akamatsu
  Sadanori in 1346, but both rest on later, Edo-period chronicles, and some historians
  treat the Akamatsu founding as unproven. The documented history starts with the Kuroda
  family and Hideyoshi's three-storey keep of 1581, which was replaced.
- The chapter window. What stands is 1601–09, the keep complex, and 1617–18, the
  Nishi-no-maru added by Honda Tadamasa. That is one to nine years past chapter 8's AD
  600–1600, and later still for the west bailey. Only the traditional 1346 founding and
  the lost 1581 keep fall inside the window. `arc.md` gives the present form as 1601–09
  and carries no flag for it, unlike Pontcysyllte in chapter 11; the research notes this
  and leaves the chapter unchanged. Nijō, 1603, is in the same position.
- Why the stone face curves. The defensive reading (it throws a climber off, like
  Kumamoto's musha-gaeshi) and the structural reading (the concave profile keeps a
  rubble-backed wall stable) are both given in the literature. The research found that
  such walls were climbable and that the curve makes the top harder, not impossible. The
  chapter's mechanic, the curved batter of the wall face, stands as design; the history
  behind "un-climbable by design" is the dispute.
- The Meiji sale. The story that the castle was auctioned in the early 1870s for 23 yen
  50 sen, and that the buyer abandoned it because demolition cost more, is widely
  repeated. The buyer, the date and whether the sale was ever completed are disputed.
- The 1945 bomb. The story that an incendiary landed on the keep's top floor during the
  July 1945 raid and failed to go off is repeated, not established.
- The whiteness. After the 2015 reopening the keep was called "too white". The restorers
  put this down to the thick roof joint plaster, which they said would darken with mould
  and dirt within four or five years. How white is right depends on the year, not on a
  dispute about the building.
- Which lettered corridor-turret (I, Ro, Ha, Ni) joins which pair of keeps. Search
  summaries disagreed. The plate names none; settle it from the Himeji City site before
  any level uses the letters.
- The south face, tier by tier. The gable sequence painted here comes from search-result
  summaries of the Himeji City official tier pages, not from the pages or a photograph,
  and tier 1 is unknown. Only the presence of both gable types and the kara-hafu under the
  top roof is held as must be right.

## Sources

- Himeji City, 姫路城公式サイト: 姫路城の規模, and the per-tier pages 大天守 初重 and 大天守
  四重 (city.himeji.lg.jp/castle/0000007746.html, 0000014380.html, 0000014396.html), and
  its 城の楽しみ方 page (0000007738.html). Search-result summaries only; the domain blocks
  fetching. The connected complex; five tiers, six floors and a basement; the small keeps'
  tiers, floors and basements; eight National Treasures; the gables by tier and face; the
  main keep at the south-east; the West small keep left of it from the Sannomaru.
- Himeji Castle official site in English (himejicastle.jp/en/). Not fetched.
- お城めぐりFAN, 姫路城特別公開エキスパートガイド: 西小天守 and 乾小天守; 美術展ナビ, 第106回
  姫路城小天守と渡櫓 (2025). Search-result summaries only. The katōmado on the small keeps'
  top floors; the Inui keep as the largest of the three.
- 姫路城 guide sites on Otemon and the Sannomaru (じゃらんnet; お城めぐりFAN; 攻城団,
  kojodan.jp/castle/1/memo/1131.html). Search-result summaries only. Otemon 1938; the
  Sakuramon bridge 2007; the lawn facing the keeps.
- Stone-wall guides: 姫路城の石垣 (himejijo-jpn.info/guide11g.html) and Hyōgo Prefectural
  Museum of History, curator column 68. Search-result summaries only. Hashiba-era and
  Ikeda-era walls; uchikomi-hagi; sangi-zumi corners; the fan slope; about 65 to 70
  degrees.
- 現存天守12城～日本100名城: 姫路城 (heiwa-ga-ichiban.jp/oshiro/himeji/). Search-result
  summary only. 31.49 m on a 14.85 m base; eleven fish on the main keep.
- Nikkei, March and June 2015, on the Heisei restoration and the "too white" keep.
  Search-result summaries only. The reopening on 27 March 2015; about 75,000 tiles
  re-laid; the joint plaster.
- お城めぐりFAN 姫路城大天守・最上階, and pages on the Osakabe shrine. Search-result
  summaries only. The grounds for the respect-gate note.
- UNESCO World Heritage Centre, Himeji-jo (WHC 661). Not fetched; cited from knowledge.
- Agency for Cultural Affairs, Cultural Heritage Online and the national designation
  database. Not fetched.
- Bunkazai Hogo Iinkai, the report of the Shōwa restoration (c. 1964–65). The measured
  record of the main keep and the authority for the gables face by face. Not consulted.
- Hirai Kiyoshi, *Feudal Architecture of Japan* (1973), and Hinago Motoo, *Japanese
  Castles* (1986). Standard English accounts of the keep types, gables and stone walls.
  Cited from knowledge; not opened.
- Nagasaki University Library, Bakumatsu–Meiji old photograph database. The likeliest
  public-domain nineteenth-century record: Himeji has no Roberts- or Catherwood-style
  plate tradition. Not searched; check each item's date and rights.
- Wikipedia, 姫路城 and Himeji Castle. A starting point only; not fetched.
- Modern photographs: reference only, never in the repo.

The full research, with links, is `tools/monument-painters/specs/tiered-roofs.json`.

## Confidence

Medium. Every page fetch was blocked, and all verification comes from twelve search-result
summaries, which are second-hand; one pair of them contradicted each other.

Confirmed by search: five tiers, six floors and a basement; 31.49 m on a 14.85 m base;
the connected complex, the main keep at the south-east corner and three small keeps of
three tiers each; four two-storey corridor-turrets; the West small keep to the left of the
main keep from the Sannomaru; Otemon 1938; the fan-slope Ikeda-period stone walls; the
2015 reopening and the joint plaster; the Osakabe shrine on the top floor; the katōmado on
the small keeps.

Medium: the south-face gables tier by tier, with tier 1 unknown; how much of the Inui keep
shows from this spot; the 65 to 70 degree figure for the wall.

From knowledge, not re-verified: the dates 1581, 1601–09 and 1617–18; the Shōwa
restoration of 1956–64; UNESCO 1993; National Treasure designation in 1951; the gentle
eave lift; no gold on the exterior.

Not checked at all: the small keeps' ridge fish; the window counts; every proportion in
the plate. Before anyone calls the plate finished, check the gables against a photograph
of the south face, tier by tier, and the small keeps' ridges with it. Get the ruling on
the Osakabe shrine before any level goes inside the keep.
