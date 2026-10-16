import { defineConfig } from '@playwright/test';

/**
 * The accounts tests (tests/accounts.spec.ts) play against the real API under
 * `wrangler pages dev`, with a local D1, and a stand-in for the world outside it:
 * Resend's email API, Google's keys and a signer for test ID tokens
 * (tests/support/providers.mjs). Every variable the API reads is set here, the
 * limits on codes sent far above what one machine's tests send.
 */
const PROVIDERS = 'http://localhost:8790';
const API_VARS: Record<string, string> = {
  GOOGLE_CLIENT_ID: 'test-client.apps.googleusercontent.com',
  RESEND_API_KEY: 'test',
  EMAIL_FROM: 'Lost Tourist <tickets@example.test>',
  EMAIL_API_URL: `${PROVIDERS}/emails`,
  GOOGLE_JWKS_URL: `${PROVIDERS}/jwks`,
  EMAIL_DAILY_CAP: '100000',
  EMAIL_IP_HOURLY: '100000',
};

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
  // Started one after another, in this order, each once the one before answers
  // (Playwright 1.56 sets its web servers up in turn): the accounts build below
  // never overlaps the game's, and has its own folder all the same.
  webServer: [
    {
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
    {
      name: 'providers',
      command: 'node tests/support/providers.mjs',
      url: `${PROVIDERS}/health`,
      reuseExistingServer: false,
      timeout: 10_000,
    },
    {
      // The same local build, served with the API. Its database starts empty every
      // run. Wrangler is run from a folder of its own under .wrangler/e2e, holding
      // only a link to functions/, because it reads .dev.vars from the folder it is
      // run in, and the one at the root (npm run api) would win over these bindings.
      name: 'api',
      command: [
        'rm -rf .wrangler/e2e',
        'mkdir -p .wrangler/e2e/site',
        'ln -s ../../../functions .wrangler/e2e/site/functions',
        'npx vite build --outDir dist-accounts --emptyOutDir --logLevel warn',
        'cd .wrangler/e2e/site',
        [
          'npx wrangler pages dev ../../../dist-accounts --port 8788 --d1 DB --persist-to ../state',
          '--compatibility-date 2025-09-01 --show-interactive-dev-session=false',
          ...Object.entries(API_VARS).map(([k, v]) => `--binding '${k}=${v}'`),
        ].join(' '),
      ].join(' && '),
      env: { BUILD_ENV: 'local', WRANGLER_SEND_METRICS: 'false' },
      // The API itself, not only the page: it answers once the Function is up.
      url: 'http://localhost:8788/api/me',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
