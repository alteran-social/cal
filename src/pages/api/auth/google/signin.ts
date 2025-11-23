import type { APIRoute } from 'astro';
import { generateAuthUrl } from '../../../../lib/google/auth';
import { getSession } from '../../../../lib/auth/session';
import { getGoogleConfig } from '../../../../lib/config';

export const GET: APIRoute = async ({ request, redirect, locals }) => {
  const session = await getSession(request);
  if (!session) {
    return redirect('/auth/login');
  }

  try {
    const config = getGoogleConfig(locals.runtime?.env);
    const url = generateAuthUrl(config);
    return redirect(url);
  } catch (error) {
    console.error('Google OAuth Error:', error);
    return new Response('Failed to initialize Google OAuth', { status: 500 });
  }
};
