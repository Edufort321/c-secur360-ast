// =================== AUTOMATISATION FACTURATION ===================

export interface BillingRecord {
  id: string;
  organizationId: string;
  subscriptionId: string;
  periodStart: Date;
  periodEnd: Date;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
  invoiceNumber: string;
  dueDate: Date;
  items: BillingItem[];
  taxes: TaxInfo[];
  totalAmount: number;
  paymentMethod?: string;
  stripeInvoiceId?: string;
}

export interface BillingItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxable: boolean;
  category: 'subscription' | 'overage' | 'setup' | 'support';
}

export interface TaxInfo {
  name: string;
  rate: number;
  amount: number;
  jurisdiction: 'federal' | 'provincial' | 'municipal';
}

export interface RenewalReminder {
  subscriptionId: string;
  organizationName: string;
  contactEmail: string;
  daysUntilRenewal: number;
  reminderType: 'initial' | 'followup' | 'urgent' | 'expired';
  scheduledDate: Date;
  sent: boolean;
  sentDate?: Date;
}

// Configuration des taxes canadiennes par province
export const CANADIAN_TAX_RATES = {
  QC: { gst: 5, pst: 9.975, hst: 0 }, // Québec
  ON: { gst: 0, pst: 0, hst: 13 },    // Ontario
  BC: { gst: 5, pst: 7, hst: 0 },     // Colombie-Britannique
  AB: { gst: 5, pst: 0, hst: 0 },     // Alberta
  SK: { gst: 5, pst: 6, hst: 0 },     // Saskatchewan
  MB: { gst: 5, pst: 7, hst: 0 },     // Manitoba
  NS: { gst: 0, pst: 0, hst: 15 },    // Nouvelle-Écosse
  NB: { gst: 0, pst: 0, hst: 15 },    // Nouveau-Brunswick
  PE: { gst: 0, pst: 0, hst: 15 },    // Île-du-Prince-Édouard
  NL: { gst: 0, pst: 0, hst: 15 },    // Terre-Neuve-et-Labrador
  YT: { gst: 5, pst: 0, hst: 0 },     // Yukon
  NT: { gst: 5, pst: 0, hst: 0 },     // Territoires du Nord-Ouest
  NU: { gst: 5, pst: 0, hst: 0 }      // Nunavut
};

// Génération automatique des factures
export class BillingAutomation {
  
  // Générer le numéro de facture
  static generateInvoiceNumber(organizationId: string, date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const orgPrefix = organizationId.slice(-4).toUpperCase();
    const timestamp = date.getTime().toString().slice(-6);
    
    return `INV-${year}${month}-${orgPrefix}-${timestamp}`;
  }
  
  // Calculer les taxes selon la province
  static calculateTaxes(amount: number, province: string): TaxInfo[] {
    const taxes: TaxInfo[] = [];
    const rates = CANADIAN_TAX_RATES[province as keyof typeof CANADIAN_TAX_RATES];
    
    if (!rates) return taxes;
    
    if (rates.gst > 0) {
      taxes.push({
        name: 'TPS/GST',
        rate: rates.gst,
        amount: Number((amount * rates.gst / 100).toFixed(2)),
        jurisdiction: 'federal'
      });
    }
    
    if (rates.pst > 0) {
      const pstName = province === 'QC' ? 'TVQ' : 'PST';
      taxes.push({
        name: pstName,
        rate: rates.pst,
        amount: Number((amount * rates.pst / 100).toFixed(2)),
        jurisdiction: 'provincial'
      });
    }
    
    if (rates.hst > 0) {
      taxes.push({
        name: 'HST',
        rate: rates.hst,
        amount: Number((amount * rates.hst / 100).toFixed(2)),
        jurisdiction: 'federal'
      });
    }
    
    return taxes;
  }
  
