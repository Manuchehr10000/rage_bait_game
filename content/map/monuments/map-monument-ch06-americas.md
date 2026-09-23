# Temple I at Tikal, for the tour map

| | |
|---|---|
| Id | `map-monument-ch06-americas` |
| File | `map-monument-ch06-americas.png` |
| Size | 92 × 70 world px, painted 368 × 280 |
| Beat | `monuments` |
| Source | `tools/monument-painters/roof-comb.js`, painted by script; regenerate with `npm run map:monuments -- roof-comb` |

## What it is

Temple I at Tikal, Petén, Guatemala: Structure 5D-1, the Temple of the Great Jaguar, also
called the Temple of Ah Cacao. It is the funerary pyramid of Jasaw Chan K'awiil I, who
reigned 682–734 and was entombed in it. It stands on the east side of the Great Plaza and
faces west across it to Temple II.

The viewer stands on the plaza lawn, a little west of its centre, at eye height, and looks
due east at the west face. The view is face-on, the brochure's elevation. It is the one
view that shows the nine terraces, the single stair, the one door and the comb in a single
outline. Left to right is north to south.

Bottom up:

- Nine terraces, each set back from the one below, each face leaning slightly inward.
  Every terrace has a bright lit top, the ledge's shadow on the face beneath it, a warm
  lit return at the right-hand end and a cool shaded one at the left.
- One stair up the middle of the front, from the lawn to the door. It stands proud of the
  terraces as a pale band with ragged edges, a few broken light strokes, two darker
  patches of loose stone, and three crisp treads at its foot. It throws a shadow down and
  to the left across the terrace faces all the way up.
- On the ninth terrace, the shrine: one building, narrower than the terrace. A door wall
  with one dark doorway on the stair's axis; a projecting medial moulding; an upper facade
  leaning in above it, about as tall as the wall below; a thin cap.
- On the shrine's roof, set back and narrower still, the roof comb: a closed slab in two
  square stages, the upper stepped in, with a flat top. A few rough dark stubs stand out
  of its outline, their tops catching the sun. There is no figure on its face.

The whole building is one pale grey-buff limestone. Broad streaks of dark crust run down
from the ledges, heaviest on the shrine and the comb. A few dabs of moss sit on the
terrace ledges. A soft ink line runs round the monument. From lawn to comb it fills about
four fifths of the plate's height, and it is about one and a half times as tall as its
base is wide.

Behind and beside it, rainforest canopy in a few large rounded masses, each lit on its
upper right, with a dark understorey band along its foot. Its top stands about level with
the fourth terrace, well below the shrine. Above, the set's clean blue sky with one long,
flat fair-weather cloud, low on the left. In front, the open plaza lawn in calm bands,
darker toward the viewer. The pyramid's shadow falls down and to the left across it, and
broad shade from trees out of frame lies across the near lawn. Afternoon sun from the
upper right.

## Where it stands in the game

The chapter 6 panel on the tour map: the plate that stands for the chapter. The panel is
the right-hand strip of the start screen, and the game prints this plate in it, 92 × 70,
whenever chapter 6 is the chapter in view. The game lays paper under it, draws a thin
keyline round it, and sets the site's name, Tikal, beneath. Chapter 6 has no built level
yet, so it has no chapter map, and the plate appears on the world map only. Until the
painting is loaded, the game draws the flat silhouette `roof-comb` in
`src/map/monuments.ts` in its place.

Tikal is one of chapter 6's five candidate sites in `content/research/arc.md`, as the map
README requires. The chapter is a candidate, not locked, and the site has no level number
yet. This plate does not give it one. The map README chose Temple I over El Castillo at
Chichén Itzá.

Respect gate. `arc.md` lists Tikal with no gate 6 flag. The research for this plate found
that contemporary Maya spiritual guides hold ceremonies at Tikal, the Great Plaza
included, under authorisation from Guatemala's Ministry of Culture and Sports. It
recommends that Tikal be flagged in `arc.md` and entered in section 4 for a designer
ruling, on the Borobudur and Great Zimbabwe pattern: architecture, lawn and forest only,
with no people, ceremony, contemporary altar, fire circle, candles or offerings in frame,
on the tour map or in any level. That has not been done, and there is no ruling. The
research asked for the ruling before painting. The plate was painted first, and keeps to
the recommendation. Temple I itself is an ancient royal funerary monument; its tomb,
Burial 116, was excavated in 1962.

## Must be right

- Exactly nine terraces between the lawn and the shrine.
- Exactly one stair, up the middle of the front face, from the plaza to the shrine's door.
  It reads as a rough band, not a crisp flight: only a short reconstructed run survives at
  its foot.
- No stair on either side of the pyramid. Not El Castillo's four.
- One building on the summit, with one doorway, centred above the stair. The three rooms
  lie one behind another, so the outside shows one door.
