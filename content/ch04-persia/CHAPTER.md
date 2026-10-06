# Chapter 4 · Iron Age Near East & Persia

> Level 6, the legend: Farhad, from Nizami's *Khosrow and Shirin*, ruled 2026-10-03 (`arc.md`).

Source: `content/research/arc.md`, chapter 4. Dates 900 to 330 BC. Five sites, all in Iran:
the three in Fars first, then west to Susa on the Khuzestan plain, then up the Zagros road to
Behistun. The chapter keeps "Near East" in its title, but its Assyrian sites are not in it:
Nimrud and Nineveh were dynamited in 2014–15 and are excluded (`arc.md`). Status: locked in
the research (2026-09-26), the order ruled 2026-10-03. Level 1 is designed and built, rough,
drawn by code. Levels 3 and 4 are provisional.

| Level | Site | Place | Period | Designed | Built |
|---|---|---|---|---|---|
| 1 | Persepolis | Marvdasht plain, Fars | c. 518–330 BC | yes | rough |
| 2 | Naqsh-e Rustam | Fars | 5th c. BC + Sassanian | not yet | not yet |
| 3 | Pasargadae | Fars | c. 546 BC | not yet (provisional) | not yet |
| 4 | Susa | Khuzestan | Elamite–Achaemenid | not yet (provisional; gate 6 ruled) | not yet |
| 5 | Behistun | Kermanshah | c. 520 BC | not yet | not yet |
| 6 | The legend: Farhad | Bisotun (Behistun), in Nizami's *Khosrow and Shirin* | the poem c. 1180s | not yet | not yet |

- **Costume:** false Assyrian beard, curled and clipped on.
- **Vocabulary:** palace terraces and their stairs, free-standing stone frames and columns,
  rock-cut cliff façades and reliefs, water channels.
- **Level 1 teaches:** the stair is the only way up, and it is a ramp; stone stood and mud
  brick went, so frames and columns stand alone, carrying nothing; the delegations and the
  guards face the empty centre.
- **Level 5 ends on:** Behistun's relief and the unfinished smoothed face beside it, Farhad
  Tarash, through which level 6 is entered on foot.

## The spine: the way up

Every level of the chapter answers one question: how does he get up there? The Persian kings
built high and put what mattered out of reach.

> Persepolis: the stair is the only way up, and it is a ramp.
> Naqsh-e Rustam: the tomb is cut high in the cliff, out of reach.
> Pasargadae: the tomb stands on a plinth of steps taller than a man.
> Susa: to be designed. The city is the hill, and the excavators' château stands on top of it.
> Behistun: Darius had the ledge under his relief cut away.
> Farhad: the milk comes down the mountain in his channel, and carries him.

Persepolis's terrace is reached only by its stair. Darius's tomb at Naqsh-e Rustam is cut high
in a cliff. Cyrus's tomb at Pasargadae stands on a plinth of steps taller than a man. At
Behistun, Darius had the ledge under the relief cut away. In the legend the channel runs down
the mountain, and he does not walk it: it carries him.

## The signature, and its rules

The chapter's signature is **the way up** (ruled 2026-10-03). It replaces "the ramp against the
wall", which no locked site of the chapter has: that vocabulary came from the cut Assyrian half,
and Karnak already has a mud-brick ramp against its first pylon.

