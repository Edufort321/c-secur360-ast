// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/INDEX.TS ===================
// Export centralisé de tous les utilitaires du système de permis
"use client";

// =================== TYPES LOCAUX (REMPLACE L'IMPORT ./types) ===================

export type PermitStatus = 
  | 'draft' 
  | 'pending' 
  | 'review' 
  | 'approved' 
  | 'active' 
  | 'suspended' 
  | 'expired' 
  | 'cancelled' 
  | 'completed';

export interface BilingualText {
  fr: string;
  en: string;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  timestamp: number;
  validatedBy?: string;
}

export interface ValidationError {
  id: string;
  type: ValidationErrorType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: BilingualText;
  field?: string;
  code: string;
  remediation?: BilingualText;
}

export interface ValidationWarning {
  id: string;
  type: ValidationWarningType;
  message: BilingualText;
  field?: string;
  code: string;
  recommendation?: BilingualText;
}

export interface ValidationSuggestion {
  id: string;
  type: SuggestionType;
  message: BilingualText;
  field?: string;
  improvement?: BilingualText;
  priority: 'low' | 'medium' | 'high';
}

export type ValidationErrorType = 
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_FORMAT'
  | 'OUT_OF_RANGE'
  | 'EXPIRED_CERTIFICATION'
  | 'INSUFFICIENT_PERSONNEL'
  | 'REGULATORY_VIOLATION'
  | 'EQUIPMENT_FAILURE'
  | 'SAFETY_VIOLATION';

export type ValidationWarningType = 
  | 'APPROACHING_EXPIRY'
  | 'SUBOPTIMAL_CONDITIONS'
  | 'INCOMPLETE_DATA'
  | 'WEATHER_CONCERN'
  | 'EQUIPMENT_DUE_MAINTENANCE'
  | 'PERSONNEL_TRAINING_DUE';

export type SuggestionType = 
  | 'OPTIMIZATION'
  | 'BEST_PRACTICE'
  | 'EFFICIENCY'
  | 'SAFETY_ENHANCEMENT'
  | 'COMPLIANCE_IMPROVEMENT'
  | 'DOCUMENTATION';

// =================== EXPORTS HELPERS ===================

// Export des helpers principaux (avec gestion des exports manquants)
export {
  DataFormatter,
  AtmosphericCalculations,
  getBluetoothManager,
  
  // Fonctions utilitaires
  quickFormatAtmospheric,
  quickFormatTime,
  quickFormatPercent,
  quickFormatMoney,
  getAlarmColor,
  getGasIcon,
  getAtmosphericClassName,
  formatRange,
  formatBilingualList,
  generateTooltip,
  
  // Constantes
  LOCALE_MAPPINGS,
  CURRENCY_SYMBOLS,
  UNIT_ABBREVIATIONS,
  GAS_COLOR_SCALES,
  ALARM_LEVEL_COLORS,
  PRIORITY_COLORS,
  GAS_ICONS,
  ALARM_ICONS,
  STATUS_ICONS,
  
  // Classes intégrées
  IntegratedAtmosphericHelper,
  IntegratedPermitHelper,
  SystemDiagnosticsHelper,
  
  // Instances globales
  atmosphericHelper,
  permitHelper,
  systemDiagnostics,
  
  // Fonctions système
  initializePermitSystem,
  cleanupPermitSystem,
  exportSystemBackup,
  getSystemStatus,
  
  // Configuration par défaut
  DEFAULT_PERMIT_SYSTEM_CONFIG,
  ERROR_MESSAGES
} from './helpers';

// Export spécifique pour getOfflineManager depuis le bon module
export { getOfflineManager } from './helpers/offline';

// Export des utilitaires de calculs
export {
  PHYSICAL_CONSTANTS,
  GAS_PROPERTIES,
  quickPpmToMgPerM3,
  quickCalculateLEL,
  quickRiskAssessment,
  quickVentilationCalc
} from './helpers/calculations';

// Export des utilitaires offline (avec gestion des exports manquants)
export {
  OfflineManager,
  isOfflineModeAvailable,
  quickStoreAtmospheric,
  getConnectionStatus,
  estimateSyncTime,
  checkStorageQuota
} from './helpers/offline';

// Export des types helpers (avec gestion des exports manquants)
export type {
  FormattingOptions,
  FormattedValue,
  ColorScale,
  IconMapping,
  UnitConversion
} from './helpers';

