// components/steps/Step4Permits/index.tsx - SYSTÈME COMPLET AVEC VALIDATEURS INTÉGRÉS

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Download,
  Settings,
  Bell,
  Eye,
  Edit3,
  Copy,
  Trash2,
  FileText,
  Users,
  Clock,
  MapPin,
  Zap,
  RefreshCw,
  ChevronDown,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Wrench,
  Activity
} from 'lucide-react';

// =================== IMPORTS TYPES ===================
import {
  PermitData,
  PermitValidationResult,
  AtmosphericData,
  EquipmentData,
  PersonnelData,
  ProcedureData,
  ValidationSummary,
  PermitStatus,
  BilingualText
} from './types';

// =================== IMPORTS VALIDATEURS ===================
import { validateAtmosphericReading, validateAtmosphericReadings } from './utils/validators/atmospheric';
import { validateEquipment, validateEquipmentSet } from './utils/validators/equipment';
import { validatePersonnel, validatePersonnelTeam } from './utils/validators/personnel';
import { validateProcedure, validateProcedureSet } from './utils/validators/procedures';

// =================== IMPORTS RÉGLEMENTATIONS ===================
import { getRegulationConfig } from './utils/regulations';

// =================== IMPORTS COMPOSANTS ===================
import PermitCard from './components/PermitCard';
import StatusBadge from './components/StatusBadge';
import TimerSurveillance from './components/TimerSurveillance';

// Panneaux de validation
import { AtmosphericMonitoringPanel } from './components/AtmosphericMonitoringPanel';
import { EquipmentValidationPanel } from './components/EquipmentValidationPanel';
import { PersonnelValidationPanel } from './components/PersonnelValidationPanel';
import { ProcedureValidationPanel } from './components/ProcedureValidationPanel';
import { ValidationSummaryPanel } from './components/ValidationSummaryPanel';
import { PermitGenerationPanel } from './components/PermitGenerationPanel';

// Formulaires spécialisés
import ConfinedSpaceForm from './components/forms/ConfinedSpaceForm';
import HotWorkForm from './components/forms/HotWorkForm';
import ExcavationForm from './components/forms/ExcavationForm';
import LiftingForm from './components/forms/LiftingForm';
import HeightWorkForm from './components/forms/HeightWorkForm';
import ElectricalForm from './components/forms/ElectricalForm';

// =================== TYPES PRINCIPAUX ===================
export type PermitType = 
  | 'espace-clos' 
  | 'travail-chaud' 
  | 'excavation' 
  | 'levage' 
  | 'hauteur' 
  | 'electrique';

export type ViewMode = 'grid' | 'list' | 'timeline';
export type SortField = 'dateCreation' | 'dateExpiration' | 'name' | 'type' | 'status' | 'priority';
export type SortDirection = 'asc' | 'desc';
export type ValidationTab = 'atmospheric' | 'equipment' | 'personnel' | 'procedures' | 'summary';

export interface LegalPermit extends PermitData {
  id: string;
  name: string;
  type: PermitType;
  status: PermitStatus;
  dateCreation: Date;
  dateExpiration: Date;
  location: string;
  site: string;
  secteur: string;
  description: string;
  entrants?: PersonnelData[];
  superviseur?: string;
  formData?: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number; // 0-100
  tags: string[];
  attachments: string[];
  lastModified: Date;
  modifiedBy: string;
  
  // Données validation
  atmosphericData?: AtmosphericData[];
  equipmentData?: EquipmentData[];
  personnelData?: PersonnelData[];
  procedureData?: ProcedureData[];
  
  // Résultats validation
  validationResults?: {
    atmospheric?: any;
    equipment?: any;
    personnel?: any;
    procedures?: any;
    overall?: PermitValidationResult;
  };
}

export interface FilterConfig {
  types: PermitType[];
  statuses: PermitStatus[];
  dateRange: { start: Date | null; end: Date | null };
  sites: string[];
  personnel: string[];
  searchQuery: string;
  validationStatus: ('valid' | 'invalid' | 'pending')[];
}

