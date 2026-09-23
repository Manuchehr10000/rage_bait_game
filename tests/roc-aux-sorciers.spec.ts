import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Roc-aux-Sorciers, the second level of the game. The
 * contract here: in the raking light the wall tells you which figures are floors
 * and is never wrong, but not what a floor does next: one walks back the way you
 * came and one rises into the overhang. Out of the light the figures are drawn
 * the same and are not: three are engraving, one lets go, one settles into the
 * river, one is polished. Every death is the light or the player, and the second
 * attempt knows exactly where.
 */

interface Snap {
  state: string;
  cause: string;
  x: number;
  y: number;
  total: number;
  phase: string;
  lamp: boolean;
  tick: number;
}

const DRIVER = `
  const g = window.__game;
  g.resetRun();
  const p = g.player;
  const key = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  let hold = 0;
  const jump = (frames = 18) => { key('Space', true); hold = frames; };
  const canJump = () => p.onGround && hold === 0;
  const E = g.entities;
  const water = E.find((e) => e.def.kind === 'water');
  const bankX1 = water.def.x0;
  const caveX0 = water.def.x1;
  const raking = g.level.data.decor.find((d) => d.kind === 'raking');
  /** Every figure of the frieze carved deep enough to be a floor, left to right, whatever it does next. */
  const carved = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'relief' && e.def.rect.x < caveX0);
  /** The polished one: the region that slides whoever stands in it. */
  const polished = E.find((e) => e.def.kind === 'conveyor');
  const onPolished = (r) => r.x >= polished.def.rect.x && r.x < polished.def.rect.x + polished.def.rect.w;
  /** The figures that stay where they are carved and let you stay on them. */
  const stable = carved.filter((c) => !c.def.fake && !onPolished(c.rect));
  /** In the light: the one that walks back to the second, and the one that rises. */
  const walks = carved.find((c) => c.def.walk !== undefined);
  const rises = carved.find((c) => c.def.riseSpeed !== undefined);
  /** Out of it: the one that drops a second after you land, and the one that settles into the river as you do. */
  const letsGo = carved.find((c) => c.def.fake && c.def.sinkSpeed === undefined && !c.def.walk && c.def.riseSpeed === undefined);
  const settles = carved.find((c) => c.def.fake && c.def.sinkSpeed !== undefined);
  /** The three of the flat run that were only ever engraved: decor, and nothing to stand on. */
  const engraved = g.level.data.decor.filter((d) => d.kind === 'engraving' && d.x > raking.x1);
  const blocks = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'fallenBlock');
  const horns = E.find((e) => e.def.kind === 'crumble' && e.def.skin === 'horns');
  /** The block in Cave Taillebourg that is leaning, not attached. */
  const leaning = E.find((e) => e.def.kind === 'crumble' && e.def.skin === 'relief' && e.def.rect.x >= caveX0);
  const pitX0 = leaning.def.rect.x - 6;
  const right = () => p.x + p.w;
  /** Feet on a figure's back. */
  const standOn = (r) => { p.spawnAt(r.x + 9, r.y - 16); g.camera.x = r.x - 120; };
  /** The carved figure the tourist is over, if any. */
  const under = () => carved.map((c) => c.rect).find((r) => p.x + 5 >= r.x - 1 && p.x + 5 <= r.x + r.w);
  /** Whether that figure is one that moves the moment you stand on it. */
  const moves = (r) => carved.some((c) => c.rect === r && (c.def.walk || c.def.riseSpeed !== undefined));
  let phase = 'bank';
  let tick = 0;
  const run = (step, maxTicks) => {
    for (let i = 0; i < maxTicks; i++) {
      tick = i;
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      if (g.state !== 'playing') break;
    }
    key('ArrowRight', false); key('ArrowLeft', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase, lamp: g.lamp, tick };
  };
  /**
   * Cross the frieze the way it has to be crossed: walk the steps, hop the ones
   * carved higher, jump the gaps, and never stand on the polished one. A
   * figure's back is 28 px; anything more than a stride to the next one, or
   * any step up, is a jump.
   */
  const cross = () => {
    key('ArrowRight', true);
    if (!canJump()) return;
    const u = under();
    // Off the bank and up onto the first figure of the frieze.
    if (!u) {
      if (right() >= bankX1 - 10 && p.x < bankX1) jump();
      return;
    }
    // The polished one is not a floor. Bounce.
    if (onPolished(u)) { jump(); return; }
    const next = carved.map((c) => c.rect).find((r) => r.x > u.x);
    if (!next) return;
    const gap = next.x - (u.x + u.w);
    const up = next.y < u.y;
    // A figure that moves is left the moment you land on it: a hop if the next is
    // up or across a gap, a walk straight off the end if it is down and a stride away.
    if (moves(u)) { if (up || gap > 16) jump(gap > 16 ? 18 : 6); return; }
    if (right() < u.x + u.w - 6) return;
    // A step up across a stride is a hop, not a jump: a full jump carries 60 px and overshoots the next back.
    if (up && gap <= 16) jump(6);
    else if (gap > 16 && gap < 50) jump();
  };
`;

