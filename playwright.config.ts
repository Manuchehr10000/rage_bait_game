import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 760 },
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
