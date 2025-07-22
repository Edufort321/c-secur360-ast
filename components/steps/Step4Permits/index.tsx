// components/steps/Step4Permits/index.tsx - CORRECTION PROGRESSIVE ÉTAPE 1

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Grid3X3, List, Download, Settings, Bell, Eye, Edit3, Copy, Trash2,
  FileText, Users, Clock, MapPin, Zap, RefreshCw, ChevronDown, X, AlertTriangle, CheckCircle,
  XCircle, Shield, Wrench, Activity, Home, Flame, Construction, Building, Zap as ZapIcon
} from 'lucide-react';

// =================== IMPORTS HOOKS CORRIGÉS ===================
import { 
  usePermitData,
  usePermitValidation,
  useSurveillance,
  useNotifications,
  type LegalPermit as HookLegalPermit,
  type PermitType,
  type ProvinceCode
} from './hooks/usePermits';

// =================== TYPES DÉFINIS LOCALEMENT ===================
// Interfaces bilingues de base
export interface BilingualText {
  fr: string;
  en: string;
}

// Status enum - compatible avec le hook
export type PermitStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'active' | 'completed' | 'cancelled' | 'suspended';

// Types de permis adaptés au hook
export type PermitTypeEnum = 'confined_space' | 'hot_work' | 'excavation' | 'lifting' | 'height_work' | 'electrical';

// Interface LegalPermit compatible avec le hook
export interface LegalPermit {
  // Propriétés du hook (héritées)
  id: string;
  name: string;
  category: string;
  authority: string;
  province: ProvinceCode[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  selected: boolean;
  formData: any;
  code: string;
  status: PermitStatus;
  dateCreated: string;
  dateModified: string;
  legalRequirements: {
    permitRequired: boolean;
    atmosphericTesting: boolean;
    entryProcedure: boolean;
    emergencyPlan: boolean;
    equipmentCheck: boolean;
    attendantRequired: boolean;
    documentation: boolean;
  };
  validity: {
    startDate: string;
    endDate: string;
    isValid: boolean;
  };
  compliance: Record<string, boolean>;
  
  // Propriétés supplémentaires pour notre interface
  type: PermitTypeEnum;
  dateCreation: Date;
  dateExpiration: Date;
  location: string;
  site: string;
  secteur: string;
  description: BilingualText;
  entrants?: any[];
  superviseur?: string;
  progress: number;
  tags: string[];
  attachments: any[];
  lastModified: Date;
  modifiedBy: string;
  
  // Données de validation optionnelles
  atmosphericData?: any[];
  equipmentData?: any[];
  personnelData?: any[];
  procedureData?: any[];
  
  // Résultats validation optionnels
  validationResults?: {
    atmospheric?: any;
    equipment?: any;
    personnel?: any;
    procedures?: any;
    regulatory?: any;
    overall?: any;
  };
}

// Props du composant
export interface Step4PermitsProps {
  language: 'fr' | 'en';
  province: ProvinceCode;
  userRole: string;
  touchOptimized?: boolean;
  compactMode?: boolean;
  onPermitChange?: (permits: LegalPermit[]) => void;
  initialPermits?: LegalPermit[];
  permissions?: UserPermissions;
}

export interface UserPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canValidate: boolean;
  canSupervise: boolean;
  canAudit: boolean;
}

