import type { AdminLevel, AdminUser, AdminUserDetail, AdminUsers, ApiError, PlayEvent } from '../../server/contract';
import { HELD_FILES } from '../levels/held-files';
import { CHAPTERS } from '../map/atlas';

/**
 * The admin's tracker of the game's visitors (designer, 2026-10-27): when each account
 * was made, which levels he has played and cleared, how often he died, where and of
 * what, and where he gave up. Read from the accounts API (server/admin.ts), which only
 * answers an account ADMIN_EMAILS names. What it counts from events begins when the
 * tracker did; the deaths in all of a visitor's visits go back further.
 *
 * Its own page, admin.html, never linked from the game. It reads the tour from the
 * atlas, which names every level's site, and never from the levels themselves, so it
 * carries no level's data: a level held back from prod stays out of prod's bundle.
 */

/** The levels held back from prod, by id: every level's file is named lNN-<id>.ts (tests/map.spec.ts holds it to that). */
const HELD = new Set(HELD_FILES.map((f) => /\/l\d+-([a-z0-9-]+)\.ts$/.exec(f)?.[1]));

/** Every level the atlas names, in tour order, with its site's name. */
const ATLAS = CHAPTERS.flatMap((c) => c.sites.flatMap((s) => (s.level ? [{ id: s.level, name: s.name, chapter: c.number }] : [])));

/** The tour this build's visitors play: prod's leaves out the levels held back from it. */
const TOUR = __BUILD_ENV__ === 'prod' ? ATLAS.filter((l) => !HELD.has(l.id)) : ATLAS;

const NAME = new Map(ATLAS.map((l) => [l.id, l.name]));
/** The cause a give-up dies of (src/engine/types.ts, DeathCause). */
const GAVE_UP = 'Gave up';
const WEEK = 7 * 86_400_000;
/** Deaths within this many world px of each other are one spot. */
const SPOT = 8;

type Reply<T> = { ok: true; body: T } | { ok: false; status: number; error: string | null };

async function get<T>(path: string): Promise<Reply<T>> {
  try {
    const res = await fetch(path, { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } });
    const json = (res.headers.get('Content-Type') ?? '').includes('application/json') ? ((await res.json().catch(() => null)) as unknown) : null;
    if (res.ok && json && typeof json === 'object') return { ok: true, body: json as T };
    const error = json && typeof json === 'object' && typeof (json as ApiError).error === 'string' ? (json as ApiError).error : null;
    return { ok: false, status: res.status, error };
  } catch {
    return { ok: false, status: 0, error: null };
  }
}

// ---------------------------------------------------------------------------
// Building the page. Every word from the server goes in as text, never as markup.

type Child = Node | string | number | null | false | undefined;

/** What may go into an element, without the nothings. */
function kids(children: readonly Child[]): (Node | string)[] {
  return children.flatMap((c) => (c === null || c === false || c === undefined ? [] : [typeof c === 'number' ? String(c) : c]));
}

function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  Object.assign(e, props);
  e.append(...kids(children));
  return e;
}

function s<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, ...children: (Node | string)[]): SVGElementTagNameMap[K] {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  e.append(...children);
  return e;
}

const DATE = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const DAY_ONLY = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

function when(at: number | null): string {
  return at === null ? '—' : DATE.format(at);
}

/** How long ago, in the largest unit that says it. */
function ago(at: number | null): string {
  if (at === null) return 'never';
  const sec = Math.max(0, (Date.now() - at) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86_400) return `${Math.floor(sec / 3600)} h ago`;
  if (sec < 30 * 86_400) return `${Math.floor(sec / 86_400)} d ago`;
  return DAY_ONLY.format(at);
}

function seconds(ms: number | null): string {
  return ms === null ? '—' : `${(ms / 1000).toFixed(1)} s`;
}

function levelName(id: string): string {
  return NAME.get(id) ?? id;
}

/** The first level of the tour he has not cleared, or null when he has cleared it all. */
function nowAt(u: AdminUser): string | null {
  const done = new Set(u.cleared);
  return TOUR.find((l) => !done.has(l.id))?.id ?? null;
}

