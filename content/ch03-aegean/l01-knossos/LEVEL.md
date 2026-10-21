# Chapter 3 · Level 1 · Knossos

Kephala hill, south of Heraklion, Crete. The largest of the Bronze Age palaces of Crete,
built and rebuilt from about 1900 BC and finally destroyed by fire, at a date disputed
between early LM IIIA2 (about 1375 BC) and LM IIIB. Rooms on every side of a paved Central
Court of roughly 50 × 25 m: the west wing given over to storerooms and state rooms, the east
wing cut down into the slope above the Kairatos stream so that it stood two storeys below the
court as well as above it.

The first to dig here was a Cretan, the Heraklion merchant and antiquarian **Minos
Kalokairinos**, in the winter of 1878–79 (sources also give 1877–78). He opened six of the
west storerooms before the Ottoman authorities stopped him. **Arthur Evans** began on 23
March 1900, with Duncan Mackenzie running the work and keeping the daybooks, and dug and
rebuilt the palace for thirty years. What a visitor sees today is two things at once: the
Minoan ground plan, floors, bases and lower walls, and Evans's "reconstitution" of what
stood on them, in three materials in turn:

- **timber**, 1901–04, under the architect Theodore Fyfe: props, beams and posts where the
  burnt Minoan timber had been. It rotted within a few years.
- **stone, iron girders and brick arches**, from 1904–05, under Christian Doll: "the wooden
  columns became stone", carved, plastered and painted.
- **reinforced concrete**, mainly from 1922 to 1930, with Piet de Jong: upper storeys,
  roofs, column shafts and capitals, the timber frames of walls cast in concrete and painted
  to look like wood. The west storerooms VIII–XII were roofed in 1929, the Throne Room in 1930.

No Minoan column survives anywhere at Knossos. The downward taper, the cushion capital and
the red-and-black colours come from frescoes, seals, the stone bases and the Mycenaean stone
versions (the column of the Lion Gate). Every standing shaft is Evans's, very often on a
Minoan base found in place.

And the thing the level is built on: **the palace really did come down storey by storey.**
In the final fire the upper floors fell into the rooms below. Column bases, stone vessels,
paving and fire-baked Linear B tablets were found where they landed, and Evans built his
upper floors back from what had fallen. Where he rebuilt them, they have held.

> **Rebuilt on 2026-10-21** under the pillars of 2026-09-26, the calls made on the designer's
> delegation ("Use your best judgement on rulings"; `content/research/arc.md`, section 4). As
> built before, from 2026-09-25 and with the West Court of 2026-10-07, it ran 27.3 s clean in
> seven beats and spent five tricks. Three of them are cut (the burnt column, the timber and
> the doors; `content/tricks.md`), and with them the West Magazines, the Hall of the Double
> Axes and the East Bastion's stair; the Grand Staircase, where the timber was, stays, honest. That build is in git,
> in the commit before the rebuild.

## What this level is for

It opens the chapter, so it plants the chapter's words, honestly, and spends two tricks (a
level 1 spends one or two; `arc.md` section 1). The research gives three words: columns taper
downward; light means safe; the palace is partly Evans's idea, cast in 1920s concrete. In play:

- **Columns hold floors up, and every column at Knossos holds.** Four of them, a storey high,
  the same to the pixel, under Evans's slabs. Nothing in the level comes down, anywhere.
- **Light comes from directly above.** A light well is a shaft open to the sky through every
  storey, so a lit patch is the one place nothing is over him. Every earlier light in the game
  came from the side. Two here, both honest: the Throne Room's basin and the Grand Staircase's.
- **Dark means something is over you.** A storey is five tiles, 80 px floor to floor, with a
  slab a tile thick, so under any roof there are 64 px clear and a full jump is cut to about
  48 px of rise. The light well is the one place a jump is full.
- **One storey is nothing, and the light catches every landing.** He walks off the edge of the
  upper hall into the well, falls a storey and lands in the sun. The lethal count is not taught
  here; it is Phaistos's.
- **The pit is the safe ground.** In the West Court the floor beside the pit is the hole, and
  a pit's floor can be a lid.
