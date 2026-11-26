import type { Entity, World } from './entities';
import type { HuntDef } from './level';
import type { MovingSolid } from './player';
import { DT, overlaps, type Rect } from './types';

/**
 * Hunting Magic's fight (content/ch01-palaeolithic/l06-hunting-magic/LEVEL.md, beat c; arc.md,
 * section 4). Rough: the rules play; the drawing is the plate's rough shapes.
 *
 * The blind mammoth stands facing him, in front of its picture's line of fire: a spear from the
 * left meets the live beast and glances off. He climbs over it onto the hunters' cover in front
 * of the picture, hops and touches the hunters' spear in the painted eye: it is his, and the
 * live eye opens. Stung, the beast backs rump first; its hind feet reach the cover, the cover
 * goes, and the beast goes down into the pit, into register with its picture: whoever is on
 * the cover goes down under it (the pitfall). Sunk, it leaves the picture clear and its back is
 * a bridge to the far lip. A spear flies level from his hand, and the height at which it reaches
 * the picture alone decides the part it sticks in (one rule).
 */

/** The picture's parts by height above its foot, px (arc.md, section 4, 2026-11-26). */
export const PARTS = [
  { part: 'legs', from: 0, to: 11 },
  { part: 'sign', from: 12, to: 15 },
  { part: 'heart', from: 16, to: 19 },
  { part: 'body', from: 20, to: 23 },
  { part: 'eye', from: 24, to: 27 },
] as const;

export type Part = (typeof PARTS)[number]['part'] | 'over';

/** The part a spear at `h` px above the picture's foot sticks in. */
export function partAt(h: number): Part {
  for (const p of PARTS) if (h >= p.from && h <= p.to + 0.999) return p.part;
  return 'over';
}

/** A spear: 14 px of shaft. Thrown level at SPEAR.speed px/s from 10 px above his feet. */
export const SPEAR = { len: 14, speed: 300, hand: 10 } as const;

export type BeastState = 'blind' | 'stung' | 'backing' | 'sinking' | 'trapped' | 'felled' | 'sprung';

export interface Flying {
  x: number;
  y: number;
  vx: number;
  /** Glanced off the live beast or the rock: falling, harmless, until it is gone. */
  dropping: boolean;
  vy: number;
}

export interface Stuck {
  x: number;
  y: number;
  part: Part;
}

export class Hunt implements Entity {
  state: BeastState = 'blind';
  /** The beast's box: standing, backing, sinking, or down in the pit. */
  readonly beast: Rect;
  /** Whether the hunters' spear is still in the painted eye. */
  eyeSpear = true;
  /** Whether he has a spear in his hand. One at a time. */
  carrying = false;
  /** Lamed: a spear in the picture's legs. It backs at half pace. */
  lame = false;
  coverGone = false;
  readonly flying: Flying[] = [];
  readonly stuck: Stuck[] = [];
  private timer = 0;
  private readonly beastSolid: MovingSolid;
  private readonly coverSolid: MovingSolid;
  private readonly rockSolid: MovingSolid;
  /** Where the sink starts from, and its frames so far. */
  private sinkFrom = { x: 0, y: 0 };
  private sinkT = 0;

  constructor(readonly def: HuntDef) {
    this.beast = { x: def.beast.x, y: def.floorY - def.beast.h, w: def.beast.w, h: def.beast.h };
    this.beastSolid = { rect: this.beast, dx: 0, dy: 0 };
    this.coverSolid = { rect: { x: def.pit.x0, y: def.floorY, w: def.pit.x1 - def.pit.x0, h: 4 }, dx: 0, dy: 0 };
    this.rockSolid = { rect: { ...def.rock }, dx: 0, dy: 0 };
  }

  /** The picture's box: identical to the beast, its foot on the floor's line, over the pit. */
  get picture(): Rect {
    return { x: this.def.pit.x0, y: this.def.floorY - this.def.beast.h, w: this.def.beast.w, h: this.def.beast.h };
  }

  /** Where the hunters' spear stands in the painted eye: what he touches to pull it. */
  get eyeSpearRect(): Rect {
    const pic = this.picture;
    return { x: pic.x + 4, y: this.def.floorY - 30, w: 14, h: 10 };
  }

  /** Whether the beast stands where a spear from the left meets it before the picture. */
  private get covering(): boolean {
    return this.state === 'blind' || this.state === 'stung' || this.state === 'backing';
  }

