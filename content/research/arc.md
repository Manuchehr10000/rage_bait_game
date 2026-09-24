# Lost Tourist — Historical Arc

Canonical reference for the game's chapter and level structure. This file is the
single source of truth for site identity, period, costume and status. It does not
contain level design; beats are decided one at a time in design conversation and
live in each level's own asset notes.

Last revised: 2026-09-24. Chapter 3 corrected and its first rulings recorded while Knossos was designed (sections 3, 4, 5, 7). Corrections from the monument research for the tour map: Gargas date, Persepolis imagery, Segesta, Sigiriya, Himeji, Great Zimbabwe, Registan and Martello rows, sections 6 and 7. Tikal ruled: architecture only (section 4). 2026-09-23: Great Zimbabwe ruled: walls, passage and tower only (section 4). 2026-09-15: curator mode dropped by designer ruling; facts that cannot be shown without text live in the asset notes and nowhere in the game.

---

## 1. Invariants

These rules govern every chapter and must not be varied per level.

**The accuracy rule.** Everything that is not a trap is exactly right. A history
teacher should find the jokes and no mistakes. Every asset carries a note stating
what must be right and what is deliberately wrong. There is no third category.

**Accuracy governs dressing; fiction governs layout.** Materials, proportions,
colour, breakage and detail are documented. Spacing, sequence and jump distances
are level design. The pithoi are real; their positions are not.

**No text inside a level.** A fact is either legible as painted art, silhouette or
behaviour, with no text, or it stays in the asset notes for the designer and never
reaches the player. A site with no facts of the first kind is not a level, however good
its written material.

**Level shape.** One real site. Walked left to right. About 45 seconds of clean
play. Five to eight beats. A beat is one real feature of the site turned into one
mechanic; the trap must come from something true about the place.

**Chapter shape.** Five levels, one costume. Level 1 is honest and teaches the
chapter's vocabulary. Level 2 turns those lessons around. Level 3 makes everything
untrustworthy. Levels 4 and 5 escalate. Level 5 ends on a grand feature.

**Death.** Infinite lives, no checkpoints, a visible death counter. The level never
changes, so the second attempt is about memory. Nothing in the game reacts to a
death.

**Punching direction.** The tourist is always the idiot. The locals are always
competent and busy. No level may make the culture the joke.

**Gate 6 (respect).** Places of active worship, graves of the recently dead, and
sites of atrocity are out. Ruins, temples of dead religions, palaces,
fortifications and engineering are in. Ambiguous cases are flagged in this file
and require a designer ruling before production, never a level-designer judgement
call.

---

## 2. The arc

Twelve chapters on a chronological spine, ordered by start date. Chapters 1–3 are
locked. Chapters 4–12 hold researched candidate sites, gate-screened but not
design-committed.

| # | Chapter | Slug | Dates | Status |
|---|---|---|---|---|
| 1 | Palaeolithic Europe | `ch01_palaeolithic` | 27,000–13,000 BP | LOCKED |
| 2 | Egypt | `ch02_egypt` | 2667 BC – AD 30 | LOCKED |
| 3 | Bronze Age Aegean | `ch03_aegean` | 1900–1200 BC | LOCKED |
| 4 | Iron Age Near East & Persia | `ch04_persia` | 900–330 BC | CANDIDATE |
| 5 | Classical Mediterranean | `ch05_classical` | 450 BC – AD 200 | CANDIDATE |
| 6 | The Americas | `ch06_americas` | AD 200–1500 | CANDIDATE |
| 7 | Monsoon Asia | `ch07_monsoon` | AD 400–1300 | CANDIDATE |
| 8 | East Asia | `ch08_east_asia` | AD 600–1600 | CANDIDATE |
| 9 | Africa & the Indian Ocean | `ch09_africa` | AD 1000–1600 | CANDIDATE |
| 10 | Islamic Central Asia & al-Andalus | `ch10_islamic` | AD 1200–1600 | CANDIDATE |
| 11 | The Industrial Dawn | `ch11_industrial` | 1700–1800 | CANDIDATE |
| 12 | Napoleonic Wars | `ch12_napoleonic` | 1796–1815 | CANDIDATE |

Accepted omissions. Do not reinstate without a scope decision: medieval European
castles, Oceania and Polynesia, the steppe and nomadic cultures.

---

## 3. Chapters

### Chapter 1 — Palaeolithic Europe · `ch01_palaeolithic`

- **Dates:** 27,000–13,000 BP. These are radiocarbon years before present, not calendar years; never write them as "years ago".
- **Costume:** modern hiking clothes, bucket hat, headlamp. He came for the guided tour. No furs, ever.
- **Vocabulary:** carved shelter ledges, cave ceilings and shafts, bear-nest floor pits, lamp-limited sight.
- **Status:** LOCKED

| Lvl | Site | Slug | Place | Period |
|---|---|---|---|---|
| 1 | Cap Blanc | `cap_blanc` | Marquay, Dordogne, FR | Magdalenian, c. 15,000 BP |
| 2 | Roc-aux-Sorciers | `roc_aux_sorciers` | Angles-sur-l'Anglin, Vienne, FR | Mid Magdalenian, c. 15,000 BP |
| 3 | Pech Merle | `pech_merle` | Cabrerets, Lot, FR | Gravettian, c. 25,000 BP |
| 4 | Rouffignac | `rouffignac` | Rouffignac-St-Cernin, Dordogne, FR | Magdalenian, c. 13,000–15,000 BP |
| 5 | Gargas | `gargas` | Aventignan, Hautes-Pyrénées, FR | Gravettian, c. 27,000 BP |

