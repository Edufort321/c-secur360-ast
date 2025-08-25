import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const includePerformance = searchParams.get('includePerformance') === 'true';

    let query = supabase
      .from('employees')
      .select(`
        *,
        ${includePerformance ? `
        employee_performance (
          jobs_completed,
          safety_score,
          efficiency_ratio,
          punctuality_score,
          last_evaluation_date
        )
        ` : ''}
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('employment_status', status);
    }

    if (department && department !== 'all') {
      query = query.eq('department', department);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ employees: data || [] });
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des employés' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const body = await request.json();

    // Valider les champs requis
    const requiredFields = ['full_name', 'email', 'position', 'department', 'hourly_rate_base', 'billable_rate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Le champ ${field} est requis` },
          { status: 400 }
        );
      }
    }

    // Vérifier que l'email n'existe pas déjà
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('email', body.email)
      .single();

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Un employé avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Calculer les taux de temps supplémentaire
    const employeeData = {
      ...body,
      overtime_rate_1_5: body.hourly_rate_base * 1.5,
      overtime_rate_2_0: body.hourly_rate_base * 2.0
    };

    // Créer l'employé
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single();

    if (employeeError) {
      throw employeeError;
    }

    // Créer l'enregistrement de performance initial
    const { error: performanceError } = await supabase
      .from('employee_performance')
      .insert({
        employee_id: employee.id,
        jobs_completed: 0,
        safety_score: 85,
        efficiency_ratio: 100,
        punctuality_score: 85
      });

    if (performanceError) {
      console.error('Erreur lors de la création des performances initiales:', performanceError);
    }

    return NextResponse.json({ employee, message: 'Employé créé avec succès' }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'employé' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'ID employé requis pour la mise à jour' },
        { status: 400 }
      );
    }

    // Calculer les taux de temps supplémentaire si le taux de base a changé
    const updateData = {
      ...body,
      overtime_rate_1_5: body.hourly_rate_base * 1.5,
      overtime_rate_2_0: body.hourly_rate_base * 2.0,
      updated_at: new Date().toISOString()
    };

    delete updateData.id; // Retirer l'ID des données de mise à jour

    const { data: employee, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ employee, message: 'Employé mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'employé:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'employé' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID employé requis pour la suppression' },
        { status: 400 }
      );
    }

    // Vérifier si l'employé a des timesheets associés
    const { data: timesheets } = await supabase
      .from('timesheet_entries')
      .select('id')
      .eq('employee_id', id)
      .limit(1);

    if (timesheets && timesheets.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un employé avec des feuilles de temps associées' },
        { status: 400 }
      );
    }

    // Supprimer les performances de l'employé d'abord (à cause des contraintes de clé étrangère)
    await supabase
      .from('employee_performance')
      .delete()
      .eq('employee_id', id);

    // Supprimer l'employé
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Employé supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'employé:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'employé' },
      { status: 500 }
    );
  }
}