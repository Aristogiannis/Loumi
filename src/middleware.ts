import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Use Node.js runtime to avoid edge runtime issues with postgres
export const runtime = 'nodejs';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env['AUTH_SECRET'] });
  const isLoggedIn = !!token;
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/login/verify', '/api/auth'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // API routes that handle their own auth
  const isApiRoute = pathname.startsWith('/api/');
  const isAuthApiRoute = pathname.startsWith('/api/auth');

  // Static files and Next.js internals
  const isStaticFile =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.');

  if (isStaticFile) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    // Redirect logged-in users away from auth pages
    if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Allow API routes (they handle their own auth)
  if (isApiRoute && !isAuthApiRoute) {
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
