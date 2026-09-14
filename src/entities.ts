import type { Level, BaboonDef, RelocationDef, StatueDef, SunbeamDef } from './level';
import type { MovingSolid, Player } from './player';
import { PHYS } from './player';
import { centerX, centerY, DT, TILE, type DeathCause, type Rect } from './types';
import type { Sfx } from './audio';

export interface World {
  level: Level;
  player: Player;
  cameraX: number;
  kill(cause: DeathCause): void;
  sound(name: Sfx): void;
}

export interface Entity {
  update(w: World): void;
  /** Solids the player collides with this frame. */
  solids?(): MovingSolid[];
}

// ---------------------------------------------------------------------------
// Colossus head. Intact heads drop. The broken statue has nothing to drop.
// ---------------------------------------------------------------------------

export class ColossusHead implements Entity {
  readonly rect: Rect;
  state: 'idle' | 'falling' | 'landed' = 'idle';
  private vy = 0;
  private solid: MovingSolid;
  readonly headX: number;

  constructor(readonly def: StatueDef) {
    this.headX = def.tx * TILE + TILE;
    this.rect = { x: this.headX, y: 6 * TILE, w: 32, h: 32 };
    this.solid = { rect: this.rect, dx: 0, dy: 0 };
  }

  update(w: World): void {
    if (this.def.broken || !this.def.drops) return;
    const p = w.player;

    if (this.state === 'idle') {
      // Tuned so the head meets a full-speed runner. Stop short and it lands in front of you.
      if (centerX(p) >= this.headX - 40) {
        this.state = 'falling';
        w.sound('headCrack');
      }
      return;
    }

    if (this.state === 'falling') {
      this.vy = Math.min(PHYS.maxFall, this.vy + PHYS.gravity * DT);
      const dy = this.vy * DT;
      const tiles: Rect[] = [];
      this.rect.y += dy;
      w.level.solidTilesIn(this.rect, tiles);
      if (overlapsRect(this.rect, p)) w.kill('Colossus head');
      for (const t of tiles) {
        if (t.y < this.rect.y + this.rect.h) {
          // Thirty tonnes of sandstone do not bounce. The head shatters into a
          // one-tile-high pile of rubble that the player hops over.
          this.rect.h = 16;
          this.rect.y = t.y - this.rect.h;
          this.state = 'landed';
          w.sound('headThud');
        }
      }
    }
  }

  solids(): MovingSolid[] {
    return this.state === 'landed' ? [this.solid] : [];
  }
}

// ---------------------------------------------------------------------------
// Baboon. Twenty-two of them, identical. One throws a date. It does not move.
// ---------------------------------------------------------------------------

export class Baboon implements Entity {
  readonly rect: Rect;
  /** The thrown date, once it exists. */
  date: Rect | null = null;
  state: 'idle' | 'thrown' | 'landed' = 'idle';
  private vx = 0;
  private vy = 0;

  constructor(readonly def: BaboonDef) {
    this.rect = { x: def.x, y: def.y, w: 6, h: 8 };
  }

  update(w: World): void {
    if (!this.def.throws || this.state === 'landed') return;
    const p = w.player;
    if (this.state === 'idle') {
      if (centerX(p) >= this.rect.x - 52) {
        this.state = 'thrown';
        this.date = { x: this.rect.x - 2, y: this.rect.y - 2, w: 4, h: 4 };
        this.vx = -12;
        this.vy = -70;
        w.sound('baboon');
      }
      return;
    }
    const d = this.date;
    if (!d) return;
    this.vy = Math.min(PHYS.maxFall, this.vy + PHYS.gravity * DT);
    d.x += this.vx * DT;
    d.y += this.vy * DT;
    const tiles: Rect[] = [];
    w.level.solidTilesIn(d, tiles);
    for (const t of tiles) {
      if (t.y < d.y + d.h) {
        d.y = t.y - d.h;
        this.state = 'landed';
        w.sound('dateLand');
      }
    }
    if (this.state === 'thrown' && overlapsRect(d, p)) w.kill('Baboon');
  }
}

// ---------------------------------------------------------------------------
// Relocation. 1,036 numbered blocks, 65 metres up, 200 metres back. You are on 417.
// ---------------------------------------------------------------------------