async function play(page: Page, script: string, ticks = 60 * 40): Promise<Snap> {
  return page.evaluate(`(() => { ${DRIVER} ${script} return run(step, ${ticks}); })()`);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#roc-aux-sorciers');
  await page.waitForFunction(() => {
    const g = (window as unknown as { __game?: { levelData: { id: string } } }).__game;
    return g?.levelData.id === 'roc-aux-sorciers';
  });
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  expect(errors).toEqual([]);
});

test('the level is the second in the tour and the tourist is still a hiker', async ({ page }) => {
  const info = await page.evaluate(`(() => { const g = window.__game; return { costume: g.levelData.costume, at: g.levelIndex }; })()`);
  expect(info).toEqual({ costume: 'hiker', at: 1 });
});

test('walking off the bank puts you in the Anglin', async ({ page }) => {
  const r = await play(page, `const step = () => key('ArrowRight', true);`, 60 * 12);
  expect(r.cause).toBe('The Anglin');
  expect(r.x).toBeGreaterThan(300);
});

test('the headlamp stays off through the whole sunlit half and comes on at the cave', async ({ page }) => {
  const before = await page.evaluate(`(() => window.__game.lamp)()`);
  expect(before).toBe(false);
  // Out on the frieze, in the sun, with the whole wall lit: still off.
  const middle = await play(page, `
    standOn(carved[carved.length - 1].rect);
    const step = () => { key('ArrowRight', false); if (!g.lamp) phase = 'dark hat'; };`, 60 * 3);
  expect(middle.phase).toBe('dark hat');
  expect(middle.lamp).toBe(false);
  // Into Cave Taillebourg, and it comes on and stays on.
  const cave = await play(page, `
    // From the last block of the collapse, walked straight off into the cave.
    p.spawnAt(caveX0 - 36, 216); g.camera.x = caveX0 - 200;
    const step = () => { key('ArrowRight', true); if (g.lamp) { key('ArrowRight', false); phase = 'lit'; } };`, 60 * 8);
  expect(cave.phase).toBe('lit');
  expect(cave.lamp).toBe(true);
});