function lastDid(u: AdminUser): string {
  if (!u.last) return '—';
  const name = levelName(u.last.level);
  return { enter: `Went into ${name}`, death: `Died in ${name}`, leave: `Left ${name}`, clear: `Cleared ${name}` }[u.last.kind];
}

// ---------------------------------------------------------------------------

const root = document.getElementById('admin')!;

interface Column {
  key: string;
  label: string;
  numeric?: boolean;
  value(u: AdminUser): string | number;
  show(u: AdminUser): Child;
}

const COLUMNS: Column[] = [
  { key: 'email', label: 'Visitor', value: (u) => u.email, show: (u) => u.email },
  { key: 'created', label: 'Signed up', value: (u) => u.createdAt, show: (u) => DAY_ONLY.format(u.createdAt) },
  { key: 'via', label: 'Via', value: (u) => (u.google ? 'Google' : 'Email'), show: (u) => (u.google ? 'Google' : 'Email') },
  { key: 'seen', label: 'Last seen', value: (u) => u.lastSeen ?? 0, show: (u) => ago(u.lastSeen) },
  { key: 'last', label: 'Last did', value: (u) => u.last?.at ?? 0, show: (u) => lastDid(u) },
  {
    key: 'cleared',
    label: 'Cleared',
    numeric: true,
    value: (u) => TOUR.filter((l) => u.cleared.includes(l.id)).length,
    show: (u) => `${TOUR.filter((l) => u.cleared.includes(l.id)).length} of ${TOUR.length}`,
  },
  { key: 'at', label: 'Now at', value: (u) => TOUR.findIndex((l) => l.id === nowAt(u)), show: (u) => (nowAt(u) ? levelName(nowAt(u)!) : 'Finished') },
  { key: 'lifetime', label: 'Deaths', numeric: true, value: (u) => u.lifetime, show: (u) => u.lifetime },
  { key: 'gaveUp', label: 'Gave up', numeric: true, value: (u) => u.gaveUp, show: (u) => u.gaveUp },
  { key: 'left', label: 'Left', numeric: true, value: (u) => u.left, show: (u) => u.left },
];

let users: AdminUser[] = [];
let more = false;
let sortKey = 'created';
let sortDown = true;
let filter = '';
let selected: string | null = null;
const table = h('tbody');
const detail = h('section', { id: 'visitor' });

async function boot(): Promise<void> {
  const r = await get<AdminUsers>('/api/admin/users');
  if (!r.ok) {
    root.replaceChildren(header(), h('p', { className: 'error' }, refusal(r.status, r.error)), back());
    return;
  }
  users = r.body.users;
  more = r.body.more;
  render();
  const linked = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (linked && users.some((u) => u.id === linked)) void open(linked);
  window.addEventListener('hashchange', () => {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (id && id !== selected && users.some((u) => u.id === id)) void open(id);
  });
}

function refusal(status: number, error: string | null): string {
  if (error === 'signed_out') return 'Sign in on the game’s map first, with the admin’s address, then come back to this page.';
  if (error === 'not_admin') return 'This account is not an admin’s. ADMIN_EMAILS, in the deployment’s settings, names who is.';
  if (status === 404) return 'There is no accounts API behind this page, so there are no visitors to show. It runs where accounts do: dev, prod once its database is bound, and npm run api.';
  if (status === 0) return 'No connection. Reload to try again.';
  return `Something went wrong (${status}). Reload to try again.`;
}

function header(): HTMLElement {
  return h(
    'header',
    {},
    h('h1', {}, 'Lost Tourist · Visitors'),
    h('span', { className: 'stamp' }, [__BUILD_ENV__, __COMMIT__].filter(Boolean).join(' · ')),
  );
}

function back(): HTMLElement {
  return h('p', { className: 'muted' }, h('a', { href: '/' }, 'Back to the game'));
}

