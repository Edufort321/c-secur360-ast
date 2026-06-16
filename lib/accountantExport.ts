// « Transmettre au comptable » — export du grand livre dans un format standard, importable par la
// plupart des logiciels comptables (journal d'écritures + balance de vérification). CSV Excel fr-CA
// (séparateur ';', BOM UTF-8). Lecture seule sur le GL (aucun postage). Voir aussi la route serveur
// /api/accounting/export pour un accès API/lien read-only au comptable.
import { supabase } from '@/lib/supabase';
import { getCompanySettings } from '@/lib/invoicing';

const num = (n: number) => (Number(n) || 0).toFixed(2);

function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const content = '﻿' + rows.map(r => r.map(esc).join(';')).join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Journal d'écritures : une ligne par ligne d'écriture VALIDÉE (posted). Format standard importable. */
export async function buildJournalRows(tenant: string): Promise<(string | number)[][]> {
  const { data, error } = await supabase.from('gl_entries')
    .select('entry_number, entry_date, description, reference, posted, source_type, source_id, gl_journals(code), gl_lines(debit, credit, description, gl_accounts(code, name, type))')
    .eq('tenant_id', tenant).eq('posted', true).order('entry_date', { ascending: true });
  if (error) throw error;
  // Pièces jointes : reçu de la transaction source (le comptable y accède via l'URL dans le CSV).
  const receipts: Record<string, string> = {};
  try {
    const { data: txns } = await supabase.from('commerce_transactions').select('id, receipt_url').eq('tenant_id', tenant).not('receipt_url', 'is', null);
    for (const t of (txns || []) as any[]) if (t.receipt_url) receipts[t.id] = t.receipt_url;
  } catch { /* receipt_url indispo -> colonne vide */ }
  const rows: (string | number)[][] = [[
    'Date', 'N° écriture', 'Journal', 'Référence', 'Description', 'Compte', 'Nom du compte', 'Type', 'Libellé ligne', 'Débit', 'Crédit', 'Pièce jointe (URL)',
  ]];
  for (const e of (data || []) as any[]) {
    const jcode = (e.gl_journals as any)?.code || '';
    const att = e.source_type === 'transaction' && e.source_id ? (receipts[e.source_id] || '') : '';
    for (const l of (e.gl_lines || []) as any[]) {
      const a = (l.gl_accounts as any) || {};
      rows.push([
        String(e.entry_date || '').slice(0, 10), e.entry_number || '', jcode, e.reference || '', e.description || '',
        a.code || '', a.name || '', a.type || '', l.description || '', num(l.debit), num(l.credit), att,
      ]);
    }
  }
  return rows;
}

/** Balance de vérification : un compte par ligne (débit total, crédit total, solde net). */
export async function buildTrialBalanceRows(tenant: string): Promise<(string | number)[][]> {
  const { data: accs } = await supabase.from('gl_accounts').select('id, code, name, type, normal_balance').eq('tenant_id', tenant).order('code');
  const { data: lines } = await supabase.from('gl_lines')
    .select('account_id, debit, credit, gl_entries!inner(posted, tenant_id)').eq('tenant_id', tenant);
  const agg: Record<string, { debit: number; credit: number }> = {};
  for (const l of (lines || []) as any[]) {
    if (!l.gl_entries?.posted) continue;
    const k = l.account_id; (agg[k] ||= { debit: 0, credit: 0 });
    agg[k].debit += Number(l.debit) || 0; agg[k].credit += Number(l.credit) || 0;
  }
  const rows: (string | number)[][] = [['Compte', 'Nom', 'Type', 'Débit', 'Crédit', 'Solde']];
  let td = 0, tc = 0;
  for (const a of (accs || []) as any[]) {
    const g = agg[a.id] || { debit: 0, credit: 0 };
    if (Math.abs(g.debit) < 0.005 && Math.abs(g.credit) < 0.005) continue;
    const solde = a.normal_balance === 'credit' ? g.credit - g.debit : g.debit - g.credit;
    rows.push([a.code, a.name, a.type, num(g.debit), num(g.credit), num(solde)]);
    td += g.debit; tc += g.credit;
  }
  rows.push(['', '', 'TOTAL', num(td), num(tc), num(td - tc)]);
  return rows;
}

/** Télécharge le journal d'écritures (CSV). */
export async function exportJournalCsv(tenant: string): Promise<void> {
  const company = await getCompanySettings(tenant);
  const slug = (company?.legal_name || tenant).replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 40);
  downloadCsv(`Journal-${slug}-${new Date().toISOString().slice(0, 10)}.csv`, await buildJournalRows(tenant));
}

/** Télécharge la balance de vérification (CSV). */
export async function exportTrialBalanceCsv(tenant: string): Promise<void> {
  const company = await getCompanySettings(tenant);
  const slug = (company?.legal_name || tenant).replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 40);
  downloadCsv(`Balance-verification-${slug}-${new Date().toISOString().slice(0, 10)}.csv`, await buildTrialBalanceRows(tenant));
}
