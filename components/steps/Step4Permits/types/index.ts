// =================== COMPONENTS/STEPS/STEP4PERMITS/TYPES/INDEX.TS ===================
// Index centralisé pour tous les types du système de permis de travail
"use client";

// =================== EXPORTS ATMOSPHERIC ===================
export type {
  // Types de base
  GasType,
  MeasurementUnit,
  AlarmLevel,
  TestStatus,
  
  // Interfaces principales
  AtmosphericReading,
  AtmosphericLimits,
  AtmosphericTest,
  AtmosphericAlert,
  AtmosphericTrend,
  
  // Types utilitaires
  GasProperties,
  CalibrationRecord,
  AtmosphericReport
} from './atmospheric';

// =================== EXPORTS FORMS ===================
export type {
  // Types principaux
  PermitFormData,
  PermitType,
  AtmosphericData,
  
  // Personnel spécialisé
  SurveillantIncendie,
  SurveillantExterieur,
  PersonneCompetente,
  OperateurGrue,
  ElectricienQualifie,
  InspecteurRadiation,
  
  // Équipements
  EquipementProtection,
  EquipementDetection,
  EquipementSauvetage,
  EquipementCommunication,
  
  // Procédures spécialisées
  ProceduresTravailChaud,
  ProceduresExcavation,
  ProceduresEspaceClos,
  ProceduresLevage,
  ProceduresHauteur,
  ProceduresLOTO,
  ProceduresRadiographie,
  ProceduresDemolition,
  
  // Tests spécialisés
  TestsStructurels,
  TestsElectriques,
  TestsRadiation,
  TestsQualiteSol,
  
  // UX et interface
  IncidentSurveillance,
  PermitSearchCriteria,
  PermitCreationOptions,
  PermitTypeOption,
  PermitActionContext,
  PermitSearchResult,
  
  // Validation
  FormValidationError,
  FormValidationResult
} from './forms';

// =================== EXPORTS PERMITS (À CRÉER) ===================
export type {
  // Types de base permis
  PermitStatus,
  PermitPriority,
  ApprovalWorkflow,
  
  // Permis légal complet
  LegalPermit,
  PermitApproval,
  PermitSignature,
  PermitAuditTrail,
  
  // Personnel de base
  Entrant,
  Surveillant,
  Superviseur,
  
  // Workflow et approbation
  WorkflowStep,
  ApprovalChain,
  EscalationRule,
  
  // Historique et archivage
  PermitHistory,
  PermitArchive,
  PermitCompliance
} from './permits';

// =================== EXPORTS PERSONNEL (À CRÉER) ===================
export type {
  // Types de base personnel
  PersonnelRole,
  CertificationLevel,
  CertificationStatus,
  
  // Interfaces personnel
  Personnel,
  Certification,
  Training,
  MedicalClearance,
  
  // Compétences et qualifications
  Competency,
  Qualification,
  SkillMatrix,
  
  // Formation et développement
  TrainingRecord,
  TrainingRequirement,
  TrainingPlan,
  
  // Évaluation et performance
  PersonnelEvaluation,
  PerformanceMetrics,
  IncidentHistory
} from './personnel';

// =================== EXPORTS PROCEDURES (À CRÉER) ===================
export type {
  // Types de base procédures
  ProcedureType,
  ProcedureStatus,
  ProcedureComplexity,
  
  // Procédures standardisées
  StandardProcedure,
  ProcedureStep,
  ProcedureCheckpoint,
  
  // Instructions et guidance
  WorkInstruction,
  SafetyGuideline,
  EmergencyProcedure,
  
  // Conformité et audit
  ProcedureCompliance,
  ProcedureAudit,
  ComplianceReport,
  
  // Révision et amélioration
  ProcedureRevision,
  ProcedureUpdate,
  ChangeRequest
} from './procedures';

// =================== EXPORTS REGULATIONS (À CRÉER) ===================
export type {
  // Types réglementaires
  RegulatoryStandard,
  ComplianceRequirement,
  JurisdictionCode,
  
  // Standards et normes
  SafetyStandard,
  IndustryStandard,
  InternationalStandard,
  
  // Conformité provinciale
  ProvincialRegulation,
  RegulationReference,
  ComplianceMatrix,
  
  // Audit et inspection
  RegulatoryAudit,
  ComplianceInspection,
  ViolationRecord,
  
  // Mise à jour réglementaire
  RegulatoryUpdate,
  StandardRevision,
  ComplianceAlert
} from './regulations';