- **A hop, not a full jump, out of a sunken place.** The throne.

> Knossos: the fake parts hold.

Everything of Evans's holds and does nothing: his concrete, his columns, his copy of the
throne. What gets him is where he lands: on the court the dig never emptied, or in front of the
throne it found. The two tricks are an inversion of each other: at the first pit a hop kills and
the committed jump lives; in the basin the committed jump kills and the hop lives.

**Length.** The knowing run is **13.35 s** from the spawn, 0.08 s of it standing, scripted
(`tests/knossos.spec.ts` pins it under 14 s, standing under 0.2 s); a player is about a tenth slower. Every death is in
the first five seconds, so a retry is cheap: a death in the court comes about 1.3 s from the
spawn. If playtests ask for more, the lever is the Central Court, a breather, never a trick.

**Pillar 8.** The level declares its tricks, `['The kouloura', 'The throne']`, and the exit
label reads "n of 2". The kouloura's two halves each claim the fall down the hole they open
(`CrumbleDef.claims`, `World.claim`): whatever finishes him in it, riding the floor down, a jump
inside the hole, or walking back into it later, the label is the kouloura's and it counts. The
level names no fall of its own: every way off its bottom is through a floor that opened under
him. The throne kills under its own name.

## The beats

| Beat | Folder | What the player meets | The history it comes from |
|---|---|---|---|
| a | `a-west-court` | Evans's bronze bust by the way in. The paved court, the raised walkway crossing it, three open round pits. Between the first two, the court opens under him and takes him down a pit the dig never emptied. The way past is down into the first pit and across into the second; the third pit's floor opens the same way, so it is hopped. Then up onto the stump of the west façade | The West Court, its causeways and its three *kouloures*: Old Palace pits the Minoans filled and paved over when they enlarged the court, emptied again by the dig. The West Façade |
| b | `b-throne-room` | Down three steps through the small rooms behind the throne to the west door. The basin starts at the door: under its lintel he cannot jump, so he goes down into the light. A full jump out lands him in front of the gypsum throne, and he is sitting in it. His visit is over. A hop out lands short; walked past, the throne does nothing. Over the barrier, Evans's copy, the same chair, where a full jump lands, and it does nothing | The Throne Room, found April 1900: the gypsum throne where it was found, the benches, the lustral basin and its light well; Evans's 1930 roof and upper storey; the wooden seat he put in the anteroom; the barrier visitors stand behind |
| c | `c-central-court` | Full sun, nothing above and nothing below. The eastern half steps down. Nothing happens | The Central Court, crossed across its width; its east part found eroded at least 2 m below the original floor |
| d | `d-grand-staircase` | Under Evans's storey, one storey down the stair, under a ceiling that cuts a jump short. At the edge of the upper hall, the light well, and across it the far hall on two columns like the one beside him. He walks off into the light, a storey down, and lands in the sun. Every column holds | The Grand Staircase, found 1901, held up by the fill packed round it, rebuilt by Evans in timber, then stone and iron, then concrete; the light well beside it, open to the sky, its floor drained |
| e | `e-east-bastion` | East along the corridor under the far hall, in the dark, and out onto the terrace in full sun: three giant jars, the turnstile, and the bastion's parapet at the end | The Lower East–West Corridor; Evans's "East Bastion" over the Kairatos valley; the Magazines of the Giant Pithoi beside it |

### a · West Court

The beat is there to hand the player the chapter's scale and the first thing the chapter
wants seen: before any Minoan stone, the bronze bust of the man who rebuilt it. The three pits
are shallow in game terms, hopped or fallen into and jumped out of: a hole that is only a hole.

