# Pillars

Rules the game never breaks. Every level, every chapter. If a trap idea needs one of
these bent, the idea is wrong, not the rule.

The fun is curiosity: the player keeps going to find out how else the game will kill him.
Every rule below serves that. What has already been spent is in `content/tricks.md`.

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
   more than 45; the legend, level 6, is never more than 45 either. The reset takes under a second, but a death costs the clean run before
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
    may make the culture the joke. The costume mocks the tourist, never the place. In a
    legend (level 6) he is never the hero: it is beaten the way its own story beats it.
12. **Respect gate.** Places of active worship, graves of the recently dead, and sites of
    atrocity are never levels. Ruins, temples of dead religions, palaces, fortifications
    and engineering are. Ambiguous sites are flagged in `content/research/arc.md` and
    need a designer ruling before any production; a level designer never decides alone.
    A legend passes its own gate (`content/research/arc.md`, section 1): never a story of a
    living tradition, always in the public domain, never an outsider's slur on the culture.
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
