import { MINOTAUR } from '../src/levels/ch03-aegean/l06-minotaur';
import { Level } from '../src/engine/level';
import { createEntity, Ear, Fight, Hero, Tableau, type Entity, type World } from '../src/engine/entities';
import { Camera } from '../src/engine/camera';
import { PHYS, Player } from '../src/engine/player';
import type { Input } from '../src/engine/input';
import { overlaps } from '../src/engine/types';

/**
 * The Minotaur's stage in Node, for its specs (tests/minotaur*.spec.ts): an attempt on
 * the game's own entities and physics, ticked the way game.ts ticks them: the entities
 * see where he was, then he moves, then the camera follows him, and he is out if he has
 * reached the open exit. And the clean run's hands. Not a spec: nothing here is a test.
 */

export const LEVEL = new Level(MINOTAUR);

/** The floors of the way down, by their tops: the door storey's, T_end's and the cell's; and row 5's. */
export const DOOR_FLOOR = 160;
export const T_END_FLOOR = 576;
export const CELL_FLOOR = 736;
/** Row 5's floor, over the cell's far wall: out of the fight. */
export const ROW_5 = 656;

/** What he presses on a tick: which way, and whether jump is held. A press is the edge, as on the keyboard. */
export interface Press {
  dir: -1 | 0 | 1;
  jump: boolean;
}
export type Hands = (r: Run) => Press;

/** One tick's worth of him and the world, after the tick. */
export interface Tick {
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ground: boolean;
  /** The hero's clock after the tick. */
  k: number;
  /** The camera's top, as drawn (rounded), and as it is. */
  camY: number;
  view: number;
}

/** An attempt, in Node, from the spawn: the level's entities, the tourist, the camera, and what was heard. */
export class Run {
  p = new Player();
  entities: Entity[];
  cam = new Camera(LEVEL.widthPx, MINOTAUR.cameraBottom);
  /** Ticks since the attempt began. */
  t = 0;
  cause: string | null = null;
  /** Where the death leaves him, if it said; and the tick it came on. */
  at: { x: number; y: number } | null = null;
  died = -1;
  /** The tick the knot fired on, or -1. */
  fire = -1;
  heard: { t: number; sound: string }[] = [];
  /** The events fired this attempt, as the game keeps them. */
  events = new Set<string>();
  log: Tick[] = [];
  /** The longest fall he has walked away from. */
  worstFall = 0;
  /** The tick he went out at the door on, or -1: the game's exit, open from the second blow. */
  out = -1;
  private held = false;

  constructor() {
    this.entities = MINOTAUR.entities.map((d) => createEntity(d, LEVEL));
    this.p.spawnAt(MINOTAUR.spawn.x, MINOTAUR.spawn.y);
    this.cam.reset(this.p);
  }

  get hero(): Hero {
    return this.entities.find((e): e is Hero => e instanceof Hero)!;
  }

  get ear(): Ear {
    return this.entities.find((e): e is Ear => e instanceof Ear)!;
  }

  get fight(): Fight {
    return this.entities.find((e): e is Fight => e instanceof Fight)!;
  }

  get tableau(): Tableau {
    return this.entities.find((e): e is Tableau => e instanceof Tableau)!;
  }

  /** The tick the line came taut on, or -1. */
  get yank(): number {
    return this.fire < 0 ? -1 : this.fire + this.hero.def.lean;
  }

  clone(): Run {
    const r = Object.assign(Object.create(Run.prototype), this) as Run;
    r.p = Object.assign(new Player(), this.p);
    r.entities = this.entities.map((e) => {
      const c = Object.assign(Object.create(Object.getPrototypeOf(e)), e);
      if (e instanceof Ear) c.puffs = [...e.puffs];
      // Its solid is its own, and he rides the copy's.
      if (e instanceof Fight) {
        c.solid = { ...e.solid, rect: { ...e.solid.rect } };
        if (this.p.riding === e.solid) r.p.riding = c.solid;
      }
      return c;
    });
    r.cam = Object.assign(Object.create(Camera.prototype), this.cam);
    r.heard = [...this.heard];
    r.events = new Set(this.events);
    r.log = [...this.log];
    return r;
  }