export interface Step4PermitsProps {
  language: 'fr' | 'en';
  province: 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
  userRole: string;
  touchOptimized?: boolean;
  compactMode?: boolean;
  onPermitChange?: (permits: LegalPermit[]) => void;
  initialPermits?: LegalPermit[];
}

// =================== CONFIGURATION TYPES PERMIS ===================
const PERMIT_TYPES_CONFIG = {
  'espace-clos': {
    icon: '🏠',
    title: { fr: 'Espace clos', en: 'Confined space' },
    color: '#DC2626',
    description: { fr: 'Espaces confinés avec risques atmosphériques', en: 'Confined spaces with atmospheric hazards' },
    component: ConfinedSpaceForm,
    estimatedTime: 45,
    requiredValidations: ['atmospheric', 'equipment', 'personnel', 'procedures'],
    requiredCertifications: ['espace-clos-superviseur', 'premiers-secours']
  },
  'travail-chaud': {
    icon: '🔥',
    title: { fr: 'Travail à chaud', en: 'Hot work' },
    color: '#EA580C',
    description: { fr: 'Soudage, coupage, travaux générateurs étincelles', en: 'Welding, cutting, spark-generating work' },
    component: HotWorkForm,
    estimatedTime: 30,
    requiredValidations: ['atmospheric', 'equipment', 'personnel', 'procedures'],
    requiredCertifications: ['travail-chaud', 'surveillance-incendie']
  },
  'excavation': {
    icon: '🏗️',
    title: { fr: 'Excavation', en: 'Excavation' },
    color: '#D97706',
    description: { fr: 'Travaux excavation et tranchées', en: 'Excavation and trenching work' },
    component: ExcavationForm,
    estimatedTime: 35,
    requiredValidations: ['atmospheric', 'equipment', 'personnel', 'procedures'],
    requiredCertifications: ['excavation-superviseur', 'services-publics']
  },
  'levage': {
    icon: '🏗️',
    title: { fr: 'Levage', en: 'Lifting' },
    color: '#059669',
    description: { fr: 'Opérations de levage et grutage', en: 'Lifting and crane operations' },
    component: LiftingForm,
    estimatedTime: 40,
    requiredValidations: ['equipment', 'personnel', 'procedures'],
    requiredCertifications: ['grutier-certifie', 'signaleur']
  },
  'hauteur': {
    icon: '🏢',
    title: { fr: 'Travail en hauteur', en: 'Height work' },
    color: '#7C3AED',
    description: { fr: 'Travaux en hauteur >3m', en: 'Work at height >3m' },
    component: HeightWorkForm,
    estimatedTime: 50,
    requiredValidations: ['equipment', 'personnel', 'procedures'],
    requiredCertifications: ['travail-hauteur', 'protection-chute']
  },
  'electrique': {
    icon: '⚡',
    title: { fr: 'Travaux électriques', en: 'Electrical work' },
    color: '#DC2626',
    description: { fr: 'Travaux sur installations électriques', en: 'Electrical installation work' },
    component: ElectricalForm,
    estimatedTime: 55,
    requiredValidations: ['equipment', 'personnel', 'procedures'],
    requiredCertifications: ['electricien-certifie', 'loto-electrique']
  }
} as const;

