import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Données PUBLIQUES d'une fiche article (cible du QR inventaire). Lecture côté serveur via
// service_role, scopée au tenant du QR — les tables (inventory_state, company_settings, projects)
// restent verrouillées par le RLS ; on n'expose que l'article scanné + le branding + les projets.
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { tenant: string; id: string } }) {
  const tenant = String(params?.tenant || '');
  const id = String(params?.id || '');
  if (!tenant || !id) return NextResponse.json({ found: false, error: 'bad_request' }, { status: 400 });

  const [invRes, csRes, prRes] = await Promise.all([
    supabaseAdmin.from('inventory_state').select('data').eq('tenant_id', tenant).maybeSingle(),
    supabaseAdmin.from('company_settings').select('logo_url, legal_name').eq('tenant_id', tenant).maybeSingle(),
    supabaseAdmin.from('projects').select('project_number, title, submission_number').eq('tenant_id', tenant).order('project_number', { ascending: false }),
  ]);

  const snap: any = (invRes.data as any)?.data || {};
  const list: any[] = Array.isArray(snap.items) ? snap.items : [];
  const item = list.find((i: any) => String(i.id) === id || i.code === id) || null;
  const cs = csRes.data as any;
  const projects = Array.isArray(prRes.data) ? (prRes.data as any[]).filter((p: any) => p.project_number) : [];

  return NextResponse.json({
    found: !!item,
    logo: cs?.logo_url || null,
    tenantName: cs?.legal_name || '',
    item,
    reasonCodes: Array.isArray(snap.reasonCodes) ? snap.reasonCodes : [],
    projects,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
