import { createClient } from '@supabase/supabase-js';
import { 
  UserRole, 
  UserPermissionOverride, 
  Permission, 
  ScopeType,
  PermissionCheckResult,
  UserPermissionSummary,
  CreateEmployeeRequest,
  AuditAccessGrant
} from '@/types/rbac';
import { User } from '@/types/auth';
import { generateSecureToken } from './auth-utils';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ===================================================================
// VÉRIFICATION DES PERMISSIONS
// ===================================================================

/**
 * Vérifier si un utilisateur a une permission spécifique
 */
export async function hasPermission(
  userId: string,
  permissionKey: string,
  scopeType: ScopeType = 'global',
  scopeId?: string
): Promise<PermissionCheckResult> {
  try {
    // Utiliser la fonction SQL optimisée
    const { data, error } = await supabase
      .rpc('user_has_permission', {
        p_user_id: userId,
        p_permission_key: permissionKey,
        p_scope_type: scopeType,
        p_scope_id: scopeId
      });

    if (error) {
      console.error('Permission check error:', error);
      return {
        allowed: false,
        reason: 'Erreur lors de la vérification des permissions'
      };
    }

    if (data) {
      return {
        allowed: true,
        reason: 'Permission accordée',
        granted_via: 'role' // Simplifié pour l'instant
      };
    }

    return {
      allowed: false,
      reason: 'Permission refusée'
    };
  } catch (error) {
    console.error('Permission check error:', error);
    return {
      allowed: false,
      reason: 'Erreur système'
    };
  }
}

/**
 * Vérifier plusieurs permissions en une fois
 */
export async function hasPermissions(
  userId: string,
  permissions: { key: string; scope_type?: ScopeType; scope_id?: string }[]
): Promise<Record<string, PermissionCheckResult>> {
  const results: Record<string, PermissionCheckResult> = {};
  
  // Vérifier chaque permission
  for (const perm of permissions) {
    const key = `${perm.key}:${perm.scope_type || 'global'}:${perm.scope_id || 'null'}`;
    results[key] = await hasPermission(
      userId, 
      perm.key, 
      perm.scope_type, 
      perm.scope_id
    );
  }
  
  return results;
}

/**
 * Obtenir le résumé complet des permissions d'un utilisateur
 */
