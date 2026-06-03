// Rapprochement bancaire (#35) — import de releve CSV et rapprochement aux transactions.
// Parseur tolerant : detecte le separateur (',' ou ';'), un eventuel en-tete, et les colonnes
// date / description / montant (ou debit+credit separes). Aucune dependance externe.
import { supabase } from '@/lib/supabase';

export type BankLine = {
  id?: string;
  stmt_date: string;
  description: string;
  amount: number; // + credit (entree) / - debit (sortie)
  matched_transaction_id?: string | null;
  reconciled?: boolean;
};

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/** Parse un montant texte FR/EN ("1 234,56", "1,234.56", "-45.00 $") -> nombre. */
function parseAmount(s: string): number {
  let t = String(s ?? '').replace(/[^\d.,-]/g, '').trim();
  if (!t) return 0;
  if (t.includes(',') && t.includes('.')) t = t.replace(/,/g, '');      // 1,234.56 -> 1234.56
  else if (t.includes(',')) t = t.replace(',', '.');                    // 1234,56  -> 1234.56
  const n = parseFloat(t);
  return isNaN(n) ? 0 : n;
}

/** Normalise une date vers YYYY-MM-DD (accepte deja-ISO ou JJ/MM/AAAA — defaut CA/FR). */
function normDate(s: string): string {
  const v = String(s ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const m = v.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m) {
    let [, a, b, c] = m;
    if (c.length === 2) c = '20' + c;
    return `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`; // JJ/MM/AAAA
  }
  return v;
}

/** Decoupe une ligne CSV en respectant les guillemets doubles. */
function splitCsvLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === delim) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

/** Parse un releve bancaire CSV -> lignes. Heuristique d'en-tete + colonnes. */
export function parseBankCsv(text: string): BankLine[] {
  const lines = String(text ?? '').split(/\r?\n/).filter(l => l.trim().length);
  if (!lines.length) return [];
  const delim = lines[0].split(';').length > lines[0].split(',').length ? ';' : ',';
  const head = splitCsvLine(lines[0], delim).map(h => h.toLowerCase());
  const hasHeader = head.some(h => /date|montant|amount|desc|libell|débit|debit|crédit|credit/.test(h));
  const find = (re: RegExp) => head.findIndex(h => re.test(h));
  let iDate = 0, iDesc = 1, iAmt = 2, iDr = -1, iCr = -1, start = 0;
  if (hasHeader) {
    start = 1;
    iDate = find(/date/); iDesc = find(/desc|libell|détail|detail|narration/);
    iAmt = find(/montant|amount|^total/);
    iDr = find(/débit|debit|retrait|withdraw/); iCr = find(/crédit|credit|dépôt|depot|deposit/);
    if (iDate < 0) iDate = 0;
    if (iDesc < 0) iDesc = 1;
  }
  const out: BankLine[] = [];
  for (let i = start; i < lines.length; i++) {
    const c = splitCsvLine(lines[i], delim);
    if (!c.length) continue;
    const amount = (iCr >= 0 || iDr >= 0)
      ? r2((iCr >= 0 ? parseAmount(c[iCr]) : 0) - (iDr >= 0 ? parseAmount(c[iDr]) : 0))
      : r2(parseAmount(c[iAmt >= 0 ? iAmt : 2]));
    const stmt_date = normDate(c[iDate >= 0 ? iDate : 0]);
    const description = (c[iDesc >= 0 ? iDesc : 1] || '').slice(0, 300);
    if (!stmt_date && !description && !amount) continue;
    out.push({ stmt_date, description, amount, reconciled: false, matched_transaction_id: null });
  }
  return out;
}

export async function getBankLines(tenant: string): Promise<BankLine[]> {
  const { data, error } = await supabase.from('bank_statement_lines')
    .select('*').eq('tenant_id', tenant).order('stmt_date', { ascending: false });
  if (error) throw error;
  return (data || []) as BankLine[];
}

export async function insertBankLines(tenant: string, lines: BankLine[]): Promise<void> {
  if (!lines.length) return;
  const rows = lines.map(l => ({
    tenant_id: tenant, stmt_date: l.stmt_date || null, description: l.description || '',
    amount: r2(l.amount), matched_transaction_id: l.matched_transaction_id ?? null,
    reconciled: !!l.reconciled,
  }));
  const { error } = await supabase.from('bank_statement_lines').insert(rows);
  if (error) throw error;
}

export async function updateBankLine(tenant: string, id: string, patch: Partial<BankLine>): Promise<void> {
  const { error } = await supabase.from('bank_statement_lines').update(patch).eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}

export async function deleteBankLine(tenant: string, id: string): Promise<void> {
  const { error } = await supabase.from('bank_statement_lines').delete().eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}
