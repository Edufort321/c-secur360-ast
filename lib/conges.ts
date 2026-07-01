// #72 Module Congés (self-service) — accès données sur planner_conges (table partagée avec le
// planner). L'employé fait une DEMANDE (status 'pending'), le superviseur approuve/refuse.
// On garde la colonne 'approved' synchronisée pour que le planner continue de fonctionner.
import { supabase } from '@/lib/supabase';

export type CongeType = 'conge' | 'maladie' | 'formation' | 'autre';
export type CongeStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type Conge = {
  id?: string;
  personnel_id: string;
  start_date: string;
  end_date: string;
  type: CongeType;
  status: CongeStatus;
  approved?: boolean;
  notes?: string | null;
  requested_by?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
};

export type Personnel = { id: string; name: string | null; email: string | null; role: string | null };

// Types valides cote DB (CHECK de planner_conges) + libellés bilingues.
export const CONGE_TYPES: { value: CongeType; fr: string; en: string; emoji: string }[] = [
  { value: 'conge', fr: 'Vacances', en: 'Vacation', emoji: '🏖️' },
  { value: 'maladie', fr: 'Maladie', en: 'Sick leave', emoji: '🤒' },
  { value: 'formation', fr: 'Formation', en: 'Training', emoji: '📚' },
  { value: 'autre', fr: 'Autre', en: 'Other', emoji: '📝' },
];

/** Nombre de jours inclusifs entre deux dates ISO (YYYY-MM-DD). */
export function dayCount(start: string, end: string): number {
  if (!start || !end) return 0;
  const a = new Date(start + 'T00:00').getTime();
  const b = new Date(end + 'T00:00').getTime();
  if (isNaN(a) || isNaN(b)) return 0;
  const d = Math.round((b - a) / 86400000) + 1;
  return d > 0 ? d : 0;
}

export async function getPersonnel(tenant: string): Promise<Personnel[]> {
  const { data } = await supabase.from('planner_personnel')
    .select('id,name,email,role').eq('tenant_id', tenant).eq('is_active', true).order('name');
  return (data || []) as Personnel[];
}

// personnelId : si fourni, ne renvoie QUE les congés de cette personne. CONFIDENTIALITÉ (Loi 25) — un
// employé non-approbateur ne doit pas recevoir dans son navigateur les congés (motifs médicaux, fichiers
// justificatifs) de ses collègues. Les approbateurs (RH/superviseur) appellent sans personnelId = tous.
export async function getConges(tenant: string, personnelId?: string): Promise<Conge[]> {
  let q = supabase.from('planner_conges').select('*').eq('tenant_id', tenant);
  if (personnelId) q = q.eq('personnel_id', personnelId);
  const { data, error } = await q.order('start_date', { ascending: false });
  if (error) throw error;
  return (data || []) as Conge[];
}

export async function createConge(
  tenant: string,
  c: { personnel_id: string; start_date: string; end_date: string; type: CongeType; notes?: string; requested_by?: string },
): Promise<void> {
  const { error } = await supabase.from('planner_conges').insert({
    tenant_id: tenant, personnel_id: c.personnel_id, start_date: c.start_date, end_date: c.end_date,
    type: c.type, notes: c.notes || null, status: 'pending', approved: false, requested_by: c.requested_by || null,
  });
  if (error) throw error;
}

/** Approuve (approve=true) ou refuse une demande. Synchronise 'approved' pour le planner. */
export async function decideConge(tenant: string, id: string, approve: boolean, reviewer: string): Promise<void> {
  const { error } = await supabase.from('planner_conges').update({
    status: approve ? 'approved' : 'rejected', approved: approve,
    reviewed_by: reviewer, reviewed_at: new Date().toISOString(),
  }).eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}

export async function cancelConge(tenant: string, id: string): Promise<void> {
  const { error } = await supabase.from('planner_conges')
    .update({ status: 'cancelled', approved: false }).eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}

export async function deleteConge(tenant: string, id: string): Promise<void> {
  const { error } = await supabase.from('planner_conges').delete().eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}
