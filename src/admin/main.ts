import type { AdminEveryone, AdminGuest, AdminGuestDetail, AdminLevel, AdminSpots, AdminUser, AdminUserDetail, AdminUsers, ApiError, PlayEvent } from '../../server/contract';
import { HELD_FILES } from '../levels/held-files';
import { CHAPTERS } from '../map/atlas';

/**
 * The admin's tracker of the game's visitors (designer, 2026-10-27): when each account
 * was made, which levels he has played and cleared, how often he died, where and of
 * what, and where he gave up; and since the designer's word of 2026-11-03, the guests as
 * well, and how many of the visitors went on to sign in. Read from the accounts API
 * (server/admin.ts), which only answers an account ADMIN_EMAILS names. What it counts
 * from events begins when the tracker did; the deaths in all of a visitor's visits go
 * back further.
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
/** Deaths are counted by the nearest point of a grid this many world px apart, which names the spot. */
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
/** A day the counts keep, which begins at midnight UTC. */
const UTC_DAY = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' });
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

/** Someone in the table: an account, or a guest, as one row. */
interface Visitor {
  kind: 'account' | 'guest';
  id: string;
  /** The address, or the guest's id in short. */
  name: string;
  /** The account made, or the guest first heard of. */
  since: number;
  via: 'Google' | 'Email' | 'Guest';
  lastSeen: number | null;
  last: AdminUser['last'];
  cleared: string[];
  lifetime: number;
  gaveUp: number;
  left: number;
}

/** A guest, as the page names him: by the start of his visitor's id, which is only his browser's. */
function guestName(id: string): string {
  return `Guest ${id.slice(0, 6)}`;
}

function ofAccount(u: AdminUser): Visitor {
  const via = u.google ? 'Google' : 'Email';
  return { kind: 'account', id: u.id, name: u.email, since: u.createdAt, via, lastSeen: u.lastSeen, last: u.last, cleared: u.cleared, lifetime: u.lifetime, gaveUp: u.gaveUp, left: u.left };
}

function ofGuest(g: AdminGuest): Visitor {
  return { kind: 'guest', id: g.id, name: guestName(g.id), since: g.firstSeen, via: 'Guest', lastSeen: g.lastSeen, last: g.last, cleared: g.cleared, lifetime: g.lifetime, gaveUp: g.gaveUp, left: g.left };
}

/** What the address names him by: a guest's is marked, as an account's id never holds a colon. */
function keyOf(v: Pick<Visitor, 'kind' | 'id'>): string {
  return v.kind === 'guest' ? `guest:${v.id}` : v.id;
}

/** The first level of the tour not in `cleared`, or null when it holds the whole tour. */
function firstUncleared(cleared: readonly string[]): string | null {
  const done = new Set(cleared);
  return TOUR.find((l) => !done.has(l.id))?.id ?? null;
}

function nowAt(v: Pick<Visitor, 'cleared'>): string | null {
  return firstUncleared(v.cleared);
}

function lastDid(v: Visitor): string {
  if (!v.last) return '—';
  const name = levelName(v.last.level);
  return { enter: `Went into ${name}`, death: `Died in ${name}`, leave: `Left ${name}`, clear: `Cleared ${name}` }[v.last.kind];
}

function share(n: number, of: number): string {
  return of > 0 ? `${Math.round((n / of) * 100)}%` : '—';
}

// ---------------------------------------------------------------------------

const root = document.getElementById('admin')!;

interface Column {
  key: string;
  label: string;
  numeric?: boolean;
  value(v: Visitor): string | number;
  show(v: Visitor): Child;
}

