import { expect, test, type Page } from '@playwright/test';

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

test('a closed chapter stays closed', async ({ page }) => {
  await press(page, 'ArrowLeft');
  let s = await snap(page);
  expect(s.chapter).toBe(11);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.view).toBe('world');
  expect(s.chapter).toBe(11);
});

test('arrow keys walk the chapters; Enter walks into Egypt from the left edge; Escape comes back', async ({ page }) => {
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
  expect(s.arriving).toBe(false);
  expect(s.x).toBe(24);
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
  await press(page, 'ArrowLeft');
  let s = await snap(page);
  expect(s.site).toBe(4);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.screen).toBe('map');
  await press(page, 'Escape');
  s = await snap(page);
  expect(s.view).toBe('world');
});

test('the mouse picks a chapter and a site', async ({ page }) => {
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

test('the itinerary ribbon is one straight rule, left to right, with every stop on it', async ({ page }) => {
  const stops = await page.evaluate(() => {
    const m = (window as unknown as { __game: { mapScreen: { ribbonStop(i: number): { x: number; y: number } } } }).__game.mapScreen;
    return Array.from({ length: 12 }, (_, i) => m.ribbonStop(i));
  });
  expect(stops).toHaveLength(12);
  for (let i = 1; i < stops.length; i++) {
    expect(stops[i]!.x).toBeGreaterThan(stops[i - 1]!.x);
    expect(stops[i]!.y).toBe(stops[0]!.y);
  }
  // Below the map, and inside the sheet.
  expect(stops[0]!.y).toBeGreaterThan(152);
  expect(stops[11]!.x).toBeLessThan(320);
});

test('the ribbon picks a chapter and then a site, the same as the map does', async ({ page }) => {
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
  const clashes = await page.evaluate(() => {
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
    for (let c = 0; c < 12; c++) {
      m.chapter = c;
      check(`world, chapter ${c + 1}`);
    }
    for (let c = 0; c < 12; c++) {
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
  });
  expect(clashes).toEqual([]);
});

test('every chapter shows its painted plate in the panel, not the flat fallback', async ({ page }) => {
  const colours = await page.evaluate(() => {
    const g = (window as unknown as { __game: { mapScreen: { view: string; chapter: number }; scale: number; draw(): void } }).__game;
    const canvas = document.querySelector('#game') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const out: number[] = [];
    for (let c = 0; c < 12; c++) {
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
  });
  // Measured: a painted plate shows 239 to 255 colours here (its palette is
  // capped at 255); the code-drawn silhouette, antialiased at this scale, about
  // 156. 200 sits clear of both.
  for (const [i, n] of colours.entries()) expect(n, `chapter ${i + 1}`).toBeGreaterThan(200);
});

test('the world draws no line from one chapter to the next', async ({ page }) => {
  const red = await page.evaluate(() => {
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
    const badges = Array.from({ length: 12 }, (_, i) => m.worldBadge(i));
    const out: string[] = [];
    // Every chapter selected in turn, with the stretch between it and the one
    // before sampled for the route's red: clear of every marker as it is drawn
    // (the selected badge's pulse reaches 8.3, any other marker 5.9), and of the
    // tourist, whose costume may be red.
    for (let c = 1; c < 12; c++) {
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
  });
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
    // Chapters 1 and 2, each with every site selected in turn. A pin is a site
    // with a level, or the selected one, and its number is card on a filled pin
    // (selected or cleared) and route red on an open one; the rest are dots with
    // no number at all.
    for (const c of [0, 1]) {
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
  // Chapter 2 has three levels: with Abu Simbel selected, Dendera and Saqqara are dots.
  expect(printed.got['ch2 sel1 site4']).toBe('dot');
  expect(printed.got['ch2 sel1 site5']).toBe('dot');
  expect(printed.got['ch2 sel4 site4']).toBe('4:card');
});
