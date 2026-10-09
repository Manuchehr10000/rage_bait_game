# Chapter 3 · Level 6 · The Minotaur

The chapter's legend (`arc.md`, section 1). It is not a site but a story the Greeks told about
Crete, and it is drawn from that story's sources, not from a place. The labyrinth is never drawn as
Knossos: "Knossos as the Labyrinth" is a tourist myth kept out of every note (`../CHAPTER.md`,
Error dossier).

Minos's queen, Pasiphae, bore a son to a bull: Asterius, called the Minotaur, who had **the face of
a bull, and the rest of him human**. Minos shut him up in the **labyrinth** Daedalus built
(Apollodorus 3.1.4). Ovid calls it a building of misleading ways that turn back on themselves like
the river Maeander, so that Daedalus himself could scarcely find the way back to its threshold,
*tanta est fallacia tecti*, and his Minotaur is a double form, half bull and half man
(*Metamorphoses* 8.159–169, at search-extract level). Every Ovid line number in this file is
unverified.

Athens sent **seven youths and seven maidens** as fodder for him (Apollodorus 3.15.8; unverified:
the readings made while designing this level disagree on whether "fodder" was read), every nine years in Ovid (in
translation, at search-extract level). Theseus went as one of the seven youths, by his own offer,
and his father Aegeus "cast the lots for the rest of the youths" (Plutarch, *Theseus* 17, Perrin):
besides him the tribute is six youths and seven maidens.

Ariadne, Minos's daughter, gave him a **thread**. "Theseus fastened it to the door, and, drawing it
after him, entered in"; he found the Minotaur "in the last part of the labyrinth", killed him
"smiting him with his fists", and by drawing the clue after him made his way out again
(Apollodorus, *Epitome* 1.9, Frazer). Catullus likens the fight to a tree felled by a storm
(64.105–109), then gives it two lines: as Theseus laid him low, the monster tossed its horns in vain
at the empty winds (64.110–111); then the thin thread guided the hero out, so that the building's
maze would not baffle him (64.112–115). Ovid's Theseus finds the door again by winding up the
thread, *filo relecto* (8.172–173).

The **Attic vase painters** gave Theseus a sword and the Minotaur stones. On a black-figure amphora
in Boston (MFA 60.1) Theseus holds a horn in his left hand and the Minotaur sinks on his right knee
with a stone raised in his left; on Lydos's amphora (Getty 86.AE.60) he raises a rock; a hydria in
Tampa is said to give him a pair. The Aison cup in Madrid shows Theseus dragging the dead Minotaur
out of the labyrinth's door, with Athena by. Silver staters of Knossos of about 440 BC show the
Minotaur kneeling and running. The designer chose the vases' sword over the fists (2026-10-06).
Every source here was read at search-extract level at best, and some details only from memory
(Confidence).

## What this level is for

It ends the chapter as its legend: beaten the way the story beats it, never by the tourist's
strength; one screen wide; never more than 45 seconds clean; its way of winning used once in the
game (`arc.md`, section 1; pillars 7 and 11). The chapter's rulings do not bind it, so the
chapter's one bull is here, and the five levels that refused it are its setup (`arc.md`, section 4,
2026-09-26).

**The Queue-Jumper.** The tribute waits in a queue at the labyrinth's door, and Theseus kneels at
the doorpost tying Ariadne's thread. The tourist hops over the kneeling hero and goes in first,
alone. Through the rock beside him the hero takes the long way down, paying out the thread, and
still gets to the beast first. The hero never looks at him. Every way he dies is somebody else
doing his job: the hero testing his knot, the beast waiting for its dinner, the beast fighting the
hero.

> The Minotaur: he pushed in to be eaten first, and nobody wants him.

- **A boss fight he cannot win.** He can never hurt the Minotaur. Theseus kills it with a sword, on
  his own clock, whatever the tourist does (pillar 11); the tourist's job is to stay out of the way
  of a man doing his. A boss fight he cannot win spends no joke on the game (designer, 2026-10-06, for this legend).
- **The way of winning** is the story's: out by Ariadne's thread, laid by someone else, along the
  hero's route reversed, back to the knot at the door.
- **Four tricks** (designer, 2026-10-08): 'The knot' in beat b, 'The snort' in d, 'The hands' and
  'The horns' in e. The level declares them (`LevelData.tricks`), and the exit label reads "n of
  4". No plain fall anywhere in the level can kill.

**About 22 seconds clean** (pillar 7): scripted, out at frame 1346, 22.43 s; about 24 s for a
human.

| Beat | Ends at | Seconds |
|---|---|---|
| a, the door and the queue | 1.50 s, the knot fires | 1.50 |
| b, the knot | 2.45 s, off the passage's end | 0.95 |
| c, the way down and the race | 8.27 s, on T_end | 5.82 |
| d, T_end and the hatch | 10.28 s, on the cell floor | 2.01 |
| e, the fight | 11.72 s, on row 5 | 1.43 |
| f, out by the thread | 22.43 s, out | 10.72 |

The way down, from the passage's end to the cell floor, is 7.83 s (470 frames), replayed before
every death after the knot: with the 0.75 s reset a death costs about 2.6 to 2.95 s at the knot,
10.2 to 11.2 at the snort, 11.0 to 12.2 to the hands and 12.3 to 12.8 to the horns. **The first
visit** is estimated at about 2.5 minutes (1.6 to 3.6): about 11 deaths, reading and the final
clean run, and about 40 per cent of it is the trickless way down replayed.

**Every timing, window and count** in The section, beats a to f and The tricks was measured on
copies of the engine's player, physics and types, with the proposed resolveY fix, driven by a
scripted harness, not the game's entities; each is still to be pinned in Node (Tests to pin). The
first visit and a human's times are estimates built on those measurements, and the resolveY figures
(New in the engine) come from an earlier draft of the fight. The harness was a design-time tool
and is not in the repository: every number is to be measured again on the game's entities. A frame is 1/60 s.

**Art.** Ruled (designer, on a recommendation, 2026-10-07): the story's people in black-figure on
orange clay, as on the Attic vases; the tourist the only thing in full colour; the thread the
brightest line; the section legible. Ruled (designer, on a recommendation, 2026-10-08): the women's
flesh in cream, not the thread's white. As designed: details incised in reserved lines; the tourist
outlined 1 px dark; clay air, masonry in a dilute-glaze wash with full-glaze courses, black glaze
only for the vestibule and the hero's doorway; the thread the one pure white. Every tell reads in
silhouette.

## The beats

| Beat | Folder | What the player meets | Death label | What is true |
|---|---|---|---|---|
| a | `a-door` | He walks in past the queue and Ariadne. Theseus kneels at the doorpost re-tying the thread; he jumps the hero, who ignores him, and goes in first. Nothing kills | — | The thread fastened to the door; Theseus the seventh youth |
| b | `b-passage` | The thread's slack in loose curves along the passage floor. The hero finishes, stands and leans back to test his knot, and the line comes taut at shin height. **The trick: 'The knot'** | "The knot" | Theseus fastened the thread to the door and drew it after him |
| c | `c-way-down` | Down five corridors through five plain holes. A snore under the floor; a storey below, a hatch breathing dust. Beside him through the rock, Theseus drops four shafts and four rooms paying out thread, and wins the race. Nothing kills | — | The labyrinth's misleading ways; the thread drawn after him |
| d | `d-hatch` | The last corridor: a plain block that knocks hollow, breath through its joint, and before the hatch the one dressed stone, dished by two foot hollows. Step on it and he is sniffed and snorted back up the hole. **The trick: 'The snort'** | "The snort" | The tribute sent in as fodder (Apollodorus 3.15.8, unverified), every nine years (Ovid) |
| e | `e-cell` | The chapter's one bull, crouched on two stones. Theseus leaps it and takes the horn; he must go with him, ride the heave and jump off the bull's back. **The tricks: 'The hands' and 'The horns'** | "The hands", "The horns" | A bull's face, the rest human; the horn, the knee, the stone; the horns tossed at the winds |
| f | `f-thread` | Out by the thread, up four look-alike rooms and four shafts, back through the passage and out past the queue, Theseus dragging the body behind him. Nothing kills | — | Out by the thread; the dead Minotaur dragged from the door |

