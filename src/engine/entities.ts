import type { Sfx } from './audio';
import type {
  ChaserDef,
  ConveyorDef,
  CrumbleDef,
  EntityDef,
  FallingDef,
  HazardDef,
  HorseDef,
  Level,
  PlatformDef,
  PusherDef,
  RoofDef,
  SnareDef,
  SweepDef,
  ThrowerDef,
  TipperDef,
  TrainDef,
  WaterDef,
} from './level';
import type { MovingSolid, Player } from './player';
import { PHYS } from './player';
import { centerX, centerY, DT, overlaps, TILE, type DeathCause, type Rect } from './types';

export interface World {
  level: Level;
  player: Player;
  cameraX: number;
  /** Names of events fired this attempt. Entities read it; platforms and sweeps write it. */
  events: Set<string>;
  /** False while a death plays out. The world keeps moving; a body sets nothing off. */
  alive: boolean;
  kill(cause: DeathCause): void;
  sound(name: Sfx): void;
}

export interface Entity {
  readonly def: EntityDef;
  update(w: World): void;
  /** Solids the player collides with this frame. */
  solids?(): MovingSolid[];
  /** True while the player standing on it should count as reaching the exit. */
  isExit?(p: Player): boolean;
}

export function createEntity(def: EntityDef, level: Level): Entity {
  switch (def.kind) {
    case 'falling':
      return new Falling(def);
    case 'thrower':
      return new Thrower(def);
    case 'platform':
      return new Platform(def);
    case 'water':
      return new Water(def, level.heightPx);
    case 'sweep':
      return new Sweep(def);
    case 'crumble':
      return new Crumble(def, level);
    case 'pusher':
      return new Pusher(def);
    case 'conveyor':
      return new Conveyor(def);
    case 'chaser':
      return new Chaser(def);
    case 'tipper':
      return new Tipper(def);
    case 'snare':
      return new Snare(def);
    case 'hazard':
      return new Hazard(def);
    case 'horse':
      return new Horse(def);
    case 'roof':
      return new Roof(def);
    case 'train':
      return new Train(def);
  }
}

function fallOntoTiles(w: World, r: Rect, vy: number): boolean {
  r.y += vy * DT;
  const tiles: Rect[] = [];
  w.level.solidTilesIn(r, tiles);
  let landed = false;
  for (const t of tiles) {
    if (t.y < r.y + r.h) {
      r.y = t.y - r.h;
      landed = true;
    }
  }
  return landed;
}

// ---------------------------------------------------------------------------

export class Falling implements Entity {
  readonly rect: Rect;
  state: 'idle' | 'falling' | 'landed' = 'idle';
  private vy = 0;
  private readonly solid: MovingSolid;

  constructor(readonly def: FallingDef) {
    this.rect = { ...def.rect };
    this.solid = { rect: this.rect, dx: 0, dy: 0 };
  }

  update(w: World): void {
    if (!this.def.active) return;
    const p = w.player;
    if (this.state === 'idle') {
      if (centerX(p) >= this.def.triggerX) {
        this.state = 'falling';
        w.sound('headCrack');
      }
      return;
    }
    if (this.state !== 'falling') return;
    this.vy = Math.min(PHYS.maxFall, this.vy + PHYS.gravity * DT);
    if (overlaps(this.rect, p)) w.kill(this.def.cause);
    if (fallOntoTiles(w, this.rect, this.vy)) {
      // Thirty tonnes of sandstone do not bounce. It becomes a low pile you hop over.
      const bottom = this.rect.y + this.rect.h;
      this.rect.h = this.def.landedH;
      this.rect.y = bottom - this.rect.h;
      this.state = 'landed';
      w.sound('headThud');
    }
  }

  solids(): MovingSolid[] {
    return this.state === 'landed' ? [this.solid] : [];
  }
}

// ---------------------------------------------------------------------------

export class Thrower implements Entity {
  readonly rect: Rect;
  projectile: Rect | null = null;
  state: 'idle' | 'thrown' | 'landed' = 'idle';
  private vx = 0;
  private vy = 0;

  constructor(readonly def: ThrowerDef) {
    this.rect = { x: def.x, y: def.y, w: 6, h: 8 };
  }

