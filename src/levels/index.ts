import type { LevelData } from '../level';
import { ABU_SIMBEL } from './abu-simbel';
import { KARNAK } from './karnak';
import { PHILAE } from './philae';

/** Chapter 1, south to north along the Nile. */
export const LEVELS: LevelData[] = [ABU_SIMBEL, PHILAE, KARNAK];

export function levelIndexFromHash(hash: string): number {
  const key = hash.replace(/^#/, '').trim();
  if (!key) return 0;
  const n = Number(key);
  if (Number.isInteger(n) && n >= 1 && n <= LEVELS.length) return n - 1;
  const i = LEVELS.findIndex((l) => l.id === key);
  return i >= 0 ? i : 0;
}
