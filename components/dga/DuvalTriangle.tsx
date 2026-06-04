'use client';

// Triangle de Duval 1 — rendu repris À L'IDENTIQUE du prototype (DuvalTriangle ~l.619 de dga-oil-app.jsx) :
// CH4 en haut, C2H4 bas-gauche, C2H2 bas-droite ; trajectoire temporelle pointillée, points numérotés
// colorés par zone, point courant mis en évidence. Logique de zones dans lib/dga/duval.ts (frontières exactes).
import React from 'react';
import { duvalPct, duvalZone, triCoords, ZONE_COLORS } from '@/lib/dga/duval';

type Pt = { ch4: number; c2h2: number; c2h4: number; date?: string };

export function DuvalTriangle({ ch4, c2h2, c2h4, points, selIdx, lang = 'fr' }: {
  ch4?: number; c2h2?: number; c2h4?: number; points?: Pt[]; selIdx?: number; lang?: 'fr' | 'en';
}) {
  const data: Pt[] = points && points.length ? points : (ch4 != null ? [{ ch4: ch4 || 0, c2h2: c2h2 || 0, c2h4: c2h4 || 0 }] : []);
  const size = 290, pad = 40;
  const A = { x: pad + size / 2, y: pad }, B = { x: pad, y: pad + size * 0.866 }, C = { x: pad + size, y: pad + size * 0.866 };
  const pts = data.map((d, i) => { const p = duvalPct(d); if (!p) return null; return { ...triCoords(p, size, pad), z: duvalZone(p, lang), i }; }).filter(Boolean) as any[];
  const sel = selIdx != null ? selIdx : pts.length - 1;
  const path = pts.map(p => `${p.x},${p.y}`).join(' ');
  const cur = pts[pts.length - 1];
  const insufficient = data.length > 0 && pts.length === 0;

  return (
    <div className="text-gray-700 dark:text-gray-200">
      <svg viewBox={`0 0 ${size + pad * 2} ${size * 0.866 + pad * 2 + 20}`} width="100%" style={{ maxWidth: size + pad }}>
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="#fdf6ec" stroke="#3a2e25" strokeWidth="2" />
        {[20, 40, 60, 80].map(tk => { const f = tk / 100; return <line key={tk} x1={A.x + (B.x - A.x) * f} y1={A.y + (B.y - A.y) * f} x2={A.x + (C.x - A.x) * f} y2={A.y + (C.y - A.y) * f} stroke="#d8c3a5" strokeWidth="0.5" />; })}
        <text x={A.x} y={A.y - 10} textAnchor="middle" fontSize="13" fontWeight="700" fill="#3a2e25">CH₄</text>
        <text x={B.x - 6} y={B.y + 18} textAnchor="middle" fontSize="13" fontWeight="700" fill="#3a2e25">C₂H₄</text>
        <text x={C.x + 6} y={C.y + 18} textAnchor="middle" fontSize="13" fontWeight="700" fill="#3a2e25">C₂H₂</text>
        {pts.length > 1 && <polyline points={path} fill="none" stroke="#9d0208" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={i === sel ? 9 : 6} fill={ZONE_COLORS[p.z.code]} stroke={i === sel ? '#000' : '#fff'} strokeWidth="2" />
            <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="9" fontWeight="700" fill="#3a2e25">{i + 1}</text>
          </g>
        ))}
      </svg>
      {insufficient
        ? <p className="mt-1 text-center text-[11px] font-semibold text-gray-400">{lang === 'fr' ? 'Quantité de gaz insuffisante' : 'Insufficient gas'}</p>
        : cur && (
          <div className="mt-2 flex items-center justify-center gap-2 text-sm">
            <span className="grid h-7 w-9 place-items-center rounded font-extrabold text-white" style={{ background: ZONE_COLORS[cur.z.code] }}>{cur.z.code}</span>
            <span className="text-gray-700 dark:text-gray-200">{cur.z.label}</span>
          </div>
        )}
    </div>
  );
}

export default DuvalTriangle;
