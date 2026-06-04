// #80 CAPA — couche d'acces aux actions correctives/preventives liees aux incidents.
import { supabase } from '@/lib/supabase';

export type IncidentActionStatus = 'a_faire' | 'en_cours' | 'fait' | 'verifie';
export type IncidentActionPriority = 'basse' | 'normale' | 'haute' | 'critique';

export interface IncidentAction {
  id: string;
  tenant_id: string;
  incident_id: string | null;
  description: string;
  assignee: string | null;
  assignee_email: string | null;
  due_date: string | null;
  status: IncidentActionStatus;
  priority: IncidentActionPriority;
  created_at: string;
  updated_at: string;
}

export const ACTION_STATUSES: IncidentActionStatus[] = ['a_faire', 'en_cours', 'fait', 'verifie'];
export const ACTION_PRIORITIES: IncidentActionPriority[] = ['basse', 'normale', 'haute', 'critique'];

export async function listIncidentActions(tenant: string): Promise<IncidentAction[]> {
  const { data } = await supabase
    .from('incident_actions').select('*')
    .eq('tenant_id', tenant)
    .order('due_date', { ascending: true, nullsFirst: false });
  return (data as IncidentAction[]) ?? [];
}

export async function listActionsByIncident(tenant: string, incidentId: string): Promise<IncidentAction[]> {
  const { data } = await supabase
    .from('incident_actions').select('*')
    .eq('tenant_id', tenant).eq('incident_id', incidentId)
    .order('created_at', { ascending: true });
  return (data as IncidentAction[]) ?? [];
}

export async function createIncidentAction(
  input: Partial<IncidentAction> & { tenant_id: string },
): Promise<IncidentAction | null> {
  const { data } = await supabase
    .from('incident_actions')
    .insert({ ...input, updated_at: new Date().toISOString() })
    .select('*').single();
  return (data as IncidentAction) ?? null;
}

export async function updateIncidentAction(id: string, patch: Partial<IncidentAction>): Promise<void> {
  await supabase.from('incident_actions')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function deleteIncidentAction(id: string): Promise<void> {
  await supabase.from('incident_actions').delete().eq('id', id);
}

// Une action est en retard si elle a une echeance passee et n'est ni faite ni verifiee.
export function isActionOverdue(a: Pick<IncidentAction, 'due_date' | 'status'>): boolean {
  if (!a.due_date || a.status === 'fait' || a.status === 'verifie') return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(a.due_date) < today;
}
