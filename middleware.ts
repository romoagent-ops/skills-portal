import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { buildExternalUrl, SESSION_COOKIE } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const expected = process.env.SKILLS_PORTAL_SESSION_TOKEN;
  const current = request.cookies.get(SESSION_COOKIE)?.value;

  if (!expected || current !== expected) {
    return NextResponse.redirect(buildExternalUrl(request, '/login'));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
