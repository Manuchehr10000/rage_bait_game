# The Doric temple, Segesta

| | |
|---|---|
| Id | `map-monument-ch05-classical` |
| File | `map-monument-ch05-classical.png` |
| Size | 92 × 70 world px, painted 368 × 280 |
| Beat | `monuments` |
| Source | `tools/monument-painters/doric-temple.js`, painted by script. Regenerate with `npm run map:monuments -- doric-temple`. The research is `tools/monument-painters/specs/doric-temple.json` |

## What it is

The Doric temple at Segesta, in western Sicily. A Greek Doric building in an Elymian city,
usually dated c. 430–420 BC. It stands alone on its own rounded hill, outside the walls and
west of the city on Monte Barbaro. It faces east, at about 84 degrees. It was never
finished. The columns were never fluted, the step blocks were never dressed, and no roof
was ever put on. No cella stands.

It is seen from higher ground to the south-east, a couple of hundred metres off, looking
west-north-west. The eye is a little below the top of the steps, so the building stands
against the sky. This is the brochure's three-quarter view of a Greek temple. It is also
the one view that shows the three things that make Segesta Segesta: the fourteen-column
flank, two gables with nothing between them, and daylight straight through the building.

The east front is on the right, about 35 degrees off its axis, in full sun. Six columns,
the frieze with eleven triglyphs, and an empty pediment whose apex is the highest point in
the picture. The south flank runs away to the left in half-shade: fourteen columns,
counting both corners, under a plain architrave and a frieze of triglyphs that merge into a
rhythm towards the far end. The entablature runs unbroken round the corner. Between the two
gables its top is a flat line with sky above it. At the far left end the west gable rises
on its own, seen from behind: its back face, lit, a little paler and cooler than the east
one.

Behind the columns there is no wall and no door. Through every gap of the front, and along
the flank, the far colonnades show pale in the light, with sky and hills between them. The
far flank's columns stand in step with the near flank's.

Every column is the same column: a smooth, round shaft that tapers and has no base, rising
straight off the top step, a flared cushion capital and a square slab on top. It is
modelled in four flat bands, shade on the left and sun on the right, and drawn by one brush
at every size the perspective asks for.

The temple stands on four steps. Small knobs stand out from the faces of every step: the
lifting bosses, left on because the blocks were never dressed. Each throws a small shadow
below it. The columns throw narrow shadows down the steps, and the temple's shadow lies on
the hilltop below and to the left, over a strip of bare earth along the foot of the steps.

The building is set out in metres and put through one perspective camera, so the counts
and the spacings are the building's: a stylobate of 58 × 23 m, columns 9.4 m high and
1.95 m across at the foot, 6 by 14 columns, 36 in all, 11 triglyphs on the front and 27 on
each flank. The temple fills about five sixths of the plate's width, and nothing of it is
cropped.

The hilltop fills the lower third: grass, a patch of straw in the sun on the right, the
near slope darker as it rolls towards the viewer, and six clumps of low scrub. On the left
the ground falls away into the valley. Beyond it, a nearer fold of hills and a pale far
ridge lie on the horizon, below the entablature. Above is the set's clean blue sky with
two small clouds. A dark ink line runs round the temple, a lighter one round the far
colonnades, and one round the west gable.

## Where it stands in the game

The chapter 5 panel on the tour map: the plate that stands for the Classical
Mediterranean, the way a brochure prints one monument per page. It is shown in the panel on
the right of the start screen whenever chapter 5 is in view, and on the chapter's own map.
The game lays paper under it, draws the keyline round it, and sets the site's name,
"Segesta", beneath it, outside the plate.

Segesta (`segesta`; atlas 37.94 N, 12.83 E) is one of the five candidate sites the research
lists for chapter 5. The chapter is a candidate, not locked, so the site has no level
number yet. The research row reads "Segesta / Taormina", "Greek", "Temple or theatre on a
height". The plate takes the temple. It is Greek Doric work in an Elymian city, and its
height is its own hill, about 2 km west of Monte Barbaro, where the theatre is.

It replaces the code-drawn silhouette `doric-temple` in `src/map/monuments.ts`, which the
game still draws if this file is missing. That silhouette is a front elevation. It shows
one pediment, cannot show the fourteen-column flank or the missing roof, and draws three
steps, a count nobody has checked. Its doc comment and the Segesta row in
`content/map/README.md` both say "standing complete on its hill", which invites a painter
to add a roof. The README row also offers the missing cella as the proof that the temple
was never finished. Whether a cella was ever intended is disputed (see Contested). The
undisputed evidence is the unfluted columns and the undressed steps with their bosses.

## Must be right

- Exactly six columns across the east front.
- Exactly fourteen columns along the south flank, counting both corner columns. Not
  thirteen: that is the Temple of Concordia at Agrigento. Not eight across the front: that
  is the Parthenon.
