import { defineConfig } from 'vite';

// Stamped into the page footer so the dev and prod links are telling the truth
// about what they are. Set by the deploy workflow; harmless when unset.
const buildEnv = process.env.BUILD_ENV ?? 'local';
const commit = (process.env.GITHUB_SHA ?? '').slice(0, 7);

export default defineConfig({
  define: {
    __BUILD_ENV__: JSON.stringify(buildEnv),
    __COMMIT__: JSON.stringify(commit),
  },
});
