import type { LevelData } from '../engine/level';
import { CAP_BLANC } from './ch01-palaeolithic/l01-cap-blanc';
import { PECH_MERLE } from './ch01-palaeolithic/l03-pech-merle';
import { ROUFFIGNAC } from './ch01-palaeolithic/l04-rouffignac';
import { ROC_AUX_SORCIERS } from './ch01-palaeolithic/l02-roc-aux-sorciers';
import { ABU_SIMBEL } from './ch02-egypt/l01-abu-simbel';
import { KARNAK } from './ch02-egypt/l03-karnak';
import { PHILAE } from './ch02-egypt/l02-philae';

/** Every level in tour order: chapter 1, then chapter 2 south to north along the Nile. */
export const LEVELS: LevelData[] = [CAP_BLANC, ROC_AUX_SORCIERS, PECH_MERLE, ROUFFIGNAC, ABU_SIMBEL, PHILAE, KARNAK];

export function levelIndexFromHash(hash: string): number {
  const key = hash.replace(/^#/, '').trim();
  if (!key) return 0;
  const n = Number(key);
  if (Number.isInteger(n) && n >= 1 && n <= LEVELS.length) return n - 1;
  const i = LEVELS.findIndex((l) => l.id === key);
  return i >= 0 ? i : 0;
}
