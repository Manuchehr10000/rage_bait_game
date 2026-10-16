// The world outside the accounts server, for the browser tests (tests/accounts.spec.ts):
// Resend's email API, Google's public keys, and a signer for test ID tokens. The API
// under `wrangler pages dev` is pointed here by EMAIL_API_URL and GOOGLE_JWKS_URL
// (playwright.config.ts). Plain node:http, no dependencies.
//
//   POST /emails          Resend's shape; the mail is kept, and answered with an id. Refused
//                         (403) without a User-Agent, as Resend refuses it: the API runs
//                         under workerd here, whose fetch sends none of its own
//   GET  /outbox?to=<a>   the latest mail to that address: {code, subject, count, userAgent}, or 404
//   GET  /jwks            the test key, public half, as Google publishes its own
//   POST /sign            {email, sub, nonce, aud, email_verified?} -> {token}, RS256
//   GET  /health          200
//
// The key is made fresh each run, so no token outlives the run that signed it.

import { createServer } from 'node:http';
import { generateKeyPairSync, randomUUID, sign } from 'node:crypto';

const PORT = Number(process.env.PROVIDERS_PORT ?? 8790);
const KID = 'test';

const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: KID, alg: 'RS256', use: 'sig' };

/** Every mail sent, oldest first. */
const outbox = [];

const b64url = (data) => Buffer.from(data).toString('base64url');

function idToken({ email, sub, nonce, aud, email_verified = true }) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', kid: KID, typ: 'JWT' }));
  const payload = b64url(
    JSON.stringify({ iss: 'https://accounts.google.com', aud, sub, email, email_verified, nonce, iat: now, exp: now + 3600 }),
  );
  const signature = sign('sha256', Buffer.from(`${header}.${payload}`), privateKey).toString('base64url');
  return `${header}.${payload}.${signature}`;
}

function send(res, status, body, cache = 'no-store') {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': cache,
    // The fake Google script on the game's page posts to /sign from another origin.
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST',
  });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const route = `${req.method} ${url.pathname}`;
  if (req.method === 'OPTIONS') return send(res, 204);
  if (route === 'GET /health') return send(res, 200, { ok: true });
  if (route === 'GET /jwks') return send(res, 200, { keys: [jwk] }, 'public, max-age=3600');

  if (route === 'POST /emails') {
    const body = await readBody(req);
    const userAgent = req.headers['user-agent'];
    if (!userAgent) return send(res, 403, { name: 'missing_user_agent' });
    const to = Array.isArray(body?.to) ? body.to : [body?.to];
    if (!body || typeof body.subject !== 'string' || typeof body.text !== 'string' || typeof to[0] !== 'string') {
      return send(res, 422, { name: 'validation_error' });
    }
    const id = randomUUID();
    for (const address of to) outbox.push({ id, to: String(address).toLowerCase(), subject: body.subject, text: body.text, userAgent });
    return send(res, 200, { id });
  }

  if (route === 'GET /outbox') {
    const to = (url.searchParams.get('to') ?? '').toLowerCase();
    const mail = outbox.findLast((m) => m.to === to);
    const code = mail ? /\b(\d{6})\b/.exec(mail.text)?.[1] : undefined;
    if (!code) return send(res, 404, { error: 'none' });
    return send(res, 200, { code, subject: mail.subject, count: outbox.filter((m) => m.to === to).length, userAgent: mail.userAgent });
  }

  if (route === 'POST /sign') {
    const body = await readBody(req);
    if (!body || typeof body.email !== 'string' || typeof body.sub !== 'string' || typeof body.nonce !== 'string' || typeof body.aud !== 'string') {
      return send(res, 400, { error: 'email, sub, nonce and aud are needed' });
    }
    return send(res, 200, { token: idToken(body) });
  }

  return send(res, 404, { error: 'not_found' });
});

server.listen(PORT, () => console.log(`providers on http://localhost:${PORT}`));
