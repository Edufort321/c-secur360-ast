'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { Shield, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  role?: string;
  module?: string;
  action?: string;
  scope?: 'global' | 'client' | 'site' | 'project';
  scopeId?: string;
  fallback?: ReactNode;
  redirectTo?: string;
  showDemo?: boolean; // Afficher lien vers démo si pas de permissions
}

export default function ProtectedRoute({
  children,
  permission,
  role,
  module,
  action,
  scope = 'global',
  scopeId,
  fallback,
  redirectTo,
  showDemo = true
}: ProtectedRouteProps) {
  const { user, loading, hasPermission, hasRole, canAccess, isOwner } = useAuth();

  // Mode démo - Toujours accessible
  if (typeof window !== 'undefined' && 
      (window.location.pathname.startsWith('/demo') || 
       window.location.search.includes('demo=true'))) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Authentification requise
          </h2>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour accéder à cette page.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Se connecter
            </Link>
            
            {showDemo && (
              <Link
                href="/demo"
                className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                Essayer la démo
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Super admin bypass
  if (isOwner) {
    return <>{children}</>;
  }

  // Vérifications de permissions
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission, scope, scopeId);
  } else if (role) {
    hasAccess = hasRole(role, scope, scopeId);
  } else if (module && action) {
    hasAccess = canAccess(module, action, scope, scopeId);
  } else {
    // Pas de restrictions spécifiées = accès autorisé pour utilisateurs connectés
    hasAccess = true;
  }

  if (!hasAccess) {
    // Custom fallback
    if (fallback) {
      return <>{fallback}</>;
    }

    // Redirection
    if (redirectTo) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return null;
    }

    // Page d'accès refusé par défaut
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Accès refusé
          </h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            {permission && (
              <span className="block mt-2 text-sm text-gray-500">
                Permission requise: <code className="bg-gray-100 px-1 rounded">{permission}</code>
              </span>
            )}
            {role && (
              <span className="block mt-2 text-sm text-gray-500">
                Rôle requis: <code className="bg-gray-100 px-1 rounded">{role}</code>
              </span>
            )}
            {module && action && (
              <span className="block mt-2 text-sm text-gray-500">
                Accès requis: <code className="bg-gray-100 px-1 rounded">{module}.{action}</code>
              </span>
            )}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Retour
            </button>
            
            <Link
              href="/"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Accueil
            </Link>
            
            {showDemo && (
              <Link
                href="/demo"
                className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                Essayer la démo
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          
          <p className="mt-4 text-xs text-gray-500">
            Pour obtenir l'accès, contactez votre administrateur.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Composants spécialisés pour des cas d'usage communs
export function OwnerOnly({ children }: { children: ReactNode }) {
  return <ProtectedRoute role="owner">{children}</ProtectedRoute>;
}

export function ClientAdminOnly({ children, clientId }: { children: ReactNode; clientId?: string }) {
  return (
    <ProtectedRoute 
      role="client_admin" 
      scope={clientId ? 'client' : 'global'}
      scopeId={clientId}
    >
      {children}
    </ProtectedRoute>
  );
}

export function SiteManagerOnly({ children, siteId }: { children: ReactNode; siteId?: string }) {
  return (
    <ProtectedRoute 
      role="site_manager" 
      scope={siteId ? 'site' : 'global'}
      scopeId={siteId}
    >
      {children}
    </ProtectedRoute>
  );
}

// Wrapper pour cacher/montrer des éléments selon permissions
export function PermissionGate({ 
  children, 
  permission, 
  role, 
  module, 
  action, 
  scope = 'global', 
  scopeId,
  fallback = null 
}: {
  children: ReactNode;
  permission?: string;
  role?: string;
  module?: string;
  action?: string;
  scope?: 'global' | 'client' | 'site' | 'project';
  scopeId?: string;
  fallback?: ReactNode;
}) {
  const { hasPermission, hasRole, canAccess, isOwner } = useAuth();

  // Mode démo - Toujours visible
  if (typeof window !== 'undefined' && 
      (window.location.pathname.startsWith('/demo') || 
       window.location.search.includes('demo=true'))) {
    return <>{children}</>;
  }

  // Super admin bypass
  if (isOwner) {
    return <>{children}</>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission, scope, scopeId);
  } else if (role) {
    hasAccess = hasRole(role, scope, scopeId);
  } else if (module && action) {
    hasAccess = canAccess(module, action, scope, scopeId);
  } else {
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}