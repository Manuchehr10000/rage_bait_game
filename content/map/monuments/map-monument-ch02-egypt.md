# The Great Temple of Abu Simbel, for the tour map

| | |
|---|---|
| Id | `map-monument-ch02-egypt` |
| File | `map-monument-ch02-egypt.png` |
| Size | 92 × 70 world px, painted 368 × 280 |
| Beat | `monuments` |
| Source | `tools/monument-painters/abu-simbel.js`, painted by script; regenerate with `npm run map:monuments -- abu-simbel` |

## What it is

The front of the Great Temple of Abu Simbel, cut for Ramesses II (c. 1264–1244 BC), seen
square from the forecourt on the temple's own axis. It is painted as an elevation, with
almost no upward perspective. This is David Roberts's view in "Front elevation of the
Great Temple of Aboosimble, Nubia" (1846–49), and the postcard's since the temple reopened
in 1968. It is the only view that shows all four colossi, the one door, the broken statue
and the whole frieze in one rectangle.

Left to right, which is south to north: the rock fill of the artificial hill; colossus 1,
whole; colossus 2, broken at the waist, its head and a piece of its chest lying on the
terrace at its feet; the door, with the niche of Ra-Horakhty above it; colossus 3 and
colossus 4, whole; the rock fill again.

The facade is one warm sandstone, crossed by rose bedding bands and darker weathering
streaks. Its sides lean inward like a pylon, framed by a torus moulding. It rises well
above the crowns, so the heads stand against carved rock, not sky. At the top, a cornice
carries twenty-two identical baboons, upright, forepaws raised, facing out. Below them run
the band of cartouches, a roll and the band of names and titles, all as texture. Above the
baboons there is a thin ragged rim of hill rock and a strip of cloudless sky.

Each colossus sits frontally on a block throne, hands flat on the knees, holding nothing.
Each wears the nemes, the uraeus and a straight false beard, with the double crown on top:
the tall white crown rising out of the red. Three small standing figures stand at the legs
of every colossus, the broken one included: one beside each leg and one in front between
them. None reaches the knee.

The niche holds a standing falcon-headed figure with a sun disc, a staff on the viewer's
left and a small figure of Maat on the viewer's right. The king stands in relief on each
side of it, facing in. The door is a plain dark rectangle.

Below, a plain low terrace ledge and the pale forecourt. Mid-morning summer sun from the
upper right: lit faces on the right, shadows down and to the left, on the wall and across
the terrace floor. A soft ink line runs round the facade.

## Where it stands in the game

The chapter 2 panel on the tour map: the plate that stands for the chapter. The panel is
the right-hand strip of the start screen, and the game prints this plate in it, 92 × 70,
whenever Egypt is the chapter in view, on the world map and on the chapter map. The game
lays paper under it, draws a thin keyline round it, and sets the site's name beneath.
Until the painting is loaded, the game draws the flat silhouette in
`src/map/monuments.ts` in its place.

Abu Simbel is level 1 of chapter 2 and one of the chapter's own five sites, as the map
README requires. Giza is not the vignette: the research rejects it as a level.

## Must be right

- Four seated colossi in one row, two on each side of the door.
- Exactly one doorway, on the axis, between the second and third colossi. Near-black, a
  rectangle, no arch and no hall seen inside.
- The broken colossus is the second from the left, immediately south of the door. Not the
  third. It is broken at the waist: throne, legs, lap and hands remain; no chest,
  shoulders or head.
- Colossi 1, 3 and 4 are the same statue three times, the same pixels (pillar 4).
- Each whole colossus wears the nemes with the double crown on top. None wears the white
  crown alone: that split belongs to the Small Temple.
- Hands flat on the knees. No crook, no flail, no fists. Those are the Osiride pillars
  inside.
- The fallen pieces lie on the ground at the broken statue's feet. Not reattached, not
  stood upright, not on a plinth.
- Twenty-two baboons along the top, above the crowns, all identical, sitting upright,
  facing out, both forepaws raised. Not small monkeys on all fours.
- The niche is directly above the door: a standing falcon-headed figure with a sun disc,
  a staff on the viewer's left, a small Maat on the viewer's right.