- **Level 1 teaches:** a relief ledge is a floor; light is a resource; what you see may be a cast.
- **Level 5 ends on:** walls of hand stencils with missing finger segments.
- **Gargas date:** "c. 27,000 BP" is 26,860 ± 460 BP (GifA-92369; Clottes), an uncalibrated radiocarbon age on a splinter of bone in a crack of a hand panel. It dates the bone, associated with the hands, not the pigment. In calendar years it is older than 27,000 (compare Foucher et al. 2019: child remains at 24,930 ± 220 BP = 29,500–28,532 cal BP). Popular articles say 30,000 to 35,000 years; do not repeat that either.
- **Chapter error dossier:** Henri Breuil's copies. Altamira Great Ceiling boar/bison reidentification (Breuil 1906 → Freeman 1987 → Rice 1992); a hind printed mirror-reversed in the 1906 plates; stratigraphic order wrong in several panels, corrected 1935. The Trois-Frères "Sorcerer" drawing contested by Ucko & Rosenfeld and Hutton, defended by Clottes. Font-de-Gaume figure numbering corrected by Reiche et al. 2023.
- **Imagery:** thin. Most decorated caves are sealed or their photography is in copyright. Base on excavation reports plus Cartailhac & Breuil 1906 from US-hosted scans only (EU copyright in the plates runs to end of 2031).
- **Gate 6:** clear. Do not build the chapter around replica caves; note replicas as modern intrusions only.

### Chapter 2 — Egypt · `ch02_egypt`

- **Dates:** 2667 BC – AD 30
- **Costume:** bad pharaoh headdress over modern clothes.
- **Vocabulary:** pylons and courts, colonnades, roof stairs, crypts and squeezes, defaced faces.
- **Status:** LOCKED. Runs south to north along the Nile.

| Lvl | Site | Slug | Place | Period |
|---|---|---|---|---|
| 1 | Great Temple of Abu Simbel | `abu_simbel` | Nubia, EG | c. 1250 BC, Ramesses II |
| 2 | Philae | `philae` | Agilkia island, Aswan, EG | Ptolemaic–Roman; last hieroglyphs AD 394 |
| 3 | Karnak | `karnak` | Luxor, EG | c. 2000–300 BC, thirty-plus builders |
| 4 | Dendera (Temple of Hathor) | `dendera` | Qena, EG | Ptolemy XII–Tiberius |
| 5 | Saqqara | `saqqara` | Memphis necropolis, EG | Step Pyramid c. 2667 BC; Serapeum to Ptolemaic |

- **Level 1 teaches:** a monument can be in the wrong place; light arrives on a schedule.
- **Level 5 ends on:** Djoser's stepped terraces and the Serapeum's sarcophagus gallery. The chapter closes by leaping back to the beginning of monumental stone.
- **Chapter gag:** Abu Simbel and Philae were both cut up and moved in the 1960s–70s. The coordinates are right and the monuments are not there. Reveal on the chapter end card.
- **Imagery:** strong. *Description de l'Égypte* (1809–1828), Denon 1802, Lepsius 1849–59, Mariette 1856. All public domain.
- **Reserves, tested and passing both gates:** Kom Ombo (`kom_ombo`), Edfu (`edfu`). Held out only because they sit south of Karnak and would reverse the south-to-north walk.
- **Rejected:** Giza pyramids (gate 1, three triangles and a plain), Deir el-Medina (gate 1, knee-high foundations).

### Chapter 3 — Bronze Age Aegean · `ch03_aegean`

- **Dates:** 1900–1200 BC
- **Costume:** bull-leaper kit, badly tied and slipping.
- **Vocabulary:** light wells, multi-storey interiors and stairs, corbelled domes and galleries, cyclopean gates.
- **Status:** LOCKED. Runs Crete to mainland; Minoan giving way to Mycenaean.

| Lvl | Site | Slug | Place | Period |
|---|---|---|---|---|
| 1 | Knossos | `knossos` | Kephala hill, Heraklion, Crete, GR | Palaces c. 1900–1350 BC |
| 2 | Phaistos | `phaistos` | Messara plain, south Crete, GR | Old Palace c. 1900 BC; New c. 1700–1450 BC |
| 3 | Akrotiri | `akrotiri` | Thera (Santorini), GR | Buried by eruption, late 17th c. BC |
| 4 | Mycenae | `mycenae` | Argolid, GR | Peak c. 1350–1200 BC |
| 5 | Tiryns | `tiryns` | Argolid, GR | Circuit and palace c. 1400–1200 BC |

