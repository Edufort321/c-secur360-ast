// Types de congé CONFIGURABLES par tenant (migration 188). Gérés dans Admin/RH : ajout, justification
// requise (billet du médecin), poste qui approuve. Repli sur des défauts si la table est vide/absente.
import { supabase } from '@/lib/supabase';

export type CongeTypeDef = {
  id?: string;
  value: string; label_fr: string; label_en?: string | null; emoji?: string | null;
  requires_justification?: boolean; justification_label?: string | null; justification_after_days?: number;
  approval_poste_id?: string | null; active?: boolean; sort_order?: number;
};

// Défauts (alignés sur lib/conges CONGE_TYPES) + congé PARENTAL.
export const DEFAULT_CONGE_TYPES: CongeTypeDef[] = [
  { value: 'conge',     label_fr: 'Vacances',            label_en: 'Vacation',  emoji: '🏖️', requires_justification: false },
  { value: 'maladie',   label_fr: 'Maladie',             label_en: 'Sick leave', emoji: '🤒', requires_justification: true, justification_label: 'Billet du médecin', justification_after_days: 3 },
  { value: 'formation', label_fr: 'Formation',           label_en: 'Training',  emoji: '📚', requires_justification: false },
  { value: 'parental',  label_fr: 'Parental / maternité', label_en: 'Parental', emoji: '👶', requires_justification: true, justification_label: 'Document RQAP/AE' },
  { value: 'autre',     label_fr: 'Autre',               label_en: 'Other',     emoji: '📝', requires_justification: false },
];

export type Poste = { id: string; name: string };
export async function getPostes(tenant: string): Promise<Poste[]> {
  const { data } = await supabase.from('planner_postes').select('id, name').eq('tenant_id', tenant).order('name').range(0, 999);
  return (data || []) as Poste[];
}

/** Types du tenant ; repli sur les défauts si la table est vide ou absente (migration 188). */
export async function getCongeTypes(tenant: string): Promise<CongeTypeDef[]> {
  try {
    const { data, error } = await supabase.from('conge_types').select('*').eq('tenant_id', tenant).eq('active', true).order('sort_order').order('label_fr');
    if (error) return DEFAULT_CONGE_TYPES;
    return (data && data.length) ? (data as CongeTypeDef[]) : DEFAULT_CONGE_TYPES;
  } catch { return DEFAULT_CONGE_TYPES; }
}

/** Tous les types (actifs ou non) pour la gestion ; seed des défauts au premier accès si vide. */
export async function getCongeTypesAdmin(tenant: string): Promise<CongeTypeDef[]> {
  const { data } = await supabase.from('conge_types').select('*').eq('tenant_id', tenant).order('sort_order').order('label_fr');
  if (data && data.length) return data as CongeTypeDef[];
  // Seed initial (idempotent par unique(tenant,value)).
  await supabase.from('conge_types').insert(DEFAULT_CONGE_TYPES.map((t, i) => ({ ...t, tenant_id: tenant, sort_order: i }))).select();
  const { data: d2 } = await supabase.from('conge_types').select('*').eq('tenant_id', tenant).order('sort_order');
  return (d2 || DEFAULT_CONGE_TYPES) as CongeTypeDef[];
}

export async function saveCongeType(tenant: string, t: CongeTypeDef): Promise<{ error?: string }> {
  const payload: any = {
    tenant_id: tenant, value: t.value.trim(), label_fr: t.label_fr, label_en: t.label_en ?? null, emoji: t.emoji ?? null,
    requires_justification: !!t.requires_justification, justification_label: t.justification_label ?? null,
    justification_after_days: Number(t.justification_after_days) || 0, approval_poste_id: t.approval_poste_id || null,
    active: t.active !== false, sort_order: Number(t.sort_order) || 0,
  };
  if (t.id) { const { error } = await supabase.from('conge_types').update(payload).eq('id', t.id).eq('tenant_id', tenant); return { error: error?.message }; }
  const { error } = await supabase.from('conge_types').upsert(payload, { onConflict: 'tenant_id,value' }); return { error: error?.message };
}

export async function deleteCongeType(tenant: string, id: string): Promise<void> {
  await supabase.from('conge_types').delete().eq('id', id).eq('tenant_id', tenant);
}
