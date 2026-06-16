import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Notifications IN-APP de l'utilisateur connecté (les siennes + les diffusions tenant user_id NULL).
// Service_role + tenant de SESSION (anti-fuite). GET = liste + non-lus ; POST = marquer lu.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  const limit = Math.min(100, Math.max(1, parseInt(new URL(req.url).searchParams.get('limit') || '30', 10) || 30));
  const { data } = await supabaseAdmin.from('notifications')
    .select('*').eq('tenant_id', tenant).or(`user_id.eq.${u.id},user_id.is.null`)
    .order('created_at', { ascending: false }).limit(limit);
  const entries = data || [];
  const unread = entries.filter((n: any) => !n.read_at).length;
  return NextResponse.json({ entries, unread });
}

export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const now = new Date().toISOString();
  if (body.action === 'read_all') {
    await supabaseAdmin.from('notifications').update({ read_at: now }).eq('tenant_id', tenant).or(`user_id.eq.${u.id},user_id.is.null`).is('read_at', null);
    return NextResponse.json({ ok: true });
  }
  if (body.id) {
    await supabaseAdmin.from('notifications').update({ read_at: now }).eq('id', body.id).eq('tenant_id', tenant);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'action requise' }, { status: 400 });
}
