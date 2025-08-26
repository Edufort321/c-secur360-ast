import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const includeSafety = searchParams.get('includeSafety') === 'true';

    let query = supabase
      .from('employees')
      .select(`
        *,
        ${includeSafety ? `
        employee_safety_records (
          safety_score,
          punctuality_score,
          ast_filled,
          ast_participated,
          incidents,
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
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des employés' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      employees: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des employés' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const body = await request.json();

    // Validation des champs requis (données minimales)
    const requiredFields = ['first_name', 'last_name'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Le champ ${field} est requis` },
          { status: 400 }
        );
      }
    }

    // Obtenir tenant depuis les en-têtes ou utiliser default
    const tenant_id = request.headers.get('x-tenant-id') || 'demo';

    // Vérifier l'unicité du numéro d'employé dans le tenant
    if (body.employee_number) {
      const { data: existingEmployee } = await supabase
        .from('employees')
        .select('id')
        .eq('tenant_id', tenant_id)
        .eq('employee_number', body.employee_number)
        .single();

      if (existingEmployee) {
        return NextResponse.json(
          { error: 'Un employé avec ce numéro existe déjà' },
          { status: 400 }
        );
      }
    }

    // Préparer les données employé avec certifications par défaut
    const employeeData = {
      ...body,
      tenant_id,
      certifications: body.certifications || {
        "permis_conduire": {"valid": false, "expiry": null},
        "chariot_elevateur": {"valid": false, "expiry": null},
        "travail_hauteur": {"valid": false, "expiry": null},
        "premiers_secours": {"valid": false, "expiry": null},
        "manipulation_substances": {"valid": false, "expiry": null}
      }
    };

    // Créer l'employé
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single();

    if (employeeError) {
      console.error('Employee creation error:', employeeError);
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'employé' },
        { status: 500 }
      );
    }

    // Créer l'enregistrement de sécurité initial
    const { error: safetyError } = await supabase
      .from('employee_safety_records')
      .insert({
        employee_id: employee.id,
        safety_score: 85.00,
        punctuality_score: 85.00,
        ast_filled: 0,
        ast_participated: 0,
        incidents: 0
      });

    if (safetyError) {
      console.error('Safety record creation error:', safetyError);
      // Erreur non bloquante, l'employé est quand même créé
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
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
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
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
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