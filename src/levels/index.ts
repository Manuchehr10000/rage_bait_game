import type { LevelData } from '../engine/level';
import { CAP_BLANC } from './ch01-palaeolithic/l01-cap-blanc';
import { PECH_MERLE } from './ch01-palaeolithic/l03-pech-merle';
import { ROUFFIGNAC } from './ch01-palaeolithic/l04-rouffignac';
import { GARGAS } from './ch01-palaeolithic/l05-gargas';
import { ROC_AUX_SORCIERS } from './ch01-palaeolithic/l02-roc-aux-sorciers';
import { ABU_SIMBEL } from './ch02-egypt/l01-abu-simbel';
import { KARNAK } from './ch02-egypt/l03-karnak';
import { DENDERA } from './ch02-egypt/l04-dendera';
import { PHILAE } from './ch02-egypt/l02-philae';
import { KNOSSOS } from './ch03-aegean/l01-knossos';
import { MINOTAUR } from './ch03-aegean/l06-minotaur';
import { PERSEPOLIS } from './ch04-persia/l01-persepolis';

/**
 * The tour prod plays, which main deploys: every level in tour order but the ones HELD back
 * from it. Chapter 1, then chapter 2 south to north along the Nile, then the Aegean, then Persia.
 */
export const PROD_LEVELS: LevelData[] = [CAP_BLANC, ROC_AUX_SORCIERS, PECH_MERLE, ROUFFIGNAC, GARGAS, ABU_SIMBEL, PHILAE, KARNAK, DENDERA, KNOSSOS, MINOTAUR, PERSEPOLIS];

/**
 * Built, on the map in the dev and local builds, and held back from prod: each with the level
 * it follows in the tour. Prod has no place in its tour for one, no pin, no deep link, and not
 * its level file: game.ts reads LEVELS only outside prod, and vite.config.ts fails a prod build
 * that carries the file (its art notes and the engine code that draws it still ship). To hold
 * one back, put it here and its file in held-files.ts; to release one, write it into
 * PROD_LEVELS in its place and take it out of both.
 *
 * None is held back now. The Minotaur, chapter 3's legend, was held back from prod by the
 * designer on 2026-10-15 and released to it on 2026-10-16 ("Make all levels available on
 * main"): it is in PROD_LEVELS, after Knossos.
 */
export const HELD: readonly { level: LevelData; after: string }[] = [];

/** `levels` with each of `held` put in after the level it follows. */
export function withHeld(levels: readonly LevelData[], held: readonly { level: LevelData; after: string }[]): LevelData[] {
  return levels.flatMap((l) => [l, ...held.filter((h) => h.after === l.id).map((h) => h.level)]);
}

/**
 * Every level in tour order, as the dev and local builds play it: prod's tour with each held
 * level in its place, so the Aegean ends on its legend, the Minotaur (designer, 2026-10-12).
 * Pure, so a prod bundle, which never reads it, drops it and the held levels with it.
 */
export const LEVELS: LevelData[] = /* @__PURE__ */ withHeld(PROD_LEVELS, HELD);

/**
 * Stages: a site built as it is, with its artifacts in place and no traps, for the
 * designer to place and calibrate every trap by hand (designer's ruling, 2026-10-06).
 * Not on the map and not in prod: the dev and local builds open one by its deep link,
 * `#<id>`. When its traps are in, it takes its level's place in the tour: in PROD_LEVELS, or
 * in HELD, with its file in held-files.ts, while it is held back from prod.
 */
export const STAGES: LevelData[] = [];

/** `list` is what the game can enter: the build's tour, and the stages too where there are dev tools. */
export function levelIndexFromHash(hash: string, list: readonly LevelData[]): number {
  const key = hash.replace(/^#/, '').trim();
  if (!key) return 0;
  const n = Number(key);
  if (Number.isInteger(n) && n >= 1 && n <= list.length) return n - 1;
  const i = list.findIndex((l) => l.id === key);
  return i >= 0 ? i : 0;
}
