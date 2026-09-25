import { Sweep, Thrower, Water, type Entity } from '../engine/entities';
import type { Level } from '../engine/level';
import { PHYS, Player, type MovingSolid } from '../engine/player';
import type { Input } from '../engine/input';
import { VIEW_H, VIEW_W, type Rect } from '../engine/types';

/**
 * What the level hides, drawn over it: where every trap is set off, what kills,
 * what is safe, which of the identical things is the liar, and how far the
 * tourist can jump from where he stands. For the designer; a player learns all
 * of it by dying.
 *
 *   yellow  a line that sets something off when the tourist's centre crosses it
 *   red     kills: a hazard, a sweep's band, water, where a falling thing lands
 *   green   safe: a sweep's shelter, a thing that holds, the exit
 *   orange  a liar: a floor that gives way, a horse with a trick
 *   white   a moving solid, as it is this frame
 *   cyan    the tourist's hitbox, and his jumps from here
 */

const TRIGGER = '#ffd23f';
const DEADLY = '#ff4a3d';
const SAFE = '#5fd35f';
const LIAR = '#ff8c1a';
const SOLID = '#f2f2f2';
const HIM = '#3fd0ff';
const SWIM = '#4aa3ff';
const EDGE = 'rgba(11, 10, 8, 0.7)';

/** Everything the overlay reads. The game hands it over; the overlay changes none of it. */
export interface OverlayWorld {
  level: Level;
  player: Player;
  entities: readonly Entity[];
  exit: Rect | null;
  lampFromX: number | undefined;
  /** The camera lock: the tourist can never go left of this. */
  minX: number;
}

/** One predicted jump: the path of his feet, and whether the landing kills. */
export interface Arc {
  kind: 'run' | 'stand';
  points: { x: number; y: number }[];
  /** Where it ends: 'land' on something, 'kill' landing from too high, 'off' out of the level. */
  end: 'land' | 'kill' | 'off';
}

/**
 * His jumps from where he stands, flown by the real physics on a copy of him: a
 * full jump at run speed each way, and one from a standstill. Moving solids are
 * frozen as they are this frame. Water is not simulated.
 */
export function predictJumps(w: OverlayWorld): Arc[] {
  const solids: MovingSolid[] = [];
  for (const e of w.entities) if (e.solids) solids.push(...e.solids());
  const flights: [Arc['kind'], -1 | 0 | 1][] = [
    ['run', 1],
    ['run', -1],
    ['stand', 0],
  ];
  return flights.map(([kind, dir]) => fly(w, solids, kind, dir));
}

function fly(w: OverlayWorld, solids: readonly MovingSolid[], kind: Arc['kind'], dir: -1 | 0 | 1): Arc {
  const p = new Player();
  p.spawnAt(w.player.x, w.player.y);
  p.onGround = true;
  p.vx = dir * PHYS.runSpeed;
  let pressed = true;
  // Jump held all the way: the highest jump there is.
  const input = {
    left: dir < 0,
    right: dir > 0,
    jumpHeld: true,
    takeJumpPressed: () => {
      const was = pressed;
      pressed = false;
      return was;
    },
  } as unknown as Input;
  const feet = () => ({ x: p.x + p.w / 2, y: p.y + p.h });
  const points = [feet()];
  for (let i = 0; i < 240; i++) {
    p.update(input, w.level, solids, w.minX);
    points.push(feet());
    if (p.y > w.level.heightPx + 16) return { kind, points, end: 'off' };
    if (i > 0 && p.onGround) return { kind, points, end: p.fellBy > PHYS.fatalFall ? 'kill' : 'land' };
  }
  return { kind, points, end: 'off' };
}

