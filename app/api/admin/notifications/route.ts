import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AdminNotification {
  id?: string;
  type: 'payment' | 'subscription' | 'lead' | 'system' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: any;
  recipient_email: string;
  status: 'unread' | 'read' | 'archived';
  created_at?: string;
  read_at?: string;
  source?: string;
}

// Configuration des services de notification
const NOTIFICATION_SERVICES = {
  // Configuration Make.com webhook pour automation
  MAKE_WEBHOOK_URL: process.env.MAKE_WEBHOOK_URL,
  
  // Configuration email (à adapter selon votre provider)
  EMAIL_FROM: process.env.EMAIL_FROM || 'notifications@c-secur360.com',
  
  // Configuration SMS (exemple avec Twilio)
  TWILIO_PHONE: process.env.TWILIO_PHONE,
  
  // Configuration Slack
  SLACK_WEBHOOK: process.env.SLACK_WEBHOOK_URL
};

// Fonction pour vérifier l'authentification admin
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.email === 'eric.dufort@cerdia.ai' && decoded.role === 'super_admin') {
      return decoded;
    }
  } catch (error) {
    console.error('Erreur décodage token:', error);
  }
  
  return null;
}

// Envoyer notification via Make.com webhook
async function sendMakeWebhook(notification: AdminNotification) {
  if (!NOTIFICATION_SERVICES.MAKE_WEBHOOK_URL) return false;

  try {
    const response = await fetch(NOTIFICATION_SERVICES.MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trigger: 'c360_admin_notification',
        notification: {
          type: notification.type,
          priority: notification.priority,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          recipient: notification.recipient_email,
          timestamp: new Date().toISOString()
        }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Erreur envoi Make webhook:', error);
    return false;
  }
}

// Envoyer notification email (exemple d'intégration)
async function sendEmailNotification(notification: AdminNotification) {
  try {
    // Ici vous pouvez intégrer votre service d'email préféré:
    // - Resend, SendGrid, Mailgun, Amazon SES, etc.
    
    const emailData = {
      to: notification.recipient_email,
      from: NOTIFICATION_SERVICES.EMAIL_FROM,
      subject: `[C-SECUR360] ${notification.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">C-SECUR360 Admin</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${notification.title}</p>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <div style="background: ${
              notification.priority === 'critical' ? '#fee2e2' : 
              notification.priority === 'high' ? '#fef3c7' : 
              notification.priority === 'medium' ? '#dbeafe' : '#f3f4f6'
            }; border-left: 4px solid ${
              notification.priority === 'critical' ? '#dc2626' : 
              notification.priority === 'high' ? '#d97706' : 
              notification.priority === 'medium' ? '#2563eb' : '#6b7280'
            }; padding: 16px; margin-bottom: 20px;">
              <p style="margin: 0; color: ${
                notification.priority === 'critical' ? '#7f1d1d' : 
                notification.priority === 'high' ? '#92400e' : 
                notification.priority === 'medium' ? '#1e40af' : '#374151'
              }; font-weight: 500;">
                Priorité: ${notification.priority.toUpperCase()}
              </p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">
                ${notification.message}
              </p>
            </div>
            
            ${notification.data ? `
              <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h3 style="color: #374151; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Détails:</h3>
                <pre style="background: white; padding: 12px; border-radius: 4px; font-size: 12px; overflow-x: auto; margin: 0; color: #6b7280;">${JSON.stringify(notification.data, null, 2)}</pre>
              </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                Voir le Dashboard Admin
              </a>
            </div>
            
            <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              <p>C-SECUR360 Admin Notifications</p>
              <p>Généré le ${new Date().toLocaleString('fr-CA')}</p>
            </div>
          </div>
        </div>
      `
    };

    // Remplacez par votre service d'email
    console.log('📧 Email à envoyer:', emailData);
    
    // Exemple avec Resend:
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(emailData)
    // });
    
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
}

// Sauvegarder la notification dans Supabase
async function saveNotification(notification: AdminNotification) {
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        recipient_email: notification.recipient_email,
        status: 'unread',
        source: notification.source || 'system',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur sauvegarde notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erreur saveNotification:', error);
    return null;
  }
}

// GET: Récupérer les notifications
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminAuth(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('admin_notifications')
      .select('*')
      .eq('recipient_email', adminUser.email)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Erreur récupération notifications' },
        { status: 500 }
      );
    }

    // Statistiques
    const stats = {
      total: data.length,
      unread: data.filter(n => n.status === 'unread').length,
      critical: data.filter(n => n.priority === 'critical').length,
      high: data.filter(n => n.priority === 'high').length,
    };

    return NextResponse.json({
      notifications: data,
      stats,
      retrieved_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur GET notifications:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST: Créer une nouvelle notification
export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminAuth(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      type,
      priority = 'medium',
      title,
      message,
      data,
      send_email = false,
      send_webhook = false
    } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'type, title et message requis' },
        { status: 400 }
      );
    }

    const notification: AdminNotification = {
      type,
      priority,
      title,
      message,
      data,
      recipient_email: adminUser.email,
      status: 'unread',
      source: 'manual'
    };

    // Sauvegarder en base
    const saved = await saveNotification(notification);
    if (!saved) {
      return NextResponse.json(
        { error: 'Erreur sauvegarde notification' },
        { status: 500 }
      );
    }

    // Envoyer via les canaux demandés
    const results = {
      saved: true,
      email_sent: false,
      webhook_sent: false
    };

    if (send_email) {
      results.email_sent = await sendEmailNotification(notification);
    }

    if (send_webhook) {
      results.webhook_sent = await sendMakeWebhook(notification);
    }

    return NextResponse.json({
      success: true,
      notification: saved,
      delivery_results: results,
      created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur POST notification:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH: Marquer comme lue
export async function PATCH(request: NextRequest) {
  try {
    const adminUser = await verifyAdminAuth(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notification_id, status } = body;

    if (!notification_id || !status) {
      return NextResponse.json(
        { error: 'notification_id et status requis' },
        { status: 400 }
      );
    }

    const updates: any = { status };
    if (status === 'read') {
      updates.read_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('admin_notifications')
      .update(updates)
      .eq('id', notification_id)
      .eq('recipient_email', adminUser.email)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Erreur mise à jour notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: data,
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur PATCH notification:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}