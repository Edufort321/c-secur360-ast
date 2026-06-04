'use client';

// Graphiques de tendance DGA — évolution des gaz et du TDCG dans le temps (SVG, sans dépendance).
import React, { useMemo, useState } from 'react';
import type { Measure } from '@/lib/dga/dossiers';

const SERIES: { key: keyof Measure | 'tdcg'; label: string; color: string }[] = [
  { key: 'tdcg', label: 'TDCG', color: '#111827' },
  { key: 'h2', label: 'H₂', color: '#2563eb' },
  { key: 'ch4', label: 'CH₄', color: '#16a34a' },
  { key: 'c2h4', label: 'C₂H₄', color: '#f59e0b' },
  { key: 'c2h2', label: 'C₂H₂', color: '#dc2626' },
  { key: 'co', label: 'CO', color: '#7c3aed' },
];

export function Trends({ measures, tr }: { measures: Measure[]; tr: (fr: string, en: string) => string }) {
  const [on, setOn] = useState<Record<string, boolean>>({ tdcg: true, h2: true, ch4: true, c2h4: true, c2h2: true, co: false });
  const pts = useMemo(() => measures.filter(m => m.sample_date).slice(-24), [measures]);

  if (pts.length < 2) return <p className="text-xs text-gray-400">{tr('Au moins 2 mesures datées requises pour la tendance.', 'At least 2 dated measures required for trend.')}</p>;

  const W = 640, H = 220, padL = 40, padB = 26, padT = 10, padR = 10;
  const active = SERIES.filter(s => on[s.key as string]);
  const vals = (k: string) => pts.map(m => Number((m as any)[k]) || 0);
  const max = Math.max(1, ...active.flatMap(s => vals(s.key as string)));
  const x = (i: number) => padL + (i * (W - padL - padR)) / (pts.length - 1);
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {SERIES.map(s => (
          <button key={s.key as string} onClick={() => setOn(o => ({ ...o, [s.key as string]: !o[s.key as string] }))}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${on[s.key as string] ? 'text-white' : 'text-gray-500 bg-gray-100 dark:bg-gray-700'}`}
            style={on[s.key as string] ? { background: s.color } : undefined}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: on[s.key as string] ? '#fff' : s.color }} /> {s.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-gray-400">
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="currentColor" strokeOpacity="0.3" />
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="currentColor" strokeOpacity="0.3" />
        {[0, 0.5, 1].map((f, i) => <text key={i} x={padL - 4} y={y(max * f) + 3} textAnchor="end" fontSize="9" fill="currentColor">{Math.round(max * f)}</text>)}
        {pts.map((m, i) => (i % Math.ceil(pts.length / 6) === 0) && <text key={i} x={x(i)} y={H - padB + 12} textAnchor="middle" fontSize="8" fill="currentColor">{(m.sample_date || '').slice(2)}</text>)}
        {active.map(s => {
          const d = pts.map((m, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(Number((m as any)[s.key]) || 0).toFixed(1)}`).join(' ');
          return <g key={s.key as string}><path d={d} fill="none" stroke={s.color} strokeWidth="2" />{pts.map((m, i) => <circle key={i} cx={x(i)} cy={y(Number((m as any)[s.key]) || 0)} r="2.5" fill={s.color} />)}</g>;
        })}
      </svg>
    </div>
  );
}

export default Trends;
