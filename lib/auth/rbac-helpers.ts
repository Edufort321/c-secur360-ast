// ===================================================================
// C-Secur360 Helpers d'Autorisation RBAC
// ===================================================================

import { createClient } from '@/utils/supabase/server';
import { User } from '@supabase/supabase-js';

export interface UserPermissions {
  user: User;
  roles: string[];
  permissions: string[];
  scopes: {
    global: string[];
    client: { [clientId: string]: string[] };
    site: { [siteId: string]: string[] };
    project: { [projectId: string]: string[] };
  };
}

export interface AuthorizationContext {
  user: User;
  permissions: UserPermissions;
  hasPermission: (permission: string, scope?: 'global' | 'client' | 'site' | 'project', scopeId?: string) => boolean;
  hasRole: (role: string, scope?: 'global' | 'client' | 'site' | 'project', scopeId?: string) => boolean;
  canAccess: (module: string, action: string, scope?: 'global' | 'client' | 'site' | 'project', scopeId?: string) => boolean;
}

/**
 * Récupère les permissions complètes d'un utilisateur
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions | null> {
  const supabase = createClient();
  
  try {
    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user || user.user.id !== userId) {
      return null;
    }

    // Récupérer les rôles et permissions via une requête SQL complexe
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        scope_type,
        scope_id,
        is_active,
        expires_at,
        roles!inner (
          key,
          name,
          role_permissions!inner (
            scope_default,
            permissions!inner (
              key,
              module,
              action
            )
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.now()');

    if (rolesError) {
      console.error('Erreur récupération rôles:', rolesError);
      return null;
    }

    // Construire la structure des permissions
    const permissions: UserPermissions = {
      user: user.user,
      roles: [],
      permissions: [],
      scopes: {
        global: [],
        client: {},
        site: {},
        project: {}
      }
    };

    // Traiter chaque rôle
    userRoles?.forEach((userRole: any) => {
      const role = userRole.roles;
      const roleKey = role.key;
      
      // Ajouter le rôle
      if (!permissions.roles.includes(roleKey)) {
        permissions.roles.push(roleKey);
      }

      // Traiter les permissions de ce rôle
      role.role_permissions?.forEach((rolePermission: any) => {
        const permission = rolePermission.permissions;
        const permissionKey = permission.key;
        
        // Ajouter la permission globale
        if (!permissions.permissions.includes(permissionKey)) {
          permissions.permissions.push(permissionKey);
        }

        // Gérer les portées
        const scopeType = userRole.scope_type || 'global';
        const scopeId = userRole.scope_id;

        if (scopeType === 'global') {
          if (!permissions.scopes.global.includes(permissionKey)) {
            permissions.scopes.global.push(permissionKey);
          }
        } else if (scopeType === 'client' && scopeId) {
          if (!permissions.scopes.client[scopeId]) {
            permissions.scopes.client[scopeId] = [];
          }
          if (!permissions.scopes.client[scopeId].includes(permissionKey)) {
            permissions.scopes.client[scopeId].push(permissionKey);
          }
        } else if (scopeType === 'site' && scopeId) {
          if (!permissions.scopes.site[scopeId]) {
            permissions.scopes.site[scopeId] = [];
          }
          if (!permissions.scopes.site[scopeId].includes(permissionKey)) {
            permissions.scopes.site[scopeId].push(permissionKey);
          }
        } else if (scopeType === 'project' && scopeId) {
          if (!permissions.scopes.project[scopeId]) {
            permissions.scopes.project[scopeId] = [];
          }
          if (!permissions.scopes.project[scopeId].includes(permissionKey)) {
            permissions.scopes.project[scopeId].push(permissionKey);
          }
        }
      });
    });

    return permissions;
  } catch (error) {
    console.error('Erreur getUserPermissions:', error);
    return null;
  }
}

/**
 * Crée un contexte d'autorisation avec helpers
 */
export async function createAuthorizationContext(userId: string): Promise<AuthorizationContext | null> {
  const permissions = await getUserPermissions(userId);
  if (!permissions) return null;

  return {
    user: permissions.user,
    permissions,
    
    hasPermission: (permission: string, scope = 'global', scopeId?: string) => {
      // Super admin a tous les droits
      if (permissions.roles.includes('owner')) return true;
      
      // Vérifier permission globale
      if (scope === 'global' && permissions.scopes.global.includes(permission)) {
        return true;
      }
      
      // Vérifier permission avec portée spécifique
      if (scope !== 'global' && scopeId) {
        const scopePermissions = permissions.scopes[scope]?.[scopeId];
        if (scopePermissions?.includes(permission)) {
          return true;
        }
      }
      
      return false;
    },
    
    hasRole: (role: string, scope = 'global', scopeId?: string) => {
      return permissions.roles.includes(role);
    },
    
    canAccess: (module: string, action: string, scope = 'global', scopeId?: string) => {
      const permission = `${module}.${action}`;
      return permissions.permissions.includes(permission) ||
             permissions.scopes.global.includes(permission) ||
             (scope !== 'global' && scopeId && 
              permissions.scopes[scope]?.[scopeId]?.includes(permission));
    }
  };
}

