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
  external_id?: string | null;        // identifiant d'opération (OFX FITID) -> dédoublonnage
  treasury_account_id?: string | null;
};

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/** Parse un montant texte FR/EN ("1 234,56", "1,234.56", "-45.00 $", "(45,00)", "45.00 DR") -> nombre. */
function parseAmount(s: string): number {
  const raw = String(s ?? '').trim();
  if (!raw) return 0;
  // Signes de négatif : parenthèses comptables, suffixe DR/Db (débit), tiret.
  const neg = /\(.*\)/.test(raw) || /\b(dr|db|débit|debit)\b/i.test(raw) || /-/.test(raw.replace(/[^\d-]/g, ''));
  let t = raw.replace(/[()]/g, '').replace(/[^\d.,-]/g, '').trim();
  if (!t) return 0;
  if (t.includes(',') && t.includes('.')) t = t.replace(/,/g, '');      // 1,234.56 -> 1234.56
  else if (t.includes(',')) {                                           // virgule = décimale OU séparateur de milliers
    const dec = t.lastIndexOf(',');
    t = (t.slice(0, dec).replace(/[.,]/g, '') + '.' + t.slice(dec + 1)).replace(/[^0-9.\-]/g, '');
  }
  let n = parseFloat(t.replace(/(?!^)-/g, '')); // ignore les tirets internes
  if (isNaN(n)) return 0;
  n = Math.abs(n);
  return neg ? -n : n;
}
const isDateLike = (c: string) => /^\s*\d{4}-\d{1,2}-\d{1,2}/.test(c) || /^\s*\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}\s*$/.test(c);
// « ressemble à un montant » : contient des chiffres + un indice monétaire (décimale, $, signe, parenthèses) et n'est pas une date.
const isAmountLike = (c: string) => !!c && !isDateLike(c) && /\d/.test(c) && /[.,]\d{1,2}\s*$|[$€]|\(|\)|^-|\d-?\s*(dr|cr|db)?$/i.test(c.trim());

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

/** Parse un releve bancaire CSV -> lignes. TOLÉRANT : saute le préambule (n° compte, soldes…),
 *  détecte le séparateur (',' ';' ou tab), l'en-tête où qu'il soit, et les colonnes (montant unique
 *  OU débit/crédit séparés). Si aucun en-tête, infère date / montant / description. */
export function parseBankCsv(text: string): BankLine[] {
  const lines = String(text ?? '').split(/\r?\n/).filter(l => l.trim().length);
  if (!lines.length) return [];
  // Séparateur : celui qui découpe le plus de colonnes en moyenne sur les 1res lignes.
  const sample = lines.slice(0, 10);
  const score = (d: string) => sample.reduce((s, l) => s + splitCsvLine(l, d).length, 0);
  const delim = [';', '\t', ','].sort((a, b) => score(b) - score(a))[0];
  const rows = lines.map(l => splitCsvLine(l, delim));

  // 1) Cherche une LIGNE D'EN-TÊTE dans les 15 premières (date + un indice de montant).
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const lc = rows[i].map(h => h.toLowerCase());
    if (lc.some(h => /date/.test(h)) && lc.some(h => /montant|amount|débit|debit|crédit|credit|retrait|dépôt|depot|withdraw|deposit|solde|balance/.test(h))) { headerIdx = i; break; }
  }
  let iDate = 0, iDesc = 1, iAmt = -1, iDr = -1, iCr = -1, start = 0;
  if (headerIdx >= 0) {
    const head = rows[headerIdx].map(h => h.toLowerCase());
    const find = (re: RegExp) => head.findIndex(h => re.test(h));
    iDate = find(/date/); iDesc = find(/desc|libell|détail|detail|narration|opération|operation|transaction|tiers|payee/);
    iAmt = find(/montant|amount|^total/);
    iDr = find(/débit|debit|retrait|withdraw|sortie/); iCr = find(/crédit|credit|dépôt|depot|deposit|entrée/);
    if (iDate < 0) iDate = 0;
    if (iDesc < 0) iDesc = rows[headerIdx].findIndex((_, k) => k !== iDate && k !== iAmt && k !== iDr && k !== iCr);
    if (iDesc < 0) iDesc = 1;
    start = headerIdx + 1;
  } else {
    // 2) Pas d'en-tête : on démarre à la 1re ligne contenant une DATE, et on infère les colonnes.
    start = rows.findIndex(r => r.some(isDateLike));
    if (start < 0) start = 0;
    const s = rows[start] || [];
    iDate = s.findIndex(isDateLike); if (iDate < 0) iDate = 0;
    const amtCols = s.map((c, k) => ({ k, ok: isAmountLike(c) })).filter(x => x.ok && x.k !== iDate).map(x => x.k);
    iAmt = amtCols.length ? amtCols[0] : -1; // 1re colonne « montant » après la date
    iDesc = s.findIndex((c, k) => k !== iDate && !isAmountLike(c) && (c || '').trim().length > 0);
    if (iDesc < 0) iDesc = s.findIndex((_, k) => k !== iDate && k !== iAmt);
    if (iDesc < 0) iDesc = 1;
  }

  const out: BankLine[] = [];
  for (let i = start; i < rows.length; i++) {
    const c = rows[i];
    if (!c.length || c.every(x => !x.trim())) continue;
    const stmt_date = normDate(c[iDate] || '');
    // Ignore les lignes de SOLDE / report (pas une vraie opération).
    if (/solde|balance|report|total/i.test(c[iDesc >= 0 ? iDesc : 1] || '')) continue;
    let amount: number;
    if (iCr >= 0 || iDr >= 0) amount = r2((iCr >= 0 ? Math.abs(parseAmount(c[iCr])) : 0) - (iDr >= 0 ? Math.abs(parseAmount(c[iDr])) : 0));
    else amount = r2(parseAmount(c[iAmt >= 0 ? iAmt : 2] || ''));
    const description = (c[iDesc >= 0 ? iDesc : 1] || '').slice(0, 300);
    if (!stmt_date && !description && !amount) continue;
    if (!/^\d{4}-\d{2}-\d{2}/.test(stmt_date) && !amount) continue; // ni date valide ni montant -> bruit
    out.push({ stmt_date, description, amount, reconciled: false, matched_transaction_id: null });
  }
  return out;
}

