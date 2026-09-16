import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
// @ts-expect-error -- plain JS shared with vite.config.ts.
import { PALETTE, ROWS, SIZE, check, png, svg } from '../tools/favicon.mjs';

/**
 * The tab icon is the only drawing of the tourist that lives outside
 * src/render, so it is the only one that can go stale without anyone noticing:
 * recolour the fleece in the game and the tab keeps the old orange for ever.
 * These check that it cannot.
 * Note: content/site/favicon.md.
 */

const palette = PALETTE as Record<string, string>;
const rows = ROWS as string[];
const size = SIZE as number;

test('the favicon grid is square and every character is a colour', () => {
  expect(check()).toEqual([]);
  expect(size).toBe(16);
});

test('the favicon wears the same colours as the hiker in the game', () => {
  const src = readFileSync(new URL('../src/render/procedural.ts', import.meta.url), 'utf8');
  const block = /const HIKER: Palette = \{([\s\S]*?)\n\};/.exec(src);
  // If this ever fails, the sprite's palette was renamed or moved. Point the
  // regex at wherever it went rather than deleting the check.
  expect(block, 'HIKER palette not found in src/render/procedural.ts').not.toBeNull();

  const game: Record<string, string> = {};
  for (const m of (block?.[1] ?? '').matchAll(/^\s*(\w): '(#[0-9a-f]{6})'/gm)) {
    game[m[1] as string] = m[2] as string;
  }

  // Every colour the icon shares with the sprite, by the sprite's own key. The
  // background and the lit lens are the icon's own and are checked separately.
  for (const key of ['O', 'H', 'K', 'S', 'J', 'Z']) {
    expect(game[key], `the sprite has no '${key}'`).toBeDefined();
    expect(palette[key], `favicon '${key}' has drifted from the sprite`).toBe(game[key]);
  }
});

test('the two icon colours that are not the sprite’s are the ones the note allows', () => {
  // The page background, from index.html, so the icon is a tile of the game.
  expect(palette['.']).toBe('#0b0a08');
  // The lamp, lit: #8a8f94 under the game's own rgba(255, 244, 190, 0.45) wash.
  expect(palette.L).toBe('#fff4be');
});

test('both files draw the same picture as the grid', () => {
  const s = svg() as string;
  expect(s.startsWith('<svg')).toBe(true);
  expect(s).toContain(`viewBox="0 0 ${size} ${size}"`);
  // Nothing may smooth a pixel.
  expect(s).toContain('shape-rendering="crispEdges"');

  // Every colour in the grid reaches the SVG, and no others do.
  const inGrid = [...new Set(rows.flatMap((r) => [...r]).map((c) => palette[c]))].sort();
  const inSvg = [...new Set([...s.matchAll(/fill="(#[0-9a-f]{6})"/g)].map((m) => m[1]))].sort();
  expect(inSvg).toEqual(inGrid);

  const bytes = png(2) as Buffer;
  expect([...bytes.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  // IHDR carries the size: 32 x 32 at scale 2.
  expect(bytes.readUInt32BE(16)).toBe(size * 2);
  expect(bytes.readUInt32BE(20)).toBe(size * 2);
});

test('the page asks for the icon, and what it asks for is being served', async ({ page }) => {
  await page.goto('/');
  const links = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')].map((l) =>
      (l as HTMLLinkElement).getAttribute('href'),
    ),
  );
  expect(links).toEqual(['/favicon.svg', '/favicon.png', '/apple-touch-icon.png']);

  for (const href of links) {
    const res = await page.request.get(href as string);
    expect(res.status(), `${href} is not being served`).toBe(200);
  }
});
