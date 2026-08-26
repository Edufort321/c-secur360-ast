import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Données PUBLIQUES d'une fiche transformateur (cible du QR DGA). Lecture côté serveur via
// service_role, scopée au tenant+id du QR — les tables (dga_*, company_settings, tenants,
// planner_succursales) restent verrouillées par le RLS ; on n'expose que le petit payload public.
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { tenant: string; id: string } }) {
  const tenant = String(params?.tenant || '');
  const id = String(params?.id || '');
  if (!tenant || !id) return NextResponse.json({ found: false, error: 'bad_request' }, { status: 400 });

  const { data: dossier } = await supabaseAdmin
    .from('dga_dossiers').select('*').eq('tenant_id', tenant).eq('id', id).maybeSingle();
  if (!dossier) {
    return NextResponse.json({ found: false }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  const [measuresRes, csRes, succRes] = await Promise.all([
    supabaseAdmin.from('dga_measures').select('*').eq('tenant_id', tenant).eq('dossier_id', id).order('sample_date', { ascending: true }),
    supabaseAdmin.from('company_settings').select('logo_url, legal_name').eq('tenant_id', tenant).maybeSingle(),
    supabaseAdmin.from('planner_succursales').select('id, name, code, type, parent_id').eq('tenant_id', tenant).order('name'),
  ]);

  const cs = csRes.data as any;
  let tenantName = cs?.legal_name || '';
  if (!tenantName) {
    const { data: t } = await supabaseAdmin.from('tenants').select('name').eq('subdomain', tenant).maybeSingle();
    tenantName = (t as any)?.name || '';
  }

  // Arbre des sites (même forme que lib/sites.getSitesTree, pour siteLabel côté page).
  const rows = (succRes.data as any[]) || [];
  const sites = rows.filter(r => !r.parent_id).map(s => ({
    id: s.id, name: s.name, code: s.code,
    departments: rows.filter(r => r.parent_id === s.id).map(d => ({ id: d.id, name: d.name, code: d.code })),
  }));

  return NextResponse.json({
    found: true,
    logo: cs?.logo_url || null,
    tenantName,
    dossier,
    measures: measuresRes.data || [],
    sites,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
