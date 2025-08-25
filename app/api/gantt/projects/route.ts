import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requirePermission } from '@/lib/auth/rbac-helpers';

export async function GET(request: NextRequest) {
  try {
    const authContext = await requirePermission('projects.view', 'global');
    const supabase = createClient();

    let query = supabase
      .from('projects')
      .select(`
        *,
        clients(name, company_name),
        planned_work_sessions(
          id,
          task_name,
          estimated_hours,
          start_date,
          end_date,
          status,
          progress_percentage
        )
      `)
      .order('created_at', { ascending: false });

    // Filtrer selon les permissions
    if (!authContext.hasPermission('projects.view_all', 'global')) {
      // Utilisateur peut voir seulement ses projets assignés
      query = query.or(`manager_id.eq.${authContext.user.id},team_members.cs.{${authContext.user.id}}`);
    }

    const { data: projects, error } = await query.limit(50);

    if (error) {
      throw new Error(error.message);
    }

    // Formatter les données pour Gantt
    const formattedProjects = projects?.map(project => ({
      id: project.id,
      name: project.name,
      clientId: project.client_id,
      clientName: project.clients?.name || project.clients?.company_name,
      startDate: project.start_date,
      endDate: project.end_date,
      totalBudget: project.budget || 0,
      usedBudget: project.actual_cost || 0,
      status: project.status,
      taskCount: project.planned_work_sessions?.length || 0,
      totalEstimatedHours: project.planned_work_sessions?.reduce(
        (sum: number, session: any) => sum + (session.estimated_hours || 0), 0
      ) || 0,
      progressAverage: project.planned_work_sessions?.length > 0 
        ? project.planned_work_sessions.reduce(
            (sum: number, session: any) => sum + (session.progress_percentage || 0), 0
          ) / project.planned_work_sessions.length
        : 0
    }));

    return NextResponse.json({
      projects: formattedProjects || [],
      total: formattedProjects?.length || 0
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur récupération projets Gantt:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await requirePermission('projects.create', 'global');
    const projectData = await request.json();
    
    const supabase = createClient();

    // Créer le projet
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        description: projectData.description,
        client_id: projectData.clientId,
        manager_id: authContext.user.id,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        budget: projectData.budget || 0,
        status: 'planning',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (projectError) {
      throw new Error(projectError.message);
    }

    console.log(`📊 Nouveau projet Gantt créé: ${projectData.name} par ${authContext.user.email}`);

    return NextResponse.json({
      project: newProject,
      message: 'Projet créé avec succès'
    }, { status: 201 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur création projet Gantt:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}