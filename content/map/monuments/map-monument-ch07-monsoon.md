# The Lion Gate, Sigiriya

| | |
|---|---|
| Id | `map-monument-ch07-monsoon` |
| File | `map-monument-ch07-monsoon.png` |
| Size | 92 × 70 world px, painted 368 × 280 |
| Beat | `monuments` |
| Source | `tools/monument-painters/lion-paws.js`, painted by script. Regenerate with `npm run map:monuments -- lion-paws`. The research is `tools/monument-painters/specs/lion-paws.json` |

## What it is

The Lion Gate at Sigiriya (Sinhagiri, "Lion Rock"), Matale District, Sri Lanka: the
lion-staircase terrace built for Kassapa I, c. AD 477–495. The terrace is a plateau about
halfway up the north side of the rock, at the foot of the sheer upper cliff. It is not at
the level of the plain. A brick lion once stood here, and the last climb to the summit went
up between its forepaws and on through its body. Only the forepaws survive. H.C.P. Bell
uncovered them in 1898 and called them "the huge claws … of a once gigantic lion,
conventionalized in brick and plaster". The rock and later the city were named for this
lion.

It is seen from the terrace near its northern edge, on the line of the stair, at a
person's eye height, looking south up the stair and tilting up. This is the only view
that holds both halves of the name, the lion and the rock. The other classic view, the
whole rock from the west over the water gardens, shrinks at this size to a flat-topped
block that could be any mesa, and it hides the lion.

The lower third is the terrace: reddish dry-zone earth running into the picture, darker
toward the viewer, edged with brick on both sides where it drops away. A band of brick
crosses the very bottom of the plate, and a faint paler strip runs from the foot of the
stair toward the viewer. Beyond the terrace edges, three rounded treetops of dry-zone forest
fill each lower corner.

The two paws sit left and right of centre, the fronts of a broken brick mass. Each is a
crouched forepaw in red brick. Its top slopes down and out to three domed toes, with pale
patches of lime plaster on it and brick showing red between them. Behind that the brick
rises into a broken stump beside the stair, in courses, with a plaster patch on its face and
a lit, ragged top. Behind the stumps a second broken mass of brick, darker, rises in
ragged steps toward the stair and flanks its upper flight. Each toe carries one thick plastered claw that
leaves its lower front, hooks forward at the viewer and down, and rests its tip on the
terrace. The tips are worn back to brick. The middle toe of each paw stands a little
forward of the other two. The claws hook away from the stair on each side, so the two
paws are mirror images. The light is not mirrored: each paw's right side takes the sun.
The left paw's face along the stair is lit and the right paw's is in shade.

Between the paws a flight of ten stone steps climbs away from the viewer, narrowing into
the distance. The treads are lit, the risers a step darker. The flight darkens as it
climbs into the shade at the cliff's foot and ends against a dark line there. The right
paw throws a cool shadow across the right of the lowest steps.

The upper two thirds is the north cliff: sheer, bare, weathered warm reddish tan. It fills
the width of the plate at its foot and narrows toward the top, as rock does when the eye
tilts up. It is painted in five tall flat planes, cool on the left and stepping warmer to
the sunlit right. On the right a sunny shoulder leans out over a shaded undercut. Four
dark run-off streaks hang from the lip, darkest at the top. Three pale angular patches
show where the weathered skin has flaked away. The summit line is flat and bare, with a lit
lip and a band of shade under it. The foot of the cliff, behind the paws, is one calm
band of cool shade under a thin lit edge, so the tops of the paws stand clear of it.

Above, the set's brochure sky, cloudless: a strip along the top of the plate and a wedge
in each upper corner. A dark ink line runs round the paws, the toes, the claws and the
brick masses behind them. A softer one runs along the cliff's skyline.

## Where it stands in the game

The chapter 7 panel on the tour map: the plate that stands for Monsoon Asia, the way a
brochure prints one monument per page. It is shown in the panel on the right of the start
screen whenever chapter 7 is in view, and on the chapter's own map. The game lays paper
under it, draws the keyline round it, and sets the site's name, "Sigiriya", beneath it,
outside the plate.

