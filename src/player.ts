import type { Input } from './input';
import type { Level } from './level';
import { groundBelow, moveAndCollide, type Contacts } from './physics';
import { DT, type Rect } from './types';

/**
 * Tuning. These numbers are the one part of the game that is never allowed to lie,
 * so they live in one place and nothing else touches them.
 */
export const PHYS = {
  runSpeed: 90,
  groundAccel: 1000,
  airAccel: 700,
  friction: 1400,
  gravity: 1000,
  jumpVelocity: 360, // 360^2 / (2*1000) = 64.8px = 4 tiles of jump height
  jumpCutVelocity: 110,
  maxFall: 320,
  coyoteTime: 0.1,
  jumpBuffer: 0.1,
} as const;

export class Player implements Rect {
  x = 0;
  y = 0;
  w = 10;
  h = 16;
  vx = 0;
  vy = 0;
  facing: 1 | -1 = 1;
  onGround = false;
  private coyote = 0;
  private buffer = 0;
  /** Dynamic solid we are riding; its per-frame delta is applied to us. */
  riding: MovingSolid | null = null;
  /** Distance walked while grounded, drives the two-frame walk cycle. */
  private walkPhase = 0;
  /** Set for the one frame a jump starts. */
  justJumped = false;
  /** Set on frames where a foot comes down while walking. */
  justStepped = false;
  lastContacts: Contacts = { left: false, right: false, up: false, down: false, standingOn: null };

  spawnAt(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.coyote = 0;
    this.buffer = 0;
    this.riding = null;
    this.facing = 1;
    this.walkPhase = 0;
  }

  animFrame(): 'idle' | 'walk1' | 'walk2' | 'jump' {
    if (!this.onGround) return 'jump';
    if (Math.abs(this.vx) < 10) return 'idle';
    return Math.floor(this.walkPhase / 10) % 2 === 0 ? 'walk1' : 'walk2';
  }

  update(input: Input, level: Level, solids: readonly MovingSolid[], minX: number): void {
    // Horizontal intent.
    const want = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (want !== 0) {
      this.facing = want as 1 | -1;
      const accel = this.onGround ? PHYS.groundAccel : PHYS.airAccel;
      this.vx = approach(this.vx, want * PHYS.runSpeed, accel * DT);
    } else {
      this.vx = approach(this.vx, 0, PHYS.friction * DT);
    }

    // Jump buffering and coyote time.
    if (input.takeJumpPressed()) this.buffer = PHYS.jumpBuffer;
    else this.buffer = Math.max(0, this.buffer - DT);
    if (this.onGround) this.coyote = PHYS.coyoteTime;
    else this.coyote = Math.max(0, this.coyote - DT);

    this.justJumped = false;
    this.justStepped = false;
    if (this.buffer > 0 && this.coyote > 0) {
      this.justJumped = true;
      this.vy = -PHYS.jumpVelocity;
      this.buffer = 0;
      this.coyote = 0;
      this.onGround = false;
      this.riding = null;
    }
    if (!input.jumpHeld && this.vy < -PHYS.jumpCutVelocity) this.vy = -PHYS.jumpCutVelocity;

    this.vy = Math.min(PHYS.maxFall, this.vy + PHYS.gravity * DT);

    // Carry with the platform we stand on, before our own movement is resolved.
    if (this.riding) {
      this.x += this.riding.dx;
      this.y += this.riding.dy;
    }

    const rects = solids.map((s) => s.rect);
    const c = moveAndCollide(this, this.vx * DT, this.vy * DT, level, rects);
    this.lastContacts = c;
    if (c.down) this.vy = Math.max(0, this.vy);
    if (c.up) this.vy = Math.max(0, this.vy);
    if (c.left || c.right) this.vx = 0;

    // Camera lock: the world never scrolls back, and neither do you.
    if (this.x < minX) {
      this.x = minX;
      if (this.vx < 0) this.vx = 0;
    }

    const ground = groundBelow(this, level, rects);
    this.onGround = ground !== null;
    if (this.onGround && Math.abs(this.vx) >= 10) {
      const before = Math.floor(this.walkPhase / 10);
      this.walkPhase += Math.abs(this.vx) * DT;
      if (Math.floor(this.walkPhase / 10) !== before) this.justStepped = true;
    }
    this.riding = null;
    if (ground) {
      for (const s of solids) if (s.rect === ground) this.riding = s;
    }
  }
}

export interface MovingSolid {
  rect: Rect;
  /** Displacement applied this frame, so riders can be carried. */
  dx: number;
  dy: number;
}

function approach(v: number, target: number, step: number): number {
  if (v < target) return Math.min(target, v + step);
  if (v > target) return Math.max(target, v - step);
  return v;
}
