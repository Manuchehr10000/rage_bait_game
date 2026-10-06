# Chapter 4 · Level 1 · Persepolis

Takht-e Jamshid, on the Marvdasht plain in Fars, built against the western foot of Kuh-e
Rahmat. Darius I began it about 518 BC, Xerxes and the kings after him built on, and it burnt
in 330 BC under Alexander (`arc.md`, c. 518–330 BC). Everything stands on a **terrace** of about
300 × 455 m (Iranica, "Persepolis"), 9 to 17 or 18 m over the plain along its length and partly
cut from the mountain. Its blocks were laid without mortar and held by dovetail clamps of iron
and lead. Most of the clamps have been robbed since, and that is what let courses of the
façades fall (Iranica, "Construction materials and techniques").

The terrace is reached by one way up: the **Stairs of All Nations**, built under Xerxes in a
recess of its north-west wall. Before it, the main way in was from the south (Livius). Each of
its two flights goes up 63 steps to a landing, turns twice through a right angle, and goes up
48 more to meet the other flight at a second landing. The stair is 6.9 m wide; its risers are
10 cm and most of its treads 31 cm, some 38 or 40; often four or five steps are cut from one
block (Iranica; Livius).

The palaces were built of **mud brick round a frame of stone**: the stairs, the door and window
frames and the great halls' columns were stone, the walls mud brick, the Apadana's 5.32 m
thick. The mud brick has gone. What a visitor sees is the stone standing on its own: frames
with no walls, columns with no roof, carrying nothing.

**Ernst Herzfeld** dug for the Oriental Institute of Chicago from 1931, with Friedrich
Krefter; **Erich Schmidt** followed to 1939 (ISAC). In 1931–34 Herzfeld uncovered the
Apadana's **east stair** from under the mud brick that had fallen on it, which is why its
reliefs are crisp, while the north stair, always exposed, is worn. The Italian mission, IsMEO,
restored much of the site from 1964 until 1979 (Motamedmanesh, *Arts* 2016). Since the
mid-1990s the east stair has stood under a permanent shelter, a flat roof on steel posts
(Lonely Planet; before it, from 1950, a folding wooden roof: *Science of the Total Environment*
2016).

And the thing the level is built on: **the audience nobody gives.** The centre of each of the
Apadana's stairs once carried the audience relief, the king on his throne giving audience. Both
were taken out in antiquity, for reasons nobody knows, and set up in the Treasury; the one from
the north stair is now in Tehran, the one from the east stair is still in the Treasury (Oxford
Cabinet; Livius). What stands in the centre of the east stair today is a winged disc between two
seated sphinxes, a plain band, and under it four guards on each side, spears upright, facing in
toward a blank. Every delegation on the stair walks toward that blank.

## What this level is for

It opens the chapter, so it plants the chapter's truths and spends two tricks set up inside
itself (`arc.md`, section 1). It teaches three things:

- **The stair is the only way up, and it is a ramp.** The terrace and the Tachara's platform
  are reached by their stairs and nothing else. A riser of 10 cm is about a pixel at his scale,
  so every stair in the level is walked as a slope of 1 in 3, the real pitch: no jump, no step to
  hop, nothing to time. It is the chapter's signature (`../CHAPTER.md`).
- **Stone stood; mud brick went.** The Gate's two columns, the Tachara's window and niche blocks
  and door frames, the Apadana's columns: all stand alone and carry nothing. They are background,
  like the bulls on the Gate's piers, and he walks past them and through them. In the Gate's
  hall one cracks and holds, and its twin, uncracked, comes down on him once he is past it (the
  first trick). Of the hall's four columns, two or three still stand; the rest fell.
- **The delegations and the guards face the empty centre.** On the east stair the delegations
  walk toward it and the guards face the blank. The game turns the lions on the flights the same
  way (Deliberately wrong), and the sphinxes face the disc above it.

> Persepolis: the stair is the only way up, and it is a ramp.

Nothing lies in beats a and c, and nothing there moves. Two tricks: the Gate's columns in
beat b, and the audience in beat d, the last trap, on a cycle, as pillar 5 allows. No fall
anywhere in the level can kill.

About **15 seconds clean** (pillar 7). Five beats, one of them the exit, and two tricks: the
level was built with one (ruling 7, `../CHAPTER.md`), and the designer added the columns on
2026-10-06. Built, the knowing run is 16.95 s from the spawn, 1.37 s of it standing: 0.54 s
behind the falling column's foot while it comes down, 0.83 s in the king's place
(`tests/persepolis.spec.ts`). By beat: the plain and the stair about 4.9 s, the Gate about 3.4
with the step back, the Tachara 3.6, the court 5.0 with the standing in it, the exit a tenth
of a second. Before the columns it was 15.83 s, and the Gate 2.3.