  update(w: World): void {
    if (!this.def.active || this.state === 'landed') return;
    const p = w.player;
    if (this.state === 'idle') {
      if (centerX(p) >= this.rect.x - this.def.triggerDist) {
        this.state = 'thrown';
        this.projectile = { x: this.rect.x - 2, y: this.rect.y - 2, w: 4, h: 4 };
        this.vx = this.def.vx;
        this.vy = this.def.vy;
        w.sound('baboon');
      }
      return;
    }
    const d = this.projectile;
    if (!d) return;
    this.vy = Math.min(PHYS.maxFall, this.vy + PHYS.gravity * DT);
    d.x += this.vx * DT;
    if (fallOntoTiles(w, d, this.vy)) {
      this.state = 'landed';
      w.sound('dateLand');
    }
    if (this.state === 'thrown' && overlaps(d, p)) w.kill(this.def.cause);
  }
}

// ---------------------------------------------------------------------------

export class Platform implements Entity {
  readonly solid: MovingSolid;
  readonly rail: MovingSolid | null;
  state: 'idle' | 'waiting' | 'rising' | 'sliding' | 'done' = 'idle';
  private risen = 0;
  private slid = 0;
  private wait = 0;

  constructor(readonly def: PlatformDef) {
    this.solid = { rect: { ...def.rect }, dx: 0, dy: 0 };
    this.rail = def.rail ? { rect: { ...def.rail, x: def.rect.x + def.rail.x, y: def.rect.y + def.rail.y }, dx: 0, dy: 0 } : null;
  }

  get rect(): Rect {
    return this.solid.rect;
  }

  get triggered(): boolean {
    return this.state !== 'idle';
  }

  numberAt(i: number): number {
    return (this.def.firstNumber ?? 0) + i;
  }

  private standingOn(p: Player): boolean {
    const r = this.rect;
    return p.x + p.w > r.x && p.x < r.x + r.w && Math.abs(p.y + p.h - r.y) <= 2;
  }

  update(w: World): void {
    this.step(w);
    if (this.rail && this.def.rail) {
      this.rail.rect.x = this.rect.x + this.def.rail.x;
      this.rail.rect.y = this.rect.y + this.def.rail.y;
      this.rail.dx = this.solid.dx;
      this.rail.dy = this.solid.dy;
    }
  }

  private step(w: World): void {
    const p = w.player;
    const d = this.def;
    this.solid.dx = 0;
    this.solid.dy = 0;

    if (this.state === 'idle') {
      const t = d.trigger;
      let go = false;
      if (t.type === 'auto') go = true;
      else if (t.type === 'reach') go = centerX(p) >= t.x;
      else if (t.type === 'standOn') go = this.standingOn(p) && (t.pastX === undefined || centerX(p) >= t.pastX);
      if (!go) return;
      this.wait = t.type === 'standOn' ? (t.delay ?? 0) : 0;
      this.state = this.wait > 0 ? 'waiting' : 'rising';
      if (d.emits) w.events.add(d.emits);
      if (this.state === 'rising') this.begin(w);
      return;
    }
    if (this.state === 'waiting') {
      this.wait -= DT;
      if (this.wait <= 0) {
        this.state = 'rising';
        this.begin(w);
      }
      return;
    }
    if (this.state === 'rising') {
      const total = Math.abs(d.rise);
      const step = Math.min(d.riseSpeed * DT, total - this.risen);
      const dir = d.rise >= 0 ? -1 : 1;
      this.rect.y += dir * step;
      this.solid.dy = dir * step;
      this.risen += step;
      if (this.risen >= total) this.state = d.slideX !== 0 ? 'sliding' : 'done';
      return;
    }
    if (this.state === 'sliding') {
      const total = Math.abs(d.slideX);
      const step = Math.min(d.slideSpeed * DT, total - this.slid);
      const dir = d.slideX >= 0 ? 1 : -1;
      this.rect.x += dir * step;
      this.solid.dx = dir * step;
      this.slid += step;
      if (this.slid >= total) this.state = 'done';
    }
  }

  private begin(w: World): void {
    if (this.def.skin === 'blocks') w.sound('winchStart');
    if (this.def.skin === 'boat') w.sound('motorStart');
  }

  solids(): MovingSolid[] {
    return this.rail ? [this.solid, this.rail] : [this.solid];
  }

  isExit(p: Player): boolean {
    return this.def.isExit === true && this.standingOn(p);
  }
}