export class Relocation implements Entity {
  readonly platform: MovingSolid;
  state: 'idle' | 'rising' | 'sliding' = 'idle';
  private risen = 0;
  waterY: number;
  readonly waterRect: Rect;
  private readonly startRect: Rect;

  constructor(readonly def: RelocationDef, levelH: number) {
    this.startRect = { ...def.platform };
    this.platform = { rect: { ...def.platform }, dx: 0, dy: 0 };
    this.waterY = levelH;
    this.waterRect = { x: 0, y: levelH, w: def.waterRightEdge, h: 0 };
  }

  get triggered(): boolean {
    return this.state !== 'idle';
  }

  blockNumberAt(i: number): number {
    return this.def.firstBlockNumber + i;
  }

  update(w: World): void {
    const p = w.player;
    const d = this.def;
    const r = this.platform.rect;
    this.platform.dx = 0;
    this.platform.dy = 0;

    if (this.state === 'idle') {
      const triggerX = r.x + (d.triggerBlock - d.firstBlockNumber) * TILE;
      const standingOnBlocks = p.x + p.w > r.x && p.x < r.x + r.w && Math.abs(p.y + p.h - r.y) <= 2;
      if (standingOnBlocks && centerX(p) >= triggerX) this.state = 'rising';
      return;
    }

    if (this.state === 'rising') {
      const step = Math.min(d.riseSpeed * DT, d.riseDistance - this.risen);
      r.y -= step;
      this.risen += step;
      this.platform.dy = -step;
      if (this.risen >= d.riseDistance) this.state = 'sliding';
    } else {
      const step = d.slideSpeed * DT;
      r.x -= step;
      this.platform.dx = -step;
    }

    // Lake Nasser fills the pit, then keeps coming.
    const levelBottom = this.startRect.y + this.startRect.h + TILE;
    if (this.waterY > d.waterFastTo) this.waterY = Math.max(d.waterFastTo, this.waterY - d.waterFastSpeed * DT);
    else if (this.waterY > d.waterSlowTo) this.waterY = Math.max(d.waterSlowTo, this.waterY - d.waterSlowSpeed * DT);
    this.waterRect.y = this.waterY;
    this.waterRect.h = Math.max(0, levelBottom - this.waterY);

    if (overlapsRect(this.waterRect, p) && centerY(p) > this.waterY) w.kill('Lake Nasser');
  }

  solids(): MovingSolid[] {
    return [this.platform];
  }
}

// ---------------------------------------------------------------------------
// Sunbeam. Twice a year the sun reaches the sanctuary. Ptah stays in the dark.
// ---------------------------------------------------------------------------

export class Sunbeam implements Entity {
  t = -1;
  /** Current lit rect, or null when dark. */
  beam: Rect | null = null;
  fade = 0;

  constructor(readonly def: SunbeamDef) {}

  get triggered(): boolean {
    return this.t >= 0;
  }

  get finished(): boolean {
    const d = this.def;
    return this.t > d.darkFor + d.sweepFor + d.holdFor + 0.3;
  }

  update(w: World): void {
    const p = w.player;
    const d = this.def;
    if (this.t < 0) {
      if (centerX(p) >= d.triggerX) this.t = 0;
      else return;
    }
    this.t += DT;

    const sweepStart = d.darkFor;
    const holdStart = sweepStart + d.sweepFor;
    const fadeStart = holdStart + d.holdFor;

    this.beam = null;
    this.fade = 0;
    if (this.t >= sweepStart && this.t < fadeStart) {
      const k = Math.min(1, (this.t - sweepStart) / d.sweepFor);
      const front = d.beamStartX + (d.beamEndX - d.beamStartX) * k;
      this.beam = { x: d.beamStartX, y: d.beamTop, w: front - d.beamStartX, h: d.beamBottom - d.beamTop };
    } else if (this.t >= fadeStart && this.t < fadeStart + 0.3) {
      this.fade = 1 - (this.t - fadeStart) / 0.3;
    }

    if (this.beam && overlapsRect(this.beam, p)) {
      const inAlcove = centerX(p) >= d.alcove.x && centerX(p) <= d.alcove.x + d.alcove.w;
      if (!inAlcove) w.kill('The sun');
    }
  }
}

function overlapsRect(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
