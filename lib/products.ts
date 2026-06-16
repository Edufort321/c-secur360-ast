// Catalogue de PRODUITS NUMÉRIQUES (vente). Stockés dans la table `items` (article_type='digital',
// illimité = pas de suivi de stock). Alimente soumissions/factures ; ventes ventilées par CLASSE (bilan).
// Migration 194 ajoute product_class / is_unlimited / photo_url ; sauvegarde résiliente si non appliquée.
import { supabase } from '@/lib/supabase';

export type DigitalProduct = {
  id?: string; code?: string; name: string; description?: string | null;
  product_class?: string | null; sale_price?: number; cost_price?: number; unit?: string;
  photo_url?: string | null; is_unlimited?: boolean;
};

export async function getProducts(tenant: string): Promise<DigitalProduct[]> {
  const { data, error } = await supabase.from('items').select('*').eq('tenant_id', tenant).eq('article_type', 'digital').order('name');
  if (error) throw error;
  return (data as DigitalProduct[]) || [];
}

export async function saveProduct(tenant: string, p: DigitalProduct): Promise<string> {
  const full: any = {
    tenant_id: tenant, name: p.name.trim(), code: (p.code || '').trim() || null, description: p.description || null,
    category: p.product_class || 'Produit', product_class: p.product_class || null,
    sale_price: Number(p.sale_price) || 0, cost_price: Number(p.cost_price) || 0, unit: p.unit || 'u.',
    photo_url: p.photo_url || null, is_unlimited: p.is_unlimited !== false, article_type: 'digital', updated_at: new Date().toISOString(),
  };
  const attempt = (row: any) => p.id ? supabase.from('items').update(row).eq('id', p.id).eq('tenant_id', tenant).select('id').single() : supabase.from('items').insert(row).select('id').single();
  let res: any = await attempt(full); let guard = 0;
  while (res.error && guard < 12) {
    const m = (res.error.message || '').match(/'([a-z_]+)' column|column "?([a-z_]+)"? .*does not exist|could not find the '([a-z_]+)'/i);
    const col = m ? (m[1] || m[2] || m[3]) : null;
    if (col && col in full && !['name', 'tenant_id', 'article_type'].includes(col)) { delete full[col]; res = await attempt(full); guard++; } else break;
  }
  if (res.error) throw res.error;
  return res.data?.id || p.id || '';
}

export async function deleteProduct(tenant: string, id: string): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}
