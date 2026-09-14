export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function centerX(r: Rect): number {
  return r.x + r.w / 2;
}

export function centerY(r: Rect): number {
  return r.y + r.h / 2;
}

/** Death causes are museum-label nouns: they end up printed on the exit label. */
export type DeathCause =
  | 'Colossus head'
  | 'Baboon'
  | 'Lake Nasser'
  | 'The sun'
  | 'Fall'
  | 'Gave up';

/** What each death sounds like. Material, never musical. */
export const DEATH_SOUND: Record<DeathCause, 'squish' | 'bonk' | 'drown' | 'burn' | 'fallAway' | 'sigh'> = {
  'Colossus head': 'squish',
  Baboon: 'bonk',
  'Lake Nasser': 'drown',
  'The sun': 'burn',
  Fall: 'fallAway',
  'Gave up': 'sigh',
};

export const VIEW_W = 320;
export const VIEW_H = 180;
export const TILE = 16;
export const DT = 1 / 60;
