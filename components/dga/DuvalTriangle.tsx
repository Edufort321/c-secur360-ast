'use client';

// Triangle de Duval 1 (SVG) — visuel avec le point tracé depuis %CH4 / %C2H2 / %C2H4.
// Sommets : CH4 (haut), C2H2 (bas-gauche), C2H4 (bas-droite).
import React from 'react';

export function DuvalTriangle({ ch4, c2h2, c2h4, zone, size = 240 }: { ch4: number; c2h2: number; c2h4: number; zone?: string; size?: number }) {
  const tot = ch4 + c2h2 + c2h4;
  const m = tot > 0 ? (100 * ch4) / tot : 0;
  const a = tot > 0 ? (100 * c2h2) / tot : 0;
  const e = tot > 0 ? (100 * c2h4) / tot : 0;

  const pad = 26;
  const W = size, H = size * 0.92;
  // Sommets en coordonnées écran
  const top = { x: W / 2, y: pad };                 // CH4
  const bl = { x: pad, y: H - pad };                // C2H2
  const br = { x: W - pad, y: H - pad };            // C2H4
  // Barycentrique -> cartésien
  const px = (m / 100) * top.x + (a / 100) * bl.x + (e / 100) * br.x;
  const py = (m / 100) * top.y + (a / 100) * bl.y + (e / 100) * br.y;
  const hasPoint = tot > 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-[260px]">
      <polygon points={`${top.x},${top.y} ${bl.x},${bl.y} ${br.x},${br.y}`} fill="rgba(244,63,94,0.06)" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
      {/* graduations légères */}
      {[0.25, 0.5, 0.75].map((f, i) => (
        <line key={i} x1={top.x + (bl.x - top.x) * f} y1={top.y + (bl.y - top.y) * f} x2={top.x + (br.x - top.x) * f} y2={top.y + (br.y - top.y) * f} stroke="currentColor" strokeOpacity="0.12" />
      ))}
      <text x={top.x} y={top.y - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">CH₄</text>
      <text x={bl.x - 4} y={bl.y + 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">C₂H₂</text>
      <text x={br.x + 2} y={br.y + 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">C₂H₄</text>
      {hasPoint && (
        <g>
          <circle cx={px} cy={py} r="6" fill="#e11d48" stroke="#fff" strokeWidth="2" />
          {zone && <text x={px + 9} y={py + 4} fontSize="12" fontWeight="800" fill="#e11d48">{zone}</text>}
        </g>
      )}
    </svg>
  );
}

export default DuvalTriangle;
