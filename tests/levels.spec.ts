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

/** game.ts drops the tourist in from this far above the spawn when you pick a site off the map. */
const FALL_IN_HEIGHT = 200;
/** His hitbox, from engine/player.ts. */
const PLAYER_W = 10;
const PLAYER_H = 16;

const each = (fn: (data: LevelData, level: Level) => void) => {
  for (const data of LEVELS) fn(data, new Level(data));
};

test('every level can be fallen into from the map', () => {
  // Pech Merle shipped with a roof over its own front door: the drop-in landed the
  // tourist on top of the cave, off the level, in the dark, with nothing to do.
  const bad: string[] = [];
  each((data, level) => {
    const top = data.spawn.y - FALL_IN_HEIGHT;
    for (let y = top; y <= data.spawn.y; y += 4) {
      for (let x = data.spawn.x; x <= data.spawn.x + PLAYER_W; x += 4) {
        if (level.isSolid(Math.floor(x / TILE), Math.floor(y / TILE))) {
          bad.push(`${data.id}: solid at ${Math.round(x)},${Math.round(y)}, above the spawn`);
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
