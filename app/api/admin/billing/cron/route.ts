import { NextRequest, NextResponse } from 'next/server';
import { billingCronJobs } from '../../../../../lib/billing-automation';

// POST - Déclencher les tâches cron manuellement (pour tests)
export async function POST(request: NextRequest) {
  try {
    // Securite (#8) : secret de cron requis dans TOUS les environnements (fail-secure, pas de bypass 'force').
    const cronSecret = process.env.CRON_SECRET;
    const authToken = request.headers.get('authorization');
    if (!cronSecret || authToken !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { job } = body;

    console.log(`🤖 Exécution tâche cron: ${job}`);

    let result;
    
    switch (job) {
      case 'check_renewals':
        await billingCronJobs.checkRenewals();
        result = { message: 'Vérification des renouvellements terminée' };
        break;
        
      case 'generate_invoices':
        await billingCronJobs.generateMonthlyInvoices();
        result = { message: 'Génération des factures terminée' };
        break;
        
      case 'all':
        await billingCronJobs.checkRenewals();
        await billingCronJobs.generateMonthlyInvoices();
        result = { message: 'Toutes les tâches cron exécutées' };
        break;
        
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Tâche cron inconnue',
            availableJobs: ['check_renewals', 'generate_invoices', 'all']
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      job,
      result,
      executedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur tâche cron:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de l\'exécution de la tâche cron',
        details: error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// GET - Obtenir le statut des tâches cron
export async function GET() {
  try {
    // Informations sur les tâches cron configurées
    const cronStatus = {
      jobs: [
        {
          name: 'check_renewals',
          description: 'Vérification des renouvellements et envoi de rappels',
          schedule: 'Tous les jours à 9h00',
          enabled: true,
          lastRun: '2024-08-19T09:00:00Z', // À récupérer de la DB
          nextRun: '2024-08-20T09:00:00Z'
        },
        {
          name: 'generate_invoices',
          description: 'Génération automatique des factures mensuelles',
          schedule: 'Le 1er de chaque mois à 10h00',
          enabled: true,
          lastRun: '2024-08-01T10:00:00Z',
          nextRun: '2024-09-01T10:00:00Z'
        }
      ],
      systemInfo: {
        timezone: 'America/Montreal',
        currentTime: new Date().toISOString(),
        cronProvider: process.env.VERCEL_ENV === 'production' ? 'Vercel Cron' : 'Manual'
      },
      settings: {
        reminderDays: [30, 7, 1], // Jours avant renouvellement pour envoyer rappels
        autoInvoicing: true,
        emailNotifications: true,
        slackNotifications: process.env.SLACK_WEBHOOK_URL ? true : false
      }
    };

    return NextResponse.json({
      success: true,
      data: cronStatus
    });

  } catch (error) {
    console.error('❌ Erreur statut cron:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération du statut',
        details: error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}