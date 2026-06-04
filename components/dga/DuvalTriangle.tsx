'use client';

// Triangle de Duval 1 rigoureux (SVG) — 7 zones réelles (polygones barycentriques), point positionné
// précisément, trajectoire temporelle (points reliés, dernier mis en évidence), gestion gaz insuffisant.
// Style épuré cohérent avec l'app (fond rosé clair, lignes fines, typo sobre). Voir sources dans lib/dga/duval.ts.
import React from 'react';
import { DUVAL1_ZONES, ZONE_COLOR, ZONE_LABEL, classifyDuval1, baryToCartesian, duvalPercents, type DuvalZone } from '@/lib/dga/duval';

type Pt = { ch4: number; c2h2: number; c2h4: number; date?: string };

export function DuvalTriangle({ ch4, c2h2, c2h4, points, size = 300, lang = 'fr' }: {
  ch4?: number; c2h2?: number; c2h4?: number; points?: Pt[]; size?: number; lang?: 'fr' | 'en';
}) {
  const series: Pt[] = (points && points.length ? points : (ch4 != null ? [{ ch4: ch4 || 0, c2h2: c2h2 || 0, c2h4: c2h4 || 0 }] : []));
  const pad = 30, side = size - 2 * pad;
  const h = (Math.sqrt(3) / 2) * side;
  const W = size, H = h + 2 * pad;
  const top = { x: pad + side / 2, y: pad }, bl = { x: pad, y: pad + h }, br = { x: pad + side, y: pad + h };
  const toXY = (p: Pt) => { const pc = duvalPercents(p.ch4, p.c2h2, p.c2h4); return baryToCartesian(pc.c2h2, pc.c2h4, side, pad); };

  // Dernier point exploitable (pour la classification affichée).
  const lastUsable = [...series].reverse().find(p => (p.ch4 + p.c2h2 + p.c2h4) >= 1) || series[series.length - 1];
  const cls = lastUsable ? classifyDuval1(lastUsable.ch4, lastUsable.c2h2, lastUsable.c2h4) : null;
  const traj = series.filter(p => (p.ch4 + p.c2h2 + p.c2h4) >= 1).map(toXY);

  return (
    <div className="text-gray-500">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full" style={{ maxWidth: size }}>
        {/* Zones */}
        {DUVAL1_ZONES.map(z => {
          const pts = z.poly.map(([a, e]) => { const xy = baryToCartesian(a, e, side, pad); return `${xy.x.toFixed(1)},${xy.y.toFixed(1)}`; }).join(' ');
          return <polygon key={z.code} points={pts} fill={ZONE_COLOR[z.code]} fillOpacity="0.5" stroke="#fff" strokeWidth="0.6" />;
        })}
        {/* Contour + graduations */}
        <polygon points={`${top.x},${top.y} ${bl.x},${bl.y} ${br.x},${br.y}`} fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
        {[20, 40, 60, 80].map((f, i) => {
          const L = (A: any, B: any) => ({ x: A.x + (B.x - A.x) * (f / 100), y: A.y + (B.y - A.y) * (f / 100) });
          const a = L(top, bl), b = L(top, br);
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeOpacity="0.1" />;
        })}
        {/* Étiquettes sommets */}
        <text x={top.x} y={top.y - 8} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">CH₄</text>
        <text x={bl.x - 2} y={bl.y + 14} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">C₂H₂</text>
        <text x={br.x + 2} y={br.y + 14} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">C₂H₄</text>
        {/* Trajectoire */}
        {traj.length > 1 && <polyline points={traj.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none" stroke="#111827" strokeWidth="1.5" strokeDasharray="3 2" />}
        {traj.map((p, i) => {
          const isLast = i === traj.length - 1;
          return <circle key={i} cx={p.x} cy={p.y} r={isLast ? 6 : 3.5} fill={isLast ? '#111827' : '#6b7280'} stroke="#fff" strokeWidth={isLast ? 2 : 1} />;
        })}
        {traj.length > 0 && cls?.zone && <text x={traj[traj.length - 1].x + 9} y={traj[traj.length - 1].y + 4} fontSize="13" fontWeight="800" fill="#111827">{cls.zone}</text>}
      </svg>

      {cls?.insufficient && <p className="mt-1 text-center text-[11px] font-semibold text-gray-400">{lang === 'fr' ? 'Quantité de gaz insuffisante' : 'Insufficient gas'}</p>}

      {/* Légende */}
      <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {DUVAL1_ZONES.map(z => (
          <span key={z.code} className="inline-flex items-center gap-1 text-[10px] text-gray-500">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: ZONE_COLOR[z.code] }} />
            <b className="text-gray-700 dark:text-gray-300">{z.code}</b> {lang === 'fr' ? ZONE_LABEL[z.code].fr : ZONE_LABEL[z.code].en}
          </span>
        ))}
      </div>
    </div>
  );
}

export default DuvalTriangle;
