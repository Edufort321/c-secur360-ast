// Catalogue de tâches récurrentes du tenant (bureau, atelier, soumission, administration…).
// Sert d'alternative au PROJET pour associer une ligne de feuille de temps ou une tâche planifiée.
// Voir docs/INTERCONNEXION_TEMPS.md. Couche client (table à RLS permissive, comme les autres
// tables des modules feuille de temps / planificateur).
import { supabase } from '@/lib/supabase';

export interface RecurringTask {
  id?: string;
  tenant_id?: string;
  name: string;
  code?: string;
  billable?: boolean;   // refacturable au client (sinon interne)
  active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Liste les tâches du tenant. `onlyActive` (défaut) pour les sélecteurs ; false pour l'admin.
export async function listRecurringTasks(tenant: string, onlyActive = true): Promise<RecurringTask[]> {
  let q = supabase.from('tenant_recurring_tasks').select('*').eq('tenant_id', tenant);
  if (onlyActive) q = q.eq('active', true);
  const { data, error } = await q.order('sort_order').order('name');
  if (error) return [];
  return (data || []) as RecurringTask[];
}

export async function saveRecurringTask(tenant: string, t: RecurringTask): Promise<{ data?: RecurringTask; error?: string }> {
  const payload: any = {
    tenant_id: tenant,
    name: (t.name || '').trim(),
    code: (t.code || '').trim(),
    billable: !!t.billable,
    active: t.active !== false,
    sort_order: Number(t.sort_order) || 0,
    updated_at: new Date().toISOString(),
  };
  if (!payload.name) return { error: 'Nom requis' };
  if (t.id) {
    const { data, error } = await supabase.from('tenant_recurring_tasks').update(payload).eq('id', t.id).select().single();
    return error ? { error: error.message } : { data: data as RecurringTask };
  }
  const { data, error } = await supabase.from('tenant_recurring_tasks').insert(payload).select().single();
  return error ? { error: error.message } : { data: data as RecurringTask };
}

export async function deleteRecurringTask(id: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('tenant_recurring_tasks').delete().eq('id', id);
  return error ? { error: error.message } : {};
}
