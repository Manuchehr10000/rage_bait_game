import { Grid, type LevelData } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 2, Level 2 — Philae, the Temple of Isis.
 *
 * Everything is over water. The water is the crocodile. Level 1 taught you
 * things; this level is built out of those lessons, turned around.
 *
 *   0..9    the boat brings you in (honest)
 *  10..17   landing stage, one ankh
 *  18..24   the first gap: two rocks; the first is a crocodile that dives when touched
 *  25..32   bank with the chiselled reliefs; one of them steps out and shoves you back
 *  33..38   numbered blocks with cranes. They do not move. The bank after them sinks.
 *  39..41   the sinking bank
 *  42..47   bank, then
 *  48..63   the cofferdam corridor; the wall gives way and a wave comes at you; stand on the stumps
 *  64..79   Trajan's Kiosk: column tops over rising water; some capitals are unfinished
 *  80..85   the quay with the scribe's scaffold (nothing happens here)
 *  87..     the boat, which leaves when it sees you coming
 */
const W = 98;
const H = 18;
const GROUND = 15;
const px = (t: number) => t * TILE;
const WATER_Y = px(GROUND) + 10;

const g = new Grid(W, H);
g.fill(10, GROUND, 8, H - GROUND, '='); // landing stage 10..17
g.set(13, 11, '?');
g.fill(25, GROUND, 8, H - GROUND, '='); // relief bank 25..32
g.fill(42, GROUND, 22, H - GROUND, '='); // bank and cofferdam floor 42..63
g.set(51, GROUND - 1, '#'); // column stumps in the corridor
g.set(55, GROUND - 1, '#');
g.set(59, GROUND - 1, '#');
// The Kiosk. Columns are drawn, not tiled; only the capitals are solid, so the spacing
// can be what the jump needs: a staircase of four steps two tiles apart (a tap climbs
// that), then a flat run 44px apart: too wide to walk, a tap lands on the next capital,
// a held jump on the one after. The difficulty is the fakes and the water, not the input.
const CAPITALS: { x: number; top: number }[] = [
  { x: px(65), top: px(14) },
  { x: px(67), top: px(13) },
  { x: px(69), top: px(12) },
  { x: px(71), top: px(11) },
  { x: px(71) + 44, top: px(11) },
  { x: px(71) + 88, top: px(11) },
  { x: px(71) + 132, top: px(11) },
  { x: px(71) + 176, top: px(11) },
];
// Fake capitals: the unfinished ones. They look like the others.
const FAKE = new Set([2, 5, 7]);
g.fill(84, 12, 6, H - 12, '='); // the quay 84..89, higher than the old ground

// Figure x positions. The second one is live; a shove from there lands you in the water between the rock and the bank.
const RELIEF_X = [414, 446, 478, 510];

export const PHILAE: LevelData = {
  id: 'philae',
  name: 'Philae, Temple of Isis',
  theme: 'philae',
  costume: 'pharaoh',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 16, y: px(GROUND) - 16 },
  cameraBottom: px(16),
  exit: null,

  decor: [
    { kind: 'reliefWall', rect: { x: px(25), y: px(GROUND) - 64, w: px(8), h: 64 } },
    { kind: 'cofferdam', x: px(64), top: px(GROUND) - 64, bottom: px(GROUND) },
    { kind: 'scaffold', x: px(86), floorY: px(12) },
    ...CAPITALS.map((c) => ({ kind: 'column' as const, x: c.x, top: c.top, bottom: px(H) })),
    { kind: 'landing', x: px(10), floorY: px(GROUND) },
  ],

  entities: [
    // The water. Deadly from the start; the cofferdam failing sets it rising for good.
    {
      kind: 'water',
      x0: 0,
      x1: px(W),
      startY: WATER_Y,
      cause: 'Crocodile',
      rise: { onEvent: 'cofferdam', fastTo: px(GROUND) + 8, fastSpeed: 60, slowTo: px(11) + 4, slowSpeed: 1 },
    },
    // The boat in. Honest. It carries you to the landing and stops.
    {
      kind: 'platform',
      skin: 'boat',
      rect: { x: -8, y: px(GROUND), w: 64, h: 24 },
      rail: { x: 58, y: -6, w: 6, h: 6 },
      trigger: { type: 'auto' },
      rise: 0,
      riseSpeed: 0,
      slideX: 112,
      slideSpeed: 55,
    },
    // Two rocks in the first gap. They look the same. The first one is not a rock.
    { kind: 'crumble', skin: 'croc', rect: { x: px(19) + 8, y: px(GROUND), w: 24, h: 8 }, fake: true, delay: 0.08 },
    { kind: 'crumble', skin: 'rock', rect: { x: px(21) + 8, y: px(GROUND), w: 24, h: 8 }, fake: false, delay: 0 },
    // Four reliefs of Isis, faces chiselled off. One is not a relief.
    ...RELIEF_X.map((x, i) => ({
      kind: 'pusher' as const,
      skin: 'relief' as const,
      x,
      floorY: px(GROUND),
      active: i === 1,
      reach: 7,
      impulseX: -300,
      impulseY: -230,
      outFor: 0.6,
    })),
    // The numbered blocks. Cranes above. You know what this is. It is not that.
    {
      kind: 'platform',
      skin: 'blocks',
      rect: { x: px(33), y: px(GROUND), w: px(6), h: 32 },
      trigger: { type: 'none' },
      rise: 0,
      riseSpeed: 0,
      slideX: 0,
      slideSpeed: 0,
      firstNumber: 201,
    },
    // The bank after them is what moves.
    {
      kind: 'platform',
      skin: 'bank',
      rect: { x: px(39), y: px(GROUND), w: px(3), h: 48 },
      trigger: { type: 'standOn', delay: 0.25 },
      rise: -56,
      riseSpeed: 70,
      slideX: 0,
      slideSpeed: 0,
    },
    // The cofferdam lets go. The wave comes from ahead, along the floor. Stumps are above it.
    {
      kind: 'sweep',
      skin: 'wave',
      triggerX: px(48),
      delay: 0.9,
      startX: px(64),
      endX: px(44),
      top: px(GROUND) - 13,
      bottom: px(GROUND),
      duration: 1.0,
      hold: 0,
      safe: [],
      cause: 'The cofferdam',
      emits: 'cofferdam',
    },
    // The capitals of the Kiosk. Unfinished ones give way a beat after you land.
    ...CAPITALS.map((c, i) => ({
      kind: 'crumble' as const,
      skin: 'capital' as const,
      rect: { x: c.x - 8, y: c.top - 8, w: 32, h: 8 },
      fake: FAKE.has(i),
      delay: 0.3,
    })),
    // The boat out. It starts leaving when you reach the scaffold.
    {
      kind: 'platform',
      skin: 'boat',
      rect: { x: px(90) + 4, y: px(12) + 8, w: 64, h: 24 },
      rail: { x: 58, y: -6, w: 6, h: 6 },
      trigger: { type: 'reach', x: px(88) },
      rise: 0,
      riseSpeed: 0,
      slideX: Infinity,
      slideSpeed: 42,
      isExit: true,
    },
  ],
};
