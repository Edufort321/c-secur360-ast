import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

interface CertificationUpdateData {
  employee_id: string;
  certification_type: string;
  valid: boolean;
  expiry?: string;
  issuer?: string;
  doc_id?: string;
}

interface ASTAssignmentCheck {
  employee_id: string;
  required_certifications?: string[];
  strict_mode?: boolean;
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
    const check_expiring = searchParams.get('check_expiring') === 'true';
    const warning_days = parseInt(searchParams.get('warning_days') || '30');
    
    if (employee_id && check_expiring) {
      // Get expiring certifications for specific employee
      const { data: expiringCerts, error } = await supabase
        .rpc('get_expiring_certifications', {
          p_employee_id: employee_id,
          p_warning_days: warning_days
        });

      if (error) {
        console.error('Error getting expiring certifications:', error);
        return NextResponse.json(
          { error: 'Erreur lors de la vérification des certifications expirantes' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        employee_id,
        expiring_certifications: expiringCerts || [],
        warning_days
      });
    }

    if (employee_id) {
      // Get all certifications for specific employee
      const { data: employee, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, certifications')
        .eq('id', employee_id)
        .single();

      if (error || !employee) {
        return NextResponse.json(
          { error: 'Employé non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        employee,
        certifications: employee.certifications || {}
      });
    }

    // Get all employees with expiring certifications
    const { data: employees, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, certifications, employment_status')
      .eq('employment_status', 'active');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des employés' },
        { status: 500 }
      );
    }

    // Process each employee to find expiring certifications
    const employeesWithExpiring = [];
    
    for (const employee of employees || []) {
      const { data: expiringCerts } = await supabase
        .rpc('get_expiring_certifications', {
          p_employee_id: employee.id,
          p_warning_days: warning_days
        });

      if (expiringCerts && expiringCerts.length > 0) {
        employeesWithExpiring.push({
          ...employee,
          expiring_certifications: expiringCerts
        });
      }
    }

    return NextResponse.json({
      employees_with_expiring: employeesWithExpiring,
      total_count: employeesWithExpiring.length,
      warning_days
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la gestion des certifications' },
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
    
    const body: CertificationUpdateData = await request.json();

    if (!body.employee_id || !body.certification_type) {
      return NextResponse.json(
        { error: 'employee_id et certification_type sont requis' },
        { status: 400 }
      );
    }

    // Get current employee certifications
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('certifications')
      .eq('id', body.employee_id)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Employé non trouvé' },
        { status: 404 }
      );
    }

    // Update specific certification
    const updatedCerts = { ...employee.certifications };
    
    if (!updatedCerts[body.certification_type]) {
      updatedCerts[body.certification_type] = {};
    }

    updatedCerts[body.certification_type] = {
      ...updatedCerts[body.certification_type],
      valid: body.valid,
      expiry: body.expiry || null,
      issuer: body.issuer || updatedCerts[body.certification_type].issuer || null,
      doc_id: body.doc_id || updatedCerts[body.certification_type].doc_id || null,
      last_verified_at: new Date().toISOString()
    };

    // Update metadata
    if (!updatedCerts._meta) {
      updatedCerts._meta = { schema_version: 1 };
    }
    updatedCerts._meta.last_updated = new Date().toISOString();

    // Save updated certifications
    const { data: updatedEmployee, error: updateError } = await supabase
      .from('employees')
      .update({
        certifications: updatedCerts,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.employee_id)
      .select('id, first_name, last_name, certifications')
      .single();

    if (updateError) {
      console.error('Error updating certifications:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour des certifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      employee: updatedEmployee,
      updated_certification: {
        type: body.certification_type,
        ...updatedCerts[body.certification_type]
      },
      message: 'Certification mise à jour avec succès'
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour des certifications' },
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
    
    const body: ASTAssignmentCheck = await request.json();

    if (!body.employee_id) {
      return NextResponse.json(
        { error: 'employee_id est requis' },
        { status: 400 }
      );
    }

    // Check if employee can be assigned to AST work
    const { data: assignmentCheck, error } = await supabase
      .rpc('can_assign_to_ast', {
        p_employee_id: body.employee_id,
        p_required_certifications: body.required_certifications || [],
        p_strict_mode: body.strict_mode
      });

    if (error) {
      console.error('Error checking AST assignment eligibility:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification d\'éligibilité AST' },
        { status: 500 }
      );
    }

    const result = assignmentCheck?.[0];

    if (!result) {
      return NextResponse.json(
        { error: 'Aucun résultat de vérification disponible' },
        { status: 500 }
      );
    }

    // Get employee info for response
    const { data: employee } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_number')
      .eq('id', body.employee_id)
      .single();

    return NextResponse.json({
      employee,
      assignment_check: {
        can_assign: result.can_assign,
        blocking_certifications: result.blocking_certifications,
        warning_certifications: result.warning_certifications,
        message: result.message
      },
      required_certifications: body.required_certifications || [],
      strict_mode_applied: body.strict_mode
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la vérification AST' },
      { status: 500 }
    );
  }
}

// Helper function for bulk certification updates
export async function PATCH(request: NextRequest) {
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
    const { employee_id, certifications_batch } = body;

    if (!employee_id || !certifications_batch || !Array.isArray(certifications_batch)) {
      return NextResponse.json(
        { error: 'employee_id et certifications_batch (array) sont requis' },
        { status: 400 }
      );
    }

    // Get current employee certifications
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('certifications')
      .eq('id', employee_id)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Employé non trouvé' },
        { status: 404 }
      );
    }

    // Update multiple certifications
    const updatedCerts = { ...employee.certifications };
    const updatedTypes = [];

    for (const certUpdate of certifications_batch) {
      if (certUpdate.certification_type) {
        if (!updatedCerts[certUpdate.certification_type]) {
          updatedCerts[certUpdate.certification_type] = {};
        }

        updatedCerts[certUpdate.certification_type] = {
          ...updatedCerts[certUpdate.certification_type],
          valid: certUpdate.valid,
          expiry: certUpdate.expiry || null,
          issuer: certUpdate.issuer || updatedCerts[certUpdate.certification_type].issuer || null,
          doc_id: certUpdate.doc_id || updatedCerts[certUpdate.certification_type].doc_id || null,
          last_verified_at: new Date().toISOString()
        };

        updatedTypes.push(certUpdate.certification_type);
      }
    }

    // Update metadata
    if (!updatedCerts._meta) {
      updatedCerts._meta = { schema_version: 1 };
    }
    updatedCerts._meta.last_updated = new Date().toISOString();

    // Save updated certifications
    const { data: updatedEmployee, error: updateError } = await supabase
      .from('employees')
      .update({
        certifications: updatedCerts,
        updated_at: new Date().toISOString()
      })
      .eq('id', employee_id)
      .select('id, first_name, last_name, certifications')
      .single();

    if (updateError) {
      console.error('Error updating certifications batch:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour en lot des certifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      employee: updatedEmployee,
      updated_certifications: updatedTypes,
      batch_count: updatedTypes.length,
      message: `${updatedTypes.length} certification(s) mise(s) à jour avec succès`
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour en lot' },
      { status: 500 }
    );
  }
}