'use client';

// Triangle de Duval 1 (huile minérale) — SVG avec zones colorées + point tracé.
// Sommets : CH4 (haut), C2H2 (bas-gauche), C2H4 (bas-droite). Affiche « Quantité de gaz insuffisante »
// si les gaz de défaut (CH4+C2H2+C2H4) sont trop bas pour appliquer la méthode (cohérent IEC 60599).
import React from 'react';

const ZONE_FILL: Record<string, string> = {
  PD: '#93c5fd', D1: '#fca5a5', D2: '#ef4444', T1: '#fde68a', T2: '#fcd34d', T3: '#fb923c', DT: '#d8b4fe',
};

export function DuvalTriangle({ ch4, c2h2, c2h4, zone, size = 240 }: { ch4: number; c2h2: number; c2h4: number; zone?: string; size?: number }) {
  const tot = (ch4 || 0) + (c2h2 || 0) + (c2h4 || 0);
  const insufficient = tot < 1; // gaz de défaut trop bas
  const m = tot > 0 ? (100 * ch4) / tot : 0;
  const a = tot > 0 ? (100 * c2h2) / tot : 0;
  const e = tot > 0 ? (100 * c2h4) / tot : 0;

  const pad = 26;
  const W = size, H = size * 0.92;
  const top = { x: W / 2, y: pad };
  const bl = { x: pad, y: H - pad };
  const br = { x: W - pad, y: H - pad };
  // Barycentrique (CH4, C2H2, C2H4) -> écran
  const bary = (mm: number, aa: number, ee: number) => ({ x: (mm / 100) * top.x + (aa / 100) * bl.x + (ee / 100) * br.x, y: (mm / 100) * top.y + (aa / 100) * bl.y + (ee / 100) * br.y });
  const P = (mm: number, aa: number, ee: number) => { const p = bary(mm, aa, ee); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; };
  const px = bary(m, a, e);

  // Zones approximatives (Duval Triangle 1). Polygones en coordonnées (%CH4,%C2H2,%C2H4).
  const zones: { code: string; pts: string }[] = [
    { code: 'PD', pts: `${P(100, 0, 0)} ${P(98, 0, 2)} ${P(98, 2, 0)}` },
    { code: 'T1', pts: `${P(98, 0, 2)} ${P(98, 2, 0)} ${P(76, 4, 20)} ${P(80, 0, 20)}` },
    { code: 'T2', pts: `${P(80, 0, 20)} ${P(76, 4, 20)} ${P(46, 4, 50)} ${P(50, 0, 50)}` },
    { code: 'T3', pts: `${P(50, 0, 50)} ${P(46, 4, 50)} ${P(0, 15, 85)} ${P(0, 0, 100)}` },
    { code: 'D1', pts: `${P(98, 2, 0)} ${P(0, 87, 13)} ${P(0, 100, 0)}` },
    { code: 'D2', pts: `${P(98, 2, 0)} ${P(76, 4, 20)} ${P(46, 4, 50)} ${P(0, 23, 77)} ${P(0, 87, 13)}` },
    { code: 'DT', pts: `${P(46, 4, 50)} ${P(0, 15, 85)} ${P(0, 23, 77)}` },
  ];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-[260px]">
        {zones.map(z => <polygon key={z.code} points={z.pts} fill={ZONE_FILL[z.code]} fillOpacity="0.55" stroke="#fff" strokeWidth="0.5" />)}
        <polygon points={`${top.x},${top.y} ${bl.x},${bl.y} ${br.x},${br.y}`} fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
        <text x={top.x} y={top.y - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">CH₄</text>
        <text x={bl.x - 4} y={bl.y + 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">C₂H₂</text>
        <text x={br.x + 2} y={br.y + 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">C₂H₄</text>
        {!insufficient && (
          <g>
            <circle cx={px.x} cy={px.y} r="6" fill="#111827" stroke="#fff" strokeWidth="2" />
            {zone && <text x={px.x + 9} y={px.y + 4} fontSize="12" fontWeight="800" fill="#111827">{zone}</text>}
          </g>
        )}
      </svg>
      {insufficient && <p className="mt-1 text-center text-[11px] font-semibold text-gray-400">Quantité de gaz insuffisante</p>}
    </div>
  );
}

export default DuvalTriangle;
