'use client';
// Graphiques KPI SSE — meilleures pratiques (lagging + leading). Recharts (cohérent avec FinancialDashboard).
//  • Tendance LTIFR/TRIR/Gravité (lignes) + heures (barres) avec lignes-cibles.
//  • Pyramide de sécurité (Heinrich : presque-accident → mineur → grave) + ratio observé.
//  • Incidents par type (barres).
//  • Leading vs Lagging : indicateurs proactifs (TBM/JSA/visites…) vs incidents enregistrables.
// Données fournies par le parent (calculs purs lib/hse/kpi). Bilingue. Aucune valeur normative codée ici.
import React from 'react';
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine, Cell,
} from 'recharts';
import type { HseKpiRow } from '@/lib/hse/kpi';
import type { HseIncident } from '@/lib/hse/data';

export type ProactiveLite = { metric_code: string; count_value: number; period_start: string };
export type KpiTargets = { ltifr?: number | null; trir?: number | null; severityRate?: number | null };

const EVENT_LABEL: Record<string, { fr: string; en: string }> = {
  NEAR_MISS: { fr: 'Passé proche', en: 'Near-miss' },
  RECORDABLE: { fr: 'Enregistrable', en: 'Recordable' },
  OVER_7_DAY: { fr: 'Incap. > 7 j', en: 'Over-7-day' },
  SPECIFIED_INJURY: { fr: 'Blessure grave', en: 'Serious injury' },
  MULTI_WORKER_INJURY: { fr: 'Multi-travailleurs', en: 'Multi-worker' },
  FATALITY: { fr: 'Décès', en: 'Fatality' },
  OCC_DISEASE: { fr: 'Maladie pro.', en: 'Occ. disease' },
  DANGEROUS_OCCURRENCE: { fr: 'Évén. dangereux', en: 'Dangerous occ.' },
  NON_WORKER_HOSPITAL: { fr: 'Hosp. non-trav.', en: 'Non-worker hosp.' },
  MATERIAL_DAMAGE: { fr: 'Dommages mat.', en: 'Material damage' },
};
const PROACTIVE_LABEL: Record<string, { fr: string; en: string }> = {
  TBM: { fr: 'Réunions sécu (TBM)', en: 'Toolbox meetings' },
  JSA: { fr: 'Analyses de tâche (JSA)', en: 'Job safety analyses' },
  HSE_VISIT: { fr: 'Visites SSE', en: 'HSE visits' },
  ENV_CONTROL: { fr: 'Contrôles environnement', en: 'Env. controls' },
  AAA: { fr: 'Actes/conditions corrigés', en: 'Acts/conditions fixed' },
  ASA: { fr: 'Observations sécurité', en: 'Safety observations' },
  WORK_PERMIT: { fr: 'Permis de travail', en: 'Work permits' },
};

