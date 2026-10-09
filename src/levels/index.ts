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

/** Every level in tour order: chapter 1, then chapter 2 south to north along the Nile, then the Aegean, then Persia. */
export const LEVELS: LevelData[] = [CAP_BLANC, ROC_AUX_SORCIERS, PECH_MERLE, ROUFFIGNAC, GARGAS, ABU_SIMBEL, PHILAE, KARNAK, DENDERA, KNOSSOS, PERSEPOLIS];

/**
 * Stages: a site built as it is, with its artifacts in place and no traps, for the
 * designer to place and calibrate every trap by hand (designer's ruling, 2026-10-06).
 * Not on the map and not in prod: the dev and local builds open one by its deep link,
 * `#<id>`. When its traps are in, it takes its level's place in LEVELS.
 */
export const STAGES: LevelData[] = [MINOTAUR];

/** `list` is what the game can enter: LEVELS, and the stages too where there are dev tools. */
export function levelIndexFromHash(hash: string, list: readonly LevelData[] = LEVELS): number {
  const key = hash.replace(/^#/, '').trim();
  if (!key) return 0;
  const n = Number(key);
  if (Number.isInteger(n) && n >= 1 && n <= list.length) return n - 1;
  const i = list.findIndex((l) => l.id === key);
  return i >= 0 ? i : 0;
}
