// Module HSE — couche d'accès aux données (tables permissive RLS, scopées par tenant côté app).
// Voir lib/hse/kpi.ts pour les calculs purs. Données « santé » : ne pas journaliser de PII en clair (Loi 25).
import { supabase } from '@/lib/supabase';

export type HseFramework = { id: string; code: string; name_fr: string; name_en: string; jurisdiction: string };
export type HseSettings = { tenant_id?: string; framework_id?: string | null; rate_base_hours: number; default_locale: string; brand_currency?: string; reminder_email?: string | null; target_ltifr?: number | null; target_trir?: number | null; target_severity?: number | null };
export type HseRegisterType = { id: string; code: string; name_fr: string; name_en: string; framework_id?: string | null; default_review_months?: number | null; field_schema: any[]; icon?: string | null };
export type HseTenantRegister = { id: string; tenant_id?: string; register_type_id: string; is_enabled: boolean; review_months_override?: number | null };
export type HseRegisterEntry = { id?: string; tenant_id?: string; tenant_register_id: string; reference?: string | null; title: string; data: any; status?: string; last_review_at?: string | null; review_due_at?: string | null; created_by?: string | null };
export type HseIncident = {
  id?: string; tenant_id?: string; project_id?: string | null; occurred_at: string; reported_at?: string;
  event_code: string; severity?: string | null; is_lost_time?: boolean; is_restricted?: boolean; lost_days?: number;
  body_part?: string | null; injury_type?: string | null; location_text?: string | null; description?: string | null;
  material_damage_amount?: number | null; reported_to_authority?: boolean; authority_reference?: string | null; created_by?: string | null;
  status?: string; root_cause?: string | null; contributing_factors?: string | null; closed_at?: string | null; closed_by?: string | null;
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
  const row: any = {
    tenant_id: tenant, framework_id: s.framework_id || null, rate_base_hours: Number(s.rate_base_hours) || 200000,
    default_locale: s.default_locale || 'fr', brand_currency: s.brand_currency || 'CAD', updated_at: new Date().toISOString(),
  };
  if (s.reminder_email !== undefined) row.reminder_email = s.reminder_email || null;
  if (s.target_ltifr !== undefined) row.target_ltifr = s.target_ltifr ?? null;
  if (s.target_trir !== undefined) row.target_trir = s.target_trir ?? null;
  if (s.target_severity !== undefined) row.target_severity = s.target_severity ?? null;
  const { error } = await supabase.from('hse_tenant_settings').upsert(row, { onConflict: 'tenant_id' });
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
  const row: any = {
    tenant_id: tenant, project_id: i.project_id || null, occurred_at: i.occurred_at, reported_at: i.reported_at || new Date().toISOString(),
    event_code: i.event_code, severity: i.severity || null, is_lost_time: !!i.is_lost_time, is_restricted: !!i.is_restricted, lost_days: Number(i.lost_days) || 0,
    body_part: i.body_part || null, injury_type: i.injury_type || null, location_text: i.location_text || null, description: i.description || null,
    material_damage_amount: i.material_damage_amount ?? null, created_by: i.created_by || null,
  };
  let { data, error } = await supabase.from('hse_incident').insert(row).select('id').single();
  if (error && /is_restricted/.test(error.message || '')) {   // migration 257 pas encore appliquée → repli
    delete row.is_restricted;
    ({ data, error } = await supabase.from('hse_incident').insert(row).select('id').single());
  }
  if (error) return { error: error.message };
  return { id: (data as any).id };
}
/** Met à jour le workflow d'un incident (statut, causes racines, clôture). */
export async function updateIncidentWorkflow(tenant: string, id: string, patch: { status?: string; root_cause?: string | null; contributing_factors?: string | null; closed_by?: string | null }): Promise<{ error?: string }> {
  const row: any = { updated_at: new Date().toISOString() };
  if (patch.status !== undefined) { row.status = patch.status; if (patch.status === 'closed') { row.closed_at = new Date().toISOString(); row.closed_by = patch.closed_by || null; } }
  if (patch.root_cause !== undefined) row.root_cause = patch.root_cause;
  if (patch.contributing_factors !== undefined) row.contributing_factors = patch.contributing_factors;
  const { error } = await supabase.from('hse_incident').update(row).eq('id', id).eq('tenant_id', tenant);
  return { error: error?.message };
}

