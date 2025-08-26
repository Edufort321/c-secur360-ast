'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserPermissions {
  roles: string[];
  permissions: string[];
  scopes: {
    global: string[];
    client: { [clientId: string]: string[] };
    site: { [siteId: string]: string[] };
    project: { [projectId: string]: string[] };
  };
}

interface AuthContextType {
  user: User | null;
  permissions: UserPermissions | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string, scope?: 'global' | 'client' | 'site' | 'project', scopeId?: string) => boolean;
  hasRole: (role: string, scope?: 'global' | 'client' | 'site' | 'project', scopeId?: string) => boolean;
  canAccess: (module: string, action: string, scope?: 'global' | 'client' | 'site' | 'project', scopeId?: string) => boolean;
  isOwner: boolean;
  isClientAdmin: (clientId?: string) => boolean;
  isSiteManager: (siteId?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  // Charger les permissions utilisateur
  const loadUserPermissions = async (userId: string) => {
    try {
      const { data: userRoles, error } = await supabase
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

      if (error) {
        console.error('Erreur chargement permissions:', error);
        return null;
      }

      // Construire la structure des permissions
      const userPermissions: UserPermissions = {
        roles: [],
        permissions: [],
        scopes: {
          global: [],
          client: {},
          site: {},
          project: {}
        }
      };

      userRoles?.forEach((userRole: any) => {
        const role = userRole.roles;
        const roleKey = role.key;
        
        if (!userPermissions.roles.includes(roleKey)) {
          userPermissions.roles.push(roleKey);
        }

        role.role_permissions?.forEach((rolePermission: any) => {
          const permission = rolePermission.permissions;
          const permissionKey = permission.key;
          
          if (!userPermissions.permissions.includes(permissionKey)) {
            userPermissions.permissions.push(permissionKey);
          }

          const scopeType = userRole.scope_type || 'global';
          const scopeId = userRole.scope_id;

          if (scopeType === 'global') {
            if (!userPermissions.scopes.global.includes(permissionKey)) {
              userPermissions.scopes.global.push(permissionKey);
            }
          } else if (scopeType === 'client' && scopeId) {
            if (!userPermissions.scopes.client[scopeId]) {
              userPermissions.scopes.client[scopeId] = [];
            }
            if (!userPermissions.scopes.client[scopeId].includes(permissionKey)) {
              userPermissions.scopes.client[scopeId].push(permissionKey);
            }
          } else if (scopeType === 'site' && scopeId) {
            if (!userPermissions.scopes.site[scopeId]) {
              userPermissions.scopes.site[scopeId] = [];
            }
            if (!userPermissions.scopes.site[scopeId].includes(permissionKey)) {
              userPermissions.scopes.site[scopeId].push(permissionKey);
            }
          } else if (scopeType === 'project' && scopeId) {
            if (!userPermissions.scopes.project[scopeId]) {
              userPermissions.scopes.project[scopeId] = [];
            }
            if (!userPermissions.scopes.project[scopeId].includes(permissionKey)) {
              userPermissions.scopes.project[scopeId].push(permissionKey);
            }
          }
        });
      });

      return userPermissions;
    } catch (error) {
      console.error('Erreur loadUserPermissions:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Erreur auth:', error);
      }
      
      setUser(user);
      
      if (user) {
        const userPermissions = await loadUserPermissions(user.id);
        setPermissions(userPermissions);
      }
      
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          const userPermissions = await loadUserPermissions(session.user.id);
          setPermissions(userPermissions);
        } else {
          setPermissions(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasPermission = (
    permission: string, 
    scope: 'global' | 'client' | 'site' | 'project' = 'global', 
    scopeId?: string
  ): boolean => {
    if (!permissions) return false;
    
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
  };

  const hasRole = (
    role: string, 
    scope: 'global' | 'client' | 'site' | 'project' = 'global', 
    scopeId?: string
  ): boolean => {
    if (!permissions) return false;
    return permissions.roles.includes(role);
  };

  const canAccess = (
    module: string, 
    action: string, 
    scope: 'global' | 'client' | 'site' | 'project' = 'global', 
    scopeId?: string
  ): boolean => {
    const permission = `${module}.${action}`;
    return hasPermission(permission, scope, scopeId);
  };

  const isOwner = permissions?.roles.includes('owner') || false;

  const isClientAdmin = (clientId?: string): boolean => {
    if (!permissions) return false;
    return permissions.roles.includes('owner') || 
           permissions.roles.includes('client_admin');
  };

  const isSiteManager = (siteId?: string): boolean => {
    if (!permissions) return false;
    return permissions.roles.includes('owner') ||
           permissions.roles.includes('client_admin') ||
           permissions.roles.includes('site_manager');
  };

  return (
    <AuthContext.Provider value={{
      user,
      permissions,
      loading,
      signIn,
      signOut,
      hasPermission,
      hasRole,
      canAccess,
      isOwner,
      isClientAdmin,
      isSiteManager,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hooks spécialisés pour des vérifications communes
export function usePermission(permission: string, scope?: 'global' | 'client' | 'site' | 'project', scopeId?: string) {
  const { hasPermission } = useAuth();
  return hasPermission(permission, scope, scopeId);
}

export function useRole(role: string) {
  const { hasRole } = useAuth();
  return hasRole(role);
}

export function useCanAccess(module: string, action: string, scope?: 'global' | 'client' | 'site' | 'project', scopeId?: string) {
  const { canAccess } = useAuth();
  return canAccess(module, action, scope, scopeId);
}