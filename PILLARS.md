# Pillars

Rules the game never breaks. Every level, every chapter. If a trap idea needs one of
these bent, the idea is wrong, not the rule.

1. **The world lies. The controls never do.** Jump height, run speed, acceleration,
   collision and the fall you can walk away from are fixed in `src/engine/player.ts`
   (`PHYS`) and identical in every chapter. Coyote time and jump buffering stay on. The
   player must always be able to blame themselves.
   **A fall of more than `PHYS.fatalFall` (200 px, measured from the top of the arc)
   kills you, everywhere.** Only the noun on the museum label changes per level, and
   every level that can drop that far names it (`dropCause`). The number is set from
   what the built levels already ask for — the worst fall on a clean run is 62 px at
   Cap Blanc and Roc-aux-Sorciers, 78 at Philae and 176 at Karnak, walking off the
   first pylon — so nothing that was survivable ever stops being survivable. A jump
   off that pylon is 238 px and a death, "The pylon": the height of the jump is the
   player's own, and the ruling is that it counts.
2. **No text inside a level.** Reading kills tempo. History lives in the geometry and the
   set pieces, not in captions. The only words are the death counter, the site's name on
   a museum label for two seconds on arrival, and the exit label.
3. **Deterministic, never random.** Every trap fires from player position or a fixed
   timeline started by player position. Death one is a surprise. Death two is your fault.
4. **Set up, then subvert.** Every trap is a joke: a setup, then a punchline the player
   did not see coming. The setup is something true they can see or have lived through,
   such as a crack, a pattern or an earlier trap, and the punchline turns it against them.
   A trick is used once in the whole game; one the player has met may come back only as
   the setup for a new one. The death could only happen at this site: a trick that could
   move to another site and lose nothing is generic, and it is out. A trap is a surprise
   the first time and a test of the hands after. Once known, it still takes timing or
   precision to beat, never only the memory of where. Identical things stay identical,
   pixel for pixel.
5. **No waiting before the finale.** A player who knows the level runs it without standing
   still. Only the last trap in a level may run on a cycle, because nothing comes after it.
6. **The camera never scrolls left.** Tells are absorbed on the way in or not at all.
   It does follow you up and down, so a level is allowed to be taller than the window
   and should be: the first three were 288 px tall and kept the tourist inside a 45 px
   band, which made them read as corridors. Use the other axis.
7. **No checkpoints. Infinite lives. Big visible death counter.** Levels grow through a
   chapter: about 15, 22, 30, 37 and 45 seconds of clean play for levels 1 to 5, and never
   more than 45. The reset takes under a second, but a death costs the clean run before
   it, so the known part of a level must stay worth running (pillar 4).
8. **Deadpan.** A death looks and sounds like what caused it, and nothing else reacts: no
   jingle, no shake, no pity message, the wind and music do not flinch, the world keeps
   moving through it. Crushed is a pancake, burned is ash, drowned is a towel on the
   water. The counter ticks and the level resets in under a second. The only other
   acknowledgement is the museum label at the exit: this visit's deaths by cause, and how
   many of the level's tricks (pillar 4) this visitor has ever been killed by, as "7 of
   9". A plain missed jump, a fall or a drowning in honest water is not a trick and does
   not count. Finding a new one makes no sound and no show; the label is where it counts.
   **One death in the whole game has no physical cause, and it is spent at Knossos:**
   landing in front of the throne seats him in it and his visit is over. It has its own
   pose, sound and label, never those of giving up, and nothing reacts to it either. No
   other level seats him in anything.
9. **The costume is cosmetic.** The tourist wears visibly fake period dress and nobody in
   the game ever mentions it. It never changes the hitbox.
10. **False completion is spent once per player, ever.** Held in reserve. Not in level 1.
11. **The tourist is always the idiot.** The locals are always competent and busy. No level
    may make the culture the joke. The costume mocks the tourist, never the place.
12. **Respect gate.** Places of active worship, graves of the recently dead, and sites of
    atrocity are never levels. Ruins, temples of dead religions, palaces, fortifications
    and engineering are. Ambiguous sites are flagged in `content/research/arc.md` and
    need a designer ruling before any production; a level designer never decides alone.
13. **The tourist arrives on foot.** From the map, or from the exit label of the level
    before, he walks in from off the left edge of the screen, and the controls are his
    the moment all of him is on it: no cutscene, and the level keeps its left edge safe
    as far as the spawn. He is never dropped in from the sky. Where the level brings him
    in itself he starts on it (Philae: the boat), and where the visit has already begun
    he is simply there (Rouffignac: he has stepped off the train). A retry always starts
    on the spawn, so the loop stays fast (pillar 7). The choice is `arrival` in the
    level's data.

Pillars 4, 7 and 8 took this form on 2026-09-26. Every level built or designed before
then predates them: its notes describe it as it is, it is rebuilt one level at a time,
and until it is, it is not a model for new work. An audit of the eight levels then built
found 67 tricks, 29 of them a trick the player had already met, and 9 that could only
happen at their site.

The chapters, their sites, periods and costumes are fixed by `content/research/arc.md`.
Read it before touching any of them.