// ── Actions correctives / préventives (CAPA) ──────────────────────────────────────────────────────────
export type HseCapa = { id?: string; tenant_id?: string; incident_id: string; kind?: string; description: string; assigned_to?: string | null; due_date?: string | null; status?: string; completed_at?: string | null; completed_by?: string | null; evidence?: string | null; created_by?: string | null };
export async function getCapa(tenant: string, incidentId: string): Promise<HseCapa[]> {
  const { data } = await supabase.from('hse_corrective_action').select('*').eq('tenant_id', tenant).eq('incident_id', incidentId).order('created_at');
  return (data || []) as HseCapa[];
}
export async function saveCapa(tenant: string, c: HseCapa): Promise<{ error?: string }> {
  const row: any = { tenant_id: tenant, incident_id: c.incident_id, kind: c.kind || 'corrective', description: c.description, assigned_to: c.assigned_to || null, due_date: c.due_date || null, status: c.status || 'open', evidence: c.evidence || null, updated_at: new Date().toISOString() };
  if (c.id) { const { error } = await supabase.from('hse_corrective_action').update(row).eq('id', c.id).eq('tenant_id', tenant); return { error: error?.message }; }
  const { error } = await supabase.from('hse_corrective_action').insert({ ...row, created_by: c.created_by || null });
  return { error: error?.message };
}
export async function completeCapa(tenant: string, id: string, by?: string, evidence?: string): Promise<void> {
  await supabase.from('hse_corrective_action').update({ status: 'done', completed_at: new Date().toISOString(), completed_by: by || null, evidence: evidence || null, updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenant);
}
export async function deleteCapa(tenant: string, id: string): Promise<void> {
  await supabase.from('hse_corrective_action').delete().eq('id', id).eq('tenant_id', tenant);
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
export async function deleteHoursWorked(tenant: string, id: string): Promise<void> {
  await supabase.from('hse_hours_worked').delete().eq('id', id).eq('tenant_id', tenant);
}

/** Registres arrivant à révision ≤ 30 j (vue). */
export async function getRegistersDue(tenant: string): Promise<any[]> {
  const { data } = await supabase.from('hse_v_register_due').select('*').eq('tenant_id', tenant).order('review_due_at');
  return data || [];
}

// ── Journal d'audit HSE (immuable, alimenté par trigger) ─────────────────────────────────────────────
export type HseAuditRow = { id: number; tenant_id: string; table_name: string; row_id: string | null; operation: string; actor: string | null; summary: any; at: string };
export async function getAuditLog(tenant: string, limit = 200): Promise<HseAuditRow[]> {
  const { data } = await supabase.from('hse_audit_log').select('*').eq('tenant_id', tenant).order('at', { ascending: false }).limit(limit);
  return (data || []) as HseAuditRow[];
}

// ── Indicateurs proactifs (leading) ──────────────────────────────────────────────────────────────────
export type HseProactive = { id?: string; tenant_id?: string; project_id?: string | null; period_start: string; metric_code: string; count_value: number };
export async function getProactiveMetrics(tenant: string): Promise<HseProactive[]> {
  const { data } = await supabase.from('hse_proactive_metric').select('*').eq('tenant_id', tenant).order('period_start', { ascending: false });
  return (data || []) as HseProactive[];
}
export async function saveProactiveMetric(tenant: string, p: HseProactive): Promise<{ error?: string }> {
  const { error } = await supabase.from('hse_proactive_metric').upsert({
    tenant_id: tenant, project_id: p.project_id || null, period_start: p.period_start, metric_code: p.metric_code, count_value: Number(p.count_value) || 0,
  }, { onConflict: 'tenant_id,project_id,period_start,metric_code' });
  return { error: error?.message };
}

// ── Interconnexions (contexte d'exposition — best-effort, jamais bloquant) ────────────────────────────
export type HseInterconnect = { astCount: number; permitCount: number; plannedHours: number };
export async function getInterconnectStats(tenant: string, plannedHours: number): Promise<HseInterconnect> {
  const safeCount = async (table: string) => { try { const { count } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq('tenant_id', tenant); return count || 0; } catch { return 0; } };
  const [astCount, permitCount] = await Promise.all([safeCount('ast_forms'), safeCount('work_permits')]);
  return { astCount, permitCount, plannedHours };
}
