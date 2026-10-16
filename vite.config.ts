import { defineConfig, normalizePath, type Plugin } from 'vite';
// @ts-expect-error -- plain JS, and the config is the only thing that loads it.
import { png, svg, check } from './tools/favicon.mjs';
import { HELD_FILES } from './src/levels/held-files';

// Stamped into the page footer so the dev and prod links are telling the truth
// about what they are. Set by the deploy workflow; harmless when unset.
const buildEnv = process.env.BUILD_ENV ?? 'local';
const commit = (process.env.GITHUB_SHA ?? '').slice(0, 7);

/** The one address the game is supposed to be found at. */
const CANONICAL = 'https://losttourist.online/';

const isProd = buildEnv === 'prod';

/**
 * The buttons on a phone's screen (src/touch/), and what a phone needs from the page to
 * play it sideways and full screen: a manifest, and a page that may draw under the notch.
 * Every build but prod carries them until the designer has played them on a phone
 * (2026-10-16). Released by making this true; the prod build fails while it is false and
 * any of src/touch/ is in its bundle (nothingHeldInProd).
 */
const touch = !isProd;

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
 * The tools for building the game live in src/dev/ and never reach a player, and
 * nor do the levels held back from prod, nor accounts (src/account/: dev only
 * first, designer, 2026-10-16). dev and main are one history, promoted by
 * fast-forward, so their source goes to main with everything else; what must not
 * go is their code in the prod bundle. The game only reads them outside prod and
 * the bundler drops them from it. This is the check that it did: a prod bundle
 * with any of src/dev/ or src/account/, or any held level's file
 * (src/levels/held-files.ts), in it is not a build.
 */
function nothingHeldInProd(): Plugin {
  let devDir = '';
  let accountDir = '';
  let touchDir = '';
  let held: string[] = [];
  return {
    name: 'lost-tourist-nothing-held-in-prod',
    apply: 'build',

    configResolved(config) {
      const root = normalizePath(config.root);
      devDir = `${root}/src/dev/`;
      accountDir = `${root}/src/account/`;
      touchDir = `${root}/src/touch/`;
      held = HELD_FILES.map((f) => `${root}/${f}`);
    },

    // A level's file only builds its own data, its grid among it, at the top level, which
    // the bundler cannot tell from a side effect. Say so for a held one in prod, so it is
    // dropped once nothing reads it; if anything does, it stays in, and the check fails.
    transform(code, id) {
      if (isProd && held.includes(normalizePath(id))) return { code, map: null, moduleSideEffects: false };
    },

    generateBundle(_, bundle) {
      if (!isProd) return;
      const tools: string[] = [];
      const accounts: string[] = [];
      const levels: string[] = [];
      const buttons: string[] = [];
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        // A module the bundler dropped is not listed at all. Anything listed is in,
        // even at no length: a stylesheet imported from here is listed that way.
        for (const id of Object.keys(chunk.modules)) {
          const path = normalizePath(id);
          if (path.startsWith(devDir)) tools.push(id);
          if (path.startsWith(accountDir)) accounts.push(id);
          if (held.includes(path)) levels.push(id);
          if (!touch && path.startsWith(touchDir)) buttons.push(id);
        }
      }
      const leaks = [
        ...(tools.length ? [`dev tools in the prod bundle:\n  ${tools.join('\n  ')}`] : []),
        ...(accounts.length ? [`account code in the prod bundle (ACCOUNTS, src/game.ts):\n  ${accounts.join('\n  ')}`] : []),
        ...(levels.length ? [`levels held back from prod in its bundle (HELD, src/levels/index.ts):\n  ${levels.join('\n  ')}`] : []),
        ...(buttons.length ? [`touch controls held back from prod in its bundle (touch, vite.config.ts):\n  ${buttons.join('\n  ')}`] : []),
      ];
      if (leaks.length) this.error(leaks.join('\n'));
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

/**
 * What a phone needs from the page to play the game sideways and full screen, in a build
 * that carries the touch controls. The page may draw under the notch, which the controls
 * keep their buttons out of, and may not be zoomed. The manifest is what a phone opens a
 * page kept on its home screen with: full screen, sideways on Android (an iPhone ignores
 * that, and the game asks to be turned), with the tourist's head for its icon.
 */
function phone(): Plugin {
  const manifest = JSON.stringify(
    {
      name: 'Lost Tourist',
      short_name: 'Lost Tourist',
      start_url: '/',
      scope: '/',
      display: 'fullscreen',
      orientation: 'landscape',
      background_color: '#0b0a08',
      theme_color: '#0b0a08',
      icons: [
        { src: '/apple-touch-icon.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  );
  const files: Record<string, { body: Buffer | string; type: string }> = {
    'manifest.webmanifest': { body: manifest, type: 'application/manifest+json' },
    'icon-512.png': { body: png(32), type: 'image/png' },
  };
  const VIEWPORT = '<meta name="viewport" content="width=device-width, initial-scale=1.0" />';

  return {
    name: 'lost-tourist-phone',

    transformIndexHtml(html) {
      if (!touch) return html;
      if (!html.includes(VIEWPORT)) throw new Error('index.html: the viewport meta is not the one the phone plugin replaces');
      return {
        html: html.replace(
          VIEWPORT,
          '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no, viewport-fit=cover" />',
        ),
        tags: [
          { tag: 'link', attrs: { rel: 'manifest', href: '/manifest.webmanifest' }, injectTo: 'head' as const },
          { tag: 'meta', attrs: { name: 'theme-color', content: '#0b0a08' }, injectTo: 'head' as const },
          { tag: 'meta', attrs: { name: 'mobile-web-app-capable', content: 'yes' }, injectTo: 'head' as const },
          { tag: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' }, injectTo: 'head' as const },
          { tag: 'meta', attrs: { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }, injectTo: 'head' as const },
          { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: 'Lost Tourist' }, injectTo: 'head' as const },
        ],
      };
    },

    configureServer(server) {
      if (!touch) return;
      server.middlewares.use((req, res, next) => {
        const hit = files[(req.url ?? '').replace(/^\/|\?.*$/g, '')];
        if (!hit) return next();
        res.setHeader('Content-Type', hit.type);
        res.end(hit.body);
      });
    },

    generateBundle() {
      if (!touch) return;
      for (const [fileName, f] of Object.entries(files)) {
        this.emitFile({ type: 'asset', fileName, source: f.body });
      }
    },
  };
}

export default defineConfig({
  plugins: [favicon(), indexingRules(), nothingHeldInProd(), phone()],
  define: {
    __BUILD_ENV__: JSON.stringify(buildEnv),
    __COMMIT__: JSON.stringify(commit),
    __TOUCH__: JSON.stringify(touch),
  },
});