test('the raked run is, in order: holds, holds, gone, walks, rises, holds, holds, and it climbs the wall', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const inRaking = carved.filter((c) => c.rect.x >= raking.x0 && c.rect.x < raking.x1);
    const shaded = g.level.data.decor.filter((d) => d.kind === 'engraving' && d.x >= raking.x0 && d.x < raking.x1);
    const all = [...inRaking.map((c) => ({ x: c.rect.x, y: c.rect.y, what: c.def.walk ? 'walks' : c.def.riseSpeed !== undefined ? 'rises' : c.def.fake ? 'gives' : onPolished(c.rect) ? 'polished' : 'holds' })),
      ...shaded.map((d) => ({ x: d.x + 4, y: d.y + 3, what: 'gone' }))].sort((a, b) => a.x - b.x);
    const heights = all.map((f) => f.y);
    return { order: all.map((f) => f.what), pitch: [...new Set(all.slice(1).map((f, i) => f.x - all[i].x))], levels: new Set(heights).size, span: Math.max(...heights) - Math.min(...heights) };
  })()`)) as { order: string[]; pitch: number[]; levels: number; span: number };
  expect(r.order).toEqual(['holds', 'holds', 'gone', 'walks', 'rises', 'holds', 'holds']);
  expect(r.pitch).toEqual([36]);
  expect(r.levels).toBe(6);
  expect(r.span).toBe(40);
});

test('the fourth turns round, walks back to the second, and lets go of whoever is still on it', async ({ page }) => {
  const r = await play(page, `
    const faceBefore = walks.face;
    standOn(walks.rect);
    const step = () => { key('ArrowRight', false); if (walks.state === 'walking' && walks.face !== faceBefore) phase = 'turned'; };`, 60 * 8);
  expect(r.phase).toBe('turned');
  expect(r.cause).toBe('The Anglin');
  // Let go of at the second figure's side, forty-four pixels back from where it was carved.
  const second = (await page.evaluate(`(() => { ${DRIVER} return stable[1].rect; })()`)) as { x: number; w: number };
  expect(r.x).toBeGreaterThanOrEqual(second.x + second.w - 2);
  expect(r.x).toBeLessThan(second.x + second.w + 30);
  expect(r.tick).toBeGreaterThan(50);
});

test('the fourth, walked back without you, stays at the second and is a ledge there', async ({ page }) => {
  const r = await play(page, `
    standOn(walks.rect);
    let left = false;
    const step = (i) => {
      // One step onto it, then straight back off to the left, onto the second.
      if (i < 4) key('ArrowRight', false);
      else if (!left) { key('ArrowLeft', true); if (canJump()) { jump(); left = true; } }
      else if (p.onGround && p.x < walks.rect.x - 4) key('ArrowLeft', false);
      if (walks.state === 'landed') phase = 'parked at ' + walks.rect.x;
    };`, 60 * 8);
  expect(r.state).toBe('playing');
  expect(r.total).toBe(0);
  expect(r.phase).toBe('parked at ' + 400);
});

test('the fifth rises, and whoever is still on it when the head room runs out is crushed', async ({ page }) => {
  const r = await play(page, `
    const startY = rises.rect.y;
    standOn(rises.rect);
    const step = () => { key('ArrowRight', false); if (rises.state === 'rising' && rises.rect.y < startY - 8) phase = 'going up'; };`, 60 * 8);
  expect(r.phase).toBe('going up');
  expect(r.cause).toBe('The overhang');
  expect(r.tick).toBeGreaterThan(60);
  expect(r.tick).toBeLessThan(60 * 3);
  // Left alone, it stops under the overhang and stays there.
  const parked = await play(page, `
    const sixth = stable.find((c) => c.rect.x > rises.rect.x).rect;
    standOn(rises.rect);
    const step = (i) => {
      // Walk straight off it onto the sixth, and stop there.
      key('ArrowRight', i >= 2 && !(p.onGround && p.x >= sixth.x));
      if (rises.state === 'landed') phase = 'parked at ' + rises.rect.y;
    };`, 60 * 8);
  expect(parked.state).toBe('playing');
  expect(parked.phase).toBe('parked at ' + 96);
});

test('the climb through the light is walked, hopped, and left the moment it moves, never fallen from', async ({ page }) => {
  const r = await play(page, `
    standOn(carved[0].rect);
    const end = carved.find((c) => c.rect.x >= raking.x1).rect;
    const step = () => { if (phase === 'through') { key('ArrowRight', false); return; } cross(); if (p.onGround && p.x >= end.x) phase = 'through'; };`, 60 * 10);
  expect(r.phase).toBe('through');
  expect(r.state).toBe('playing');
  expect(r.total).toBe(0);
});

test('standing still on a figure that holds does nothing at all, however long you wait', async ({ page }) => {
  // The highest one in the light, and the last of the flat run.
  for (const pick of ['stable.slice().sort((a, b) => a.rect.y - b.rect.y)[0]', 'stable.filter((c) => c.rect.x > raking.x1)[1]']) {
    const r = await play(page, `
      standOn(${pick}.rect);
      const startY = p.y;
      const step = () => { key('ArrowRight', false); if (p.y === startY) phase = 'held'; };`, 60 * 15);
    expect(r.phase).toBe('held');
    expect(r.state).toBe('playing');
    expect(r.total).toBe(0);
  }
});

test('an engraved figure is a drawing: jump for it and you go in the river', async ({ page }) => {
  const r = await play(page, `
    // The first engraving of the flat run, and the carved figure before it.
    const target = engraved[0];
    const from = carved.map((c) => c.rect).filter((r) => r.x < target.x).pop();
    standOn(from);
    const step = () => {
      key('ArrowRight', true);
      // A stride's jump, aimed at the figure that is not there.
      if (canJump() && right() >= from.x + from.w - 4) jump(9);
    };`, 60 * 8);
  expect(r.cause).toBe('The Anglin');
});

test('the flat run is, in order: holds, gone, lets go, higher and settles, gone, polished, gone, holds', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const flat = [...carved.filter((c) => c.rect.x > raking.x1 && c.rect.x < horns.def.rect.x - 40).map((c) => ({ x: c.rect.x, what: c.def.fake ? (c.def.sinkSpeed === undefined ? 'lets go' : 'settles') : onPolished(c.rect) ? 'polished' : 'holds', y: c.rect.y })),
      ...engraved.map((d) => ({ x: d.x + 4, what: 'gone', y: d.y + 3 }))].sort((a, b) => a.x - b.x);
    return { order: flat.map((f) => f.what), pitch: [...new Set(flat.slice(1).map((f, i) => f.x - flat[i].x))], higher: flat.map((f) => f.y).map((y, i, a) => y < a[0]) };
  })()`)) as { order: string[]; pitch: number[]; higher: boolean[] };
  expect(r.order).toEqual(['holds', 'gone', 'lets go', 'settles', 'gone', 'polished', 'gone', 'holds']);
  expect(r.pitch).toEqual([36]);
  expect(r.higher).toEqual([false, false, false, true, false, false, false, false]);
});

