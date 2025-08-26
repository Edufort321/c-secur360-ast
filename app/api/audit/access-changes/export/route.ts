import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requirePermission } from '@/lib/auth/rbac-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Vérifier permissions admin pour export audit
    const authContext = await requirePermission('system.audit', 'global');
    
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const targetUser = searchParams.get('targetUser');

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
        status,
        created_at,
        users!audit_access_grants_user_id_fkey(email, full_name),
        target_users:users!audit_access_grants_target_user_id_fkey(email, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10000); // Limite pour export

    // Appliquer les mêmes filtres que l'API principale
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
      const { data: targetUsers } = await supabase
        .from('users')
        .select('id')
        .or(`email.ilike.%${targetUser}%,full_name.ilike.%${targetUser}%`);
      
      if (targetUsers && targetUsers.length > 0) {
        const targetUserIds = targetUsers.map(u => u.id);
        query = query.in('target_user_id', targetUserIds);
      }
    }

    const { data: entries, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Générer CSV
    const headers = [
      'Date/Heure',
      'Événement',
      'Statut',
      'Utilisateur',
      'Email Utilisateur',
      'Utilisateur Cible',
      'Email Cible',
      'Ressource',
      'Anciennes Valeurs',
      'Nouvelles Valeurs',
      'Adresse IP'
    ];

    const csvRows = [
      headers.join(','),
      ...(entries || []).map(entry => [
        `"${new Date(entry.created_at).toLocaleString('fr-FR')}"`,
        `"${entry.event_type}"`,
        `"${entry.status}"`,
        `"${entry.users?.full_name || 'N/A'}"`,
        `"${entry.users?.email || 'N/A'}"`,
        `"${entry.target_users?.full_name || 'N/A'}"`,
        `"${entry.target_users?.email || 'N/A'}"`,
        `"${entry.target_resource || 'N/A'}"`,
        `"${entry.old_values ? JSON.stringify(entry.old_values).replace(/"/g, '""') : 'N/A'}"`,
        `"${entry.new_values ? JSON.stringify(entry.new_values).replace(/"/g, '""') : 'N/A'}"`,
        `"${entry.ip_address || 'N/A'}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const buffer = Buffer.from('\uFEFF' + csvContent, 'utf8'); // BOM pour UTF-8

    console.log(`📊 Export audit: ${entries?.length || 0} entrées`);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="audit-access-${new Date().toISOString().split('T')[0]}.csv"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur export audit:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}