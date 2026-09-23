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
  /**
   * How far you may fall and walk away from it, measured from the top of the arc.
   * The line is drawn from what the built levels already ask for: the worst fall
   * on a clean run is 62 px at Cap Blanc and Roc-aux-Sorciers, 78 at Philae, and
   * 171 at Karnak, coming down off the first pylon into the court. So 200 leaves
   * every one of them free and still makes a shaft something you go down in
   * stages. Identical in every chapter, like the rest of PHYS.
   */
  fatalFall: 200,
  coyoteTime: 0.1,
  jumpBuffer: 0.1,
  // In water: soft gravity, slow, a stroke instead of a jump.
  swimGravity: 260,
  swimMaxFall: 45,
  swimSpeed: 60,
  strokeVelocity: 190,
  strokeCooldown: 0.28,
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
  /** True from a jump until landing; the variable-height cut applies only then. */
  private jumping = false;
  /** The highest point of the fall in progress, or null while on the ground. */
  private fellFrom: number | null = null;
  /** How far the landing this frame fell. The world reads it and decides. */
  fellBy = 0;
  /** Set by the world each frame when the player is in swimmable water. */
  inWater = false;
  /**
   * Caught by something in the floor. The controls are still honest — they are
   * simply attached to a man who is not going anywhere. Nothing lets go of him.
   */
  held = false;
  /**
   * Whether he is trying to go anywhere while held, and for how many ticks he has
   * been at it. Drawn as a man pulling at his boot, so that what the controls did
   * is on the screen: they moved a man who could not move.
   */
  tugging = false;
  private tug = 0;
  private strokeTimer = 0;
  /** Horizontal drag applied this frame by a conveyor. */
  private driftX = 0;
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
    this.fellFrom = null;
    this.fellBy = 0;
    this.held = false;
    this.tugging = false;
    this.tug = 0;
  }

  /** A conveyor pulls the ground out from under you. Applied on top of your own movement. */
  drift(vx: number): void {
    this.driftX += vx;
  }

  /** Knocked by something in the world. Controls stay honest; the world does not. */
  shove(vx: number, vy: number): void {
    this.vx = vx;
    this.vy = vy;
    this.onGround = false;
    this.riding = null;
    this.coyote = 0;
    this.jumping = false;
  }

  /** The sacred lake. The same keys, a different medium. */
  private updateSwimming(input: Input, level: Level, solids: readonly MovingSolid[], minX: number): void {
    const want = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (want !== 0) {
      this.facing = want as 1 | -1;
      this.vx = approach(this.vx, want * PHYS.swimSpeed, 500 * DT);
    } else {
      this.vx = approach(this.vx, 0, 300 * DT);
    }
    this.justJumped = false;
    this.justStepped = false;
    this.strokeTimer = Math.max(0, this.strokeTimer - DT);
    if (input.takeJumpPressed() && this.strokeTimer <= 0) {
      this.vy = -PHYS.strokeVelocity;
      this.strokeTimer = PHYS.strokeCooldown;
      this.justJumped = true;
    }
    this.vy = Math.min(PHYS.swimMaxFall, this.vy + PHYS.swimGravity * DT);
    const c = moveAndCollide(this, this.vx * DT, this.vy * DT, level, solids);
    this.driftX = 0;
    this.lastContacts = c;
    if (c.down) this.vy = Math.max(0, this.vy);
    if (c.up) this.vy = Math.max(0, this.vy);
    if (c.left || c.right) this.vx = 0;
    if (this.x < minX) {
      this.x = minX;
      if (this.vx < 0) this.vx = 0;
    }
    this.onGround = false;
    this.riding = null;
    this.jumping = false;
    this.coyote = 0;
    // Swimming is not falling. Whatever the water decides, it is the water's call.
    this.fellFrom = null;
    this.fellBy = 0;
  }

  /** Held: pulling at the boot, or stood with it stuck, a pull every eight ticks he tries. */
  heldPose(): 'pull' | 'stuck' {
    return this.tugging && Math.floor((this.tug - 1) / 8) % 2 === 0 ? 'pull' : 'stuck';
  }

  animFrame(): 'idle' | 'walk1' | 'walk2' | 'jump' {
    if (this.inWater) return 'jump';
    if (!this.onGround) return 'jump';
    if (Math.abs(this.vx) < 10) return 'idle';
    return Math.floor(this.walkPhase / 10) % 2 === 0 ? 'walk1' : 'walk2';
  }

  update(input: Input, level: Level, solids: readonly MovingSolid[], minX: number): void {
    if (this.inWater) {
      this.updateSwimming(input, level, solids, minX);
      return;
    }
    // Horizontal intent. A man with his boot in the track has none; he has a boot
    // to pull at.
    this.tugging = this.held && (input.left || input.right || input.jumpHeld);
    this.tug = this.tugging ? this.tug + 1 : 0;
    const want = this.held ? 0 : (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (this.held) {
      // Held is held: no run-out, no slide.
      this.vx = 0;
    } else if (want !== 0) {
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
    if (this.buffer > 0 && this.coyote > 0 && !this.held) {
      this.justJumped = true;
      this.jumping = true;
      this.vy = -PHYS.jumpVelocity;
      this.buffer = 0;
      this.coyote = 0;
      this.onGround = false;
      this.riding = null;
    }
    if (this.jumping && !input.jumpHeld && this.vy < -PHYS.jumpCutVelocity) this.vy = -PHYS.jumpCutVelocity;

    this.vy = Math.min(PHYS.maxFall, this.vy + PHYS.gravity * DT);

    // Carry with the platform we stand on, before our own movement is resolved.
    if (this.riding) {
      this.x += this.riding.dx;
      this.y += this.riding.dy;
    }

    const c = moveAndCollide(this, this.vx * DT + this.driftX * DT, this.vy * DT, level, solids);
    this.driftX = 0;
    this.lastContacts = c;
    if (c.down) this.vy = Math.max(0, this.vy);
    if (c.up) this.vy = Math.max(0, this.vy);
    if (c.left || c.right) this.vx = 0;

    // Camera lock: the world never scrolls back, and neither do you.
    if (this.x < minX) {
      this.x = minX;
      if (this.vx < 0) this.vx = 0;
    }

    const ground = groundBelow(this, level, solids);
    this.onGround = ground !== null;
    // How far this fall has come. Measured from the top of the arc, so a jump
    // costs you its own height on the way back down and nothing is free twice.
    this.fellBy = 0;
    if (!this.onGround) {
      this.fellFrom = this.fellFrom === null ? this.y : Math.min(this.fellFrom, this.y);
    } else if (this.fellFrom !== null) {
      this.fellBy = this.y - this.fellFrom;
      this.fellFrom = null;
    }
    if (this.onGround) this.jumping = false;
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
  /** Solid from above only. */
  oneWay?: boolean;
}

function approach(v: number, target: number, step: number): number {
  if (v < target) return Math.min(target, v + step);
  if (v > target) return Math.max(target, v - step);
  return v;
}