## The beats

| Beat | Folder | What the player meets | Death label | What is true |
|---|---|---|---|---|
| a | `a-stairs` | He walks in off the left edge onto the plain. The Stairs of All Nations: 63 low steps up, a landing, 48 more, run like a ramp without a jump. Nothing lies | — | The terrace's one way up; 63 steps to a landing, 48 more; risers of 10 cm, treads of 31 |
| b | `b-gate` | The terrace. The Gate of All Nations: between the plain bulls of the west portal, through the hall past two broken columns and the black benches, out between the human-headed winged bulls of the east portal. Names scratched high on the piers. The west column cracks as he comes up to it, and holds. The east column, uncracked, comes down the way he is going once he is past it. **The trick: 'The column'** | "The column" (crushed) | Xerxes' gate: bulls facing west, winged bulls facing east, the benches where delegations waited, more than 200 visitors' names cut since the seventeenth century; of the hall's four columns, two or three stand |
| c | `c-tachara` | A low stair up onto a platform. Two doorways in section, their frames in dark, polished stone, a lintel over him in each, the king walking out of his hall on each far jamb. A window block and a niche block standing alone, the same from outside. A stair down. Nothing lies | — | Darius's palace, the "Hall of Mirrors": the mud brick gone, the stone frames standing alone, each window or niche one block; the king with his parasol bearer on the jambs |
| d | `d-apadana` | The east court under the shelter, the east stair's façade the back wall. In its centre, four guards a side facing a blank. Run across, and as he passes the blank they step out of the wall into the court and stand; he runs into the right-hand file. **The trick: 'The audience'** | "The audience" (carved) | The central panel of the Apadana's east stair: guards facing a blank where the audience relief was, taken out in antiquity |
| e | `e-exit` | Past the north end of the façade, the game's own exit | — | The façade ends; the exit is the game's, not the site's |

### a · the Stairs of All Nations

Honest. He walks in off the left edge onto the Marvdasht plain (pillar 13); a retry starts him
on the plain at x 24. The stair begins at x 96.

- **The first flight** rises 64 px over 192, to a landing 32 px long; **the second** rises 48 px
  over 144, to the terrace at 112 px over the plain, about 12 m. Both are 1 in 3, and so are the
  Tachara's two. The masonry fills under them.
- **Each step is a pixel.** At 9.4 px a metre a 10 cm riser is 0.94 px and a 31 cm tread 2.9 px,
  so the game draws a step for each pixel of rise: 64 on the first flight, one more than the
  real 63, and 48 on the second. Each flight's run is within a metre of the real one at 31 cm a
  tread.
- **He runs it like a floor.** Running and walking, up and down every stair in the level, he is
  never off his feet, never stopped and never held back, and no step is a fall. A full jump
  from low, middle and high on every stair, forward, back or straight up, is a full jump, about
  61.8 px, and comes down on the stair or a floor. **As built:** `tests/persepolis.spec.ts`
  drives both against the real physics, and the slope contract in `tests/levels.spec.ts` pins
  the stairs' ends to tile corners with the masonry wholly under the line. A dev teleport into the masonry under a stair puts him on the
  stair.

### b · the Gate of All Nations

The level's first trick. Everything else here is in depth: nothing else is solid, nothing else
moves.

- **The west portal** (tiles 31–32): its piers about 10 m high (94 px), the plain bulls carved
  on the passage walls facing west, toward the stair he has come up. He walks between them.
- **The hall** (tiles 33–39): two columns standing at their real height, about 16.5 m (155 px),
  running off the top of the screen like the Apadana's, the west one at x 564 and the east at
  610; along the back wall the polished black benches where the delegations waited. The two
  columns are one drawing, pixel for pixel, until the west one cracks.
- **The cracked column.** As his centre crosses x 524, in the west portal between the bulls, the
  west column cracks: a crack runs across its shaft at the height of his head and above, three
  chips drop out of it, it leans 1.15° east, and the stone cracks once. It holds, and it never
  falls: he may stand under it or past it as long as he likes.
