// DGA Partie B (B6) — COMPARAISON À LA FLOTTE : situe chaque gaz d'un transformateur par rapport à la
// distribution des AUTRES transformateurs du parc (dernière mesure de chacun). Calculs PURS, testables.
// Indicatif (aide à repérer un transfo « hors norme » du parc) — ne remplace PAS le verdict de sévérité.

export type FleetGas = 'H2' | 'CH4' | 'C2H6' | 'C2H4' | 'C2H2' | 'CO' | 'CO2';
export const FLEET_GASES: FleetGas[] = ['H2', 'CH4', 'C2H6', 'C2H4', 'C2H2', 'CO', 'CO2'];

export type FleetSample = { gases: Partial<Record<FleetGas, number>> };
export type FleetStat = {
  gas: FleetGas; value: number; count: number;   // count = nb de transfos comparés (flotte, hors courant)
  median: number; max: number; percentile: number; // percentile = % de la flotte SOUS la valeur courante (0..100)
  position: 'bas' | 'médian' | 'élevé' | 'extrême'; // bande qualitative
};

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b); const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Percentile de `value` dans `pop` : % des éléments STRICTEMENT inférieurs (0..100). */
export function percentileRank(value: number, pop: number[]): number {
  if (!pop.length) return 0;
  const below = pop.filter(x => x < value).length;
  return Math.round((below / pop.length) * 100);
}

/** Comparaison gaz par gaz du transformateur courant vs la flotte (déjà SANS le courant). */
export function buildFleetComparison(current: Partial<Record<FleetGas, number>>, fleet: FleetSample[]): FleetStat[] {
  const out: FleetStat[] = [];
  for (const gas of FLEET_GASES) {
    const value = num(current[gas]);
    const pop = fleet.map(s => num(s.gases[gas])).filter(v => v >= 0);
    if (!pop.length) continue;
    const pct = percentileRank(value, pop);
    const position: FleetStat['position'] = pct >= 95 ? 'extrême' : pct >= 75 ? 'élevé' : pct >= 25 ? 'médian' : 'bas';
    out.push({ gas, value: r2(value), count: pop.length, median: r2(median(pop)), max: r2(Math.max(...pop)), percentile: pct, position });
  }
  return out;
}
