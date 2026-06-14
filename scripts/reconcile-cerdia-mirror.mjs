// One-off : réconcilie le MIROIR commerce de CERDIA (csecur360_clients/vendors/modules) avec la vérité
// de C-Secur360, EN DIRECT base-à-base (sans dépendre du sync HTTP ni des env Vercel). Reproduit la
// logique des endpoints /api/admin/{tenants,modules,vendors} + de la route sync (revenu, facturable=0,
// pruning). Idempotent. Lit les deux .env.local (C-Secur ici, CERDIA en chemin absolu).
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

function loadEnv(p) {
  return Object.fromEntries(
    readFileSync(p, 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
      .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
  );
}
const csEnv = loadEnv(new URL('../.env.local', import.meta.url));
const ceEnv = loadEnv('C:/CERDIA/investissement-cerdia-main/.env.local');

const cs = createClient(csEnv.NEXT_PUBLIC_SUPABASE_URL, csEnv.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const ce = createClient(ceEnv.NEXT_PUBLIC_SUPABASE_URL, ceEnv.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
console.log('C-Secur :', csEnv.NEXT_PUBLIC_SUPABASE_URL);
console.log('CERDIA  :', ceEnv.NEXT_PUBLIC_SUPABASE_URL);
const now = new Date().toISOString();

async function pruneMissing(table, col, keep) {
  const { data } = await ce.from(table).select(col);
  const set = new Set(keep.map(String));
  const del = (data || []).map(r => r[col]).filter(k => !set.has(String(k)));
  if (del.length) await ce.from(table).delete().in(col, del);
  return del.length;
}

// ── Source C-Secur ──
const [{ data: tenants }, { data: subs }, { data: tm }, { data: mods }, { data: bc }, { data: vendors }] = await Promise.all([
  cs.from('tenants').select('*'),
  cs.from('tenant_subscriptions').select('tenant_id, billable'),
  cs.from('tenant_modules').select('tenant_id, module_key, enabled'),
  cs.from('modules').select('*').order('sort_order'),
  cs.from('billing_config').select('discount_per_module, discount_cap').eq('id', 'default').maybeSingle(),
  cs.from('vendors').select('*').order('name'),
]);

const subMap = Object.fromEntries((subs || []).map(s => [s.tenant_id, s]));
const price = Object.fromEntries((mods || []).map(m => [m.key, Number(m.monthly_price) || 0]));
const per = Number(bc?.discount_per_module ?? 5), cap = Number(bc?.discount_cap ?? 30);
const byTenant = {};
(tm || []).filter(x => x.enabled).forEach(x => { (byTenant[x.tenant_id] ||= []).push(x.module_key); });
const revenueOf = id => {
  const keys = byTenant[id] || [];
  const subtotal = keys.reduce((s, k) => s + (price[k] || 0), 0);
  const disc = Math.min(Math.max(keys.length - 1, 0) * per, cap);
  return Math.round(subtotal * (1 - disc / 100) * 100) / 100;
};

// ── Vendeurs ──
const vRows = (vendors || []).map(v => ({
  id: v.id, name: v.name, email: v.email || null, phone: v.phone || null,
  commission_rate: Number(v.commission_rate ?? 0.20), is_active: v.is_active !== false, notes: v.notes || null, synced_at: now,
}));
if (vRows.length) { const { error } = await ce.from('csecur360_vendors').upsert(vRows, { onConflict: 'id' }); if (error) console.error('vendors:', error.message); }
const vPruned = await pruneMissing('csecur360_vendors', 'id', vRows.map(v => v.id));

// ── Clients (tenants) ──
const cRows = (tenants || []).map(t => {
  const billable = subMap[t.id]?.billable !== false;
  const annual = billable ? revenueOf(t.id) : 0;
  return {
    id: t.id, company_name: t.companyName || t.company_name || t.id,
    admin_email: t.adminEmail || t.billing_email || null, plan: t.plan || 'professional',
    monthly_revenue: Math.round(annual / 12 * 100) / 100, annual_revenue: annual,
    modules_count: (byTenant[t.id] || []).length, sites_count: 1,
    status: t.archived ? 'archived' : t.isActive === false ? 'suspended' : 'active',
    vendor_id: t.vendor_id || null, billable, synced_at: now,
  };
});
if (cRows.length) { const { error } = await ce.from('csecur360_clients').upsert(cRows, { onConflict: 'id' }); if (error) console.error('clients:', error.message); }
const cPruned = await pruneMissing('csecur360_clients', 'id', cRows.map(c => c.id));

// ── Modules (catalogue + compteurs) ──
const enabledC = {}, billableC = {};
const billableSet = new Set((subs || []).filter(s => s.billable !== false).map(s => s.tenant_id));
for (const row of (tm || [])) {
  if (!row.enabled || row.tenant_id === 'cerdia') continue;
  (enabledC[row.module_key] ||= new Set()).add(row.tenant_id);
  if (billableSet.has(row.tenant_id)) (billableC[row.module_key] ||= new Set()).add(row.tenant_id);
}
const mRows = (mods || []).map(m => ({
  key: m.key, name_fr: m.name_fr, name_en: m.name_en,
  monthly_price: Number(m.monthly_price ?? 0), sort_order: Number(m.sort_order ?? 0),
  is_active: m.is_active !== false, active_tenants: enabledC[m.key]?.size ?? 0, billable_tenants: billableC[m.key]?.size ?? 0, synced_at: now,
}));
if (mRows.length) { const { error } = await ce.from('csecur360_modules').upsert(mRows, { onConflict: 'key' }); if (error) console.error('modules:', error.message); }
const mPruned = await pruneMissing('csecur360_modules', 'key', mRows.map(m => m.key));

console.log(`\n✓ Vendeurs : ${vRows.length} upsert, ${vPruned} supprimés`);
console.log(`✓ Clients  : ${cRows.length} upsert (${cRows.filter(c => c.billable).length} facturables, ARR ${cRows.reduce((s, c) => s + c.annual_revenue, 0)}$), ${cPruned} supprimés`);
console.log(`✓ Modules  : ${mRows.length} upsert (marketing présent: ${mRows.some(m => m.key === 'marketing')}), ${mPruned} supprimés`);
process.exit(0);
