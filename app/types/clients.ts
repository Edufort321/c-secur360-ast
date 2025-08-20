// app/types/clients.ts
// =================== TYPES CLIENTS ===================

import { BaseEntity, Address, ContactDetails } from './index';

export interface Client extends BaseEntity {
  name: string;
  displayName?: string;
  type: ClientType;
  industry?: string;
  description?: string;
  
  // Contact information
  contactDetails: ContactDetails;
  address: Address;
  
  // Business details
  registrationNumber?: string;
  taxNumber?: string;
  website?: string;
  
  // Relationship
  status: ClientStatus;
  accountManager?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  
  // Settings
  preferences?: ClientPreferences;
  customFields?: Record<string, any>;
}

export enum ClientType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATION = 'CORPORATION',
  GOVERNMENT = 'GOVERNMENT',
  NON_PROFIT = 'NON_PROFIT',
  PARTNERSHIP = 'PARTNERSHIP'
}

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PROSPECT = 'PROSPECT',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED'
}

export interface ClientPreferences {
  preferredLanguage: 'fr' | 'en';
  communicationMethod: 'email' | 'phone' | 'mail';
  timezone?: string;
  invoiceFormat?: 'pdf' | 'electronic';
}

export interface ClientContact extends BaseEntity {
  clientId: string;
  firstName: string;
  lastName: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimary: boolean;
  role: ContactRole;
}

export enum ContactRole {
  PRIMARY = 'PRIMARY',
  BILLING = 'BILLING',
  TECHNICAL = 'TECHNICAL',
  SAFETY = 'SAFETY',
  EMERGENCY = 'EMERGENCY'
}

export interface ClientProject extends BaseEntity {
  clientId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  projectManager?: string;
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// =================== TYPES D'EXPORT ===================

export type ClientId = string;
export type ContactId = string;
export type ProjectId = string;