- **The column that falls.** The east column never cracks. Once all of him is 2 px past its
  shaft it waits 0.4 s; then the plinth stays and the shaft comes down the way he is going,
  turning on the east edge of its foot as a rod of its length falls under the game's gravity,
  from a start of 2 radians a second: 0.48 s from upright to the ground, with a crumble as it
  goes and a thud as it lands. It comes down on him where his centre is: east of its foot and
  within its reach, wherever the shaft is at the height of his body there. Behind its foot he
  is safe. It comes to rest at 81.7°, its broken top on the Tachara's stair at about x 759,
  across the hall and in front of the east portal's winged bull, and lies there in depth, like
  every column in the hall: he walks on over the floor and up the stair in front of it. A man
  who never passes it is never fallen on, however long he waits.
- **First attempt.** The west column cracks as he comes up to it, and he braces for it to fall,
  or runs past it before it can. It does not fall. He runs on past its twin, and the twin comes
  down on him from behind: 147 px of shaft is down 0.9 s after he passes it, and nobody
  outruns that. Under it he is
  pressed down as far as the shaft over him has come. Label: **The column.**
- **Second attempt.** Step past the east column and straight back behind its foot, and let it
  fall; then walk on. From a run, turning back the moment he is past it, he has 6 frames to
  spare; walking up to it, stopping short and creeping over the line, 17. Stopping past it, or
  turning back half a second late, puts him under it.
- **As built:** `tests/persepolis.spec.ts` runs the real player through the Gate in Node, with
  both columns: the cracked one holding wherever he stands; the runner under the falling one;
  the fall under 0.6 s, one crumble and one thud, its top on the stair to within half a pixel;
  the stop past it and the late step back crushed; the step back from a run with 4 to 9 frames
  to spare and from a creep with 12 or more; a man who waits short of it never fallen on; and
  the fallen shaft in depth, walked past. In the browser, the two columns drawn pixel for pixel
  alike before the crack.
- **The east portal** (tiles 40–41): the human-headed winged bulls, facing east, the way he is
  going. Never animated.
- **The names.** Three visitors' names scratched high on the piers, never legible (pillar 2).

### c · the Tachara

Honest. The chapter's second truth, in one picture: the stone frames of a palace whose walls
have gone.

- A stair up from the terrace, 1 in 3, to the platform 32 px above it, built of the terrace's
  grey masonry: only the frames on it are the dark, polished stone; across the platform,
  128 px; a stair down the other side, into the Apadana's court.
- **Two doorways in section**, at tiles 50 and 54. Each is a stone lintel a tile wide and a tile
  thick, its underside 48 px over the platform: he walks under it, and a jump under it bumps it
  and nothing happens. Behind each doorway, on the far jamb, the king walks out of his hall
  under a parasol an attendant holds over him: on the west doorway he faces west, on the east
  doorway east, so on both he is leaving.
- **The window block and the niche block**, one of each, standing alone on the platform in the
  dark polished stone, each a block 2.65 m square under a cavetto cornice. From outside a window
  and a niche are the same, and the game draws them the same.

### d · the Apadana's east court

The level's second trick and its last trap. Down the Tachara's stair into the court; the clock
starts as his centre crosses x 992, the foot of that stair.

