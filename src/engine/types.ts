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
  | 'The overhang'
  | 'The rockfall'
  | 'The lower gallery'
  | 'The bear nests'
  | 'The drop'
  | 'The flint'
  | 'The signal'
  | 'The train'
  | 'The oubliettes'
  | 'The tunnel'
  | 'The dark'
  | 'Colossus head'
  | 'Baboon'
  | 'Lake Nasser'
  | 'The sun'
  | 'Crocodile'
  | 'The cofferdam'
  | 'The Cachette'
  | 'The pylon'
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
  'The overhang': 'crush',
  'The rockfall': 'flat',
  'The lower gallery': 'gone',
  'The bear nests': 'gone',
  'The drop': 'flat',
  'The flint': 'plank',
  'The signal': 'plank',
  'The train': 'crush',
  'The oubliettes': 'gone',
  'The tunnel': 'gone',
  // He sits down where the light gave out, which is what you do, and waits.
  'The dark': 'sit',
  'Colossus head': 'crush',
  Baboon: 'plank',
  'Lake Nasser': 'drown',
  'The sun': 'burn',
  Crocodile: 'snap',
  'The cofferdam': 'swept',
  'The Cachette': 'gone',
  // A jump off the first pylon into the court. Walking off it is fine.
  'The pylon': 'flat',
  Scarab: 'crush',
  Obelisk: 'crush',
  Fall: 'gone',
  'Gave up': 'sit',
};

/** What each death sounds like. Material, never musical. */
export const DEATH_SOUND: Record<
  DeathCause,
  'squish' | 'bonk' | 'drown' | 'burn' | 'snap' | 'whoosh' | 'fallAway' | 'sigh' | 'thud' | 'click'
> = {
  'The Beune': 'drown',
  'The cast': 'thud',
  'The trench': 'thud',
  'The roof': 'squish',
  'The Anglin': 'drown',
  'The overhang': 'squish',
  'The rockfall': 'thud',
  'The lower gallery': 'fallAway',
  'The bear nests': 'fallAway',
  'The drop': 'thud',
  'The flint': 'bonk',
  'The signal': 'bonk',
  'The train': 'squish',
  'The oubliettes': 'fallAway',
  'The tunnel': 'fallAway',
  // The switch, tried once more, on a lamp with nothing left in it.
  'The dark': 'click',
  'Colossus head': 'squish',
  Baboon: 'bonk',
  'Lake Nasser': 'drown',
  'The sun': 'burn',
  Crocodile: 'snap',
  'The cofferdam': 'whoosh',
  'The Cachette': 'fallAway',
  'The pylon': 'thud',
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
