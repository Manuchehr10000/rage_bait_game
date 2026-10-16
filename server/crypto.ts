/** Random tokens, codes and hashes, from Web Crypto alone (Workers and Node both have it). */

const encoder = new TextEncoder();

export function randomBytes(n: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function base64url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** The bytes, or null if `text` is not unpadded base64url. */
export function fromBase64url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text) || text.length % 4 === 1) return null;
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4);
  try {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

export function utf8(text: string): Uint8Array<ArrayBuffer> {
  // Copied into a plain ArrayBuffer: Workers' types do not promise one, and Web Crypto wants one.
  return new Uint8Array(encoder.encode(text));
}

export async function sha256(text: string): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', utf8(text)));
}

export async function sha256hex(text: string): Promise<string> {
  let hex = '';
  for (const b of await sha256(text)) hex += b.toString(16).padStart(2, '0');
  return hex;
}

/** 32 random bytes, base64url: a session token, a nonce's secret half. */
export function randomToken(): string {
  return base64url(randomBytes(32));
}

/** A row id: 16 random bytes, base64url. */
export function newId(): string {
  return base64url(randomBytes(16));
}

/**
 * Six uniformly random digits. A draw at or above the last whole million below
 * 2^32 is thrown away: kept, it would make the low codes a little likelier.
 */
export function randomCode(): string {
  const limit = Math.floor(2 ** 32 / 1_000_000) * 1_000_000;
  const draw = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(draw);
    const v = draw[0] ?? limit;
    if (v < limit) return String(v % 1_000_000).padStart(6, '0');
  }
}

/** String equality that takes as long however early the strings differ. */
export function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