// =================== EXPORTS SIGNATURES (À CRÉER) ===================
export type {
  // Types signatures électroniques
  SignatureType,
  SignatureStatus,
  SignatureMethod,
  
  // Signature électronique
  ElectronicSignature,
  SignatureMetadata,
  SignatureValidation,
  
  // Biométrie et sécurité
  BiometricData,
  SecurityContext,
  AuthenticationFactor,
  
  // Audit et intégrité
  SignatureAudit,
  IntegrityHash,
  TamperEvidence,
  
  // Légal et conformité
  LegalConsent,
  SignatureCompliance,
  RetentionPolicy
} from './signatures';

// =================== CONSTANTES PARTAGÉES ===================

// Langues supportées
export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Niveaux de priorité système
export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'critical', 'emergency'] as const;
export type PriorityLevel = typeof PRIORITY_LEVELS[number];

// Statuts génériques
export const GENERIC_STATUSES = [
  'draft',
  'pending',
  'in_progress', 
  'under_review',
  'approved',
  'rejected',
  'completed',
  'cancelled',
  'expired',
  'archived'
] as const;
export type GenericStatus = typeof GENERIC_STATUSES[number];

// Niveaux de confiance
export const CONFIDENCE_LEVELS = [
  'very_low',    // 0-20%
  'low',         // 21-40%
  'medium',      // 41-60%
  'high',        // 61-80%
  'very_high'    // 81-100%
] as const;
export type ConfidenceLevel = typeof CONFIDENCE_LEVELS[number];

// Types d'événements système
export const EVENT_TYPES = [
  'created',
  'modified',
  'deleted',
  'approved',
  'rejected',
  'submitted',
  'expired',
  'escalated',
  'completed',
  'cancelled'
] as const;
export type EventType = typeof EVENT_TYPES[number];

// =================== INTERFACES SYSTÈME PARTAGÉES ===================

// Interface générique horodatage
export interface Timestamped {
  createdAt: number;                    // Timestamp création
  updatedAt: number;                    // Timestamp dernière modification
  createdBy: string;                    // ID utilisateur créateur
  updatedBy?: string;                   // ID utilisateur modificateur
}

// Interface générique métadonnées
export interface BaseMetadata {
  id: string;                          // Identifiant unique
  version: number;                     // Version document
  language: SupportedLanguage;         // Langue du contenu
  tags?: string[];                     // Tags catégorisation
  notes?: string;                      // Notes additionnelles
}

// Interface générique localisation
export interface Localized<T> {
  fr: T;                              // Version française
  en: T;                              // Version anglaise
}

// Interface générique audit trail
export interface AuditEntry {
  id: string;                         // ID entrée audit
  timestamp: number;                  // Moment événement
  userId: string;                     // Utilisateur concerné
  userRole: string;                   // Rôle utilisateur
  eventType: EventType;               // Type événement
  entityType: string;                 // Type entité affectée
  entityId: string;                   // ID entité affectée
  changes?: Record<string, any>;      // Changements effectués
  metadata?: Record<string, any>;     // Métadonnées additionnelles
  ipAddress?: string;                 // Adresse IP
  userAgent?: string;                 // User agent
  sessionId?: string;                 // ID session
}

// Interface générique validation
export interface ValidationRule {
  id: string;                         // ID règle
  field: string;                      // Champ concerné
  type: 'required' | 'format' | 'range' | 'custom';
  condition: any;                     // Condition validation
  message: Localized<string>;         // Message erreur bilingue
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;                   // Règle active
}

// Interface générique recherche
export interface SearchFilter {
  field: string;                      // Champ recherche
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;                         // Valeur recherche
  caseSensitive?: boolean;            // Sensible à la casse
}

// Interface générique pagination
export interface PaginationParams {
  page: number;                       // Numéro page (1-based)
  limit: number;                      // Éléments par page
  sortBy?: string;                    // Champ tri
  sortOrder?: 'asc' | 'desc';        // Ordre tri
}

