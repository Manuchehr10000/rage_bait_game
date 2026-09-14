# Pillars

Rules the game never breaks. Every level, every chapter. If a trap idea needs one of
these bent, the idea is wrong, not the rule.

1. **The world lies. The controls never do.** Jump height, run speed, acceleration and
   collision are fixed in `src/player.ts` (`PHYS`) and identical in every chapter. Coyote
   time and jump buffering stay on. The player must always be able to blame themselves.
2. **Text never lies. It only misleads.** Every plaque is historically accurate. The trap
   is in what the player infers from it. One false plaque and nobody reads the rest.
3. **Deterministic, never random.** Every trap fires from player position or a fixed
   timeline started by player position. Death one is a surprise. Death two is your fault.
4. **Every trap has a tell.** Something visible on the way in that a second attempt can
   read: a crack, a baboon facing the wrong way, slack crane cables.
5. **No waiting before the finale.** A player who knows the level runs it without standing
   still. Only the last trap in a level may run on a cycle, because nothing comes after it.
6. **The camera never scrolls left.** Tells are absorbed on the way in or not at all.
7. **No checkpoints. Infinite lives. Big visible death counter.** Levels stay short
   (about 45 seconds clean) so the retry loop stays fast.
8. **Deadpan.** No sound effect on death, no shake, no pity message. The tourist freezes,
   the counter ticks, the level resets in under half a second. The only acknowledgement is
   the museum label at the exit, with deaths broken down by cause.
9. **The costume is cosmetic.** The tourist wears visibly fake period dress and nobody in
   the game ever mentions it. It never changes the hitbox.
10. **False completion is spent once per player, ever.** Held in reserve. Not in level 1.

## Chapter 1: Egypt, south to north along the Nile

Abu Simbel → Philae → Karnak / Luxor → Valley of the Kings → Giza.

## Level 1: Great Temple of Abu Simbel

| Beat | Trap | Tell | Fact on the plaque |
|---|---|---|---|
| Honest opening | none | none | Temple cut by Ramesses II, four 20 m colossi |
| Colossi | intact heads drop; the broken statue is safe | hairline crack at the neck; the second statue has no head to drop | second colossus lost its upper body in an earthquake |
| Frieze | one baboon drops | it is the only one facing you | 22 baboons face east to greet the sun |
| Relocation | numbered blocks rise 65 m and slide back; Lake Nasser fills the pit and keeps rising | slack crane cables above the blocks | 1,036 blocks, 65 m higher, 200 m back |
| Sanctuary | sun beam sweeps in; only Ptah's niche is dark | the plaque says Ptah is never lit | sun reaches the sanctuary on 22 Feb and 22 Oct |
| Exit | none | none | visitor record: deaths by cause |

Target death budget for a first clean run: 10 to 15.
