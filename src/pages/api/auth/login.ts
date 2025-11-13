import type { APIRoute } from 'astro';
import { getAuthorizationUrl } from '../../../lib/auth/oauth';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const handle = formData.get('handle') as string;

    if (!handle) {
      return new Response('Handle is required', { status: 400 });
    }

    // Generate OAuth authorization URL
    const authUrl = await getAuthorizationUrl(handle);

    // In production, store state in session/cookie for CSRF protection
    // For now, redirect to authorization URL
    return redirect(authUrl, 302);
  } catch (error) {
    console.error('Login error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
};
