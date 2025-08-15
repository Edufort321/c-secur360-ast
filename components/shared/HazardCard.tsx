"use client";

import React from 'react';
import { AlertTriangle, Shield, CheckCircle, X, Plus } from 'lucide-react';

// =================== INTERFACES ===================
interface HazardCardProps {
  hazard: {
    id: string;
    category: 'electrical' | 'mechanical' | 'chemical' | 'physical' | 'ergonomic' | 'environmental';
    description: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    controlMeasures: string[];
    photos: any[];
    legislation: string;
  };
  isSelected?: boolean;
  onSelect?: (hazardId: string) => void;
  onRemove?: (hazardId: string) => void;
  onAddControlMeasure?: (hazardId: string) => void;
  language?: 'fr' | 'en';
  className?: string;
}

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    electrical: 'Électrique',
    mechanical: 'Mécanique',
    chemical: 'Chimique',
    physical: 'Physique',
    ergonomic: 'Ergonomique',
    environmental: 'Environnemental',
    low: 'Faible',
    medium: 'Moyen',
    high: 'Élevé',
    critical: 'Critique',
    controlMeasures: 'Mesures de contrôle',
    addControlMeasure: 'Ajouter mesure',
    legislation: 'Législation',
    photos: 'Photos',
    remove: 'Retirer'
  },
  en: {
    electrical: 'Electrical',
    mechanical: 'Mechanical',
    chemical: 'Chemical',
    physical: 'Physical',
    ergonomic: 'Ergonomic',
    environmental: 'Environmental',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
    controlMeasures: 'Control Measures',
    addControlMeasure: 'Add measure',
    legislation: 'Legislation',
    photos: 'Photos',
    remove: 'Remove'
  }
};

// =================== CONFIGURATION DES COULEURS ===================
const categoryColors = {
  electrical: {
    bg: 'from-yellow-50 to-orange-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  mechanical: {
    bg: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800'
  },
  chemical: {
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    badge: 'bg-green-100 text-green-800'
  },
  physical: {
    bg: 'from-red-50 to-pink-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-800'
  },
  ergonomic: {
    bg: 'from-purple-50 to-violet-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-800'
  },
  environmental: {
    bg: 'from-teal-50 to-cyan-50',
    border: 'border-teal-200',
    icon: 'text-teal-600',
    badge: 'bg-teal-100 text-teal-800'
  }
};

const riskColors = {
  low: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800'
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  high: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-800'
  },
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800'
  }
};

// =================== ICÔNES PAR CATÉGORIE ===================
const categoryIcons = {
  electrical: '⚡',
  mechanical: '⚙️',
  chemical: '🧪',
  physical: '💥',
  ergonomic: '🏃',
  environmental: '🌍'
};

// =================== COMPOSANT PRINCIPAL ===================
const HazardCard: React.FC<HazardCardProps> = ({
  hazard,
  isSelected = false,
  onSelect,
  onRemove,
  onAddControlMeasure,
  language = 'fr',
  className = ''
}) => {
  const t = translations[language];
  const categoryStyle = categoryColors[hazard.category];
  const riskStyle = riskColors[hazard.riskLevel];

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(hazard.id);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(hazard.id);
    }
  };

  const handleAddControlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddControlMeasure) {
      onAddControlMeasure(hazard.id);
    }
  };

  return (
    <div 
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
        bg-gradient-to-br ${categoryStyle.bg}
        ${isSelected ? `${categoryStyle.border} ring-2 ring-blue-500 ring-opacity-50` : `${categoryStyle.border} hover:shadow-md`}
        ${className}
      `}
      onClick={handleCardClick}
    >
      {/* Header avec catégorie et niveau de risque */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`text-2xl ${categoryStyle.icon}`}>
            {categoryIcons[hazard.category]}
          </div>
          <div>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${categoryStyle.badge}`}>
              {t[hazard.category]}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Badge de niveau de risque */}
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${riskStyle.badge}`}>
            {t[hazard.riskLevel]}
          </span>
          
          {/* Indicateur de sélection */}
          {isSelected && (
            <div className="bg-blue-500 rounded-full p-1">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}
          
          {/* Bouton de suppression */}
          {onRemove && (
            <button
              onClick={handleRemoveClick}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title={t.remove}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Description du danger */}
      <div className="mb-3">
        <p className="text-gray-800 text-sm leading-relaxed">
          {hazard.description}
        </p>
      </div>

      {/* Législation */}
      {hazard.legislation && (
        <div className="mb-3">
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Shield className="w-3 h-3" />
            <span className="font-medium">{t.legislation}:</span>
            <span>{hazard.legislation}</span>
          </div>
        </div>
      )}

      {/* Mesures de contrôle */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-gray-700 flex items-center">
            <Shield className="w-3 h-3 mr-1" />
            {t.controlMeasures} ({hazard.controlMeasures.length})
          </h4>
          {onAddControlMeasure && (
            <button
              onClick={handleAddControlClick}
              className="text-blue-500 hover:text-blue-600 transition-colors"
              title={t.addControlMeasure}
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
        
        {hazard.controlMeasures.length > 0 ? (
          <div className="space-y-1">
            {hazard.controlMeasures.slice(0, 3).map((measure, index) => (
              <div 
                key={index}
                className="bg-white/60 px-2 py-1 rounded text-xs text-gray-700 border border-gray-200"
              >
                • {measure}
              </div>
            ))}
            {hazard.controlMeasures.length > 3 && (
              <div className="text-xs text-gray-500 italic">
                +{hazard.controlMeasures.length - 3} autres mesures
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic bg-white/40 px-2 py-1 rounded border border-gray-200">
            Aucune mesure de contrôle définie
          </div>
        )}
      </div>

      {/* Photos */}
      {hazard.photos && hazard.photos.length > 0 && (
        <div className="flex items-center space-x-1 text-xs text-gray-600">
          <div className="w-3 h-3 bg-blue-100 rounded flex items-center justify-center">
            📷
          </div>
          <span>{hazard.photos.length} {t.photos}</span>
        </div>
      )}

      {/* Indicateur de risque critique */}
      {hazard.riskLevel === 'critical' && (
        <div className="absolute top-2 right-2">
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            CRITIQUE
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

export default HazardCard;