const COLUMNS: Column[] = [
  { key: 'name', label: 'Visitor', value: (v) => v.name, show: (v) => (v.kind === 'guest' ? h('span', { className: 'muted' }, v.name) : v.name) },
  { key: 'since', label: 'Since', value: (v) => v.since, show: (v) => DAY_ONLY.format(v.since) },
  { key: 'via', label: 'Via', value: (v) => v.via, show: (v) => v.via },
  { key: 'seen', label: 'Last seen', value: (v) => v.lastSeen ?? 0, show: (v) => ago(v.lastSeen) },
  { key: 'last', label: 'Last did', value: (v) => v.last?.at ?? 0, show: (v) => lastDid(v) },
  {
    key: 'cleared',
    label: 'Cleared',
    numeric: true,
    value: (v) => TOUR.filter((l) => v.cleared.includes(l.id)).length,
    show: (v) => `${TOUR.filter((l) => v.cleared.includes(l.id)).length} of ${TOUR.length}`,
  },
  {
    key: 'at',
    label: 'Now at',
    // Finished is past the last level, not before the first.
    value: (v) => {
      const at = nowAt(v);
      return at === null ? TOUR.length : TOUR.findIndex((l) => l.id === at);
    },
    show: (v) => (nowAt(v) ? levelName(nowAt(v)!) : 'Finished'),
  },
  { key: 'lifetime', label: 'Deaths', numeric: true, value: (v) => v.lifetime, show: (v) => v.lifetime },
  { key: 'gaveUp', label: 'Gave up', numeric: true, value: (v) => v.gaveUp, show: (v) => v.gaveUp },
  { key: 'left', label: 'Left', numeric: true, value: (v) => v.left, show: (v) => v.left },
];

/** Which of them the table shows. */
type Who = 'everyone' | 'accounts' | 'guests';

let data: AdminUsers | null = null;
let visitors: Visitor[] = [];
let sortKey = 'since';
let sortDown = true;
let filter = '';
let who: Who = 'everyone';
let selected: string | null = null;
const table = h('tbody');
const detail = h('section', { id: 'visitor' });