test('the third of the flat run lets go one second after you land on it', async ({ page }) => {
  const r = await play(page, `
    standOn(letsGo.rect);
    let went = -1;
    const step = (i) => { key('ArrowRight', false); if (went < 0 && letsGo.state === 'falling') { went = i; phase = 'went at ' + i; } };`, 60 * 8);
  expect(r.cause).toBe('The Anglin');
  // Sixty ticks to the second, give or take the frame it takes to notice him.
  const went = Number(r.phase.replace('went at ', ''));
  expect(went).toBeGreaterThanOrEqual(58);
  expect(went).toBeLessThanOrEqual(63);
});

test('the fourth is carved higher than the rest and settles into the river under whoever stands on it', async ({ page }) => {
  const r = await play(page, `
    const startY = settles.rect.y;
    standOn(settles.rect);
    const step = () => { key('ArrowRight', false); if (settles.state === 'falling' && settles.rect.y > startY + 8) phase = 'going under'; };`, 60 * 8);
  expect(r.phase).toBe('going under');
  expect(r.cause).toBe('The Anglin');
  expect(r.tick).toBeGreaterThan(60 * 2);

  const shape = await page.evaluate(`(() => { ${DRIVER}
    const others = carved.filter((c) => c !== settles && c.rect.x > raking.x1).map((c) => c.rect.y);
    return { above: Math.min(...others) - settles.def.rect.y, sameAsOthers: new Set(others).size, delay: settles.def.delay };
  })()`);
  expect(shape).toEqual({ above: 32, sameAsOthers: 1, delay: 0 });
});

