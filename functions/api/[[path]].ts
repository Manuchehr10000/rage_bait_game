import type { D1Like } from '../../server/db';
import { handle, type Env } from '../../server/router';

/**
 * Every /api request on Cloudflare Pages. The API itself is server/router.ts;
 * this only hands it the request and the bindings. Typed with D1's own
 * D1Database, so the compiler checks that the real binding fits server/'s D1Like.
 */
type Bindings = Omit<Env, 'DB'> & { DB?: D1Database };

export const onRequest: PagesFunction<Bindings> = ({ request, env }) => {
  const db: D1Like | undefined = env.DB;
  return handle(request, { ...env, DB: db });
};
