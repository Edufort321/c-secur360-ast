// Catalogue des CARTES diffusables en mode veille/kiosque + construction des diapositives.
// L'admin coche les cartes à diffuser (Admin › Système › Kiosque) ; le dashboard fournit les valeurs
// RÉELLES (mêmes chiffres que les widgets) et le plein écran les fait défiler une après l'autre.
// Clé stable par carte = persistée dans company_settings.kiosk_cards (jsonb : string[]).

export type KioskSlide = { key: string; big: string | number; title: string; sub?: string; accent: string };
export type KioskCardDef = { key: string; fr: string; en: string };

// Ordre = ordre d'affichage par défaut dans la rotation et dans les réglages.
export const KIOSK_CARDS: KioskCardDef[] = [
  { key: 'days_no_accident', fr: 'Jours sans accident', en: 'Days without accident' },
  { key: 'days_no_nearmiss', fr: 'Jours sans passé proche', en: 'Days without near-miss' },
  { key: 'accidents_ytd', fr: 'Accidents (année courante)', en: 'Accidents (current year)' },
  { key: 'nearmiss_ytd', fr: 'Passés proches (année courante)', en: 'Near-misses (current year)' },
  { key: 'projects', fr: 'Projets en cours', en: 'Active projects' },
  { key: 'ast', fr: 'AST / analyses de risque', en: 'JSA / risk analyses' },
  { key: 'permits', fr: 'Permis actifs', en: 'Active permits' },
  { key: 'planner', fr: 'Occupation (planification)', en: 'Occupancy (planning)' },
  { key: 'inventory', fr: 'Articles en inventaire', en: 'Inventory items' },
  { key: 'dga', fr: 'Transformateurs (DGA)', en: 'Transformers (DGA)' },
  { key: 'inspections', fr: 'Inspections', en: 'Inspections' },
  { key: 'timesheets', fr: 'Feuilles de temps en attente', en: 'Pending timesheets' },
  { key: 'maintenance', fr: 'Maintenance — échéances', en: 'Maintenance — due' },
];

export type KioskStatsInput = {
  lang?: 'fr' | 'en';
  safety?: any; // { daysSinceAccident, daysSinceNearMiss, accidentsYTD, nearMissYTD, year }
  proj?: { soumission: number; encours: number; facture: number; amount: number };
  ast?: { total: number };
  permit?: { total: number; active: number };
  invCount?: number;
  dgaStats?: { all: number; critical?: number; overdue?: number };
  inspStats?: { total: number; nonConf: number };
  tsStats?: { total: number; pending: number };
  maintStats?: { sheets: number; due: number; alerts: number };
  plan?: { occ: number; occCount: number; roster: number };
};

/**
 * Construit TOUTES les diapos disponibles (selon les données réellement présentes), avec leur clé.
 * Le composant kiosque filtre ensuite par les cartes sélectionnées (ou toutes si aucune sélection).
 */
export function buildKioskSlides(d: KioskStatsInput): KioskSlide[] {
  const EN = d.lang === 'en';
  const tr = (fr: string, en: string) => (EN ? en : fr);
  const out: KioskSlide[] = [];
  const s = d.safety;
  if (s) {
    out.push({ key: 'days_no_accident', big: s.daysSinceAccident ?? 0, title: tr('JOURS SANS ACCIDENT', 'DAYS WITHOUT ACCIDENT'), sub: tr('Sécurité d’abord', 'Safety first'), accent: 'text-emerald-400' });
    out.push({ key: 'days_no_nearmiss', big: s.daysSinceNearMiss ?? 0, title: tr('JOURS SANS PASSÉ PROCHE', 'DAYS WITHOUT NEAR-MISS'), accent: 'text-sky-400' });
    out.push({ key: 'accidents_ytd', big: s.accidentsYTD ?? 0, title: tr(`ACCIDENTS EN ${s.year}`, `ACCIDENTS IN ${s.year}`), accent: s.accidentsYTD ? 'text-rose-400' : 'text-emerald-400' });
    out.push({ key: 'nearmiss_ytd', big: s.nearMissYTD ?? 0, title: tr(`PASSÉS PROCHES EN ${s.year}`, `NEAR-MISSES IN ${s.year}`), accent: s.nearMissYTD ? 'text-amber-400' : 'text-emerald-400' });
  }
  if (d.proj) out.push({ key: 'projects', big: d.proj.encours, title: tr('PROJETS EN COURS', 'ACTIVE PROJECTS'), sub: tr(`${d.proj.facture} facturés`, `${d.proj.facture} invoiced`), accent: 'text-indigo-400' });
  if (d.ast) out.push({ key: 'ast', big: d.ast.total, title: tr('ANALYSES DE RISQUE (AST)', 'RISK ANALYSES (JSA)'), accent: 'text-cyan-400' });
  if (d.permit) out.push({ key: 'permits', big: d.permit.active, title: tr('PERMIS ACTIFS', 'ACTIVE PERMITS'), sub: tr(`${d.permit.total} au total`, `${d.permit.total} total`), accent: 'text-orange-400' });
  if (d.plan && (d.plan.roster || d.plan.occCount)) out.push({ key: 'planner', big: `${d.plan.occ}%`, title: tr('TAUX D’OCCUPATION', 'OCCUPANCY RATE'), sub: tr(`${d.plan.occCount}/${d.plan.roster} affectés aujourd’hui`, `${d.plan.occCount}/${d.plan.roster} assigned today`), accent: 'text-violet-400' });
  if (d.invCount != null) out.push({ key: 'inventory', big: d.invCount, title: tr('ARTICLES EN INVENTAIRE', 'INVENTORY ITEMS'), accent: 'text-teal-400' });
  if (d.dgaStats) out.push({ key: 'dga', big: d.dgaStats.all, title: tr('TRANSFORMATEURS SUIVIS', 'MONITORED TRANSFORMERS'), sub: d.dgaStats.critical ? tr(`${d.dgaStats.critical} critiques`, `${d.dgaStats.critical} critical`) : undefined, accent: d.dgaStats.critical ? 'text-rose-400' : 'text-emerald-400' });
  if (d.inspStats) out.push({ key: 'inspections', big: d.inspStats.total, title: tr('INSPECTIONS', 'INSPECTIONS'), sub: d.inspStats.nonConf ? tr(`${d.inspStats.nonConf} non conformités`, `${d.inspStats.nonConf} non-conformities`) : undefined, accent: d.inspStats.nonConf ? 'text-amber-400' : 'text-emerald-400' });
  if (d.tsStats) out.push({ key: 'timesheets', big: d.tsStats.pending, title: tr('FEUILLES EN ATTENTE', 'PENDING TIMESHEETS'), accent: d.tsStats.pending ? 'text-amber-400' : 'text-emerald-400' });
  if (d.maintStats) out.push({ key: 'maintenance', big: d.maintStats.due, title: tr('MAINTENANCES DUES', 'MAINTENANCE DUE'), sub: d.maintStats.alerts ? tr(`${d.maintStats.alerts} alertes`, `${d.maintStats.alerts} alerts`) : undefined, accent: d.maintStats.due ? 'text-amber-400' : 'text-emerald-400' });
  return out;
}

/** Filtre + ordonne les diapos selon les cartes sélectionnées (vide/null = toutes, dans l'ordre du catalogue). */
export function selectKioskSlides(all: KioskSlide[], selected?: string[] | null): KioskSlide[] {
  const order = KIOSK_CARDS.map(c => c.key);
  const sorted = [...all].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  if (!selected || !selected.length) return sorted;
  const set = new Set(selected);
  return sorted.filter(s => set.has(s.key));
}
