import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('gv_admin_session');
  const isAuthenticated = Boolean(sessionCookie && sessionCookie.value);

  // 1. Admin UI route protection
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';

    // Unauthenticated user trying to access protected admin page
    if (!isAuthenticated && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated user trying to access login page
    if (isAuthenticated && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // 2. Admin API route protection
  if (pathname.startsWith('/api/admin')) {
    const isLoginEndpoint = pathname === '/api/admin/auth/login';

    if (!isAuthenticated && !isLoginEndpoint) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
