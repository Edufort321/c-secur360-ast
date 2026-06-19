// Module HSE — couche d'accès aux données (tables permissive RLS, scopées par tenant côté app).
// Voir lib/hse/kpi.ts pour les calculs purs. Données « santé » : ne pas journaliser de PII en clair (Loi 25).
import { supabase } from '@/lib/supabase';

export type HseFramework = { id: string; code: string; name_fr: string; name_en: string; jurisdiction: string };
export type HseSettings = { tenant_id?: string; framework_id?: string | null; rate_base_hours: number; default_locale: string; brand_currency?: string };
export type HseRegisterType = { id: string; code: string; name_fr: string; name_en: string; framework_id?: string | null; default_review_months?: number | null; field_schema: any[]; icon?: string | null };
export type HseTenantRegister = { id: string; tenant_id?: string; register_type_id: string; is_enabled: boolean; review_months_override?: number | null };
export type HseRegisterEntry = { id?: string; tenant_id?: string; tenant_register_id: string; reference?: string | null; title: string; data: any; status?: string; last_review_at?: string | null; review_due_at?: string | null; created_by?: string | null };
export type HseIncident = {
  id?: string; tenant_id?: string; project_id?: string | null; occurred_at: string; reported_at?: string;
  event_code: string; severity?: string | null; is_lost_time?: boolean; lost_days?: number;
  body_part?: string | null; injury_type?: string | null; location_text?: string | null; description?: string | null;
  material_damage_amount?: number | null; reported_to_authority?: boolean; authority_reference?: string | null; created_by?: string | null;
};
export type HseDeadline = { id: string; tenant_id: string; incident_id: string; kind: string; due_at: string; label_fr?: string; label_en?: string; status: string; completed_at?: string | null; event_code?: string; occurred_at?: string };
export type HseHours = { id?: string; tenant_id?: string; project_id?: string | null; period_start: string; period_end: string; hours: number; headcount?: number | null };

// ── Référentiels globaux (lecture) ──────────────────────────────────────────────────────────────────
export async function getFrameworks(): Promise<HseFramework[]> {
  const { data } = await supabase.from('hse_regulatory_framework').select('*').eq('is_active', true).order('code');
  return (data || []) as HseFramework[];
}
export async function getRegisterTypes(): Promise<HseRegisterType[]> {
  const { data } = await supabase.from('hse_register_type').select('*').order('name_fr');
  return (data || []) as HseRegisterType[];
}

// ── Config tenant ────────────────────────────────────────────────────────────────────────────────────
export async function getHseSettings(tenant: string): Promise<HseSettings | null> {
  const { data } = await supabase.from('hse_tenant_settings').select('*').eq('tenant_id', tenant).maybeSingle();
  return (data as any) || null;
}
export async function saveHseSettings(tenant: string, s: HseSettings): Promise<{ error?: string }> {
  const { error } = await supabase.from('hse_tenant_settings').upsert({
    tenant_id: tenant, framework_id: s.framework_id || null, rate_base_hours: Number(s.rate_base_hours) || 200000,
    default_locale: s.default_locale || 'fr', brand_currency: s.brand_currency || 'CAD', updated_at: new Date().toISOString(),
  }, { onConflict: 'tenant_id' });
  return { error: error?.message };
}

// ── Registres activés ──────────────────────────────────────────────────────────────────────────────
export async function getTenantRegisters(tenant: string): Promise<HseTenantRegister[]> {
  const { data } = await supabase.from('hse_tenant_register').select('*').eq('tenant_id', tenant);
  return (data || []) as HseTenantRegister[];
}
export async function toggleTenantRegister(tenant: string, registerTypeId: string, enable: boolean, reviewOverride?: number | null): Promise<{ error?: string }> {
  const { error } = await supabase.from('hse_tenant_register').upsert({
    tenant_id: tenant, register_type_id: registerTypeId, is_enabled: enable,
    review_months_override: reviewOverride ?? null, updated_at: new Date().toISOString(),
  }, { onConflict: 'tenant_id,register_type_id' });
  return { error: error?.message };
}