// =================== CONFIGURATION TYPES PERMIS ===================
const PERMIT_TYPES_CONFIG = {
  'confined_space': {
    icon: Home,
    iconEmoji: '🏠',
    title: { fr: 'Espace clos', en: 'Confined space' },
    color: '#DC2626',
    description: { fr: 'Espaces confinés avec risques atmosphériques', en: 'Confined spaces with atmospheric hazards' },
    estimatedTime: 45,
  },
  'hot_work': {
    icon: Flame,
    iconEmoji: '🔥',
    title: { fr: 'Travail à chaud', en: 'Hot work' },
    color: '#EA580C',
    description: { fr: 'Soudage, coupage, travaux générateurs étincelles', en: 'Welding, cutting, spark-generating work' },
    estimatedTime: 30,
  },
  'excavation': {
    icon: Construction,
    iconEmoji: '🏗️',
    title: { fr: 'Excavation', en: 'Excavation' },
    color: '#D97706',
    description: { fr: 'Travaux excavation et tranchées', en: 'Excavation and trenching work' },
    estimatedTime: 35,
  },
  'lifting': {
    icon: Construction,
    iconEmoji: '🏗️',
    title: { fr: 'Levage', en: 'Lifting' },
    color: '#059669',
    description: { fr: 'Opérations de levage et grutage', en: 'Lifting and crane operations' },
    estimatedTime: 40,
  },
  'height_work': {
    icon: Building,
    iconEmoji: '🏢',
    title: { fr: 'Travail en hauteur', en: 'Height work' },
    color: '#7C3AED',
    description: { fr: 'Travaux en hauteur >3m', en: 'Work at height >3m' },
    estimatedTime: 50,
  },
  'electrical': {
    icon: ZapIcon,
    iconEmoji: '⚡',
    title: { fr: 'Travaux électriques', en: 'Electrical work' },
    color: '#DC2626',
    description: { fr: 'Travaux sur installations électriques', en: 'Electrical installation work' },
    estimatedTime: 55,
  }
} as const;

