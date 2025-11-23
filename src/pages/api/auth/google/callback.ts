import type { APIRoute } from 'astro';
import { exchangeCodeForTokens } from '../../../../lib/google/auth';
import { getSession } from '../../../../lib/auth/session';
import { getDb } from '../../../../lib/db';
import { calendarConnections } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { getGoogleConfig } from '../../../../lib/config';

export const GET: APIRoute = async ({ request, redirect, locals }) => {
  const session = await getSession(request);
  if (!session) {
    return redirect('/auth/login');
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return redirect('/settings?error=google_auth_failed');
  }

  if (!code) {
    return redirect('/settings?error=no_code');
  }

  try {
    const config = getGoogleConfig(locals.runtime?.env);
    const tokens = await exchangeCodeForTokens(code, config);

    // In a real app, we should encrypt the refresh token
    // For now, we'll store it as is (or base64 encoded)
    // The schema says `refreshToken` is required.

    if (!tokens.refresh_token) {
        console.warn('No refresh token received from Google');
    }

    const db = getDb(locals.runtime.env);

    // Check if connection exists
    const existing = await db.select().from(calendarConnections)
        .where(eq(calendarConnections.userDid, session.did))
        .get();

    if (existing) {
        await db.update(calendarConnections)
            .set({
                refreshToken: tokens.refresh_token || existing.refreshToken, // Keep old if new one missing
                lastSyncAt: Math.floor(Date.now() / 1000)
            })
            .where(eq(calendarConnections.userDid, session.did))
            .run();
    } else {
        await db.insert(calendarConnections)
            .values({
                id: crypto.randomUUID(),
                userDid: session.did,
                provider: 'google',
                refreshToken: tokens.refresh_token || '', // Fallback empty if missing (shouldn't happen with consent)
                lastSyncAt: Math.floor(Date.now() / 1000)
            })
            .run();
    }

    return redirect('/settings?success=google_connected');
  } catch (err) {
    console.error('Error in Google callback:', err);
    return redirect('/settings?error=callback_failed');
  }
};
