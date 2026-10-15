import { expect, test, type Page } from '@playwright/test';
import { Progress } from '../src/engine/progress';
import { LEVELS } from '../src/levels';
import { CHAPTERS } from '../src/map/atlas';

/**
 * The tour map: the start screen. Keyboard and mouse both work; closed chapters
 * stay closed; entering a level walks the tourist in from the left edge; Escape leaves.
 */

const key = (code: string) => `window.dispatchEvent(new KeyboardEvent('keydown', { code: '${code}' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: '${code}' }));`;

async function ticks(page: Page, n: number): Promise<void> {
  await page.evaluate((n) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as unknown as { __game: any }).__game;
    for (let i = 0; i < n; i++) g.tick();
  }, n);
}

async function press(page: Page, code: string): Promise<void> {
  await page.evaluate(key(code));
  await ticks(page, 1);
}

async function snap(page: Page): Promise<{ screen: string; view: string; chapter: number; site: number; level: string | null; x: number; y: number; onGround: boolean; arriving: boolean; deaths: number; state: string }> {
  return page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as unknown as { __game: any }).__game;
    return {
      screen: g.currentScreen,
      view: g.mapScreen.view,
      chapter: g.mapScreen.chapter,
      site: g.mapScreen.site,
      level: g.currentScreen === 'level' ? g.levelData.id : null,
      x: Math.round(g.player.x),
      y: Math.round(g.player.y),
      onGround: g.player.onGround,
      arriving: g.isArriving,
      deaths: g.stats.total,
      state: g.state,
    };
  });
}

/** The chapters the game shows: SHOWN_CHAPTERS in src/map/atlas.ts. */
const SHOWN = 4;

/** Chapter 1's levels, for tests that need a chapter cleared. */
const CHAPTER_1 = ['cap-blanc', 'roc-aux-sorciers', 'pech-merle', 'rouffignac', 'gargas'];
/** Chapter 2's. */
const CHAPTER_2 = ['abu-simbel', 'philae', 'karnak', 'dendera'];

async function seed(page: Page, cleared: string[]): Promise<void> {
  // Entering a level puts it in the URL; take it out, or the reload goes back into it.
  await page.evaluate((c) => {
    localStorage.setItem('lostTourist.cleared', JSON.stringify(c));
    history.replaceState(null, '', location.pathname);
  }, cleared);
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { __game?: { currentScreen: string } }).__game?.currentScreen === 'map');
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await page.waitForFunction(() => (window as unknown as { __game?: { currentScreen: string } }).__game?.currentScreen === 'map');
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  expect(errors).toEqual([]);
});

test('the map opens on chapter 1; Enter opens it on Cap Blanc', async ({ page }) => {
  let s = await snap(page);
  expect(s.screen).toBe('map');
  expect(s.view).toBe('world');
  expect(s.chapter).toBe(0);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.view).toBe('chapter');
  expect(s.chapter).toBe(0);
  expect(s.site).toBe(0);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.screen).toBe('level');
  expect(s.level).toBe('cap-blanc');
});

test('the game shows chapters 1 to 4 and nothing beyond them', async ({ page }) => {
  const seen = await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = (window as unknown as { __game: any }).__game.mapScreen;
    m.openWorld();
    const names: string[] = [];
    for (let i = 0; i < 12; i++) {
      m.chapter = i;
      names.push(m.current.name);
    }
    m.chapter = 0;
    return { stops: m.stops as number, names };
  });
  expect(seen.stops).toBe(SHOWN);
  // Walking past the last shown chapter comes back round to the first.
  await press(page, 'ArrowLeft');
  expect((await snap(page)).chapter).toBe(SHOWN - 1);
  await press(page, 'ArrowRight');
  expect((await snap(page)).chapter).toBe(0);
  expect(seen.names.slice(0, SHOWN)).toEqual(['Palaeolithic Europe', 'Egypt', 'Bronze Age Aegean', 'Iron Age Near East & Persia']);
});

