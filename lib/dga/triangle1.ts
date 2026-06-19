// Triangle de Duval 1 — logique PURE (géométrie + classification par RÈGLES officielles), réutilisée par
// le composant de rendu (peinture par grille) ET par les autres méthodes (consensus / auto-sélection).
// Frontières : IEEE C57.104-2019 / IEC 60599, huile minérale. Convention : CH4 (haut), C2H2 (bas-gauche),
// C2H4 (bas-droit). Pas de polygones tracés à la main → aucun débordement/trou.

// Géométrie
export const TOP = { x: 200, y: 24 };    // CH4
export const LEFT = { x: 24, y: 320 };   // C2H2
export const RIGHT = { x: 376, y: 320 }; // C2H4

export type Gases = { CH4: number; C2H4: number; C2H2: number };
export type Pct = { ch4: number; c2h2: number; c2h4: number };
export type Fault = 'PD' | 'T1' | 'T2' | 'T3' | 'D1' | 'D2' | 'DT';

// CLASSIFICATION OFFICIELLE (seule source de vérité des zones). Ordre : du plus spécifique au résiduel.
//   PD : %CH4 ≥ 98
//   T1 : %C2H2 < 4, %C2H4 < 20
//   T2 : %C2H2 < 4, 20 ≤ %C2H4 < 50
//   T3 : %C2H2 < 15, %C2H4 ≥ 50
//   D1 : %C2H2 ≥ 13, %C2H4 < 23
//   D2 : (13 ≤ %C2H2 < 29 et 23 ≤ %C2H4 < 40) ou (%C2H2 ≥ 29 et %C2H4 < 50)
//   DT : résiduel (mélange thermique/électrique)
export function classifyPct({ ch4, c2h2, c2h4 }: Pct): Fault {
  if (ch4 >= 98) return 'PD';
  if (c2h2 < 4 && c2h4 < 20) return 'T1';
  if (c2h2 < 4 && c2h4 >= 20 && c2h4 < 50) return 'T2';
  if (c2h2 < 15 && c2h4 >= 50) return 'T3';
  if (c2h2 >= 13 && c2h4 < 23) return 'D1';
  if ((c2h2 >= 13 && c2h2 < 29 && c2h4 >= 23 && c2h4 < 40) || (c2h2 >= 29 && c2h4 < 50)) return 'D2';
  return 'DT';
}

export const FAULT_STYLE: Record<Fault, { fill: string; text: string; label: string }> = {
  PD: { fill: '#B5D4F4', text: '#0C447C', label: 'Décharges partielles' },
  T1: { fill: '#FAC775', text: '#633806', label: 'Thermique < 300 °C' },
  T2: { fill: '#EF9F27', text: '#633806', label: 'Thermique 300–700 °C' },
  T3: { fill: '#D85A30', text: '#4A1B0C', label: 'Thermique > 700 °C' },
  D1: { fill: '#AFA9EC', text: '#26215C', label: 'Décharges faible énergie' },
  D2: { fill: '#F09595', text: '#501313', label: 'Décharges forte énergie (arc)' },
  DT: { fill: '#5DCAA5', text: '#04342C', label: 'Mélange thermique/électrique' },
};

export function toPct({ CH4, C2H4, C2H2 }: Gases): Pct | null {
  const t = CH4 + C2H4 + C2H2;
  if (t <= 0) return null;
  return { ch4: (CH4 / t) * 100, c2h2: (C2H2 / t) * 100, c2h4: (C2H4 / t) * 100 };
}
export function pctToXY({ ch4, c2h2, c2h4 }: Pct) {
  const a = ch4 / 100, b = c2h2 / 100, c = c2h4 / 100;
  return { x: a * TOP.x + b * LEFT.x + c * RIGHT.x, y: a * TOP.y + b * LEFT.y + c * RIGHT.y };
}

// Classification depuis ppm (pour le moteur d'auto-sélection / consensus).
export function classifyTriangle1(g: Gases): { fault: Fault; label: string } | null {
  const p = toPct(g); if (!p) return null;
  const f = classifyPct(p);
  return { fault: f, label: FAULT_STYLE[f].label };
}

// Fluides alternatifs : seules 3 frontières changent (huile minérale = valeurs par défaut ci-dessus).
//   D1/D2 (%C2H2) : minéral 23 · silicone 9 · Midel 26 · FR3 25 · BIOTEMP 20
//   T1/T2 (%C2H4) : minéral 20 · silicone 16 · Midel 39 · FR3 43 · BIOTEMP 52
//   T2/T3 (%C2H4) : minéral 50 · silicone 46 · Midel 68 · FR3 63 · BIOTEMP 82