Sigiriya (`sigiriya`; atlas 7.96 N, 80.76 E) is one of the five candidate sites the
research lists for chapter 7. The chapter is a candidate, not locked, so the site has no
level number yet. The research row reads "c. AD 477–495", "Rock plug, lion's-paw gate,
mirror wall. Gate 6 clear". The plate takes the lion's-paw gate. The vignette has to be
clear of gate 6, because a vignette is production like any other asset. Three of the
chapter's five sites are not: Angkor Wat, Borobudur and Chand Baori are all flagged in
`content/research/arc.md`, and none has a ruling.

It replaces the code-drawn silhouette `lion-paws` in `src/map/monuments.ts`, which the
game still draws if this file is missing. That silhouette mixes two viewpoints: the whole
rock in outline, with the terrace set at the level of the plain. The painting keeps to one
real viewpoint, from the terrace, with the cliff rising from its back edge. Three pieces of
text around it are out of step with the research and are left for whoever owns them. The
silhouette's doc comment calls the rock "a plug of old magma", which is one side of a
dispute (see Contested). The same comment says "the rest of the lion, head and body, is
gone"; the head and body are a reconstruction, not a find, and "whatever stood above the
paws is gone" is what is known. And the chapter 7 row of the vignettes table in
`content/map/README.md` still names Angkor Wat.

## Must be right

- Exactly two paws, one each side of a central flight of steps.
- No lion above the paws. No head, mane, jaws or body. Whatever stood over the stair is
  gone.
- The paws are masonry: red brick with patches of pale lime plaster. They are a
  different material and a different colour from the rock behind them. Not grey stone.
  Not carved out of the cliff.
