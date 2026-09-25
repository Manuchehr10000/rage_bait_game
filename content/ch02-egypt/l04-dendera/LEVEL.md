# Chapter 2 · Level 4 · Dendera, the Temple of Hathor

Dendera (Iunet; Greek Tentyris), on the Nile opposite Qena. The Temple of Hathor is late
Ptolemaic and Roman: begun under Ptolemy XII Auletes, decorated through Cleopatra VII and
Augustus, its outer hypostyle hall finished under Tiberius (research: `arc.md`, chapter 2,
"Ptolemy XII–Tiberius"). It is the most complete temple in Egypt. Its roof is still on,
its two roof stairs still go up to it, and the roof was opened to visitors in 2020.

**The New Year route.** At the New Year the golden statue of the *ba* of Hathor was brought
up from a crypt, dressed in the **wabet** — the "pure place", a small chapel west of the
sanctuary with an open court in front of it — and carried up the **west stair**, which
winds round a square core in about 110 steps, to the **kiosk** in the south-west corner of
the roof: twelve Hathor columns, open to the sky, called the chapel of the disc. There, at
dawn, the statue received the first light of the year: the union with the disc. Then it was
carried down the **east stair**, which is straight, about 97 steps. The walls of each stair
carry the procession — king, priests, singers, standard-bearers, the shrine — going the way
that stair was used: up the west, down the east.

**The Osiris chapels.** Two suites on the roof, one east and one west, each an open court
followed by two roofed rooms, used for the Khoiak mysteries of Osiris. Half the ceiling of
the second room of the **east** suite was the **Dendera zodiac**: a sandstone block of
about 2.55 by 2.53 metres carved with what is often called the only complete circular map
of the sky from ancient Egypt. In 1821 Lelorrain, for the collector Saulnier, cut it out with
saws, jacks, chisels and gunpowder. It reached Paris in 1822, Louis XVIII bought it for 150,000 francs,
and it is in the Louvre. A plaster cast is in the ceiling now. The west suite never had a
zodiac.

## What this level is for

Level 4 takes the ground away. For most of the level the tourist is on the one roof in
Egypt you can still walk on, and the ground is further below him than any fall he can walk
away from. He walks the New Year route **backwards**: up the straight stair the goddess was
carried down, with the procession on its walls coming down at him, across the roof, to the
kiosk — and he has to be standing where her statue stood before the first light of the year
arrives.

> Abu Simbel: the world lies. Philae: it lies about Abu Simbel. Karnak: the game lies.
> Dendera: the roof is on, and you are standing on it.

The level is seen from the north, so east is on the left and **the sun comes up behind
him**. The first light lands on the kiosk, which is where the ritual aims it, and then
spreads back across the roof toward him. That is simply what a rising sun does to the
shadow of the chapels he has just passed, and it is the whole of the finale.

The level runs in the blue hour before dawn from its first frame, because the New Year was
prepared overnight. The dawn itself is the only thing on a clock (pillar 5: the last trap).

## The beats

| Beat | Folder | What the player meets | Death label | What is true |
|---|---|---|---|---|
| a | `a-east-gate` | The blue hour. A stone gate in the mud-brick enclosure wall; the flank of the temple rising out of the top of the screen; a side door | — | The enclosure wall and its east gate |
| b | `b-east-stair` | The straight stair inside the wall, roofed, one hop a step, the carved procession walking down at him. Three tiles of head room: a full jump always meets the ceiling and does no harm, until the eighth step, where one block of the ceiling is the chapter's ankh block. A full jump off that step knocks it out, it pays its coin, and it comes straight down on him. A short hop goes under it | "Ankh" (crushed) | The east stair is straight and the procession on it descends |
| c | `c-east-chapels` | On the roof. The east Osiris suite: a court with a low wall, then the roofs of two rooms. The far half of the second room's roof is a slab like its neighbours. Land on it and a charge goes off under it | "The zodiac" (ash) | The zodiac was half the ceiling of that room, carved on its underside, and was taken out in 1821 with, among other things, gunpowder |
| — | — | Open roof | — | — |
| d | `d-west-chapels` | The west suite, the same to the pixel. The same slab holds: there was never anything under it. Jumping it, as beat c taught, lands short, in the wabet's court, fourteen tiles straight down. Walking across it and jumping the court from the far edge clears it | "The wabet" (fall) | The west suite had no zodiac. The wabet's court is open to the sky |
| e | `e-kiosk` | The roof to the kiosk. Crossing the court starts the dawn. He has to be over the kiosk's screen wall and in the statue's place before the first light lands on it. Late, the kiosk goes gold, the light runs back across the roof, and he is ash. On time, the sun comes up behind him where the goddess stood | "The New Year" (ash) | The statue was placed in the kiosk to receive the first light of the year |

