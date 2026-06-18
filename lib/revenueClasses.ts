// Classes de revenu gérables (migration 232) — pour la ventilation de l'état financier, indépendantes
// du catalogue produit. CRUD + hook de chargement. Utilisé par le gestionnaire (dashboard finance),
// le formulaire de facture et le formulaire de transaction (revenu).
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type RevenueClass = { id?: string; tenant_id?: string; name: string; color?: string | null; sort_order?: number; active?: boolean };

export async function getRevenueClasses(tenant: string): Promise<RevenueClass[]> {
  const { data, error } = await supabase.from('revenue_classes').select('*').eq('tenant_id', tenant).order('sort_order').order('name');
  if (error) return [];
  return (data as any[]) || [];
}
export async function saveRevenueClass(tenant: string, c: RevenueClass): Promise<{ id?: string; error?: string }> {
  const row: any = { tenant_id: tenant, name: (c.name || '').trim(), color: c.color || null, sort_order: c.sort_order || 0, active: c.active !== false };
  if (!row.name) return { error: 'Nom requis' };
  if (c.id) { const { error } = await supabase.from('revenue_classes').update(row).eq('id', c.id).eq('tenant_id', tenant); return { id: c.id, error: error?.message }; }
  const { data, error } = await supabase.from('revenue_classes').insert(row).select('id').single();
  return { id: (data as any)?.id, error: error?.message };
}
export async function deleteRevenueClass(tenant: string, id: string): Promise<void> {
  await supabase.from('revenue_classes').delete().eq('id', id).eq('tenant_id', tenant);
}

/** Hook : liste des NOMS de classes actives (pour datalists/selects) + reload. */
export function useRevenueClasses(tenant?: string): { names: string[]; classes: RevenueClass[]; reload: () => void } {
  const [classes, setClasses] = useState<RevenueClass[]>([]);
  const reload = useCallback(() => { if (tenant) getRevenueClasses(tenant).then(setClasses, () => {}); }, [tenant]);
  useEffect(() => { reload(); }, [reload]);
  return { names: classes.filter(c => c.active !== false).map(c => c.name), classes, reload };
}
