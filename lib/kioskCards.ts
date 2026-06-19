// Catalogue des CARTES diffusables en mode veille/kiosque + construction des diapositives.
// L'admin coche les cartes à diffuser (Admin › Système › Kiosque) ; le dashboard fournit les valeurs
// RÉELLES (mêmes chiffres que les widgets) et le plein écran les fait défiler une après l'autre.
// Clé stable par carte = persistée dans company_settings.kiosk_cards (jsonb : string[]).

// Une diapo = UNE carte de module. `stats` (jusqu'à 4) = les chiffres affichés ensemble sur la MÊME fiche
// (comme la carte du dashboard). `big`/`title` = repli mono-stat (rétrocompat).
export type KioskStat = { value: string | number; label: string; accent?: string };
export type KioskSlide = { key: string; big: string | number; title: string; sub?: string; accent: string; stats?: KioskStat[] };
export type KioskCardDef = { key: string; fr: string; en: string };

// Ordre = ordre d'affichage par défaut dans la rotation et dans les réglages. UNE carte par module.
export const KIOSK_CARDS: KioskCardDef[] = [
  { key: 'safety', fr: 'Sécurité (4 stats)', en: 'Safety (4 stats)' },
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
  ast?: { total: number; draft?: number; in_progress?: number; completed?: number; approved?: number };
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
  const money = (n: number) => `${Math.round((Number(n) || 0) / (Math.abs(n) >= 1000 ? 1000 : 1))}${Math.abs(n) >= 1000 ? ' k$' : ' $'}`;
  const s = d.safety;
  if (s) {
    out.push({
      key: 'safety', big: s.daysSinceAccident ?? 0, title: tr('SÉCURITÉ', 'SAFETY'), accent: 'text-emerald-400',
      stats: [
        { value: s.daysSinceAccident ?? 0, label: tr('Jours sans accident', 'Days w/o accident'), accent: 'text-emerald-400' },
        { value: s.daysSinceNearMiss ?? 0, label: tr('Jours sans passé proche', 'Days w/o near-miss'), accent: 'text-sky-400' },
        { value: s.accidentsYTD ?? 0, label: tr(`Accidents ${s.year}`, `Accidents ${s.year}`), accent: s.accidentsYTD ? 'text-rose-400' : 'text-emerald-400' },
        { value: s.nearMissYTD ?? 0, label: tr(`Passés proches ${s.year}`, `Near-misses ${s.year}`), accent: s.nearMissYTD ? 'text-amber-400' : 'text-emerald-400' },
      ],
    });
  }
  if (d.proj) out.push({
    key: 'projects', big: d.proj.encours, title: tr('PROJETS', 'PROJECTS'), accent: 'text-indigo-400',
    stats: [
      { value: d.proj.encours, label: tr('En cours', 'Active'), accent: 'text-indigo-400' },
      { value: d.proj.soumission, label: tr('En soumission', 'In quote'), accent: 'text-sky-400' },
      { value: d.proj.facture, label: tr('Facturés', 'Invoiced'), accent: 'text-emerald-400' },
      { value: money(d.proj.amount), label: tr('Valeur contrats', 'Contract value'), accent: 'text-violet-400' },
    ],
  });
  if (d.ast) out.push({
    key: 'ast', big: d.ast.total, title: tr('ANALYSES DE RISQUE (AST)', 'RISK ANALYSES (JSA)'), accent: 'text-cyan-400',
    stats: [
      { value: d.ast.total, label: tr('Total', 'Total'), accent: 'text-cyan-400' },
      { value: (d.ast.in_progress ?? 0) + (d.ast.approved ?? 0), label: tr('Actifs', 'Active'), accent: 'text-sky-400' },
      { value: d.ast.draft ?? 0, label: tr('Brouillons', 'Drafts'), accent: 'text-amber-400' },
      { value: d.ast.completed ?? 0, label: tr('Complétés', 'Completed'), accent: 'text-emerald-400' },
    ],
  });
  if (d.permit) out.push({
    key: 'permits', big: d.permit.active, title: tr('PERMIS DE TRAVAIL', 'WORK PERMITS'), accent: 'text-orange-400',
    stats: [
      { value: d.permit.total, label: tr('Total', 'Total'), accent: 'text-gray-300' },
      { value: d.permit.active, label: tr('Actifs', 'Active'), accent: 'text-orange-400' },
    ],
  });
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
  // Rétrocompat : anciennes clés sécurité (4 cartes séparées) → carte unique « safety ».
  const set = new Set(selected);
  if (['days_no_accident', 'days_no_nearmiss', 'accidents_ytd', 'nearmiss_ytd'].some(k => set.has(k))) set.add('safety');
  return sorted.filter(s => set.has(s.key));
}
