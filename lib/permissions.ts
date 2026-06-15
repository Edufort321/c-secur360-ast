// Matrice de permissions configurable par tenant (#57).
// Chaque CAPACITE a un niveau minimal requis (tier 1..8 du Guide des niveaux d'accès).
// Défauts calés sur la matrice PERMS historique ; surcharges en base (table tenant_permissions, migration 110).
import { supabase } from '@/lib/supabase';

// Capacités RH historiques + capacités d'ACCÈS AUX MODULES (`mod:<clé>`). Le type reste ouvert (string)
// car les capacités module sont dérivées du registre des modules.
export type Capability = string;

// Correspondance niveau (texte stocké dans planner_personnel.niveauAcces) -> tier 1..8.
export const LEVEL_TIER: Record<string, number> = {
  consultation: 1, modification: 2, coordination: 3, administration: 4,
  admin_paie: 5, rh: 6, direction: 7, super_user: 8,
  // alias rôles
  super_admin: 8, client_admin: 7,
};
export const tierFromLevel = (level?: string | null): number => LEVEL_TIER[String(level || 'consultation')] || 1;

// ── Capacités RH (historique) ─────────────────────────────────────────────────────────────────
const HR_CAPABILITIES: { key: Capability; fr: string; en: string; group: 'rh' }[] = [
  { key: 'viewEmployees',  fr: 'Voir les employés',        en: 'View employees', group: 'rh' },
  { key: 'modifyEmployees', fr: 'Modifier les employés',    en: 'Edit employees', group: 'rh' },
  { key: 'coordinate',     fr: 'Coordonner le planning',   en: 'Coordinate planning', group: 'rh' },
  { key: 'managePostes',   fr: 'Gérer les postes/grilles', en: 'Manage positions/grids', group: 'rh' },
  { key: 'viewAuth',       fr: 'Gérer les accès/comptes',  en: 'Manage access/accounts', group: 'rh' },
  { key: 'viewSalary',     fr: 'Voir les salaires',        en: 'View salaries', group: 'rh' },
  { key: 'editSalary',     fr: 'Modifier les salaires',    en: 'Edit salaries', group: 'rh' },
  { key: 'evaluate',       fr: 'Mener les évaluations',    en: 'Run evaluations', group: 'rh' },
  { key: 'manageAll',      fr: 'Administration complète',  en: 'Full administration', group: 'rh' },
];

// ── Capacités d'ACCÈS AUX MODULES (#57b) : par module, un seuil VOIR et un seuil ÉDITER ──────────
// Modèle : tier de l'utilisateur < VOIR -> BLOQUÉ ; VOIR ≤ tier < ÉDITER -> LECTURE SEULE ;
// tier ≥ ÉDITER -> ÉDITION. Le tier 0 = « Externe (QR/public) » : mettre ÉDITER (ou VOIR) à 0 autorise
// les personnes NON connectées (ex. scan QR d'un AST/permis). Défauts PERMISSIFS (voir=1, édit=2) pour
// ne bloquer personne au déploiement ; modules sensibles (admin, marketing) démarrent plus haut.
// `sub` liste les sous-modules gérés séparément (hérite des seuils du parent par défaut).
export const MODULE_ACCESS: { modKey: string; emoji: string; fr: string; en: string; viewTier: number; editTier: number; externalCapable?: boolean; sub?: { key: string; fr: string; en: string }[] }[] = [
  { modKey: 'projects',   emoji: '📁', fr: 'Projets',           en: 'Projects',       viewTier: 1, editTier: 2 },
  { modKey: 'planner',    emoji: '🗓️', fr: 'Planificateur',     en: 'Planner',        viewTier: 1, editTier: 3 },
  { modKey: 'ast',        emoji: '📋', fr: 'AST / analyses',    en: 'JSA / analyses', viewTier: 0, editTier: 1, externalCapable: true },
  { modKey: 'permits',    emoji: '🔖', fr: 'Permis',            en: 'Permits',        viewTier: 0, editTier: 1, externalCapable: true,
    sub: [{ key: 'espace-clos', fr: 'Espace clos', en: 'Confined space' }, { key: 'travail-chaud', fr: 'Travail à chaud', en: 'Hot work' }] },
  { modKey: 'accidents',  emoji: '🚨', fr: 'Accidents / quasi', en: 'Accidents',     viewTier: 2, editTier: 2 },
  { modKey: 'inventory',  emoji: '📦', fr: 'Inventaire',        en: 'Inventory',      viewTier: 1, editTier: 2 },
  { modKey: 'inspections', emoji: '✅', fr: 'Inspections',      en: 'Inspections',    viewTier: 0, editTier: 1, externalCapable: true },
  { modKey: 'timesheets', emoji: '⏱️', fr: 'Feuilles de temps', en: 'Timesheets',    viewTier: 1, editTier: 1 },
  { modKey: 'logbook',    emoji: '🚚', fr: 'Carnet de bord',    en: 'Logbook',        viewTier: 1, editTier: 1 },
  { modKey: 'todo',       emoji: '🗒️', fr: 'To-do',             en: 'To-do',          viewTier: 1, editTier: 1 },
  { modKey: 'dga',        emoji: '🧪', fr: 'DGA',               en: 'DGA',            viewTier: 1, editTier: 2 },
  { modKey: 'conges',     emoji: '🌴', fr: 'Congés',            en: 'Leave',          viewTier: 1, editTier: 1 },
  { modKey: 'rapports',   emoji: '📝', fr: 'Rapports terrain',  en: 'Field reports',  viewTier: 1, editTier: 1 },
  { modKey: 'marketing',  emoji: '📣', fr: 'Marketing',         en: 'Marketing',      viewTier: 4, editTier: 4 },
  { modKey: 'admin',      emoji: '⚙️', fr: 'Administration',    en: 'Administration', viewTier: 4, editTier: 4,
    sub: [{ key: 'comptabilite', fr: 'Comptabilité', en: 'Accounting' }, { key: 'fiscal', fr: 'Fiscal', en: 'Tax' }, { key: 'rh', fr: 'RH / dossiers', en: 'HR' }] },
];

