import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requirePermission } from '@/lib/auth/rbac-helpers';

export async function POST(request: NextRequest) {
  try {
    const authContext = await requirePermission('timesheets.create', 'global');
    const {
      taskId,
      projectId,
      clientId,
      assignedUsers,
      startDate,
      endDate,
      estimatedHours,
      billingCode
    } = await request.json();

    if (!taskId || !projectId || !assignedUsers?.length) {
      return NextResponse.json({ 
        error: 'taskId, projectId et assignedUsers requis' 
      }, { status: 400 });
    }

    const supabase = createClient();

    // Calculer la répartition des heures par jour
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    const hoursPerDay = estimatedHours / totalDays;
    const hoursPerUserPerDay = hoursPerDay / assignedUsers.length;

    let createdTimesheets = 0;
    const timesheetEntries = [];

    // Créer des entrées de timesheet pour chaque utilisateur et chaque jour
    for (const userId of assignedUsers) {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        // Éviter les weekends (optionnel, configurable)
        const dayOfWeek = d.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Dimanche = 0, Samedi = 6

        const timesheetEntry = {
          id: `${taskId}-${userId}-${d.toISOString().split('T')[0]}`,
          user_id: userId,
          project_id: projectId,
          client_id: clientId,
          planned_work_session_id: taskId,
          billing_code_id: billingCode,
          date: d.toISOString().split('T')[0],
          start_time: '09:00:00',
          end_time: null, // Sera rempli lors du timer
          planned_hours: Math.round(hoursPerUserPerDay * 100) / 100, // Arrondir à 2 décimales
          actual_hours: 0,
          break_minutes: 0,
          description: `Travail planifié - ${taskId}`,
          task_description: '',
          location: null,
          is_billable: true,
          status: 'planned', // planned, in_progress, completed, approved
          is_from_planning: true,
          created_by: authContext.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        timesheetEntries.push(timesheetEntry);
      }
    }

    // Insérer toutes les entrées en batch
    if (timesheetEntries.length > 0) {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .upsert(timesheetEntries, { 
          onConflict: 'id',
          ignoreDuplicates: true 
        });

      if (error) {
        throw new Error(`Erreur insertion timesheets: ${error.message}`);
      }

      createdTimesheets = timesheetEntries.length;
    }

    // Marquer la tâche comme ayant des timesheets pré-créés
    const { error: updateError } = await supabase
      .from('planned_work_sessions')
      .update({ 
        timesheet_precreated: true,
        timesheet_creation_date: new Date().toISOString()
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Erreur marquage tâche:', updateError);
    }

    // Log pour audit
    await supabase
      .from('system_audit_logs')
      .insert({
        user_id: authContext.user.id,
        action: 'TIMESHEET_PRECREATION',
        resource_type: 'planned_work_session',
        resource_id: taskId,
        details: {
          project_id: projectId,
          assigned_users: assignedUsers,
          timesheet_count: createdTimesheets,
          date_range: `${startDate} to ${endDate}`,
          estimated_hours: estimatedHours
        },
        created_at: new Date().toISOString()
      });

    console.log(`⏱️ ${createdTimesheets} timesheets pré-créés pour tâche ${taskId} par ${authContext.user.email}`);

    return NextResponse.json({
      success: true,
      timesheetCount: createdTimesheets,
      message: `${createdTimesheets} entrées de timesheet pré-créées avec succès`,
      details: {
        taskId,
        projectId,
        assignedUsers: assignedUsers.length,
        daysSpanned: totalDays,
        hoursPerUserPerDay: Math.round(hoursPerUserPerDay * 100) / 100
      }
    }, { status: 201 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur pré-création timesheets:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la pré-création des timesheets' },
      { status: 500 }
    );
  }
}

// Endpoint pour obtenir le statut des timesheets pré-créés
export async function GET(request: NextRequest) {
  try {
    const authContext = await requirePermission('timesheets.view', 'global');
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'taskId requis' }, { status: 400 });
    }

    const supabase = createClient();

    // Vérifier les timesheets existants pour cette tâche
    const { data: timesheets, error } = await supabase
      .from('timesheet_entries')
      .select('*')
      .eq('planned_work_session_id', taskId)
      .eq('is_from_planning', true);

    if (error) {
      throw new Error(error.message);
    }

    const stats = {
      total: timesheets?.length || 0,
      planned: timesheets?.filter(t => t.status === 'planned').length || 0,
      in_progress: timesheets?.filter(t => t.status === 'in_progress').length || 0,
      completed: timesheets?.filter(t => t.status === 'completed').length || 0,
      approved: timesheets?.filter(t => t.status === 'approved').length || 0,
      total_planned_hours: timesheets?.reduce((sum, t) => sum + (t.planned_hours || 0), 0) || 0,
      total_actual_hours: timesheets?.reduce((sum, t) => sum + (t.actual_hours || 0), 0) || 0
    };

    return NextResponse.json({
      taskId,
      hasPreCreatedTimesheets: (timesheets?.length || 0) > 0,
      statistics: stats,
      timesheets: timesheets || []
    });

  } catch (error) {
    console.error('💥 Erreur récupération statut timesheets:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    );
  }
}