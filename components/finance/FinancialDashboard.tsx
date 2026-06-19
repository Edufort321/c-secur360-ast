'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, Area, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, Percent, Users, Wallet, Activity, Sparkles, Loader2, CalendarClock, AlertTriangle, Package, BookOpen,
} from 'lucide-react';
import { getLedger, getAccounts, getTrialBalance } from '@/lib/accounting';
import RevenueClassManager from '@/components/finance/RevenueClassManager';
import WipReport from '@/components/finance/WipReport';
import SaasAndForecast from '@/components/finance/SaasAndForecast';
import {
  computeFinancialAnalytics, cashAndReceivables, revenueByClass, GRANULARITY_LABELS, type Granularity, type LedgerEntry, type DrillCategory,
} from '@/lib/financialAnalytics';
import LedgerDrilldown from '@/components/finance/LedgerDrilldown';
import { downloadCsv } from '@/lib/csv';
import { getInventoryValuation, getBookedStockValue, postInventoryToBalance, type InventoryValuation } from '@/lib/inventory';

const mny = (n: number) => `${Math.round(Number(n) || 0).toLocaleString('fr-CA')} $`;
const mnyK = (n: number) => { const v = Number(n) || 0; return Math.abs(v) >= 10000 ? `${(v / 1000).toFixed(0)} k$` : `${Math.round(v)} $`; };
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

type AiAnalysis = { health?: string; summary?: string; insights?: { severity: string; title: string; detail: string }[]; recommendations?: string[] };

