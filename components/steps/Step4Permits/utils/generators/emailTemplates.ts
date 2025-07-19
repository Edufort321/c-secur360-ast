// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/GENERATORS/EMAILTEMPLATES.TS ===================
// Templates emails automatiques pour système de permis avec notifications intelligentes
"use client";

import type { 
  LegalPermit,
  PermitFormData,
  PersonnelData,
  AtmosphericReading,
  ElectronicSignature,
  BilingualText,
  PriorityLevel,
  ProvinceCode
} from '../../types';

// =================== INTERFACES EMAIL TEMPLATES ===================

export interface EmailTemplate {
  id: string;
  name: BilingualText;
  type: EmailType;
  category: EmailCategory;
  priority: PriorityLevel;
  subject: BilingualText;
  htmlContent: BilingualText;
  textContent: BilingualText;
  variables: EmailVariable[];
  attachments?: EmailAttachment[];
  metadata: {
    version: string;
    lastUpdated: number;
    author: string;
    tags: string[];
  };
  branding: EmailBranding;
  scheduling: EmailScheduling;
  compliance: EmailCompliance;
}

export type EmailType = 
  | 'permit_approval'          // Approbation permis
  | 'permit_rejection'         // Rejet permis
  | 'permit_expiration'        // Expiration permis
  | 'permit_reminder'          // Rappel permis
  | 'atmospheric_alert'        // Alerte atmosphérique
  | 'emergency_notification'   // Notification urgence
  | 'training_reminder'        // Rappel formation
  | 'certification_expiry'     // Expiration certification
  | 'incident_report'          // Rapport incident
  | 'compliance_violation'     // Violation conformité
  | 'daily_summary'           // Résumé quotidien
  | 'weekly_report'           // Rapport hebdomadaire
  | 'audit_notification'      // Notification audit
  | 'signature_request'       // Demande signature
  | 'status_update';          // Mise à jour statut

export type EmailCategory = 
  | 'operational'     // Opérationnel
  | 'safety'          // Sécurité
  | 'compliance'      // Conformité
  | 'emergency'       // Urgence
  | 'administrative'  // Administratif
  | 'training'        // Formation
  | 'reporting';      // Rapports

export interface EmailVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  description: BilingualText;
  required: boolean;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    enum?: string[];
  };
  formatting?: {
    dateFormat?: string;
    numberFormat?: string;
    currency?: string;
  };
}

export interface EmailAttachment {
  type: 'pdf' | 'excel' | 'image' | 'qr_code' | 'certificate';
  name: BilingualText;
  description: BilingualText;
  generateOnSend: boolean;
  template?: string;
  data?: any;
  options?: {
    password?: boolean;
    watermark?: boolean;
    compression?: 'none' | 'low' | 'medium' | 'high';
  };
}

export interface EmailBranding {
  logo: {
    url: string;
    width: number;
    height: number;
    altText: BilingualText;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    size: {
      heading: number;
      body: number;
      small: number;
    };
  };
  footer: BilingualText;
  disclaimer: BilingualText;
}

export interface EmailScheduling {
  sendImmediate: boolean;
  delay?: number;                // Minutes délai
  businessHoursOnly: boolean;
  timezone: string;
  retry: {
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential';
    baseDelay: number;           // Secondes
  };
  conditions?: EmailCondition[];
}

export interface EmailCondition {
  type: 'time' | 'date' | 'status' | 'role' | 'location' | 'custom';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
  field?: string;
}

export interface EmailCompliance {
  requireConsent: boolean;
  consentType: 'explicit' | 'implicit' | 'legitimate_interest';
  dataRetention: number;         // Jours
  unsubscribeLink: boolean;
  privacyNotice: BilingualText;
  jurisdiction: ProvinceCode[];
  regulations: string[];         // PIPEDA, CAN-SPAM, CASL
}

export interface EmailRecipient {
  type: 'to' | 'cc' | 'bcc';
  email: string;
  name?: string;
  role?: string;
  language?: 'fr' | 'en';
  timezone?: string;
  preferences?: {
    format: 'html' | 'text';
    frequency: 'immediate' | 'daily' | 'weekly';
    categories: EmailCategory[];
  };
}

