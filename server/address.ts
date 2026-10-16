/**
 * Addresses: the email address a code is sent to, and the keys the sending
 * limits count by, which are coarser than the address or the IP they come from
 * so that one inbox or one network cannot pass for many.
 */

/** What a local part may hold: letters, digits and the symbols RFC 5322 allows unquoted. */
const LOCAL = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
const LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const TLD = /^[a-z]{2,}$/;

/**
 * The address, trimmed and lowercased, if it is a plain ASCII local@domain;
 * otherwise null. Quoted local parts, display names, comments and anything
 * outside ASCII are refused: a sign-in code needs none of them, and an email
 * API may read some of them as a different recipient.
 */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  // Checked before lowercasing, which turns a few non-ASCII letters (the Kelvin sign) into ASCII ones.
  if (!/^[\x21-\x7e]+$/.test(trimmed)) return null;
  const email = trimmed.toLowerCase();
  if (email.length > 254) return null;
  const parts = email.split('@');
  if (parts.length !== 2) return null;
  const [local = '', domain = ''] = parts;
  if (local.length > 64 || !LOCAL.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return null;
  }
  const labels = domain.split('.');
  if (labels.length < 2 || !labels.every((l) => l.length <= 63 && LABEL.test(l)) || !TLD.test(labels[labels.length - 1] ?? '')) {
    return null;
  }
  return email;
}

/**
 * The inbox an address delivers to, as far as the limits need to know: a +tag
 * goes to the same inbox on most providers, and Gmail ignores dots and treats
 * googlemail.com as gmail.com. Only for counting sends: codes, accounts and the
 * mail itself keep the address as typed.
 */
export function inboxKey(email: string): string {
  const at = email.lastIndexOf('@');
  let local = email.slice(0, at);
  let domain = email.slice(at + 1);
  const plus = local.indexOf('+');
  if (plus >= 0) local = local.slice(0, plus);
  if (domain === 'googlemail.com') domain = 'gmail.com';
  if (domain === 'gmail.com') local = local.replace(/\./g, '');
  return `${local}@${domain}`;
}

/**
 * The network a request comes from, as the per-IP limit counts it: an IPv4
 * address as it is, an IPv6 address by its /64 (one machine or one home
 * connection usually holds a whole /64), and an IPv4 address written as IPv6
 * (::ffff:1.2.3.4) as the IPv4 address. Anything else is kept as sent, cut to
 * 64 characters; nothing at all is 'unknown', one bucket for all of them.
 */
export function ipKey(raw: string | null): string {
  const ip = (raw ?? '').trim();
  if (ip === '') return 'unknown';
  const v4 = ipv4(ip);
  if (v4) return v4.join('.');
  const v6 = ipv6(ip);
  if (!v6) return ip.slice(0, 64);
  if (v6.slice(0, 5).every((h) => h === 0) && v6[5] === 0xffff) {
    const [hi = 0, lo = 0] = v6.slice(6);
    return [hi >> 8, hi & 0xff, lo >> 8, lo & 0xff].join('.');
  }
  return `${v6
    .slice(0, 4)
    .map((h) => h.toString(16))
    .join(':')}::/64`;
}

/** The four bytes of a dotted IPv4 address, or null. */
function ipv4(text: string): number[] | null {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(text)) return null;
  const bytes = text.split('.').map(Number);
  return bytes.every((b) => b <= 255) ? bytes : null;
}

/** The eight 16-bit groups of an IPv6 address, '::' expanded and a dotted IPv4 tail read as two groups; or null. */
function ipv6(text: string): number[] | null {
  const halves = text.split('::');
  if (halves.length > 2) return null;
  const [before = '', after] = halves;
  // A dotted IPv4 tail may only end the address.
  const head = groups(before, after === undefined);
  const tail = after === undefined ? [] : groups(after, true);
  if (!head || !tail) return null;
  if (after === undefined) return head.length === 8 ? head : null;
  // '::' stands for one group of zeros at least.
  const missing = 8 - head.length - tail.length;
  return missing >= 1 ? [...head, ...new Array<number>(missing).fill(0), ...tail] : null;
}

/** The groups of one side of an IPv6 '::', or null. */
function groups(half: string, dottedTail: boolean): number[] | null {
  if (half === '') return [];
  const out: number[] = [];
  const parts = half.split(':');
  for (const [i, part] of parts.entries()) {
    if (dottedTail && i === parts.length - 1 && part.includes('.')) {
      const v4 = ipv4(part);
      if (!v4) return null;
      const [a = 0, b = 0, c = 0, d = 0] = v4;
      out.push((a << 8) | b, (c << 8) | d);
    } else if (/^[0-9a-f]{1,4}$/i.test(part)) {
      out.push(parseInt(part, 16));
    } else {
      return null;
    }
  }
  return out;
}
