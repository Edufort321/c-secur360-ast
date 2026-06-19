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

  // 1) Cherche une LIGNE D'EN-TÊTE dans les 15 premières (date + un indice de montant, incl. devise CAD/USD).
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const lc = rows[i].map(h => h.toLowerCase());
    if (lc.some(h => /date/.test(h)) && lc.some(h => /montant|amount|\bcad\b|\busd\b|débit|debit|crédit|credit|retrait|dépôt|depot|withdraw|deposit|solde|balance/.test(h))) { headerIdx = i; break; }
  }
  let iDate = 0, iDr = -1, iCr = -1, start = 0;
  let descCols: number[] = [], amtCols: number[] = [];
  if (headerIdx >= 0) {
    const head = rows[headerIdx].map(h => h.toLowerCase());
    const findAll = (re: RegExp) => head.map((h, k) => ({ h, k })).filter(x => re.test(x.h)).map(x => x.k);
    iDate = head.findIndex(h => /date/.test(h)); if (iDate < 0) iDate = 0;
    descCols = findAll(/desc|libell|détail|detail|narration|opération|operation|tiers|payee|memo|note/);   // combine Description 1 + 2…
    iDr = head.findIndex(h => /débit|debit|retrait|withdraw|sortie/.test(h));
    iCr = head.findIndex(h => /crédit|credit|dépôt|depot|deposit|entrée/.test(h));
    // Colonnes de MONTANT. On EXCLUT les composantes de taxe / sous-total (HT, TPS, TVQ, taxe, sous-total)
    // pour ne pas importer le montant AVANT taxes, et on PRIORISE le montant net de l'opération
    // (« signé » / « net » > « total » > montant brut / devise). RBC : colonne « CAD ».
    const isTaxCol = (h: string) => /\bht\b|hors[\s-]?tax|\btps\b|\btvq\b|\bgst\b|\bqst\b|\btaxes?\b|sous[\s-]?total|subtotal/.test(h);
    const amtFound = head.map((h, k) => ({ h, k })).filter(x => /\bcad\b|\busd\b|montant|amount|^total|total\b|signé|signed|\bnet\b/.test(x.h) && !isTaxCol(x.h));
    const amtPrio = (h: string) => (/signé|signed|\bnet\b/.test(h) ? 0 : /^total|total\b/.test(h) ? 1 : 2);
    amtCols = amtFound.sort((a, b) => amtPrio(a.h) - amtPrio(b.h)).map(x => x.k);
    // Exclut des descriptions les colonnes date/montant/débit/crédit (ex. « Date de l'opération » matche « opération »).
    descCols = descCols.filter(k => k !== iDate && k !== iDr && k !== iCr && !amtCols.includes(k));
    start = headerIdx + 1;
  } else {
    // 2) Pas d'en-tête : 1re ligne avec une DATE, puis inférence.
    start = rows.findIndex(r => r.some(isDateLike)); if (start < 0) start = 0;
    const s = rows[start] || [];
    iDate = s.findIndex(isDateLike); if (iDate < 0) iDate = 0;
    amtCols = s.map((c, k) => ({ k, ok: isAmountLike(c) })).filter(x => x.ok && x.k !== iDate).map(x => x.k);
    const dCol = s.findIndex((c, k) => k !== iDate && !isAmountLike(c) && (c || '').trim().length > 0);
    descCols = dCol >= 0 ? [dCol] : [1];
  }
  if (!descCols.length) { const d = (rows[Math.min(start, rows.length - 1)] || []).findIndex((_, k) => k !== iDate && k !== iDr && k !== iCr && !amtCols.includes(k)); descCols = d >= 0 ? [d] : [1]; }

  // Ordre des dates J/M vs M/J : on scanne le fichier (un composant > 12 tranche). Défaut M/J (relevés nord-américains).
  let dayFirst = false;
  for (let i = start; i < rows.length; i++) { const m = (rows[i][iDate] || '').match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.]\d{2,4}/); if (m) { if (+m[1] > 12) { dayFirst = true; break; } if (+m[2] > 12) { dayFirst = false; break; } } }
  const fmt = (y: string, mo: number, da: number) => { if (mo > 12 && da <= 12) { const t = mo; mo = da; da = t; } if (mo < 1 || mo > 12 || da < 1 || da > 31) return ''; return `${y}-${String(mo).padStart(2, '0')}-${String(da).padStart(2, '0')}`; };
  const nd = (v: string) => { const t = String(v || '').trim(); const iso = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if (iso) return fmt(iso[1], +iso[2], +iso[3]); const m = t.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/); if (!m) return ''; let [, p, q, y] = m as any; if (y.length === 2) y = '20' + y; return fmt(y, dayFirst ? +q : +p, dayFirst ? +p : +q); };
  const amtOf = (c: string[]) => {
    if (iCr >= 0 || iDr >= 0) return r2((iCr >= 0 ? Math.abs(parseAmount(c[iCr])) : 0) - (iDr >= 0 ? Math.abs(parseAmount(c[iDr])) : 0));
    for (const k of amtCols) { const v = c[k]; if (v && v.trim()) return r2(parseAmount(v)); }   // 1re colonne devise non vide (CAD avant USD)
    return 0;
  };
  const descOf = (c: string[]) => descCols.map(k => c[k]).filter(x => x && x.trim()).join(' — ').slice(0, 300);

  const out: BankLine[] = [];
  for (let i = start; i < rows.length; i++) {
    const c = rows[i];
    if (!c.length || c.every(x => !x.trim())) continue;
    const stmt_date = nd(c[iDate] || '');
    const description = descOf(c) || '—';
    if (/^(solde|balance|report|opening|closing|solde d)/i.test(description)) continue; // ligne de solde (pas une opération)
    const amount = amtOf(c);
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

/** Détecte automatiquement le format (OFX/QFX vs CSV) et parse. Tente aussi de reconnaître le n° de compte. */
export function parseStatement(text: string): { lines: BankLine[]; accountNumber?: string } {
  const s = String(text ?? '');
  if (/<OFX>|OFXHEADER|<STMTTRN>/i.test(s)) return parseOfx(s);
  // CSV : n° de compte best-effort — après « compte/account », OU un n° de type RBC « 05585-1038157 ».
  const head = s.split(/\r?\n/).slice(0, 20).join('\n');
  const accountNumber = (head.match(/(?:compte|account|no\.?\s*compte|n[°o]\s*compte)\D{0,10}(\d[\d\s•.\-]{2,18}\d)/i)
    || head.match(/\b(\d{3,6}-\d{5,10})\b/) || [])[1];
  return { lines: parseBankCsv(s), accountNumber };
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
  const validDate = (d?: string) => (/^\d{4}-\d{2}-\d{2}$/.test(String(d || '')) ? d : null); // sinon null (jamais de 400)
  const base = fresh.map(l => ({
    tenant_id: tenant, stmt_date: validDate(l.stmt_date), description: l.description || '',
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