export interface EmailContext {
  permit?: LegalPermit;
  formData?: PermitFormData;
  personnel?: PersonnelData;
  atmospheric?: AtmosphericReading[];
  signature?: ElectronicSignature;
  incident?: any;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    language: 'fr' | 'en';
    timezone: string;
  };
  organization?: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    website: string;
  };
  system?: {
    baseUrl: string;
    supportEmail: string;
    emergencyPhone: string;
  };
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  recipients: Array<{
    email: string;
    status: 'sent' | 'failed' | 'queued' | 'rejected';
    error?: string;
    deliveryTime?: number;
  }>;
  metadata: {
    template: string;
    language: string;
    sendTime: number;
    processingTime: number;
    attachmentCount: number;
    attachmentSize: number;
  };
  tracking?: {
    trackingId: string;
    pixelUrl?: string;
    unsubscribeUrl?: string;
  };
  errors?: string[];
  warnings?: string[];
}

// =================== CLASSE PRINCIPALE EMAILTEMPLATEMANAGER ===================

export class EmailTemplateManager {
  private templates: Map<string, EmailTemplate> = new Map();
  private defaultBranding: EmailBranding;
  private systemConfig: any;

  constructor(branding?: Partial<EmailBranding>, config?: any) {
    this.defaultBranding = this.createDefaultBranding(branding);
    this.systemConfig = config || {};
    this.initializeStandardTemplates();
  }

  // =================== MÉTHODES PRINCIPALES ===================

