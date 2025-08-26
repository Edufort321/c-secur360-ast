import { NextRequest, NextResponse } from 'next/server';
import { createEmployee, hasPermission } from '@/lib/rbac-utils';
import { CreateEmployeeRequest } from '@/types/rbac';

export async function POST(request: NextRequest) {
  try {
    // Get current user from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 });
    }

    // Check permission to create users
    const canCreateUsers = await hasPermission(userId, 'users.create');
    if (!canCreateUsers.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Permission insuffisante pour créer des utilisateurs'
      }, { status: 403 });
    }

    // Parse request body
    const body: CreateEmployeeRequest = await request.json();

    // Validate required fields
    if (!body.email || !body.first_name || !body.last_name || !body.role_id) {
      return NextResponse.json({
        success: false,
        error: 'Champs requis manquants'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({
        success: false,
        error: 'Format d\'email invalide'
      }, { status: 400 });
    }

    // Validate phone format if provided
    if (body.phone) {
      const phoneRegex = /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
      if (!phoneRegex.test(body.phone)) {
        return NextResponse.json({
          success: false,
          error: 'Format de téléphone invalide (utilisez le format nord-américain)'
        }, { status: 400 });
      }
    }

    // Validate scope requirements
    if (body.scope_type !== 'global' && !body.scope_id) {
      return NextResponse.json({
        success: false,
        error: 'ID de portée requis pour les portées non-globales'
      }, { status: 400 });
    }

    // Create the employee
    const result = await createEmployee(body, userId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        user: result.user,
        message: 'Employé créé avec succès'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in employee creation API:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current user from middleware headers
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 });
    }

    // Check permission to view users
    const canViewUsers = await hasPermission(userId, 'users.view');
    if (!canViewUsers.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Permission insuffisante pour voir les utilisateurs'
      }, { status: 403 });
    }

    // TODO: Implement user listing with pagination, filtering, etc.
    return NextResponse.json({
      success: true,
      users: [],
      total: 0,
      message: 'Liste des utilisateurs (TODO: implement)'
    });

  } catch (error) {
    console.error('Error in employee listing API:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}