import { NextRequest, NextResponse } from 'next/server';
import { aiGuard } from '@/lib/aiGuard';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Secrets vidéo du tenant (clé API D-ID — « bring-your-own-key »). Le tenant gère/paie sa propre conso
// vidéo. Lecture/écriture SERVEUR uniquement (service_role). On ne RENVOIE JAMAIS la clé au client :
// GET => seulement un booléen « configurée ». Scopé au tenant de la session.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const tenant = String((guard.user as any)?.tenant_id || new URL(req.url).searchParams.get('tenant') || '').trim();
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });
  const { data } = await supabaseAdmin.from('tenant_secrets').select('did_api_key').eq('tenant_id', tenant).maybeSingle();
  return NextResponse.json({ ok: true, hasDid: !!(data?.did_api_key) });
}

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const tenant = String((guard.user as any)?.tenant_id || '').trim();
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  // Vider la clé (chaîne vide) = revenir à « non configurée ».
  const key = typeof body.did_api_key === 'string' ? body.did_api_key.trim() : null;
  if (key === null) return NextResponse.json({ error: 'did_api_key requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from('tenant_secrets').upsert({ tenant_id: tenant, did_api_key: key || null, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, hasDid: !!key });
}