The folders are proposed; none exists yet, and every asset gets its note there before it is
painted.

### The section

320 × 752 px, 20 × 47 tiles, one screen wide; y is measured down, and every solid is on the grid.
The camera never moves sideways, and `Camera.reset` starts on the spawn. The spawn floor is y 160,
so a designer's point (X, Y) is world x X, y 160 − Y. Each row's top y, `#` rock and `.` open; the
physics check matched the harness's map cell for cell:

```
y000      ....................        y336-352  ########.########..#
y016      .....###############        y368-400  ####.....#######..##
y032-064  .....#######.......#        y416      ####.########.##.###
y080      ........####.###...#        y432-448  ####.########....###
y096-112  ...............#...#        y464      ####........###.##.#
y128      ...............###.#        y480-496  ####........###....#
y144      ...............#...#        y512      ###########.##.##.##
y160      ##############.#...#        y528-544  ###.........##....##
y176-192  ##############.#..##        y560      ###.........###.##.#
y208      ####...........#..##        y576      ###.###########....#
y224      ####...........#.###        y592      ###..........##....#
y240      ####...........#..##        y608      ###..........###.###
y256      ####.###########..##        y624-640  ###..............###
y272      ####.############..#        y656-720  ###......###########
y288-304  ####.....########..#        y736      ####################
y320      ####.....#########.#
```

- **The door storey**, floor 160: outside x 0–80 (spawn x 8); the door x 80–96, 80 px clear; the
  vestibule x 96–128; the passage **P** x 128–224, 64 px clear; **O1**, the mouth up to the hero's
  gallery, x 192–208; the gallery **G0**, air y 32–80 over x 192–304, its floor top 80 over
  x 208–256.
- **The way down**: **D0** x 224–240; **Z1** x 64–240, y 208–256; **D1** x 64–80; **T2** x 64–144,
  y 288–336; **X2** x 128–144; **T3** x 64–144, y 368–416; **D3** x 64–80; **T** x 64–192,
  y 464–512, directly above T_end; **X** x 176–192; **T_end** x 48–192, y 528–576, under a 48 px
  roof; **the hatch** x 48–64, 160 px down to the cell.
- **The cell** x 48–144, y 592–736; its far wall x 144, 80 px high. **Row 5**: west x 144–208,
  y 592–656; east x 208–272, y 624–656, ending under J1's floor hole. The hero's doorway,
  x 148–164.
- **The hero's column** x 256–304, walled from D0 and Z1 by x 240–256; **Daedalus's turnings**, J4
  to J1, x 208–304, y 416–608, walled from T and T_end by x 192–208 (beat c).
- **The route rule.** The two spaces meet only at O1, 80 px up against a full jump's 61.8 px apex,
  and at the cell's far wall, 80 px. In 20,000 random runs on the way down none reached a hero tile
  (10,800 more in the physics check). A leap into the hatch steered right lands at x 89.6 or less.

### a · The door and the queue

He walks in on foot off the left edge onto the outside ground, and a retry starts him at x 8
(pillar 13). How Tiryns's grand feature hands him over is decided when Tiryns is designed.

- **The thirteen**, six youths and seven maidens, stand in one file, a vase procession of
  overlapping figures, the maidens' cream alternating with the youths' black so the heads can be
  counted. Its front is at about x 40; it may run off the left edge. They stand still, or loop
  slowly well clear of x 56–80, and are still waiting at the end.
- **Ariadne** stands apart at about x 42–52, hands empty, facing the door from first frame to last.
  She never turns, so her look goes past him to the hero.
- **Theseus** kneels at the doorpost, x 66–78, y 146–160, re-tying the thread in a fussy loop
  (wrap, tug, unpick, wrap), eyes on the knot: a solid box until the knot fires, the only solid
  person in the game. He jumps or hops the kneeling hero, who ignores him: the first bent figure he
  vaults, and the plant for the hands. The clean run jumps him at 0.42 s and lands in the vestibule
  at 1.12.

### b · The passage and the knot

The level's first trick. The thread's slack lies in loose curves along P's floor to the ball at
x 208, under O1.

- **It fires** when his centre reaches x 144 (1.50 s). Theseus finishes, stands and leans back on
  the line for 20 frames, with a creak, while the slack runs out; then the line holds taut at shin
  height for 22 frames (1.83 to 2.20 s), a 1 px kill rect at y 149 from x 80 to 208.
- **First attempt.** He trips forward over the white line and lands face down, the wig over his
  eyes, with one dry knock. Theseus lets the line go slack and walks in, looking back at his knot.
  Nothing reacts. Label: **The knot.**
- **Second attempt.** A jump timed to the lean. Measured in the game (2026-10-09), the press
  window by hold is 5 frames at a hold of 11 or more, 6 at 10, 9 at 9, 7 at 8, 5 at 7, 3 at 6, 1 at
  5, never at 4 or less. Hold 9 is the widest because it is the highest jump that stays under P's
  roof (his head 1.33 px short of it); from 10 the roof stops his head and he comes down sooner. In
  the design's copy of the engine, steady hoppers got through 15, 15, 23, 10 and 0 per cent at full
  holds and holds of 12, 8, 6 and 4, and rhythmic mashers 3. The clean run presses 4 frames before
  the line is taut, lands at x 209.75 at 2.27 s and walks off into D0 at 2.43.
- **A relieved second jump into D0 lives** (designer, on a recommendation, 2026-10-07): 6,588 of
  them in the game, no death, the worst fall 143.44 px.
- **The stride** (designer, on a recommendation, 2026-10-08), a picture, never a trap. Theseus walks
  P at 180 px/s, non-solid and a plane behind, then mantles 80 px up O1 (hero frames 66–85), drawn
  in front. At frames 68–70 his trailing foot pushes off a small stone boss on P's back wall,
  x 206–215, y 140–148, head height just right of O1. A knot survivor who stops on landing rests
  at x 207.42–219.42 in the game, and the foot is over 57 of the 61 measured. It is frame-identical with or
  without him, moves nothing and kills nothing, and nothing reacts.

### c · The way down and the race