test('a closed chapter stays closed', async ({ page }) => {
  // Every shown chapter has a level now, so the last one is closed for this test by
  // taking its levels away, in this page only: a chapter with nothing built in it is
  // what "closed" means (chapterOpen in src/map/atlas.ts).
  await press(page, 'ArrowLeft');
  let s = await snap(page);
  expect(s.chapter).toBe(SHOWN - 1);
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = (window as unknown as { __game: any }).__game.mapScreen;
    for (const site of m.current.sites) delete site.level;
  });
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.view).toBe('world');
  expect(s.chapter).toBe(SHOWN - 1);
});

test('a chapter with nothing built in it is closed; one level opens it', async () => {
  const { CHAPTERS, chapterOpen } = await import('../src/map/atlas');
  for (const c of CHAPTERS) {
    expect(chapterOpen({ ...c, sites: c.sites.map(({ level: _level, ...site }) => site) }), c.name).toBe(false);
    expect(chapterOpen(c), c.name).toBe(c.sites.some((site) => site.level));
  }
});

test('arrow keys walk the chapters; Enter walks into Egypt from the left edge; Escape comes back', async ({ page }) => {
  await seed(page, CHAPTER_1);
  await press(page, 'ArrowRight');
  let s = await snap(page);
  expect(s.chapter).toBe(1);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.view).toBe('chapter');
  expect(s.site).toBe(0);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.screen).toBe('level');
  expect(s.level).toBe('abu-simbel');
  // Off the left edge, walking, not yet his to steer.
  expect(s.arriving).toBe(true);
  expect(s.x).toBeLessThan(0);
  expect(s.y).toBe(224);
  await ticks(page, 120);
  s = await snap(page);
  // All of him on the screen, and his to steer; nobody pressed anything, so he stands at the edge.
  expect(s.arriving).toBe(false);
  expect(s.x).toBe(0);
  expect(s.y).toBe(224);
  expect(s.onGround).toBe(true);
  expect(s.deaths).toBe(0);
  await press(page, 'Escape');
  s = await snap(page);
  expect(s.state).toBe('dead');
  await ticks(page, 60);
  s = await snap(page);
  expect(s.screen).toBe('map');
  expect(s.view).toBe('chapter');
  expect(s.chapter).toBe(1);
  expect(s.site).toBe(0);
});

test('a closed site stays closed; the chapter wraps around', async ({ page }) => {
  await press(page, 'ArrowRight');
  await press(page, 'Enter');
  // Left from Abu Simbel wraps to the last stop, the legend, which is not built.
  await press(page, 'ArrowLeft');
  let s = await snap(page);
  expect(s.site).toBe(5);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.screen).toBe('map');
  // And Saqqara, not built either.
  await press(page, 'ArrowLeft');
  s = await snap(page);
  expect(s.site).toBe(4);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.screen).toBe('map');
  await press(page, 'Escape');
  s = await snap(page);
  expect(s.view).toBe('world');
});

test('the mouse picks a chapter and a site', async ({ page }) => {
  await seed(page, [...CHAPTER_1, 'abu-simbel', 'philae']);
  const box = await page.locator('#game').boundingBox();
  if (!box) throw new Error('no canvas');
  const at = async (p: { x: number; y: number }) => ({ x: box.x + (p.x / 320) * box.width, y: box.y + (p.y / 180) * box.height });
  const egypt = await page.evaluate(() => (window as unknown as { __game: { mapScreen: { worldBadge(i: number): { x: number; y: number } } } }).__game.mapScreen.worldBadge(1));
  const c = await at(egypt);
  await page.mouse.click(c.x, c.y);
  await ticks(page, 1);
  let s = await snap(page);
  expect(s.view).toBe('chapter');
  expect(s.chapter).toBe(1);
  const karnak = await page.evaluate(() => (window as unknown as { __game: { mapScreen: { sitePin(i: number): { x: number; y: number } } } }).__game.mapScreen.sitePin(2));
  const k = await at(karnak);
  await page.mouse.click(k.x, k.y);
  await ticks(page, 1);
  s = await snap(page);
  expect(s.screen).toBe('level');
  expect(s.level).toBe('karnak');
});