- The shrine is no wider than the ninth terrace. Nothing overhangs: corbelled masonry
  does not cantilever. The code silhouette draws the shrine 32 wide on a terrace 29.2
  wide; the research marks that as an accidental error. It has not been corrected yet.
- The roof comb is masonry, not wood. It stands on the shrine's roof and is no wider than
  the shrine. Only the door lintels were wood.
- The comb is closed, not pierced like the combs at Palenque. It was built as two walls
  leaning on one another round a vaulted hollow, so from the front it reads as a block.
- No readable figure or face on the comb or anywhere on the building. The giant seated
  king on the comb's front is almost entirely gone. The "Great Jaguar" of the nickname is
  a carved wooden lintel inside the shrine, and it is not shown.
- The comb holds up nothing. The chapter 6 row in `content/map/README.md` and the code
  comment also say it carries nothing; the research marks that as wrong about its purpose,
  since it was built to carry the seated king. Neither has been corrected yet.
- Steep: a tall stepped mass, not a broad low one.
- Bare, weathered limestone, darker in streaks. Not all-over red, not white plaster, not
  the yellow sandstone of chapter 2. One stone per site.
- The cleared state, as since the University of Pennsylvania project of 1956–1970. Not
  the overgrown temple of Maudslay's and Maler's photographs, with trees growing out of
  the terraces.
- Open plaza lawn in front of the stair, with no trees between the viewer and the
  pyramid.
- Temple II is not in the picture. It faces Temple I across the plaza, so from this spot
  it is behind the viewer.
- Lit from the upper right: right-hand returns and terrace tops brightest, left-hand
  returns in cool shade, the doorway dark. Here the house direction is also the true
  light. The west face is lit only after noon, and between the September and March
  equinoxes the afternoon sun at 17° N stands in the south-west, behind the right shoulder
  of a viewer facing east.
- The nine terraces are one terrace drawn by one function, stamped nine times at nine
  widths. The crust streaks, the moss dabs and the comb's stubs are likewise each one
  shape, stamped (pillar 4).
- No people, no ropes or chains, no signs, no wooden visitor stair. No contemporary Maya
  altar, fire circle, candles or offerings (see the respect gate above).
- No legible writing anywhere.

## Deliberately wrong

- It is a full-frame plate, not a transparent sprite. Every pixel of the 368 × 280 is
  painted, sky to lawn, because it sits in its own keyline frame on the panel and a gap
  would show the card through it. Level art is exported with transparency
  (`content/README.md`); this one is not, on purpose. `npm run map:monuments` fails the
  run if the plate leaves a gap.
- The brochure cheer. The sky is cleaner and bluer than any real Petén sky, with one tidy
  cloud, and the lawn is tidier than the real one. The stone is pushed a shade sunnier
  than the research's grey. That is the set's shared style. The hex values are a design
  decision, not a measurement.
- The stair is a band with a few broken light strokes, two rubble patches and three crisp
  treads at its reconstructed foot, not a countable flight. Its dozens of steps would be
  below a pixel, and a wrong count would be a false claim. The unrestored upper stair is
  rougher than the band.
- Each terrace is a plain battered setback with a lit top and a shadowed face. The
  mouldings on the terrace faces and the inset corners are left off at this size. Plain
  corners are not a claim.
- The terrace ends are shown as returns that a face-on view would barely show, so the
  light can model them.
- The weathering is a few broad streaks, not the real crust. The moss dabs are placed,
  not observed.
- The shrine's upper facade is a plain battered band. Whatever sculpture it carried is not
  drawn.
- The comb's outline, two square stages with a flat top, and the places of its stubs are
  the plate's. Neither is checked against Maler or Maudslay. The comb is drawn somewhat
  taller than the shrine; that ratio is not measured.
- The overall proportion, about one and a half times as tall as wide, is drawn, not
  measured. The research could not find the base dimensions.
- The North Acropolis, to the left, and the Central Acropolis, to the right, are left out,
  and the canopy runs in where they stand. A second stepped mass beside Temple I would
  merge with its outline at 92 × 70.
- The canopy is a few rounded masses, kept low so the pyramid stands clear. No particular
  tree is claimed. The shrine and comb standing clear of it against the sky is the
  brochure's framing, not a measured sight line.
- The pyramid's shadow falls down and to the left across the lawn, the set's convention
  and the research's lighting note. The true afternoon shadow of a west-facing pyramid
  falls east, behind it, away from the viewer.
- The shade across the near lawn is from trees behind the viewer. The plate does not claim
  them.

## Contested

Keep these as disputes. None is settled by the plate.

- Height. 47 m in Wikipedia, citing Martin & Grube 2000, and in most popular sources. 44 m
  (145 ft) in art-history survey texts; one source prints "145 feet (47 meters)". A figure
  of 55 m over the plaza is probably Temple III's. The difference is probably the base and
  the top point measured from. The plate draws no ruler.