// ---------------------------------------------------------------------------

export class Water implements Entity {
  waterY: number;
  readonly rect: Rect;
  rising = false;
  private readonly levelBottom: number;

  constructor(readonly def: WaterDef, levelH: number) {
    this.waterY = def.startY;
    this.levelBottom = levelH + 16;
    this.rect = { x: def.x0, y: def.startY, w: def.x1 - def.x0, h: this.levelBottom - def.startY };
  }

  /** True while the water is in its fast phase. */
  get surging(): boolean {
    const r = this.def.rise;
    return this.rising && r !== undefined && this.waterY > r.fastTo;
  }

  update(w: World): void {
    const p = w.player;
    const r = this.def.rise;
    if (r && !this.rising) {
      if ((r.onEvent && w.events.has(r.onEvent)) || (r.atX !== undefined && centerX(p) >= r.atX)) this.rising = true;
    }
    if (r && this.rising) {
      if (this.waterY > r.fastTo) this.waterY = Math.max(r.fastTo, this.waterY - r.fastSpeed * DT);
      else if (this.waterY > r.slowTo) this.waterY = Math.max(r.slowTo, this.waterY - r.slowSpeed * DT);
    }
    this.rect.y = this.waterY;
    this.rect.h = Math.max(0, this.levelBottom - this.waterY);
    if (this.def.swimmable) return;
    if (overlaps(this.rect, p) && centerY(p) > this.waterY) w.kill(this.def.cause);
  }

  /** True while the player's feet are in this water and it can be swum. Feet, so a stroke can carry you up onto a bank. */
  holds(p: Player): boolean {
    return this.def.swimmable === true && centerX(p) >= this.def.x0 && centerX(p) <= this.def.x1 && p.y + p.h > this.waterY + 2;
  }
}

// ---------------------------------------------------------------------------

export class Sweep implements Entity {
  t = -1;
  /** Current deadly band, or null. */
  band: Rect | null = null;
  fade = 0;
  private emitted = false;

  constructor(readonly def: SweepDef) {}

  get triggered(): boolean {
    return this.t >= 0;
  }

  get finished(): boolean {
    const d = this.def;
    return this.t > d.delay + d.duration + d.hold + 0.3;
  }

  /** Leading edge of the band, for rendering. */
  get front(): number {
    return this.band ? (this.def.endX >= this.def.startX ? this.band.x + this.band.w : this.band.x) : this.def.startX;
  }

  update(w: World): void {
    const p = w.player;
    const d = this.def;
    if (this.t < 0) {
      if (centerX(p) >= d.triggerX) this.t = 0;
      else return;
    }
    this.t += DT;
    const sweepStart = d.delay;
    const holdStart = sweepStart + d.duration;
    const fadeStart = holdStart + d.hold;

    this.band = null;
    this.fade = 0;
    if (this.t >= sweepStart && this.t < fadeStart) {
      if (!this.emitted && d.emits) {
        w.events.add(d.emits);
        this.emitted = true;
      }
      const k = Math.min(1, (this.t - sweepStart) / d.duration);
      const front = d.startX + (d.endX - d.startX) * k;
      const x0 = Math.min(d.startX, front);
      const x1 = Math.max(d.startX, front);
      // A wave is a short band; a beam fills everything behind its front.
      const width = d.skin === 'wave' ? 24 : x1 - x0;
      const bx = d.skin === 'wave' ? (d.endX >= d.startX ? front - width : front) : x0;
      this.band = { x: bx, y: d.top, w: width, h: d.bottom - d.top };
    } else if (this.t >= fadeStart && this.t < fadeStart + 0.3) {
      this.fade = 1 - (this.t - fadeStart) / 0.3;
    }

    if (this.band && overlaps(this.band, p)) {
      const cx = centerX(p);
      const safe = d.safe.some((s) => cx >= s.x && cx <= s.x + s.w && centerY(p) >= s.y && centerY(p) <= s.y + s.h);
      if (!safe) w.kill(d.cause);
    }
  }
}

// ---------------------------------------------------------------------------