- **The back wall** is the east stair's façade, from x 1008 to 1360, under the shelter: a short
  stretch of the south wing (three registers of delegations walking right, the groups set off by
  cypresses, each led by an usher holding its leader's hand); the left flight's triangle, a lion
  leaping on a bull among cypresses; the **central projection**, 104 px wide; the right flight's
  triangle, mirrored; a short stretch of the north wing, Persian and Median nobles walking left;
  the north end. Above and behind it, the Apadana's platform and eight of its fluted columns,
  broken off above the top of the screen at irregular gaps. Over the façade and a strip of the
  court, the shelter's flat roof, its underside 96 px over the court, where no jump reaches.
- **The central projection.** At the top a small, plain winged disc between two seated sphinxes
  that face it: never animated, never a gag (ruling 6, `../CHAPTER.md`). Below a plain band, two
  files of four guards, each 9 × 22, shoulder to shoulder, facing in, spears upright: the left
  file from x 1140 to 1176, the right from 1192 to 1228. Between them the blank, 16 px wide, from
  1176 to 1192, centred on 1184: the king's place. The span from the first guard to the last is
  88 px.
- **The clock.** The first step-out is 2.14 s after the trigger, and then one every 2.44 s:
  stepping out 0.12 s, standing out 0.6 s, stepping back 0.12 s, in the wall 1.6 s. They step out
  of the wall into the court where each is carved, and back; nobody moves sideways and nobody
  steps into the blank. From the middle of stepping out to the middle of stepping back, 0.72 s, a
  guard's body in the court kills at a touch. They are never solid. Each step-out is one stone
  grind, one guard's, heard only while the court is on screen.
- **First attempt.** The court is empty and the exit is beyond it, so he keeps running. He is
  wholly in the blank as they step out (x 1179), untouched, and runs on out of it; 0.06 s later
  he is dead with his leading edge 3 px into the right-hand file. He is left where he died as a
  stone figure of himself, upright, in profile, facing the centre like the guards round him, in
  the stone's colours, lit from the upper right. It is drawn in front of the guards, pressed flat
  against the inner guard who caught him: most of him over the right-hand half of the blank, the
  rest over that guard. A thud. Nothing else reacts. Label: **The audience.**
- **Second attempt.** Two answers, both pinned by the tests across a spread of timings:
  - **Stand where nobody may stand.** Let go of the key as he reaches the blank. He stops inside
    it if he lets go anywhere from 2.75 px before its left edge to 3 px after: 5.75 px, about
    four frames at a run. They step out and stand round him, step back, and he walks on. The
    knowing run does this and stands 0.83 s.
  - **Go while they are in the wall.** Stop short of the left-hand file, watch them go out and
    back, and go at once. Stopped about 4 px short, any start up to 0.48 s after they are back
    gets him across both files; stopped 14 px short, up to 0.38 s. The crossing takes about
    1.1 s of the 1.6.
  - Jumping a file while they are out is possible and allowed: a guard is 22 px, and the
    shelter is out of reach of any jump.
- **As built:** the runner is in the king's place as they step out for any first step-out from
  2.105 to 2.18 s after the trigger; 2.14 sits near the middle. `tests/persepolis.spec.ts` pins
  the runner's death in the right-hand file, five release points from 2 px early to 2 px late,
  five starts from 0 to 0.4 s after they step back, one grind per step-out and one thud for the
  death, and that the eight guards are one body and stand in the façade's own centre.

### e · the way out

Honest. Past the north end of the façade, on the terrace, the game's own exit at x 1376, the
posts and bars that end every level. There is no turnstile at the Apadana, and the exit does not
pretend to be one.

## The tricks

Both are claimed in `content/tricks.md`.

**'The column'** (beat b). Designed by the designer, 2026-10-06. Two columns, one drawing. The
west one cracks as he comes up to it, and he braces for it to fall, or runs past it before it
can. It holds. He runs past the east one, uncracked, and it comes down on him from behind. Once
known: step past it and straight back behind its foot, and let it fall.

- **A surprise the first time.** Nothing in the level has moved before it. The crack points at
  the wrong column: the one that cracks holds, for good, and the whole one falls. The punchline
  is *which*, and *when*: after he has gone by.
- **Precision the second time.** Knowing which column falls is not enough. It falls 0.4 s after
  he is past it and he cannot outrun it, so he must cross its line and be back behind its foot
  inside that: 6 frames to spare from a run, 17 from a creep.
- **Only here: weakly.** A column that falls fits any columned site, and Knossos's burnt column
  and Karnak's obelisk are already falling shafts. What ties it to Persepolis is the Gate's own
  hall: four columns once, two or three standing now. The designer accepted this.
- **The closest tricks.** The designer's touchstone obelisk (`content/tricks.md`) cracks, holds,
  and comes down behind him once he is past it; it is answered by outrunning its length. It is
  kept for Karnak's rebuild, and this is built to be its subversion: once Karnak has taught that
  a cracked stone comes down behind you, here the cracked column holds, its whole twin comes
  down, and the answer is the opposite, to go back, not on. Until Karnak is rebuilt, the setup is
  the crack in this level alone. "Something comes down where a runner is going" (spent four
  times before 2026-09-26) comes down ahead of him; this comes down behind. Knossos's burnt column
  lets a span down on whoever is under it; here nothing is overhead.

**'The audience'** (beat d). Its shape is nearer the obelisk's than the cows': the setup is honest
and the punchline is *where*. At the moment it fires he is standing in the one safe place, and he
runs out of it.

**'The audience'** (beat d). Everything carved in the level so far is a carving and stays one:
the bulls on the Gate's piers, the king on the Tachara's jambs, the delegations along the wings
of the east stair. Everything on the façade faces its centre, and the centre is empty: four
guards a side facing a blank. The court is empty too, and the exit is beyond it. As he crosses
the blank the guards step out of the wall into the court, each where he is carved, and stand.
Nobody moves sideways and nobody touches him: he is in the king's place, the one place nobody
steps into. He runs on out of it into the right-hand file, and the inner guard catches him: he
is left there in stone, upright, in profile, facing the centre, pressed flat against the front
of that guard, one more figure in the audience. Once known: let go of the key at the blank,
inside a window of about four frames, and stand while they are out; or stop short of the files
and cross in the first half second after they step back.

How it passes the three tests (`content/tricks.md`):

- **A surprise the first time.** Nothing in the level has moved. The bulls, the king and the
  delegations are background, and the guards are drawn in the same stone by the same hand. The
  runner is unharmed at the moment the trap fires, and dies a step later.
- **Timing or precision the second time.** Knowing where they stand is not enough: the stop is a
  window of about four frames, and the crossing must start within about half a second of their
  stepping back. A hesitation in either costs the run.
- **Only here.** A panel put in the place of the king's audience when that relief was taken out
  in antiquity: guards on both sides of a blank, in the centre of a wall every delegation walks
  toward. The death leaves him in stone against the guard who caught him, one more figure facing
  the king's place.

**The closest spent tricks, and why this is not them.** Philae's Isis, a figure in sunk relief
that steps out and shoves him back, and Karnak's rams, which turn and butt him back into the gap
he crossed, are the same fuse: a carving that moves. Both shove, and their answer is to time the
pass. The guards never push and never move sideways; he dies only by being where a guard stands.
Neither answer is new. The first, stopping in the gap between the two halves while both are out
and then walking on, overlaps Knossos's doors: there both leaves sweep the outer hall on one
clock, and the answer is to wait in its middle. The second, crossing both files in one window
while they are in the wall, is the ordinary pass on a clock. What is new is the punchline and the
precision. The punchline: he is unhurt in the king's place at the moment the trap fires, and is
killed by running out of it into the right-hand file. At Knossos the second door kills by folding
the other way from the first, the cows' shape; here the two files are the same and step out
together. The precision: a 16 px gap and a release window of about four frames, against
Knossos's 68 px of hall. Whether that is enough to make the trick new is for the designer to
confirm (Confidence).

**Pillar 8.** The column and the guards kill him themselves: no water, no pit and no fall
finishes him, and no fall in the level can kill at all. Persepolis declares two tricks, 'The
column' and 'The audience', and every death in the level but giving up is one of the two.

## Deliberately wrong

- **The stair is unfolded.** Each real flight of the Stairs of All Nations goes up 63 steps,
  turns twice and goes up 48 more, meeting its twin at the top, in a recess of the terrace wall.
  The game has one plane, so one flight is unfolded into one climb going east: 63 steps, a
  landing, 48 more.
- **The first flight is drawn with 64 steps for the real 63**: the grid puts the landing on a
  tile, at 64 px; the second is 48 for 48.
- **One height for the whole terrace**: 112 px, about 12 m, its height at the stair. The real
  terrace is 9 to 17 or 18 m along its length.
- **The Gate is small.** Its hall is about 25 × 25 m; the game's is seven tiles, about 12 m, along
  the walk. The portals' height, about 10 m, is right; their depth along the walk is the game's.
- **No capital in the Gate.** The hall had four columns of about 16.5 m. Two or three stand
  today, one of them re-erected by IsMEO with a stone capital set on it for 1971 (Motamedmanesh,
  *Arts* 2016). The game stands two at their real height, about 16.5 m (155 px), running off the
  top of the screen like the Apadana's, and leaves the capital out.
- **The Tachara's platform is too high**: 32 px, 3.4 m over the terrace. Sources give 2.2 to
  3.0 m. Two tiles is the nearer of the heights the grid allows.
- **The Tachara is reduced to a row.** Its hall is about 15 × 15 m with sixteen windows and
  niches and its doorways round it. The game puts two doorways, one window and one niche in a row
  along the walk, and shows the doorways cut through, lintel and all. Its stairs are plain slopes,
  up its west side and down its east; the real ones are a carved stair on the south and one on
  the west added later (Not in the level).
- **The king on the jamb has one attendant**, the parasol bearer. The real jambs also carry a
  smaller attendant with a towel or fly-whisk. A painter may put him back.
- **The route is straightened.** The Gate, the Tachara and the Apadana's east court are not in a
  row on the terrace. Their order and spacing along the walk are level design (`arc.md`,
  invariants).
- **The east stair is turned to face him.** It faces east, onto its court, and a visitor stands
  in the court and looks west at it. In the game it is the back wall of a court he crosses from
  west to east.
- **The façade is short.** The game draws a short stretch of each wing: a few groups of the south
  wing's twenty-three delegations, a few of the north wing's nobles.
- **Every figure faces the centre.** The game turns every figure, the lions and the bulls too,
  toward the centre. The real lion and bull directions are not checked, and some nobles turn back
  to talk.
- **One Gate column cracks and holds, and the other falls,** on a clock he starts. Which of the
  hall's columns stand today, and whether columns stand in the game's two places, is not checked.
  The falling shaft falls whole, as a rod turning on its foot, under the game's gravity, which is
  about eleven times the earth's at his scale, and from a start no column has; the plinth stays
  where it stood. A real column of drums would come apart as it fell. Fallen, it lies across the
  walk in depth, and he walks on in front of it.
- **The guards are one figure, eight times.** The sources say Persian and Median guards. Which
  stands where is not verified, so all eight are one stamp (pillar 4), as on the map plate.
- **The guards step out of the wall, stand in the court and step back, on a clock.** They are
  carved, and have never moved.
- **The blank is as wide as the trick needs**: 16 px, 1.7 m, his own height, with 6 px to spare
  round his body. The real blank's width, and the guards' real height, are not checked.
- **Eight Apadana columns, chosen.** Fourteen stand. Which of them can be seen from the east court,
  and where, is not checked; the game's eight are 200 px high (about 21 m, inside the disputed
  range) at irregular gaps, and their tops are off the screen.