test('outside prod every built level is open from the start, with nothing cleared', async ({ page }) => {
  // Nothing cleared. Roc-aux-Sorciers, second in chapter 1, can be entered.
  await press(page, 'Enter');
  await press(page, 'ArrowRight');
  let s = await snap(page);
  expect(s.site).toBe(1);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.screen).toBe('level');
  expect(s.level).toBe('roc-aux-sorciers');

  // And so can Philae, second in Egypt, with chapter 1 not done.
  await seed(page, []);
  await press(page, 'ArrowRight');
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.view).toBe('chapter');
  expect(s.chapter).toBe(1);
  expect(s.site).toBe(0);
  await press(page, 'ArrowRight');
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.screen).toBe('level');
  expect(s.level).toBe('philae');
});

test('every chapter the game shows ends on its legend, level 6, standing where level 5 stands', () => {
  for (const c of CHAPTERS) {
    expect(c.sites.length, `chapter ${c.number}`).toBe(6);
    expect(c.sites.map((s) => !!s.legend), `chapter ${c.number}`).toEqual([false, false, false, false, false, true]);
    const [five, legend] = [c.sites[4]!, c.sites[5]!];
    // Entered on foot through level 5's grand feature: the same spot, the pin nudged off it.
    expect([legend.lat, legend.lon], `chapter ${c.number}`).toEqual([five.lat, five.lon]);
    expect(legend.pin, `chapter ${c.number}`).toBeDefined();
    expect(c.monument.site, `chapter ${c.number}`).toBeLessThan(5);
  }
});

test('outside prod every built level is open by the rule the map and deep links both use', () => {
  const ids = LEVELS.map((l) => l.id);
  const progress = new Progress(ids, false);
  expect(ids.filter((id) => !progress.isOpen(id))).toEqual([]);
  expect(progress.isOpen('not-a-level')).toBe(false);
});

test('in prod the tour is played in order: a level opens once every level before it is cleared', () => {
  const ids = LEVELS.map((l) => l.id);
  const progress = new Progress(ids, true);
  expect(ids.filter((id) => progress.isOpen(id))).toEqual([ids[0]]);
  progress.markCleared(ids[0]!);
  expect(ids.filter((id) => progress.isOpen(id))).toEqual(ids.slice(0, 2));
  // Clearing a later level out of turn opens nothing past the gap but that level itself.
  progress.markCleared(ids[3]!);
  expect(ids.filter((id) => progress.isOpen(id))).toEqual([...ids.slice(0, 2), ids[3]]);
});

test('in prod the Minotaur opens once Knossos is cleared, and Persepolis once the Minotaur is', () => {
  const ids = LEVELS.map((l) => l.id);
  const progress = new Progress(ids, true);
  for (const id of ids.slice(0, ids.indexOf('knossos'))) progress.markCleared(id);
  const open = () => ['knossos', 'minotaur', 'persepolis'].filter((id) => progress.isOpen(id));
  expect(open()).toEqual(['knossos']);
  progress.markCleared('knossos');
  expect(open()).toEqual(['knossos', 'minotaur']);
  progress.markCleared('minotaur');
  expect(open()).toEqual(['knossos', 'minotaur', 'persepolis']);
});

test('in prod a visitor who cleared Persepolis before the Minotaur was on the map can still go back to it', () => {
  // A level he has cleared stays open (engine/progress.ts; designer, 2026-10-15), so a level
  // added to the tour before it never locks him out. The Minotaur itself is open: Knossos is cleared.
  const ids = LEVELS.map((l) => l.id);
  const progress = new Progress(ids, true);
  for (const id of ids) if (id !== 'minotaur') progress.markCleared(id);
  expect(progress.isCleared('persepolis')).toBe(true);
  expect(progress.isCleared('minotaur')).toBe(false);
  expect(ids.filter((id) => !progress.isOpen(id))).toEqual([]);
});

test('in prod a level he has not cleared stays locked behind the first one he has not', () => {
  // The one exception to the order is a level already cleared; nothing else past a gap opens.
  const ids = LEVELS.map((l) => l.id);
  const progress = new Progress(ids, true);
  for (const id of ids.slice(0, ids.indexOf('knossos') + 1)) progress.markCleared(id);
  expect(progress.isOpen('minotaur')).toBe(true);
  expect(progress.isOpen('persepolis')).toBe(false);
});

