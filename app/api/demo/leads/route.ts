import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// Liste des leads démo (nom + courriel + usage). Réservé à l'admin (cookie dashboard / super_admin / secret sync).
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  // Tolérant : les colonnes de relance (114) peuvent ne pas être déployées → repli sans elles.
  let res: any = await supabaseAdmin
    .from('demo_sessions')
    .select('email, name, phone, status, attempts, total_seconds, first_seen, last_start, session_expires_at, contacted_at, contact_count, contact_notes')
    .order('first_seen', { ascending: false })
    .limit(500);
  if (res.error) {
    res = await supabaseAdmin
      .from('demo_sessions')
      .select('email, name, status, attempts, total_seconds, first_seen, last_start, session_expires_at')
      .order('first_seen', { ascending: false })
      .limit(500);
  }
  if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });
  return NextResponse.json({ leads: res.data || [] });
}

// POST /api/demo/leads { email, notes? } → marque le lead comme relancé (horodatage + compteur + notes).
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  let body: any = {};
  try { body = await req.json(); } catch { /* corps vide */ }
  const email = (body.email || '').trim();
  if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 });

  const { data: cur } = await supabaseAdmin.from('demo_sessions').select('contact_count').eq('email', email).maybeSingle();
  const patch: any = { contacted_at: new Date().toISOString(), contact_count: ((cur?.contact_count as number) || 0) + 1, updated_at: new Date().toISOString() };
  if (typeof body.notes === 'string') patch.contact_notes = body.notes;

  let res: any = await supabaseAdmin.from('demo_sessions').update(patch).eq('email', email).select('email').maybeSingle();
  if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });
  return NextResponse.json({ ok: true, contact_count: patch.contact_count });
}
