import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requirePermission } from '@/lib/auth/rbac-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authContext = await requirePermission('timesheets.update', 'global');
    const entryId = params.id;
    const updates = await request.json();

    if (!entryId) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const supabase = createClient();

    // Récupérer l'entrée existante pour vérifier les permissions
    const { data: existingEntry, error: fetchError } = await supabase
      .from('timesheet_entries')
      .select('user_id')
      .eq('id', entryId)
      .single();

    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Entrée non trouvée' }, { status: 404 });
    }

    // Vérifier permissions (propriétaire ou admin)
    if (authContext.user.id !== existingEntry.user_id && 
        !authContext.hasPermission('timesheets.manage', 'global')) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    // Préparer les updates avec validation
    const allowedUpdates = {
      status: updates.status,
      end_time: updates.end_time,
      duration_minutes: updates.duration_minutes,
      location_end: updates.location_end,
      kilometers_traveled: updates.kilometers_traveled,
      expense_amount: updates.expense_amount,
      expense_description: updates.expense_description,
      expense_receipt_url: updates.expense_receipt_url,
      task_description: updates.task_description,
      is_billable: updates.is_billable,
      updated_at: new Date().toISOString()
    };

    // Supprimer les propriétés undefined
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key as keyof typeof allowedUpdates] === undefined) {
        delete allowedUpdates[key as keyof typeof allowedUpdates];
      }
    });

    // Calculer automatiquement la durée si end_time est fourni
    if (updates.end_time && updates.start_time) {
      const startTime = new Date(updates.start_time);
      const endTime = new Date(updates.end_time);
      allowedUpdates.duration_minutes = Math.round(
        (endTime.getTime() - startTime.getTime()) / 60000
      );
    }

    // Mettre à jour l'entrée
    const { data: updatedEntry, error: updateError } = await supabase
      .from('timesheet_entries')
      .update(allowedUpdates)
      .eq('id', entryId)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    const action = updates.status === 'paused' ? 'pausé' :
                  updates.status === 'active' ? 'repris' :
                  updates.status === 'completed' ? 'arrêté' : 'mis à jour';

    console.log(`⏰ Timer ${action} par ${authContext.user.email}: ${entryId}`);

    return NextResponse.json(updatedEntry);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur mise à jour timesheet mobile:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authContext = await requirePermission('timesheets.delete', 'global');
    const entryId = params.id;

    if (!entryId) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const supabase = createClient();

    // Récupérer l'entrée existante pour vérifier les permissions
    const { data: existingEntry, error: fetchError } = await supabase
      .from('timesheet_entries')
      .select('user_id, task_description')
      .eq('id', entryId)
      .single();

    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Entrée non trouvée' }, { status: 404 });
    }

    // Vérifier permissions (propriétaire ou admin)
    if (authContext.user.id !== existingEntry.user_id && 
        !authContext.hasPermission('timesheets.manage', 'global')) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    // Supprimer l'entrée
    const { error: deleteError } = await supabase
      .from('timesheet_entries')
      .delete()
      .eq('id', entryId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    console.log(`🗑️ Entrée timesheet supprimée par ${authContext.user.email}: ${existingEntry.task_description}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur suppression timesheet mobile:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}