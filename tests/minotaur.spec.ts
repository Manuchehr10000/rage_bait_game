import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { MINOTAUR } from '../src/levels/ch03-aegean/l06-minotaur';
import { LEVELS, STAGES } from '../src/levels';
import { CHAPTERS } from '../src/map/atlas';
import { Level } from '../src/engine/level';
import { PHYS, Player } from '../src/engine/player';
import type { Input } from '../src/engine/input';
import { DEATH_ANIM, DEATH_SOUND, overlaps, TILE, type DeathCause, type Rect } from '../src/engine/types';

/**
 * The Minotaur's stage: the labyrinth built cell for cell from its design,
 * content/ch03-aegean/l06-minotaur/LEVEL.md, with nothing in it yet. What is pinned
 * here is the ground every trap will stand on: the map, the walk-in, the falls, and
 * the route rule, which keeps the tourist's way down and the hero's route apart
 * until the cell. The physics is the game's own, on the level's own tiles, in Node.
 */

/** Inside page.evaluate: the type is erased, so it survives the trip into the page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type W = Window & { __game: any };

/** The spawn floor: a designer's point (X, Y) is world x X, y 160 − Y. */
const DOOR_FLOOR = 160;

// ---------------------------------------------------------------------------
// The map, and the data.
// ---------------------------------------------------------------------------

