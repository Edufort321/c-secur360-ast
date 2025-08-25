import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requirePermission } from '@/lib/auth/rbac-helpers';

export async function GET(request: NextRequest) {
  try {
    const authContext = await requirePermission('projects.view', 'global');
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId requis' }, { status: 400 });
    }

    const supabase = createClient();

    // Récupérer les tâches planifiées du projet
    const { data: tasks, error } = await supabase
      .from('planned_work_sessions')
      .select(`
        *,
        projects(name, client_id),
        billing_codes(code, name, hourly_rate),
        user_assignments:planned_work_session_assignments(
          user_id,
          users(id, email, full_name)
        ),
        vehicle_assignments:planned_work_session_vehicles(
          vehicle_id,
          vehicles(id, make, model, license_plate)
        )
      `)
      .eq('project_id', projectId)
      .order('start_date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    // Formatter pour le composant Gantt
    const formattedTasks = tasks?.map(task => ({
      id: task.id,
      name: task.task_name,
      description: task.description || '',
      startDate: new Date(task.start_date),
      endDate: new Date(task.end_date),
      duration: task.estimated_hours,
      assignedUsers: task.user_assignments?.map((assign: any) => assign.user_id) || [],
      assignedUserNames: task.user_assignments?.map((assign: any) => assign.users?.full_name || assign.users?.email) || [],
      assignedVehicles: task.vehicle_assignments?.map((assign: any) => assign.vehicle_id) || [],
      assignedVehicleNames: task.vehicle_assignments?.map((assign: any) => 
        `${assign.vehicles?.make} ${assign.vehicles?.model} (${assign.vehicles?.license_plate})`
      ) || [],
      projectId: task.project_id,
      clientId: task.projects?.client_id,
      billingCode: task.billing_code_id,
      billingCodeName: task.billing_codes?.name,
      hourlyRate: task.billing_codes?.hourly_rate || 0,
      estimatedHours: task.estimated_hours,
      actualHours: task.actual_hours || 0,
      progress: task.progress_percentage || 0,
      status: task.status || 'planned',
      dependencies: [], // TODO: Implémenter système de dépendances
      priority: task.priority || 'medium',
      isRecurring: task.is_recurring || false,
      recurrencePattern: task.recurrence_pattern ? JSON.parse(task.recurrence_pattern) : null,
      timesheetPreCreated: task.timesheet_precreated || false,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at || task.created_at)
    })) || [];

    return NextResponse.json({
      tasks: formattedTasks,
      projectId,
      total: formattedTasks.length
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur récupération tâches Gantt:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tâches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await requirePermission('projects.manage', 'global');
    const taskData = await request.json();
    
    const supabase = createClient();

    // Créer la tâche planifiée
    const { data: newTask, error: taskError } = await supabase
      .from('planned_work_sessions')
      .insert({
        project_id: taskData.projectId,
        task_name: taskData.name,
        description: taskData.description,
        start_date: taskData.startDate,
        end_date: taskData.endDate,
        estimated_hours: taskData.estimatedHours,
        billing_code_id: taskData.billingCode,
        status: 'planned',
        priority: taskData.priority || 'medium',
        is_recurring: taskData.isRecurring || false,
        recurrence_pattern: taskData.recurrencePattern ? JSON.stringify(taskData.recurrencePattern) : null,
        created_by: authContext.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (taskError) {
      throw new Error(taskError.message);
    }

    // Assigner les utilisateurs
    if (taskData.assignedUsers && taskData.assignedUsers.length > 0) {
      const userAssignments = taskData.assignedUsers.map((userId: string) => ({
        planned_work_session_id: newTask.id,
        user_id: userId,
        created_at: new Date().toISOString()
      }));

      const { error: assignError } = await supabase
        .from('planned_work_session_assignments')
        .insert(userAssignments);

      if (assignError) {
        console.error('Erreur assignation utilisateurs:', assignError);
      }
    }

    // Assigner les véhicules
    if (taskData.assignedVehicles && taskData.assignedVehicles.length > 0) {
      const vehicleAssignments = taskData.assignedVehicles.map((vehicleId: string) => ({
        planned_work_session_id: newTask.id,
        vehicle_id: vehicleId,
        assigned_at: new Date().toISOString()
      }));

      const { error: vehicleError } = await supabase
        .from('planned_work_session_vehicles')
        .insert(vehicleAssignments);

      if (vehicleError) {
        console.error('Erreur assignation véhicules:', vehicleError);
      }
    }

    console.log(`📊 Nouvelle tâche Gantt créée: ${taskData.name} (${taskData.estimatedHours}h)`);

    return NextResponse.json({
      task: newTask,
      message: 'Tâche créée avec succès'
    }, { status: 201 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur création tâche Gantt:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la tâche' },
      { status: 500 }
    );
  }
}