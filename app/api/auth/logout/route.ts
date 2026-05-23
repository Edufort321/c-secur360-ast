import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { destroySession, AUTH_COOKIE } from '@/lib/auth';

export async function POST() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (token) {
    try { await destroySession(token); } catch { /* ignore */ }
  }
  cookies().delete(AUTH_COOKIE);
  return NextResponse.json({ ok: true });
}
