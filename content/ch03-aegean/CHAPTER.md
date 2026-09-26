# Chapter 3 · Bronze Age Aegean

Source: `content/research/arc.md`, chapter 3. Dates 1900 to 1200 BC. Runs Crete to
mainland, Minoan giving way to Mycenaean. Status: locked in the research. Levels 1 and 2 are
designed; level 1 is built, rough, drawn by code.

| Level | Site | Place | Period | Designed | Built |
|---|---|---|---|---|---|
| 1 | Knossos | Kephala hill, Heraklion, Crete | Palaces c. 1900–1350 BC | yes | rough |
| 2 | Phaistos | Messara plain, south Crete | Old Palace c. 1900 BC; New c. 1700–1450 BC | yes | not yet |
| 3 | Akrotiri | Thera (Santorini) | Buried by eruption, late 17th c. BC | not yet | not yet |
| 4 | Mycenae | Argolid | Peak c. 1350–1200 BC | not yet | not yet |
| 5 | Tiryns | Argolid | Circuit and palace c. 1400–1200 BC | not yet | not yet |

- **Costume:** bull-leaper kit, badly tied and slipping.
- **Vocabulary:** light wells, multi-storey interiors and stairs, corbelled domes and
  galleries, cyclopean gates.
- **Level 1 teaches:** columns hold floors up, and taper downward; light from above means
  nothing is overhead; the palace is partly Evans's idea, cast in 1920s concrete.
- **Level 5 ends on:** a cyclopean wall entered through a corbelled gallery inside its own
  thickness.

## The spine: what holds the floor up

Every level of the chapter answers one question, and each answers it differently. It runs
from the most rebuilt site in the chapter to the most original.

> Knossos: Evans does. The fake parts hold.
> Phaistos: nobody does.
> Akrotiri: the ash did.
> Mycenae: weight does.
> Tiryns: the Cyclopes, said the Greeks.

Knossos is almost entirely standing on Evans's concrete; Phaistos was dug and left as it was
found; Akrotiri stood two and three storeys high for three and a half thousand years because
volcanic ash filled it, and the excavation took the ash away; a corbelled Mycenaean stone stays
up because of the load on its back; the walls of Tiryns are so large that later Greeks said
giants built them, and nobody has ever had to rebuild them.

## The signature, and its rules

Egypt owns the staircase. The Aegean's signature is **the light well and the multi-storey
collapse** (`arc.md`, section 5).

- **Light comes from directly above.** A light well is a shaft open to the sky through every
  storey, so a lit patch is the one place nothing is overhead, and **nothing ever comes down
  on a lit patch.** Chapter 1's light was carried by the tourist or raked in low from the
  side; Egypt's arrived on a schedule, swept, and at Karnak marked what would fall. This
  chapter's light says something about the building. Because of pillar 5 it is where a jump
  may land, never where you shelter and wait.
- **Storeys are five tiles:** 80 px floor to floor, a slab a tile thick, 64 px clear. Under any
  roof a full jump is cut to about 48 px of rise. The ceiling on his head is how the dark says
  there is a floor above; the light well is the one place a jump is full. Identical in every
  level of the chapter, because the storey is the thing the player counts.
- **The storey count.** With `PHYS.fatalFall` at 200 px, measured from the top of the arc:
  walk off one storey (about 75 px) or two (about 155) and he walks away; walk off three (about
  235) and he dies; jump off one (about 142) and he lives, jump off two (about 222) and he dies.
  A jump costs a storey. **Knossos does not teach the lethal count:** there, one storey is
  nothing and every landing in the light is safe. The count is taught at Phaistos.
- **Columns hold floors up and are never floors.** Standing on column tops is Egypt's (the
  Kiosk at Philae, the Hypostyle at Karnak).
- **Stairs are incidental:** walked, never the trap.

## Level 1 · Knossos

Designed; see `l01-knossos/LEVEL.md`. The mechanic under its line is **wood gives way; stone
and concrete hold**: every column that lies is timber — once the burnt Minoan original, once
Fyfe's first attempt of 1901 — and every one of Evans's later columns holds. What fails is fire
and weather, never Minoan building. Its pattern, taught on purpose so a later level can break
it: **the column that lies stands right beside the light.** Land in the light; never stop next
to it. It has two crushes (a burnt span in the storerooms, a timber span in the Grand
Staircase), the game's one death with no physical cause (the tourist lands in front of the
throne and is sitting in it), and the game's first trap on a cycle (the folding doors of the
Hall of the Double Axes). About 25 seconds clean; built rough, the knowing run is 27.3 s, 1.85
s of it standing at the doors (`tests/knossos.spec.ts`).

