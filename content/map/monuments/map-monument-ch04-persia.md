# The Apadana at Persepolis, for the tour map

| | |
|---|---|
| Id | `map-monument-ch04-persia` |
| File | `map-monument-ch04-persia.png` |
| Size | 92 × 70 world px, painted 368 × 280 |
| Beat | `monuments` |
| Source | `tools/monument-painters/apadana.js`, painted by script; regenerate with `npm run map:monuments -- apadana` |

## What it is

The Apadana at Persepolis (Takht-e Jamshid, Fars), the audience hall of Darius I and
Xerxes, seen from the open court east of it. The viewer stands at eye height a little
south of the eastern stairway's axis and looks north-west. The stairway's relief façade
runs across the lower third of the frame. Above and behind it, on the platform, stand
the surviving columns, against a clean sky and nothing else.

This view exists only since 1931–34, when the eastern stairway was dug out from under
collapsed mud brick. No nineteenth-century plate shows it. Since then it has been the
picture that says "Persepolis" and nowhere else: a long, low, symmetrical block with a
raised centre, and very tall thin shafts standing free above it.

The façade, left to right, which is south to north:

- The southern end: a plain framed inscription panel, textured with level dashes.
- The southern wing: three stacked registers of small upright figures in long robes,
  each holding a gift to the chest, walking right, toward the centre. They come in groups
  of three to five, each group set off by a cypress. Plain bands run between the
  registers.
- The left flight: its parapet climbs toward the centre. Under the incline, a carved
  field: a row of cypresses stepping up under the coping, two date palms at the low end,
  and a lion leaping on a bull from behind, jaws in its haunch, while the bull rears
  toward the centre with its head thrown back.
- The central projection, raised above the flights. At the top, a small winged disc
  between two seated winged sphinxes that face it, each with a forepaw raised. Below a
  plain band, four guards on each side, tall, robed, each holding a spear upright, all
  facing in. Between them, a blank rectangle.
- The right flight: the same field mirrored, the lion and bull turned to face the centre.
- The northern wing: the same three registers, the figures walking left, toward the
  centre. It runs out past the right edge.

A row of stepped merlons runs along the whole parapet, following the flights up and
down. The coping throws a short sharp shadow onto the carved face below it.

Five columns stand behind: two far and thinner, one middle, two near and thicker, at
irregular gaps. They are fluted, with faint drum joints and one or two orange-brown
weather streaks each. Every shaft ends in a ragged, stepped break of paler stone. None
carries a capital. Their feet are hidden behind the stair.

Façade, reliefs and columns are one grey limestone, pale and warm in the sun, with no
paint on any relief. Light comes from the upper right: each column is lit on its right
flank and cool on its left, and every relief throws a thin shadow down and to the left.
Below, a dusty, sunlit court, darkening toward the viewer, with the stair's shadow
falling across it down and to the left and a few long, level scuffs of dust. A soft ink
line runs round the façade and round each column.

## Where it stands in the game

The chapter 4 panel on the tour map: the plate that stands for the chapter. The panel is
the right-hand strip of the start screen, and the game prints this plate in it, 92 × 70,
whenever chapter 4 is the chapter in view. The game lays paper under it, draws a thin
keyline round it, and sets the site's name, Persepolis, beneath. Chapter 4 has no built
level yet, so it has no chapter map, and the plate appears on the world map only. Until
the painting is listed and loaded, the game draws the flat silhouette `apadana` in
`src/map/monuments.ts` in its place.

Persepolis is one of chapter 4's five candidate sites in `content/research/arc.md`, as
the map README requires. The chapter is a candidate, not locked, and the site has no
level number yet. This plate does not give it one.

The research file names the vignette `map-monument-ch04-persepolis`. The game builds the
id from the chapter's slug, so the file is `map-monument-ch04-persia`.

## Must be right

- No column carries a capital. No bulls, lions or griffins on any column top, and no
  horns left off because there are no heads to leave them off. Every Apadana capital is
  fallen, in fragments on the ground, or in a museum. The code silhouette and the
  chapter 4 row in `content/map/README.md` still crown every column with double bulls;
  the research marks that as an accidental error. Neither has been corrected yet.