- Three family figures at every colossus, the broken one included, none above the knee.
- The facade rises above the crowns. The heads are backed by rock, not sky.
- The facade's side edges lean slightly inward.
- Facade, colossi and small figures are one warm sandstone. Nothing grey, nothing white.
  No white patches on the northernmost face: that plaster came off in 1874.
- Light from the upper right, white-gold, in the morning. The facade faces east-south-east
  and is in shade after about midday, so no afternoon glow and no sunset orange.
- The surround is the rough rock fill of the 1960s artificial hill. Not a smooth cliff,
  not a dune, no sand piled against the statues. The sand-buried setting in Roberts and the
  early photographs is the 19th century's, not today's.
- No water in frame, and no vegetation.
- No legible text or hieroglyphs anywhere, and no pseudo-hieroglyphs either.

## Deliberately wrong

- It is a full-frame plate, not a transparent sprite. Every pixel of the 368 × 280 is
  painted, sky to forecourt, because it sits in its own keyline frame on the panel and a
  gap would show the card through it. Level art is exported with transparency
  (`content/README.md`); this one is not, on purpose. `npm run map:monuments` fails the
  run if the plate leaves a gap.
- The brochure cheer. The sky is clean and cloudless, and the colour is sunnier than the
  stone. That is the set's shared style. The hex values are a design decision anchored
  to the sources' golden and rose-coloured sandstone, not a measurement.
- The terrace balustrade, its row of falcons alternating with statues of the king, and the
  central stair are reduced to a plain low ledge. At 92 × 70 they would be noise along the
  base line and blur the colossi's feet.
- The family figures are unnamed standing shapes. Crowns, plumes and side-locks are not
  resolved. Their count, positions and knee height are kept.
- The inscriptions are horizontal texture at most: the dedication band, the cartouches,
  each colossus's own name, the Greek mercenaries' graffito of 591 BC on the broken
  statue's leg, and Belzoni's name. The no-text rule, and they are below the scale anyway.
- The 1964–68 relocation joints are not painted. They are hairlines on the stone.
- Small losses on the whole colossi (uraei, beard tips, noses) are not drawn, and none are
  invented.
- The reliefs on the sides and bases of the thrones are left off: invisible from the front,
  or too small.
- How the fallen pieces lie is not recorded, so the plate chooses. The head lies on its
  side, crown to the south, tipped so its face turns out to the viewer, with the white
  crown broken off above the red. A piece of chest and shoulder, with collar rows and the
  end of a nemes lappet, lies beside it. Both are there so the pieces read as a head and a
  body at this size. Neither is a claim about the site.
- The skyline of the artificial hill is an invented profile: a low dome's shoulder falling
  to the frame, with boulders on it.
- Lake Nasser and the Small Temple are out of frame. The lake is behind the viewer in this
  view, and the Small Temple is off the right edge. It is also composition: the lake would
  give away the chapter's relocation gag, which belongs on the chapter end card.
- The cornice and the twenty-two baboons are painted. The map README leaves them off the
  code silhouette, where they would merge the four figures into one trapezoid. In the
  painting the lit baboons stay separate against the sky, so they come back.

## Contested

- Heights. The colossi are 20 m (University of Memphis, Britannica, Wikipedia) or 22 m
  (Global Egyptian Museum). The facade is 30 × 35 m (World History Encyclopedia,
  Wikipedia) or about 32–33 m high and 38 m wide (`LEVEL.md` and others). In the plate the
  crowns reach 0.73 of the facade's height, which these figures allow.
- When and why the second colossus fell. Some accounts say soon after completion, one
  gives c. 1248 BC, others 27 BC; seismic catalogues question whether the 27 BC earthquake
  happened. The cause is "probably" an earthquake. Say "in antiquity".
- The relocation. 64 m up and 180 m inland (UNESCO), or 65 m and 200 m, or more than 60 m
  (Britannica); `LEVEL.md` says 210 m, for which no source was found. 1964–68 (UNESCO) or
  1963–68 (Britannica). 1,036 blocks, also given as 1,035 or 1,042.
