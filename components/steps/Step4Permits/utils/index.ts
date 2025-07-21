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

// Export des helpers principaux
export {
  DataFormatter,
  AtmosphericCalculations,
  getBluetoothManager,
  getOfflineManager,
  
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

// Export des utilitaires de calculs
export {
  PHYSICAL_CONSTANTS,
  GAS_PROPERTIES,
  quickPpmToMgPerM3,
  quickCalculateLEL,
  quickRiskAssessment,
  quickVentilationCalc
} from './helpers/calculations';

// Export des utilitaires offline
export {
  OfflineManager,
  isOfflineModeAvailable,
  quickStoreAtmospheric,
  getConnectionStatus,
  estimateSyncTime,
  checkStorageQuota
} from './helpers/offline';

// Export des types helpers
export type {
  FormattingOptions,
  FormattedValue,
  ColorScale,
  IconMapping,
  UnitConversion,
  OfflineConfig,
  OfflineData,
  OfflineDataType,
  OfflinePriority,
  SyncStatus,
  SyncError,
  ConflictResolution,
  OfflineCapabilities,
  CacheManifest
} from './helpers';

// =================== EXPORTS RÉGLEMENTATIONS ===================

export {
  getRegulationConfig,
  validateRegulatory,
  generateComplianceReport,
  REGULATION_MAPPING
} from './regulations';

export type {
  RegulationConfig,
  ComplianceRequirement,
  ComplianceResult,
  RegulatoryFramework,
  ProvinceCode,
  JurisdictionData
} from './regulations';

// =================== EXPORTS VALIDATIONS ===================

export {
  validateAtmosphericData,
  validateEquipmentData,
  validatePersonnelData,
  validateProcedureData,
  validatePermitCompleteness,
  generateValidationReport,
  
  // Validateurs spécialisés
  validateConfinedSpacePermit,
  validateHotWorkPermit,
  validateExcavationPermit,
  validateLiftingPermit,
  validateHeightWorkPermit,
  validateElectricalPermit
} from './validation';

export type {
  PermitValidationResult,
  AtmosphericValidationResult,
  EquipmentValidationResult,
  PersonnelValidationResult,
  ProcedureValidationResult,
  ValidationSummary,
  DataQualityMetrics
} from './validation';

// =================== EXPORTS TEMPLATES ===================

export {
  getPermitTemplate,
  generatePermitDocument,
  createPermitFromTemplate,
  PERMIT_TEMPLATES,
  
  // Templates spécialisés
  CONFINED_SPACE_TEMPLATE,
  HOT_WORK_TEMPLATE,
  EXCAVATION_TEMPLATE,
  LIFTING_TEMPLATE,
  HEIGHT_WORK_TEMPLATE,
  ELECTRICAL_TEMPLATE
} from './templates';

export type {
  PermitTemplate,
  TemplateSection,
  TemplateField,
  TemplateValidation,
  DocumentFormat,
  GenerationOptions
} from './templates';

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
