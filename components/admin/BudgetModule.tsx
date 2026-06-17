'use client';
// Budget annuel vs réel (#41) : saisie du budget par compte (produits/charges) + comparaison au réel
// (grand livre) avec écarts $ et %. Couleurs : dépassement de charges = rouge, revenu sous budget = rouge.
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save, Download } from 'lucide-react';
import { getAccounts, getLedger } from '@/lib/accounting';
import { getBudgets, saveBudget, actualByAccount, budgetVsActual, type BudgetRow } from '@/lib/budget';
import { downloadCsv, type CsvColumn } from '@/lib/csv';

type Tr = (f: string, e: string) => string;
const mny = (v: number) => `${(Number(v) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`;

export function BudgetModule({ tenant, tr, canEdit }: { tenant: string; tr: Tr; canEdit: boolean }) {
  const nowYear = new Date().getFullYear();
  const [year, setYear] = useState(nowYear);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<{ code: string; name: string; type: string }[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [acc, led, bud] = await Promise.all([getAccounts(tenant), getLedger(tenant), getBudgets(tenant, year)]);
      setAccounts((acc as any[]).map(a => ({ code: a.code, name: a.name, type: a.type })));
      setLedger(led); setBudgets(bud); setEdited({});
    } catch (e: any) { setNotice('Erreur (plan comptable / migration 210 ?) : ' + (e?.message || e)); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant, year]);

  const actuals = useMemo(() => actualByAccount(ledger, year), [ledger, year]);
  const merged = useMemo(() => { const b = { ...budgets }; Object.entries(edited).forEach(([k, v]) => { b[k] = Number(v) || 0; }); return b; }, [budgets, edited]);
  const { revenue, expense } = useMemo(() => budgetVsActual(accounts, merged, actuals), [accounts, merged, actuals]);

  const sum = (rows: BudgetRow[], f: (r: BudgetRow) => number) => rows.reduce((s, r) => s + f(r), 0);
  const revB = sum(revenue, r => r.budget), revA = sum(revenue, r => r.actual);
  const expB = sum(expense, r => r.budget), expA = sum(expense, r => r.actual);
  const netB = revB - expB, netA = revA - expA;

  async function saveAll() {
    setSaving(true); setNotice(null);
    try { for (const [code, v] of Object.entries(edited)) await saveBudget(tenant, year, code, Number(v) || 0); setNotice(tr('Budget enregistré.', 'Budget saved.')); await load(); }
    catch (e: any) { setNotice(e?.message); }
    setSaving(false);
  }

  function exportCsv() {
    const rows = [
      ...revenue.map(r => ({ ...r, section: tr('Produits', 'Revenue') })),
      ...expense.map(r => ({ ...r, section: tr('Charges', 'Expenses') })),
    ];
    const cols: CsvColumn<BudgetRow & { section: string }>[] = [
      { key: 'section', label: tr('Section', 'Section') },
      { key: 'code', label: tr('Compte', 'Account') },
      { key: 'name', label: tr('Nom', 'Name') },
      { key: 'budget', label: tr('Budget', 'Budget'), type: 'money' },
      { key: 'actual', label: tr('Réel', 'Actual'), type: 'money' },
      { key: 'variance', label: tr('Écart ($)', 'Variance ($)'), type: 'money' },
      { key: 'variancePct', label: tr('Écart (%)', 'Variance (%)'), map: (v, r) => (r.budget ? Number(v).toFixed(1) : '') },
    ];
    downloadCsv(`budget-${year}.csv`, rows, cols);
  }

  if (loading) return <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>;

  const inp = 'w-28 rounded-lg border border-gray-200 bg-white px-2 py-1 text-right text-sm dark:border-gray-700 dark:bg-gray-800';
  // Couleur de l'écart : pour les CHARGES, dépasser le budget (variance > 0) = mauvais ; pour les PRODUITS, sous le budget (variance < 0) = mauvais.
  const varColor = (r: BudgetRow) => { const bad = r.type === 'expense' ? r.variance > 0 : r.variance < 0; return bad ? 'text-rose-600' : 'text-emerald-600'; };

  const Table = ({ title, rows, totalB, totalA }: { title: string; rows: BudgetRow[]; totalB: number; totalA: number }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-sm font-bold">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm [&_td]:whitespace-nowrap [&_td]:py-1.5">
          <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-700"><th className="px-2 py-2">{tr('Compte', 'Account')}</th><th className="text-right">{tr('Budget', 'Budget')}</th><th className="text-right">{tr('Réel', 'Actual')}</th><th className="text-right">{tr('Écart', 'Variance')}</th><th className="text-right">%</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.code} className="border-b border-gray-50 dark:border-gray-700/50">
                <td className="px-2"><span className="font-mono text-xs text-gray-400">{r.code}</span> {r.name}</td>
                <td className="text-right">{canEdit ? <input type="number" value={edited[r.code] ?? (r.budget || '')} onChange={e => setEdited(p => ({ ...p, [r.code]: e.target.value }))} className={inp} placeholder="0" /> : mny(r.budget)}</td>
                <td className="text-right font-semibold">{mny(r.actual)}</td>
                <td className={`text-right font-semibold ${varColor(r)}`}>{r.variance >= 0 ? '+' : ''}{mny(r.variance)}</td>
                <td className={`text-right text-xs ${varColor(r)}`}>{r.budget ? `${r.variance >= 0 ? '+' : ''}${r.variancePct.toFixed(0)} %` : '—'}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-200 font-bold dark:border-gray-600"><td className="px-2 py-2">{tr('Total', 'Total')}</td><td className="text-right">{mny(totalB)}</td><td className="text-right">{mny(totalA)}</td><td className={`text-right ${title.includes(tr('Charges', 'Expenses')) ? (totalA - totalB > 0 ? 'text-rose-600' : 'text-emerald-600') : (totalA - totalB < 0 ? 'text-rose-600' : 'text-emerald-600')}`}>{totalA - totalB >= 0 ? '+' : ''}{mny(totalA - totalB)}</td><td></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">{tr('Budget annuel vs réel', 'Annual budget vs actual')}</h2>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800">
            {[nowYear + 1, nowYear, nowYear - 1, nowYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"><Download size={14} /> {tr('Exporter CSV', 'Export CSV')}</button>
          {canEdit && Object.keys(edited).length > 0 && <button onClick={saveAll} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {tr('Enregistrer le budget', 'Save budget')}</button>}
        </div>
      </div>
      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20">{notice}</div>}

      {/* Synthèse */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"><div className="text-[11px] font-semibold uppercase text-blue-500">{tr('Produits — réel / budget', 'Revenue — actual / budget')}</div><div className="text-base font-extrabold text-blue-700 dark:text-blue-300">{mny(revA)} / {mny(revB)}</div></div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-900/20"><div className="text-[11px] font-semibold uppercase text-rose-500">{tr('Charges — réel / budget', 'Expenses — actual / budget')}</div><div className="text-base font-extrabold text-rose-700 dark:text-rose-300">{mny(expA)} / {mny(expB)}</div></div>
        <div className={`rounded-xl border p-3 ${netA >= netB ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'}`}><div className="text-[11px] font-semibold uppercase text-gray-500">{tr('Résultat net — réel / budget', 'Net result — actual / budget')}</div><div className="text-base font-extrabold text-gray-800 dark:text-gray-100">{mny(netA)} / {mny(netB)}</div></div>
      </div>

      <Table title={tr('Produits', 'Revenue')} rows={revenue} totalB={revB} totalA={revA} />
      <Table title={tr('Charges', 'Expenses')} rows={expense} totalB={expB} totalA={expA} />
    </div>
  );
}
