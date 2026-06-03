import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// #74 — Endpoint READ-ONLY de partage selectif. Le client pompe SES donnees vers son serveur/ERP.
// Auth : en-tete `x-api-key: csk_...` ou `Authorization: Bearer csk_...`. La cle identifie le tenant
// et les modules autorises (tenant_api_keys.modules). Aucune ecriture possible ici.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Carte module -> ressources (tables reelles). Doit refleter ERP_MODULES (lib/erpSharing.ts).
const MODULE_RESOURCES: Record<string, { name: string; table: string }[]> = {
  financial: [{ name: 'transactions', table: 'commerce_transactions' }, { name: 'invoices', table: 'commerce_invoices' }, { name: 'ledger', table: 'gl_entries' }],
  timesheets: [{ name: 'timesheets', table: 'timesheets' }, { name: 'expenses', table: 'timesheet_expenses' }],
  personnel: [{ name: 'personnel', table: 'planner_personnel' }],
  projects: [{ name: 'projects', table: 'projects' }],
  inventory: [{ name: 'items', table: 'items' }, { name: 'locations', table: 'item_locations' }],
  incidents: [{ name: 'incidents', table: 'incident_reports' }],
};

function readKey(req: NextRequest): string | null {
  const x = req.headers.get('x-api-key');
  if (x) return x.trim();
  const auth = req.headers.get('authorization');
  if (auth && /^bearer\s+/i.test(auth)) return auth.replace(/^bearer\s+/i, '').trim();
  return null;
}

// Lecture tolerante : filtre tenant_id puis tenantId si la colonne snake n'existe pas.
async function fetchTable(table: string, tenant: string, limit: number, offset: number) {
  let res: any = await supabaseAdmin.from(table).select('*').eq('tenant_id', tenant).range(offset, offset + limit - 1);
  if (res.error && /column .*tenant_id.* does not exist/i.test(res.error.message || '')) {
    res = await supabaseAdmin.from(table).select('*').eq('tenantId', tenant).range(offset, offset + limit - 1);
  }
  return res;
}

export async function GET(req: NextRequest, { params }: { params: { module: string } }) {
  const mod = params.module;
  const resources = MODULE_RESOURCES[mod];
  if (!resources) return NextResponse.json({ error: 'module inconnu', available: Object.keys(MODULE_RESOURCES) }, { status: 404 });

  const key = readKey(req);
  if (!key) return NextResponse.json({ error: 'cle API requise (x-api-key ou Authorization: Bearer)' }, { status: 401 });

  const { data: row, error: keyErr } = await supabaseAdmin.from('tenant_api_keys').select('tenant_id, enabled, modules').eq('api_key', key).maybeSingle();
  if (keyErr) return NextResponse.json({ error: keyErr.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: 'cle API invalide' }, { status: 401 });
  if (!row.enabled) return NextResponse.json({ error: 'partage API desactive pour ce tenant' }, { status: 403 });

  const modules = (row.modules || {}) as Record<string, boolean>;
  if (!modules[mod]) return NextResponse.json({ error: `module "${mod}" non autorise pour ce tenant` }, { status: 403 });

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 500, 1), 2000);
  const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);

  const out: Record<string, any> = {};
  for (const r of resources) {
    const res = await fetchTable(r.table, row.tenant_id, limit, offset);
    // Table absente / inaccessible -> ressource vide (ne casse pas tout le module).
    out[r.name] = res.error ? [] : (res.data || []);
  }

  // Trace d'usage (best-effort, n'echoue pas la requete).
  try { await supabaseAdmin.from('tenant_api_keys').update({ last_used_at: new Date().toISOString() }).eq('api_key', key); } catch { /* noop */ }

  return NextResponse.json({ tenant: row.tenant_id, module: mod, limit, offset, data: out }, { headers: { 'Cache-Control': 'no-store' } });
}