- **The shelter's height is the game's**: its underside 96 px, about 10 m, over the court, so that
  no jump reaches it. Its real height is not checked.
- **No barrier and no workshop.** The barrier that keeps visitors off the reliefs and the
  restoration workshop at the Apadana's east portico (2025) are left out. He walks along the
  foot of the façade, where nobody may.
- **The light comes from the upper right**, the game's rule. The real east façade is lit in the
  morning from behind a visitor in the court.
- **He leaves past the north end of the façade**, by the game's exit. Where visitors leave the
  terrace is not checked.
- **Scale.** He is 1.7 m in 16 px, so a metre is about 9.4 px. The stair's pitch and rise, the
  terrace at the stair, the portals, the Gate's columns and the window block are to that scale;
  the Gate's hall, the Tachara's platform and the façade's length are not. Spacing, sequence and
  jump distances are level design (`arc.md`, invariants).

## What is true and is doing the work

- The terrace is reached only by its stair, and the stair's risers are 10 cm: a visitor climbs
  it as a ramp. The game's slope of 1 in 3 is its pitch, a pixel a step is its riser (112 drawn, one
  more than the real 111), and 111 steps of 10 cm come to 11.1 m against the game's 11.9.
- Stone stood and mud brick went. The Gate's columns and the Apadana's stand without capitals or
  roof; the Tachara's frames stand without walls.