export function renderOverlay(
  ctx: CanvasRenderingContext2D,
  scale: number,
  camX: number,
  camY: number,
  w: OverlayWorld,
  arcs: readonly Arc[],
): void {
  const s = scale;
  const H = VIEW_H * s;
  const sx = (x: number) => (x - camX) * s;
  const sy = (y: number) => (y - camY) * s;
  const onScreen = (x0: number, x1: number) => x1 >= camX && x0 <= camX + VIEW_W;

  const box = (r: Rect, color: string, opts: { dash?: boolean; fill?: number } = {}) => {
    if (!onScreen(r.x, r.x + r.w)) return;
    if (opts.fill) {
      ctx.globalAlpha = opts.fill;
      ctx.fillStyle = color;
      ctx.fillRect(sx(r.x), sy(r.y), r.w * s, r.h * s);
      ctx.globalAlpha = 1;
    }
    stroke(color, opts.dash ?? false, () => ctx.strokeRect(sx(r.x) + 0.5, sy(r.y) + 0.5, r.w * s - 1, r.h * s - 1));
  };
  const trigger = (x: number, color = TRIGGER) => {
    if (!onScreen(x, x)) return;
    stroke(color, true, () => {
      ctx.beginPath();
      ctx.moveTo(sx(x), 0);
      ctx.lineTo(sx(x), H);
      ctx.stroke();
    });
  };
  const across = (y: number, color: string) =>
    stroke(color, true, () => {
      ctx.beginPath();
      ctx.moveTo(0, sy(y));
      ctx.lineTo(VIEW_W * s, sy(y));
      ctx.stroke();
    });
  // Every line twice: dark under bright, so it reads on sand and in a cave alike.
  const stroke = (color: string, dash: boolean, path: () => void) => {
    ctx.setLineDash(dash ? [2 * s, 1.5 * s] : []);
    ctx.strokeStyle = EDGE;
    ctx.lineWidth = Math.max(2, s * 0.75);
    path();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, s * 0.5);
    path();
  };

  ctx.save();
  if (w.lampFromX !== undefined) trigger(w.lampFromX);
  if (w.exit) box(w.exit, SAFE, { fill: 0.25 });

  for (const e of w.entities) {
    const d = e.def;
    // Solids first, so what a thing is (holds, lies, kills) is drawn over where it is.
    for (const m of e.solids?.() ?? []) box(m.rect, SOLID);
    switch (d.kind) {
      case 'falling':
        trigger(d.triggerX);
        box(d.rect, DEADLY, { dash: true });
        break;
      case 'thrower':
        if (d.active) trigger(d.x - d.triggerDist);
        if (e instanceof Thrower && e.projectile) box(e.projectile, DEADLY, { fill: 0.5 });
        break;
      case 'platform':
        if (d.trigger.type === 'standOn' && d.trigger.pastX !== undefined) trigger(d.trigger.pastX);
        if (d.trigger.type === 'reach') trigger(d.trigger.x);
        if (d.isExit) box(d.rect, SAFE, { fill: 0.25 });
        break;
      case 'water':
        if (d.rise?.atX !== undefined) trigger(d.rise.atX);
        if (e instanceof Water) {
          const r = { x: d.x0, y: e.waterY, w: d.x1 - d.x0, h: e.rect.y + e.rect.h - e.waterY };
          box(r, d.swimmable ? SWIM : DEADLY, { fill: 0.25 });
        }
        break;
      case 'sweep':
        trigger(d.triggerX);
        for (const r of d.safe) box(r, SAFE, { fill: 0.2 });
        if (e instanceof Sweep && e.band) box(e.band, DEADLY, { fill: 0.35 });
        break;
      case 'crumble':
        box(d.rect, d.fake ? LIAR : SAFE, { dash: d.fake });
        break;
      case 'horse':
        box(d.rect, d.trick === 'none' ? SAFE : LIAR, { dash: d.trick !== 'none' });
        if (d.wakeFrom) box(d.wakeFrom, LIAR, { dash: true });
        break;
      case 'roof':
        trigger(d.triggerX);
        box({ x: d.x, y: d.floorY - d.h, w: d.w, h: d.h }, DEADLY, { dash: true });
        break;
      case 'hazard':
        box(d.rect, DEADLY, { fill: 0.35 });
        break;
      case 'snare':
        box(d.rect, LIAR, { fill: 0.35 });
        break;
      case 'pusher':
        if (d.active) trigger(d.x - d.reach);
        break;
      case 'conveyor':
        box(d.rect, TRIGGER, { dash: true });
        break;
      case 'chaser':
        trigger(d.triggerX);
        box(d.rect, DEADLY, { dash: true });
        break;
      case 'tipper':
        trigger(d.triggerX);
        box({ x: d.x - d.height, y: d.floorY - 16, w: d.height, h: 16 }, DEADLY, { dash: true });
        break;
      case 'train':
        trigger(d.triggerX);
        trigger(d.stopX, DEADLY);
        break;
    }
  }

  // Him, and how far a walk off this ledge may drop before it kills.
  const p = w.player;
  box(p, HIM);
  if (p.onGround) across(p.y + p.h + PHYS.fatalFall, DEADLY);

  // His jumps: running solid, standing dashed. The end says what the landing does.
  for (const a of arcs) {
    const pts = a.points;
    if (pts.length < 2) continue;
    stroke(HIM, a.kind === 'stand', () => {
      ctx.beginPath();
      pts.forEach((q, i) => (i ? ctx.lineTo(sx(q.x), sy(q.y)) : ctx.moveTo(sx(q.x), sy(q.y))));
      ctx.stroke();
    });
    const last = pts[pts.length - 1]!;
    ctx.setLineDash([]);
    ctx.fillStyle = a.end === 'land' ? SAFE : DEADLY;
    ctx.fillRect(sx(last.x) - 1.5 * s, sy(last.y) - 1.5 * s, 3 * s, 3 * s);
  }
  ctx.restore();
}
