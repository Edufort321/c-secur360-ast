// ============================================================================
// CATALOGUE D'ANALYSES + INTERVALLES DE REPRISE — repris À L'IDENTIQUE du prototype
// dga-oil-app.jsx (ANALYSIS_CATALOG ~l.201, RECHECK_MONTHS ~l.458, INTERVAL_OPTIONS ~l.460,
// addMonths/addDays/addInterval ~l.469, autoNextDate ~l.487, dueStatus ~l.492).
// Adaptation : `lang` en paramètre ; valeurs et logique inchangées.
// ============================================================================

export interface AnalysisItem { key: string; group: 'std' | 'special'; label: string; en: string; }

export const ANALYSIS_CATALOG: AnalysisItem[] = [
  { key: 'a_physical', group: 'std', label: 'Propriétés physiques', en: 'Physical properties' },
  { key: 'a_water', group: 'std', label: 'Teneur en eau', en: 'Water content' },
  { key: 'a_physwater', group: 'std', label: 'Propriétés physiques et teneur en eau', en: 'Physical properties and water content' },
  { key: 'a_pf25', group: 'std', label: 'Facteur de puissance 25 °C', en: 'Power factor 25 °C' },
  { key: 'a_pf100', group: 'std', label: 'Facteur de puissance 100 °C', en: 'Power factor 100 °C' },
  { key: 'a_dga', group: 'std', label: 'Concentrations des gaz dissous (DGA)', en: 'Dissolved gas concentrations (DGA)' },
  { key: 'a_pcb', group: 'std', label: 'Concentration de BPC', en: 'PCB concentration' },
  { key: 'a_antiox', group: 'std', label: 'Concentration en antioxydant', en: 'Antioxidant concentration' },
  { key: 'a_furan', group: 'std', label: 'Composés de furane', en: 'Furan compounds' },
  { key: 'a_metals', group: 'special', label: 'Métaux dissous', en: 'Dissolved metals' },
  { key: 'a_flash', group: 'special', label: "Point d'éclair", en: 'Flash point' },
  { key: 'a_silicone', group: 'special', label: "Concentration de silicone dans l'huile", en: 'Silicone concentration in oil' },
  { key: 'a_corrCu', group: 'special', label: 'Soufre corrosif – Cuivre', en: 'Corrosive sulphur – Copper' },
  { key: 'a_corrAg', group: 'special', label: 'Soufre corrosif – Argent', en: 'Corrosive sulphur – Silver' },
  { key: 'a_particles', group: 'special', label: 'Décompte de particules', en: 'Particle count' },
];
export const ANALYSIS_GROUPS = [
  { id: 'std', label: 'Analyses', en: 'Analyses' },
  { id: 'special', label: 'Analyses spéciales', en: 'Special analyses' },
];
export const al = (a: { label: string; en?: string }, lang: 'fr' | 'en' = 'fr') => (lang === 'en' && a.en ? a.en : a.label);

// Intervalles de reprise. auto: index = condition IEEE (0..3).
export const RECHECK_MONTHS = [12, 6, 3, 1];
export interface IntervalOption { id: string; months?: number; days?: number; label: string; en: string; }
export const INTERVAL_OPTIONS: IntervalOption[] = [
  { id: '1y', months: 12, label: '1 an', en: '1 year' },
  { id: '6m', months: 6, label: '6 mois', en: '6 months' },
  { id: '3m', months: 3, label: '3 mois', en: '3 months' },
  { id: '1m', months: 1, label: '1 mois', en: '1 month' },
  { id: '1w', days: 7, label: '1 semaine', en: '1 week' },
  { id: '1d', days: 1, label: '1 jour', en: '1 day' },
  { id: 'custom', label: 'Personnalisé', en: 'Custom' },
];

export function addMonths(dateStr: string, months: number): string | null {
  const d = new Date(dateStr + 'T00:00:00'); if (isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth() + months); return d.toISOString().slice(0, 10);
}
export function addDays(dateStr: string, days: number): string | null {
  const d = new Date(dateStr + 'T00:00:00'); if (isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10);
}
export function addInterval(dateStr: string, opt?: IntervalOption): string | null {
  if (!opt) return null;
  if (opt.months != null) return addMonths(dateStr, opt.months);
  if (opt.days != null) return addDays(dateStr, opt.days);
  return null;
}
export function autoNextDate(lastMeasureDate?: string | null, worst = 0): string | null {
  if (!lastMeasureDate) return null;
  return addMonths(lastMeasureDate, RECHECK_MONTHS[worst] ?? 12);
}
export type DueCode = 'overdue' | 'soon' | 'ok' | 'none';
export function dueStatusByDate(nextDate?: string | null): { code: DueCode; days: number | null } {
  if (!nextDate) return { code: 'none', days: null };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const nd = new Date(nextDate + 'T00:00:00');
  const days = Math.round((nd.getTime() - today.getTime()) / 86400000);
  if (days < 0) return { code: 'overdue', days };
  if (days <= 30) return { code: 'soon', days };
  return { code: 'ok', days };
}
