import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const includeEmployeeInfo = searchParams.get('includeEmployeeInfo') === 'true';

    let query = supabase
      .from('employee_performance')
      .select(`
        *,
        ${includeEmployeeInfo ? `
        employees (
          full_name,
          position,
          department,
          employment_status
        )
        ` : ''}
      `)
      .order('last_updated', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ performances: data || [] });
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
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const body = await request.json();

    if (!body.employee_id) {
      return NextResponse.json(
        { error: 'ID employé requis' },
        { status: 400 }
      );
    }

    // Valider les scores
    const scores = ['safety_score', 'efficiency_ratio', 'punctuality_score'];
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
      last_updated: new Date().toISOString()
    };

    delete updateData.id; // Retirer l'ID s'il existe

    // Utiliser upsert pour créer ou mettre à jour
    const { data: performance, error } = await supabase
      .from('employee_performance')
      .upsert(updateData, { 
        onConflict: 'employee_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      performance, 
      message: 'Performance mise à jour avec succès' 
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
    const supabase = createRouteHandlerClient<Database>({ cookies });
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

    // Créer l'enregistrement de performance
    const performanceData = {
      employee_id: body.employee_id,
      jobs_completed: body.jobs_completed || 0,
      safety_score: body.safety_score || 85,
      efficiency_ratio: body.efficiency_ratio || 100,
      punctuality_score: body.punctuality_score || 85,
      notes: body.notes || null
    };

    const { data: performance, error } = await supabase
      .from('employee_performance')
      .insert(performanceData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      performance, 
      message: 'Performance créée avec succès' 
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création des performances:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des performances' },
      { status: 500 }
    );
  }
}