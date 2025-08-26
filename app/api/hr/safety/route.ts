import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

interface SafetyRecordData {
  employee_id: string;
  incidents?: number;
  near_misses?: number;
  ast_filled?: number;
  ast_participated?: number;
  safety_score?: number;
  punctuality_score?: number;
  training_completed?: any;
  certifications_expiring?: any;
  tools_checkouts?: number;
  tools_returns?: number;
  equipment_damage_reports?: number;
}

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
    const employee_id = searchParams.get('employee_id');
    const include_employee = searchParams.get('include_employee') === 'true';
    
    let query = supabase
      .from('employee_safety_records')
      .select(`
        *,
        ${include_employee ? `
        employees (
          id,
          first_name,
          last_name,
          employee_number,
          department,
          position,
          certifications
        )
        ` : ''}
      `);

    if (employee_id) {
      query = query.eq('employee_id', employee_id);
    }

    query = query.order('last_evaluation_date', { ascending: false });

    const { data: safetyRecords, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des dossiers de sécurité' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      safetyRecords: safetyRecords || [],
      count: safetyRecords?.length || 0
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des dossiers de sécurité' },
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
    
    const body: SafetyRecordData = await request.json();

    if (!body.employee_id) {
      return NextResponse.json(
        { error: 'employee_id est requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'employé existe
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

    // Vérifier qu'un dossier de sécurité n'existe pas déjà
    const { data: existingRecord } = await supabase
      .from('employee_safety_records')
      .select('id')
      .eq('employee_id', body.employee_id)
      .single();

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Un dossier de sécurité existe déjà pour cet employé' },
        { status: 400 }
      );
    }

    // Créer le dossier de sécurité avec valeurs par défaut
    const safetyData = {
      employee_id: body.employee_id,
      incidents: body.incidents || 0,
      near_misses: body.near_misses || 0,
      ast_filled: body.ast_filled || 0,
      ast_participated: body.ast_participated || 0,
      safety_score: body.safety_score || 85.00,
      punctuality_score: body.punctuality_score || 85.00,
      training_completed: body.training_completed || [],
      certifications_expiring: body.certifications_expiring || [],
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
      console.error('Safety record creation error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création du dossier de sécurité' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      safetyRecord, 
      message: 'Dossier de sécurité créé avec succès' 
    }, { status: 201 });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du dossier de sécurité' },
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
    const { employee_id, ...updateData } = body;

    if (!employee_id) {
      return NextResponse.json(
        { error: 'employee_id requis pour la mise à jour' },
        { status: 400 }
      );
    }

    // Valider les scores si fournis
    const scoreFields = ['safety_score', 'punctuality_score'];
    for (const field of scoreFields) {
      if (updateData[field] !== undefined && 
          (updateData[field] < 0 || updateData[field] > 100)) {
        return NextResponse.json(
          { error: `Le score ${field} doit être entre 0 et 100` },
          { status: 400 }
        );
      }
    }

    const { data: safetyRecord, error } = await supabase
      .from('employee_safety_records')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('employee_id', employee_id)
      .select()
      .single();

    if (error) {
      console.error('Safety record update error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du dossier de sécurité' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      safetyRecord, 
      message: 'Dossier de sécurité mis à jour avec succès' 
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour du dossier de sécurité' },
      { status: 500 }
    );
  }
}

// Fonction pour mettre à jour les scores de sécurité automatiquement
export async function updateEmployeeSafetyScore(
  employee_id: string,
  incident_change: number = 0,
  ast_participation: number = 0
) {
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

  try {
    const { error } = await supabase.rpc('update_employee_safety_score', {
      p_employee_id: employee_id,
      p_incident_change: incident_change,
      p_ast_participation: ast_participation
    });

    if (error) {
      console.error('Error updating safety score:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Server error updating safety score:', error);
    return { success: false, error };
  }
}

// Fonction pour vérifier la validité des certifications
export async function checkCertificationValidity(
  employee_id: string,
  certification_type: string
) {
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

  try {
    const { data, error } = await supabase.rpc('check_certification_validity', {
      p_employee_id: employee_id,
      p_certification_type: certification_type
    });

    if (error) {
      console.error('Error checking certification:', error);
      return { isValid: false, error };
    }

    return { isValid: data || false };
  } catch (error) {
    console.error('Server error checking certification:', error);
    return { isValid: false, error };
  }
}