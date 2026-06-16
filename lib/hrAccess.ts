// Contrôle d'accès SERVEUR aux données RH/sensibles (salaires, dossiers RH).
// Miroir de la matrice de niveaux de l'admin. Principe ZÉRO FUITE : on se base sur le
// tenant de la SESSION (jamais celui fourni par le client) et on vérifie le rôle.
import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Niveaux ayant accès aux renseignements sensibles (salaires, dossiers RH).
const HR_LEVELS = new Set(['admin_paie', 'rh', 'direction', 'super_user']);
// Niveaux ayant accès à la gestion des ACCÈS (mots de passe d'accès, niveaux). administration+.
const AUTH_LEVELS = new Set(['administration', 'rh', 'direction', 'super_user']);

export type Access = { userId: string; email: string; tenant: string; level: string };

/**
 * Résout l'accès de la personne connectée. Retourne null si non authentifiée.
 * Le tenant retourné est TOUJOURS celui de la session (anti-usurpation de tenant).
 */
export async function resolveAccess(req: NextRequest): Promise<Access | null> {
  const u = await getSessionUser(req); // { id, email, role, tenant_id }
  if (!u?.id) return null;
  const tenant = u.tenant_id || '';
  let level = 'consultation';
  if (u.role === 'super_admin') level = 'super_user';
  else {
    try {
      const { data: p } = await supabaseAdmin.from('planner_personnel')
        .select('niveauAcces').eq('tenant_id', tenant).ilike('email', u.email || '').maybeSingle();
      if (p?.niveauAcces) level = String(p.niveauAcces);
      else if (u.role === 'client_admin') level = 'direction';
    } catch { /* défaut consultation */ }
  }
  return { userId: u.id, email: u.email || '', tenant, level };
}

/**
 * Tenant EFFECTIF d'une opération. Un super_admin (`super_user`) a un accès cross-tenant légitime :
 * il peut cibler le tenant de la PAGE admin qu'il visite (param `reqTenant`). Tout autre rôle est
 * FORCÉ à son propre tenant de session (un admin de tenant ne peut JAMAIS toucher un autre tenant).
 * Param absent -> tenant de session. ANTI-CONTAMINATION inter-tenant.
 */
export function effectiveTenant(acc: { level: string; tenant: string }, reqTenant?: string | null): string {
  const t = (reqTenant || '').trim();
  if (acc.level === 'super_user' && t) return t;
  return acc.tenant;
}

// Niveaux ayant accès aux données ACTIONNARIALES / dividendes (très sensible : direction+).
const SHAREHOLDER_LEVELS = new Set(['direction', 'super_user']);

/** Accès aux dossiers RH / salaires (admin_paie, rh, direction, super_user). */
export function canHr(level: string): boolean { return HR_LEVELS.has(level); }
/** Accès actionnaires / cap table / dividendes (direction, super_user uniquement). */
export function canShareholders(level: string): boolean { return SHAREHOLDER_LEVELS.has(level); }
/** Accès à la gestion des accès/mots de passe (administration, rh, direction, super_user). */
export function canAuth(level: string): boolean { return AUTH_LEVELS.has(level); }
