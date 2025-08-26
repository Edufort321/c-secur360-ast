'use client';

import React from 'react';
import { useAuth } from '@/app/hooks/useAuth';

interface PermissionAwareButtonProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
  module?: string;
  action?: string;
  scope?: 'global' | 'client' | 'site' | 'project';
  scopeId?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  fallbackText?: string; // Texte alternatif si pas de permissions
  hideIfNoPermission?: boolean; // Masquer complètement si pas de permissions
}

export default function PermissionAwareButton({
  children,
  permission,
  role,
  module,
  action,
  scope = 'global',
  scopeId,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  title,
  fallbackText,
  hideIfNoPermission = false,
  ...props
}: PermissionAwareButtonProps) {
  const { hasPermission, hasRole, canAccess, isOwner } = useAuth();

  // Mode démo - Toujours visible mais disabled pour actions de sauvegarde
  const isDemo = typeof window !== 'undefined' && 
    (window.location.pathname.startsWith('/demo') || 
     window.location.search.includes('demo=true'));

  if (isDemo && (
    permission?.includes('create') || 
    permission?.includes('update') || 
    permission?.includes('delete') ||
    module && (action?.includes('create') || action?.includes('update') || action?.includes('delete'))
  )) {
    return (
      <button
        type={type}
        className={`${className} opacity-50 cursor-not-allowed`}
        disabled={true}
        title="Action non disponible en mode démo"
        onClick={() => {
          // Afficher modal de contact en mode démo
          alert('Cette action n\'est pas disponible en mode démo. Contactez-nous pour un accès complet.');
        }}
        {...props}
      >
        {children}
      </button>
    );
  }

  // Super admin bypass
  if (isOwner) {
    return (
      <button
        type={type}
        className={className}
        disabled={disabled}
        onClick={onClick}
        title={title}
        {...props}
      >
        {children}
      </button>
    );
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
    // Pas de restrictions spécifiées = accès autorisé
    hasAccess = true;
  }

  // Masquer complètement si pas de permissions
  if (!hasAccess && hideIfNoPermission) {
    return null;
  }

  // Désactiver si pas de permissions
  if (!hasAccess) {
    return (
      <button
        type={type}
        className={`${className} opacity-50 cursor-not-allowed`}
        disabled={true}
        title={`Permission requise: ${permission || role || (module && action ? `${module}.${action}` : 'Accès restreint')}`}
        {...props}
      >
        {fallbackText || children}
      </button>
    );
  }

  // Rendu normal avec permissions
  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
}