/**
 * Middleware d'autorisation pour les API routes
 */
export async function requirePermission(
  permission: string, 
  scope: 'global' | 'client' | 'site' | 'project' = 'global',
  scopeId?: string
) {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('Non authentifié');
  }

  const authContext = await createAuthorizationContext(user.id);
  if (!authContext) {
    throw new Error('Impossible de récupérer les permissions');
  }

  if (!authContext.hasPermission(permission, scope, scopeId)) {
    throw new Error(`Permission refusée: ${permission} (${scope}${scopeId ? ':' + scopeId : ''})`);
  }

  return authContext;
}

/**
 * Wrapper pour API routes avec vérification automatique
 */
export function withAuthorization(
  handler: (context: AuthorizationContext, ...args: any[]) => Promise<Response>,
  requiredPermission: string,
  scope: 'global' | 'client' | 'site' | 'project' = 'global'
) {
  return async (request: Request, ...args: any[]): Promise<Response> => {
    try {
      // Extraire scopeId du body ou query params si nécessaire
      const url = new URL(request.url);
      const scopeId = url.searchParams.get('scopeId') || undefined;
      
      const context = await requirePermission(requiredPermission, scope, scopeId);
      return await handler(context, request, ...args);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur d\'autorisation';
      return Response.json({ error: message }, { 
        status: message.includes('authentifié') ? 401 : 403 
      });
    }
  };
}

/**
 * Helpers pour vérifications spécifiques communes
 */
export const AuthHelpers = {
  // Inventaire
  canViewInventory: (context: AuthorizationContext, clientId?: string) => 
    context.hasPermission('inventory.view', clientId ? 'client' : 'global', clientId),
  
  canManageInventory: (context: AuthorizationContext, clientId?: string) => 
    context.hasPermission('inventory.manage', clientId ? 'client' : 'global', clientId),
  
  canScanQR: (context: AuthorizationContext, clientId?: string) => 
    context.hasPermission('inventory.scan', clientId ? 'client' : 'global', clientId),

  // Utilisateurs
  canViewUsers: (context: AuthorizationContext, clientId?: string) => 
    context.hasPermission('users.view', clientId ? 'client' : 'global', clientId),
  
  canManageUsers: (context: AuthorizationContext, clientId?: string) => 
    context.hasPermission('users.manage', clientId ? 'client' : 'global', clientId),

  // Feuilles de temps
  canViewOwnTimesheet: (context: AuthorizationContext) => 
    context.hasPermission('timesheets.view_own'),
  
  canViewAllTimesheets: (context: AuthorizationContext, clientId?: string) => 
    context.hasPermission('timesheets.view_all', clientId ? 'client' : 'global', clientId),
  
  canApproveTimesheets: (context: AuthorizationContext, clientId?: string) => 
    context.hasPermission('timesheets.approve', clientId ? 'client' : 'global', clientId),

  // Rapports
  canViewReports: (context: AuthorizationContext, clientId?: string) => 
    context.hasPermission('reports.view', clientId ? 'client' : 'global', clientId),
  
  canExportReports: (context: AuthorizationContext, clientId?: string) => 
    context.hasPermission('reports.export', clientId ? 'client' : 'global', clientId),

  // Administration
  isOwner: (context: AuthorizationContext) => 
    context.hasRole('owner'),
  
  isClientAdmin: (context: AuthorizationContext, clientId?: string) => 
    context.hasRole('client_admin', clientId ? 'client' : 'global', clientId) || context.hasRole('owner'),
  
  isSiteManager: (context: AuthorizationContext, siteId?: string) => 
    context.hasRole('site_manager', siteId ? 'site' : 'global', siteId) || 
    context.hasRole('client_admin') || 
    context.hasRole('owner')
};

/**
 * Helper pour créer des policies RLS
 */
export const RLSPolicies = {
  userOwnsRecord: (userIdColumn = 'user_id') => 
    `(${userIdColumn} = auth.uid()::text)`,
  
  userHasPermission: (permission: string, resourceType = 'global') => 
    `(user_has_permission(auth.uid()::text, '${permission}', '${resourceType}', null))`,
  
  userInClient: (clientIdColumn = 'client_id') => 
    `EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text 
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND (ur.scope_type = 'global' OR 
           (ur.scope_type = 'client' AND ur.scope_id::uuid = ${clientIdColumn}))
    )`,
  
  userInSite: (siteIdColumn = 'site_id') => 
    `EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()::text 
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND (ur.scope_type = 'global' OR 
           (ur.scope_type = 'site' AND ur.scope_id::uuid = ${siteIdColumn}))
    )`
};