// =================== COMPOSANTS TEMPORAIRES ===================
// Composant PermitCard temporaire
const PermitCard: React.FC<{
  permit: LegalPermit;
  language: 'fr' | 'en';
  touchOptimized?: boolean;
  compactMode?: boolean;
  onView: (permit: LegalPermit) => void;
  onEdit: (permit: LegalPermit) => void;
  onDuplicate: (permit: LegalPermit) => void;
  onDelete: (permit: LegalPermit) => void;
  onValidate: (permit: LegalPermit) => void;
  showValidationStatus?: boolean;
}> = ({ permit, language, onView, onEdit, onDelete, onValidate }) => {
  const config = PERMIT_TYPES_CONFIG[permit.type as keyof typeof PERMIT_TYPES_CONFIG];
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config?.iconEmoji || '📋'}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{permit.name}</h3>
            <p className="text-sm text-gray-600">{permit.description[language]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onValidate(permit)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
            title={language === 'fr' ? 'Valider' : 'Validate'}
          >
            <CheckCircle size={16} />
          </button>
          <button
            onClick={() => onEdit(permit)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
            title={language === 'fr' ? 'Éditer' : 'Edit'}
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(permit)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            title={language === 'fr' ? 'Supprimer' : 'Delete'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">{language === 'fr' ? 'Statut:' : 'Status:'}</span>
          <StatusBadge status={permit.status} />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{language === 'fr' ? 'Priorité:' : 'Priority:'}</span>
          <PriorityBadge priority={permit.priority} />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{language === 'fr' ? 'Progression:' : 'Progress:'}</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full transition-all" 
                style={{ width: `${permit.progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{permit.progress}%</span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{language === 'fr' ? 'Expire:' : 'Expires:'}</span>
          <span className={permit.dateExpiration < new Date() ? 'text-red-600 font-medium' : 'text-gray-600'}>
            {permit.dateExpiration.toLocaleDateString()}
          </span>
        </div>
        {permit.location && (
          <div className="flex justify-between">
            <span className="text-gray-600">{language === 'fr' ? 'Lieu:' : 'Location:'}</span>
            <span className="text-xs text-gray-500 text-right max-w-[150px] truncate">{permit.location}</span>
          </div>
        )}
        {permit.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {permit.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
            {permit.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                +{permit.tags.length - 3}
              </span>
            )}
          </div>
        )}
        {permit.validationResults?.overall && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-gray-600 text-xs">{language === 'fr' ? 'Validation:' : 'Validation:'}</span>
            <div className="flex items-center gap-1">
              {permit.validationResults.overall.isValid ? (
                <CheckCircle size={14} className="text-green-500" />
              ) : (
                <XCircle size={14} className="text-red-500" />
              )}
              <span className={`text-xs ${permit.validationResults.overall.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {permit.validationResults.overall.score || 0}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant StatusBadge temporaire - compatible avec tous les statuts
const StatusBadge: React.FC<{ status: PermitStatus }> = ({ status }) => {
  const statusConfig = {
    draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Approuvé', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800' },
    expired: { label: 'Expiré', color: 'bg-red-100 text-red-800' },
    active: { label: 'Actif', color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Terminé', color: 'bg-purple-100 text-purple-800' },
    cancelled: { label: 'Annulé', color: 'bg-gray-100 text-gray-800' },
    suspended: { label: 'Suspendu', color: 'bg-orange-100 text-orange-800' }
  };

  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// Composants temporaires pour éviter les erreurs
const ToastNotification = ({ notification, onClose }: any) => (
  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
    <div className="flex justify-between items-start">
      <p className="text-sm text-gray-900">{notification.message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>
    </div>
  </div>
);

const ConfirmDialog = ({ show, title, message, onConfirm, onCancel, language }: any) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {language === 'fr' ? 'Confirmer' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
  );
};

// =================== DONNÉES D'EXEMPLE ===================
const generateSamplePermits = (language: 'fr' | 'en', province: ProvinceCode): LegalPermit[] => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return [
    {
      id: `sample_confined_space_${Date.now()}`,
      name: language === 'fr' ? 'Inspection canalisation principale' : 'Main pipeline inspection',
      category: 'Espace Clos',
      authority: province === 'QC' ? 'CNESST' : 'OHS',
      province: [province],
      priority: 'high',
      selected: false,
      formData: {},
      code: 'EC-001-2025',
      status: 'pending',
      dateCreated: now.toISOString(),
      dateModified: now.toISOString(),
      legalRequirements: {
        permitRequired: true,
        atmosphericTesting: true,
        entryProcedure: true,
        emergencyPlan: true,
        equipmentCheck: true,
        attendantRequired: true,
        documentation: true
      },
      validity: {
        startDate: now.toISOString(),
        endDate: tomorrow.toISOString(),
        isValid: false
      },
      compliance: { [province.toLowerCase()]: false },
      type: 'confined_space',
      dateCreation: now,
      dateExpiration: tomorrow,
      location: language === 'fr' ? 'Sous-sol technique Bâtiment A' : 'Technical basement Building A',
      site: language === 'fr' ? 'Site industriel Montréal' : 'Montreal industrial site',
      secteur: language === 'fr' ? 'Maintenance' : 'Maintenance',
      description: createBilingualText(
        'Inspection et nettoyage de la canalisation principale du système de ventilation',
        'Inspection and cleaning of main ventilation system pipeline'
      ),
      progress: 25,
      tags: ['urgent', 'maintenance', 'ventilation'],
      attachments: [],
      lastModified: now,
      modifiedBy: 'Jean Supervisor',
      entrants: [
        { name: 'Marc Technicien', role: 'Entrant principal', certifications: ['Espace clos niveau 2'] }
      ],
      superviseur: 'Jean Supervisor',
      atmosphericData: [
        { timestamp: now.toISOString(), oxygen: 20.8, co: 5, h2s: 0, lel: 0, status: 'safe' }
      ]
    },
    {
      id: `sample_hot_work_${Date.now() + 1}`,
      name: language === 'fr' ? 'Soudage réparation tuyauterie' : 'Pipeline repair welding',
      category: 'Travail à Chaud',
      authority: province === 'QC' ? 'CNESST' : 'OHS',
      province: [province],
      priority: 'critical',
      selected: false,
      formData: {},
      code: 'TC-002-2025',
      status: 'approved',
      dateCreated: now.toISOString(),
      dateModified: now.toISOString(),
      legalRequirements: {
        permitRequired: true,
        atmosphericTesting: true,
        entryProcedure: false,
        emergencyPlan: true,
        equipmentCheck: true,
        attendantRequired: true,
        documentation: true
      },
      validity: {
        startDate: now.toISOString(),
        endDate: nextWeek.toISOString(),
        isValid: true
      },
      compliance: { [province.toLowerCase()]: true },
      type: 'hot_work',
      dateCreation: now,
      dateExpiration: nextWeek,
      location: language === 'fr' ? 'Atelier de fabrication - Zone 3' : 'Manufacturing workshop - Zone 3',
      site: language === 'fr' ? 'Usine Laval' : 'Laval plant',
      secteur: language === 'fr' ? 'Production' : 'Production',
      description: createBilingualText(
        'Réparation par soudage de la tuyauterie haute pression du système hydraulique',
        'Welding repair of high-pressure hydraulic system piping'
      ),
      progress: 75,
      tags: ['soudage', 'réparation', 'hydraulique'],
      attachments: [],
      lastModified: now,
      modifiedBy: 'Marie Ingénieur',
      superviseur: 'Pierre Soudeur',
      validationResults: {
        overall: { isValid: true, score: 92 },
        equipment: { isValid: true, issues: [] },
        personnel: { isValid: true, issues: [] }
      }
    },
    {
      id: `sample_excavation_${Date.now() + 2}`,
      name: language === 'fr' ? 'Excavation fondations nouveau bâtiment' : 'New building foundation excavation',
      category: 'Excavation',
      authority: province === 'QC' ? 'CNESST' : 'OHS',
      province: [province],
      priority: 'medium',
      selected: false,
      formData: {},
      code: 'EX-003-2025',
      status: 'draft',
      dateCreated: now.toISOString(),
      dateModified: now.toISOString(),
      legalRequirements: {
        permitRequired: true,
        atmosphericTesting: false,
        entryProcedure: true,
        emergencyPlan: true,
        equipmentCheck: true,
        attendantRequired: false,
        documentation: true
      },
      validity: {
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isValid: false
      },
      compliance: { [province.toLowerCase()]: false },
      type: 'excavation',
      dateCreation: now,
      dateExpiration: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      location: language === 'fr' ? 'Terrain vacant Lot 15' : 'Vacant lot 15',
      site: language === 'fr' ? 'Complexe résidentiel Brossard' : 'Brossard residential complex',
      secteur: language === 'fr' ? 'Construction' : 'Construction',
      description: createBilingualText(
        'Excavation pour fondations du nouveau bâtiment résidentiel de 12 étages',
        'Excavation for foundations of new 12-story residential building'
      ),
      progress: 10,
      tags: ['construction', 'fondations', 'résidentiel'],
      attachments: [],
      lastModified: now,
      modifiedBy: 'Carlos Contremaître'
    },
    {
      id: `sample_height_work_${Date.now() + 3}`,
      name: language === 'fr' ? 'Maintenance éoliennes Parc A' : 'Wind turbine maintenance Park A',
      category: 'Travail en Hauteur',
      authority: province === 'QC' ? 'CNESST' : 'OHS',
      province: [province],
      priority: 'high',
      selected: false,
      formData: {},
      code: 'TH-004-2025',
      status: 'active',
      dateCreated: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      dateModified: now.toISOString(),
      legalRequirements: {
        permitRequired: true,
        atmosphericTesting: false,
        entryProcedure: false,
        emergencyPlan: true,
        equipmentCheck: true,
        attendantRequired: false,
        documentation: true
      },
      validity: {
        startDate: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        isValid: true
      },
      compliance: { [province.toLowerCase()]: true },
      type: 'height_work',
      dateCreation: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      dateExpiration: new Date(now.getTime() + 6 * 60 * 60 * 1000),
      location: language === 'fr' ? 'Parc éolien - Éoliennes 7 à 12' : 'Wind farm - Turbines 7 to 12',
      site: language === 'fr' ? 'Parc éolien Gaspésie' : 'Gaspésie wind farm',
      secteur: language === 'fr' ? 'Énergie renouvelable' : 'Renewable energy',
      description: createBilingualText(
        'Maintenance préventive des systèmes électriques et mécaniques des éoliennes',
        'Preventive maintenance of wind turbine electrical and mechanical systems'
      ),
      progress: 60,
      tags: ['éolien', 'hauteur', 'maintenance', 'électrique'],
      attachments: [],
      lastModified: now,
      modifiedBy: 'Sophie Technicienne',
      superviseur: 'André Spécialiste Hauteur',
      validationResults: {
        overall: { isValid: true, score: 88 },
        equipment: { isValid: true, issues: [] },
        personnel: { isValid: true, issues: [] },
        procedures: { isValid: true, issues: [] }
      }
    }
  ];
};

// =================== UTILITAIRES ===================
const createBilingualText = (fr: string, en: string): BilingualText => ({ fr, en });
const convertPermitType = (hookType: PermitType): PermitTypeEnum => {
  const typeMapping: Record<PermitType, PermitTypeEnum> = {
    'espace-clos': 'confined_space',
    'travail-chaud': 'hot_work',
    'excavation': 'excavation',
    'levage': 'lifting',
    'hauteur': 'height_work',
    'isolation-energetique': 'electrical',
    'pression': 'excavation',
    'radiographie': 'electrical',
    'toiture': 'height_work',
    'demolition': 'excavation'
  };
  return typeMapping[hookType] || 'confined_space';
};

// Fonction pour convertir un permis du hook vers l'interface locale
const convertHookPermitToLocal = (hookPermit: HookLegalPermit): LegalPermit => {
  return {
    // Propriétés du hook (copiées directement)
    ...hookPermit,
    
    // Propriétés converties
    type: convertPermitType('espace-clos'), // Par défaut
    dateCreation: new Date(hookPermit.dateCreated),
    dateExpiration: new Date(hookPermit.validity.endDate),
    location: '',
    site: '',
    secteur: '',
    progress: 0,
    tags: [],
    attachments: [],
    lastModified: new Date(hookPermit.dateModified),
    modifiedBy: 'Système',
    description: createBilingualText(hookPermit.description, hookPermit.description)
  };
};

// =================== COMPOSANT PRINCIPAL ===================
export const Step4Permits: React.FC<Step4PermitsProps> = ({
  language,
  province,
  userRole,
  touchOptimized = true,
  compactMode = false,
  onPermitChange,
  initialPermits = [],
  permissions = {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: false,
    canValidate: true,
    canSupervise: false,
    canAudit: false
  }
}) => {
  // =================== HOOKS ===================
  const {
    permits: hookPermits,
    loading: dataLoading,
    error: dataError,
    addPermit: addHookPermit,
    updatePermit: updateHookPermit,
    deletePermit: deleteHookPermit,
    setPermits: setHookPermits
  } = usePermitData(initialPermits, onPermitChange);

  const {
    validatePermit,
    validationResults,
    isValidating: validationLoading,
    setValidationResults
  } = usePermitValidation();

  const {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  } = useNotifications();

  const {
    isActive: surveillanceActive,
    timeRemaining,
    status: surveillanceStatus,
    startSurveillance,
    stopSurveillance,
    extendTime
  } = useSurveillance();

  // =================== ÉTAT LOCAL ===================
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'validate' | 'surveillance'>('list');
  const [selectedPermit, setSelectedPermit] = useState<LegalPermit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: '', message: '', onConfirm: () => {} });

  // =================== CONVERSION DES PERMIS ===================
  const permits = useMemo(() => {
    // Si pas de permis du hook, créer des exemples
    if (hookPermits.length === 0) {
      return generateSamplePermits(language, province);
    }
    return hookPermits.map(convertHookPermitToLocal);
  }, [hookPermits, language, province]);

  // =================== UTILITAIRES ===================
  const showToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    addNotification({
      id: `notification_${Date.now()}`,
      type,
      message,
      timestamp: new Date(),
      autoClose: true,
      duration: type === 'error' ? 5000 : 3000
    });
  }, [addNotification]);

  // =================== HANDLERS ===================
  const handleCreatePermit = useCallback((type: PermitTypeEnum) => {
    if (!permissions.canCreate) {
      showToast('error', language === 'fr' ? 'Permission refusée' : 'Permission denied');
      return;
    }

    const newPermit: LegalPermit = {
      id: `permit_${Date.now()}`,
      name: `${PERMIT_TYPES_CONFIG[type].title[language]} - ${new Date().toLocaleDateString()}`,
      type,
      status: 'draft',
      dateCreation: new Date(),
      dateExpiration: new Date(Date.now() + 8 * 60 * 60 * 1000),
      location: '',
      site: '',
      secteur: '',
      description: createBilingualText(
        PERMIT_TYPES_CONFIG[type].description.fr,
        PERMIT_TYPES_CONFIG[type].description.en
      ),
      priority: 'medium',
      progress: 0,
      tags: [],
      attachments: [],
      lastModified: new Date(),
      modifiedBy: userRole,
      
      // Propriétés du hook
      category: 'Général',
      authority: province === 'QC' ? 'CNESST' : 'OHS',
      province: [province],
      selected: false,
      formData: {},
      code: `${type.toUpperCase()}-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      legalRequirements: {
        permitRequired: true,
        atmosphericTesting: type === 'confined_space',
        entryProcedure: type === 'confined_space',
        emergencyPlan: true,
        equipmentCheck: true,
        attendantRequired: type === 'confined_space',
        documentation: true
      },
      validity: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        isValid: false
      },
      compliance: {
        [province.toLowerCase()]: true
      }
    };

    addHookPermit(newPermit);
    setSelectedPermit(newPermit);
    setCurrentView('create');
    setShowCreateMenu(false);
    showToast('success', language === 'fr' ? 'Permis créé' : 'Permit created');
  }, [permissions.canCreate, showToast, language, userRole, province, addHookPermit]);

  const handleEditPermit = useCallback((permit: LegalPermit) => {
    if (!permissions.canEdit) {
      showToast('error', language === 'fr' ? 'Permission refusée' : 'Permission denied');
      return;
    }
    setSelectedPermit(permit);
    setCurrentView('edit');
  }, [permissions.canEdit, showToast, language]);

  const handleValidatePermit = useCallback(async (permit: LegalPermit) => {
    if (!permissions.canValidate) {
      showToast('error', language === 'fr' ? 'Permission refusée' : 'Permission denied');
      return;
    }
    
    setSelectedPermit(permit);
    setCurrentView('validate');
    
    try {
      await validatePermit(permit);
      showToast('success', language === 'fr' ? 'Validation terminée' : 'Validation completed');
    } catch (error) {
      showToast('error', language === 'fr' ? 'Erreur de validation' : 'Validation error');
    }
  }, [permissions.canValidate, showToast, language, validatePermit]);

  const handleDeletePermit = useCallback((permit: LegalPermit) => {
    if (!permissions.canDelete) {
      showToast('error', language === 'fr' ? 'Permission refusée' : 'Permission denied');
      return;
    }

    setConfirmDialog({
      show: true,
      title: language === 'fr' ? 'Supprimer le permis' : 'Delete permit',
      message: language === 'fr' ? 
        `Êtes-vous sûr de vouloir supprimer le permis "${permit.name}" ?` :
        `Are you sure you want to delete permit "${permit.name}"?`,
      onConfirm: () => {
        deleteHookPermit(permit.id);
        showToast('success', language === 'fr' ? 'Permis supprimé' : 'Permit deleted');
        setConfirmDialog(prev => ({ ...prev, show: false }));
      }
    });
  }, [permissions.canDelete, showToast, language, deleteHookPermit]);

  const duplicatePermit = useCallback((permit: LegalPermit) => {
    const duplicated: LegalPermit = {
      ...permit,
      id: `permit_${Date.now()}`,
      name: `${permit.name} (Copie)`,
      dateCreation: new Date(),
      status: 'draft',
      progress: 0,
      lastModified: new Date()
    };
    addHookPermit(duplicated);
    showToast('success', language === 'fr' ? 'Permis dupliqué' : 'Permit duplicated');
  }, [addHookPermit, showToast, language]);

  // =================== COMPUTED VALUES ===================
  const filteredPermits = useMemo(() => {
    let filtered = [...permits];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(permit => 
        permit.name.toLowerCase().includes(query) ||
        permit.location.toLowerCase().includes(query) ||
        permit.description[language].toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [permits, searchQuery, language]);

  const summaryStats = useMemo(() => {
    const statusSummary = permits.reduce((acc, permit) => {
      acc[permit.status] = (acc[permit.status] || 0) + 1;
      return acc;
    }, {} as Record<PermitStatus, number>);

    return {
      total: permits.length,
      status: statusSummary,
      validation: { valid: 0, invalid: 0, pending: permits.length },
    };
  }, [permits]);

  // =================== RENDU ===================
  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        {/* VUE LISTE */}
        {currentView === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header avec stats et boutons */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
              <div className="px-4 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {language === 'fr' ? 'Permis de travail' : 'Work permits'}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{summaryStats.total} {language === 'fr' ? 'permis total' : 'total permits'}</span>
                      <span className="text-green-600">✓ {summaryStats.validation.valid} valides</span>
                      <span className="text-yellow-600">⏳ {summaryStats.validation.pending} en attente</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentView('surveillance')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 min-h-[44px]"
                    >
                      <Clock size={20} />
                      <span className="hidden sm:inline">{language === 'fr' ? 'Surveillance' : 'Monitoring'}</span>
                    </button>
                  </div>
                </div>

                {/* Barre de recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                    className="w-full pl-10 pr-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Liste des permis */}
            <div className="p-4">
              {filteredPermits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPermits.map(permit => (
                    <PermitCard
                      key={permit.id}
                      permit={permit}
                      language={language}
                      touchOptimized={touchOptimized}
                      compactMode={compactMode}
                      onView={handleValidatePermit}
                      onEdit={handleEditPermit}
                      onDuplicate={duplicatePermit}
                      onDelete={handleDeletePermit}
                      onValidate={handleValidatePermit}
                      showValidationStatus={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {language === 'fr' ? 'Aucun permis trouvé' : 'No permits found'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {language === 'fr' ? 'Créez votre premier permis' : 'Create your first permit'}
                  </p>
                </div>
              )}
            </div>

            {/* Bouton création flottant */}
            <motion.div
              className="fixed bottom-6 right-6 z-50"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <div className="relative">
                <button
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <Plus size={24} />
                </button>

                <AnimatePresence>
                  {showCreateMenu && (
                    <motion.div
                      className="absolute bottom-16 right-0 bg-white rounded-xl shadow-xl border p-2 min-w-[300px]"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    >
                      <h3 className="text-sm font-medium text-gray-900 px-3 py-2 border-b">
                        {language === 'fr' ? 'Créer un permis' : 'Create permit'}
                      </h3>
                      <div className="py-2">
                        {Object.entries(PERMIT_TYPES_CONFIG).map(([type, config]) => (
                          <button
                            key={type}
                            onClick={() => handleCreatePermit(type as PermitTypeEnum)}
                            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 text-left"
                          >
                            <span className="text-2xl">{config.iconEmoji}</span>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{config.title[language]}</div>
                              <div className="text-xs text-gray-500">~{config.estimatedTime}min</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* VUE VALIDATION (temporaire) */}
        {currentView === 'validate' && (
          <motion.div key="validate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'fr' ? 'Validation permis' : 'Permit validation'}
                </h2>
                <button
                  onClick={() => setCurrentView('list')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <X size={20} />
                  <span>{language === 'fr' ? 'Fermer' : 'Close'}</span>
                </button>
              </div>
              
              {selectedPermit && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{selectedPermit.name}</h3>
                  <p className="text-gray-600">{selectedPermit.description[language]}</p>
                  
                  {validationLoading && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <LoadingSpinner size="sm" />
                      <span>{language === 'fr' ? 'Validation en cours...' : 'Validating...'}</span>
                    </div>
                  )}
                  
                  {validationResults && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800">
                        {language === 'fr' ? 
                          `Validation terminée avec succès (Score: ${validationResults.overall.score}%)` :
                          `Validation completed successfully (Score: ${validationResults.overall.score}%)`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* VUE SURVEILLANCE (temporaire) */}
        {currentView === 'surveillance' && (
          <motion.div key="surveillance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'fr' ? 'Surveillance temps réel' : 'Real-time monitoring'}
                </h2>
                <button
                  onClick={() => setCurrentView('list')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <X size={20} />
                  <span>{language === 'fr' ? 'Fermer' : 'Close'}</span>
                </button>
              </div>
              
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'fr' ? 'Aucun permis en surveillance' : 'No permits under monitoring'}
                </h3>
                <p className="text-gray-600">
                  {language === 'fr' ? 'Ajoutez des permis actifs pour commencer' : 'Add active permits to start monitoring'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification: any) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      {/* Dialog de confirmation */}
      <ConfirmDialog
        show={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, show: false }))}
        language={language}
      />

      {/* Loading global */}
      {dataLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};

export default Step4Permits;
