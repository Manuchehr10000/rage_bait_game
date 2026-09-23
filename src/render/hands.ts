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
 * The proportions come from index sequences, not from the position of the wall,
 * so moving the wall along the level moves the hands with it and changes nothing
 * that is counted.
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

/** The one yellow hand. */
const YELLOW = 7;
/** The share of hands blown in red ochre; the rest are black. */
const RED = 0.36;
/** The share of hands with the fingers short. */
const SHORT = 0.5;

const frac = (v: number) => v - Math.floor(v);

export function handStencils(r: Rect): HandStencil[] {
  const out: HandStencil[] = [];
  const count = Math.floor(r.w / 9) * 3;
  for (let i = 0; i < count; i++) {
    const h = hash(i * 13, r.x);
    const child = i % 3 === 2;
    const w = child ? 6 : 8;
    const tall = child ? 5 : 7;
    const x = r.x + 4 + ((i * 37 + (h % 5)) % (r.w - 12));
    const y = child ? r.y + r.h - 12 - (h % 5) : r.y + 4 + ((i * 17 + (h >>> 3)) % Math.max(1, r.h - 22));
    // Two irrationals, so colour and shortness spread evenly along the wall and do not line up with each other.
    const pigment: Pigment = i === YELLOW ? 'yellow' : frac(i * 0.6180339887) < RED ? 'red' : 'black';
    const full = child ? 3 : 4;
    // All four short together, to the same stub: usually one joint left, on some adults two.
    const stub = child || ((h >>> 5) & 3) !== 0 ? 1 : 2;
    const len = frac(i * 0.4142135624 + 0.5) < SHORT ? stub : full;
    out.push({ x, y, child, w, tall, pigment, full, fingers: [len, len, len, len] });
  }
  return out;
}