A fall off the roof anywhere else would also say "The wabet", because the level has one
noun for a long drop; the roof's ends are closed off so that there is nowhere else to fall.

## Deliberately wrong

- **The temple is too tall.** The roof is drawn fourteen tiles over the ground, about 24
  metres at the tourist's scale, so that walking off it kills (`PHYS.fatalFall` is 200 px;
  fourteen tiles is 224). The outer hypostyle's ceiling is about 15 metres up and the roof
  over the rest of the temple is lower. The height is level design, taken because a roof
  you can fall off and walk away from would strand the player below a stair he cannot get
  back to.
- **The stair.** Fourteen steps instead of about 97, and a ceiling low enough to bump your
  head on. The head of the stair is drawn as a block standing up out of the roof; how the
  east stair actually meets the roof has not been checked.
- **The ankh block.** The chapter's one anachronism, from a more famous game. Here it is in
  a ceiling, and it falls.
- **The zodiac goes in an instant, under a tourist.** The real removal was slow work with
  saws, jacks and chisels, gunpowder being one tool among them. The cast in the ceiling
  today is never going to go off.
- **The geometry.** The east stair runs along the east wall, parallel to the temple's axis,
  not left to right; the chapels, the wabet's court and the kiosk are not in one line, and
  the court is not next to the west chapels. The order is true: east stair, east chapels,
  west chapels, the court, the kiosk in the south-west corner. The distances are level
  design (`arc.md`, invariants).
- **The chapels are drawn as solid blocks** a hop high, with a low court wall. They are
  rooms, with doors, and their real heights are not checked.
- **The dawn.** The sun burns, as it has since Abu Simbel's sanctuary. The light crosses the
  roof in about three seconds, not the minutes a real sunrise takes over a shadow. Nobody
  is on the roof at first light but him; the New Year it belongs to has not been kept since
  the temple closed.
- **The procession on the stair** is drawn by the game as priests, one to a step, with a
  standard on every third. The real relief has the king, priests, singers, standard-bearers
  and the shrine. Nothing in it moves, so the painter should paint it as it is (pillar 4 is
  about things that behave, and these do not).

## What is true and is doing the work

- The roof is intact, it is reached by two stairs, and visitors may walk on it.
- The east stair is straight and its procession walks down; the west stair winds and its
  procession walks up. He is going up the wrong one, and the wall says so without a word.
- The zodiac was in the **east** suite, half of one ceiling, on the underside. From above, it
  was a roof slab like any other. The west suite never had one. That difference is the trap
  and its echo.
- The wabet's court is open to the sky, and the statue was dressed there before it went up.
- The kiosk is in the south-west corner, it has twelve Hathor columns, and it was where the
  statue waited for the first light. Sockets in its architraves suggest it once had a
  timber roof, which is gone.
- The sun rises in the east, and a rising sun shortens the shadows it cast long: the light
  arrives at the far end first and comes back toward whatever cast the shadow.

## Not in the level

- **The zodiac's dating dispute.** Fourier put it about 2500 BC, Biot about 800 BC, others
  much earlier; in 1822 Champollion read "autocrator" in a cartouche on the *Description*
  drawing and called it Greco-Roman, and at Dendera in 1828 found the cartouche empty. The
  modern date is about 50 BC (Cauville and Aubourg, from the planets).
- **Disputed details of the removal:** Lelorrain's first name, and whether the zodiac moved
  from the Bibliothèque nationale to the Louvre in 1919 or 1922.
- **The west stair's five windows,** with hymns to the young sun, the full sun, the old sun
  and the scarab of the second dawn cut in their embrasures. The level goes up the other
  stair.
- **The crypts.** Eleven or twelve, in the walls and under the floor. Left to Saqqara by
  designer ruling. The one visitors were always shown, south crypt 1, room C, holds the
  relief fringe writers call the "Dendera light", and the chapter excludes that claim
  entirely: no lamps in the dark anywhere in this level, and no lotus with a snake in it.
- **The outer hypostyle,** its 24 Hathor columns and their hacked faces, and its
  astronomical ceiling with Nut, black with soot until the cleaning of 2005–2021. Who hacked
  the faces is disputed (Wong, *JARCE* 2016, argues for mixed motives), so it is never stated
  as the work of any one group.
- **Cleopatra VII and Caesarion** on the rear wall, and the great Hathor emblem at its centre,
  scraped by pilgrims for souvenirs.
- **The lion-headed waterspouts** that drain the roof. Rain at Dendera is rare and violent,
  which is why they are there. They are below the roof edge, where nobody on the roof can see
  them.
- **Mariette's clearance** of the village that had filled and covered the temple, from the
  late 1850s; Denon drawing the zodiac by candlelight in 1799; Roberts in 1838.

## The rough version

Built to be timed before anything is painted. Measured by the scripted clean run in
`tests/dendera.spec.ts`:

