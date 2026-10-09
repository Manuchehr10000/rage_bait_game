import type { Sfx } from './audio';
import type {
  ChaserDef,
  ConveyorDef,
  CrumbleDef,
  DoorDef,
  EarDef,
  EntityDef,
  FallingDef,
  GuardsDef,
  HazardDef,
  HeroDef,
  HorseDef,
  Level,
  PlatformDef,
  PusherDef,
  RoofDef,
  SeatDef,
  SnareDef,
  SpanDef,
  SweepDef,
  ThrowerDef,
  TipperDef,
  TrapColumnDef,
  TrainDef,
  WaterDef,
} from './level';
import type { MovingSolid, Player } from './player';
import { PHYS } from './player';
import { centerX, centerY, DT, overlaps, TILE, VIEW_W, type DeathCause, type Rect } from './types';

export interface World {
  level: Level;
  player: Player;
  cameraX: number;
  /** Names of events fired this attempt. Entities read it; platforms and sweeps write it. */
  events: Set<string>;
  /** False while a death plays out. The world keeps moving; a body sets nothing off. */
  alive: boolean;
  /**
   * He dies of `cause`. `at`, where the death leaves him if it is not where he died: the
   * top-left of his box there. Only a death that carries him off says.
   */
  kill(cause: DeathCause, at?: { x: number; y: number }): void;
  sound(name: Sfx): void;
}

