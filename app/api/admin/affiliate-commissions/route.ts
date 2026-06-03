// Route admin — commissions d'affiliation co-vendeur (#63).
// GET                      -> { commissions } : toutes les commissions (a venir + payees), triees par echeance.
// GET ?status=pending      -> filtre par statut (pending/paid/cancelled).
// GET ?vendorId=...        -> commissions du vendeur + bundle « fiche vendeur » : { vendor, clients, commissions }
//   ou clients = clients affilies (tenants.vendor_id) avec leur contrat d'affiliation (actif = signe).
// Gardee par requireAdmin. Service-role via supabaseAdmin. Degrade en liste vide si tables absentes.
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

async function tenantNames(ids: string[]): Promise<Record<string, string>> {
  const names: Record<string, string> = {};
  if (!ids.length) return names;
  const { data } = await supabaseAdmin.from('tenants').select('id, companyName').in('id', ids);
  for (const t of data || []) names[(t as any).id] = (t as any).companyName || (t as any).id;
  return names;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const sp = req.nextUrl.searchParams;
  const vendorId = sp.get('vendorId');
  const status = sp.get('status');

  // Commissions (jointes au nom du vendeur), enrichies du nom du client.
  let q = supabaseAdmin
    .from('vendor_commissions')
    .select('*, vendors(name)')
    .order('due_date', { ascending: true, nullsFirst: false });
  if (vendorId) q = q.eq('vendor_id', vendorId);
  if (status) q = q.eq('status', status);

  const { data: rawComms, error: commErr } = await q;
  const comms = commErr ? [] : (rawComms || []);
  const names = await tenantNames(Array.from(new Set(comms.map((c: any) => c.tenant_id))));
  const commissions = comms.map((c: any) => ({
    ...c,
    vendor_name: c.vendors?.name || null,
    tenant_name: names[c.tenant_id] || c.tenant_id,
  }));

  // Mode liste (dashboard) : commissions seules.
  if (!vendorId) return NextResponse.json({ commissions });

  // Mode fiche vendeur : vendeur + clients affilies + contrats.
  const { data: vendor } = await supabaseAdmin.from('vendors').select('*').eq('id', vendorId).maybeSingle();

  let clients: any[] = [];
  const { data: assigned } = await supabaseAdmin
    .from('tenants').select('id, companyName, created_at').eq('vendor_id', vendorId);
  const tids = (assigned || []).map((t: any) => t.id);
  const contractByTenant: Record<string, any> = {};
  if (tids.length) {
    const { data: contracts } = await supabaseAdmin
      .from('tenant_affiliate_contracts').select('*').in('tenant_id', tids);
    for (const k of contracts || []) contractByTenant[(k as any).tenant_id] = k;
  }
  clients = (assigned || []).map((t: any) => ({
    tenant_id: t.id,
    tenant_name: t.companyName || t.id,
    created_at: t.created_at || null,
    contract: contractByTenant[t.id] || null,
  }));

  return NextResponse.json({ vendor: vendor || null, clients, commissions });
}