// Export des types offline depuis le bon module
export type {
  OfflineConfig,
  OfflineData,
  OfflineDataType,
  OfflinePriority,
  SyncStatus,
  SyncError,
  ConflictResolution,
  OfflineCapabilities,
  CacheManifest
} from './helpers/offline';

// =================== EXPORTS RÉGLEMENTATIONS ===================

// Fonctions regulations (si disponibles)
export {
  getRegulationConfig,
  validateRegulatory,
  generateComplianceReport,
  REGULATION_MAPPING
} from './regulations';

// Types regulations de base (définis localement car ./regulations peut ne pas les exporter)
export interface RegulationConfig {
  province: string;
  jurisdiction: string;
  applicableRegulations: string[];
  requirements: Record<string, any>;
  lastUpdated: Date;
}

export interface ComplianceRequirement {
  id: string;
  regulation: string;
  section: string;
  requirement: BilingualText;
  mandatory: boolean;
  applicableTypes: string[];
}

export interface ComplianceResult {
  compliant: boolean;
  violations: Array<{
    requirement: string;
    description: BilingualText;
    severity: 'minor' | 'major' | 'critical';
  }>;
  score: number;
  lastAssessed: Date;
}

export type ProvinceCode = 
  | 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' 
  | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';

// =================== EXPORTS VALIDATIONS ===================

// Fonctions validation (si disponibles, sinon définies comme placeholder)
export const validateAtmosphericData = (data: any) => ({ isValid: true, errors: [], warnings: [] });
export const validateEquipmentData = (data: any) => ({ isValid: true, errors: [], warnings: [] });
export const validatePersonnelData = (data: any) => ({ isValid: true, errors: [], warnings: [] });
export const validateProcedureData = (data: any) => ({ isValid: true, errors: [], warnings: [] });
export const validatePermitCompleteness = (permit: any) => ({ isValid: true, errors: [], warnings: [] });
export const generateValidationReport = (results: any) => ({ summary: 'Validation completed', details: [] });

// Validateurs spécialisés (placeholders)
export const validateConfinedSpacePermit = (permit: any) => ({ isValid: true, errors: [], warnings: [] });
export const validateHotWorkPermit = (permit: any) => ({ isValid: true, errors: [], warnings: [] });
export const validateExcavationPermit = (permit: any) => ({ isValid: true, errors: [], warnings: [] });
export const validateLiftingPermit = (permit: any) => ({ isValid: true, errors: [], warnings: [] });
export const validateHeightWorkPermit = (permit: any) => ({ isValid: true, errors: [], warnings: [] });
export const validateElectricalPermit = (permit: any) => ({ isValid: true, errors: [], warnings: [] });

// Types validation (définis localement)
export interface PermitValidationResult extends ValidationResult {
  permitId: string;
  permitType: string;
  validationSections: {
    atmospheric?: ValidationResult;
    equipment?: ValidationResult;
    personnel?: ValidationResult;
    procedures?: ValidationResult;
    regulatory?: ValidationResult;
  };
  overallScore: number;
  recommendations: string[];
}

export interface AtmosphericValidationResult extends ValidationResult {
  gasReadings: Array<{
    gasType: string;
    value: number;
    unit: string;
    status: 'normal' | 'warning' | 'danger';
  }>;
  ventilationStatus: 'adequate' | 'insufficient' | 'required';
  monitoringRequired: boolean;
}

export interface EquipmentValidationResult extends ValidationResult {
  equipmentList: Array<{
    id: string;
    type: string;
    status: 'operational' | 'maintenance_required' | 'failed';
    lastInspection: Date;
    nextDue: Date;
  }>;
  calibrationStatus: 'current' | 'due' | 'overdue';
  safetyCompliance: boolean;
}

export interface PersonnelValidationResult extends ValidationResult {
  personnelList: Array<{
    id: string;
    name: string;
    role: string;
    qualified: boolean;
    certifications: Array<{
      type: string;
      valid: boolean;
      expiryDate: Date;
    }>;
  }>;
  teamCompliance: boolean;
  supervisionAdequate: boolean;
}

export interface ProcedureValidationResult extends ValidationResult {
  procedures: Array<{
    id: string;
    type: string;
    status: 'complete' | 'incomplete' | 'missing';
    lastUpdated: Date;
  }>;
  safetyProtocols: boolean;
  emergencyProcedures: boolean;
  documentationComplete: boolean;
}

export interface ValidationSummary {
  overallScore: number;
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  criticalIssues: number;
  recommendations: string[];
  nextReviewDate: Date;
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
  overallQuality: number;
}

// =================== EXPORTS TEMPLATES ===================

