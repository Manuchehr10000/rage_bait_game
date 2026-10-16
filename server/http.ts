import type { ApiError, ErrorCode } from './contract';

/** The largest request body the API reads. Nothing it takes comes near it. */
export const MAX_BODY = 16 * 1024;

/** A JSON response with the headers every answer carries, and any cookies to set. */
export function json(status: number, body: unknown, cookies: readonly string[] = []): Response {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  for (const cookie of cookies) headers.append('Set-Cookie', cookie);
  return new Response(JSON.stringify(body), { status, headers });
}

export function fail(
  status: number,
  error: ErrorCode,
  extra: Omit<ApiError, 'error'> = {},
  cookies: readonly string[] = [],
): Response {
  const body: ApiError = { error, ...extra };
  return json(status, body, cookies);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The request's body parsed as JSON; `body` is undefined when there is none.
 * Null when the body breaks the rules: over MAX_BODY, not declared as JSON, or
 * not JSON. Reads no further than one byte past the limit, whatever is sent.
 */
export async function readJson(request: Request): Promise<{ body: unknown } | null> {
  const declared = request.headers.get('Content-Length');
  if (declared !== null && !(Number(declared) <= MAX_BODY)) return null;
  const bytes = await readLimited(request, MAX_BODY);
  if (bytes === null) return null;
  if (bytes.length === 0) return { body: undefined };
  const type = (request.headers.get('Content-Type') ?? '').split(';')[0]?.trim().toLowerCase();
  if (type !== 'application/json') return null;
  try {
    return { body: JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes)) as unknown };
  } catch {
    return null;
  }
}

async function readLimited(request: Request, limit: number): Promise<Uint8Array | null> {
  if (!request.body) return new Uint8Array(0);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, at);
    at += chunk.length;
  }
  return bytes;
}
