// ============================================================================
// DGA — Sévérité IEEE C57.104-2019 (édition MODERNE, percentiles + type de transfo).
// Corrige les bugs d'interprétation : choix des seuils SELON le type scellé/respirant (ratio O₂/N₂),
// taux de génération (ppm/jour), interprétation CO₂/CO, et garde anti-verdict « stabilisé ».
//
// ⚠️ Les valeurs de percentiles (90e) ci-dessous proviennent de sources publiques IEEE C57.104-2019 et
//    DOIVENT être validées contre la norme officielle par une personne qualifiée (Eric / IPS) avant
//    usage en production. Ce module est une aide à l'ingénierie, pas un avis certifié.
// ============================================================================

export type TransfoType = 'sealed' | 'free-breathing';
export const STANDARD_EDITION = 'IEEE C57.104-2019';

// Ratio O₂/N₂ : un transfo SCELLÉ a peu d'oxygène (ratio bas) ; un RESPIRANT s'équilibre avec l'air.
export function o2n2Ratio(o2?: number | null, n2?: number | null): number | null {
  const O = Number(o2), N = Number(n2);
  if (!isFinite(O) || !isFinite(N) || N <= 0) return null;
  return O / N;
}
// Seuil de bascule 0,2 (IEEE C57.104-2019, indicatif) : ≤ 0,2 = scellé, sinon respirant.
export function transformerType(o2?: number | null, n2?: number | null): TransfoType {
  const r = o2n2Ratio(o2, n2);
  return r != null && r <= 0.2 ? 'sealed' : 'free-breathing';
}

// 90e percentile (ppm) par gaz et par type [sealed, free-breathing] — IEEE C57.104-2019 (À VALIDER).
// L'acétylène (C₂H₂) reste à 1 ppm dans les deux cas (présence anormale en exploitation saine).
export const PCT90_2019: Record<string, [number, number]> = {
  h2:   [80, 40],
  ch4:  [90, 60],
  c2h6: [90, 30],
  c2h4: [50, 60],
  c2h2: [1, 1],
  co:   [900, 500],
  co2:  [9000, 5000],
};

export function threshold90(gas: keyof typeof PCT90_2019 | string, type: TransfoType): number | null {
  const row = PCT90_2019[gas as string];
  if (!row) return null;
  return type === 'sealed' ? row[0] : row[1];
}

// Multiple du 90e percentile : 947 ppm sur un seuil scellé de 1 ppm = 947× (sévérité réelle massive).
export function overThreshold(value: number, gas: string, type: TransfoType): number | null {
  const t = threshold90(gas, type);
  if (t == null || t <= 0) return null;
  return (Number(value) || 0) / t;
}

// Taux de génération (ppm/jour) d'un gaz entre deux échantillons — central en 2019 (défaut actif vs historique).
export function generationRatePerDay(prevVal: number, prevDateIso: string, curVal: number, curDateIso: string): number | null {
  const d1 = new Date(prevDateIso).getTime(), d2 = new Date(curDateIso).getTime();
  if (!isFinite(d1) || !isFinite(d2) || d2 <= d1) return null;
  const days = (d2 - d1) / 86400000;
  if (days <= 0) return null;
  return ((Number(curVal) || 0) - (Number(prevVal) || 0)) / days;
}

// Interprétation CO₂/CO (IEC 60599) — implication du papier (cellulose).
export function co2coRatio(co2?: number | null, co?: number | null): number | null {
  const C2 = Number(co2), C = Number(co);
  if (!isFinite(C2) || !isFinite(C) || C <= 0) return null;
  return C2 / C;
}
export function co2coInterpretation(ratio: number | null, lang: 'fr' | 'en' = 'fr'): string | null {
  if (ratio == null) return null;
  const EN = lang === 'en';
  if (ratio > 11) return EN ? 'paper degradation (poor condition)' : 'papier en dégradation (mauvais état)';
  if (ratio >= 4) return EN ? 'healthy cellulose (normal range)' : 'cellulose saine (plage normale)';
  if (ratio < 3) return EN ? 'thermal involvement of paper at high temperature (hot spot)' : 'implication thermique du papier à haute température (point chaud)';
  return EN ? 'intermediate zone — correlate with the electrical fault' : 'zone intermédiaire — à corréler avec le défaut électrique';
}

// ── Garde anti-« stabilisé » : interdit le verdict de stabilisation s'il n'y a pas ≥ 2 points APRÈS
//    le dernier SAUT (delta > seuil). Avec 2 mesures et un saut récent, on NE PEUT PAS conclure stabilisé.
export type SampleLite = { date: string; value: number };
export function pointsAfterLastJump(samples: SampleLite[], jumpThreshold: number): number {
  const s = [...samples].filter(x => x && x.date).sort((a, b) => a.date.localeCompare(b.date));
  if (s.length < 2) return 0;
  let lastJumpIdx = -1;
  for (let i = 1; i < s.length; i++) {
    if (Math.abs((Number(s[i].value) || 0) - (Number(s[i - 1].value) || 0)) > jumpThreshold) lastJumpIdx = i;
  }
  if (lastJumpIdx < 0) return s.length; // pas de saut → toute la série sert de tendance
  return s.length - 1 - lastJumpIdx;     // nombre de points APRÈS l'échantillon du saut
}
// Peut-on conclure « stabilisé » ? Il faut ≥ 2 points après le dernier saut.
export function canConcludeStabilized(samples: SampleLite[], jumpThreshold: number): boolean {
  return pointsAfterLastJump(samples, jumpThreshold) >= 2;
}