// =================== COMPOSANT PRINCIPAL ===================
export const Step4Permits: React.FC<Step4PermitsProps> = ({
  language,
  province,
  userRole,
  touchOptimized = true,
  compactMode = false,
  onPermitChange,
  initialPermits = []
}) => {
  // =================== STATE MANAGEMENT ===================
  const [permits, setPermits] = useState<LegalPermit[]>(initialPermits);
  const [selectedPermit, setSelectedPermit] = useState<LegalPermit | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'validate' | 'surveillance'>('list');
  const [selectedPermitType, setSelectedPermitType] = useState<PermitType>('espace-clos');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('dateCreation');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterConfig>({
    types: [],
    statuses: [],
    dateRange: { start: null, end: null },
    sites: [],
    personnel: [],
    searchQuery: '',
    validationStatus: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [surveillancePermits, setSurveillancePermits] = useState<LegalPermit[]>([]);
  const [activeValidationTab, setActiveValidationTab] = useState<ValidationTab>('atmospheric');
  const [validationInProgress, setValidationInProgress] = useState(false);

  // =================== FONCTIONS VALIDATION ===================
  const validatePermitData = useCallback(async (permit: LegalPermit): Promise<PermitValidationResult> => {
    setValidationInProgress(true);
    
    try {
      const regulationConfig = getRegulationConfig(province);
      const results: any = {};

      // Validation atmosphérique
      if (permit.atmosphericData && permit.atmosphericData.length > 0) {
        if (permit.atmosphericData.length === 1) {
          results.atmospheric = validateAtmosphericReading(permit.atmosphericData[0]);
        } else {
          results.atmospheric = validateAtmosphericReadings(permit.atmosphericData);
        }
      }

      // Validation équipement
      if (permit.equipmentData && permit.equipmentData.length > 0) {
        if (permit.equipmentData.length === 1) {
          results.equipment = validateEquipment(permit.equipmentData[0]);
        } else {
          results.equipment = validateEquipmentSet(permit.equipmentData);
        }
      }

      // Validation personnel
      if (permit.personnelData && permit.personnelData.length > 0) {
        if (permit.personnelData.length === 1) {
          results.personnel = validatePersonnel(permit.personnelData[0]);
        } else {
          results.personnel = validatePersonnelTeam(permit.personnelData);
        }
      }

      // Validation procédures
      if (permit.procedureData && permit.procedureData.length > 0) {
        if (permit.procedureData.length === 1) {
          results.procedures = validateProcedure(permit.procedureData[0]);
        } else {
          results.procedures = validateProcedureSet(permit.procedureData);
        }
      }

      // Validation globale
      const overallValid = Object.values(results).every((result: any) => result?.isValid === true);
      const criticalIssues = Object.values(results).flatMap((result: any) => result?.criticalIssues || []);
      const allErrors = Object.values(results).flatMap((result: any) => result?.errors || []);
      const allWarnings = Object.values(results).flatMap((result: any) => result?.warnings || []);

      const overallResult: PermitValidationResult = {
        isValid: overallValid,
        errors: allErrors,
        warnings: allWarnings,
        criticalIssues,
        suggestions: Object.values(results).flatMap((result: any) => result?.suggestions || []),
        confidence: Object.values(results).reduce((sum: number, result: any) => 
          sum + (result?.confidence || 0), 0) / Object.keys(results).length || 0
      };

      // Mise à jour du permis avec résultats
      const updatedPermit = {
        ...permit,
        validationResults: {
          ...results,
          overall: overallResult
        }
      };

      setPermits(prev => prev.map(p => p.id === permit.id ? updatedPermit : p));

      return overallResult;
    } catch (error) {
      console.error('Erreur validation permis:', error);
      throw error;
    } finally {
      setValidationInProgress(false);
    }
  }, [province]);

  const validateAllPermits = useCallback(async () => {
    setIsLoading(true);
    try {
      for (const permit of permits) {
        await validatePermitData(permit);
      }
    } catch (error) {
      console.error('Erreur validation tous permis:', error);
    } finally {
      setIsLoading(false);
    }
  }, [permits, validatePermitData]);

  // =================== COMPUTED VALUES ===================
  const filteredPermits = useMemo(() => {
    let filtered = [...permits];

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(permit => 
        permit.name.toLowerCase().includes(query) ||
        permit.location.toLowerCase().includes(query) ||
        permit.site.toLowerCase().includes(query) ||
        permit.secteur.toLowerCase().includes(query) ||
        permit.description.toLowerCase().includes(query)
      );
    }

    // Filtrage par filtres
    if (filters.types.length > 0) {
      filtered = filtered.filter(permit => filters.types.includes(permit.type));
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter(permit => filters.statuses.includes(permit.status));
    }

    if (filters.validationStatus.length > 0) {
      filtered = filtered.filter(permit => {
        const validationStatus = permit.validationResults?.overall?.isValid === true ? 'valid' :
                               permit.validationResults?.overall?.isValid === false ? 'invalid' : 'pending';
        return filters.validationStatus.includes(validationStatus);
      });
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(permit => permit.dateCreation >= filters.dateRange.start!);
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(permit => permit.dateCreation <= filters.dateRange.end!);
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'dateCreation':
          comparison = a.dateCreation.getTime() - b.dateCreation.getTime();
          break;
        case 'dateExpiration':
          comparison = a.dateExpiration.getTime() - b.dateExpiration.getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'priority':
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [permits, searchQuery, filters, sortField, sortDirection]);

  const statusSummary = useMemo(() => {
    const summary = permits.reduce((acc, permit) => {
      acc[permit.status] = (acc[permit.status] || 0) + 1;
      return acc;
    }, {} as Record<PermitStatus, number>);
    
    return summary;
  }, [permits]);

  const validationSummary = useMemo(() => {
    const summary = permits.reduce((acc, permit) => {
      const validationStatus = permit.validationResults?.overall?.isValid === true ? 'valid' :
                             permit.validationResults?.overall?.isValid === false ? 'invalid' : 'pending';
      acc[validationStatus] = (acc[validationStatus] || 0) + 1;
      return acc;
    }, {} as Record<'valid' | 'invalid' | 'pending', number>);
    
    return summary;
  }, [permits]);

  // =================== ACTIONS CRUD ===================
  const createPermit = useCallback((type: PermitType) => {
    const newPermit: LegalPermit = {
      id: `permit_${Date.now()}`,
      name: `${PERMIT_TYPES_CONFIG[type].title[language]} - ${new Date().toLocaleDateString()}`,
      type,
      status: 'draft',
      dateCreation: new Date(),
      dateExpiration: new Date(Date.now() + 8 * 60 * 60 * 1000), // +8h default
      location: '',
      site: '',
      secteur: '',
      description: '',
      priority: 'medium',
      progress: 0,
      tags: [],
      attachments: [],
      lastModified: new Date(),
      modifiedBy: userRole,
      
      // Données validation par défaut
      atmosphericData: [],
      equipmentData: [],
      personnelData: [],
      procedureData: []
    };

    setSelectedPermit(newPermit);
    setSelectedPermitType(type);
    setCurrentView('create');
  }, [language, userRole]);

  const editPermit = useCallback((permit: LegalPermit) => {
    setSelectedPermit(permit);
    setSelectedPermitType(permit.type);
    setCurrentView('edit');
  }, []);

  const validatePermit = useCallback(async (permit: LegalPermit) => {
    setSelectedPermit(permit);
    setCurrentView('validate');
    await validatePermitData(permit);
  }, [validatePermitData]);

  const duplicatePermit = useCallback((permit: LegalPermit) => {
    const duplicated: LegalPermit = {
      ...permit,
      id: `permit_${Date.now()}`,
      name: `${permit.name} - Copie`,
      dateCreation: new Date(),
      status: 'draft',
      progress: 0,
      lastModified: new Date(),
      modifiedBy: userRole,
      validationResults: undefined // Reset validation
    };

    setPermits(prev => [duplicated, ...prev]);
    onPermitChange?.([duplicated, ...permits]);
  }, [permits, userRole, onPermitChange]);

  const deletePermit = useCallback((permitId: string) => {
    setPermits(prev => prev.filter(p => p.id !== permitId));
    const updatedPermits = permits.filter(p => p.id !== permitId);
    onPermitChange?.(updatedPermits);
  }, [permits, onPermitChange]);

  const savePermit = useCallback(async (permitData: any) => {
    setIsLoading(true);
    
    try {
      const updatedPermit: LegalPermit = {
        ...selectedPermit!,
        ...permitData,
        lastModified: new Date(),
        modifiedBy: userRole,
        status: currentView === 'create' ? 'pending' : selectedPermit!.status,
        progress: calculateProgress(permitData)
      };

      if (currentView === 'create') {
        setPermits(prev => [updatedPermit, ...prev]);
        onPermitChange?.([updatedPermit, ...permits]);
      } else {
        setPermits(prev => prev.map(p => p.id === updatedPermit.id ? updatedPermit : p));
        onPermitChange?.(permits.map(p => p.id === updatedPermit.id ? updatedPermit : p));
      }

      setCurrentView('list');
      setSelectedPermit(null);
    } catch (error) {
      console.error('Erreur sauvegarde permis:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPermit, currentView, userRole, permits, onPermitChange]);

  const calculateProgress = (formData: any): number => {
    const requiredFields = ['identification', 'personnel', 'procedures', 'validation'];
    const completedFields = requiredFields.filter(field => 
      formData[field] && Object.keys(formData[field]).length > 0
    );
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  // =================== HANDLERS ===================
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const handleFilterChange = useCallback((newFilters: Partial<FilterConfig>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      types: [],
      statuses: [],
      dateRange: { start: null, end: null },
      sites: [],
      personnel: [],
      searchQuery: '',
      validationStatus: []
    });
    setSearchQuery('');
  }, []);

  const toggleSurveillance = useCallback((permit: LegalPermit) => {
    setSurveillancePermits(prev => {
      const exists = prev.find(p => p.id === permit.id);
      if (exists) {
        return prev.filter(p => p.id !== permit.id);
      } else {
        return [...prev, permit];
      }
    });
  }, []);

  // =================== RENDU VALIDATION ===================
  const renderValidationPanel = () => {
    if (!selectedPermit) return null;

    const validationResults = selectedPermit.validationResults;
    const requiredValidations = PERMIT_TYPES_CONFIG[selectedPermit.type].requiredValidations;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header validation */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'fr' ? 'Validation permis' : 'Permit validation'}
                </h2>
                <p className="text-sm text-gray-600">{selectedPermit.name}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => validatePermitData(selectedPermit)}
                  disabled={validationInProgress}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
                >
                  {validationInProgress ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                  <span>{language === 'fr' ? 'Valider' : 'Validate'}</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('list')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[44px]"
                >
                  <X size={20} />
                  <span>{language === 'fr' ? 'Fermer' : 'Close'}</span>
                </button>
              </div>
            </div>

            {/* Onglets validation */}
            <div className="flex border-b border-gray-200">
              {requiredValidations.includes('atmospheric') && (
                <button
                  onClick={() => setActiveValidationTab('atmospheric')}
                  className={`px-4 py-2 font-medium border-b-2 ${
                    activeValidationTab === 'atmospheric'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Activity size={20} />
                    <span>{language === 'fr' ? 'Atmosphérique' : 'Atmospheric'}</span>
                    {validationResults?.atmospheric && (
                      validationResults.atmospheric.isValid ? 
                        <CheckCircle size={16} className="text-green-500" /> :
                        <XCircle size={16} className="text-red-500" />
                    )}
                  </div>
                </button>
              )}
              
              {requiredValidations.includes('equipment') && (
                <button
                  onClick={() => setActiveValidationTab('equipment')}
                  className={`px-4 py-2 font-medium border-b-2 ${
                    activeValidationTab === 'equipment'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wrench size={20} />
                    <span>{language === 'fr' ? 'Équipement' : 'Equipment'}</span>
                    {validationResults?.equipment && (
                      validationResults.equipment.isValid ? 
                        <CheckCircle size={16} className="text-green-500" /> :
                        <XCircle size={16} className="text-red-500" />
                    )}
                  </div>
                </button>
              )}
              
              {requiredValidations.includes('personnel') && (
                <button
                  onClick={() => setActiveValidationTab('personnel')}
                  className={`px-4 py-2 font-medium border-b-2 ${
                    activeValidationTab === 'personnel'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users size={20} />
                    <span>{language === 'fr' ? 'Personnel' : 'Personnel'}</span>
                    {validationResults?.personnel && (
                      validationResults.personnel.isValid ? 
                        <CheckCircle size={16} className="text-green-500" /> :
                        <XCircle size={16} className="text-red-500" />
                    )}
                  </div>
                </button>
              )}
              
              {requiredValidations.includes('procedures') && (
                <button
                  onClick={() => setActiveValidationTab('procedures')}
                  className={`px-4 py-2 font-medium border-b-2 ${
                    activeValidationTab === 'procedures'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={20} />
                    <span>{language === 'fr' ? 'Procédures' : 'Procedures'}</span>
                    {validationResults?.procedures && (
                      validationResults.procedures.isValid ? 
                        <CheckCircle size={16} className="text-green-500" /> :
                        <XCircle size={16} className="text-red-500" />
                    )}
                  </div>
                </button>
              )}
              
              <button
                onClick={() => setActiveValidationTab('summary')}
                className={`px-4 py-2 font-medium border-b-2 ${
                  activeValidationTab === 'summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield size={20} />
                  <span>{language === 'fr' ? 'Résumé' : 'Summary'}</span>
                  {validationResults?.overall && (
                    validationResults.overall.isValid ? 
                      <CheckCircle size={16} className="text-green-500" /> :
                      <XCircle size={16} className="text-red-500" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Contenu validation */}
        <div className="p-4">
          {activeValidationTab === 'atmospheric' && (
            <AtmosphericMonitoringPanel
              permit={selectedPermit}
              language={language}
              validationResult={validationResults?.atmospheric}
              onDataUpdate={(data) => {
                const updated = { ...selectedPermit, atmosphericData: data };
                setSelectedPermit(updated);
                setPermits(prev => prev.map(p => p.id === updated.id ? updated : p));
              }}
            />
          )}
          
          {activeValidationTab === 'equipment' && (
            <EquipmentValidationPanel
              permit={selectedPermit}
              language={language}
              validationResult={validationResults?.equipment}
              onDataUpdate={(data) => {
                const updated = { ...selectedPermit, equipmentData: data };
                setSelectedPermit(updated);
                setPermits(prev => prev.map(p => p.id === updated.id ? updated : p));
              }}
            />
          )}
          
          {activeValidationTab === 'personnel' && (
            <PersonnelValidationPanel
              permit={selectedPermit}
              language={language}
              validationResult={validationResults?.personnel}
              onDataUpdate={(data) => {
                const updated = { ...selectedPermit, personnelData: data };
                setSelectedPermit(updated);
                setPermits(prev => prev.map(p => p.id === updated.id ? updated : p));
              }}
            />
          )}
          
          {activeValidationTab === 'procedures' && (
            <ProcedureValidationPanel
              permit={selectedPermit}
              language={language}
              validationResult={validationResults?.procedures}
              onDataUpdate={(data) => {
                const updated = { ...selectedPermit, procedureData: data };
                setSelectedPermit(updated);
                setPermits(prev => prev.map(p => p.id === updated.id ? updated : p));
              }}
            />
          )}
          
          {activeValidationTab === 'summary' && (
            <ValidationSummaryPanel
              permit={selectedPermit}
              language={language}
              validationResult={validationResults?.overall}
              onGeneratePermit={() => {
                // Générer le permis final
              }}
            />
          )}
        </div>
      </div>
    );
  };

  // =================== RENDU FORMULAIRES ===================
  const renderForm = () => {
    if (!selectedPermit) return null;

    const FormComponent = PERMIT_TYPES_CONFIG[selectedPermitType].component;
    
    return (
      <FormComponent
        permitId={selectedPermit.id}
        initialData={selectedPermit.formData}
        language={language}
        province={province}
        userRole={userRole}
        onSave={savePermit}
        onSubmit={savePermit}
        onCancel={() => {
          setCurrentView('list');
          setSelectedPermit(null);
        }}
        touchOptimized={touchOptimized}
      />
    );
  };

  // =================== RENDU HEADER ===================
  const renderHeader = () => (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 py-4">
        {/* Titre et actions principales */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {language === 'fr' ? 'Permis de travail' : 'Work permits'}
            </h2>
            <p className="text-sm text-gray-600">
              {permits.length} {language === 'fr' ? 'permis total' : 'total permits'} • 
              <span className="ml-2 text-green-600">{validationSummary.valid || 0} valides</span> • 
              <span className="ml-2 text-red-600">{validationSummary.invalid || 0} invalides</span> • 
              <span className="ml-2 text-yellow-600">{validationSummary.pending || 0} en attente</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]"
            >
              <Filter size={20} />
              <span className="hidden sm:inline">{language === 'fr' ? 'Filtres' : 'Filters'}</span>
            </button>
            
            <button
              onClick={validateAllPermits}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 min-h-[44px]"
            >
              {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle size={20} />}
              <span className="hidden sm:inline">{language === 'fr' ? 'Valider tout' : 'Validate all'}</span>
            </button>
            
            <button
              onClick={() => setCurrentView('surveillance')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors min-h-[44px]"
            >
              <Clock size={20} />
              <span className="hidden sm:inline">{language === 'fr' ? 'Surveillance' : 'Monitoring'}</span>
              {surveillancePermits.length > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {surveillancePermits.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Barre recherche et contrôles vue */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'fr' ? 'Rechercher permis...' : 'Search permits...'}
              className="w-full pl-10 pr-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <Grid3X3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Status summary */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{language === 'fr' ? 'Status:' : 'Status:'}</span>
            {Object.entries(statusSummary).map(([status, count]) => (
              <div key={status} className="flex items-center gap-1">
                <StatusBadge
                  status={status as PermitStatus}
                  language={language}
                  size="sm"
                  showLabel={false}
                />
                <span className="text-sm text-gray-600">{count}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
            <span className="text-sm font-medium text-gray-700">{language === 'fr' ? 'Validation:' : 'Validation:'}</span>
            <div className="flex items-center gap-1">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm text-gray-600">{validationSummary.valid || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle size={16} className="text-red-500" />
              <span className="text-sm text-gray-600">{validationSummary.invalid || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-yellow-500" />
              <span className="text-sm text-gray-600">{validationSummary.pending || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="bg-gray-50 border-t border-gray-200 px-4 py-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtres types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'fr' ? 'Types de permis' : 'Permit types'}
                </label>
                <div className="space-y-1">
                  {Object.entries(PERMIT_TYPES_CONFIG).map(([type, config]) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type as PermitType)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...filters.types, type as PermitType]
                            : filters.types.filter(t => t !== type);
                          handleFilterChange({ types: newTypes });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{config.title[language]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtres status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'fr' ? 'Status' : 'Status'}
                </label>
                <div className="space-y-1">
                  {['draft', 'pending', 'approved', 'active', 'completed', 'expired'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(status as PermitStatus)}
                        onChange={(e) => {
                          const newStatuses = e.target.checked
                            ? [...filters.statuses, status as PermitStatus]
                            : filters.statuses.filter(s => s !== status);
                          handleFilterChange({ statuses: newStatuses });
                        }}
                        className="mr-2"
                      />
                      <StatusBadge
                        status={status as PermitStatus}
                        language={language}
                        size="sm"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtres validation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'fr' ? 'Status validation' : 'Validation status'}
                </label>
                <div className="space-y-1">
                  {[
                    { key: 'valid', label: { fr: 'Valide', en: 'Valid' }, icon: CheckCircle, color: 'text-green-500' },
                    { key: 'invalid', label: { fr: 'Invalide', en: 'Invalid' }, icon: XCircle, color: 'text-red-500' },
                    { key: 'pending', label: { fr: 'En attente', en: 'Pending' }, icon: Clock, color: 'text-yellow-500' }
                  ].map(({ key, label, icon: Icon, color }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.validationStatus.includes(key as any)}
                        onChange={(e) => {
                          const newStatuses = e.target.checked
                            ? [...filters.validationStatus, key as any]
                            : filters.validationStatus.filter(s => s !== key);
                          handleFilterChange({ validationStatus: newStatuses });
                        }}
                        className="mr-2"
                      />
                      <Icon size={16} className={color} />
                      <span className="text-sm ml-1">{label[language]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions filtres */}
              <div className="flex flex-col justify-end gap-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {language === 'fr' ? 'Effacer filtres' : 'Clear filters'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // =================== RENDU BOUTON CRÉATION ===================
  const renderCreateButton = () => (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <div className="relative group">
        <button
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          onClick={() => {
            // Show permit type selector
          }}
        >
          <Plus size={24} />
        </button>

        {/* Menu types de permis */}
        <AnimatePresence>
          <motion.div
            className="absolute bottom-16 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[300px]"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
          >
            <h3 className="text-sm font-medium text-gray-900 px-3 py-2 border-b border-gray-100">
              {language === 'fr' ? 'Créer un permis' : 'Create permit'}
            </h3>
            <div className="py-2">
              {Object.entries(PERMIT_TYPES_CONFIG).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => createPermit(type as PermitType)}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-2xl">{config.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{config.title[language]}</div>
                    <div className="text-xs text-gray-500">~{config.estimatedTime}min</div>
                    <div className="text-xs text-blue-600">
                      {config.requiredValidations.length} validations requises
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );

  // =================== RENDU PRINCIPAL ===================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation selon vue */}
      <AnimatePresence mode="wait">
        {currentView === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderHeader()}
            
            {/* Liste des permis */}
            <div className="p-4">
              {filteredPermits.length > 0 ? (
                <div className={`
                  ${viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                    : 'space-y-3'
                  }
                `}>
                  {filteredPermits.map(permit => (
                    <PermitCard
                      key={permit.id}
                      permit={permit}
                      language={language}
                      touchOptimized={touchOptimized}
                      compactMode={compactMode}
                      onView={(permit) => validatePermit(permit)}
                      onEdit={editPermit}
                      onDuplicate={duplicatePermit}
                      onDelete={deletePermit}
                      onValidate={validatePermit}
                      enableSwipeActions={touchOptimized}
                      enableHaptics={touchOptimized}
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
                    {language === 'fr' ? 'Créez votre premier permis de travail' : 'Create your first work permit'}
                  </p>
                </div>
              )}
            </div>

            {renderCreateButton()}
          </motion.div>
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderForm()}
          </motion.div>
        )}

        {currentView === 'validate' && (
          <motion.div
            key="validate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderValidationPanel()}
          </motion.div>
        )}

        {currentView === 'surveillance' && (
          <motion.div
            key="surveillance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'fr' ? 'Surveillance temps réel' : 'Real-time monitoring'}
              </h2>
              <button
                onClick={() => setCurrentView('list')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[44px]"
              >
                <X size={20} />
                <span>{language === 'fr' ? 'Fermer' : 'Close'}</span>
              </button>
            </div>

            {surveillancePermits.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {surveillancePermits.map(permit => (
                  <TimerSurveillance
                    key={permit.id}
                    config={{
                      permitId: permit.id,
                      permitType: permit.type,
                      workingTime: 480, // 8 hours
                      warningTime: 60,
                      criticalTime: 15,
                      checkInInterval: 30,
                      autoExtendEnabled: false,
                      autoExtendDuration: 60,
                      emergencyContacts: []
                    }}
                    language={language}
                    isActive={permit.status === 'active'}
                    onTimerExpired={() => {
                      setPermits(prev => prev.map(p => 
                        p.id === permit.id ? { ...p, status: 'expired' } : p
                      ));
                    }}
                    onEmergencyTriggered={() => {
                      // Handle emergency
                    }}
                    onCheckInMissed={() => {
                      // Handle missed check-in
                    }}
                    onAlertGenerated={() => {
                      // Handle alert
                    }}
                    touchOptimized={touchOptimized}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'fr' ? 'Aucun permis en surveillance' : 'No permits under monitoring'}
                </h3>
                <p className="text-gray-600">
                  {language === 'fr' ? 'Sélectionnez des permis à surveiller depuis la liste' : 'Select permits to monitor from the list'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =================== EXPORT DEFAULT ===================
export default Step4Permits;
