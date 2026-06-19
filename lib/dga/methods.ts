// Méthodes d'interprétation DGA NON-Duval — vues complémentaires (Gaz clés, Doernenburg, Rogers,
// IEC 60599, CO2/CO) + consensus multi-méthodes. Règles en données, classification PURE ; chaque méthode
// renvoie { fault, label, valid, note?, confidence? }.
// ⚠️ Seuils sourcés IEEE C57.104 / IEC 60599 (réf. publiques) — à valider contre la norme officielle.

export type DGAGases = { H2: number; CH4: number; C2H6: number; C2H4: number; C2H2: number; CO?: number; CO2?: number };

export type MethodResult = {
  method: string; fault: string | null; label: string; valid: boolean;
  note?: string; confidence?: 'haute' | 'moyenne' | 'faible';
};

const safeDiv = (a: number, b: number) => (b === 0 ? Infinity : a / b);

// 1) Gaz clés (IEEE C57.104) — gaz dominant = nature du défaut.
export function keyGasMethod(g: DGAGases): MethodResult {
  const combustibles = { H2: g.H2, CH4: g.CH4, C2H6: g.C2H6, C2H4: g.C2H4, C2H2: g.C2H2, CO: g.CO ?? 0 };
  const total = Object.values(combustibles).reduce((s, v) => s + v, 0);
  if (total <= 0) return { method: 'Gaz clés', fault: null, label: 'Aucun gaz', valid: false };
  const dominant = Object.entries(combustibles).sort((a, b) => b[1] - a[1])[0][0];
  const map: Record<string, { fault: string; label: string }> = {
    H2: { fault: 'PD', label: 'Décharges partielles (H₂ dominant)' },
    CH4: { fault: 'T', label: 'Surchauffe huile basse T (CH₄ dominant)' },
    C2H6: { fault: 'T', label: 'Surchauffe huile (C₂H₆ dominant)' },
    C2H4: { fault: 'T3', label: 'Surchauffe haute T (C₂H₄ dominant)' },
    C2H2: { fault: 'D2', label: 'Arc électrique (C₂H₂ dominant)' },
    CO: { fault: 'PAP', label: 'Dégradation cellulose (CO dominant)' },
  };
  const m = map[dominant];
  return { method: 'Gaz clés', fault: m.fault, label: m.label, valid: true, confidence: 'moyenne' };
}

// 2) Doernenburg — 4 ratios + test de validité (garde-fou).
export const DOERNENBURG_L1 = { H2: 100, CH4: 120, CO: 350, C2H2: 35, C2H4: 50, C2H6: 65 };
export function doernenburg(g: DGAGases, L1 = DOERNENBURG_L1): MethodResult {
  const ratios2L1 = [g.H2 > 2 * L1.H2, g.CH4 > 2 * L1.CH4, g.C2H4 > 2 * L1.C2H4, g.C2H2 > 2 * L1.C2H2];
  const ratios1L1 = [g.H2 > L1.H2, g.CH4 > L1.CH4, g.C2H4 > L1.C2H4, g.C2H2 > L1.C2H2, g.C2H6 > L1.C2H6];
  const valid = ratios2L1.some(Boolean) && ratios1L1.filter(Boolean).length >= 2;
  if (!valid) return { method: 'Doernenburg', fault: null, label: 'Non applicable (gaz sous seuils)', valid: false, note: 'Concentrations insuffisantes pour des ratios fiables.' };
  const R1 = safeDiv(g.CH4, g.H2), R2 = safeDiv(g.C2H2, g.C2H4), R3 = safeDiv(g.C2H2, g.CH4), R4 = safeDiv(g.C2H6, g.C2H2);
  if (R1 > 1.0 && R2 < 0.75 && R3 < 0.3 && R4 > 0.4) return { method: 'Doernenburg', fault: 'T', label: 'Décomposition thermique', valid: true, confidence: 'haute' };
  if (R1 < 0.1 && R3 < 0.3 && R4 > 0.4) return { method: 'Doernenburg', fault: 'PD', label: 'Décharges partielles (faible intensité)', valid: true, confidence: 'haute' };
  if (R1 > 0.1 && R1 < 1.0 && R2 > 0.75 && R3 > 0.3 && R4 < 0.4) return { method: 'Doernenburg', fault: 'D2', label: 'Arc à haute énergie', valid: true, confidence: 'haute' };
  return { method: 'Doernenburg', fault: null, label: 'Hors code (combinaison non définie)', valid: true, note: 'Ratios valides mais hors des plages définies.' };
}