export interface Entity {
  readonly def: EntityDef;
  update(w: World): void;
  /** Solids the player collides with this frame. */
  solids?(): MovingSolid[];
  /** True while the player standing on it should count as reaching the exit. */
  isExit?(p: Player): boolean;
  /** True while his steps are this entity's to sound, where it hears him: the game's own step and landing are not heard. */
  ownsSteps?(p: Player): boolean;
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
    case 'trapColumn':
      return new TrapColumn(def);
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
    case 'span':
      return new Span(def);
    case 'seat':
      return new Seat(def);
    case 'door':
      return new Door(def);
    case 'guards':
      return new Guards(def);
    case 'hero':
      return new Hero(def, level);
    case 'ear':
      return new Ear(def);
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
      const go = this.def.onEvent ? w.events.has(this.def.onEvent) : centerX(p) >= this.def.triggerX;
      if (go) {
        this.state = 'falling';
        this.vy = this.def.push ?? 0;
        // A block of the ceiling leaves the ceiling. The next attempt puts it back.
        if (this.def.fromTile) w.level.setTile(Math.floor(this.rect.x / TILE), Math.floor(this.rect.y / TILE), ' ');
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
    const d = this.def;
    if (d.swimmable) return;
    if (overlaps(this.rect, p) && centerY(p) > this.waterY) w.kill(d.cause);
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
  state: 'idle' | 'armed' | 'walking' | 'rising' | 'hopping' | 'falling' | 'landed' | 'gone' = 'idle';
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
    if (this.state === 'idle' && this.def.shy) {
      // It minds one thing: a jump taken at it from the ledge before it. The player
      // moved last frame, so a jump he just took started a few px above that ledge.
      if (!w.alive) return;
      const f = this.def.shy.from;
      const feet = p.y + p.h;
      if (p.justJumped && p.x + p.w > f.x && p.x < f.x + f.w && feet >= f.y - 12 && feet <= f.y + 1) {
        this.state = 'hopping';
        this.vy = -Math.sqrt(2 * PHYS.gravity * this.def.shy.height);
        w.sound('grind');
      }
      return;
    }
    if (this.state === 'hopping') {
      const before = r.y;
      this.vy += PHYS.gravity * DT;
      r.y = Math.min(this.def.rect.y, r.y + this.vy * DT);
      this.solid.dy = r.y - before;
      if (this.vy > 0 && r.y >= this.def.rect.y) {
        r.y = this.def.rect.y;
        this.state = 'landed';
        w.sound('thud');
      }
      return;
    }
    if (this.state === 'idle') {
      if (!w.alive) return;
      // One that minds being landed on wants the player to have come through the
      // air. Entities update before the player moves, so the ground under him last
      // frame is the ground he was on before he arrived.
      const arrived = standing && (!this.def.fromAir || this.wasAirborne);
      const go = this.def.onEvent ? w.events.has(this.def.onEvent) : arrived;
      this.wasAirborne = !p.onGround;
      if (!go) return;
      if (this.def.opens === undefined) {
        this.state = 'armed';
        this.timer = this.def.delay;
        return;
      }
      // A trapdoor: gone this frame, under whoever is on it.
      this.state = 'falling';
      w.sound('crumble');
    }
    if (this.state === 'armed') {
      this.timer -= DT;
      if (this.timer <= 0) {
        if (this.def.blast) {
          // Not a slab giving way: a charge going off under it. Nothing is left to fall.
          this.state = 'gone';
          if (this.def.fromTiles) {
            for (let tx = Math.floor(r.x / TILE); tx < Math.ceil((r.x + r.w) / TILE); tx++)
              for (let ty = Math.floor(r.y / TILE); ty < Math.ceil((r.y + r.h) / TILE); ty++) w.level.setTile(tx, ty, ' ');
          }
          if (standing) w.kill(this.def.cause ?? 'The zodiac');
          else w.sound('blast');
          return;
        }
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
        if ((standing && this.def.walk.letsGo !== false) || this.def.thenFalls) {
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
    else if (this.def.opens !== undefined) this.vy = this.def.opens;
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
    // One that tips is off its bearer the moment it goes: nothing to ride down. One
    // that hops is in the air, not where he meant to land.
    if (this.def.tips && this.state === 'falling') return [];
    if (this.state === 'hopping') return [];
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

/**
 * Something heavy coming down, and him under it: a block of a shelter's roof, a span
 * of a burnt storey. From the first touch he is pinned: nothing he presses gets him
 * out from under it. Caught in the air, he goes down under it to the floor. It crushes
 * him when it lands, on the floor, and not before: never in the air, and never while it
 * is still coming down on a man standing under it. Returns whether it has him.
 */
function crushUnder(w: World, rect: Rect, vy: number, landed: boolean, floorY: number, cause: DeathCause, pinning: boolean): boolean {
  const p = w.player;
  if (!w.alive) return pinning;
  if (!pinning && !overlaps(rect, p)) return false;
  p.pinned = true;
  if (!p.onGround) {
    p.y = Math.min(Math.max(p.y, rect.y + rect.h), floorY - p.h);
    p.vy = Math.max(p.vy, vy);
  }
  if (landed) {
    // On the floor it came down on, flat on it, not a hair above where a hard landing left him.
    if (!p.onGround || Math.abs(p.y + p.h - floorY) < 2) p.y = floorY - p.h;
    p.vy = 0;
    w.kill(cause);
  }
  return true;
}

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
  /** It has touched him, and he is going down under it. */
  private pinning = false;
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
    this.pinning = crushUnder(w, this.rect, this.vy, this.state === 'landed', d.floorY, d.cause, this.pinning);
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

// ---------------------------------------------------------------------------
// Knossos.
// ---------------------------------------------------------------------------

/** How long a column takes to fold under its span once it has decided to go. */
export const COLUMN_FOLD = 0.2;

/**
 * A stretch of the floor over his head, on one column. Solid and drawn as ceiling
 * until the column goes; then it comes down as hard as the roof at Cap Blanc, and
 * whoever is under it is under it. Down, it is a step.
 */
export class Span implements Entity {
  readonly rect: Rect;
  state: 'idle' | 'armed' | 'falling' | 'landed' = 'idle';
  /** Seconds since it was set off. */
  t = 0;
  private vy = 0;
  /** It has touched him, and he is going down under it. */
  private pinning = false;
  private readonly solid: MovingSolid;

  constructor(readonly def: SpanDef) {
    this.rect = { ...def.rect };
    this.solid = { rect: this.rect, dx: 0, dy: 0 };
  }

  /** How far its column has folded: 0 standing, 1 down. */
  get fold(): number {
    if (this.state === 'idle') return 0;
    if (this.state !== 'armed') return 1;
    return Math.max(0, Math.min(1, (this.t - (this.def.delay - COLUMN_FOLD)) / COLUMN_FOLD));
  }

  update(w: World): void {
    const d = this.def;
    const p = w.player;
    if (this.state === 'idle') {
      const cx = centerX(p);
      const f = d.footfall;
      // His feet on the floor under it: on the ground, his centre over the strip.
      const onIt = f !== undefined && w.alive && p.onGround && cx >= f.x && cx < f.x + f.w && Math.abs(p.y + p.h - f.y) <= 2;
      const past = d.atX !== undefined && cx >= d.atX;
      if (onIt || past) this.state = 'armed';
      return;
    }
    if (this.state === 'armed') {
      const before = this.t;
      this.t += DT;
      // The column goes first, with a crack, and then what it was carrying.
      const foldAt = d.delay - COLUMN_FOLD;
      if (before < foldAt && this.t >= foldAt) w.sound('headCrack');
      if (this.t < d.delay) return;
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
    this.pinning = crushUnder(w, this.rect, this.vy, this.state === 'landed', d.floorY, d.cause, this.pinning);
  }

  /** Ceiling while it hangs, nothing while it falls, a step once it is down. */
  solids(): MovingSolid[] {
    return this.state === 'falling' ? [] : [this.solid];
  }
}

/**
 * A seat. The throne of Knossos: land in front of it and he is sitting in it, and that
 * is the end of his visit. Walking past it does nothing; only a landing does. An
 * inactive one is the same chair and does nothing to anybody.
 */
export class Seat implements Entity {
  /** He is sitting in it. */
  sat = false;
  /** Whether he was off the ground last frame: a landing is what it minds. */
  private wasAirborne = false;

  constructor(readonly def: SeatDef) {}

  update(w: World): void {
    const d = this.def;
    const p = w.player;
    if (!d.active || this.sat) return;
    // Entities update before he moves, so this frame's ground is the ground he
    // arrived on last frame, and last frame's air is the air he arrived through.
    const cx = centerX(p);
    const landed = w.alive && p.onGround && this.wasAirborne && Math.abs(p.y + p.h - d.floorY) <= 2 && cx >= d.x && cx < d.x + d.w;
    this.wasAirborne = !p.onGround;
    if (landed) {
      this.sat = true;
      w.kill(d.cause);
    }
  }
}

/**
 * One leaf of a pier-and-door partition. Shut, a bar across the doorway, floor to
 * lintel; open, folded flat against its pier on one side. It turns on the hall's
 * clock, and while it swings, the ground it has still to cover is its own.
 */
export class Door implements Entity {
  /** 0 shut, 1 open. */
  k: number;
  /** Seconds since the hall's clock started, or -1 before it has. */
  t = -1;
  /** Turns begun, so each one clacks once. */
  private turns = 0;
  private readonly solid: MovingSolid;

  constructor(readonly def: DoorDef) {
    this.k = def.startShut ? 0 : 1;
    this.solid = { rect: { x: def.planeX - 2, y: def.floorY - def.height, w: 4, h: def.height }, dx: 0, dy: 0 };
  }

  /** How far from its pivot the leaf reaches now, signed by the side it folds to. */
  get reach(): number {
    return this.def.fold * this.def.leafW * this.k;
  }

  /** True while it is turning. */
  get swinging(): boolean {
    return this.k > 0 && this.k < 1;
  }

  update(w: World): void {
    const d = this.def;
    const c = d.clock;
    const p = w.player;
    if (this.t < 0) {
      if (centerX(p) < c.triggerX) return;
      this.t = 0;
    }
    this.t += DT;
    const since = this.t - c.first;
    if (since < 0) return;
    const n = Math.floor(since / c.period);
    const into = since - n * c.period;
    const s0 = d.startShut ? 0 : 1;
    const from = n % 2 === 0 ? s0 : 1 - s0;
    const to = 1 - from;
    if (into >= c.swing) {
      this.k = to;
      return;
    }
    if (this.turns <= n) {
      this.turns = n + 1;
      if (!d.quiet && d.planeX > w.cameraX - 16 && d.planeX < w.cameraX + VIEW_W + 16) w.sound('clack');
    }
    this.k = from + (to - from) * (into / c.swing);
    if (!w.alive) return;
    // What it has still to cover, floor to lintel; shutting, that includes the bar.
    const a = d.planeX + d.fold * d.leafW * this.k;
    const b = d.planeX + d.fold * d.leafW * to;
    const x0 = Math.min(a, b) - (to === 0 ? 2 : 0);
    const x1 = Math.max(a, b) + (to === 0 ? 2 : 0);
    if (overlaps({ x: x0, y: d.floorY - d.height, w: x1 - x0, h: d.height }, p)) w.kill(d.cause);
  }

  /** A shut leaf is a wall; a moving or open one is not something to stand against. */
  solids(): MovingSolid[] {
    return this.k === 0 ? [this.solid] : [];
  }
}

/**
 * Two files of guards carved in a wall either side of a blank, on the court's clock:
 * they step out of the wall into the court where they are carved, stand, and step back.
 * Nobody moves sideways and nobody steps into the blank. From the middle of stepping
 * out to the middle of stepping back, a guard's body in the court is deadly to touch.
 * Never solid: a solid coming out at him would lift him onto its head.
 */
export class Guards implements Entity {
  /** Seconds since the court's clock started, or -1 before it has. */
  t = -1;
  /** Where they are: in the wall, stepping out, standing out in the court, stepping back. */
  phase: 'wall' | 'stepOut' | 'out' | 'stepBack' = 'wall';
  /** How far out of the wall they are: 0 carved in it, 1 standing in the court. */
  depth = 0;
  /** True while a guard's body in the court kills. */
  deadly = false;
  /**
   * The guards from left to right: the left file, then the right. `x` is a
   * body's left edge; `face` the way it looks: in, toward the blank.
   */
  readonly guards: readonly { x: number; face: 1 | -1 }[];
  /** Their bodies in the court, in the same order. They never move: only `depth` does. */
  readonly rects: readonly Rect[];
  /** Step-outs begun, so each one grinds once. */
  private steps = 0;

  constructor(readonly def: GuardsDef) {
    const half = def.gap / 2;
    const guards: { x: number; face: 1 | -1 }[] = [];
    for (let i = def.perFile - 1; i >= 0; i--) guards.push({ x: def.centreX - half - (i + 1) * def.guardW, face: 1 });
    for (let i = 0; i < def.perFile; i++) guards.push({ x: def.centreX + half + i * def.guardW, face: -1 });
    this.guards = guards;
    this.rects = guards.map((g) => ({ x: g.x, y: def.floorY - def.guardH, w: def.guardW, h: def.guardH }));
  }

  /** The king's place: the blank between the inner guards. */
  get gapRect(): Rect {
    const d = this.def;
    return { x: d.centreX - d.gap / 2, y: d.floorY - d.guardH, w: d.gap, h: d.guardH };
  }

  update(w: World): void {
    const d = this.def;
    const c = d.clock;
    if (this.t < 0) {
      if (centerX(w.player) < c.triggerX) return;
      this.t = 0;
    }
    this.t += DT;
    const since = this.t - c.first;
    if (since < 0) return;
    const n = Math.floor(since / c.period);
    const into = since - n * c.period;
    const back = c.step + c.stand;
    if (into < c.step) {
      this.phase = 'stepOut';
      this.depth = into / c.step;
    } else if (into < back) {
      this.phase = 'out';
      this.depth = 1;
    } else if (into < back + c.step) {
      this.phase = 'stepBack';
      this.depth = 1 - (into - back) / c.step;
    } else {
      this.phase = 'wall';
      this.depth = 0;
    }
    this.deadly = into >= c.step / 2 && into < back + c.step / 2;
    // One clock, one sound: the eight step out together and are heard once.
    if (this.steps <= n) {
      this.steps = n + 1;
      if (d.centreX > w.cameraX - 16 && d.centreX < w.cameraX + VIEW_W + 16) w.sound('grind');
    }
    if (!w.alive || !this.deadly) return;
    for (const r of this.rects) {
      if (overlaps(r, w.player)) {
        w.kill(d.cause);
        return;
      }
    }
  }
}

// ---------------------------------------------------------------------------

/**
 * The parts of a Persian column the falling one is made of, in px, as the renderer
 * draws every column of the kind: a square double plinth `plinth` high, and a shaft
 * `2 * half` wide standing on it.
 */
export const PERSIAN_COLUMN = { plinth: 8, half: 4 } as const;

/** How far all of him must be east of the shaft before he counts as past it, in px. */
const PAST = 2;

/**
 * A column of the Gate's hall (`TrapColumnDef`). If it cracks, a line cracks it: it leans
 * and holds, for good. If it falls, it waits `delay` once he is past its shaft, then the
 * shaft pivots on the east edge of its foot and falls as a rod of its length falls under
 * the game's gravity, from the spin it starts with. It comes down on him where his centre
 * is: if that is east of its foot and the shaft, reaching that far, is at the height of
 * his body there. Behind its foot he is safe. Down, it lies in depth, like a standing
 * column: neither solid nor deadly.
 */
export class TrapColumn implements Entity {
  /** Whether the crack has run across it yet. */
  cracked = false;
  /** Seconds since it cracked, or -1. */
  sinceCrack = -1;
  /** Standing; waiting, once he is past it; falling; down. */
  state: 'standing' | 'waiting' | 'falling' | 'down' = 'standing';
  /** Seconds since he went past it, or -1. */
  sincePast = -1;
  /** Radians from upright, the top toward +x. */
  angle = 0;
  /** Where the shaft pivots: the east edge of its foot, on top of the plinth. */
  readonly pivotX: number;
  readonly pivotY: number;
  /** The shaft's length, from the plinth to its broken top. */
  readonly length: number;
  private spin = 0;

  constructor(readonly def: TrapColumnDef) {
    this.pivotX = def.x + PERSIAN_COLUMN.half;
    this.pivotY = def.floorY - PERSIAN_COLUMN.plinth;
    this.length = def.height - PERSIAN_COLUMN.plinth;
  }

  /** The shaft's four corners, in the world: foot west, foot east, top east, top west. */
  corners(angle = this.angle): { x: number; y: number }[] {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const w = PERSIAN_COLUMN.half * 2;
    // In the shaft's own frame the pivot is the origin, the shaft runs up -y and lies west of it.
    return [
      [-w, 0],
      [0, 0],
      [0, -this.length],
      [-w, -this.length],
    ].map(([lx, ly]) => ({ x: this.pivotX + lx! * c - ly! * s, y: this.pivotY + lx! * s + ly! * c }));
  }

  /** Whether the shaft, at this angle, has come down on anything the level has: its floor, a stair, a wall. */
  private grounded(level: Level, angle: number): boolean {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    // Along the shaft's underside as it falls east: the east face, from the foot to the top.
    for (let t = 0; t <= this.length; t += 1) {
      const x = this.pivotX + t * s;
      const y = this.pivotY - t * c;
      if (level.isSolid(Math.floor(x / TILE), Math.floor(y / TILE))) return true;
      for (const sl of level.slopes) {
        if (x < sl.x0 || x > sl.x1) continue;
        if (y >= sl.y0 + ((sl.y1 - sl.y0) * (x - sl.x0)) / (sl.x1 - sl.x0)) return true;
      }
    }
    return false;
  }

  /**
   * Whether the falling shaft is on him: at his centre, east of its foot and within its
   * reach, the shaft's thickness there overlaps his height.
   */
  crushes(r: Rect): boolean {
    if (this.angle <= 0) return false;
    const s = centerX(r) - this.pivotX;
    const sin = Math.sin(this.angle);
    const cos = Math.cos(this.angle);
    if (s <= 0 || s > this.length * sin) return false;
    // The east face over his centre, and the west face, a shaft's width above it there.
    const under = this.pivotY - (s * cos) / sin;
    const over = under - (PERSIAN_COLUMN.half * 2) / sin;
    return under > r.y && over < r.y + r.h;
  }

  update(w: World): void {
    const p = w.player;
    const d = this.def;
    if (d.crack && !this.cracked && w.alive && centerX(p) >= d.crack.x) {
      this.cracked = true;
      this.sinceCrack = 0;
      this.angle = d.crack.lean;
      w.sound('headCrack');
    } else if (this.cracked) this.sinceCrack += DT;
    const f = d.fall;
    if (!f || this.state === 'down') return;
    if (this.state === 'standing') {
      if (!(w.alive && p.x >= this.pivotX + PAST)) return;
      this.state = 'waiting';
      this.sincePast = 0;
    } else this.sincePast += DT;
    if (this.state === 'waiting') {
      if (this.sincePast < f.delay) return;
      this.state = 'falling';
      this.spin = f.spin;
      w.sound('crumble');
    }
    // A rod pivoting on its end: angular acceleration 3g sin(angle) / 2L.
    this.spin += ((3 * PHYS.gravity) / (2 * this.length)) * Math.sin(this.angle) * DT;
    const next = this.angle + this.spin * DT;
    if (this.grounded(w.level, next)) {
      // Where it meets the ground, to a hundredth of a degree.
      let lo = this.angle;
      let hi = next;
      for (let i = 0; i < 16; i++) {
        const mid = (lo + hi) / 2;
        if (this.grounded(w.level, mid)) hi = mid;
        else lo = mid;
      }
      this.angle = lo;
      this.state = 'down';
      w.sound('headThud');
    } else this.angle = next;
    if (w.alive && this.crushes(p)) w.kill(f.cause);
  }
}

// ---------------------------------------------------------------------------
// The Minotaur.
// ---------------------------------------------------------------------------

/** The hero's box, and his pace in px a frame: 180 px/s, twice the tourist's. */
export const HERO = { w: 12, h: 24, pace: 3 } as const;

/** Px between his footsteps. */
const HERO_STRIDE = 18;

/** What he is doing on a frame of his route. */
export type HeroPose = 'hold' | 'stand' | 'walk' | 'climb' | 'fall' | 'crouch';

/** One frame of the hero's route. The route is worked out once, when the level is built. */
export interface HeroFrame {
  /** His box's top-left. */
  x: number;
  y: number;
  pose: HeroPose;
  facing: 1 | -1;
  /** On the ground. */
  grounded: boolean;
  /** Walking with his head turned back over his shoulder, at his knot. */
  lookBack: boolean;
  /** Drawn in front of the tourist. Only the climb is. */
  front: boolean;
  /** In a black doorway, and not drawn. */
  unseen: boolean;
  /** His trailing foot, where it is on something that is not his floor: the stride. A drawing. */
  foot: Rect | null;
  /** He has the ball, and the thread is laid behind him. */
  carrying: boolean;
  /** How far into paying out a loop he is, from just over 0 to 1, or 0 when he is not. */
  payOut: number;
  /** What is heard of him this frame. */
  heard: 'step' | 'land' | null;
  /** Px he has walked, for the walk cycle. */
  stride: number;
}

/** A point of the thread, laid from frame `at` of his route on. */
export interface ThreadPoint {
  x: number;
  y: number;
  at: number;
}

/** A loop of thread he paid out where he crouched: growing from frame `from` to `to`, then lying where it is. */
export interface ThreadLoop {
  x: number;
  y: number;
  from: number;
  to: number;
}

/** His route, frame by frame from the yank, and the thread he lays on it. */
export interface HeroTrack {
  frames: HeroFrame[];
  /** The thread, from where it leaves the floor of the passage to where it was last laid, in order. */
  thread: ThreadPoint[];
  loops: ThreadLoop[];
  /** The frames he landed on, in order. */
  landings: number[];
}

/** Where the thread leaves his hand. */
export function heroHand(f: HeroFrame): { x: number; y: number } {
  const cx = f.x + HERO.w / 2;
  const feet = f.y + HERO.h;
  if (f.pose === 'crouch') return { x: cx + 3 * f.facing, y: feet - 6 };
  if (f.grounded) return { x: cx + 3 * f.facing, y: feet - 11 };
  return { x: cx, y: feet - 12 };
}

/**
 * The hero's route, one frame at a time, on the level's own rock: he goes at his pace,
 * falls from rest under the game's gravity, is stopped by whatever he meets, and lands
 * on whatever he comes down on. Where he goes over an edge carrying the ball, the thread
 * goes over it with him: from the edge down at 45 degrees to the line he lands on, so
 * that it never lies across a gap like a floor, and straight down that line to where he
 * landed.
 */
function compileHero(def: HeroDef, level: Level): HeroTrack {
  const frames: HeroFrame[] = [];
  const thread: ThreadPoint[] = [];
  const loops: ThreadLoop[] = [];
  const landings: number[] = [];
  const box: Rect = { x: def.kneel.x, y: def.kneel.y + def.kneel.h - HERO.h, w: HERO.w, h: HERO.h };
  const tilesIn = (r: Rect): Rect[] => {
    const out: Rect[] = [];
    level.solidTilesIn(r, out);
    return out.filter((t) => overlaps(t, r));
  };
  const under = (r: Rect) => tilesIn({ x: r.x, y: r.y + r.h, w: r.w, h: 1 });
  let facing: 1 | -1 = 1;
  let carrying = false;
  let stride = 0;
  let vy = 0;
  const push = (f: Partial<HeroFrame> & { pose: HeroPose }): void => {
    frames.push({
      x: box.x,
      y: box.y,
      facing,
      grounded: true,
      lookBack: false,
      front: false,
      unseen: false,
      foot: null,
      carrying,
      payOut: 0,
      heard: null,
      stride,
      ...f,
    });
  };
  const standUntil = (k: number) => {
    while (frames.length < k) push({ pose: 'stand' });
  };
  route: for (const m of def.route) {
    switch (m.do) {
      case 'hold':
        while (frames.length < def.hold) push({ pose: 'hold' });
        break;
      case 'go': {
        standUntil(m.at ?? 0);
        const start = frames.length;
        let fellAt = -1;
        let lip: ThreadPoint | null = null;
        for (;;) {
          const k = frames.length;
          const was = { ...box };
          // Falling, he steers for `air`, which the rock round the hole he went down keeps
          // him from until he is out of it. He faces the way he moves.
          const to = fellAt >= 0 ? (m.air ?? m.x) : m.x;
          const dx = Math.max(-HERO.pace, Math.min(HERO.pace, to - box.x));
          box.x += dx;
          for (const t of tilesIn(box)) box.x = dx > 0 ? t.x - box.w : t.x + t.w;
          if (box.x !== was.x) facing = box.x > was.x ? 1 : -1;
          const grounded = fellAt < 0 && under(box).length > 0;
          let heard: HeroFrame['heard'] = null;
          let landed = false;
          if (grounded) {
            const before = Math.floor(stride / HERO_STRIDE);
            stride += Math.abs(box.x - was.x);
            if (m.steps && Math.floor(stride / HERO_STRIDE) !== before) heard = 'step';
          } else {
            if (fellAt < 0) {
              fellAt = k;
              if (carrying) {
                // Over the edge of the floor he was on, on the side he went off it.
                const floor = under(was);
                const edge = facing > 0 ? Math.max(...floor.map((t) => t.x + t.w)) : Math.min(...floor.map((t) => t.x));
                lip = { x: edge, y: was.y + was.h - 1, at: k };
                thread.push(lip);
              }
            }
            vy = Math.min(PHYS.maxFall, vy + PHYS.gravity * DT);
            box.y += vy * DT;
            if (box.y > level.heightPx) throw new Error(`the hero's route goes off the bottom of the level, going for x ${m.x}`);
            const hit = tilesIn(box);
            if (hit.length) {
              box.y = Math.min(...hit.map((t) => t.y)) - box.h;
              vy = 0;
              landed = true;
              landings.push(k);
              if (!m.quiet) heard = 'land';
            }
          }
          const moving = grounded && box.x !== was.x;
          push({
            pose: landed ? 'stand' : grounded ? (moving ? 'walk' : 'stand') : 'fall',
            grounded: grounded || landed,
            lookBack: moving && k - start < (m.lookBack ?? 0),
            heard,
          });
          if (landed) {
            if (lip) {
              const cx = box.x + box.w / 2;
              const floor = box.y + box.h - 1;
              const bend: ThreadPoint = { x: cx, y: Math.min(lip.y + Math.abs(cx - lip.x), floor), at: k };
              // Laid as his hand comes down past it.
              for (let i = fellAt; i <= k; i++) {
                if (heroHand(frames[i]!).y >= bend.y) {
                  bend.at = i;
                  break;
                }
              }
              thread.push(bend, { x: cx, y: floor, at: k });
            }
            break;
          }
          // There, or walked into something he cannot pass.
          if (grounded && (box.x === m.x || box.x === was.x)) break;
        }
        break;
      }
      case 'climb': {
        standUntil(m.at);
        const path = m.path;
        const end = path[path.length - 1]!.f;
        const top = Math.min(...path.map((p) => p.feet));
        let over = false;
        for (let f = 0; f <= end; f++) {
          const i = path.findIndex((p) => p.f >= f);
          const b = path[i]!;
          const a = path[Math.max(0, i - 1)]!;
          const u = b.f === a.f ? 1 : (f - a.f) / (b.f - a.f);
          box.x = a.x + (b.x - a.x) * u;
          box.y = a.feet + (b.feet - a.feet) * u - box.h;
          const k = frames.length;
          // He takes the ball from where it lies under the mouth, and the thread runs up after him.
          if (f === 0 && m.takes) {
            carrying = true;
            thread.push({ x: box.x + box.w / 2, y: box.y + box.h - 1, at: k });
          }
          const foot = m.foot && f >= m.foot.from && f <= m.foot.to ? m.foot.rect : null;
          push({ pose: 'climb', grounded: false, front: true, foot });
          // Up the mouth behind him, and over its lip where he comes up out of it.
          if (carrying && box.y + box.h === top && !over) {
            over = true;
            thread.push({ x: box.x + box.w / 2, y: top - 1, at: k });
          }
        }
        vy = 0;
        break;
      }
      case 'payOut': {
        // From the frame he landed on, which is the last one there is.
        const first = frames.length - 1;
        const landing = frames[first]!;
        frames[first] = { ...landing, pose: 'crouch', payOut: 1 / m.frames };
        for (let i = 1; i < m.frames; i++) push({ pose: 'crouch', payOut: (i + 1) / m.frames });
        loops.push({ x: box.x + box.w / 2, y: box.y + box.h - 1, from: first, to: first + m.frames - 1 });
        break;
      }
      case 'wait': {
        // From the frame he got there, which is the last one there is.
        const last = frames.length - 1;
        frames[last] = { ...frames[last]!, pose: 'stand', unseen: m.unseen ?? false };
        break route;
      }
    }
  }
  return { frames, thread, loops, landings };
}

/**
 * Theseus (`HeroDef`). He kneels at the doorpost re-tying the thread, a solid box, for
 * as long as the tourist takes; when the tourist's centre crosses the trigger he stands
 * and leans back on the line with a creak, and from the yank it is taut at shin height
 * for `hold` frames, and kills. Then he goes his route on his own clock, whatever the
 * tourist does: frames from the yank, worked out once from the level. Nothing he does
 * after he stands touches anybody, and he is heard where the route says he is.
 */
export class Hero implements Entity {
  /** Kneeling at the post, or up and on his clock. */
  state: 'kneel' | 'up' = 'kneel';
  /** Frames since the level began: the re-tie loop's clock. */
  t = 0;
  /** Frames from the yank once the knot has fired: below 0 while he leans back on the line. */
  k = -Infinity;
  readonly track: HeroTrack;
  private readonly solid: MovingSolid;

  constructor(readonly def: HeroDef, level: Level) {
    this.track = compileHero(def, level);
    this.solid = { rect: { ...def.kneel }, dx: 0, dy: 0 };
  }

  /** True from the yank for `hold` frames: the line is taut, and in it is dead. */
  get taut(): boolean {
    return this.k >= 0 && this.k < this.def.hold;
  }

  /** Where he is on his route, from the yank on; null before it. At its end he stays. */
  get frame(): HeroFrame | null {
    if (this.k < 0) return null;
    const f = this.track.frames;
    return f[Math.min(this.k, f.length - 1)] ?? null;
  }

  update(w: World): void {
    const d = this.def;
    this.t++;
    if (this.state === 'kneel') {
      if (!w.alive || centerX(w.player) < d.triggerX) return;
      this.state = 'up';
      this.k = -d.lean;
      w.sound('creak');
    } else this.k++;
    if (this.taut && w.alive && overlaps(d.line, w.player)) w.kill(d.cause);
    if (this.k >= 0 && this.k < this.track.frames.length && this.track.frames[this.k]!.heard) w.sound('footfall');
  }

  /** The only solid person in the game, and only while he kneels. */
  solids(): MovingSolid[] {
    return this.state === 'kneel' ? [this.solid] : [];
  }
}

// ---------------------------------------------------------------------------
// The Minotaur: the beast under the last corridor's floor.
// ---------------------------------------------------------------------------

/** One of the beast's breaths, in frames: out, held, in, and the pause before the next. */
export const BREATH = { out: 36, hold: 8, in: 36, rest: 12 } as const;
const BREATH_PERIOD = BREATH.out + BREATH.hold + BREATH.in + BREATH.rest;
/**
 * How far into a breath it is on the first frame of every attempt: drawing one in, where
 * the snort's last frames leave it, so the reset after a snort does not jump.
 */
const BREATH_AT_SPAWN = BREATH.out + BREATH.hold + 5;
/** How high its breath rises out of the floor, in px. */
export const PLUME = 32;
/**
 * The snort, in frames from the one he dies on: the sniff where he is, then the jet that
 * carries him up the hatch, then him flat on the ceiling. The dust settles back into the
 * hatch, and on `again` it draws in a slow breath and is asleep.
 */
export const SNORT = { sniff: 5, jet: 4, again: 40 } as const;
/** How long a puff of dust rises before it is gone, in frames. */
export const PUFF = 14;

type Dot = { x: number; y: number };

/** How high its breath stands over the floor `b` frames into a breath: out, held, drawn back in, and none. */
export function breathHeight(b: number): number {
  if (b < BREATH.out) return PLUME * Math.sin(((b + 1) / BREATH.out) * (Math.PI / 2));
  b -= BREATH.out;
  if (b < BREATH.hold) return PLUME;
  b -= BREATH.hold;
  if (b < BREATH.in) return PLUME * (1 - (b + 1) / BREATH.in);
  return 0;
}

/** How hard it is breathing `b` frames into a breath, 0 to 1, and whether it is breathing in. */
export function breathFlow(b: number): { flow: number; inward: boolean } {
  if (b < BREATH.out) return { flow: Math.sin(((b + 0.5) / BREATH.out) * Math.PI), inward: false };
  const i = b - BREATH.out - BREATH.hold;
  if (i >= 0 && i < BREATH.in) return { flow: Math.sin(((i + 0.5) / BREATH.in) * Math.PI), inward: true };
  return { flow: 0, inward: false };
}

/**
 * The dust of one breath, `b` frames into it, rising out of the floor at `x` as twin
 * plumes: a dot every 2 px up each, leaning out as it rises, carried up on the out-breath
 * and back down on the in-breath. The same through the hatch and through a joint.
 */
export function plumeDots(x: number, floorY: number, b: number): Dot[] {
  const h = breathHeight(b);
  const dots: Dot[] = [];
  if (h < 1) return dots;
  // How far the dust has been carried: up while it breathes out, back down while it breathes in.
  const carried = b < BREATH.out + BREATH.hold ? Math.min(b, BREATH.out) : 2 * BREATH.out + BREATH.hold - b;
  const shift = Math.floor(carried * 0.9) % 2;
  for (const side of [-1, 1]) {
    for (let u = 1 + shift; u <= h; u += 2) {
      const lean = 2 + Math.floor((3 * u) / PLUME);
      const waver = (Math.floor((u - shift) / 2) + (side > 0 ? 1 : 0)) % 2;
      dots.push({ x: x + side * (lean + waver), y: floorY - u });
    }
  }
  return dots;
}

/** One puff of dust out of the floor at `x`, `f` frames after it: a few dots rising and spreading, and gone. */
export function puffDots(x: number, floorY: number, f: number): Dot[] {
  if (f < 0 || f >= PUFF) return [];
  const up = 2 + Math.floor(f * 0.9);
  const spread = Math.floor(f / 4);
  const dots: Dot[] = [
    { x: x - 1 - spread, y: floorY - up },
    { x: x + 1 + spread, y: floorY - up - 1 },
    { x, y: floorY - up - 3 },
  ];
  if (f < PUFF - 4) dots.push({ x: x + (f % 2 ? 1 : -1), y: floorY - Math.max(1, up - 3) });
  return dots;
}

/**
 * Where the snort has him on frame `f` of his death, from where he died to `at`: still
 * through the sniff, carried straight up the hatch by the jet, and from then on flat on
 * the ceiling. Never turned.
 */
export function snortBody(from: { x: number; y: number }, at: { x: number; y: number }, f: number): { x: number; y: number; pasted: boolean } {
  if (f < SNORT.sniff) return { x: from.x, y: from.y, pasted: false };
  const k = Math.min(1, (f - SNORT.sniff + 1) / SNORT.jet);
  if (f < SNORT.sniff + SNORT.jet) return { x: from.x + (at.x - from.x) * k, y: from.y + (at.y - from.y) * k, pasted: false };
  return { x: at.x, y: at.y, pasted: true };
}

/**
 * The beast (`EarDef`), never seen. Asleep under the hatch it snores, and breathes dust
 * out of it. It hears him as the tick before left him, before anything that waits for him
 * below does: over its bed he sends it there, dragging itself under the floor, and it
 * breathes up through the bed block's joint instead; on the lip he brings it back at once,
 * awake. Left alone it goes back on its own clock, and is seen going: a puff through the
 * joint it passes as it leaves, one at the lip, and then the hatch breathes, and it
 * sleeps. Whoever's feet go into the hatch while it is there is sniffed and snorted back
 * up onto the ceiling. It sounds his steps on its floor itself, by the stone they are on.
 */
export class Ear implements Entity {
  /** Where it is: under the hatch, at its bed, or on its way back. */
  at: 'hatch' | 'bed' | 'way' = 'hatch';
  /** Asleep, and snoring: under the hatch, and not woken by the lip since. */
  asleep = true;
  /** Ticks since the attempt began. */
  t = 0;
  /** The tick he was last heard over the bed. */
  lastBed = -Infinity;
  /** The tick the breath it is drawing began, at the hatch or the joint. */
  breathFrom = -BREATH_AT_SPAWN;
  /** The puffs of its way back: where, and the tick each went up. */
  puffs: { x: number; from: number }[] = [];
  /** He is in, down the hatch past it: it hears nothing more. */
  in = false;
  /** The tick it snorted him on, or -1. */
  snortAt = -1;
  /** The stone it heard him on last, and whether he was on the ground: his steps. */
  private stone: 'lip' | 'bed' | 'plain' | null = null;
  private ground = false;

  constructor(readonly def: EarDef) {}

  /** Frames since the snort, or -1. */
  get snortFrame(): number {
    return this.snortAt < 0 ? -1 : this.t - this.snortAt;
  }

  /** How far into its present breath it is. */
  get breath(): number {
    return (((this.t - this.breathFrom) % BREATH_PERIOD) + BREATH_PERIOD) % BREATH_PERIOD;
  }

  /** Where it is breathing from: the hatch, the joint over its bed, or nowhere, on its way back or snorting. */
  get breathX(): number | null {
    const d = this.def;
    if (this.snortAt >= 0 && this.snortFrame < SNORT.again) return null;
    if (this.at === 'hatch') return (d.hatch.x0 + d.hatch.x1) / 2;
    if (this.at === 'bed') return d.joint;
    return null;
  }

  /** Whether it hears him: on the ground on its floor, his feet within `reach` of its top, wherever the 1 px probe stood him. */
  hears(p: Player): boolean {
    const f = this.def.floor;
    return p.onGround && Math.abs(p.y + p.h - f.y) <= this.def.reach && p.x < f.x1 && p.x + p.w > f.x0;
  }

  /** Where it hears his steps, they are its to sound. */
  ownsSteps(p: Player): boolean {
    return this.hears(p);
  }

  update(w: World): void {
    const d = this.def;
    this.t++;
    if (this.puffs.length) this.puffs = this.puffs.filter((q) => this.t - q.from < PUFF);
    if (this.snortAt >= 0) {
      // The dust settles back into the hatch, and then it draws a slow breath in, asleep.
      if (this.snortFrame === SNORT.again) {
        this.asleep = true;
        this.breathFrom = this.t - BREATH.out - BREATH.hold;
      }
      return;
    }
    if (this.in) return;
    const p = w.player;
    if (w.alive) {
      if (p.y + p.h > d.inY && p.y < d.floor.y && p.x < d.hatch.x1 && p.x + p.w > d.hatch.x0) {
        if (this.at === 'hatch') {
          this.snortAt = this.t;
          w.kill(d.cause, d.ceiling);
        } else this.in = true;
        return;
      }
      this.listen(w, p);
    }
    this.goBack(w);
  }

  /** His steps on its floor: each sounded by its stone, and the bed and the lip answered. */
  private listen(w: World, p: Player): void {
    const d = this.def;
    const heard = this.hears(p);
    const landed = heard && !this.ground;
    this.ground = p.onGround;
    if (!heard) {
      this.stone = null;
      return;
    }
    const over = (s: { x0: number; x1: number }) => p.x < s.x1 && p.x + p.w > s.x0;
    const stone = over(d.lip) ? 'lip' : over(d.bed) ? 'bed' : 'plain';
    // A ring on the lip, a hollow knock over the bed, and his own step on the rest: each
    // step, each landing, and the first of him on the lip or the bed.
    if (landed || p.justStepped || (stone !== this.stone && stone !== 'plain')) {
      w.sound(stone === 'lip' ? 'ring' : stone === 'bed' ? 'hollow' : landed ? 'land' : 'step');
    }
    this.stone = stone;
    if (stone === 'bed') {
      this.lastBed = this.t;
      if (this.at !== 'bed') this.move(w, 'bed');
    } else if (stone === 'lip') {
      this.asleep = false;
      if (this.at !== 'hatch') this.move(w, 'hatch');
    }
  }

  /** It drags itself to its bed or back under the hatch, and its breath starts again where it is. */
  private move(w: World, to: 'hatch' | 'bed'): void {
    this.at = to;
    this.breathFrom = this.t;
    w.sound('drag');
  }

  /** Its own way back, on the clock from his last step over the bed: never the ring. */
  private goBack(w: World): void {
    const d = this.def;
    if (this.at === 'hatch') return;
    const c = this.t - this.lastBed;
    if (c === d.clock.leaves) {
      this.at = 'way';
      this.puffs.push({ x: d.puffs.leaves, from: this.t });
      w.sound('drag');
    } else if (c === d.clock.lip) {
      this.puffs.push({ x: d.puffs.lip, from: this.t });
    } else if (c >= d.clock.back) {
      this.at = 'hatch';
      this.asleep = true;
      this.breathFrom = this.t;
    }
  }

  /**
   * Its dust this frame, with him at `him`. Behind him: its breath, as twin plumes out of
   * the hatch or through the joint, never where he stands; the puffs of its way back; and
   * after the snort, the dust settling back over the hatch. In front of him, only in the
   * snort: the sniff, drawn down past his legs into the hole, and the jet up it. Once it
   * has snorted him, `him` is where he died, and he is on the ceiling: its breath is
   * whole down into the hatch.
   */
  dust(him: Rect): { behind: Dot[]; front: Dot[] } {
    const d = this.def;
    const floor = d.floor.y;
    const hx = (d.hatch.x0 + d.hatch.x1) / 2;
    const behind: Dot[] = [];
    const front: Dot[] = [];
    const x = this.breathX;
    const stands = this.snortAt < 0;
    if (x !== null) for (const q of plumeDots(x, floor, this.breath)) if (!stands || !overlaps({ x: q.x, y: q.y, w: 1, h: 1 }, him)) behind.push(q);
    for (const q of this.puffs) behind.push(...puffDots(q.x, floor, this.t - q.from));
    const f = this.snortFrame;
    if (f < 0 || f >= SNORT.again) return { behind, front };
    const full = plumeDots(hx, floor, BREATH.out);
    if (f < SNORT.sniff) {
      // The sniff: the dust over the hatch pulled down into it, past his legs, faster each frame.
      for (const q of full) {
        const y = q.y + Math.round(((f + 1) * (f + 2) * PLUME) / 30);
        if (y < floor + TILE) front.push({ x: Math.round(hx + (q.x - hx) * 0.6), y });
      }
    } else if (f < SNORT.sniff + SNORT.jet) {
      // The jet: twin columns of dust, massed, out of the hole and up under his feet to the ceiling.
      const feet = Math.round(snortBody(him, d.ceiling, f).y) + him.h;
      for (const side of [-1, 1]) {
        for (let y = feet; y < floor + TILE; y++) {
          for (let i = 2; i <= 5; i++) if ((i + y + f) % 2 === 0) front.push({ x: hx + side * i - (side > 0 ? 1 : 0), y });
        }
      }
    } else {
      // Settling: the jet's dust comes back down from under him, flat on the ceiling, and
      // hangs over the hatch.
      const k = Math.min(1, (f - SNORT.sniff - SNORT.jet) / 22);
      for (const [i, q] of full.entries()) {
        const fromY = d.ceiling.y + 13 + ((i * 7) % 9);
        behind.push({ x: q.x + ((i % 3) - 1) * Math.round(3 * (1 - k)), y: Math.round(fromY + (q.y - fromY) * k) });
      }
    }
    return { behind, front };
  }

  /**
   * What is heard of it this tick by a man at `p`: its breath, from where it is breathing,
   * as far left or right of him as that is, and its snore on the in-breath while it sleeps
   * under the hatch. Nothing at all to a man above `heardBelow`. Its drag, its stones'
   * steps and its snort are sounds of their own.
   */
  voice(p: Rect): { breath: number; snore: number; pan: number } | null {
    if (p.y + p.h <= this.def.heardBelow) return null;
    const x = this.breathX;
    if (x === null) return { breath: 0, snore: 0, pan: 0 };
    const { flow, inward } = breathFlow(this.breath);
    const pan = Math.max(-1, Math.min(1, (x - centerX(p)) / 160));
    return { breath: flow, snore: this.asleep && this.at === 'hatch' && inward ? flow : 0, pan };
  }
}
