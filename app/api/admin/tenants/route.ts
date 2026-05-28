import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPassword } from '@/lib/auth';

const SYNC_SECRET = process.env.CSECUR360_SYNC_SECRET || 'csecur360-cerdia-bridge'

// GET → liste des tenants + leur abonnement (pour le panneau super-admin)
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth && auth !== `Bearer ${SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data, error } = await supabaseAdmin.from('tenants').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: subs } = await supabaseAdmin
    .from('tenant_subscriptions').select('tenant_id, next_billing_date, grace_days, reminder_days, status, amount, billable');
  const map: Record<string, any> = Object.fromEntries((subs || []).map((s: any) => [s.tenant_id, s]));

  // Revenu annuel projeté par tenant = Σ(modules activés × prix) − escompte cumulatif
  const [{ data: tm }, { data: mods }, { data: bc }] = await Promise.all([
    supabaseAdmin.from('tenant_modules').select('tenant_id, module_key, enabled'),
    supabaseAdmin.from('modules').select('key, monthly_price'),
    supabaseAdmin.from('billing_config').select('discount_per_module, discount_cap').eq('id', 'default').maybeSingle(),
  ]);
  const price: Record<string, number> = Object.fromEntries((mods || []).map((m: any) => [m.key, Number(m.monthly_price) || 0]));
  const per = Number(bc?.discount_per_module ?? 5);
  const cap = Number(bc?.discount_cap ?? 30);
  const byTenant: Record<string, string[]> = {};
  (tm || []).filter((x: any) => x.enabled).forEach((x: any) => { (byTenant[x.tenant_id] ||= []).push(x.module_key); });
  const revenueOf = (id: string) => {
    const keys = byTenant[id] || [];
    const subtotal = keys.reduce((s, k) => s + (price[k] || 0), 0);
    const disc = Math.min(Math.max(keys.length - 1, 0) * per, cap);
    return Math.round(subtotal * (1 - disc / 100) * 100) / 100;
  };

  return NextResponse.json({
    tenants: (data || []).map((t: any) => ({
      ...t,
      subscription: map[t.id] || null,
      annualRevenue: revenueOf(t.id),
      billable: map[t.id]?.billable !== false,
    })),
  });
}

// POST → crée un tenant (tenants + tenant_modules + admin du tenant)
// body: { subdomain, companyName, adminEmail?, adminPassword?, modules?: string[] }
export async function POST(req: NextRequest) {
  try {
    const { subdomain, companyName, adminEmail, adminPassword, modules, billable, vendor_id } = await req.json();
    if (!subdomain || !companyName) {
      return NextResponse.json({ error: 'subdomain et companyName requis' }, { status: 400 });
    }
    const id = String(subdomain).toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    if (!id) return NextResponse.json({ error: 'sous-domaine invalide' }, { status: 400 });

    // 1) Tenant
    const { error: te } = await supabaseAdmin.from('tenants').insert({
      id, subdomain: id, companyName, plan: 'basic', isActive: true,
      ...(vendor_id ? { vendor_id } : {}),
    });
    if (te) throw te;

    // 2) Modules (activés = fournis, sinon tous ceux du catalogue)
    const { data: cat } = await supabaseAdmin.from('modules').select('key');
    const keys = (cat || []).map((m: any) => m.key);
    const sel: string[] = Array.isArray(modules) && modules.length ? modules : keys;
    if (keys.length) {
      await supabaseAdmin.from('tenant_modules').upsert(
        keys.map((k: string) => ({ tenant_id: id, module_key: k, enabled: sel.includes(k), source: 'manual' })),
        { onConflict: 'tenant_id,module_key' }
      );
    }

    // 3) Abonnement initial avec flag billable
    await supabaseAdmin.from('tenant_subscriptions').upsert(
      { tenant_id: id, billable: billable !== false },
      { onConflict: 'tenant_id' }
    );

    // 4) Admin du tenant (optionnel)
    if (adminEmail && adminPassword) {
      const hash = await hashPassword(adminPassword);
      await supabaseAdmin.from('users').insert({
        id: randomUUID(),
        email: String(adminEmail).toLowerCase().trim(),
        name: `${companyName} — Admin`,
        password: hash,
        role: 'client_admin',
        tenantId: id,
        tenant_id: id,
        is_active: true,
        first_login: true,
      });
    }

    // Calcul du revenu pour la sync CERDIA (inline — sans revenueOf du scope GET)
    const enabledKeys: string[] = sel;
    const [{ data: modPrices }, { data: billingCfg }] = await Promise.all([
      supabaseAdmin.from('modules').select('key, monthly_price'),
      supabaseAdmin.from('billing_config').select('discount_per_module, discount_cap').eq('id', 'default').maybeSingle(),
    ]);
    const priceMap: Record<string, number> = Object.fromEntries((modPrices || []).map((m: any) => [m.key, Number(m.monthly_price) || 0]));
    const perDisc = Number(billingCfg?.discount_per_module ?? 5);
    const capDisc = Number(billingCfg?.discount_cap ?? 30);
    const subtotal = enabledKeys.reduce((s, k) => s + (priceMap[k] || 0), 0);
    const disc = Math.min(Math.max(enabledKeys.length - 1, 0) * perDisc, capDisc);
    const annualRevenue = Math.round(subtotal * (1 - disc / 100) * 100) / 100;

    // Sync vers CERDIA Commerce (non-bloquant — echec silencieux)
    const cerdiaUrl = process.env.CERDIA_COMMERCE_URL;
    const syncSecret = process.env.CSECUR360_SYNC_SECRET || 'csecur360-cerdia-bridge';
    if (cerdiaUrl) {
      fetch(`${cerdiaUrl}/api/commerce/csecur360`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${syncSecret}` },
        body: JSON.stringify({
          id,
          company_name: companyName,
          admin_email: adminEmail || null,
          plan: 'professional',
          monthly_revenue: Math.round(annualRevenue / 12 * 100) / 100,
          annual_revenue: annualRevenue,
          modules_count: enabledKeys.length,
          sites_count: 1,
          status: 'active',
        }),
      }).catch(() => { /* sync non critique */ });
    }

    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 });
  }
}

// DELETE /api/admin/tenants?id=xxx → supprime un tenant (sauf cerdia) + données liées
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  if (id === 'cerdia') return NextResponse.json({ error: 'CERDIA ne peut pas être supprimé' }, { status: 400 });
  await supabaseAdmin.from('tenant_modules').delete().eq('tenant_id', id);
  await supabaseAdmin.from('tenant_subscriptions').delete().eq('tenant_id', id);
  await supabaseAdmin.from('users').delete().eq('tenant_id', id);
  const { error } = await supabaseAdmin.from('tenants').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
