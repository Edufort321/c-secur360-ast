// app/types/index.ts
// =================== TYPES DE BASE ===================

export interface BaseEntity {
  id: string;
  createdDate: string;
  lastUpdated: string;
  isActive: boolean;
  version?: string;
  tenant?: string;
}

export interface MultiLanguageText {
  fr: string;
  en: string;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface ContactDetails {
  phone?: string;
  email?: string;
  fax?: string;
  website?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: Address;
  description?: string;
}

// =================== ENUMS PRINCIPAUX ===================

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM', 
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum SeverityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH', 
  CRITICAL = 'CRITICAL'
}

export enum LikelihoodLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export enum Status {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED'
}

// =================== TYPES MÉTADONNÉES ===================

export interface AuditInfo {
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  version: number;
}

export interface Attachment {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedDate: string;
  url?: string;
  description?: string;
  category?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  parentId?: string;
  attachments?: Attachment[];
  isEdited?: boolean;
  editedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  category?: string;
}

// =================== TYPES UTILISATEUR ===================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: string;
  preferences?: UserPreferences;
  contactDetails?: ContactDetails;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER', 
  SUPERVISOR = 'SUPERVISOR',
  WORKER = 'WORKER',
  OBSERVER = 'OBSERVER',
  GUEST = 'GUEST'
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  scope?: 'global' | 'organization' | 'team' | 'own';
}

export interface UserPreferences {
  language: 'fr' | 'en';
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  dateFormat?: string;
  numberFormat?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

// =================== TYPES ORGANISATION ===================

export interface Organization {
  id: string;
  name: string;
  displayName?: MultiLanguageText;
  description?: string;
  logo?: string;
  website?: string;
  contactDetails: ContactDetails;
  address: Address;
  settings: OrganizationSettings;
  isActive: boolean;
  createdDate: string;
  parentOrganizationId?: string;
}

export interface OrganizationSettings {
  defaultLanguage: 'fr' | 'en';
  timezone: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  safetyStandards: string[];
  complianceFrameworks: string[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  memberIds: string[];
  organizationId: string;
  permissions: Permission[];
  isActive: boolean;
  createdDate: string;
}

// =================== TYPES TEMPORELS ===================

export interface DateRange {
  start: string;
  end: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  date?: string;
  duration?: number; // minutes
}

export interface Schedule {
  id: string;
  name: string;
  description?: string;
  timeSlots: TimeSlot[];
  recurrence?: RecurrencePattern;
  isActive: boolean;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  occurrences?: number;
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  dayOfMonth?: number;
  monthOfYear?: number;
}

// =================== TYPES VALIDATION ===================

export interface ValidationRule {
  id: string;
  field: string;
  type: ValidationType;
  value?: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export enum ValidationType {
  REQUIRED = 'REQUIRED',
  MIN_LENGTH = 'MIN_LENGTH',
  MAX_LENGTH = 'MAX_LENGTH',
  PATTERN = 'PATTERN',
  EMAIL = 'EMAIL',
  URL = 'URL',
  DATE = 'DATE',
  NUMBER = 'NUMBER',
  POSITIVE = 'POSITIVE',
  CUSTOM = 'CUSTOM'
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// =================== TYPES RECHERCHE ET FILTRAGE ===================

export interface SearchFilters {
  searchTerm?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
  total: number;
  hasMore: boolean;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// =================== TYPES CONFIGURATION ===================

export interface ApplicationSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  features: FeatureFlags;
  integrations: IntegrationSettings;
}

export interface GeneralSettings {
  applicationName: string;
  defaultLanguage: 'fr' | 'en';
  supportedLanguages: string[];
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  currency: string;
}

export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  requireTwoFactor: boolean;
  allowedDomains?: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expirationDays?: number;
  preventReuse?: number;
}

export interface FeatureFlags {
  [featureName: string]: boolean;
}

export interface IntegrationSettings {
  email: EmailIntegration;
  storage: StorageIntegration;
  analytics?: AnalyticsIntegration;
  notifications?: NotificationIntegration;
}

export interface EmailIntegration {
  provider: 'smtp' | 'sendgrid' | 'aws-ses';
  settings: Record<string, any>;
  isEnabled: boolean;
}

export interface StorageIntegration {
  provider: 'local' | 'aws-s3' | 'azure-blob';
  settings: Record<string, any>;
  isEnabled: boolean;
}

export interface AnalyticsIntegration {
  provider: string;
  settings: Record<string, any>;
  isEnabled: boolean;
}

export interface NotificationIntegration {
  provider: string;
  settings: Record<string, any>;
  isEnabled: boolean;
}

// =================== TYPES D'ERREUR ===================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
  stack?: string;
}

export interface ErrorResponse {
  success: false;
  error: ApiError;
  timestamp: string;
  requestId?: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// =================== TYPES UTILITAIRES ===================

export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Type helper pour les ID
export type ID = string;
export type Timestamp = string; // ISO 8601

// Type helper pour les callbacks
export type EventCallback<T = any> = (data: T) => void;
export type AsyncEventCallback<T = any> = (data: T) => Promise<void>;

// =================== CONSTANTES ===================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_LANGUAGE = 'fr';
export const SUPPORTED_LANGUAGES = ['fr', 'en'];
export const DEFAULT_TIMEZONE = 'America/Toronto';

// =================== EXPORTS SPÉCIFIQUES POUR ÉVITER LES CONFLITS ===================

// AST types
export type {
  AST,
  RiskMatrixData,
  ProjectInfo,
  Participant,
  ASTStep,
  StepData,
  StepValidation,
  FinalApproval,
  ASTStatus,
  ASTPriority,
  ASTRevision,
  ASTTemplate,
  ASTSettings,
  ASTId,
  StepId,
  ParticipantId
} from './ast';

// Equipment types  
export type {
  SafetyEquipment,
  EquipmentCategory,
  EquipmentSpecifications,
  CertificationInfo,
  Equipment,
  SelectedEquipment
} from './equipment';

// Hazard types
export type {
  Hazard,
  HazardCategory,
  RiskAssessment,
  RiskMatrix,
  HazardCatalog,
  HazardRelationship,
  HazardIncident,
  HazardAnalytics,
  HazardService,
  HazardReport,
  HazardId,
  AssessmentId,
  IncidentId
} from './hazards';

// Work types - Export seulement ce qui existe vraiment
export type {
  WorkType,
  WorkCategory
} from './workTypes';

// API types
export type {
  ApiResponse as APIResponse
} from './api';

export type {
  ASTFormData,
  Step1Data,
  Step2Data,
  WorkLocation,
  LockoutPoint,
  LockoutPhoto,
  Step2EquipmentItem
} from './astForm';