- **Level 1 teaches:** columns hold floors up, and taper downward; light from above means nothing is overhead; the palace is partly Evans's idea, cast in 1920s concrete. (Corrected 2026-09-24 from "light means safe", which chapter 1 had already taught twice, and "a Victorian idea": Evans was a Victorian and so was his frame, but the dig began in March 1900 and the reconstitution a visitor sees is Edwardian and interwar.)
- **Level 5 ends on:** a cyclopean wall entered through a corbelled gallery inside its own thickness. (The earlier "8 m" named no dimension. Sources give the Tiryns walls about 6 m thick, about 17 m where the galleries pass through, and up to about 7 m of surviving height, originally perhaps 9–10 m. Probable; check before designing.)
- **Signature mechanic, to keep distinct from Egypt:** the light well and the multi-storey collapse, not the staircase. Stairs are incidental here. The chapter's light comes from directly above: a lit patch is the one place nothing is overhead.
- **Chapter error dossier:** Evans's reconstitution at Knossos, in three campaigns: timber 1901–04 under Theodore Fyfe, rotted within a few years; stone, iron girders and brick arches from 1904–05 under Christian Doll (to 1907, 1910 or the war; sources differ); reinforced concrete mainly 1922–30 under Piet de Jong, the west storerooms VIII–XII roofed in 1929 and the Throne Room in 1930. Duncan Mackenzie ran the digging and kept the daybooks. Minos Kalokairinos, a Cretan, dug first, in 1878–79. Gilliéron père and fils fresco restorations — the Priest-King assembled from non-joining fragments with no face preserved (the combination contested: Coulomb 1979, Niemeier 1987); the Saffron Gatherer restored as a boy and re-identified as a blue monkey (Platon 1947); the Ladies in Blue largely modern paint; the pair of griffins flanking the throne, of which the western one has no evidence (Galanakis, Tsitsa and Günkel-Maschek, BSA 2017). The Dolphin fresco probably a floor painting fallen from the storey above (Koehl 1986), put on a wall by Evans. Lapatin's forgery case against the Boston "Snake Goddess". Evans's Early/Middle/Late Minoan scheme versus Platon's palace periods. Schliemann's naming of the Mask of Agamemnon (genuine but misnamed and misdated by three centuries; the forgery claim is fringe; the "gazed upon the face" quotation is apocryphal).
- **Imagery:** Schliemann 1878 and 1886 are public domain worldwide. Evans's own work in *The Palace of Minos* is EU public domain from 2012; in the US volumes I (1921), II (1928) and III (1930) are public domain, III since 1 January 2026, and IV (1935) follows on 1 January 2031. Each plate's draughtsman decides in the EU: the Gilliérons and Fyfe are clear, Doll depends on his death year (unchecked), and Piet de Jong (d. 1967) stays in copyright to the end of 2037. Akrotiri has no public-domain imagery at all; base on Marinatos 1968–76 and Doumas 1992.
- **Reserves, notes only:** Pylos (`pylos`), Gournia, Malia, Zakros, Ayia Triada. All fail gate 1 on profile — standing fabric is knee to waist height.
- **Gate 6:** clear, with one flag ruled. At Akrotiri part of the site's protective roof collapsed in September 2005, killing a British visitor and injuring six or seven people (sources differ); the site was closed until April 2012. Ruling in section 4. Spyridon Marinatos died on the site in 1974 and was first buried in the excavation; sources differ on whether the grave was later moved beyond the ruins. Never in frame. No victims of the eruption are known at Akrotiri: the town was evacuated.
- **Check before designing Phaistos:** whether any modern protective shelter stands over part of it. The chapter's spine assumes it was dug and left open (Halbherr and Pernier from 1900, Levi 1950–66).

### Chapter 4 — Iron Age Near East & Persia · `ch04_persia`

- **Dates:** 900–330 BC
- **Costume:** false Assyrian beard, curled and clipped on.
- **Vocabulary:** palace terraces, siege ramps against walls, rock-cut cliff reliefs, aqueduct channels.
- **Status:** CANDIDATE

| # | Site | Slug | Place | Period | Gate notes |
|---|---|---|---|---|---|
| — | Persepolis | `persepolis` | Fars, IR | c. 518–330 BC | Apadana double stairways, columns, terrace. Flandin & Coste, *Voyage en Perse*, issued in parts 1843–54, PD. The eastern stairway with its reliefs was excavated only in 1931–34, so no nineteenth-century plate shows it; base it on the excavation reports |
| — | Behistun | `behistun` | Kermanshah, IR | c. 520 BC | Cliff face, relief band, cut-away access ledge. Rawlinson drawings, PD |
| — | Naqsh-e Rustam | `naqsh_e_rustam` | Fars, IR | 5th c. BC + Sassanian | Cruciform rock tombs, Ka'ba tower. Flandin & Coste, PD |
| — | Susa | `susa` | Khuzestan, IR | Elamite–Achaemenid | Tell, excavation "château". Dieulafoy 1890–92, PD |
| — | Pasargadae | `pasargadae` | Fars, IR | c. 546 BC | Stepped tomb plinth. Weak on beats — reserve |

- **Signature mechanic, to keep distinct:** the ramp *against* the wall.
- **Gate 6:** clear throughout. Note Nimrud and Nineveh were dynamited 2014–15 and are excluded.

### Chapter 5 — Classical Mediterranean · `ch05_classical`

- **Dates:** 450 BC – AD 200
- **Costume:** tunic with socks and sandals.
- **Vocabulary:** stepped theatre seating, stepping-stone streets, insula storeys, harbour moles.
- **Status:** CANDIDATE. The most over-supplied chapter; cut rather than pad.

