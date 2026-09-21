import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_LOCALE = 'ar';
const SUPPORTED_LOCALES = ['ar', 'en'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the pathname already has a locale
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Redirect to default locale with auth path
  if (pathname === '/login') {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}/auth/login`, request.url)
    );
  }

  if (pathname === '/signup' || pathname === '/register') {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}/auth/register`, request.url)
    );
  }

  if (pathname === '/forgot-password') {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}/auth/reset-password`, request.url)
    );
  }

  if (pathname === '/verify-email') {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}/auth/verify-email`, request.url)
    );
  }

  // Redirect root to default locale Home
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}`, request.url)
    );
  }

  // Redirect other paths to default locale
  if (pathname.startsWith('/') && !pathnameHasLocale) {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any path with a file extension (images, fonts, icons, robots.txt,
     *   etc. served from /public — these are served at the URL root, not
     *   under a literal "/public" prefix, so the old "public" exclusion
     *   above never actually matched anything and these requests were
     *   being redirected to a non-existent /ar/images/... route)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
