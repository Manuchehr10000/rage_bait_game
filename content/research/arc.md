# Lost Tourist — Historical Arc

Canonical reference for the game's chapter and level structure. This file is the
single source of truth for site identity, period, costume and status. It does not
contain level design; beats are decided one at a time in design conversation and
live in each level's own asset notes.

Last revised: 2026-09-23. Great Zimbabwe ruled: walls, passage and tower only (section 4). 2026-09-15: curator mode dropped by designer ruling; facts that cannot be shown without text live in the asset notes and nowhere in the game.

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

- **Dates:** 27,000–13,000 BP
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

- **Level 1 teaches:** columns taper downward; light means safe; the palace is partly a Victorian idea.
- **Level 5 ends on:** an 8 m cyclopean wall entered through a corbelled gallery inside its own thickness.
- **Signature mechanic, to keep distinct from Egypt:** the light well and the multi-storey collapse, not the staircase. Stairs are incidental here.
- **Chapter error dossier:** Evans's reinforced-concrete reconstitution at Knossos (wood to c. 1905, iron to c. 1913, ferro-concrete 1922–1930; architects Fyfe, Doll, de Jong). Gilliéron père and fils fresco restorations — the Priest-King assembled from three non-contiguous fragments with no face preserved; the Saffron Gatherer restored as a boy and later re-restored as a blue monkey; the Ladies in Blue largely modern paint. Lapatin's forgery case against the Boston "Snake Goddess". Evans's Early/Middle/Late Minoan scheme versus Platon's palace periods. Schliemann's naming of the Mask of Agamemnon (genuine but misnamed and misdated by three centuries; the forgery claim is fringe; the "gazed upon the face" quotation is apocryphal).
- **Imagery:** Schliemann 1878 and 1886 are public domain worldwide. Evans's *Palace of Minos* is EU public domain from 2012 and US public domain for the pre-1930 volumes. Akrotiri has no public-domain imagery at all; base on Marinatos 1968–76 and Doumas 1992.
- **Reserves, notes only:** Pylos (`pylos`), Gournia, Malia, Zakros, Ayia Triada. All fail gate 1 on profile — standing fabric is knee to waist height.
- **Gate 6:** clear.

### Chapter 4 — Iron Age Near East & Persia · `ch04_persia`

- **Dates:** 900–330 BC
- **Costume:** false Assyrian beard, curled and clipped on.
- **Vocabulary:** palace terraces, siege ramps against walls, rock-cut cliff reliefs, aqueduct channels.
- **Status:** CANDIDATE

| # | Site | Slug | Place | Period | Gate notes |
|---|---|---|---|---|---|
| — | Persepolis | `persepolis` | Fars, IR | c. 518–330 BC | Apadana double stairway, columns, terrace. Flandin & Coste 1851, PD |
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
| — | Segesta / Taormina | `segesta` | Sicily, IT | Greek | Temple or theatre on a height. Grand Tour engravings, PD |
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
| — | Tikal | `tikal` | Petén, GT | c. AD 200–900 | Steep temple stairs, roof-combs. Maudslay, Maler, PD |
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
| — | Sigiriya | `sigiriya` | LK | c. AD 477–495 | Rock plug, lion's-paw gate, mirror wall. Gate 6 clear |
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
| — | Himeji Castle | `himeji` | Hyōgo, JP | present form 1601–09 | Keep on fitted-stone base; the concave batter that throws a climber's weight back; doubling-back maze approach |
| — | Great Wall | `great_wall` | Badaling / Jinshanling / Mutianyu, CN | Ming, 15th–16th c. | Ridgeline, watchtowers, rebuilt vs "wild" sections. Geil 1909, PD |
| — | Nijō Castle | `nijo` | Kyoto, JP | 1603 | Sloped wall, moat, nightingale floors — a beat you hear |
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
| — | Great Zimbabwe | `great_zimbabwe` | Masvingo, ZW | 11th–15th c. | Hill Complex on kopje, 11 m drystone wall, conical tower. Colonial misattribution (Bent, Hall) is a documented error beat. Bent 1892, PD. **Flag:** a revered locus on site — build from walls and tower (ruled 2026-09-23, section 4) |
| — | Gede / Gedi | `gede` | Kilifi, KE | 12th–17th c. | Coral-rag walls in forest, pillar tomb, palace. Imagery: Kirkman reports only |
| — | Kilwa Kisiwani | `kilwa_kisiwani` | TZ | 11th–16th c. | Husuni Kubwa palace terraces to the sea, Gereza fort. **Flag:** ruined mosque plus living Islam — use secular fabric |
| — | Loropéni | `loropeni` | BF | c. 11th–17th c. | Drystone laterite curtain walls to 6 m, one controlled entrance. Gate 6 clear |
| — | Songo Mnara | `songo_mnara` | TZ | 14th–16th c. | Palace and house blocks. Reserve |

- **Imagery:** no pre-1930 European imagery for Kilwa, Gede, Loropéni, Songo Mnara. Base on 20th-century excavation reports (Chittick, Kirkman, Pradines) and measured surveys. Budget reference art.