| # | Site | Slug | Place | Period | Gate notes |
|---|---|---|---|---|---|
| — | Ephesus | `ephesus` | Selçuk, TR | Hellenistic–Roman | Library façade, hillside theatre, colonnaded street |
| — | Ostia Antica | `ostia_antica` | Rome, IT | Republican–Imperial | Multi-storey insulae, theatre, silted harbour |
| — | Pompeii | `pompeii` | Naples, IT | Buried AD 79 | **GATE 6 FLAG** — body casts are graves. Architecture only; casts out of frame. Niccolini 1854–96, PD |
| — | Segesta / Taormina | `segesta` | Sicily, IT | Elymian city; Greek Doric temple c. 430–420 BC | Segesta was an Elymian city, not a Greek one; its temple is a Greek Doric building in it, standing unfinished on its own low hill about 2 km west of the city's height, Monte Barbaro, which carries the theatre. Grand Tour engravings, PD |
| — | Leptis Magna | `leptis_magna` | LY | esp. AD 193–211 | Theatre, basilica, harbour mole. **Flag:** conflict-zone heritage, note it |

### Chapter 6 — The Americas · `ch06_americas`

- **Dates:** AD 200–1500
- **Costume:** gift-shop feather headdress.
- **Vocabulary:** pyramid stairways, ballcourt slopes, cliff paths, agricultural terraces.
- **Status:** CANDIDATE

| # | Site | Slug | Place | Period | Gate notes |
|---|---|---|---|---|---|
| — | Teotihuacan | `teotihuacan` | MX | c. 100 BC – AD 550 | Sun and Moon pyramids; Batres over-restoration c. 1906 is a reconstruction beat. Charnay 1880s, PD |
| — | Chichén Itzá | `chichen_itza` | Yucatán, MX | c. AD 600–1200 | El Castillo, ball court, equinox serpent-shadow. Catherwood 1843, Maudslay 1889–1902, PD |
| — | Tikal | `tikal` | Petén, GT | c. AD 200–900 | Steep temple stairs, roof-combs. Maudslay, Maler, PD. **Flag:** contemporary Maya ceremonies in the Great Plaza — architecture only (ruled 2026-09-24, section 4) |
| — | Monte Albán | `monte_alban` | Oaxaca, MX | c. 500 BC – AD 800 | Levelled hilltop, danzantes, Building J |
| — | Ollantaytambo | `ollantaytambo` | Cusco, PE | Inca, 15th c. | Stacked terraces, unfinished megaliths, quarry ramp. Squier 1877, PD |

- **Signature mechanic, to keep distinct from Chapter 7:** the ballcourt slope and the two-days-a-year solar event, not the terrace.
- **Imagery:** uneven. Strong for Tikal and Chichén Itzá, patchy for the Andes.

### Chapter 7 — Monsoon Asia · `ch07_monsoon`

- **Dates:** AD 400–1300
- **Costume:** rented sarong, worn wrong.
- **Vocabulary:** moat crossings, galleries, stupa terraces, descending stepwells, cliff-cut caves.
- **Status:** CANDIDATE. Heaviest gate 6 load after Chapter 12.

| # | Site | Slug | Place | Period | Gate notes |
|---|---|---|---|---|---|
| — | Sigiriya | `sigiriya` | LK | c. AD 477–495 | Sheer rock out of the plain, lion's-paw gate, mirror wall. Gate 6 clear. What the rock is made of is contested (section 7): never call it a plug |
| — | Ajanta Caves | `ajanta` | Maharashtra, IN | c. 2nd c. BC – 5th c. AD | Horseshoe cliff, cave façades. Griffiths 1896–97, PD. Gate 6 clear |
| — | Chand Baori | `chand_baori` | Abhaneri, Rajasthan, IN | 8th–9th c. | Thirteen storeys descending; the only level that goes *down*. **FLAG:** adjoining Harshat Mata temple is active — build in the well only |
| — | Borobudur | `borobudur` | Java, ID | c. AD 800 | Stepped terraces, bell-stupas, buried base. **GATE 6 FLAG** — active pilgrimage. van Kinsbergen 1873, PD |
| — | Angkor Wat | `angkor_wat` | Siem Reap, KH | AD 1113–1150 | Moat, causeway, rising galleries. **GATE 6 FLAG** — active temple with resident monks. Substitutes if refused: Ta Prohm, Beng Mealea. Delaporte 1880, PD |

- **Signature mechanic, to keep distinct from Chapter 6:** the moat crossing and the descending well.

### Chapter 8 — East Asia · `ch08_east_asia`

- **Dates:** AD 600–1600
- **Costume:** costume-shop kimono, obi tied backwards.
- **Vocabulary:** timber bracket tiers, sloped un-climbable castle bases, wall ridgelines, garden bridges.
- **Status:** CANDIDATE

