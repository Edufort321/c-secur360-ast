// Registre des immobilisations (biens de l'entreprise) — #livre. Données opérationnelles (table
// permissive, scopées par tenant côté app). Comptabilisation via le grand livre (lib/accounting).
import { supabase } from '@/lib/supabase';

export type CompanyAsset = {
  id?: string; tenant_id?: string; name: string; category?: string | null; acquisition_date?: string;
  cost: number; supplier?: string | null; serial_number?: string | null; useful_life_years?: number | null;
  salvage_value?: number; status?: 'active' | 'disposed'; disposal_date?: string | null;
  gl_entry_id?: string | null; notes?: string | null;
};

export const ASSET_CATEGORIES = ['Informatique', 'Mobilier de bureau', 'Véhicule', 'Équipement', 'Outillage', 'Bâtiment', 'Autre'];

export async function getAssets(tenant: string): Promise<CompanyAsset[]> {
  const { data, error } = await supabase.from('company_assets').select('*').eq('tenant_id', tenant).order('acquisition_date', { ascending: false });
  if (error) throw error;
  return (data || []) as CompanyAsset[];
}

export async function saveAsset(tenant: string, a: CompanyAsset): Promise<string> {
  const row: any = {
    tenant_id: tenant, name: a.name, category: a.category || null, acquisition_date: a.acquisition_date || new Date().toISOString().slice(0, 10),
    cost: Number(a.cost) || 0, supplier: a.supplier || null, serial_number: a.serial_number || null,
    useful_life_years: a.useful_life_years != null && a.useful_life_years !== ('' as any) ? Number(a.useful_life_years) : null,
    salvage_value: Number(a.salvage_value) || 0, status: a.status || 'active', disposal_date: a.disposal_date || null,
    gl_entry_id: a.gl_entry_id ?? null, notes: a.notes || null, updated_at: new Date().toISOString(),
  };
  if (a.id) { const { error } = await supabase.from('company_assets').update(row).eq('id', a.id).eq('tenant_id', tenant); if (error) throw error; return a.id; }
  const { data, error } = await supabase.from('company_assets').insert(row).select('id').single();
  if (error) throw error;
  return (data as any).id as string;
}

export async function deleteAsset(tenant: string, id: string): Promise<void> {
  const { error } = await supabase.from('company_assets').delete().eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}

/** Amortissement annuel linéaire (coût − valeur résiduelle) ÷ durée de vie. 0 si durée non définie. */
export function annualDepreciation(a: CompanyAsset): number {
  const life = Number(a.useful_life_years) || 0; if (life <= 0) return 0;
  return Math.max(0, ((Number(a.cost) || 0) - (Number(a.salvage_value) || 0)) / life);
}

/** Valeur comptable nette d'un parc (somme des coûts des biens actifs). */
export function assetsBookValue(assets: CompanyAsset[]): number {
  return assets.filter(a => a.status !== 'disposed').reduce((s, a) => s + (Number(a.cost) || 0), 0);
}