export class Crumble implements Entity {
  readonly rect: Rect;
  state: 'idle' | 'armed' | 'walking' | 'rising' | 'falling' | 'landed' | 'gone' = 'idle';
  /** Which way a figure faces. One that walks turns round first. */
  face: 1 | -1;
  private timer = 0;
  private vy = 0;
  private readonly solid: MovingSolid;
  /** Where the top of a rising one meets the rock above it. */
  private readonly roofY: number;
  /** Whether the player was off the ground last frame, for the ones that mind being landed on. */
  private wasAirborne = false;

  constructor(readonly def: CrumbleDef, level?: Level) {
    this.rect = { ...def.rect };
    this.face = def.face ?? 1;
    // Stepping stones can be swum under and past; everything else is solid all round.
    this.solid = { rect: this.rect, dx: 0, dy: 0, oneWay: def.skin === 'stone' };
    this.roofY = level ? roofAbove(level, this.rect) : 0;
  }

  /** How far it has dropped from where it started. */
  get fallen(): number {
    return this.rect.y - this.def.rect.y;
  }

  update(w: World): void {
    if (!this.def.fake || this.state === 'gone') return;
    const p = w.player;
    this.solid.dx = 0;
    this.solid.dy = 0;
    const r = this.rect;
    const standing = p.x + p.w > r.x && p.x < r.x + r.w && Math.abs(p.y + p.h - r.y) <= 2;
    if (this.state === 'idle') {
      if (!w.alive) return;
      // One that minds being landed on wants the player to have come through the
      // air. Entities update before the player moves, so the ground under him last
      // frame is the ground he was on before he arrived.
      const arrived = standing && (!this.def.fromAir || this.wasAirborne);
      const go = this.def.onEvent ? w.events.has(this.def.onEvent) : arrived;
      this.wasAirborne = !p.onGround;
      if (go) {
        this.state = 'armed';
        this.timer = this.def.delay;
      }
      return;
    }
    if (this.state === 'armed') {
      this.timer -= DT;
      if (this.timer <= 0) {
        if (this.def.walk) {
          // It turns round and goes.
          this.state = 'walking';
          this.face = this.def.walk.vx < 0 ? -1 : 1;
        } else if (this.def.riseSpeed !== undefined) {
          this.state = 'rising';
        } else {
          this.state = 'falling';
          w.sound(this.def.skin === 'croc' ? 'splash' : 'crumble');
        }
      }
      return;
    }
    if (this.state === 'walking' && this.def.walk) {
      const { vx, toX } = this.def.walk;
      const remaining = toX - r.x;
      const step = Math.sign(remaining) * Math.min(Math.abs(vx) * DT, Math.abs(remaining));
      r.x += step;
      this.solid.dx = step;
      if (Math.abs(toX - r.x) < 0.01) {
        // Arrived. Unless it is one of the ones that carry you, whoever is still on
        // it is let go of; otherwise it is a ledge where it stopped.
        if (standing && this.def.walk.letsGo !== false) {
          this.state = 'falling';
          w.sound('crumble');
        } else {
          this.state = 'landed';
        }
      }
      return;
    }
    if (this.state === 'rising' && this.def.riseSpeed !== undefined) {
      const stop = Math.max(this.roofY, this.def.riseTo ?? this.roofY);
      const step = Math.min(this.def.riseSpeed * DT, r.y - stop);
      r.y -= step;
      this.solid.dy = -step;
      // The head room runs out before the figure does.
      if (standing && this.def.riseTo === undefined && r.y - p.h < this.roofY) w.kill(this.def.cause ?? 'The overhang');
      if (r.y <= stop) {
        // A thing that lifts you is a thing that drops you.
        this.state = this.def.thenFalls ? 'falling' : 'landed';
        if (this.state === 'falling') w.sound('crumble');
      }
      return;
    }
    // Falling: a crocodile dives at its own pace, a capital drops. You ride it down either way.
    if (this.state === 'landed') return;
    if (this.def.skin === 'croc') this.vy = 55;
    else if (this.def.sinkSpeed !== undefined) this.vy = this.def.sinkSpeed;
    else this.vy = Math.min(PHYS.maxFall, this.vy + PHYS.gravity * DT);
    const before = r.y;
    r.y += this.vy * DT;
    const floorY = this.def.floorY;
    if (floorY !== undefined && r.y + r.h >= floorY) {
      // Plaster hits the bottom of the trench and stays there, in pieces.
      r.y = floorY - r.h;
      this.state = 'landed';
      w.sound('thud');
      if (this.def.cause && standing) w.kill(this.def.cause);
    }
    this.solid.dy = r.y - before;
    if (r.y > w.level.heightPx + 32) this.state = 'gone';
  }

