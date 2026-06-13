// Moteur de NORMES « espace clos » — par province, avec base de référence intégrée + possibilité de
// rafraîchissement automatique par IA (table cs_norm_cache, voir /api/permits/espace-clos/ai action
// 'refresh-norms'). Sert à : seuils atmosphériques, ordre de test, surveillance, validité de permis,
// références réglementaires citables. Source de vérité métier réutilisée par l'UI ET le serveur.

export type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'YT' | 'NU' | 'FED';

// Un gaz/paramètre atmosphérique : plage acceptable. Hors plage -> DANGER.
export interface GasLimit { key: string; label: string; unit: string; min?: number; max?: number; }

export interface ProvinceNorm {
  province: ProvinceCode;
  label: string;
  authority: string;                 // ex. CNESST
  regulations: string[];             // références citables
  limits: GasLimit[];                // seuils atmosphériques
  testOrder: string[];               // ordre de test imposé (O2 -> inflammables -> toxiques)
  samplingPoints: string[];          // ex. haut/milieu/bas
  defaultRetestMinutes: number;      // intervalle de reprise par défaut
  attendantPerEntrants: number;      // 1 surveillant par N entrants (max)
  continuousMonitoring: boolean;     // surveillance continue recommandée/exigée
  notes?: string;
  updatedAt?: string;                // si rafraîchi par IA
  source?: 'baseline' | 'ai';
}

// Seuils communs (CSA Z1006 / pratique nord-américaine). O2 19,5–23,0 % ; LEL < 10 % ; H2S, CO selon VEMP.
const BASE_LIMITS: GasLimit[] = [
  { key: 'o2', label: 'Oxygène (O₂)', unit: '%', min: 19.5, max: 23.0 },
  { key: 'lel', label: 'Gaz inflammables (LIE)', unit: '% LIE', max: 10 },
  { key: 'h2s', label: 'Sulfure d’hydrogène (H₂S)', unit: 'ppm', max: 10 },
  { key: 'co', label: 'Monoxyde de carbone (CO)', unit: 'ppm', max: 35 },
];

// Ordre de test imposé par CSA Z1006 : 1) Oxygène, 2) Gaz/vapeurs inflammables, 3) Gaz toxiques.
const TEST_ORDER = ['o2', 'lel', 'toxiques (H₂S, CO, etc.)'];
const SAMPLING = ['Haut (entrée)', 'Milieu', 'Bas (au plus près du fond)'];

export const PROVINCE_NORMS: Record<ProvinceCode, ProvinceNorm> = {
  QC: {
    province: 'QC', label: 'Québec', authority: 'CNESST',
    regulations: ['RSST, section XXVI — Espaces clos (art. 296.1 et suiv., modif. 2023)', 'CSA Z1006 — Travail en espace clos', 'LSST'],
    limits: BASE_LIMITS, testOrder: TEST_ORDER, samplingPoints: SAMPLING,
    defaultRetestMinutes: 15, attendantPerEntrants: 2, continuousMonitoring: true,
    notes: 'Définition 2023 basée sur les risques (asphyxie, intoxication, perte de conscience/jugement, incendie/explosion). Personne qualifiée requise ; aménagement permettant l’intervention de l’extérieur (art. 297.1).',
    source: 'baseline',
  },
  ON: {
    province: 'ON', label: 'Ontario', authority: "Ministry of Labour (OHSA)",
    regulations: ['O. Reg. 632/05 — Confined Spaces', 'OHSA'],
    limits: [{ ...BASE_LIMITS[0], max: 23.0 }, BASE_LIMITS[1], BASE_LIMITS[2], BASE_LIMITS[3]],
    testOrder: TEST_ORDER, samplingPoints: SAMPLING,
    defaultRetestMinutes: 15, attendantPerEntrants: 2, continuousMonitoring: true,
    notes: 'Plan écrit, évaluation des dangers, permis d’entrée, surveillant formé, plan de sauvetage. Entrée = dès qu’une partie du corps franchit le plan d’ouverture.',
    source: 'baseline',
  },
  FED: {
    province: 'FED', label: 'Fédéral (SST Canada)', authority: 'Programme du travail (Code canadien du travail)',
    regulations: ['RCSST partie XI — Espaces clos', 'CSA Z1006'],
    limits: BASE_LIMITS, testOrder: TEST_ORDER, samplingPoints: SAMPLING,
    defaultRetestMinutes: 15, attendantPerEntrants: 2, continuousMonitoring: true, source: 'baseline',
  },
  // Provinces alignées sur la base CSA Z1006 (réfs à préciser par rafraîchissement IA).
  BC: prov('BC', 'Colombie-Britannique', 'WorkSafeBC', ['OHS Regulation Part 9 — Confined Spaces', 'CSA Z1006']),
  AB: prov('AB', 'Alberta', 'OHS Alberta', ['OHS Code Part 5 — Confined Spaces', 'CSA Z1006']),
  SK: prov('SK', 'Saskatchewan', 'WorkSafe Saskatchewan', ['OHS Regulations — Confined Space', 'CSA Z1006']),
  MB: prov('MB', 'Manitoba', 'SAFE Work Manitoba', ['MR 217/2006 Part 15 — Confined Spaces', 'CSA Z1006']),
  NB: prov('NB', 'Nouveau-Brunswick', 'WorkSafeNB', ['Reg. 91-191 — Confined Space', 'CSA Z1006']),
  NS: prov('NS', 'Nouvelle-Écosse', 'NS Labour', ['Workplace Health and Safety Regulations', 'CSA Z1006']),
  PE: prov('PE', 'Île-du-Prince-Édouard', 'WCB PEI', ['OHS Regulations — Confined Space', 'CSA Z1006']),
  NL: prov('NL', 'Terre-Neuve-et-Labrador', 'WorkplaceNL', ['OHS Regulations — Confined Space', 'CSA Z1006']),
  NT: prov('NT', 'Territoires du Nord-Ouest', 'WSCC', ['OHS Regulations — Confined Space', 'CSA Z1006']),
  YT: prov('YT', 'Yukon', 'YWCHSB', ['OHS Regulations — Confined Space', 'CSA Z1006']),
  NU: prov('NU', 'Nunavut', 'WSCC', ['OHS Regulations — Confined Space', 'CSA Z1006']),
};

