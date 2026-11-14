// app/utils/documentGeneration.ts - Système de génération de documents

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
        config: {
          template: 'risk-alert-email'
        }
      },
      {
        type: ChannelType.SMS,
        enabled: true,
        config: {},
        fallback: ChannelType.EMAIL
      },
      {
        type: ChannelType.IN_APP,
        enabled: true,
        config: {}
      }
    ],
    subject: 'Alerte Risque Élevé - AST #{astNumber}',
    message: `
      Un risque élevé a été détecté dans l'AST #{astNumber} - {astTitle}.
      
      Niveau de risque: {riskLevel}
      Projet: {projectName}
      Client: {clientName}
      
      Action immédiate requise pour réviser les mesures de contrôle.
      
      Accéder à l'AST: {astUrl}
    `,
    variables: [
      { name: 'astNumber', type: 'string', description: 'Numéro AST', required: true },
      { name: 'astTitle', type: 'string', description: 'Titre AST', required: true },
      { name: 'riskLevel', type: 'string', description: 'Niveau de risque', required: true },
      { name: 'projectName', type: 'string', description: 'Nom du projet', required: true },
      { name: 'clientName', type: 'string', description: 'Nom du client', required: true },
      { name: 'astUrl', type: 'string', description: 'URL vers l\'AST', required: true }
    ],
    tenantCustomizable: true
  },

  AST_APPROVAL_REQUEST: {
    id: 'ast-approval-request',
    name: 'Demande d\'Approbation AST',
    type: NotificationType.APPROVAL,
    trigger: {
      event: TriggerEvent.AST_CREATED
    },
    priority: NotificationPriority.NORMAL,
    channels: [
      {
        type: ChannelType.EMAIL,
        enabled: true,
        config: {
          template: 'approval-request-email'
        }
      },
      {
        type: ChannelType.IN_APP,
        enabled: true,
        config: {}
      }
    ],
    subject: 'Demande d\'approbation - AST #{astNumber}',
    message: `
      Une nouvelle AST nécessite votre approbation.
      
      AST: #{astNumber} - {astTitle}
      Projet: {projectName}
      Client: {clientName}
      Chef d'équipe: {teamLeader}
      Date prévue: {plannedStartDate}
      
      Veuillez réviser et approuver: {astUrl}
    `,
    variables: [
      { name: 'astNumber', type: 'string', description: 'Numéro AST', required: true },
      { name: 'astTitle', type: 'string', description: 'Titre AST', required: true },
      { name: 'projectName', type: 'string', description: 'Nom du projet', required: true },
      { name: 'clientName', type: 'string', description: 'Nom du client', required: true },
      { name: 'teamLeader', type: 'string', description: 'Chef d\'équipe', required: true },
      { name: 'plannedStartDate', type: 'date', description: 'Date de début prévue', required: true },
      { name: 'astUrl', type: 'string', description: 'URL vers l\'AST', required: true }
    ],
    tenantCustomizable: true
  },

  COMPLIANCE_ISSUE_ALERT: {
    id: 'compliance-issue-alert',
    name: 'Alerte Problème de Conformité',
    type: NotificationType.COMPLIANCE,
    trigger: {
      event: TriggerEvent.COMPLIANCE_ISSUE
    },
    priority: NotificationPriority.HIGH,
    channels: [
      {
        type: ChannelType.EMAIL,
        enabled: true,
        config: {}
      },
      {
        type: ChannelType.TEAMS,
        enabled: true,
        config: {
          channel: 'safety-alerts'
        }
      }
    ],
    subject: '⚠ Problème de Conformité Détecté',
    message: `
      Un problème de conformité a été détecté.
      
      Score de conformité: {complianceScore}%
      Actions critiques: {criticalActionsCount}
      
      Détails: {complianceReportUrl}
    `,
    variables: [
      { name: 'complianceScore', type: 'number', description: 'Score de conformité', required: true },
      { name: 'criticalActionsCount', type: 'number', description: 'Nombre d\'actions critiques', required: true },
      { name: 'complianceReportUrl', type: 'string', description: 'URL du rapport', required: true }
    ],
    tenantCustomizable: true
  },

  AST_DEADLINE_REMINDER: {
    id: 'ast-deadline-reminder',
    name: 'Rappel Échéance AST',
    type: NotificationType.REMINDER,
    trigger: {
      event: TriggerEvent.SCHEDULED,
      recurring: RecurringPattern.DAILY
    },
    priority: NotificationPriority.NORMAL,
    channels: [
      {
        type: ChannelType.EMAIL,
        enabled: true,
        config: {}
      },
      {
        type: ChannelType.IN_APP,
        enabled: true,
        config: {}
      }
    ],
    subject: 'Rappel - AST #{astNumber} échéance dans {daysRemaining} jours',
    message: `
      Rappel d'échéance pour l'AST #{astNumber} - {astTitle}.
      
      Date d'échéance: {deadline}
      Jours restants: {daysRemaining}
      
      Statut actuel: {status}
      
      Accéder à l'AST: {astUrl}
    `,
    variables: [
      { name: 'astNumber', type: 'string', description: 'Numéro AST', required: true },
      { name: 'astTitle', type: 'string', description: 'Titre AST', required: true },
      { name: 'deadline', type: 'date', description: 'Date d\'échéance', required: true },
      { name: 'daysRemaining', type: 'number', description: 'Jours restants', required: true },
      { name: 'status', type: 'string', description: 'Statut actuel', required: true },
      { name: 'astUrl', type: 'string', description: 'URL vers l\'AST', required: true }
    ],
    tenantCustomizable: true
  }
};

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