test('a deep link still opens a level directly, and the exit leads to the next site', async ({ page }) => {
  await page.goto('/#karnak');
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { __game?: { currentScreen: string } }).__game?.currentScreen === 'level');
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  await ticks(page, 5);
  const s = await snap(page);
  expect(s.level).toBe('karnak');
  expect(s.onGround).toBe(true);
});

test('chapter 3 opens on the Minotaur once Knossos is cleared, and its pin walks him in under its title card', async ({ page }) => {
  await seed(page, [...CHAPTER_1, ...CHAPTER_2, 'knossos']);
  await press(page, 'ArrowRight');
  await press(page, 'ArrowRight');
  await press(page, 'Enter');
  let s = await snap(page);
  expect(s.view).toBe('chapter');
  expect(s.chapter).toBe(2);
  // The next unfinished stop: the legend, sixth.
  expect(s.site).toBe(5);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.screen).toBe('level');
  expect(s.level).toBe('minotaur');
  expect(s.arriving).toBe(true);
  expect(s.x).toBeLessThan(0);
  const titled = () => page.evaluate(() => (window as unknown as { __game: { titleTimer: number } }).__game.titleTimer > 0);
  expect(await titled()).toBe(true);
  await ticks(page, 120);
  s = await snap(page);
  expect(s.arriving).toBe(false);
  expect(s.onGround).toBe(true);
  expect(s.deaths).toBe(0);

  // And the mouse, on the legend's own pin.
  await seed(page, [...CHAPTER_1, ...CHAPTER_2, 'knossos']);
  const box = await page.locator('#game').boundingBox();
  if (!box) throw new Error('no canvas');
  await press(page, 'ArrowRight');
  await press(page, 'ArrowRight');
  await press(page, 'Enter');
  const pin = await page.evaluate(() => (window as unknown as { __game: { mapScreen: { sitePin(i: number): { x: number; y: number } } } }).__game.mapScreen.sitePin(5));
  await page.mouse.click(box.x + (pin.x / 320) * box.width, box.y + (pin.y / 180) * box.height);
  await ticks(page, 1);
  s = await snap(page);
  expect(s.screen).toBe('level');
  expect(s.level).toBe('minotaur');
  expect(s.arriving).toBe(true);
});

test('chapter 3 is stamped on the world once Knossos and the Minotaur are both cleared, and not for either alone', async ({ page }) => {
  const walked = () => page.evaluate(() => (window as unknown as { __game: { mapScreen: { view: string; walked(): number } } }).__game.mapScreen.walked());
  await seed(page, [...CHAPTER_1, ...CHAPTER_2, 'knossos']);
  expect((await snap(page)).view).toBe('world');
  expect(await walked()).toBe(2);
  await seed(page, [...CHAPTER_1, ...CHAPTER_2, 'minotaur']);
  expect(await walked()).toBe(2);
  await seed(page, [...CHAPTER_1, ...CHAPTER_2, 'knossos', 'minotaur']);
  expect(await walked()).toBe(3);
});

test("Knossos's exit card leads on to the Minotaur; the Minotaur's, at the end of its chapter, to the map", async ({ page }) => {
  await page.goto('/#knossos');
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { __game?: { currentScreen: string } }).__game?.currentScreen === 'level');
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  // At the exit: the card's "Enter for the next site" or "Enter for the map" is whether there is a next.
  const done = () =>
    page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = (window as unknown as { __game: any }).__game;
      g.state = 'complete';
      return g.nextLevelIndex() !== null;
    });
  expect((await snap(page)).level).toBe('knossos');
  expect(await done()).toBe(true);
  await press(page, 'Enter');
  let s = await snap(page);
  expect(s.screen).toBe('level');
  expect(s.level).toBe('minotaur');
  expect(s.arriving).toBe(true);
  expect(await done()).toBe(false);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.screen).toBe('map');
  expect(s.view).toBe('chapter');
  expect(s.chapter).toBe(2);
  expect(s.site).toBe(5);
});