// Interface générique réponse paginée
export interface PaginatedResponse<T> {
  data: T[];                          // Données page
  pagination: {
    page: number;                     // Page actuelle
    limit: number;                    // Limite par page
    total: number;                    // Total éléments
    totalPages: number;               // Total pages
    hasNext: boolean;                 // Page suivante existe
    hasPrev: boolean;                 // Page précédente existe
  };
  metadata?: {
    searchQuery?: string;             // Requête recherche
    filters?: SearchFilter[];         // Filtres appliqués
    executionTime?: number;           // Temps exécution (ms)
  };
}

// Interface générique notification
export interface SystemNotification {
  id: string;                         // ID notification
  type: 'info' | 'success' | 'warning' | 'error';
  title: Localized<string>;           // Titre bilingue
  message: Localized<string>;         // Message bilingue
  timestamp: number;                  // Moment création
  userId?: string;                    // Utilisateur destinataire
  read: boolean;                      // Lu/non lu
  actionRequired?: boolean;           // Action requise
  actions?: Array<{                   // Actions possibles
    id: string;
    label: Localized<string>;
    type: 'primary' | 'secondary' | 'danger';
    handler: string;                  // Nom fonction handler
  }>;
  expiresAt?: number;                // Expiration
  priority: PriorityLevel;           // Priorité
}

// Interface générique configuration
export interface SystemConfig {
  id: string;                         // ID configuration
  category: string;                   // Catégorie config
  key: string;                        // Clé configuration
  value: any;                         // Valeur
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description: Localized<string>;     // Description bilingue
  required: boolean;                  // Obligatoire
  editable: boolean;                  // Modifiable
  validation?: ValidationRule[];      // Règles validation
  defaultValue?: any;                 // Valeur par défaut
  environmentOverride?: boolean;      // Override par env
}

// =================== TYPES UTILITAIRES ===================

// Type pour extraire clés d'une interface
export type KeysOf<T> = keyof T;

// Type pour rendre optionnel
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Type pour rendre requis
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Type pour texte bilingue
export type BilingualText = Localized<string>;

// Type pour valeurs numériques avec unité
export interface NumericValue {
  value: number;                      // Valeur numérique
  unit: string;                       // Unité mesure
  precision?: number;                 // Précision décimales
  range?: {                          // Plage valide
    min: number;
    max: number;
  };
}

// Type pour coordonnées géographiques
export interface GeoCoordinates {
  latitude: number;                   // Latitude
  longitude: number;                  // Longitude
  altitude?: number;                  // Altitude (m)
  accuracy?: number;                  // Précision (m)
  timestamp?: number;                 // Moment mesure
}

// Type pour durée temporelle
export interface Duration {
  value: number;                      // Valeur
  unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  display?: Localized<string>;        // Affichage formaté
}

// Type pour contact d'urgence
export interface EmergencyContact {
  id: string;                         // ID contact
  name: Localized<string>;            // Nom bilingue
  role: Localized<string>;            // Rôle bilingue
  phone: string;                      // Téléphone principal
  alternatePhone?: string;            // Téléphone alternatif
  email?: string;                     // Email
  address?: Localized<string>;        // Adresse bilingue
  available24h: boolean;              // Disponible 24h
  jurisdiction?: string;              // Juridiction couverte
  services: Localized<string[]>;      // Services offerts
  priority: number;                   // Ordre priorité (1=premier)
}

// =================== EXPORTS FINAUX ===================

export type {
  // Interfaces système
  Timestamped,
  BaseMetadata,
  Localized,
  AuditEntry,
  ValidationRule,
  SearchFilter,
  PaginationParams,
  PaginatedResponse,
  SystemNotification,
  SystemConfig,
  
  // Types utilitaires
  SupportedLanguage,
  PriorityLevel,
  GenericStatus,
  ConfidenceLevel,
  EventType,
  BilingualText,
  NumericValue,
  GeoCoordinates,
  Duration,
  EmergencyContact,
  
  // Types helpers
  KeysOf,
  Optional,
  Required
};

// Export constantes
export {
  SUPPORTED_LANGUAGES,
  PRIORITY_LEVELS,
  GENERIC_STATUSES,
  CONFIDENCE_LEVELS,
  EVENT_TYPES
};
