// components/steps/Step4Permits/index.tsx - SYSTÈME COMPLET CORRIGÉ

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Grid3X3, List, Download, Settings, Bell, Eye, Edit3, Copy, Trash2,
  FileText, Users, Clock, MapPin, Zap, RefreshCw, ChevronDown, X, AlertTriangle, CheckCircle,
  XCircle, Shield, Wrench, Activity, Home, Flame, Construction, Building, Zap as ZapIcon
} from 'lucide-react';

// =================== IMPORTS TYPES COMPLETS ===================
import {
  // Types de base
  PermitData, PermitValidationResult, AtmosphericData, EquipmentData, PersonnelData, ProcedureData,
  ValidationSummary, PermitStatus, BilingualText, ValidationResult,
  
  // Types atmosphériques
  AtmosphericReading, GasType, AlarmLevel, ValidationWarning, ValidationError, ValidationSuggestion,
  DataQualityMetrics, ValidationWarningType, ValidationErrorType, SuggestionType,
  
  // Types équipement
  EquipmentType, CalibrationStatus, MaintenanceRecord, SafetyRating, EquipmentValidationResult,
  EquipmentStatus, CertificationStatus, MaintenanceStatus, CalibrationValidationStatus,
  SafetyComplianceStatus, EquipmentIssue, EquipmentIssueType,
  
  // Types personnel
  PersonnelRole, CertificationRecord, TrainingRecord, MedicalClearance, EmergencyContact,
  PersonnelValidationResult, PersonnelStatus, QualificationStatus, TrainingStatus, MedicalStatus,
  TeamCompositionStatus, EmergencyReadinessStatus, PersonnelRestriction, MedicalRestriction,
  ExperienceLevel, CompetencyLevel, FitnessLevel, ExperienceBalance,
  
  // Types procédures
  ProcedureType, ProcedureStep, SafetyProtocol, EmergencyProcedure, RiskAssessment, WorkPermit,
  ProcedureValidationResult, ProcedureStatus, SafetyComplianceStatus as ProcSafetyComplianceStatus,
  CompletenessStatus, EmergencyPreparednessStatus, RegulatoryComplianceStatus, RiskManagementStatus,
  ProcedureGap, DocumentationGap, EmergencyProcedureStatus, RiskItem, ControlMeasure
} from './types';

// =================== IMPORTS RÉGLEMENTATIONS ===================
import { 
  getRegulationConfig,
  validateRegulatory,
  generateComplianceReport,
  REGULATION_MAPPING
} from './utils/regulations';

// =================== IMPORTS COMPOSANTS CORRIGÉS ===================

// Composants de validation
import { 
  AtmosphericMonitoringPanel,
  EquipmentValidationPanel,
  PersonnelValidationPanel,
  ProcedureValidationPanel,
  ValidationSummaryPanel,
  PermitGenerationPanel
} from './components/ValidationPanels';

// Composants de base
import { 
  PermitCard,
  StatusBadge,
  TimerSurveillance,
  LoadingSpinner,
  ErrorBoundary,
  ToastNotification,
  ConfirmDialog,
  HelpTooltip
} from './components/base';

// Formulaires spécialisés
import ConfinedSpaceForm from './components/forms/ConfinedSpaceForm';
import HotWorkForm from './components/forms/HotWorkForm';
import ExcavationForm from './components/forms/ExcavationForm';
import LiftingForm from './components/forms/LiftingForm';
import HeightWorkForm from './components/forms/HeightWorkForm';
import ElectricalForm from './components/forms/ElectricalForm';

// Hooks personnalisés
import { 
  usePermitData,
  usePermitValidation,
  useSurveillance,
  useNotifications
} from './hooks/usePermits';

// =================== TYPES PRINCIPAUX ===================
export type PermitTypeEnum = 
  | 'confined_space'
  | 'hot_work' 
  | 'excavation' 
  | 'lifting' 
  | 'height_work' 
  | 'electrical';

export type ViewMode = 'grid' | 'list' | 'timeline' | 'kanban';
export type SortField = 'dateCreation' | 'dateExpiration' | 'name' | 'type' | 'status' | 'priority' | 'validation';
export type SortDirection = 'asc' | 'desc';
export type ValidationTab = 'atmospheric' | 'equipment' | 'personnel' | 'procedures' | 'summary' | 'regulatory';