// ── Entrées de registre ──────────────────────────────────────────────────────────────────────────────
export async function getRegisterEntries(tenant: string, tenantRegisterId?: string): Promise<HseRegisterEntry[]> {
  let q = supabase.from('hse_register_entry').select('*').eq('tenant_id', tenant).order('created_at', { ascending: false });
  if (tenantRegisterId) q = q.eq('tenant_register_id', tenantRegisterId);
  const { data } = await q;
  return (data || []) as HseRegisterEntry[];
}
/** Calcule review_due_at = last_review_at + (override ?? default) mois. */
export function computeReviewDue(lastReview?: string | null, months?: number | null): string | null {
  if (!lastReview || !months) return null;
  const d = new Date(lastReview + 'T00:00:00'); if (isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth() + months); return d.toISOString().slice(0, 10);
}
export async function saveRegisterEntry(tenant: string, e: HseRegisterEntry): Promise<{ error?: string }> {
  const row: any = { tenant_id: tenant, tenant_register_id: e.tenant_register_id, reference: e.reference || null, title: e.title, data: e.data || {}, status: e.status || 'active', last_review_at: e.last_review_at || null, review_due_at: e.review_due_at || null, updated_at: new Date().toISOString() };
  if (e.id) { const { error } = await supabase.from('hse_register_entry').update(row).eq('id', e.id).eq('tenant_id', tenant); return { error: error?.message }; }
  const { error } = await supabase.from('hse_register_entry').insert({ ...row, created_by: e.created_by || null });
  return { error: error?.message };
}
export async function deleteRegisterEntry(tenant: string, id: string): Promise<void> {
  await supabase.from('hse_register_entry').delete().eq('id', id).eq('tenant_id', tenant);
}

// ── Incidents + échéances ────────────────────────────────────────────────────────────────────────────
export async function getIncidents(tenant: string): Promise<HseIncident[]> {
  const { data } = await supabase.from('hse_incident').select('*').eq('tenant_id', tenant).order('occurred_at', { ascending: false });
  return (data || []) as HseIncident[];
}
/** Crée l'incident ; le trigger DB génère les échéances. Renvoie l'id pour relire les échéances. */
export async function saveIncident(tenant: string, i: HseIncident): Promise<{ id?: string; error?: string }> {
  const { data, error } = await supabase.from('hse_incident').insert({
    tenant_id: tenant, project_id: i.project_id || null, occurred_at: i.occurred_at, reported_at: i.reported_at || new Date().toISOString(),
    event_code: i.event_code, severity: i.severity || null, is_lost_time: !!i.is_lost_time, lost_days: Number(i.lost_days) || 0,
    body_part: i.body_part || null, injury_type: i.injury_type || null, location_text: i.location_text || null, description: i.description || null,
    material_damage_amount: i.material_damage_amount ?? null, created_by: i.created_by || null,
  }).select('id').single();
  if (error) return { error: error.message };
  return { id: (data as any).id };
}
export async function getOpenDeadlines(tenant: string): Promise<HseDeadline[]> {
  const { data } = await supabase.from('hse_v_open_deadlines').select('*').eq('tenant_id', tenant).order('due_at');
  return (data || []) as HseDeadline[];
}
export async function getDeadlinesForIncident(tenant: string, incidentId: string): Promise<HseDeadline[]> {
  const { data } = await supabase.from('hse_compliance_deadline').select('*').eq('tenant_id', tenant).eq('incident_id', incidentId).order('due_at');
  return (data || []) as HseDeadline[];
}
export async function completeDeadline(tenant: string, id: string, by?: string): Promise<void> {
  await supabase.from('hse_compliance_deadline').update({ status: 'done', completed_at: new Date().toISOString(), completed_by: by || null, updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenant);
}

// ── Heures travaillées (dénominateur KPI) ────────────────────────────────────────────────────────────
export async function getHoursWorked(tenant: string): Promise<HseHours[]> {
  const { data } = await supabase.from('hse_hours_worked').select('*').eq('tenant_id', tenant).order('period_start', { ascending: false });
  return (data || []) as HseHours[];
}
export async function saveHoursWorked(tenant: string, h: HseHours): Promise<{ error?: string }> {
  const { error } = await supabase.from('hse_hours_worked').upsert({
    tenant_id: tenant, project_id: h.project_id || null, period_start: h.period_start, period_end: h.period_end,
    hours: Number(h.hours) || 0, headcount: h.headcount ?? null,
  }, { onConflict: 'tenant_id,project_id,period_start' });
  return { error: error?.message };
}

/** Registres arrivant à révision ≤ 30 j (vue). */
export async function getRegistersDue(tenant: string): Promise<any[]> {
  const { data } = await supabase.from('hse_v_register_due').select('*').eq('tenant_id', tenant).order('review_due_at');
  return data || [];
}