| # | Site | Slug | Place | Period | Gate notes |
|---|---|---|---|---|---|
| — | Himeji Castle | `himeji` | Hyōgo, JP | present form 1601–09 (keep complex), 1617–18 (Nishi-no-maru) | Keep on fitted-stone base; the concave batter that throws a climber's weight back; doubling-back maze approach. **Flag:** what stands is just past the chapter window; only the traditional 1346 founding and Hideyoshi's lost keep of 1581 fall inside it. **Gate 6 note:** the keep's top floor houses a maintained shrine to Osakabe; any level inside the keep keeps it out of frame |
| — | Great Wall | `great_wall` | Badaling / Jinshanling / Mutianyu, CN | Ming, 15th–16th c. | Ridgeline, watchtowers, rebuilt vs "wild" sections. Geil 1909, PD |
| — | Nijō Castle | `nijo` | Kyoto, JP | 1603 | Sloped wall, moat, nightingale floors — a beat you hear. **Flag:** just past the chapter window |
| — | Gyeongbokgung | `gyeongbokgung` | Seoul, KR | 1395, rebuilt 1867 | Throne hall on double terrace, pond pavilion. **Flag:** colonial-era survey photography, check provenance |
| — | Foguang Temple East Hall | `foguang` | Shanxi, CN | AD 857 | Tang bracket-sets. **GATE 6 FLAG** — monastic use, statues in situ. Liang Sicheng drawings in copyright to c. 2042 |

- **Signature mechanic, to keep distinct:** the curved batter of the wall face, un-climbable by design.

### Chapter 9 — Africa & the Indian Ocean · `ch09_africa`

- **Dates:** AD 1000–1600
- **Costume:** unwanted safari outfit, tags still on.
- **Vocabulary:** drystone enclosure walls, coral-rag ruins, rock-hewn trenches, dune burial.
- **Status:** CANDIDATE. Thinnest imagery bench in the game.

| # | Site | Slug | Place | Period | Gate notes |
|---|---|---|---|---|---|
| — | Great Zimbabwe | `great_zimbabwe` | Masvingo, ZW | 11th–15th c. | Great Enclosure: drystone outer wall to about 11 m (9.6 m by one field guide), conical tower, Parallel Passage. Colonial misattribution (Mauch, Bent, Hall) is a documented error beat. Mauch 1871–74, Bent 1892, Hall 1902 and 1905, Randall-MacIver 1906, all PD; Randall-MacIver is the one whose text is also right. **Flag:** the revered locus is the Hill Complex on the kopje, with its caves, the Eastern Enclosure and the soapstone birds. Out of frame: build from walls, passage and tower (ruled 2026-09-23, section 4) |
| — | Gede / Gedi | `gede` | Kilifi, KE | 12th–17th c. | Coral-rag walls in forest, pillar tomb, palace. Imagery: Kirkman reports only |
| — | Kilwa Kisiwani | `kilwa_kisiwani` | TZ | 11th–16th c. | Husuni Kubwa palace terraces to the sea, Gereza fort. **Flag:** ruined mosque plus living Islam — use secular fabric |
| — | Loropéni | `loropeni` | BF | c. 11th–17th c. | Drystone laterite curtain walls to 6 m, one controlled entrance. Gate 6 clear |
| — | Songo Mnara | `songo_mnara` | TZ | 14th–16th c. | Palace and house blocks. Reserve |

- **Imagery:** Great Zimbabwe has public-domain plates and photographs from 1871 to 1906 (row above). No pre-1930 European imagery for Kilwa, Gede, Loropéni, Songo Mnara. Base on 20th-century excavation reports (Chittick, Kirkman, Pradines) and measured surveys. Budget reference art.

### Chapter 10 — Islamic Central Asia & al-Andalus · `ch10_islamic`

- **Dates:** AD 1200–1600
- **Costume:** bazaar robe with the price label still on.
- **Vocabulary:** iwan portals, citadel mounds, caravanserai courtyards, observatory arcs.
- **Status:** CANDIDATE. Build from ruins, citadels, palaces and observatories, never working mosques.