- The Gate's west portal has plain bulls facing west and its east portal human-headed winged
  bulls facing east; the hall had polished black stone benches, where delegations waited; more
  than 200 foreign visitors cut their names at Persepolis from the seventeenth century on,
  most of them on the Gate and the Apadana (Iranica, "Persepolis graffiti").
- The Tachara is the "Hall of Mirrors", for its dark, polished limestone. Each window and niche is
  one block with an Egyptian cavetto cornice, and windows and niches look the same from outside.
  One window block is 2.65 × 2.65 × 1.70 m and weighs about 18 t; a door frame of three monoliths
  about 75 t. On the doorjambs the king walks out with a parasol held over him.
- The east stair was buried until 1931–34 and is crisp; it has had a permanent shelter since the
  mid-1990s. Its south wing carries twenty-three delegations, each led by an usher holding its
  leader's hand; its north wing Persian and Median nobles and guards, some turning back to talk;
  its triangles cypresses, date palms and a lion leaping on a bull; its centre the winged disc,
  two seated sphinxes, a plain band, four guards each side facing in, and the blank (Livius).
- The guards and the blank between them stand where the audience relief was, which was taken
  away in antiquity. Each delegation's usher leads it toward the king in the centre, and the
  guards face in (Livius).

## Not in the level

- **Kuh-e Rahmat and the royal tombs cut into it,** above the terrace to the east: never in
  frame (graves, ruling 4, `../CHAPTER.md`).
- **The audience relief itself.** It is in the Treasury, and the one from the north stair is in
  Tehran. Why the reliefs were moved is not known; the level takes no side.
- **Capitals.** None is drawn. Whether any standing Apadana column keeps the lower members of its
  capital, the corolla and the volute block, is open (`content/map/monuments/map-monument-ch04-persia.md`,
  Contested). The column tops, the Gate's and the Apadana's, are above the screen.
- **The disputes in `arc.md` section 7,** none settled by the level: the Apadana's column height
  (16.5 m in one source, 19–20 m in Iranica, 24 m, 25 m in Livius), the capital's (5.8 m or about
  8 m), when the fourteenth column was re-erected (1965 or the 1970s), and the animal on the east
  portico's capitals (double lions, or Schmidt's unspecified "addorsed animals"). The level's
  columns go off the top of the screen.
