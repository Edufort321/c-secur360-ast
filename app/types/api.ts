// types/api.ts - Types pour les API

import { ASTStatus, RiskLevel } from './ast';

// =================== TYPES DE BASE ===================

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

// =================== TYPES RÉPONSE API GÉNÉRIQUES ===================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  statusCode?: number;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

// =================== TYPES PAGINATION API ===================

export interface PaginatedResponse<T = any> extends ApiSuccess<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiListRequest {
  pagination?: PaginationOptions;
  search?: SearchFilters;
  sort?: SortOptions;
}

// =================== TYPES AST API ===================

export interface ASTListRequest extends ApiListRequest {
  status?: ASTStatus;
  riskLevel?: RiskLevel;
  workType?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ASTCreateRequest {
  projectInfo: {
    name: string;
    description: string;
    workType: string;
    location: string;
    estimatedDuration: string;
  };
  participants: Array<{
    name: string;
    role: string;
    experience: string;
  }>;
}

export interface ASTUpdateRequest extends Partial<ASTCreateRequest> {
  status?: ASTStatus;
  completedSteps?: number[];
}

// =================== TYPES ÉQUIPEMENTS API ===================

export interface EquipmentListRequest extends ApiListRequest {
  category?: string;
  workType?: string;
  available?: boolean;
}

export interface EquipmentCreateRequest {
  name: string;
  category: string;
  description: string;
  specifications: Record<string, any>;
  available: boolean;
}

// =================== TYPES DANGERS API ===================

export interface HazardListRequest extends ApiListRequest {
  category?: string;
  severity?: string;
  workType?: string;
  active?: boolean;
}

export interface HazardCreateRequest {
  name: string;
  category: string;
  description: string;
  severity: string;
  likelihood: string;
  controlMeasures: string[];
  requiredEquipment: string[];
}

// =================== TYPES VALIDATION API ===================

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiValidationError extends ApiError {
  errors: ValidationError[];
}

// =================== TYPES UPLOAD API ===================

export interface FileUploadRequest {
  file: File;
  category?: string;
  description?: string;
}

export interface FileUploadResponse extends ApiSuccess {
  data: {
    id: string;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    url: string;
    uploadedAt: string;
  };
}

// =================== TYPES EXPORT API ===================

export interface ExportRequest {
  format: 'pdf' | 'excel' | 'csv';
  astIds?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  includeDetails?: boolean;
}

export interface ExportResponse extends ApiSuccess {
  data: {
    downloadUrl: string;
    filename: string;
    expiresAt: string;
  };
}
