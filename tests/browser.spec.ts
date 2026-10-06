import { expect, test } from '@playwright/test';

/**
 * The browser the tests run in, set up the way playwright.config.ts says: V8
 * compiles on the page's main thread and never in Chromium's thread pool. In the
 * pool, a compile waiting for the main thread and a font lookup waiting for the
 * pool hang the page for good, about once in eighty loads of Cap Blanc under four
 * workers. V8 skips a switch it does not know, so a browser update that renamed
 * one would bring the hang back without a word. This is the word.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type W = Window & { __game: any };

interface TraceEvent {
  name: string;
  ph: string;
  pid: number;
  tid: number;
  args?: { name?: string };
}

test("V8 optimises the game on the page's main thread, never in the thread pool", async ({ browser, page }) => {
  await browser.startTracing(page, { categories: ['__metadata', 'v8', 'disabled-by-default-v8.compile'] });
  await page.goto('/#cap-blanc');
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.levelData.id === 'cap-blanc');
  // Hot enough, at any frame rate, for V8 to optimise what a frame runs.
  await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    for (let i = 0; i < 600; i++) {
      g.tick();
      if (i % 10 === 0) g.draw();
    }
  });
  const trace = JSON.parse((await browser.stopTracing()).toString()) as { traceEvents: TraceEvent[] };

  const thread = new Map<string, string>();
  for (const e of trace.traceEvents) if (e.ph === 'M' && e.name === 'thread_name') thread.set(`${e.pid}:${e.tid}`, e.args?.name ?? '');
  const on = (e: TraceEvent) => thread.get(`${e.pid}:${e.tid}`) ?? '';
  // Maglev and Turbofan: V8.Maglev*, V8.TF*, V8.Turbofan*, V8.Optimize*.
  const optimising = trace.traceEvents.filter((e) => e.ph === 'X' && /^V8\.(Maglev|TF|Turbofan|Optimize)/.test(e.name));

  expect(optimising.filter((e) => on(e) === 'CrRendererMain').length, 'the trace sees V8 optimise at all').toBeGreaterThan(0);
  expect(optimising.filter((e) => on(e).startsWith('ThreadPool')).map((e) => e.name), 'optimised in the thread pool').toEqual([]);
  // Sparkplug: a batch compiled in the pool is finished on the main thread under this name.
  expect(trace.traceEvents.filter((e) => e.name === 'V8.FinalizeBaselineConcurrentCompilation').length, 'Sparkplug compiled in the thread pool').toBe(0);
});