export async function getUserPermissionSummary(userId: string): Promise<UserPermissionSummary | null> {
  try {
    // Récupérer les rôles avec leurs permissions
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        *,
        roles (
          id, key, name, description, color,
          role_permissions (
            permission_id, scope_default,
            permissions (id, key, module, action, name, description, is_dangerous)
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.now()');

    if (rolesError) throw rolesError;

    // Récupérer les surcharges
    const { data: overrides, error: overridesError } = await supabase
      .from('user_permission_overrides')
      .select(`
        *,
        permissions (id, key, module, action, name, description, is_dangerous)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.now()');

    if (overridesError) throw overridesError;

    // Récupérer les paramètres de sécurité
    const { data: securitySettings, error: securityError } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Calculer les permissions effectives
    const effectivePermissions = calculateEffectivePermissions(
      userRoles as any[],
      overrides as any[]
    );

    return {
      user_id: userId,
      roles: userRoles as UserRole[],
      overrides: overrides as UserPermissionOverride[],
      effective_permissions: effectivePermissions,
      security_settings: securitySettings || undefined
    };

  } catch (error) {
    console.error('Error getting user permission summary:', error);
    return null;
  }
}

/**
 * Calculer les permissions effectives à partir des rôles et overrides
 */
function calculateEffectivePermissions(
  userRoles: any[],
  overrides: any[]
): { permission_key: string; granted_via: 'role' | 'override'; scope_type: ScopeType; scope_id?: string; expires_at?: string }[] {
  const permissions: Map<string, any> = new Map();

  // Ajouter les permissions des rôles
  for (const userRole of userRoles) {
    if (!userRole.roles?.role_permissions) continue;
    
    for (const rolePerm of userRole.roles.role_permissions) {
      const key = `${rolePerm.permissions.key}:${userRole.scope_type}:${userRole.scope_id || 'null'}`;
      if (!permissions.has(key)) {
        permissions.set(key, {
          permission_key: rolePerm.permissions.key,
          granted_via: 'role',
          scope_type: userRole.scope_type,
          scope_id: userRole.scope_id,
          expires_at: userRole.expires_at
        });
      }
    }
  }

  // Appliquer les overrides
  for (const override of overrides) {
    const key = `${override.permissions.key}:${override.scope_type}:${override.scope_id || 'null'}`;
    
    if (override.decision === 'allow') {
      permissions.set(key, {
        permission_key: override.permissions.key,
        granted_via: 'override',
        scope_type: override.scope_type,
        scope_id: override.scope_id,
        expires_at: override.expires_at
      });
    } else if (override.decision === 'deny') {
      permissions.delete(key);
    }
  }

  return Array.from(permissions.values());
}

// ===================================================================
// GESTION DES EMPLOYÉS
// ===================================================================

/**
 * Créer un nouvel employé avec rôles et permissions
 */
export async function createEmployee(
  request: CreateEmployeeRequest,
  actorId: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Générer token d'invitation si nécessaire
    const invitationToken = request.send_invitation ? generateSecureToken(32) : undefined;

    // Créer l'utilisateur de base
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: request.email.toLowerCase(),
        password_hash: '', // Sera défini lors de l'activation
        role: 'user', // Rôle de base, les vrais rôles sont dans user_roles
        tenant_id: request.scope_type === 'client' ? request.scope_id : null,
        first_login: true,
        mfa_required: request.mfa_required,
        qr_enrolled: false,
        mobile_only: request.mobile_only,
        can_export: request.can_export,
        invitation_token: invitationToken,
        is_active: false, // Activé après validation invitation
        profile: {
          first_name: request.first_name,
          last_name: request.last_name,
          phone: request.phone,
          company: request.company
        }
      })
      .select()
      .single();

    if (userError) throw userError;

    // Assigner le rôle principal
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role_id: request.role_id,
        scope_type: request.scope_type,
        scope_id: request.scope_id,
        assigned_by: actorId,
        notes: request.notes
      });

    if (roleError) throw roleError;

    // Assigner les permissions personnalisées
    if (request.custom_permissions?.length) {
      const overrides = request.custom_permissions.map(perm => ({
        user_id: user.id,
        permission_id: perm.permission_id,
        decision: perm.decision,
        scope_type: perm.scope_type,
        scope_id: perm.scope_id,
        assigned_by: actorId,
        reason: 'Personnalisation lors de la création'
      }));

      const { error: overridesError } = await supabase
        .from('user_permission_overrides')
        .insert(overrides);

      if (overridesError) throw overridesError;
    }

    // Créer les paramètres de sécurité
    if (request.security_settings) {
      const { error: securityError } = await supabase
        .from('user_security_settings')
        .insert({
          user_id: user.id,
          ...request.security_settings
        });

      if (securityError) throw securityError;
    }

    // Créer l'invitation si demandée
    if (request.send_invitation && invitationToken) {
      const { error: invitationError } = await supabase
        .from('user_invitations')
        .insert({
          email: request.email.toLowerCase(),
          phone: request.phone,
          token: invitationToken,
          intended_role_id: request.role_id,
          intended_scope_type: request.scope_type,
          intended_scope_id: request.scope_id,
          status: 'pending',
          sent_via: request.send_via,
          invited_by: actorId,
          message: request.custom_message
        });

      if (invitationError) throw invitationError;

      // TODO: Envoyer l'invitation par email/SMS via Twilio
    }

    // Audit log
    await logAccessChange(actorId, user.id, 'create_employee', 'activation', {
      role_id: request.role_id,
      scope_type: request.scope_type,
      scope_id: request.scope_id,
      custom_permissions: request.custom_permissions?.length || 0,
      invitation_sent: request.send_invitation
    });

    return {
      success: true,
      user: user as User
    };

  } catch (error) {
    console.error('Error creating employee:', error);
    return {
      success: false,
      error: 'Erreur lors de la création de l\'employé'
    };
  }
}

/**
 * Obtenir tous les rôles disponibles
 */
export async function getRoles(): Promise<any[]> {
  const { data, error } = await supabase
    .from('roles')
    .select(`
      *,
      role_permissions (
        permission_id, scope_default,
        permissions (id, key, module, action, name, description, is_dangerous)
      )
    `)
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Obtenir toutes les permissions groupées par module
 */
export async function getPermissionsByModule(): Promise<Record<string, Permission[]>> {
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('module, action');

  if (error) throw error;
  
  const grouped: Record<string, Permission[]> = {};
  for (const permission of data || []) {
    if (!grouped[permission.module]) {
      grouped[permission.module] = [];
    }
    grouped[permission.module].push(permission as Permission);
  }
  
  return grouped;
}

// ===================================================================
// AUDIT LOGGING
// ===================================================================

/**
 * Logger un changement d'accès
 */
export async function logAccessChange(
  actorId: string,
  targetUserId: string,
  action: string,
  changeType: string,
  changeDetails: Record<string, any>,
  reason?: string,
  severity: 'info' | 'warning' | 'critical' = 'info'
): Promise<void> {
  try {
    // Récupérer les infos de l'acteur
    const { data: actor } = await supabase
      .from('users')
      .select('email, role')
      .eq('id', actorId)
      .single();

    // Récupérer les infos de la cible
    const { data: target } = await supabase
      .from('users')
      .select('email')
      .eq('id', targetUserId)
      .single();

    await supabase
      .from('audit_access_grants')
      .insert({
        actor_id: actorId,
        actor_email: actor?.email,
        actor_role: actor?.role,
        target_user_id: targetUserId,
        target_email: target?.email,
        action,
        change_type: changeType as any,
        change_details: changeDetails,
        reason,
        severity,
        requires_review: severity === 'critical'
      });

  } catch (error) {
    console.error('Error logging access change:', error);
    // Ne pas faire échouer l'opération principale pour un problème d'audit
  }
}

// ===================================================================
// HELPERS POUR L'UI
// ===================================================================

/**
 * Formater une permission pour l'affichage
 */
export function formatPermissionKey(key: string): string {
  const [module, action] = key.split('.');
  const moduleNames: Record<string, string> = {
    planning: 'Planification',
    projects: 'Projets',
    timesheets: 'Feuilles de temps',
    expenses: 'Dépenses',
    ast: 'AST',
    permits: 'Permis',
    fleet: 'Flotte',
    billing: 'Facturation',
    reports: 'Rapports',
    users: 'Utilisateurs',
    settings: 'Paramètres'
  };

  const actionNames: Record<string, string> = {
    view: 'Voir',
    create: 'Créer',
    edit: 'Modifier',
    delete: 'Supprimer',
    approve: 'Approuver',
    export: 'Exporter',
    sign: 'Signer',
    manage: 'Gérer'
  };

  return `${moduleNames[module] || module} - ${actionNames[action] || action}`;
}

/**
 * Obtenir la couleur d'une portée
 */
export function getScopeColor(scopeType: ScopeType): string {
  const colors = {
    global: '#dc2626', // rouge
    client: '#ea580c', // orange
    site: '#d97706',   // amber
    project: '#059669' // emerald
  };
  return colors[scopeType] || '#6b7280';
}

/**
 * Vérifier si un utilisateur peut gérer un autre utilisateur
 */
export async function canManageUser(
  managerId: string,
  targetUserId: string
): Promise<boolean> {
  // Les super admins peuvent gérer tout le monde
  const { data: manager } = await supabase
    .from('users')
    .select('role')
    .eq('id', managerId)
    .single();

  if (manager?.role === 'super_admin') {
    return true;
  }

  // Vérifier la permission de gestion des utilisateurs
  const permission = await hasPermission(managerId, 'users.edit');
  return permission.allowed;
}