// Fonctions templates (placeholders si module n'existe pas)
export const getPermitTemplate = (type: string) => ({ sections: [], fields: [] });
export const generatePermitDocument = (permit: any, format: string = 'pdf') => new Blob(['Generated permit'], { type: 'application/pdf' });
export const createPermitFromTemplate = (templateId: string, data: any) => ({ ...data, fromTemplate: templateId });

// Templates constants (définis localement)
export const PERMIT_TEMPLATES = {
  confined_space: { id: 'cs', name: 'Confined Space', sections: [] },
  hot_work: { id: 'hw', name: 'Hot Work', sections: [] },
  excavation: { id: 'ex', name: 'Excavation', sections: [] },
  lifting: { id: 'lf', name: 'Lifting', sections: [] },
  height_work: { id: 'ht', name: 'Height Work', sections: [] },
  electrical: { id: 'el', name: 'Electrical', sections: [] }
};

export const CONFINED_SPACE_TEMPLATE = PERMIT_TEMPLATES.confined_space;
export const HOT_WORK_TEMPLATE = PERMIT_TEMPLATES.hot_work;
export const EXCAVATION_TEMPLATE = PERMIT_TEMPLATES.excavation;
export const LIFTING_TEMPLATE = PERMIT_TEMPLATES.lifting;
export const HEIGHT_WORK_TEMPLATE = PERMIT_TEMPLATES.height_work;
export const ELECTRICAL_TEMPLATE = PERMIT_TEMPLATES.electrical;

// Types templates (définis localement)
export interface PermitTemplate {
  id: string;
  name: BilingualText;
  type: string;
  version: string;
  sections: TemplateSection[];
  validations: TemplateValidation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateSection {
  id: string;
  name: BilingualText;
  description: BilingualText;
  order: number;
  required: boolean;
  fields: TemplateField[];
}

export interface TemplateField {
  id: string;
  name: BilingualText;
  type: 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'boolean' | 'file';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: BilingualText;
  };
  defaultValue?: any;
}

export interface TemplateValidation {
  field: string;
  rule: string;
  message: BilingualText;
  severity: 'error' | 'warning';
}

export type DocumentFormat = 'pdf' | 'word' | 'html' | 'json';

export interface GenerationOptions {
  format: DocumentFormat;
  includeAttachments: boolean;
  includeSignatures: boolean;
  language: 'fr' | 'en';
  template?: string;
}

// =================== UTILITAIRES GÉNÉRAUX ===================

/**
 * Créer un texte bilingue
 */
export const createBilingualText = (fr: string, en: string): BilingualText => ({ fr, en });

/**
 * Obtenir texte selon langue
 */
export const getText = (text: BilingualText, language: 'fr' | 'en'): string => text[language];

/**
 * Générer ID unique
 */
export const generateId = (prefix?: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

/**
 * Formater date selon locale
 */
export const formatDate = (
  date: Date | number,
  language: 'fr' | 'en' = 'fr',
  options?: Intl.DateTimeFormatOptions
): string => {
  const locale = language === 'fr' ? 'fr-CA' : 'en-CA';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options })
    .format(typeof date === 'number' ? new Date(date) : date);
};

/**
 * Formater durée en texte lisible
 */