- Proportion. Whether Temple I is taller than its base is wide is not measured in any
  source reached. Temple II is about 38 m on a base of about 37.6 × 41 m; Temple I is some
  9 m taller, which suggests but does not prove it.
- Date and builder. Raised over the tomb of Jasaw Chan K'awiil I, who died in 734. Dated
  c. 732 in some sources and completed c. 740–750 in others (Webster 2002), which would put
  much of the work under his son Yik'in Chan K'awiil (reigned 734–766). Art-history
  captions give c. 700; one site text says mid eighth century.
- The nine terraces as the nine levels of the underworld. A popular interpretation, not a
  documented Maya statement. Not a fact.
- Original colour. The building was stuccoed, and red is reported on the stucco of the
  roof comb and on Lintel 3, from a search summary of Penn Museum texts not opened. No
  source reached gives a scheme for the whole building. The plate paints none.
- The stone's tone today. "Grey" rests on standard photographs, not re-opened for the
  research. Check against a colour photograph.
- Whether the comb is taller than the shrine, and whether the comb is taller than the
  temple, as the chapter 6 row in `content/map/README.md` says. Not verified.
- The stair's angle. Travel texts give 70°. Unmeasured; not stated.

## Sources

- Wikipedia, "Tikal Temple I", lead extract, read from a cached copy (GitHub,
  pierrusthemaboul/kiko). The names, the jaguar-throne lintel, limestone, c. 732, the
  roof comb, the break with the North Acropolis tradition.
- Wikipedia, "Tikal Temple I" and "Tikal Temple II", search-result text only: 47 m, nine
  tiers, three chambers behind a single doorway, the comb as two walls round a vaulted
  hollow, the seated king on its front; Temple II's base.
- Wikipedia, "Tikal", read from a mirrored snapshot: the plaza's four sides (Coe 1999,
  p. 123), Temple II at 38 m, limestone, the rainforest, Maudslay in 1881–82, the
  University of Pennsylvania project 1956–1970, the reign of 682–734, Burial 116.
- Wikipedia, "Tikal" wikitext, read in fragments: entombed 734 (Martin & Grube 2000,
  p. 43); completed c. 740–750 (Webster 2002); little of the comb's king survives (Miller
  1999, p. 27); the tomb found by Aubrey Trik in 1962 (Coe 1999, p. 124); the three
  chambers and their lintels, some beams now in European museums (Kelly 1996, p. 133).
- Wikipedia, "Maya civilization" and "Maya art", read in fragments: the Central Petén
  style of summit shrine, roof comb and single doorway.
- Uncovered History, "Tikal: Temple of the Jaguar (Templo I)", search snippets only: the
  comb's construction and its lost seated ruler with scrolls and serpents.
- Travel pages and accounts of Tikal, fragments and snippets only. Weak; used for the
  stair's state of ruin and as corroboration of the nine tiers.
- Guatemala, tramites.gob.gt service 1094, and Acuerdos Ministeriales 981-2011 and
  1171-2012; Smithsonian NMAI, "Living Maya Time"; accounts of ceremonies in the Great
  Plaza, including 21 December 2009. Search snippets only. The grounds for the respect
  gate note.
- Penn Museum, *Expedition*, A. Trik, "The Splendid Tomb of Temple I at Tikal,
  Guatemala" (1963). Search summary only.
- Teobert Maler, *Explorations in the Department of Peten, Guatemala: Tikal*, Peabody
  Museum Memoirs V.1 (1911), and A. P. Maudslay, *Biologia Centrali-Americana:
  Archaeology*, vol. III (1889–1902). Public domain. Not opened. The preferred references
  for the terraces, the shrine, the comb and the proportion; they show the overgrown
  state, so use them for geometry, not surface.
- Miller 1999, Martin & Grube 2000, Coe 1999, W. R. Coe's *Tikal* handbook (1967 and
  later), Sharer & Traxler 2006, Webster 2002, Kelly 1996. Not opened; cited through
  Wikipedia. Cite them at page level once someone with access checks them.
- UNESCO World Heritage List no. 64, Tikal National Park. Not opened.
- Modern photographs: reference only, never in the repo.

The full research, with links, is `tools/monument-painters/specs/roof-comb.json`.

## Confidence

Medium. Checked across several independent sources: nine terraces; one central stair,
with only a short reconstructed run at its foot; three rooms behind a single doorway; the
comb's construction and its lost seated king; limestone; the east-side position facing
Temple II; the rival dates; contemporary ceremonies at Tikal.

Not verified: the research was built from search extracts and cached copies, the page
fetches were blocked, and no public-domain plate or photograph was seen. The base
dimensions, the comb's width and height against the shrine, the stone's tone, and the
canopy and lawn rest on nothing checked. Before anyone calls the plate finished, check
Maler 1911 or Maudslay for the terrace count, the comb's outline and the overall
proportion, and a colour photograph for the stone. Get the respect-gate ruling first.
