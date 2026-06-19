'use client';
// BLOC B finance : métriques SaaS (MRR/ARR/churn/NRR/runway) + échéancier AR + prévision trésorerie
// 13 semaines (scénarios). Toutes les données dérivent des tables opérationnelles, scopées au tenant.
import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Repeat, TrendingDown, CalendarRange, Loader2, AlertTriangle } from 'lucide-react';
import { getRecurring } from '@/lib/recurring';
import { computeSaasMetrics, type SaasMetrics } from '@/lib/saasMetrics';
import { getArAging, type ArAging } from '@/lib/arAging';
import { getCashForecast, type WeekProjection, type Scenario } from '@/lib/cashForecast';

type Tr = (fr: string, en: string) => string;
const mny = (n: number) => `${Math.round(Number(n) || 0).toLocaleString('fr-CA')} $`;
const mnyK = (n: number) => { const v = Number(n) || 0; return Math.abs(v) >= 10000 ? `${(v / 1000).toFixed(0)} k$` : `${Math.round(v)} $`; };
const pct = (n: number | null) => (n == null ? '—' : `${n.toFixed(1)} %`);

export default function SaasAndForecast({ tenant, tr, cash, monthlyEbitda, weeklyOutflow }: {
  tenant: string; tr: Tr; cash: number; monthlyEbitda: number; weeklyOutflow: number;
}) {
  const [saas, setSaas] = useState<SaasMetrics | null>(null);
  const [aging, setAging] = useState<ArAging | null>(null);
  const [forecast, setForecast] = useState<WeekProjection[]>([]);
  const [scenario, setScenario] = useState<Scenario>('realistic');
  const [loading, setLoading] = useState(true);

  const monthStartIso = useMemo(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; }, []);

  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      try {
        const [subs, ag] = await Promise.all([getRecurring(tenant).catch(() => []), getArAging(tenant).catch(() => null)]);
        if (!on) return;
        setSaas(computeSaasMetrics(subs, { monthStartIso, cash, monthlyEbitda }));
        setAging(ag);
      } catch { /* ignore */ } finally { if (on) setLoading(false); }
    })();
    return () => { on = false; };
  }, [tenant, monthStartIso, cash, monthlyEbitda]);

  useEffect(() => {
    let on = true;
    getCashForecast(tenant, { startingCash: cash, weeklyOutflow, scenario }).then(f => { if (on) setForecast(f); }, () => { if (on) setForecast([]); });
    return () => { on = false; };
  }, [tenant, cash, weeklyOutflow, scenario]);

  const minBalance = useMemo(() => forecast.reduce((m, w) => Math.min(m, w.balance), Infinity), [forecast]);
  const negativeWeek = forecast.find(w => w.balance < 0);

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"><div className="flex items-center gap-2 text-slate-400"><Loader2 size={15} className="animate-spin" /> {tr('Calcul SaaS / trésorerie…', 'Computing SaaS / cash…')}</div></div>;

  const agingBuckets: { k: string; l: string; c: string }[] = [
    { k: 'courant', l: tr('Courant', 'Current'), c: 'bg-emerald-500' },
    { k: '0-30', l: '0-30 j', c: 'bg-amber-400' },
    { k: '31-60', l: '31-60 j', c: 'bg-orange-500' },
    { k: '61-90', l: '61-90 j', c: 'bg-rose-500' },
    { k: '90+', l: '90+ j', c: 'bg-red-700' },
  ];

  return (
    <div className="space-y-4">
      {/* Métriques SaaS */}
      {saas && (saas.mrr > 0 || saas.activeCount > 0) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200"><Repeat size={16} className="text-violet-600" /> {tr('Métriques d’abonnement (SaaS)', 'Subscription metrics (SaaS)')}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {[
              { l: 'MRR', v: mnyK(saas.mrr), c: 'text-violet-600' },
              { l: 'ARR', v: mnyK(saas.arr), c: 'text-violet-700' },
              { l: tr('Abonnés actifs', 'Active'), v: String(saas.activeCount), c: 'text-slate-700 dark:text-slate-200' },
              { l: tr('Nouveau MRR', 'New MRR'), v: mnyK(saas.newMrr), c: 'text-emerald-600' },
              { l: tr('MRR perdu', 'Churned'), v: mnyK(saas.churnedMrr), c: 'text-rose-600' },
              { l: 'Churn', v: pct(saas.churnPct), c: (saas.churnPct || 0) > 5 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200' },
              { l: 'NRR', v: pct(saas.nrrPct), c: (saas.nrrPct || 0) >= 100 ? 'text-emerald-600' : 'text-amber-600' },
            ].map(k => (
              <div key={k.l} className="rounded-xl border border-slate-100 px-3 py-2 dark:border-gray-700"><div className={`text-lg font-extrabold ${k.c}`}>{k.v}</div><div className="text-[10px] text-slate-400">{k.l}</div></div>
            ))}
          </div>
          {saas.runwayMonths != null && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              <TrendingDown size={14} /> {tr('Autonomie (runway)', 'Runway')} : <b>{saas.runwayMonths} {tr('mois', 'months')}</b> {tr('au rythme de consommation actuel (EBITDA négatif).', 'at the current burn (negative EBITDA).')}
            </div>
          )}
          <p className="mt-2 text-[11px] text-slate-400">{tr('NRR sans expansion (= (MRR début − churn) / MRR début). Churn/NRR sur le mois courant.', 'NRR without expansion. Churn/NRR for the current month.')}</p>
        </div>
      )}

      {/* Échéancier AR (aging) */}
      {aging && aging.total > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200"><CalendarRange size={16} className="text-sky-600" /> {tr('Échéancier clients (AR)', 'Receivables aging (AR)')}</h3>
            <div className="text-xs text-slate-400">{tr('Total', 'Total')} {mny(aging.total)} · {tr('en retard', 'overdue')} <span className="font-semibold text-rose-600">{mny(aging.overdue)}</span></div>
          </div>
          <div className="flex h-5 w-full overflow-hidden rounded-full">
            {agingBuckets.map(b => { const v = (aging.buckets as any)[b.k] || 0; const w = aging.total > 0 ? (v / aging.total) * 100 : 0; return w > 0 ? <div key={b.k} className={b.c} style={{ width: `${w}%` }} title={`${b.l}: ${mny(v)}`} /> : null; })}
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2 text-center">
            {agingBuckets.map(b => { const v = (aging.buckets as any)[b.k] || 0; return (
              <div key={b.k}><div className="text-sm font-bold text-slate-700 dark:text-slate-200">{mnyK(v)}</div><div className="text-[10px] text-slate-400">{b.l}</div></div>
            ); })}
          </div>
        </div>
      )}

      {/* Prévision trésorerie 13 semaines */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200"><CalendarRange size={16} className="text-emerald-600" /> {tr('Prévision de trésorerie — 13 semaines', '13-week cash forecast')}</h3>
          <div className="flex gap-1">
            {(['optimistic', 'realistic', 'pessimistic'] as Scenario[]).map(s => (
              <button key={s} onClick={() => setScenario(s)} className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${scenario === s ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-slate-600 dark:border-gray-600 dark:text-slate-300'}`}>
                {s === 'optimistic' ? tr('Optimiste', 'Optimistic') : s === 'realistic' ? tr('Réaliste', 'Realistic') : tr('Pessimiste', 'Pessimistic')}
              </button>
            ))}
          </div>
        </div>
        {negativeWeek && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
            <AlertTriangle size={14} /> {tr(`Trésorerie négative dès la semaine ${negativeWeek.week} (${negativeWeek.from}).`, `Cash goes negative at week ${negativeWeek.week} (${negativeWeek.from}).`)}
          </div>
        )}
        {forecast.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={forecast} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} tickFormatter={(v: any) => `S${v}`} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: any) => mnyK(v)} />
              <Tooltip formatter={(v: any) => mny(Number(v))} labelFormatter={(l: any) => `Semaine ${l}`} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2" />
              <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2.5} dot={{ r: 2 }} name={tr('Solde', 'Balance')} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="grid h-[200px] place-items-center text-xs text-slate-400">{tr('Pas assez de données pour projeter (factures à échoir / abonnements).', 'Not enough data to project.')}</p>}
        <p className="mt-2 text-[11px] text-slate-400">{tr('Départ = trésorerie actuelle. Entrées = factures à échoir (pondérées par statut + scénario) + abonnements. Sorties = run-rate de charges. Estimation — non un engagement.', 'Start = current cash. Inflows = due invoices (weighted) + subscriptions. Outflows = expense run-rate. Estimate only.')}</p>
      </div>
    </div>
  );
}