// =================== FONCTIONS PRINCIPALES ===================

/**
 * Envoie une notification basée sur un template
 */
export async function sendNotification(
  templateId: string,
  recipients: NotificationRecipient[],
  variables: Record<string, any>,
  tenantId: string,
  options?: {
    priority?: NotificationPriority;
    scheduling?: NotificationScheduling;
    channels?: ChannelType[];
  }
): Promise<NotificationResult> {
  const template = DEFAULT_NOTIFICATION_TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Template de notification non trouvé: ${templateId}`);
  }

  // Appliquer les personnalisations du tenant
  const customizedTemplate = await applyTenantCustomizations(template, tenantId);
  
  // Filtrer les destinataires selon leurs préférences
  const filteredRecipients = filterRecipientsByPreferences(recipients, customizedTemplate);
  
  // Interpoler les variables dans le message
  const processedMessage = interpolateTemplate(customizedTemplate.message, variables);
  const processedSubject = interpolateTemplate(customizedTemplate.subject, variables);
  
  // Déterminer les canaux à utiliser
  const channelsToUse = options?.channels || 
    customizedTemplate.channels.filter(c => c.enabled).map(c => c.type);
  
  // Envoyer sur chaque canal
  const channelResults: ChannelResult[] = [];
  
  for (const channelType of channelsToUse) {
    const channelConfig = customizedTemplate.channels.find(c => c.type === channelType);
    if (!channelConfig?.enabled) continue;
    
    try {
      const result = await sendToChannel(
        channelType,
        filteredRecipients,
        processedSubject,
        processedMessage,
        channelConfig.config,
        tenantId
      );
      channelResults.push(result);
    } catch (error) {
      channelResults.push({
        type: channelType,
        status: DeliveryStatus.FAILED,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
  
  // Déterminer le statut global
  const overallStatus = determineOverallStatus(channelResults);
  
  const notificationResult: NotificationResult = {
    id: generateNotificationId(),
    templateId,
    recipients: filteredRecipients,
    channels: channelResults,
    status: overallStatus,
    sentAt: new Date(),
    retryCount: 0,
    tenantId
  };
  
  // Sauvegarder le résultat (dans un vrai système)
  await saveNotificationResult(notificationResult);
  
  return notificationResult;
}

/**
 * Envoie des notifications pour les événements AST
 */
export async function sendASTNotification(
  event: TriggerEvent,
  ast: AST,
  recipients: NotificationRecipient[],
  additionalData?: Record<string, any>
): Promise<NotificationResult[]> {
  const relevantTemplates = Object.values(DEFAULT_NOTIFICATION_TEMPLATES)
    .filter(template => template.trigger.event === event);
  
  const results: NotificationResult[] = [];
  
  for (const template of relevantTemplates) {
    // Vérifier les conditions du trigger
    if (template.trigger.conditions && !checkTriggerConditions(template.trigger.conditions, ast)) {
      continue;
    }
    
    // Préparer les variables
    const variables = prepareASTVariables(ast, additionalData);
    
    try {
      const result = await sendNotification(
        template.id,
        recipients,
        variables,
        (ast as any).clientId || ast.id // tenantId
      );
      results.push(result);
    } catch (error) {
      console.error(`Erreur envoi notification ${template.id}:`, error);
    }
  }
  
  return results;
}

/**
 * Envoie des notifications de conformité
 */
export async function sendComplianceNotification(
  complianceReport: ComplianceReport,
  recipients: NotificationRecipient[]
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];
  
  // Déterminer le type de notification selon le score
  let templateId: string;
  if (complianceReport.overallScore < 70) {
    templateId = 'COMPLIANCE_ISSUE_ALERT';
  } else if (complianceReport.criticalActions.length > 0) {
    templateId = 'COMPLIANCE_ACTION_REQUIRED';
  } else {
    return []; // Pas de notification nécessaire
  }
  
  const variables = {
    complianceScore: complianceReport.overallScore,
    criticalActionsCount: complianceReport.criticalActions.length,
    complianceReportUrl: `${process.env.BASE_URL}/compliance/${complianceReport.tenantId}`,
    generatedAt: complianceReport.generatedAt,
    nextReviewDate: complianceReport.nextReviewDate
  };
  
  try {
    const result = await sendNotification(
      templateId,
      recipients,
      variables,
      complianceReport.tenantId
    );
    results.push(result);
  } catch (error) {
    console.error('Erreur envoi notification conformité:', error);
  }
  
  return results;
}

/**
 * Programme des rappels automatiques
 */
export async function scheduleReminders(
  asts: AST[],
  tenantId: string
): Promise<void> {
  for (const ast of asts) {
    // Vérifier si les propriétés existent
    const plannedStartDate = (ast as any).plannedStartDate;
    const teamLeader = (ast as any).teamLeader || ast.participants?.[0];
    
    if (!plannedStartDate || !teamLeader) continue;
    
    // Rappel 7 jours avant l'échéance
    const sevenDaysBefore = new Date(plannedStartDate);
    sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
    
    if (sevenDaysBefore > new Date()) {
      await scheduleNotification(
        'AST_DEADLINE_REMINDER',
        [{ 
          id: teamLeader.email || teamLeader.id || '',
          type: RecipientType.EMAIL,
          value: teamLeader.email || teamLeader.id || '',
          name: teamLeader.name || 'Chef d\'équipe'
        }],
        prepareASTVariables(ast, { daysRemaining: 7 }),
        tenantId,
        sevenDaysBefore
      );
    }
    
    // Rappel 1 jour avant l'échéance
    const oneDayBefore = new Date(plannedStartDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    
    if (oneDayBefore > new Date()) {
      await scheduleNotification(
        'AST_DEADLINE_REMINDER',
        [{ 
          id: teamLeader.email || teamLeader.id || '',
          type: RecipientType.EMAIL,
          value: teamLeader.email || teamLeader.id || '',
          name: teamLeader.name || 'Chef d\'équipe'
        }],
        prepareASTVariables(ast, { daysRemaining: 1 }),
        tenantId,
        oneDayBefore
      );
    }
  }
}

// =================== FONCTIONS CANAL ===================

async function sendToChannel(
  channelType: ChannelType,
  recipients: NotificationRecipient[],
  subject: string,
  message: string,
  config: ChannelConfig,
  tenantId: string
): Promise<ChannelResult> {
  try {
    switch (channelType) {
      case ChannelType.EMAIL:
        return await sendEmail(recipients, subject, message, config, tenantId);
      
      case ChannelType.SMS:
        return await sendSMS(recipients, message, config, tenantId);
      
      case ChannelType.TEAMS:
        return await sendTeamsMessage(recipients, subject, message, config, tenantId);
      
      case ChannelType.SLACK:
        return await sendSlackMessage(recipients, subject, message, config, tenantId);
      
      case ChannelType.WHATSAPP:
        return await sendWhatsApp(recipients, message, config, tenantId);
      
      case ChannelType.IN_APP:
        return await sendInAppNotification(recipients, subject, message, tenantId);
      
      default:
        throw new Error(`Canal non supporté: ${channelType}`);
    }
  } catch (error) {
    return {
      type: channelType,
      status: DeliveryStatus.FAILED,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

async function sendEmail(
  recipients: NotificationRecipient[],
  subject: string,
  message: string,
  config: ChannelConfig,
  tenantId: string
): Promise<ChannelResult> {
  // Implementation email (Resend, SendGrid, etc.)
  console.log('Envoi email:', { recipients, subject, message });
  
  return {
    type: ChannelType.EMAIL,
    status: DeliveryStatus.SENT,
    sentAt: new Date(),
    messageId: `email_${Date.now()}`
  };
}

async function sendSMS(
  recipients: NotificationRecipient[],
  message: string,
  config: ChannelConfig,
  tenantId: string
): Promise<ChannelResult> {
  // Implementation SMS (Twilio, AWS SNS, etc.)
  console.log('Envoi SMS:', { recipients, message });
  
  return {
    type: ChannelType.SMS,
    status: DeliveryStatus.SENT,
    sentAt: new Date(),
    messageId: `sms_${Date.now()}`
  };
}

async function sendTeamsMessage(
  recipients: NotificationRecipient[],
  subject: string,
  message: string,
  config: ChannelConfig,
  tenantId: string
): Promise<ChannelResult> {
  // Implementation Teams webhook
  console.log('Envoi Teams:', { subject, message });
  
  return {
    type: ChannelType.TEAMS,
    status: DeliveryStatus.SENT,
    sentAt: new Date(),
    messageId: `teams_${Date.now()}`
  };
}

async function sendSlackMessage(
  recipients: NotificationRecipient[],
  subject: string,
  message: string,
  config: ChannelConfig,
  tenantId: string
): Promise<ChannelResult> {
  // Implementation Slack API
  console.log('Envoi Slack:', { subject, message });
  
  return {
    type: ChannelType.SLACK,
    status: DeliveryStatus.SENT,
    sentAt: new Date(),
    messageId: `slack_${Date.now()}`
  };
}

async function sendWhatsApp(
  recipients: NotificationRecipient[],
  message: string,
  config: ChannelConfig,
  tenantId: string
): Promise<ChannelResult> {
  // Implementation WhatsApp Business API
  console.log('Envoi WhatsApp:', { recipients, message });
  
  return {
    type: ChannelType.WHATSAPP,
    status: DeliveryStatus.SENT,
    sentAt: new Date(),
    messageId: `whatsapp_${Date.now()}`
  };
}

async function sendInAppNotification(
  recipients: NotificationRecipient[],
  subject: string,
  message: string,
  tenantId: string
): Promise<ChannelResult> {
  // Sauvegarde en base pour affichage in-app
  console.log('Notification in-app:', { recipients, subject, message });
  
  return {
    type: ChannelType.IN_APP,
    status: DeliveryStatus.DELIVERED,
    sentAt: new Date(),
    deliveredAt: new Date(),
    messageId: `inapp_${Date.now()}`
  };
}

// =================== FONCTIONS UTILITAIRES ===================

function interpolateTemplate(template: string, variables: Record<string, any>): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    const value = variables[key];
    if (value === undefined) return match;
    
    if (value instanceof Date) {
      return value.toLocaleDateString('fr-CA');
    }
    
    return String(value);
  });
}

function prepareASTVariables(ast: AST, additionalData?: Record<string, any>): Record<string, any> {
  const astAny = ast as any;
  
  return {
    astNumber: astAny.astNumber || astAny.id || 'N/A',
    astTitle: astAny.title || ast.name || 'AST sans titre',
    projectName: astAny.projectName || astAny.project?.name || 'Projet sans nom',
    clientName: astAny.clientId || astAny.client?.name || 'Client inconnu',
    teamLeader: astAny.teamLeader?.name || ast.participants?.[0]?.name || 'Chef d\'équipe',
    plannedStartDate: astAny.plannedStartDate || new Date().toISOString(),
    plannedEndDate: astAny.plannedEndDate || new Date().toISOString(),
    status: ast.status || 'DRAFT',
    astUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/ast/${ast.id}`,
    ...additionalData
  };
}

