// Valorisation des stocks physiques (#42) : valeur = Σ (quantité × prix coûtant) à partir des tables
// `items` (cost_price) + `item_locations` (quantity/min/max). Sert au BILAN (compte 1300 « Stocks ») et
// à l'analyse d'OPTIMISATION par type (surstock, rupture, dormant, valeur par catégorie). Lecture client
// (tables opérationnelles, RLS permissive, isolation applicative par tenant_id).
import { supabase } from '@/lib/supabase';
import { getAccounts, getTrialBalance, createEntry } from '@/lib/accounting';

export type InvItemVal = {
  id: string; code: string; name: string; category: string; unit: string;
  costPrice: number; quantity: number; minQty: number; maxQty: number; value: number;
};
export type InventoryValuation = {
  totalValue: number;       // valeur totale au prix coûtant
  itemCount: number;        // nombre d'articles distincts
  unitsTotal: number;       // unités totales en stock
  byCategory: { name: string; value: number; units: number }[];
  overstock: InvItemVal[];  // quantité > max (max défini)
  lowstock: InvItemVal[];   // quantité <= min (réappro) — inclut les ruptures
  dormant: InvItemVal[];    // quantité 0 (épuisé/dormant)
  topValue: InvItemVal[];   // articles à plus forte valeur immobilisée
  items: InvItemVal[];
};

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

export async function getInventoryValuation(tenant: string): Promise<InventoryValuation> {
  const empty: InventoryValuation = { totalValue: 0, itemCount: 0, unitsTotal: 0, byCategory: [], overstock: [], lowstock: [], dormant: [], topValue: [], items: [] };
  if (!tenant) return empty;
  try {
    const [{ data: items }, { data: locs }] = await Promise.all([
      supabase.from('items').select('id, code, name, category, unit, cost_price').eq('tenant_id', tenant),
      supabase.from('item_locations').select('item_id, quantity, min_quantity, max_quantity').eq('tenant_id', tenant),
    ]);
    if (!items) return empty;
    // Agrège quantité + min/max par article (somme sur tous les emplacements/départements).
    const agg: Record<string, { q: number; min: number; max: number }> = {};
    for (const l of (locs || []) as any[]) {
      const k = String(l.item_id);
      (agg[k] ||= { q: 0, min: 0, max: 0 });
      agg[k].q += Number(l.quantity) || 0;
      agg[k].min += Number(l.min_quantity) || 0;
      agg[k].max += Number(l.max_quantity) || 0;
    }
    const rows: InvItemVal[] = (items as any[]).map(it => {
      const a = agg[String(it.id)] || { q: 0, min: 0, max: 0 };
      const costPrice = Number(it.cost_price) || 0;
      return {
        id: String(it.id), code: String(it.code || ''), name: String(it.name || ''),
        category: String(it.category || '—'), unit: String(it.unit || ''),
        costPrice, quantity: a.q, minQty: a.min, maxQty: a.max, value: r2(a.q * costPrice),
      };
    });
    const totalValue = r2(rows.reduce((s, r) => s + r.value, 0));
    const unitsTotal = rows.reduce((s, r) => s + r.quantity, 0);
    const catMap: Record<string, { value: number; units: number }> = {};
    rows.forEach(r => { (catMap[r.category] ||= { value: 0, units: 0 }); catMap[r.category].value += r.value; catMap[r.category].units += r.quantity; });
    const byCategory = Object.entries(catMap).map(([name, v]) => ({ name, value: r2(v.value), units: v.units })).sort((a, b) => b.value - a.value);
    return {
      totalValue, itemCount: rows.length, unitsTotal, byCategory,
      overstock: rows.filter(r => r.maxQty > 0 && r.quantity > r.maxQty).sort((a, b) => (b.quantity - b.maxQty) - (a.quantity - a.maxQty)),
      lowstock: rows.filter(r => r.minQty > 0 && r.quantity <= r.minQty).sort((a, b) => a.quantity - b.quantity),
      dormant: rows.filter(r => r.quantity === 0),
      topValue: [...rows].filter(r => r.value > 0).sort((a, b) => b.value - a.value).slice(0, 10),
      items: rows,
    };
  } catch { return empty; }
}

/** Solde comptabilisé du compte 1300 (Stocks) au grand livre, ou null si plan comptable absent. */
export async function getBookedStockValue(tenant: string): Promise<number | null> {
  try {
    const [accs, bal] = await Promise.all([getAccounts(tenant), getTrialBalance(tenant)]);
    const inv = accs.find(a => a.code === '1300');
    if (!inv) return null;
    const b = bal[inv.id]; if (!b) return 0;
    return r2(b.debit - b.credit);
  } catch { return null; }
}

/**
 * Aligne le compte 1300 « Stocks » sur la valeur calculée (méthode périodique : variation des stocks).
 * Poste l'ÉCART vs le solde comptabilisé :
 *   - stock ↑ : DR 1300 / CR 5350 (Variation des stocks — réduit la charge)
 *   - stock ↓ : DR 5350 / CR 1300
 * Idempotent en pratique : une 2e exécution donne un écart ~0 → « déjà à jour ». Crée le compte 5350 si absent.
 */
export async function postInventoryToBalance(tenant: string, computedValue: number): Promise<{ posted: boolean; delta: number; reason?: string }> {
  const accs = await getAccounts(tenant);
  const inv = accs.find(a => a.code === '1300');
  if (!inv) return { posted: false, delta: 0, reason: 'Plan comptable non initialisé (compte 1300 absent).' };
  let varAcc = accs.find(a => a.code === '5350');
  if (!varAcc) {
    const { data } = await supabase.from('gl_accounts').insert({ tenant_id: tenant, code: '5350', name: 'Variation des stocks', type: 'expense', normal_balance: 'debit', is_active: true, is_system: false }).select('*').single();
    varAcc = data as any;
  }
  if (!varAcc) return { posted: false, delta: 0, reason: 'Compte « Variation des stocks » (5350) indisponible.' };
  const bal = await getTrialBalance(tenant);
  const cur = bal[inv.id] ? r2(bal[inv.id].debit - bal[inv.id].credit) : 0;
  const delta = r2(computedValue - cur);
  if (Math.abs(delta) < 0.01) return { posted: false, delta: 0, reason: 'Déjà à jour (aucun écart).' };
  const date = new Date().toISOString().slice(0, 10);
  const lines = delta > 0
    ? [{ account_id: inv.id, debit: delta, credit: 0, description: 'Stocks — valorisation' }, { account_id: varAcc.id, debit: 0, credit: delta, description: 'Variation des stocks' }]
    : [{ account_id: varAcc.id, debit: -delta, credit: 0, description: 'Variation des stocks' }, { account_id: inv.id, debit: 0, credit: -delta, description: 'Stocks — valorisation' }];
  await createEntry(tenant, {
    entry_date: date, description: `Valorisation des stocks au ${date}`, reference: `STOCK-${date}`,
    journal_code: 'OD', source_type: 'inventory_valuation', source_id: `inv-${date}`, lines,
  });
  return { posted: true, delta };
}
