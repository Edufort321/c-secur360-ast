import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requirePermission } from '@/lib/auth/rbac-helpers';

export async function POST(request: NextRequest) {
  try {
    // Vérifier permissions de création de dépenses
    const authContext = await requirePermission('expenses.create', 'global');

    const expense = await request.json();
    
    // Validation des données
    if (!expense.user_id || !expense.amount || !expense.description) {
      return NextResponse.json(
        { error: 'user_id, amount et description requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur peut créer pour cet utilisateur
    if (authContext.user.id !== expense.user_id && 
        !authContext.hasPermission('expenses.manage', 'global')) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    const supabase = createClient();

    // Créer nouvelle dépense
    const { data: newExpense, error } = await supabase
      .from('expense_entries')
      .insert({
        user_id: expense.user_id,
        project_id: expense.project_id,
        amount: parseFloat(expense.amount),
        description: expense.description,
        category: expense.category || 'general',
        receipt_url: expense.receipt_url,
        date: expense.date || new Date().toISOString(),
        status: 'pending',
        is_billable: expense.is_billable !== false, // Par défaut: billable
        client_id: expense.client_id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    console.log(`💰 Dépense créée par ${authContext.user.email}: ${expense.amount}$ - ${expense.description}`);

    return NextResponse.json(newExpense, { status: 201 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur création dépense:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la dépense' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier permissions de lecture
    const authContext = await requirePermission('expenses.view_own', 'global');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = createClient();
    
    let query = supabase
      .from('expense_entries')
      .select(`
        *,
        users!expense_entries_user_id_fkey(email, full_name),
        projects(name)
      `)
      .order('created_at', { ascending: false });

    // Appliquer les filtres selon les permissions
    if (authContext.hasPermission('expenses.view_all', 'global')) {
      // Admin peut voir toutes les dépenses
      if (userId) {
        query = query.eq('user_id', userId);
      }
    } else {
      // Utilisateur ne peut voir que ses propres dépenses
      query = query.eq('user_id', authContext.user.id);
    }

    // Autres filtres
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (dateFrom) {
      query = query.gte('date', `${dateFrom}T00:00:00.000Z`);
    }
    
    if (dateTo) {
      query = query.lte('date', `${dateTo}T23:59:59.999Z`);
    }
    
    query = query.limit(limit);

    const { data: expenses, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Calculer totaux
    const totalAmount = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
    const totalApproved = expenses?.filter(exp => exp.status === 'approved')
      .reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;

    return NextResponse.json({
      expenses: expenses || [],
      summary: {
        total: expenses?.length || 0,
        totalAmount,
        totalApproved,
        pending: expenses?.filter(exp => exp.status === 'pending').length || 0,
        approved: expenses?.filter(exp => exp.status === 'approved').length || 0,
        rejected: expenses?.filter(exp => exp.status === 'rejected').length || 0
      }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur récupération dépenses:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}