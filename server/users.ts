import { inboxKey } from './address';
import { newId } from './crypto';
import type { D1Like } from './db';

export interface UserRow {
  id: string;
  email: string;
}

/**
 * What a request may give as an account id: a string of 1 to 64 characters.
 * Ours are 22 (newId); one that is well formed but not his is refused later,
 * as another account.
 */
export function isAccountId(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 1 && value.length <= 64;
}

/**
 * The user with this address, created on first use: there is no sign-up, only
 * Continue. Insert-then-select, so two first sign-ins at once agree on one user.
 */
export async function userByEmail(db: D1Like, email: string, now: number): Promise<UserRow> {
  const [, found] = await db.batch<UserRow>([
    db
      .prepare('INSERT INTO users (id, email, created_at) VALUES (?1, ?2, ?3) ON CONFLICT(email) DO NOTHING')
      .bind(newId(), email, now),
    db.prepare('SELECT id, email FROM users WHERE email = ?1').bind(email),
  ]);
  const user = found?.results[0];
  if (!user) throw new Error('user not found after insert');
  return user;
}

/**
 * The user a Google account signs in as. By Google's subject first, so a
 * changed Gmail address keeps its tour; then by email: an email-code user
 * with no Google account yet is linked to this one, and an address already
 * linked to a different Google account is refused. Otherwise a new user.
 */
export async function userByGoogle(db: D1Like, sub: string, email: string, now: number): Promise<UserRow | 'email_taken'> {
  // Twice at most: the second pass is for a sign-in that raced this one to the same row.
  for (let pass = 0; pass < 2; pass++) {
    const { results } = await db
      .prepare('SELECT id, email, google_sub FROM users WHERE google_sub = ?1 OR email = ?2')
      .bind(sub, email)
      .all<UserRow & { google_sub: string | null }>();
    const bySub = results.find((u) => u.google_sub === sub);
    if (bySub) return { id: bySub.id, email: bySub.email };
    const byEmail = results.find((u) => u.email === email);
    if (byEmail && byEmail.google_sub !== null) return 'email_taken';
    try {
      const user = byEmail
        ? await db
            .prepare('UPDATE users SET google_sub = ?1 WHERE id = ?2 AND google_sub IS NULL RETURNING id, email')
            .bind(sub, byEmail.id)
            .first<UserRow>()
        : await db
            .prepare(
              'INSERT INTO users (id, email, google_sub, created_at) VALUES (?1, ?2, ?3, ?4) ON CONFLICT DO NOTHING RETURNING id, email',
            )
            .bind(newId(), email, sub, now)
            .first<UserRow>();
      if (user) return user;
    } catch (err) {
      // The subject was linked to another row between the read and the write: read again, once.
      if (pass > 0) throw err;
    }
  }
  return 'email_taken';
}

/** Forgets the user: his progress, his sessions, any code waiting for him. */
export async function deleteUser(db: D1Like, user: UserRow): Promise<void> {
  await db.batch([
    db.prepare('DELETE FROM tricks WHERE user_id = ?1').bind(user.id),
    db.prepare('DELETE FROM cleared WHERE user_id = ?1').bind(user.id),
    db.prepare('DELETE FROM pushes WHERE user_id = ?1').bind(user.id),
    db.prepare('DELETE FROM sessions WHERE user_id = ?1').bind(user.id),
    db.prepare('DELETE FROM email_codes WHERE email = ?1').bind(user.email),
    // The send log keeps its rows for the rate limits, which deleting an account
    // must not reset, but not his inbox: it is gone in a day anyway.
    db.prepare("UPDATE email_sends SET email = '' WHERE email = ?1").bind(inboxKey(user.email)),
    db.prepare('DELETE FROM users WHERE id = ?1').bind(user.id),
  ]);
}
