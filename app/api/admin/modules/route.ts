import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/apiAuth';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;

  const [{ data: mods, error }, { data: tm }, { data: subs }] = await Promise.all([
    supabaseAdmin.from('modules').select('*').order('sort_order'),
    supabaseAdmin.from('tenant_modules').select('module_key, enabled, tenant_id'),
    supabaseAdmin.from('tenant_subscriptions').select('tenant_id, billable'),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const billableSet = new Set(
    (subs || []).filter((s: any) => s.billable !== false).map((s: any) => s.tenant_id)
  )

  const enabledCounts: Record<string, Set<string>> = {}
  const billableCounts: Record<string, Set<string>> = {}
  for (const row of (tm || [])) {
    if (!row.enabled || row.tenant_id === 'cerdia') continue
    if (!enabledCounts[row.module_key]) enabledCounts[row.module_key] = new Set()
    enabledCounts[row.module_key].add(row.tenant_id)
    if (billableSet.has(row.tenant_id)) {
      if (!billableCounts[row.module_key]) billableCounts[row.module_key] = new Set()
      billableCounts[row.module_key].add(row.tenant_id)
    }
  }

  const modules = (mods || []).map((m: any) => ({
    key: m.key,
    name_fr: m.name_fr,
    name_en: m.name_en,
    monthly_price: Number(m.monthly_price ?? 0),
    sort_order: Number(m.sort_order ?? 0),
    is_active: m.is_active !== false,
    active_tenants: enabledCounts[m.key]?.size ?? 0,
    billable_tenants: billableCounts[m.key]?.size ?? 0,
  }))

  return NextResponse.json({ modules })
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const { key, monthly_price, is_active, name_fr, name_en } = await req.json()
  if (!key) return NextResponse.json({ error: 'key requis' }, { status: 400 })
  const updates: any = { updated_at: new Date().toISOString() }
  if (monthly_price !== undefined) updates.monthly_price = Number(monthly_price)
  if (is_active !== undefined) updates.is_active = Boolean(is_active)
  if (name_fr !== undefined) updates.name_fr = String(name_fr)
  if (name_en !== undefined) updates.name_en = String(name_en)
  const { error } = await supabaseAdmin.from('modules').update(updates).eq('key', key)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
