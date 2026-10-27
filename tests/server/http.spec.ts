import { expect, test } from '@playwright/test';
import { handle } from '../../server/router';
import { MAX_BODY } from '../../server/http';
import type { D1Like } from '../../server/db';
import { ORIGIN, World, quietly } from './harness';

/** The rules every request meets before its handler: the gate, routing, the Origin check, the body. */

const ROUTES: [string, string][] = [
  ['GET', '/api/me'],
  ['POST', '/api/progress'],
  ['POST', '/api/auth/email/start'],
  ['POST', '/api/auth/email/verify'],
  ['GET', '/api/auth/google/nonce'],
  ['POST', '/api/auth/google'],
  ['POST', '/api/auth/logout'],
  ['DELETE', '/api/account'],
  ['GET', '/api/admin/users'],
  ['GET', '/api/admin/user'],
];

test('without a database there is no API: 404 everywhere, before anything else is looked at', async () => {
  const world = new World({ DB: undefined });
  const client = world.client();
  for (const [method, path] of [...ROUTES, ['GET', '/api/nope'], ['PUT', '/api/me'], ['POST', '/api/me']] as const) {
    for (const origin of [ORIGIN, null, 'https://evil.test']) {
      const res = await client.request(method, path, { origin, raw: method === 'GET' ? undefined : 'not json' });
      expect(res.status, `${method} ${path}`).toBe(404);
      expect(res.body).toEqual({ error: 'not_found' });
    }
  }
  // Nothing was asked of the network either.
  expect(world.net.calls).toEqual([]);
});