- Every shaft is smooth. No fluting on any column. Fluting from textbook Doric habit is the
  likeliest mistake, and the smooth shafts are the plainest sign the temple was never
  finished.
- No column has a base. Every shaft rises straight off the top step.
- Every capital is a flared cushion under a square slab. No volutes, no leaves.
- The entablature runs unbroken round the whole building. No gaps, no fallen blocks.
- Eleven triglyphs across the east frieze, with plain metopes between them.
- Two separate gables: the east over the front on the right, the west at the far left end.
  The west gable is not clipped behind the flank. The gap between the two is what shows
  there is no roof.
- Nothing joins the two gables. No roof, no ridge, no tiles, no rafters. Between them the
  top line is flat entablature with sky above it.
- No cella. No wall, door or dark interior behind the columns. The far colonnades and the
  land and sky beyond show through every gap in the front.
- The far flank's columns stand in step with the near flank's. Both have fourteen at the
  same spacing.
- Both tympana are empty. No sculpture, and nothing on the gable corners.
- Small knobs stand out from the faces of the step blocks. Not on the column drums.
- The stone is warm honey-ochre limestone. Not white marble, not cool grey.
- Every column stands to full height. No fallen drums, no broken columns. A fallen temple
  is Selinunte, not Segesta.
- The temple stands alone on its hilltop. No theatre, city wall, other building or sea in
  frame. Monte Barbaro is behind the viewer.
- The east front is on the right and in full sun. The south flank runs away to the left.
  The plate is not mirrored.
- The columns are all one column, painted by one brush under one light. Pillar 4.
- Gate 6 is clear: a temple of a dead religion, standing as a ruin, with no burials, no
  active worship and no atrocity in or near the frame.
- No caption, date or number.

## Deliberately wrong

- **A full-frame plate, not a transparent sprite.** It sits in its own keyline frame on
  the panel, so every pixel of the 368 × 280 is painted, sky to hillside, like a printed
  photograph. Level art is exported with transparency (`content/README.md`); this is not,
  on purpose. `npm run map:monuments` fails the run if any gap would show the card through
  it.
- **Brochure cheer.** The set's clean blue sky with two small clouds, cleaner and bluer
  than a Sicilian sky. The stone is warmed a shade beyond the research palette. The season,
  late spring with the grass still green, is a brochure's choice.
- **Four steps, unchecked.** The research could not count the steps and asked that the
  count not be painted until it was checked. The plate paints four anyway, with risers a
  little deep so the bosses fit. Count them on Serradifalco (1834) or Mertens (1984) and
  change `NSTEP` in the painter before the plate is called finished. Do not default to the
  textbook three.
- **The bosses are enlarged.** Each is 2 to 3 plate px. The real knobs are small against a
  58 m building and would vanish, and they are the one sign of the unfinished state besides
  the smooth shafts. One knob is stamped at an even spacing chosen for calm, one per 3.6 m
  on the front and wider along the flank, not one per real block.
- **The shadows follow the set, not the sun.** The set's light is fixed at the upper right,
  which here is a morning sun from the east, behind the viewer's right shoulder. That
  lights the right faces correctly. A sun there would throw the shadows away from the
  viewer, up and to the left in the picture. The plate throws them down and to the left,
  the set's rule, across the steps and the hilltop.
- **The proportions are set, not measured.** The 58 × 23 m stylobate and the 9.4 m by
  1.95 m columns are recalled figures, not re-checked. The heights of the architrave,
  frieze, cornice and pediment are the painter's. The columns are evenly spaced on every
  side; any corner contraction the building has was not checked and is not drawn.
- **The flank's triglyphs merge.** All 27 are placed, but towards the far end they fall
  below a pixel and read as a rhythm. The eleven on the front are counted.
- **The weathering is left out.** The grey-buff patches and dark streaks on the stone are
  reduced to a greyer cast mixed into the half-shaded flank. The restoration patches and
  iron clamps since the 18th century are not drawn. None of them reads at this size.
- **Empty.** No visitors, paths, fences, signs, ticket area or valley roads. A brochure
  shows the monument empty, and pillar 2 keeps text out.
- **The landscape is compressed.** The valley is the ground falling away on the left, not
  drawn to scale. The far hills are one nearer fold and one pale ridge, invented profiles.
  The bare strip at the foot of the steps and the six scrub clumps are placed for the
  picture, not surveyed.
- **The far colonnades are paled.** They are pushed towards the sky's colour, more than
  distance would do, so the near columns stand forward of what shows through their gaps.
- **Ink lines.** A dark line round the temple, a lighter one round the far colonnades and
  one round the west gable, in the set's style. The stone has no outline.

## Contested

Keep these as disputes. None goes in the picture.

