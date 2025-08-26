'use client';

import React from 'react';
import { useAuth } from '@/app/hooks/useAuth';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  permission?: string; // Permission pour voir/modifier ce champ
  readOnlyPermission?: string; // Permission pour lecture seule
  className?: string;
  rows?: number; // Pour textarea
  min?: number;
  max?: number;
  step?: number;
}

interface PermissionAwareFormProps {
  fields: FormField[];
  data: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSubmit?: () => void;
  className?: string;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  submitPermission?: string;
  readOnly?: boolean;
  showSaveButton?: boolean;
}

export default function PermissionAwareForm({
  fields,
  data,
  onChange,
  onSubmit,
  className = '',
  submitText = 'Enregistrer',
  cancelText = 'Annuler',
  onCancel,
  submitPermission,
  readOnly = false,
  showSaveButton = true
}: PermissionAwareFormProps) {
  const { hasPermission, isOwner } = useAuth();

  // Mode démo - Tout en lecture seule
  const isDemo = typeof window !== 'undefined' && 
    (window.location.pathname.startsWith('/demo') || 
     window.location.search.includes('demo=true'));

  const canSubmit = () => {
    if (isDemo) return false;
    if (readOnly) return false;
    if (isOwner) return true;
    if (!submitPermission) return true;
    return hasPermission(submitPermission);
  };

  const getFieldAccess = (field: FormField) => {
    // Super admin a accès à tout
    if (isOwner) {
      return { canView: true, canEdit: !readOnly && !isDemo };
    }

    // Vérifier permission de vue
    const canView = !field.permission || hasPermission(field.permission);
    
    // Vérifier permission d'édition
    let canEdit = canView && !readOnly && !isDemo;
    
    // Si permission lecture seule spécifiée
    if (field.readOnlyPermission && hasPermission(field.readOnlyPermission)) {
      canEdit = false;
    }

    return { canView, canEdit };
  };

  const renderField = (field: FormField) => {
    const { canView, canEdit } = getFieldAccess(field);
    
    if (!canView) {
      return null;
    }

    const fieldValue = data[field.name] || '';
    const isReadOnly = !canEdit;

    const baseInputClass = `
      w-full px-3 py-2 border rounded-lg transition-colors
      ${isReadOnly 
        ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed' 
        : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
      }
    `;

    const renderInput = () => {
      switch (field.type) {
        case 'select':
          return (
            <select
              value={fieldValue}
              onChange={(e) => canEdit && onChange(field.name, e.target.value)}
              disabled={isReadOnly}
              className={baseInputClass}
              required={field.required}
            >
              <option value="">Sélectionner...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'textarea':
          return (
            <textarea
              value={fieldValue}
              onChange={(e) => canEdit && onChange(field.name, e.target.value)}
              placeholder={isReadOnly ? '' : field.placeholder}
              disabled={isReadOnly}
              rows={field.rows || 3}
              className={baseInputClass}
              required={field.required}
            />
          );

        case 'checkbox':
          return (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={!!fieldValue}
                onChange={(e) => canEdit && onChange(field.name, e.target.checked)}
                disabled={isReadOnly}
                className={`
                  rounded border-gray-300 text-blue-600 focus:ring-blue-500
                  ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                required={field.required}
              />
              <label className="ml-2 text-sm text-gray-600">
                {field.label}
              </label>
            </div>
          );

        case 'radio':
          return (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                    checked={fieldValue === option.value}
                    onChange={(e) => canEdit && onChange(field.name, e.target.value)}
                    disabled={isReadOnly}
                    className={`
                      border-gray-300 text-blue-600 focus:ring-blue-500
                      ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    required={field.required}
                  />
                  <label className="ml-2 text-sm text-gray-600">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          );

        case 'number':
          return (
            <input
              type="number"
              value={fieldValue}
              onChange={(e) => canEdit && onChange(field.name, parseFloat(e.target.value))}
              placeholder={isReadOnly ? '' : field.placeholder}
              disabled={isReadOnly}
              min={field.min}
              max={field.max}
              step={field.step}
              className={baseInputClass}
              required={field.required}
            />
          );

        default:
          return (
            <input
              type={field.type}
              value={fieldValue}
              onChange={(e) => canEdit && onChange(field.name, e.target.value)}
              placeholder={isReadOnly ? '' : field.placeholder}
              disabled={isReadOnly}
              className={baseInputClass}
              required={field.required}
            />
          );
      }
    };

    return (
      <div key={field.name} className={`space-y-1 ${field.className || ''}`}>
        {field.type !== 'checkbox' && (
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
            {isReadOnly && (
              <span className="text-xs text-gray-500 ml-2">(lecture seule)</span>
            )}
          </label>
        )}
        {renderInput()}
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit() && onSubmit) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {fields.map(renderField)}

      {/* Mode démo notice */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-700">
            <strong>Mode démo:</strong> Les modifications ne sont pas sauvegardées.
            <button 
              type="button"
              className="ml-2 text-amber-800 underline hover:text-amber-900"
              onClick={() => alert('Contactez-nous pour accéder à la version complète')}
            >
              Contacter pour accès complet
            </button>
          </p>
        </div>
      )}

      {/* Boutons d'action */}
      {showSaveButton && (onSubmit || onCancel) && (
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {onSubmit && (
            <button
              type="submit"
              disabled={!canSubmit()}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${canSubmit()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
              title={!canSubmit() && submitPermission 
                ? `Permission requise: ${submitPermission}` 
                : undefined
              }
            >
              {submitText}
            </button>
          )}
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              {cancelText}
            </button>
          )}
        </div>
      )}
    </form>
  );
}