test('the sixth is polished: stand on it and it slides you back into the river where the fifth is', async ({ page }) => {
  // Hold right the whole way. It still takes you back.
  const r = await play(page, `
    const it = carved.find((c) => onPolished(c.rect)).rect;
    standOn(it);
    const step = () => { key('ArrowRight', true); if (p.onGround && p.x < it.x + 9 - 4) phase = 'sliding'; };`, 60 * 8);
  expect(r.phase).toBe('sliding');
  expect(r.cause).toBe('The Anglin');
  const fifth = (await page.evaluate(`(() => { ${DRIVER} return engraved[1].x + 4; })()`)) as number;
  expect(r.x).toBeGreaterThanOrEqual(fifth - 12);
  expect(r.x).toBeLessThan(fifth + 36);
});

test('bounce off the polished one the moment you land and the eighth holds', async ({ page }) => {
  const r = await play(page, `
    const eighth = stable.filter((c) => c.rect.x > raking.x1)[1].rect;
    standOn(settles.rect);
    const step = () => { if (phase === 'eighth') { key('ArrowRight', false); return; } cross(); if (p.onGround && p.x >= eighth.x) phase = 'eighth'; };`, 60 * 8);
  expect(r.phase).toBe('eighth');
  expect(r.state).toBe('playing');
  expect(r.total).toBe(0);
});

test('the gap between the confronting ibex is past a running jump', async ({ page }) => {
  const r = await play(page, `
    const near = carved[carved.length - 2].rect;
    const far = carved[carved.length - 1].rect;
    // Take the horns out and jump it the way every other gap on this wall is jumped.
    horns.def.rect.y = 9999; horns.rect.y = 9999;
    standOn(near);
    const step = () => {
      key('ArrowRight', true);
      if (canJump() && right() >= near.x + near.w - 4) jump();
    };`, 60 * 6);
  expect(r.cause).toBe('The Anglin');
  expect(r.x).toBeGreaterThan(960);
  expect(r.x).toBeLessThan(1040);
});

test('their horns are the way across, and they hold', async ({ page }) => {
  const r = await play(page, `
    const near = carved[carved.length - 2].rect;
    const far = carved[carved.length - 1].rect;
    standOn(near);
    const step = () => {
      // Walk out onto them. They are level with the backs on either side.
      key('ArrowRight', phase !== 'across');
      if (p.onGround && p.x >= far.x) phase = 'across';
    };`, 60 * 8);
  expect(r.phase).toBe('across');
  expect(r.state).toBe('playing');
  expect(r.total).toBe(0);

  const held = await page.evaluate(`(() => { ${DRIVER}
    const near = carved[carved.length - 2].rect;
    const far = carved[carved.length - 1].rect;
    return { fake: horns.def.fake, span: far.x - (near.x + near.w), level: horns.def.rect.y === near.y };
  })()`);
  expect(held).toEqual({ fake: false, span: 76, level: true });
});

/**
 * The collapse, crossed the only way it can be: jump from the first over the one that
 * turns over, off the wet one at once, hop in place on the one that holds to set the
 * shy one off, let it come back down, jump on to it, down on to the one that creeps
 * and straight off it again, on to the floor of the cave.
 */
