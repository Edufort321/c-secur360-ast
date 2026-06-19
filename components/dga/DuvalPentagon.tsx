'use client';
// Pentagone de Duval — sommets PUBLICS + point du CENTROÏDE (exact). Les ZONES de défaut ne sont PAS
// colorisées : leurs frontières exactes ne sont pas reproduites au pixel dans les sources gratuites
// (Duval 2014 / Energies 2020) → classification « préliminaire — à valider ». On trace ce qui est SÛR.
import { PENTAGON_VERTICES, PENTAGON_ORDER, pentagonPoint, type PentaGasKey, type PentaGases } from '@/lib/dga/pentagon';

type Lang = 'fr' | 'en';
const S = 2.375;          // 40 unités → 95 px
const CX = 130, CY = 130; // centre SVG
const px = (x: number) => CX + x * S;
const py = (y: number) => CY - y * S; // y inversé (SVG)
const GAS_LABEL: Record<PentaGasKey, string> = { H2: 'H₂', C2H6: 'C₂H₆', CH4: 'CH₄', C2H4: 'C₂H₄', C2H2: 'C₂H₂' };

export function DuvalPentagon({ samples, lang = 'fr' }: { samples: { id?: number | string; date?: string; gases: PentaGases }[]; lang?: Lang }) {
  const tr = (fr: string, en: string) => (lang === 'en' ? en : fr);
  const outline = PENTAGON_ORDER.map(k => `${px(PENTAGON_VERTICES[k][0])},${py(PENTAGON_VERTICES[k][1])}`).join(' ');
  const pts = samples.map(s => ({ s, p: pentagonPoint(s.gases) })).filter(x => x.p) as { s: typeof samples[0]; p: { x: number; y: number; hemisphere: string } }[];
  const path = pts.map((x, i) => `${i === 0 ? 'M' : 'L'} ${px(x.p.x).toFixed(1)} ${py(x.p.y).toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];

  return (
    <div>
      <svg viewBox="0 0 260 270" className="w-full max-w-[340px]">
        {/* contour du pentagone */}
        <polygon points={outline} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.2} />
        {/* axes du centre vers chaque sommet + libellés des gaz */}
        {PENTAGON_ORDER.map(k => {
          const [vx, vy] = PENTAGON_VERTICES[k];
          const lx = px(vx * 1.13), ly = py(vy * 1.13);
          return (
            <g key={k}>
              <line x1={CX} y1={CY} x2={px(vx)} y2={py(vy)} stroke="#cbd5e1" strokeWidth={0.6} strokeDasharray="2 2" />
              <text x={lx} y={ly} fontSize={10} fontWeight={700} fill="#334155" textAnchor="middle" dominantBaseline="middle">{GAS_LABEL[k]}</text>
            </g>
          );
        })}
        {/* trajectoire des échantillons */}
        {pts.length > 1 && <path d={path} fill="none" stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 2" />}
        {pts.map((x, i) => (
          <circle key={i} cx={px(x.p.x)} cy={py(x.p.y)} r={i === pts.length - 1 ? 4.5 : 2.5}
            fill={i === pts.length - 1 ? '#ef4444' : '#93c5fd'} stroke="#fff" strokeWidth={1.2} />
        ))}
        {/* centre */}
        <circle cx={CX} cy={CY} r={1} fill="#94a3b8" />
        {/* note zones */}
        <text x={130} y={258} fontSize={8} fill="#b45309" textAnchor="middle">{tr('Zones de défaut : à activer après validation des frontières.', 'Fault zones: pending boundary validation.')}</text>
      </svg>
      {last && (
        <p className="mt-1 text-[11px] text-gray-500">
          {tr('Point (centroïde)', 'Point (centroid)')} : x={last.p.x}, y={last.p.y} · {tr('hémisphère', 'hemisphere')} {last.p.hemisphere === 'nord' ? tr('nord (électrique)', 'north (electrical)') : tr('sud (thermique)', 'south (thermal)')}.
          <span className="text-amber-600"> {tr('Classification de zone préliminaire (Duval 2014 / Energies 2020).', 'Preliminary zone classification (Duval 2014 / Energies 2020).')}</span>
        </p>
      )}
    </div>
  );
}