/** Parse un fichier OFX / QFX (Quicken/QuickBooks/Money) — SGML tolérant (balises souvent non fermées).
 *  Chaque opération a un FITID unique → dédoublonnage parfait. Renvoie aussi le n° de compte (ACCTID). */
export function parseOfx(text: string): { lines: BankLine[]; accountNumber?: string } {
  const s = String(text ?? '');
  const accountNumber = (s.match(/<ACCTID>\s*([^\s<]+)/i) || [])[1];
  // Blocs d'opérations <STMTTRN>…</STMTTRN> (ou jusqu'à la prochaine balise en SGML non fermé).
  const blocks = s.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) || s.match(/<STMTTRN>[\s\S]*?(?=<STMTTRN>|<\/BANKTRANLIST>|<\/STMTRS>)/gi) || [];
  const field = (blk: string, tag: string) => { const m = blk.match(new RegExp(`<${tag}>\\s*([^<\\r\\n]+)`, 'i')); return m ? m[1].trim() : ''; };
  const lines: BankLine[] = [];
  for (const blk of blocks) {
    const amount = r2(parseFloat(field(blk, 'TRNAMT').replace(/[^\d.\-]/g, '')) || 0);  // signé : - = débit, + = crédit
    const dt = field(blk, 'DTPOSTED').replace(/[^\d]/g, '').slice(0, 8);                 // AAAAMMJJ
    const stmt_date = dt.length >= 8 ? `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}` : '';
    const name = field(blk, 'NAME'); const memo = field(blk, 'MEMO');
    const description = [name, memo].filter(Boolean).join(' — ').slice(0, 300) || '—';
    const external_id = field(blk, 'FITID') || null;
    if (!stmt_date && !amount) continue;
    lines.push({ stmt_date, description, amount, external_id, reconciled: false, matched_transaction_id: null });
  }
  return { lines, accountNumber };
}

/** Détecte automatiquement le format (OFX/QFX vs CSV) et parse. */
export function parseStatement(text: string): { lines: BankLine[]; accountNumber?: string } {
  const s = String(text ?? '');
  if (/<OFX>|OFXHEADER|<STMTTRN>/i.test(s)) return parseOfx(s);
  return { lines: parseBankCsv(s) };
}

export async function getBankLines(tenant: string): Promise<BankLine[]> {
  const { data, error } = await supabase.from('bank_statement_lines')
    .select('*').eq('tenant_id', tenant).order('stmt_date', { ascending: false });
  if (error) throw error;
  return (data || []) as BankLine[];
}