const CROSS = `
  const JUMP_1 = 18, JUMP_3 = 12, JUMP_4 = 10;
  const onB = (b) => p.onGround && p.x + p.w > b.rect.x && p.x < b.rect.x + b.rect.w && Math.abs(p.y + p.h - b.rect.y) <= 2;
  const crossCollapse = () => {
    const bl = g.entities.filter((e) => e.def.skin === 'fallenBlock').sort((a, b) => a.def.rect.x - b.def.rect.x);
    switch (phase) {
      case 'collapse': key('ArrowRight', true); if (canJump() && onB(bl[0]) && p.x + p.w >= bl[0].rect.x + bl[0].rect.w - 2) { jump(JUMP_1); phase = 'to4'; } break;
      case 'to4': key('ArrowRight', true); if (canJump() && onB(bl[2])) { jump(JUMP_3); phase = 'on4'; } break;
      case 'on4': if (canJump() && onB(bl[3])) { key('ArrowRight', false); jump(4); phase = 'provoked'; } else key('ArrowRight', true); break;
      case 'provoked': key('ArrowRight', false); if (bl[4].state === 'landed' && canJump()) phase = 'to5'; break;
      case 'to5': key('ArrowRight', true); if (canJump() && p.x + p.w >= bl[3].rect.x + bl[3].rect.w - 4) { jump(JUMP_4); phase = 'on5'; } break;
      case 'on5': key('ArrowRight', true); if (canJump() && onB(bl[4]) && p.x + p.w >= bl[4].rect.x + bl[4].rect.w - 2) { jump(8); phase = 'on6'; } break;
      case 'on6': key('ArrowRight', true); if (canJump() && onB(bl[5])) { jump(12); phase = 'over6'; } break;
      case 'over6': key('ArrowRight', true); if (p.onGround && p.x >= caveX0) phase = 'cave'; break;
    }
  };
`;

test('six blocks of the collapse, one stone, six ways of being one', async ({ page }) => {
  const shape = (await page.evaluate(`(() => { ${DRIVER}
    const bl = blocks.slice().sort((a, b) => a.def.rect.x - b.def.rect.x);
    return { n: bl.length, sameSize: bl.every((b) => b.def.rect.w === 40 && b.def.rect.h === 12),
      gaps: [0, 1, 2, 3, 4].map((i) => bl[i + 1].def.rect.x - (bl[i].def.rect.x + 40)), toTheCave: caveX0 - (bl[5].def.rect.x + 40),
      stepUp: bl[4].def.rect.y === bl[3].def.rect.y - 16,
      // No woman is drawn behind a block: none of the five overlaps any of the six.
      womenClear: g.level.data.decor.filter((d) => d.kind === 'venus').every((v) => bl.every((b) => {
        const r = b.def.rect; return v.x + 14 <= r.x || v.x >= r.x + r.w || v.y + 26 <= r.y; })) };
  })()`)) as Record<string, any>;
  // Uneven, and the same on every attempt.
  expect(shape).toEqual({ n: 6, sameSize: true, gaps: [2, 4, 20, 10, 24], toTheCave: 20, stepUp: true, womenClear: true });

  const trial = (setup: string, step: string) => play(page, `
    const bl = blocks.slice().sort((a, b) => a.def.rect.x - b.def.rect.x);
    ${setup}
    const step = () => { ${step} };`, 60 * 6);
  // 1. Stood on, it settles into the river after a second.
  const first = await trial(`standOn(bl[0].rect);`, `key('ArrowRight', false); if (bl[0].state === 'armed' && phase === 'bank') phase = 'armed'; if (bl[0].state === 'falling') phase = 'sinking';`);
  expect(first).toMatchObject({ phase: 'sinking', state: 'dead', cause: 'The Anglin' });
  // 2. Walked on to from the first, it turns over at once and he goes in.
  const second = await trial(`standOn(bl[0].rect);`, `key('ArrowRight', true); if (bl[1].state === 'falling' && phase === 'bank') phase = 'over at ' + Math.round(p.x);`);
  expect(second.state).toBe('dead');
  expect(second.cause).toBe('The Anglin');
  expect(second.phase).toMatch(/^over at /);
  // 3. The wet one drags a man standing on it back into the hole the second left.
  const third = await trial(`standOn(bl[2].rect);`, `key('ArrowRight', false);`);
  expect(third).toMatchObject({ state: 'dead', cause: 'The Anglin' });
  const thirdX = (await page.evaluate(`(() => { ${DRIVER} return blocks.slice().sort((a, b) => a.def.rect.x - b.def.rect.x)[2].def.rect.x; })()`)) as number;
  expect(third.x).toBeLessThan(thirdX);
  // 4. The fourth holds, as long as he likes.
  const fourth = await trial(`standOn(bl[3].rect);`, `key('ArrowRight', false);`);
  expect(fourth).toMatchObject({ state: 'playing', y: 216 });
  // 5. Jumped at from the fourth, the fifth is not there: it has hopped out of reach.
  const fifth = await trial(`standOn(bl[3].rect);`, `key('ArrowRight', true); if (canJump() && p.x + p.w >= bl[3].rect.x + bl[3].rect.w - 4 && phase === 'bank') { jump(10); phase = 'jumped'; } if (bl[4].state === 'hopping') phase = 'jumped, and it hopped';`);
  expect(fifth).toMatchObject({ phase: 'jumped, and it hopped', state: 'dead', cause: 'The Anglin' });
  // 6. Stood on, the sixth creeps back into the fifth and breaks, and he goes in with it.
  const sixth = await trial(`standOn(bl[5].rect);`, `key('ArrowRight', false); if (bl[5].state === 'walking') phase = 'creeping'; if (bl[5].state === 'falling' && phase === 'creeping') phase = 'broke ' + (bl[5].rect.x === bl[4].rect.x + bl[4].rect.w ? 'against the fifth' : 'at ' + bl[5].rect.x);`);
  expect(sixth.phase).toBe('broke against the fifth');
  expect(sixth).toMatchObject({ state: 'dead', cause: 'The Anglin' });
});

