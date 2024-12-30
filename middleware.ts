import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const unprotectedRoutes = ['/login', '/signup'];

export default auth((req) => {
  const isLoggedIn = !!req.auth;

  const isUnprotectedRoute = unprotectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (!isLoggedIn && !isUnprotectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isLoggedIn && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/overview', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