  solids(): MovingSolid[] {
    if (this.state === 'gone') return [];
    // One that tips is off its bearer the moment it goes: nothing to ride down.
    if (this.def.tips && this.state === 'falling') return [];
    return [this.solid];
  }
}

/** The underside of the first solid tile above a rect, over the rect's own width. */
function roofAbove(level: Level, r: Rect): number {
  const tx0 = Math.floor(r.x / TILE);
  const tx1 = Math.floor((r.x + r.w - 1) / TILE);
  for (let ty = Math.floor(r.y / TILE) - 1; ty >= 0; ty--) {
    for (let tx = tx0; tx <= tx1; tx++) if (level.isSolid(tx, ty)) return (ty + 1) * TILE;
  }
  return 0;
}

// ---------------------------------------------------------------------------

/** How a horse of the frieze behaves once it has decided to. */
const HORSE = {
  /** Forward, in px per second, and how far it goes. Far enough to leave nobody standing. */
  walkSpeed: 80,
  walkDistance: 32,
  /** Its own hop: slow gravity and a lazy push, so it is away longer than you are. */
  shyPush: 160,
  shyGravity: 260,
  /** How far the front comes up, in radians, and how fast. */
  rearAngle: 0.62,
  rearSpeed: 3.2,
  /** Back the way you came, and up. */
  rearPushX: -250,
  rearPushY: -190,
  /** How fast the two halves part, in fractions of the break per second. */
  splitSpeed: 2.2,
} as const;

/**
 * A horse of the frieze. Its back is a one-way ledge: you land on it from above
 * and it never blocks you from the side. Nine of the ten hold. The others hold
 * exactly as long as you keep moving.
 */
export class Horse implements Entity {
  readonly rect: Rect;
  state: 'idle' | 'armed' | 'acting' | 'done' = 'idle';
  /** How far it has walked forward, in px. */
  walked = 0;
  /** How far the front has come up, in radians. */
  angle = 0;
  /** How far apart the two halves are, 0 to 1. */
  broken = 0;
  private timer = 0;
  private vy = 0;
  private readonly solid: MovingSolid;

  constructor(readonly def: HorseDef) {
    this.rect = { ...def.rect };
    this.solid = { rect: this.rect, dx: 0, dy: 0, oneWay: true };
  }

  /** True while the back is still something to stand on. */
  get standable(): boolean {
    switch (this.def.trick) {
      case 'rear':
      case 'split':
        return this.state === 'idle' || this.state === 'armed';
      // The shy one is only gone while it is in the air. It comes back to stay.
      case 'shy':
        return this.state !== 'acting';
      // While it falls you ride it. Where it lands is the floor of a trench, not a floor.
      case 'cast':
      case 'crack':
        return this.state !== 'done';
      default:
        return true;
    }
  }

  /**
   * A jump made from the ledge behind it, which is the only thing it minds.
   * Entities update before the player, so this is last frame's jump; nobody will notice.
   */
  private jumpedAt(p: Player): boolean {
    const from = this.def.wakeFrom;
    if (!from || !p.justJumped) return false;
    const feet = p.y + p.h;
    return p.x + p.w > from.x && p.x < from.x + from.w && feet <= from.y + 6 && feet >= from.y - 28;
  }

  /** How far it has dropped from where it was carved. */
  get fallen(): number {
    return this.rect.y - this.def.rect.y;
  }