async function boot(): Promise<void> {
  const r = await get<AdminUsers>('/api/admin/users');
  if (!r.ok) {
    root.replaceChildren(header(), h('p', { className: 'error' }, refusal(r.status, r.error)), back());
    return;
  }
  data = r.body;
  visitors = [...data.users.map(ofAccount), ...(data.guests ?? []).map(ofGuest)];
  render();
  // Whoever the address names, listed or not: an older guest is past the newest thousand, and still there.
  const linked = (): string => {
    try {
      return decodeURIComponent(location.hash.replace(/^#/, ''));
    } catch {
      return '';
    }
  };
  if (linked()) void open(linked());
  window.addEventListener('hashchange', () => {
    const key = linked();
    if (key && key !== selected) void open(key);
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
  const d = data!;
  const search = h('input', { type: 'search', placeholder: 'Find a visitor by address, or a guest by id', value: filter });
  search.addEventListener('input', () => {
    filter = search.value.trim().toLowerCase();
    fillTable();
  });
  const choose = h(
    'select',
    { className: 'who', ariaLabel: 'Who the table shows' },
    ...(['everyone', 'accounts', 'guests'] as const).map((w) => h('option', { value: w, selected: w === who }, { everyone: 'Everyone', accounts: 'Accounts', guests: 'Guests' }[w])),
  );
  choose.addEventListener('change', () => {
    who = choose.value as Who;
    fillTable();
  });
  const t = d.totals;
  const e = t.everyone;
  root.replaceChildren(
    ...kids([
      header(),
      h('h2', {}, 'Everyone'),
      h(
        'p',
        { className: 'muted' },
        e.since === null
          ? 'Nothing counted yet. Everyone who opens the game is counted here, whatever they answer to recording: anonymously, with no id and no cookie.'
          : `Everyone who opened the game since ${UTC_DAY.format(e.since)} (UTC), whatever they answered to recording: anonymous counts, with no id and no cookie, so a page opened twice is two.`,
      ),
      tileRow([
        [e.opens, 'Page opens'],
        [e.opensWeek, 'Opens this week'],
        [e.levels.reduce((n, l) => n + l.enters, 0), 'Level entries'],
        [e.levels.reduce((n, l) => n + l.deaths, 0), 'Deaths'],
        [share(e.yes, e.yes + e.no), 'Of answers, yes', `${e.yes} yes, ${e.no} no: answers given, so one who changes his mind counts again, and one who never answers is not counted`],
      ]),
      everyoneTable(e),
      h('h2', {}, 'Visitors who said yes'),
      h(
        'p',
        { className: 'muted' },
        t.since === null
          ? 'No visitor yet. A visitor is a browser that said yes to recording: a guest until it signs in, and its account from then on.'
          : `Browsers that said yes to recording, since ${DAY_ONLY.format(t.since)}: each a guest until it signs in, and its account from then on. A visitor is a browser, not a person: one account on two devices is two visitors, and so is a browser that played as a guest between two sign-ins; one who clears the browser is a new one. How many come back is by the days (UTC) each opened the game.`,
      ),
      tileRow([
        [t.visitors, 'Visitors'],
        [t.played, 'Played as a guest', 'Went into a level before signing in, or without ever signing in'],
        [t.signedIn, 'Came as guests, signed in', `Of the ${t.cameAsGuests} that came as guests`],
        [share(t.signedIn, t.cameAsGuests), 'Of guests signed in'],
        [share(t.playedSignedIn, t.played), 'Of players signed in', `${t.playedSignedIn} of the ${t.played} that played as a guest went on to sign in`],
        [share(t.returns.cameBack, t.returns.cohort), 'Came back', `${t.returns.cameBack} of the ${t.returns.cohort} first seen before today came again on another day`],
        [share(t.returns.nextDay, t.returns.cohortDay), 'Back the next day', `${t.returns.nextDay} of the ${t.returns.cohortDay} first seen before yesterday came again the day after`],
        [share(t.returns.week, t.returns.cohortWeek), 'Back within a week', `${t.returns.week} of the ${t.returns.cohortWeek} whose first week is over came again within it`],
      ]),
      h('h2', {}, 'Accounts and guests'),
      h(
        'p',
        { className: 'muted' },
        'Every account, and every guest who said yes. Deaths in all come from each tour, kept for every account; give-ups, leaves, and each one\u2019s play below, only from what was recorded with a yes.',
      ),
      tiles(),
      h('h2', {}, 'Where they are'),
      h('p', { className: 'muted' }, 'Each level of the tour: how many have cleared it, and how many it holds now, as the first they have not. Accounts, and guests who said yes.'),
      funnel(),
      h('h2', {}, 'Visitors'),
      d.more ? h('p', { className: 'muted' }, `The newest ${d.users.length} accounts.`) : null,
      d.moreGuests ? h('p', { className: 'muted' }, `The newest ${d.guests.length} guests.`) : null,
      h('div', { className: 'find' }, search, choose),
      h('div', { className: 'scroll' }, h('table', {}, h('thead', {}, headRow()), table)),
      detail,
      back(),
    ]),
  );
  fillTable();
}

function tileRow(items: [number | string, string, string?][]): HTMLElement {
  return h(
    'div',
    { className: 'tiles' },
    ...items.map(([n, label, title = '']) => h('div', { className: 'tile', title }, h('b', {}, typeof n === 'number' ? n.toLocaleString() : n), h('span', {}, label))),
  );
}

function tiles(): HTMLElement {
  const t = data!.totals;
  const finished = t.tours.filter((x) => firstUncleared(x.cleared) === null).reduce((n, x) => n + x.accounts + x.guests, 0);
  return tileRow([
    [t.accounts, 'Accounts'],
    [t.guests, 'Guests', 'Visitors that said yes and have not signed in'],
    [t.accountsNew + t.guestsNew, 'New this week', 'Accounts made, and guests first seen, in the last seven days'],
    [t.accountsSeen + t.guestsSeen, 'Seen this week', 'Accounts and guests heard from in the last seven days'],
    [t.google, 'Via Google'],
    [finished, 'Finished the tour'],
    [t.deaths, 'Deaths in all'],
    [t.gaveUp, 'Gave up'],
    [t.left, 'Left a level'],
  ]);
}

/** Everyone's play level by level, from the anonymous counts; a level opens where everyone died in it. */
function everyoneTable(e: AdminEveryone): HTMLElement {
  const order = new Map(ATLAS.map((l, i) => [l.id, i]));
  const levels = [...e.levels].sort((a, b) => (order.get(a.level) ?? 999) - (order.get(b.level) ?? 999) || a.level.localeCompare(b.level));
  const head = ['Level', 'Entries', 'Deaths', 'Gave up', 'Left', 'Cleared', 'Cleared, of entries', 'Most deaths'];
  const numeric = new Set(head.slice(1, 7));
  const spots = h('div', { id: 'everyone-spots' });
  const rows = levels.map((l) => {
    const tr = h(
      'tr',
      { className: 'row' },
      h('td', {}, levelName(l.level)),
      h('td', { className: 'n' }, l.enters),
      h('td', { className: 'n' }, l.deaths),
      h('td', { className: 'n' }, l.gaveUp),
      h('td', { className: 'n' }, l.left),
      h('td', { className: 'n' }, l.clears),
      h('td', { className: 'n' }, share(l.clears, l.enters)),
      h('td', { className: 'wrap' }, l.causes.slice(0, 3).map((c) => `${c.cause} ${c.n}`).join(' · ') || '—'),
    );
    tr.addEventListener('click', () => void openSpots(l.level, l.deaths, spots));
    return tr;
  });
  return h(
    'div',
    {},
    h(
      'div',
      { className: 'scroll' },
      h(
        'table',
        {},
        h('thead', {}, h('tr', {}, ...head.map((t) => h('th', { className: numeric.has(t) ? 'n' : '' }, t)))),
        h('tbody', {}, ...rows, ...(rows.length ? [] : [h('tr', {}, h('td', { colSpan: head.length, className: 'muted' }, 'Nothing played yet.'))])),
      ),
    ),
    spots,
  );
}

/** Where everyone died in a level, from the anonymous counts: a scatter sized by how many, and the spots with the most. */
async function openSpots(level: string, deaths: number, into: HTMLElement): Promise<void> {
  into.replaceChildren(h('p', { className: 'muted' }, 'Loading…'));
  const r = await get<AdminSpots>(`/api/admin/spots?level=${encodeURIComponent(level)}`);
  if (!r.ok) {
    into.replaceChildren(h('p', { className: 'error' }, refusal(r.status, r.error)));
    return;
  }
  const { spots, more } = r.body;
  into.replaceChildren(
    ...kids([
      h('h3', {}, `${levelName(level)} `, h('span', { className: 'muted' }, `· where everyone died, ${deaths} deaths`)),
      spots.length ? spotsScatter(level, spots) : h('p', { className: 'muted' }, 'No deaths counted here.'),
      spots.length ? h('div', { className: 'legend' }, 'X along the level, Y up from the floor the tourist spawns on; the bigger, the more.', h('i'), 'a death', h('i', { className: 'lost' }), 'gave up') : null,
      more ? h('p', { className: 'muted' }, `The ${spots.length} spots with the most.`) : null,
      spots.length
        ? h(
            'ul',
            { className: 'spots' },
            ...spots.slice(0, 8).map((p) => h('li', {}, h('code', {}, `${level} (${p.x}, ${p.y})`), ` × ${p.n} · ${p.cause}`)),
          )
        : null,
    ]),
  );
}

function spotsScatter(level: string, spots: AdminSpots['spots']): SVGSVGElement {
  const xs = spots.map((p) => p.x);
  const ys = spots.map((p) => p.y);
  const x0 = Math.min(0, ...xs) - SPOT;
  const x1 = Math.max(...xs) + SPOT;
  const y0 = Math.min(0, ...ys) - SPOT;
  const y1 = Math.max(0, ...ys) + SPOT;
  const W = 640;
  const scale = W / Math.max(1, x1 - x0);
  const H = Math.round(Math.min(240, Math.max(60, (y1 - y0) * scale)));
  const sy = H / Math.max(1, y1 - y0);
  const most = Math.max(...spots.map((p) => p.n));
  const px = (x: number) => ((x - x0) * scale).toFixed(1);
  const py = (y: number) => ((y1 - y) * sy).toFixed(1);
  return s(
    'svg',
    { class: 'deaths', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Where everyone died in ${levelName(level)}` },
    s('line', { x1: 0, x2: W, y1: py(0), y2: py(0), stroke: '#3a352b', 'stroke-dasharray': '3 3' }),
    ...spots.map((p) =>
      s(
        'circle',
        { cx: px(p.x), cy: py(p.y), r: (2.5 + 7 * Math.sqrt(p.n / most)).toFixed(1), fill: p.cause === GAVE_UP ? '#d0644f' : '#cfc6b0', 'fill-opacity': 0.45 },
        s('title', {}, `${level} (${p.x}, ${p.y}) ${p.cause} × ${p.n}`),
      ),
    ),
  );
}

function funnel(): HTMLElement {
  const { tours } = data!.totals;
  const everyone = (x: { accounts: number; guests: number }) => x.accounts + x.guests;
  const most = Math.max(1, tours.reduce((n, x) => n + everyone(x), 0));
  const bar = (n: number, lost = false) => {
    const b = h('span', { className: lost ? 'bar lost' : 'bar' });
    b.style.width = `${Math.round((n / most) * 160)}px`;
    return b;
  };
  const count = (n: number, guests: number) => h('td', { className: 'n' }, n, guests ? h('span', { className: 'muted' }, ` · ${guests} guests`) : null);
  const at = tours.map((x) => ({ ...x, at: firstUncleared(x.cleared) }));
  const rows = TOUR.map((l, i) => {
    const holding = at.filter((x) => x.cleared.includes(l.id));
    const here = at.filter((x) => x.at === l.id);
    const sum = (list: typeof at, f: (x: (typeof at)[number]) => number) => list.reduce((n, x) => n + f(x), 0);
    return h(
      'tr',
      {},
      h('td', { className: 'n' }, i + 1),
      h('td', {}, l.name, h('span', { className: 'muted' }, ` · ch. ${l.chapter}`)),
      count(sum(holding, everyone), sum(holding, (x) => x.guests)),
      h('td', {}, bar(sum(holding, everyone))),
      count(sum(here, everyone), sum(here, (x) => x.guests)),
      h('td', {}, bar(sum(here, everyone), true)),
    );
  });
  const done = at.filter((x) => x.at === null);
  const doneAll = done.reduce((n, x) => n + everyone(x), 0);
  rows.push(h('tr', {}, h('td'), h('td', { className: 'muted' }, 'Finished'), h('td'), h('td'), count(doneAll, done.reduce((n, x) => n + x.guests, 0)), h('td', {}, bar(doneAll, true))));
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
        sortDown = c.key === sortKey ? !sortDown : c.numeric === true || c.key === 'since' || c.key === 'seen' || c.key === 'last';
        sortKey = c.key;
        render();
      });
      return h('th', { className: c.numeric ? 'n' : '' }, b);
    }),
  );
}

function fillTable(): void {
  const col = COLUMNS.find((c) => c.key === sortKey) ?? COLUMNS[1]!;
  const list = visitors.filter(
    (v) =>
      (who === 'everyone' || (who === 'accounts') === (v.kind === 'account')) &&
      (!filter || v.name.toLowerCase().includes(filter) || (v.kind === 'guest' && v.id.toLowerCase().includes(filter))),
  );
  list.sort((a, b) => {
    const x = col.value(a);
    const y = col.value(b);
    const d = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
    return sortDown ? -d : d;
  });
  table.replaceChildren(
    ...list.map((v) => {
      const tr = h('tr', { className: keyOf(v) === selected ? 'row on' : 'row' }, ...COLUMNS.map((c) => h('td', { className: c.numeric ? 'n' : '' }, c.show(v))));
      tr.addEventListener('click', () => void open(keyOf(v)));
      return tr;
    }),
  );
  if (!list.length) {
    const none = visitors.length ? 'No one by that.' : 'No visitors yet.';
    table.append(h('tr', {}, h('td', { colSpan: COLUMNS.length, className: 'muted' }, none)));
  }
}

/** One visitor, level by level, under the table: an account by its id, a guest by `guest:` and his. */
async function open(key: string): Promise<void> {
  selected = key;
  fillTable();
  try {
    history.replaceState(null, '', `#${encodeURIComponent(key)}`);
  } catch {
    /* fine */
  }
  detail.replaceChildren(h('h2', {}, 'Visitor'), h('p', { className: 'muted' }, 'Loading…'));
  detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const guest = key.startsWith('guest:');
  const id = guest ? key.slice('guest:'.length) : key;
  const r = guest
    ? await get<AdminGuestDetail>(`/api/admin/guest?id=${encodeURIComponent(id)}`)
    : await get<AdminUserDetail>(`/api/admin/user?id=${encodeURIComponent(id)}`);
  if (selected !== key) return;
  if (!r.ok) {
    // The list came, so there is an API: a 404 here is a guest who has signed in, or an account deleted, or an address that names no one.
    const gone = guest
      ? 'This guest is not one: he has signed in since, and is his account now, or the address names no guest. Reload for the list as it is.'
      : 'This account is not there: deleted since, or the address names no account. Reload for the list as it is.';
    detail.replaceChildren(h('h2', {}, 'Visitor'), h('p', { className: 'error' }, r.status === 404 ? gone : refusal(r.status, r.error)));
    return;
  }
  detail.replaceChildren(...kids('guest' in r.body ? guestDetail(r.body) : accountDetail(r.body)));
}

function accountDetail(d: AdminUserDetail): Child[] {
  const u = d.user;
  const at = nowAt(u);
  return [
    h('h2', {}, 'Visitor'),
    h('h3', {}, u.email),
    h(
      'p',
      { className: 'muted' },
      `Signed up ${when(u.createdAt)} with ${u.google ? 'Google' : 'a code by email'}`,
      u.firstVisit !== null && u.firstVisit < u.createdAt ? `, after coming as a guest from ${when(u.firstVisit)}` : '',
      ` · last seen ${ago(u.lastSeen)} · ${u.lifetime} deaths in all · `,
      at ? `now at ${levelName(at)}` : 'has cleared the whole tour',
    ),
    h('p', { className: 'muted' }, `Account ${u.id}. Visits, deaths, give-ups and clears below are counted from the tracker’s events, since it began, what he did as a guest before he signed in among them; deaths in all go back further.`),
    ...played(d),
  ];
}

function guestDetail(d: AdminGuestDetail): Child[] {
  const g = d.guest;
  const at = nowAt(g);
  return [
    h('h2', {}, 'Visitor'),
    h('h3', {}, guestName(g.id), h('span', { className: 'muted' }, ' · a guest')),
    h(
      'p',
      { className: 'muted' },
      `First seen ${when(g.firstSeen)} · last seen ${ago(g.lastSeen)} · ${g.lifetime} deaths in all · `,
      at ? `now at ${levelName(at)}` : 'has cleared the whole tour',
    ),
    h('p', { className: 'muted' }, `Visitor ${g.id}: a browser, not a person, that has not signed in. Its tour is as the browser last told of it; visits, deaths, give-ups and clears below are counted from the events, since it was first seen.`),
    ...played(d),
  ];
}

/** What the events say, level by level, and the newest of them. */
function played(d: AdminUserDetail | AdminGuestDetail): Child[] {
  const order = new Map(ATLAS.map((l, i) => [l.id, i]));
  const levels = [...d.levels].sort((a, b) => (order.get(a.level) ?? 999) - (order.get(b.level) ?? 999) || a.level.localeCompare(b.level));
  return [
    levels.length ? levelTable(levels) : h('p', { className: 'muted' }, 'Nothing played since the tracker began.'),
    ...levels.filter((l) => l.deaths > 0).map(deathsIn),
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
    l.points.length ? scatter(l) : null,
    l.points.length ? h('div', { className: 'legend' }, 'X along the level, Y up from the floor the tourist spawns on.', h('i'), 'a death', h('i', { className: 'lost' }), 'gave up') : null,
    l.points.length < l.deaths ? h('p', { className: 'muted' }, `Drawn and counted below: the newest ${l.points.length} of the ${l.deaths}.`) : null,
    l.points.length ? spots(l) : null,
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
