import { NextRequest, NextResponse } from 'next/server';
import { getPermissionsByModule, hasPermission } from '@/lib/rbac-utils';
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

    // Check permission to view users (needed to assign permissions)
    const canViewUsers = await hasPermission(userId, 'users.view');
    if (!canViewUsers.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Permission insuffisante'
      }, { status: 403 });
    }

    // Get all permissions grouped by module
    const permissionGroups = await getPermissionsByModule();
    
    // Flatten for the UI (it expects an array)
    const allPermissions = Object.values(permissionGroups).flat();

    return NextResponse.json(allPermissions);

  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement des permissions'
    }, { status: 500 });
  }
}