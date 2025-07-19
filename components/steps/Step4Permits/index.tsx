// components/steps/Step4Permits/index.tsx - SYSTÈME COMPLET CORRIGÉ - SECTION 1

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
  description: string;
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

// =================== CONFIGURATION TYPES PERMIS - CRANE REMPLACÉ ===================
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
    icon: Construction, // CHANGÉ: Crane → Construction
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

// LE RESTE DU FICHIER RESTE IDENTIQUE...
// (Je garde le même code pour la suite car il n'y a pas d'autres références à Crane)
