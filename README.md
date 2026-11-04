# Lost Tourist

A deadpan, mean, browser-based 2D platformer for desktop. Chapters are historical places,
drawn as exactly as we can manage. No text. The level is always the same. You learn by
dying.

Design rules are in [PILLARS.md](PILLARS.md). Read them before adding a trap.
Art and history live in [content/](content/README.md). Read that before drawing anything.

## Environments

| | Branch | Link |
|---|---|---|
| prod | `main` | https://losttourist.online |
| dev | `dev` | https://dev.losttourist.online |

Both are one Cloudflare Pages project, deployed per branch, so a push to `dev` leaves
prod alone and either side rolls back on its own. Only prod is indexable: the dev build
ships a `noindex` meta tag and an `X-Robots-Tag` header, and prod claims the canonical
URL.

Flow: work on a feature branch, open a pull request into `dev`, then promote `dev` to
`main` when it has been played and survived. Every push runs CI (typecheck, asset check,
build, headless playthroughs). Every push to `main` or `dev` redeploys that one link. The
footer of each page shows which environment and commit it is.

## Run

```
npm install
npm run dev
```

Arrows or WASD to move, Space to jump, L to switch the headlamp off and on in the one cave
where it runs down (it only runs down while it burns), R to give up (it counts), M to mute, Enter for the
next level at the exit label. Esc returns to the map. Open `#cap-blanc`,
`#roc-aux-sorciers`, `#pech-merle`, `#rouffignac`, `#gargas`, `#abu-simbel`, `#philae`,
`#karnak`, `#dendera`, `#knossos`, `#minotaur` or `#persepolis` in the URL to start at that level.

A level is entered on foot: from the map or the exit label, the tourist walks in from off
the left edge of the screen, and the controls are his as soon as all of him is on it
(pillar 13). Where the level brings him in itself he starts on it (Philae, by boat), and
where the visit has already begun he is simply there (Rouffignac, off the train). Retries
start on the spawn.

For players the tour is played in order: in the prod build, which main deploys, a level
opens on the map once every level before it is cleared, so the chapters open in order and
so do the levels inside each. Every other build, dev included, opens every built level from
the start. Either way a cleared level is stamped and can be visited again, and a chapter
opens on its first level not yet cleared. A deep link opens any level in dev and local
builds, and in prod only one the tour has reached.

Prod plays chapters 1 and 2 (designer, 2026-10-27: "Make only chapter 1 and 2 playable in
main"). Chapters 3 and 4 are on its map all the same, closed for restoration while they are
being made: their badges are drawn, their panels name them, and they cannot be entered.

A built level can be held back from prod (`HELD` in `src/levels/index.ts`, its file in
`src/levels/held-files.ts`): it is on the map of the dev and local builds, and prod's tour
and map leave it out, so its pin there is a closed one, and prod's bundle does not carry its
level file. A chapter all of whose levels are held is closed for restoration on prod's map.
Knossos, the Minotaur and Persepolis are held now, which holds chapters 3 and 4. (The
Minotaur was held once before, from 2026-10-15 to 2026-10-16.)

Dev tools, in every build except prod, so a point on screen can be named: a ruler on the
edges of a level, and the exact point under the mouse as `(X, Y)`. A click copies it with
the level in front, `karnak (96, 64)`, since Y = 0 differs from level to level. X is world
px from the start of the level; Y is px above the floor the tourist spawns on, negative
below it. G hides them. The world counts y downward, so `(X, Y)` is the world pixel at
x = X, y = spawn floor − Y.

To put the tourist anywhere: the mouse wheel looks along the level (up and down one that
is a screen wide), Shift+wheel up and down it (Alt+wheel both ways at once, on a
trackpad), and the game stands still while it does; Shift+click starts the level again
with him standing on that point, so Shift held finds the height and the click puts him
there, and every death brings him back there until you leave the level. Any key stops
looking and puts the view back; Escape does only that. This is for replaying one trap, not
for judging a level: traps behind the point never fired, and one that fires from a line he
now starts past fires at once. The playthrough tests judge a level.

H draws what a level hides: every line that sets a trap off (yellow), what kills (red),
what is safe (green), which of the identical things is the liar (orange), moving solids
(white), and the tourist's hitbox and jumps from where he stands (cyan: a running jump
each way, and one from a standstill). A jump ends in a green square where it lands and a
red one where the landing kills; the red line across is how far a walk off his ledge may
drop. The jumps are flown by the game's own physics on a copy of him, so they are the
jumps he makes, with moving things frozen as they are and water left out.