- Three large claws on each paw (Bell: "three on either side of the central
  staircase"). Not a housecat's four or five toes.
- The claws point toward the viewer and stand forward of the brickwork at terrace level.
  None turns upward.
- The two paws are the same size, with the same count, mirrored. On each paw the three
  toes are one stamp, drawn once and placed three times. Pillar 4.
- Each paw stands taller than a person on the steps would. Each claw is roughly the size
  of an elephant's head, which is what Bell first took them for.
- The steps rise between the paws, away from the viewer, toward the cliff.
- The terrace is the ground, and the cliff rises from its back edge. The terrace is not at
  the level of the plain.
- The rock is a sheer, bare, near-vertical cliff. Not a green hill, not a dome, not a cone.
- The summit line is broadly flat. No palace, wall, tower or roof on it: the summit holds
  foundations and cisterns only, and none shows from here.
- No painted women on the cliff face and no gleaming mirror wall. Both are on the west
  face, out of this view.
- No water, moat, fountains or water gardens in frame. They lie at the western foot of the
  rock, below and behind this viewpoint.
- No stupa, Buddha image or temple anywhere in frame. Pidurangala, with its working cave
  temple and brick reclining Buddha, lies about 1.5 to 2 km north, behind the viewer.
- No Chinese guardian lion and no lion from the flag as a model for the paws.
- Nothing modern in frame: no iron stairways, handrails, hornet shelter, signs or visitors.
- The rock and the paws are lit from the upper right.
- Gate 6 is clear. `content/research/arc.md` marks Sigiriya "Gate 6 clear": an
  archaeological site, not a place of active worship. Kassapa's parricide is a
  fifth-century chronicle story, not a recent death or an atrocity.
- No caption, date or number.

## Deliberately wrong

- **A full-frame plate, not a transparent sprite.** It sits in its own keyline frame on
  the panel, so every pixel of the 368 × 280 is painted, sky to terrace, like a printed
  photograph. Level art is exported with transparency (`content/README.md`); this is not,
  on purpose. `npm run map:monuments` fails the run if any gap would show the card through
  it.
- **Brochure cheer.** The set's clean blue sky, without a cloud, cleaner and bluer than a
  dry-zone sky. The research palette is pushed a little sunnier: the sunlit planes of the
  cliff are warmer than the research's rockLit, and the stone of the steps is warmed toward
  the brick. The treetops are the set's fresh green.
- **The light follows the set.** It comes from the upper right, the set's rule. Facing
  south, that is afternoon sun from a little north of west. At 8 degrees north the sun
  stands there in the afternoon only between the March and September equinoxes, so the
  north face is lit like this for only half the year. The brochure picked that half.
- **The shadows follow the set, not the sun.** A sun behind the viewer's right shoulder
  would throw the paws' shadows away from the viewer, up and to the left in the picture.
  The plate throws them to the left and a little toward the viewer, the set's rule, onto
  the terrace and across the lowest steps.
- **The view is compressed.** The depth of the terrace is shortened and the cliff cut
  down, so the paws and the summit edge fit one 92 × 70 frame. Looking up from the terrace,
  the real cliff would fill far more of the view.
- **The terrace is empty.** It never is in life. A brochure clears it, and figures at this
  size would be specks that confuse the paws' scale.
- **The modern fittings are left out.** The metal stairways that climb the rock above the
  paws, their handrails and the hornet shelter. At this size a zigzag of one-pixel rails
  reads as cracks, and a brochure sells the fifth century, not the fittings.
- **The dewclaw is left off.** Bell records a dewclaw on each paw. Here it would be one or
  two pixels, reading as a fourth claw or as damage, and its position was not verified.
- **The claws' profile is the painter's.** The research fixes only that they point toward
  the viewer and stand forward of the brickwork. The hook forward and down to a tip resting
  on the terrace, the lean away from the stair, the domed toes, the middle toe set forward
  and the tips worn to brick are all choices for the picture.
- **The broken masonry is the painter's.** The stumps beside the stair, the lower brick
  mass behind them, and where plaster survives and where bare brick shows are invented to
  read as a ruin. None was matched to a photograph or to Bell's plates.
- **The terrace dressing is the painter's.** The reddish earth and the brick edging are
  the research's judgement, not checked. The brick band across the foot of the plate and
  the paler strip from the stair toward the viewer are the painter's, placed for the
  picture.
- **The proportions are set, not measured.** The paws are drawn about 3.5 m across, and the
  stair about 2.2 m wide at its foot, at some 31 plate px to the metre. The 3 m paw comes
  from weak travel sources, and the stair's width is the painter's. Ten steps are drawn;
  nobody counted them.
- **The cliff is drawn, not traced.** Its outline from the terrace, the overhanging
  shoulder on the right, the five planes, the four streaks and the three pale patches are
  placed for the picture.
- **The rock's colour is a judgement.** Weathered warm reddish tan with dark vertical
  streaks, neither pale grey granite nor sunset orange. It follows "red gneiss" and
  remembered photographs, not a photograph checked for this plate.
- **Weathering left off.** The bee and hornet colonies on the face, the grooves cut for
  the original stair, lichen and fine weathering. At this size they read as holes or
  damage.
- **Indexed colour.** The plate is saved in 255 colours, so the sky lies in bands.
- **Ink lines.** A dark line round the paws and the brick masses, a softer one along the
  cliff's skyline, in the set's style. The face of the cliff has no outline.

## Contested

Keep these as disputes. None goes in the picture.

- **The rock's geology.** "A hardened magma plug from an extinct volcano" in popular text
  and Wikipedia, which is the reading arc.md's "Rock plug" follows. "A granite peak" in
  UNESCO's brief description. "Red gneiss" in the UNESCO Courier (1988). An inselberg in a
  geoarchaeological study. One geology summary gives a gneiss capstone over
  hornblende-biotite gneiss; another says syenite. Sri Lanka's Grade 9 geography textbook
  lists Sigiriya among the residual hills. The plate needs none of them: a sheer,
  weathered, reddish rock satisfies all of them.
- **The height.** About 180 m (UNESCO; UNESCO Courier 1988) against nearly 200 m
  (Wikipedia, tourism text). It depends on where the plain is measured from.
- **What the lion looked like.** UNESCO's lion, "the forequarters of a crouching lion"
  in the Courier, with "galleries and staircases emerging from the mouth" in the World
  Heritage Centre's description, is a reconstruction from the paws, the
  name and the Culavamsa, chapter 39, which calls the staircase "in the form of a lion". No
  head or jaws survive. The popular figure of a brightly coloured lion about 35 m tall has
  no source that was found.
- **The claws and the dewclaw.** Bell saw three large claws each side of the stair and
  says the dewclaw is modelled too. Later sources disagree: one gives three large toes and
  a small one per paw, another five toes and five claws with the dewclaw. On a real lion
  the dewclaw is on the inner side of the foreleg, higher up. Where it sits here, and how
  much survives, were not verified.
- **The size of the paws.** "At least 10 feet tall and 10 feet wide" in travel sources
  fits Bell's elephant-head claws. No measured drawing was reached.
- **Kassapa I's reign.** 477–495 (UNESCO; Pleiades; arc.md). Other Sri Lankan chronologies
  move it by a few years.
- **Out of this view, but disputed.** The surviving frescoes on the west face number 21
  (UNESCO Courier 1988) or 22, and who they show is unresolved. Paranavitana published 685
  mirror-wall verses of the 8th–10th centuries (1956); other counts are higher, with dates
  from the 6th to the 14th century. Pidurangala lies a little under 2 km north by one guide,
  about 2.4 km by another, probably by path.
- **Keep out entirely.** The fringe readings of the three-claw paws as the feet of a
  mythical bird (Gurula), a reptile or Ravana. They have no scholarly support. The paws are
  a lion's, as the name Sihagiri says.

## Sources

- UNESCO World Heritage Centre, "Ancient City of Sigiriya", list no. 202 (inscribed 1982).
  Read as a search extract and through the Pleiades record. Kassapa I, 477–95; "a granite
  peak standing some 180 m high"; "a gigantic lion constructed of bricks and plaster".
- *The UNESCO Courier*, August 1988, Sigiriya entry. Read. "An immense rock of red gneiss,
  180 m high"; the lion "of which only the paws remain", for which the rock and the city
  were named; the paintings halfway up the west face.
- Pleiades gazetteer, place 50266, "Sigiriya". Read. The description and the point,
  7.9571 N, 80.7573 E, which matches the atlas.
- H. C. P. Bell's 1898 description of the paws, Archaeological Survey of Ceylon. Read only
  as quoted in search extracts (archaeology.lk and travel write-ups). The north façade,
  brick and plaster, three claws each side of the central stair, the dewclaw, the
  life-size elephant-head scale. Bell's Annual Reports and their plates were not seen.
  They are the preferred public-domain reference for the paws as found.
- W. Geiger (trans.), *Culavamsa*, Part I (1929), chapter 39. Not read. Confirmed only
  through secondary summaries: Kassapa's move to Sihagiri and the staircase in the form of
  a lion.
- Sri Lanka Educational Publications Department, Grade 9 Geography. Read. Sigiriya among
  the residual hills.
- Wikipedia, "Sigiriya", in an older revision. A starting point only: the plateau halfway
  up, the summit ruins and cisterns, the monastery that followed Kassapa.
- Lonely Planet, "Lion's Paws", and similar travel guides. Read as search extracts. Weak:
  used for corroboration and for the 10-foot figure only.
- Pidurangala travel guides. Read as search extracts. The distance and the active cave
  temple with its reclining Buddha, which is why the frame stops where it does.
- Geology summaries (geologyscience.com; the ResearchGate geoarchaeological study of
  Sigiriya's inselbergs). Read as search extracts. Used only to keep the geology contested.
- Modern photographs: reference on screen only, never in the repo.

The full research, with links, is `tools/monument-painters/specs/lion-paws.json`.

## Confidence

Medium. Every authoritative page tried was blocked. The research was built from search
extracts, the UNESCO Courier text, the Pleiades record and the Sri Lankan textbook.

High on what the plate rests on: gate 6 clear; two paws only, with no head; brick and
plaster, not rock; three claws per paw; the terrace halfway up the north side; the flat
summit with nothing standing on it; the frescoes and the mirror wall on the west face and
out of this view.

Not verified: where the dewclaw sits; how much plaster and how much bare brick shows
today; the shape of the broken masonry above the toes; the claws' profile; the outline of
the north cliff seen from the terrace; the number of steps; and every colour, which are
judgements.

Before the plate is called finished, check it against Bell's plates if they can be found,
and against a modern photograph: the claws and the dewclaw first, then the masonry above
the toes, the cliff's outline, and the colours of the brick, the plaster and the rock.
