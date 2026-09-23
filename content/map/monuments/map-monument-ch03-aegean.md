# The Lion Gate, Mycenae

| | |
|---|---|
| Id | `map-monument-ch03-aegean` |
| File | `map-monument-ch03-aegean.png` |
| Size | 92 × 70 world px, painted 368 × 280 |
| Beat | `monuments` |
| Source | `tools/monument-painters/lion-gate.js`, painted by script. Regenerate with `npm run map:monuments -- lion-gate`. The research is `tools/monument-painters/specs/lion-gate.json` |

## What it is

The Lion Gate, the main entrance to the citadel of Mycenae in the Argolid. It stands on
the north-west side and was built c. 1250 BC, when the circuit wall was extended for the
second time. It is seen square-on from the approach ramp in the outer court, on the gate's
own axis, a few metres below the threshold, at standing eye height, looking south-east.
That is the one place a visitor sees the doorway, the relief and the bastion together. It
is the view the nineteenth-century plates are reported to take, though their exact
station points have not been confirmed.

The gate is in the middle of the plate. Four conglomerate monoliths make it: a threshold,
two jambs and one lintel. The jambs lean in a little, so the opening narrows towards the
top. The opening is about as wide as it is high: roughly square, not a house door. There
are no doors in it. Through it is the 2 m passage: the soffit and the right reveal are
dark, and the sun, coming in past the right jamb, leaves a lit wedge on the left reveal
and the floor. At the far end, a wall in shade and a strip of floor in sun stand for the
small inner court.

Above the lintel is the relieving triangle. It is filled edge to edge by one slab of grey
limestone, cooler and greyer than every block round it. On it, two lions (or
lionesses) rear on their hind legs in profile, facing each other, one on each side of a
single column. Their backs follow the slope of the slab. Their hind feet stand on its
bottom edge and their forefeet rest on the pedestal the column stands on, an altar with
incurved sides. Each body stops at the neck, which ends flat. The column is Minoan: wider
at the top than at the foot. Above its capital and abacus is a row of four discs, read as
beam ends, and a short member over them towards the apex.

On both sides of the gate the facade is conglomerate ashlar: long, low, squared blocks in
horizontal courses, nine a side. The fifth course is the lintel's. The right-hand courses
sit a little off the left. The wall's preserved top is ragged, with dry grass in the gaps,
and stands about level with the relief's apex. On the right, the inner face of the bastion
runs from the gate towards the viewer and out of the frame, in cool shade. On the left is
a narrower strip of the east flank, the earlier circuit wall refaced in conglomerate, in
sun. Below is the ramp, earth and flat rock, rising to the threshold, with the bastion's
shadow across its lower right. Above the wall are the citadel's slope in summer grass,
three clumps of scrub and a band of clean blue sky.

At the plate's scale, 28 px to the metre on the facade (7 px a metre in world px), the
opening is 3.1 m at the threshold, 2.8 m under the lintel and 3 m high. The lintel is
4.5 m, 1.45 times the opening. The relief is 3.55 m at its base and 3.05 m high.

## Where it stands in the game

The chapter 3 panel on the tour map: the plate that stands for the Bronze Age Aegean, the
way a brochure prints one monument per page. It is shown in the panel on the right of the
start screen whenever chapter 3 is selected, and on the chapter's own map. It sits on the
card inside the panel's keyline frame, which the game draws over its edge.

Mycenae is chapter 3, level 4 (`mycenae`; atlas 37.73 N, 22.76 E). The chapter runs Crete
to mainland, and Mycenae is the first of its sites on the mainland. The column on the
relief is the Minoan form that level 1 at Knossos teaches: it tapers downward.

It replaces the code-drawn silhouette `lion-gate` in `src/map/monuments.ts`, which the game
still draws if this file is missing. That silhouette is wrong in ways the plate is not. It
draws heads leaning in to the column, where only necks survive. It stands the gate free
as a trilithon, with paper round the jambs. It draws a lintel twice the opening and a
triangle flatter than the relief. It gives the column no altar and no discs. The Mycenae row
in `content/map/README.md` has the same faults. It calls the animals "lionesses" as if
that were settled, and its outline brief ("two uprights, one lintel") does not say the gate
is set in a wall.

## Must be right

- Both animals are headless. Each body stops at the neck. Nothing above the neck is
  restored: no head, mane, crown or wings. Heads are the likeliest mistake. The old
  silhouette made it.
- Two animals rear on their hind legs, in profile, facing each other, one on each side of
  one column. Not on all fours, not facing away.
- Forefeet on the pedestal under the column; hind feet on the bottom edge of the slab.
- The column is wider at the top than at the foot. A column that narrows upward is a
  classical column, not this one.
- A row of four discs above the capital.
- The triangle is filled completely by the relief slab. No part of it is open. An open
  triangle is the Treasury of Atreus, not the Lion Gate.
- The relief is about as tall as the doorway and close to equilateral. Its base is wider
  than the doorway and shorter than the lintel.
- The relief is a cooler, greyer stone than the buff-brown conglomerate of the lintel,
  jambs and walls. It is limestone; they are not.