T runs the game at a quarter speed. P stops it; full stop then moves it on one tick at a
time, with whatever keys are held. G, hiding the tools, puts all of this back the way a
player has it.

Every one of these is also a button in a row under the screen, with its key on it, lit
while its tool is on. The game leaves the row room, so a window that only just fits the
screen at 4x without it draws at 3x with it.

They live in `src/dev/` and never reach a player. dev and main are one history, so the
source goes to main when dev is promoted; the code does not go to prod. The prod build
refuses to finish if anything from `src/dev/`, or a level held back from prod, is in its
bundle, and CI builds prod on every push to prove it.

## On a phone

Held sideways, the game is as big as the phone allows with the buttons beside it, never
on it (`src/touch/controls.ts`): left and right under the left thumb, jump under the
right. Each side's whole column takes its thumb, so a thumb that slides off its arrow is
still pressing it, and one that slides onto the other arrow presses that one. Above them
are the map (Escape), give up (R), the sound (M) and full screen, and above jump the lamp,
in a level where it runs down (L). A tap on the exit label goes on, as Enter does. The
keys line under the screen is not shown; the account link and the build stamp on it are,
at the foot of the left column on the map. Held upright, the phone is asked to turn and
the game waits.

Android goes full screen and turns sideways at the first tap. Safari on an iPhone lets no
page do either: there the full-screen button says how to add the game to the home screen,
which opens it with no browser around it (the manifest, `vite.config.ts`).

It turns on wherever the screen is touched rather than pointed at; `?touch` turns it on
for a mouse, `?touch=0` off. The dev tools stay off a phone. Every build has it, prod
since the designer's word of 2026-10-17. `touch` in `vite.config.ts` can hold it back from
prod again; while it is false, the prod build refuses a bundle with any of `src/touch/` in it.

`npm test` runs scripted playthroughs in headless Chromium. Each one checks a design
contract: the trap fires for the naive player and can be avoided by the one who remembers.
It builds the game first, every time, so it always tests the source as it is; so does
`npx playwright test` on a single file.

`npm run assets:check` validates every art manifest against the files on disk.

## Accounts

An account keeps a visitor's tour: the levels he has cleared, the tricks that have killed
him and his deaths, on every device he signs in on; and, for the admin's tracker (below),
what happens in play. He signs in with Google or with a six-digit code sent by email.
There is no sign-up: an address or a Google account becomes an account the first time it is
used, and one used both ways is one account. A guest's tour is kept in this browser, under
the keys prod always kept it under (designer, 2026-10-27; until then a guest's lasted until
the tab closed); signing in carries it into the account. The link that signs him in is
under the screen, on the map only.

In every build: dev from 2026-10-16, prod since the designer's word of 2026-10-27 ("add
google auth to main"). Prod offers Google alone, by its configuration: its Production
environment has a Google client id and no Resend key, so codes by email are off there.
`accounts` in `vite.config.ts` can hold them back from prod again, and while it does, the
prod build refuses to finish with any of `src/account/` in its bundle. The page's side is
all in `src/account/`, which only `src/game.ts` loads. The API is Cloudflare Pages Functions
and D1: `functions/api/[[path]].ts` hands every `/api` request to `server/`, which answers
404 wherever no database is bound. A page with no API behind it (a 404, or no answer within
four seconds) has no accounts, and everyone on it is a guest, his tour kept in the browser
as prod always kept it; `npm run dev` is such a page, and so is prod until its database is
bound, so main can deploy before Cloudflare is set up and nobody loses anything.

To run it on this machine, with a local D1 kept in `.wrangler/state`:

```
cp .dev.vars.example .dev.vars    # fill in what you have; it is never committed
npm run api                       # builds, then serves the game and the API on http://localhost:8788
```

`npm test` runs it too: `tests/accounts.spec.ts` plays against `wrangler pages dev` with an
empty local D1, and stand-ins for Resend and Google (`tests/support/providers.mjs`), and
`tests/server/` checks the API without a browser. Neither reads `.dev.vars`.

What it needs, outside the repo:

