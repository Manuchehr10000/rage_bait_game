# Pillars

Rules the game never breaks. Every level, every chapter. If a trap idea needs one of
these bent, the idea is wrong, not the rule.

1. **The world lies. The controls never do.** Jump height, run speed, acceleration and
   collision are fixed in `src/player.ts` (`PHYS`) and identical in every chapter. Coyote
   time and jump buffering stay on. The player must always be able to blame themselves.
2. **No text inside a level.** Reading kills tempo. History lives in the geometry and the
   set pieces, not in captions. The only words are the death counter and the exit label.
3. **Deterministic, never random.** Every trap fires from player position or a fixed
   timeline started by player position. Death one is a surprise. Death two is your fault.
4. **Memory is the tell.** Traps are not telegraphed. Identical things behave differently
   and only one of them is lying. The level is always the same, so the second attempt
   knows exactly where. Never punish a player for something they could not have memorised.
5. **No waiting before the finale.** A player who knows the level runs it without standing
   still. Only the last trap in a level may run on a cycle, because nothing comes after it.
6. **The camera never scrolls left.** Tells are absorbed on the way in or not at all.
7. **No checkpoints. Infinite lives. Big visible death counter.** Levels stay short
   (about 45 seconds clean) so the retry loop stays fast.
8. **Deadpan.** A death looks and sounds like what caused it, and nothing else reacts: no
   jingle, no shake, no pity message, the wind and music do not flinch, the world keeps
   moving through it. Crushed is a pancake, burned is ash, drowned is a towel on the
   water. The counter ticks and the level resets in under a second. The only other
   acknowledgement is the museum label at the exit, with deaths broken down by cause.
9. **The costume is cosmetic.** The tourist wears visibly fake period dress and nobody in
   the game ever mentions it. It never changes the hitbox.
10. **False completion is spent once per player, ever.** Held in reserve. Not in level 1.

## Chapter 1: Egypt, south to north along the Nile

Abu Simbel → Philae → Karnak / Luxor → Valley of the Kings → Giza.

## Level 1: Great Temple of Abu Simbel

| Beat | Trap | The history behind it |
|---|---|---|
| Honest opening | none | Temple cut by Ramesses II, four 20 m colossi |
| Colossi | three intact heads look identical; only the fourth drops; the broken statue is safe | the second colossus lost its upper body in an earthquake |
| Frieze | 22 identical baboons; one throws a date | 22 baboons on the facade face east to greet the sun |
| Relocation | numbered blocks rise 65 m and slide back; Lake Nasser fills the pit and keeps rising | 1,036 blocks, 65 m higher, 200 m back, 1964 to 1968 |
| Sanctuary | sun beam sweeps in; only Ptah's niche is dark | sun reaches the sanctuary on 22 Feb and 22 Oct; Ptah is never lit |
| Exit | none | visitor record: deaths by cause |

Target death budget for a first clean run: 10 to 15.
