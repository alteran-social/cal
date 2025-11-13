/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

import type { SessionData } from './lib/auth/session';

declare global {
  namespace App {
    interface Locals {
      session?: SessionData | null;
    }

    interface Platform {
      env: {
        DB: D1Database;
        SESSION: KVNamespace;
      };
    }
  }
}

export {};
