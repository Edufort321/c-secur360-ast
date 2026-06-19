'use client';
// Triangle de Duval 1 — VERSION GRILLE : ne dessine PAS de polygones à la main. On classe une grille fine
// de points par les RÈGLES officielles (lib/dga/triangle1) et on peint chaque cellule → pavage exact, zéro
// débordement/trou. Convention : CH4 (haut), C2H2 (bas-gauche), C2H4 (bas-droit).
import React, { useMemo } from 'react';
import { TOP, LEFT, RIGHT, FAULT_STYLE, classifyPct, toPct, pctToXY, classifyTriangle1, type Gases, type Fault, type Pct } from '@/lib/dga/triangle1';

export { classifyTriangle1 };

// Maillage barycentrique : N rangées de sous-triangles ; chaque cellule prend la couleur de la zone de son centre.
function buildMesh(steps = 70) {
  const cells: { points: string; fill: string }[] = [];
  const mk = (a: number, b: number): Pct => ({ ch4: a * 100, c2h2: b * 100, c2h4: (1 - a - b) * 100 });
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps - i; j++) {
      const a1 = i / steps, b1 = j / steps;
      const a2 = (i + 1) / steps, b2 = j / steps;
      const a3 = i / steps, b3 = (j + 1) / steps;
      const ca = (a1 + a2 + a3) / 3, cb = (b1 + b2 + b3) / 3;
      const p1 = pctToXY(mk(a1, b1)), p2 = pctToXY(mk(a2, b2)), p3 = pctToXY(mk(a3, b3));
      cells.push({ points: `${p1.x.toFixed(2)},${p1.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)} ${p3.x.toFixed(2)},${p3.y.toFixed(2)}`, fill: FAULT_STYLE[classifyPct(mk(ca, cb))].fill });
      if (j < steps - i - 1) {
        const a4 = (i + 1) / steps, b4 = (j + 1) / steps;
        const cca = (a2 + a3 + a4) / 3, ccb = (b2 + b3 + b4) / 3;
        const p4 = pctToXY(mk(a4, b4));
        cells.push({ points: `${p2.x.toFixed(2)},${p2.y.toFixed(2)} ${p3.x.toFixed(2)},${p3.y.toFixed(2)} ${p4.x.toFixed(2)},${p4.y.toFixed(2)}`, fill: FAULT_STYLE[classifyPct(mk(cca, ccb))].fill });
      }
    }
  }
  return cells;
}

const LABEL_POS: Record<Fault, Pct> = {
  PD: { ch4: 99, c2h2: 0.5, c2h4: 0.5 }, T1: { ch4: 80, c2h2: 2, c2h4: 18 }, T2: { ch4: 55, c2h2: 2, c2h4: 43 },
  T3: { ch4: 25, c2h2: 7, c2h4: 68 }, D1: { ch4: 20, c2h2: 70, c2h4: 10 }, D2: { ch4: 25, c2h2: 45, c2h4: 30 }, DT: { ch4: 35, c2h2: 18, c2h4: 47 },
};

type SamplePoint = Gases & { id: string | number; date?: string };

export function DuvalTriangle1({ samples, showHistory = true, meshSteps = 70 }: { samples: SamplePoint[]; showHistory?: boolean; meshSteps?: number }) {
  const mesh = useMemo(() => buildMesh(meshSteps), [meshSteps]);
  const pts = samples.map(s => { const p = toPct(s); if (!p) return null; return { ...pctToXY(p), id: s.id }; }).filter(Boolean) as { x: number; y: number; id: string | number }[];
  const last = samples[samples.length - 1];
  const lastPct = last ? toPct(last) : null;
  const verdict = lastPct ? classifyPct(lastPct) : null;

  return (
    <div>
      <svg viewBox="0 0 400 350" width="100%" style={{ maxWidth: 360 }} role="img" aria-label="Triangle de Duval 1 avec zones de défaut (frontières IEEE)">
        {mesh.map((c, i) => (<polygon key={i} points={c.points} fill={c.fill} stroke={c.fill} strokeWidth={0.3} />))}
        <polygon points={`${TOP.x},${TOP.y} ${LEFT.x},${LEFT.y} ${RIGHT.x},${RIGHT.y}`} fill="none" stroke="#333" strokeWidth={1.5} />
        {(Object.keys(LABEL_POS) as Fault[]).map(f => { const p = pctToXY(LABEL_POS[f]); return (<text key={f} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600} fill={FAULT_STYLE[f].text}>{f}</text>); })}
        <text x={TOP.x} y={TOP.y - 8} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">CH₄</text>
        <text x={LEFT.x - 2} y={LEFT.y + 16} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">C₂H₂</text>
        <text x={RIGHT.x + 2} y={RIGHT.y + 16} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">C₂H₄</text>
        {showHistory && pts.length > 1 && (<polyline points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#333" strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />)}
        {pts.map((p, i) => { const isCur = i === pts.length - 1; return (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={isCur ? 6 : 4} fill={isCur ? '#1a1a1a' : '#666'} stroke="#fff" strokeWidth={1.5} />
            <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize={9} fill="#333">{p.id}</text>
          </g>); })}
      </svg>
      {verdict && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ background: FAULT_STYLE[verdict].fill, color: FAULT_STYLE[verdict].text, fontWeight: 600, padding: '2px 10px', borderRadius: 6, fontSize: 13 }}>{verdict}</span>
          <span style={{ fontSize: 13 }} className="text-gray-600 dark:text-gray-300">{FAULT_STYLE[verdict].label}</span>
        </div>
      )}
    </div>
  );
}

export default DuvalTriangle1;
