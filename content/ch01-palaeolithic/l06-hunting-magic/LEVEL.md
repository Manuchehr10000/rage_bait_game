# Chapter 1 · Level 6 · Hunting Magic

The chapter's legend (`arc.md`, section 1). It is not a site but a story told about the painted
caves: **hunting magic**, the idea, from Salomon Reinach (*L'art et la magie*, 1903) and then the
abbé Henri Breuil and the comte Henri Bégouën, that the animals on the walls were painted so that
the hunt would succeed. A spear drawn into a painted beast, or driven into a modelled one, was a
wound given in advance to the beast outside. The theory held the field for half a century and is
long out of favour, which is what makes it a story told about these caves rather than a fact
about them. The level is accurate to that story and its tellers, not to the past (`arc.md`,
section 1: "accurate to that story's own sources rather than to the past").

What the tellers pointed to, and what this level is built from:

- **The double.** Bégouën's reading: the painted or modelled animal stands for the live one, and
  what is done to the one is done to the other. A natural hole in the rock could stand for a
  wound.
- **The Montespan bear.** In 1923 Norbert Casteret, swimming the sump of the cave of Montespan
  (Haute-Garonne, a few kilometres from Gargas), found a headless bear modelled in clay, a real
  bear's skull lying between its paws, its body pocked with holes the tellers read as spear
  thrusts. It became the theory's best exhibit.
- **The tectiforms.** Roof-shaped signs painted on or beside animals, at Font-de-Gaume and at
  Rouffignac among other caves, which the tellers read as traps, or as huts.
- **Breuil's copies.** The plates in which most people met the painted caves for half a century:
  cream paper, black line, red stipple. They are also the chapter's error dossier (`arc.md`,
  chapter 1): a hind printed mirror-reversed in the 1906 Altamira plates, layers put in the wrong
  order, and, among the things a copy on paper always loses, the relief the painters worked into.
  At Altamira the bison of the Great Ceiling are painted on natural bulges of the rock, a bump
  made a shoulder.

## What this level is for

It ends the chapter as its legend: entered on foot through level 5's grand feature, the wall of
hands; beaten the way the story beats it, never by the tourist's strength; one screen wide; never
more than 45 seconds clean (`arc.md`, section 1; pillars 6, 7, 11).

> Hunting Magic: you spear the painting, not the mammoth.

- **The way of winning** is the story's and is used once in the game (`content/tricks.md`): he
  throws spears, a move that exists in this level alone, and they win by striking the beast's
  painted double on the rock, never the beast. A spear that strikes the live mammoth glances off;
  one in the painted heart fells it. His arm only ever hits a wall (designer, 2026-10-28).
- **The hunters are competent and never appear.** They have done everything right: blinded the
  beast with a spear in its painted eye, painted their trap sign over its picture, dug a covered
  pit between it and the rock. The tourist undoes their work twice, the vandal who pulls the spear
  out and then throws into their sign, and their order, the trap and then the kill, is the only
  order that works (pillar 11).
- **Drawn as a Breuil plate.** Passing through Gargas's wall of hands is where the cave's own
  drawing becomes the plate's. Drawn fresh, never traced: Breuil's copies are in EU copyright to
  the end of 2031 (`arc.md`, section 4, 2026-10-20 and 2026-11-03).
- **Three counted tricks** (`arc.md`, section 4): the relief on the way down; the pitfall and the
  tectiform in the fight. The level declares them (`LevelData.tricks`), and the exit label reads
  "n of 3". Put it back and re-blinding are not counted.

**About 17 seconds clean** (pillar 7): about 7 s down the shaft and about 10 s of fight, under
the ruled "about 22" and left short rather than padded with walking (`arc.md`, section 4,
2026-11-03 and 2026-11-26). Every number below marked "model" comes from a model of `PHYS`, not
the engine, and is pinned when the level is built.

## The beats

| Beat | Folder | What the player meets | Where it comes from |
|---|---|---|---|
| a | `a-hands` | Gargas's wall of hands, in the cave's own drawing, and through it. The first ledge of the shaft, whose edge is where the plate begins | Level 5's grand feature; the legend is entered on foot through it (`arc.md`, section 1) |
| b | `b-shaft` | A zigzag shaft one screen wide, four stages down. Altamira's horse and hind, flat on the wall; then the bison on its boss, the relief | Breuil's copies of Altamira; the bosses of the Great Ceiling |
| c | `c-hunt` | The hunt: the Montespan bear, the blind mammoth in front of its picture, the hunters' covered pit, the far lip under the leaning rock. The cure, the pitfall, the throw | Reinach, Breuil and Bégouën's hunting magic; Casteret's bear; the tectiforms |