  tick(press: Press, without?: Entity): void {
    if (this.cause || this.out >= 0) return;
    const k = { pressed: press.jump && !this.held };
    this.held = press.jump;
    const input = {
      left: press.dir < 0,
      right: press.dir > 0,
      jumpHeld: press.jump,
      takeJumpPressed: () => {
        const v = k.pressed;
        k.pressed = false;
        return v;
      },
    } as unknown as Input;
    const w = {
      level: LEVEL,
      player: this.p,
      cameraX: this.cam.x,
      events: this.events,
      alive: true,
      kill: (c: string, at?: { x: number; y: number }) => {
        if (this.cause) return;
        this.cause = c;
        this.at = at ?? null;
        this.died = this.t;
      },
      sound: (n: string) => this.heard.push({ t: this.t, sound: n }),
    } as unknown as World;
    const kneeling = this.hero.state === 'kneel';
    const live = this.entities.filter((e) => e !== without);
    for (const e of live) {
      e.update(w);
      if (this.cause) break;
    }
    if (kneeling && this.hero.state === 'up') this.fire = this.t;
    if (!this.cause) {
      const solids = live.flatMap((e) => e.solids?.() ?? []);
      this.p.update(input, LEVEL, solids, this.cam.x);
      this.worstFall = Math.max(this.worstFall, this.p.fellBy);
      if (this.p.fellBy > PHYS.fatalFall) this.cause = MINOTAUR.dropCause!;
      else {
        const keep = live.map((e) => e.keepsInView?.() ?? null).filter((y): y is number => y !== null);
        this.cam.update(this.p, keep.length ? Math.max(...keep) : undefined);
        if (this.p.y > LEVEL.heightPx + 16) this.cause = MINOTAUR.fallCause!;
        else if (this.events.has(MINOTAUR.exitAfter!) && overlaps(this.p, MINOTAUR.exit!)) this.out = this.t;
      }
    }
    const p = this.p;
    this.log.push({ t: this.t, x: p.x, y: p.y, vx: p.vx, vy: p.vy, ground: p.onGround, k: this.hero.k, camY: this.cam.iy, view: this.cam.y });
    this.t++;
  }

  /** Ticks with these hands until `until` says stop, the attempt ends, he is out, or `max` ticks. */
  play(hands: Hands, until: (r: Run) => boolean = () => false, max = 2000): this {
    for (let i = 0; i < max && !this.cause && this.out < 0 && !until(this); i++) this.tick(hands(this));
    return this;
  }
}

/** The first tick, after `from`, on which `test` holds of him after the tick. */
export const first = (r: Run, test: (l: Tick) => boolean, from = 0) => r.log.find((l) => l.t >= from && test(l));
/**
 * His feet on a floor: on it, the contact the fight keys on, not the 1 px probe. To a
 * millionth of a pixel: a fall at maxFall sums 5.333... px a frame and can stop a hair
 * short of the floor it is on.
 */
export const onFloor = (feet: number, floor: number) => Math.abs(feet - floor) < 1e-6;
export const on = (floor: number) => (l: Tick) => onFloor(l.y + 16, floor);
export const inAir = (l: Tick) => !l.ground;

/**
 * A seeded generator, so a random test is the same test every time. Multiplied as 32-bit
 * integers: a plain product passes 2^53, loses its low bits, and repeats every 10,466.
 */
export const seeded = (seed: number) => () => ((seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff) / 0x80000000);

/** A jump held this many frames is a full one: the cut never bites after 15. */
export const FULL = 20;

/**
 * One jump of the way out: along the floor at `floor` to `at` (the wall under a hole, as
 * a rule, where he stops), and from there a jump held `hold` frames (a full one if not
 * said), steering `steer` from `after` frames into it, onto the floor at `to`.
 */
export interface Climb {
  name: string;
  floor: number;
  at: number;
  steer: -1 | 0 | 1;
  after: number;
  hold?: number;
  to: number;
}

/**
 * The way out's climbs (LEVEL.md, beat f), in order: against the wall under the hole the
 * thread goes up, a full jump, steered onto the floor it comes out on. Up through J1's
 * floor hole and the thread holes of the four rooms, onto the stair slab; then up the
 * column by the ledges beside the shafts and the pillar tops, the shelf, and G0.
 */
export const CLIMBS: readonly Climb[] = [
  { name: 'J1', floor: ROW_5, at: 262, steer: -1, after: 14, to: 608 },
  { name: 'J2', floor: 608, at: 240, steer: 1, after: 14, to: 560 },
  { name: 'J3', floor: 560, at: 278, steer: -1, after: 14, to: 512 },
  { name: 'J4', floor: 512, at: 240, steer: 1, after: 14, to: 464 },
  { name: 'the stair slab', floor: 464, at: 262, steer: 1, after: 14, to: 416 },
  { name: 'L_C', floor: 416, at: 278, steer: 1, after: 0, to: 368 },
  { name: 'the ledge at 320', floor: 368, at: 294, steer: -1, after: 0, to: 320 },
  { name: 'L_B', floor: 320, at: 272, steer: -1, after: 0, to: 272 },
  { name: 'the ledge at 224', floor: 272, at: 256, steer: 1, after: 0, to: 224 },
  { name: 'L_A', floor: 224, at: 278, steer: 1, after: 0, to: 176 },
  { name: 'the shelf', floor: 176, at: 294, steer: -1, after: 0, to: 128 },
  { name: 'G0', floor: 128, at: 256, steer: -1, after: 0, to: 80 },
];

