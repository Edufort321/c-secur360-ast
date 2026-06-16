'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, Area, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, Percent, Users, Wallet, Activity, Sparkles, Loader2, CalendarClock, AlertTriangle,
} from 'lucide-react';
import { getLedger, getAccounts, getTrialBalance } from '@/lib/accounting';
import {
  computeFinancialAnalytics, cashAndReceivables, GRANULARITY_LABELS, type Granularity, type LedgerEntry,
} from '@/lib/financialAnalytics';

const mny = (n: number) => `${Math.round(Number(n) || 0).toLocaleString('fr-CA')} $`;
const mnyK = (n: number) => { const v = Number(n) || 0; return Math.abs(v) >= 10000 ? `${(v / 1000).toFixed(0)} k$` : `${Math.round(v)} $`; };
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

type AiAnalysis = { health?: string; summary?: string; insights?: { severity: string; title: string; detail: string }[]; recommendations?: string[] };

// Méga-dashboard « État financier » : CA, charges, marge, masse salariale, croissance, trésorerie.
// Filtres : granularité (quotidien→annuel), plage de dates, mois de début d'exercice (rappels de clôture).
export function FinancialDashboard({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [balances, setBalances] = useState<Record<string, { debit: number; credit: number }>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [granularity, setGranularity] = useState<Granularity>('month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fiscalStartMonth, setFiscalStartMonth] = useState(1);

  const [aiBusy, setAiBusy] = useState(false);
  const [ai, setAi] = useState<AiAnalysis | null>(null);
  const [aiErr, setAiErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const [led, acc, bal] = await Promise.all([getLedger(tenant), getAccounts(tenant), getTrialBalance(tenant)]);
        if (!active) return;
        setLedger(led || []); setAccounts(acc || []); setBalances(bal || {});
      } catch (e: any) { if (active) setErr(e?.message || 'Erreur de chargement (grand livre).'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [tenant]);

  const { cash, arTotal, apTotal } = useMemo(() => cashAndReceivables(accounts, balances), [accounts, balances]);
  const a = useMemo(() => computeFinancialAnalytics(ledger, { granularity, from, to, fiscalStartMonth, cash, arTotal, apTotal }), [ledger, granularity, from, to, fiscalStartMonth, cash, arTotal, apTotal]);

  // Prochaine clôture comptable (selon le mois de début d'exercice) — rappel.
  const nextClose = useMemo(() => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fyEndMonth = (fiscalStartMonth - 2 + 12) % 12; // dernier mois de l'exercice (0-11)
    let fyEnd = new Date(now.getFullYear(), fyEndMonth + 1, 0);
    if (fyEnd < now) fyEnd = new Date(now.getFullYear() + 1, fyEndMonth + 1, 0);
    const days = Math.ceil((fyEnd.getTime() - now.getTime()) / 86400000);
    return { month: endOfMonth.toLocaleDateString('fr-CA'), fyEnd: fyEnd.toLocaleDateString('fr-CA'), fyDays: days };
  }, [fiscalStartMonth]);

  async function runAi() {
    setAiBusy(true); setAiErr(null);
    try {
      const resp = await fetch('/api/finance/analytics-ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ analytics: a, granularityLabel: GRANULARITY_LABELS[granularity] }),
      });
      const jr = await resp.json().catch(() => ({}));
      if (!resp.ok || jr.error) throw new Error(jr.error || `HTTP ${resp.status}`);
      setAi(jr.analysis || null);
    } catch (e: any) { setAiErr(e?.message || 'Erreur'); }
    finally { setAiBusy(false); }
  }

  const chartData = a.periods.map(p => ({ name: p.label, CA: Math.round(p.revenue), Charges: Math.round(p.expense), Marge: Math.round(p.margin), Paie: Math.round(p.payroll) }));
  const healthCls: Record<string, string> = {
    excellent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    bon: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    a_surveiller: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    critique: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };
  const sevCls: Record<string, string> = {
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
    warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
    critical: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
  };

  const kpis = [
    { label: tr('Chiffre d’affaires', 'Revenue'), value: mnyK(a.revenueTotal), icon: DollarSign, color: 'text-blue-600' },
    { label: tr('Charges', 'Expenses'), value: mnyK(a.expenseTotal), icon: TrendingDown, color: 'text-rose-600' },
    { label: tr('Marge', 'Margin'), value: mnyK(a.marginTotal), icon: Activity, color: a.marginTotal >= 0 ? 'text-emerald-600' : 'text-red-600', sub: `${a.marginPct.toFixed(1)} %` },
    { label: tr('Masse salariale', 'Payroll'), value: mnyK(a.payrollTotal), icon: Users, color: 'text-violet-600', sub: `${a.payrollPct.toFixed(1)} % ${tr('du CA', 'of rev.')}` },
    { label: tr('Croissance', 'Growth'), value: a.growthPct != null ? `${a.growthPct >= 0 ? '+' : ''}${a.growthPct.toFixed(1)} %` : '—', icon: TrendingUp, color: (a.growthPct || 0) >= 0 ? 'text-emerald-600' : 'text-red-600', sub: tr('dernière période', 'last period') },
    { label: tr('Trésorerie', 'Cash'), value: mnyK(a.cash), icon: Wallet, color: 'text-slate-900 dark:text-white', sub: `AR ${mnyK(a.arTotal)} · AP ${mnyK(a.apTotal)}` },
  ];

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;
  if (err) return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"><p className="font-semibold">{tr('État financier indisponible', 'Financial state unavailable')}</p><p className="mt-1 text-sm">{err}</p></div>;

  return (
    <div className="space-y-4">
      {/* Barre de filtres */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <label className="text-xs font-semibold text-gray-500">{tr('Granularité', 'Granularity')}
          <select value={granularity} onChange={e => setGranularity(e.target.value as Granularity)} className="mt-1 block rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700">
            {(['day', 'week', 'month', 'quarter', 'year'] as Granularity[]).map(g => <option key={g} value={g}>{tr(GRANULARITY_LABELS[g], g)}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-500">{tr('Du', 'From')}<input type="date" value={from} onChange={e => setFrom(e.target.value)} className="mt-1 block rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" /></label>
        <label className="text-xs font-semibold text-gray-500">{tr('Au', 'To')}<input type="date" value={to} onChange={e => setTo(e.target.value)} className="mt-1 block rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" /></label>
        <label className="text-xs font-semibold text-gray-500">{tr('Début d’exercice', 'Fiscal start')}
          <select value={fiscalStartMonth} onChange={e => setFiscalStartMonth(Number(e.target.value))} className="mt-1 block rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{tr(m, m)}</option>)}
          </select>
        </label>
        {(from || to) && <button onClick={() => { setFrom(''); setTo(''); }} className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 dark:border-gray-600">{tr('Effacer dates', 'Clear dates')}</button>}
        <div className="ml-auto flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
          <CalendarClock size={14} /> {tr('Fin d’exercice', 'Fiscal year-end')} : {nextClose.fyEnd} ({nextClose.fyDays} {tr('j', 'd')})
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{k.label}</span>
                <Icon size={15} className="text-slate-300" />
              </div>
              <div className={`text-xl font-extrabold ${k.color}`}>{k.value}</div>
              {k.sub && <div className="mt-0.5 text-[10px] text-slate-400">{k.sub}</div>}
            </div>
          );
        })}
      </div>

      {/* Timeline croissance : CA / charges / marge */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">{tr('Évolution — CA, charges, marge', 'Trend — revenue, expenses, margin')}</h3>
        {chartData.length === 0 ? (
          <p className="grid h-[260px] place-items-center text-center text-xs text-slate-400">{tr('Aucune écriture comptabilisée sur la période. Les transactions/paie/factures alimentent ce tableau via le grand livre.', 'No posted entries for the period. Transactions/payroll/invoices feed this via the ledger.')}</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: any) => mnyK(v)} />
              <Tooltip formatter={(v: any) => mny(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="CA" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={18} />
              <Bar dataKey="Charges" fill="#fb7185" radius={[3, 3, 0, 0]} barSize={18} />
              <Line type="monotone" dataKey="Marge" stroke="#10b981" strokeWidth={2.5} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Masse salariale vs CA */}
      {chartData.some(d => d.Paie > 0) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">{tr('Masse salariale vs chiffre d’affaires', 'Payroll vs revenue')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: any) => mnyK(v)} />
              <Tooltip formatter={(v: any) => mny(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="CA" stroke="#3b82f6" fill="#dbeafe" />
              <Bar dataKey="Paie" fill="#8b5cf6" radius={[3, 3, 0, 0]} barSize={18} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Analyse IA */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-indigo-700 dark:text-indigo-300"><Sparkles size={16} /> {tr('Analyse IA — direction financière', 'AI analysis — CFO')}</h3>
          <button onClick={runAi} disabled={aiBusy || a.periods.length === 0} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {aiBusy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {ai ? tr('Réanalyser', 'Re-analyze') : tr('Analyser', 'Analyze')}
          </button>
        </div>
        {aiErr && <p className="mt-2 text-xs text-red-600">{aiErr}</p>}
        {!ai && !aiBusy && !aiErr && <p className="mt-2 text-xs text-slate-500">{tr('Diagnostic de dirigeant : santé financière, tendances, risques (marge, masse salariale, trésorerie), recommandations priorisées.', 'Executive diagnosis: financial health, trends, risks, prioritized recommendations.')}</p>}
        {ai && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {ai.health && <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${healthCls[ai.health] || 'bg-slate-100 text-slate-600'}`}>{ai.health.replace('_', ' ')}</span>}
              {ai.summary && <span className="text-sm text-slate-700 dark:text-slate-200">{ai.summary}</span>}
            </div>
            {!!(ai.insights || []).length && (
              <div className="grid gap-2 sm:grid-cols-2">
                {ai.insights!.map((it, i) => (
                  <div key={i} className={`rounded-lg border px-3 py-2 ${sevCls[it.severity] || sevCls.info}`}>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-100">{it.severity === 'critical' && <AlertTriangle size={12} className="text-red-500" />}{it.title}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">{it.detail}</div>
                  </div>
                ))}
              </div>
            )}
            {!!(ai.recommendations || []).length && (
              <div>
                <div className="mb-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">{tr('Recommandations', 'Recommendations')}</div>
                <ol className="list-decimal space-y-0.5 pl-5 text-xs text-slate-700 dark:text-slate-300">
                  {ai.recommendations!.map((r, i) => <li key={i}>{r}</li>)}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400">{tr('Source : grand livre (transactions, paie et factures comptabilisées). Masse salariale détectée par les comptes de charges « salaire/paie ».', 'Source: general ledger (posted transactions, payroll and invoices). Payroll detected from "salary/payroll" expense accounts.')}</p>
    </div>
  );
}
