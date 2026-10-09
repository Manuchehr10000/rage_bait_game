import { MINOTAUR } from '../src/levels/ch03-aegean/l06-minotaur';
import { Level } from '../src/engine/level';
import { createEntity, Ear, Hero, type Entity, type World } from '../src/engine/entities';
import { Camera } from '../src/engine/camera';
import { PHYS, Player } from '../src/engine/player';
import type { Input } from '../src/engine/input';

/**
 * The Minotaur's stage in Node, for its specs (tests/minotaur*.spec.ts): an attempt on
 * the game's own entities and physics, ticked the way game.ts ticks them: the entities
 * see where he was, then he moves, then the camera follows him. And the clean run's
 * hands. Not a spec: nothing here is a test.
 */

export const LEVEL = new Level(MINOTAUR);

/** The floors of the way down, by their tops: the door storey's, T_end's and the cell's. */
export const DOOR_FLOOR = 160;
export const T_END_FLOOR = 576;
export const CELL_FLOOR = 736;

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
  log: Tick[] = [];
  /** The longest fall he has walked away from. */
  worstFall = 0;
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
      return c;
    });
    r.cam = Object.assign(Object.create(Camera.prototype), this.cam);
    r.heard = [...this.heard];
    r.log = [...this.log];
    return r;
  }

  tick(press: Press, without?: Entity): void {
    if (this.cause) return;
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
      events: new Set<string>(),
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
        this.cam.update(this.p);
        if (this.p.y > LEVEL.heightPx + 16) this.cause = MINOTAUR.fallCause!;
      }
    }
    const p = this.p;
    this.log.push({ t: this.t, x: p.x, y: p.y, vx: p.vx, vy: p.vy, ground: p.onGround, k: this.hero.k, camY: this.cam.iy, view: this.cam.y });
    this.t++;
  }

  /** Ticks with these hands until `until` says stop, the attempt ends, or `max` ticks. */
  play(hands: Hands, until: (r: Run) => boolean = () => false, max = 2000): this {
    for (let i = 0; i < max && !this.cause && !until(this); i++) this.tick(hands(this));
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

/** A jump held this many frames is a full one: the cut never bites after 15. */
export const FULL = 20;

/**
 * The clean run (LEVEL.md: The beats, and The way down): what he presses, tick by tick,
 * from the spawn to the cell floor, as the hands of a man who knows the level. Later
 * stages carry it on: the fight, and out by the thread to the exit.
 */
export function cleanRun(): Hands {
  /** Which way he runs on each floor: off its end into the hole, landing running the other way. */
  const WAY: Record<number, -1 | 1> = { [DOOR_FLOOR]: 1, 256: -1, 336: 1, 416: -1, 512: 1, [T_END_FLOOR]: -1 };
  let dir: -1 | 1 = 1;
  let hold = 0;
  const done = new Set<string>();
  const jump = (name: string, when: boolean) => {
    if (!when || done.has(name)) return;
    done.add(name);
    hold = FULL;
  };
  return (r) => {
    const p = r.p;
    const feet = p.y + p.h;
    const floor = Math.round(feet);
    if (p.onGround && onFloor(feet, floor) && WAY[floor] !== undefined) dir = WAY[floor]!;
    // a. Over the kneeling hero at 0.42 s, a full jump, landing in the vestibule.
    jump('vault', r.t === 25);
    // b. Over the line, a full jump pressed 4 frames before it is taut: on this tick the
    // hero's clock reads -4.
    jump('knot', r.hero.k + 1 === -4);
    // d. Over the bed, which knocks hollow and sends the beast to it, and into the hatch: a
    // running leap from x 81.8, left held, never touching the lip.
    jump('hatch', onFloor(feet, T_END_FLOOR) && p.onGround && p.x <= 81.84);
    const j = hold > 0;
    if (hold > 0) hold--;
    // e. Down on the cell floor he stands: the fight is not built yet.
    const down = p.onGround && feet > CELL_FLOOR - 1;
    return { dir: down ? 0 : dir, jump: j };
  };
}
