import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/apiAuth';

// Export TENANT (#43) — sauvegarde 1-clic de toutes les données métier d'un tenant dans un seul classeur
// Excel (une feuille par table). Service_role (requireAdmin). Données opérationnelles/comptables ;
// les tables sensibles (auth/sessions/secrets, hash de mot de passe) sont EXCLUES.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

// Tables exportées (toutes scopées par tenant_id). Best-effort : une table absente est ignorée.
const TABLES: string[] = [
  'clients', 'client_sites', 'client_contacts', 'suppliers',
  'projects', 'soumissions', 'soumission_items', 'soumission_lignes',
  'items', 'item_locations', 'movements', 'categories', 'departments',
  'commerce_invoices', 'commerce_invoice_items', 'commerce_transactions', 'commerce_transaction_items',
  'gl_accounts', 'gl_entries', 'gl_lines',
  'planner_succursales', 'planner_personnel', 'timesheets', 'timesheet_entries',
  'company_assets', 'recurring_subscriptions', 'annual_budgets', 'bank_statement_lines',
];

// Aplati une ligne pour Excel : les objets/tableaux (colonnes JSONB) sont sérialisés en texte.
function flatten(row: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = (v !== null && typeof v === 'object') ? JSON.stringify(v) : v;
  }
  return out;
}

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const tenant = String(req.nextUrl.searchParams.get('tenant') || '').trim();
  if (!tenant) return NextResponse.json({ error: 'Paramètre « tenant » requis.' }, { status: 400 });

  const wb = XLSX.utils.book_new();
  const summary: { table: string; rows: number }[] = [];
  const used = new Set<string>();

  for (const table of TABLES) {
    try {
      const { data, error } = await supabaseAdmin.from(table).select('*').eq('tenant_id', tenant).limit(50000);
      if (error || !data || !data.length) { summary.push({ table, rows: data?.length || 0 }); continue; }
      const ws = XLSX.utils.json_to_sheet(data.map(flatten));
      // Nom de feuille : <=31 car., unique.
      let name = table.slice(0, 31);
      let n = 1; while (used.has(name)) { name = `${table.slice(0, 28)}_${n++}`; }
      used.add(name);
      XLSX.utils.book_append_sheet(wb, ws, name);
      summary.push({ table, rows: data.length });
    } catch { summary.push({ table, rows: 0 }); }
  }

  // Feuille de synthèse en tête.
  const info = [
    { info: 'Tenant', valeur: tenant },
    { info: 'Exporté le', valeur: new Date().toISOString() },
    ...summary.map(s => ({ info: s.table, valeur: `${s.rows} ligne(s)` })),
  ];
  const wsInfo = XLSX.utils.json_to_sheet(info);
  XLSX.utils.book_append_sheet(wb, wsInfo, '_export');
  // Place la synthèse en première position.
  wb.SheetNames = ['_export', ...wb.SheetNames.filter(n => n !== '_export')];

  if (wb.SheetNames.length <= 1) return NextResponse.json({ error: 'Aucune donnée à exporter pour ce tenant.' }, { status: 404 });

  const buf: ArrayBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(Buffer.from(buf), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="export_${tenant}_${date}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
