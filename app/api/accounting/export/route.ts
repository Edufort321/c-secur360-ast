// Accès COMPTABLE read-only (migration 184). GET ?token=...&report=journal|trial&format=csv|json
// Renvoie le grand livre VALIDÉ (journal d'écritures) ou la balance de vérification, en LECTURE SEULE,
// pour le tenant lié au jeton. Aucune écriture, aucune autre donnée. Le jeton est validé via
// service_role (table accountant_tokens, REVOKE anon). Destiné au comptable externe / intégration API.
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const num = (n: any) => (Number(n) || 0).toFixed(2);
const csv = (rows: (string | number)[][]) => '﻿' + rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');

async function journalRows(tenant: string): Promise<(string | number)[][]> {
  const { data } = await supabaseAdmin.from('gl_entries')
    .select('entry_number, entry_date, description, reference, source_type, source_id, gl_journals(code), gl_lines(debit, credit, description, gl_accounts(code, name, type))')
    .eq('tenant_id', tenant).eq('posted', true).order('entry_date', { ascending: true });
  const receipts: Record<string, string> = {};
  try {
    const { data: txns } = await supabaseAdmin.from('commerce_transactions').select('id, receipt_url').eq('tenant_id', tenant).not('receipt_url', 'is', null);
    for (const t of (txns || []) as any[]) if (t.receipt_url) receipts[t.id] = t.receipt_url;
  } catch { /* indispo */ }
  const rows: (string | number)[][] = [['Date', 'N° écriture', 'Journal', 'Référence', 'Description', 'Compte', 'Nom du compte', 'Type', 'Libellé ligne', 'Débit', 'Crédit', 'Pièce jointe (URL)']];
  for (const e of (data || []) as any[]) {
    const j = (e.gl_journals as any)?.code || '';
    const att = e.source_type === 'transaction' && e.source_id ? (receipts[e.source_id] || '') : '';
    for (const l of (e.gl_lines || []) as any[]) {
      const a = (l.gl_accounts as any) || {};
      rows.push([String(e.entry_date || '').slice(0, 10), e.entry_number || '', j, e.reference || '', e.description || '', a.code || '', a.name || '', a.type || '', l.description || '', num(l.debit), num(l.credit), att]);
    }
  }
  return rows;
}

async function trialRows(tenant: string): Promise<(string | number)[][]> {
  const { data: accs } = await supabaseAdmin.from('gl_accounts').select('id, code, name, type, normal_balance').eq('tenant_id', tenant).order('code');
  const { data: lines } = await supabaseAdmin.from('gl_lines').select('account_id, debit, credit, gl_entries!inner(posted, tenant_id)').eq('tenant_id', tenant);
  const agg: Record<string, { debit: number; credit: number }> = {};
  for (const l of (lines || []) as any[]) { if (!l.gl_entries?.posted) continue; const k = l.account_id; (agg[k] ||= { debit: 0, credit: 0 }); agg[k].debit += Number(l.debit) || 0; agg[k].credit += Number(l.credit) || 0; }
  const rows: (string | number)[][] = [['Compte', 'Nom', 'Type', 'Débit', 'Crédit', 'Solde']];
  let td = 0, tc = 0;
  for (const a of (accs || []) as any[]) {
    const g = agg[a.id] || { debit: 0, credit: 0 };
    if (Math.abs(g.debit) < 0.005 && Math.abs(g.credit) < 0.005) continue;
    const solde = a.normal_balance === 'credit' ? g.credit - g.debit : g.debit - g.credit;
    rows.push([a.code, a.name, a.type, num(g.debit), num(g.credit), num(solde)]); td += g.debit; tc += g.credit;
  }
  rows.push(['', '', 'TOTAL', num(td), num(tc), num(td - tc)]);
  return rows;
}

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const token = u.searchParams.get('token') || '';
  if (!token) return NextResponse.json({ error: 'token requis' }, { status: 401 });
  const { data: tok } = await supabaseAdmin.from('accountant_tokens').select('tenant_id, revoked').eq('token', token).maybeSingle();
  if (!tok || tok.revoked) return NextResponse.json({ error: 'Jeton invalide ou révoqué' }, { status: 403 });
  const tenant = tok.tenant_id as string;
  supabaseAdmin.from('accountant_tokens').update({ last_used_at: new Date().toISOString() }).eq('token', token).then(() => {});

  const report = (u.searchParams.get('report') || 'journal').toLowerCase();
  const format = (u.searchParams.get('format') || 'csv').toLowerCase();
  const rows = report === 'trial' ? await trialRows(tenant) : await journalRows(tenant);

  if (format === 'json') {
    const [head, ...body] = rows;
    return NextResponse.json({ report, tenant, rows: body.map(r => Object.fromEntries((head as string[]).map((h, i) => [h, r[i]]))) });
  }
  const name = `${report === 'trial' ? 'Balance-verification' : 'Journal'}-${tenant}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv(rows), { headers: { 'content-type': 'text/csv;charset=utf-8;', 'content-disposition': `attachment; filename="${name}"` } });
}