  update(w: World): void {
    const d = this.def;
    const p = w.player;
    const r = this.rect;
    this.solid.dx = 0;
    this.solid.dy = 0;
    if (d.trick === 'none' || this.state === 'done') return;
    const standing = p.x + p.w > r.x && p.x < r.x + r.w && Math.abs(p.y + p.h - r.y) <= 2;

    if (this.state === 'idle') {
      // The shy one watches the air in front of it. Everything else waits to be stood on.
      if (d.trick === 'shy' ? this.jumpedAt(p) : standing) {
        this.state = 'armed';
        this.timer = d.delay;
      }
      return;
    }

    if (this.state === 'armed') {
      // It has decided. Leaving now does not stop it; it only stops it mattering.
      this.timer -= DT;
      if (this.timer > 0) return;
      this.state = 'acting';
      if (d.trick === 'cast' || d.trick === 'crack') w.sound('crumble');
      else if (d.trick === 'split') w.sound('snap');
      else w.sound('grind');
      if (d.trick === 'rear' && standing) p.shove(HORSE.rearPushX, HORSE.rearPushY);
      if (d.trick === 'shy') this.vy = -HORSE.shyPush;
      return;
    }

    switch (d.trick) {
      case 'crack':
      case 'cast': {
        // One is plaster and one is patient. Either takes whoever is still on it down.
        this.vy = Math.min(PHYS.maxFall, this.vy + PHYS.gravity * DT);
        const before = r.y;
        r.y += this.vy * DT;
        if (r.y + r.h >= d.floorY) {
          r.y = d.floorY - r.h;
          this.state = 'done';
          w.sound('thud');
          if (standing) w.kill(d.cause);
        }
        this.solid.dy = r.y - before;
        break;
      }
      case 'walk': {
        // It walks out from under you. Stone is smooth: it carries nobody.
        const step = Math.min(HORSE.walkSpeed * DT, HORSE.walkDistance - this.walked);
        this.walked += step;
        r.x += step;
        if (this.walked >= HORSE.walkDistance) this.state = 'done';
        break;
      }
      case 'shy': {
        // Its own slow hop. Nothing to land on until it is back where it was carved.
        this.vy += HORSE.shyGravity * DT;
        const before = r.y;
        r.y += this.vy * DT;
        if (this.vy > 0 && r.y >= d.rect.y) {
          r.y = d.rect.y;
          this.vy = 0;
          this.state = 'done';
          w.sound('thud');
        }
        this.solid.dy = r.y - before;
        break;
      }
      case 'rear': {
        this.angle = Math.min(HORSE.rearAngle, this.angle + HORSE.rearSpeed * DT);
        if (this.angle >= HORSE.rearAngle) this.state = 'done';
        break;
      }
      case 'split': {
        this.broken = Math.min(1, this.broken + HORSE.splitSpeed * DT);
        if (this.broken >= 1) this.state = 'done';
        break;
      }
      default:
        break;
    }
  }

  solids(): MovingSolid[] {
    return this.standable ? [this.solid] : [];
  }
}

// ---------------------------------------------------------------------------

/** A block of the overhang comes down harder than anything the player does. */
const ROOF = { push: 240, gravity: 3000 } as const;

/**
 * The roof lets go. Shelters are made by this and unmade by it, and the layers
 * of every one of them are sealed under it. Once it is down it is a step.
 */
export class Roof implements Entity {
  readonly rect: Rect;
  state: 'idle' | 'armed' | 'falling' | 'landed' = 'idle';
  private timer = 0;
  private vy = 0;
  private readonly solid: MovingSolid;

  constructor(readonly def: RoofDef) {
    this.rect = { x: def.x, y: def.fromY, w: def.w, h: def.h };
    this.solid = { rect: this.rect, dx: 0, dy: 0 };
  }

  /** True once it is on its way, or down. */
  get shown(): boolean {
    return this.state !== 'idle';
  }

  update(w: World): void {
    const d = this.def;
    const p = w.player;
    if (this.state === 'idle') {
      if (centerX(p) >= d.triggerX) {
        this.state = 'armed';
        this.timer = d.delay;
      }
      return;
    }
    if (this.state === 'armed') {
      this.timer -= DT;
      if (this.timer > 0) return;
      this.state = 'falling';
      this.vy = ROOF.push;
      w.sound('crumble');
      return;
    }
    if (this.state === 'landed') return;
    this.vy += ROOF.gravity * DT;
    this.rect.y += this.vy * DT;
    if (this.rect.y + this.rect.h >= d.floorY) {
      this.rect.y = d.floorY - this.rect.h;
      this.state = 'landed';
      w.sound('thud');
    }
    if (overlaps(this.rect, p)) w.kill(d.cause);
  }

  solids(): MovingSolid[] {
    return this.state === 'landed' ? [this.solid] : [];
  }
}

// ---------------------------------------------------------------------------

export class Hazard implements Entity {
  constructor(readonly def: HazardDef) {}

