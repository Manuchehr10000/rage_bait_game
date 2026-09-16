import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Pech Merle: the long level, and the first one in the
 * game that goes anywhere but sideways. The contract: the concrete walkway of
 * the guided tour and the footprints of one adolescent both say where to go,
 * they disagree, and the walkway is wrong. The cave is 576 px deep and the route
 * goes down through it in stages, because a fall of more than 200 px is fatal
 * anywhere in the game.
 */

interface Snap {
  state: string;
  cause: string;
  x: number;
  y: number;
  total: number;
  phase: string;
  secs: number;
  /** How far up and down the tourist went, and how far the camera had to follow. */
  yLo: number;
  yHi: number;
  camLo: number;
  camHi: number;
}

const DRIVER = `
  const g = window.__game;
  g.resetRun();
  const p = g.player;
  const L = g.level;
  const key = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  let hold = 0;
  const jump = (frames = 18) => { key('Space', true); hold = frames; };
  const canJump = () => p.onGround && hold === 0;
  const E = g.entities;
  const discs = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'disc');
  const lastRun = E.find((e) => e.def.kind === 'crumble' && e.def.skin === 'walkway');
  const prints = g.level.data.decor.find((d) => d.kind === 'footprints').prints;
  const nests = g.level.data.decor.filter((d) => d.kind === 'bearNest');
  const solid = (x, y) => L.isSolid(Math.floor(x / 16), Math.floor(y / 16));
  /**
   * The edge of whatever we are standing on, and the nearest surface beyond it —
   * at any height a jump can reach, because in this level the next ledge is
   * usually lower than this one and sometimes higher.
   */
  const look = () => {
    const feet = p.y + p.h + 2;
    let edge = -1;
    for (let d = 0; d < 40; d += 2) if (!solid(p.x + p.w + d, feet)) { edge = d; break; }
    if (edge < 0) return null;
    for (let dx = edge; dx < 140; dx += 2)
      for (let dy = -64; dy <= 72; dy += 4)
        if (solid(p.x + p.w + dx, feet + dy) && !solid(p.x + p.w + dx, feet + dy - 16)) return { edge, dx, dy };
    return { edge, dx: 999, dy: 0 };
  };
  /** The whole honest route: walk on, and take every step down or up as it comes. */
  const known = () => {
    key('ArrowRight', true);
    if (!canJump()) return;
    const d = discs.map((e) => e.rect).find((r) => p.x + 5 >= r.x - 1 && p.x + 5 <= r.x + r.w && Math.abs(p.y + p.h - r.y) <= 2);
    if (d) {
      if (p.x + p.w >= d.x + d.w - 4) jump(12);
      return;
    }
    const a = look();
    if (a && a.edge <= 4) jump(a.dx > 40 || a.dy < -8 ? 16 : 9);
  };
  let phase = 'in';
  let ticks = 0;
  let yLo = 9999, yHi = -9999, camLo = 9999, camHi = -9999;
  const run = (step, maxTicks) => {
    for (let i = 0; i < maxTicks; i++) {
      ticks = i;
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      yLo = Math.min(yLo, p.y); yHi = Math.max(yHi, p.y);
      camLo = Math.min(camLo, g.camera.y); camHi = Math.max(camHi, g.camera.y);
      if (g.state !== 'playing') break;
    }
    key('ArrowRight', false); key('ArrowLeft', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase,
      secs: Math.round((ticks / 60) * 10) / 10, yLo: Math.round(yLo), yHi: Math.round(yHi), camLo: Math.round(camLo), camHi: Math.round(camHi) };
  };
`;

async function play(page: Page, script: string, ticks = 60 * 120): Promise<Snap> {
  return page.evaluate(`(() => { ${DRIVER} ${script} return run(step, ${ticks}); })()`);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#pech-merle');
  await page.waitForFunction(() => {
    const g = (window as unknown as { __game?: { levelData: { id: string } } }).__game;
    return g?.levelData.id === 'pech-merle';
  });
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  expect(errors).toEqual([]);
});

test('the level is the third in the tour and still the same hiker', async ({ page }) => {
  const info = await page.evaluate(`(() => { const g = window.__game; return { costume: g.levelData.costume, at: g.levelIndex }; })()`);
  expect(info).toEqual({ costume: 'hiker', at: 2 });
});

test('the cave is deep, dark, and lit by one lamp', async ({ page }) => {
  const r = await page.evaluate(`(() => { ${DRIVER}
    const dark = g.level.data.decor.find((d) => d.kind === 'dark');
    return { from: g.level.data.lampFromX, darkTo: dark.x1, ambient: dark.ambient, h: g.level.heightPx, w: g.level.widthPx };
  })()`);
  expect(r).toEqual({ from: 96, darkTo: 3072, ambient: 0.78, h: 576, w: 3072 });
});

test('a run that knows the level goes down four hundred pixels and comes back up', async ({ page }) => {
  const r = await play(page, `const step = () => known();`);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
  // It is long, so a death at the end costs everything.
  expect(r.secs).toBeGreaterThan(28);
  // And it is the first level in the game that uses the other axis. Before this
  // one the tourist lived in a 45 px band and the camera never moved at all.
  expect(r.yHi - r.yLo).toBeGreaterThan(350);
  expect(r.camHi - r.camLo).toBeGreaterThan(300);
});