- The solar alignment. Sources disagree on whether the move shifted the illumination by a
  day, and which way. UNESCO says the orientation is unchanged. In 1959 the sanctuary was
  lit on ten successive days, so the day is a window.
- Which family member stands at which leg. Wikipedia's own articles conflict on where
  Bintanath and Nebettawy stand, and the per-statue list comes from secondary summaries.
  The plate names nobody.
- The fallen pieces. No reachable text says how the head and torso lie, or whether the head
  keeps its crown. "In front and to the left", as another note in the repo has it, is
  unverified.
- The king's reliefs beside the niche: sunk relief in the repo, raised in one tour source.
  Ra-Horakhty's right hand is on the staff and his left on Maat in most accounts; one adds
  a feather in the right hand.
- The baboons' size: "about 2 m each" comes from a single tour source. The count of
  twenty-two is not disputed.
- Whether the curl of the red crown was carved on these colossi, or survives. Not
  verified, so the plate does not rely on it.

## Sources

- University of Memphis, Institute of Egyptian Art & Archaeology, "Great Temple of Abu
  Simbel": the four 20 m colossi, the fall of the statue left of the door, the east-facing
  front, Re-Horakhty in the niche.
- UNESCO World Heritage Centre, "Working Together: Abu Simbel", and List entry 88, "Nubian
  Monuments from Abu Simbel to Philae": the cutting, the blocks, the artificial hill, the
  same orientation, the reopening on 22 September 1968.
- Global Egyptian Museum (CIPEG), glossary entry "Abu Simbel": the Nine Bows under the feet,
  the baboons raising their forepaws, the registers of cartouches and titles.
- World History Encyclopedia, "Abu Simbel, Facade of the Temple of Ramesses II": the double
  crown and the frieze of twenty-two baboons.
- *Encyclopaedia Britannica*, 1911, "Abu Simbel" (Wikisource): the recessed hillside, the
  colossi backed against it, the platform and its steps. Public domain.
- Wikipedia, "Abu Simbel" and the articles on Tuya, Bintanath, Nebettawy and Meritamen: a
  starting point only.
- The temple-axis survey on ResearchGate, "Astronomical interpretation for sun
  perpendicularity in Abu Simbel temple": the axis at about 100.5° from north.
- K. A. Weyburne, "Determining the Dates of the Illumination of the Great Temple at Abu
  Simbel", *ENiM* 14 (2021) 261–272.
- "Earthquakes in Egypt in the Pharaonic Period" (Brill): the fall and its cause.
- Penn Museum, *Expedition*, "Amelia Edwards and the New Aswan Dam": the plaster on the
  northern face, cleaned in 1874.
- David Roberts, *Egypt and Nubia* (1846–49), "Front elevation of the Great Temple of
  Aboosimble, Nubia" and "The Great Temple of Aboo-Simbel". Public domain. For the carving
  and the composition, not the setting: the sand still half-buries the statues.
- Maxime Du Camp, "Westernmost Colossus of the Temple of Re, Abu Simbel", 1850
  (Metropolitan Museum of Art), and Francis Frith, "Rameses Colossus, Abou Simbel",
  c. 1859 (J. Paul Getty Museum). Public domain. For the head and the double crown.
- The *Description de l'Égypte* has no plate of Abu Simbel. The French expedition ended in
  1801, and Burckhardt did not see the temple until 1813. Do not cite it here.
- Modern photographs for the relocated state and the hill: reference only, never in the
  repo.

The full research, with links, is `tools/monument-painters/specs/abu-simbel.json`.

## Confidence

Medium-high on what decides the silhouette: four colossi, two each side of one door; the
second from the left broken at the waist with its pieces at its feet; the double crown on
every head; twenty-two baboons with raised forepaws; Ra-Horakhty with staff and Maat; the
family no higher than the knee; the artificial hill and the unchanged orientation.

Medium on the family figures' arrangement and on the upper registers. Low-medium on the
arrangement of the fallen pieces, the hill's skyline and the exact colours.

The research was done from search-engine extracts; the page fetches were blocked. Porter
& Moss and the Roberts, Lepsius, Du Camp and Frith plates themselves were not seen. Check
the fallen pieces and the hill's profile against those plates and a modern photograph
before anyone treats them as settled.
