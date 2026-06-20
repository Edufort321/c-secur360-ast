// Module HSE — SYNCHRO du MIROIR. Reflète un rapport `incident_reports` (module Accidents) en une ligne
// `hse_incident` (lien source_report_id) classée en code réglementaire (lib/hse/incidentClassify).
// SERVEUR uniquement (supabaseAdmin). À l'INSERT, le trigger DB génère les échéances réglementaires ;
// à l'UPDATE, on rafraîchit seulement les champs KPI (on ne régénère pas les échéances déjà créées).
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { classifyReport, isMirrorable, type IncidentReportLite } from '@/lib/hse/incidentClassify';

export type MirrorResult = { action: 'insert' | 'update' | 'delete' | 'skip'; error?: string };

/** Crée/MAJ/supprime le miroir hse_incident d'un rapport. Brouillon → supprime le miroir (pas d'échéance). */
export async function syncMirror(tenant: string, report: IncidentReportLite): Promise<MirrorResult> {
  if (!report?.id) return { action: 'skip' };
  // Brouillon : retirer un éventuel miroir (le rapport ne compte pas encore).
  if (!isMirrorable(report)) {
    await supabaseAdmin.from('hse_incident').delete().eq('tenant_id', tenant).eq('source_report_id', report.id);
    return { action: 'delete' };
  }
  const m = classifyReport(report);
  const { data: existing } = await supabaseAdmin.from('hse_incident').select('id').eq('tenant_id', tenant).eq('source_report_id', report.id).maybeSingle();

  if (existing?.id) {
    // MAJ des champs KPI (sans toucher au workflow ni régénérer les échéances).
    const patch: any = { event_code: m.event_code, occurred_at: m.occurred_at, is_lost_time: m.is_lost_time, is_restricted: m.is_restricted, lost_days: m.lost_days, severity: m.severity, location_text: m.location_text, material_damage_amount: m.material_damage_amount, updated_at: new Date().toISOString() };
    let { error } = await supabaseAdmin.from('hse_incident').update(patch).eq('id', existing.id).eq('tenant_id', tenant);
    if (error && /is_restricted/.test(error.message || '')) { delete patch.is_restricted; ({ error } = await supabaseAdmin.from('hse_incident').update(patch).eq('id', existing.id).eq('tenant_id', tenant)); }
    return { action: 'update', error: error?.message };
  }

  // INSERT (le trigger génère les échéances). created_by marque l'origine automatique.
  const row: any = {
    tenant_id: tenant, source_report_id: report.id, occurred_at: m.occurred_at, reported_at: new Date().toISOString(),
    event_code: m.event_code, severity: m.severity, is_lost_time: m.is_lost_time, is_restricted: m.is_restricted, lost_days: m.lost_days,
    location_text: m.location_text, material_damage_amount: m.material_damage_amount, created_by: 'sync:accidents',
  };
  let { error } = await supabaseAdmin.from('hse_incident').insert(row);
  if (error && /is_restricted/.test(error.message || '')) { delete row.is_restricted; ({ error } = await supabaseAdmin.from('hse_incident').insert(row)); }
  if (error && /source_report_id/.test(error.message || '')) return { action: 'skip', error: 'migration 259 requise' }; // évite un doublon non lié
  return { action: 'insert', error: error?.message };
}

/** Backfill idempotent : assure un miroir pour TOUS les rapports soumis d'un tenant. Renvoie le compte traité. */
export async function backfillMirrors(tenant: string): Promise<{ synced: number; skipped: number }> {
  const { data } = await supabaseAdmin.from('incident_reports').select('id, incident_type, status, data, created_at').eq('tenant_id', tenant);
  let synced = 0, skipped = 0;
  for (const r of (data || []) as any[]) {
    const res = await syncMirror(tenant, r);
    if (res.action === 'skip') skipped++; else synced++;
  }
  return { synced, skipped };
}
