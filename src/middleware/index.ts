import { defineMiddleware } from 'astro:middleware';
import { getSession } from '../lib/auth/session';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/availability'];

// API routes that require authentication
// Note: /api/availability/query must be public for booking pages
const protectedApiRoutes = ['/api/availability'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  // Exclude /api/availability/query from protection
  const isProtectedApiRoute = protectedApiRoutes.some(route =>
    pathname.startsWith(route) && !pathname.startsWith('/api/availability/query')
  );

  if (isProtectedRoute || isProtectedApiRoute) {
    const session = await getSession(context.request);

    if (!session) {
      // Redirect to login for protected pages
      if (isProtectedRoute) {
        return context.redirect('/auth/login');
      }
      // Return 401 for protected API routes
      if (isProtectedApiRoute) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    // Attach session to locals for easy access
    context.locals.session = session;
  }

  return next();
});