// Mini-courbe (sparkline) 12 points dans une carte KPI.
function Sparkline({ values }: { values: number[] }) {
  const w = 100, h = 22;
  const min = Math.min(...values), max = Math.max(...values); const range = (max - min) || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  const up = values[values.length - 1] >= values[0];
  return <svg viewBox={`0 0 ${w} ${h}`} height={22} preserveAspectRatio="none" className="mt-1.5 w-full"><polyline points={pts} fill="none" stroke={up ? '#10b981' : '#ef4444'} strokeWidth={2} vectorEffect="non-scaling-stroke" /></svg>;
}

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
  const [preset, setPreset] = useState<string>('');

  // Présélections de période rapides (vue dirigeant : un clic = fenêtre + granularité adaptée).
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  function applyPreset(kind: string) {
    setPreset(kind);
    const today = new Date();
    const end = iso(today);
    const back = (months: number, g: Granularity) => { const d = new Date(today.getFullYear(), today.getMonth() - months, today.getDate()); setFrom(iso(d)); setTo(end); setGranularity(g); };
    if (kind === '7j') { const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7); setFrom(iso(d)); setTo(end); setGranularity('day'); }
    else if (kind === '30j') { const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30); setFrom(iso(d)); setTo(end); setGranularity('day'); }
    else if (kind === '3m') back(3, 'week');
    else if (kind === '6m') back(6, 'month');
    else if (kind === '12m') back(12, 'month');
    else if (kind === 'ytd') { const fyStart = new Date(today.getFullYear(), fiscalStartMonth - 1, 1); if (fyStart > today) fyStart.setFullYear(fyStart.getFullYear() - 1); setFrom(iso(fyStart)); setTo(end); setGranularity('month'); }
    else if (kind === 'all') { setFrom(''); setTo(''); setGranularity('month'); }
  }
  const PRESETS: { k: string; l: string }[] = [
    { k: '7j', l: tr('7 jours', '7 days') }, { k: '30j', l: tr('30 jours', '30 days') },
    { k: '3m', l: tr('3 mois', '3 mo') }, { k: '6m', l: tr('6 mois', '6 mo') },
    { k: '12m', l: tr('12 mois', '12 mo') }, { k: 'ytd', l: tr('Exercice', 'FYTD') }, { k: 'all', l: tr('Tout', 'All') },
  ];

  const [aiBusy, setAiBusy] = useState(false);
  const [ai, setAi] = useState<AiAnalysis | null>(null);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [drill, setDrill] = useState<{ category: DrillCategory; title: string } | null>(null);

  // Stocks / inventaire (#42) : valeur calculée (live) + solde comptabilisé 1300 + optimisation.
  const [stock, setStock] = useState<InventoryValuation | null>(null);
  const [booked1300, setBooked1300] = useState<number | null>(null);
  const [stockBusy, setStockBusy] = useState(false);
  const [stockMsg, setStockMsg] = useState<string | null>(null);
  async function loadStock() {
    const [val, booked] = await Promise.all([getInventoryValuation(tenant), getBookedStockValue(tenant)]);
    setStock(val); setBooked1300(booked);
  }
  useEffect(() => { loadStock().catch(() => { setStock(null); setBooked1300(null); }); /* eslint-disable-next-line */ }, [tenant]);
  async function postStock() {
    if (!stock) return;
    setStockBusy(true); setStockMsg(null);
    try {
      const r = await postInventoryToBalance(tenant, stock.totalValue);
      setStockMsg(r.posted ? `✓ ${tr('Comptabilisé au bilan (compte 1300). Écart', 'Posted to balance sheet (1300). Delta')} : ${mny(r.delta)}` : (r.reason || tr('Déjà à jour.', 'Up to date.')));
      const booked = await getBookedStockValue(tenant); setBooked1300(booked);
    } catch (e: any) { setStockMsg('Erreur : ' + (e?.message || e)); }
    finally { setStockBusy(false); }
  }

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
  const [revByClass, setRevByClass] = useState<{ name: string; value: number }[]>([]);
  useEffect(() => { revenueByClass(tenant, from || undefined, to || undefined).then(setRevByClass).catch(() => setRevByClass([])); }, [tenant, from, to]);
  const a = useMemo(() => computeFinancialAnalytics(ledger, { granularity, from, to, fiscalStartMonth, cash, arTotal, apTotal }), [ledger, granularity, from, to, fiscalStartMonth, cash, arTotal, apTotal]);

  // Auto-diagnostic : signale une donnée INCOMPLÈTE qui rend les marges non significatives (ex. démo sans
  // côté coûts). Évite que le dashboard paraisse « cassé » : il EXPLIQUE qu'il manque des écritures.
  const dataGaps = useMemo(() => {
    const g: string[] = [];
    if (a.revenueTotal > 0) {
      if (a.payrollTotal === 0) g.push(tr('aucune masse salariale comptabilisée', 'no payroll booked'));
      if (a.expenseTotal < a.revenueTotal * 0.05) g.push(tr('charges quasi nulles (< 5 % du CA)', 'expenses near zero (< 5% of revenue)'));
      if (a.cogsTotal === 0) g.push(tr('aucun coût des ventes (COGS)', 'no cost of goods (COGS)'));
    }
    return g;
  }, [a]); // eslint-disable-line react-hooks/exhaustive-deps

  // Donut RÉCONCILIÉ avec le CA (source unique = grand livre) : la somme des parts = CA de la carte.
  // Le reliquat « Non classé (grand livre) » = CA du GL − revenus déjà ventilés par classe (factures/transactions).
  const revByClassRecon = useMemo(() => {
    const classified = revByClass.reduce((s, x) => s + x.value, 0);
    const remainder = Math.round((a.revenueTotal - classified) * 100) / 100;
    const list = revByClass.slice();
    if (remainder > 1) list.push({ name: 'Non classé (grand livre)', value: remainder });
    return list;
  }, [revByClass, a.revenueTotal]);

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

  function exportPnl() {
    downloadCsv('etat-financier.csv', a.periods, [
      { key: 'label', label: tr('Période', 'Period') },
      { key: 'revenue', label: tr('CA', 'Revenue'), type: 'money' },
      { key: 'cogs', label: 'COGS', type: 'money' },
      { key: 'grossMargin', label: tr('Marge brute', 'Gross margin'), type: 'money' },
      { key: 'payroll', label: tr('Masse salariale', 'Payroll'), type: 'money' },
      { key: 'opex', label: 'Opex', type: 'money' },
      { key: 'ebitda', label: 'EBITDA', type: 'money' },
      { key: 'expense', label: tr('Charges', 'Expenses'), type: 'money' },
      { key: 'margin', label: tr('Marge nette', 'Net margin'), type: 'money' },
    ]);
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
    { label: tr('Chiffre d’affaires', 'Revenue'), value: mnyK(a.revenueTotal), icon: DollarSign, color: 'text-blue-600', cat: 'revenue' as DrillCategory, spark: a.periods.map(p => p.revenue) },
    { label: tr('Charges', 'Expenses'), value: mnyK(a.expenseTotal), icon: TrendingDown, color: 'text-rose-600', cat: 'expense' as DrillCategory, spark: a.periods.map(p => p.expense) },
    { label: tr('Marge brute', 'Gross margin'), value: mnyK(a.grossMarginTotal), icon: Activity, color: a.grossMarginTotal >= 0 ? 'text-emerald-600' : 'text-red-600', sub: `${a.grossMarginPct.toFixed(1)} % · COGS ${mnyK(a.cogsTotal)}`, cat: 'cogs' as DrillCategory, spark: a.periods.map(p => p.grossMargin) },
    { label: tr('Marge nette', 'Net margin'), value: mnyK(a.marginTotal), icon: Activity, color: a.marginTotal >= 0 ? 'text-emerald-600' : 'text-red-600', sub: `${a.marginPct.toFixed(1)} %`, spark: a.periods.map(p => p.margin) },
    { label: tr('Masse salariale', 'Payroll'), value: mnyK(a.payrollTotal), icon: Users, color: 'text-violet-600', sub: `${a.payrollPct.toFixed(1)} % ${tr('du CA', 'of rev.')}`, cat: 'payroll' as DrillCategory, spark: a.periods.map(p => p.payroll) },
    { label: tr('Croissance', 'Growth'), value: a.growthPct == null ? '—' : Math.abs(a.growthPct) > 500 ? tr('nouvelle activité', 'new activity') : `${a.growthPct >= 0 ? '+' : ''}${a.growthPct.toFixed(1)} %`, icon: TrendingUp, color: (a.growthPct || 0) >= 0 ? 'text-emerald-600' : 'text-red-600', sub: a.growthPct != null && Math.abs(a.growthPct) > 500 ? tr('base de départ faible', 'low starting base') : tr('dernière période', 'last period') },
    { label: tr('Trésorerie', 'Cash'), value: mnyK(a.cash), icon: Wallet, color: 'text-slate-900 dark:text-white', sub: `AR ${mnyK(a.arTotal)} · AP ${mnyK(a.apTotal)}` },
    { label: 'EBITDA', value: mnyK(a.ebitdaTotal), icon: Activity, color: a.ebitdaTotal >= 0 ? 'text-teal-600' : 'text-red-600', sub: `${a.ebitdaPct.toFixed(1)} % ${tr('du CA', 'of rev.')}`, spark: a.periods.map(p => p.ebitda) },
    { label: 'CAPEX', value: mnyK(a.capexTotal), icon: TrendingDown, color: 'text-amber-600', sub: tr('investissements', 'investments'), cat: 'capex' as DrillCategory, spark: a.periods.map(p => p.capex) },
  ];

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;
  if (err) return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"><p className="font-semibold">{tr('État financier indisponible', 'Financial state unavailable')}</p><p className="mt-1 text-sm">{err}</p></div>;

  return (
    <div className="space-y-4">
      {/* Barre de filtres */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold text-gray-400">{tr('Période', 'Period')} :</span>
        {PRESETS.map(p => (
          <button key={p.k} onClick={() => applyPreset(p.k)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${preset === p.k ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-gray-700 dark:text-slate-300 dark:hover:bg-gray-600'}`}>
            {p.l}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold text-gray-500">{tr('Granularité', 'Granularity')}
          <select value={granularity} onChange={e => setGranularity(e.target.value as Granularity)} className="mt-1 block rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700">
            {(['day', 'week', 'month', 'quarter', 'year'] as Granularity[]).map(g => <option key={g} value={g}>{tr(GRANULARITY_LABELS[g], g)}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-500">{tr('Du', 'From')}<input type="date" value={from} onChange={e => { setFrom(e.target.value); setPreset(''); }} className="mt-1 block rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" /></label>
        <label className="text-xs font-semibold text-gray-500">{tr('Au', 'To')}<input type="date" value={to} onChange={e => { setTo(e.target.value); setPreset(''); }} className="mt-1 block rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" /></label>
        <label className="text-xs font-semibold text-gray-500">{tr('Début d’exercice', 'Fiscal start')}
          <select value={fiscalStartMonth} onChange={e => setFiscalStartMonth(Number(e.target.value))} className="mt-1 block rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{tr(m, m)}</option>)}
          </select>
        </label>
        {(from || to) && <button onClick={() => { setFrom(''); setTo(''); setPreset(''); }} className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 dark:border-gray-600">{tr('Effacer dates', 'Clear dates')}</button>}
        <button onClick={exportPnl} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-300"><BookOpen size={13} /> {tr('Export Excel (état)', 'Export Excel (P&L)')}</button>
        <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
          <CalendarClock size={14} /> {tr('Fin d’exercice', 'Fiscal year-end')} : {nextClose.fyEnd} ({nextClose.fyDays} {tr('j', 'd')})
        </div>
      </div>
      </div>

      {/* Bandeau auto-diagnostic : données incomplètes (côté coûts non comptabilisé) */}
      {dataGaps.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          <AlertTriangle size={16} className="shrink-0" />
          <span className="font-semibold">{tr('Données incomplètes — marges non significatives :', 'Incomplete data — margins not meaningful:')}</span>
          <span>{dataGaps.join(' · ')}.</span>
          <span className="opacity-90">{tr('Comptabilisez vos dépenses/paies (Admin › Compta › « Synchroniser tout ») pour des marges fiables.', 'Book your expenses/payroll (Admin › Accounting › “Sync all”) for reliable margins.')}</span>
        </div>
      )}

      {/* KPI cards (cliquables → drill-down du grand livre, sparkline 12 points) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map(k => {
          const Icon = k.icon;
          const cat = (k as any).cat as DrillCategory | undefined;
          const spark = ((k as any).spark as number[] | undefined) || [];
          return (
            <div key={k.label} onClick={cat ? () => setDrill({ category: cat, title: k.label }) : undefined}
              className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${cat ? 'cursor-pointer transition hover:border-indigo-300 hover:shadow-md' : ''}`}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{k.label}</span>
                <Icon size={15} className="text-slate-300" />
              </div>
              <div className={`text-xl font-extrabold ${k.color}`}>{k.value}</div>
              {k.sub && <div className="mt-0.5 text-[10px] text-slate-400">{k.sub}</div>}
              {spark.length > 1 && <Sparkline values={spark} />}
            </div>
          );
        })}
      </div>

      {/* Stocks / inventaire (actif courant) — valorisation au bilan + optimisation par type */}
      {stock && stock.itemCount > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200"><Package size={16} /> {tr('Stocks / inventaire — actif courant', 'Inventory — current asset')}</h3>
            <button onClick={postStock} disabled={stockBusy} title={tr('Aligner le compte 1300 du grand livre sur la valeur calculée', 'Align ledger account 1300 with the computed value')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {stockBusy ? <Loader2 size={13} className="animate-spin" /> : <BookOpen size={13} />} {tr('Comptabiliser au bilan (1300)', 'Post to balance sheet (1300)')}
            </button>
          </div>
          {stockMsg && <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">{stockMsg}</div>}
          {/* Cartes valeur */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-700/30"><div className="text-[11px] font-semibold uppercase text-slate-400">{tr('Valeur (prix coûtant)', 'Value (at cost)')}</div><div className="text-xl font-extrabold text-emerald-600">{mny(stock.totalValue)}</div></div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-700/30"><div className="text-[11px] font-semibold uppercase text-slate-400">{tr('Au grand livre (1300)', 'Ledger (1300)')}</div><div className="text-xl font-extrabold text-slate-700 dark:text-slate-200">{booked1300 == null ? '—' : mny(booked1300)}</div>{booked1300 != null && Math.abs(booked1300 - stock.totalValue) >= 1 && <div className="mt-0.5 text-[10px] font-semibold text-amber-600">{tr('écart', 'delta')} {mny(stock.totalValue - booked1300)}</div>}</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-700/30"><div className="text-[11px] font-semibold uppercase text-slate-400">{tr('Articles · unités', 'Items · units')}</div><div className="text-xl font-extrabold text-slate-700 dark:text-slate-200">{stock.itemCount} · {stock.unitsTotal.toLocaleString('fr-CA')}</div></div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-900/20"><div className="text-[11px] font-semibold uppercase text-rose-400">{tr('À surveiller', 'To watch')}</div><div className="text-sm font-bold text-rose-700 dark:text-rose-300">{stock.lowstock.length} {tr('rupt.', 'low')} · {stock.overstock.length} {tr('sur.', 'over')} · {stock.dormant.length} {tr('dorm.', 'dorm.')}</div></div>
          </div>
          {/* Valeur par catégorie/type */}
          {stock.byCategory.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-xs font-bold text-slate-500">{tr('Valeur par type / catégorie', 'Value by type / category')}</div>
              <div className="space-y-1">
                {stock.byCategory.slice(0, 8).map(c => {
                  const pct = stock.totalValue > 0 ? (c.value / stock.totalValue) * 100 : 0;
                  return (
                    <div key={c.name} className="flex items-center gap-2 text-xs">
                      <span className="w-32 truncate text-slate-600 dark:text-slate-300">{c.name}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-gray-700"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(2, pct)}%` }} /></div>
                      <span className="w-24 text-right font-semibold text-slate-700 dark:text-slate-200">{mny(c.value)}</span>
                      <span className="w-10 text-right text-slate-400">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Optimisation : listes courtes */}
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {([
              { title: tr('Rupture / réappro', 'Low / reorder'), rows: stock.lowstock, cls: 'text-rose-600', note: (r: any) => `${r.quantity}/${r.minQty}` },
              { title: tr('Surstock', 'Overstock'), rows: stock.overstock, cls: 'text-amber-600', note: (r: any) => `${r.quantity}>${r.maxQty}` },
              { title: tr('Dormant (0 en stock)', 'Dormant (0 in stock)'), rows: stock.dormant, cls: 'text-slate-500', note: () => '0' },
            ] as const).map(col => (
              <div key={col.title} className="rounded-xl border border-slate-200 p-2.5 dark:border-gray-700">
                <div className={`mb-1 text-xs font-bold ${col.cls}`}>{col.title} <span className="font-normal text-slate-400">({col.rows.length})</span></div>
                {col.rows.length === 0 ? <p className="text-[11px] text-slate-400">{tr('Aucun', 'None')}</p> : (
                  <ul className="space-y-0.5 text-[11px]">
                    {col.rows.slice(0, 6).map(r => (
                      <li key={r.id} className="flex items-center justify-between gap-2"><span className="truncate text-slate-600 dark:text-slate-300">{r.name || r.code}</span><span className="shrink-0 font-mono text-slate-400">{col.note(r)}</span></li>
                    ))}
                    {col.rows.length > 6 && <li className="text-slate-400">+{col.rows.length - 6}…</li>}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">{tr('Valeur = Σ (quantité × prix coûtant) des articles. « Comptabiliser » aligne le compte 1300 (méthode périodique : variation des stocks, contrepartie 5350).', 'Value = Σ (quantity × cost) of items. “Post” aligns account 1300 (periodic method: inventory change, offset 5350).')}</p>
        </div>
      )}

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

      {/* Variations par période — Δ vs période précédente (CA, charges, marge) avec flèches */}
      {a.periods.length > 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">{tr('Variations par période', 'Period-over-period variations')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-slate-400"><tr>
                <th className="px-2 py-1 text-left">{tr('Période', 'Period')}</th>
                <th className="px-2 py-1">{tr('CA', 'Revenue')}</th><th className="px-2 py-1">Δ CA</th>
                <th className="px-2 py-1">{tr('Charges', 'Expenses')}</th><th className="px-2 py-1">Δ {tr('Ch.', 'Exp.')}</th>
                <th className="px-2 py-1">{tr('Marge', 'Margin')}</th><th className="px-2 py-1">Δ {tr('Marge', 'Margin')}</th>
                <th className="px-2 py-1">EBITDA</th>
              </tr></thead>
              <tbody>
                {a.periods.map((p, i) => {
                  const prev = i > 0 ? a.periods[i - 1] : null;
                  const dRev = prev ? p.revenue - prev.revenue : null;
                  const dExp = prev ? p.expense - prev.expense : null;
                  const dMar = prev ? p.margin - prev.margin : null;
                  const pct = (cur: number, pr: number) => (pr !== 0 ? ((cur - pr) / Math.abs(pr)) * 100 : null);
                  const arrow = (d: number | null, goodUp: boolean) => {
                    if (d == null || Math.abs(d) < 0.5) return <span className="text-slate-300">—</span>;
                    const good = goodUp ? d > 0 : d < 0;
                    const Ic = d > 0 ? TrendingUp : TrendingDown;
                    return <span className={`inline-flex items-center justify-end gap-0.5 font-semibold ${good ? 'text-emerald-600' : 'text-rose-600'}`}><Ic size={11} />{mnyK(Math.abs(d))}</span>;
                  };
                  const pctCell = (cur: number, pr: number | undefined) => { const v = prev ? pct(cur, pr as number) : null; return v == null ? '' : <span className="ml-1 text-[10px] text-slate-400">{v >= 0 ? '+' : ''}{v.toFixed(0)}%</span>; };
                  return (
                    <tr key={p.key} className="border-t border-slate-100 dark:border-gray-700/50">
                      <td className="px-2 py-1.5 text-left font-semibold text-slate-700 dark:text-slate-200">{p.label}</td>
                      <td className="px-2 py-1.5 text-blue-600">{mny(p.revenue)}</td>
                      <td className="px-2 py-1.5">{arrow(dRev, true)}{prev && pctCell(p.revenue, prev.revenue)}</td>
                      <td className="px-2 py-1.5 text-rose-500">{mny(p.expense)}</td>
                      <td className="px-2 py-1.5">{arrow(dExp, false)}{prev && pctCell(p.expense, prev.expense)}</td>
                      <td className={`px-2 py-1.5 font-semibold ${p.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{mny(p.margin)}</td>
                      <td className="px-2 py-1.5">{arrow(dMar, true)}</td>
                      <td className={`px-2 py-1.5 ${p.ebitda >= 0 ? 'text-teal-600' : 'text-red-600'}`}>{mny(p.ebitda)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">{tr('Δ = variation vs période précédente (vert = favorable). Choisissez la granularité (mensuel par défaut) et la période ci-dessus.', 'Δ = change vs previous period (green = favorable). Pick granularity and period above.')}</p>
        </div>
      )}

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

      {/* Revenus par classe (produit OU catégorie de revenu) + gestion des classes */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">{tr('Revenus par classe', 'Revenue by class')}</h3>
        {revByClassRecon.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={revByClassRecon} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {revByClassRecon.map((_, i) => <Cell key={i} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'][i % 8]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => mny(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="self-center">
              {revByClassRecon.map((c, i) => {
                const tot = revByClassRecon.reduce((s, x) => s + x.value, 0) || 1;
                return (
                  <div key={i} className="flex items-center justify-between border-b border-slate-100 py-1.5 text-sm dark:border-gray-700">
                    <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm" style={{ background: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'][i % 8] }} />{c.name}</span>
                    <span className="font-semibold">{mny(c.value)} <span className="text-xs font-normal text-slate-400">({((c.value / tot) * 100).toFixed(0)}%)</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">{tr('Aucun revenu classé sur la période. Assignez une CLASSE à vos revenus (facture ou transaction) — créez vos classes ci-dessous.', 'No classified revenue in the period. Assign a CLASS to your revenue (invoice or transaction) — create your classes below.')}</p>
        )}
        <p className="mt-2 text-[11px] text-slate-400">{tr('Réconcilié au grand livre : la somme des parts = le CA. Le reliquat non ventilé apparaît en « Non classé (grand livre) ». Classe = produit (ligne de facture) → catégorie de revenu (facture/transaction).', 'Reconciled to the ledger: slices sum to revenue. Unallocated remainder shows as "Unclassified (ledger)".')}</p>
        <RevenueClassManager tenant={tenant} tr={tr} />
      </div>

      {/* Travaux en cours (WIP) — chantiers actifs : coût chargé, facturé, marge, sur/sous-facturation */}
      <WipReport tenant={tenant} tr={tr} />

      {/* BLOC B : métriques SaaS + échéancier AR + prévision trésorerie 13 semaines */}
      {(() => {
        const pc = a.periods.length || 1;
        const monthlyEbitda = a.ebitdaTotal / pc;          // EBITDA moyen par période (mensuel si granularité mois)
        const weeklyOutflow = (a.expenseTotal / pc) / 4.33; // run-rate de charges hebdomadaire
        return <SaasAndForecast tenant={tenant} tr={tr} cash={a.cash} monthlyEbitda={monthlyEbitda} weeklyOutflow={weeklyOutflow} />;
      })()}

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

      <p className="text-[11px] text-slate-400">{tr('Source : grand livre (transactions, paie et factures comptabilisées). Cliquez une carte pour le détail des écritures.', 'Source: general ledger (posted transactions, payroll and invoices). Click a card to drill down to the entries.')}</p>

      {/* Drill-down : écritures du grand livre composant une carte KPI */}
      {drill && <LedgerDrilldown ledger={ledger} category={drill.category} title={drill.title} from={from || undefined} to={to || undefined} tr={tr} onClose={() => setDrill(null)} />}
    </div>
  );
}