- **Cloudflare**, in the `lost-tourist` Pages project's settings. For the Preview
  environment, which is where dev deploys: a D1 database bound as `DB`;
  `GOOGLE_CLIENT_ID`; `ADMIN_EMAILS`, the addresses that may read the tracker, commas
  between; `EMAIL_FROM` (e.g. `Lost Tourist <tickets@mail.losttourist.online>`); and
  `RESEND_API_KEY`, as a secret. `EMAIL_DAILY_CAP` (default 90 codes a day, all addresses
  together), `EMAIL_IP_HOURLY` (default 20 an hour per IP), `VISIT_IP_HOURLY` and
  `VISIT_DAILY_CAP` (what the tracker may be sent, below) are optional. For the
  Production environment, which is where main deploys: a D1 database of its own (not dev's,
  so the designer's test accounts and deaths stay out of the players'), bound as `DB`;
  `GOOGLE_CLIENT_ID`; and `ADMIN_EMAILS`. No `RESEND_API_KEY` or `EMAIL_FROM` there: that is
  what keeps prod to Google alone. The API makes its own tables the first time it is
  asked, and brings an older database's up to date. Pages gives bindings and variables only
  to deployments made after they were added: once they are in, redeploy (push to the
  branch, or run the CI workflow on it again), or that `/api` keeps answering 404.
- **Resend**: the domain `EMAIL_FROM` sends from, `mail.losttourist.online` (a subdomain
  keeps the main domain's mail reputation apart), verified; its DNS is at Cloudflare, so
  Resend's Auto configure adds the records. The game's key is a sending-only key
  restricted to that domain, put straight into Cloudflare as `RESEND_API_KEY`. Each code
  goes with an idempotency key, so a send tried again (the server tries up to three times
  when Resend is out of reach or briefly overloaded) never delivers two codes.
- **Google Cloud**: an OAuth client of the Web application type. Its authorised JavaScript
  origins: `https://dev.losttourist.online`, `https://losttourist.online`, `http://localhost`
  and `http://localhost:8788`. Its client id is `GOOGLE_CLIENT_ID`, the same on both
  environments. Its secret is not needed: the API only checks Google's signature on the
  token the button hands the page. While its consent screen is in Testing, only the test
  users it lists can sign in: publish it before prod's players are asked to.

## The admin's tracker

`/admin` (`admin.html`, `src/admin/`) shows the game's visitors (designer, 2026-10-27), the
guests among them since the designer's word of 2026-11-03 ("Add tracking of any users who
came to game and played even without logging and then how many logged in"), and only with
their yes since the designer's word of 2026-11-04 ("add consent", asked of everyone, accounts
too; "add return rate"). It reads `GET /api/admin/users`, `GET /api/admin/user?id=`,
`GET /api/admin/guest?id=` and `GET /api/admin/spots?level=` (`server/admin.ts`), which
answer only an account whose address `ADMIN_EMAILS` names: sign in on the game's map with
it first. The game never links to it. It has three parts:

- **Everyone**, from anonymous counts that every page sends whatever its visitor answered:
  how often the page opened, ever and this week, and, level by level, the entries, deaths,
  give-ups, leaves for the map and clears, the commonest causes, and where on the level
  everyone died (click a level: a scatter sized by how many, and the spots with the most);
  and how the question of recording was answered.
- **Visitors who said yes**: how many, how many played as a guest, how many of those who came
  as guests signed in, how many of those who played did, and how many come back: on another
  day at all, the next day, and within a week.
- **Accounts and guests**: the totals, the tour's funnel (how many have cleared each level and
  how many each level holds), and the table of accounts and guests, newest thousand of each,
  with for one, level by level: visits, deaths by cause, give-ups, leaves, clears and the best
  time, where on the level the deaths were (as the dev ruler names spots: `karnak (96, 64)`),
  and the latest events.

### The question of recording

Every visitor is asked, on the map, never in a level (`src/account/consent-ui.ts`): a line
under the screen (on a phone, at the foot of the left column) until it is answered, then a
link beside the account's that says which it is and asks again, with what is kept and why.
Play goes on meanwhile, and the game leaves room under the screen for the line while it
shows. The answer is the browser's, kept in it (`lostTourist.consent`), and every tab hears
of it (`src/account/consent.ts`); a yes lasts thirteen months, the visitor cookie's life,
and then the question is asked again.

