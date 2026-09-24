import type { Rect } from '../engine/types';
import { hash } from './hash';

/**
 * The hands on the wall at Gargas, as data: where each one is, what colour was
 * blown round it and how long its fingers are. Kept apart from the drawing so a
 * test can hold the wall to its note (content/ch01-palaeolithic/l05-gargas/f-hands).
 *
 * What the sources fix, and so what this keeps:
 * - Black is the commonest colour and red the next (143 black to 80 red in one
 *   inventory, more than 100 to 85 in the other). About a third are red here.
 *   One yellow, near the right-hand end.
 * - About half the hands are short of fingers (114 of 231 by one count).
 * - The thumb is whole on every incomplete hand.
 * - The commonest pattern is all four fingers short with the thumb whole, the
 *   first joint gone and usually the second. Here it is the only pattern: the
 *   other formulas Leroi-Gourhan recorded are not in any source this game has,
 *   and a random subset of short fingers makes rude signs (a lone middle finger,
 *   the V, the corna) that the note forbids. The note lists this as deliberate.
 *
 * Nothing here depends on where the wall stands: moving it along the level
 * moves the hands with it and changes nothing that is counted.
 */

export type Pigment = 'black' | 'red' | 'yellow';

export interface HandStencil {
  x: number;
  y: number;
  child: boolean;
  /** Palm width and height. */
  w: number;
  tall: number;
  pigment: Pigment;
  /** A whole finger's length. */
  full: number;
  /** Index to little finger, drawn from the thumb side. */
  fingers: [number, number, number, number];
}

/** Adults' rows from the top, then one row of children's at the bottom. */
const ADULT_ROWS = 3;
/** Horizontal and vertical pitch of the rows: a hand is 10 px wide and 11 tall with its fingers. */
const PITCH = 12;
const ROW = 13;
/**
 * The splinter of bone in the first crack, relative to the wall: the bone that
 * gave the date. No hand is put over it.
 */
export const SPLINTER = { dx: 21, dy: 17, w: 1, h: 4 };
/** The share of hands blown in red ochre; the rest are black. */
const RED = 0.36;
/** The share of hands with the fingers short. */
const SHORT = 0.5;

const frac = (v: number) => v - Math.floor(v);

/**
 * The hands in rows, staggered and a pixel out of line, so that every hand is a
 * hand: no two overlap, the pigment round them runs together into one cloud,
 * and a slot left empty here and there shows the rock.
 * The first version scattered them, and 89 of its 105 hands ran into another;
 * the yellow one was painted over entirely.
 */
export function handStencils(r: Rect): HandStencil[] {
  const out: HandStencil[] = [];
  const cols = Math.floor((r.w - 12) / PITCH);
  for (let row = 0; row <= ADULT_ROWS; row++) {
    const child = row === ADULT_ROWS;
    for (let c = 0; c < cols; c++) {
      // Near the right-hand end, in the middle row of adults.
      const yellow = row === 1 && c === cols - 3;
      // Bare rock here and there, so the rows read as a wall and not as wallpaper.
      // Chosen by slot, not by where the wall stands, so the counts do not move with it.
      if (!yellow && hash(row * 97 + c, 7) % 7 === 0) continue;
      const h = hash(row * 97 + c, 13);
      const w = child ? 6 : 8;
      const tall = child ? 5 : 7;
      const x = r.x + 6 + c * PITCH + (row % 2) * (PITCH / 2) + ((h % 3) - 1);
      const y = child ? r.y + ROW * ADULT_ROWS + 1 : r.y + 2 + row * ROW + ((h >>> 4) % 2);
      const full = child ? 3 : 4;
      if (overlaps(handBox({ x, y, w, tall, full }), { x: r.x + SPLINTER.dx, y: r.y + SPLINTER.dy, w: SPLINTER.w, h: SPLINTER.h })) continue;
      const i = out.length;
      // Two irrationals, so colour and shortness spread evenly along the wall and do not line up with each other.
      const pigment: Pigment = yellow ? 'yellow' : frac(i * 0.6180339887) < RED ? 'red' : 'black';
      // All four short together, to the same stub: usually one joint left, on some adults two.
      const stub = child || ((h >>> 5) & 3) !== 0 ? 1 : 2;
      const len = frac(i * 0.4142135624 + 0.5) < SHORT ? stub : full;
      out.push({ x, y, child, w, tall, pigment, full, fingers: [len, len, len, len] });
    }
  }
  return out;
}

/** The outline of a hand with its thumb and fingers, for anything that needs to know where it is. */
export function handBox(hand: Pick<HandStencil, 'x' | 'y' | 'w' | 'tall' | 'full'>): Rect {
  return { x: hand.x - 2, y: hand.y + 3 - hand.full, w: hand.w + 2, h: hand.tall + hand.full - 1 };
}

const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
