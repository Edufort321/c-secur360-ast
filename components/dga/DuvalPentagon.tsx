'use client';
// Pentagone de Duval COMBINÉ (10 zones) — sommets publics + centroïde (exact, réutilisé de lib/dga/pentagon)
// + zones de défaut colorées (PD/S/D1/D2/T1-O/T1-C/T2-O/T2-C/T3-C/T3-H) et diagnostic géométrique réel
// (classifyDuval : point-dans-polygone). ⚠️ Tant que BOUNDARIES_VALIDATED=false : bandeau « frontières à
// valider » et le diagnostic n'est pas exportable. Conserve la trajectoire multi-échantillons existante.
import {
  PENTAGON_VERTICES, PENTAGON_ORDER, pentagonPoint, ZONE_POLYGONS, classifyDuval, BOUNDARIES_VALIDATED,
  PENTAGON_BOUNDARY_VERSION, type PentaGasKey, type PentaGases, type ZoneCode,
} from '@/lib/dga/pentagon';

type Lang = 'fr' | 'en';
const S = 2.375;          // 40 unités → 95 px
const CX = 130, CY = 130; // centre SVG
const px = (x: number) => CX + x * S;
const py = (y: number) => CY - y * S; // y inversé (SVG)
const GAS_LABEL: Record<PentaGasKey, string> = { H2: 'H₂', C2H6: 'C₂H₆', CH4: 'CH₄', C2H4: 'C₂H₄', C2H2: 'C₂H₂' };

// Couleurs par famille de défaut (électrique / parasite / thermique).
const ZONE_COLORS: Record<ZoneCode, string> = {
  PD: '#c7d2fe', S: '#bbf7d0', D1: '#a5b4fc', D2: '#818cf8',
  'T1-O': '#fef9c3', 'T1-C': '#fde68a', 'T2-O': '#fdba74', 'T2-C': '#fb923c', 'T3-C': '#f87171', 'T3-H': '#ef4444',
};

export function DuvalPentagon({ samples, lang = 'fr', showZones = true }: { samples: { id?: number | string; date?: string; gases: PentaGases }[]; lang?: Lang; showZones?: boolean }) {
  const tr = (fr: string, en: string) => (lang === 'en' ? en : fr);
  const outline = PENTAGON_ORDER.map(k => `${px(PENTAGON_VERTICES[k][0])},${py(PENTAGON_VERTICES[k][1])}`).join(' ');
  const pts = samples.map(s => ({ s, p: pentagonPoint(s.gases) })).filter(x => x.p) as { s: typeof samples[0]; p: { x: number; y: number; hemisphere: string } }[];
  const path = pts.map((x, i) => `${i === 0 ? 'M' : 'L'} ${px(x.p.x).toFixed(1)} ${py(x.p.y).toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  const dx = last ? classifyDuval(last.s.gases) : null;
  const zonePath = (poly: { x: number; y: number }[]) => poly.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p.x).toFixed(1)} ${py(p.y).toFixed(1)}`).join(' ') + ' Z';

  return (
    <div>
      <svg viewBox="0 0 260 285" className="w-full max-w-[340px]">
        {/* zones de défaut colorées (zone active surlignée) */}
        {showZones && ZONE_POLYGONS.map(z => {
          const active = dx?.zone === z.code;
          return <path key={z.code} d={zonePath(z.polygon)} fill={ZONE_COLORS[z.code]} fillOpacity={active ? 0.95 : 0.45} stroke={active ? '#0f172a' : '#cbd5e1'} strokeWidth={active ? 1.1 : 0.4} />;
        })}
        {/* contour du pentagone */}
        <polygon points={outline} fill="none" stroke="#475569" strokeWidth={1.2} />
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
            fill={i === pts.length - 1 ? '#dc2626' : '#93c5fd'} stroke="#fff" strokeWidth={1.2} />
        ))}
        <circle cx={CX} cy={CY} r={1} fill="#94a3b8" />
        {!BOUNDARIES_VALIDATED && <text x={130} y={272} fontSize={7.5} fill="#b45309" textAnchor="middle">{tr('Frontières à valider (Cheim & Duval 2020) — diagnostic indicatif.', 'Boundaries pending validation (Cheim & Duval 2020) — indicative.')}</text>}
      </svg>

      {last && dx && (
        <div className="mt-1 space-y-0.5 text-[11px]">
          {!dx.guard.ok && <p className="rounded bg-amber-50 px-2 py-1 text-amber-800">{dx.guard.reason}</p>}
          <p className="text-gray-500">{tr('Centroïde', 'Centroid')} : x={dx.centroid.x}, y={dx.centroid.y}
            {dx.zone && <> · <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">{dx.zone}</span></>}
          </p>
          {dx.zone && <p className="text-gray-800 dark:text-gray-200">{tr('Diagnostic', 'Diagnosis')} : <strong>{lang === 'en' ? dx.labelEn : dx.labelFr}</strong>
            {dx.onBoundary && <span className="ml-1 text-amber-600">{tr('(proche d’une frontière — prudence)', '(near a boundary — caution)')}</span>}</p>}
          <p className="text-gray-400">{tr('Indicatif — frontières à valider par une personne qualifiée.', 'Indicative — boundaries to be validated by a qualified person.')} <span className="text-gray-300">v{PENTAGON_BOUNDARY_VERSION}</span></p>
        </div>
      )}
    </div>
  );
}
