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
const PAYROLL_RE = /salaire|paie|payroll|rémunér|remuner|wage|salary|cnesst|avantage social/i;

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

export type FinPeriod = { key: string; label: string; revenue: number; expense: number; payroll: number; margin: number; growthPct: number | null };
export type FinAnalytics = {
  periods: FinPeriod[];
  revenueTotal: number; expenseTotal: number; payrollTotal: number; marginTotal: number;
  marginPct: number; payrollPct: number;   // marge / CA, masse salariale / CA
  growthPct: number | null;                // dernière période vs précédente (CA)
  cash: number;                            // trésorerie courante (comptes d'actif banque/caisse)
  arTotal: number; apTotal: number;        // créances / dettes (best-effort par nom de compte)
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
    if (!b) { b = { key, label, revenue: 0, expense: 0, payroll: 0, margin: 0, growthPct: null }; buckets.set(key, b); }
    for (const l of e.gl_lines || []) {
      const type = l.gl_accounts?.type; const name = l.gl_accounts?.name || '';
      const d = n(l.debit), c = n(l.credit);
      if (type === 'revenue') b.revenue += c - d;       // produits : crédit normal
      else if (type === 'expense') {
        const amt = d - c;                               // charges : débit normal
        b.expense += amt;
        if (PAYROLL_RE.test(name)) b.payroll += amt;     // masse salariale (best-effort par nom de compte)
      }
    }
  }

  const periods = [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
  for (let i = 0; i < periods.length; i++) {
    periods[i].margin = periods[i].revenue - periods[i].expense;
    const prev = i > 0 ? periods[i - 1].revenue : null;
    periods[i].growthPct = prev != null && prev !== 0 ? ((periods[i].revenue - prev) / Math.abs(prev)) * 100 : null;
  }

  const revenueTotal = periods.reduce((s, p) => s + p.revenue, 0);
  const expenseTotal = periods.reduce((s, p) => s + p.expense, 0);
  const payrollTotal = periods.reduce((s, p) => s + p.payroll, 0);
  const marginTotal = revenueTotal - expenseTotal;
  const last = periods[periods.length - 1];

  return {
    periods, revenueTotal, expenseTotal, payrollTotal, marginTotal,
    marginPct: revenueTotal !== 0 ? (marginTotal / revenueTotal) * 100 : 0,
    payrollPct: revenueTotal !== 0 ? (payrollTotal / revenueTotal) * 100 : 0,
    growthPct: last ? last.growthPct : null,
    cash: n(opts.cash), arTotal: n(opts.arTotal), apTotal: n(opts.apTotal),
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

export const GRANULARITY_LABELS: Record<Granularity, string> = {
  day: 'Quotidien', week: 'Hebdomadaire', month: 'Mensuel', quarter: 'Trimestriel', year: 'Annuel',
};
