/*
Enhanced Clerk middleware with detailed authentication handling, security headers, and error management
*/

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const isProtectedRoute = (req: NextRequest) => {
  const path = req.nextUrl.pathname;

  // Protect dashboard and todo routes
  if (path.startsWith('/dashboard') || path.startsWith('/todo')) {
    return true;
  }

  // Protect API routes except specific public ones
  if (path.startsWith('/api/')) {
    const isPublicApiRoute = [
      '/api/auth',
      '/api/webhooks',
      '/api/test-auth',
      '/api/_next/static',
      '/api/_next/image',
    ].some((publicPath) => path.startsWith(publicPath));

    return !isPublicApiRoute;
  }

  return false;
};

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/api/webhooks(.*)',
  '/api/test-auth',
  '/_next/static(.*)',
  '/_next/image(.*)',
  '/favicon.ico',
  '/manifest.json',
  '/logo(.*)',
  '/error',
  '/favicon.ico',
];

export default clerkMiddleware(
  async (auth, req) => {
    const { userId, sessionId, getToken, sessionClaims } = await auth();
    const url = new URL(req.url);

    // Debug logging
    console.log(`\n=== Middleware: ${req.method} ${url.pathname} ===`);
    console.log('Auth state:', { userId, sessionId, hasToken: !!getToken });

    // Check if the current route is public
    const isPublicRoute = publicRoutes.some((route) =>
      new RegExp(`^${route.replace(/\*/g, '.*')}$`).test(url.pathname)
    );

    // Handle public routes
    if (isPublicRoute) {
      console.log('Public route, allowing access');
      return NextResponse.next();
    }

    // Handle protected routes
    if (isProtectedRoute(req)) {
      console.log('Protected route, checking authentication...');

      // If user is not signed in, redirect to sign in
      if (!userId) {
        console.log('❌ No user ID found, redirecting to sign in');
        return NextResponse.redirect(new URL('/sign-in', req.url));
      }

      // Get the session token
      const token = await getToken();

      // Add auth info to request headers for server components
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', userId);
      requestHeaders.set('x-session-id', sessionId || '');

      if (token) {
        requestHeaders.set('authorization', `Bearer ${token}`);
      }

      if (sessionClaims?.email) {
        requestHeaders.set('x-user-email', sessionClaims.email as string);
      }

      console.log('✅ User authenticated, proceeding to protected route');
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // For all other routes, allow access
    console.log('Non-protected route, allowing access');
    return NextResponse.next();
  },
  {
    // Disable debug mode in production
    debug: process.env.NODE_ENV !== 'production',

    // Customize the sign-in URL
    signInUrl: '/login',

    // Add more Clerk middleware options as needed
  }
);

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
