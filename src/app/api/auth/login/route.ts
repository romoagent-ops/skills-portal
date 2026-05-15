import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getPortalPassword, getSessionToken, isAuthConfigured, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ ok: false, error: 'auth_not_configured' }, { status: 500 });
  }

  const formData = await request.formData();
  const password = String(formData.get('password') ?? '');

  if (password !== getPortalPassword()) {
    return NextResponse.redirect(new URL('/login', request.url), { status: 302 });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, getSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.redirect(new URL('/', request.url), { status: 302 });
}