export async function insertBankLines(tenant: string, lines: BankLine[]): Promise<number> {
  if (!lines.length) return 0;
  // Dédoublonnage par external_id (OFX FITID) : on n'insère pas une opération déjà importée.
  const ids = lines.map(l => l.external_id).filter(Boolean) as string[];
  let have = new Set<string>();
  if (ids.length) {
    try { const { data } = await supabase.from('bank_statement_lines').select('external_id').eq('tenant_id', tenant).in('external_id', ids); have = new Set((data || []).map((x: any) => x.external_id)); }
    catch { /* colonne external_id absente (migration 208) -> pas de dédoublonnage */ }
  }
  const fresh = lines.filter(l => !(l.external_id && have.has(l.external_id)));
  if (!fresh.length) return 0;
  const base = fresh.map(l => ({
    tenant_id: tenant, stmt_date: l.stmt_date || null, description: l.description || '',
    amount: r2(l.amount), matched_transaction_id: l.matched_transaction_id ?? null, reconciled: !!l.reconciled,
  }));
  // Tente avec external_id/treasury_account_id ; repli sans ces colonnes si migration 208 absente.
  const withExt = fresh.map((l, i) => ({ ...base[i], external_id: l.external_id ?? null, treasury_account_id: l.treasury_account_id ?? null }));
  let { error } = await supabase.from('bank_statement_lines').insert(withExt);
  if (error && /external_id|treasury_account_id|column/i.test(String(error.message || ''))) ({ error } = await supabase.from('bank_statement_lines').insert(base));
  if (error) throw error;
  return fresh.length;
}

export async function updateBankLine(tenant: string, id: string, patch: Partial<BankLine>): Promise<void> {
  const { error } = await supabase.from('bank_statement_lines').update(patch).eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}

export async function deleteBankLine(tenant: string, id: string): Promise<void> {
  const { error } = await supabase.from('bank_statement_lines').delete().eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}

// ── AUTO-RAPPROCHEMENT (exception-driven) ────────────────────────────────────────────────────────
// Apparie automatiquement chaque ligne bancaire NON rapprochée à une transaction par MONTANT (± tol.)
// et DATE (fenêtre ± jours). Le SIGNE doit concorder : sortie bancaire (montant -) ↔ dépense ; entrée
// bancaire (montant +) ↔ revenu. On n'applique QUE les correspondances UNIQUES (une seule candidate)
// pour éviter les faux positifs ; les ambiguës sont retournées pour décision manuelle.
export type MatchSuggestion = {
  bank_line_id: string; bank_date: string; bank_amount: number; description: string;
  candidates: Array<{ transaction_id: string; number: string; vendor: string; date: string; amount: number; days: number }>;
};
export type AutoMatchResult = { applied: number; suggestions: MatchSuggestion[] };

const daysApart = (a: string, b: string) => {
  const ta = Date.parse((a || '').slice(0, 10) + 'T00:00:00'), tb = Date.parse((b || '').slice(0, 10) + 'T00:00:00');
  return isNaN(ta) || isNaN(tb) ? 9999 : Math.abs(Math.round((tb - ta) / 86400000));
};

export async function autoMatchBankLines(
  tenant: string,
  opts: { amountTol?: number; dateTol?: number; apply?: boolean } = {},
): Promise<AutoMatchResult> {
  const amountTol = opts.amountTol ?? 0.02;
  const dateTol = opts.dateTol ?? 5;
  const lines = (await getBankLines(tenant)).filter(l => !l.reconciled && !l.matched_transaction_id && l.id);
  const { data: txns } = await supabase.from('commerce_transactions')
    .select('id, transaction_number, vendor_name, txn_date, txn_type, total, status')
    .eq('tenant_id', tenant).neq('status', 'cancelled');
  // Montant bancaire signé attendu : revenu = + (entrée), dépense = - (sortie).
  const cand = (txns || []).map((t: any) => ({
    transaction_id: t.id as string, number: t.transaction_number || '—', vendor: t.vendor_name || '',
    date: (t.txn_date || '').slice(0, 10),
    signed: ((t.txn_type || 'expense') === 'revenue' ? 1 : -1) * (Number(t.total) || 0),
  }));
  const used = new Set<string>();
  const suggestions: MatchSuggestion[] = [];
  let applied = 0;
  for (const l of lines) {
    const matches = cand
      .filter(c => !used.has(c.transaction_id) && Math.abs(c.signed - l.amount) <= amountTol && daysApart(c.date, l.stmt_date) <= dateTol)
      .map(c => ({ transaction_id: c.transaction_id, number: c.number, vendor: c.vendor, date: c.date, amount: r2(c.signed), days: daysApart(c.date, l.stmt_date) }))
      .sort((a, b) => a.days - b.days);
    if (!matches.length) continue;
    if (matches.length === 1 && opts.apply) {
      used.add(matches[0].transaction_id);
      await updateBankLine(tenant, l.id!, { matched_transaction_id: matches[0].transaction_id, reconciled: true });
      applied++;
    } else {
      suggestions.push({ bank_line_id: l.id!, bank_date: l.stmt_date, bank_amount: l.amount, description: l.description, candidates: matches });
    }
  }
  return { applied, suggestions };
}
