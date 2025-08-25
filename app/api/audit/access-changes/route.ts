import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requirePermission } from '@/lib/auth/rbac-helpers';

export async function GET(request: NextRequest) {
  try {
    // Vérifier permissions admin pour voir l'audit
    const authContext = await requirePermission('system.audit', 'global');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const resourceType = searchParams.get('resourceType');
    const eventType = searchParams.get('eventType');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const targetUser = searchParams.get('targetUser');
    const limit = parseInt(searchParams.get('limit') || '100');

    const supabase = createClient();
    
    let query = supabase
      .from('audit_access_grants')
      .select(`
        id,
        user_id,
        event_type,
        target_user_id,
        target_resource,
        old_values,
        new_values,
        ip_address,
        user_agent,
        status,
        metadata,
        created_at,
        users!audit_access_grants_user_id_fkey(email, full_name),
        target_users:users!audit_access_grants_target_user_id_fkey(email, full_name)
      `)
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (resourceType) {
      query = query.ilike('target_resource', `%${resourceType}%`);
    }
    
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (dateFrom) {
      query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
    }
    
    if (dateTo) {
      query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);
    }
    
    if (targetUser) {
      // Recherche dans les emails des utilisateurs cibles
      const { data: targetUsers } = await supabase
        .from('users')
        .select('id')
        .or(`email.ilike.%${targetUser}%,full_name.ilike.%${targetUser}%`);
      
      if (targetUsers && targetUsers.length > 0) {
        const targetUserIds = targetUsers.map(u => u.id);
        query = query.in('target_user_id', targetUserIds);
      }
    }
    
    query = query.limit(limit);

    const { data: entries, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      entries: entries || [],
      total: entries?.length || 0
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur récupération audit:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'audit' },
      { status: 500 }
    );
  }
}

// Helper pour logger un changement d'accès
export async function logAccessChange(
  userId: string,
  eventType: string,
  targetUserId?: string,
  targetResource?: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const supabase = createClient();
    
    await supabase
      .from('audit_access_grants')
      .insert({
        user_id: userId,
        event_type: eventType,
        target_user_id: targetUserId,
        target_resource: targetResource,
        old_values: oldValues,
        new_values: newValues,
        metadata,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'success',
        created_at: new Date().toISOString()
      });
    
    console.log(`📋 Audit logged: ${eventType} by ${userId}`);
  } catch (error) {
    console.error('❌ Error logging audit:', error);
  }
}