// 3) Rogers — 3 ratios.
export function rogers(g: DGAGases): MethodResult {
  const R2 = safeDiv(g.C2H2, g.C2H4), R1 = safeDiv(g.CH4, g.H2), R5 = safeDiv(g.C2H4, g.C2H6);
  if (R2 < 0.1 && R1 >= 0.1 && R1 <= 1 && R5 < 1) return { method: 'Rogers', fault: 'N', label: 'Normal', valid: true, confidence: 'moyenne' };
  if (R2 < 0.1 && R1 < 0.1 && R5 < 1) return { method: 'Rogers', fault: 'PD', label: 'Décharges partielles', valid: true, confidence: 'moyenne' };
  if (R2 >= 0.1 && R2 <= 3 && R1 >= 0.1 && R1 <= 1 && R5 > 3) return { method: 'Rogers', fault: 'D2', label: 'Arc / décharge', valid: true, confidence: 'moyenne' };
  if (R2 < 0.1 && R1 >= 0.1 && R1 <= 1 && R5 >= 1) return { method: 'Rogers', fault: 'T', label: 'Défaut thermique', valid: true, confidence: 'moyenne' };
  return { method: 'Rogers', fault: null, label: 'Hors code', valid: true, note: 'Combinaison hors plages (fréquent avec arc). Voir Duval/Doernenburg.' };
}

// 4) IEC 60599 — mêmes ratios, plages IEC.
export function iec60599(g: DGAGases): MethodResult {
  const R2 = safeDiv(g.C2H2, g.C2H4), R1 = safeDiv(g.CH4, g.H2), R5 = safeDiv(g.C2H4, g.C2H6);
  if (R1 < 0.1 && R5 < 0.2) return { method: 'IEC 60599', fault: 'PD', label: 'Décharges partielles', valid: true, confidence: 'moyenne' };
  if (R2 > 1 && R1 >= 0.1 && R1 <= 0.5 && R5 > 1) return { method: 'IEC 60599', fault: 'D1', label: 'Décharges faible énergie', valid: true, confidence: 'moyenne' };
  if (R2 >= 0.6 && R2 <= 2.5 && R1 >= 0.1 && R1 <= 1 && R5 > 2) return { method: 'IEC 60599', fault: 'D2', label: 'Décharges forte énergie (arc)', valid: true, confidence: 'haute' };
  if (R2 < 0.1 && R1 > 1 && R5 < 1) return { method: 'IEC 60599', fault: 'T1', label: 'Thermique < 300 °C', valid: true, confidence: 'moyenne' };
  if (R2 < 0.1 && R1 > 1 && R5 >= 1 && R5 <= 4) return { method: 'IEC 60599', fault: 'T2', label: 'Thermique 300–700 °C', valid: true, confidence: 'moyenne' };
  if (R2 < 0.2 && R1 > 1 && R5 > 4) return { method: 'IEC 60599', fault: 'T3', label: 'Thermique > 700 °C', valid: true, confidence: 'moyenne' };
  return { method: 'IEC 60599', fault: null, label: 'Hors code', valid: true, note: 'Combinaison hors table IEC.' };
}

// 5) CO2/CO — implication du papier (cellulose).
export function co2coRatio(g: DGAGases): MethodResult {
  if (!g.CO2 || !g.CO) return { method: 'CO₂/CO', fault: null, label: 'CO/CO₂ non mesurés', valid: false };
  const r = g.CO2 / g.CO;
  let label: string;
  if (r < 3) label = `Ratio ${r.toFixed(1)} (<3) : implication thermique du papier à haute T`;
  else if (r <= 11) label = `Ratio ${r.toFixed(1)} (3–11) : cellulose dans la plage normale`;
  else label = `Ratio ${r.toFixed(1)} (>11) : papier en mauvais état (sur-oxydation)`;
  return { method: 'CO₂/CO', fault: r < 3 || r > 11 ? 'PAP' : null, label, valid: true };
}

// Normalisation en FAMILLE de défaut (pour le consensus / verdict).
export function faultFamily(f: string | null): string | null {
  if (!f) return null;
  if (f === 'DT') return 'thermique';
  if (f.startsWith('D')) return 'arc';
  if (f.startsWith('T')) return 'thermique';
  if (f === 'PD') return 'pd';
  if (f === 'PAP') return 'papier';
  if (f === 'N') return 'normal';
  return 'autre';
}

// 6) Consensus multi-méthodes.
export type ConsensusInput = { duvalTriangle1?: string | null; duvalPentagon1?: string | null } & DGAGases;
export function buildConsensus(g: ConsensusInput) {
  const results: MethodResult[] = [keyGasMethod(g), doernenburg(g), rogers(g), iec60599(g), co2coRatio(g)];
  if (g.duvalTriangle1 !== undefined) results.push({ method: 'Duval Triangle 1', fault: g.duvalTriangle1 ?? null, label: g.duvalTriangle1 ?? 'n/a', valid: g.duvalTriangle1 != null });
  if (g.duvalPentagon1 !== undefined) results.push({ method: 'Duval Pentagone 1', fault: g.duvalPentagon1 ?? null, label: g.duvalPentagon1 ?? 'n/a', valid: g.duvalPentagon1 != null });

  const votes: Record<string, number> = {};
  const valid = results.filter(r => r.valid && r.fault);
  valid.forEach(r => { const fam = faultFamily(r.fault)!; votes[fam] = (votes[fam] || 0) + 1; });
  const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const agreement = top ? top[1] / valid.length : 0;
  return {
    results, dominantFamily: top?.[0] ?? null, agreement,
    confidence: agreement >= 0.8 ? 'élevée' : agreement >= 0.5 ? 'moyenne' : 'faible',
    nonConclusive: results.filter(r => r.valid && !r.fault).map(r => r.method),
  };
}