**The court between the first two pits** (designer's calls, 2026-10-06, at `knossos (127, 2)`).
Between the first and second pits stand two tiles of court, paving on fill, drawn like the rest
of it, the walkway running over it and the fill under it (pillar 4). They are a block standing
over a pit the dig never emptied, and it has no bottom the level reaches. The frame he is on it,
it opens under him, dropping a tile a frame with him on it, and he goes down with it. Label:
**The kouloura.**

- **First attempt.** He hops the first pit, as the court has taught him, and comes down on the
  court beyond it.
- **The way past.** Down into the first pit, and straight across into the second, at any
  moment after landing in it: a full jump (held 14 frames or more), or one held 10 or 11. Most
  come down on the far end of the block; it opens, and he drops into the second pit with nothing
  under him but its floor. Held 12 or 13 the jump meets the court's edge and drops him back into
  the first pit, and held 1 to 5 it never leaves it: both cost nothing. Held 6 to 8 it comes down
  on the court, which opens. **It wants a run-up:** backed against the pit's west wall, a full
  jump pressed together with Right comes down wholly on the court, which opens; six frames of
  run first, and it reaches the second pit. Nothing tells the two spots apart but the hands.
- **Not everyone dies on it.** A long jump from the court that comes down on the block's last
  few pixels, with part of him already over the second pit, drops him into the second pit as
  well. A hop dies.
- **The third pit** (designer's call, 2026-10-07). It looks like the first two, and its floor is
  a lid on the same kind of hole: landing in it opens it, the same way, under the same label.
  The pits he has just learned are safe ground are not all safe ground. A full jump out of the
  second pit comes down at the third's lip, so the way through is a rhythm: down, across, out,
  and straight over the third. Walls stand either side of its floor, so nobody steps off it
  while it goes.
- **The bounce.** A full jump pressed in the last frames before he lands on the third pit's
  floor, as he lands, or on the frame it goes, is a jump (the jump buffer and coyote time, pillar
  1), and gets him out before the floor has gone. An honest second answer, and a precise one; pressed once the floor has gone a
  few tiles, it is a jump inside the hole, and the hole has him.
- **One trick, counted once.** The court and the third pit are one trick in two halves, under
  the one label the designer gave them: one mechanism, one body, one noun. Counted separately
  they would make three tricks in a level 1. The third pit has the touchstone cows' shape
  (two hold, the third drops, and the lesson of the first is what kills at it); the cows are
  kept for Cap Blanc's rebuild, which is told so in the register.
- Over the third, the court ends at the stump of the west façade, two tiles high: a jump up,
  and over it into the rooms behind the throne.

### b · Throne Room

The one room in the game where the death has no physical cause. Evans's all the way up, and
nothing comes down.

- He drops off the stump into the open, then down three steps under Evans's roof through the
  small rooms behind the throne, to the west door: a wall from the ceiling to two tiles over
  the floor. **The basin starts at the last step, under the door**: three tiles wide and two
  deep, the room's only light falling into the two past the door from their own light well. A
  jump off the step meets the door, and one taken as he goes over the edge is under the lintel,
  cut to nothing: nothing gets past the basin without going down into it. He lands half under
  the door and walks on into the light, and out of it with a jump.
- **The seat.** A full jump out, from anywhere in the light, standing or running, or pressed as
  he drops in or as he lands (under the door a jump is cut, as under any roof, and lands short), comes down on the throne's footprint, **the whole seat and a little
  either side**, and he is sitting in it. He is drawn at rest in the throne, facing out, never
  triumphant; a dry sound of a body sitting down on stone; nothing reacts. Label: **The
  throne.** It has its own frame and sound and is never the pose or the sigh of giving up (R).
  It is not a false completion: no exit sound, no label, the ordinary reset.
- **Its setup.** The court has just taught him that the way out of a pit is a committed jump.
  The basin is the next pit, lit from above, where the chapter says nothing is over him.
- **Once known.** A hop out, held 6 to 8 frames, lands short of the footprint wherever he
  takes off, and he walks past it; walking in front of the throne never seats him. Held 1 to 5
  frames he stays in the basin and tries again, at no cost. Held 9 to 13 it depends where he
  jumps from; a full jump always seats him, Right pressed with it or a frame or two late. A
  window of a few frames of hold: precision, never only memory (pillar 4).
- **Once per game.** The one death in the game with no physical cause, spent here (`PILLARS.md`,
  pillar 8). No later level seats him in anything.
- **The copy.** He hops the barrier into the anteroom, and a full jump over it comes down in
  front of Evans's wooden copy of the throne, pixel-identical to the original. It does nothing.
  The flinch costs him nothing, and the original and the copy side by side are the level's line
  in one picture.
- The room's ceiling is declared higher than a storey, so a full jump in it is not cut and the
  landing on the throne is a clean arc. **As built:** six tiles clear; the throne's footprint
  and the copy's are 24 px, the seat and five either side, starting 19 and 129 px past the
  basin's east rim, the chairs drawn where they always were; the barrier stands at 96. The
  footprint's west edge (x 435) lies between the longest hop out of the basin (x 433.9) and the
  shortest full jump, one pressed as he drops in under the door (x 435.4). `tests/knossos.spec.ts`
  checks every jump above.
- Four steps up and out through the anteroom into the court.

### c · Central Court

The one honest breather: nothing above and nothing below, full sun. The eastern half is one
step lower, because it is. The court teaches by contrast that the open sky is safe, which is
the thing Phaistos will take away.

### d · Grand Staircase

The chapter's signature, shown honestly: the first time the game shows a building as storeys
stacked on each other, on columns, with a light well through them all.

- From the court into shade under Evans's upper storey, which is only ever a ceiling, then one
  storey down the stair, five treads. One column stands at the head of the stair. The steps
  are walked and never the trap (stairs are Egypt's).
- The upper hall, under a ceiling that cuts a jump to about 48 px. At its edge stands column A,
  and past it the light well: three tiles of daylight from the sky to sunlit gypsum paving one
  storey down, with a drain in it.
- Across the shaft the far hall carries on under columns B and C, pixel-identical to A, which
  carry the floor of the storey above, set back a tile from the edge.
- **Nothing happens.** He walks off the edge into the light and falls a storey, about 75 px,
  into the sun. A jump across lands him on the far hall, safely, and its end drops him onto the
  terrace, about 91 px. A jump into the well, the longest about 142 px, lives. After a floor has
  opened under him in the court, the walk off an edge into the light is a flinch that holds.
- **One route in effect.** Both ways come out on the terrace; the knowing run walks off into
  the light and along the corridor under the far hall.

### e · East Bastion

The exit, and honest. East along the Lower East–West Corridor under the far hall, in the dark,
then out onto Evans's East Bastion terrace, a tile down, in full sun, with no roof anywhere and
the Kairatos valley behind. Three identical giant storage jars, about his height. The turnstile,
the game's own exit. At the end of the level the bastion's parapet, higher than any jump: a full
jump over the turnstile comes down on the terrace, and he walks back to it. No jump in the beat
can kill.

## Deliberate lies

- **A fourth pit, paved over, between the first two, with no bottom; and a third whose floor
  is a lid.** The West Court has three *kouloures*, round and broad and a few metres deep at
  most. The Minoans did fill and pave them when they enlarged the court; the dig emptied all
  three, and none has a hole under it.
- **From the West Court straight over the west façade into the rooms behind the throne.** The
  West Magazines and the Long Corridor lie between, and the Throne Room is entered from the
  Central Court, by its anteroom.
- **The basin lies in his path, under the west door.** It is across the room from the throne,
  behind a bench and a balustrade with three columns. He gets out of it by jumping its wall; the
  six steps are the only way in and out.
- **Landing in front of the throne seats him and ends his visit.** It is a chair and has never
  done anything to anybody.
- **Evans's copy is the colour of the gypsum.** If the anteroom copy is wood-coloured, it is
  painted to match so the two thrones are pixel-identical (pillar 4).
- **The Throne Room is taller than a storey**, and he enters by its west door and leaves over
  the barrier. Visitors see it only from the anteroom.
- **The Central Court's western half is levelled** into a flat run, and short.
- **One column at the head of the staircase, and three by the light well.** The level's
  placing, not the staircase's colonnade. Every column the same to the pixel.
- **The staircase is open to walk.** It has been closed to the public since the 1990s;
  visitors look down into it from the court. One flight of it, and a drop of a storey into its
  light well; its lower flights are left out.
- **The route from the staircase's light well to the East Bastion is straightened.** It runs
  by the Lower East–West Corridor, past the Lapidary's Workshop and the Court of the Stone
  Spout; here it is a straight corridor under the far hall.
- **Visitors do not leave by the East Bastion,** and its parapet is no higher than a parapet:
  here it is higher than any jump, the end of the level. Evans's stair down from the terrace is
  left out. The giant jars are moved onto the terrace from their magazine beside it.
- **Scale.** A storey drawn at 80 px is about 8.5 m at the tourist's size, roughly double or
  more a Minoan storey of about 3–3.5 m. Spacing, sequence and jump distances are level design
  (`arc.md`, invariants).

## What is true and is doing the work

- Evans's bust stands by the way in, and the palace behind it is partly his.
- The kouloures were filled and paved by the Minoans and emptied by the dig.
- Every column a visitor sees is Evans's, tapering downward on the evidence of pictures, very
  often standing on a Minoan base. His concrete has held.
- The throne is the original, one block of gypsum, where it was found in April 1900. Evans put
  a wooden copy in the anteroom. Visitors stand behind a barrier and do not go in.
- The only light in the Throne Room falls into the sunken basin.
- The Grand Staircase stood in 1901 because the fill held it; the east wing is cut into the
  slope, storeys below the court as well as above it.
- Light wells are shafts open to the sky; their floors are paved and drained.
- The East Bastion looks over the Kairatos valley, and the Magazines of the Giant Pithoi are
  beside it.

## Not in the level

- **No bull, anywhere in the chapter** (designer's ruling). Not the horns of consecration
  Evans set up by the South Propylaeum, not the charging-bull relief on the North Entrance,
  not the Bull-Leaper copy in the replica room over the Throne Room, not the oxhide
  figure-of-eight shields of the staircase loggia and the upper hall. The upper storeys are
  drawn as slab, never opened.
- **The Minotaur and the labyrinth.** Myth, and level 6's. The derivation of "labyrinth" from
  *labrys*, the double axe, is Evans's and doubted by linguists. With the Hall of the Double
  Axes cut, no double axe is drawn in the level, so nothing in it points at the labyrinth.
- **Whose seat the throne was.** Evans's "Throne of Minos", a king's seat; a priestess or an
  enthroned goddess has been argued (Reusch 1958; Niemeier 1986), because griffins flank
  goddesses in Minoan art. The level takes no side: only the tourist ever sits there.
- **The griffins.** The pair flanking the throne is the Gilliérons' symmetry. Galanakis, Tsitsa
  and Günkel-Maschek (BSA 2017) found no evidence for a griffin west of the throne; the scheme
  "as it currently stands, never existed". Drawn as it stands today, with the note.
- **The West Magazines, the Hall of the Double Axes and the East Bastion's stair**, cut on
  2026-10-21, the first two with their tricks, the burnt column and the doors; the timber, cut
  from the Grand Staircase, which stays (`content/tricks.md`). Their history stays true and stays in the
  chapter: the upper storey of the west wing fell into the storerooms in the fire, and Evans
  roofed storerooms VIII–XII in concrete in 1929 and left the rest open; Fyfe's timber in the
  Grand Staircase, 1901–04, rotted and was replaced by Doll's stone and iron; the hall's light
  well, its masons' marks, its pier-and-door partitions and portico; the stair's stepped runnel
  and its catch-pits. The pier-and-door partitions are free for a later level (`tricks.md`).
- **The throne-and-canopy cast** in the Hall of the Double Axes, and Evans's wooden throne on
  it: left out, because the seat is spent and a third throne would be a tell the level cannot
  pay off.
- **The Queen's Megaron** is off the route. Its Dolphin fresco was probably a floor painting
  that fell from the storey above (Koehl 1986; the Heraklion Museum); Evans put it on the wall.
  The plaster replica came off that wall in the wind on 16 May 2025.
- **The Temple Repositories** under the west wing, where the faience "snake goddesses" were
  found in 1903, and the Boston "Snake Goddess" case, are the chapter's dossier, not this level.
- **Bull-leaping in the Central Court**: Evans and Graham (1957) put it there; Younger (1995)
  and others doubt it. Out by ruling in any case.
- The 1926 earthquake, which Evans felt from the Villa Ariadne and wrote up in *The Palace of
  Minos* II (1928), and whatever he said of his concrete in it: unchecked, so unused.

## New in the engine

All of it built, rough and drawn by code.

- Darkness in more than one stretch of a level, bounded in height, and a `lightWell` shaft of
  daylight cut out of it with no fixture (2026-09-25). Never the `spotlight` decor: at Karnak,
  spotlit meant it falls.
- A seat: a landing on its footprint kills with its own cause, frame and sound; an inert copy
  (2026-09-25).
- A trapdoor (`CrumbleDef.opens`): the frame he is on it, it is dropping away a tile a frame
  with him on it; drawn as the level's own tiles (`asTiles`), with the rock under it until it
  goes (`solidBelow`) (2026-10-07).
- **A trap claims the death it sets up** (`CrumbleDef.claims`, `World.claim`; 2026-10-21): once
  a trapdoor has opened under him, a plain death down its hole (the fall out of the level, the
  drop, a drowning) is named for the trap and counts for pillar 8, while he is in the hole. The
  claim lapses when he stands on something or jumps and no trap claims him again that frame; a
  trap's own death and giving up are never renamed. Brought back from the reverted Cap Blanc
  rebuild (8e42c99) as CLAUDE.md asked, for the first trap that only moves him. Phaistos's and
  Akrotiri's floors that move him need the same.
- Knossos now starts its camera on him (`cameraOnSpawn`, built for the Minotaur), so he is seen
  walking in on the court, high in the level (pillar 13).
- Theme `knossos`, the bull-leaper costume with its seated and enthroned frames.
- Removed with the cut tricks: the span on a column that folds (`Span`), the pier-and-door
  partition on a clock (`Door`), their causes, sounds and drawing, and the double axes, the
  runnel and its catch-pits. They can be brought back from commit 651fdbe; the doors are a free
  trick, the span a family the register says not to claim again as new.
- Walk-throughs in `tests/` for every first and second attempt above.

## Sources

- Knossos Documenta (the Ephorate's conservation record): West Magazines
  https://knossosdocumenta.gr/en/west-magazines/ · Grand Staircase
  https://knossosdocumenta.gr/en/grand-staircase/ · Throne Room
  https://knossosdocumenta.gr/en/throne-room/ · reconstruction work
  http://knossosdocumenta.gr/en/reconstruction-work/ · gypsum conservation
  https://knossosdocumenta.gr/en/gypsum-conservation/ · paint restoration
  https://knossosdocumenta.gr/en/paint-restoration/ · South Propylaeum
  https://knossosdocumenta.gr/en/south-propylaeum/
- Ashmolean Museum, *Rebuilding the Palace of Minos at Knossos*:
  https://www.ashmolean.org/article/rebuilding-the-palace-of-minos-at-knossos
- The Ephorate's signs on site, transcribed: West Magazines https://www.hmdb.org/m.asp?m=85449 ·
  Hall of the Double Axes and Queen's Megaron https://www.hmdb.org/m.asp?m=85496 · East Bastion
  https://www.hmdb.org/m.asp?m=85506
- Galanakis, Tsitsa & Günkel-Maschek, "The Power of Images: Re-examining the Wall Paintings
  from the Throne Room at Knossos", BSA 112 (2017):
  https://www.cambridge.org/core/journals/annual-of-the-british-school-at-athens/article/power-of-images-reexamining-the-wall-paintings-from-the-throne-room-at-knossos/93E11F6E27E0265AE77C0FE050690090
- Evans, *The Palace of Minos at Knossos* I (1921), II (1928), III (1930), IV (1935). Volumes
  I–III are US public domain; III, with the east wing and the East Bastion runnels, since
  1 January 2026: https://digi.ub.uni-heidelberg.de/diglit/evans1930/0297
- Hood & Taylor, *The Bronze Age Palace at Knossos: Plan and Sections*, BSA Suppl. 13 (1981).
- MacDonald & Driessen, "The Drainage System of the Domestic Quarter in the Palace at Knossos",
  BSA 83 (1988).
- Shaw, *Elite Minoan Architecture* (2015), for the 1901 photograph of the Hall of the Double
  Axes and its upper-storey door bases. Shaw & Lowe, "The 'Lost' Portico at Knossos: The Central
  Court Revisited", AJA 106 (2002).
- Graham, *The Palaces of Crete* (1962, rev. 1987); Shaw, *Minoan Architecture: Materials and
  Techniques* (1973, 2009).
- Koehl, "A Marinescape Floor from the Palace at Knossos", AJA 90 (1986); Heraklion Museum,
  Dolphin fresco: https://heraklionmuseum.gr/en/exhibit/dolphin-fresco/
- Papadopoulos, "Knossos", in *The Conservation of Archaeological Sites in the Mediterranean
  Region* (Getty 1997); Hitchcock & Koudounaris, "Virtual Discourse", in *Labyrinth Revisited*
  (2002); Gere, *Knossos and the Prophets of Modernism* (2009); MacGillivray, *Minotaur* (2000);
  Mary Beard, "Knossos: Fakes, Facts, and Mystery", NYRB 2009:
  https://www.nybooks.com/articles/2009/08/13/knossos-fakes-facts-and-mystery/
- Christakis, on the storage jars of the west wing, in *Knossos: Palace, City, State*, BSA
  Studies 12 (2004).
- Kalokairinos: https://www.researchgate.net/publication/301685925_Minos_Kalokairinos_and_his_early_excavation_at_Knossos_An_overview_a_portrait_and_a_return_to_the_Kephala_pithoi
- De Jong's drawings and watercolours stay in EU and UK copyright to the end of 2037: reference
  only. Modern photographs are for reference on your own screen only.

## Confidence

**How this was checked.** The research for this level was done through web search, and the
network blocked most page fetches, so most claims were taken from search extracts of the pages
cited rather than from the pages or the books. Everything below marked "ask before painting"
must be read in the books before its asset note is signed off. The rebuild of 2026-10-21 added
no new history: it cut beats and moved the Throne Room's basin, and its new lies are listed.

**Solid.** Kalokairinos first; Evans from 23 March 1900; the three campaigns (timber, then
stone, iron and brick arches, then reinforced concrete) and Fyfe, Doll and de Jong; storerooms
VIII–XII roofed in 1929 and the rest open; the upper storey fallen into the storerooms and
rebuilt from what fell; no Minoan column surviving; the throne original and in place since April
1900; the Throne Room roofed in 1930; the Grand Staircase found in 1901 and held by its fill;
Fyfe's timber beaten by the weather and replaced from 1904–05; light wells open and drained; the
Hall of the Double Axes named for the masons' marks in its light well; the East Bastion stair
reconstructed by Evans; the unattested west griffin.

**Discrepant in the sources.** Kalokairinos's dates (1877–78 or 1878–79). Doll's years (from
1904–05; to 1907, 1910 or 1913) and the material of his staircase columns (stone, says
Documenta; concrete, says the Ashmolean). When reinforced concrete began (1922, "after 1925", or
Doll's first use in 1905–10). The number of storeys in the east wing (four, five). The count of
storerooms (18, which is Documenta's and the site's; guides say 19 or 22).

**Not verified, so ask before painting:**
- the colour of the columns in each area (red shaft and black capital, or the reverse);
- the Throne Room barrier's real form, and who made the anteroom copy and when; whether
  visitors once sat in the copy for photographs;
- whether the light well over the lustral basin is Minoan evidence or Evans's 1930 inference;
- the depth and size of the kouloures and the basin (Hood & Taylor 1981);
- whether the Grand Staircase's floors over the light well are Doll's iron girders and brick or
  1920s concrete, as the slab is drawn;
- where the Lower East–West Corridor and the Hall of the Colonnades lie at the foot of the
  staircase, and how they lead to the East Bastion;
- the East Bastion's parapet: its height and stone;
- the date and sculptor of Evans's bust (1935 is often said).
