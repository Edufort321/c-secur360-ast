'use client';
// Graphiques KPI SSE — meilleures pratiques (lagging + leading). Recharts (cohérent avec FinancialDashboard).
//  • Tendance LTIFR/TRIR/DART/Gravité (lignes, 12 mois glissants) + heures (barres) avec lignes-cibles.
//  • Pyramide de sécurité (Heinrich : presque-accident → mineur → grave) + barres « attendu » 1:29:300.
//  • Incidents par type (barres horizontales fines, couleur sémantique par type).
//  • Leading vs Lagging : indicateurs proactifs (TBM/JSA/visites…) vs incidents enregistrables.
// Données fournies par le parent (calculs purs lib/hse/kpi). Bilingue. Couleurs = source unique kpiPalette.
import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine, Cell, LabelList,
} from 'recharts';
import type { HseKpiRow } from '@/lib/hse/kpi';
import { normalizedRate } from '@/lib/hse/kpi';
import type { HseIncident } from '@/lib/hse/data';
import { KPI_COLORS, SEVERITY_COLORS, eventColor } from './kpiPalette';
import { RateTooltip, CountTooltip } from './kpiTooltips';

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
  INSPECTION: { fr: 'Inspections réalisées', en: 'Inspections done' },
};

export function HseKpiCharts({ rows, incidents, proactive = [], targets = {}, lang = 'fr', rateBase = 200000 }: {
  rows: HseKpiRow[]; incidents: HseIncident[]; proactive?: ProactiveLite[]; targets?: KpiTargets; lang?: 'fr' | 'en'; rateBase?: number;
}) {
  const EN = lang === 'en';
  const tr = (fr: string, en: string) => (EN ? en : fr);
  const card = 'rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800';
  const title = 'mb-2 text-sm font-bold text-gray-800 dark:text-gray-100';
  const note = 'mt-1 text-[11px] text-gray-400';
  const axis = { fontSize: 11, fill: '#9ca3af' };
  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anim = !prefersReducedMotion;

  // ── 1) Tendance des taux — série 12 MOIS GLISSANTS calculée CÔTÉ CLIENT à partir de `rows` ──────────
  // (la vue DB hse_v_safety_kpi_rolling12 / mig 269 n'est pas encore appliquée). Pour chaque mois on somme
  // les COMPTAGES BRUTS et les HEURES sur la fenêtre des 12 mois précédents (inclus), puis on RECALCULE
  // chaque taux via normalizedRate(Σcompte, Σheures, base) — jamais une moyenne de taux (mal pondérée).
  const rolling = useMemo(() => rows.map((_, idx) => {
    const win = rows.slice(Math.max(0, idx - 11), idx + 1);
    const sum = (k: keyof HseKpiRow) => win.reduce((s, r) => s + (Number(r[k]) || 0), 0);
    const h = sum('hours');
    return {
      month: rows[idx].month,
      hours: Math.round(h),
      ltifr: normalizedRate(sum('ltiCount'), h, rateBase),
      trir: normalizedRate(sum('recordableCount'), h, rateBase),
      dart: normalizedRate(sum('dartCount'), h, rateBase),
      severity: normalizedRate(sum('lostDays'), h, rateBase),
    };
  }), [rows, rateBase]);

  // Séries de la tendance : LTIFR + TRIR visibles par défaut ; DART + Gravité masquées (légende cliquable).
  const trendSeries = [
    { key: 'ltifr', name: 'LTIFR', color: KPI_COLORS.ltifr, dash: undefined as string | undefined },
    { key: 'trir', name: 'TRIR', color: KPI_COLORS.trir, dash: undefined },
    { key: 'dart', name: 'DART', color: KPI_COLORS.dart, dash: '5 3' },
    { key: 'severity', name: tr('Gravité', 'Severity'), color: KPI_COLORS.severity, dash: undefined },
  ];
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(['dart', 'severity']));
  const toggle = (k: string) => setHidden(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const dotsOnly = rolling.length < 3;          // une ligne sur < 3 points est trompeuse → points seuls
  const manyX = rolling.length > 8;             // beaucoup de mois → incliner les libellés de l'axe X
  const rollingLabel = tr('12 mois glissants', 'Rolling 12 months');

  // ── 2) Pyramide de sécurité (Heinrich) ───────────────────────────────────────────────────────────
  const near = rows.reduce((s, r) => s + r.nearMissCount, 0);
  const minor = rows.reduce((s, r) => s + Math.max(0, r.recordableCount - r.ltiCount), 0); // enregistrables non LTI
  const serious = rows.reduce((s, r) => s + r.ltiCount, 0);                                 // avec arrêt = sommet
  // « Attendu » selon le ratio 1:29:300, normalisé sur le nb de graves (sinon sur les mineurs / 29).
  const unit = serious > 0 ? serious : (minor > 0 ? minor / 29 : 0);
  const pyramid = [
    { tier: tr('Grave / avec arrêt', 'Serious / lost-time'), v: serious, color: SEVERITY_COLORS.serious, ref: 1, expected: unit * 1 },
    { tier: tr('Mineur enregistrable', 'Minor recordable'), v: minor, color: SEVERITY_COLORS.minor, ref: 29, expected: unit * 29 },
    { tier: tr('Passé proche', 'Near-miss'), v: near, color: SEVERITY_COLORS.nearMiss, ref: 300, expected: unit * 300 },
  ];
  const maxPyr = Math.max(1, near, minor, serious, ...pyramid.map(p => p.expected));
  const ratioObs = serious > 0 ? `1 : ${(minor / serious).toFixed(0)} : ${(near / serious).toFixed(0)}` : '—';
  const recordableTotal = minor + serious;
  const poorReporting = recordableTotal > 0 && near < recordableTotal * 3;

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

  const hasData = rows.length > 0 || incidents.length > 0;
  if (!hasData) return <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400 dark:border-gray-600">{tr('Aucune donnée — saisir des incidents et des heures pour générer les graphiques.', 'No data — enter incidents and hours to generate charts.')}</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Tendance des taux normalisés */}
      <div className={`${card} lg:col-span-2`}>
        <div className={title}>{tr('Tendance des taux normalisés', 'Normalized rate trend')} <span className="text-xs font-normal text-gray-400">· {rollingLabel}</span></div>
        {/* Légende = vrais boutons (focus clavier visible) ; clic = afficher/masquer la série. */}
        <div className="mb-1 flex flex-wrap gap-2">
          {trendSeries.map(s => {
            const off = hidden.has(s.key);
            return (
              <button key={s.key} type="button" onClick={() => toggle(s.key)} aria-pressed={!off}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-800 ${off ? 'border-gray-200 text-gray-400 dark:border-gray-700' : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200'}`}>
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: off ? '#d1d5db' : s.color }} />
                {s.name}
              </button>
            );
          })}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={rolling} margin={{ top: 8, right: 20, left: 8, bottom: manyX ? 24 : 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={axis} interval={0} angle={manyX ? -35 : 0} textAnchor={manyX ? 'end' : 'middle'} height={manyX ? 50 : 30} />
            <YAxis yAxisId="r" tick={axis} label={{ value: tr('Taux / base', 'Rate / base'), angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#9ca3af' } }} />
            <YAxis yAxisId="h" orientation="right" tick={axis} label={{ value: tr('Heures', 'Hours'), angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#9ca3af' } }} />
            <Tooltip content={<RateTooltip lang={lang} rollingLabel={rollingLabel} />} />
            {/* Heures = barres DERRIÈRE les lignes (rendues avant), axe droit, gris neutre, opacité ~0.25 */}
            <Bar yAxisId="h" dataKey="hours" name={tr('Heures', 'Hours')} fill={KPI_COLORS.hours} opacity={0.25} barSize={18} isAnimationActive={anim} animationDuration={550} />
            {trendSeries.filter(s => !hidden.has(s.key)).map(s => (
              <Line key={s.key} yAxisId="r" type="linear" dataKey={s.key} name={s.name} stroke={dotsOnly ? 'transparent' : s.color}
                strokeWidth={dotsOnly ? 0 : 2} strokeDasharray={s.dash}
                dot={dotsOnly ? { r: 4, fill: s.color, stroke: '#fff', strokeWidth: 1 } : false}
                activeDot={{ r: 4 }} isAnimationActive={anim} animationDuration={550} connectNulls />
            ))}
            {targets.ltifr != null && <ReferenceLine yAxisId="r" y={targets.ltifr} stroke={KPI_COLORS.ltifr} strokeDasharray="4 4" label={{ value: `LTIFR ${targets.ltifr}`, fontSize: 9, fill: KPI_COLORS.ltifr, position: 'right' }} />}
            {targets.trir != null && <ReferenceLine yAxisId="r" y={targets.trir} stroke={KPI_COLORS.trir} strokeDasharray="4 4" label={{ value: `TRIR ${targets.trir}`, fontSize: 9, fill: KPI_COLORS.trir, position: 'right' }} />}
          </ComposedChart>
        </ResponsiveContainer>
        <div className={note}>{tr('LTIFR/TRIR/gravité = (n × base) / heures, cumulés sur 12 mois glissants. Heures = barres (axe droit). DART et gravité : clic sur la légende. Lignes-cibles éditables en Configuration.', 'LTIFR/TRIR/severity = (n × base) / hours, rolling 12 months. Hours = bars (right axis). DART and severity: click the legend. Target lines editable in Configuration.')}</div>
      </div>

      {/* Pyramide de sécurité */}
      <div className={card}>
        <div className={title}>{tr('Pyramide de sécurité (Heinrich)', 'Safety pyramid (Heinrich)')}</div>
        <div className="space-y-2 py-2">
          {pyramid.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-28 shrink-0 text-right text-[11px] text-gray-500">{p.tier}</div>
              <div className="flex-1 space-y-1">
                <div className="flex h-7 items-center justify-center rounded text-xs font-bold text-white" style={{ width: `${Math.max(8, (p.v / maxPyr) * 100)}%`, background: p.color }}>{p.v}</div>
                {/* Barre « fantôme » = nombre ATTENDU selon le ratio 1:29:300 (contour pointillé, fond transparent) */}
                {unit > 0 && (
                  <div className="flex h-3.5 items-center rounded border border-dashed bg-transparent px-1 text-[9px] leading-none" style={{ width: `${Math.max(8, (p.expected / maxPyr) * 100)}%`, borderColor: p.color, color: p.color }}>
                    ~{Math.round(p.expected)}
                  </div>
                )}
              </div>
              <div className="w-16 shrink-0 text-[10px] text-gray-400">{tr('réf.', 'ref.')} {p.ref}</div>
            </div>
          ))}
        </div>
        <div className={note}>{tr('Barre pleine = observé ; contour pointillé = attendu (ratio 1 : 29 : 300). Ratio observé', 'Solid bar = observed; dashed outline = expected (1 : 29 : 300 ratio). Observed ratio')} = <b>{ratioObs}</b>. {tr('Une large base de passés proches déclarés = culture saine.', 'A wide reported near-miss base = healthy culture.')}</div>
        {poorReporting && <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">⚠ {tr('Peu de passés proches déclarés au regard des lésions : possible sous-déclaration. Encouragez la déclaration des presque-accidents (indicateur précurseur).', 'Few near-misses reported relative to injuries: possible under-reporting. Encourage near-miss reporting (a leading indicator).')}</div>}
      </div>

      {/* Incidents par type */}
      <div className={card}>
        <div className={title}>{tr('Incidents par type', 'Incidents by type')}</div>
        <ResponsiveContainer width="100%" height={Math.max(160, typeData.length * 42 + 24)}>
          <BarChart data={typeData} layout="vertical" margin={{ top: 4, right: 32, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" tick={axis} allowDecimals={false} />
            <YAxis type="category" dataKey="label" tick={axis} width={104} />
            <Tooltip content={<CountTooltip />} cursor={{ fill: 'rgba(148,163,184,0.12)' }} />
            <Bar dataKey="v" barSize={30} radius={[0, 4, 4, 0]} isAnimationActive={anim} animationDuration={550}>
              <LabelList dataKey="v" position="right" style={{ fontSize: 11, fill: '#6b7280' }} />
              {typeData.map((d, i) => <Cell key={i} fill={eventColor(d.code)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className={note}>{tr('Sur l’ensemble de la période sélectionnée. Couleur = gravité (rouge grave · ambre enregistrable · bleu passé proche).', 'Over the selected period. Color = severity (red serious · amber recordable · blue near-miss).')}</div>
      </div>

      {/* Leading vs Lagging */}
      <div className={`${card} lg:col-span-2`}>
        <div className={title}>{tr('Indicateurs proactifs (leading) vs réactifs (lagging)', 'Proactive (leading) vs reactive (lagging) indicators')}</div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">{tr('Évolution mensuelle : actions proactives vs incidents enregistrables', 'Monthly: proactive actions vs recordable incidents')}</div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={llData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={axis} /><YAxis tick={axis} allowDecimals={false} />
                <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey={tr('Proactif (leading)', 'Proactive (leading)')} fill={KPI_COLORS.proactive} barSize={18} radius={[3, 3, 0, 0]} isAnimationActive={anim} animationDuration={550} />
                <Line type="linear" dataKey={tr('Enregistrables (lagging)', 'Recordables (lagging)')} stroke={SEVERITY_COLORS.recordable} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={anim} animationDuration={550} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">{tr('Total des actions proactives par type', 'Total proactive actions by type')}</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={proData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={axis} allowDecimals={false} /><YAxis type="category" dataKey="label" tick={axis} width={90} />
                <Tooltip content={<CountTooltip />} /><Bar dataKey="v" fill={KPI_COLORS.proactive} radius={[0, 4, 4, 0]} isAnimationActive={anim} animationDuration={550} />
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
