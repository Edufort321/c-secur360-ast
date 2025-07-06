// types/api.ts - Types pour les API

import { AST, ASTStatus, RiskLevel } from './ast';
import { PaginationOptions, SearchFilters, SortOptions } from './index';

// =================== TYPES RÉPONSE API GÉNÉRIQUES ===================
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: APIError[];
  timestamp: string;
  requestId?: string;
}

export interface APIError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface APIListResponse<T> extends APIResponse<T[]> {
  pagination?: PaginationMeta;
  filters?: any;
  sort?: SortOptions;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// =================== TYPES SPÉCIFIQUES AST API ===================
export interface ASTListResponse extends APIListResponse<AST> {
  summary?: ASTSummary;
}

export interface ASTSummary {
  totalASTs: number;
  byStatus: Record<ASTStatus, number>;
  byRiskLevel: Record<RiskLevel, number>;
  upcomingDeadlines: number;
  overdueItems: number;
  activeProjects: number;
  completedThisMonth: number;
  averageRiskLevel: RiskLevel;
}

export interface ASTCreateRequest {
  title: string;
  description?: string;
  clientId: string;
  projectName: string;
  workTypeId: string;
  workLocation: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  teamLeader: {
    name: string;
    phone?: string;
    email?: string;
    position?: string;
  };
  teamMembers?: Array<{
    name: string;
    phone?: string;
    email?: string;
    position?: string;
  }>;
  estimatedDuration: number;
  plannedStartDate: string; // ISO string
  plannedEndDate: string; // ISO string
  notes?: string;
}

export interface ASTUpdateRequest extends Partial<ASTCreateRequest> {
  id: string;
  status?: ASTStatus;
  actualStartDate?: string;
  actualEndDate?: string;
  completionPercentage?: number;
}

export interface ASTSearchRequest {
  query?: string;
  filters?: ASTFilters;
  sort?: SortOptions;
  pagination?: PaginationOptions;
}

export interface ASTFilters {
  status?: ASTStatus[];
  clientId?: string[];
  workTypeId?: string[];
  riskLevel?: RiskLevel[];
  teamLeader?: string;
  location?: string;
  dateRange?: {
    field: 'plannedStartDate' | 'actualStartDate' | 'createdAt';
    startDate: string;
    endDate: string;
  };
  hasOverdueItems?: boolean;
  requiresReview?: boolean;
}

// =================== TYPES VALIDATION API ===================
export interface ValidationResponse extends APIResponse<never> {
  validationErrors: ValidationErrorDetail[];
  validationWarnings: ValidationWarningDetail[];
  isValid: boolean;
}

export interface ValidationErrorDetail {
  field: string;
  code: string;
  message: string;
  value?: any;
  constraint?: any;
}

export interface ValidationWarningDetail {
  field: string;
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  recommendation?: string;
}

// =================== TYPES DANGERS API ===================
export interface HazardListResponse extends APIListResponse<any> {
  categories: string[];
  riskLevels: RiskLevel[];
}

export interface HazardSearchRequest {
  category?: string[];
  workType?: string;
  riskLevel?: RiskLevel[];
  query?: string;
}

export interface HazardAssessmentRequest {
  hazardId: string;
  severityLevel: number;
  probabilityLevel: number;
  location?: string;
  exposureDetails?: {
    frequency: string;
    duration: number;
    numberOfPersons: number;
  };
  comments?: string;
}

// =================== TYPES ÉQUIPEMENTS API ===================
export interface EquipmentListResponse extends APIListResponse<any> {
  categories: string[];
  protectionLevels: string[];
  certificationStatus: {
    valid: number;
    expiring: number;
    expired: number;
  };
}

export interface EquipmentRequirementRequest {
  equipmentId: string;
  quantity: number;
  isOptional: boolean;
  specificRequirements?: string;
  assignedTo?: string[];
}

export interface EquipmentAvailabilityRequest {
  equipmentIds: string[];
  startDate: string;
  endDate: string;
  location?: string;
}

export interface EquipmentAvailabilityResponse extends APIResponse<EquipmentAvailability[]> {}

export interface EquipmentAvailability {
  equipmentId: string;
  available: boolean;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  nextAvailableDate?: string;
  alternativeEquipment?: string[];
}

// =================== TYPES MESURES DE CONTRÔLE API ===================
export interface ControlMeasureListResponse extends APIListResponse<any> {
  hierarchyLevels: string[];
  categories: string[];
}

export interface ControlMeasureAssignmentRequest {
  controlMeasureId: string;
  responsiblePerson: string;
  targetImplementationDate?: string;
  monitoringFrequency?: string;
  specificInstructions?: string;
}

export interface ControlMeasureImplementationRequest {
  assignmentId: string;
  status: string;
  implementationDate?: string;
  verificationDate?: string;
  effectivenessRating?: number;
  implementationNotes?: string;
  evidence?: string[]; // IDs de fichiers
}

// =================== TYPES CLIENTS API ===================
export interface ClientListResponse extends APIListResponse<any> {
  activeClients: number;
  inactiveClients: number;
  industries: string[];
}

export interface ClientCreateRequest {
  name: string;
  industry: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  primaryContact: {
    name: string;
    phone: string;
    email: string;
    position: string;
  };
  secondaryContact?: {
    name: string;
    phone?: string;
    email?: string;
    position?: string;
  };
  contractDetails?: {
    contractNumber?: string;
    startDate?: string;
    endDate?: string;
    value?: number;
  };
  notes?: string;
}

// =================== TYPES RAPPORTS API ===================
export interface ReportRequest {
  type: ReportType;
  filters?: ReportFilters;
  format: ReportFormat;
  includeCharts?: boolean;
  includeDetails?: boolean;
}

export enum ReportType {
  AST_SUMMARY = 'ast_summary',
  RISK_ANALYSIS = 'risk_analysis',
  EQUIPMENT_USAGE = 'equipment_usage',
  COMPLIANCE_STATUS = 'compliance_status',
  PERFORMANCE_METRICS = 'performance_metrics',
  MONTHLY_SUMMARY = 'monthly_summary',
  CLIENT_ACTIVITY = 'client_activity'
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}

export interface ReportFilters {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  clientIds?: string[];
  workTypeIds?: string[];
  riskLevels?: RiskLevel[];
  status?: ASTStatus[];
  includeArchived?: boolean;
}

export interface ReportResponse extends APIResponse<ReportData> {}

export interface ReportData {
  reportId: string;
  type: ReportType;
  format: ReportFormat;
  generatedAt: string;
  downloadUrl?: string;
  expiresAt?: string;
  metadata: ReportMetadata;
}

export interface ReportMetadata {
  totalRecords: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters: ReportFilters;
  generatedBy: string;
  version: string;
}

// =================== TYPES FICHIERS API ===================
export interface FileUploadRequest {
  file: File;
  type: FileType;
  relatedEntityId?: string;
  description?: string;
}

export enum FileType {
  DOCUMENT = 'document',
  IMAGE = 'image',
  CERTIFICATE = 'certificate',
  PERMIT = 'permit',
  MANUAL = 'manual',
  EVIDENCE = 'evidence'
}

export interface FileUploadResponse extends APIResponse<UploadedFile> {}

export interface UploadedFile {
  id: string;
  fileName: string;
  originalFileName: string;
  fileType: FileType;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
  thumbnailUrl?: string;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // pour les vidéos
  pageCount?: number; // pour les PDFs
  checksum: string;
  virusScanned: boolean;
  extractedText?: string; // pour l'indexation
}

// =================== TYPES NOTIFICATIONS API ===================
export interface NotificationRequest {
  type: NotificationType;
  recipients: NotificationRecipient[];
  message: NotificationMessage;
  scheduledFor?: string;
  priority: NotificationPriority;
}

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface NotificationRecipient {
  type: 'user' | 'email' | 'phone';
  value: string;
  name?: string;
}

export interface NotificationMessage {
  subject: string;
  body: string;
  actionUrl?: string;
  actionText?: string;
  template?: string;
  variables?: Record<string, any>;
}

export interface NotificationResponse extends APIResponse<NotificationResult> {}

export interface NotificationResult {
  notificationId: string;
  sentAt: string;
  deliveryStatus: NotificationDeliveryStatus[];
  failedDeliveries: NotificationFailure[];
}

export interface NotificationDeliveryStatus {
  recipient: string;
  type: NotificationType;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  deliveredAt?: string;
}

export interface NotificationFailure {
  recipient: string;
  type: NotificationType;
  error: string;
  retryAt?: string;
}

// =================== TYPES EXPORTS ===================
export type {
  APIResponse,
  APIError,
  APIListResponse,
  PaginationMeta,
  ASTListResponse,
  ASTSummary,
  ASTCreateRequest,
  ASTUpdateRequest,
  ASTSearchRequest,
  ASTFilters,
  ValidationResponse,
  ValidationErrorDetail,
  ValidationWarningDetail,
  HazardListResponse,
  HazardSearchRequest,
  HazardAssessmentRequest,
  EquipmentListResponse,
  EquipmentRequirementRequest,
  EquipmentAvailabilityRequest,
  EquipmentAvailabilityResponse,
  EquipmentAvailability,
  ControlMeasureListResponse,
  ControlMeasureAssignmentRequest,
  ControlMeasureImplementationRequest,
  ClientListResponse,
  ClientCreateRequest,
  ReportRequest,
  ReportResponse,
  ReportData,
  ReportMetadata,
  FileUploadRequest,
  FileUploadResponse,
  UploadedFile,
  FileMetadata,
  NotificationRequest,
  NotificationResponse,
  NotificationResult,
  NotificationDeliveryStatus,
  NotificationFailure
};