Honest: nothing here can kill. He walks off each corridor's end and lands running the other way: D0
(96 px) onto Z1 at x 230 (2.73 s); D1 (80 px, through Z1's 32 px floor, 4.55) onto T2 at x 64; X2
(80 px, 5.53) onto T3 at x 134; D3 (96 px, 6.52) onto T at x 64; X (64 px, 8.08) onto T_end at
x 182 (8.27). In the game each of these walk-offs and landings comes one frame earlier. Every
hole, the hatch included, is the same plain 16 px hole. The worst relieved jump
falls 111.44 px into D1 and X2, 127.44 into D3 and 95.44 into X; a leap into the hatch at most
191.44 (191.94 in the game, from the 1 px ground probe's highest stance), because T_end's roof
caps every leap at 192 (pillar 1's limit is 200).

**The hero's route**, the way out reversed. The column has four straight 96 px shafts, each with a
ledge beside it he never needs; every climb back up is 48 px.

| Shaft | x | Falls | Lands on | The ledge beside it |
|---|---|---|---|---|
| A | 288–304 | G0's level to 176 | L_A | the shelf, x 256–288, top 128 |
| B | 256–272 | 176 to 272 | L_B | x 272–288, top 224 |
| C | 288–304 | 272 to 368 | L_C | x 272–288, top 320 |
| D | 256–272 | 368, through J4's thread hole, to 464 | J4 | the stair slab, x 272–288, top 416 |

Then **Daedalus's turnings**: four look-alike rooms, each with two identical 16 px ceiling holes,
one against each end wall. The thread goes up one; the other is a niche, closed above.

| Room | x | y | Thread hole | Niche | Floor hole |
|---|---|---|---|---|---|
| J4 | 208–272 | 432–464 | 256–272 | 208–224 | 240–256 |
| J3 | 240–304 | 480–512 | 240–256 | 288–304 | 272–288 |
| J2 | 224–288 | 528–560 | 272–288 | 224–240 | 240–256 |
| J1 | 240–304 | 576–608 | 240–256 | 288–304 | 256–272, to row 5 |

**Theseus**, frames from the yank (the line taut), on one fixed clock: a 12 × 24 box never in rock,
3 px a frame, falling under the game's gravity, never jumping, landing with at least 8 px of his
box on the floor. 0–21: holds the line. 22–65: walks P, looking back at his knot for 10 frames.
66–85: the mantle and the stride. 86–104: runs G0 overhead, with footsteps. He drops onto L_A at
132, L_B at 174, L_C at 216 and J4 at 258, crouching on each to pay out a loop of thread for 12,
12, 12 and 9 frames, and 6 in J3 at 288; then J2 at 320, J1 at 346, row 5 at 367, and into the
black doorway at 402, where he is invisible. Each pay-out is drawn as work, the arm moving and the
white loop growing every frame, so it never reads as waiting. A footfall at each landing down to
J3; from his drop into J2 he is seen and never heard. In the clean run he is on L_A at 4.03 s, L_B
4.73, L_C 5.43, J4 6.13, J3 6.63, J2 7.17, J1 7.60, row 5 7.95, the doorway 8.53: a storey below
and 0.3 to 0.7 s ahead.

**The race.** The fastest tourist found lands at yank + 449 (the physics check's beam) or 450 (the
design's two beams, widths 6,000 and 12,000), so the hero's step-out, 8 frames before the landing,
comes 39 frames after he reaches the doorway. In the game the widest beam, 30,000, found 448 before
the snort was built, which can only make it later, so the step-out comes 38 frames or more after
the doorway at 402. Every beam is heuristic, and none is a proof, so the
margin is pinned at 20 or more. On screen in the clean run: P 11 of 11 frames; Z1
51 of 109, heard overhead first; T2 45 of 45; T3 45 of 45; T 53 of 77; T_end 14 of 70 (13 of 69 in the design), only his
head and chest at the bottom edge, x 184 to 148, before the black takes him.

**The plant for the snort.** From Z1 down he hears a bull snore under the floor: snore, breath and
drag, never footfalls or palms. From T he sees the hatch, a storey below, breathe: twin plumes of
dust come out on the exhale, rising 32 px, and are drawn back down on the inhale, wholly in frame
for 70 of the 94 frames (69 in the design) from his drop into D3 to his drop into X (72 of the 80 grounded frames on
T, by the physics check).

### d · T_end and the hatch

The level's second trick. T_end's floor, from the left: the hatch, x 48–64; **the lip**, x 64–80, a
dressed threshold, the only fine stone in the floor, its top edge dished by two worn foot hollows
where the tribute stood before it went in; then plain blocks, x 80–112, **the bed block** x 112–144
over the beast's bed, 144–176 and 176–192, pixel-identical, joints and all. No crack anywhere: in
this game a crack means "will give", and Persepolis's cracked column holds.

- **The ear.** The beast is asleep at the hatch on every spawn. It hears a step when he is on the
  ground with his feet within 2 px of the floor (576), on the tick before. A step over the bed
  block sends it to its bed; a step on the lip (his box over x 64–80) brings it back at once, with
  a ring. When his feet pass 580 in the hatch he is snorted if it is at the hatch, and is in if
  not.
- **The clean run.** He lands at x 182 (8.27 s) and runs left; below him Theseus's head and chest
  slide into the doorway, seen and silent. At 8.73 s (frame 524, his box at x 141.8) his feet on
  the bed block knock hollow. On that frame the snore stops, the hatch goes still, a heavy drag
  goes away under the floor, and the same twin plumes breathe up through the block's plain joint at
  x 112, 30 px ahead of him: a flinch. He runs through them 27 frames later, drawn a plane behind
  him and never down past his legs, and they are behind him: relief, whatever was under the hole
  has gone to its bed. He leaps from x 81.8 at 9.42 s, never touching the lip, is in the hatch at
  9.78, 37 frames after his last step over the bed (35 in the design), and lands in the cell at 10.28 s.
- **First attempt.** He runs on, or walks off. His step on the lip rings, deep and unlike any other
  step in the level; on that frame the dust is back at the hatch and the drag comes back. As his
  feet go in he is sniffed, then snorted back up the hole onto the ceiling, and the snore starts
  again under him. Label: **The snort.** A walk-off dies 17 ticks after the ring, a leap that lands
  on the lip 1 to 17.
- **The death**, inside the 45 frames of a death: 0–4, the sniff, the plumes drawn down past his
  legs into the hole (only the hatch ever draws dust past his legs); 5–8, massed twin columns of
  dots, never a solid black column, jet up and carry him to the ceiling; 9–44, pasted flat on it
  over the hatch (x 48–58, y 528), face up, splayed and still, in full colour, the wig over his
  eyes. The dots settle back into the hatch, since dust falls where smoke would rise, and by about
  frame 40 to 44 a slow inhale draws a plume down and the snore starts again, silent since the
  ring, so its return is new. No rotation and no kilt flying: those are the horns'. Nothing reacts.
- **Second attempt.** Never touch the lip: a running leap from the plain block before it, left
  held, never a walk-off. The take-off band for his left edge, by frames of jump held (the physics
  check confirmed each): 1, never; 2, x 80–82.5 (1.7 frames of running); 3, 80–87 (4.7); 4, 80–90
  (6.7); 5, 80–93 (8.7); 6, 80–88.5 (5.7); 7 or more, 80–87 (4.7). Letting go of left at the press
  never gets in.
- **The clock.** 50 frames after his last heard step over the bed, the beast goes back to the hatch
  on its own, with the drag and never the ring, shown on its way: at 40 the joint's plume stops,
  one puff rises at the joint at x 80 and the drag begins; at 45 one puff at the lip; at 50 the
  hatch breathes. A man standing on the bed is heard every frame, so waiting never helps. Runners
  need 34 to 38 frames from their last bed frame at holds of 7 or more (12 to 16 to spare), up to
  42 at hold 5's far take-off, and may let go of left for about 12 frames after the bed. A man who
  slides to a stop may stand at most 11 frames, never 12, measured in the game. Taps of 1 to 3 frames never get in; the only
  creeps that did were half-speed stutter-walks from just short of the band. Mashers holding left
  get in 8.5 to 12.3 per cent of the time, 8.9 jittered (in the game 8.8 rhythmic and 11.2 jittered; other mashing models give 5.8 to 16.2) (the physics check's realistic mashers, 0
  to 14).
- **No skip.** The longest jump under the roof travels 39.00 px from the floor, and 40.50 from the
  engine's 1 px ground-probe stance, against the 42 needed to clear the bed block, and the first
  ground after X is never left of x 165.69, so he is always heard over the bed. The margin is 1.5 px
  in the game (3 in the design's copy): any change to T_end, X or the roof is re-measured.
- **The undo**, after a ring, and the only way in (of 20,000 random runs from the lip, none got
  in; in the game 8 of 400 random men from the lip got in, every one only after going back over
  the bed): walk back until heard over the bed, turn, run and leap; about 1.7 s to the cell floor,
  human-paced, costing about 0.9 s. A frightened hop over the plume from left of x 118.98 at hold 5, or of 112.98 at a full hold, lands on the
  lip and rings.
- **The camera.** The view's bottom before he drops is at most y 687.83, and the frozen snort view
  y 457.7 to 649.8: the beast draws nothing above y 688 and is never drawn under the hatch.

### e · The cell: the fight

The third and fourth tricks, on one clock. The bull crouches with its body at x 114–144 and its
face at x 108, facing the hatch, human hands flat on a stone each (the stones outlined in glaze),
breathing on its own slow loop.

- **The key.** When his feet are 61 px down the hatch the fight predicts his landing, L, exactly
  for 3,316 leap entries (4,453 in the physics check; in the game, every one of 49,060 steered and
  2,786 random entries, keyed 17 or 18 frames before he lands); nothing waits for contact with the
  floor.
- **The clock, from L.** L−8: Theseus steps out of the black doorway. L+4: he leaps low over the
  bull onto the horn, about 6 px of rise, drawn as the vases' warrior, never as a bull-leaper.
  L+40: the grip; the bull lets go of its right stone, raises the left and sinks to its knee by
  L+46. L+46 to 67: its free right hand, the far arm, claws over its brow at the hero's hand on the
  horn, never crossing the stone's arc. L+56 to 62: the heave swings the stone at the ducking hero
  (the duck at L+58) and lifts the bull's back 20 px; the back holds risen to L+68 and sinks by
  L+74. L+76: blow 1, the arm drawn back against clay first; the toss, and the struck body lurching
  on its knees to the left wall and back, to L+105. L+130: blow 2; the body sinks into a 24 px heap
  that stays, and the exit opens.
- **The kills.** The clap: anything over the crouching bull up to 44 px, and 8 px in front of its
  face, from L+0 to 39. The swat: a column at its face, world x 100–112 from the floor up to 64 px,
  from L+46 to 67, drawn where he is caught. Both are 'The hands'. The toss: 'The horns'.
- **The clean run.** He lands at x 48 at L (10.28 s); Theseus steps out at 10.15 and leaps at
  10.35. The tourist leaps at L+18 (10.58), comes down on the bull's back at x 130 at L+57 as it
  heaves, jumps off at L+60 (11.28) and stands on row 5 at x 147 at 11.72. Blow 1 and the toss come
  below him at 11.55; blow 2 at 12.45.
- **Pillar 11.** The bull faces the hatch before he drops, the hero steps out before he lands, the
  ear never moves the fight, and nothing the tourist does changes a blow. The heave and the swat
  are the bull fighting the hero; his weight does nothing.

### f · Out by the thread

Honest, and never replayed: the way of winning.

- Along row 5 to x 262 (13.00 s, the press at 13.02) and up through the rooms, J1 13.52, J2 14.07, J3 14.78, J4 15.50,
  to the stair slab at 16.05: 3.03 s. In each, the wrong one of the two holes is a closed niche
  costing 0.82 to 1.08 s.
- Up the column by the ledges beside the shafts and the pillar tops: L_C 16.57, the ledge at 320
  17.10, L_B 17.62, the ledge at 224 18.13, L_A 18.67, the shelf 19.18, G0 19.80. The path is
  forced.
- Along G0, down O1 into P (20.43), past the knot still on the post (21.62) and out at 22.43. The
  exit is the game's, at the door he came in by: his right edge at x 16 or less, after blow 2.
- Every climb is an honest 48 px jump at a hold of 10 or more, and the worst fall is 143.4 px
  (143.61 in the game, the relieved jump into D0 from the ground probe's highest stance). In
  2,700 random runs after blow 2 nobody died (1,500 more in the physics check, worst fall 127.44).
  A man who falls back into the cell is not trapped: nothing kills from L+106 on, and the heap's
  top, 650.2 against row 5's floor at 656, lets him out.

### The closing tableau

When his left edge passes x 80 after blow 2, a staged second copy, while the heap stays in the
cell: Theseus comes out of the black vestibule dragging the dead Minotaur and stops at the post
where he knelt, x 64–80, within 45 frames, the head and horns across the threshold on the clay of
the door opening, the rest in the vestibule in a reserved outline. He is non-solid and drawn behind
the tourist. The clean run takes 49 frames from the trigger to the exit; the fastest walk takes 50 (49 or 50 in the game, by where in his stride he crosses x 80, so Theseus is always at the post first).
He leaves first, the queue still waits, and Ariadne looks past him. The exit card is anchored right
(view x 136–316), so at 0 to 4 rows of causes it covers neither the door nor Theseus with the body.

## The tricks

All four are claimed in `content/tricks.md`, as tricks of a level designed and not yet built.

**'The knot'** (beats a and b). The kneeling hero he vaulted tests his knot, and the line takes the
shins of the man who pushed in front of him.

- **A surprise the first time.** A second ago he jumped the same man and nothing happened. Nothing
  about a thread on a floor says danger: the most competent man in the myth, doing his most
  harmless chore.
- **Timing the second time.** The line runs from the post to the ball, so he cannot outrun it or
  back out behind it: a jump timed to the lean, 5 frames at a full hold and 1 to 9 by hold (beat b).
- **Only here.** Theseus fastened the thread to the door (*Epitome* 1.9). The rules check called
  the site test strong.
- **The closest tricks.** The boot snare: a fitting holds him; here nothing does. Nor Gargas's
  fifth tread. Its shape is the touchstone obelisk's and Persepolis's column's, a thing he passed
  that gets him from behind, but its answer is a jump timed to the lean, not outrunning it or
  stepping back behind its foot. It shares the obelisk's feeling, relief and then what he dismissed
  gets him, with the snort at the other end of the way down; the setups differ, a chore he ignored
  against a threat he sees leave.

**'The snort'** (beat d). The beast he heard and saw breathing at the hatch goes to its bed at his
step, and the tribute's threshold rings it back: he pushed in to be eaten first and is not even
wanted.

- **A surprise the first time.** The hatch is marked before he reaches it, by the breath, the snore
  and the lip, and then he sees the threat leave. The relief kills him.
- **Timing and precision the second time.** A running leap from the plain block before the lip,
  under the 48 px roof, in a take-off band of 1.7 to 8.7 frames by hold (4.7 at a full hold),
  within 50 frames of his last step over the bed; a man who stops off the bed may stand 11
  frames.
- **Only here: medium, accepted by the designer** (2026-10-08), as for Persepolis's column. The
  fodder is the story's (Apollodorus 3.15.8, unverified; Ovid, *Met.* 8, fed on Athenian blood
  every nine years, at search-extract level), and the foot hollows, the queue at the door,
  the queue-jumper first to dinner and the bull's breath tie it here. But a fed beast under a hatch
  fits other pits, and hunting by footsteps is a modern monster trope.
- **The closest tricks.** New by `content/tricks.md`'s own test, narrowly: no row moves an unseen
  creature by where he steps, or blows him back up the hole he must use. Its neighbours: the
  trapdoor in plain floor, with Knossos's court between the pits in this chapter, its closest
  neighbour since Knossos's rebuild of 2026-10-07 (there the court beside the pit opens under him
  and the answer is to go straight into the pit; here too he must leave the floor at the hole's
  edge untouched and go straight into the hole, but this stone never gives, the hole is the one
  he must use anyway, and the kill comes up it; confirmed a different trick by the designer,
  2026-10-09);
  Dendera's zodiac (a special stone, a blast, a jump over it, but the lip never kills and the blast
  comes from the hole he must enter); Gargas's fifth tread (the same demand on the hands, but this
  roof is the corridor's normal height and never kills); thrown back into the gap you crossed, Cap
  Blanc's horse and Karnak's rams (here he is blown back up the hole he is entering); the obelisk's
  feeling, which the knot shares; the ear-hunting hatches rejected in this level's first draft,
  whose decoy is this trick's undo. It is **not** the shape of the touchstone cows' fifth, nor of the sandal ruled to
  be it: the habit of identical holes is not what kills him, the relief is, and the hatch is marked
  before he reaches it. It is not Persepolis's column: no crack, and the bed is marked only by
  breath through a plain joint. Its clock is neither Rouffignac's chaser nor Gargas's lamp: nothing
  collects him; it only re-arms the hatch. Against the level: the knot's answer is a jump timed to
  a lean, this one a jump placed in space; the horns throw him in a somersault, this pastes him
  still on the ceiling.

**'The hands'** (beat e). The chapter's one bull crouches facing him, a human hand flat on a stone
each, and the hero leaps low over it. He leaps it, or walks up to it, and it stands up a man: it
lets go of the stones, claps him out of the air between its palms, flat like a fly, and drops him
at its feet. The joke is not that it was a man, which every player knows, but that a man has hands.
Its late edge: held by one horn, a stone raised in its left hand, it still has a free right hand,
and from L+46 to 67 it swats whatever is at its face or over its head, flat on its own brow between
the horns if he is in the air, flat on the floor before its knee if he is not.

- **A surprise the first time.** Five levels with no bull, a kilt bought to leap one, and at the
  door a kneeling figure he vaulted that ignored him.
- **Timing the second time.** One answer: go with the hero, after his leap and before his grip. A
  runner from the left-wall landing leaps at L+7 to 21 from the x 84 leap entry, or L+7 to 22 from
  the clean run's own landing: 15 or 16 frames at a hold of 16 or more, opening later at lower
  holds (L+9 at 14, L+12 at 12, L+17 at 10, never at 8). In the game (2026-10-09) it is L+7 to 21
  from both, 15 frames, at a hold of 15 or more; the lower holds are as here. A man who stopped leaps with the same
  timing from where he stands, 5 to 15 frames by place, as below. A stop after walking up from the
  wall never works, and nothing after the grip does: no go at L+23 or later survived, from the wall
  or from 37 steered landings (x 48–83), at holds 2 to 30 with back jumps at L+50 to 74. "Stop
  short, then go after the grip" no longer exists (designer, 2026-10-08).

  At rest where he landed (leap entries steered right), the best window by landing x:

  | Landing x | Best window, frames |
  |---|---|
  | 50 | 13 |
  | 55 | 10 |
  | 59 | 8 (7 in the game) |
  | 63–67 | 5 to 7 |
  | 71 | 9 |
  | 75–77 | 12 to 14 |
  | 77.4–80.5 | 15 (L+7 to 21, the runner's own; in the game 13 at 77.4, 14 at 78, 15 at 79–80, 16 at 80.5) |
  | 81 or more | a standing leap is clapped on the way up, so he steps back first (from 82.6, 12; from 84, 8; in the game 14 and 15) |

  Still running right as he lands:

  | Landing | Window, frames |
  |---|---|
  | x 74 | 12 |
  | x 79, at 43 px/s | 11 |
  | x 83.8 | 4 |
  | x 87.3 or more (at most 89.6) | none: caught like a man who runs in |

- **Only here.** The face of a bull, the rest human (Apollodorus 3.1.4); in Ovid a double form of
  bull and young man (*Met.* 8.169, line number unverified). It is set off by the chapter's costume
  and its refusal of the bull. Nothing else can be leapt as a bull and catch him as a man.
- **The closest tricks.** Philae's boat and "the ledge that takes no weight" are neighbours with
  other punchlines. It is not the carving that steps out: the bull is alive from the first frame.
  It shares "a jump timed to Theseus" with the knot, ruled distinct. The swat is its late edge,
  under its noun and with its answer, not a new trick. Its setups are the costume, the chapter's
  refusal of the bull and the vault at the door.

**'The horns'** (beat e). He has learned to wait for the hero. He sees the grip and the bull sink
to its knee with a stone raised, and lands on its back, the thing the kilt was bought for; the
heave swings the stone at the ducking hero and lifts him 20 px. The first blow frees the tossing
head, Catullus's horns tossed at the empty winds, and the winds are not empty: the bull-leap the
kilt was bought for is done to him. Hooked up and over in one full somersault with the kilt flying,
he is dropped flat; the lurch on the knees reaches the left wall within the toss. Nothing reacts.

- **A surprise the first time.** The last death taught him to wait for the man, and the head is
  still a bull's.
- **Timing the second time.** Stay on the back until the heave lifts it, then jump off its top to
  the wall, which is in reach only from the risen back. Leaps at L+7 to 19 jump off at L+59 to 68,
  10 frames; late leaps at L+20 to 22 (L+20 to 21 in the game) have the press buffered onto the
  risen back and jump off at L+53 or 54 to 68. It needs a hold of 14 or more; at 12 the window is
  L+61 to 68. Every retreat family escapes 0 times. Mashers: leap-then-mash 174 of 1,080,
  back-hoppers 7 of 56, rhythmic 927 of 2,560 (36.2 per cent). In the game: 31 of 1,080, 14 of 56
  and 912 of 2,560 (35.6); the design's copy counted a key still held as a new press, and the game
  does not. The stone's arc never crosses a live tourist: anyone at the face or
  over the head from L+46 has been swatted.
- **Only here.** Catullus 64.110–111, and MFA 60.1's horn, knee and raised stone. Only a
  bull-headed man held by one horn can do this.
- **The closest tricks.** The opposite of "the ledge that goes a beat after you land": stay until
  it rises, then jump at its top. Neighbours with other races: Cap Blanc's eighth horse, Dendera's
  dawn, Rouffignac's clock. Its setup is the hands' landing on the back.

**Pillar 8.** All four kill him themselves: the line, the jet, the palms and the horns. No water,
pit or fall finishes him, and no fall in the level kills: the worst survived fall in random play is
191.44 px (191.50 in the rules check's 18,450 runs). A swat counts as 'The hands', never 'The
horns'. The level's `dropCause` and `fallCause`, 'The labyrinth', cannot be reached, and nothing
needs to claim a death. In 3,240 random 40 s runs from 27 states the snort killed 908 times, the
hands 152 (101 claps, 51 swats) and the horns 263; 216 runs got out.

## The way of winning

Out by Ariadne's thread, laid by someone else, as the story beats it (Apollodorus, *Epitome* 1.9;
Catullus 64.112–115; Ovid, *Met.* 8.172–173, line numbers unverified). Reserved in
`content/tricks.md`.

- He never hurts the Minotaur and never helps kill it. Theseus's blows fall on his own clock; the
  heave that lifts the tourist and the hand that swats him are the bull fighting the hero.
- The way out is the hero's route reversed: along row 5 and up four look-alike rooms, where the
  thread goes up one of two identical openings and the other is a closed niche; up the column by
  the ledges the hero never needed and the pillar tops he landed on; down O1, back past the knot
  and out past the queue. He leaves first; Theseus comes out behind him with the body.
- He never chooses a turning himself: the thread does. He climbs every step himself, so nothing
  carries him along the way out or to its end, which keeps it clear of Farhad's reservation,
  winning by a channel's flow. The only lifts in the level are the bull's heave and its heap, in
  the fight.

## Deliberately wrong

- **The queue**: the tribute standing in a queue at the labyrinth's door (the designer's ruling;
  the vases put youths at the fight), drawn as one vase file, with Ariadne waiting at the door,
  facing it, from first to last.
- **The labyrinth's plan**, in plain masonry only, never Knossos, never a light well, never a
  Knossian door: the door storey, the vestibule, the passage and its mouth up to the hero's
  gallery; the corridors Z1, T2, T3, T and T_end with their drops; the 160 px hatch; the column of
  four shafts with ledges beside them; the cell, its 80 px far wall, row 5 and the hero's doorway.
- **Daedalus's turnings** as designed: four look-alike rooms with identical holes at both ends of
  the ceiling, closed niches and floor holes, a game's reading of the labyrinth's misleading ways
  (Ovid, *Met.* 8.159–168, at search-extract level, line numbers unverified; Catullus 64.112–115).
- **Black-figure for a section view.** The vases never draw the labyrinth in section; the masonry,
  the section and the thread in the vases' palette are the game's.
- **The thread** as the one pure white line, hanging straight past the ledges the hero never
  needed.
- **The knot test**: the lean, the slack running out, the line rising to shin height, the ball
  wedged at the inner end, the creak; the re-tie loop; the knot on the doorpost, where *Epitome*
  1.9 says only "the door". A yanked thread lying on a floor would drag its ball, not rise.
- **The hero's pace**: the 80 px mantle, the straight 96 px drops, the crouches paying out thread,
  180 px/s, a route that always arrives first, and the unseen wait in the black doorway.
- **The stride**: the boss at head height beside O1, and the hero drawn in front during the mantle.
- **The snort, all invented**: hearing through the floor; the sleep and the snore; knowing one
  sound; the feeding hatch; the dressed threshold and its two foot hollows; the bed under the floor
  and the beast's clock; the hollow knock and the ring; the drag; the twin plumes through the hatch
  and through a joint; the sniff; the jet and the ceiling. Hunting by footsteps is a modern monster
  trope. Ovid's *caecis tectis* (a dark, windowless building) and *bis pastum* (fed twice) are from
  memory, lines unverified, and give no roof and no hatch.
- **The Minotaur crouched** with a stone under each hand like forefeet, breathing. The Knossian
  stater shows a kneeling-running man; the pair of stones is from the Tampa hydria, unverified.
- **The clap** and its reach; **the free right hand** clawing over the brow, and the swat.
- **Theseus leaping low over the bull** onto the horn, in the vases' dress with the sword, never as
  a bull-leaper. No vase shows it.
- **The bull letting go of one stone** at the grip, heaving up off its knee to swing the other at
  the hero, and the duck. The stone raised in the left hand is MFA 60.1's; it is never thrown.
- **The fight's end**: the struck body lurching on its knees across the cell, and a man on its back
  tossed to the left wall. Two bloodless sword blows, where the vases show one thrust. The body
  sinking into a 24 px heap.
- **The sword itself.** *Epitome* 1.9 has fists; the vases have the sword, and the designer chose
  them.
- **The tourist standing on a bull's back.** The Bull-Leaping fresco's middle figure is in
  mid-vault.
- **The closing tableau** as a staged second copy: Theseus dragging the body to the doorpost as the
  tourist passes. The Aison cup shows the drag from the door; "by a horn" is unverified; Athena is
  omitted. The cup is, from memory, red-figure (unverified), so black-figure is wrong on purpose.
- **Theseus as the only solid person** in the game, and only while he kneels at the door.
- **The exit** is the game's, at the door he came in by, opened by the second blow.

## What is true and is doing the work

- The Minotaur had the face of a bull and the rest of him human; Minos shut him up in the labyrinth
  (Apollodorus 3.1.4). The building's ways mislead (Ovid 8.159–168, line numbers unverified), so
  only the thread tells.
- Athens sent seven youths and seven maidens as fodder (Apollodorus 3.15.8, unverified), every nine
  years in Ovid (in translation, at search-extract level); Theseus was one of the seven youths by
  his own offer (Plutarch, *Theseus* 17).
- Theseus fastened the thread to the door, drew it after him, found the Minotaur in the last part
  of the labyrinth, and got out by the thread (*Epitome* 1.9; Catullus 64.112–115; Ovid 8.172–173,
  line numbers unverified):
  the cell is at the bottom, and the way out follows the thread.
- The monster tossed its horns at the empty winds as Theseus laid it low (Catullus 64.110–111).
- On the vases Theseus has a sword and holds a horn, and the Minotaur sinks on one knee with a
  stone raised (MFA 60.1) or raises a rock (Lydos); Theseus drags him dead from the door (the Aison
  cup).

**Must be right.**

- The Minotaur's form: a bull's head on a man's body.
- Theseus as the vases draw him: a beardless youth in a short chiton, with a sword and scabbard
  (from memory; verify against public-domain publications of the vases).
- The horn in the hero's left hand, with MFA 60.1's knee and raised stone.
- The thread tied at the door (*Epitome* 1.9).
- No Picasso, Renault or other modern Minotaurs. Draw from public-domain publications of the vases;
  photographs are reference only.
- No painted names (pillar 2): no inscriptions or kalos-names, though many Attic vases label their
  figures (from memory).
- Added red only on fillets, beards and garment borders, never on a wound, a blow or the heap.

## Not in the level

- **The sandal**: Theseus, striding over a shaft, treading on the head of the tourist coming up it.
  Ruled a repeat (designer, on a recommendation, 2026-10-07): the touchstone cows' fifth told
  overhead, a lower jump living at the second of two identical gaps where the first held; also
  Dendera's ankh and the flint lip. The cows are kept for Cap Blanc's rebuild. "After you", the hero
  stepping down onto him, was the same joke. Aegeus's sandals under the rock (Plutarch, *Theseus* 3;
  Apollodorus 3.15.7, unverified) were to be its wink; no source puts them in the labyrinth. The
  stride is what is left.
- **The stone, thrown.** Round 1's Minotaur swung a stone back at the hero, who ducked, and it flew
  on into the tourist behind. It is swung at the ducking hero and never thrown (designer, on a
  recommendation, 2026-10-07), so it never kills and 'The stone' is no noun here. Its label would
  have been 'The stone', never 'The hero' or 'Theseus' (designer, 2026-10-07).
- **The dead-bull ride**: riding the dead Minotaur out of the door as Theseus drags it. A third
  answer on the bull's back; being carried to the end is Farhad's reservation; and it keyed a
  hazard to the tourist's landing.
- **A Minotaur that charges, turns or strides after him**: Karnak's scarab (`arc.md`, section 4),
  the obelisk or Rouffignac's train. This one crouches. Its tail swatting a leaper behind it went
  too.
- **Icarus and Daedalus**, shut in the labyrinth in Apollodorus (*Epitome* 1.12, unverified) and
  the only men to leave it by air. Icarus springing up the side of a shaft the tourist steered to
  needed them there during Theseus's visit, and its answer, a swerve in a fall, had Knossos's
  doors' shape. Their other verbs, the wings, the wax, the feathers, the fall, are spent families.
- **Minos's ring and Amphitrite's wreath** (Bacchylides 17, unverified), at sea, and **Aegeus and
  the black sail**, on the voyage home: never in the labyrinth.
- **Pasiphae** and Daedalus's hollow wooden cow (Apollodorus 3.1.4): it would spend the bull before
  the Minotaur, it collides with Cap Blanc's cows, and the cow is not in the labyrinth.
- **Renault and Borges**, both in copyright: Theseus the bull-dancer is Mary Renault's (*The King
  Must Die*, 1958), and the lonely Asterion is Borges's (1947). Theseus is never a bull-leaper, and
  the Minotaur is a monster, not Asterion.
- Also tried and dropped: **Daedalus's twin corridor**, a plain fall; **the first draft's
  ear-hunting hatches**, any monster under any floor; **Asterius under a grate**, which spent "it stands up a
  man" early; **the felled pine** (Catullus 64.105–109), Persepolis's column; **death by being
  lost** (Plutarch, *Theseus* 15), Knossos's; **the lyre leaving with the procession**, a joke on
  the game; **Ariadne's crown** (Hyginus, *Astronomica* 2.5, unverified), a light that lies; **'the
  fifteenth of fourteen'**, invisible without text.

## New in the engine

Being built, in this order, as a stage in the dev build (`#minotaur`, in `STAGES`, not on the map). Made so far, 2026-10-09, with rough art:

- **The resolveY fix, game-wide, first.** In `physics.ts`, a dynamic solid rising into a body whose
  old bottom was at or above the solid's old top puts the body on top, whatever the sign of his own
  vertical speed. In the harness and the fight of an earlier draft, without it, the bull's rising back
  pushed mashers through it: 690 of 5,440 leap-then-mash runs went below the cell floor and 17 fell
  out of the level, a death with no label. It is a collision fix under pillar 1, so every built
  level's tests are to be re-run with it (designer, on a recommendation, 2026-10-08). Made
  2026-10-09, with a second half the build found: a solid rising at its very edge under a man
  threw him across itself, sideways, in one frame; now it lifts him. Every built level is
  frame-identical with it in 6,168 random runs (`tests/physics.spec.ts`). Every number here
  assumes it.
- **`Camera.reset` on the spawn** (`LevelData.cameraOnSpawn`), since this level is 752 px tall,
  opt-in because four built levels would start differently with it. **The map**, cell for cell as
  the harness's, with the gated exit (`LevelData.exitAfter`) and the **per-level anchor for the
  exit card** (`LevelData.exitCard`, right-anchored here). Made 2026-10-09
  (`tests/minotaur.spec.ts`, `tests/level-options.spec.ts`).
- **The ear**, one entity at the hatch on spawn, read each tick before the fight's trigger, on the
  tick before's player, as beat d gives it: heard is on the ground with |feet − 576| ≤ 2, never
  exact contact. Its sounds: per-block steps (the ring on the lip, the hollow knock on the bed
  block), the drag on every change, the snore only while asleep at the hatch. The breath loop
  moves, on the frame of the change, between the hatch and the x 112 joint, drawn a plane behind
  him there. Made 2026-10-09 (`tests/minotaur-snort.spec.ts`), with the lip as its own tile and the
  level's masonry laid in two-tile blocks so the joints fall at x 80, 112, 144 and 176.
- **The snort's death**: its own drawing, a 5-frame sniff in place, 4 frames carried up the hatch,
  then pasted on the ceiling at y 528. It needs a death-frame position that differs from where he
  died: made 2026-10-09 as `World.kill(cause, at)`, which no other level passes.
- **The hero**, one scripted, non-solid entity replaying the harness's route frame for frame: drawn
  in front during the mantle, the foot on the boss at frames 68–70, the pay-outs animated,
  footfalls down to J3 and none from J2, in the doorway from frame 402. Solid only while he kneels
  at the door. Made 2026-10-09 with the knot and the thread (`tests/minotaur-theseus.spec.ts`); his
  route is data, a list of moves, and a fall can steer for the next hole once he is out of the one
  he fell through.

- **The fight**, keyed when his feet are 61 px down the hatch with x under 64: L = T0 + ceil((736 −
  feet) / (`PHYS.maxFall` × DT) − 1e-6), less one frame for how T0 is counted, as the harness had
  it; the tests pin the landing tick as L. No fight event or test waits for exact floor contact: the
  engine's 1 px ground probe lets a hopping man stand at 735.4 again and again. The clap's zone and
  the free hand's both kill as 'The hands', and the drawing picks the clap, the swat on the brow
  (in the air) or on the floor; the heave lifts the back as a rising solid. Made 2026-10-09
  (`tests/minotaur-fight.spec.ts`), with a hook for an entity to keep a floor in the camera's
  view (`Entity.keepsInView`), so the cell's floor stays on screen from L−7. The toss is drawn
  from the moment the lurching bull reaches him, never from where it caught him.
- **The closing tableau**, the queue and Ariadne, and the way out. The fight fires `secondBlow`,
  which opens the exit. Made 2026-10-09 (`tests/minotaur-out.spec.ts`), with the masonry's joints
  drawn only where two stones meet, so the two holes in each room are pixel-identical.

Still to come:

- **The black-figure art**: the palette, the four deaths' drawings, and the queue, Ariadne and the
  body as background figures, each with its asset note first. Everything above is drawn rough.
  (`LevelData.tricks`, 'The knot', 'The snort', 'The hands', 'The horns', and `dropCause` and
  `fallCause` 'The labyrinth', unreachable, are made.)

## Tests to pin

In Node, against the game's entities, not the harness: every number in beats b to f and in The
tricks. Above all:

- **The map**, cell for cell.
- **The falls**: none over 192 px anywhere, and none over 145 on the way out.
- **The knot's windows**, by hold.
- **The stride**: the foot over a resting head at frames 68–70, the hero frame-identical with and
  without him.
- **The ear's rule** on the tick before, never on exact contact, and the take-off bands.
- **No skip**: 39.00 px from the floor and 40.50 from the probe's stance, and x 165.69.
- **The clock**: its 50 frames, with its drag and never the ring, and its puffs; the runners,
  stoppers, taps and mashers.
- **The snort's death**: its frames, the snore silent until after it, and the joint's plume never
  over his legs.
- **The camera**: its caps (688 before T0, 650 in the frozen snort view), and the plume in frame
  from T for 69 frames or more.
- **The fight's key**, exact for every leap entry and never keyed on floor contact.
- **The hands**: the windows by hold and by landing, no go at L+23 or later, and the swat killing
  as 'The hands'.
- **The horns**: the back jump at a hold of 14 or more, no retreat escaping, and the masher rates.
- **The race**: the hero never in rock and in the doorway at yank + 402, at least 20 frames before
  the fastest tourist's L−8 by a per-frame beam, silent from J2, and on screen as in beat c.
- **The leaks and random play**: no leak in 20,000 random runs, and random play dying only by the
  four tricks.
- **The way out**: its turnings, niches and climbs, and no death after blow 2.
- **The clean run**, out at frame 1346.
- **The tableau**: its 49 frames, and the card clear of it.

## The designer's rulings

Twenty-five, from 2026-10-06 to the last, "accept all, write it up", on 2026-10-08. All are in
`arc.md` section 4, grouped, with their dates; each still standing is applied above: the boss
fight he cannot win and its "3 minutes" (a first visit); the sword; the Queue-Jumper; the queue at
the door; four counted tricks; the sandal ruled the cows' fifth; the staging, the falls and the art
accepted; the game-wide resolveY fix, made 2026-10-09; the stride; the hands' cautious answer
replaced, not tightened; the snort's clock and its bed; and the length, kept, with its two levers
for after playtesting. Rulings 9, 11, 14 and 17, on length, were superseded by 20, 21 and 25, and
ruling 7, the stone's label, became moot when the stone stopped killing.

## Sources

- Apollodorus, *Library* 3.1.4 and 3.15.8, and *Epitome* 1.9 (tr. J. G. Frazer, 1921):
  https://cts.perseids.org/read/greekLit/tlg0548/tlg001/perseus-eng2/3.1.3-3.1.4 ·
  https://fgh.perseids.org/read/greekLit/tlg0548/tlg002/perseus-eng2/1.9-1.12
- Ovid, *Metamorphoses* 8.152–260:
  https://fgh.perseids.org/read/latinLit/phi0959/phi006/perseus-eng3/8.152-8.260 ·
  https://sacred-texts.com/cla/ovid/meta/metal08.htm
- Catullus 64: https://fgh.perseids.org/read/latinLit/phi0472/phi001/perseus-eng3/64.75-64.137 ·
  https://fgh.perseids.org/read/latinLit/phi0472/phi001/perseus-eng3/64.110-64.117 · Wikipedia,
  "Catullus 64", for the Latin of 64.110–111; R. F. Burton's translation.
- Plutarch, *Theseus* 15–17 (tr. B. Perrin):
  https://fgh.perseids.org/read/greekLit/tlg0007/tlg001/perseus-eng3/15.1-16.1
- The vases: the black-figure amphora MFA Boston 60.1 (collections.mfa.org); Lydos's amphora, Getty
  86.AE.60; the Tampa hydria (unverified); the Aison cup, Madrid (L196). Draw from public-domain
  publications of them; photographs are reference only. Silver staters of Knossos, about 440 BC.
- For the rejected ideas only: Plutarch, *Theseus* 3, and Apollodorus 3.15.7; Bacchylides 17;
  Hyginus, *Astronomica* 2.5; Apollodorus, *Epitome* 1.12.
- Never: Mary Renault, *The King Must Die* (1958); Borges, "The House of Asterion" (1947); Picasso.

## Confidence

**How this was checked.** The myth was read through web search, at search-extract level. Full texts
at Wikipedia, Wikisource, Gutenberg, archive.org, Perseus and theoi could not be fetched through
this machine's proxy, so no text was read in full and no vase was looked at. The level was designed
in five drafts, 2026-10-06 to 2026-10-08, and simulated on engine copies with the proposed
resolveY fix, driven by a scripted harness that is not in the repository. Three adversarial checks
(rules; comedy and myth; physics) checked the final draft; the physics check wrote its own harness
from the draft's text and matched the map cell for cell and the clean run to the frame. The
revision made after the checks (the swat's noun and the counts by noun, the boss at x 206–215, the
clock's puffs, the snore held back from the ring) was re-run on the designer's harness only. Nothing is built, and nothing is pinned in
Node.

**Solid, at search-extract level.** The Minotaur's form and the labyrinth (Apollodorus 3.1.4); the
thread fastened to the door, the last part of the labyrinth, the fists, the way out (*Epitome*
1.9); Theseus the seventh youth, and Aegeus casting the lots for the rest of the youths (Plutarch,
*Theseus* 17); the horns at the empty winds and the thread out of the maze (Catullus
64.110–115); in Ovid, *Met.* 8, the Maeander simile and *tanta est fallacia tecti*, the
double form of bull and young man, the tribute fed on Athenian blood every nine years (in
translation) and *filo relecto*, with every line number unverified; MFA 60.1's horn, knee and
raised stone; Lydos's rock; the Knossian silver staters of about 440 BC, kneeling and running.

**Unverified, so ask before painting:** Apollodorus 3.15.8's "fodder" (the design's readings disagree
on whether it was read); Ovid's line numbers, and *caecis tectis* and *bis pastum*, from memory;
Theseus's dress on the vases (beardless, short chiton, sword and scabbard); the Tampa hydria's pair
of stones, and whether any vase shows the Minotaur crouched; the Aison cup's number, its red figure
and "by a horn"; which vase gives the tribute and Ariadne in a file (the François Vase, from
memory); Frazer's note that the thread was tied to the lintel.

**For playtests to settle.** The trickless way down, 7.83 s, replayed before every death after the
knot, about 40 per cent of a first visit (ruling 25 names two levers, 64 px corridors at 7.50 s or
an honest, uncounted jump, and leaves the choice to playtesting). A player trained by the snort who
freezes in the cell, and so sees the grip, the clawing hand and the stone before he is ever
clapped, which spends "it stands up a man". Whether every fight, following his step that sent the
beast to its bed, reads as the tourist being bait (pillar 11), despite the mitigations. Whether a
muted stopper sees that his pause brought the beast back: the clock's puffs show it coming, not
that he caused it. Whether the race reads: on T_end the hero is a head and chest for 13 frames,
which first-timers miss (14 in the game), and on Z1 he is off screen for 58 of 109 frames, so his step-out carries
"how did he get here first". Whether the fight's two seconds hold the clawing hand as well.

**Open risks.** The hands' windows depend on where he lands: 13 to 16 frames at the wall, 15 at the
face, 5 to 8 at x 59 to 67, none for an entry still running right at x 87.3 or more. An expert's
first step on the bed (yank + 360) comes while the hero is still visibly dropping, silent. The
no-skip margin is 1.5 px in the game; the race margin rests on heuristic beams. The design parts from the checks
in three places: the clock's 34 to 42 frames for runners (the physics check: 34 to 38; hold 5's far
take-off measures 42); the runner's 15 to 16 frames (L+7 to 21 from the x 84 entry, 22 from the
clean run's landing); the boss at x 206–215 (the comedy check: 206–214), to cover 30 of 31
survivors. In the game the toss's zone is the whole cell up to 64 px from L+76 to 105, but the
lurch never sweeps all of it: a man who jumps off the back too late waits by the far wall about
24 frames for the back to come round, and 17 of 2,044 retreat runs land where nothing reaches
them, so the head lunges out on a stretched neck. Shrinking the zone to the lurch's reach would
change the kill, and is the designer's call.

**Not designed.** How Tiryns's grand feature hands him to the door; the room the chapter's lyre is
heard in here (`../CHAPTER.md`, The sound); the asset notes.