## Level 2 · Phaistos

Designed; see `l02-phaistos/LEVEL.md`.

> Phaistos: nothing falls on you. You fall.

Knossos killed from above and the light caught every landing. At Phaistos nothing is overhead
but five 1960s metal shelters, which hold up only a roof and never fall, and every death is a
fall onto the older palace underneath, so every death in it has one noun on the museum label:
**The Old Palace.** It turns each Knossos lesson round:

- **The count.** Knossos: one storey is nothing. Phaistos: walk off two storeys and live, jump
  off two and die. It is taught by a pair of identical edges at the top of the level, where the
  camera stops rising: the first, one storey down, with its ground in sight; the second, two
  storeys down, with its ground out of sight. The rule it leaves: **if you can see the bottom
  you may jump; if you cannot, walk.**
- **Look down.** Knossos's danger was over his head. Phaistos draws the ground in section, and
  the Old Palace shows under the New Palace floor: stone walls, rooms sealed with a rock-hard
  mass, rooms the excavator dug hollow. **The old walls under the floor hold it up**, as the
  columns over it did at Knossos; over a hollow the floor tips.
- **Wait at the door.** Knossos's doors taught him never to stand at a door. At Phaistos only
  the doors' bases survive, and the finale asks him to stop on one while the light well in
  front of him goes down three storeys, then to walk, never jump, onto what is left.

About 24 seconds clean. The Phaistos Disc stays out of the level: it is writing, and it is in
Heraklion. The level does not depend on the open ruling about floors that carry him down:
its floors tip and he falls free.

## What Akrotiri has to break

Level 3 makes everything untrustworthy. Notes so that conversation starts from what the first
two levels leave it:

- **Two readable tells, both honest so far.** Knossos's light from above (nothing overhead),
  Phaistos's section (the old walls below hold). Akrotiri may make either lie.
- **The pattern still unbroken:** at Knossos the column that lies stands beside the light.
- **"If you cannot see the bottom, walk"** has never failed a player. Akrotiri may make it.
- **Its verb cannot be the crush** (ruling), and the seat is spent. Floors that carry him down
  are the obvious verb for a town held up by ash, so the open pillar-1 ruling on floors that
  drop with him (`arc.md`, section 4) has to be settled before it is built.
- **The ash did it.** The houses stood two and three storeys high because the ash filled them;
  the excavation took the ash away. The casts of beds and tables poured into the voids the
  wood left in the ash are the real objects.
- **Everybody left in time.** No bodies were found; the locals were, as always, competent.
- **The daylight through a door or a window** is still held in reserve. Akrotiri's houses have
  windows; the chapter has never used light from the side, and chapter 1's raking sun is the
  collision to avoid.
- **Under one roof.** Akrotiri is the only site in the chapter visited wholly under a modern
  shelter, which never falls. Whether any daylight reaches the floor through it is not checked.

## Rulings

Designer's rulings, recorded in `arc.md` section 4 as well:

- **No bull anywhere in the chapter.** No charging bull, no bull relief or copy of one, no
  horns of consecration, no Bull-Leaper fresco copy, no oxhide figure-of-eight shields in frame.
  It would repeat Karnak's scarab and make a myth-shaped spectacle of the place. Level 6,
  the legend, is exempt: the Minotaur is allowed there, and the chapter's refusal of the
  bull is its setup (ruled 2026-09-26, `arc.md` section 4).
- **Graves are never traps**, as at Cap Blanc. Applies at Mycenae above all.
- **No crush deaths at Akrotiri**, and the modern shelter there never falls. See Gate 6.
- **No modern shelter ever falls, anywhere in the chapter.** Phaistos has five from the 1960s,
  due for replacement; a falling one would restage Akrotiri's 2005 death a level early.
- **The throne seat is spent once in the whole game**, at Knossos (`PILLARS.md`, pillar 8).
- **The Tiryns entrance ramp is incidental**: a ramp against a wall is Persia's.
- The chapter's fifth level and Egypt's fifth are both at risk of ending in a long stone gallery
  with chambers off it (the Tiryns casemates, the Serapeum). Decide Tiryns knowing it constrains
  Saqqara (`arc.md`, section 5).

## The tone

Deadpan and mean. The world lies; the controls never do. Every death looks like what caused
it and nothing reacts. There is no text inside a level. The full rules are in `PILLARS.md` at
the repository root; read them before drawing a trap.

## The tourist

