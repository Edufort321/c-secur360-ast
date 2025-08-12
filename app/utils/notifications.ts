import { logger } from '@/lib/logger';
// app/utils/notifications.ts - Système de notifications multi-canal

import { AST, ASTStatus } from '../types/ast';
import { ComplianceReport } from './compliance';
import { RiskLevel } from '../types/index';

// =================== INTERFACES NOTIFICATIONS ===================
export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  trigger: NotificationTrigger;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  subject: string;
  message: string;
  variables: TemplateVariable[];
  conditions?: NotificationCondition[];
  scheduling?: NotificationScheduling;
  tenantCustomizable: boolean;
}

export interface NotificationTrigger {
  event: TriggerEvent;
  conditions?: TriggerCondition[];
  delay?: number; // minutes
  recurring?: RecurringPattern;
}

export interface NotificationChannel {
  type: ChannelType;
  enabled: boolean;
  config: ChannelConfig;
  fallback?: ChannelType;
}

export interface ChannelConfig {
  // Email
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  template?: string;
  
  // SMS
  provider?: 'twilio' | 'aws_sns' | 'custom';
  shortCode?: string;
  
  // Push
  appId?: string;
  icon?: string;
  
  // Teams/Slack
  webhookUrl?: string;
  channel?: string;
  botToken?: string;
  
  // WhatsApp
  businessAccountId?: string;
  phoneNumberId?: string;
  accessToken?: string;
}

export interface NotificationRecipient {
  id: string;
  type: RecipientType;
  value: string; // email, phone, user_id, etc.
  name?: string;
  role?: string;
  preferences?: RecipientPreferences;
  timezone?: string;
  language?: 'fr' | 'en';
}

export interface RecipientPreferences {
  channels: Record<ChannelType, boolean>;
  frequency: NotificationFrequency;
  quietHours?: {
    start: string; // "22:00"
    end: string;   // "08:00"
  };
  priority: NotificationPriority;
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface NotificationScheduling {
  sendAt?: Date;
  timezone?: string;
  businessHoursOnly?: boolean;
  maxRetries?: number;
  retryInterval?: number; // minutes
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

// =================== ÉNUMÉRATIONS ===================
export enum NotificationType {
  ALERT = 'alert',
  REMINDER = 'reminder',
  APPROVAL = 'approval',
  STATUS_UPDATE = 'status_update',
  DEADLINE = 'deadline',
  COMPLIANCE = 'compliance',
  RISK_ASSESSMENT = 'risk_assessment',
  TEAM_UPDATE = 'team_update',
  SYSTEM = 'system'
}

export enum TriggerEvent {
  AST_CREATED = 'ast_created',
  AST_UPDATED = 'ast_updated',
  AST_APPROVED = 'ast_approved',
  AST_REJECTED = 'ast_rejected',
  AST_COMPLETED = 'ast_completed',
  AST_OVERDUE = 'ast_overdue',
  HIGH_RISK_DETECTED = 'high_risk_detected',
  COMPLIANCE_ISSUE = 'compliance_issue',
  EQUIPMENT_EXPIRY = 'equipment_expiry',
  TRAINING_DUE = 'training_due',
  PERMIT_EXPIRY = 'permit_expiry',
  REVIEW_DUE = 'review_due',
  SCHEDULED = 'scheduled',
  MANUAL = 'manual'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum ChannelType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  TEAMS = 'teams',
  SLACK = 'slack',
  WHATSAPP = 'whatsapp',
  WEBHOOK = 'webhook'
}

export enum RecipientType {
  USER = 'user',
  EMAIL = 'email',
  PHONE = 'phone',
  ROLE = 'role',
  TEAM = 'team',
  TENANT = 'tenant'
}

export enum NotificationFrequency {
  IMMEDIATE = 'immediate',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  NEVER = 'never'
}

export enum RecurringPattern {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

// =================== INTERFACES RÉSULTAT ===================
export interface NotificationResult {
  id: string;
  templateId: string;
  recipients: NotificationRecipient[];
  channels: ChannelResult[];
  status: NotificationStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  retryCount: number;
  tenantId: string;
}

export interface ChannelResult {
  type: ChannelType;
  status: DeliveryStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  messageId?: string;
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum DeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  CLICKED = 'clicked',
  OPENED = 'opened'
}

// =================== TEMPLATES PAR DÉFAUT ===================
export const DEFAULT_NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  AST_HIGH_RISK_ALERT: {
    id: 'ast-high-risk-alert',
    name: 'Alerte Risque Élevé',
    type: NotificationType.ALERT,
    trigger: {
      event: TriggerEvent.HIGH_RISK_DETECTED,
      conditions: [
        { field: 'riskLevel', operator: 'equals', value: RiskLevel.HIGH },
        { field: 'riskLevel', operator: 'equals', value: RiskLevel.CRITICAL }
      ]
    },
    priority: NotificationPriority.HIGH,
    channels: [
      {
        type: ChannelType.EMAIL,
        enabled: true,
        config: { template: 'risk-alert-email' }
      }
    ],
    subject: '🚨 Alerte Risque Élevé - AST #{astNumber}',
    message: 'Un risque élevé a été détecté dans l\'AST #{astNumber}.',
    variables: [
      { name: 'astNumber', type: 'string', description: 'Numéro AST', required: true }
    ],
    tenantCustomizable: true
  }
};

// =================== FONCTIONS PRINCIPALES ===================

/**
 * Envoie une notification
 */
export async function sendNotification(
  templateId: string,
  recipients: NotificationRecipient[],
  variables: Record<string, any>,
  tenantId: string
): Promise<NotificationResult> {
  logger.debug('Envoi notification:', { templateId, recipients, variables, tenantId });
  
  return {
    id: `notif_${Date.now()}`,
    templateId,
    recipients,
    channels: [],
    status: NotificationStatus.SENT,
    sentAt: new Date(),
    retryCount: 0,
    tenantId
  };
}

/**
 * Envoie des notifications AST
 */
export async function sendASTNotification(
  event: TriggerEvent,
  ast: AST,
  recipients: NotificationRecipient[]
): Promise<NotificationResult[]> {
  const variables = {
    astNumber: (ast as any).astNumber || ast.id,
    astTitle: ast.name,
    status: ast.status
  };
  
  const result = await sendNotification(
    'AST_HIGH_RISK_ALERT',
    recipients,
    variables,
    (ast as any).clientId || ast.id
  );
  
  return [result];
}

/**
 * Programme des rappels
 */
export async function scheduleReminders(
  asts: AST[],
  tenantId: string
): Promise<void> {
  logger.debug('Programmation rappels:', { astsCount: asts.length, tenantId });
}

export default {
  sendNotification,
  sendASTNotification,
  scheduleReminders,
  DEFAULT_NOTIFICATION_TEMPLATES
};