  /**
   * Envoyer email basé sur template avec contexte
   */
  async sendEmailFromTemplate(
    templateId: string,
    recipients: EmailRecipient[],
    context: EmailContext,
    options?: {
      language?: 'fr' | 'en';
      priority?: PriorityLevel;
      trackingEnabled?: boolean;
      customVariables?: Record<string, any>;
    }
  ): Promise<EmailSendResult> {
    const startTime = performance.now();
    
    try {
      // Récupérer template
      const template = this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Déterminer langue
      const language = options?.language || 
                      context.user?.language || 
                      this.detectPreferredLanguage(recipients);

      // Générer contenu email
      const emailContent = await this.generateEmailContent(
        template, 
        context, 
        language, 
        options?.customVariables
      );

      // Générer pièces jointes
      const attachments = await this.generateAttachments(
        template.attachments || [], 
        context
      );

      // Envoyer email
      const sendResult = await this.sendEmail({
        to: recipients.filter(r => r.type === 'to'),
        cc: recipients.filter(r => r.type === 'cc'),
        bcc: recipients.filter(r => r.type === 'bcc'),
        subject: emailContent.subject,
        htmlContent: emailContent.html,
        textContent: emailContent.text,
        attachments,
        priority: options?.priority || template.priority,
        trackingEnabled: options?.trackingEnabled ?? true
      });

      return {
        ...sendResult,
        metadata: {
          template: templateId,
          language,
          sendTime: Date.now(),
          processingTime: performance.now() - startTime,
          attachmentCount: attachments.length,
          attachmentSize: attachments.reduce((total, att) => total + (att.size || 0), 0)
        }
      };

    } catch (error) {
      return {
        success: false,
        recipients: recipients.map(r => ({
          email: r.email,
          status: 'failed' as const,
          error: error instanceof Error ? error.message : 'Unknown error'
        })),
        metadata: {
          template: templateId,
          language: 'fr',
          sendTime: Date.now(),
          processingTime: performance.now() - startTime,
          attachmentCount: 0,
          attachmentSize: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Notifications automatiques pour permis
   */
  async sendPermitNotification(
    type: 'approved' | 'rejected' | 'expired' | 'reminder',
    permit: LegalPermit,
    formData: PermitFormData,
    recipients: EmailRecipient[],
    options?: any
  ): Promise<EmailSendResult> {
    const templateMap = {
      approved: 'permit_approval',
      rejected: 'permit_rejection',
      expired: 'permit_expiration',
      reminder: 'permit_reminder'
    };

    return this.sendEmailFromTemplate(
      templateMap[type],
      recipients,
      { permit, formData },
      options
    );
  }

  /**
   * Alertes atmosphériques urgentes
   */
  async sendAtmosphericAlert(
    readings: AtmosphericReading[],
    criticalReadings: AtmosphericReading[],
    emergencyContacts: EmailRecipient[],
    options?: any
  ): Promise<EmailSendResult> {
    return this.sendEmailFromTemplate(
      'atmospheric_alert',
      emergencyContacts,
      { 
        atmospheric: readings,
        customVariables: { 
          criticalReadings,
          alertLevel: this.calculateMaxAlertLevel(criticalReadings),
          location: criticalReadings[0]?.location?.point || 'Unknown'
        }
      },
      { priority: 'critical', ...options }
    );
  }

  /**
   * Notification urgence avec escalade
   */
  async sendEmergencyNotification(
    incident: any,
    emergencyContacts: EmailRecipient[],
    escalationLevel: number = 1,
    options?: any
  ): Promise<EmailSendResult[]> {
    const results: EmailSendResult[] = [];
    
    // Notification primaire
    const primaryResult = await this.sendEmailFromTemplate(
      'emergency_notification',
      emergencyContacts.filter(c => c.role === 'primary'),
      { 
        incident,
        customVariables: { 
          escalationLevel,
          responseRequired: true,
          maxResponseTime: 15 // minutes
        }
      },
      { priority: 'emergency', ...options }
    );
    results.push(primaryResult);

    // Escalade automatique si configurée
    if (escalationLevel > 1) {
      // Attendre 15 minutes puis escalader
      setTimeout(async () => {
        const escalationResult = await this.sendEmailFromTemplate(
          'emergency_notification',
          emergencyContacts.filter(c => c.role === 'escalation'),
          { 
            incident,
            customVariables: { 
              escalationLevel,
              primaryNotified: true,
              escalationReason: 'No response within 15 minutes'
            }
          },
          { priority: 'emergency', ...options }
        );
        results.push(escalationResult);
      }, 15 * 60 * 1000);
    }

    return results;
  }

  /**
   * Rapports périodiques automatiques
   */
  async sendPeriodicReport(
    type: 'daily' | 'weekly' | 'monthly',
    reportData: any,
    recipients: EmailRecipient[],
    options?: any
  ): Promise<EmailSendResult> {
    const templateMap = {
      daily: 'daily_summary',
      weekly: 'weekly_report',
      monthly: 'monthly_report'
    };

    return this.sendEmailFromTemplate(
      templateMap[type],
      recipients,
      { customVariables: reportData },
      options
    );
  }

  // =================== MÉTHODES GESTION TEMPLATES ===================

  /**
   * Créer template personnalisé
   */
  createTemplate(template: Omit<EmailTemplate, 'metadata'>): EmailTemplate {
    const fullTemplate: EmailTemplate = {
      ...template,
      metadata: {
        version: '1.0.0',
        lastUpdated: Date.now(),
        author: 'System',
        tags: []
      }
    };

    this.templates.set(template.id, fullTemplate);
    return fullTemplate;
  }

  /**
   * Récupérer template
   */
  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Lister templates par catégorie
   */
  getTemplatesByCategory(category: EmailCategory): EmailTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.category === category);
  }

  /**
   * Mettre à jour template
   */
  updateTemplate(id: string, updates: Partial<EmailTemplate>): EmailTemplate | null {
    const template = this.templates.get(id);
    if (!template) return null;

    const updatedTemplate = {
      ...template,
      ...updates,
      metadata: {
        ...template.metadata,
        lastUpdated: Date.now()
      }
    };

    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  // =================== MÉTHODES GÉNÉRATION CONTENU ===================

  private async generateEmailContent(
    template: EmailTemplate,
    context: EmailContext,
    language: 'fr' | 'en',
    customVariables?: Record<string, any>
  ): Promise<{ subject: string; html: string; text: string; }> {
    // Préparer variables
    const variables = await this.prepareTemplateVariables(
      template, 
      context, 
      customVariables
    );

    // Générer contenu
    const subject = this.processTemplate(template.subject[language], variables);
    const html = this.processTemplate(template.htmlContent[language], variables);
    const text = this.processTemplate(template.textContent[language], variables);

    // Appliquer branding
    const brandedHtml = this.applyBranding(html, template.branding, language);

    return { subject, html: brandedHtml, text };
  }

  private async prepareTemplateVariables(
    template: EmailTemplate,
    context: EmailContext,
    customVariables?: Record<string, any>
  ): Promise<Record<string, any>> {
    const variables: Record<string, any> = {
      // Variables système
      currentDate: new Date().toLocaleDateString(),
      currentTime: new Date().toLocaleTimeString(),
      systemUrl: context.system?.baseUrl || 'https://app.permits.ca',
      supportEmail: context.system?.supportEmail || 'support@permits.ca',
      emergencyPhone: context.system?.emergencyPhone || '1-844-URGENCE',

      // Variables utilisateur
      userName: context.user?.name || 'Utilisateur',
      userEmail: context.user?.email || '',
      userRole: context.user?.role || '',

      // Variables organisation
      organizationName: context.organization?.name || 'Votre Organisation',
      organizationPhone: context.organization?.phone || '',
      organizationWebsite: context.organization?.website || '',

      // Variables permit si disponible
      permitId: context.permit?.id || '',
      permitName: context.permit?.name || '',
      permitType: context.permit?.category || '',
      permitStatus: context.permit?.status || '',
      permitPriority: context.permit?.priority || '',

      // Variables personnalisées
      ...customVariables
    };

    // Ajouter variables spécifiques au contexte
    if (context.atmospheric && context.atmospheric.length > 0) {
      const latestReading = context.atmospheric[0];
      variables.lastAtmosphericReading = latestReading.value;
      variables.lastAtmosphericUnit = latestReading.unit;
      variables.lastAtmosphericTime = new Date(latestReading.timestamp).toLocaleString();
      variables.atmosphericAlarmLevel = latestReading.alarmLevel;
    }

    if (context.formData) {
      variables.supervisorName = context.formData.supervisor?.name || '';
      variables.entrantsCount = context.formData.entrants?.length || 0;
      variables.locationDescription = context.formData.location?.description || '';
    }

    return variables;
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  private applyBranding(html: string, branding: EmailBranding, language: 'fr' | 'en'): string {
    // Template HTML avec branding complet
    return `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification - Système de Permis</title>
    <style>
        body { 
            font-family: ${branding.fonts.body}; 
            font-size: ${branding.fonts.size.body}px;
            color: ${branding.colors.text};
            background-color: ${branding.colors.background};
            margin: 0; 
            padding: 20px; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 8px; 
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: ${branding.colors.primary}; 
            color: white; 
            padding: 20px; 
            text-align: center; 
        }
        .logo { 
            max-width: ${branding.logo.width}px; 
            height: auto; 
        }
        .content { 
            padding: 30px; 
            line-height: 1.6; 
        }
        .footer { 
            background: ${branding.colors.background}; 
            padding: 20px; 
            text-align: center; 
            font-size: ${branding.fonts.size.small}px;
            color: #666;
            border-top: 1px solid ${branding.colors.border};
        }
        .button { 
            display: inline-block; 
            background: ${branding.colors.accent}; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 10px 0; 
        }
        .alert { 
            background: #fef2f2; 
            border-left: 4px solid #dc2626; 
            padding: 15px; 
            margin: 15px 0; 
        }
        .success { 
            background: #f0fdf4; 
            border-left: 4px solid #059669; 
            padding: 15px; 
            margin: 15px 0; 
        }
        .warning { 
            background: #fefce8; 
            border-left: 4px solid #ca8a04; 
            padding: 15px; 
            margin: 15px 0; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${branding.logo.url}" alt="${branding.logo.altText[language]}" class="logo">
        </div>
        <div class="content">
            ${html}
        </div>
        <div class="footer">
            <p>${branding.footer[language]}</p>
            <p><small>${branding.disclaimer[language]}</small></p>
        </div>
    </div>
</body>
</html>`;
  }

  // =================== TEMPLATES STANDARDS ===================

  private initializeStandardTemplates(): void {
    // Template approbation permis
    this.createTemplate({
      id: 'permit_approval',
      name: { fr: 'Approbation de Permis', en: 'Permit Approval' },
      type: 'permit_approval',
      category: 'operational',
      priority: 'medium',
      subject: { 
        fr: '✅ Permis {{permitId}} approuvé - {{permitName}}',
        en: '✅ Permit {{permitId}} approved - {{permitName}}'
      },
      htmlContent: {
        fr: `
<h1>Permis de Travail Approuvé</h1>
<div class="success">
    <p><strong>Félicitations!</strong> Votre permis de travail a été approuvé.</p>
</div>
<h2>Détails du Permis</h2>
<ul>
    <li><strong>ID:</strong> {{permitId}}</li>
    <li><strong>Nom:</strong> {{permitName}}</li>
    <li><strong>Type:</strong> {{permitType}}</li>
    <li><strong>Superviseur:</strong> {{supervisorName}}</li>
    <li><strong>Lieu:</strong> {{locationDescription}}</li>
</ul>
<p><a href="{{systemUrl}}/permits/{{permitId}}" class="button">Voir le Permis</a></p>
<h3>Prochaines Étapes</h3>
<ol>
    <li>Imprimer le permis approuvé</li>
    <li>Effectuer les vérifications de sécurité</li>
    <li>Commencer les travaux selon les procédures</li>
</ol>
        `,
        en: `
<h1>Work Permit Approved</h1>
<div class="success">
    <p><strong>Congratulations!</strong> Your work permit has been approved.</p>
</div>
<h2>Permit Details</h2>
<ul>
    <li><strong>ID:</strong> {{permitId}}</li>
    <li><strong>Name:</strong> {{permitName}}</li>
    <li><strong>Type:</strong> {{permitType}}</li>
    <li><strong>Supervisor:</strong> {{supervisorName}}</li>
    <li><strong>Location:</strong> {{locationDescription}}</li>
</ul>
<p><a href="{{systemUrl}}/permits/{{permitId}}" class="button">View Permit</a></p>
<h3>Next Steps</h3>
<ol>
    <li>Print the approved permit</li>
    <li>Perform safety checks</li>
    <li>Begin work according to procedures</li>
</ol>
        `
      },
      textContent: {
        fr: `Permis {{permitId}} approuvé - {{permitName}}\n\nVotre permis de travail a été approuvé.\n\nDétails:\n- ID: {{permitId}}\n- Nom: {{permitName}}\n- Type: {{permitType}}\n\nLien: {{systemUrl}}/permits/{{permitId}}`,
        en: `Permit {{permitId}} approved - {{permitName}}\n\nYour work permit has been approved.\n\nDetails:\n- ID: {{permitId}}\n- Name: {{permitName}}\n- Type: {{permitType}}\n\nLink: {{systemUrl}}/permits/{{permitId}}`
      },
      variables: [
        { name: 'permitId', type: 'string', description: { fr: 'ID du permis', en: 'Permit ID' }, required: true },
        { name: 'permitName', type: 'string', description: { fr: 'Nom du permis', en: 'Permit name' }, required: true },
        { name: 'permitType', type: 'string', description: { fr: 'Type de permis', en: 'Permit type' }, required: true }
      ],
      branding: this.defaultBranding,
      scheduling: {
        sendImmediate: true,
        businessHoursOnly: false,
        timezone: 'America/Toronto',
        retry: { maxAttempts: 3, backoffStrategy: 'exponential', baseDelay: 30 }
      },
      compliance: {
        requireConsent: false,
        consentType: 'legitimate_interest',
        dataRetention: 2555, // 7 ans
        unsubscribeLink: false,
        privacyNotice: { fr: 'Notification opérationnelle', en: 'Operational notification' },
        jurisdiction: ['QC', 'ON', 'BC'],
        regulations: ['PIPEDA', 'CASL']
      }
    });

    // Template alerte atmosphérique
    this.createTemplate({
      id: 'atmospheric_alert',
      name: { fr: 'Alerte Atmosphérique', en: 'Atmospheric Alert' },
      type: 'atmospheric_alert',
      category: 'emergency',
      priority: 'critical',
      subject: {
        fr: '🚨 ALERTE CRITIQUE - Niveau atmosphérique dangereux détecté',
        en: '🚨 CRITICAL ALERT - Dangerous atmospheric level detected'
      },
      htmlContent: {
        fr: `
<h1>🚨 ALERTE ATMOSPHÉRIQUE CRITIQUE</h1>
<div class="alert">
    <p><strong>DANGER IMMÉDIAT DÉTECTÉ</strong></p>
    <p>Des niveaux atmosphériques dangereux ont été détectés. Une action immédiate est requise.</p>
</div>
<h2>Détails de l'Alerte</h2>
<ul>
    <li><strong>Niveau d'Alerte:</strong> {{alertLevel}}</li>
    <li><strong>Lieu:</strong> {{location}}</li>
    <li><strong>Dernière Lecture:</strong> {{lastAtmosphericReading}} {{lastAtmosphericUnit}}</li>
    <li><strong>Heure:</strong> {{lastAtmosphericTime}}</li>
</ul>
<h3>🚨 ACTIONS IMMÉDIATES REQUISES</h3>
<ol>
    <li><strong>ÉVACUER</strong> immédiatement le personnel</li>
    <li><strong>VENTILER</strong> l'espace si sécuritaire</li>
    <li><strong>NE PAS ENTRER</strong> dans l'espace confiné</li>
    <li><strong>CONTACTER</strong> l'équipe d'urgence</li>
</ol>
<p><strong>Urgence 24/7:</strong> {{emergencyPhone}}</p>
        `,
        en: `
<h1>🚨 CRITICAL ATMOSPHERIC ALERT</h1>
<div class="alert">
    <p><strong>IMMEDIATE DANGER DETECTED</strong></p>
    <p>Dangerous atmospheric levels have been detected. Immediate action required.</p>
</div>
<h2>Alert Details</h2>
<ul>
    <li><strong>Alert Level:</strong> {{alertLevel}}</li>
    <li><strong>Location:</strong> {{location}}</li>
    <li><strong>Last Reading:</strong> {{lastAtmosphericReading}} {{lastAtmosphericUnit}}</li>
    <li><strong>Time:</strong> {{lastAtmosphericTime}}</li>
</ul>
<h3>🚨 IMMEDIATE ACTIONS REQUIRED</h3>
<ol>
    <li><strong>EVACUATE</strong> personnel immediately</li>
    <li><strong>VENTILATE</strong> space if safe to do so</li>
    <li><strong>DO NOT ENTER</strong> confined space</li>
    <li><strong>CONTACT</strong> emergency team</li>
</ol>
<p><strong>24/7 Emergency:</strong> {{emergencyPhone}}</p>
        `
      },
      textContent: {
        fr: `🚨 ALERTE ATMOSPHÉRIQUE CRITIQUE\n\nNiveau dangereux détecté à {{location}}\nDernière lecture: {{lastAtmosphericReading}} {{lastAtmosphericUnit}}\n\nACTIONS IMMÉDIATES:\n1. ÉVACUER le personnel\n2. VENTILER l'espace\n3. NE PAS ENTRER\n4. CONTACTER urgence: {{emergencyPhone}}`,
        en: `🚨 CRITICAL ATMOSPHERIC ALERT\n\nDangerous level detected at {{location}}\nLast reading: {{lastAtmosphericReading}} {{lastAtmosphericUnit}}\n\nIMMEDIATE ACTIONS:\n1. EVACUATE personnel\n2. VENTILATE space\n3. DO NOT ENTER\n4. CONTACT emergency: {{emergencyPhone}}`
      },
      variables: [
        { name: 'alertLevel', type: 'string', description: { fr: 'Niveau d\'alerte', en: 'Alert level' }, required: true },
        { name: 'location', type: 'string', description: { fr: 'Lieu de l\'alerte', en: 'Alert location' }, required: true }
      ],
      branding: this.defaultBranding,
      scheduling: {
        sendImmediate: true,
        businessHoursOnly: false,
        timezone: 'America/Toronto',
        retry: { maxAttempts: 5, backoffStrategy: 'linear', baseDelay: 10 }
      },
      compliance: {
        requireConsent: false,
        consentType: 'legitimate_interest',
        dataRetention: 2555,
        unsubscribeLink: false,
        privacyNotice: { fr: 'Notification de sécurité critique', en: 'Critical safety notification' },
        jurisdiction: ['QC', 'ON', 'BC'],
        regulations: ['PIPEDA']
      }
    });

    // Autres templates standards...
    this.createStandardTemplates();
  }

  private createStandardTemplates(): void {
    // Placeholder pour autres templates standards
    // permit_rejection, permit_expiration, training_reminder, etc.
  }

  // =================== MÉTHODES UTILITAIRES ===================

  private createDefaultBranding(partial?: Partial<EmailBranding>): EmailBranding {
    return {
      logo: {
        url: 'https://app.permits.ca/logo.png',
        width: 200,
        height: 60,
        altText: { fr: 'Système de Permis', en: 'Permits System' }
      },
      colors: {
        primary: '#1e3a8a',
        secondary: '#64748b',
        accent: '#dc2626',
        text: '#1f2937',
        background: '#f8fafc',
        border: '#e2e8f0'
      },
      fonts: {
        heading: 'Arial, sans-serif',
        body: 'Arial, sans-serif',
        size: { heading: 18, body: 14, small: 12 }
      },
      footer: {
        fr: 'Système de Permis de Travail - Sécurité Industrielle',
        en: 'Work Permits System - Industrial Safety'
      },
      disclaimer: {
        fr: 'Ce message est généré automatiquement. Ne pas répondre à cette adresse.',
        en: 'This message is automatically generated. Do not reply to this address.'
      },
      ...partial
    };
  }

  private detectPreferredLanguage(recipients: EmailRecipient[]): 'fr' | 'en' {
    const languages = recipients
      .map(r => r.language)
      .filter(Boolean) as ('fr' | 'en')[];
    
    const frCount = languages.filter(lang => lang === 'fr').length;
    const enCount = languages.filter(lang => lang === 'en').length;
    
    return frCount >= enCount ? 'fr' : 'en';
  }

  private calculateMaxAlertLevel(readings: AtmosphericReading[]): string {
    const levels = ['safe', 'caution', 'warning', 'danger', 'critical', 'extreme'];
    const maxLevel = readings.reduce((max, reading) => {
      const currentIndex = levels.indexOf(reading.alarmLevel);
      const maxIndex = levels.indexOf(max);
      return currentIndex > maxIndex ? reading.alarmLevel : max;
    }, 'safe');
    
    return maxLevel;
  }

  private async generateAttachments(
    attachmentConfigs: EmailAttachment[], 
    context: EmailContext
  ): Promise<any[]> {
    const attachments = [];
    
    for (const config of attachmentConfigs) {
      if (config.generateOnSend) {
        // Générer pièce jointe dynamiquement
        const attachment = await this.generateDynamicAttachment(config, context);
        if (attachment) attachments.push(attachment);
      }
    }
    
    return attachments;
  }

  private async generateDynamicAttachment(
    config: EmailAttachment,
    context: EmailContext
  ): Promise<any | null> {
    // Placeholder pour génération dynamique d'attachments
    return null;
  }

  private async sendEmail(emailData: any): Promise<EmailSendResult> {
    // Placeholder pour envoi email réel (intégration avec service email)
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
      recipients: emailData.to.map((recipient: any) => ({
        email: recipient.email,
        status: 'sent' as const,
        deliveryTime: Date.now()
      })),
      metadata: {
        template: 'unknown',
        language: 'fr',
        sendTime: Date.now(),
        processingTime: 100,
        attachmentCount: emailData.attachments?.length || 0,
        attachmentSize: 0
      }
    };
  }
}

// =================== FONCTIONS UTILITAIRES ===================

/**
 * Créer manager avec branding personnalisé
 */
export function createEmailManager(branding?: Partial<EmailBranding>): EmailTemplateManager {
  return new EmailTemplateManager(branding);
}

/**
 * Envoyer notification permis rapide
 */
export async function sendQuickPermitNotification(
  type: 'approved' | 'rejected',
  permitId: string,
  recipientEmail: string,
  language: 'fr' | 'en' = 'fr'
): Promise<EmailSendResult> {
  const manager = new EmailTemplateManager();
  
  return manager.sendPermitNotification(
    type,
    { id: permitId } as LegalPermit,
    {} as PermitFormData,
    [{ type: 'to', email: recipientEmail, language }]
  );
}

/**
 * Envoyer alerte atmosphérique rapide
 */
export async function sendQuickAtmosphericAlert(
  reading: AtmosphericReading,
  emergencyEmails: string[]
): Promise<EmailSendResult> {
  const manager = new EmailTemplateManager();
  
  const recipients: EmailRecipient[] = emergencyEmails.map(email => ({
    type: 'to',
    email,
    role: 'emergency'
  }));
  
  return manager.sendAtmosphericAlert(
    [reading],
    [reading],
    recipients
  );
}

// =================== EXPORTS ===================
export default EmailTemplateManager;
