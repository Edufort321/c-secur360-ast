'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { LucideIcon } from 'lucide-react';

interface MenuItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
  permission?: string;
  role?: string;
  module?: string;
  action?: string;
  scope?: 'global' | 'client' | 'site' | 'project';
  scopeId?: string;
  children?: MenuItem[];
  onClick?: () => void;
  className?: string;
  badge?: string | number; // Badge de notification
  newTab?: boolean;
}

interface PermissionAwareMenuProps {
  items: MenuItem[];
  className?: string;
  renderItem?: (item: MenuItem, hasAccess: boolean) => React.ReactNode;
}

export default function PermissionAwareMenu({ 
  items, 
  className = '',
  renderItem 
}: PermissionAwareMenuProps) {
  const { hasPermission, hasRole, canAccess, isOwner } = useAuth();

  // Mode démo - Filtrer les actions de modification
  const isDemo = typeof window !== 'undefined' && 
    (window.location.pathname.startsWith('/demo') || 
     window.location.search.includes('demo=true'));

  const checkAccess = (item: MenuItem): boolean => {
    // Super admin a accès à tout
    if (isOwner) return true;

    // Mode démo - Masquer les actions de création/modification
    if (isDemo && (
      item.permission?.includes('create') || 
      item.permission?.includes('update') || 
      item.permission?.includes('delete') || 
      item.permission?.includes('manage') ||
      (item.module && item.action && (
        item.action.includes('create') || 
        item.action.includes('update') || 
        item.action.includes('delete') ||
        item.action.includes('manage')
      ))
    )) {
      return false;
    }

    // Vérifications de permissions
    if (item.permission) {
      return hasPermission(item.permission, item.scope || 'global', item.scopeId);
    }
    
    if (item.role) {
      return hasRole(item.role, item.scope || 'global', item.scopeId);
    }
    
    if (item.module && item.action) {
      return canAccess(item.module, item.action, item.scope || 'global', item.scopeId);
    }

    // Pas de restrictions = accessible
    return true;
  };

  const renderMenuItem = (item: MenuItem, hasAccess: boolean): React.ReactNode => {
    // Custom renderer
    if (renderItem) {
      return renderItem(item, hasAccess);
    }

    // Ne pas afficher si pas d'accès
    if (!hasAccess) {
      return null;
    }

    const Icon = item.icon;
    const content = (
      <div className={`flex items-center gap-3 ${item.className || ''}`}>
        {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
            {item.badge}
          </span>
        )}
      </div>
    );

    // Lien externe ou interne
    if (item.href) {
      if (item.newTab) {
        return (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {content}
          </a>
        );
      } else {
        return (
          <Link
            href={item.href}
            className="block p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {content}
          </Link>
        );
      }
    }

    // Button avec onClick
    if (item.onClick) {
      return (
        <button
          onClick={item.onClick}
          className="w-full text-left p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {content}
        </button>
      );
    }

    // Simple div
    return (
      <div className="p-2">
        {content}
      </div>
    );
  };

  const renderMenuItems = (menuItems: MenuItem[]): React.ReactNode[] => {
    return menuItems
      .map((item, index) => {
        const hasAccess = checkAccess(item);
        
        if (item.children && item.children.length > 0) {
          const accessibleChildren = item.children.filter(child => checkAccess(child));
          
          // Ne pas afficher le parent si aucun enfant accessible
          if (accessibleChildren.length === 0) {
            return null;
          }

          return (
            <div key={index} className="space-y-1">
              {/* Parent item */}
              {renderMenuItem(item, hasAccess)}
              
              {/* Children avec indentation */}
              <div className="ml-6 space-y-1 border-l border-gray-200 pl-4">
                {renderMenuItems(accessibleChildren)}
              </div>
            </div>
          );
        }

        return (
          <div key={index}>
            {renderMenuItem(item, hasAccess)}
          </div>
        );
      })
      .filter(Boolean); // Supprimer les nulls
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {renderMenuItems(items)}
    </div>
  );
}

// Hook pour créer des menus contextuels
export function usePermissionAwareMenu() {
  const { hasPermission, hasRole, canAccess, isOwner } = useAuth();

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // Super admin a accès à tout
      if (isOwner) return true;

      // Mode démo
      const isDemo = typeof window !== 'undefined' && 
        (window.location.pathname.startsWith('/demo') || 
         window.location.search.includes('demo=true'));

      if (isDemo && (
        item.permission?.includes('create') || 
        item.permission?.includes('update') || 
        item.permission?.includes('delete') || 
        item.permission?.includes('manage')
      )) {
        return false;
      }

      // Vérifications normales
      if (item.permission) {
        return hasPermission(item.permission, item.scope || 'global', item.scopeId);
      }
      
      if (item.role) {
        return hasRole(item.role, item.scope || 'global', item.scopeId);
      }
      
      if (item.module && item.action) {
        return canAccess(item.module, item.action, item.scope || 'global', item.scopeId);
      }

      return true;
    });
  };

  return { filterMenuItems };
}