### The section

The level is one screen wide, 320 px, and tall: the shaft about 540 px from the first ledge to
the hunt room's floor, the hunt room one screen of 180 px under it (pillar 6: the camera follows
him down, never left).

### a · Through the wall of hands

He walks in off the left edge (pillar 13), in the cave's drawing, at the foot of Gargas's wall of
hands as level 5 left it, and through it onto the first ledge of the shaft. The ledge's edge is
where the plate begins: he walks off it and lands in cream paper and black line. Nothing kills
here.

### b · The shaft

Four stages, left and right in turn. No drop in stages 1, 2 and 4 is more than about 120 px, so a
miss there lands on the stage below and costs nothing; the worst, a full jump off stage 2, is
about 142 px (model). Only at stage 3 does the shaft open all the way down.

1. **The horse.** Off the first ledge, a fall of about 100 px past Altamira's horse, flat on the
   wall behind him, onto ledge 2. He lands in the plate.
2. **The hind.** A walk-off drift from ledge 2, about 80 px down and 40 px across, through the
   hind, onto ledge A. A walk-off is the easy way. A full jump carries him into the shaft's far
   wall and he slides down onto A, so nothing here teaches him to jump. This is the habit: walk
   off, and drift through the picture.
3. **The bison: the relief.** The bison hangs over the gap just past A's lip, drawn flat as the
   horse and the hind were: its back 20 px above A, 32 px long, its belly 20 px below A. It is
   painted on a boss the copy does not show. Ledge C is 150 px below, to the right, starting
   about 40 px past A's lip and under the bison's far end.
   - A walk-off, as at stage 2, or a tap of jump: he meets the bison's flank side on, stops dead in
     the air, and falls straight down the open shaft, about 250 px, to the hunt room's floor at its
     left edge. He lies there as a fall's body, just inside the room, and the blind mammoth goes on
     standing in front of its picture. The bison shows no mark of him. The trap claims the fall
     (`World.claim`): **"The relief"**.
   - A full jump clears the bison's back and comes down on C from 62 px higher, a fall of about
     212 px: his own death, as Karnak's pylon is, not a trick.
   - A medium jump, about 3 to 12 frames of hold (model), lands on the bison's back, which is a
     floor. He walks off it down to C, about 170 px, and lives.
4. **Down to the hunt.** From C a walk-off of about 100 px into the hunt room, onto its left
   floor, where the fight starts.

### c · The hunt

One screen, 320 px, left to right (`arc.md`, section 4, 2026-11-26):

| x (px) | What is there |
|---|---|
| 0 to 48 | the floor he lands on from the shaft |
| 56 to 76 | the Montespan bear: headless clay, the skull between its paws, spears standing in it |
| 140 to 204 | the blind mammoth, 64 px long and about 30 px tall, facing him |
| 204 to 216 | a strip of floor between its rump and the cover |
| 216 to 280 | the hunters' pit under its cover of poles and hides, 32 px deep |
| 280 to 292 | the far lip, under the rock that leans over it to 24 px above its floor |
| 292 to 320 | the rock that closes the room. The picture is painted on its face, over the pit |

The picture and the beast are drawn identical, pixel for pixel: Bégouën's double. What is on the
picture stays on the picture: its paint, the hunters' trap sign, spears stuck in it. What happens
to the picture happens to the beast: its eye shut, a limp. Nothing ever sticks in the live beast,
and its eye only ever shows shut (`arc.md`, section 4, 2026-11-03).

**Blind,** the beast stands still and ignores everything. It covers its whole picture from his
spears: a level throw from the left always meets the live beast first and glances off.

**The cure.** He climbs over its back and drops onto the cover in front of the picture; the cover
holds him, as it never opens under him alone. The hunters' spear stands in the painted eye, over
the cover's left edge, 24 to 27 px up. He hops and touches it with empty hands, and it is his.
The live eye opens.

