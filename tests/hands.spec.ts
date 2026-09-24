import { expect, test } from '@playwright/test';
import { SPLINTER, handBox, handStencils } from '../src/render/hands';
import { LEVELS } from '../src/levels';

/**
 * The wall of hands at Gargas, held to its note
 * (content/ch01-palaeolithic/l05-gargas/f-hands/README.md) on the wall as the
 * level places it. The first version shortened fingers at random: it drew more
 * red hands than black, the commonest pattern at the site twice in 105, and a
 * lone middle finger on six hands, the corna on two and the V on four. It also
 * scattered them: 89 of the 105 ran into another hand, and the one yellow hand
 * was painted over completely.
 */

const panel = () => {
  const gargas = LEVELS.find((l) => l.id === 'gargas');
  if (!gargas) throw new Error('no gargas level');
  const hands = gargas.decor.find((d) => d.kind === 'cavePanel' && d.panel === 'hands');
  if (!hands || hands.kind !== 'cavePanel') throw new Error('no wall of hands');
  return hands.rect;
};
const wall = () => handStencils(panel());

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

test('every hand can be seen: none runs into another or over the bone, all are on the wall, children below adults, the yellow one near the right-hand end', () => {
  const r = panel();
  const hands = wall();
  const boxes = hands.map(handBox);
  const touching: string[] = [];
  boxes.forEach((a, i) =>
    boxes.forEach((b, j) => {
      if (j > i && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) touching.push(`${i} and ${j}`);
    }),
  );
  expect(touching).toEqual([]);
  // Nor over the splinter of bone in the crack.
  const sx = r.x + SPLINTER.dx;
  const sy = r.y + SPLINTER.dy;
  expect(boxes.filter((b) => sx < b.x + b.w && b.x < sx + SPLINTER.w && sy < b.y + b.h && b.y < sy + SPLINTER.h)).toEqual([]);
  // The halo too stays on the wall: it reaches four pixels out and six below.
  const off = hands.filter((h) => h.x - 4 < r.x || h.x + h.w + 4 > r.x + r.w || h.y - 2 < r.y || h.y + h.tall + 6 > r.y + r.h);
  expect(off).toEqual([]);
  const lowestAdult = Math.max(...hands.filter((h) => !h.child).map((h) => h.y));
  expect(hands.filter((h) => h.child).every((h) => h.y > lowestAdult)).toBe(true);
  // About a hundred, where the sources count 137 on this wall.
  expect(hands.length).toBeGreaterThanOrEqual(80);
  const yellow = hands.find((h) => h.pigment === 'yellow');
  expect(yellow && yellow.x > r.x + r.w * 0.8).toBe(true);
});
