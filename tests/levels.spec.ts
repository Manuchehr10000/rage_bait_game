import { expect, test } from '@playwright/test';
import { Level, type LevelData } from '../src/engine/level';
import { LEVELS } from '../src/levels';
import { TILE } from '../src/engine/types';

/**
 * Contracts every level has to keep, checked against the level data itself
 * rather than by playing. These are the mistakes that are invisible in a
 * scripted playthrough because the playthrough puts the tourist where it wants
 * him, and only show up when a player arrives the way a player arrives.
 */

/** His hitbox, from engine/player.ts. */
const PLAYER_W = 10;
const PLAYER_H = 16;

const each = (fn: (data: LevelData, level: Level) => void) => {
  for (const data of LEVELS) fn(data, new Level(data));
};

test('every level he walks into has floor from its left edge to the spawn, and nothing in his way', () => {
  // He walks in from off the left edge at the spawn's height and has the controls
  // from the edge: the level promises the ground under that stretch, the air over it,
  // and nothing in it that kills (pillar 13). A level that brings him in itself, or
  // starts him where the visit has begun, says so.
  const bad: string[] = [];
  each((data, level) => {
    if (data.arrival === 'appear') return;
    const right = data.spawn.x + PLAYER_W;
    const top = data.spawn.y;
    const bottom = data.spawn.y + PLAYER_H;
    for (const e of data.entities) {
      if (e.kind === 'hazard' && e.rect.x < right && e.rect.x + e.rect.w > 0 && e.rect.y < bottom && e.rect.y + e.rect.h > top) {
        bad.push(`${data.id}: a hazard in the way in, at x = ${e.rect.x}`);
      }
      if (e.kind === 'water' && !e.swimmable && e.x0 < right && e.x1 > 0 && e.startY < bottom) {
        bad.push(`${data.id}: deadly water under the way in, from x = ${e.x0}`);
      }
    }
    const feet = Math.floor((data.spawn.y + PLAYER_H) / TILE);
    for (let x = 0; x <= data.spawn.x + PLAYER_W; x += 4) {
      const tx = Math.floor(x / TILE);
      if (!level.isSolid(tx, feet)) {
        bad.push(`${data.id}: no floor under the walk in at x = ${x}`);
        return;
      }
      for (let y = data.spawn.y; y < data.spawn.y + PLAYER_H; y += 4) {
        if (level.isSolid(tx, Math.floor(y / TILE))) {
          bad.push(`${data.id}: rock in the way of the walk in at ${x},${y}`);
          return;
        }
      }
    }
  });
  expect(bad).toEqual([]);
});

test('every level spawns the tourist on something, in the level, the right way up', () => {
  const bad: string[] = [];
  each((data, level) => {
    const { x, y } = data.spawn;
    if (y < 0 || y + PLAYER_H > level.heightPx) bad.push(`${data.id}: spawn is outside the level`);
    const feet = Math.floor((y + PLAYER_H) / TILE);
    let ground = false;
    for (let ty = feet; ty < level.heightTiles; ty++) {
      if (level.isSolid(Math.floor(x / TILE), ty)) {
        ground = true;
        break;
      }
    }
    // Philae starts on the bow of a boat, which is a solid the engine makes, not a tile.
    if (!ground) {
      ground = data.entities.some(
        (e) =>
          (e.kind === 'platform' || e.kind === 'crumble') &&
          e.rect.x < x + PLAYER_W &&
          e.rect.x + e.rect.w > x &&
          e.rect.y >= y + PLAYER_H - 2,
      );
    }
    if (!ground) bad.push(`${data.id}: nothing under the spawn to land on`);
    if (level.isSolid(Math.floor(x / TILE), Math.floor(y / TILE))) bad.push(`${data.id}: spawn is inside rock`);
  });
  expect(bad).toEqual([]);
});

test('every level has an exit that is standing on something', () => {
  const bad: string[] = [];
  each((data, level) => {
    const e = data.exit;
    if (!e) {
      // A platform with isExit is the alternative; Philae leaves by boat.
      const boat = data.entities.some((x) => x.kind === 'platform' && x.isExit);
      if (!boat) bad.push(`${data.id}: no exit and no exit platform`);
      return;
    }
    if (e.x + e.w > level.widthPx) bad.push(`${data.id}: the exit is off the right-hand end`);
    let ground = false;
    for (let ty = Math.floor((e.y + e.h) / TILE); ty < level.heightTiles; ty++) {
      if (level.isSolid(Math.floor((e.x + e.w / 2) / TILE), ty)) {
        ground = true;
        break;
      }
    }
    if (!ground) bad.push(`${data.id}: the exit has no floor under it`);
  });
  expect(bad).toEqual([]);
});

test('every level id is unique and reachable from the tour map', async () => {
  const ids = LEVELS.map((l) => l.id);
  expect(new Set(ids).size).toBe(ids.length);
  const { CHAPTERS } = await import('../src/map/atlas');
  const pinned = CHAPTERS.flatMap((c) => c.sites.map((s) => s.level)).filter(Boolean);
  for (const id of ids) expect(pinned).toContain(id);
});