- One lintel block, longer than the doorway is wide, its ends running into the wall
  beyond both jambs. About 1.45 times the opening, not twice.
- Each jamb is one upright block, and the opening narrows slightly towards the top.
- The doorway is roughly square, and there are no doors in it.
- The gate is built into a wall. Masonry continues on both sides of the jambs and the
  lintel. It is not a free-standing trilithon, not an arch, and the lions are not on the
  jambs. That last one is the Lion Gate at Hattusa.
- The masonry round the gate is squared blocks in horizontal courses, not polygonal
  cyclopean blocks. The circuit elsewhere is cyclopean. The gate, the bastion and the
  refaced east flank are not.
- Nine courses a side, the fifth level with the lintel. The right-hand courses do not
  line up exactly with the left.
- The bastion is on the right as you walk up, which is the west. Defenders on it faced an
  attacker's right side, the one without the shield.
- The light is afternoon sun from the right. The gate faces north-west, so the facade is
  lit in the afternoon. The relief takes raking light from the right, and the lions, the
  column and the altar cast short shadows to their left. The bastion's inner face looks
  north-east and is in shade. The east flank looks south-west and is lit. The passage is
  dark.
- The gate is seen square-on from the ramp below it, with the ground rising to the
  threshold. The ground level is the cleared one, after Pittakis in 1841.
- Nothing from inside the citadel except what shows through the opening. Grave Circle A
  lies inside, behind the bastion, and is out of frame, as it is from the ramp. It is a
  royal cemetery of about 3,500 years ago, not the recently dead. Chapter 3 is gate 6
  clear.
- No caption, date or number.

## Deliberately wrong

- **A full-frame plate, not a transparent sprite.** It sits in its own keyline frame on
  the panel, so it covers the frame completely, like a printed photograph. The paint tool
  fails the run if any gap would show the card through it.
- **Brochure cheer.** The set's clean blue sky with two small clouds, and stone warmed and
  cleaned a shade beyond what stands on the hill. The research palette is pushed a little
  sunnier.
- **The monoliths stand forward of their wall.** Threshold, jambs and lintel are painted a
  clear step lighter than the coursed wall, and the wall a step darker and warmer. In the
  stone they are the same conglomerate. At 92 × 70 the gate has to read as a gate and not
  as a pattern in the courses.
- **The relief's ground is darkened.** The slab behind the carving is painted a step
  darker than the lions, the column and the altar, so the carving reads. It is all one
  grey stone.
- **The two lions are mirror images.** One lion is painted once and stamped mirrored,
  under one light. On the slab they are two figures cut by hand, and whether they match
  line for line has not been checked. Pillar 4 asks that identical things be identical,
  so they are.
- **The mountains are flattened.** Profitis Ilias and Zara are one pale low band behind
  the citadel's slope, with no peaks. At this size any peak behind the facade competes
  with the relief triangle, which has to be the only triangle in the picture.
- **Nothing small.** The fractures in the relief, the tool marks, the dowel seats at the
  necks, the pivot holes and bolt sockets, and the crack across the threshold are not
  drawn. They are below the plate's resolution, and half-drawn they read as dirt.
- **Empty.** No visitors, guard, paths, barriers or signs. A brochure shows the monument
  empty, and pillar 2 keeps text out.
- **The bastion's shadow stays off the gate.** A late-afternoon sun from the west can
  throw it across the right of the court. Here it falls only on the ramp, so the facade
  and the relief stay fully lit.
- **The inner court is a sketch.** Through the opening, a shaded wall and a strip of lit
  floor stand for the court. What a visitor actually sees through the gate has not been
  checked.
- **Ink lines.** A dark line round the relief, the doorway and the four monoliths, in the
  set's style. The joint round the slab is real; its weight is not.
- **The wall tops.** The ragged top and the grass in its gaps are a brochure's ruin. The
  real line of the wall top has not been checked (see Confidence).

## Contested

Keep these as disputes. None goes in the picture.

- **Lions or lionesses.** Many modern accounts say lionesses. Mylonas held they were lions.
  The Greek name is Πύλη των Λεόντων, the Gate of the Lions. The plate shows only what
  survives and decides nothing. Notes say "lions (or lionesses)".
- **Which way the lost heads faced.** The traditional reconstruction turns them outward,
  to face whoever approaches. That led some to propose composite beasts or sphinxes.
  Blackwell (2014), from the tool marks, turns them backward. No reconstruction found
  points them at the column. The plate shows no heads and takes no side.
- **What the heads were made of.** Steatite, bronze or other metal, or another stone.
  Sources differ, and none is established.
- **One altar or two.** The Greek description is one double-concave (*amphikoilos*)
  altar; English sources say an "altar-like platform". Blackwell and others describe
  incurved altars, one for each animal, side by side. The plate paints one pedestal under
  the column, where both pairs of forefeet rest, and leaves the question open.
- **The opening's dimensions.** "3.10 m wide by 2.95 m high" and "3.1 m high by 2.95 m
  wide" at the threshold both appear. Either way it is roughly square.
