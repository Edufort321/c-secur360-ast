import { NextRequest, NextResponse } from 'next/server';
import { BillingAutomation } from '../../../../lib/billing-automation';

// GET - Obtenir les données de facturation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const format = searchParams.get('format') || 'json';
    const export_type = searchParams.get('export');

    // Simulation de données - À remplacer par vraies requêtes DB
    const mockBillingData = {
      subscriptions: [
        {
          id: 'sub_1',
          organizationId: 'org_hydro',
          organizationName: 'Hydro-Québec',
          contactEmail: 'facturation@hydroquebec.com',
          plan: 'enterprise',
          planName: 'Entreprise',
          status: 'active',
          amount: 1990,
          currency: 'CAD',
          billingCycle: 'annually',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-12-31',
          stripeCustomerId: 'cus_enterprise_1',
          stripeInvoiceId: 'in_enterprise_1',
          billingAddress: { province: 'QC' },
          usage: {
            users: 85,
            maxUsers: 100,
            astCount: 1250,
            storageUsed: 320,
            maxStorage: 500
          }
        },
        {
          id: 'sub_2',
          organizationId: 'org_abc',
          organizationName: 'Construction ABC Inc.',
          contactEmail: 'admin@abc-construction.com',
          plan: 'professional',
          planName: 'Professionnel',
          status: 'active',
          amount: 79,
          currency: 'CAD',
          billingCycle: 'monthly',
          currentPeriodStart: '2024-08-01',
          currentPeriodEnd: '2024-09-01',
          stripeCustomerId: 'cus_pro_2',
          billingAddress: { province: 'QC' },
          usage: {
            users: 18,
            maxUsers: 25,
            astCount: 345,
            storageUsed: 28,
            maxStorage: 50
          }
        }
      ],
      stats: {
        totalRevenue: 15670,
        monthlyRecurringRevenue: 2890,
        annualRecurringRevenue: 34680,
        totalCustomers: 47,
        activeSubscriptions: 42,
        trialSubscriptions: 5,
        churnRate: 3.2,
        averageRevenuePerUser: 68.50,
        upcomingRenewals: 8,
        failedPayments: 2
      }
    };

    // Si export demandé, générer le fichier comptable
    if (export_type) {
      console.log('📊 Génération export comptable:', export_type);
      
      // Générer les factures pour export
      const billingRecords = [];
      
      for (const subscription of mockBillingData.subscriptions) {
        const periodStart = new Date(subscription.currentPeriodStart);
        const periodEnd = new Date(subscription.currentPeriodEnd);
        
        const invoice = await BillingAutomation.generateInvoice(
          subscription,
          periodStart,
          periodEnd
        );
        
        billingRecords.push(invoice);
      }
      
      // Générer le fichier selon le format
      let fileContent: string;
      let contentType: string;
      let fileName: string;
      
      switch (export_type) {
        case 'csv':
          fileContent = BillingAutomation.generateAccountingFile(billingRecords, 'csv');
          contentType = 'text/csv';
          fileName = `facturation_${new Date().toISOString().split('T')[0]}.csv`;
          break;
          
        case 'excel':
          // Pour Excel, utiliser CSV pour simplifier (peut être amélioré avec xlsx)
          fileContent = BillingAutomation.generateAccountingFile(billingRecords, 'csv');
          contentType = 'application/vnd.ms-excel';
          fileName = `facturation_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
          
        case 'qbx':
          fileContent = BillingAutomation.generateAccountingFile(billingRecords, 'qbx');
          contentType = 'application/json';
          fileName = `facturation_quickbooks_${new Date().toISOString().split('T')[0]}.qbx`;
          break;
          
        default:
          throw new Error('Format d\'export non supporté');
      }
      
      // Retourner le fichier
      const response = new NextResponse(fileContent);
      response.headers.set('Content-Type', contentType);
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      response.headers.set('Cache-Control', 'no-cache');
      
      return response;
    }

    // Retour des données JSON normales
    return NextResponse.json({
      success: true,
      data: mockBillingData,
      period,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur API facturation:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des données de facturation',
        details: error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// POST - Créer une facture ou traiter une action de facturation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, subscriptionId, data } = body;

    console.log('💳 Action facturation:', { action, subscriptionId });

    switch (action) {
      case 'generate_invoice':
        // Générer une facture manuellement
        const subscription = data.subscription;
        const periodStart = new Date(data.periodStart);
        const periodEnd = new Date(data.periodEnd);
        
        const invoice = await BillingAutomation.generateInvoice(
          subscription,
          periodStart,
          periodEnd
        );
        
        // Ici, sauvegarder en DB
        console.log('📄 Facture générée:', invoice);
        
        return NextResponse.json({
          success: true,
          invoice,
          message: 'Facture générée avec succès'
        });

      case 'send_renewal_reminder':
        // Envoyer un rappel de renouvellement
        const reminders = BillingAutomation.generateRenewalReminders([data.subscription]);
        
        if (reminders.length > 0) {
          await BillingAutomation.sendRenewalReminders(reminders);
          
          return NextResponse.json({
            success: true,
            message: 'Rappel de renouvellement envoyé',
            remindersSent: reminders.length
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'Aucun rappel à envoyer pour cette période'
          });
        }

      case 'update_billing_settings':
        // Mettre à jour les paramètres de facturation automatique
        const settings = data.settings;
        
        // Ici, sauvegarder les paramètres en DB
        console.log('⚙️ Paramètres facturation mis à jour:', settings);
        
        return NextResponse.json({
          success: true,
          message: 'Paramètres de facturation mis à jour',
          settings
        });

      case 'process_failed_payment':
        // Traiter un paiement échoué
        console.log('💳 Traitement paiement échoué:', subscriptionId);
        
        // Logique de traitement des paiements échoués
        // - Envoyer notification
        // - Marquer comme en retard
        // - Déclencher processus de relance
        
        return NextResponse.json({
          success: true,
          message: 'Paiement échoué traité',
          actions: ['email_sent', 'status_updated', 'retry_scheduled']
        });

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Action non reconnue' 
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Erreur action facturation:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors du traitement de l\'action',
        details: error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le statut de facturation
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, status, notes } = body;

    console.log('📝 Mise à jour statut facture:', { invoiceId, status });

    // Ici, mettre à jour la facture en DB
    const updatedInvoice = {
      id: invoiceId,
      status,
      notes,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: 'Statut de facture mis à jour'
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour facture:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour',
        details: error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}