function prov(province: ProvinceCode, label: string, authority: string, regulations: string[]): ProvinceNorm {
  return { province, label, authority, regulations, limits: BASE_LIMITS, testOrder: TEST_ORDER, samplingPoints: SAMPLING, defaultRetestMinutes: 15, attendantPerEntrants: 2, continuousMonitoring: true, source: 'baseline' };
}

export function getNorm(province?: string | null): ProvinceNorm {
  const p = (province || 'QC').toUpperCase() as ProvinceCode;
  return PROVINCE_NORMS[p] || PROVINCE_NORMS.QC;
}

export interface AtmReading { o2?: number | null; lel?: number | null; h2s?: number | null; co?: number | null; [k: string]: number | null | undefined; }
export interface AtmFailure { key: string; label: string; value: number; limit: string; }
export interface AtmEval { status: 'safe' | 'danger' | 'incomplete'; failures: AtmFailure[]; ok: boolean; }

// Évalue un relevé contre les seuils (norme province + surcharges custom du permis). Hors plage -> DANGER.
export function evaluateAtmosphere(reading: AtmReading, norm: ProvinceNorm, customLimits?: GasLimit[]): AtmEval {
  const limits = customLimits?.length ? customLimits : norm.limits;
  const failures: AtmFailure[] = [];
  let measured = 0;
  for (const lim of limits) {
    const v = reading[lim.key];
    if (v == null || v === undefined || isNaN(Number(v))) continue;
    measured++;
    const n = Number(v);
    if (lim.min != null && n < lim.min) failures.push({ key: lim.key, label: lim.label, value: n, limit: `min ${lim.min} ${lim.unit}` });
    else if (lim.max != null && n > lim.max) failures.push({ key: lim.key, label: lim.label, value: n, limit: `max ${lim.max} ${lim.unit}` });
  }
  if (measured === 0) return { status: 'incomplete', failures: [], ok: false };
  const ok = failures.length === 0;
  return { status: ok ? 'safe' : 'danger', failures, ok };
}

// Niveau de risque global d'un espace (pour le tableau de bord), combinant type d'atmosphère + dangers.
export type RiskLevel = 'faible' | 'moyen' | 'élevé' | 'critique';
export function riskFromFlags(opts: { atmDanger?: boolean; hazardCount?: number; engulfment?: boolean; toxic?: boolean }): RiskLevel {
  if (opts.atmDanger || opts.engulfment) return 'critique';
  const h = opts.hazardCount || 0;
  if (opts.toxic || h >= 5) return 'élevé';
  if (h >= 2) return 'moyen';
  return 'faible';
}
