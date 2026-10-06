import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 760 },
    // V8 compiles on the page's main thread, not in Chromium's thread pool. In
    // the pool, its compiles and the main thread can deadlock, and did on the
    // first frames of Cap Blanc, about once in eighty loads under four workers:
    // the page never answers again. On Linux the renderer looks a font up
    // through a pool thread and the main thread waits for the answer; a compile
    // that runs out of room waits for the main thread to collect garbage. With
    // every pool thread taken by such a compile (three, on four cores), each
    // waits on the other. The game does nothing wrong: setting text in a size
    // the page has not used before is all it takes. A page stuck in its own
    // endless loop still hangs its test. tests/browser.spec.ts checks that
    // these switches still take.
    launchOptions: { args: ['--js-flags=--no-concurrent-recompilation --no-concurrent-sparkplug'] },
  },
  webServer: {
    // Build first, every run, however the run was started (`npm test`, or
    // `npx playwright test` on one file), so no test can pass against a dist/
    // older than the source. Only the bundle: typecheck and the asset check are
    // their own steps. A local build, whatever BUILD_ENV the shell holds: the dev
    // tools the tests drive are not in a prod bundle. (Playwright lays this env
    // over process.env, so everything else still comes through.)
    command: 'npx vite build --logLevel warn && npx vite preview --port 4173 --strictPort',
    env: { BUILD_ENV: 'local' },
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