test('the itinerary ribbon is one straight rule, left to right, with every stop on it', async ({ page }) => {
  const stops = await page.evaluate((n) => {
    const m = (window as unknown as { __game: { mapScreen: { ribbonStop(i: number): { x: number; y: number } } } }).__game.mapScreen;
    return Array.from({ length: n }, (_, i) => m.ribbonStop(i));
  }, SHOWN);
  expect(stops).toHaveLength(SHOWN);
  for (let i = 1; i < stops.length; i++) {
    expect(stops[i]!.x).toBeGreaterThan(stops[i - 1]!.x);
    expect(stops[i]!.y).toBe(stops[0]!.y);
  }
  // Below the map, and inside the sheet.
  expect(stops[0]!.y).toBeGreaterThan(152);
  expect(stops[SHOWN - 1]!.x).toBeLessThan(320);
});

test('the ribbon picks a chapter and then a site, the same as the map does', async ({ page }) => {
  await seed(page, [...CHAPTER_1, 'abu-simbel', 'philae']);
  const box = await page.locator('#game').boundingBox();
  if (!box) throw new Error('no canvas');
  const at = async (p: { x: number; y: number }) => ({ x: box.x + (p.x / 320) * box.width, y: box.y + (p.y / 180) * box.height });
  const bead = (i: number) =>
    page.evaluate((i) => (window as unknown as { __game: { mapScreen: { ribbonStop(i: number): { x: number; y: number } } } }).__game.mapScreen.ribbonStop(i), i);
  const egypt = await at(await bead(1));
  await page.mouse.click(egypt.x, egypt.y);
  await ticks(page, 1);
  let s = await snap(page);
  expect(s.view).toBe('chapter');
  expect(s.chapter).toBe(1);
  // In a chapter the ribbon lists the five sites, so bead 3 is Karnak.
  const karnak = await at(await bead(2));
  await page.mouse.click(karnak.x, karnak.y);
  await ticks(page, 1);
  s = await snap(page);
  expect(s.screen).toBe('level');
  expect(s.level).toBe('karnak');
});

test('the ribbon measures progress, not where the cursor is', async ({ page }) => {
  const walked = () =>
    page.evaluate(() => (window as unknown as { __game: { mapScreen: { walked(): number } } }).__game.mapScreen.walked());
  // Nothing cleared: no rule, wherever the cursor wanders.
  expect(await walked()).toBe(0);
  await press(page, 'ArrowRight');
  await press(page, 'ArrowRight');
  await press(page, 'ArrowRight');
  expect(await walked()).toBe(0);

  // Chapter 1's five levels cleared, chapter 2's three not.
  await page.evaluate(() =>
    localStorage.setItem('lostTourist.cleared', JSON.stringify(['cap-blanc', 'roc-aux-sorciers', 'pech-merle', 'rouffignac', 'gargas'])),
  );
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { __game?: { currentScreen: string } }).__game?.currentScreen === 'map');
  expect(await walked()).toBe(1);

  // Clearing a site out of order stamps its bead but never lengthens the rule.
  await page.evaluate(() => {
    const cleared = JSON.parse(localStorage.getItem('lostTourist.cleared') ?? '[]') as string[];
    localStorage.setItem('lostTourist.cleared', JSON.stringify([...cleared, 'karnak']));
  });
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { __game?: { currentScreen: string } }).__game?.currentScreen === 'map');
  expect(await walked()).toBe(1);
  // Inside Egypt: Abu Simbel unplayed, Karnak cleared, so the rule is still nothing.
  await press(page, 'ArrowRight');
  await press(page, 'Enter');
  expect(await walked()).toBe(0);
});

test('a chapter whose every built level is cleared opens on its first site', async ({ page }) => {
  await page.evaluate(() =>
    localStorage.setItem('lostTourist.cleared', JSON.stringify(['cap-blanc', 'roc-aux-sorciers', 'pech-merle', 'rouffignac', 'gargas'])),
  );
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { __game?: { currentScreen: string } }).__game?.currentScreen === 'map');
  await press(page, 'Enter');
  const s = await snap(page);
  expect(s.view).toBe('chapter');
  expect(s.chapter).toBe(0);
  expect(s.site).toBe(0);
});