test('following the concrete at the Chapel drops you the height of the cave', async ({ page }) => {
  const r = await play(page, `
    // Take the route as far as the last slab, then do what the walkway says and
    // keep walking. It runs out over the shaft six tiles after the floor does.
    const step = () => { if (p.x < 500) known(); else key('ArrowRight', true); };`, 60 * 30);
  expect(r.cause).toBe('The lower gallery');
  // Off the end of the cantilevered slab, into the first shaft, not before it.
  expect(r.x).toBeGreaterThan(544);
  expect(r.x).toBeLessThan(720);
  // And all the way to the floor of the gallery underneath.
  expect(r.y).toBeGreaterThan(500);
});

test('the prints turn back at the edge of the first shaft and then go down its side', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const back = prints.filter((f) => f.back);
    const heights = [...new Set(prints.map((f) => f.y))].sort((a, b) => a - b);
    // Every print has floor under both ends of it. That is a rule, not a placement.
    const floating = prints.filter((f) => !solid(f.x, f.y + 6) || !solid(f.x + 6, f.y + 6));
    return { back: back.length, backAtTheEdge: back.every((f) => f.x > 500 && f.x < 570), levels: heights.length, floating: floating.length };
  })()`)) as { back: number; backAtTheEdge: boolean; levels: number; floating: number };
  expect(r.back).toBe(2);
  expect(r.backAtTheEdge).toBe(true);
  expect(r.floating).toBe(0);
  // The trail is on a dozen different heights now, not one.
  expect(r.levels).toBeGreaterThan(10);
});

test("the Bear's Gallery is a descent, and its hollows are harmless", async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const ledges = [];
    for (let tx = 60; tx < 120; tx++)
      for (let ty = 18; ty < 34; ty++)
        if (L.isSolid(tx, ty) && !L.isSolid(tx, ty - 1)) { ledges.push(ty * 16); break; }
    const tops = [...new Set(ledges)].sort((a, b) => a - b);
    const hazards = g.entities.filter((e) => e.def.kind === 'hazard');
    return { steps: tops.length, from: tops[0], to: tops[tops.length - 1], nests: nests.length, hazards: hazards.length };
  })()`)) as { steps: number; from: number; to: number; nests: number; hazards: number };
  // Eight ledges stepping down, and the hollows are drawn, not lethal: the only
  // hazard in the level is the floor of the lower gallery.
  expect(r.steps).toBeGreaterThan(6);
  expect(r.to - r.from).toBeGreaterThan(120);
  expect(r.nests).toBe(4);
  expect(r.hazards).toBe(1);
});

test('stepping off a ledge in the Bear’s Gallery is a fall the length of the cave', async ({ page }) => {
  const r = await play(page, `
    // Stand on the third ledge and walk straight off the end of it.
    p.spawnAt(1240, 368); g.camera.x = 1120; g.camera.y = 280;
    const step = () => key('ArrowRight', true);`, 60 * 15);
  expect(r.cause).toBe('The lower gallery');
  expect(r.y).toBeGreaterThan(460);
});

test('the Hall of the Discs climbs, and two of the plates are done holding', async ({ page }) => {
  const which = (await page.evaluate(`(() => { ${DRIVER}
    return { fake: discs.map((d) => d.def.fake), ys: discs.map((d) => d.rect.y) };
  })()`)) as { fake: boolean[]; ys: number[] };
  expect(which.fake).toEqual([false, false, true, false, true]);
  // Every plate is higher than the last: this beat goes up.
  const ys = which.ys;
  for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeLessThan(ys[i - 1] as number);
  expect((ys[0] as number) - (ys[ys.length - 1] as number)).toBeGreaterThan(120);

  const r = await play(page, `
    const bad = discs.filter((d) => d.def.fake)[0].rect;
    p.spawnAt(bad.x + 8, bad.y - 16); g.camera.x = bad.x - 120; g.camera.y = bad.y - 90;
    const step = () => { key('ArrowRight', false); if (discs[2].state !== 'idle') phase = 'going'; };`, 60 * 10);
  expect(r.phase).toBe('going');
  expect(r.state).toBe('dead');
});

test('the last run of concrete is the best view in the cave and it holds for half a second', async ({ page }) => {
  const def = await page.evaluate(`(() => { ${DRIVER} return { w: lastRun.def.rect.w, fake: lastRun.def.fake, delay: lastRun.def.delay }; })()`);
  expect(def).toEqual({ w: 80, fake: true, delay: 0.6 });

  const r = await play(page, `
    p.spawnAt(2560, 304); g.camera.x = 2440; g.camera.y = 230;
    const step = () => { key('ArrowRight', true); if (lastRun.state === 'falling') phase = 'gone'; };`, 60 * 12);
  expect(r.phase).toBe('gone');
  expect(r.cause).toBe('The lower gallery');
});

test('leaving the concrete for the shelves the prints climb gets you out', async ({ page }) => {
  const r = await play(page, `
    p.spawnAt(2560, 304); g.camera.x = 2440; g.camera.y = 230;
    const step = () => known();`, 60 * 25);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
});
