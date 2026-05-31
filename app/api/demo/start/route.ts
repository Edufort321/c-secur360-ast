import { NextRequest, NextResponse } from 'next/server';
import { startDemo } from '@/lib/demo';

export const dynamic = 'force-dynamic';

// Anti-spam IP léger (en mémoire) : la limite principale est par courriel (cf. startDemo).
const IP: Map<string, { count: number; reset: number }> = (globalThis as any).__demoIp || new Map();
(globalThis as any).__demoIp = IP;
function ipOk(ip: string): boolean {
  const now = Date.now(); const e = IP.get(ip);
  if (!e || now > e.reset) { IP.set(ip, { count: 1, reset: now + 10 * 60 * 1000 }); return true; }
  if (e.count >= 10) return false; e.count++; return true;
}

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (!ipOk(ip)) return NextResponse.json({ ok: false, status: 'invalid', message: 'Trop de tentatives, réessayez plus tard.' }, { status: 429 });

  let body: any = {};
  try { body = await req.json(); } catch { /* corps invalide */ }
  const result = await startDemo(String(body?.name || ''), String(body?.email || ''));

  const res = NextResponse.json(result);
  if (result.ok) {
    // Jeton de démo httpOnly (marqueur ; l'expiration + les quotas serveur font foi).
    const token = Buffer.from(`${String(body?.email || '').toLowerCase()}:${Date.now()}`).toString('base64');
    res.cookies.set('demo_token', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: result.remainingSeconds || 3600 });
  }
  return res;
}
