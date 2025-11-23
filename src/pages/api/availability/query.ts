import type { APIRoute } from 'astro';
import { getComputableAvailability } from '../../../lib/availability/engine';
import { getDb } from '../../../lib/db';
import { calendarConnections } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { getGoogleConfig } from '../../../lib/config';

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const userDid = url.searchParams.get('did');
  const startParam = url.searchParams.get('start');
  const endParam = url.searchParams.get('end');

  if (!userDid || !startParam || !endParam) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
  }

  const start = new Date(startParam);
  const end = new Date(endParam);

  try {
    // Fetch user's calendar connection to get refresh token
    // We assume the DID is public, but we need the DB to get the token
    // The engine handles the logic if token is null (returns raw availability)

    let refreshToken = null;

    if (locals.runtime?.env?.DB) {
       const db = getDb(locals.runtime.env);
       const connection = await db.select().from(calendarConnections)
         .where(eq(calendarConnections.userDid, userDid))
         .get();

       if (connection) {
         refreshToken = connection.refreshToken;
       }
    }

    const config = getGoogleConfig(locals.runtime?.env);
    // If we don't have secrets (e.g. config incomplete), engine will skip busy check gracefully if configured to do so,
    // or we might want to log a warning. Engine takes `config | undefined`.
    // If config is missing secrets, getComputableAvailability won't be able to fetch busy times.

    const slots = await getComputableAvailability(
        userDid,
        refreshToken,
        start,
        end,
        (config.clientId && config.clientSecret) ? { clientId: config.clientId, clientSecret: config.clientSecret } : undefined
    );

    return new Response(JSON.stringify({ slots }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Availability Query Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
