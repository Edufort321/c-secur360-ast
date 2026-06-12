'use client';

// Tendances DGA — grille de mini-graphiques auto-générés, un par paramètre (gaz + qualité d'huile),
// généré automatiquement dès qu'au moins 2 mesures datées contiennent la valeur. (Style page TENDANCES.)
import React, { useMemo } from 'react';
import type { Measure } from '@/lib/dga/dossiers';

type Param = { key: string; label: string; color: string; get: (m: Measure) => number | null };
const numOrNull = (v: any) => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v));
// Un relevé n'a de gaz que si au moins un gaz > 0. Un relevé partiel (BPC/huile seul) ne doit pas
// alimenter les courbes de gaz (null = ignoré). Gère aussi les anciens relevés où les gaz vides = 0.
const GAS_KEYS = ['h2', 'ch4', 'c2h6', 'c2h4', 'c2h2', 'co', 'co2'];
const hasGas = (m: Measure) => GAS_KEYS.some(k => { const v = numOrNull((m as any)[k]); return v != null && v > 0; });
const gasVal = (m: Measure, k: string) => hasGas(m) ? numOrNull((m as any)[k]) : null;

const PARAMS: Param[] = [
  { key: 'tdcg', label: 'TDCG (ppm)', color: '#111827', get: m => hasGas(m) ? numOrNull(m.tdcg) : null },
  { key: 'h2', label: 'Hydrogène H₂ (ppm)', color: '#2563eb', get: m => gasVal(m, 'h2') },
  { key: 'ch4', label: 'Méthane CH₄ (ppm)', color: '#16a34a', get: m => gasVal(m, 'ch4') },
  { key: 'c2h6', label: 'Éthane C₂H₆ (ppm)', color: '#0891b2', get: m => gasVal(m, 'c2h6') },
  { key: 'c2h4', label: 'Éthylène C₂H₄ (ppm)', color: '#f59e0b', get: m => gasVal(m, 'c2h4') },
  { key: 'c2h2', label: 'Acétylène C₂H₂ (ppm)', color: '#dc2626', get: m => gasVal(m, 'c2h2') },
  { key: 'co', label: 'Monoxyde CO (ppm)', color: '#7c3aed', get: m => gasVal(m, 'co') },
  { key: 'co2', label: 'Dioxyde CO₂ (ppm)', color: '#9333ea', get: m => gasVal(m, 'co2') },
  { key: 'moisture', label: 'Humidité (ppm)', color: '#0ea5e9', get: m => numOrNull(m.oil_quality?.moisture) },
  { key: 'dielectric', label: 'Rigidité D1816 (kV)', color: '#0d9488', get: m => numOrNull(m.oil_quality?.dielectric) },
  { key: 'dbd877', label: 'Rigidité D877 (kV)', color: '#14b8a6', get: m => numOrNull(m.oil_quality?.dbd877) },
  { key: 'ift', label: 'Tension interfaciale (mN/m)', color: '#65a30d', get: m => numOrNull(m.oil_quality?.ift) },
  { key: 'acid', label: 'Acidité (mgKOH/g)', color: '#ca8a04', get: m => numOrNull(m.oil_quality?.acid) },
  { key: 'color', label: 'Couleur (ASTM D1500)', color: '#b45309', get: m => numOrNull(m.oil_quality?.color) },
  { key: 'pf25', label: 'Facteur puissance 25°C (%)', color: '#db2777', get: m => numOrNull(m.oil_quality?.pf25) },
  { key: 'pf100', label: 'Facteur puissance 100°C (%)', color: '#e11d48', get: m => numOrNull(m.oil_quality?.pf100) },
];

function MiniChart({ param, pts }: { param: Param; pts: { d: string; v: number }[] }) {
  const W = 240, H = 120, padL = 34, padB = 22, padT = 12, padR = 8;
  const vals = pts.map(p => p.v);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (min === max) { min = min - 1; max = max + 1; }
  const span = max - min;
  const x = (i: number) => padL + (i * (W - padL - padR)) / Math.max(1, pts.length - 1);
  const y = (v: number) => padT + (H - padT - padB) * (1 - (v - min) / span);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const tickEvery = Math.max(1, Math.ceil(pts.length / 4));
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">{param.label}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-gray-400">
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="currentColor" strokeOpacity="0.3" />
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="currentColor" strokeOpacity="0.3" />
        <text x={padL - 3} y={y(max) + 3} textAnchor="end" fontSize="8" fill="currentColor">{Math.round(max * 100) / 100}</text>
        <text x={padL - 3} y={y(min) + 3} textAnchor="end" fontSize="8" fill="currentColor">{Math.round(min * 100) / 100}</text>
        {pts.map((p, i) => i % tickEvery === 0 && <text key={i} x={x(i)} y={H - padB + 11} textAnchor="middle" fontSize="7" fill="currentColor">{p.d.slice(2)}</text>)}
        <path d={d} fill="none" stroke={param.color} strokeWidth="2" />
        {pts.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.v)} r="2.5" fill={param.color} />)}
      </svg>
    </div>
  );
}

export function Trends({ measures, tr }: { measures: Measure[]; tr: (fr: string, en: string) => string }) {
  const series = useMemo(() => {
    const dated = measures.filter(m => m.sample_date).slice(-24);
    return PARAMS.map(p => {
      const pts = dated.map(m => ({ d: m.sample_date as string, v: p.get(m) })).filter(x => x.v != null) as { d: string; v: number }[];
      return { p, pts };
    }).filter(s => s.pts.length >= 2);
  }, [measures]);

  if (series.length === 0) return <p className="text-xs text-gray-400">{tr('Au moins 2 mesures datées requises pour les tendances.', 'At least 2 dated measures required for trends.')}</p>;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {series.map(s => <MiniChart key={s.p.key} param={s.p} pts={s.pts} />)}
    </div>
  );
}

export default Trends;