- The columns stand free, at irregular gaps. They are survivors from a grid of 72, not a
  colonnade.
- No roof, no beam and no wall between or behind the columns. The mud-brick walls are
  gone.
- The shafts are fluted: vertical grooves show on the lit side.
- Every column is at least four times the height of the stair façade in front of it.
- The façade is symmetrical about its central panel.
- The central panel is a winged disc between two seated sphinxes, above a blank
  rectangle with four guards on each side. Not the king's audience scene: that is not
  there today.
- The rectangle is blank. It really is.
- The fields beside the centre show a lion attacking a bull, and trees.
- The wing on the viewer's left carries three stacked registers of small walking figures.
- Stair, reliefs and columns are one grey limestone, one colour. Not the warm yellow
  sandstone of chapter 2: one stone per site. No paint on the reliefs; the original
  colour is lost, and showing it would be a reconstruction.
- The winged disc is small and plain, and never a gag. The winged symbol is a living
  community's emblem today (pillar 11).
- The repeated figures are the same pixels: every bearer, cypress, guard, merlon and
  sphinx on one side is one stamp (pillar 4). Figures facing the other way are one second
  stamp, lit from the same side.
- No mountain behind the stair or the columns. Kuh-e Rahmat is east, behind the viewer.
  The royal tombs cut into it are out of frame with it.
- No lamassu and no human-headed bull anywhere. They belong to the Gate of All Nations,
  and at this size they read as Assyria, whose Nimrud and Nineveh are excluded from the
  chapter.
- No water, and no green.
- No legible writing. The inscription panel is texture.

## Deliberately wrong

- It is a full-frame plate, not a transparent sprite. Every pixel of the 368 × 280 is
  painted, sky to court, because it sits in its own keyline frame on the panel and a gap
  would show the card through it. Level art is exported with transparency
  (`content/README.md`); this one is not, on purpose. `npm run map:monuments` fails the
  run if the plate leaves a gap.
- The brochure cheer. The sky is clean, cloudless and bluer than a hazy day in Fars, and
  the stone a shade sunnier than the photographs. That is the set's shared style. The hex
  values are a design decision, judged from memory of photographs, not measured.
- The light. It comes from the upper right, the set's fixed rule. The real east façade is
  lit from behind a viewer in the court, in the morning.
- The stair's shadow on the court. The research's lighting note asks for no cast shadow
  on the ground, after `content/README.md`. That rule is for sprites standing on tiles;
  this plate has no tiles, and the Abu Simbel plate carries its shadows the same way.
- Modern intrusions are left out: the barrier in front of the reliefs, scaffolding on the
  columns, signs, ropes and visitors. At 92 × 70 they would read as parts of the monument.
- The registers are a rhythm of one small figure, not the twenty-three delegations. At
  this size a delegation is a few pixels, and inventing identifiable costumes would be
  making things up. The cypresses between groups, and the walking direction on each wing,
  are the plate's, not the research's.
- The northern wing uses the same figure as the southern. It is described as Persian and
  Median figures, not tribute-bearers; the research asked for the same rhythm, in the same
  stone.
- The guards are one figure, eight times. The research has Persian and Median guards; their
  different dress is not resolved.
- In the fields beside the centre, the row of date palms is two palms, and where the
  cypresses, the palms and the lion and bull sit within the field is the plate's
  arrangement.
- The inscription panel is texture, not cuneiform: the no-text rule. Only the southern one
  is in frame. The northern end is cropped at the right edge, as the research allows.
- Which columns are in frame, and where, is not recorded in the research, so the plate
  chooses: five, the nearer ones taller and thicker. It is a crop of the fourteen standing,
  not a count of them, and it is not yet checked against a photograph from this spot.
- The shapes of the breaks at the column tops are invented: ragged, stepped, never level,
  different on every shaft. They are not a claim about any particular column.

## Contested

Keep these as disputes. None is settled by the plate.

- Whether any standing column still carries the lower members of its capital, the
  corolla and the volute block (never the animals). Herzfeld's glass negative 2308
  (1923–28) is titled "Apadana, Audience Hall, Column with Complex Capital: View before
  Excavation", which suggests at least one did then. The image was not seen and no current
  source was found. The plate paints bare broken shafts; check a dated photograph before
  treating that as settled.