export interface LegalPermit extends PermitData {
  id: string;
  name: string;
  type: PermitTypeEnum;
  status: PermitStatus;
  dateCreation: Date;
  dateExpiration: Date;
  location: string;
  site: string;
  secteur: string;
  description: BilingualText;
  entrants?: PersonnelData[];
  superviseur?: string;
  formData?: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number; // 0-100
  tags: string[];
  attachments: AttachmentData[];
  lastModified: Date;
  modifiedBy: string;
  
  // Données validation complètes
  atmosphericData?: AtmosphericData[];
  equipmentData?: EquipmentData[];
  personnelData?: PersonnelData[];
  procedureData?: ProcedureData[];
  
  // Résultats validation
  validationResults?: {
    atmospheric?: any;
    equipment?: EquipmentValidationResult;
    personnel?: PersonnelValidationResult;
    procedures?: ProcedureValidationResult;
    regulatory?: ValidationResult;
    overall?: PermitValidationResult;
  };
  
  // Métadonnées
  regulatoryCompliance?: ComplianceData;
  riskAssessment?: RiskAssessmentData;
  approvalWorkflow?: ApprovalWorkflowData;
  auditTrail?: AuditTrailEntry[];
}

export interface AttachmentData {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  category: 'document' | 'image' | 'certificate' | 'procedure' | 'other';
}

export interface ComplianceData {
  jurisdiction: string;
  applicableRegulations: string[];
  complianceStatus: 'compliant' | 'non_compliant' | 'partial' | 'pending';
  lastAssessment: Date;
  nextReview: Date;
  violations: ComplianceViolation[];
}

export interface ComplianceViolation {
  regulation: string;
  section: string;
  description: BilingualText;
  severity: 'minor' | 'major' | 'critical';
  remediation: BilingualText;
  deadline: Date;
}

export interface RiskAssessmentData {
  id: string;
  assessor: string;
  assessmentDate: Date;
  risks: RiskItem[];
  controlMeasures: ControlMeasure[];
  residualRisk: 'low' | 'medium' | 'high' | 'very_high';
  approved: boolean;
  approvedBy?: string;
  approvalDate?: Date;
}

export interface ApprovalWorkflowData {
  steps: ApprovalStep[];
  currentStep: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  finalApprover?: string;
  finalApprovalDate?: Date;
}

export interface ApprovalStep {
  stepNumber: number;
  approver: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  actionDate?: Date;
  required: boolean;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  details: any;
  ipAddress?: string;
}

export interface FilterConfig {
  types: PermitTypeEnum[];
  statuses: PermitStatus[];
  dateRange: { start: Date | null; end: Date | null };
  sites: string[];
  personnel: string[];
  searchQuery: string;
  validationStatus: ('valid' | 'invalid' | 'pending')[];
  priorities: ('low' | 'medium' | 'high' | 'critical')[];
  compliance: ('compliant' | 'non_compliant' | 'partial' | 'pending')[];
}

