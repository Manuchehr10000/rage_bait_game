import { defineConfig, type Plugin } from 'vite';

// Stamped into the page footer so the dev and prod links are telling the truth
// about what they are. Set by the deploy workflow; harmless when unset.
const buildEnv = process.env.BUILD_ENV ?? 'local';
const commit = (process.env.GITHUB_SHA ?? '').slice(0, 7);

/** The one address the game is supposed to be found at. */
const CANONICAL = 'https://losttourist.online/';

const isProd = buildEnv === 'prod';

/**
 * Two hostnames serve the same game, so exactly one of them may be indexed.
 * prod claims the canonical URL; every other build tells crawlers to keep out,
 * twice over: a meta tag in the head, and an `X-Robots-Tag` header, which
 * Cloudflare Pages reads from the `_headers` file beside the page.
 *
 * Crawling itself stays allowed even on dev. A `Disallow` in robots.txt stops
 * the crawler fetching the page at all, which means it never reads the noindex
 * and the bare URL can still surface. Let it in, then turn it away.
 */
function indexingRules(): Plugin {
  return {
    name: 'lost-tourist-indexing',
    apply: 'build',

    transformIndexHtml: () =>
      isProd
        ? [{ tag: 'link', attrs: { rel: 'canonical', href: CANONICAL }, injectTo: 'head' as const }]
        : [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' as const }],

    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: isProd
          ? 'User-agent: *\nAllow: /\n'
          : '# Not the real game. Crawl it if you like; the noindex will turn you away.\nUser-agent: *\nAllow: /\n',
      });
      if (!isProd) {
        this.emitFile({
          type: 'asset',
          fileName: '_headers',
          source: '/*\n  X-Robots-Tag: noindex, nofollow\n',
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [indexingRules()],
  define: {
    __BUILD_ENV__: JSON.stringify(buildEnv),
    __COMMIT__: JSON.stringify(commit),
  },
});
