import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { flinksConfigured, flinksConnectUrl } from '@/lib/flinks';
import { syncBankConnection } from '@/lib/bankSync';

// Connexion bancaire temps réel (Flinks). Auth requise ; super_admin peut cibler le tenant de la page.
//  GET                          -> { configured, connectUrl, connections }
//  POST { action:'connect', loginId, institution?, treasury_account_id? }
//  POST { action:'sync', connectionId? }   -> synchronise (toutes ou une connexion)
//  POST { action:'disconnect', connectionId }
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const effTenant = (u: any, t?: string | null) => (u?.role === 'super_admin' && t ? String(t) : (u?.tenant_id || ''));

export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = effTenant(u, new URL(req.url).searchParams.get('tenant'));
  const { data } = await supabaseAdmin.from('bank_connections').select('id, institution, account_mask, status, last_sync_at, last_error, treasury_account_id').eq('tenant_id', tenant).order('created_at', { ascending: false });
  return NextResponse.json({ configured: flinksConfigured(), connectUrl: flinksConnectUrl(), connections: data || [] });
}

export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effTenant(u, body.tenant);
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });

  if (body.action === 'connect') {
    if (!flinksConfigured()) return NextResponse.json({ error: 'Flinks non configuré (clés FLINKS_*).' }, { status: 503 });
    if (!body.loginId) return NextResponse.json({ error: 'loginId requis' }, { status: 400 });
    const { data: conn, error } = await supabaseAdmin.from('bank_connections').insert({
      tenant_id: tenant, provider: 'flinks', login_id: String(body.loginId), institution: body.institution || null,
      treasury_account_id: body.treasury_account_id || null,
    }).select('*').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    try { const r = await syncBankConnection(tenant, conn); return NextResponse.json({ ok: true, id: (conn as any).id, inserted: r.inserted }); }
    catch (e: any) { return NextResponse.json({ ok: true, id: (conn as any).id, inserted: 0, warning: e?.message }); }
  }

  if (body.action === 'sync') {
    let q = supabaseAdmin.from('bank_connections').select('*').eq('tenant_id', tenant).eq('status', 'active');
    if (body.connectionId) q = q.eq('id', body.connectionId);
    const { data: conns } = await q;
    let inserted = 0; const errors: string[] = [];
    for (const c of (conns as any[]) || []) { try { inserted += (await syncBankConnection(tenant, c)).inserted; } catch (e: any) { errors.push(e?.message || 'erreur'); } }
    return NextResponse.json({ ok: true, inserted, errors });
  }

  if (body.action === 'disconnect') {
    if (!body.connectionId) return NextResponse.json({ error: 'connectionId requis' }, { status: 400 });
    await supabaseAdmin.from('bank_connections').delete().eq('id', body.connectionId).eq('tenant_id', tenant);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'action inconnue' }, { status: 400 });
}
