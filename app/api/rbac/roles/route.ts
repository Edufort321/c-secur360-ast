import { NextRequest, NextResponse } from 'next/server';
import { getRoles, hasPermission } from '@/lib/rbac-utils';
export const dynamic = 'force-dynamic';

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

    // Check permission to view users (needed to assign roles)
    const canViewUsers = await hasPermission(userId, 'users.view');
    if (!canViewUsers.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Permission insuffisante'
      }, { status: 403 });
    }

    // Get all roles with their permissions
    const roles = await getRoles();

    return NextResponse.json(roles);

  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement des rôles'
    }, { status: 500 });
  }
}