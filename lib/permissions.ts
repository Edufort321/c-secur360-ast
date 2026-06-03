// Matrice de permissions configurable par tenant (#57).
// Chaque CAPACITE a un niveau minimal requis (tier 1..8 du Guide des niveaux d'accès).
// Défauts calés sur la matrice PERMS historique ; surcharges en base (table tenant_permissions, migration 110).
import { supabase } from '@/lib/supabase';

export type Capability =
  | 'viewEmployees' | 'modifyEmployees' | 'viewSalary' | 'editSalary'
  | 'evaluate' | 'coordinate' | 'viewAuth' | 'managePostes' | 'manageAll';

export const CAPABILITIES: { key: Capability; fr: string; en: string }[] = [
  { key: 'viewEmployees',  fr: 'Voir les employés',            en: 'View employees' },
  { key: 'modifyEmployees', fr: 'Modifier les employés',        en: 'Edit employees' },
  { key: 'coordinate',     fr: 'Coordonner le planning',       en: 'Coordinate planning' },
  { key: 'managePostes',   fr: 'Gérer les postes/grilles',     en: 'Manage positions/grids' },
  { key: 'viewAuth',       fr: 'Gérer les accès/comptes',      en: 'Manage access/accounts' },
  { key: 'viewSalary',     fr: 'Voir les salaires',            en: 'View salaries' },
  { key: 'editSalary',     fr: 'Modifier les salaires',        en: 'Edit salaries' },
  { key: 'evaluate',       fr: 'Mener les évaluations',        en: 'Run evaluations' },
  { key: 'manageAll',      fr: 'Administration complète',      en: 'Full administration' },
];

// Tier minimal par défaut (plus bas niveau qui possédait la capacité dans la matrice historique).
export const DEFAULT_MIN_TIER: Record<Capability, number> = {
  viewEmployees: 3, modifyEmployees: 3, coordinate: 3, managePostes: 3,
  viewAuth: 4, viewSalary: 5, editSalary: 5, evaluate: 5, manageAll: 7,
};

export type PermMap = Record<Capability, number>; // capability -> min_tier effectif

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
