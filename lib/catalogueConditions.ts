// Conditions/frais (subsistance, hébergement…) tirées du CATALOGUE DES TAUX = prix VENDANT du tenant.
// Source : catalogue_taux.extras (sub_h5/h12/h15/nuitee, hebergement) + custom_rates (catégorie
// subsistance/hébergement/frais/voyagement). Voir docs/INTERCONNEXION_TEMPS.md (Point 2). Couche client.
import { supabase } from '@/lib/supabase';

export interface CatalogueCondition { key: string; label: string; sell_price: number; }
// Condition appliquée à un poste (stockée dans poste_salary_grids.grid_conditions).
export interface GridCondition { key: string; label: string; sell_price: number; employee_price: number; applies: boolean; }

const EXTRA_KEYS: [string, string][] = [
  ['sub_h5', 'Subsistance 5 h'], ['sub_h12', 'Subsistance 12 h'], ['sub_h15', 'Subsistance 15 h'],
  ['sub_nuitee', 'Subsistance nuitée'], ['hebergement', 'Hébergement'],
];
const CR_CATS = ['subsistance', 'hebergement', 'hébergement', 'frais', 'voyagement'];
const slug = (s: string) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

// Retourne les conditions du catalogue actif/préféré du tenant (prix vendant).
export async function getCatalogueConditions(tenant: string): Promise<CatalogueCondition[]> {
  const { data } = await supabase.from('catalogue_taux')
    .select('extras, custom_rates, labels, preferred, status, year, revision')
    .eq('tenant_id', tenant).eq('status', 'active')
    .order('preferred', { ascending: false }).order('year', { ascending: false }).order('revision', { ascending: false });
  const cat: any = (data || [])[0];
  if (!cat) return [];
  const labels = cat.labels || {}; const extras = cat.extras || {};
  const out: CatalogueCondition[] = [];
  for (const [k, def] of EXTRA_KEYS) {
    const v = Number(extras[k]);
    if (v > 0) out.push({ key: k, label: labels[k] || def, sell_price: v });
  }
  (Array.isArray(cat.custom_rates) ? cat.custom_rates : []).forEach((r: any) => {
    const c = String(r.categorie || '').toLowerCase();
    const v = Number(r.value);
    if (CR_CATS.includes(c) && v > 0 && r.label) out.push({ key: `cr_${slug(r.label)}`, label: r.label, sell_price: v });
  });
  return out;
}

export const DEFAULT_EMPLOYEE_FACTOR = 0.8; // prix employé = vendant × 0,8 (−20 %) par défaut