  // Créer une facture automatiquement
  static async generateInvoice(
    subscription: any,
    billingPeriodStart: Date,
    billingPeriodEnd: Date
  ): Promise<BillingRecord> {
    const invoiceNumber = this.generateInvoiceNumber(subscription.organizationId, new Date());
    
    // Items de facturation de base
    const items: BillingItem[] = [
      {
        description: `Abonnement ${subscription.planName} - ${billingPeriodStart.toLocaleDateString()} au ${billingPeriodEnd.toLocaleDateString()}`,
        quantity: 1,
        unitPrice: subscription.amount,
        amount: subscription.amount,
        taxable: true,
        category: 'subscription'
      }
    ];
    
    // Ajouter les frais de dépassement si applicable
    if (subscription.usage && subscription.overages) {
      subscription.overages.forEach((overage: any) => {
        items.push({
          description: `Dépassement ${overage.type} (${overage.quantity} unités)`,
          quantity: overage.quantity,
          unitPrice: overage.unitPrice,
          amount: overage.amount,
          taxable: true,
          category: 'overage'
        });
      });
    }
    
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxes = this.calculateTaxes(subtotal, subscription.billingAddress?.province || 'QC');
    const totalTaxes = taxes.reduce((sum, tax) => sum + tax.amount, 0);
    const totalAmount = subtotal + totalTaxes;
    
    const billingRecord: BillingRecord = {
      id: `billing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId: subscription.organizationId,
      subscriptionId: subscription.id,
      periodStart: billingPeriodStart,
      periodEnd: billingPeriodEnd,
      amount: subtotal,
      currency: 'CAD',
      status: 'draft',
      invoiceNumber,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      items,
      taxes,
      totalAmount,
      stripeInvoiceId: subscription.stripeInvoiceId
    };
    
    return billingRecord;
  }
  
  // Générer un fichier comptable (CSV pour intégration)
  static generateAccountingFile(billingRecords: BillingRecord[], format: 'csv' | 'qbx' = 'csv'): string {
    if (format === 'csv') {
      const headers = [
        'Date',
        'Numéro Facture',
        'Client',
        'Description',
        'Montant',
        'TPS',
        'TVQ/PST',
        'Total',
        'Statut',
        'Échéance'
      ];
      
      const rows = billingRecords.map(record => [
        record.periodStart.toLocaleDateString('fr-CA'),
        record.invoiceNumber,
        record.organizationId,
        record.items.map(item => item.description).join(' | '),
        record.amount.toFixed(2),
        record.taxes.find(t => t.name.includes('TPS') || t.name.includes('GST'))?.amount?.toFixed(2) || '0.00',
        record.taxes.find(t => t.name.includes('TVQ') || t.name.includes('PST') || t.name.includes('HST'))?.amount?.toFixed(2) || '0.00',
        record.totalAmount.toFixed(2),
        record.status,
        record.dueDate.toLocaleDateString('fr-CA')
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    // Format QuickBooks (QBX) - structure XML simplifiée
    const qbxData = billingRecords.map(record => ({
      invoice: {
        id: record.invoiceNumber,
        customer: record.organizationId,
        date: record.periodStart.toISOString().split('T')[0],
        dueDate: record.dueDate.toISOString().split('T')[0],
        subtotal: record.amount,
        tax: record.taxes.reduce((sum, tax) => sum + tax.amount, 0),
        total: record.totalAmount,
        items: record.items
      }
    }));
    
    return JSON.stringify(qbxData, null, 2);
  }
  
  // Planification des rappels de renouvellement
  static generateRenewalReminders(subscriptions: any[]): RenewalReminder[] {
    const reminders: RenewalReminder[] = [];
    const now = new Date();
    
    subscriptions.forEach(subscription => {
      const renewalDate = new Date(subscription.currentPeriodEnd);
      const daysUntilRenewal = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Rappel 30 jours avant
      if (daysUntilRenewal <= 30 && daysUntilRenewal > 25) {
        reminders.push({
          subscriptionId: subscription.id,
          organizationName: subscription.organizationName,
          contactEmail: subscription.contactEmail,
          daysUntilRenewal,
          reminderType: 'initial',
          scheduledDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          sent: false
        });
      }
      
      // Rappel 7 jours avant
      if (daysUntilRenewal <= 7 && daysUntilRenewal > 5) {
        reminders.push({
          subscriptionId: subscription.id,
          organizationName: subscription.organizationName,
          contactEmail: subscription.contactEmail,
          daysUntilRenewal,
          reminderType: 'followup',
          scheduledDate: new Date(now.getTime() + 12 * 60 * 60 * 1000),
          sent: false
        });
      }
      
      // Rappel 1 jour avant
      if (daysUntilRenewal === 1) {
        reminders.push({
          subscriptionId: subscription.id,
          organizationName: subscription.organizationName,
          contactEmail: subscription.contactEmail,
          daysUntilRenewal,
          reminderType: 'urgent',
          scheduledDate: new Date(now.getTime() + 6 * 60 * 60 * 1000),
          sent: false
        });
      }
      
      // Rappel après expiration
      if (daysUntilRenewal < 0) {
        reminders.push({
          subscriptionId: subscription.id,
          organizationName: subscription.organizationName,
          contactEmail: subscription.contactEmail,
          daysUntilRenewal,
          reminderType: 'expired',
          scheduledDate: now,
          sent: false
        });
      }
    });
    
    return reminders;
  }
  
  // Template d'email pour les rappels
  static getRenewalEmailTemplate(reminder: RenewalReminder): {
    subject: string;
    htmlBody: string;
    textBody: string;
  } {
    const templates = {
      initial: {
        subject: `[C-SECUR360] Renouvellement dans ${reminder.daysUntilRenewal} jours - ${reminder.organizationName}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Rappel de renouvellement</h2>
            <p>Bonjour,</p>
            <p>Votre abonnement C-SECUR360 arrive à échéance dans <strong>${reminder.daysUntilRenewal} jours</strong>.</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Organisation:</strong> ${reminder.organizationName}</p>
              <p><strong>Échéance:</strong> Dans ${reminder.daysUntilRenewal} jours</p>
            </div>
            <p>Pour assurer la continuité de votre service, veuillez vous connecter à votre compte pour renouveler votre abonnement.</p>
            <a href="https://app.c-secur360.com/billing" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
              Renouveler maintenant
            </a>
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            <p>L'équipe C-SECUR360</p>
          </div>
        `,
        textBody: `Bonjour,\n\nVotre abonnement C-SECUR360 arrive à échéance dans ${reminder.daysUntilRenewal} jours.\n\nPour renouveler: https://app.c-secur360.com/billing\n\nL'équipe C-SECUR360`
      },
      
      followup: {
        subject: `[URGENT] Renouvellement dans ${reminder.daysUntilRenewal} jours - ${reminder.organizationName}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 20px;">
              <h2 style="color: #92400e; margin: 0;">⚠️ Renouvellement urgent requis</h2>
            </div>
            <p>Bonjour,</p>
            <p>Votre abonnement C-SECUR360 expire dans seulement <strong>${reminder.daysUntilRenewal} jours</strong>.</p>
            <p style="color: #dc2626;"><strong>Important:</strong> Sans renouvellement, votre accès aux fonctionnalités sera suspendu.</p>
            <a href="https://app.c-secur360.com/billing" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
              Renouveler maintenant
            </a>
            <p>L'équipe C-SECUR360</p>
          </div>
        `,
        textBody: `⚠️ URGENT - Votre abonnement expire dans ${reminder.daysUntilRenewal} jours.\n\nRenouveler maintenant: https://app.c-secur360.com/billing`
      },
      
      urgent: {
        subject: `[DERNIER JOUR] Renouvellement requis - ${reminder.organizationName}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #fecaca; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 20px;">
              <h2 style="color: #991b1b; margin: 0;">🚨 DERNIER JOUR DE SERVICE</h2>
            </div>
            <p>Votre abonnement expire <strong>demain</strong>. Renouvelez maintenant pour éviter l'interruption de service.</p>
            <a href="https://app.c-secur360.com/billing" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
              RENOUVELER MAINTENANT
            </a>
          </div>
        `,
        textBody: `🚨 DERNIER JOUR - Renouveler maintenant: https://app.c-secur360.com/billing`
      },
      
      expired: {
        subject: `[SUSPENDU] Renouvellement requis - ${reminder.organizationName}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 16px; margin-bottom: 20px;">
              <h2 style="color: #374151; margin: 0;">🔒 Service suspendu</h2>
            </div>
            <p>Votre abonnement a expiré. Votre compte est temporairement suspendu.</p>
            <p>Renouvelez maintenant pour réactiver votre service:</p>
            <a href="https://app.c-secur360.com/billing" style="background: #374151; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
              Réactiver mon compte
            </a>
          </div>
        `,
        textBody: `Service suspendu - Renouveler: https://app.c-secur360.com/billing`
      }
    };
    
