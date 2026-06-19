// Analytique FINANCIÈRE (vue dirigeant) — fonctions PURES sur le grand livre (gl_entries + gl_lines).
// Le GL est la source canonique : transactions, paie, factures y sont comptabilisées (accountingAuto).
// Produit des séries temporelles (granularité paramétrable) + KPIs : CA, charges, marge, masse
// salariale, croissance. Aucune dépendance réseau (les données sont passées en argument).

export type Granularity = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type LedgerEntry = {
  entry_date?: string; posted?: boolean;
  gl_lines?: { debit?: number; credit?: number; gl_accounts?: { code?: string; name?: string; type?: string } | null }[];
};

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const PAYROLL_RE = /salaire|paie|payroll|rémunér|remuner|wage|salary|cnesst|charges sociales|avantage social/i;
// Classification des CHARGES par CODE de compte (plan comptable migration 085). Mutuellement exclusif :
// paie (5000/5100) → COGS (5300) → amortissement (5600) → intérêts (5700) → impôts (5800) → sinon opex.
const PAYROLL_CODES = new Set(['5000', '5100']);
const COGS_CODES = new Set(['5300']); // Fournitures et matériel = coût des ventes (entreprise de services)
const COGS_RE = /co[ûu]t des ventes|cogs|sous-traitance|mat[ée]ri(el|aux)|marchandise/i;

