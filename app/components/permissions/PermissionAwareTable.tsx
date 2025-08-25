'use client';

import React from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';

interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any, hasEditAccess: boolean) => React.ReactNode;
  sortable?: boolean;
  permission?: string; // Permission pour voir cette colonne
  className?: string;
}

interface TableAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  permission?: string;
  role?: string;
  module?: string;
  action?: string;
  scope?: 'global' | 'client' | 'site' | 'project';
  scopeId?: string | ((row: any) => string);
  onClick: (row: any) => void;
  className?: string;
  condition?: (row: any) => boolean; // Condition pour afficher l'action
  variant?: 'primary' | 'secondary' | 'danger';
}

interface PermissionAwareTableProps {
  data: any[];
  columns: TableColumn[];
  actions?: TableAction[];
  keyField?: string;
  className?: string;
  emptyMessage?: string;
  rowPermissionCheck?: (row: any) => {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  onRowClick?: (row: any) => void;
  striped?: boolean;
}

export default function PermissionAwareTable({
  data,
  columns,
  actions = [],
  keyField = 'id',
  className = '',
  emptyMessage = 'Aucune donnée trouvée',
  rowPermissionCheck,
  onRowClick,
  striped = true
}: PermissionAwareTableProps) {
  const { hasPermission, hasRole, canAccess, isOwner } = useAuth();

  // Mode démo
  const isDemo = typeof window !== 'undefined' && 
    (window.location.pathname.startsWith('/demo') || 
     window.location.search.includes('demo=true'));

  const checkActionAccess = (action: TableAction, row: any): boolean => {
    // Super admin a accès à tout
    if (isOwner) return true;

    // Mode démo - Masquer les actions de modification
    if (isDemo && (
      action.permission?.includes('create') || 
      action.permission?.includes('update') || 
      action.permission?.includes('delete') || 
      action.permission?.includes('manage') ||
      (action.module && action.action && (
        action.action.includes('create') || 
        action.action.includes('update') || 
        action.action.includes('delete') ||
        action.action.includes('manage')
      ))
    )) {
      return false;
    }

    // Condition personnalisée
    if (action.condition && !action.condition(row)) {
      return false;
    }

    // Vérifications de permissions
    const scopeId = typeof action.scopeId === 'function' 
      ? action.scopeId(row) 
      : action.scopeId;

    if (action.permission) {
      return hasPermission(action.permission, action.scope || 'global', scopeId);
    }
    
    if (action.role) {
      return hasRole(action.role, action.scope || 'global', scopeId);
    }
    
    if (action.module && action.action) {
      return canAccess(action.module, action.action, action.scope || 'global', scopeId);
    }

    return true;
  };

  const checkColumnAccess = (column: TableColumn): boolean => {
    if (!column.permission) return true;
    if (isOwner) return true;
    return hasPermission(column.permission);
  };

  const getRowPermissions = (row: any) => {
    if (rowPermissionCheck) {
      return rowPermissionCheck(row);
    }

    return {
      canView: true,
      canEdit: isOwner || hasPermission('general.edit'),
      canDelete: isOwner || hasPermission('general.delete')
    };
  };

  const getActionButtonClass = (variant: string = 'secondary') => {
    const base = 'p-2 rounded-lg transition-colors';
    switch (variant) {
      case 'primary':
        return `${base} bg-blue-600 hover:bg-blue-700 text-white`;
      case 'danger':
        return `${base} bg-red-600 hover:bg-red-700 text-white`;
      default:
        return `${base} bg-gray-100 hover:bg-gray-200 text-gray-700`;
    }
  };

  // Filtrer les colonnes selon les permissions
  const visibleColumns = columns.filter(checkColumnAccess);

  if (data.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
        <div className="p-8 text-center text-gray-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => {
              const permissions = getRowPermissions(row);
              const rowKey = row[keyField] || index;

              // Ne pas afficher la ligne si pas d'accès en lecture
              if (!permissions.canView) {
                return null;
              }

              return (
                <tr
                  key={rowKey}
                  className={`
                    ${striped && index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    ${onRowClick ? 'hover:bg-blue-50 cursor-pointer' : ''}
                    ${!permissions.canEdit ? 'opacity-60' : ''}
                  `}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {visibleColumns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-sm ${column.className || ''}`}
                    >
                      {column.render 
                        ? column.render(row[column.key], row, permissions.canEdit)
                        : row[column.key]
                      }
                    </td>
                  ))}
                  
                  {actions.length > 0 && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {actions
                          .filter(action => checkActionAccess(action, row))
                          .map((action) => (
                            <button
                              key={action.key}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                              className={getActionButtonClass(action.variant)}
                              title={action.label}
                            >
                              {action.icon || <MoreHorizontal className="w-4 h-4" />}
                            </button>
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Actions prédéfinies communes
export const commonTableActions = {
  view: (onClick: (row: any) => void): TableAction => ({
    key: 'view',
    label: 'Voir',
    icon: <Eye className="w-4 h-4" />,
    onClick,
    permission: 'general.view'
  }),

  edit: (onClick: (row: any) => void): TableAction => ({
    key: 'edit',
    label: 'Modifier',
    icon: <Edit className="w-4 h-4" />,
    onClick,
    permission: 'general.edit',
    variant: 'primary'
  }),

  delete: (onClick: (row: any) => void): TableAction => ({
    key: 'delete',
    label: 'Supprimer',
    icon: <Trash2 className="w-4 h-4" />,
    onClick,
    permission: 'general.delete',
    variant: 'danger'
  })
};