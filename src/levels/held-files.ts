/**
 * The file of each level in HELD (src/levels/index.ts), held back from prod. vite.config.ts
 * drops these from the prod bundle and fails a prod build that still carries one, and
 * tests/map.spec.ts holds this list to HELD. No imports: the build config reads it.
 */
export const HELD_FILES: readonly string[] = ['src/levels/ch03-aegean/l06-minotaur.ts'];