test('the shy block hops once, for the first jump taken at it from the fourth, and then holds', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const bl = () => g.entities.filter((e) => e.def.skin === 'fallenBlock').sort((a, b) => a.def.rect.x - b.def.rect.x);
    const out = {};
    // A hop in place on the fourth sets it off; it goes up, is not there, and comes back.
    const four = bl()[3].def.rect;
    g.resetRun(); p.spawnAt(four.x + 20, four.y - 32); for (let i = 0; i < 20; i++) g.tick();
    key('Space', true); g.tick(); key('Space', false);
    const five = bl()[4];
    let top = five.rect.y, solidsInAir = 1;
    for (let i = 0; i < 60; i++) { g.tick(); top = Math.min(top, five.rect.y); if (five.state === 'hopping') solidsInAir = Math.min(solidsInAir, five.solids().length); }
    out.hop = { state: five.state, rose: five.def.rect.y - top, backWhereItWas: five.rect.y === five.def.rect.y, solidsInAir };
    // A second jump from the fourth does nothing: it stays where it came down.
    key('Space', true); g.tick(); key('Space', false);
    for (let i = 0; i < 10; i++) g.tick();
    out.again = five.state;
    // Walking at it from the fourth is a wall: it is a step up.
    // Walking off the fourth at it is a fall into the gap under its step.
    g.resetRun(); p.spawnAt(four.x + 20, four.y - 32); for (let i = 0; i < 10; i++) g.tick();
    key('ArrowRight', true); for (let i = 0; i < 90 && g.state === 'playing'; i++) g.tick(); key('ArrowRight', false);
    out.walked = { died: g.state === 'dead' ? g.deathCause : g.state, state: bl()[4].state };
    return out;
  })()`)) as Record<string, any>;
  expect(r.hop).toEqual({ state: 'landed', rose: expect.any(Number), backWhereItWas: true, solidsInAir: 0 });
  // Forty-eight px of hop, less what a fixed step loses at the top.
  expect(r.hop.rose).toBeGreaterThanOrEqual(44);
  expect(r.again).toBe('landed');
  expect(r.walked).toEqual({ died: 'The Anglin', state: 'idle' });
});

test('crossing the collapse the one way it can be crossed gets you to the cave dry', async ({ page }) => {
  const r = await play(page, `
    ${CROSS}
    p.spawnAt(1030, 192); g.camera.x = 920;
    phase = 'collapse';
    const step = () => { crossCollapse(); if (phase === 'cave') key('ArrowRight', false); };`, 60 * 12);
  expect(r.phase).toBe('cave');
  expect(r.state).toBe('playing');
  expect(r.total).toBe(0);
});

test('the one thing the lamp picks out in Taillebourg is the one thing not attached', async ({ page }) => {
  const r = await play(page, `
    const ledge = leaning.def.rect;
    p.spawnAt(pitX0 - 40, 224); g.camera.x = pitX0 - 160;
    let hopped = false;
    const step = () => {
      key('ArrowRight', true);
      // Take the ledge the headlamp has just found, the way a careful player would.
      if (!hopped && canJump() && p.x >= pitX0 - 20) { jump(10); hopped = true; }
      if (hopped && p.onGround) key('ArrowRight', false);
      if (leaning.state !== 'idle') phase = 'gave way';
    };`, 60 * 8);
  expect(r.phase).toBe('gave way');
  expect(r.cause).toBe('The rockfall');
});

test('the gap it is leaning over can be jumped by anyone who ignores it', async ({ page }) => {
  const r = await play(page, `
    p.spawnAt(pitX0 - 60, 224); g.camera.x = pitX0 - 180;
    const step = () => {
      key('ArrowRight', true);
      if (canJump() && p.x >= pitX0 - 12 && p.x <= pitX0 - 2) jump();
      if (p.onGround && p.x > pitX0 + 52) phase = 'over';
    };`, 60 * 8);
  expect(r.phase).toBe('over');
  expect(r.total).toBe(0);
});

test('a run that knows the level finishes with zero deaths', async ({ page }) => {
  const r = await play(page, `
    ${CROSS}
    const last = carved[carved.length - 1].rect;
    const step = () => {
      switch (phase) {
        // The bank, and onto the first figure of the frieze.
        case 'bank':
          key('ArrowRight', true);
          if (p.x > bankX1 - 24) phase = 'frieze';
          break;
        // Walk the steps, hop the climbs, jump the gaps, bounce off the polished
        // one, and never stop on the confronting pair.
        case 'frieze':
          cross();
          if (p.x >= last.x) phase = 'collapse';
          break;
        // The collapse, block by block.
        case 'collapse': case 'to4': case 'on4': case 'provoked': case 'to5': case 'on5': case 'on6': case 'over6':
          crossCollapse();
          break;
        // Ignore the ledge the lamp finds. Jump the gap it is leaning over.
        case 'cave':
          key('ArrowRight', true);
          if (canJump() && p.x >= pitX0 - 12 && p.x <= pitX0 - 2) jump();
          if (p.onGround && p.x > pitX0 + 52) phase = 'out';
          break;
        case 'out':
          key('ArrowRight', true);
          break;
      }
    };`, 60 * 60);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
});

test('the bedding lines of the cliff stay in the rock, off the slope of its face', async ({ page }) => {
  // Every row of the cliff, from under the overhang to the valley floor: no pixel of
  // a bedding line (shelterWallShade, #ab9d7e) left of where the sloping face is.
  const r = (await page.evaluate(`(() => {
    const g = window.__game; g.resetRun();
    const cliff = g.level.data.decor.find((d) => d.kind === 'cliff');
    g.player.spawnAt(24, 224); g.camera.x = 0; g.camera.y = 60; g.draw();
    const W = g.wctx, S = 4, bottom = 18 * 16;
    const stray = [];
    for (let y = cliff.ceilingY + 1; y < 15 * 16; y++) {
      if (y - g.camera.iy < 0 || y - g.camera.iy >= 180) continue;
      const face = cliff.x0 - (48 * (y - cliff.ceilingY)) / (bottom - cliff.ceilingY);
      for (let x = Math.max(0, Math.floor(face) - 48); x < Math.floor(face) - 1; x++) {
        const d = W.getImageData((x - g.camera.ix) * S + 1, (y - g.camera.iy) * S + 1, 1, 1).data;
        if (d[0] === 0xab && d[1] === 0x9d && d[2] === 0x7e) stray.push(x + ',' + y);
      }
    }
    return { stray: stray.slice(0, 5), count: stray.length };
  })()`)) as { stray: string[]; count: number };
  expect(r).toEqual({ stray: [], count: 0 });
});
