// app/types/api.ts
// =================== TYPES API GÉNÉRIQUES ===================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
  stack?: string;
}

export interface PaginatedResponse<T = any> {
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

// =================== TYPES PAGINATION ET RECHERCHE ===================

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

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

// =================== TYPES REQUÊTES API ===================

export interface CreateRequest<T = any> {
  data: T;
  metadata?: Record<string, any>;
}

export interface UpdateRequest<T = any> {
  id: string;
  data: Partial<T>;
  version?: string;
  metadata?: Record<string, any>;
}

export interface DeleteRequest {
  id: string;
  force?: boolean;
  reason?: string;
}

export interface BulkRequest<T = any> {
  action: BulkAction;
  items: T[];
  options?: BulkOptions;
}

export enum BulkAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ARCHIVE = 'ARCHIVE',
  RESTORE = 'RESTORE'
}

export interface BulkOptions {
  validateAll?: boolean;
  stopOnFirstError?: boolean;
  dryRun?: boolean;
}

// =================== TYPES SPÉCIFIQUES AST ===================

export interface ASTApiResponse {
  ast?: any;
  hazards?: any[];
  equipment?: any[];
  workTypes?: any[];
  status: string;
  lastUpdated: string;
}

export interface HazardApiResponse {
  hazards: any[];
  categories: string[];
  total: number;
  filters: SearchFilters;
}

export interface EquipmentApiResponse {
  equipment: any[];
  categories: string[];
  total: number;
  filters: SearchFilters;
}

// =================== TYPES GESTION FICHIERS ===================

export interface FileUploadRequest {
  file: File;
  fieldId?: string;
  category?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadDate: string;
}

export interface FileDownloadRequest {
  fileId: string;
  inline?: boolean;
  format?: string;
}

// =================== TYPES VALIDATION ===================

export interface ValidationRequest<T = any> {
  data: T;
  rules?: ValidationRule[];
  context?: Record<string, any>;
}

export interface ValidationResponse {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationRule {
  field: string;
  type: ValidationType;
  message: string;
  parameters?: Record<string, any>;
}

export enum ValidationType {
  REQUIRED = 'REQUIRED',
  FORMAT = 'FORMAT',
  RANGE = 'RANGE',
  CUSTOM = 'CUSTOM',
  UNIQUE = 'UNIQUE',
  REFERENCE = 'REFERENCE'
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

// =================== TYPES EXPORT/IMPORT ===================

export interface ExportRequest {
  format: ExportFormat;
  filters?: SearchFilters;
  fields?: string[];
  options?: ExportOptions;
}

export enum ExportFormat {
  JSON = 'JSON',
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  PDF = 'PDF',
  XML = 'XML'
}

export interface ExportOptions {
  includeMetadata?: boolean;
  includeRelations?: boolean;
  dateFormat?: string;
  locale?: string;
}

export interface ExportResponse {
  fileId: string;
  downloadUrl: string;
  expiresAt: string;
  format: ExportFormat;
  recordCount: number;
}

export interface ImportRequest {
  fileId: string;
  format: ExportFormat;
  options?: ImportOptions;
}

export interface ImportOptions {
  validateOnly?: boolean;
  skipErrors?: boolean;
  updateExisting?: boolean;
  mapping?: Record<string, string>;
}

export interface ImportResponse {
  importId: string;
  status: ImportStatus;
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
}

export enum ImportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  value?: any;
}

// =================== TYPES AUDIT ET LOGS ===================

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT'
}

export interface LogRequest {
  level: LogLevel;
  message: string;
  category?: string;
  data?: Record<string, any>;
  userId?: string;
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

// =================== TYPES NOTIFICATION ===================

export interface NotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  recipients: string[];
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SYSTEM = 'SYSTEM'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// =================== TYPES CACHE ===================

export interface CacheRequest {
  key: string;
  value: any;
  ttl?: number;
  tags?: string[];
}

export interface CacheResponse<T = any> {
  key: string;
  value: T;
  hit: boolean;
  ttl?: number;
  createdAt: string;
}

// =================== TYPES HEALTH CHECK ===================

export interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  version: string;
  services: ServiceHealth[];
  uptime: number;
}

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY'
}

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

// =================== TYPES UTILITAIRES ===================

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  cache?: boolean;
  validateStatus?: (status: number) => boolean;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  interceptors?: {
    request?: (config: any) => any;
    response?: (response: any) => any;
    error?: (error: any) => any;
  };
}

// =================== EXPORTS POUR COMPATIBILITÉ ===================

export type { ApiResponse as Response };
export type { ApiError as Error };
export type { PaginatedResponse as PagedResponse };
export type { PaginationOptions as Pagination };
export type { SearchFilters as Filters };
