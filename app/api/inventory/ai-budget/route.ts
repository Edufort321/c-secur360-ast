import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, setRenewalRequested } from '@/lib/aiBudget';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Solde du forfait IA d'un tenant (pour le compteur du dashboard + l'admin). Lecture seule.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const tenant = (new URL(req.url).searchParams.get('tenant') || '').trim();
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });
  const b = await getAiBudget(tenant);
  // Détail de consommation PAR MODULE (best-effort ; table absente avant migration -> {}).
  const perModule: Record<string, number> = {};
  try {
    const { data } = await supabaseAdmin.from('ai_usage').select('module, cost_cents').eq('tenant_id', tenant);
    (data || []).forEach((r: any) => { const m = r.module || 'autre'; perModule[m] = (perModule[m] || 0) + (Number(r.cost_cents) || 0); });
  } catch { /* table absente -> {} */ }
  return NextResponse.json({ ...b, perModule });
}

// Le client (admin/abonnement du tenant) demande un renouvellement/ajustement de forfait IA.
// Leve renewal_requested -> la carte du tenant passe au rouge cote super-admin.
export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch { /* corps vide */ }
  const tenant = String(body.tenant || '').trim();
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });
  const requestedTierCents = body.requestedTierCents != null ? Math.max(0, Math.round(Number(body.requestedTierCents) || 0)) : undefined;
  await setRenewalRequested(tenant, true, requestedTierCents);
  return NextResponse.json({ ok: true });
}