Research: bull-leaper kit, badly tied and slipping. Not designed or drawn yet; that is its own
conversation. What is fixed already: it goes over modern clothes like every other costume, it
never changes the hitbox, nobody ever mentions it, and the slipping is cosmetic. There is no
bull anywhere in the chapter, so he is dressed for something that never happens. Besides the
four living frames and the dead one it needs a seated frame (for giving up) and, for Knossos
only, a frame at rest in the throne, facing out, never triumphant, which is never the seated
one.

## What "accurate" means here

- The **palaces are drawn as they stand today**, and at Knossos that means Evans's
  reconstitution drawn as what it is: concrete, painted where he painted it to look like wood
  or Minoan colour, standing on the original floors, bases and lower walls. The asset note for
  every piece says which is which.
- The **frescoes on the walls are replicas**, as they are on site; the originals are in the
  Heraklion Museum. A replica is drawn as the replica, with the restorers' inventions in it and
  the note saying which.
- **Modern intrusions** are exact: Evans's bust, the barriers, the turnstile, the shelters.
- Every asset note separates **must be right** from **deliberately wrong**. There is no third
  category.

## The sound

The chapter is scored for one plucked lyre with seven strings, played by somebody who can
play. The tune, the tuning and the hand are the same at all five sites, from Knossos to
Tiryns. The only thing a site changes is the room, and the room is the place as a visitor
stands in it today. There is no percussion anywhere in it. No level of the chapter exists
yet; the music does, and each level takes it as it is built.

**Must be right.**

- **The instrument.** The lyre is pictured on both sides of the chapter's handover. On
  Crete, on the libation side of the Hagia Triada sarcophagus (painted limestone, 14th
  century BC, from Hagia Triada, a few kilometres west of Phaistos and dug by the same
  Italian mission), a robed man plays one whose strings are reported as seven. On the
  mainland, on the throne-room wall of the palace at Pylos (13th century BC; Pylos is a
  reserve site), a seated man plays one with five, as the fresco is restored. A Linear B
  tablet from Thebes, TH Av 106, names two lyre-players, *ru-ra-ta-e*. The word is at
  Thebes, not at Pylos.
- **Seven is reported, not yet checked.** Every source reached gives seven for Hagia
  Triada, but nobody on this project has counted them on the painting. Check against the
  plates in Younger, *Music in the Aegean Bronze Age* (1998), before any painted asset shows
  a lyre. If the count is not seven, the lyre, the score and the tests all change.
- **Never "the earliest".** Hagia Triada is often called the earliest lyre in Greece. It
  is not: at Akrotiri, before the eruption, a blue monkey in the Xeste 3 frieze plays a
  small lyre (Rehak 1999). Nothing in the game or the notes says earliest.
- **Plucked, never bowed.** The first mention of a bowed lyra is from the 9th century AD,
  Ibn Khurradadhbih on the Byzantines. The modern Cretan lyra is bowed and descends from
  that one. It is a different instrument, and hearing it here would be wrong by more than
  two thousand years.
- **One lyre for Crete and the Argolid.** The same instrument is pictured on both, and
  nothing shows that either tuned or played it differently. So the music does not change
  when the chapter crosses to the mainland: no bright "peaceful Minoans" (arc.md says to
  qualify that reading), no martial Mycenaeans. This is a refusal to claim a difference,
  not a claim of sameness.
- **Nothing reacts.** The room is set when a level loads and never changes inside one.
  Every pluck is the same strength. The finale gets no special music; the lyre does not
  know it is the end (pillar 8).
- **The room is the place as visited, and reverb is physics.** Where each level is heard
  is in the table below, with the reason for each.

**Deliberately wrong.**

- It is a synthesised lyre, not a recording of a replica. Nothing in this game is a file.
- **The tuning is borrowed, and says so.** No Aegean tuning, scale, notation or melody
  survives. Linear A is undeciphered, and Linear B's only securely identified musical word
  is *ru-ra-ta-e*. The only tuning system written down anywhere in these centuries is in
  the Old Babylonian texts from Ur: UET VII 74, published by Gurney in 1968, gives seven
  tunings for a nine-stringed instrument, the *sammû*, and how to move from each to the
  next by changing one string. Wulstan, Gurney and Kilmer read the tunings as diatonic;
  Rahn (2022) rebuilds that reading and defends it with qualifications; others find it
  too familiar to trust. Whether the *sammû* was a lyre or a harp is argued. So the lyre
  is tuned to seven adjacent steps of a diatonic collection, D E F G A B♭ C, home on the
  lowest string. The notes call this the neighbours' documented kind of tuning, never "the
  Minoan tuning", and give it no Babylonian, Greek or church-mode name. Aegean contact with
  the Levant is documented; the travel of music along it is not.