- Column height: 19–20 m (Iranica, "more than 19 m"; Persian Wikipedia, about 20 m), 24 m
  (English Wikipedia), 25 m (Livius), and "over 16.5 m" in one other source. The capital:
  about 8 m (Iranica) or 5.80 m. The plate paints proportion, not a number.
- When the fourteenth column was re-erected: 1965 in one source, the 1970s on Livius and
  English Wikipedia. Persian Wikipedia puts it at the north-east of the east portico.
- The animal on the east portico's capitals: double lions in Persian sources and one
  English one; Schmidt says only "addorsed animal capitals" set directly on the shaft. The
  one intact double-griffin capital's building is unproven. Popular claims of lamassu
  capitals in the Apadana are unsupported.
- Flandin & Coste's date: issued in parts 1843–1854 (Bibliorare, Gallica, HathiTrust),
  1881–82 according to Drawing Matter, 1851 in `arc.md`, probably the date of the *Perse
  ancienne* volumes.
- The northern wing's figures and the exact profile of the flights: standard
  descriptions, not re-checked.

## Sources

- Livius, "Persepolis: Apadana": 72 columns; thirteen standing by 1900 and a fourteenth
  re-erected; forty in the sixteenth century, hence Chehel Minar.
- Livius, "Persepolis: Apadana East Stairs": the central panel, the triangles with
  cypresses, lion and bull and date palms, the Xerxes inscriptions at the ends.
- *Encyclopaedia Iranica*, "Apadana", citing E. F. Schmidt, *Persepolis I* (1953), p. 80:
  which part of the hall had which capital.
- *Encyclopaedia Iranica*, "Capitals" and "Persepolis" (A. Sh. Shahbazi): the three-part
  capital, the square bases of the hall columns, the heights.
- ISAC, University of Chicago, Persepolis photographic archive, "The Apadana": the
  Schmidt expedition's captions of fallen bull capitals, 1935–39.
- Smithsonian, Freer and Sackler Archives, Ernst Herzfeld Papers, negative 2308. Not seen.
- *Tehran Times*, "Oldest known photographs reveal how Persepolis has changed over time":
  Pesce's 1857 photographs, and the eastern stairway uncovered in 1931–34.
- Persian Wikipedia, "کاخ آپادانای تخت جمشید": fourteen of 72 standing, one restored.
  Through search extracts.
- Cabinet, University of Oxford, "The Apadana at Persepolis": the 60 × 60 m hall, 36
  columns, three porticoes, the reliefs on the east stair.
- P. Hunt, "Achaemenid Persian Griffin Capital at Persepolis" (Stanford Archaeolog).
- "Authenticity and Restoration" (ResearchGate): the IsMEO restorations of 1964–79, and a
  warning that restored tops at Persepolis are not all original.
- Livius and English Wikipedia on the Gate of All Nations: used to keep it out.
- Oriental Institute Museum, Chicago, double bull capital on a fluted column (Wikimedia
  Commons file): an Apadana capital, restored, in limestone, off site.
- Flandin & Coste, *Voyage en Perse* (Gide et Baudry). Public domain. Good for the columns
  and the terrace. It cannot show the eastern stairway, which was buried when they drew.
- Herzfeld's photographs (1923–34) and Schmidt, *Persepolis I* (1953), for the stairway:
  reference only, rights to be checked first. Modern photographs: reference only, never in
  the repo.

The full research, with links, is `tools/monument-painters/specs/apadana.json`.

## Confidence

Medium. Checked across several independent sources: 72 columns, 36 in the hall and three
porticoes of 12; thirteen standing by 1900, fourteen today; which part of the hall had
which capital; the central panel and the flanking fields; the stairway uncovered only in
1931–34; limestone.

Not verified: the research was built from search extracts, the page fetches were blocked,
and not one photograph or plate was seen. Before anyone calls the plate finished, check
against a dated photograph from the east court: the column tops, which columns are in
frame and where, the stone's colour, and the flights' profile. The stepped merlons, the
drum joints, the sphinxes' pose and crowns, and the cypresses between delegations are the
painter's, not the research's; check them in the same photograph.
