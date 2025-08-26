import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auditHelpers } from '@/lib/audit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Webhook Twilio pour les status de livraison SMS
 * Met à jour le statut des SMS dans la base de données
 */
export async function POST(request: NextRequest) {
  try {
    // Parse du body Twilio (form-urlencoded)
    const formData = await request.formData();
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const to = formData.get('To') as string;
    const from = formData.get('From') as string;
    const errorCode = formData.get('ErrorCode') as string;
    const errorMessage = formData.get('ErrorMessage') as string;

    // Log du status reçu
    await auditHelpers.sms('status', {
      messageSid,
      messageStatus,
      to,
      from,
      errorCode,
      errorMessage: errorMessage?.substring(0, 100)
    });

    if (!messageSid || !messageStatus) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Mettre à jour le status dans la base de données
    try {
      // Chercher l'alerte SMS correspondante
      const { data: alerts, error: searchError } = await supabase
        .from('sms_alerts')
        .select('id, delivery_status')
        .contains('delivery_status', [{ sid: messageSid }]);

      if (searchError) {
        console.error('Erreur recherche SMS:', searchError);
      } else if (alerts && alerts.length > 0) {
        const alert = alerts[0];
        let updatedDeliveryStatus = alert.delivery_status || [];

        // Mettre à jour le status spécifique
        updatedDeliveryStatus = updatedDeliveryStatus.map((delivery: any) => {
          if (delivery.sid === messageSid) {
            return {
              ...delivery,
              status: messageStatus,
              updatedAt: new Date().toISOString(),
              errorCode: errorCode || null,
              errorMessage: errorMessage || null
            };
          }
          return delivery;
        });

        // Mettre à jour en base
        const { error: updateError } = await supabase
          .from('sms_alerts')
          .update({
            delivery_status: updatedDeliveryStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', alert.id);

        if (updateError) {
          console.error('Erreur mise à jour SMS status:', updateError);
        } else {
          console.log(`✅ SMS status mis à jour: ${messageSid} -> ${messageStatus}`);
        }
      }

      // Log spécial pour les erreurs
      if (errorCode || messageStatus === 'failed' || messageStatus === 'undelivered') {
        await auditHelpers.sms('status', {
          messageSid,
          status: messageStatus,
          error: true,
          errorCode,
          errorMessage,
          to
        });
      }

    } catch (error) {
      console.error('Erreur traitement status SMS:', error);
      
      await auditHelpers.sms('status', {
        messageSid,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    }

    // Toujours retourner 200 pour Twilio
    return NextResponse.json({ success: true });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    await auditHelpers.sms('status', {
      error: errorMsg,
      success: false
    });

    console.error('❌ Erreur webhook SMS status:', error);
    
    // Toujours 200 pour Twilio pour éviter les retry
    return NextResponse.json({ success: false, error: errorMsg });
  }
}