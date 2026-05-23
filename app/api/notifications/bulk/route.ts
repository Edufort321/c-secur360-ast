// =================== API NOTIFICATIONS BULK ===================
import { NextRequest, NextResponse } from 'next/server';

interface NotificationRecipient {
  id: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
}

interface BulkNotificationRequest {
  id: string;
  type: 'LOTO_CHANGE' | 'HAZARD_UPDATE' | 'EQUIPMENT_CHANGE' | 'EMERGENCY' | 'REMINDER';
  title: string;
  message: string;
  recipients: NotificationRecipient[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresConfirmation: boolean;
}

// Simulateur d'envoi bulk pour développement
async function sendBulkSMS(recipients: NotificationRecipient[], message: string) {
  const results = [];
  
  for (const recipient of recipients.filter(r => r.isActive)) {
    try {
      console.log(`📱 [BULK] Envoi à ${recipient.name} (${recipient.phone})`);
      console.log(`   Message: ${message.substring(0, 100)}...`);
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 500));
      
      results.push({
        recipientId: recipient.id,
        name: recipient.name,
        phone: recipient.phone,
        status: 'sent',
        messageId: `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        sentAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`❌ Erreur envoi à ${recipient.name}:`, error);
      results.push({
        recipientId: recipient.id,
        name: recipient.name,
        phone: recipient.phone,
        status: 'failed',
        error: error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : 'Unknown error',
        sentAt: new Date().toISOString()
      });
    }
  }
  
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const notification: BulkNotificationRequest = await request.json();
    
    // Validation
    if (!notification.recipients || notification.recipients.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucun destinataire spécifié',
          code: 'NO_RECIPIENTS'
        },
        { status: 400 }
      );
    }

    if (!notification.message || notification.message.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Message requis',
          code: 'NO_MESSAGE'
        },
        { status: 400 }
      );
    }

    const activeRecipients = notification.recipients.filter(r => r.isActive);
    
    if (activeRecipients.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucun destinataire actif trouvé',
          code: 'NO_ACTIVE_RECIPIENTS'
        },
        { status: 400 }
      );
    }

    console.log(`📧 [BULK] Envoi notification ${notification.type} à ${activeRecipients.length} destinataires`);
    console.log(`   Titre: ${notification.title}`);
    console.log(`   Priorité: ${notification.priority}`);

    // Envoyer à tous les destinataires
    const results = await sendBulkSMS(activeRecipients, notification.message);
    
    const successCount = results.filter(r => r.status === 'sent').length;
    const failureCount = results.filter(r => r.status === 'failed').length;

    // Log pour audit
    console.log(`✅ Notification bulk terminée:`, {
      notificationId: notification.id,
      type: notification.type,
      priority: notification.priority,
      totalRecipients: activeRecipients.length,
      successful: successCount,
      failed: failureCount,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      summary: {
        totalRecipients: activeRecipients.length,
        successful: successCount,
        failed: failureCount,
        successRate: Math.round((successCount / activeRecipients.length) * 100)
      },
      details: results,
      sentAt: new Date().toISOString(),
      message: `Notification envoyée à ${successCount}/${activeRecipients.length} destinataires`
    });

  } catch (error) {
    console.error('❌ Erreur API bulk notification:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur interne lors de l\'envoi des notifications',
        code: 'BULK_SEND_FAILED',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : "Unknown error") : undefined
      },
      { status: 500 }
    );
  }
}