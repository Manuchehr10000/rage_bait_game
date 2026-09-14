import type { Level } from './level';
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

/**
 * Axis-separated AABB sweep. Move on X, resolve; move on Y, resolve.
 * Per-frame displacement never exceeds a tile, so there is no tunnelling.
 */
export function moveAndCollide(
  body: Rect,
  dx: number,
  dy: number,
  level: Level,
  dynamicSolids: readonly Rect[],
): Contacts {
  const c: Contacts = { left: false, right: false, up: false, down: false, standingOn: null };

  const oldX = body.x;
  body.x += dx;
  tiles.length = 0;
  level.solidTilesIn(body, tiles);
  for (const s of tiles) resolveX(body, s, dx, c, oldX);
  for (const s of dynamicSolids) resolveX(body, s, dx, c, oldX);

  body.y += dy;
  tiles.length = 0;
  level.solidTilesIn(body, tiles);
  for (const s of tiles) resolveY(body, s, dy, c, false);
  for (const s of dynamicSolids) resolveY(body, s, dy, c, true);
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

function resolveY(body: Rect, s: Rect, dy: number, c: Contacts, dynamic: boolean): void {
  if (!overlaps(body, s)) return;
  if (dy < 0) {
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
export function groundBelow(body: Rect, level: Level, dynamicSolids: readonly Rect[]): Rect | null {
  const probe: Rect = { x: body.x, y: body.y + body.h, w: body.w, h: 1 };
  tiles.length = 0;
  level.solidTilesIn(probe, tiles);
  for (const s of tiles) if (overlaps(probe, s)) return s;
  for (const s of dynamicSolids) if (overlaps(probe, s)) return s;
  return null;
}