// ── Clé/格 de période ─────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0'); }
function isoWeek(d: Date): { y: number; w: number } {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (t.getUTCDay() + 6) % 7; // lundi=0
  t.setUTCDate(t.getUTCDate() - day + 3);
  const firstThu = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((t.getTime() - firstThu.getTime()) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  return { y: t.getUTCFullYear(), w: week };
}
// Décale le mois selon le 1er mois de l'exercice (fiscalStartMonth 1-12) pour les regroupements trimestre/année.
function fiscalParts(d: Date, fiscalStartMonth: number): { fy: number; fq: number } {
  const m0 = d.getMonth(); // 0-11
  const shift = (m0 - (fiscalStartMonth - 1) + 12) % 12; // mois depuis le début d'exercice
  const fy = m0 >= (fiscalStartMonth - 1) ? d.getFullYear() : d.getFullYear() - 1;
  return { fy, fq: Math.floor(shift / 3) + 1 };
}
export function periodKey(dateStr: string, g: Granularity, fiscalStartMonth = 1): { key: string; label: string } {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { key: '—', label: '—' };
  if (g === 'day') { const k = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; return { key: k, label: k }; }
  if (g === 'week') { const { y, w } = isoWeek(d); return { key: `${y}-W${pad(w)}`, label: `S${w} ${y}` }; }
  if (g === 'month') { const k = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; const lbl = d.toLocaleDateString('fr-CA', { month: 'short', year: 'numeric' }); return { key: k, label: lbl }; }
  if (g === 'quarter') { const { fy, fq } = fiscalParts(d, fiscalStartMonth); return { key: `${fy}-T${fq}`, label: `T${fq} ${fy}` }; }
  const { fy } = fiscalParts(d, fiscalStartMonth); return { key: `${fy}`, label: `${fy}` };
}

export type FinPeriod = {
  key: string; label: string; revenue: number; expense: number; payroll: number; margin: number; growthPct: number | null;
  // COGS (coût des ventes) + marge BRUTE = revenue − cogs (≠ marge nette).
  cogs: number; opex: number; grossMargin: number;
  // Isolation pour EBITDA (comptes 5600/5700/5800) + investissement (CAPEX = ajouts aux immobilisations 1500).
  dna: number; interest: number; tax: number; ebitda: number; capex: number;
};
export type FinAnalytics = {
  periods: FinPeriod[];
  revenueTotal: number; expenseTotal: number; payrollTotal: number; marginTotal: number;
  cogsTotal: number; opexTotal: number; grossMarginTotal: number; grossMarginPct: number; // marge brute = CA − COGS
  marginPct: number; payrollPct: number;   // marge / CA, masse salariale / CA
  growthPct: number | null;                // dernière période vs précédente (CA)
  cash: number;                            // trésorerie courante (comptes d'actif banque/caisse)
  arTotal: number; apTotal: number;        // créances / dettes (best-effort par nom de compte)
  // EBITDA & investissement (vue dirigeant / investisseur).
  dnaTotal: number; interestTotal: number; taxTotal: number; ebitdaTotal: number; ebitdaPct: number; capexTotal: number;
};

// Agrège le grand livre par période. `cashByType` permet d'injecter la trésorerie depuis la balance.
export function computeFinancialAnalytics(
  entries: LedgerEntry[],
  opts: { granularity: Granularity; from?: string; to?: string; fiscalStartMonth?: number; cash?: number; arTotal?: number; apTotal?: number } = { granularity: 'month' },
): FinAnalytics {
  const g = opts.granularity || 'month';
  const fsm = opts.fiscalStartMonth || 1;
  const from = opts.from ? new Date(opts.from).getTime() : -Infinity;
  const to = opts.to ? new Date(opts.to).getTime() + 86400000 : Infinity; // inclusif
  const buckets = new Map<string, FinPeriod>();

  for (const e of entries || []) {
    if (e.posted === false) continue;
    const ds = e.entry_date || '';
    const t = new Date(ds).getTime();
    if (isNaN(t) || t < from || t >= to) continue;
    const { key, label } = periodKey(ds, g, fsm);
    let b = buckets.get(key);
    if (!b) { b = { key, label, revenue: 0, expense: 0, payroll: 0, margin: 0, growthPct: null, cogs: 0, opex: 0, grossMargin: 0, dna: 0, interest: 0, tax: 0, ebitda: 0, capex: 0 }; buckets.set(key, b); }
    for (const l of e.gl_lines || []) {
      const type = l.gl_accounts?.type; const name = l.gl_accounts?.name || ''; const code = String(l.gl_accounts?.code || '');
      const d = n(l.debit), c = n(l.credit);
      if (type === 'revenue') b.revenue += c - d;       // produits : crédit normal
      else if (type === 'expense') {
        const amt = d - c;                               // charges : débit normal
        b.expense += amt;
        // Classement MUTUELLEMENT EXCLUSIF par code (sinon par nom) → sert à EBITDA + marge brute.
        if (PAYROLL_CODES.has(code) || PAYROLL_RE.test(name)) b.payroll += amt;     // masse salariale
        else if (COGS_CODES.has(code) || COGS_RE.test(name)) b.cogs += amt;          // coût des ventes
        else if (code === '5600') b.dna += amt;          // amortissement
        else if (code === '5700') b.interest += amt;     // intérêts et frais financiers
        else if (code === '5800') b.tax += amt;          // impôts sur le résultat
        else b.opex += amt;                              // autres charges d'exploitation
      } else if (type === 'asset' && code === '1500') {
        b.capex += d - c;                                // CAPEX : ajouts nets aux immobilisations
      }
    }
  }

  const periods = [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
  for (let i = 0; i < periods.length; i++) {
    periods[i].margin = periods[i].revenue - periods[i].expense;
    periods[i].grossMargin = periods[i].revenue - periods[i].cogs;   // marge BRUTE = CA − coût des ventes
    // EBITDA = CA − COGS − masse salariale − opex (= marge nette + amortissement + intérêts + impôts).
    periods[i].ebitda = periods[i].revenue - periods[i].cogs - periods[i].payroll - periods[i].opex;
    const prev = i > 0 ? periods[i - 1].revenue : null;
    // Croissance PLAFONNÉE : base trop faible (< 10 000 $) OU variation extrême (> 500 %) = démarrage,
    // non significatif (évite les « +2278 % »). On affiche alors « — » / « démarrage » côté UI.
    if (prev == null || Math.abs(prev) < 10000) periods[i].growthPct = null;
    else {
      const gp = ((periods[i].revenue - prev) / Math.abs(prev)) * 100;
      periods[i].growthPct = Math.abs(gp) > 500 ? null : gp;
    }
  }

  const revenueTotal = periods.reduce((s, p) => s + p.revenue, 0);
  const expenseTotal = periods.reduce((s, p) => s + p.expense, 0);
  const payrollTotal = periods.reduce((s, p) => s + p.payroll, 0);
  const cogsTotal = periods.reduce((s, p) => s + p.cogs, 0);
  const opexTotal = periods.reduce((s, p) => s + p.opex, 0);
  const marginTotal = revenueTotal - expenseTotal;
  const grossMarginTotal = revenueTotal - cogsTotal;
  const dnaTotal = periods.reduce((s, p) => s + p.dna, 0);
  const interestTotal = periods.reduce((s, p) => s + p.interest, 0);
  const taxTotal = periods.reduce((s, p) => s + p.tax, 0);
  const ebitdaTotal = revenueTotal - cogsTotal - payrollTotal - opexTotal;
  const capexTotal = periods.reduce((s, p) => s + p.capex, 0);
  const last = periods[periods.length - 1];

  return {
    periods, revenueTotal, expenseTotal, payrollTotal, marginTotal,
    cogsTotal, opexTotal, grossMarginTotal,
    grossMarginPct: revenueTotal !== 0 ? (grossMarginTotal / revenueTotal) * 100 : 0,
    marginPct: revenueTotal !== 0 ? (marginTotal / revenueTotal) * 100 : 0,
    payrollPct: revenueTotal !== 0 ? (payrollTotal / revenueTotal) * 100 : 0,
    growthPct: last ? last.growthPct : null,
    cash: n(opts.cash), arTotal: n(opts.arTotal), apTotal: n(opts.apTotal),
    dnaTotal, interestTotal, taxTotal, ebitdaTotal,
    ebitdaPct: revenueTotal !== 0 ? (ebitdaTotal / revenueTotal) * 100 : 0,
    capexTotal,
  };
}

// Trésorerie + créances/dettes depuis la balance (trial balance) + le plan comptable.
// accounts: [{ id, code, name, type }]. balances: { [accountId]: { debit, credit } }.
export function cashAndReceivables(
  accounts: { id: string; code?: string; name?: string; type?: string }[],
  balances: Record<string, { debit: number; credit: number }>,
): { cash: number; arTotal: number; apTotal: number } {
  let cash = 0, arTotal = 0, apTotal = 0;
  for (const a of accounts || []) {
    const b = balances[a.id]; if (!b) continue;
    const net = n(b.debit) - n(b.credit);
    const code = String(a.code || ''); const name = a.name || '';
    if (a.type === 'asset' && (/^10[0-9]{2}/.test(code) || /banque|caisse|encaisse|bank|cash/i.test(name))) cash += net;
    if (a.type === 'asset' && (/recevoir|receivable|clients?/i.test(name) || /^11/.test(code))) arTotal += net;
    if (a.type === 'liability' && (/payer|payable|fournisseur/i.test(name) || /^20/.test(code))) apTotal += -net;
  }
  return { cash, arTotal, apTotal };
}

// ── Drill-down : lignes du grand livre composant une CATÉGORIE de KPI, sur une fenêtre de dates.
export type DrillCategory = 'revenue' | 'expense' | 'payroll' | 'cogs' | 'opex' | 'capex';
export type LedgerLine = { date: string; code: string; account: string; amount: number; description: string };

function lineCategory(type: string | undefined, code: string, name: string): DrillCategory | null {
  if (type === 'revenue') return 'revenue';
  if (type === 'asset' && code === '1500') return 'capex';
  if (type === 'expense') {
    if (PAYROLL_CODES.has(code) || PAYROLL_RE.test(name)) return 'payroll';
    if (COGS_CODES.has(code) || COGS_RE.test(name)) return 'cogs';
    if (code === '5600' || code === '5700' || code === '5800') return 'opex'; // amort/int/impôt regroupés ici pour le détail
    return 'opex';
  }
  return null;
}

export function extractLedgerLines(entries: LedgerEntry[], opts: { category: DrillCategory; from?: string; to?: string }): { lines: LedgerLine[]; total: number } {
  const from = opts.from ? new Date(opts.from).getTime() : -Infinity;
  const to = opts.to ? new Date(opts.to).getTime() + 86400000 : Infinity;
  const out: LedgerLine[] = [];
  for (const e of entries || []) {
    if (e.posted === false) continue;
    const ds = e.entry_date || ''; const t = new Date(ds).getTime();
    if (isNaN(t) || t < from || t >= to) continue;
    for (const l of e.gl_lines || []) {
      const type = l.gl_accounts?.type; const code = String(l.gl_accounts?.code || ''); const name = l.gl_accounts?.name || '';
      const cat = lineCategory(type, code, name);
      // « expense » = toutes charges (paie+cogs+opex) ; sinon catégorie précise.
      const match = opts.category === 'expense' ? (type === 'expense') : cat === opts.category;
      if (!match) continue;
      const d = n(l.debit), c = n(l.credit);
      const amount = type === 'revenue' ? c - d : d - c; // produit = crédit ; charge/actif = débit
      if (amount === 0) continue;
      out.push({ date: ds.slice(0, 10), code, account: name, amount, description: (e as any).description || '' });
    }
  }
  out.sort((a, b) => (a.date < b.date ? 1 : -1));
  const total = out.reduce((s, l) => s + l.amount, 0);
  return { lines: out, total: Math.round(total * 100) / 100 };
}

export const GRANULARITY_LABELS: Record<Granularity, string> = {
  day: 'Quotidien', week: 'Hebdomadaire', month: 'Mensuel', quarter: 'Trimestriel', year: 'Annuel',
};

// Revenus VENTILÉS PAR CLASSE de produit (factures transmises/payées). Lit les lignes de facture
// (product_class — snapshot mig 194). Async (réseau) — à appeler depuis un composant.
export async function revenueByClass(tenant: string, from?: string, to?: string): Promise<{ name: string; value: number }[]> {
  const { supabase } = await import('@/lib/supabase');
  // cols 0 = base ; 1 = + revenue_category (mig 231) ; 2 = + revenue_distribution (mig 237). Repli progressif.
  const sel = (lvl: number) => `issue_date, status${lvl >= 1 ? ', revenue_category' : ''}${lvl >= 2 ? ', revenue_distribution' : ''}, commerce_invoice_items(subtotal, product_class, description)`;
  const run = (lvl: number) => { let q = supabase.from('commerce_invoices').select(sel(lvl)).eq('tenant_id', tenant).in('status', ['sent', 'paid']); if (from) q = q.gte('issue_date', from); if (to) q = q.lte('issue_date', to); return q; };
  let { data, error } = await run(2);
  if (error && /revenue_distribution/i.test(String(error.message || ''))) ({ data, error } = await run(1));
  if (error && /revenue_category/i.test(String(error.message || ''))) ({ data, error } = await run(0));
  if (error) return [];
  const byClass: Record<string, number> = {};
  for (const inv of (data || []) as any[]) {
    const invCat = (inv.revenue_category || '').trim();
    const lines = inv.commerce_invoice_items || [];
    const invTotal = lines.reduce((s: number, l: any) => s + (Number(l.subtotal) || 0), 0);
    // 1) RÉPARTITION explicite par classe (mig 237) → ventile le total de la facture au prorata des %.
    const distRows = Array.isArray(inv.revenue_distribution) ? inv.revenue_distribution.filter((d: any) => d && d.class && Number(d.pct) > 0) : [];
    if (distRows.length && invTotal > 0) {
      const sumPct = distRows.reduce((s: number, d: any) => s + (Number(d.pct) || 0), 0) || 1;
      for (const d of distRows) {
        const cls = String(d.class).trim() || invCat || 'Non classé';
        byClass[cls] = (byClass[cls] || 0) + invTotal * ((Number(d.pct) || 0) / sumPct);
      }
      continue;
    }
    // 2) Sinon : classe du PRODUIT (ligne) → catégorie de revenu de la facture → « Non classé ».
    for (const l of lines) {
      const cls = (l.product_class || '').trim() || invCat || 'Non classé';
      byClass[cls] = (byClass[cls] || 0) + (Number(l.subtotal) || 0);
    }
  }
  // + REVENUS saisis comme TRANSACTIONS (txn_type='revenue'), ventilés par classe PAR LIGNE
  // (commerce_transaction_items.revenue_category, mig 236) → sinon classe d'entête → sinon « Non classé ».
  // Table = commerce_transactions (et non `transactions` legacy).
  try {
    // sel(full) = avec classes par ligne + entête ; repli progressif si une colonne n'existe pas encore.
    const sel = (lineCat: boolean, headCat: boolean) => `txn_date, txn_type${headCat ? ', revenue_category' : ''}, commerce_transaction_items(amount${lineCat ? ', revenue_category' : ''})`;
    const run = (lineCat: boolean, headCat: boolean) => { let t = supabase.from('commerce_transactions').select(sel(lineCat, headCat)).eq('tenant_id', tenant).eq('txn_type', 'revenue'); if (from) t = t.gte('txn_date', from); if (to) t = t.lte('txn_date', to); return t; };
    let { data: txs, error: te } = await run(true, true);
    if (te && /revenue_category/i.test(String(te.message || ''))) {
      // réessaie sans la classe de ligne, puis sans la classe d'entête.
      ({ data: txs, error: te } = await run(false, true));
      if (te && /revenue_category/i.test(String(te.message || ''))) ({ data: txs } = await run(false, false));
    }
    for (const t of (txs || []) as any[]) {
      const head = (t.revenue_category || '').trim();
      const lines = t.commerce_transaction_items || [];
      if (lines.length) {
        for (const l of lines) {
          const cls = (l.revenue_category || '').trim() || head || 'Non classé';
          byClass[cls] = (byClass[cls] || 0) + (Number(l.amount) || 0);
        }
      } else {
        const cls = head || 'Non classé';
        byClass[cls] = (byClass[cls] || 0); // pas de lignes → rien à ventiler
      }
    }
  } catch { /* transactions optionnelles */ }
  return Object.entries(byClass).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