- Equal temperament, a modern convenience.
- Each string sounds one pitch. A lyre has no fingerboard, which is construction. That
  the left hand never stops a string short or pushes it sharp is a choice: how Aegean
  players used the left hand is not known. The only movement in pitch is the few cents a
  plucked string settles by as its swing dies.
- The tune was written in 2026: its home on the lowest string, its pulse of 0.74 s, its
  five phrases of uneven length (A B C A' D, 42.18 s), and the repeat.
- Solo and wordless. In the pictures the lyre plays in rites and processions. Playing it
  alone and without a voice is forced by pillar 2 and is not a claim that anybody did.
- The fingertip. Whether players used fingers or a plectrum is not known. A soft attack
  is chosen everywhere, because a bright pick on a plucked line is the bouzouki.
- Chosen, not measured: the register, D3 to C4, set under the jump and under every other
  melody in the game; the decay times; the soundbox; where the string is plucked. No
  measurement of any lyre, ancient or replica, was found, and the string material is
  unknown.
- The left hand's rule is the game's and not a documented technique. It stops a string
  when one a step, a tritone or a seventh away is plucked; it lets thirds, fourths, fifths
  and sixths ring; it never lets three strings sound; and twice a loop it lies across the
  strings at a phrase end, so that what is left is the room.
- **One 14th-century picture supplies the instrument for palaces begun around 1900 BC,
  and for Akrotiri before the eruption**, whose date is itself contested (c. 1600 BC by
  radiocarbon, later by the Egyptian synchronisms). The string counts of the earlier lyres
  are not known. This is the design's biggest stretch.
- The rooms are estimates from published dimensions, not measurements, and the four open
  sites share one `open`, though no two of them sound alike.

**Deliberately absent.**

- Percussion. Sistra are attested: a man shakes one on the Harvester Vase from Hagia
  Triada. The levels of every chapter have no percussion, and the brochure's drummer only
  means something against that.
- The double pipe from the bull-sacrifice side of the same sarcophagus. One player per
  chapter, and a pipe is Chapter 1's voice.
- Retuning per site. The Old Babylonian texts move between tunings one string at a time,
  and it would be easy to move one string per level. It is not done, because any change
  of tuning between Crete and the Argolid would be heard as the claim that the mainland
  tuned differently, and nobody knows that.
- Voice, song and words (pillar 2).
- The modern clichés, each wrong by its date: the bouzouki, and rebetiko, urban song
  recorded from the 1920s; hijaz and any augmented second (this lyre has none, which also
  keeps Egypt's scale to Egypt); the sirtaki, choreographed in 1964 for *Zorba the Greek*,
  a film set on Crete; the bowed Cretan lyra; harp glissandi and arpeggiated chords (never
  more than two strings); 7/8 and 9/8 dance time; a drone; Minotaur and labyrinth kitsch.
- F# and C# on the lyre. F# is the brochure's misprint and C# would be a leading tone to
  home. `tests/ch03-lyre.spec.ts` enforces both, with the loop's length, the left hand's
  rule and the rest of what is above.

**Where each level is heard.** Set when the level loads, from the place as it is visited
today. When a level is designed and its defining space turns out to be somewhere else,
its room is ruled again then.

| Level | Room | Why |
|---|---|---|
| Knossos | `open` | **Ruled 2026-09-25: `open`, for the whole level.** The room is the place as a visitor stands in it today, and at Knossos that is outdoors: on the courts and the walkways, looking into Evans's rooms from outside them. The rooms the level takes the tourist into (the storeroom floor, the Throne Room past the barrier, the Grand Staircase, closed since the 1990s, the Hall of the Double Axes) are rooms visitors are kept out of, so a roofed sound there would be the sound of a visit nobody makes; and every one of them is open to the sky through a light well. The first roof the lyre is heard under is Akrotiri's, the one site visited wholly under a roof: a room at Knossos would spend that before it arrives. A small room called Evans's was considered and not made: it would be a new estimate with nothing to measure it against. |
| Phaistos | `open` | Excavated and conserved, never reconstructed. The most exposed of the five. Level 2, designed 2026-09-24, is in the open air throughout except its finale, the hall of the Royal Apartments under a 1960s shelter, and its last few seconds under the New Palace floor: `open` stands. |
| Akrotiri | `hall` | The only site visited wholly under a roof: the modern shelter over the excavated town. Estimated at 1.2 to 2 s; `hall` is 1.6 s and, if anything, dry. Nothing in the sound refers to the shelter's history. Waits on the ruling for Akrotiri in `content/research/arc.md`, section 4. |
| Mycenae | `open` | An open citadel inside its walls. If level 4 is built inside the Treasury of Atreus, use the existing `deep`. The tholos is a tomb, its name a modern identification drawing on Pausanias 2.16.6, and no published measurement of its famous echo was found: nothing may suggest it was built for sound. |
| Tiryns | `open` | The circuit is walked in the open. The corbelled gallery sets the room only if the level spends more than its last beat inside it. |

**For the brochure, later.** The chapter's page of the tour map is not arranged yet and
plays the general waltz, as an unarranged page should. The lyre leaves the operator one
thing to ruin that no earlier page had. A string has one pitch, so his F# cannot be one
wrong note: it is string 3 tightened a semitone, and every F in the tune becomes an F#.
The opening third turns major, the cadences brighten, and the one thing this chapter's
music refuses to do, it does: it cheers up.

## Error dossier

In the notes; never in a level.

- **Evans's reconstitution at Knossos.** Timber 1901–04 (Fyfe), rotted within a few years;
  stone, iron girders and brick arches from 1904–05 (Doll); reinforced concrete mainly 1922–30
  (de Jong), the west storerooms roofed in 1929 and the Throne Room in 1930. Mackenzie ran the
  digging and kept the daybooks. Evans's reasons: the timber rotted, the gypsum dissolves in
  rain, and the stair flights and upper-storey remains found in place could only stay up on
  permanent supports once the fill under them came out. His concrete is now itself decaying
  and is conserved as a monument in its own right.
- **The palace is partly Evans's idea.** Evans was a Victorian and his frame was Victorian
  (kings and queens, a Priest-King, a peaceful thalassocracy, a Throne Room and a Queen's
  Megaron). The concrete a visitor sees is Edwardian and interwar, and has been read as
  modernist (Gere 2009).
- **Kalokairinos** dug first, in 1878–79.
- **The Gilliéron restorations.** The Priest-King assembled from non-joining fragments (head
  with crown, torso, leg), no face preserved, the combination contested (Coulomb 1979,
  Niemeier 1987); the Saffron Gatherer restored as a boy and re-identified as a blue monkey
  (Platon 1947); the Ladies in Blue largely modern paint, re-restored after damage in 1926; the
  pair of griffins flanking the throne, of which the western one has no evidence (Galanakis,
  Tsitsa and Günkel-Maschek 2017).
- **The Dolphin fresco** probably a floor painting fallen from the storey above (Koehl 1986),
  put on the wall of the Queen's Megaron; its plaster replica came off the wall in the wind on
  16 May 2025. The Queen's bathtub probably not found in the bathroom (Mary Beard, reviewing
  Gere).
- **The Boston "Snake Goddess"**: Lapatin's forgery case.
- **Evans's periods** (Early, Middle and Late Minoan) against Platon's palace periods.
- **The Mask of Agamemnon**: genuine Mycenaean, misnamed and misdated by three centuries; the
  forgery claim is fringe; the "gazed upon the face" quotation is apocryphal.
- **Tourist myths to keep out of every note:** columns as upside-down cypress trunks "so they
  would not sprout", or as earthquake shock absorbers; "the oldest throne in Europe"; "the first
  flushing toilet"; Knossos as the Labyrinth.

## Imagery

- Schliemann 1878 and 1886: public domain worldwide.
- Evans, *The Palace of Minos* I (1921), II (1928) and III (1930): US public domain, volume III
  since 1 January 2026; IV (1935) from 1 January 2031. EU public domain for Evans's own work from
  2012, but each plate's draughtsman decides: the Gilliérons and Fyfe are clear, Doll depends on
  his death year (unchecked), and **de Jong's drawings and watercolours stay in copyright to the
  end of 2037.**
- Akrotiri has no public-domain imagery at all; base on Marinatos 1968–76 and Doumas 1992.
- Modern photographs are for reference on your own screen only.

## Reserves, notes only

Pylos, Gournia, Malia, Zakros, Ayia Triada. All fail on profile: standing fabric is knee to
waist height.

## Gate 6

Clear, with one flag ruled. At **Akrotiri**, part of the site's protective roof collapsed in
September 2005, killing a British visitor and injuring six or seven people (sources differ);
the site was closed until April 2012. A deadpan level in which a tourist is crushed by a
falling roof at Akrotiri would restage that death. Ruling: no crush deaths at Akrotiri, and
the modern roof never falls; every collapse there comes from the Bronze Age earthquakes and
the eruption. Spyridon Marinatos died on the site in 1974; sources differ on whether his
grave was later moved beyond the ruins, and it is never in frame. Nobody is known to have died
in the eruption at Akrotiri: the town was evacuated, which is why no bodies were found, and
the locals were, as always, competent.

Design of each level happens in conversation, one beat at a time, before any folder for the
level is created.