### Chapter 10 — Islamic Central Asia & al-Andalus · `ch10_islamic`

- **Dates:** AD 1200–1600
- **Costume:** bazaar robe with the price label still on.
- **Vocabulary:** iwan portals, citadel mounds, caravanserai courtyards, observatory arcs.
- **Status:** CANDIDATE. Build from ruins, citadels, palaces and observatories, never working mosques.

| # | Site | Slug | Place | Period | Gate notes |
|---|---|---|---|---|---|
| — | Registan & Ulugh Beg Observatory | `samarkand_registan` | Samarkand, UZ | madrasa 1417–20; observatory c. 1420–28 | Iwan portals, leaning minaret, buried marble sextant trench rediscovered 1908. Turkestan Album 1871–72, PD. Madrasas now museums — gate 6 largely clear |
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
| — | The Iron Bridge | `iron_bridge` | Coalbrookdale, Shropshire, GB | 1777–1781 | First major cast-iron arch; early cracks and ground-movement repairs are a flaw beat. Rooker engraving 1782, PD |
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
| — | Martello Towers | `martello_towers` | Kent & Sussex, GB | 74 towers, 1805–08 | Battered drum, rooftop traversing gun, first-floor door reached only by removable ladder, dry moat. Board of Ordnance plans, PD. Gate 6 clear |
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
| `akrotiri` | 3 | In September 2005 the site's protective roof collapsed shortly before it was finished, killing one visitor and injuring seven; the site reopened under a new roof in April 2012. The chapter's signature mechanic is the multi-storey collapse, and the protagonist is a tourist. Spyridon Marinatos, the excavator, died at the site in 1974; sources differ on whether his grave is inside the ruins or was moved beyond them | Collapse at Akrotiri comes only from the Bronze Age earthquakes and the eruption; the modern roof never falls and the 2005 death is never staged. Marinatos's grave never in frame. Verify its position before level 3 is designed |

### Ruled

Rulings the designer has made, moved out of the table above. A ruling binds every
use of the site: levels, asset notes, and the tour map.

| Site | Chapter | Issue | Ruling | Date |
|---|---|---|---|---|
| `great_zimbabwe` | 9 | A revered locus on site | Walls, passage and tower only, as recommended. First applied to the chapter 9 vignette on the tour map; the revered locus stays out of frame there and in any level | 2026-09-23 |

---

## 5. Vocabulary collisions

Three pairs risk feeling identical across sixty levels. Each has an assigned
minimum differentiator, which is binding on level design.

| Collision | Chapters | Differentiator |
|---|---|---|
| Ceremonial and roof stairs | 2, 3 | Aegean signature is the light well and multi-storey collapse; stairs are incidental there |
| Massive defensive walls | 3, 4, 8 | Aegean = gallery *inside* the wall's thickness; Persia = ramp *against* the wall; East Asia = un-climbable curved batter of the face |
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
| 7 | Partial | Archaeological Survey of India reports for Chand Baori and Sigiriya |
| 8 | Partial | Liang Sicheng 1930s drawings are in copyright to c. 2042 |
| 9 | Weakest in the game | Chittick, Kirkman, Pradines excavation reports; commission reference art |
| 10, 11, 12 | Strong | — |

The public-domain criterion silently biases the arc toward places nineteenth-century
Europeans drew and photographed. Chapters 6, 7, 8 and 9 exist to resist that, and
must not be cut first on imagery grounds alone.

---

## 7. Contested facts

Keep these as live disputes in the asset notes, never as settled, and never in a level.

- Mask of Agamemnon: genuine Mycenaean but misnamed and misdated by three-plus centuries. The forgery claim is fringe. The "gazed upon the face of Agamemnon" quotation is apocryphal.
- Knossos: keep straight what is original (throne stone, column form, plan) and what is reconstituted (walls, ceilings, most colour).
- Minoan matriarchy and peaceful thalassocracy: over-claimed popular readings; qualify.
- Thera eruption date: c. 1600 BC radiocarbon versus a later Egyptian-synchronism chronology. Open.
- Knossos Linear B tablet date: the Palmer–Boardman dispute. Unresolved.
- Gargas missing fingers: frostbite, amputation and folded-finger hypotheses all live. Ritual amputation must not be stated as fact.
- Pech Merle spotted horses: the 2011 leopard-complex allele finding is contested on dating grounds.
- Phaistos Disc: undeciphered; a minority hoax claim exists.
- Fringe claims to exclude entirely: the Dendera "light", Serapeum precision-machining, and any pre-Bent attribution of Great Zimbabwe to Phoenicians or Sheba.

---

## 8. Scope

Twelve chapters of five levels is sixty levels, roughly forty-five minutes of clean
play. The recommended build order is Chapters 1 and 2 to finished quality before
any Chapter 4-and-beyond production begins. Chapter 11 and the Chapter 3 error
dossier are the two assets most likely to be cut for budget and the two least
replaceable.