// Construit les clés de capacité view/edit pour un module (et sous-module optionnel).
export const viewCap = (modKey: string, sub?: string) => `mod:${modKey}${sub ? ':' + sub : ''}:view`;
export const editCap = (modKey: string, sub?: string) => `mod:${modKey}${sub ? ':' + sub : ''}:edit`;

// Lignes de la matrice modules (parent + sous-modules), pour l'UI.
export const MODULE_ROWS = MODULE_ACCESS.flatMap(m => [
  { modKey: m.modKey, sub: undefined as string | undefined, emoji: m.emoji, fr: m.fr, en: m.en, viewTier: m.viewTier, editTier: m.editTier, externalCapable: !!m.externalCapable, isSub: false },
  ...(m.sub || []).map(s => ({ modKey: m.modKey, sub: s.key, emoji: '↳', fr: s.fr, en: s.en, viewTier: m.viewTier, editTier: m.editTier, externalCapable: !!m.externalCapable, isSub: true })),
]);

export const CAPABILITIES: { key: Capability; fr: string; en: string; group: 'rh' }[] = HR_CAPABILITIES;

// Tier minimal par défaut (RH = matrice historique ; modules = seuils view/edit ci-dessus).
export const DEFAULT_MIN_TIER: Record<string, number> = {
  viewEmployees: 3, modifyEmployees: 3, coordinate: 3, managePostes: 3,
  viewAuth: 4, viewSalary: 5, editSalary: 5, evaluate: 5, manageAll: 7,
  ...Object.fromEntries(MODULE_ROWS.flatMap(r => [
    [viewCap(r.modKey, r.sub), r.viewTier],
    [editCap(r.modKey, r.sub), r.editTier],
  ])),
};

/** L'utilisateur de ce niveau peut-il VOIR ce module/sous-module (≥ seuil Voir) ? */
export function canViewModule(perms: PermMap, modKey: string, level?: string | null, sub?: string): boolean {
  const cap = viewCap(modKey, sub);
  const min = perms[cap] ?? DEFAULT_MIN_TIER[cap] ?? 1;
  return tierFromLevel(level) >= min;
}
/** L'utilisateur de ce niveau peut-il ÉDITER ce module/sous-module (≥ seuil Éditer) ? */
export function canEditModule(perms: PermMap, modKey: string, level?: string | null, sub?: string): boolean {
  const cap = editCap(modKey, sub);
  const min = perms[cap] ?? DEFAULT_MIN_TIER[cap] ?? 2;
  return tierFromLevel(level) >= min;
}

export type PermMap = Record<string, number>; // capability -> min_tier effectif

/** Charge la matrice effective d'un tenant : défauts + surcharges en base. */
export async function getTenantPermissions(tenant: string): Promise<PermMap> {
  const map: PermMap = { ...DEFAULT_MIN_TIER };
  try {
    const { data } = await supabase.from('tenant_permissions').select('capability, min_tier').eq('tenant_id', tenant);
    for (const r of (data || []) as any[]) {
      if (r.capability in map) map[r.capability as Capability] = Number(r.min_tier) || map[r.capability as Capability];
    }
  } catch { /* table absente -> défauts */ }
  return map;
}

/** Enregistre le tier minimal d'une capacité (upsert). */
export async function saveTenantPermission(tenant: string, capability: Capability, minTier: number): Promise<void> {
  await supabase.from('tenant_permissions').upsert(
    { tenant_id: tenant, capability, min_tier: minTier, updated_at: new Date().toISOString() },
    { onConflict: 'tenant_id,capability' }
  );
}

/** L'utilisateur (tier) a-t-il la capacité selon la matrice fournie ? */
export function can(perms: PermMap, capability: Capability, userTier: number): boolean {
  const min = perms[capability] ?? DEFAULT_MIN_TIER[capability] ?? 99;
  return userTier >= min;
}