function checkTriggerConditions(
  conditions: TriggerCondition[],
  data: any
): boolean {
  return conditions.every(condition => {
    const value = getNestedValue(data, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'greater_than':
        return value > condition.value;
      case 'less_than':
        return value < condition.value;
      case 'contains':
        return String(value).includes(condition.value);
      default:
        return false;
    }
  });
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function filterRecipientsByPreferences(
  recipients: NotificationRecipient[],
  template: NotificationTemplate
): NotificationRecipient[] {
  return recipients.filter(recipient => {
    if (!recipient.preferences) return true;
    
    // Vérifier la priorité minimum
    const priorityLevels = {
      [NotificationPriority.LOW]: 1,
      [NotificationPriority.NORMAL]: 2,
      [NotificationPriority.HIGH]: 3,
      [NotificationPriority.URGENT]: 4,
      [NotificationPriority.CRITICAL]: 5
    };
    
    const templatePriority = priorityLevels[template.priority];
    const userMinPriority = priorityLevels[recipient.preferences.priority];
    
    return templatePriority >= userMinPriority;
  });
}

function determineOverallStatus(channelResults: ChannelResult[]): NotificationStatus {
  if (channelResults.length === 0) return NotificationStatus.FAILED;
  
  const hasSuccess = channelResults.some(r => 
    r.status === DeliveryStatus.SENT || r.status === DeliveryStatus.DELIVERED
  );
  
  if (hasSuccess) return NotificationStatus.SENT;
  
  return NotificationStatus.FAILED;
}

async function applyTenantCustomizations(
  template: NotificationTemplate,
  tenantId: string
): Promise<NotificationTemplate> {
  // Dans un vrai système, récupérer les personnalisations depuis la DB
  return template;
}

async function scheduleNotification(
  templateId: string,
  recipients: NotificationRecipient[],
  variables: Record<string, any>,
  tenantId: string,
  scheduledFor: Date
): Promise<void> {
  // Dans un vrai système, utiliser un job scheduler (Bull, Agenda, etc.)
  console.log('Notification programmée:', {
    templateId,
    scheduledFor,
    tenantId
  });
}

async function saveNotificationResult(result: NotificationResult): Promise<void> {
  // Sauvegarder en base de données
  console.log('Résultat notification sauvegardé:', result.id);
}

function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =================== EXPORTS ===================
export default {
  sendNotification,
  sendASTNotification,
  sendComplianceNotification,
  scheduleReminders,
  DEFAULT_NOTIFICATION_TEMPLATES,
  NotificationType,
  TriggerEvent,
  NotificationPriority,
  ChannelType
};