/** LEVEL.md's map, "The section": each row's top y, `#` rock and `.` open, in two columns. */
function designedMap(): string[] {
  const md = readFileSync(new URL('../content/ch03-aegean/l06-minotaur/LEVEL.md', import.meta.url), 'utf8');
  const block = md.slice(md.indexOf('### The section')).split('```')[1] ?? '';
  const rows = new Map<number, string>();
  for (const m of block.matchAll(/y(\d{3})(?:-(\d{3}))?\s+([.#]+)/g)) {
    const from = Number(m[1]);
    const to = m[2] === undefined ? from : Number(m[2]);
    for (let y = from; y <= to; y += TILE) {
      expect(rows.has(y), `LEVEL.md gives the row at y ${y} twice`).toBe(false);
      rows.set(y, m[3]!);
    }
  }
  const ys = [...rows.keys()].sort((a, b) => a - b);
  expect(ys, 'LEVEL.md gives every row once, from y 0 down').toEqual(ys.map((_, i) => i * TILE));
  return ys.map((y) => rows.get(y)!);
}

/** The level's own tiles, drawn the way LEVEL.md draws them. */
function builtMap(level: Level): string[] {
  const rows: string[] = [];
  for (let ty = 0; ty < level.heightTiles; ty++) {
    let row = '';
    for (let tx = 0; tx < level.widthTiles; tx++) row += level.isSolid(tx, ty) ? '#' : '.';
    rows.push(row);
  }
  return rows;
}

test("the labyrinth is LEVEL.md's map, cell for cell: 320 by 752 px, 20 by 47 tiles", () => {
  const map = designedMap();
  expect(map).toHaveLength(47);
  for (const row of map) expect(row).toHaveLength(20);
  const level = new Level(MINOTAUR);
  expect([level.widthPx, level.heightPx]).toEqual([320, 752]);
  expect(builtMap(level)).toEqual(map);
  // Rock and air only: nothing in it is anything but plain masonry, yet.
  expect(new Set(MINOTAUR.rows.join(''))).toEqual(new Set(['#', ' ']));
});

test('a stage, not a level: off the map and out of the tour, entered by its deep link', () => {
  expect(STAGES).toContain(MINOTAUR);
  expect(LEVELS).not.toContain(MINOTAUR);
  expect([...LEVELS, ...STAGES].filter((l) => l.id === 'minotaur')).toHaveLength(1);
  // The chapter's legend is on the map as a pin with no level behind it, until the designer promotes it.
  const pins = CHAPTERS.flatMap((c) => c.sites);
  expect(pins.some((s) => s.level === 'minotaur')).toBe(false);
  expect(pins.find((s) => s.name === 'The Minotaur')?.legend).toBe(true);
});

test("the stage's data: the bull-leaper, the walk in, the camera on the spawn, the four tricks, the gated exit on the left", () => {
  const d = MINOTAUR;
  expect({ id: d.id, name: d.name, theme: d.theme, costume: d.costume, arrival: d.arrival }).toEqual({
    id: 'minotaur',
    name: 'The Minotaur',
    theme: 'minotaur',
    costume: 'bullLeaper',
    arrival: 'walk',
  });
  expect(d.spawn).toEqual({ x: 8, y: DOOR_FLOOR - 16 });
  expect(d.cameraOnSpawn).toBe(true);
  expect(d.cameraBottom).toBe(752);
  // No traps yet, and no Theseus, beast or queue.
  expect(d.entities).toEqual([]);
  expect(d.decor).toEqual([]);
  // The four tricks, in the order he meets them; the labyrinth's fall is none of them.
  expect(d.tricks).toEqual(['The knot', 'The snort', 'The hands', 'The horns']);
  expect(d.dropCause).toBe('The labyrinth');
  expect(d.fallCause).toBe('The labyrinth');
  // At the door he came in by, on the floor outside it, once the second blow has fallen;
  // the label anchored right, clear of the closing picture at the door.
  expect(d.exit).toEqual({ x: 0, y: DOOR_FLOOR - 24, w: 6, h: 24 });
  expect(d.exitAfter).toBe('secondBlow');
  expect(d.exitCard).toBe('right');
  // Out when his right edge is short of x 16, and not before.
  const him = (x: number): Rect => ({ x, y: DOOR_FLOOR - 16, w: 10, h: 16 });
  expect(overlaps(him(5.99), d.exit!)).toBe(true);
  expect(overlaps(him(6), d.exit!)).toBe(false);
  expect(overlaps(him(d.spawn.x), d.exit!)).toBe(false);
});

test('the five new nouns are drawn and heard as deaths, never as giving up', () => {
  const nouns: DeathCause[] = ['The knot', 'The snort', 'The hands', 'The horns', 'The labyrinth'];
  for (const n of nouns) {
    expect(DEATH_ANIM[n], n).toBeDefined();
    expect(DEATH_SOUND[n], n).toBeDefined();
    expect(DEATH_ANIM[n], n).not.toBe(DEATH_ANIM['Gave up']);
    expect(DEATH_SOUND[n], n).not.toBe(DEATH_SOUND['Gave up']);
  }
});

// ---------------------------------------------------------------------------
// The sweep: runs and jumps from every floor he reaches, the game's physics on
// the level's tiles. Heuristic, never a proof, as the design says of its own.
// ---------------------------------------------------------------------------

/** A floor: the tops of a run of rock with air over it. He can walk the length of one. */
interface Floor {
  y: number;
  x0: number;
  x1: number;
}

const name = (f: Floor) => `${f.y}:${f.x0}-${f.x1}`;

function floorsOf(level: Level): Floor[] {
  const out: Floor[] = [];
  for (let ty = 1; ty < level.heightTiles; ty++) {
    for (let tx = 0; tx < level.widthTiles; ) {
      if (!level.isSolid(tx, ty) || level.isSolid(tx, ty - 1)) {
        tx++;
        continue;
      }
      const x0 = tx;
      while (tx < level.widthTiles && level.isSolid(tx, ty) && !level.isSolid(tx, ty - 1)) tx++;
      out.push({ y: ty * TILE, x0: x0 * TILE, x1: tx * TILE });
    }
  }
  return out;
}

/**
 * The hero's tiles (LEVEL.md, The section): his gallery G0, the column of shafts, Daedalus's
 * turnings, and row 5 over the cell. O1, the mouth from the passage up to G0, is where the
 * two spaces meet, and is in neither.
 */
const HERO: Record<string, Rect> = {
  G0: { x: 192, y: 32, w: 112, h: 48 },
  column: { x: 256, y: 80, w: 48, h: 352 },
  turnings: { x: 208, y: 416, w: 96, h: 192 },
  'row 5': { x: 144, y: 592, w: 128, h: 64 },
};
const O1 = { x0: 192, x1: 208 };

/** Jump holds, in frames: from a tap to a full jump (the cut never bites after frame 15). */
const HOLDS = [1, 3, 5, 7, 9, 11, 13, 16];
/** Steering in the air: one way throughout, or one way and then another after this many frames. */
const SWITCH_AT = [4, 10, 18, 28];
/** Walking off an open end at these speeds, px/s. */
const WALK_OFF = [10, 30, 60, 90];
/** A coyote jump, this many frames after his feet leave the floor. */
const COYOTE = [1, 3, 5];

interface Plan {
  /** 0 for a walk-off with no jump. */
  hold: number;
  d1: number;
  /** Frames of d1 before d2. */
  m: number;
  d2: number;
}

const PLANS: Plan[] = [];
for (const hold of [0, ...HOLDS]) {
  for (const d of [-1, 0, 1]) PLANS.push({ hold, d1: d, m: 0, d2: d });
  for (const m of SWITCH_AT) for (const d1 of [-1, 0, 1]) for (const d2 of [-1, 0, 1]) if (d1 !== d2) PLANS.push({ hold, d1, m, d2 });
}

interface Sweep {
  /** Every floor he stood on. */
  reached: Set<string>;
  /** The longest fall from the top of an arc to a landing, and on each floor. */
  worst: number;
  worstOn: Map<string, number>;
  /** Frames on which any of him was on a hero tile, by tile, and the first few. */
  onHero: Map<string, number>;
  examples: string[];
  /** The highest his head came while any of him was under O1. */
  o1Top: number;
  runs: number;
}

/**
 * From the floors given, every take-off on every floor reached: standing or running
 * either way, every 2 px, at every hold and steering; and off each open end at four
 * speeds, falling straight or steered, with a coyote jump or without. Landings on a
 * floor not yet reached are swept from in turn, except on a terminal floor.
 */
function sweep(level: Level, start: Floor[], terminal: (f: Floor) => boolean): Sweep {
  const floors = floorsOf(level);
  const floorAt = (x: number, feet: number) =>
    // On the ground within the 1 px ground probe, over the floor by any of him.
    floors.find((f) => feet > f.y - 1 && feet <= f.y + 1e-9 && x > f.x0 - 10 && x < f.x1);
  const keys = { left: false, right: false, jumpHeld: false, pressed: false };
  const input = {
    get left() {
      return keys.left;
    },
    get right() {
      return keys.right;
    },
    get jumpHeld() {
      return keys.jumpHeld;
    },
    takeJumpPressed: () => {
      const was = keys.pressed;
      keys.pressed = false;
      return was;
    },
  } as unknown as Input;
  const p = new Player();
  const hits: Rect[] = [];
  const clear = (x: number, y: number) => {
    hits.length = 0;
    level.solidTilesIn({ x, y, w: p.w, h: p.h }, hits);
    return x >= 0 && hits.length === 0;
  };
  const s: Sweep = { reached: new Set(), worst: 0, worstOn: new Map(), onHero: new Map(), examples: [], o1Top: Infinity, runs: 0 };

  /** Standing at x on a floor at speed vx, then the plan. `off` walks off that way first; `coyote` jumps that long after. */
  const fly = (x: number, feet: number, vx: number, plan: Plan, off: number, coyote: number): Floor | null => {
    s.runs++;
    p.spawnAt(x, feet - p.h);
    p.vx = vx;
    p.onGround = true;
    (p as unknown as { coyote: number }).coyote = PHYS.coyoteTime;
    let left = -1;
    for (let i = 0; i < 300; i++) {
      const k = off ? (left < 0 ? -1 : i - left) : i;
      const press = off ? coyote : 0;
      const d = k < 0 ? off : k < plan.m ? plan.d1 : plan.d2;
      keys.left = d < 0;
      keys.right = d > 0;
      keys.pressed = plan.hold > 0 && k === press;
      keys.jumpHeld = plan.hold > 0 && k >= press && k < press + plan.hold;
      p.update(input, level, [], 0);
      if (!p.onGround && left < 0) left = i;
      for (const [tile, r] of Object.entries(HERO)) {
        if (!overlaps(p, r)) continue;
        s.onHero.set(tile, (s.onHero.get(tile) ?? 0) + 1);
        if (s.examples.length < 5) s.examples.push(`from ${x.toFixed(1)},${feet} at ${vx} px/s, ${JSON.stringify(plan)}: ${tile} at ${p.x.toFixed(1)},${p.y.toFixed(1)}`);
      }
      if (p.x + p.w > O1.x0 && p.x < O1.x1) s.o1Top = Math.min(s.o1Top, p.y);
      if (left >= 0 && p.onGround) {
        const on = floorAt(p.x, p.y + p.h);
        s.worst = Math.max(s.worst, p.fellBy);
        if (on) s.worstOn.set(name(on), Math.max(s.worstOn.get(name(on)) ?? 0, p.fellBy));
        return on ?? null;
      }
      // Walked into a wall, never off the end.
      if (off && left < 0 && i > 30) return null;
    }
    return null;
  };

  const queue = [...start];
  for (const f of start) s.reached.add(name(f));
  const found = (f: Floor | null) => {
    if (!f || s.reached.has(name(f))) return;
    s.reached.add(name(f));
    queue.push(f);
  };
  while (queue.length) {
    const f = queue.shift()!;
    if (terminal(f)) continue;
    const feet = f.y;
    for (let x = f.x0 - 9.5; x < f.x1; x += 2) {
      if (!clear(x, feet - p.h)) continue;
      for (const vx of [-PHYS.runSpeed, 0, PHYS.runSpeed]) for (const plan of PLANS) if (plan.hold > 0) found(fly(x, feet, vx, plan, 0, 0));
    }
    for (const dir of [-1, 1]) {
      const x = dir > 0 ? f.x1 - 0.01 : f.x0 - 9.99;
      if (!clear(x, feet - p.h)) continue;
      for (const speed of WALK_OFF) {
        for (const plan of PLANS) {
          if (plan.hold === 0) found(fly(x, feet, dir * speed, plan, dir, 0));
          else for (const c of COYOTE) found(fly(x, feet, dir * speed, plan, dir, c));
        }
      }
    }
  }
  return s;
}

const LEVEL = new Level(MINOTAUR);
const FLOORS = floorsOf(LEVEL);
const floor = (y: number, x0: number) => FLOORS.find((f) => f.y === y && f.x0 === x0)!;

/** The way down's floors, by LEVEL.md's names. */
const DOOR_STOREY = '160:0-224';
const Z1 = '256:80-240';
const T2 = '336:64-128';
const T3 = '416:80-144';
const T = '512:64-176';
const T_END = '576:64-192';
const CELL = '736:48-144';
/** The hero's gallery, G0, at the top of his route. */
const G0 = '80:208-256';

/** Down to the cell: he is in, and the way down ends there. */
const atCell = (f: Floor) => name(f) === CELL;

/** The way down, swept once for the two tests that read it. */
let wayDownSweep: Sweep | null = null;
const wayDown = (): Sweep => (wayDownSweep ??= sweep(LEVEL, [floor(DOOR_FLOOR, 0)], atCell));

test('the route rule: from the way down no run or jump puts any of him on a hero tile before the cell', () => {
  const s = wayDown();
  expect(s.runs).toBeGreaterThan(100_000);
  expect([...s.onHero], s.examples.join('\n')).toEqual([]);
  // Every floor of the way down, and nothing else: the door storey, the five corridors, the cell.
  expect([...s.reached].sort()).toEqual([DOOR_STOREY, Z1, T2, T3, T, T_END, CELL].sort());
  // O1, 80 px over the passage's floor against a full jump's 61.8: his head stops 2.2 px
  // short of G0's floor, 18.2 px short of standing on it.
  expect(s.o1Top).toBeCloseTo(DOOR_FLOOR - 16 - 61.83, 1);
  expect(s.o1Top).toBeGreaterThan(80);
});

test('the route rule: from the cell floor alone, with nothing in the cell, row 5 is out of reach', () => {
  // The cell's far wall is 80 px against a full jump's 61.8. Only the beast's heap,
  // which is not built, lets him out.
  const s = sweep(LEVEL, [floor(736, 48)], () => false);
  expect([...s.reached]).toEqual([CELL]);
  expect([...s.onHero]).toEqual([]);
});

test('no reachable fall in the stage is more than 200 px from the top of the arc: the way down', () => {
  const s = wayDown();
  expect(s.worst).toBeLessThan(PHYS.fatalFall);
  // As LEVEL.md has them: the relieved jump into D0, 143.4; into D1 and X2, 111.44; into
  // D3, 127.44; into X, 95.44; and a leap into the hatch at most 191.44, T_end's 48 px
  // roof capping every leap at 192.
  const worst = Object.fromEntries([...s.worstOn].map(([f, v]) => [f, Math.round(v * 100) / 100]));
  expect(worst).toEqual({
    [DOOR_STOREY]: 61.83,
    [Z1]: 143.44,
    [T2]: 111.44,
    [T3]: 111.44,
    [T]: 127.44,
    [T_END]: 95.44,
    [CELL]: 191.44,
  });
  expect(s.worst).toBeCloseTo(191.44, 2);
});

test('no reachable fall in the stage is more than 200 px from the top of the arc: up the hero\'s route to the door', () => {
  // Until the fight exists only the dev tools put him on row 5. From there he climbs the
  // turnings and the column by 48 px steps to G0, down O1 into the passage, and out of the
  // door. Back down the way down from the passage is the way down's business.
  const corridors = new Set([Z1, T2, T3, T, T_END]);
  const s = sweep(LEVEL, [floor(656, 144)], (f) => corridors.has(name(f)));
  expect(s.reached.has(G0)).toBe(true);
  expect(s.reached.has(DOOR_STOREY)).toBe(true);
  expect(s.reached.has('16:80-320'), 'the roof').toBe(false);
  // None over 145 on the way out (LEVEL.md, Tests to pin): the worst is D0 again, from the
  // passage, 143.44; back into the cell from row 5, 127.44.
  expect(s.worst).toBeLessThan(145);
  expect(s.worst).toBeCloseTo(143.44, 2);
  expect(s.worstOn.get(CELL)).toBeCloseTo(127.44, 2);
  expect(Math.max(...[...s.worstOn].filter(([f]) => f !== Z1).map(([, v]) => v))).toBeCloseTo(127.44, 2);
});

// ---------------------------------------------------------------------------
// In the game.
// ---------------------------------------------------------------------------

async function open(page: Page): Promise<void> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#minotaur');
  expect(await page.locator('#stamp').textContent(), 'a local build: a stage is entered only where there are dev tools').not.toMatch(/^prod/);
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.levelData.id === 'minotaur');
  // Stop the loop, and let a frame already queued run out: only the test ticks.
  await page.evaluate(async () => {
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = () => 0;
    await new Promise((done) => raf(() => raf(done)));
  });
  expect(errors).toEqual([]);
}

test('in the game: he walks in off the left edge safely as far as the spawn, with the camera on him from the first frame', async ({ page }) => {
  await open(page);
  const r = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    const p = g.player;
    g.enterLevel(g.levelIndex, true);
    const first = { arriving: g.isArriving, x: p.x, camY: g.camera.y };
    const frames: { x: number; y: number; ground: boolean; state: string; top: number; bottom: number }[] = [];
    const key = (d: boolean) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: 'ArrowRight' }));
    let walked = 0;
    for (let i = 0; i < 120 && p.x < g.levelData.spawn.x; i++) {
      // His to steer once all of him is on the screen: then he walks on to the spawn.
      if (!g.isArriving) {
        key(true);
        walked++;
      }
      g.tick();
      frames.push({ x: p.x, y: p.y, ground: p.onGround, state: g.state, top: p.y - g.camera.y, bottom: p.y + p.h - g.camera.y });
    }
    key(false);
    return { first, frames, walked, deaths: g.stats.total, at: { x: p.x, y: p.y }, view: g.camera.y };
  });
  expect(r.first.arriving).toBe(true);
  expect(r.first.x).toBeLessThan(0);
  // The camera starts on the spawn, not 519 px under it at the bottom of the section.
  expect(r.first.camY).toBeCloseTo(53, 9);
  expect(r.walked).toBeGreaterThan(0);
  expect(r.at.x).toBeGreaterThanOrEqual(MINOTAUR.spawn.x);
  expect(r.deaths).toBe(0);
  for (const f of r.frames) {
    expect(f.state).toBe('playing');
    expect(f.y).toBe(MINOTAUR.spawn.y);
    expect(f.ground).toBe(true);
    expect(f.top).toBeGreaterThanOrEqual(0);
    expect(f.bottom).toBeLessThanOrEqual(180);
  }
});

test('in the game: the exit at the door waits for the second blow, in every attempt', async ({ page }) => {
  await open(page);
  const r = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    const p = g.player;
    const stand = () => p.spawnAt(0, g.levelData.spawn.y);
    const wait = (n: number) => {
      let shut = 0;
      for (let i = 0; i < n; i++) {
        g.tick();
        if (g.state === 'playing') shut++;
      }
      return shut;
    };
    g.titleTimer = 0;
    stand();
    const before = wait(60);
    g.events.add('secondBlow');
    g.tick();
    const after = g.state;
    g.resetLevel();
    stand();
    const retry = wait(60);
    return { before, after, retry };
  });
  expect(r).toEqual({ before: 60, after: 'complete', retry: 60 });
});