**The pitfall** (counted). Stung, the beast backs away rump first, never turning. Its hind feet
cross the 12 px strip, the beat in which the hop he pulled with lands, and step onto the cover:
the cover goes on that frame, and the beast goes down into the pit, into register with its
picture. Be in the air as the hind feet reach the cover and come down on its back as it sinks. A
man who stands still goes down under it; one who jumps too early lands on the cover before it
goes. A player who learned at the relief that a picture can be solid may aim this jump at the
picture instead of the back: he goes into the pit under the beast, the pitfall's own death.

**The throw.** Sunk, the beast leaves its picture clear. He steps from its back onto the far
lip, turns and throws left. A spear flies level from his hand, 10 px up, and the height at which
it reaches the picture alone decides the part it sticks in (one rule, pillar 1):

| Height above the lip (px) | Part | What a spear there does |
|---|---|---|
| 0 to 11 | legs | lames the beast: a wrong wound that helps |
| 12 to 15 | the hunters' trap sign | **the tectiform** (counted): the trap lets go, and the beast comes up out of the pit at him, killing on the lip and in the air over it |
| 16 to 19 | the heart, a natural hole in the rock | fells the trapped beast: the win |
| 20 to 23 | the body | sticks; nothing happens |
| 24 to 27 | the eye | blinds it again: an uncounted help |
| above 27 | over the back | strikes the rock and falls |

The leaning rock stops every hop under it at the same height: he is 16 px tall, so at the stop
his hand is at 18, in the heart; a standing throw goes in at 10, in the legs. He reaches the rock
two or three frames into a hop and stays in the heart's band about five more (model); a throw late
in the fall drops into the sign. Aim is a throw at the stop of a hop. Blinding it first does not
help: a sprung trap frees even a blind beast. A heart wound fells only a trapped beast, the
tellers' order, the trap and then the kill. A mammoth's shoulder hump is as high as its domed
head, so a level spear at the eye's height meets the hump's slope first, and by the one rule still
blinds it.

**Spears.** He carries one at a time. His first is the one pulled from the eye, so a clean run
throws once and never walks to the bear. After a wrong throw he fetches the next from the
Montespan bear by touching it, crossing the sunk beast's back as a bridge. Pulling spears from the
bear heals nothing: its double is the skull between its paws, and that hunt is over.

**Put it back** (not counted). If the trap is sprung, the beast heaves out of the pit and a
forefoot comes down on him at the lip; it is beaten by throwing the spear back into the painted
eye. Its death is "something comes down where a runner is going", closed by Knossos's rebuild.

The throw is X or J, beside the jump keys Z and K; on a phone, a button under the left thumb,
shown only in this level (`arc.md`, section 4, 2026-11-03).

## The tricks

| Noun | Beat | Setup, then punchline | The answer once known |
|---|---|---|---|
| The relief | b, stage 3 | The plate is flat, and the horse and the hind were flat; the bison is painted on a boss the copy does not show | A medium jump onto its back, about 3 to 12 frames of hold (model) |
| The pitfall | c, the cure | The cover holds him; the cure shows the double for the first time; the stung beast backs onto the cover with him on it | In the air as the hind feet reach the cover, down on its back as it sinks |
| The tectiform | c, the throw | The sign is the trap's double; a throw too low springs the trap | A throw at the stop of a hop, about five frames (model) |

Neighbours and rulings for each are in `content/tricks.md`. The relief keeps the cure the level's
first showing of the double: no picture on the way down acts, and nothing happens to any beast.

## Deliberately wrong

- **The legend makes no claim about the past.** Hunting magic is a story told about the caves, and
  a legend may show its own tellers' readings as true (`arc.md`, section 4, 2026-10-28). Its
  tellers' readings are not the research's: what the art was for is unknown.
- **The tectiform is a trap and the room has the trap.** The tellers' reading; not a fact about the
  signs, whose meaning is unknown.
- **The beast and its picture move together.** The double is the story's.
- **A mammoth, its picture, the bear and the plate's animals share a room and a shaft.** Altamira
  (Cantabria), Montespan (Haute-Garonne) and the tectiform caves of the Dordogne are far apart, and
  Altamira has no mammoth.
- **The boss is on a shaft wall.** At Altamira the bosses are on the ceiling; on a ceiling, over a
  jump, this would be the flint lip (`content/tricks.md`).
