// app/types/index.ts

// =================== TYPES DE BASE ===================
export interface BaseEntity {
  id: string;
  createdDate: string;
  lastUpdated: string;
  isActive: boolean;
}

export interface MultiLanguageText {
  fr: string;
  en: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type LikelihoodLevel = 'low' | 'medium' | 'high' | 'critical';

// =================== TYPES PAGINATION ===================
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface SearchFilters {
  query?: string;
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// =================== TYPES SYSTÈME ===================
export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
}

export type UserRole = 'admin' | 'supervisor' | 'worker' | 'guest';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
}

// =================== TYPES ORGANISATION ===================
export interface Organization {
  id: string;
  name: string;
  description?: string;
  address?: Address;
  contact?: ContactInfo;
  settings: OrganizationSettings;
  isActive: boolean;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  fax?: string;
  website?: string;
}

export interface OrganizationSettings {
  language: 'fr' | 'en';
  timezone: string;
  currency: 'CAD' | 'USD';
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

// =================== TYPES VALIDATION ===================
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

// =================== TYPES MÉTADONNÉES ===================
export interface Metadata {
  version: string;
  author: string;
  createdAt: string;
  modifiedAt: string;
  tags?: string[];
  category?: string;
}

export interface FileMetadata extends Metadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  checksum?: string;
}

// =================== TYPES CONFIGURATION ===================
export interface AppConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  api: ApiConfig;
  database: DatabaseConfig;
  features: FeatureFlags;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  rateLimit: {
    requests: number;
    window: number;
  };
}

export interface DatabaseConfig {
  provider: string;
  url: string;
  maxConnections: number;
  timeout: number;
}

export interface FeatureFlags {
  [featureName: string]: boolean;
}

// =================== TYPES AUDIT ===================
export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  changes?: AuditChanges;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export type AuditAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'import';

export interface AuditChanges {
  before?: Record<string, any>;
  after?: Record<string, any>;
  fields: string[];
}

// =================== TYPES NOTIFICATION ===================
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
}

export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'reminder';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// =================== TYPES RAPPORT ===================
export interface Report {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  parameters: ReportParameters;
  schedule?: ReportSchedule;
  format: ReportFormat;
  isActive: boolean;
}

export type ReportType = 
  | 'ast_summary'
  | 'equipment_inventory'
  | 'hazard_analysis'
  | 'compliance_status'
  | 'cost_analysis';

export interface ReportParameters {
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  groupBy?: string[];
  sortBy?: SortOptions[];
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  time: string;
  recipients: string[];
  isActive: boolean;
}

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'html';

// =================== EXPORTS CENTRALISÉS ===================
export * from './ast';
export * from './equipment';
export * from './hazards';
export * from './workTypes';
export * from './api';
export * from './clients';
