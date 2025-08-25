import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requirePermission } from '@/lib/auth/rbac-helpers';

export async function GET(request: NextRequest) {
  try {
    const authContext = await requirePermission('resources.view', 'global');
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'user', 'vehicle', 'equipment'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const supabase = createClient();
    const resources = [];

    // Récupérer les utilisateurs
    if (!type || type === 'user') {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          user_profile_payroll(
            hourly_rate,
            overtime_rate,
            skills,
            location,
            availability_schedule
          ),
          user_sites(
            sites(name, address, city)
          )
        `)
        .eq('status', 'active')
        .order('full_name');

      if (!usersError && users) {
        for (const user of users) {
          const availability = await calculateUserAvailability(supabase, user.id, startDate, endDate);
          
          resources.push({
            id: user.id,
            name: user.full_name || user.email,
            email: user.email,
            type: 'user',
            hourlyRate: user.user_profile_payroll?.[0]?.hourly_rate || 0,
            skills: user.user_profile_payroll?.[0]?.skills || [],
            location: user.user_profile_payroll?.[0]?.location || 'Bureau',
            avatar: user.avatar_url,
            sites: user.user_sites?.map((us: any) => us.sites) || [],
            availability
          });
        }
      }
    }

    // Récupérer les véhicules
    if (!type || type === 'vehicle') {
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'active')
        .order('make, model');

      if (!vehiclesError && vehicles) {
        for (const vehicle of vehicles) {
          const availability = await calculateVehicleAvailability(supabase, vehicle.id, startDate, endDate);
          
          resources.push({
            id: vehicle.id,
            name: `${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`,
            type: 'vehicle',
            category: vehicle.category,
            fuelType: vehicle.fuel_type,
            location: vehicle.location,
            capacity: vehicle.capacity,
            hourlyRate: vehicle.hourly_cost || 0,
            kmRate: vehicle.cost_per_km || 0.68,
            availability
          });
        }
      }
    }

    // Calculer les statistiques globales
    const stats = {
      totalUsers: resources.filter(r => r.type === 'user').length,
      totalVehicles: resources.filter(r => r.type === 'vehicle').length,
      availableUsers: resources.filter(r => r.type === 'user' && r.availability?.isAvailable).length,
      availableVehicles: resources.filter(r => r.type === 'vehicle' && r.availability?.isAvailable).length,
      totalCapacityHours: resources
        .filter(r => r.type === 'user')
        .reduce((sum, r) => sum + (r.availability?.totalCapacityHours || 0), 0),
      allocatedHours: resources
        .filter(r => r.type === 'user')
        .reduce((sum, r) => sum + (r.availability?.allocatedHours || 0), 0)
    };

    return NextResponse.json({
      resources,
      statistics: stats,
      dateRange: startDate && endDate ? { startDate, endDate } : null
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur récupération ressources:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des ressources' },
      { status: 500 }
    );
  }
}

async function calculateUserAvailability(
  supabase: any, 
  userId: string, 
  startDate: string | null, 
  endDate: string | null
) {
  try {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Récupérer les timesheet entries existants dans la période
    const { data: existingTimesheets } = await supabase
      .from('timesheet_entries')
      .select('date, planned_hours, actual_hours, status')
      .eq('user_id', userId)
      .gte('date', start.toISOString().split('T')[0])
      .lte('date', end.toISOString().split('T')[0]);

    // Calculer la disponibilité
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const workingDays = totalDays * 5 / 7; // Approximation 5 jours/semaine
    const totalCapacityHours = workingDays * 8; // 8h par jour de travail
    
    const allocatedHours = existingTimesheets?.reduce(
      (sum: number, entry: any) => sum + (entry.planned_hours || entry.actual_hours || 0), 
      0
    ) || 0;

    const availableHours = totalCapacityHours - allocatedHours;
    const utilizationRate = totalCapacityHours > 0 ? (allocatedHours / totalCapacityHours) * 100 : 0;

    return {
      isAvailable: availableHours > 0,
      totalCapacityHours: Math.round(totalCapacityHours),
      allocatedHours: Math.round(allocatedHours * 100) / 100,
      availableHours: Math.round(availableHours * 100) / 100,
      utilizationRate: Math.round(utilizationRate),
      existingBookings: existingTimesheets?.length || 0
    };

  } catch (error) {
    console.error('Erreur calcul disponibilité utilisateur:', error);
    return {
      isAvailable: false,
      totalCapacityHours: 0,
      allocatedHours: 0,
      availableHours: 0,
      utilizationRate: 0,
      existingBookings: 0
    };
  }
}

async function calculateVehicleAvailability(
  supabase: any, 
  vehicleId: string, 
  startDate: string | null, 
  endDate: string | null
) {
  try {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Récupérer les assignations de véhicules existantes
    const { data: assignments } = await supabase
      .from('vehicle_assignments')
      .select(`
        *,
        planned_work_sessions(start_date, end_date, status)
      `)
      .eq('vehicle_id', vehicleId)
      .not('planned_work_sessions', 'is', null);

    // Calculer les conflits potentiels
    const conflicts = assignments?.filter((assignment: any) => {
      if (!assignment.planned_work_sessions) return false;
      
      const sessionStart = new Date(assignment.planned_work_sessions.start_date);
      const sessionEnd = new Date(assignment.planned_work_sessions.end_date);
      
      return (sessionStart >= start && sessionStart <= end) || 
             (sessionEnd >= start && sessionEnd <= end) ||
             (sessionStart <= start && sessionEnd >= end);
    }) || [];

    // Vérifier maintenance programmée
    const { data: maintenance } = await supabase
      .from('vehicle_maintenance')
      .select('scheduled_date, completion_date, status')
      .eq('vehicle_id', vehicleId)
      .eq('status', 'scheduled')
      .gte('scheduled_date', start.toISOString().split('T')[0])
      .lte('scheduled_date', end.toISOString().split('T')[0]);

    const hasScheduledMaintenance = (maintenance?.length || 0) > 0;
    const isAvailable = conflicts.length === 0 && !hasScheduledMaintenance;

    return {
      isAvailable,
      conflicts: conflicts.length,
      scheduledMaintenance: maintenance?.length || 0,
      nextMaintenanceDate: maintenance?.[0]?.scheduled_date,
      totalAssignments: assignments?.length || 0,
      activeAssignments: assignments?.filter((a: any) => 
        a.planned_work_sessions?.status === 'in_progress'
      ).length || 0
    };

  } catch (error) {
    console.error('Erreur calcul disponibilité véhicule:', error);
    return {
      isAvailable: false,
      conflicts: 0,
      scheduledMaintenance: 0,
      nextMaintenanceDate: null,
      totalAssignments: 0,
      activeAssignments: 0
    };
  }
}