- **Without a yes** (no answer, or no), nothing is kept that tells one visitor from another.
  The page counts what happens (the page opening, going into a level, each death by cause and
  by spot on a grid of eight world px, leaving a level, clearing one, the answer itself) and
  sends the counts on the map and as the page is hidden, to `POST /api/count`, without the
  browser's cookies; the server adds them to the day's in `counts` and `spots`, and reads no
  cookie and sets none. A page opened twice is two.
- **With a yes**, what he does in play goes to the tracker as events (below), his own or a
  guest's, and the days he opens the game are kept (`visitor_days`), for how many come back.
  A no after a yes forgets the browser's visitor (`DELETE /api/visitor`): its cookie, its
  days, and what it did as a guest. What went with an account goes when the account does.
  The no is owed until the server has it (`lostTourist.forgetVisitor`): sent behind any push
  of the visitor's out in any tab, tried again until it arrives, and by the next page if
  this one closes first; and no push of the visitor's goes after it. A push already taken
  is checked for the yes again as it goes.
- **Never without a yes**, nothing he does in play is kept in the browser to be sent: the
  stores themselves refuse it, and a page that opens without a yes drops what an older page
  kept, a guest's plays and any account queue's, so a later yes never sends what came
  before it. His tour is kept either way: keeping it is what signing in is for.

### Events and visitors

What it counts per visitor are events (`PlayEvent`, `server/contract.ts`), one row each in
D1's `events` table: going into a level, each death with its cause, where (X, Y on the dev
ruler) and how far into the attempt, leaving a level for the map from the middle of it
(Escape, which gives up first), and each clear with its time and the deaths before it. A
give-up is a death, its cause `Gave up`. A signed-in page queues them with the tour and
sends them with its pushes, each kept once by its id; a run the dev tools started from
somewhere else is not counted.

A visitor (`server/visitors.ts`) is a browser that said yes, named by a random id in a cookie
of its own, `__Host-lt_visitor`, made the first time the page pushes with the yes and kept for
thirteen months from then, never longer. Nothing else is kept of it: no address, no IP,
nothing of the device. A guest's page sends `POST /api/visit` as it opens (or as he says
yes), marked `open`, until the server has it; and then what he does in play and his tour as
the browser holds it: on the map, as the page is hidden, and half a minute after anything
happens in a level, one push at a time across the browser's tabs. What it cannot send yet
waits in the browser, the newest thousand. A signed-in page sends one as it opens, with
nothing in it but `open`: the day he came, tried again with the account's pushes until it
arrives. Only a push marked `open` is a day he came: a long game going on past midnight is
not. Signing in makes the visitor the account's, in the same transaction as the
session: what it did as a guest goes into the account's events, and so does anything a tab
that has not heard yet sends while the browser is signed in to that account. Signed out, run
out, or signed in as someone else, the browser that plays as a guest is a new visitor, as its
tour is a new guest's; signed in again as the same account with no guest play between, it is
the same visitor. A browser signed in already when it says yes is a visitor that is his from
the start, and never counted as a guest. Deleting the account deletes its visitors.

So a visitor is a browser's stretch as one person, not a person: one account on two devices
is two visitors, one who clears the browser is a new guest, and a guest's tour and deaths are
what his browser says. "Played as a guest" is a visitor that went into a level before it
signed in, or without ever signing in; "came as guests, signed in" is one that was a guest
first and then signed in. How many come back is counted by the UTC days the page opened, and
each asked only of those whose days in question are over: of the visitors first seen before
today, those seen on another day; of those first seen before yesterday, those seen the day
after their first; of those whose seven days after their first are over, those seen again
within them. A search engine that runs
the page is not counted. Accounts made before visitors were counted have none.

### Limits

What the tracker is sent, events and counts both, is limited in units: a push one, each event
or thing counted in it one more (a count of five is five), and each KiB of a guest's tour one
more; a unit is about two rows written. One network may send `VISIT_IP_HOURLY` an hour
(default 20000), counted by its address (as the email limits key it) scrambled with a random
salt of the day's (`salts`), deleted as the day ends, so no key leads back to an address,
kept for its hour and the next; all networks together
`VISIT_DAILY_CAP` a day (default 500000), so that on the Workers Paid plan (designer,
2026-11-04), whose D1 includes 50 million rows written a month, the tracker writes about 30
million at most and the accounts keep the rest. Past either, a push is refused until the hour
or the day (UTC) is out, nothing of it written, and the page keeps it. A script on many
networks can still use the day's share; Cloudflare's own rate limiting is the answer to that.

