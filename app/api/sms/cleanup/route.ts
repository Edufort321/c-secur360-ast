import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { audit, auditHelpers } from '@/lib/audit';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Vérification que c'est bien un cron Vercel
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
      await audit('sms', 'cleanup_unauthorized', { 
        ip: request.ip,
        userAgent: request.headers.get('user-agent') 
      });
      
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await auditHelpers.config('sms_cleanup_start', { 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV 
    });

    let deletedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      // Date limite : 180 jours (6 mois)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

      // 1. Compter les SMS à supprimer
      const { count: totalToDelete } = await supabase
        .from('sms_alerts')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', sixMonthsAgo.toISOString());

      if (!totalToDelete || totalToDelete === 0) {
        await auditHelpers.config('sms_cleanup_complete', {
          deletedCount: 0,
          message: 'No SMS to cleanup'
        });

        return NextResponse.json({
          success: true,
          message: 'No SMS messages to cleanup',
          stats: {
            deletedCount: 0,
            errorCount: 0,
            cutoffDate: sixMonthsAgo.toISOString()
          }
        });
      }

      // 2. Supprimer les anciens SMS par batch de 1000
      const batchSize = 1000;
      let totalDeleted = 0;

      while (totalDeleted < totalToDelete) {
        try {
          // Récupérer un batch d'IDs à supprimer
          const { data: batchToDelete, error: selectError } = await supabase
            .from('sms_alerts')
            .select('id')
            .lt('created_at', sixMonthsAgo.toISOString())
            .limit(batchSize);

          if (selectError) {
            errors.push(`Select batch error: ${selectError.message}`);
            errorCount++;
            break;
          }

          if (!batchToDelete || batchToDelete.length === 0) {
            break;
          }

          // Supprimer ce batch
          const idsToDelete = batchToDelete.map(item => item.id);
          const { error: deleteError } = await supabase
            .from('sms_alerts')
            .delete()
            .in('id', idsToDelete);

          if (deleteError) {
            errors.push(`Delete batch error: ${deleteError.message}`);
            errorCount++;
            break;
          }

          totalDeleted += batchToDelete.length;
          deletedCount += batchToDelete.length;

          // Petit délai pour éviter de surcharger la DB
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (batchError) {
          const errorMsg = batchError instanceof Error ? batchError.message : 'Unknown batch error';
          errors.push(`Batch error: ${errorMsg}`);
          errorCount++;
          break;
        }
      }

      // 3. Nettoyer aussi les logs d'audit anciens (optionnel - garder 1 an)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { error: auditCleanupError } = await supabase
        .from('system_audit_logs')
        .delete()
        .lt('created_at', oneYearAgo.toISOString());

      if (auditCleanupError) {
        errors.push(`Audit cleanup error: ${auditCleanupError.message}`);
        errorCount++;
      }

      await auditHelpers.config('sms_cleanup_complete', {
        deletedCount,
        errorCount,
        totalToDelete,
        cutoffDate: sixMonthsAgo.toISOString(),
        errors: errors.slice(0, 5)
      });

      return NextResponse.json({
        success: true,
        message: 'SMS cleanup completed',
        stats: {
          deletedCount,
          errorCount,
          totalToDelete,
          cutoffDate: sixMonthsAgo.toISOString()
        },
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined
      });

    } catch (cleanupError) {
      const errorMsg = cleanupError instanceof Error ? cleanupError.message : 'Unknown cleanup error';
      
      await audit('sms', 'cleanup_error', {
        error: errorMsg,
        deletedCount,
        errorCount
      });

      return NextResponse.json({
        success: false,
        error: 'SMS cleanup failed',
        details: errorMsg,
        stats: { deletedCount, errorCount }
      }, { status: 500 });
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    await audit('sms', 'cleanup_critical_error', {
      error: errorMsg,
      timestamp: new Date().toISOString()
    });

    console.error('❌ SMS cleanup critical error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Critical SMS cleanup error',
      details: errorMsg
    }, { status: 500 });
  }
}