test('nothing printed on the map is ever standing where the tourist is', async ({ page }) => {
  const clashes = await page.evaluate((shown) => {
    type Rect = { x: number; y: number; w: number; h: number };
    const g = (
      window as unknown as {
        __game: {
          mapScreen: {
            view: string;
            chapter: number;
            site: number;
            current: { sites: unknown[] };
            openChapter(i: number): void;
            openWorld(): void;
            touristRect(): Rect;
            wordRects(): Rect[];
          };
        };
      }
    ).__game;
    const m = g.mapScreen;
    const hits = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const bad: string[] = [];
    const check = (where: string) => {
      const t = m.touristRect();
      for (const r of m.wordRects()) if (hits(t, r)) bad.push(where);
    };
    m.openWorld();
    for (let c = 0; c < shown; c++) {
      m.chapter = c;
      check(`world, chapter ${c + 1}`);
    }
    for (let c = 0; c < shown; c++) {
      m.openChapter(c);
      m.view = 'chapter';
      m.chapter = c;
      for (let i = 0; i < m.current.sites.length; i++) {
        m.site = i;
        check(`chapter ${c + 1}, site ${i + 1}`);
      }
    }
    m.openWorld();
    m.chapter = 0;
    return bad;
  }, SHOWN);
  expect(clashes).toEqual([]);
});

test('every chapter shows its painted plate in the panel, not the flat fallback', async ({ page }) => {
  const colours = await page.evaluate((shown) => {
    const g = (window as unknown as { __game: { mapScreen: { view: string; chapter: number }; scale: number; draw(): void } }).__game;
    const canvas = document.querySelector('#game') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const out: number[] = [];
    for (let c = 0; c < shown; c++) {
      g.mapScreen.view = 'world';
      g.mapScreen.chapter = c;
      g.draw();
      // The plate's frame in the world view, inset past its keyline.
      const s = g.scale;
      const d = ctx.getImageData((218 + 4) * s, (40 + 4) * s, (92 - 8) * s, (70 - 8) * s).data;
      const seen = new Set<number>();
      for (let i = 0; i < d.length; i += 4) seen.add((d[i]! << 16) | (d[i + 1]! << 8) | d[i + 2]!);
      out.push(seen.size);
    }
    return out;
  }, SHOWN);
  // Measured: a painted plate shows 239 to 255 colours here (its palette is
  // capped at 255); the code-drawn silhouette, antialiased at this scale, about
  // 156. 200 sits clear of both.
  for (const [i, n] of colours.entries()) expect(n, `chapter ${i + 1}`).toBeGreaterThan(200);
});

test('the world draws no line from one chapter to the next', async ({ page }) => {
  const red = await page.evaluate((shown) => {
    type P = { x: number; y: number };
    const g = (
      window as unknown as {
        __game: {
          mapScreen: { view: string; chapter: number; worldBadge(i: number): P; touristRect(): { x: number; y: number; w: number; h: number } };
          scale: number;
          draw(): void;
        };
      }
    ).__game;
    const m = g.mapScreen;
    const canvas = document.querySelector('#game') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const s = g.scale;
    const badges = Array.from({ length: shown }, (_, i) => m.worldBadge(i));
    const out: string[] = [];
    // Every chapter selected in turn, with the stretch between it and the one
    // before sampled for the route's red: clear of every marker as it is drawn
    // (the selected badge's pulse reaches 8.3, any other marker 5.9), and of the
    // tourist, whose costume may be red.
    for (let c = 1; c < shown; c++) {
      m.view = 'world';
      m.chapter = c;
      g.draw();
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const t = m.touristRect();
      const a = badges[c - 1]!;
      const b = badges[c]!;
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      let n = 0;
      for (let k = 0; k <= len * 4; k++) {
        const x = a.x + ((b.x - a.x) * k) / (len * 4);
        const y = a.y + ((b.y - a.y) * k) / (len * 4);
        if (badges.some((p, j) => Math.hypot(p.x - x, p.y - y) < (j === c ? 9 : 6.5))) continue;
        if (x > t.x - 1 && x < t.x + t.w + 1 && y > t.y - 1 && y < t.y + t.h + 1) continue;
        const i = (Math.floor(y * s) * canvas.width + Math.floor(x * s)) * 4;
        const [r, gr, bl] = [d[i]!, d[i + 1]!, d[i + 2]!];
        // The route's red has about as much green as blue; the browns and ochres
        // of land, coast and any painted sheet have far more green than blue.
        if (r - gr > 40 && Math.abs(gr - bl) < 25) n++;
      }
      if (n > 0) out.push(`chapter ${c} to ${c + 1}: ${n}`);
    }
    return out;
  }, SHOWN);
  expect(red).toEqual([]);
});