/** His feet on the floor at `y`, as the 1 px ground probe stands him: the way out's test of a landing. */
const standsOn = (p: Player, y: number) => p.onGround && Math.abs(p.y + p.h - y) < 0.6;

/**
 * Hands that make `climbs` in order, from wherever he is on the first one's floor, and then
 * do what `then` says: each a walk to its `at`, and the jump from there once he is on its
 * floor, until he stands on its `to`.
 */
export function climber(climbs: readonly Climb[], then: Hands): Hands {
  let i = 0;
  /** Which way he walks to the climb's `at`, and the tick he pressed its jump, or -1. */
  let way: -1 | 1 | 0 = 0;
  let pressed = -1;
  const hands: Hands = (r) => {
    const c = climbs[i];
    if (!c) return then(r);
    const p = r.p;
    if (pressed < 0) {
      if (!way) way = p.x < c.at ? 1 : -1;
      if (standsOn(p, c.floor) && (way > 0 ? p.x >= c.at - 0.01 : p.x <= c.at + 0.01)) {
        pressed = r.t;
        return { dir: c.after ? 0 : c.steer, jump: true };
      }
      return { dir: way, jump: false };
    }
    const k = r.t - pressed;
    if (k > 2 && standsOn(p, c.to)) {
      i++;
      way = 0;
      pressed = -1;
      return hands(r);
    }
    return { dir: k >= c.after ? c.steer : 0, jump: k < (c.hold ?? FULL) };
  };
  return hands;
}

/** Out of the turnings and the column: left along G0, down O1 into the passage, and out at the door. */
export const toTheDoor: Hands = () => ({ dir: -1, jump: false });

/**
 * The clean run (LEVEL.md: The beats, and The way down): what he presses, tick by tick,
 * from the spawn to the exit, as the hands of a man who knows the level: down to the cell,
 * through the fight onto row 5, and out by the thread.
 */
export function cleanRun(): Hands {
  /** Which way he runs on each floor: off its end into the hole, landing running the other way; on the cell's, at the bull. */
  const WAY: Record<number, -1 | 1> = { [DOOR_FLOOR]: 1, 256: -1, 336: 1, 416: -1, 512: 1, [T_END_FLOOR]: -1, [CELL_FLOOR]: 1 };
  let dir: -1 | 1 = 1;
  let hold = 0;
  const done = new Set<string>();
  const jump = (name: string, when: boolean) => {
    if (!when || done.has(name)) return;
    done.add(name);
    hold = FULL;
  };
  /** f. Out by the thread, from the frame he stands on row 5, over the cell's far wall. */
  const out = climber(CLIMBS, toTheDoor);
  let outward = false;
  return (r) => {
    const p = r.p;
    const feet = p.y + p.h;
    const floor = Math.round(feet);
    outward ||= standsOn(p, ROW_5) && p.x + p.w > 144;
    if (outward) return out(r);
    if (p.onGround && onFloor(feet, floor) && WAY[floor] !== undefined) dir = WAY[floor]!;
    // a. Over the kneeling hero at 0.42 s, a full jump, landing in the vestibule.
    jump('vault', r.t === 25);
    // b. Over the line, a full jump pressed 4 frames before it is taut: on this tick the
    // hero's clock reads -4.
    jump('knot', r.hero.k + 1 === -4);
    // d. Over the bed, which knocks hollow and sends the beast to it, and into the hatch: a
    // running leap from x 81.8, left held, never touching the lip.
    jump('hatch', onFloor(feet, T_END_FLOOR) && p.onGround && p.x <= 81.84);
    // e. Running at the bull from the left wall, a full leap at L + 18, after the hero's
    // and before his grip, down onto its back; and off it at L + 60, as the heave has
    // lifted it, onto row 5. On this tick the fight's clock reads 18, and 60.
    jump('bull', r.fight.k + 1 === 18);
    jump('off', r.fight.k + 1 === 60);
    const j = hold > 0;
    if (hold > 0) hold--;
    return { dir, jump: j };
  };
}

/** The clean run's presses, tick by tick from the spawn, to the tick he goes out at the door: for the game in a browser to replay. */
export function cleanPresses(): Press[] {
  const r = new Run();
  const hands = cleanRun();
  const out: Press[] = [];
  while (!r.cause && r.out < 0 && r.t < 3000) {
    const p = hands(r);
    out.push(p);
    r.tick(p);
  }
  return out;
}