    return templates[reminder.reminderType];
  }
  
  // Fonction pour envoyer les rappels automatiques
  static async sendRenewalReminders(reminders: RenewalReminder[]): Promise<void> {
    for (const reminder of reminders) {
      if (reminder.sent || reminder.scheduledDate > new Date()) {
        continue;
      }
      
      try {
        const template = this.getRenewalEmailTemplate(reminder);
        
        // Appel à l'API d'envoi d'email (SendGrid, etc.)
        const emailData = {
          to: reminder.contactEmail,
          subject: template.subject,
          html: template.htmlBody,
          text: template.textBody,
          tags: ['renewal-reminder', reminder.reminderType],
          customArgs: {
            subscriptionId: reminder.subscriptionId,
            reminderType: reminder.reminderType
          }
        };
        
        // Ici, intégrer avec votre service d'email
        console.log('Sending renewal reminder:', emailData);
        
        // Marquer comme envoyé
        reminder.sent = true;
        reminder.sentDate = new Date();
        
      } catch (error) {
        console.error('Erreur envoi rappel de renouvellement:', error);
      }
    }
  }
}

// Tâche cron pour l'automatisation
export const billingCronJobs = {
  
  // Tous les jours à 9h00 - Vérifier les renouvellements
  async checkRenewals() {
    console.log('🔄 Vérification des renouvellements...');
    
    try {
      // Récupérer toutes les subscriptions actives
      const subscriptions = await fetch('/api/admin/subscriptions').then(r => r.json());
      
      // Générer les rappels
      const reminders = BillingAutomation.generateRenewalReminders(subscriptions);
      
      // Envoyer les rappels programmés
      await BillingAutomation.sendRenewalReminders(reminders);
      
      console.log(`✅ ${reminders.length} rappels traités`);
      
    } catch (error) {
      console.error('❌ Erreur vérification renouvellements:', error);
    }
  },
  
  // Le 1er de chaque mois - Générer les factures
  async generateMonthlyInvoices() {
    console.log('📄 Génération des factures mensuelles...');
    
    try {
      // Récupérer les abonnements mensuels
      const monthlySubscriptions = await fetch('/api/admin/subscriptions?cycle=monthly').then(r => r.json());
      
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      for (const subscription of monthlySubscriptions) {
        const invoice = await BillingAutomation.generateInvoice(subscription, periodStart, periodEnd);
        
        // Sauvegarder la facture
        await fetch('/api/admin/billing/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoice)
        });
      }
      
      console.log(`✅ ${monthlySubscriptions.length} factures générées`);
      
    } catch (error) {
      console.error('❌ Erreur génération factures:', error);
    }
  }
};