export function HseKpiCharts({ rows, incidents, proactive = [], targets = {}, lang = 'fr' }: {
  rows: HseKpiRow[]; incidents: HseIncident[]; proactive?: ProactiveLite[]; targets?: KpiTargets; lang?: 'fr' | 'en';
}) {
  const EN = lang === 'en';
  const tr = (fr: string, en: string) => (EN ? en : fr);
  const card = 'rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800';
  const title = 'mb-2 text-sm font-bold text-gray-800 dark:text-gray-100';
  const note = 'mt-1 text-[11px] text-gray-400';

  // ── 1) Tendance des taux + heures ────────────────────────────────────────────────────────────────
  const trend = rows.map(r => ({ month: r.month, LTIFR: r.ltifr, TRIR: r.trir, [tr('Gravité', 'Severity')]: r.severityRate, [tr('Heures', 'Hours')]: r.hours }));

  // ── 2) Pyramide de sécurité (Heinrich) ───────────────────────────────────────────────────────────
  const near = rows.reduce((s, r) => s + r.nearMissCount, 0);
  const minor = rows.reduce((s, r) => s + Math.max(0, r.recordableCount - r.ltiCount), 0); // enregistrables non LTI
  const serious = rows.reduce((s, r) => s + r.ltiCount, 0);                                 // avec arrêt = sommet
  const pyramid = [
    { tier: tr('Grave / avec arrêt', 'Serious / lost-time'), v: serious, color: '#dc2626', ref: 1 },
    { tier: tr('Mineur enregistrable', 'Minor recordable'), v: minor, color: '#f59e0b', ref: 29 },
    { tier: tr('Passé proche', 'Near-miss'), v: near, color: '#3b82f6', ref: 300 },
  ];
  const maxPyr = Math.max(1, near, minor, serious);
  const ratioObs = serious > 0 ? `1 : ${(minor / serious).toFixed(0)} : ${(near / serious).toFixed(0)}` : '—';

  // ── 3) Incidents par type ────────────────────────────────────────────────────────────────────────
  const byType: Record<string, number> = {};
  for (const i of incidents) byType[i.event_code] = (byType[i.event_code] || 0) + 1;
  const typeData = Object.entries(byType)
    .map(([code, v]) => ({ code, label: tr(EVENT_LABEL[code]?.fr || code, EVENT_LABEL[code]?.en || code), v }))
    .sort((a, b) => b.v - a.v);

  // ── 4) Leading vs Lagging (proactif mensuel vs enregistrables) ──────────────────────────────────
  const proByMonth: Record<string, number> = {};
  for (const p of proactive) { const m = (p.period_start || '').slice(0, 7); proByMonth[m] = (proByMonth[m] || 0) + (Number(p.count_value) || 0); }
  const llData = rows.map(r => ({ month: r.month, [tr('Proactif (leading)', 'Proactive (leading)')]: proByMonth[r.month] || 0, [tr('Enregistrables (lagging)', 'Recordables (lagging)')]: r.recordableCount }));
  const proByCode: Record<string, number> = {};
  for (const p of proactive) proByCode[p.metric_code] = (proByCode[p.metric_code] || 0) + (Number(p.count_value) || 0);
  const proData = Object.entries(proByCode).map(([code, v]) => ({ label: tr(PROACTIVE_LABEL[code]?.fr || code, PROACTIVE_LABEL[code]?.en || code), v }));

  const axis = { fontSize: 11, fill: '#9ca3af' };
  const hasData = rows.length > 0 || incidents.length > 0;
  if (!hasData) return <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400 dark:border-gray-600">{tr('Aucune donnée — saisir des incidents et des heures pour générer les graphiques.', 'No data — enter incidents and hours to generate charts.')}</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Tendance des taux */}
      <div className={`${card} lg:col-span-2`}>
        <div className={title}>{tr('Tendance des taux normalisés (mensuel)', 'Normalized rate trend (monthly)')}</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={axis} /><YAxis yAxisId="r" tick={axis} /><YAxis yAxisId="h" orientation="right" tick={axis} />
            <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="h" dataKey={tr('Heures', 'Hours')} fill="#cbd5e1" opacity={0.5} barSize={18} />
            <Line yAxisId="r" type="monotone" dataKey="LTIFR" stroke="#dc2626" strokeWidth={2} dot={false} />
            <Line yAxisId="r" type="monotone" dataKey="TRIR" stroke="#2563eb" strokeWidth={2} dot={false} />
            <Line yAxisId="r" type="monotone" dataKey={tr('Gravité', 'Severity')} stroke="#f59e0b" strokeWidth={2} dot={false} />
            {targets.ltifr != null && <ReferenceLine yAxisId="r" y={targets.ltifr} stroke="#dc2626" strokeDasharray="4 4" label={{ value: `Cible LTIFR ${targets.ltifr}`, fontSize: 10, fill: '#dc2626' }} />}
            {targets.trir != null && <ReferenceLine yAxisId="r" y={targets.trir} stroke="#2563eb" strokeDasharray="4 4" label={{ value: `Cible TRIR ${targets.trir}`, fontSize: 10, fill: '#2563eb' }} />}
          </ComposedChart>
        </ResponsiveContainer>
        <div className={note}>{tr('LTIFR/TRIR/gravité = (n × base) / heures. Heures = barres (axe droit). Lignes-cibles éditables en Configuration.', 'LTIFR/TRIR/severity = (n × base) / hours. Hours = bars (right axis). Target lines editable in Configuration.')}</div>
      </div>

      {/* Pyramide de sécurité */}
      <div className={card}>
        <div className={title}>{tr('Pyramide de sécurité (Heinrich)', 'Safety pyramid (Heinrich)')}</div>
        <div className="space-y-1.5 py-2">
          {pyramid.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-28 shrink-0 text-right text-[11px] text-gray-500">{p.tier}</div>
              <div className="flex-1">
                <div className="mx-auto flex h-7 items-center justify-center rounded text-xs font-bold text-white" style={{ width: `${Math.max(12, (p.v / maxPyr) * 100)}%`, background: p.color }}>{p.v}</div>
              </div>
              <div className="w-16 shrink-0 text-[10px] text-gray-400">{tr('réf.', 'ref.')} {p.ref}</div>
            </div>
          ))}
        </div>
        <div className={note}>{tr('Ratio observé grave : mineur : passé proche', 'Observed ratio serious : minor : near-miss')} = <b>{ratioObs}</b> ({tr('réf. Heinrich 1 : 29 : 300', 'Heinrich ref. 1 : 29 : 300')}). {tr('Une large base de passés proches déclarés = culture saine.', 'A wide reported near-miss base = healthy culture.')}</div>
      </div>

      {/* Incidents par type */}
      <div className={card}>
        <div className={title}>{tr('Incidents par type', 'Incidents by type')}</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={typeData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" tick={axis} allowDecimals={false} /><YAxis type="category" dataKey="label" tick={axis} width={96} />
            <Tooltip /><Bar dataKey="v" radius={[0, 4, 4, 0]}>{typeData.map((d, i) => <Cell key={i} fill={d.code === 'NEAR_MISS' ? '#3b82f6' : d.code === 'FATALITY' ? '#7f1d1d' : '#ef4444'} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className={note}>{tr('Sur l’ensemble de la période sélectionnée.', 'Over the selected period.')}</div>
      </div>

      {/* Leading vs Lagging */}
      <div className={`${card} lg:col-span-2`}>
        <div className={title}>{tr('Indicateurs proactifs (leading) vs réactifs (lagging)', 'Proactive (leading) vs reactive (lagging) indicators')}</div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={llData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={axis} /><YAxis tick={axis} allowDecimals={false} />
                <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey={tr('Proactif (leading)', 'Proactive (leading)')} fill="#16a34a" barSize={18} radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey={tr('Enregistrables (lagging)', 'Recordables (lagging)')} stroke="#dc2626" strokeWidth={2} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={proData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={axis} allowDecimals={false} /><YAxis type="category" dataKey="label" tick={axis} width={90} />
                <Tooltip /><Bar dataKey="v" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={note}>{tr('Plus d’actions proactives en amont → moins d’incidents en aval (Campbell Institute / HSE). Les indicateurs proactifs se saisissent dans l’onglet Configuration.', 'More upstream proactive actions → fewer downstream incidents (Campbell Institute / HSE). Proactive indicators are entered in the Configuration tab.')}</div>
      </div>
    </div>
  );
}

export default HseKpiCharts;