- **The date.** The Hellenic Ministry of Culture and most sources give c. 1250 BC. One
  encyclopedia summary gives the 14th century BC.
- **The relief's limestone.** "Hard (Mesozoic) limestone" in one account, by way of Wace;
  "relatively soft, lightweight grey limestone" in another. It cannot be seen in a
  painting.
- **What the column means.** An aniconic goddess, the royal house, the palace or the
  entrance: all interpretation. A further lost sculpture above the four discs is
  speculation. Neither goes in the painting as fact.

## Sources

- Hellenic Ministry of Culture, *Odysseus*, "Lions' Gate". The site authority. The date,
  the north-west side, the four megalithic blocks, the lintel of about 20 tonnes, the
  lions with forefeet on an altar either side of a column, the heads of another material
  and lost.
- Wikipedia (el), "Πύλη των Λεόντων". The four conglomerate blocks, the limestone relief
  slab, the one double-concave altar, the Minoan column, the second extension of the walls.
- Wikipedia (en), "Lion Gate", citing Wace 1949 and Mylonas. The lintel, the opening and
  its narrowing, the bastion (14.80 × 7.23 m, pseudo-ashlar of enormous conglomerate
  blocks), the refaced east side, the ramp's axis, nine courses a side with the fifth at
  the lintel, the missing heads, the four discs, Mylonas on lions.
- Wikipedia (en), "Mycenae". Pittakis cleared the gate in 1841; Schliemann dug from 1874.
- N. G. Blackwell, "Making the Lion Gate Relief at Mycenae: Tool Marks and Foreign
  Influence", *AJA* 118.3 (2014) 451–488. The relief's dimensions, the incurved altars,
  the four beam ends, the heads turned backward.
- M. C. Shaw, "The Lion Gate Relief of Mycenae Reconsidered", in *Philia Epi eis
  G. E. Mylonan* (Athens 1986) 108–123. Located, not read.
- "Earthquake-induced deformations at the Lion Gate, Mycenae, Greece". The fractures in
  the relief, probably seismic.
- "On the Lions Gate at Mycenae: its Geometry and Roots". The near-equilateral layout,
  chords about 3.80 m.
- Madain Project, "Lions' Gate of Mycenae". Jambs, threshold, its crack, pivot holes, bolt
  sockets, the double wooden doors.
- Odyssey Adventures, "Mycenae: Fortifications". The outer court (about 15 × 7.5 m) and
  the inner court (about 4 × 4 m).
- Smarthistory, "Lion Gate". Grey limestone relief set in conglomerate; heads probably
  steatite or metal.
- UNESCO World Heritage Centre 941, Archaeological Sites of Mycenae and Tiryns (1999).
- William Gell, *The Itinerary of Greece* (1810), "Gate of the Lions, Mycenae". Public
  domain. Before the 1841 clearance: masonry and relief only, not the ground.
- Edward Dodwell, *Views and Descriptions of Cyclopian, or Pelasgic Remains* (1834),
  "The Gate of the Lions at Mycenae", from visits in 1801–06. Public domain. Also before
  the clearance.
- Théodore du Moncel, *The Lion Gate at Mycenae* (1843). Public domain, after the
  clearance. The best nineteenth-century plate for the ground level.
- H. Schliemann, *Mycenae* (1878). Public domain worldwide (`content/research/arc.md`).
  Not fetched.
- DAI Athens, "Schliemann at the Lion Gate? Mykene 63": a photograph of the cleared gate,
  inventoried in 1898.
- Wikimedia Commons, "Lion Gate (Mycenae) in art" and "Relief of the Lion Gate, Mycenae".
  Reference on screen only, never in the repo.
- *Current World Archaeology*, "Magic of Mycenae". The hill between Profitis Ilias and
  Zara.
- Rick Steves travel forum, on the light at the Lion Gate. A weak source, used only for
  the afternoon light.

## Confidence

Medium-high on the structure, medium on proportions, low on colour and backdrop. The
research could not open any page directly. It was built from search extracts of the
cited pages, several cross-checked against each other.

Solid: four conglomerate monoliths; a grey limestone relief filling a corbelled
relieving triangle; two rearing, confronted animals with their heads lost and necks
preserved, forefeet on the column's pedestal; a Minoan column wider at the top, with four
discs above the capital; coursed conglomerate walls, nine courses a side, the fifth at
the lintel; the bastion on the west, the right as you approach.

Medium: exact proportions. They come from secondary compilations of Wace and Mylonas and
from Blackwell 2014, and the opening's width and height are swapped between sources.

Low: the colours, which are judgments from the named materials. The warm fleck
(`#a3714b`) is unsourced. The wall top against the relief's apex is inferred from the
course count, not seen. Whether mountains show above the facade from the ramp is not
verified.

Not yet checked against a picture, so look at Du Moncel 1843, the DAI "Mykene 63"
photograph and the Commons relief photographs before calling the plate finished: the wall
top against the apex, the height and masonry of the east flank, the altar as one piece or
two, the backdrop, and what shows through the opening.