function render(): void {
  const search = h('input', { type: 'search', placeholder: 'Find a visitor by address', value: filter });
  search.addEventListener('input', () => {
    filter = search.value.trim().toLowerCase();
    fillTable();
  });
  root.replaceChildren(
    ...kids([
      header(),
      tiles(),
      h('h2', {}, 'Where they are'),
      h('p', { className: 'muted' }, 'Each level of the tour: how many have cleared it, and how many it holds now, as the first they have not.'),
      funnel(),
      h('h2', {}, 'Visitors'),
      more ? h('p', { className: 'muted' }, `The newest ${users.length} accounts.`) : null,
      search,
      h('div', { className: 'scroll' }, h('table', {}, h('thead', {}, headRow()), table)),
      detail,
      back(),
    ]),
  );
  fillTable();
}

function tiles(): HTMLElement {
  const now = Date.now();
  const tile = (n: number, label: string) => h('div', { className: 'tile' }, h('b', {}, n.toLocaleString()), h('span', {}, label));
  const sum = (f: (u: AdminUser) => number) => users.reduce((n, u) => n + f(u), 0);
  return h(
    'div',
    { className: 'tiles' },
    tile(users.length, 'Accounts'),
    tile(users.filter((u) => now - u.createdAt < WEEK).length, 'New this week'),
    tile(users.filter((u) => u.lastSeen !== null && now - u.lastSeen < WEEK).length, 'Played this week'),
    tile(users.filter((u) => u.google).length, 'Via Google'),
    tile(users.filter((u) => nowAt(u) === null).length, 'Finished the tour'),
    tile(sum((u) => u.lifetime), 'Deaths in all'),
    tile(sum((u) => u.gaveUp), 'Gave up'),
    tile(sum((u) => u.left), 'Left a level'),
  );
}

function funnel(): HTMLElement {
  const most = Math.max(1, users.length);
  const bar = (n: number, lost = false) => {
    const b = h('span', { className: lost ? 'bar lost' : 'bar' });
    b.style.width = `${Math.round((n / most) * 160)}px`;
    return b;
  };
  const rows = TOUR.map((l, i) => {
    const cleared = users.filter((u) => u.cleared.includes(l.id)).length;
    const here = users.filter((u) => nowAt(u) === l.id).length;
    return h(
      'tr',
      {},
      h('td', { className: 'n' }, i + 1),
      h('td', {}, l.name, h('span', { className: 'muted' }, ` · ch. ${l.chapter}`)),
      h('td', { className: 'n' }, cleared),
      h('td', {}, bar(cleared)),
      h('td', { className: 'n' }, here),
      h('td', {}, bar(here, true)),
    );
  });
  const done = users.filter((u) => nowAt(u) === null).length;
  rows.push(h('tr', {}, h('td'), h('td', { className: 'muted' }, 'Finished'), h('td'), h('td'), h('td', { className: 'n' }, done), h('td', {}, bar(done, true))));
  return h(
    'div',
    { className: 'scroll' },
    h(
      'table',
      {},
      h('thead', {}, h('tr', {}, h('th', { className: 'n' }, '#'), h('th', {}, 'Level'), h('th', { className: 'n' }, 'Cleared by'), h('th'), h('th', { className: 'n' }, 'Now here'), h('th'))),
      h('tbody', {}, ...rows),
    ),
  );
}

function headRow(): HTMLTableRowElement {
  return h(
    'tr',
    {},
    ...COLUMNS.map((c) => {
      const b = h('button', { type: 'button', className: c.key === sortKey ? 'on' : '' }, c.label, c.key === sortKey ? (sortDown ? ' ↓' : ' ↑') : '');
      b.addEventListener('click', () => {
        sortDown = c.key === sortKey ? !sortDown : c.numeric === true || c.key === 'created' || c.key === 'seen' || c.key === 'last';
        sortKey = c.key;
        render();
      });
      return h('th', { className: c.numeric ? 'n' : '' }, b);
    }),
  );
}