- **Whether a cella was ever intended.** Mertens (1984), from his excavations, reports
  foundation trenches for a cella: a full temple planned and abandoned. An older reading
  has a roofless colonnade built on purpose round an open-air Elymian cult place. Both are
  live. The plate shows only what stands: no cella.
- **Why work stopped.** It is often linked to Segesta's wars: the Athenian expedition of
  416–413 BC, then the Carthaginian campaign that destroyed Selinus in 409 BC. It could
  also have been money, or something unrecorded. No ancient source says.
- **The deity.** Unknown. Aphrodite or Venus Erycina are speculation. One temples dataset
  labels it "Temple of Venus Erycina", citing Vici.org. That shows the label is in
  circulation, not that it is right.
- **The architect.** The city was Elymian, not Greek. The Greek Doric design suggests a
  Greek architect, possibly Athenian-trained, but that is an inference from style.
- **The date.** Usually c. 430–420 BC. The start and stop dates vary by author.
- **Keep out entirely:** the popular claim that the temple was a sham built to impress the
  Athenian envoys. Thucydides 6.46 has Segesta deceive the envoys with borrowed silver and
  the treasures at Eryx, not with this building.

## Sources

- W. H. Smyth, *Memoir descriptive of the resources, inhabitants and hydrography of
  Sicily* (1824), p. 671, quoted in a nineteenth-century edition of Cicero's *Verrines*
  (Internet Archive scan `orationeswithcom01ciceuoft`). Public domain. Read as a search
  extract. "Twelve Doric unfluted pillars on each side, without reckoning those at the
  [corners]": fourteen a flank, unfluted.
- *Encyclopaedia Britannica*, 9th ed., vol. 21, "Selinus" and "Segesta" (Temple University
  Nineteenth-Century Knowledge Project). Public domain. Read as search extracts. Every
  column and the whole entablature "quite perfect"; an Elymian city, distinct from the
  Siculi and the Greeks; the Athenian alliance of 426 BC, the expedition of 416 BC, Selinus
  destroyed in 409 BC.
- I.Sicily epigraphic corpus (J. Prag et al.), ISic020406. Read as a search extract.
  Monte Barbaro's north-east slope is 1.9 km east of the temple: the temple is not on
  Monte Barbaro.
- J. Muccigrosso, *Temples of the ancient Mediterranean* dataset. Read as a search extract.
  The coordinates, 37.941475 N, 12.832296 E, and the orientation, 84 degrees, east.
- *The Mediterranean*, an early twentieth-century travel guide. Read as a search extract.
  The temple perfect but for its unfluted columns, and no other building within sight. For
  the setting only.
- D. Mertens, *Der Tempel von Segesta und die dorische Tempelbaukunst des griechischen
  Westens in klassischer Zeit* (Mainz 1984). Not read. The standard monograph: the cella
  trenches, the bosses, the dimensions, the date, and the step count.
- Duca di Serradifalco, *Le antichità della Sicilia*, vol. 1 (Palermo 1834); J. I. Hittorff
  and L. Zanth, *Architecture antique de la Sicile* (1827–30). Public domain. Not read.
  The measured plates, for the steps, the triglyphs and the proportions.
- J.-P. Houel, *Voyage pittoresque des isles de Sicile, de Malte et de Lipari*, vol. 1
  (1782); J.-C. R. de Saint-Non, *Voyage pittoresque ou description des royaumes de Naples
  et de Sicile*, vol. 4 (1785). Public domain. Not read. Grand Tour views of the temple on
  its hill, for the setting and the composition.
- Thomas Cole, *Temple of Segesta with the Artist Sketching* (1843), Museum of Fine Arts,
  Boston. Public domain. Not seen. The temple in its landscape.
- Modern photographs: reference on screen only, never in the repo.

The full research, with links, is `tools/monument-painters/specs/doric-temple.json`.

## Confidence

Medium on the architecture, low on exact measurements. The research could not open any
authoritative page. Every site tried was blocked, and it was built from search extracts of
public-domain texts and scholarly datasets.

Verified that way: 6 by 14 columns, 36 in all, unfluted; every column and the whole
entablature standing; an Elymian city, not a Greek one; the temple about 2 km west of Monte
Barbaro and not on it; facing east, at about 84 degrees; standing alone.

From standard scholarship but not re-checked: the lifting bosses on the steps, the cella
trenches (Mertens 1984), the date c. 430–420 BC, the dimensions and proportions, the colour
of the stone and the triglyph layout.

Not known: the number of steps. The plate paints four.

Before the plate is called finished, check against Mertens 1984, the Serradifalco or
Hittorff and Zanth plates, and a modern photograph: the step count first, then the
proportions of the entablature and pediment, the triglyph layout, any corner contraction,
the stone's colour, and the view against Houel, Saint-Non and Cole.
