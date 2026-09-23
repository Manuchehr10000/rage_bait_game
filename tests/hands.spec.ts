import { expect, test } from '@playwright/test';
import { handStencils } from '../src/render/hands';
import { LEVELS } from '../src/levels';

/**
 * The wall of hands at Gargas, held to its note
 * (content/ch01-palaeolithic/l05-gargas/f-hands/README.md) on the wall as the
 * level places it. The first version shortened fingers at random: it drew more
 * red hands than black, the commonest pattern at the site twice in 105, and a
 * lone middle finger on six hands, the corna on two and the V on four.
 */

const wall = () => {
  const gargas = LEVELS.find((l) => l.id === 'gargas');
  if (!gargas) throw new Error('no gargas level');
  const panel = gargas.decor.find((d) => d.kind === 'cavePanel' && d.panel === 'hands');
  if (!panel || panel.kind !== 'cavePanel') throw new Error('no wall of hands');
  return handStencils(panel.rect);
};

test('black for most, red for many, and one yellow', () => {
  const hands = wall();
  const n = (p: string) => hands.filter((h) => h.pigment === p).length;
  expect(n('yellow')).toBe(1);
  expect(n('black')).toBeGreaterThan(n('red'));
  expect(n('red')).toBeGreaterThan(hands.length / 4);
});

test('about half the hands are short, adults and children, and every short hand has all four fingers short alike', () => {
  const hands = wall();
  const short = hands.filter((h) => h.fingers.some((f) => f < h.full));
  expect(short.length / hands.length).toBeGreaterThan(0.4);
  expect(short.length / hands.length).toBeLessThan(0.6);
  expect(short.some((h) => h.child)).toBe(true);
  expect(short.some((h) => !h.child)).toBe(true);
  // No finger left standing among short ones: no lone middle finger, no V, no corna.
  const mixed = hands.filter((h) => h.fingers.some((f) => f < h.full) && h.fingers.some((f) => f === h.full));
  expect(mixed).toEqual([]);
  expect(short.filter((h) => new Set(h.fingers).size !== 1)).toEqual([]);
  // A stub, never nothing: the first joint goes, and usually the second.
  expect(short.every((h) => h.fingers[0] >= 1 && h.fingers[0] <= h.full - 2)).toBe(true);
});

test('the proportions do not depend on where the wall stands', () => {
  const at = (x: number) => handStencils({ x, y: 262, w: 320, h: 52 });
  const count = (hs: ReturnType<typeof at>) => [hs.filter((h) => h.pigment === 'black').length, hs.filter((h) => h.fingers[0] < h.full).length];
  expect(count(at(0))).toEqual(count(at(2016)));
  expect(count(at(4000))).toEqual(count(at(2016)));
});
