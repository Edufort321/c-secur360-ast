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
  { key: 'events', fr: 'Accidents & presque-accidents', en: 'Accidents & near-miss' },
  { key: 'projects', fr: 'Projets en cours', en: 'Active projects' },
  { key: 'ast', fr: 'AST / analyses de risque', en: 'JSA / risk analyses' },
  { key: 'permits', fr: 'Permis actifs', en: 'Active permits' },
  { key: 'planner', fr: 'Occupation (planification)', en: 'Occupancy (planning)' },
  { key: 'inventory', fr: 'Articles en inventaire', en: 'Inventory items' },
  { key: 'dga', fr: 'Transformateurs (DGA)', en: 'Transformers (DGA)' },
  { key: 'inspections', fr: 'Inspections', en: 'Inspections' },
  { key: 'timesheets', fr: 'Feuilles de temps en attente', en: 'Pending timesheets' },
  { key: 'maintenance', fr: 'Maintenance — échéances', en: 'Maintenance — due' },
  { key: 'logbook', fr: 'Logbook véhicules', en: 'Vehicle logbook' },
  { key: 'todo', fr: 'To-Do', en: 'To-Do' },
  { key: 'rapports', fr: 'Rapports terrain', en: 'Field reports' },
];

export type KioskStatsInput = {
  lang?: 'fr' | 'en';
  safety?: any; // { daysSinceAccident, daysSinceNearMiss, accidentsYTD, nearMissYTD, year }
  proj?: { soumission: number; encours: number; facture: number; amount: number };
  ast?: { total: number; draft?: number; in_progress?: number; completed?: number; approved?: number };
  permit?: { total: number; active: number; confined?: number; work?: number };
  invCount?: number;
  invStats?: { low: number; value: number };
  dgaStats?: { all: number; critical?: number; overdue?: number };
  inspStats?: { total: number; nonConf: number };
  tsStats?: { total: number; pending: number; approved?: number; paid?: number };
  maintStats?: { sheets: number; due: number; alerts: number };
  plan?: { occ: number; occCount: number; roster: number };
  evt?: { total: number; quasi: number; accident: number; year: number };
  logbookStats?: { vehicles: number; kmWeek: number; kmYear: number };
  todoStats?: { total: number; todo: number; in_progress: number; done: number };
  rapStats?: { total: number; in_progress: number; review: number; approved: number; sent: number };
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
      { value: d.permit.active, label: tr('Actifs', 'Active'), accent: 'text-orange-400' },
      { value: d.permit.work ?? 0, label: tr('Travail', 'Work'), accent: 'text-amber-400' },
      { value: d.permit.confined ?? 0, label: tr('Espace clos', 'Confined'), accent: 'text-sky-400' },
      { value: d.permit.total, label: tr('Total', 'Total'), accent: 'text-gray-300' },
    ],
  });
  if (d.plan && (d.plan.roster || d.plan.occCount)) out.push({ key: 'planner', big: `${d.plan.occ}%`, title: tr('TAUX D’OCCUPATION', 'OCCUPANCY RATE'), sub: tr(`${d.plan.occCount}/${d.plan.roster} affectés aujourd’hui`, `${d.plan.occCount}/${d.plan.roster} assigned today`), accent: 'text-violet-400' });
  if (d.invCount != null) out.push({
    key: 'inventory', big: d.invCount, title: tr('INVENTAIRE', 'INVENTORY'), accent: 'text-teal-400',
    stats: [
      { value: d.invCount, label: tr('Articles', 'Items'), accent: 'text-teal-400' },
      { value: d.invStats?.low ?? 0, label: tr('Stock bas', 'Low stock'), accent: (d.invStats?.low ?? 0) ? 'text-amber-400' : 'text-emerald-400' },
      { value: money(d.invStats?.value ?? 0), label: tr('Valeur', 'Value'), accent: 'text-violet-400' },
    ],
  });
  if (d.dgaStats) out.push({
    key: 'dga', big: d.dgaStats.all, title: tr('TRANSFORMATEURS (DGA)', 'TRANSFORMERS (DGA)'), accent: d.dgaStats.critical ? 'text-rose-400' : 'text-emerald-400',
    stats: [
      { value: d.dgaStats.all, label: tr('Suivis', 'Monitored'), accent: 'text-teal-400' },
      { value: d.dgaStats.critical ?? 0, label: tr('Critiques', 'Critical'), accent: (d.dgaStats.critical ?? 0) ? 'text-rose-400' : 'text-emerald-400' },
      { value: d.dgaStats.overdue ?? 0, label: tr('En retard', 'Overdue'), accent: (d.dgaStats.overdue ?? 0) ? 'text-amber-400' : 'text-emerald-400' },
    ],
  });
  if (d.inspStats) out.push({
    key: 'inspections', big: d.inspStats.total, title: tr('INSPECTIONS', 'INSPECTIONS'), accent: d.inspStats.nonConf ? 'text-amber-400' : 'text-emerald-400',
    stats: [
      { value: d.inspStats.total, label: tr('Total', 'Total'), accent: 'text-sky-400' },
      { value: d.inspStats.nonConf, label: tr('Non conformités', 'Non-conformities'), accent: d.inspStats.nonConf ? 'text-rose-400' : 'text-emerald-400' },
      { value: Math.max(0, d.inspStats.total - d.inspStats.nonConf), label: tr('Conformes', 'Conform'), accent: 'text-emerald-400' },
    ],
  });
  if (d.tsStats) out.push({
    key: 'timesheets', big: d.tsStats.pending, title: tr('FEUILLES DE TEMPS', 'TIMESHEETS'), accent: d.tsStats.pending ? 'text-amber-400' : 'text-emerald-400',
    stats: [
      { value: d.tsStats.pending, label: tr('À approuver', 'To approve'), accent: d.tsStats.pending ? 'text-amber-400' : 'text-emerald-400' },
      { value: d.tsStats.approved ?? 0, label: tr('Approuvées', 'Approved'), accent: 'text-sky-400' },
      { value: d.tsStats.paid ?? 0, label: tr('Payées', 'Paid'), accent: 'text-emerald-400' },
      { value: d.tsStats.total, label: tr('Total', 'Total'), accent: 'text-gray-300' },
    ],
  });
  if (d.maintStats) out.push({
    key: 'maintenance', big: d.maintStats.due, title: tr('MAINTENANCE', 'MAINTENANCE'), accent: d.maintStats.due ? 'text-amber-400' : 'text-emerald-400',
    stats: [
      { value: d.maintStats.sheets, label: tr('Équipements', 'Equipment'), accent: 'text-sky-400' },
      { value: d.maintStats.due, label: tr('Échéances dues', 'Due'), accent: d.maintStats.due ? 'text-amber-400' : 'text-emerald-400' },
      { value: d.maintStats.alerts, label: tr('Alertes', 'Alerts'), accent: d.maintStats.alerts ? 'text-rose-400' : 'text-emerald-400' },
    ],
  });
  if (d.evt) out.push({
    key: 'events', big: d.evt.total, title: tr('ACCIDENTS & PRESQUE-ACC.', 'ACCIDENTS & NEAR-MISS'), accent: d.evt.accident ? 'text-rose-400' : 'text-emerald-400',
    stats: [
      { value: d.evt.accident, label: tr('Accidents', 'Accidents'), accent: d.evt.accident ? 'text-rose-400' : 'text-emerald-400' },
      { value: d.evt.quasi, label: tr('Presque-acc.', 'Near-miss'), accent: d.evt.quasi ? 'text-amber-400' : 'text-emerald-400' },
      { value: d.evt.year, label: tr('Cette année', 'This year'), accent: 'text-sky-400' },
      { value: d.evt.total, label: tr('Total', 'Total'), accent: 'text-gray-300' },
    ],
  });
  if (d.logbookStats) out.push({
    key: 'logbook', big: Math.round(d.logbookStats.kmWeek).toLocaleString('fr-CA'), title: tr('LOGBOOK VÉHICULES', 'VEHICLE LOGBOOK'), accent: 'text-cyan-400',
    stats: [
      { value: d.logbookStats.vehicles, label: tr('Véhicules actifs', 'Active vehicles'), accent: 'text-cyan-400' },
      { value: `${Math.round(d.logbookStats.kmWeek).toLocaleString('fr-CA')} km`, label: tr('Cette semaine', 'This week'), accent: 'text-sky-400' },
      { value: `${Math.round(d.logbookStats.kmYear).toLocaleString('fr-CA')} km`, label: tr('Cette année', 'This year'), accent: 'text-violet-400' },
    ],
  });
  if (d.todoStats) out.push({
    key: 'todo', big: d.todoStats.total, title: 'TO-DO', accent: 'text-indigo-400',
    stats: [
      { value: d.todoStats.todo, label: tr('À faire', 'To do'), accent: 'text-amber-400' },
      { value: d.todoStats.in_progress, label: tr('En cours', 'In progress'), accent: 'text-sky-400' },
      { value: d.todoStats.done, label: tr('Terminé', 'Done'), accent: 'text-emerald-400' },
      { value: d.todoStats.total, label: tr('Total', 'Total'), accent: 'text-gray-300' },
    ],
  });
  if (d.rapStats) out.push({
    key: 'rapports', big: d.rapStats.total, title: tr('RAPPORTS TERRAIN', 'FIELD REPORTS'), accent: 'text-teal-400',
    stats: [
      { value: d.rapStats.in_progress, label: tr('En cours', 'In progress'), accent: 'text-amber-400' },
      { value: d.rapStats.review, label: tr('Révision', 'Review'), accent: 'text-sky-400' },
      { value: d.rapStats.approved, label: tr('Approuvés', 'Approved'), accent: 'text-emerald-400' },
      { value: d.rapStats.sent, label: tr('Envoyés', 'Sent'), accent: 'text-violet-400' },
    ],
  });
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
