import type { APIRoute } from 'astro';
import { completeOAuthFlow } from '../../../lib/auth/oauth';
import { createSessionCookie } from '../../../lib/auth/session';

export const GET: APIRoute = async ({ url, redirect, cookies }) => {
  try {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      return redirect('/auth/login?error=missing_params', 302);
    }

    // Complete OAuth flow and get session token
    const sessionToken = await completeOAuthFlow(code, state);

    // Set session cookie
    const cookieHeader = createSessionCookie(sessionToken);
    
    // Redirect to dashboard
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/dashboard',
        'Set-Cookie': cookieHeader,
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return redirect('/auth/login?error=oauth_failed', 302);
  }
};
