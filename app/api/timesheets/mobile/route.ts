import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requirePermission } from '@/lib/auth/rbac-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const active = searchParams.get('active') === 'true';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Vérifier permissions (utilisateur peut voir ses propres feuilles ou admin)
    const authContext = await requirePermission('timesheets.view_own', 'global');
    
    // Vérifier si l'utilisateur peut voir ces feuilles de temps
    if (authContext.user.id !== userId && 
        !authContext.hasPermission('timesheets.view_all', 'global')) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    const supabase = createClient();

    // Récupérer entrée active
    let activeEntry = null;
    if (active) {
      const { data } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      activeEntry = data?.[0] || null;
    }

    // Récupérer entrées récentes du jour
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;
    
    const { data: recentEntries, error } = await supabase
      .from('timesheet_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      activeEntry,
      recentEntries: recentEntries || [],
      date
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur mobile timesheets:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier permissions de création
    const authContext = await requirePermission('timesheets.create', 'global');

    const entry = await request.json();
    
    // Validation des données
    if (!entry.user_id || !entry.task_description) {
      return NextResponse.json(
        { error: 'user_id et task_description requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur peut créer pour cet utilisateur
    if (authContext.user.id !== entry.user_id && 
        !authContext.hasPermission('timesheets.manage', 'global')) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    const supabase = createClient();

    // Vérifier qu'il n'y a pas déjà une entrée active
    const { data: existing } = await supabase
      .from('timesheet_entries')
      .select('id')
      .eq('user_id', entry.user_id)
      .in('status', ['active', 'paused'])
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Une tâche est déjà en cours' },
        { status: 400 }
      );
    }

    // Créer nouvelle entrée
    const { data: newEntry, error } = await supabase
      .from('timesheet_entries')
      .insert({
        user_id: entry.user_id,
        project_id: entry.project_id,
        task_description: entry.task_description,
        start_time: entry.start_time || new Date().toISOString(),
        location_start: entry.location_start,
        is_billable: entry.is_billable !== false, // Par défaut: billable
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    console.log(`⏰ Timer démarré par ${authContext.user.email}: ${entry.task_description}`);

    return NextResponse.json(newEntry, { status: 201 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur création timesheet mobile:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}