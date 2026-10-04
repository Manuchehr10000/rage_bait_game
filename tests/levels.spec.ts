import { expect, test } from '@playwright/test';
import { Level, type LevelData } from '../src/engine/level';
import { LEVELS } from '../src/levels';
import { DT, TILE } from '../src/engine/types';
import { SLOPE_CATCH } from '../src/engine/physics';
import { PHYS } from '../src/engine/player';

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

test('every slope meets its floors at their tile tops, lies over its tiles, is not too steep, and has headroom', () => {
  // The rules in engine/level.ts SlopeDef. A tile edge standing over the line stops him
  // dead halfway up; a ceiling within his height of it is one the lift puts him into;
  // and a slope is never part of the walk-in, which promises flat floor.
  const bad: string[] = [];
  each((data, level) => {
    for (const s of data.slopes ?? []) {
      const at = `${data.id}: the slope from ${s.x0},${s.y0} to ${s.x1},${s.y1}`;
      if (!(s.x0 < s.x1)) bad.push(`${at} runs backwards`);
      if ([s.x0, s.y0, s.x1, s.y1].some((v) => v % TILE !== 0)) bad.push(`${at} does not end on tile corners`);
      // Each end on a floor at its tile top: the tile beyond the end is solid, with air over it.
      const ends: [number, number][] = [
        [s.x0 / TILE - 1, s.y0 / TILE],
        [s.x1 / TILE, s.y1 / TILE],
      ];
      for (const [tx, ty] of ends) {
        if (!level.isSolid(tx, ty) || level.isSolid(tx, ty - 1)) bad.push(`${at} does not meet a floor top at tile ${tx},${ty}`);
      }
      const g = Math.abs(s.y1 - s.y0) / (s.x1 - s.x0);
      // The lift catches him only within SLOPE_CATCH of the line: a steeper slope rises
      // past his foot in a frame at run speed, and he walks into the fill under it.
      if (g * PHYS.runSpeed * DT > SLOPE_CATCH) bad.push(`${at} is too steep: it rises more than SLOPE_CATCH in a frame at run speed`);
      const line = (x: number) => s.y0 + ((s.y1 - s.y0) * (x - s.x0)) / (s.x1 - s.x0);
      for (let tx = s.x0 / TILE; tx < s.x1 / TILE; tx++) {
        const a = line(tx * TILE);
        const b = line((tx + 1) * TILE);
        const low = Math.max(a, b);
        const high = Math.min(a, b);
        for (let ty = 0; ty < level.heightTiles; ty++) {
          if (!level.isSolid(tx, ty)) continue;
          const top = ty * TILE;
          // Under the line all the way across, or clear over it by his height and his
          // width's worth of the gradient (he stands on the line by his uphill foot).
          if (top >= low) continue;
          if (top + TILE <= high - PLAYER_H - PLAYER_W * g) continue;
          bad.push(`${at}: tile ${tx},${ty} is in the way`);
        }
      }
      if (s.x0 < data.spawn.x + PLAYER_W && data.arrival !== 'appear') bad.push(`${at} is in the walk-in`);
    }
  });
  expect(bad).toEqual([]);
});

test('a declared trick is a noun one of the level\'s traps kills under, never a fall, a drop, water or giving up', () => {
  const bad: string[] = [];
  for (const data of LEVELS) {
    if (!data.tricks) continue;
    const plain = new Set<string>(['Fall', 'Gave up']);
    if (data.fallCause) plain.add(data.fallCause);
    if (data.dropCause) plain.add(data.dropCause);
    for (const e of data.entities) if (e.kind === 'water' && e.cause) plain.add(e.cause);
    const traps = JSON.stringify(data.entities.filter((e) => e.kind !== 'water'));
    if (new Set(data.tricks).size !== data.tricks.length) bad.push(`${data.id}: a trick declared twice`);
    for (const t of data.tricks) {
      if (plain.has(t)) bad.push(`${data.id}: '${t}' is a plain death, not a trick`);
      else if (!traps.includes(JSON.stringify(t))) bad.push(`${data.id}: no trap kills under '${t}'`);
    }
  }
  expect(bad).toEqual([]);
});