- **Clean run: 17.3 seconds.** Gate and stair 7.3, east chapels 3.3, open roof 2.0, west
  chapels and court 2.7, kiosk 2.0. Level 87 tiles wide, 24 high.
- **The dawn** comes 1.6 seconds after the court is crossed, and the clean run is in the
  kiosk 0.23 seconds before it. The light then spreads back at about 315 px a second.
- **The ankh step.** Getting under the ankh takes a hop with the jump held for 2 to 5 frames
  (33 to 83 ms). One frame does not clear the step; six or more knocks the ankh down, and so
  does a running full jump. This is a skill check, not a memory check, and it is the first
  thing to feel in play.
- **The court jump.** From the far edge of the west slab, a running jump clears the four-tile
  court with about half a tile to spare. Jumping more than about a tile before the edge falls
  short.

**Open, to be decided by playing it:** the clean run is well under the 45 seconds of pillar
7 and under Karnak. If it plays short or easy, tighten beats c, d and e before adding a
beat; add one only if a real feature earns it. The death budget is set after play.

## Sources

- Stairs, procession and windows: *BIFAO* 125 (2025), "D'une aube à l'autre dans le temple
  d'Hathor à Dendara", https://journals.openedition.org/bifao/17681 ;
  https://egypte-eternelle.org/index.php?option=com_content&view=article&id=261&Itemid=516&lang=fr ;
  http://www.temples-egypte.net/dendera/escaliers/ouest/escalierOuest.html
- The roof, the kiosk, the Osiris chapels: https://fr.wikipedia.org/wiki/Temple_d'Hathor_(Dend%C3%A9rah) ;
  PATHS, Dendera (architrave sockets for a timber roof), https://paths-erc.eu/sacri-lapides-aegypti/dendera/ ;
  Ancient Egypt Online, https://ancientegyptonline.co.uk/hathortempledendera/ ;
  Tales from the Two Lands, https://talesfromthetwolands.org/2021/02/07/dendera-temple/
- The zodiac: https://en.wikipedia.org/wiki/Dendera_zodiac ;
  https://fr.wikipedia.org/wiki/Zodiaque_de_Dend%C3%A9rah ;
  https://www.victorianweb.org/science/denderazodiac.html ;
  Priskin, "The Dendera zodiacs as narratives of the myth of Osiris, Isis, and the child",
  *ENiM* 8 (2015), http://www.enim-egyptologie.fr/revue/2015/9/Priskin_ENiM8_p133-185.swf.pdf
- The wabet and the New Year: Wikimedia Commons, Wabet of Dendera,
  https://commons.wikimedia.org/wiki/Category:Wabet_of_Dendera ; Lonely Planet, Dendara,
  https://www.lonelyplanet.com/egypt/nile-valley/qena/attractions/dendara/a/poi-sig/1427051/355246
- The roof and three crypts opened in 2020:
  https://egymonuments.gov.eg/en/news/the-ministry-of-tourism-and-antiquities-completes-the-second-phase-of-the-restoration-and-developing-project-at-the-dendera-temple-in-qena/ ;
  https://english.ahram.org.eg/NewsContent/50/1207/364641/AlAhram-Weekly/Heritage/The-view-from-Dendera.aspx
- The "Dendera light", to avoid: https://en.wikipedia.org/wiki/Dendera_light
- The hacked faces: Wong, "Raze of Glory", *JARCE* 2016, https://muse.jhu.edu/article/618918/summary
- Mariette and the village: https://the-past.com/feature/august-mariette/
- Public domain imagery: *Description de l'Égypte*, Antiquités vol. IV (Dendera; Jollois and
  Devilliers, 1799); Denon, *Voyage* (1802); Mariette, *Dendérah* (1870–75); David Roberts,
  *Egypt and Nubia*, "Temple of Isis on the roof of the great temple of Dendera" (which is
  the Hathor kiosk, misnamed).

The facts above were checked against search extracts; most of the pages themselves could not
be opened from where this was written. Read the sources before painting anything that
depends on them.

## Confidence

**Solid:** the straight east stair and the winding west one, and which way the procession
goes on each; the kiosk in the south-west corner with twelve Hathor columns and the New Year
ritual; the two Osiris suites; the zodiac's place in the east suite, its removal in 1821, the
Louvre, the cast; the wabet and its open court; the roof opened to visitors in 2020.

**Discrepant in the sources:** eleven or twelve crypts; Lelorrain's first name; 1919 or 1922
for the Louvre; Roberts' caption putting the kiosk in the south-east corner (a nineteenth-
century mistake); Nectanebo I or II for the older birth house.

**Not verified, so ask before painting:** the east gate's builder and decoration; how the east
stair meets the roof; the heights of the chapels; whether the kiosk has doorways; whether the
kiosk's Hathor faces were hacked (the game draws them plain until someone checks); the size
of the wabet and its court.