test('in a chapter every pin carries its number, the same as its bead on the ribbon', async ({ page }) => {
  // Pech Merle and Philae cleared, so a pin is seen filled for being cleared as
  // well as for being selected.
  await page.evaluate(() => localStorage.setItem('lostTourist.cleared', JSON.stringify(['pech-merle', 'philae'])));
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { __game?: { currentScreen: string } }).__game?.currentScreen === 'map');
  const printed = await page.evaluate(() => {
    type P = { x: number; y: number };
    const g = (
      window as unknown as {
        __game: {
          mapScreen: { current: { sites: { level?: string }[] }; site: number; openChapter(i: number): void; sitePin(i: number): P };
          scale: number;
          draw(): void;
        };
      }
    ).__game;
    const m = g.mapScreen;
    const ctx = (document.querySelector('#game') as HTMLCanvasElement).getContext('2d')!;
    const s = g.scale;
    const cleared = ['pech-merle', 'philae'];
    const ink: Record<string, string> = { '#f3ead4': 'card', '#8e2f2a': 'route' };
    const got: Record<string, string> = {};
    const want: Record<string, string> = {};
    const fillText = ctx.fillText.bind(ctx);
    let seen: { text: string; x: number; y: number; color: string }[] = [];
    ctx.fillText = (text: string, x: number, y: number) => {
      seen.push({ text, x, y, color: String(ctx.fillStyle) });
      fillText(text, x, y);
    };
    // Chapters 1 to 4, each with every site selected in turn. A pin is a site
    // with a level, or the selected one, and its number is card on a filled pin
    // (selected or cleared) and route red on an open one; the rest are dots with
    // no number at all.
    for (const c of [0, 1, 2, 3]) {
      m.openChapter(c);
      for (let sel = 0; sel < m.current.sites.length; sel++) {
        m.site = sel;
        seen = [];
        g.draw();
        m.current.sites.forEach((site, i) => {
          const where = `ch${c + 1} sel${sel + 1} site${i + 1}`;
          const p = m.sitePin(i);
          const here = seen.filter((w) => Math.abs(w.x - p.x * s) < 0.01 && Math.abs(w.y - (p.y + 0.3) * s) < 0.01);
          got[where] = here.map((w) => `${w.text}:${ink[w.color] ?? w.color}`).join(',') || 'dot';
          const filled = i === sel || (!!site.level && cleared.includes(site.level));
          want[where] = site.level || i === sel ? `${i + 1}:${filled ? 'card' : 'route'}` : 'dot';
        });
      }
    }
    ctx.fillText = fillText;
    return { got, want };
  });
  expect(printed.got).toEqual(printed.want);
  // Spelled out, so the rule above cannot drift into agreeing with a wrong screen.
  expect(printed.got['ch1 sel1 site1']).toBe('1:card');
  expect(printed.got['ch1 sel1 site2']).toBe('2:route');
  expect(printed.got['ch1 sel1 site3']).toBe('3:card');
  // Chapter 2 has four levels: with Abu Simbel selected, Dendera is an open pin and Saqqara a dot.
  expect(printed.got['ch2 sel1 site4']).toBe('4:route');
  expect(printed.got['ch2 sel1 site5']).toBe('dot');
  expect(printed.got['ch2 sel4 site4']).toBe('4:card');
  // Chapter 3's legend has a level: with Knossos selected, its diamond carries its 6, and
  // Tiryns, beside it, is a dot.
  expect(printed.got['ch3 sel1 site6']).toBe('6:route');
  expect(printed.got['ch3 sel1 site5']).toBe('dot');
  expect(printed.got['ch3 sel6 site6']).toBe('6:card');
  // Chapter 4 has one level: Persepolis is a pin, and its neighbours in Fars, nudged off
  // it, are dots until they are selected.
  expect(printed.got['ch4 sel1 site1']).toBe('1:card');
  expect(printed.got['ch4 sel1 site2']).toBe('dot');
  expect(printed.got['ch4 sel2 site1']).toBe('1:route');
  expect(printed.got['ch4 sel2 site2']).toBe('2:card');
});
