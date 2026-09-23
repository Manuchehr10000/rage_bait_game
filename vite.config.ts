import { defineConfig, type Plugin } from 'vite';
// @ts-expect-error -- plain JS, and the config is the only thing that loads it.
import { png, svg, check } from './tools/favicon.mjs';

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

/**
 * The tools for building the game live in src/dev/ and never reach a player.
 * dev and main are one history, promoted by fast-forward, so the source goes to
 * main with everything else; what must not go is the code in the prod bundle.
 * The game only makes them outside prod and the bundler drops them from it.
 * This is the check that it did: a prod bundle with any of src/dev/ in it is
 * not a build.
 */
function noDevToolsInProd(): Plugin {
  return {
    name: 'lost-tourist-no-dev-tools',
    apply: 'build',

    generateBundle(_, bundle) {
      if (!isProd) return;
      const leaked: string[] = [];
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        for (const [id, m] of Object.entries(chunk.modules)) {
          if (id.replace(/\\/g, '/').includes('/src/dev/') && m.renderedLength > 0) leaked.push(id);
        }
      }
      if (leaked.length) this.error(`dev tools in the prod bundle:\n  ${leaked.join('\n  ')}`);
    },
  };
}

/**
 * The tab icon, drawn from the same grid and the same palette as the tourist
 * himself — see tools/favicon.mjs. Three files, because browsers do not agree:
 * an SVG, which everything modern prefers and which stays sharp at any size;
 * a 32 px PNG for Safari and anything older; and a big one for a phone that
 * has been told to keep the page on its home screen.
 *
 * They are generated rather than committed so there is one source for the art,
 * and the dev server serves the same bytes the build emits.
 */
function favicon(): Plugin {
  const bad: string[] = check();
  if (bad.length) throw new Error(`favicon art is malformed:\n  ${bad.join('\n  ')}`);

  const files: Record<string, { body: Buffer | string; type: string }> = {
    'favicon.svg': { body: svg(), type: 'image/svg+xml' },
    'favicon.png': { body: png(2), type: 'image/png' },
    'apple-touch-icon.png': { body: png(12), type: 'image/png' },
  };

  return {
    name: 'lost-tourist-favicon',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const hit = files[(req.url ?? '').replace(/^\/|\?.*$/g, '')];
        if (!hit) return next();
        res.setHeader('Content-Type', hit.type);
        res.end(hit.body);
      });
    },

    generateBundle() {
      for (const [fileName, f] of Object.entries(files)) {
        this.emitFile({ type: 'asset', fileName, source: f.body });
      }
    },
  };
}

export default defineConfig({
  plugins: [favicon(), indexingRules(), noDevToolsInProd()],
  define: {
    __BUILD_ENV__: JSON.stringify(buildEnv),
    __COMMIT__: JSON.stringify(commit),
  },
});