function fillTable(): void {
  const col = COLUMNS.find((c) => c.key === sortKey) ?? COLUMNS[1]!;
  const list = users.filter((u) => !filter || u.email.includes(filter));
  list.sort((a, b) => {
    const x = col.value(a);
    const y = col.value(b);
    const d = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
    return sortDown ? -d : d;
  });
  table.replaceChildren(
    ...list.map((u) => {
      const tr = h('tr', { className: u.id === selected ? 'row on' : 'row' }, ...COLUMNS.map((c) => h('td', { className: c.numeric ? 'n' : '' }, c.show(u))));
      tr.addEventListener('click', () => void open(u.id));
      return tr;
    }),
  );
  if (!list.length) table.append(h('tr', {}, h('td', { colSpan: COLUMNS.length, className: 'muted' }, users.length ? 'No one by that address.' : 'No accounts yet.')));
}

/** One visitor, level by level, under the table. */
async function open(id: string): Promise<void> {
  selected = id;
  fillTable();
  try {
    history.replaceState(null, '', `#${encodeURIComponent(id)}`);
  } catch {
    /* fine */
  }
  detail.replaceChildren(h('h2', {}, 'Visitor'), h('p', { className: 'muted' }, 'Loading…'));
  detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const r = await get<AdminUserDetail>(`/api/admin/user?id=${encodeURIComponent(id)}`);
  if (selected !== id) return;
  if (!r.ok) {
    detail.replaceChildren(h('h2', {}, 'Visitor'), h('p', { className: 'error' }, refusal(r.status, r.error)));
    return;
  }
  detail.replaceChildren(...kids(visitor(r.body)));
}

function visitor(d: AdminUserDetail): Child[] {
  const u = d.user;
  const order = new Map(ATLAS.map((l, i) => [l.id, i]));
  const levels = [...d.levels].sort((a, b) => (order.get(a.level) ?? 999) - (order.get(b.level) ?? 999) || a.level.localeCompare(b.level));
  const at = nowAt(u);
  return [
    h('h2', {}, 'Visitor'),
    h('h3', {}, u.email),
    h(
      'p',
      { className: 'muted' },
      `Signed up ${when(u.createdAt)} with ${u.google ? 'Google' : 'a code by email'} · last seen ${ago(u.lastSeen)} · ${u.lifetime} deaths in all · `,
      at ? `now at ${levelName(at)}` : 'has cleared the whole tour',
    ),
    h('p', { className: 'muted' }, `Account ${u.id}. Visits, deaths, give-ups and clears below are counted from the tracker\u2019s events, since it began; deaths in all go back further.`),
    levels.length ? levelTable(levels) : h('p', { className: 'muted' }, 'Nothing played since the tracker began.'),
    ...levels.filter((l) => l.points.length).map(deathsIn),
    h('h3', {}, 'Latest events'),
    d.events.length ? timeline(d.events) : h('p', { className: 'muted' }, 'No events yet.'),
    d.more ? h('p', { className: 'muted' }, `The newest ${d.events.length} events.`) : null,
  ];
}

function levelTable(levels: AdminLevel[]): HTMLElement {
  const head = ['Level', 'Visits', 'Deaths', 'Gave up', 'Left', 'Clears', 'Best clear', 'First cleared', 'Tricks met'];
  const numeric = new Set(['Visits', 'Deaths', 'Gave up', 'Left', 'Clears', 'Best clear']);
  return h(
    'div',
    { className: 'scroll' },
    h(
      'table',
      {},
      h('thead', {}, h('tr', {}, ...head.map((t) => h('th', { className: numeric.has(t) ? 'n' : '' }, t)))),
      h(
        'tbody',
        {},
        ...levels.map((l) =>
          h(
            'tr',
            {},
            h('td', {}, levelName(l.level)),
            h('td', { className: 'n' }, l.visits),
            h('td', { className: 'n' }, l.deaths),
            h('td', { className: 'n' }, l.gaveUp),
            h('td', { className: 'n' }, l.left),
            h('td', { className: 'n' }, l.clears),
            h('td', { className: 'n' }, seconds(l.bestMs)),
            h('td', {}, when(l.clearedAt)),
            h('td', { className: 'wrap' }, l.tricks.join(', ') || '—'),
          ),
        ),
      ),
    ),
  );
}

