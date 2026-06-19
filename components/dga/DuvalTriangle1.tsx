'use client';
// Triangle de Duval 1 — rendu SVG AVEC zones colorées. Logique pure (géométrie + zones + classification)
// dans lib/dga/triangle1.ts (partagée avec les autres méthodes d'interprétation). Convention d'axes :
// CH4 haut · C2H2 bas-gauche · C2H4 bas-droite.
import React from 'react';
import { TOP, LEFT, RIGHT, ZONES, toPercent, pointXY, zonePoints, classifyTriangle1, type Gases } from '@/lib/dga/triangle1';

export { classifyTriangle1 };

type SamplePoint = Gases & { id: string | number; date?: string };

export function DuvalTriangle1({ samples, showHistory = true }: { samples: SamplePoint[]; showHistory?: boolean }) {
  const pts = samples.map(s => { const pct = toPercent(s); if (!pct) return null; return { ...pointXY(pct.pCH4, pct.pC2H2, pct.pC2H4), id: s.id }; })
    .filter(Boolean) as { x: number; y: number; id: string | number }[];
  const verdict = samples.length ? classifyTriangle1(samples[samples.length - 1]) : null;

  return (
    <div>
      <svg viewBox="0 0 400 340" width="100%" style={{ maxWidth: 360 }} role="img" aria-label="Triangle de Duval 1 avec zones de défaut colorées">
        {ZONES.map(z => (<polygon key={z.fault} points={zonePoints(z.verts)} fill={z.fill} fillOpacity={0.85} stroke={z.stroke} strokeWidth={0.5} />))}
        {ZONES.map(z => {
          const c = z.verts.reduce((acc, v) => { const p = pointXY(v.ch4, v.c2h2, v.c2h4); return { x: acc.x + p.x / z.verts.length, y: acc.y + p.y / z.verts.length }; }, { x: 0, y: 0 });
          return (<text key={z.fault} x={c.x} y={c.y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600} fill={z.text}>{z.fault}</text>);
        })}
        <polygon points={`${TOP.x},${TOP.y} ${LEFT.x},${LEFT.y} ${RIGHT.x},${RIGHT.y}`} fill="none" stroke="#444" strokeWidth={1.5} />
        <text x={TOP.x} y={TOP.y - 8} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">CH₄</text>
        <text x={LEFT.x - 4} y={LEFT.y + 16} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">C₂H₂</text>
        <text x={RIGHT.x + 4} y={RIGHT.y + 16} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">C₂H₄</text>
        {showHistory && pts.length > 1 && (<polyline points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#A32D2D" strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />)}
        {pts.map((p, i) => { const isCurrent = i === pts.length - 1; return (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={isCurrent ? 6 : 4} fill={isCurrent ? '#501313' : '#D85A30'} stroke="#fff" strokeWidth={1.5} />
            <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize={9} fill="#555">{p.id}</text>
          </g>); })}
      </svg>
      {verdict && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ background: ZONES.find(z => z.fault === verdict.fault)?.fill, color: ZONES.find(z => z.fault === verdict.fault)?.text, fontWeight: 600, padding: '2px 10px', borderRadius: 6, fontSize: 13 }}>{verdict.fault}</span>
          <span style={{ fontSize: 13 }} className="text-gray-600 dark:text-gray-300">{verdict.label}</span>
        </div>
      )}
    </div>
  );
}

export default DuvalTriangle1;