  update(w: World): void {
    this.beastSolid.dx = 0;
    this.beastSolid.dy = 0;
    const p = w.player;
    const d = this.def;
    this.updateSpears(w);
    if (!w.alive) return;

    // Spears are taken by touching them with empty hands: the hunters' in the eye, or the bear's.
    if (!this.carrying) {
      if (this.eyeSpear && overlaps(p, this.eyeSpearRect)) {
        this.eyeSpear = false;
        this.carrying = true;
        w.sound('step');
        // The cure: the vandal undoes the hunters' work, and the live eye opens.
        if (this.state === 'blind') {
          this.state = 'stung';
          this.timer = d.opensAfter;
        }
      } else if (overlaps(p, d.bear)) {
        this.carrying = true;
        w.sound('step');
      }
    }
    if (this.carrying && w.thrown) this.throwSpear(w);

    if (this.state === 'stung') {
      this.timer -= DT;
      if (this.timer <= 0) this.state = 'backing';
    }
    if (this.state === 'backing') {
      const step = (this.lame ? d.backSpeed / 2 : d.backSpeed) * DT;
      this.beast.x += step;
      this.beastSolid.dx = step;
      // Its hind feet on the cover: the cover goes on that frame, under whoever is on it.
      if (this.beast.x + this.beast.w >= d.pit.x0) {
        this.coverGone = true;
        this.state = 'sinking';
        this.sinkFrom = { x: this.beast.x, y: this.beast.y };
        this.sinkT = 0;
        w.sound('crumble');
        const onCover = p.onGround && Math.abs(p.y + p.h - d.floorY) <= 1 && p.x + p.w > d.pit.x0 && p.x < d.pit.x1;
        if (onCover) {
          w.kill(d.causes.pitfall);
          return;
        }
      }
    }
    if (this.state === 'sinking') {
      this.sinkT += DT;
      const k = Math.min(1, this.sinkT / d.sinkTime);
      const nx = this.sinkFrom.x + (d.pit.x0 - this.sinkFrom.x) * k;
      const ny = this.sinkFrom.y + (d.floorY + d.pitDepth - this.beast.h - this.sinkFrom.y) * k;
      this.beastSolid.dx = nx - this.beast.x;
      this.beastSolid.dy = ny - this.beast.y;
      this.beast.x = nx;
      this.beast.y = ny;
      if (k >= 1) this.state = 'trapped';
    }
  }

  private throwSpear(w: World): void {
    const p = w.player;
    this.carrying = false;
    const y = p.y + p.h - SPEAR.hand;
    const x = p.facing > 0 ? p.x + p.w : p.x - SPEAR.len;
    this.flying.push({ x, y, vx: p.facing * SPEAR.speed, dropping: false, vy: 0 });
    w.sound('jump');
  }

  private updateSpears(w: World): void {
    const d = this.def;
    for (let i = this.flying.length - 1; i >= 0; i--) {
      const s = this.flying[i]!;
      if (s.dropping) {
        s.vy += 1000 * DT;
        s.y += s.vy * DT;
        s.x += s.vx * DT;
        if (s.y > d.floorY + d.pitDepth + 40) this.flying.splice(i, 1);
        continue;
      }
      s.x += s.vx * DT;
      const tip = s.vx > 0 ? s.x + SPEAR.len : s.x;
      const box = { x: Math.min(s.x, tip), y: s.y, w: SPEAR.len, h: 1 };
      // The live beast, where it stands between him and the picture: it glances off.
      if (this.covering && overlaps(box, this.beast)) {
        s.dropping = true;
        s.vx = -s.vx * 0.2;
        w.sound('bonk');
        continue;
      }
      const pic = this.picture;
      if (tip >= pic.x && tip <= pic.x + pic.w && s.y >= pic.y - 8 && s.y <= pic.y + pic.h) {
        const h = d.floorY - s.y;
        const part = partAt(h);
        if (part === 'over') {
          s.dropping = true;
          s.vx = -s.vx * 0.2;
          w.sound('bonk');
          continue;
        }
        this.flying.splice(i, 1);
        this.stuck.push({ x: tip, y: s.y, part });
        w.sound('thud');
        if (w.alive) this.wound(w, part);
        continue;
      }
      // Off the room's sides: gone.
      if (s.x < -SPEAR.len || s.x > w.level.widthPx) this.flying.splice(i, 1);
    }
  }

  /** What happens to the picture happens to the beast. */
  private wound(w: World, part: Part): void {
    if (part === 'legs') this.lame = true;
    if (part === 'eye' && (this.state === 'stung' || this.state === 'backing')) this.state = 'blind';
    if (part === 'heart' && this.state === 'trapped') {
      this.state = 'felled';
      w.events.add(this.def.felled);
    }
    if (part === 'sign' && this.state !== 'felled') {
      // The trap's double: the trap lets go, and the beast comes up out of the pit at him,
      // on the lip floor and in the air over it (the tectiform).
      this.state = 'sprung';
      w.kill(this.def.causes.tectiform);
    }
  }

  solids(): MovingSolid[] {
    const out: MovingSolid[] = [this.rockSolid];
    if (!this.coverGone) out.push(this.coverSolid);
    if (this.state !== 'sprung') out.push(this.beastSolid);
    return out;
  }
}
