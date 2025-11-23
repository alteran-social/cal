import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// This is a placeholder for the actual DB setup
// In a real Cloudflare Workers environment, we'd get the D1 binding from the env
// For now, we'll try to use a global if available, or throw an error if not in context
// Note: In Astro SSR with Cloudflare adapter, `context.locals.runtime.env.DB` is how we access it.

// However, since we are importing this in `src/lib/google/auth.ts` which might be used outside
// of a request context in some cases, we need to be careful.

// For the purpose of this exercise and given the file structure,
// we will expect the DB to be passed or accessed via the Astro locals in the API routes.

// But wait, `src/lib/google/auth.ts` imported `db` from `../db` in my previous step?
// I need to check if `src/lib/db/index.ts` exists.
// The `list_files` showed only `schema.ts`.
// I made a mistake in `src/lib/google/auth.ts` import.
// I will create `src/lib/db/index.ts` to export a helper function to get the DB.

export function getDb(env: any) {
  if (!env.DB) {
    throw new Error('D1 Database binding (DB) not found in environment');
  }
  return drizzle(env.DB, { schema });
}