test('every answer is JSON, never cached, never sniffed', async () => {
  const world = new World();
  const client = world.client();
  const replies = [
    await client.get('/api/me'),
    await client.get('/api/nope'),
    await client.post('/api/me', {}),
    await client.post('/api/progress', {}, { origin: null }),
    await client.post('/api/progress', {}),
  ];
  for (const res of replies) {
    expect(res.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  }
  const noDb = await new World({ DB: undefined }).client().get('/api/me');
  expect(noDb.headers.get('Cache-Control')).toBe('no-store');
});

test('an unknown path is 404, a known one asked the wrong way 405', async () => {
  const client = new World().client();
  for (const path of ['/api', '/api/', '/api/me/', '/api/ME', '/api/auth', '/api/auth/email', '/api/__proto__', '/api/constructor']) {
    const res = await client.get(path);
    expect(res.status, path).toBe(404);
    expect(res.body).toEqual({ error: 'not_found' });
  }
  for (const [method, path] of ROUTES) {
    const wrong = method === 'GET' ? 'POST' : 'GET';
    const res = await client.request(wrong, path, wrong === 'POST' ? { body: {} } : {});
    expect(res.status, `${wrong} ${path}`).toBe(405);
    expect(res.body).toEqual({ error: 'method' });
    expect(res.headers.get('Allow')).toBe(method);
  }
  expect((await client.request('PUT', '/api/me', { body: {} })).status).toBe(405);
});

test('a request that changes anything must come from the page itself', async () => {
  const world = new World();
  const client = world.client();
  for (const [method, path] of ROUTES.filter(([m]) => m !== 'GET')) {
    for (const origin of [null, 'https://evil.test', 'http://lost.test', 'https://lost.test:8443', 'null', `${ORIGIN}/`]) {
      const res = await client.request(method, path, { origin, body: { email: 'a@b.co' } });
      expect(res.status, `${method} ${path} from ${origin}`).toBe(403);
      expect(res.body).toEqual({ error: 'origin' });
    }
  }
  expect(world.net.outbox).toEqual([]);
  // A read needs no Origin: a browser does not always send one on a GET.
  expect((await client.get('/api/me', { origin: null })).status).toBe(200);
  // From the page itself it goes through.
  expect((await client.post('/api/auth/email/start', { email: 'a@b.co' })).status).toBe(200);
});

test('a body must be JSON, declared as JSON, and at most 16 KiB', async () => {
  const world = new World();
  const client = world.client();
  const start = '/api/auth/email/start';
  const bad = async (options: Parameters<typeof client.request>[2]) => {
    const res = await client.request('POST', start, options);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'bad_request' });
  };
  await bad({ raw: '{"email":"a@b.co"}', headers: { 'Content-Type': 'text/plain' } });
  await bad({ raw: '{"email":"a@b.co"}', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  await bad({ raw: '{"email":"a@b.co"}' });
  await bad({ raw: '{"email":', headers: { 'Content-Type': 'application/json' } });
  await bad({ raw: 'email=a@b.co', headers: { 'Content-Type': 'application/json' } });
  // No body where one is needed.
  await bad({ headers: { 'Content-Type': 'application/json' } });
  // A JSON value that is not an object.
  await bad({ body: ['a@b.co'] });
  await bad({ body: 'a@b.co' });
  await bad({ body: null });

  // One byte over the limit, and a length that claims more than it sends.
  const over = JSON.stringify({ email: 'a@b.co', pad: '' });
  await bad({ raw: over.replace('""', `"${'x'.repeat(MAX_BODY - over.length + 1)}"`), headers: { 'Content-Type': 'application/json' } });
  await bad({ raw: '{"email":"a@b.co"}', headers: { 'Content-Type': 'application/json', 'Content-Length': String(MAX_BODY + 1) } });
  expect(world.net.outbox).toEqual([]);

  // Exactly at the limit, with a charset: fine.
  const at = over.replace('""', `"${'x'.repeat(MAX_BODY - over.length)}"`);
  expect(at.length).toBe(MAX_BODY);
  const ok = await client.request('POST', start, { raw: at, headers: { 'Content-Type': 'application/json; charset=UTF-8' } });
  expect(ok.status).toBe(200);
});

test('DELETE /api/account reads its body as any other change does: JSON, declared as JSON', async () => {
  const client = new World().client();
  // Signed out, a delete with no body is told so, not that its body is missing.
  const res = await client.delete('/api/account');
  expect(res.status).toBe(401);
  expect(res.body).toEqual({ error: 'signed_out' });
  const undeclared = await client.request('DELETE', '/api/account', { raw: '{"account":"A"}' });
  expect(undeclared.status).toBe(400);
  expect(undeclared.body).toEqual({ error: 'bad_request' });
});

test('the schema is made once, by the server itself, and then costs one query an isolate at most', async () => {
  const world = new World();
  const client = world.client();
  await client.get('/api/me');
  expect(world.db.rows('SELECT version FROM schema_version ORDER BY version')).toEqual([{ version: 1 }, { version: 2 }]);
  const tables = world.db.rows("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").map((r) => r.name);
  expect(tables).toEqual(['cleared', 'email_codes', 'email_sends', 'events', 'pushes', 'schema_version', 'sessions', 'tricks', 'users']);
  world.db.log.length = 0;
  await client.get('/api/me');
  expect(world.db.log.filter((sql) => /CREATE|schema_version/.test(sql))).toEqual([]);

  // A second database in the same isolate is brought up to date on its own.
  const other = new World();
  await other.client().get('/api/me');
  expect(other.db.count('schema_version')).toBe(2);
});

test('an exception is a 500 that tells the client nothing, and logs nothing he sent', async () => {
  const broken: D1Like = {
    prepare() {
      throw new Error('D1_ERROR: the database is down');
    },
    batch() {
      return Promise.reject(new Error('D1_ERROR: the database is down'));
    },
  };
  const { result: res, logged } = await quietly(() =>
    handle(
      new Request(`${ORIGIN}/api/auth/email/verify`, {
        method: 'POST',
        headers: { Origin: ORIGIN, 'Content-Type': 'application/json', Cookie: '__Host-lt_session=secret-token' },
        body: JSON.stringify({ email: 'private@example.com', code: '123456' }),
      }),
      { DB: broken },
    ),
  );
  expect(res.status).toBe(500);
  expect(await res.json()).toEqual({ error: 'server' });
  expect(logged).toContain('the database is down');
  for (const secret of ['private@example.com', '123456', 'secret-token']) expect(logged).not.toContain(secret);
});