Counts begin when the tracker did, guests' when visitors were first counted, and everyone's
when the counts were; the deaths in all of an account's visits, and of a guest's as his
browser counts them, go back further. This is the ground the game's analytics are to be
built on.

## Layout

The engine knows nothing about Egypt. The levels are data. The art is files.

```
src/
  main.ts                 boots the game once the art has loaded
  game.ts                 the loop: fixed 60 Hz step, level sequence, deaths, HUD state
  engine/                 systems, with no knowledge of any level
    types.ts              constants (view size, tile, ART_SCALE), death causes, rects
    physics.ts            axis-separated AABB collision against tiles and moving solids
    player.ts             PHYS tuning. The one part of the game that never lies
    entities.ts           the generic traps: falling, thrower, platform, water, sweep, crumble, pusher, conveyor, chaser, tipper, hazard, horse, roof, snare, train
    level.ts              level data types and the tile grid
    camera.ts             never scrolls left
    input.ts, audio.ts    keys; every sound synthesised with Web Audio, no files
    assets.ts             loads painted art from content/ manifests; falls back to code-drawn
    progress.ts           which levels this visitor has cleared, and what happens in play, told to the store
  render/
    scene.ts              draws the world in world units; every sprite site asks for painted art first
    procedural.ts         the code-drawn sprites used until a painting exists
    frame.ts              one abstraction over painted and code-drawn frames (tourist, deaths)
    hud.ts                death counter and exit label, drawn in screen space
  map/
    atlas.ts              the tour: twelve chapters, sixty sites, where each is on Earth; the game shows the first four
    screen.ts             the tour map, the start screen
    geo.ts                coastlines, generated from Natural Earth by tools/build-coastlines.mjs
    monuments.ts          code-drawn chapter vignettes, used until a plate is painted
  dev/                    tools for building the game: the ruler and the pointer readout. Never in prod
  account/                signing in, and the tour kept in the browser or queued for the server
  admin/                  the admin's tracker of the visitors, admin.html's page
  touch/                  the buttons on a phone's screen
  levels/
    index.ts              level order and URL hash lookup
    ch01-palaeolithic/    one file per level: geometry, decor, entity list
    ch02-egypt/
    ch03-aegean/
    ch04-persia/
content/
  README.md               the designer's guide
  research/               the historical arc; outranks everything else on history
  tricks.md               every trick the game has spent; a trick is used once
  ch01-palaeolithic/      CHAPTER.md, shared art, one folder per built level with LEVEL.md,
  ch02-egypt/             assets.json, easter-eggs.md, and beat folders holding notes and
  ch03-aegean/            paintings; a level designed and not yet built has its LEVEL.md
  ch04-persia/            only (Phaistos)
  map/                    the tour map's art, and the twelve chapter plates in monuments/
  site/                   the tab icon's note
tools/
  check-assets.mjs        the manifest checker CI runs
  paint-monuments.mjs     paints the twelve chapter plates from tools/monument-painters/
  build-coastlines.mjs    regenerates src/map/geo.ts from Natural Earth
  favicon.mjs             the tab icon, generated at build time
tests/                    Playwright playthroughs, one file per level (Abu Simbel's is smoke.spec.ts),
                          plus the map, the audio, the dev tools and the level-data contracts
```

Rendering: the world is 320 × 180 units, rendered onto a canvas four times that size
(`ART_SCALE`) so painted art at 4x lands pixel for pixel, then scaled to the window.

## Status

Twelve levels playable end to end: the five of chapter 1 (Cap Blanc, Roc-aux-Sorciers, Pech
Merle, Rouffignac, Gargas), the first four of chapter 2 (Abu Simbel, Philae, Karnak,
Dendera), the first and the sixth of chapter 3 (Knossos, and its legend, the Minotaur) and
the first of chapter 4 (Persepolis); prod plays the nine of chapters 1 and 2. With code-drawn art and procedural
sound, from a tour map start screen. Chapter 4 has no music yet: Persepolis is heard with
the wind alone. Painted art arrives per asset through `content/`. No menu yet.
