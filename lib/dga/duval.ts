// ============================================================================
// TRIANGLE DE DUVAL 1 — logique reprise À L'IDENTIQUE du prototype dga-oil-app.jsx
// (duvalPct ~l.310, duvalZone ~l.311, ZONE_COLORS ~l.304, triCoords ~l.618).
// Seule la syntaxe est adaptée (TS, clés de gaz en minuscules) ; AUCUNE frontière modifiée.
// Disposition des sommets identique au prototype : CH4 en haut, C2H4 bas-gauche, C2H2 bas-droite.
// Cas de validation : CH4=7,C2H2=0,C2H4=2 -> %CH4≈77.8,%C2H4≈22.2,%C2H2=0 -> zone T2.
// ============================================================================

export type DuvalZoneCode = 'PD' | 'T1' | 'T2' | 'T3' | 'D1' | 'D2' | 'DT' | '—';

export const ZONE_COLORS: Record<string, string> = {
  PD: '#8ecae6', D1: '#fb8500', D2: '#9d0208', T1: '#ffb703', T2: '#fd9e02', T3: '#bb3e03', DT: '#6a4c93', '—': '#999',
};

export interface DuvalPct { pCH4: number; pC2H4: number; pC2H2: number; }

// duvalPct(d) — coordonnées barycentriques (identique au prototype).
export function duvalPct(d: { ch4?: number; c2h4?: number; c2h2?: number }): DuvalPct | null {
  const CH4 = d.ch4 || 0, C2H4 = d.c2h4 || 0, C2H2 = d.c2h2 || 0;
  const s = CH4 + C2H4 + C2H2;
  if (!s) return null;
  return { pCH4: (CH4 / s) * 100, pC2H4: (C2H4 / s) * 100, pC2H2: (C2H2 / s) * 100 };
}

// duvalZone(p) — détection de zone (frontières identiques au prototype).
export function duvalZone(p: DuvalPct | null, lang: 'fr' | 'en' = 'fr'): { code: DuvalZoneCode; label: string } {
  const EN = lang === 'en';
  if (!p) return { code: '—', label: EN ? 'Insufficient data' : 'Données insuffisantes' };
  const { pCH4, pC2H4, pC2H2 } = p;
  const L: Record<string, string> = {
    PD: EN ? 'Partial discharges' : 'Décharges partielles',
    T1: EN ? 'Thermal fault < 300 °C' : 'Défaut thermique < 300 °C',
    T2: EN ? 'Thermal fault 300–700 °C' : 'Défaut thermique 300–700 °C',
    T3: EN ? 'Thermal fault > 700 °C' : 'Défaut thermique > 700 °C',
    D1: EN ? 'Low-energy discharges' : 'Décharges faible énergie',
    D2: EN ? 'High-energy discharges (arc)' : 'Décharges forte énergie (arc)',
    DT: EN ? 'Mixed thermal + electrical' : 'Mélange thermique + décharges',
  };
  if (pCH4 >= 98) return { code: 'PD', label: L.PD };
  if (pC2H2 <= 4 && pC2H4 <= 20) return { code: 'T1', label: L.T1 };
  if (pC2H2 <= 4 && pC2H4 <= 50) return { code: 'T2', label: L.T2 };
  if (pC2H2 <= 15 && pC2H4 >= 50) return { code: 'T3', label: L.T3 };
  if (pC2H2 >= 13 && pC2H2 <= 29 && pC2H4 <= 50) return { code: 'D1', label: L.D1 };
  if (pC2H2 > 29) return { code: 'D2', label: L.D2 };
  if (pC2H2 >= 13 && pC2H2 <= 29 && pC2H4 > 50) return { code: 'D2', label: L.D2 };
  return { code: 'DT', label: L.DT };
}

// triCoords(p,size,pad) — convention STANDARD Duval 1 (IEC 60599 / IEEE C57.104-2019) :
// A=CH4 (haut), B=C2H2 (bas-GAUCHE), C=C2H4 (bas-DROITE). Avec C2H2 dominant, le point est tiré
// vers le sommet acétylène (bas-gauche). NB : la DÉTECTION de zone (duvalZone) est indépendante du dessin.
export function triCoords(p: DuvalPct, size: number, pad: number) {
  const A = { x: pad + size / 2, y: pad }, B = { x: pad, y: pad + size * 0.866 }, C = { x: pad + size, y: pad + size * 0.866 };
  const a = p.pCH4 / 100, c2h2 = p.pC2H2 / 100, c2h4 = p.pC2H4 / 100;
  return { x: a * A.x + c2h2 * B.x + c2h4 * C.x, y: a * A.y + c2h2 * B.y + c2h4 * C.y };
}