/** A level's deaths: by cause, where on the level as a scatter, and the spots he died at most, as the dev ruler names them. */
function deathsIn(l: AdminLevel): HTMLElement {
  const causes = l.causes.map((c) => `${c.cause} ${c.n}`).join(' · ');
  return h(
    'div',
    { className: 'level' },
    h('h3', {}, `${levelName(l.level)} `, h('span', { className: 'muted' }, `· ${l.deaths} deaths`)),
    h('p', { className: 'muted' }, causes),
    scatter(l),
    h('div', { className: 'legend' }, 'X along the level, Y up from the floor the tourist spawns on.', h('i'), 'a death', h('i', { className: 'lost' }), 'gave up'),
    spots(l),
  );
}

function scatter(l: AdminLevel): SVGSVGElement {
  const xs = l.points.map((p) => p.x);
  const ys = l.points.map((p) => p.y);
  const x0 = Math.min(0, ...xs) - SPOT;
  const x1 = Math.max(...xs) + SPOT;
  const y0 = Math.min(0, ...ys) - SPOT;
  const y1 = Math.max(0, ...ys) + SPOT;
  const W = 640;
  const scale = W / Math.max(1, x1 - x0);
  const H = Math.round(Math.min(240, Math.max(60, (y1 - y0) * scale)));
  const sy = H / Math.max(1, y1 - y0);
  const px = (x: number) => ((x - x0) * scale).toFixed(1);
  const py = (y: number) => ((y1 - y) * sy).toFixed(1);
  return s(
    'svg',
    { class: 'deaths', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Deaths in ${levelName(l.level)}` },
    // The floor the tourist spawns on.
    s('line', { x1: 0, x2: W, y1: py(0), y2: py(0), stroke: '#3a352b', 'stroke-dasharray': '3 3' }),
    ...l.points.map((p) =>
      s(
        'circle',
        { cx: px(p.x), cy: py(p.y), r: 3.5, fill: p.cause === GAVE_UP ? '#d0644f' : '#cfc6b0', 'fill-opacity': 0.55 },
        s('title', {}, `${l.level} (${p.x}, ${p.y}) ${p.cause}`),
      ),
    ),
  );
}

function spots(l: AdminLevel): HTMLElement {
  const by = new Map<string, { x: number; y: number; n: number; causes: Set<string> }>();
  for (const p of l.points) {
    const x = Math.round(p.x / SPOT) * SPOT;
    const y = Math.round(p.y / SPOT) * SPOT;
    const key = `${x},${y}`;
    const spot = by.get(key) ?? { x, y, n: 0, causes: new Set<string>() };
    spot.n += 1;
    spot.causes.add(p.cause);
    by.set(key, spot);
  }
  const top = [...by.values()].sort((a, b) => b.n - a.n).slice(0, 8);
  return h(
    'ul',
    { className: 'spots' },
    ...top.map((t) => h('li', {}, h('code', {}, `${l.level} (${t.x}, ${t.y})`), ` × ${t.n} · ${[...t.causes].join(', ')}`)),
  );
}

function timeline(events: PlayEvent[]): HTMLElement {
  const what = (e: PlayEvent): string => {
    switch (e.kind) {
      case 'enter':
        return 'Went in';
      case 'death':
        return `${e.cause === GAVE_UP ? 'Gave up' : `Died: ${e.cause}`} at (${e.x}, ${e.y}), ${seconds(e.ms)} in`;
      case 'leave':
        return `Left for the map, after ${e.deaths} ${e.deaths === 1 ? 'death' : 'deaths'}`;
      case 'clear':
        return `Cleared in ${seconds(e.ms)}, after ${e.deaths} ${e.deaths === 1 ? 'death' : 'deaths'}`;
    }
  };
  return h(
    'div',
    { className: 'scroll' },
    h(
      'table',
      {},
      h('thead', {}, h('tr', {}, h('th', {}, 'When'), h('th', {}, 'Level'), h('th', {}, 'What'))),
      h('tbody', {}, ...events.map((e) => h('tr', {}, h('td', {}, when(e.at)), h('td', {}, levelName(e.level)), h('td', {}, what(e))))),
    ),
  );
}

void boot();