- **The stair is a ramp.** Persepolis's stairs have risers of 10 cm and treads of about 31 cm
  (Iranica; Livius). At the tourist's scale a riser is a pixel and a tread three, so the game
  draws the steps at their real size (64 on the first flight for the real 63, one for each pixel
  of rise) and he walks them as a slope of 1 in 3, the real pitch. He runs up and
  down without a jump, he is never slowed, and a jump on a stair is a full jump that comes down
  on the stair or a floor (`tests/persepolis.spec.ts`). Egypt's stairs are climbed a hop a step
  (Dendera's east stair); the Aegean's are incidental (`arc.md`, section 5). This is the one
  stair in the game that is never hopped.
- **The way up is the only way up.** At Persepolis the terrace and the Tachara's platform are
  reached by their stairs and by nothing else, as the terrace really is. Later levels put the
  way up out of reach or take it away, each in its own conversation.
- **Stone stands alone and carries nothing.** The palaces were mud brick round a frame of
  stone. The mud brick went; the columns, the door and window frames and the stairs stand on
  their own, holding nothing up. In this chapter a column is never a floor (Egypt's) and never
  holds a floor (the Aegean's). At Persepolis every one of them is background.
- **In the engine a stair is a slope** (`slopes` in a level's data): its ends meet floor tops at
  tile corners, the masonry under it lies wholly under the line, and it has headroom
  (`tests/levels.spec.ts`).

## Level 1 · Persepolis

Designed and built, rough, drawn by code; see `l01-persepolis/LEVEL.md`.

> Persepolis: the stair is the only way up, and it is a ramp.

Five beats, one of them the exit (ruling 7, below), and one trick. He walks in off the plain,
runs up the Stairs of All Nations, 63 steps, a landing and 48 more, as if they were a ramp,
which to him they are; walks through the Gate of All Nations between its bulls; goes up over the
Tachara's platform, under two lintels, past the king walking out of his hall on the far
jambs; and comes down into the Apadana's east court, where the east stair's façade is the back
wall. Nothing lies until the court. In the centre of the façade four guards a side face a blank,
in the middle of the panel that replaced the king's audience. A man who keeps running is in that
place as they step out of the wall into the court, runs on, and dies in the right-hand file.
**The audience.** The answer is to stop where nobody may stand. No fall in the level can kill;
no joke on the game itself (never in a level 1).

About 15 seconds clean (pillar 7). Built rough on 2026-10-03, the knowing run is 15.83 s from
the spawn, 0.83 s of it standing in the king's place (`tests/persepolis.spec.ts`).

## What Naqsh-e Rustam has to turn

Level 2 turns what level 1 taught into the weapon (`arc.md`, section 1). Notes so that its
conversation starts from what Persepolis leaves it:

- **What level 1 leaves the player believing.** The stair is a ramp and has never lied.
  Carvings are carvings, except the guards. The one safe place in the audience was the middle,
  where nobody may stand.
- **The tomb is the Tachara's front again.** Darius's tomb front at Naqsh-e Rustam is a palace
  front carved into the cliff at almost the size of the Tachara's, with its capitals intact,
  and above it the throne platform carried by thirty nations. At Persepolis every capital has
  fallen. The thing level 1 never showed him, a capital, is whole at Naqsh-e Rustam, and out of
  reach. (Standard descriptions; read them in the sources in that conversation.)
- **The nations walked at Persepolis and carry at Naqsh-e Rustam.** On the Apadana's east stair
  the delegations walk toward the king's place; on the tomb they hold up the king.
- **The way up is gone.** The tombs are cut high in the cliff. Persepolis taught that the stair
  is the way up; the tomb has none.
- **The graves rule** (below): the carved front may carry a trap; the burial chambers and their
  cists never.
- **Spent.** A carving that steps out of a wall has now been the fuse at Philae, at Karnak and
  at Persepolis. At Naqsh-e Rustam it may only be a setup (pillar 4).
- **Rostam.** Later Persians named the site after him, taking its reliefs for his (`arc.md`). He was the other candidate for the legend and was not chosen. His name on the
  map is not a beat.

## Rulings

Made in conversation with the designer between 2026-09-26 and 2026-10-03. The designer
delegated several of the calls ("use your best judgement", then "go on, build level 1"); those
are recorded as rulings made on that delegation and dated 2026-10-03. Rulings 1 to 8 are
recorded in `arc.md` as well; the sound is recorded here only, as chapter 3's was.

1. **The order.** 1 Persepolis, 2 Naqsh-e Rustam, 3 Pasargadae, 4 Susa, 5 Behistun, 6 the
   legend: the three Fars sites first, then west to Susa on the Khuzestan plain, then up the
   Zagros road to Behistun. Pasargadae stays. Levels 3 and 4 are provisional: their jobs
   (contradict; change the job) are not designed.
2. **The legend is Farhad**, from Nizami's *Khosrow and Shirin* (c. 1180s): public domain,
   literature, not scripture. It is entered on foot through Behistun's grand feature, the
   smoothed face called Farhad Tarash. The story happens at Bisotun. Tradition calls the
   smoothed face Farhad's work; it was most likely cut for Khosrow II, Farhad's rival in the
   poem, and left unfinished (Sasanika, "Tarash-e Farhad"). The dating is contested: one paper
   revises its date ("Revising the dating of the Farhad Tarash", academia.edu). Farhad is undone
   by a lie, Khosrow's false news of Shirin's death, in a game whose first pillar is that the
   world lies; and the story breaks the run of monster legends (the mammoth, Apep or Sekhmet,
   the Minotaur). **The legend never stages Farhad's death.** Its proposed way of winning is
   Farhad's first labour in Nizami: the channel he cut down the mountain so that milk from the
   far pastures would flow to Shirin's pool (the Metropolitan Museum's folio of it). The tourist
   is carried by the channel, never by his own strength (pillar 11). The legend is designed in
   its own conversation; "carried along a channel by its flow" is reserved for it in
   `content/tricks.md`.
3. **The signature is the way up** (above). The vocabulary changes with it: palace terraces and
   their stairs, free-standing stone frames and columns, rock-cut cliff façades and reliefs,
   water channels. Siege ramps go.
4. **Graves, a working rule for the chapter.** A tomb's carved front is architecture and may
   carry a trap; burial chambers and cists never. The royal tombs on Kuh-e Rahmat above
   Persepolis stay out of frame. Needed for Naqsh-e Rustam and Pasargadae.
5. **Susa, a gate 6 flag, ruled by the designer 2026-10-06:** Susa may be built beside the Tomb
   of Daniel. See Gate 6.
6. **The winged disc** at the top of the central panel of the Apadana's east stair is a living
   community's emblem today and is never a gag. It stays carved where it is; the audience
   happens below it and its joke is on the tourist. Ruled 2026-10-03 (designer: "go on").
7. **Beat count.** `arc.md`'s "five to eight beats" does not fit a level 1 of about 15 seconds.
   Persepolis has five, one of them the exit, and the invariant is amended: a level 1 may have
   four or five beats, four to eight in general. A level 1 gets one trick (designer,
   2026-09-28: "One trick is fine").
8. **Build order.** `arc.md` section 8 recommends finishing chapters 1 and 2 before any
   chapter 4 production. The designer asked for chapter 4's level 1 on 2026-10-03, and it was
   built then.
9. **The music: not scored yet.** See The sound.

## The tone

Deadpan and mean. The world lies; the controls never do. Every death looks like what caused
it and nothing reacts. There is no text inside a level. The full rules are in `PILLARS.md` at
the repository root; read them before drawing a trap.

## The tourist

Research: false Assyrian beard, curled and clipped on. Designed 2026-10-03; the full note is
`shared/false-beard.md`. His own clothes are modern: a pale short-sleeved shirt, khaki trousers,
trainers, and if anything on his head, a sunhat that is never chapter 1's bucket hat. Over them
the one bought thing: a clip-on Assyrian beard, long, dark brown-black and squared off at the
foot, in horizontal bands of tight curls, hung from his ears by a clip that shows as one bright
pixel at the ear. It must never read as chapter 2's beard, which is a narrow cardboard pharaoh's
beard on an elastic band that does not sit straight: this one is broad, curled and clipped. It
is the wrong empire, and he has come to the one chapter whose Assyrian sites were taken out of
it. It never changes the hitbox, and nobody ever mentions it (pillar 9). Besides the four living
frames: the dead one (the beard knocked askew, the eyes shut, nothing else changed) and the
seated one for giving up (the beard unclipped, in his lap). In the audience's death he is turned
to stone with the beard on.

## What "accurate" means here

- **The site is drawn as it stands today.** No column carries a capital; no roof, beam or wall
  stands between the columns; the mud brick is gone and the stone frames stand alone. The
  Apadana's east stair is crisp, because it was buried until 1931–34, and it stands under its
  modern shelter, because it has since the mid-1990s.
- **The reliefs are unpainted.** Their colour is lost, and showing it would be a
  reconstruction.
- **Modern intrusions are exact.** The shelter over the east stair, the visitors' names cut in
  the Gate. The Italian restorations of 1964–79 are part of what stands, and the notes say which
  is which where it is known (Error dossier).
- **One stone per site, and one exception.** Persepolis is one grey limestone; the Tachara's is
  the same limestone at its darkest and most polished.
- Every asset note separates **must be right** from **deliberately wrong**. There is no third
  category.

## The sound

Chapter 4 is not scored yet. No instrument for it has been researched, and none is borrowed:
the pipe is chapter 1's, the scale is Egypt's, the lyre is the Aegean's and the waltz is the
brochure's. Persepolis is heard with the wind alone, which blows the same in every level, and
with its own sounds: the grind of the guards stepping out and the thud of the death. Ruled
2026-10-03 on the designer's delegation.

**Must be right.**

- Nothing is borrowed. An instrument from another chapter would be heard as a claim about this
  one.
- Nothing reacts (pillar 8). The wind does not flinch at a death.
- When the chapter is scored, its instrument is researched first, as chapter 3's lyre was, and
  is one the chapter's own evidence shows. No candidate is named here, because none has been
  looked at.

**Deliberately absent.** Music, in every level of the chapter, until it is scored. The level is
not silent; it has the wind.

**Where each level is heard.** Set when the level loads, from the place as it is visited today.
With no music there is nothing in the room to hear yet; the room is recorded so that it is
ready.

| Level | Room | Why |
|---|---|---|
| Persepolis | `open` | **Ruled 2026-10-03.** An open terrace on the plain, roofless everywhere. The only roof on the route is the modern shelter over the Apadana's east stair, a flat roof on steel posts over the façade and a strip of the court, and it does not make a room. |
| Naqsh-e Rustam | to be ruled | When it is designed. |
| Pasargadae | to be ruled | When it is designed. |
| Susa | to be ruled | When it is designed. |
| Behistun | to be ruled | When it is designed. |
| Farhad | to be ruled | When it is designed. |

**For the brochure, later.** The chapter's page of the tour map is not arranged and plays the
general waltz, as an unarranged page should.

## Error dossier

In the notes; never in a level.

- **The horses on the stair.** The story that the Stairs of All Nations were made low so that
  horsemen could ride up them is a myth. The likelier reading is that low steps made a visitor
  climb at a dignified pace (Livius). The stair was built under Xerxes; before it, the main way
  onto the terrace was from the south (Livius).
- **The globes on the north stair.** The Apadana's north stair, always exposed and worn, is a
  poorer copy of the east, and its carvers turned the Ionians' bales of wool into globes
  (Livius; a single source).
- **The fire and the tablets.** The fire of 330 BC is traditionally said to have begun at the
  Hadish, the palace of Xerxes. Freshwater diatoms in the calcined surface of the burnt stone may
  show that it was fought locally, perhaps with water from the terrace's canals or stone wells
  (Amadori et al., *Archaeometry* 2025; one study, tentative). The Persepolis Fortification
  tablets were not baked by that fire: they were kept by the collapse of the wall they were
  stored in (Iranica).
- **Storks.** De Bruijn saw storks nesting on the Apadana's columns in 1704 (Livius), and
  nineteenth-century visitors wrote of a nest on every column. Whether any nest there today is
  not confirmed, so none is drawn.
- **The Harem that is a dig house.** The so-called Harem of Xerxes was rebuilt in 1931–32 by
  Ernst Herzfeld and Friedrich Krefter as the expedition's house, altered to let in more light,
  and is now the site museum (Iranica, "Krefter"; ISAC). Part of what a visitor takes for a
  palace front is 1930s.
- **The Italian restorations.** IsMEO restored at Persepolis from 1964 until 1979. The work on
  the Gate of All Nations was hurried for the celebrations of 1971, and the stone capital set on
  a re-erected column there is questioned (Motamedmanesh, *Arts* 2016). Restored tops at
  Persepolis are not all original.

## Imagery

- Flandin & Coste, *Voyage en Perse*, issued in parts 1843–54: public domain. Good for the
  terrace, the Gate, the Tachara and the columns. It cannot show the Apadana's east stair, which
  was dug in 1931–34; no nineteenth-century plate shows it (`arc.md`).
- Schmidt, *Persepolis I* (1953, OIP 68): free to download from ISAC. The rights in its plates
  are to be checked before anything is based on it beyond reference.
- Herzfeld's photographs of 1923–34 (Freer and Sackler Archives): reference only, rights to be
  checked.
- Modern photographs are for reference on your own screen only, never in the repository.

## Reserves, notes only

The research names none for this chapter. Pasargadae, listed there as the reserve and weak on
beats, stays by ruling as level 3, provisional. Nimrud and Nineveh are excluded, not reserved:
both were dynamited in 2014–15 (`arc.md`).

## Gate 6

**Persepolis: clear.** A palace ruin. The Achaemenid royal tombs cut into Kuh-e Rahmat above the
terrace stay out of frame. The winged disc is never a gag (ruling 6).

**Susa: ruled 2026-10-06, by the designer.** The Tomb of Daniel, an active pilgrimage shrine,
stands beside the tell and can be seen from the excavators' château on it. Susa may be built
beside it. The shrine is never part of the level (pillar 12): no trap, death, joke or tourist on
it or at it. Whether it is seen at all, in the backdrop, is decided when Susa is designed;
recommended not, as at Great Zimbabwe and Tikal (`arc.md` section 4).

**Graves.** A tomb's carved front is architecture and may carry a trap; burial chambers and cists
never (ruling 4). It governs Naqsh-e Rustam and Pasargadae.

Design of each level happens in conversation, one beat at a time, before any folder for the
level is created.
