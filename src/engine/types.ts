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
  | 'Ankh'
  | 'The zodiac'
  | 'The wabet'
  | 'The New Year'
  | 'Fall'
  | 'The upper storey'
  | 'The throne'
  | 'The timber'
  | 'The door'
  | 'The kouloura'
  | 'The column'
  | 'The audience'
  | 'The knot'
  | 'The snort'
  | 'The hands'
  | 'The horns'
  | 'The labyrinth'
  | 'Gave up';

/** How each death is drawn. */
export type DeathAnim = 'crush' | 'plank' | 'drown' | 'burn' | 'snap' | 'swept' | 'gone' | 'sit' | 'flat' | 'enthroned' | 'carved';

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
  Ankh: 'crush',
  'The zodiac': 'burn',
  'The wabet': 'flat',
  'The New Year': 'burn',
  Fall: 'gone',
  // Knossos. The burnt storey of the west wing, down on him in the storeroom.
  'The upper storey': 'crush',
  // Landed in front of the throne, and he is sitting in it. His own frame, at rest,
  // facing out: never the slump of giving up, and never triumphant.
  'The throne': 'enthroned',
  // Fyfe's timber of 1901, and the span it carried, on the far side of the light well.
  'The timber': 'crush',
  // The leaf of a pier-and-door partition, opening into him. Over like a plank.
  'The door': 'plank',
  // The court between the first two pits, and him on it, down a pit with no bottom.
  'The kouloura': 'gone',
  // Persepolis. The Gate's west column, come down on him.
  'The column': 'crush',
  // Persepolis. Where the guards stepped out, he is pressed flat into the wall where he
  // stood: upright, in profile, facing the centre like the guards round him, in stone.
  'The audience': 'carved',
  // The Minotaur. Each of the four is drawn here by an existing death until its own is
  // made with its trap (content/ch03-aegean/l06-minotaur/LEVEL.md).
  // The line takes his shins and he goes down face down, the wig over his eyes. For
  // now he goes over like a plank, backwards.
  'The knot': 'plank',
  // Sniffed, then snorted back up the hatch and pasted face up on the ceiling over it,
  // which is not where he died. For now he is gone down the hole.
  'The snort': 'gone',
  // Clapped flat between its palms like a fly and dropped at its feet, or swatted. For
  // now he lies where he was.
  'The hands': 'flat',
  // Hooked up and over in one full somersault, the kilt flying, and dropped flat. For
  // now he lies where he was.
  'The horns': 'flat',
  // A fall that kills, or a fall off the bottom: neither can happen in the labyrinth.
  'The labyrinth': 'flat',
  'Gave up': 'sit',
};

/** What each death sounds like. Material, never musical. */
export const DEATH_SOUND: Record<
  DeathCause,
  'squish' | 'bonk' | 'drown' | 'burn' | 'snap' | 'whoosh' | 'fallAway' | 'sigh' | 'thud' | 'click' | 'blast' | 'sitStone' | 'knock'
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
  Ankh: 'squish',
  'The zodiac': 'blast',
  'The wabet': 'thud',
  'The New Year': 'burn',
  Fall: 'fallAway',
  'The upper storey': 'squish',
  // A body sitting down on stone, dry, once. Not the sigh: that one is chosen.
  'The throne': 'sitStone',
  'The timber': 'squish',
  // Wood, not the Rouffignac board's bonk.
  'The door': 'knock',
  'The kouloura': 'fallAway',
  // Under a shaft of stone, as under a colossus's head.
  'The column': 'squish',
  // A body against a stone wall, once.
  'The audience': 'thud',
  // The Minotaur. One dry knock, a man on stone.
  'The knot': 'knock',
  // The jet up the hatch. Its own sound, the sniff and the snort, comes with the trap.
  'The snort': 'whoosh',
  // The palms, or the free hand. Its own sound comes with the trap.
  'The hands': 'squish',
  // Dropped flat after the toss. Its own sound comes with the trap.
  'The horns': 'thud',
  'The labyrinth': 'thud',
  'Gave up': 'sigh',
};

/**
 * What the tourist wears. One per chapter, fixed by content/research/arc.md.
 * Cosmetic (pillar 9): it picks the sprites and nothing else.
 */
export type Costume = 'hiker' | 'pharaoh' | 'bullLeaper' | 'falseBeard';

export const VIEW_W = 320;
export const VIEW_H = 180;
/** Painted art is authored at this many pixels per world pixel. The world canvas renders at the same scale. */
export const ART_SCALE = 4;
export const TILE = 16;
export const DT = 1 / 60;