export const formatDuration = (
  milliseconds: number,
  language: 'fr' | 'en' = 'fr'
): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return language === 'fr' ? `${days}j ${hours % 24}h` : `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return language === 'fr' ? `${hours}h ${minutes % 60}min` : `${hours}h ${minutes % 60}min`;
  } else if (minutes > 0) {
    return language === 'fr' ? `${minutes}min` : `${minutes}min`;
  } else {
    return language === 'fr' ? `${seconds}s` : `${seconds}s`;
  }
};

/**
 * Calculer pourcentage de progression
 */
export const calculateProgress = (
  completed: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Valider email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valider numéro de téléphone canadien
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+1|1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Nettoyer et formater numéro de téléphone
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Calculer temps restant avant expiration
 */
export const getTimeUntilExpiry = (expiryDate: Date): {
  isExpired: boolean;
  isExpiringSoon: boolean;
  timeRemaining: number;
  formattedTime: string;
} => {
  const now = new Date();
  const timeRemaining = expiryDate.getTime() - now.getTime();
  const isExpired = timeRemaining <= 0;
  const isExpiringSoon = timeRemaining <= 60 * 60 * 1000; // 1 heure
  
  const formattedTime = formatDuration(Math.abs(timeRemaining));
  
  return {
    isExpired,
    isExpiringSoon,
    timeRemaining,
    formattedTime
  };
};

/**
 * Obtenir couleur selon statut
 */
export const getStatusColor = (status: PermitStatus): {
  bg: string;
  text: string;
  border: string;
} => {
  const colors = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    review: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    approved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    active: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    suspended: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    expired: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
    completed: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' }
  };
  
  return colors[status] || colors.draft;
};

/**
 * Obtenir priorité couleur
 */
export const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'critical'): {
  bg: string;
  text: string;
  border: string;
} => {
  const colors = {
    low: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
  };
  
  return colors[priority];
};

/**
 * Normaliser chaîne pour recherche
 */
export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer accents
    .replace(/[^a-z0-9\s]/g, '') // Garder seulement alphanumériques et espaces
    .trim();
};

/**
 * Fonction de recherche fuzzy
 */
export const fuzzySearch = (query: string, text: string): boolean => {
  const normalizedQuery = normalizeString(query);
  const normalizedText = normalizeString(text);
  
  if (normalizedQuery.length === 0) return true;
  if (normalizedText.length === 0) return false;
  
  return normalizedText.includes(normalizedQuery);
};

/**
 * Débounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Copier texte dans le presse-papier
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback pour navigateurs plus anciens
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('Erreur copie presse-papier:', error);
    return false;
  }
};

/**
 * Télécharger fichier
 */
export const downloadFile = (data: Blob | string, filename: string, mimeType?: string): void => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType || 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// =================== CONSTANTES SYSTÈME ===================

/**
 * Configuration par défaut système
 */
export const DEFAULT_SYSTEM_CONFIG = {
  language: 'fr' as const,
  province: 'QC' as const,
  timezone: 'America/Toronto',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: '24h',
  currency: 'CAD',
  units: 'metric',
  
  validation: {
    enableRealTime: true,
    strictMode: true,
    autoSave: true,
    maxErrors: 50,
    warningThreshold: 10
  },
  
  ui: {
    touchOptimized: true,
    compactMode: false,
    animations: true,
    sounds: false,
    highContrast: false
  },
  
  notifications: {
    enabled: true,
    maxVisible: 5,
    autoHide: true,
    hideDelay: 5000,
    position: 'top-right' as const
  }
} as const;

/**
 * Messages système par défaut
 */
export const SYSTEM_MESSAGES = {
  loading: {
    fr: 'Chargement en cours...',
    en: 'Loading...'
  },
  saving: {
    fr: 'Sauvegarde en cours...',
    en: 'Saving...'
  },
  saved: {
    fr: 'Sauvegardé avec succès',
    en: 'Saved successfully'
  },
  error: {
    fr: 'Une erreur est survenue',
    en: 'An error occurred'
  },
  confirm_delete: {
    fr: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
    en: 'Are you sure you want to delete this item?'
  },
  unsaved_changes: {
    fr: 'Vous avez des modifications non sauvegardées. Voulez-vous les sauvegarder ?',
    en: 'You have unsaved changes. Do you want to save them?'
  },
  permission_denied: {
    fr: 'Permission refusée',
    en: 'Permission denied'
  },
  network_error: {
    fr: 'Erreur de connexion réseau',
    en: 'Network connection error'
  },
  validation_failed: {
    fr: 'Validation échouée',
    en: 'Validation failed'
  },
  operation_completed: {
    fr: 'Opération terminée avec succès',
    en: 'Operation completed successfully'
  }
} as const;

/**
 * Regex patterns utiles
 */
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone_ca: /^(\+1|1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
  postal_code_ca: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  sin: /^\d{3}[-.\s]?\d{3}[-.\s]?\d{3}$/,
  url: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d{1,2})?$/
} as const;

// =================== EXPORT DEFAULT ===================
export default {
  // Utilitaires principaux
  createBilingualText,
  getText,
  generateId,
  formatDate,
  formatDuration,
  calculateProgress,
  
  // Validation
  isValidEmail,
  isValidPhoneNumber,
  formatPhoneNumber,
  
  // Temps et dates
  getTimeUntilExpiry,
  
  // UI et couleurs
  getStatusColor,
  getPriorityColor,
  
  // Recherche
  normalizeString,
  fuzzySearch,
  
  // Performance
  debounce,
  throttle,
  
  // Système
  copyToClipboard,
  downloadFile,
  
  // Configuration
  DEFAULT_SYSTEM_CONFIG,
  SYSTEM_MESSAGES,
  VALIDATION_PATTERNS
};
