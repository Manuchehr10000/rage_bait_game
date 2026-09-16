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
  | 'The Beune'
  | 'The cast'
  | 'The trench'
  | 'The roof'
  | 'The Anglin'
  | 'The horns'
  | 'The rockfall'
  | 'Colossus head'
  | 'Baboon'
  | 'Lake Nasser'
  | 'The sun'
  | 'Crocodile'
  | 'The cofferdam'
  | 'The Cachette'
  | 'Scarab'
  | 'Obelisk'
  | 'Fall'
  | 'Gave up';

/** How each death is drawn. */
export type DeathAnim = 'crush' | 'plank' | 'drown' | 'burn' | 'snap' | 'swept' | 'gone' | 'sit' | 'flat';

export const DEATH_ANIM: Record<DeathCause, DeathAnim> = {
  'The Beune': 'drown',
  'The cast': 'flat',
  'The trench': 'flat',
  'The roof': 'crush',
  'The Anglin': 'drown',
  'The horns': 'crush',
  'The rockfall': 'flat',
  'Colossus head': 'crush',
  Baboon: 'plank',
  'Lake Nasser': 'drown',
  'The sun': 'burn',
  Crocodile: 'snap',
  'The cofferdam': 'swept',
  'The Cachette': 'gone',
  Scarab: 'crush',
  Obelisk: 'crush',
  Fall: 'gone',
  'Gave up': 'sit',
};

/** What each death sounds like. Material, never musical. */
export const DEATH_SOUND: Record<DeathCause, 'squish' | 'bonk' | 'drown' | 'burn' | 'snap' | 'whoosh' | 'fallAway' | 'sigh' | 'thud'> = {
  'The Beune': 'drown',
  'The cast': 'thud',
  'The trench': 'thud',
  'The roof': 'squish',
  'The Anglin': 'drown',
  'The horns': 'squish',
  'The rockfall': 'thud',
  'Colossus head': 'squish',
  Baboon: 'bonk',
  'Lake Nasser': 'drown',
  'The sun': 'burn',
  Crocodile: 'snap',
  'The cofferdam': 'whoosh',
  'The Cachette': 'fallAway',
  Scarab: 'squish',
  Obelisk: 'squish',
  Fall: 'fallAway',
  'Gave up': 'sigh',
};

/**
 * What the tourist wears. One per chapter, fixed by content/research/arc.md.
 * Cosmetic (pillar 9): it picks the sprites and nothing else.
 */
export type Costume = 'hiker' | 'pharaoh';

export const VIEW_W = 320;
export const VIEW_H = 180;
/** Painted art is authored at this many pixels per world pixel. The world canvas renders at the same scale. */
export const ART_SCALE = 4;
export const TILE = 16;
export const DT = 1 / 60;