## Chapter 2: Egypt, south to north along the Nile

Abu Simbel → Philae → Karnak → Dendera → Saqqara. Giza is rejected by the research (three triangles and a plain).

## Level 1: Great Temple of Abu Simbel

| Beat | Trap | The history behind it |
|---|---|---|
| Honest opening | none | Temple cut by Ramesses II, four 20 m colossi |
| Colossi | three intact heads look identical; only the fourth drops; the broken statue is safe | the second colossus is shattered at the waist, in antiquity, probably by an earthquake |
| Frieze | 22 identical baboons; one throws a date | 22 baboons on the facade face east to greet the sun |
| Relocation | numbered blocks rise and slide back; Lake Nasser fills the pit and keeps rising | 1,036 blocks, about 65 m higher and 200 m back, 1964 to 1968; the exact figures are contested (arc.md §7) |
| Sanctuary | sun beam sweeps in; only Ptah's niche is dark | the sun reaches the sanctuary twice a year, in February and October, over a few days each time; Ptah is never lit |
| Exit | none | visitor record: deaths by cause |

Target death budget for a first clean run: 10 to 15.

## Level 2: Philae, Temple of Isis

Level 1 lied about the world. Level 2 lies about what level 1 taught you. Everything is
over water, and the water is a crocodile. From the cofferdam on, the water rises for the
rest of the level: standing still anywhere eventually drowns you.

| Beat | Trap | The history behind it |
|---|---|---|
| The boat in | none; it docks, you hop the bow | Philae is reachable only by boat |
| Two rocks | identical; the first is a crocodile that dives when touched | Nile crocodiles lived here until the dams; whether any do now is not a fact the game claims |
| The reliefs | four chiselled Isis figures; one steps out and shoves you back into the water | Coptic Christians defaced the reliefs |
| Numbered blocks | cranes above, 201 to 206. They do not move. The bank after them sinks | moved to Agilkia 1972 to 1980 |
| The cofferdam | the wall gives way; a wave comes along the floor; stumps are above it | the temple was moved inside a cofferdam |
| The Kiosk | eight capitals: a short staircase, then a flat run spaced so any jump lands on the next capital or the one after; three give way a beat after you land; the water is rising | Trajan's Kiosk was never finished |
| The scaffold | nothing happens | the last hieroglyph was cut here in 394 AD |
| The boat out | starts leaving when you reach the scaffold; a committed jump makes it, a hesitation does not | by boat only |

Target death budget for a first clean run: 25 to 35.

## Level 3: Karnak

Level 1 lied about the world. Level 2 lied about level 1. Level 3 lies about the game.
Everything it has taught you is now the trap.

| Beat | Trap | The history behind it |
|---|---|---|
| The ankh | the one reward in the game; hit it and the floor under it opens | the Cachette: some 750 stone statues and 17,000 bronzes buried under a court |
| The Avenue | five identical ram sphinxes on plinths over pits; two turn and butt you back | the Avenue of Sphinxes, three kilometres of them |
| The ramp | stairs that pull you backward; stop and you slide to the bottom | the mud-brick construction ramp still leaning on the first pylon |
| The blocks | steps up the pylon face that give way a beat after you land | Akhenaten's talatat blocks reused as fill in the pylon |
| The scarab | steps off its plinth and walks at you; jump it | the scarab statue tourists circle seven times for luck |
| The Hall | dark; column tops over a pit; the spotlit ones fall | 134 columns; the Sound and Light show |
| The obelisk | falls to the left, ahead of you, across where you are sprinting to | Hatshepsut's obelisk; the broken one lies by the lake |
| The lake | the stones sink; the water holds you; you swim | the sacred lake, where the priests bathed |
| The exit | the turnstile stands on a trapdoor; the real exit is an empty pedestal with nothing on it | the scarab's pedestal by the sacred lake, empty because the scarab is in the court |

Target death budget for a first clean run: 40 to 60.

## Level 4: Dendera, Temple of Hathor

Level 4 takes the ground away. The roof is on, and he spends most of the level standing on
it: every fall off it is longer than `PHYS.fatalFall`. He walks the New Year route backwards,
and the last trap is the dawn.

| Beat | Trap | The history behind it |
|---|---|---|
| The east gate | none; the flank of the temple rises out of the top of the screen | the mud-brick enclosure and its stone gates |
| The east stair | a ceiling over every step; one block of it is the ankh, and a full jump off that step brings it down on him | the straight east stair, down which the procession carried the goddess; its reliefs walk down at him |
| The east chapels | a roof slab like its neighbours; a charge goes off under it | the zodiac, half a ceiling in the east Osiris suite, cut out in 1821 with gunpowder among other tools |
| The west chapels | the same slab holds; the jump that cleared it in the east lands in the wabet's court | the west suite never had a zodiac; the wabet's court is open to the sky |
| The kiosk | crossing the court starts the dawn; be in the statue's place before the first light, or burn | the kiosk in the south-west corner, where the statue waited for the first light of the year |

Target death budget for a first clean run: to be set by playing it. The rough version's
clean run is 17 seconds.
