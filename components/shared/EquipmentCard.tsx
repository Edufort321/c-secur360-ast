"use client";

import React from 'react';
import { Shield, CheckCircle, AlertTriangle, Calendar, User, X, Edit } from 'lucide-react';

// =================== INTERFACES ===================
interface EquipmentCardProps {
  equipment: {
    id: string;
    name: string;
    category: string;
    required: boolean;
    available: boolean;
    verified: boolean;
    notes?: string;
    certification?: string;
    inspectionDate?: string;
    inspectedBy?: string;
    condition?: 'excellent' | 'good' | 'fair' | 'poor';
  };
  isSelected?: boolean;
  onSelect?: (equipmentId: string) => void;
  onRemove?: (equipmentId: string) => void;
  onEdit?: (equipmentId: string) => void;
  language?: 'fr' | 'en';
  showStatus?: boolean;
  className?: string;
}

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    required: 'Requis',
    available: 'Disponible',
    verified: 'Vérifié',
    notes: 'Notes',
    certification: 'Certification',
    inspectionDate: 'Date d\'inspection',
    inspectedBy: 'Inspecté par',
    condition: 'État',
    excellent: 'Excellent',
    good: 'Bon',
    fair: 'Acceptable',
    poor: 'Mauvais',
    edit: 'Modifier',
    remove: 'Retirer',
    categories: {
      head: 'Protection tête',
      eye: 'Protection oculaire',
      respiratory: 'Protection respiratoire',
      hand: 'Protection mains',
      foot: 'Protection pieds',
      body: 'Protection corps',
      fall: 'Protection chute',
      electrical: 'Électrique',
      detection: 'Détection',
      other: 'Autre'
    }
  },
  en: {
    required: 'Required',
    available: 'Available',
    verified: 'Verified',
    notes: 'Notes',
    certification: 'Certification',
    inspectionDate: 'Inspection Date',
    inspectedBy: 'Inspected By',
    condition: 'Condition',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    edit: 'Edit',
    remove: 'Remove',
    categories: {
      head: 'Head Protection',
      eye: 'Eye Protection',
      respiratory: 'Respiratory Protection',
      hand: 'Hand Protection',
      foot: 'Foot Protection',
      body: 'Body Protection',
      fall: 'Fall Protection',
      electrical: 'Electrical',
      detection: 'Detection',
      other: 'Other'
    }
  }
};

// =================== CONFIGURATION DES COULEURS ===================
const categoryColors = {
  head: { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', icon: '🪖' },
  eye: { bg: 'from-purple-50 to-violet-50', border: 'border-purple-200', icon: '👓' },
  respiratory: { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', icon: '😷' },
  hand: { bg: 'from-yellow-50 to-orange-50', border: 'border-yellow-200', icon: '🧤' },
  foot: { bg: 'from-red-50 to-pink-50', border: 'border-red-200', icon: '🥾' },
  body: { bg: 'from-orange-50 to-amber-50', border: 'border-orange-200', icon: '🦺' },
  fall: { bg: 'from-teal-50 to-cyan-50', border: 'border-teal-200', icon: '🪢' },
  electrical: { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200', icon: '⚡' },
  detection: { bg: 'from-indigo-50 to-purple-50', border: 'border-indigo-200', icon: '📡' },
  other: { bg: 'from-gray-50 to-slate-50', border: 'border-gray-200', icon: '🛡️' }
};

const conditionColors = {
  excellent: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  good: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  fair: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  poor: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
};

// =================== COMPOSANT PRINCIPAL ===================
const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  isSelected = false,
  onSelect,
  onRemove,
  onEdit,
  language = 'fr',
  showStatus = true,
  className = ''
}) => {
  const t = translations[language];
  const categoryStyle = categoryColors[equipment.category as keyof typeof categoryColors] || categoryColors.other;
  const conditionStyle = equipment.condition ? conditionColors[equipment.condition] : conditionColors.good;

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(equipment.id);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(equipment.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(equipment.id);
    }
  };

  // Calculer le score de statut
  const statusScore = [equipment.required, equipment.available, equipment.verified].filter(Boolean).length;
  const maxScore = 3;

  return (
    <div 
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
        bg-gradient-to-br ${categoryStyle.bg}
        ${isSelected ? `${categoryStyle.border} ring-2 ring-blue-500 ring-opacity-50 shadow-lg` : `${categoryStyle.border} hover:shadow-md`}
        ${className}
      `}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {categoryStyle.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm leading-tight">
              {equipment.name}
            </h3>
            <span className="text-xs text-gray-600">
              {t.categories[equipment.category as keyof typeof t.categories] || equipment.category}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Actions */}
          {onEdit && (
            <button
              onClick={handleEditClick}
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title={t.edit}
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          
          {onRemove && (
            <button
              onClick={handleRemoveClick}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title={t.remove}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {/* Indicateur de sélection */}
          {isSelected && (
            <div className="bg-blue-500 rounded-full p-1">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Status badges */}
      {showStatus && (
        <div className="flex flex-wrap gap-1 mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            equipment.required 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {equipment.required ? '❗' : '○'} {t.required}
          </span>
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            equipment.available 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {equipment.available ? '✓' : '○'} {t.available}
          </span>
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            equipment.verified 
              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {equipment.verified ? '✓' : '○'} {t.verified}
          </span>
        </div>
      )}

      {/* État de l'équipement */}
      {equipment.condition && (
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${conditionStyle.bg} ${conditionStyle.text} border ${conditionStyle.border}`}>
            {t.condition}: {t[equipment.condition]}
          </span>
        </div>
      )}

      {/* Certification */}
      {equipment.certification && (
        <div className="mb-2">
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Shield className="w-3 h-3" />
            <span className="font-medium">{t.certification}:</span>
            <span className="text-gray-800">{equipment.certification}</span>
          </div>
        </div>
      )}

      {/* Inspection */}
      {equipment.inspectionDate && (
        <div className="mb-2">
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Calendar className="w-3 h-3" />
            <span className="font-medium">{t.inspectionDate}:</span>
            <span className="text-gray-800">{equipment.inspectionDate}</span>
          </div>
        </div>
      )}

      {equipment.inspectedBy && (
        <div className="mb-2">
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <User className="w-3 h-3" />
            <span className="font-medium">{t.inspectedBy}:</span>
            <span className="text-gray-800">{equipment.inspectedBy}</span>
          </div>
        </div>
      )}

      {/* Notes */}
      {equipment.notes && (
        <div className="mb-2">
          <p className="text-xs text-gray-700 bg-white/60 px-2 py-1 rounded border border-gray-200">
            <span className="font-medium">{t.notes}:</span> {equipment.notes}
          </p>
        </div>
      )}

      {/* Score de statut */}
      {showStatus && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Statut global:</span>
            <div className="flex items-center space-x-1">
              {Array.from({ length: maxScore }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < statusScore ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs text-gray-600 ml-2">
                {statusScore}/{maxScore}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Alertes */}
      {equipment.required && !equipment.available && (
        <div className="absolute top-2 right-2">
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            MANQUANT
          </div>
        </div>
      )}

      {equipment.condition === 'poor' && (
        <div className="absolute top-2 right-2">
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            ÉTAT
          </div>
        </div>
      )}

      {/* Overlay de sélection */}
      {isSelected && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-xl pointer-events-none" />
      )}
    </div>
  );
};

export default EquipmentCard;