- **The north stair**, worn, and its globes that were wool bales (Livius; one source). Off the
  route.
- **The Tachara's carved stairs**: the south stair, double and reversed, with servants carrying
  food and kids up it, some with their mouths covered, and the west stair added by Artaxerxes III
  (Iranica; Livius). Its twelve wooden columns are gone.
- **Storks.** Recorded on the columns from 1704 (de Bruijn), not confirmed today, not drawn.
- **The fire of 330 BC, the tablets, the "Harem" rebuilt as a dig house**: `../CHAPTER.md`, Error
  dossier.
- **The gecko** *Cyrtopodion persepolense* (Nazarov et al. 2009), known only from Persepolis, on
  its walls. It is at most about 10.6 cm with its tail, no more than a world pixel:
  `easter-eggs.md` only.
- **Other visitors.** Nowruz brings crowds, about 470,000 between 19 March and 2 April 2025, and
  restorers were working in 2025 at the Apadana's east portico, the Tripylon and the tomb of
  Artaxerxes III. As in every level, he is alone.
- **The Tripylon, the Hadish, the Hall of a Hundred Columns, the Treasury**: off the route.

## New in the engine

All of it is built (2026-10-03), rough and drawn by code.

- **Slopes.** A level's `slopes`: the floor under a slope is its line, walked and run without a
  jump and never slowing him; a jump on one is a full jump. The dev teleport lifts him onto a
  slope's line when it puts him down in the masonry under a stair. A slope contract in
  `tests/levels.spec.ts`: ends at floor tops on tile corners, tiles wholly under the line,
  headroom, none in the walk-in. No earlier level has a slope, so nothing earlier changes.
- **The guards**, one entity on the Door pattern: two files on one clock started by a line,
  each guard's place and facing, how far out of the wall they are and in which phase, deadly from
  the middle of stepping out to the middle of stepping back, never solid, one grind per step-out
  while on screen. The dev overlay shows the trigger line, the blank in green and the files in
  red, filled while deadly.
- **The death 'carved'**, new: he is drawn as a stone figure of his own idle frame, in the
  stone's colours, upright and facing the centre, at the place he died: in front of the guards,
  pressed flat against the inner guard who caught him. Its sound is the thud.
- **The trap column**, one entity: a column drawn like the column decor, that may crack (a
  line cracks it; it leans and holds) and may fall (it waits once he is past it, then falls as
  a rod pivoting on its foot under `PHYS.gravity` from the spin it starts with). It comes down
  on him where his centre is, east of its foot; it comes to rest on whatever floor, stair or
  tile it meets first, and lies there in depth, never solid. Under it, the crushed body is
  pressed down to the gap under the shaft. The dev overlay shows the crack line, the line past
  the falling one, and, dashed, where it comes down.
- Theme `persepolis`, the costume `falseBeard`, the causes 'The column' (crushed, a squish) and
  'The audience'.
- **Sound.** Chapter 4 is not scored: Persepolis loads no music, and every track fades out. Room
  `open`. The wind stays.
- **The map.** Chapter 4's sites in the ruled order, Persepolis as its level 1, its costume, and
  the three Fars pins nudged apart.
- **Tests.** `tests/persepolis.spec.ts`, twenty-one of them: the guards as one body, the death,
  no fatal fall, the stairs run, walked and jumped in Node with the real player; the two columns
  in Node with the real player (one column, the cracked one holding, the runner, the stop past
  it, the step back and its slack, never passing it, the fallen shaft in depth) and in the
  browser (pixel for pixel alike); the walk-in, the teleport, the runner, the release spread,
  the crossing spread, the grind, the clean run and the count.
- **Pillar 8's count**, built with this level: it declares `tricks: ['The column', 'The
  audience']`, and the exit label's last row is "Tricks met", 0 of 2 until one of them has
  killed this visitor, in this browser. Both kill him themselves, so nothing needs to claim a
  death.

## Sources

- *Encyclopaedia Iranica*: "Persepolis" (A. Sh. Shahbazi), https://www.iranicaonline.org/articles/persepolis/ ·
  "Apadana", https://www.iranicaonline.org/articles/apadana/ · "Capitals",
  https://www.iranicaonline.org/articles/capitals/ · "Persepolis graffiti",
  https://iranicaonline.org/articles/persepolis-graffiti · "Construction materials and
  techniques" · "Herzfeld, Ernst iii" · "Krefter, Friedrich".
