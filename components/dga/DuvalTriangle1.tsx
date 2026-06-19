'use client';
// components/dga/DuvalTriangle1.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Triangle de Duval 1 — AVEC zones colorées.
// Convention d'axes (IEC 60599 / IEEE C57.104-2019) :
//   Sommet HAUT = CH4 · BAS-GAUCHE = C2H2 · BAS-DROIT = C2H4
// ⚠️ Frontières de zones = définition publique de la méthode Duval (en % de gaz), fonctionnelles pour
// l'affichage et la classification. À confirmer par Eric (IPS) contre la norme officielle.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';

const TOP = { x: 200, y: 30 };   // CH4
const LEFT = { x: 40, y: 310 };  // C2H2
const RIGHT = { x: 360, y: 310 }; // C2H4

type Gases = { CH4: number; C2H4: number; C2H2: number };

function toPercent({ CH4, C2H4, C2H2 }: Gases) {
  const total = CH4 + C2H4 + C2H2;
  if (total <= 0) return null;
  return { pCH4: (CH4 / total) * 100, pC2H2: (C2H2 / total) * 100, pC2H4: (C2H4 / total) * 100 };
}
function pointXY(pCH4: number, pC2H2: number, pC2H4: number) {
  const a = pCH4 / 100, b = pC2H2 / 100, c = pC2H4 / 100;
  return { x: a * TOP.x + b * LEFT.x + c * RIGHT.x, y: a * TOP.y + b * LEFT.y + c * RIGHT.y };
}

type PctVertex = { ch4: number; c2h2: number; c2h4: number };
const ZONES: { fault: string; fill: string; stroke: string; text: string; label: string; verts: PctVertex[] }[] = [
  { fault: 'PD', fill: '#B5D4F4', stroke: '#185FA5', text: '#0C447C', label: 'Décharges partielles',
    verts: [{ ch4: 100, c2h2: 0, c2h4: 0 }, { ch4: 98, c2h2: 0, c2h4: 2 }, { ch4: 98, c2h2: 2, c2h4: 0 }] },
  { fault: 'T1', fill: '#FAC775', stroke: '#854F0B', text: '#633806', label: 'Thermique < 300 °C',
    verts: [{ ch4: 98, c2h2: 0, c2h4: 2 }, { ch4: 80, c2h2: 0, c2h4: 20 }, { ch4: 76, c2h2: 4, c2h4: 20 }, { ch4: 94, c2h2: 4, c2h4: 2 }, { ch4: 98, c2h2: 2, c2h4: 0 }] },
  { fault: 'T2', fill: '#EF9F27', stroke: '#854F0B', text: '#633806', label: 'Thermique 300–700 °C',
    verts: [{ ch4: 80, c2h2: 0, c2h4: 20 }, { ch4: 50, c2h2: 0, c2h4: 50 }, { ch4: 46, c2h2: 4, c2h4: 50 }, { ch4: 76, c2h2: 4, c2h4: 20 }] },
  { fault: 'T3', fill: '#D85A30', stroke: '#993C1D', text: '#4A1B0C', label: 'Thermique > 700 °C',
    verts: [{ ch4: 50, c2h2: 0, c2h4: 50 }, { ch4: 0, c2h2: 0, c2h4: 100 }, { ch4: 0, c2h2: 15, c2h4: 85 }, { ch4: 35, c2h2: 15, c2h4: 50 }] },
  { fault: 'D1', fill: '#AFA9EC', stroke: '#534AB7', text: '#26215C', label: 'Décharges faible énergie',
    verts: [{ ch4: 0, c2h2: 100, c2h4: 0 }, { ch4: 0, c2h2: 87, c2h4: 13 }, { ch4: 23, c2h2: 64, c2h4: 13 }, { ch4: 23, c2h2: 77, c2h4: 0 }] },
  { fault: 'D2', fill: '#F09595', stroke: '#A32D2D', text: '#501313', label: 'Décharges forte énergie (arc)',
    verts: [{ ch4: 0, c2h2: 87, c2h4: 13 }, { ch4: 0, c2h2: 71, c2h4: 29 }, { ch4: 0, c2h2: 15, c2h4: 85 }, { ch4: 35, c2h2: 15, c2h4: 50 }, { ch4: 31, c2h2: 56, c2h4: 13 }, { ch4: 23, c2h2: 64, c2h4: 13 }] },
  { fault: 'DT', fill: '#5DCAA5', stroke: '#0F6E56', text: '#04342C', label: 'Mélange thermique/électrique',
    verts: [{ ch4: 94, c2h2: 4, c2h4: 2 }, { ch4: 76, c2h2: 4, c2h4: 20 }, { ch4: 46, c2h2: 4, c2h4: 50 }, { ch4: 35, c2h2: 15, c2h4: 50 }, { ch4: 23, c2h2: 64, c2h4: 13 }, { ch4: 31, c2h2: 56, c2h4: 13 }] },
];

function zonePoints(verts: PctVertex[]) {
  return verts.map(v => { const p = pointXY(v.ch4, v.c2h2, v.c2h4); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ');
}
function pointInPolygon(x: number, y: number, poly: { x: number; y: number }[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
    const hit = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}
export function classifyTriangle1(g: Gases): { fault: string; label: string } | null {
  const pct = toPercent(g);
  if (!pct) return null;
  const p = pointXY(pct.pCH4, pct.pC2H2, pct.pC2H4);
  for (const z of ZONES) {
    const polyPx = z.verts.map(v => pointXY(v.ch4, v.c2h2, v.c2h4));
    if (pointInPolygon(p.x, p.y, polyPx)) return { fault: z.fault, label: z.label };
  }
  return null;
}

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