| # | Site | Slug | Place | Period | Gate notes |
|---|---|---|---|---|---|
| — | Registan & Ulugh Beg Observatory | `samarkand_registan` | Samarkand, UZ | madrasa 1417–20; observatory c. 1420–28 or 1424–29 (section 7) | Iwan portals, the two front minarets (both leaned; straightened 1932 and 1965, so any lean is the pre-1932 state and never today's), buried marble sextant trench rediscovered 1908. Turkestan Album 1871–72, PD. Madrasas now museums — gate 6 largely clear |
| — | Alhambra | `alhambra` | Granada, ES | 13th–14th c. | Alcazaba ramparts, Court of the Lions, Charles V palace inserted into the Nasrid fabric. Jones & Goury 1842–45, PD |
| — | Medina Azahara | `medina_azahara` | Córdoba, ES | AD 936–1010, sacked | Terraced palace platforms, anastylosis from fallen fragments. Velázquez Bosco photos from 1911, PD |
| — | Sultan Han | `sultan_han` | Aksaray, TR | Seljuk, 1229 | Blank walls, one carved portal, covered stable hall, raised kiosk-mosque |
| — | Arg-e Bam | `bam` | Kerman, IR | Sassanian–Safavid | Tiered mud-brick citadel, post-2003 reconstruction. **GATE 6 FLAG** — the 2003 earthquake killed at least 26,271 in the modern town. Citadel architecture only; ruling required |

### Chapter 11 — The Industrial Dawn · `ch11_industrial`

- **Dates:** 1700–1800
- **Costume:** frock coat and hard hat.
- **Vocabulary:** cast-iron spans, mill floors, engine houses on cliffs, canal locks, hoists.
- **Status:** CANDIDATE. This is the deliberately non-monumental chapter — vernacular, industrial and engineering only, no temples or palaces. Protect it in scheduling: it is the only chapter whose structures were built to be climbed on by workers, so its geometry is genuinely different rather than differently decorated.

| # | Site | Slug | Place | Period | Gate notes |
|---|---|---|---|---|---|
| — | The Iron Bridge | `iron_bridge` | Coalbrookdale, Shropshire, GB | 1777–1781 | First major cast-iron arch; early cracks and ground-movement repairs are a flaw beat. Rooker engraving 1782 (William Ellis after Michael Angelo Rooker), PD |
| — | Cromford Mill | `cromford` | Derbyshire, GB | 1771 | First water-powered cotton mill; leat, wheel, weir |
| — | Ditherington Flaxmill | `ditherington` | Shrewsbury, GB | 1797 | First iron-framed building; floor-to-floor climb, engine house, hoist |
| — | Cornish beam-engine house | `east_pool` | Cornwall, GB | late 18th c. | Bob wall, chimney, shaft head, cliff |
| — | Pontcysyllte Aqueduct | `pontcysyllte` | Wrexham, GB | 1795–1805 | Iron trough 38 m up, no railing on the towpath side. **Flag:** completed 1805, just past the chapter window |

### Chapter 12 — Napoleonic Wars · `ch12_napoleonic`

- **Dates:** 1796–1815
- **Costume:** bicorne hat, hand thrust into the jacket.
- **Vocabulary:** rigging and stacked gun decks, bastion ditches, tower rooftops, mountain road galleries, semaphore masts.
- **Status:** CANDIDATE. **Build from ships, forts, roads, arsenals, canals, telegraphs and commemorative architecture. Never battlefields — battlefields are graves.**

| # | Site | Slug | Place | Period | Gate notes |
|---|---|---|---|---|---|
| — | Martello Towers | `martello_towers` | Kent & Sussex, GB | 74 towers, 1805–08; some finished c. 1810 | Battered drum of brick under a smooth render, one 24-pounder on a rooftop traversing carriage (the east-coast towers had three pieces), first-floor door reached only by removable ladder, dry moat on some (the Wish Tower has one; Tower 24 has none recorded). Turner, *Martello Towers near Bexhill* (c. 1808 and 1811), PD. Board of Ordnance manuscript plans may be Crown copyright, not PD: check before use. Gate 6 clear |
| — | Simplon Pass military road | `simplon_pass` | Brig CH – Domodossola IT | 1801–1805 | Terraced hairpins, rock galleries, arched bridges, modern tarmac over the line. Lory *Voyage pittoresque* 1811, PD. Gate 6 clear |
| — | Neuf-Brisach | `neuf_brisach` | Alsace, FR | Vauban 1698–1703, active through the wars | Concentric bastions, ravelins, dry ditches, town gates. Vauban plans and plan-relief. Gate 6 clear |
| — | Chappe semaphore tower | `chappe_saverne` | Saverne, Alsace, FR | line opened 1798, ran to 1852 | Rooftop mast with two coded arms, sighting telescope, counterweight gear. Figuier c. 1867 engraving, PD. **Flag:** the standing structure is a faithful 1968 reconstruction — an authenticity note, not a gate 6 issue |
| — | HMS Victory | `hms_victory` | Portsmouth, GB | launched 1765, Trafalgar 1805 | Three stacked gun decks, rigging, stern galleries; dry-dock props are the modern intrusion. 1765 Admiralty draughts, PD. **GATE 6 FLAG** — still a commissioned ship and carries a plaque marking where Nelson fell; ruling required |

- **Reserves, higher gate 6 risk:** Rock of Gibraltar siege galleries (active base, war graves), Lines of Torres Vedras (built as a battle line), Chatham Dockyard, prison hulks and depots.

---

## 4. Open rulings

Production must not begin on a flagged site until the designer rules. Each ruling
is recorded here, not in the level.

| Site | Chapter | Issue | Recommendation |
|---|---|---|---|
| `pompeii` | 5 | Body casts are graves of a mass-casualty event | Architecture only; casts never in frame |
| `angkor_wat` | 7 | Active Buddhist temple, resident monks | Outer galleries, moat and causeway only, or substitute Ta Prohm / Beng Mealea |
| `borobudur` | 7 | Active pilgrimage site | Frame as ruined-restored monument |
| `chand_baori` | 7 | Adjoining temple is a functioning shrine | Build in the stepwell only |
| `foguang` | 8 | Monastic use, statues in situ | Substitute a museum-managed timber hall if refused |
| `kilwa_kisiwani`, `gede`, `songo_mnara` | 9 | Ruined mosques; living Islam on the coast | Secular palace, fort and house fabric only |
| `bam` | 10 | 2003 earthquake killed at least 26,271 in the modern town | Citadel architecture only |
| `hms_victory` | 12 | Commissioned warship; Nelson-death plaque | Ruling required before scheduling |
| `phaistos` (engine) | 3 | Pillar 1: a floor that drops with the tourist standing on it never counts as a fall today (every landing resets the fall, and riding a falling solid counts nothing), so a collapse could carry him down five storeys and he would walk away. Knossos does not need it; Phaistos and Akrotiri, where falling floors are the verb, will | Judge the fall when a falling floor stops, so the 200 px rule holds everywhere. The engine reading says no built level's outcome changes; confirm with the walk-throughs. Rule before Phaistos is built |

### Ruled

Rulings the designer has made, moved out of the table above. A ruling binds every
use of the site: levels, asset notes, and the tour map.

| Site | Chapter | Issue | Ruling | Date |
|---|---|---|---|---|
| `great_zimbabwe` | 9 | A revered locus on site | Walls, passage and tower only, as recommended. First applied to the chapter 9 vignette on the tour map; the revered locus stays out of frame there and in any level | 2026-09-23 |
| `tikal` | 6 | Contemporary Maya ceremonies are held at the site, in the Great Plaza (found in re-verification, 2026-09-23) | Architecture only: no ceremony, modern altar, fire circle, offerings or people in frame, in the tour-map vignette or in any level | 2026-09-24 |
| `akrotiri` | 3 | In September 2005 the site's protective roof collapsed shortly before it was finished, killing one visitor, a British tourist, and injuring six or seven (sources differ); the site reopened under a new roof in April 2012. The chapter's signature mechanic is the multi-storey collapse, and the protagonist is a tourist. Spyridon Marinatos, the excavator, died at the site in 1974; sources differ on whether his grave is inside the ruins or was moved beyond them | No crush deaths at Akrotiri. Collapse there comes only from the Bronze Age earthquakes and the eruption; the modern roof never falls and the 2005 death is never staged. Marinatos's grave never in frame; verify its position before level 3 is designed | 2026-09-23 |
| chapter 3 | 3 | A charging bull is the obvious gag for a bull-leaper's costume, repeats Karnak's scarab, and makes a myth-shaped spectacle of the place | No bull anywhere in the chapter: no bull, no bull relief or copy, no horns of consecration, no Bull-Leaper fresco copy, no oxhide figure-of-eight shields in frame | 2026-09-23 |
| chapter 3 | 3 | Grave circles and tholos tombs at Mycenae | Graves are never traps, as the burial at Cap Blanc | 2026-09-23 |
| `knossos` | 3 | Landing in front of the throne seats the tourist in it and ends his visit: a death with no physical cause (pillar 8) | Allowed, once in the whole game, with its own frame, sound and label, never those of giving up. Recorded in `PILLARS.md`, pillar 8 | 2026-09-24 |

---

## 5. Vocabulary collisions

These risk feeling identical across sixty levels. Each has an assigned minimum
differentiator, which is binding on level design.

| Collision | Chapters | Differentiator |
|---|---|---|
| Ceremonial and roof stairs | 2, 3 | Aegean signature is the light well and multi-storey collapse; stairs are incidental there |
| Column tops | 2, 3 | Egypt stands on them (the Kiosk at Philae, the Hypostyle at Karnak). Aegean columns hold floors up and are never floors |
| Light as a mechanic | 1, 2, 3 | Chapter 1 = light the tourist carries, museum lamps and raking sun; Egypt = light on a schedule, the sweeping beam, the spotlight that marks what falls; Aegean = light from directly above through a light well, the one place nothing is overhead |
| Massive defensive walls | 3, 4, 8 | Aegean = gallery *inside* the wall's thickness; Persia = ramp *against* the wall (so the Tiryns entrance ramp is incidental); East Asia = un-climbable curved batter of the face |
| A long stone gallery with chambers off it, as a chapter's finale | 2, 3 | Saqqara (the Serapeum) and Tiryns (the casemate galleries) are both fifth levels. No differentiator yet: decide it before either is designed, knowing each constrains the other |
| Terraces | 6, 7 | Americas = ballcourt slope and solar event; Monsoon Asia = moat crossing and *descending* stepwell |

---

## 6. Imagery risk

| Chapter | Status | Base if public domain is unavailable |
|---|---|---|
| 1 | Thin — caves sealed, photography in copyright | Excavation reports; Cartailhac & Breuil 1906 via US-hosted scans only |
| 2 | Strong | — |
| 3 | Mixed — Schliemann clear, Akrotiri has nothing | Marinatos 1968–76; Doumas 1992 |
| 4, 5 | Strong | — |
| 6 | Uneven | Catherwood, Maudslay, Maler, Squier where they reach |
| 7 | Partial | Archaeological Survey of India reports for Chand Baori; for Sigiriya, the Archaeological Survey of Ceylon (H.C.P. Bell's Annual Reports, from the 1890s), then Sri Lanka's Department of Archaeology and the Central Cultural Fund (Cultural Triangle, 1980s) |
| 8 | Partial | Liang Sicheng 1930s drawings are in copyright to c. 2042 |
| 9 | Weakest in the game for the coastal and Sahel sites; Great Zimbabwe is well covered (Mauch, Bent, Hall, Randall-MacIver, 1871–1906) | Chittick, Kirkman, Pradines excavation reports; commission reference art |
| 10, 11, 12 | Strong | — |

The public-domain criterion silently biases the arc toward places nineteenth-century
Europeans drew and photographed. Chapters 6, 7, 8 and 9 exist to resist that, and
must not be cut first on imagery grounds alone.

---

## 7. Contested facts

Keep these as live disputes in the asset notes, never as settled, and never in a level.

- Mask of Agamemnon: genuine Mycenaean but misnamed and misdated by three-plus centuries. The forgery claim is fringe. The "gazed upon the face of Agamemnon" quotation is apocryphal.
- Knossos: keep straight what is original (throne stone, column bases, floors, plan, many ground-floor walls) and what is reconstituted (upper walls and storeys, ceilings, column shafts and capitals, every painted wall, which are replicas, and most colour). No Minoan column shaft survives: the downward taper and the red-and-black colours are Evans's reading of frescoes, seals, bases and the Mycenaean stone columns. (Corrected 2026-09-24: "column form" was listed as original.)
- Knossos Throne Room: its date (the painting at the start of LM II by Galanakis et al.; others argue Neopalatial) and whose seat it was (Evans's king; a priestess or an enthroned goddess, Reusch 1958, Niemeier 1986). Open.
- Knossos: bull-leaping in the Central Court (Evans; Graham 1957) against Younger (1995) and others. Doubtful. Out of the chapter by ruling in any case.
- Knossos tourist myths to keep out of every note: columns as upside-down cypress trunks "so they would not sprout", or as earthquake shock absorbers; "the oldest throne in Europe"; "the first flushing toilet".
- Minoan matriarchy and peaceful thalassocracy: over-claimed popular readings; qualify.
- Thera eruption date: c. 1600 BC radiocarbon versus a later Egyptian-synchronism chronology. Open.
- Knossos Linear B tablet date: the Palmer–Boardman dispute. Unresolved.
- Gargas missing fingers: frostbite, amputation and folded-finger hypotheses all live. Ritual amputation must not be stated as fact.
- Pech Merle spotted horses: the 2011 leopard-complex allele finding is contested on dating grounds.
- Phaistos Disc: undeciphered; a minority hoax claim exists.
- Gargas hands: the colour counts differ (143 black, 80 red, 2 bistre, 5 ochre, 1 white of 231, against more than 100 black, 85 red, 4 white, 1 ochre) but both put black in the majority; the black is manganese in most sources, charcoal in one. How many hands are incomplete: 114, 144, or "almost never complete". The commonest pattern is all four fingers short with the thumb whole (55 of the 112 Leroi-Gourhan characterised), and every incomplete hand keeps its thumb; that the fourth and fifth fingers are the ones most often short is a weaker popular claim.
- Abu Simbel relocation figures: 64 m higher and 180 m inland (UNESCO), 65 m and 200 m (common), more than 60 m (Britannica). Facade 30 × 35 m or about 33 × 38 m; colossi 20–22 m. Whether the move shifted the sun days by one, and which way: UNESCO says the temple was rebuilt in the same orientation; the illumination is a window of days, not one day. When and why the second colossus fell: soon after completion, or 27 BC, probably an earthquake; say "in antiquity". Which family figure stands at which colossus: the secondary summaries conflict.
- Persepolis: Apadana column height (from about 16.5 m to 25 m in the sources) and capital height (5.8 m or about 8 m); when the fourteenth column was re-erected (1965 or the 1970s); the animal on the east portico's capitals (double lions, or Schmidt's unspecified "addorsed animals").
- Segesta temple: whether a cella was ever intended (Mertens's cella trenches against a roofless colonnade built on purpose round an open-air cult place); why work stopped; its deity. Exclude the popular story that it was a sham built to fool the Athenian envoys (Thucydides 6.46 has them fooled with borrowed silver).
- Sigiriya: what the rock is (magma plug, granite, red gneiss, a residual hill); its height (about 180 m or nearly 200 m); what the lion above the paws looked like (a reconstruction; nothing above the paws survives).
- Himeji: the Akamatsu founding of 1333/1346 rests on later chronicles; the Meiji sale for 23 yen 50 sen; the unexploded bomb of 1945. Whether the curve of the stone face is defensive or structural.
- Great Zimbabwe: whether the conical tower or the outer wall beside it is the higher; what the tower was for; whether the Hill, Great Enclosure and Valley were built in sequence or overlapping.
- Registan: the observatory's dates (c. 1420–28, or 1424–29); when the minarets fell or lost their tops; whether the second front minaret was straightened in 1965 or reinforced in 1966–67.
- Martello towers: 74 or 75 on the south coast; height and diameter (about 10 m high and 13 m across the foot by Historic England, 40 × 40 ft by an older local source); whether the name is from Mortella Point or from a hammer.
- Fringe claims to exclude entirely: the Dendera "light", Serapeum precision-machining, and every foreign-builder attribution of Great Zimbabwe, before, by and after Bent: Mauch 1871 (Sheba), Bent 1892 (Phoenicians or Arabs), Hall 1902–05 (Phoenicians or Sabaeans), and the Rhodesian-era guidebooks that repeated them. Randall-MacIver (1906) and Caton-Thompson (1931) are the correction. The misattribution may appear only as a documented error, never as a possibility.

---

## 8. Scope

Twelve chapters of five levels is sixty levels, roughly forty-five minutes of clean
play. The recommended build order is Chapters 1 and 2 to finished quality before
any Chapter 4-and-beyond production begins. Chapter 11 and the Chapter 3 error
dossier are the two assets most likely to be cut for budget and the two least
replaceable.