- Livius, Persepolis: the Apadana,
  https://www.livius.org/articles/place/persepolis/persepolis-photos/persepolis-apadana/ · the
  Apadana's east stairs,
  https://www.livius.org/articles/place/persepolis/persepolis-photos/persepolis-apadana-east-stairs/ ·
  the Gate of All Nations,
  https://www.livius.org/articles/place/persepolis/persepolis-photos/persepolis-gate-of-all-nations/ ·
  and its pages on the stairs, the Tachara and the north stair.
- Cabinet, University of Oxford, "The Apadana at Persepolis", with the audience relief:
  https://www.cabinet.ox.ac.uk/apadana-persepolis
- ISAC, University of Chicago, Persepolis photographic archive:
  https://isac.uchicago.edu/collections/photographic-archives/persepolis/apadana
- E. F. Schmidt, *Persepolis I* (1953, OIP 68): free from ISAC; rights in the plates to check.
- Flandin & Coste, *Voyage en Perse* (issued in parts 1843–54), public domain:
  https://gallica.bnf.fr/ark:/12148/bpt6k56754751.texteImage . It cannot show the east stair.
- M. Motamedmanesh, "Authenticity and Restoration: The Benefits of Historical Studies on
  Re-Examining the Implemented Restorations in Persepolis", *Arts* 5 (2016), 2:
  https://doi.org/10.3390/arts5010002
- Amadori et al., *Archaeometry* (2025), on the fire of 330 BC.
- The Apadana shelter study, *Science of the Total Environment* (2016); Lonely Planet,
  Persepolis, for the shelter and the sunlight.
- Nazarov et al. (2009), the description of *Cyrtopodion persepolense* (*Russ. J. Herpetol.*
  16(4); the authority is often given as 2010).
- The tour map's research on the Apadana: `tools/monument-painters/specs/apadana.json` and
  `content/map/monuments/map-monument-ch04-persia.md`.
- Herzfeld's photographs, 1923–34, Freer and Sackler Archives: reference only. Modern photographs
  are for reference on your own screen only.

## Confidence

**How this was checked.** The research for this level was done through web search, at the level
of search extracts: the pages and the books were not read, and no photograph or plate was looked
at. The map plate's research met the same blocked fetches. In this build two citations were
checked by search: the restoration paper is by Mahdi Motamedmanesh (*Arts* 2016), not "Mousavi
et al." as the build spec had it, and Iranica's "Persepolis graffiti" puts the names mostly on
the Gate and the Apadana. Everything below marked "ask before painting" must be read in the
sources before its asset note is signed off.

**Solid, at search-extract level.** The terrace reached by its stair; 63 steps, a landing, 48
more, risers of 10 cm; plain bulls on the west portal and winged bulls on the east; the Tachara's
stone frames standing alone in dark polished stone; the east stair dug out in 1931–34; the
composition of its central panel and triangles; the audience reliefs removed to the Treasury; 72
Apadana columns, thirteen standing by 1900 and one re-erected.

**Discrepant in the sources.** The Apadana's column height (16.5 to 25 m) and capital height
(5.8 or about 8 m); when the fourteenth column went back up (1965 or the 1970s); the east
portico's capital animal; the terrace's height along its length (9 to 17 or 18 m); how many of
the Gate's columns stand (two or three); the Tachara platform's height (2.2 to 3.0 m); Flandin &
Coste's date (issued 1843–54, other dates given).

**For the designer to confirm.** That 'The audience' is new on its punchline and its precision
alone. Its first answer overlaps Knossos's doors and its second is the ordinary pass on a clock
(The tricks). 'The column' is the designer's (2026-10-06); it passes the site test only weakly,
and its knowing answer stands him still for about half a second behind the column's foot, before
the level's last trap, which pillar 5 allows only to the last trap.

**Not verified, so ask before painting:**
- the guards' height, and which are Persian and which Median, in what order;
- the blank's width;
- which way the lion and bull, and the north wing's nobles, face;
- the shelter's height and form;
- the Apadana's columns: their height (19 to 25 m) and which can be seen from the east court;
- the treads: 31 cm on most, 38 or 40 on some, and which;
- whether wooden treads or boards cover parts of the Stairs of All Nations today;
- the Gate's columns: two or three standing, and the one IsMEO re-erected with its reset capital;
  and whether columns stand in the game's two places, the one that cracks and the one that falls;
- the height of the east stair's façade and of the Apadana's platform behind it;
- the Tachara's door frames: the height of a doorway under its lintel, and the proportions of a
  frame;
- why the visitors' names on the Gate are cut so high;
- the barrier in front of the east stair's reliefs, and where visitors leave the terrace.