export interface Step4PermitsProps {
  language: 'fr' | 'en';
  province: 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
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
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    description: { fr: 'Espaces confinés avec risques atmosphériques', en: 'Confined spaces with atmospheric hazards' },
    component: ConfinedSpaceForm,
    estimatedTime: 45,
    requiredValidations: ['atmospheric', 'equipment', 'personnel', 'procedures', 'regulatory'],
    requiredCertifications: ['espace-clos-superviseur', 'premiers-secours'],
    criticalFactors: ['atmospheric_monitoring', 'ventilation', 'emergency_rescue'],
    regulatoryBasis: ['CSA Z1006', 'Provincial OHS']
  },
  'hot_work': {
    icon: Flame,
    iconEmoji: '🔥',
    title: { fr: 'Travail à chaud', en: 'Hot work' },
    color: '#EA580C',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    description: { fr: 'Soudage, coupage, travaux générateurs étincelles', en: 'Welding, cutting, spark-generating work' },
    component: HotWorkForm,
    estimatedTime: 30,
    requiredValidations: ['atmospheric', 'equipment', 'personnel', 'procedures'],
    requiredCertifications: ['travail-chaud', 'surveillance-incendie'],
    criticalFactors: ['fire_prevention', 'fire_watch', 'emergency_response'],
    regulatoryBasis: ['Fire Code', 'Provincial OHS']
  },
  'excavation': {
    icon: Construction,
    iconEmoji: '🏗️',
    title: { fr: 'Excavation', en: 'Excavation' },
    color: '#D97706',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    description: { fr: 'Travaux excavation et tranchées', en: 'Excavation and trenching work' },
    component: ExcavationForm,
    estimatedTime: 35,
    requiredValidations: ['atmospheric', 'equipment', 'personnel', 'procedures'],
    requiredCertifications: ['excavation-superviseur', 'services-publics'],
    criticalFactors: ['utility_clearance', 'soil_stability', 'access_egress'],
    regulatoryBasis: ['Provincial OHS', 'Municipal Bylaws']
  },
  'lifting': {
    icon: Construction,
    iconEmoji: '🏗️',
    title: { fr: 'Levage', en: 'Lifting' },
    color: '#059669',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    description: { fr: 'Opérations de levage et grutage', en: 'Lifting and crane operations' },
    component: LiftingForm,
    estimatedTime: 40,
    requiredValidations: ['equipment', 'personnel', 'procedures'],
    requiredCertifications: ['grutier-certifie', 'signaleur'],
    criticalFactors: ['load_calculation', 'ground_conditions', 'weather_limits'],
    regulatoryBasis: ['CSA Standards', 'Provincial OHS']
  },
  'height_work': {
    icon: Building,
    iconEmoji: '🏢',
    title: { fr: 'Travail en hauteur', en: 'Height work' },
    color: '#7C3AED',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    description: { fr: 'Travaux en hauteur >3m', en: 'Work at height >3m' },
    component: HeightWorkForm,
    estimatedTime: 50,
    requiredValidations: ['equipment', 'personnel', 'procedures'],
    requiredCertifications: ['travail-hauteur', 'protection-chute'],
    criticalFactors: ['fall_protection', 'rescue_plan', 'weather_conditions'],
    regulatoryBasis: ['CSA Z259 Series', 'Provincial OHS']
  },
  'electrical': {
    icon: ZapIcon,
    iconEmoji: '⚡',
    title: { fr: 'Travaux électriques', en: 'Electrical work' },
    color: '#DC2626',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    description: { fr: 'Travaux sur installations électriques', en: 'Electrical installation work' },
    component: ElectricalForm,
    estimatedTime: 55,
    requiredValidations: ['equipment', 'personnel', 'procedures'],
    requiredCertifications: ['electricien-certifie', 'loto-electrique'],
    criticalFactors: ['lockout_tagout', 'arc_flash_protection', 'qualified_personnel'],
    regulatoryBasis: ['CSA Z462', 'Electrical Code']
  }
} as const;

