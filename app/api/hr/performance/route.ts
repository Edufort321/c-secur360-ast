import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

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
    const employeeId = searchParams.get('employee_id');
    const includeEmployeeInfo = searchParams.get('includeEmployeeInfo') === 'true';

    let query = supabase
      .from('employee_safety_records')
      .select(`
        *,
        ${includeEmployeeInfo ? `
        employees (
          first_name,
          last_name,
          employee_number,
          position,
          department,
          employment_status
        )
        ` : ''}
      `)
      .order('updated_at', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      safetyRecords: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des performances:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des performances' },
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

    if (!body.employee_id) {
      return NextResponse.json(
        { error: 'ID employé requis' },
        { status: 400 }
      );
    }

    // Valider les scores
    const scores = ['safety_score', 'punctuality_score'];
    for (const score of scores) {
      if (body[score] !== undefined) {
        const value = parseFloat(body[score]);
        if (isNaN(value) || value < 0 || value > 100) {
          return NextResponse.json(
            { error: `${score} doit être un nombre entre 0 et 100` },
            { status: 400 }
          );
        }
      }
    }

    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    };

    delete updateData.id;

    const { data: safetyRecord, error } = await supabase
      .from('employee_safety_records')
      .update(updateData)
      .eq('employee_id', body.employee_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      safetyRecord, 
      message: 'Dossier de sécurité mis à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des performances:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des performances' },
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

    if (!body.employee_id) {
      return NextResponse.json(
        { error: 'ID employé requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'employé existe
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', body.employee_id)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Employé non trouvé' },
        { status: 404 }
      );
    }

    // Créer l'enregistrement de sécurité
    const safetyData = {
      employee_id: body.employee_id,
      ast_filled: body.ast_filled || 0,
      ast_participated: body.ast_participated || 0,
      incidents: body.incidents || 0,
      near_misses: body.near_misses || 0,
      safety_score: body.safety_score || 85.00,
      punctuality_score: body.punctuality_score || 85.00,
      training_completed: body.training_completed || [],
      tools_checkouts: body.tools_checkouts || 0,
      tools_returns: body.tools_returns || 0,
      equipment_damage_reports: body.equipment_damage_reports || 0
    };

    const { data: safetyRecord, error } = await supabase
      .from('employee_safety_records')
      .insert(safetyData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      safetyRecord, 
      message: 'Dossier de sécurité créé avec succès' 
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création des performances:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des performances' },
      { status: 500 }
    );
  }
}