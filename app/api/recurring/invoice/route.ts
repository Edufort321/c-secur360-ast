import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateInvoiceForSubscription } from '@/lib/recurringServer';

// « Facturer maintenant » : génère une facture depuis un abonnement récurrent. Auth requise ;
// super_admin peut cibler le tenant de la page.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const effTenant = (u: any, t?: string | null) => (u?.role === 'super_admin' && t ? String(t) : (u?.tenant_id || ''));

export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effTenant(u, body.tenant);
  if (!tenant || !body.id) return NextResponse.json({ error: 'tenant/id requis' }, { status: 400 });
  const { data: sub } = await supabaseAdmin.from('recurring_subscriptions').select('*').eq('id', body.id).eq('tenant_id', tenant).maybeSingle();
  if (!sub) return NextResponse.json({ error: 'Abonnement introuvable' }, { status: 404 });
  try {
    const invId = await generateInvoiceForSubscription(tenant, sub as any);
    return NextResponse.json({ ok: true, invoiceId: invId });
  } catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 400 }); }
}