- **The plate is a world.** Breuil drew copies on paper; nobody walked in one.
- **Spears.** Spear-throwing with the hand, level, is the level's. Palaeolithic hunters used
  spear-throwers; the throw is the game's one new verb and is not a claim about them.
- **The pit, its cover and the leaning rock** are the level's.
- **Breuil's plates drawn fresh**, in his manner: cream, black line, red stipple. No plate of his is
  copied.

## What is true and is doing the work

- Reinach proposed the theory in 1903; Breuil and Bégouën carried it; it held the field for about
  half a century and is out of favour now.
- Casteret found the Montespan bear in 1923, by swimming the sump; it is headless, modelled in clay,
  a bear's skull was found between its paws, and its holes were read as spear thrusts.
- The bison of Altamira's Great Ceiling are painted on natural bulges of the rock.
- Altamira's Great Ceiling has a hind and horses among its bison.
- Tectiforms are painted at Font-de-Gaume and at Rouffignac, among other caves, some on mammoths.
- Breuil's copies are the error dossier of the chapter: the mirror-reversed hind of 1906, layers in
  the wrong order.
- Gargas's wall of hands, as level 5 draws it.

## Not in the level

- Freeman's reading (1987) of Breuil's Altamira boars as bison is disputed, not settled; the level
  does not use it (`arc.md`, section 4, 2026-11-25).
- What the art was for. The level shows one story's answer and never states it.
- The Trois-Frères "Sorcerer" and the dispute over Breuil's drawing of it. In the dossier only.

## The designer's rulings

All in `arc.md`, section 4, under "chapter 1, level 6 (Hunting Magic)": 2026-10-28 (the way of
winning, the picture and the beast, the wrong wounds and the bear, the opening, the pit),
2026-11-03 (what shows on which twin, the counted tricks, length, the plate and the throw),
2026-11-25 (the relief), 2026-11-26 (the way down, the floor plan, the heights, the positions).

## Sources

To be checked before painting; most were read at search-extract level or recalled while the
level was designed.

- Reinach, S. 1903. "L'art et la magie. À propos des peintures et des gravures de l'âge du renne."
  *L'Anthropologie* 14.
- Cartailhac, É. and Breuil, H. 1906. *La caverne d'Altamira à Santillane près Santander
  (Espagne)*. Monaco. US-hosted scans only (`arc.md`, imagery).
- Breuil, H. and Obermaier, H. 1935. *The Cave of Altamira at Santillana del Mar, Spain*. Madrid:
  https://centrodeestudiosmontaneses.com/wp-content/uploads/DOC_CEM/BIBLIOTECA/EDICION_OTROS/cave-of-altamira_alba-breuil-obermaier_1935.pdf
- Bradshaw Foundation, Altamira, on the rock's bumps and fissures used as the animals' forms:
  https://bradshawfoundation.com/spain/altamira/index.php
- Don's Maps, Altamira paintings: https://donsmaps.com/altamirapaintings.html
- *The Boars from Altamira: Solving an Identity Crisis*, Papers from the Institute of Archaeology
  (UCL), on Freeman's reidentification and its critics:
  https://student-journals.ucl.ac.uk/pia/article/id/119
- Casteret, N. on Montespan (1923 and after), and Bégouën, H. and Casteret, N. on the clay
  figures: not yet read.
- Font-de-Gaume and Rouffignac tectiforms: `arc.md`, section 4 (2026-10-28), from the design conversation; no source yet read for this level.

## Confidence

**Solid.** Reinach 1903; Breuil and Bégouën as the theory's carriers; the theory's fall from
favour; Casteret's discovery of the Montespan bear in 1923; Altamira's bison on natural bulges of
the rock; Breuil's copies as the chapter's error dossier.

**Not verified, so ask before painting:** whether Breuil's plates mark relief at all (if they draw
a contour, `b-shaft` says how this copy loses it); the Montespan bear's posture, size and how many
holes it has; whether the skull lay between its paws or beside it; that Altamira has no mammoth; the exact look of Altamira's
horse and hind; which mammoth pictures carry tectiforms, and where on the body; Bégouën's words on
a natural hole as a wound.

**Numbers from a model of `PHYS`:** the relief's window, the drops and falls on the way down, the
heart's window, the strip's beat. Pinned on the engine when the level is built.
