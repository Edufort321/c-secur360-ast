// app/types/index.ts

// =================== EXPORTS DES TYPES AST ===================
export type {
  // Types principaux AST
  ASTFormProps,
  ProjectInfo,
  TeamMember,
  SelectedEquipment,
  SelectedHazard,
  ControlMeasureSelection,
  WorkPermit,
  Photo,
  IsolationPoint,
  EmergencyProcedure,
  WeatherData,
  TeamConsultation,
  TeamResponse,
  RiskAssessment,
  ValidationStep,
  ASTDocument,
  ASTRevision,
  
  // Types d'état
  ASTFormState,
  FormValidation,
  
  // Types d'actions
  ASTAction,
  
  // Types utilitaires AST
  ASTStatus,
  RiskLevel,
  Language,
  FormStep
} from './ast';

// =================== EXPORTS DES TYPES CLIENTS ===================
export type {
  // Configuration client
  ClientConfiguration,
  WeatherRestrictions,
  SeasonalRestrictions,
  TimeRestrictions,
  GeographicRestrictions,
  NotificationSettings,
  ApiSettings,
  
  // Données client
  ClientStats,
  ClientContact,
  ClientLocation,
  ClientBranding,
  ClientTarification,
  
  // Données spécialisées
  HydroQuebecData,
  EnergirData,
  TelecomData,
  
  // Services et utilitaires
  ClientRegistry,
  ClientService,
  ClientValidation,
  ClientPermissions,
  
  // Types utilitaires clients
  ClientId,
  ClientIndustry,
  ClientSize,
  ClientRegion
} from './clients';

// =================== EXPORTS DES TYPES WORK TYPES ===================
export type {
  // Types de travaux
  WorkType,
  WeatherLimitations,
  TimeRestrictions as WorkTimeRestrictions,
  LocationRestrictions,
  SpecialProcedures,
  WorkTypeSettings,
  CustomField,
  TeamRole,
  
  // Types spécialisés
  ElectricalWorkType,
  GasWorkType,
  HeightWorkType,
  ConfinedSpaceWorkType,
  
  // Services et utilitaires
  WorkTypeRegistry,
  WorkTypeService,
  WorkTypeValidation,
  WorkTypeTemplate,
  WorkTypeStatistics,
  WorkTypeEvent,
  
  // Types utilitaires
  WorkTypeCategory,
  WorkTypeId,
  WorkTypeComplexity,
  WorkTypeRisk,
  WorkTypeFrequency
} from './workTypes';

// =================== EXPORTS DES TYPES ÉQUIPEMENTS ===================
export type {
  // Équipements de sécurité
  SafetyEquipment,
  ResistanceProperties,
  EquipmentCategory,
  
  // Types spécialisés par catégorie
  HeadProtection,
  EyeProtection,
  RespiratoryProtection,
  HandProtection,
  FootProtection,
  FallProtection,
  DetectionEquipment,
  
  // Gestion d'inventaire
  EquipmentInventory,
  InventoryTracking,
  MaintenanceRecord,
  EquipmentCondition,
  
  // Sélection et utilisation
  EquipmentSelection,
  EquipmentRequirement,
  EquipmentCompatibility,
  
  // Services et utilitaires
  EquipmentService,
  EquipmentValidation,
  EquipmentRegistry,
  EquipmentStatistics,
  
  // Types utilitaires
  EquipmentId,
  EquipmentType,
  InspectionResult
} from './equipment';

// =================== TYPES COMMUNS ET GÉNÉRIQUES ===================

// Types de base pour l'interface utilisateur
export interface UIState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  warnings: string[];
}

// Types pour la navigation
export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  active?: boolean;
  disabled?: boolean;
  children?: NavigationItem[];
}

// Types pour les formulaires
export interface FormField {
  name: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'datetime' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  disabled?: boolean;
  value?: any;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => boolean | string;
  };
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

// Types pour les permissions
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  level: 'read' | 'write' | 'admin';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

// Types pour l'audit et les logs
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Types pour les fichiers et documents
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  data?: string; // Base64
  uploadDate: string;
  uploadedBy: string;
  category?: string;
  tags?: string[];
}

// Types pour l'internationalisation
export interface Translation {
  [key: string]: string | Translation;
}

export interface LocaleConfig {
  code: string;
  name: string;
  flag: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
}

// Types pour la configuration générale
export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    [feature: string]: boolean;
  };
  limits: {
    maxFileSize: number;
    maxTeamSize: number;
    maxPhotos: number;
    sessionTimeout: number;
  };
  integrations: {
    googleMaps?: {
      apiKey: string;
      defaultCenter: { lat: number; lng: number };
    };
    weather?: {
      apiKey: string;
      provider: string;
    };
    email?: {
      provider: string;
      apiKey: string;
    };
  };
}

// =================== TYPES UTILITAIRES GÉNÉRAUX ===================
export type ID = string;
export type Timestamp = string;
export type Email = string;
export type PhoneNumber = string;
export type URL = string;

export type Status = 'active' | 'inactive' | 'pending' | 'suspended';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Severity = 1 | 2 | 3 | 4 | 5;

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Types pour les filtres et recherches
export interface SearchFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

export interface SearchQuery {
  q?: string;
  filters?: SearchFilter[];
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}

// =================== EXPORT PAR DÉFAUT ===================
export default {
  // Version des types
  version: '1.0.0',
  
  // Configuration par défaut
  defaults: {
    language: 'fr' as Language,
    pageSize: 20,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  },
  
  // Constantes
  constants: {
    RISK_LEVELS: ['low', 'medium', 'high', 'critical'] as const,
    LANGUAGES: ['fr', 'en'] as const,
    FORM_STEPS: [1, 2, 3, 4, 5, 6, 7, 8] as const,
  }
};
