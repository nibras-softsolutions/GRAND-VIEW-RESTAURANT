import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const adminCookie = request.cookies.get('gv_admin_session');
  const isAdminAuthenticated = Boolean(adminCookie && adminCookie.value);

  const deliveryCookie = request.cookies.get('gv_delivery_session');
  const isDeliveryAuthenticated = Boolean(deliveryCookie && deliveryCookie.value);

  // 1. Admin UI route protection (/admin/*)
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';

    // Unauthenticated user trying to access protected admin page
    if (!isAdminAuthenticated && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated admin trying to access login page
    if (isAdminAuthenticated && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // 2. Admin API route protection (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    const isLoginEndpoint = pathname === '/api/admin/auth/login';

    if (!isAdminAuthenticated && !isLoginEndpoint) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }
  }

  // 3. Delivery UI route protection (/delivery/*)
  if (pathname.startsWith('/delivery')) {
    const isDeliveryLoginPage = pathname === '/delivery/login';

    // Unauthenticated delivery person trying to access protected delivery page
    if (!isDeliveryAuthenticated && !isDeliveryLoginPage) {
      const loginUrl = new URL('/delivery/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated delivery person trying to access delivery login
    if (isDeliveryAuthenticated && isDeliveryLoginPage) {
      return NextResponse.redirect(new URL('/delivery', request.url));
    }
  }

  // 4. Delivery API route protection (/api/delivery/*)
  if (pathname.startsWith('/api/delivery')) {
    const isDeliveryLoginEndpoint = pathname === '/api/delivery/auth/login';

    if (!isDeliveryAuthenticated && !isDeliveryLoginEndpoint) {
      return NextResponse.json(
        { error: 'Unauthorized: Delivery authentication required.' },
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
    '/delivery/:path*',
    '/api/delivery/:path*',
  ],
};
