'use client';

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Percent, Activity, Layers, Sparkles, Loader2, AlertTriangle, Trophy, Target,
} from 'lucide-react';
import {
  computeProjectAnalytics, projectMetric, STATUS_ORDER, STATUS_LABEL, STATUS_HEX, type ProjectLike,
} from '@/lib/projectAnalytics';

const mny = (n: number) => `${Math.round(Number(n) || 0).toLocaleString('fr-CA')} $`;
const mnyK = (n: number) => { const v = Number(n) || 0; return Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)} k$` : `${Math.round(v)} $`; };

type AiAnalysis = {
  health?: string; summary?: string;
  insights?: { severity: string; title: string; detail: string }[];
  unprofitable?: { number: string; reason: string; action: string }[];
  recommendations?: string[];
};

// Tableau de bord ERP « dirigeant » du portefeuille de projets : KPIs, graphiques, classement, analyse IA.
export function ProjectsAnalytics({ projects, tenant }: { projects: ProjectLike[]; tenant: string }) {
  const a = useMemo(() => computeProjectAnalytics(projects), [projects]);
  const [aiBusy, setAiBusy] = useState(false);
  const [ai, setAi] = useState<AiAnalysis | null>(null);
  const [aiErr, setAiErr] = useState<string | null>(null);

  const statusData = STATUS_ORDER.map(s => ({ key: s, name: STATUS_LABEL[s], value: a.byStatus[s] || 0, fill: STATUS_HEX[s] }))
    .filter(d => d.value > 0);
  const valueByStatus = STATUS_ORDER.map(s => ({
    name: STATUS_LABEL[s], fill: STATUS_HEX[s],
    value: a.metrics.filter(m => m.status === s).reduce((sum, m) => sum + m.contract, 0),
  })).filter(d => d.value > 0);
  const marginBars = a.metrics.filter(m => m.hasFinancials).slice(0, 10).map(m => ({ name: m.number, marge: Math.round(m.margin), pct: m.marginPct }));

  async function runAi() {
    setAiBusy(true); setAiErr(null);
    try {
      const resp = await fetch('/api/projects/analytics-ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ analytics: a }),
      });
      const jr = await resp.json().catch(() => ({}));
      if (!resp.ok || jr.error) throw new Error(jr.error || `HTTP ${resp.status}`);
      setAi(jr.analysis || null);
    } catch (e: any) { setAiErr(e?.message || 'Erreur'); }
    finally { setAiBusy(false); }
  }

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
    { label: 'Projets', value: String(a.count), icon: Layers, color: 'text-slate-900 dark:text-white', sub: `${a.wonCount} gagnés · ${a.quotedCount} en soumission` },
    { label: 'Conversion', value: `${a.conversionPct.toFixed(0)} %`, icon: Target, color: 'text-violet-600', sub: 'soumission → projet' },
    { label: 'Valeur contrats', value: mnyK(a.contractTotal), icon: DollarSign, color: 'text-blue-600', sub: 'tous projets' },
    { label: 'WIP (en cours)', value: mnyK(a.wipValue), icon: Activity, color: 'text-indigo-600', sub: 'travaux en cours' },
    { label: 'Facturé', value: mnyK(a.invoicedValue), icon: TrendingUp, color: 'text-emerald-600', sub: 'projets facturés' },
    { label: 'Marge moyenne', value: `${a.avgMarginPct.toFixed(1)} %`, icon: Percent, color: a.avgMarginPct >= 0 ? 'text-emerald-600' : 'text-red-600', sub: `${mny(a.marginTotal)} · ${a.financedCount} projets` },
  ];

  return (
    <div className="mb-6 space-y-4">
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
              <div className="mt-0.5 text-[10px] text-slate-400">{k.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Graphiques */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Entonnoir par statut */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">Projets par statut</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={42} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: any) => [`${v}`, 'Projets']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Valeur des contrats par statut (donut) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">Valeur des contrats par statut</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={valueByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={70} paddingAngle={2}>
                {valueByStatus.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip formatter={(v: any) => mny(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Marge par projet (top 10) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">Marge par projet (top 10)</h3>
          {marginBars.length === 0 ? (
            <p className="grid h-[200px] place-items-center text-center text-xs text-slate-400">Aucune donnée de coût réel (feuilles de temps) pour calculer la marge.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={marginBars} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={46} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: any) => mnyK(v)} />
                <Tooltip formatter={(v: any) => mny(Number(v))} />
                <Bar dataKey="marge" radius={[4, 4, 0, 0]}>
                  {marginBars.map((d, i) => <Cell key={i} fill={d.marge >= 0 ? '#10b981' : '#dc2626'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Meilleures / pires + non profitables */}
      <div className="grid gap-3 lg:grid-cols-3">
        <RankCard title="Meilleures marges" icon={<Trophy size={15} className="text-emerald-500" />} items={a.best} positive />
        <RankCard title="Pires marges" icon={<TrendingDown size={15} className="text-amber-500" />} items={a.worst} />
        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 shadow-sm dark:border-red-800 dark:bg-red-900/10">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-red-700 dark:text-red-300"><AlertTriangle size={15} /> Projets non profitables ({a.unprofitable.length})</h3>
          {a.unprofitable.length === 0 ? (
            <p className="text-xs text-slate-500">Aucun projet en perte (parmi ceux ayant des coûts réels saisis). 👍</p>
          ) : (
            <ul className="space-y-1.5">
              {a.unprofitable.slice(0, 6).map(m => (
                <li key={m.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate"><span className="font-mono text-slate-400">{m.number}</span> · {m.title}</span>
                  <span className="shrink-0 font-bold text-red-600">{mny(m.margin)} ({m.marginPct.toFixed(0)}%)</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Analyse IA */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-indigo-700 dark:text-indigo-300"><Sparkles size={16} /> Analyse IA du portefeuille</h3>
          <button onClick={runAi} disabled={aiBusy || a.count === 0} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {aiBusy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {ai ? 'Réanalyser' : 'Analyser'}
          </button>
        </div>
        {aiErr && <p className="mt-2 text-xs text-red-600">{aiErr}</p>}
        {!ai && !aiBusy && !aiErr && <p className="mt-2 text-xs text-slate-500">Lance une analyse de dirigeant : santé du portefeuille, projets à risque, recommandations priorisées.</p>}
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
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{it.title}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">{it.detail}</div>
                  </div>
                ))}
              </div>
            )}
            {!!(ai.unprofitable || []).length && (
              <div className="rounded-lg border border-red-200 bg-white/60 p-3 dark:border-red-800 dark:bg-gray-800/40">
                <div className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">Projets à corriger</div>
                <ul className="space-y-1">
                  {ai.unprofitable!.map((u, i) => (
                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300"><span className="font-mono font-semibold">{u.number}</span> — {u.reason} <span className="text-emerald-700 dark:text-emerald-400">→ {u.action}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {!!(ai.recommendations || []).length && (
              <div>
                <div className="mb-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">Recommandations</div>
                <ol className="list-decimal space-y-0.5 pl-5 text-xs text-slate-700 dark:text-slate-300">
                  {ai.recommendations!.map((r, i) => <li key={i}>{r}</li>)}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bandeau de performance PAR PROJET (visible à l'ouverture du projet) ──────
export function ProjectPerfStrip({ project, liveActualsTotal }: { project: ProjectLike; liveActualsTotal?: number }) {
  const base = projectMetric(project);
  // Préfère le coût réel LIVE (feuilles de temps) s'il est fourni.
  const cost = liveActualsTotal != null && liveActualsTotal > 0 ? liveActualsTotal : base.cost;
  const contract = base.contract;
  const margin = contract - cost;
  const marginPct = contract > 0 ? (margin / contract) * 100 : 0;
  const hasFin = contract > 0 && cost > 0;
  const fillPct = contract > 0 ? Math.min(100, Math.max(0, (cost / contract) * 100)) : 0;
  const danger = hasFin && margin < 0;
  const warn = hasFin && !danger && marginPct < 10;

  const cards = [
    { label: 'Contrat', value: mny(contract), color: 'text-slate-900 dark:text-white' },
    { label: 'Coût réel', value: cost > 0 ? mny(cost) : '—', color: 'text-blue-600' },
    { label: 'Marge', value: hasFin ? mny(margin) : '—', color: danger ? 'text-red-600' : 'text-emerald-600' },
    { label: 'Marge %', value: hasFin ? `${marginPct.toFixed(1)} %` : '—', color: danger ? 'text-red-600' : warn ? 'text-amber-600' : 'text-emerald-600' },
  ];

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200"><Activity size={15} className="text-blue-500" /> Performance du projet</h3>
        {hasFin && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${danger ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : warn ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
            {danger ? '⚠️ Non profitable' : warn ? 'Marge faible' : '✓ Profitable'}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-lg bg-slate-50 p-2 text-center dark:bg-gray-900/40">
            <div className={`text-lg font-extrabold ${c.color}`}>{c.value}</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">{c.label}</div>
          </div>
        ))}
      </div>
      {/* Barre coût vs contrat */}
      {contract > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[10px] text-slate-400"><span>Coût engagé</span><span>{fillPct.toFixed(0)}% du contrat</span></div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-gray-700">
            <div className={`h-full rounded-full ${danger ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${fillPct}%` }} />
          </div>
        </div>
      )}
      {!hasFin && <p className="mt-2 text-[11px] text-slate-400">Saisir le montant du contrat (BC/soumission) et les heures (feuilles de temps) pour calculer la marge.</p>}
    </div>
  );
}

function RankCard({ title, icon, items, positive }: { title: string; icon: React.ReactNode; items: { id: string; number: string; title: string; margin: number; marginPct: number }[]; positive?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">{icon} {title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">Pas encore de données de marge.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map(m => (
            <li key={m.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate"><span className="font-mono text-slate-400">{m.number}</span> · {m.title}</span>
              <span className={`shrink-0 font-bold ${m.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{m.marginPct.toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