  update(w: World): void {
    if (overlaps(this.def.rect, w.player)) w.kill(this.def.cause);
  }
}

// ---------------------------------------------------------------------------

/**
 * The slot between the running rail and the check rail. Step into it and it has
 * you: the boot is in, the foot is not coming out, and the only thing left to
 * happen is the one that was always going to happen. It never lets go, unless it
 * is the kind that lets go of a boot left alone (letsGoStill).
 */
export class Snare implements Entity {
  caught = false;
  /** Let go of: a boot that was left alone long enough. It does not catch again. */
  freed = false;
  /** Seconds the boot has been left alone. */
  private still = 0;

  constructor(readonly def: SnareDef) {}

  update(w: World): void {
    if (!w.alive) return;
    const p = w.player;
    const r = this.def.rect;
    // One that lets go of a still boot counts while he is not pulling at it, and only
    // while the boot is in something: a boot going down the well with its slab stays in.
    const after = this.def.letsGoStill;
    if (this.caught && !this.freed && after !== undefined && p.held) {
      if (!p.onGround) return;
      this.still = p.tugging ? 0 : this.still + DT;
      if (this.still >= after - 1e-9) {
        this.freed = true;
        p.held = false;
        w.sound('step');
      }
      return;
    }
    // His feet have to be in it. Going over it in the air is going over it.
    const feet = p.y + p.h;
    if (!this.caught && p.onGround && feet >= r.y - 2 && feet <= r.y + r.h && centerX(p) >= r.x && centerX(p) <= r.x + r.w) {
      this.caught = true;
      p.held = true;
      // The boot is in it, so all of him is over it and he stops dead: whatever it is
      // fitted to takes him with it, and no edge of him is left resting on, or slides
      // on to, the next thing along.
      p.x = Math.max(r.x, Math.min(p.x, r.x + r.w - p.w));
      p.vx = 0;
      if (this.def.emits) w.events.add(this.def.emits);
      w.sound('thud');
    }
  }
}

// ---------------------------------------------------------------------------

export class Pusher implements Entity {
  /** How far the figure has stepped out of the wall, in px. */
  out = 0;
  state: 'idle' | 'out' | 'done' = 'idle';
  private timer = 0;
  readonly figure: Rect;

  constructor(readonly def: PusherDef) {
    this.figure = { x: def.x, y: def.floorY - 24, w: 12, h: 24 };
  }

  update(w: World): void {
    if (!this.def.active || this.state === 'done') return;
    const p = w.player;
    if (this.state === 'idle') {
      if (Math.abs(centerX(p) - centerX(this.figure)) <= this.def.reach && p.y + p.h >= this.def.floorY - 4) {
        this.state = 'out';
        this.timer = this.def.outFor;
        w.sound('grind');
        p.shove(this.def.impulseX, this.def.impulseY);
      }
      return;
    }
    this.out = Math.min(6, this.out + 60 * DT);
    this.timer -= DT;
    if (this.timer <= 0) this.state = 'done';
  }
}

// ---------------------------------------------------------------------------

export class Conveyor implements Entity {
  constructor(readonly def: ConveyorDef) {}

  update(w: World): void {
    const p = w.player;
    const r = this.def.rect;
    if (p.onGround && centerX(p) >= r.x && centerX(p) <= r.x + r.w && p.y + p.h >= r.y && p.y + p.h <= r.y + r.h) {
      p.drift(this.def.vx);
    }
  }
}

// ---------------------------------------------------------------------------

export class Chaser implements Entity {
  readonly rect: Rect;
  state: 'idle' | 'walking' | 'stopped' = 'idle';
  private readonly dir = -1;
  walkPhase = 0;

  constructor(readonly def: ChaserDef) {
    this.rect = { ...def.rect };
  }

  update(w: World): void {
    const p = w.player;
    if (this.state === 'idle') {
      if (centerX(p) >= this.def.triggerX) {
        this.state = 'walking';
        w.sound('grind');
      }
      return;
    }
    if (this.state === 'walking') {
      // Walks at you, and keeps walking that way once you are past it. It does not turn.
      this.rect.x += this.dir * this.def.speed * DT;
      this.walkPhase += DT;
      if (this.rect.x <= this.def.minX) {
        this.rect.x = this.def.minX;
        this.state = 'stopped';
      }
    }
    if (overlaps(this.rect, p)) w.kill(this.def.cause);
  }
}

