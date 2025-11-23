import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../lib/auth/session';

export const POST: APIRoute = async ({ redirect }) => {
  // Clear session cookie
  const cookieHeader = clearSessionCookie();
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/',
      'Set-Cookie': cookieHeader,
    },
  });
};

export const GET: APIRoute = async ({ redirect }) => {
  // Clear session cookie
  const cookieHeader = clearSessionCookie();
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/',
      'Set-Cookie': cookieHeader,
    },
  });
};
