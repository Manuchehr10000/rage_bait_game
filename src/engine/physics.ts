import type { Level, SlopeDef } from './level';
import { overlaps, type Rect } from './types';

export interface Contacts {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  /** The dynamic solid we landed on, if any (moving platform, fallen head). */
  standingOn: Rect | null;
}

const tiles: Rect[] = [];

export interface DynamicSolid {
  rect: Rect;
  /** How far it moved down this frame, up being negative: its top was at `rect.y - dy`. */
  dy: number;
  /** Solid from above only: you land on it, but pass through it sideways or from below. */
  oneWay?: boolean;
}

/**
 * Axis-separated AABB sweep. Move on X, resolve; move on Y, resolve.
 * Per-frame displacement never exceeds a tile, so there is no tunnelling.
 */
export function moveAndCollide(
  body: Rect,
  dx: number,
  dy: number,
  level: Level,
  dynamicSolids: readonly DynamicSolid[],
): Contacts {
  const c: Contacts = { left: false, right: false, up: false, down: false, standingOn: null };

  const oldX = body.x;
  const oldBottom = body.y + body.h;
  body.x += dx;
  // A slope under him rises with him: lift him onto it before the walls are tested, or
  // the tile edge at the head of a climb would stop him for a frame.
  for (const s of level.slopes) {
    const sy = slopeTop(s, body);
    if (sy !== null && body.y + body.h > sy && oldBottom <= sy + SLOPE_CATCH) body.y = sy - body.h;
  }
  tiles.length = 0;
  level.solidTilesIn(body, tiles);
  for (const s of tiles) resolveX(body, s, dx, c, oldX);
  for (const s of dynamicSolids) if (!s.oneWay) resolveX(body, s.rect, dx, c, oldX);

  body.y += dy;
  tiles.length = 0;
  level.solidTilesIn(body, tiles);
  for (const s of tiles) resolveY(body, s, dy, c, false, false);
  for (const s of dynamicSolids) {
    // Risen into him, and he was on it or over it before it rose: on it now, however
    // fast he was going up. A solid rising faster than he does lifts him; it never
    // swallows him. Anything else meets him as it always did.
    const above = s.dy < 0 && oldBottom <= s.rect.y - s.dy + 1e-6;
    if (s.oneWay && !above && (dy < 0 || oldBottom > s.rect.y + 0.5)) continue;
    resolveY(body, s.rect, dy, c, true, above);
  }
  // Coming down onto a slope, or walking down one: stand on it. Solid from above only.
  if (dy >= 0)
    for (const s of level.slopes) {
      const sy = slopeTop(s, body);
      if (sy === null || body.y + body.h < sy || oldBottom > sy + SLOPE_CATCH) continue;
      body.y = sy - body.h;
      c.down = true;
    }
  return c;
}

function resolveX(body: Rect, s: Rect, dx: number, c: Contacts, oldX: number): void {
  if (!overlaps(body, s)) return;
  // Already overlapping on X before this move (by more than a rounding error): the
  // overlap comes from the Y axis, a solid rising from below. Leave it to the Y pass.
  if (oldX < s.x + s.w - 0.5 && oldX + body.w > s.x + 0.5) return;
  if (dx > 0) {
    body.x = s.x - body.w;
    c.right = true;
  } else if (dx < 0) {
    body.x = s.x + s.w;
    c.left = true;
  }
}

function resolveY(body: Rect, s: Rect, dy: number, c: Contacts, dynamic: boolean, above: boolean): void {
  if (!overlaps(body, s)) return;
  // Going up into it from under it: his head meets its underside.
  if (dy < 0 && !above) {
    body.y = s.y + s.h;
    c.up = true;
    return;
  }
  // Falling, or a moving solid rose into us: stand on it.
  body.y = s.y - body.h;
  c.down = true;
  if (dynamic) c.standingOn = s;
}

/** The solid directly beneath the body's feet, if any. */
export function groundBelow(body: Rect, level: Level, dynamicSolids: readonly DynamicSolid[]): Rect | null {
  const probe: Rect = { x: body.x, y: body.y + body.h, w: body.w, h: 1 };
  tiles.length = 0;
  level.solidTilesIn(probe, tiles);
  for (const s of tiles) if (overlaps(probe, s)) return s;
  for (const s of dynamicSolids) {
    if (s.oneWay && body.y + body.h > s.rect.y + 0.5) continue;
    if (overlaps(probe, s.rect)) return s.rect;
  }
  for (const s of level.slopes) {
    const sy = slopeTop(s, body);
    if (sy !== null && Math.abs(body.y + body.h - sy) <= 0.01) return SLOPE_GROUND;
  }
  return null;
}

/**
 * How far below a slope's line his feet may have been last frame and still be put on
 * it. Covers the rise of a frame at run speed on anything up to about 1.33 in 1; the
 * slopes in the game are 1 in 3, half a pixel a frame.
 */
export const SLOPE_CATCH = 2;

/** What groundBelow returns for a slope. Never any moving solid's rect, so he rides nothing. */
const SLOPE_GROUND: Rect = { x: 0, y: 0, w: 0, h: 0 };

/**
 * The highest point of the slope under the body's width, or null if the body is not
 * over it. The highest, not the middle: his uphill foot is on the line, so the head
 * and the foot of a slope meet their floors without a step.
 */
export function slopeTop(s: SlopeDef, body: Rect): number | null {
  const a = Math.max(body.x, s.x0);
  const b = Math.min(body.x + body.w, s.x1);
  if (a > b) return null;
  const at = (x: number) => s.y0 + ((s.y1 - s.y0) * (x - s.x0)) / (s.x1 - s.x0);
  return Math.min(at(a), at(b));
}