// =================== UTILITAIRES BILINGUES ===================
const createBilingualText = (fr: string, en: string): BilingualText => ({ fr, en });

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
  // =================== HOOKS DE BASE ===================
  const {
    permits,
    loading: dataLoading,
    error: dataError,
    addPermit,
    updatePermit,
    deletePermit,
    setPermits
  } = usePermitData(initialPermits, onPermitChange);

  const {
    validatePermit,
    validationResults,
    isValidating: validationLoading,
    setValidationResults
  } = usePermitValidation();

  // =================== HOOKS UTILITAIRES ===================
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
    extendTime,
    setTimeRemaining,
    setStatus
  } = useSurveillance();

  // =================== UTILITAIRES NOTIFICATIONS ===================
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

  const clearNotification = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

  // =================== SURVEILLANCE LOCALE ===================
  const [surveillancePermits, setSurveillancePermits] = useState<LegalPermit[]>([]);
  
  const addToSurveillance = useCallback((permit: LegalPermit) => {
    setSurveillancePermits((prev: LegalPermit[]) => {
      if (prev.find(p => p.id === permit.id)) return prev;
      return [...prev, permit];
    });
    showToast('success', language === 'fr' ? 'Permis ajouté à la surveillance' : 'Permit added to monitoring');
  }, [showToast, language]);

  const removeFromSurveillance = useCallback((permitId: string) => {
    setSurveillancePermits((prev: LegalPermit[]) => prev.filter(p => p.id !== permitId));
    showToast('info', language === 'fr' ? 'Permis retiré de la surveillance' : 'Permit removed from monitoring');
  }, [showToast, language]);

  const updateSurveillanceStatus = useCallback((permitId: string, newStatus: PermitStatus) => {
    setSurveillancePermits((prev: LegalPermit[]) => 
      prev.map(p => p.id === permitId ? { ...p, status: newStatus } : p)
    );
    const updatedPermits = permits.map(p => p.id === permitId ? { ...p, status: newStatus } : p);
    setPermits(updatedPermits);
  }, [setPermits, permits]);

  // =================== UTILITAIRES VALIDATION ===================
  const validateAllPermits = useCallback(async () => {
    if (!permissions.canValidate || permits.length === 0) {
      showToast('error', language === 'fr' ? 'Permission refusée ou aucun permis' : 'Permission denied or no permits');
      return;
    }

    try {
      for (const permit of permits) {
        await validatePermit(permit);
      }
      showToast('success', language === 'fr' ? 'Validation terminée pour tous les permis' : 'Validation completed for all permits');
    } catch (error) {
      showToast('error', language === 'fr' ? 'Erreur de validation' : 'Validation error');
    }
  }, [permits, validatePermit, permissions.canValidate, showToast, language]);

  // =================== UTILITAIRES PERMIS ===================
  const savePermit = useCallback((permit: LegalPermit) => {
    if (permits.find(p => p.id === permit.id)) {
      updatePermit(permit.id, permit);
    } else {
      addPermit(permit);
    }
  }, [permits, addPermit, updatePermit]);

  const duplicatePermit = useCallback((permit: LegalPermit) => {
    const duplicated: LegalPermit = {
      ...permit,
      id: `permit_${Date.now()}`,
      name: `${permit.name} (Copie)`,
      dateCreation: new Date(),
      dateExpiration: new Date(Date.now() + 8 * 60 * 60 * 1000),
      status: 'draft',
      progress: 0,
      lastModified: new Date(),
      modifiedBy: userRole,
      auditTrail: [{
        id: `audit_${Date.now()}`,
        timestamp: new Date(),
        user: userRole,
        action: 'PERMIT_DUPLICATED',
        details: { originalId: permit.id }
      }]
    };
    addPermit(duplicated);
    showToast('success', language === 'fr' ? 'Permis dupliqué' : 'Permit duplicated');
  }, [addPermit, userRole, showToast, language]);

  // =================== STATE MANAGEMENT ===================
  const [selectedPermit, setSelectedPermit] = useState<LegalPermit | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'validate' | 'surveillance' | 'reports'>('list');
  const [selectedPermitType, setSelectedPermitType] = useState<PermitTypeEnum>('confined_space');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('dateCreation');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterConfig>({
    types: [],
    statuses: [],
    dateRange: { start: null, end: null },
    sites: [],
    personnel: [],
    searchQuery: '',
    validationStatus: [],
    priorities: [],
    compliance: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeValidationTab, setActiveValidationTab] = useState<ValidationTab>('atmospheric');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: '', message: '', onConfirm: () => {} });

  // =================== COMPUTED VALUES ===================
  const regulationConfig = useMemo(() => {
    return REGULATION_MAPPING[province] || REGULATION_MAPPING['QC'];
  }, [province]);

  const filteredPermits = useMemo(() => {
    let filtered = [...permits];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(permit => 
        permit.name.toLowerCase().includes(query) ||
        permit.location.toLowerCase().includes(query) ||
        permit.site.toLowerCase().includes(query) ||
        permit.secteur.toLowerCase().includes(query) ||
        permit.description[language].toLowerCase().includes(query) ||
        permit.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    if (filters.types.length > 0) {
      filtered = filtered.filter(permit => filters.types.includes(permit.type));
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter(permit => filters.statuses.includes(permit.status));
    }

    if (filters.priorities.length > 0) {
      filtered = filtered.filter(permit => filters.priorities.includes(permit.priority));
    }

    if (filters.validationStatus.length > 0) {
      filtered = filtered.filter(permit => {
        const validationStatus = permit.validationResults?.overall?.isValid === true ? 'valid' :
                               permit.validationResults?.overall?.isValid === false ? 'invalid' : 'pending';
        return filters.validationStatus.includes(validationStatus);
      });
    }

    if (filters.compliance.length > 0) {
      filtered = filtered.filter(permit => {
        const complianceStatus = permit.regulatoryCompliance?.complianceStatus || 'pending';
        return filters.compliance.includes(complianceStatus);
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
        case 'validation':
          const aValid = a.validationResults?.overall?.isValid === true ? 1 : 0;
          const bValid = b.validationResults?.overall?.isValid === true ? 1 : 0;
          comparison = aValid - bValid;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [permits, searchQuery, filters, sortField, sortDirection, language]);

  const summaryStats = useMemo(() => {
    const statusSummary = permits.reduce((acc, permit) => {
      acc[permit.status] = (acc[permit.status] || 0) + 1;
      return acc;
    }, {} as Record<PermitStatus, number>);

    const validationSummary = permits.reduce((acc, permit) => {
      const validationStatus = permit.validationResults?.overall?.isValid === true ? 'valid' :
                             permit.validationResults?.overall?.isValid === false ? 'invalid' : 'pending';
      acc[validationStatus] = (acc[validationStatus] || 0) + 1;
      return acc;
    }, {} as Record<'valid' | 'invalid' | 'pending', number>);

    const prioritySummary = permits.reduce((acc, permit) => {
      acc[permit.priority] = (acc[permit.priority] || 0) + 1;
      return acc;
    }, {} as Record<'low' | 'medium' | 'high' | 'critical', number>);

    const complianceSummary = permits.reduce((acc, permit) => {
      const status = permit.regulatoryCompliance?.complianceStatus || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<'compliant' | 'non_compliant' | 'partial' | 'pending', number>);

    return {
      total: permits.length,
      status: statusSummary,
      validation: validationSummary,
      priority: prioritySummary,
      compliance: complianceSummary
    };
  }, [permits]);

  // =================== HANDLERS PRINCIPAUX ===================
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
      
      atmosphericData: [],
      equipmentData: [],
      personnelData: [],
      procedureData: [],
      
      regulatoryCompliance: {
        jurisdiction: province,
        applicableRegulations: regulationConfig.applicableRegulations || [],
        complianceStatus: 'pending',
        lastAssessment: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        violations: []
      },
      auditTrail: [{
        id: `audit_${Date.now()}`,
        timestamp: new Date(),
        user: userRole,
        action: 'PERMIT_CREATED',
        details: { type, status: 'draft' }
      }]
    };

    setSelectedPermit(newPermit);
    setSelectedPermitType(type);
    setCurrentView('create');
    setShowCreateMenu(false);
  }, [permissions.canCreate, showToast, language, userRole, province, regulationConfig]);

  const handleEditPermit = useCallback((permit: LegalPermit) => {
    if (!permissions.canEdit) {
      showToast('error', language === 'fr' ? 'Permission refusée' : 'Permission denied');
      return;
    }
    setSelectedPermit(permit);
    setSelectedPermitType(permit.type);
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
        deletePermit(permit.id);
        showToast('success', language === 'fr' ? 'Permis supprimé' : 'Permit deleted');
        setConfirmDialog(prev => ({ ...prev, show: false }));
      }
    });
  }, [permissions.canDelete, showToast, language, deletePermit]);

  // =================== RENDU VALIDATION PANEL ===================
  const renderValidationPanel = useCallback(() => {
    if (!selectedPermit) return null;

    const validationResultsData = selectedPermit.validationResults;
    const requiredValidations = PERMIT_TYPES_CONFIG[selectedPermit.type].requiredValidations;

    return (
      <div className="min-h-screen bg-gray-50">
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
                  onClick={() => validatePermit(selectedPermit)}
                  disabled={validationLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
                >
                  {validationLoading ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle size={20} />}
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

            {/* Onglets de validation */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {requiredValidations.map((validationType: string) => {
                const tabConfig = {
                  atmospheric: { icon: Activity, label: { fr: 'Atmosphérique', en: 'Atmospheric' } },
                  equipment: { icon: Wrench, label: { fr: 'Équipement', en: 'Equipment' } },
                  personnel: { icon: Users, label: { fr: 'Personnel', en: 'Personnel' } },
                  procedures: { icon: FileText, label: { fr: 'Procédures', en: 'Procedures' } },
                  regulatory: { icon: Shield, label: { fr: 'Réglementaire', en: 'Regulatory' } },
                  summary: { icon: FileText, label: { fr: 'Résumé', en: 'Summary' } }
                }[validationType] || { icon: FileText, label: { fr: 'Autre', en: 'Other' } };

                const TabIcon = tabConfig.icon;
                
                return (
                  <button
                    key={validationType}
                    onClick={() => setActiveValidationTab(validationType as ValidationTab)}
                    className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap ${
                      activeValidationTab === validationType
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TabIcon size={20} />
                      <span>{tabConfig.label[language]}</span>
                      {validationResultsData?.[validationType] && (
                        validationResultsData[validationType].isValid ? 
                          <CheckCircle size={16} className="text-green-500" /> :
                          <XCircle size={16} className="text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}
              
              {/* Onglet résumé */}
              <button
                onClick={() => setActiveValidationTab('summary')}
                className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap ${
                  activeValidationTab === 'summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={20} />
                  <span>{language === 'fr' ? 'Résumé' : 'Summary'}</span>
                  {validationResultsData?.overall && (
                    validationResultsData.overall.isValid ? 
                      <CheckCircle size={16} className="text-green-500" /> :
                      <XCircle size={16} className="text-red-500" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Contenu des panneaux de validation */}
        <div className="p-4">
          <ErrorBoundary>
            {activeValidationTab === 'atmospheric' && (
              <AtmosphericMonitoringPanel
                permit={selectedPermit}
                language={language}
                validationResult={validationResultsData?.atmospheric}
                regulationConfig={regulationConfig}
                onDataUpdate={(data: AtmosphericData[]) => {
                  const updated = { 
                    ...selectedPermit, 
                    atmosphericData: data,
                    lastModified: new Date(),
                    modifiedBy: userRole
                  };
                  setSelectedPermit(updated);
                  const updatedPermits = permits.map(p => p.id === updated.id ? updated : p);
                  setPermits(updatedPermits);
                }}
              />
            )}
            
            {activeValidationTab === 'equipment' && (
              <EquipmentValidationPanel
                permit={selectedPermit}
                language={language}
                validationResult={validationResultsData?.equipment}
                regulationConfig={regulationConfig}
                onDataUpdate={(data: EquipmentData[]) => {
                  const updated = { 
                    ...selectedPermit, 
                    equipmentData: data,
                    lastModified: new Date(),
                    modifiedBy: userRole
                  };
                  setSelectedPermit(updated);
                  const updatedPermits = permits.map(p => p.id === updated.id ? updated : p);
                  setPermits(updatedPermits);
                }}
              />
            )}
            
            {activeValidationTab === 'personnel' && (
              <PersonnelValidationPanel
                permit={selectedPermit}
                language={language}
                validationResult={validationResultsData?.personnel}
                regulationConfig={regulationConfig}
                onDataUpdate={(data: PersonnelData[]) => {
                  const updated = { 
                    ...selectedPermit, 
                    personnelData: data,
                    lastModified: new Date(),
                    modifiedBy: userRole
                  };
                  setSelectedPermit(updated);
                  const updatedPermits = permits.map(p => p.id === updated.id ? updated : p);
                  setPermits(updatedPermits);
                }}
              />
            )}
            
            {activeValidationTab === 'procedures' && (
              <ProcedureValidationPanel
                permit={selectedPermit}
                language={language}
                validationResult={validationResultsData?.procedures}
                regulationConfig={regulationConfig}
                onDataUpdate={(data: ProcedureData[]) => {
                  const updated = { 
                    ...selectedPermit, 
                    procedureData: data,
                    lastModified: new Date(),
                    modifiedBy: userRole
                  };
                  setSelectedPermit(updated);
                  const updatedPermits = permits.map(p => p.id === updated.id ? updated : p);
                  setPermits(updatedPermits);
                }}
              />
            )}
            
            {activeValidationTab === 'summary' && (
              <ValidationSummaryPanel
                permit={selectedPermit}
                language={language}
                validationResult={validationResultsData?.overall}
                allValidationResults={validationResultsData}
                regulationConfig={regulationConfig}
                onGeneratePermit={() => {
                  showToast('success', language === 'fr' ? 'Permis généré avec succès' : 'Permit generated successfully');
                }}
              />
            )}
          </ErrorBoundary>
        </div>
      </div>
    );
  }, [selectedPermit, language, validationLoading, validatePermit, activeValidationTab, regulationConfig, userRole, permits, setPermits, showToast]);

  // =================== RENDU PRINCIPAL ===================
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
                      <span className="text-green-600">✓ {summaryStats.validation.valid || 0} valides</span>
                      <span className="text-red-600">✗ {summaryStats.validation.invalid || 0} invalides</span>
                      <span className="text-yellow-600">⏳ {summaryStats.validation.pending || 0} en attente</span>
                    </div>
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
                      onClick={() => validateAllPermits()}
                      disabled={validationLoading || permits.length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 min-h-[44px]"
                    >
                      {validationLoading ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                      <span className="hidden sm:inline">{language === 'fr' ? 'Valider tout' : 'Validate all'}</span>
                    </button>
                    
                    <button
                      onClick={() => setCurrentView('surveillance')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 min-h-[44px]"
                    >
                      <Clock size={20} />
                      <span className="hidden sm:inline">{language === 'fr' ? 'Surveillance' : 'Monitoring'}</span>
                    </button>
                  </div>
                </div>

                {/* Barre de recherche et contrôles de vue */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                      className="w-full pl-10 pr-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                    >
                      <Grid3X3 size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                    >
                      <List size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Liste des permis */}
            <div className="p-4">
              {filteredPermits.length > 0 ? (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}`}>
                  {filteredPermits.map(permit => (
                    <PermitCard
                      key={permit.id}
                      permit={permit}
                      language={language}
                      touchOptimized={touchOptimized}
                      compactMode={compactMode}
                      onView={(permit: LegalPermit) => handleValidatePermit(permit)}
                      onEdit={handleEditPermit}
                      onDuplicate={duplicatePermit}
                      onDelete={handleDeletePermit}
                      onValidate={handleValidatePermit}
                      onAddToSurveillance={addToSurveillance}
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

        {/* VUE VALIDATION */}
        {currentView === 'validate' && (
          <motion.div key="validate" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {renderValidationPanel()}
          </motion.div>
        )}

        {/* VUE SURVEILLANCE */}
        {currentView === 'surveillance' && (
          <motion.div key="surveillance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'fr' ? 'Surveillance temps réel' : 'Real-time monitoring'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const activePermits = permits.filter(p => p.status === 'active');
                    setSurveillancePermits(activePermits);
                    showToast('info', language === 'fr' ? 'Permis actifs ajoutés' : 'Active permits added');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <Plus size={20} />
                  <span>{language === 'fr' ? 'Ajouter actifs' : 'Add active'}</span>
                </button>
                <button
                  onClick={() => setCurrentView('list')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <X size={20} />
                  <span>{language === 'fr' ? 'Fermer' : 'Close'}</span>
                </button>
              </div>
            </div>

            {surveillancePermits.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {surveillancePermits.map(permit => (
                  <div key={permit.id} className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{PERMIT_TYPES_CONFIG[permit.type].iconEmoji}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{permit.name}</h3>
                          <p className="text-sm text-gray-600">{permit.location}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromSurveillance(permit.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{language === 'fr' ? 'Statut:' : 'Status:'}</span>
                        <StatusBadge status={permit.status} language={language} />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{language === 'fr' ? 'Expiration:' : 'Expires:'}</span>
                        <span className={`${permit.dateExpiration < new Date() ? 'text-red-600' : 'text-gray-600'}`}>
                          {permit.dateExpiration.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{language === 'fr' ? 'Progression:' : 'Progress:'}</span>
                        <span>{permit.progress}%</span>
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleValidatePermit(permit)}
                          className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                        >
                          {language === 'fr' ? 'Valider' : 'Validate'}
                        </button>
                        <button
                          onClick={() => updateSurveillanceStatus(permit.id, permit.status === 'active' ? 'paused' : 'active')}
                          className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200"
                        >
                          {permit.status === 'active' ? 
                            (language === 'fr' ? 'Suspendre' : 'Pause') : 
                            (language === 'fr' ? 'Reprendre' : 'Resume')
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'fr' ? 'Aucun permis en surveillance' : 'No permits under monitoring'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'fr' ? 'Ajoutez des permis actifs pour commencer la surveillance' : 'Add active permits to start monitoring'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification: any) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onClose={() => clearNotification(notification.id)}
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

// =================== EXPORT DEFAULT ===================
export default Step4Permits;