// ---------------------------------------------------------------------------

export class Tipper implements Entity {
  /** 0 standing, 1 lying flat to the left. */
  k = 0;
  state: 'idle' | 'tipping' | 'landed' = 'idle';
  private readonly solid: MovingSolid;

  constructor(readonly def: TipperDef) {
    this.solid = { rect: { x: def.x - def.height, y: def.floorY - 16, w: def.height, h: 16 }, dx: 0, dy: 0 };
  }

  /** Angle from vertical, radians, for the renderer. */
  get angle(): number {
    return (Math.PI / 2) * this.k;
  }

  update(w: World): void {
    const p = w.player;
    const d = this.def;
    if (this.state === 'idle') {
      if (centerX(p) >= d.triggerX) {
        this.state = 'tipping';
        w.sound('headCrack');
      }
      return;
    }
    if (this.state === 'tipping') {
      this.k = Math.min(1, this.k + DT / d.duration);
      // The shaft: a segment from the base, leaning left by the current angle. Falls faster near the end.
      const a = this.angle;
      const px = d.x + 8;
      const py = d.floorY;
      const inflated: Rect = { x: p.x - 3, y: p.y - 3, w: p.w + 6, h: p.h + 6 };
      for (let t = 0; t <= d.height; t += 6) {
        const sx = px - Math.sin(a) * t;
        const sy = py - Math.cos(a) * t;
        if (sx >= inflated.x && sx <= inflated.x + inflated.w && sy >= inflated.y && sy <= inflated.y + inflated.h) {
          w.kill(d.cause);
          break;
        }
      }
      if (this.k >= 1) {
        this.state = 'landed';
        w.sound('headThud');
      }
      return;
    }
    if (overlaps(this.solid.rect, p) && p.y + p.h > this.solid.rect.y + 4) {
      // Landed on you.
      w.kill(d.cause);
    }
  }

  solids(): MovingSolid[] {
    return this.state === 'landed' ? [this.solid] : [];
  }
}

// ---------------------------------------------------------------------------

/** The engine and each car of the visitors' train, in px. */
export const TRAIN = { carW: 28, carH: 14, gap: 4 } as const;

/**
 * The electric train of the guided tour. It has run since 1959, it carries the
 * lighting, it keeps to its timetable, and the tourist is walking up its track.
 * It does not chase anybody: it runs at run speed on a clock the tourist started,
 * so ahead of it and moving you are safe for ever, and every step you lose is
 * lost for good. It stops where the visit stops.
 */
export class Train implements Entity {
  readonly rect: Rect;
  state: 'idle' | 'armed' | 'moving' | 'stopped' = 'idle';
  private timer = 0;
  private readonly solid: MovingSolid;

  constructor(readonly def: TrainDef) {
    const len = (def.cars + 1) * TRAIN.carW + def.cars * TRAIN.gap;
    this.rect = { x: def.x - len, y: def.floorY - TRAIN.carH, w: len, h: TRAIN.carH };
    this.solid = { rect: this.rect, dx: 0, dy: 0 };
  }

  /** The front of the engine. */
  get nose(): number {
    return this.rect.x + this.rect.w;
  }

  /** True while it is going. The headlight and the hum follow this. */
  get running(): boolean {
    return this.state === 'moving';
  }

  update(w: World): void {
    const p = w.player;
    const d = this.def;
    this.solid.dx = 0;
    if (this.state === 'idle') {
      if (centerX(p) >= d.triggerX) {
        this.state = 'armed';
        this.timer = d.delay;
      }
      return;
    }
    if (this.state === 'armed') {
      this.timer -= DT;
      if (this.timer > 0) return;
      this.state = 'moving';
      w.sound('motorStart');
      return;
    }
    if (this.state === 'moving') {
      const step = Math.min(d.speed * DT, d.stopX - this.nose);
      this.rect.x += step;
      this.solid.dx = step;
      if (this.nose >= d.stopX) this.state = 'stopped';
    }
    if (overlaps(this.rect, p)) w.kill(d.cause);
  }

  /** Parked, it is a thing you cannot walk through. Moving, it is not a thing you touch. */
  solids(): MovingSolid[] {
    return this.state === 'idle' || this.state === 'armed' ? [this.solid] : [];
  }
}
