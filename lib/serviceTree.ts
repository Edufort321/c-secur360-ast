// Arborescence CLIENT → ÉQUIPEMENTS (module Maintenance/Inspection, phase 2).
// Une compagnie de service regroupe ses équipements à vérifier par client. Clients = table `clients`
// (admin) ou créés custom ici. Rattachement via equipment.client_id (migration 228).
import { supabase } from '@/lib/supabase';
import { getSitesTree } from '@/lib/sites';

export type SClient = { id: string; name: string; active?: boolean; alertEmail?: string | null; autoNotify?: boolean };
export type SEquip = {
  id: string; name: string; type?: string | null; serial?: string | null; location?: string | null;
  client_id?: string | null; site_id?: string | null; brand?: string | null; model?: string | null; frequency?: string | null;
  public_alerts?: boolean; default_gabarit_id?: string | null;
  source?: string | null; source_id?: string | null;
};
export type LastInsp = { result?: string; date?: string; anomalies?: number };

// Champs d'une fiche équipement (création/édition depuis le module Maintenance).
export type EquipInput = {
  type?: string; name?: string; serial?: string; brand?: string; model?: string;
  location?: string; frequency?: string; public_alerts?: boolean; client_id?: string | null; site_id?: string | null; default_gabarit_id?: string | null;
  source?: string | null; source_id?: string | null;
};

export async function getServiceClients(tenant: string): Promise<SClient[]> {
  // select('*') : résilient si maintenance_alert_email (230) / maintenance_auto_notify (266) absents.
  const { data, error } = await supabase.from('clients').select('*').eq('tenant_id', tenant).order('name');
  if (error) return [];
  return (data as any[]).map(c => ({
    id: c.id, name: c.name || '(client)', active: c.active !== false,
    alertEmail: c.maintenance_alert_email ?? c.email ?? null, autoNotify: c.maintenance_auto_notify === true,
  }));
}

/** MAJ courriel d'alerte + opt-in de notification auto d'un client (module Maintenance). */
export async function updateClientNotify(tenant: string, clientId: string, alertEmail: string | null, autoNotify: boolean): Promise<{ error?: string }> {
  const row: Record<string, any> = { maintenance_alert_email: alertEmail || null, maintenance_auto_notify: autoNotify };
  let { error } = await supabase.from('clients').update(row).eq('tenant_id', tenant).eq('id', clientId);
  if (error && /column .* does not exist|schema cache/i.test(error.message || '')) {
    // Repli si maintenance_auto_notify (266) pas encore appliqué.
    ({ error } = await supabase.from('clients').update({ maintenance_alert_email: alertEmail || null }).eq('tenant_id', tenant).eq('id', clientId));
  }
  return { error: error?.message };
}

export async function createServiceClient(tenant: string, name: string): Promise<{ id?: string; error?: string }> {
  const n = (name || '').trim();
  if (!n) return { error: 'Nom requis' };
  const { data, error } = await supabase.from('clients').insert({ tenant_id: tenant, name: n }).select('id').single();
  return { id: (data as any)?.id, error: error?.message };
}

export async function getServiceEquipment(tenant: string): Promise<SEquip[]> {
  // IMPORTANT : la Maintenance ne montre QUE les équipements qu'elle POSSÈDE (source non nulle :
  // 'maintenance' = créé ici, ou 'dga'/'vehicle'/'planner'/'rapport' = importé). On n'aspire PLUS
  // toute la table `equipment` partagée (sinon les équipements d'autres modules apparaissent seuls).
  // select('*') = résilient si les colonnes récentes (mig 234) ne sont pas encore appliquées.
  let { data, error } = await supabase.from('equipment').select('*').eq('tenant_id', tenant).not('source', 'is', null).order('equipment_name');
  if (error && /column .* does not exist|schema cache/i.test(error.message || '')) {
    // Repli si la colonne `source` (264) n'est pas encore appliquée — on ne casse pas l'écran.
    ({ data, error } = await supabase.from('equipment').select('*').eq('tenant_id', tenant).order('equipment_name'));
  }
  if (error) return [];
  return (data as any[]).map(e => ({
    id: e.id, name: e.equipment_name || e.equipment_serial || e.equipment_type || 'Équipement',
    type: e.equipment_type, serial: e.equipment_serial, location: e.equipment_location, client_id: e.client_id,
    site_id: e.site_id ?? null,
    brand: e.equipment_brand ?? null, model: e.equipment_model ?? null, frequency: e.inspection_frequency ?? null,
    public_alerts: e.public_alerts_enabled === true, default_gabarit_id: e.default_gabarit_id ?? null,
    source: e.source ?? null, source_id: e.source_id ?? null,
  }));
}

/** Table id→nom des sites ET départements (planner_succursales), pour l'arborescence Client→Site. */
export async function getSiteNames(tenant: string): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  try {
    const tree = await getSitesTree(tenant);
    for (const s of tree) {
      map[s.id] = s.name;
      for (const d of s.departments) map[d.id] = `${s.name} · ${d.name}`;
    }
  } catch { /* table absente */ }
  return map;
}

export async function setEquipmentClient(tenant: string, equipmentId: string, clientId: string | null): Promise<{ error?: string }> {
  const { error } = await supabase.from('equipment').update({ client_id: clientId }).eq('tenant_id', tenant).eq('id', equipmentId);
  return { error: error?.message };
}

// Lignes de la fiche équipement à écrire, avec repli résilient si une colonne récente manque.
function equipRow(input: EquipInput): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.type !== undefined) row.equipment_type = (input.type || '').trim() || 'Équipement';
  if (input.name !== undefined) row.equipment_name = input.name?.trim() || null;
  if (input.serial !== undefined) row.equipment_serial = input.serial?.trim() || null;
  if (input.location !== undefined) row.equipment_location = input.location?.trim() || null;
  if (input.brand !== undefined) row.equipment_brand = input.brand?.trim() || null;
  if (input.model !== undefined) row.equipment_model = input.model?.trim() || null;
  if (input.frequency !== undefined) row.inspection_frequency = input.frequency || null;
  if (input.public_alerts !== undefined) row.public_alerts_enabled = !!input.public_alerts;
  if (input.client_id !== undefined) row.client_id = input.client_id || null;
  if (input.site_id !== undefined) row.site_id = input.site_id || null;
  if (input.default_gabarit_id !== undefined) row.default_gabarit_id = input.default_gabarit_id || null;
  if (input.source !== undefined) row.source = input.source || null;
  if (input.source_id !== undefined) row.source_id = input.source_id || null;
  return row;
}
// Colonnes potentiellement absentes (selon migrations appliquées) — retirées au repli.
const OPTIONAL_EQUIP_COLS = ['equipment_brand', 'equipment_model', 'public_alerts_enabled', 'default_gabarit_id', 'client_id', 'source', 'source_id'];
function stripOptional(row: Record<string, any>): Record<string, any> {
  const r = { ...row }; for (const c of OPTIONAL_EQUIP_COLS) delete r[c]; return r;
}

export async function createServiceEquipment(tenant: string, input: EquipInput): Promise<{ id?: string; error?: string }> {
  // Marque la PROPRIÉTÉ maintenance : import → source fourni ; création manuelle → 'maintenance'.
  const owned: EquipInput = { type: input.type || 'Équipement', ...input, source: input.source ?? 'maintenance' };
  const row = { tenant_id: tenant, ...equipRow(owned) };
  let { data, error } = await supabase.from('equipment').insert(row).select('id').single();
  if (error && /column .* does not exist|schema cache/i.test(error.message || '')) {
    ({ data, error } = await supabase.from('equipment').insert(stripOptional(row)).select('id').single());
  }
  return { id: (data as any)?.id, error: error?.message };
}

export async function updateServiceEquipment(tenant: string, id: string, input: EquipInput): Promise<{ error?: string }> {
  const row = equipRow(input);
  let { error } = await supabase.from('equipment').update(row).eq('tenant_id', tenant).eq('id', id);
  if (error && /column .* does not exist|schema cache/i.test(error.message || '')) {
    ({ error } = await supabase.from('equipment').update(stripOptional(row)).eq('tenant_id', tenant).eq('id', id));
  }
  return { error: error?.message };
}

export async function deleteServiceEquipment(tenant: string, id: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('equipment').delete().eq('tenant_id', tenant).eq('id', id);
  return { error: error?.message };
}

// Récurrence → nombre de jours (échéances de maintenance).
export const FREQ_DAYS: Record<string, number> = {
  quotidien: 1, hebdomadaire: 7, mensuel: 30, trimestriel: 91, semestriel: 182, annuel: 365,
};
const addDays = (iso: string, n: number) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

/** Crée/MAJ l'ÉCHÉANCE de maintenance d'un équipement à partir de sa récurrence (maintenance_sheets) :
 *  next_due_at = (last_done ou aujourd'hui) + intervalle. Sans récurrence → désactive l'échéance.
 *  Une seule feuille d'« échéance auto » par équipement (réutilisée). Best-effort. */
export async function upsertEquipmentSchedule(tenant: string, equipmentId: string, frequency?: string | null, lastDoneISO?: string | null): Promise<void> {
  if (!equipmentId) return;
  try {
    const { data: rows } = await supabase.from('maintenance_sheets').select('id').eq('tenant_id', tenant).eq('equipment_id', equipmentId).order('created_at').limit(1);
    const existingId = (rows as any[])?.[0]?.id || null;
    const days = frequency ? FREQ_DAYS[frequency] : 0;
    if (!days) { // plus de récurrence → on désactive l'échéance existante
      if (existingId) await supabase.from('maintenance_sheets').update({ active: false, next_due_at: null, updated_at: new Date().toISOString() }).eq('tenant_id', tenant).eq('id', existingId);
      return;
    }
    const base = (lastDoneISO || new Date().toISOString()).slice(0, 10);
    const next = addDays(base, days);
    const eqName = (await supabase.from('equipment').select('equipment_name').eq('tenant_id', tenant).eq('id', equipmentId).maybeSingle()).data as any;
    const row: Record<string, any> = {
      tenant_id: tenant, equipment_id: equipmentId, frequency, next_due_at: next, active: true,
      name: eqName?.equipment_name ? `Échéance — ${eqName.equipment_name}` : 'Échéance de maintenance', updated_at: new Date().toISOString(),
    };
    if (lastDoneISO) row.last_done_at = base;
    if (existingId) await supabase.from('maintenance_sheets').update(row).eq('tenant_id', tenant).eq('id', existingId);
    else await supabase.from('maintenance_sheets').insert(row);
  } catch { /* best-effort */ }
}

// Une entrée d'historique unifié d'un équipement (inspection maintenance, legacy ou rapport DGA).
export type HistItem = {
  kind: 'maintenance' | 'inspection' | 'dga';
  date: string;            // AAAA-MM-JJ
  result?: string | null;  // clé RESULT_META (badge couleur)
  title?: string | null;
  detail?: string | null;
  dossierId?: string | null; // DGA : pour ouvrir le dossier
};

/** Historique UNIFIÉ d'un équipement : inspections (rapports maintenance + legacy) + mesures DGA
 *  (si l'équipement est relié à un dossier). Trié du plus récent au plus ancien. */
export async function getEquipmentHistory(tenant: string, equipmentId: string): Promise<HistItem[]> {
  const out: HistItem[] = [];
  // 1. Legacy inspection_submissions.
  try {
    const { data } = await supabase.from('inspection_submissions')
      .select('overall_result, anomalies_count, created_at, template_name')
      .eq('tenant_id', tenant).eq('equipment_id', equipmentId).order('created_at', { ascending: false }).limit(200);
    for (const r of ((data as any[]) || [])) out.push({
      kind: 'inspection', date: (r.created_at || '').slice(0, 10), result: r.overall_result,
      title: r.template_name || 'Inspection', detail: r.anomalies_count ? `${r.anomalies_count} anomalie(s)` : null,
    });
  } catch { /* table absente */ }
  // 2. Rapports maintenance (moteur unique) — filtrés par equipment_id côté client.
  try {
    const resp = await fetch(`/api/rapports/data?kind=reports&docType=maintenance&tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' });
    const j = await resp.json().catch(() => ({}));
    for (const row of (Array.isArray(j.items) ? j.items : [])) {
      const d = row.data || {};
      if (d.equipment_id !== equipmentId) continue;
      out.push({
        kind: 'maintenance', date: (d.performed_at || row.updated_at || '').slice(0, 10), result: d.overall_result,
        title: row.title || row.num || 'Maintenance', detail: d.anomalies_count ? `${d.anomalies_count} anomalie(s)` : null,
      });
    }
  } catch { /* hors ligne */ }
  // 3. DGA : dossiers reliés → mesures (condition IEEE → résultat).
  try {
    const { data: dos } = await supabase.from('dga_dossiers').select('id, ident').eq('tenant_id', tenant).eq('equipment_id', equipmentId);
    const dosIds = ((dos as any[]) || []).map(d => d.id);
    if (dosIds.length) {
      const { data: ms } = await supabase.from('dga_measures')
        .select('dossier_id, sample_date, condition, fault, duval').eq('tenant_id', tenant).in('dossier_id', dosIds)
        .order('sample_date', { ascending: false }).limit(200);
      for (const m of ((ms as any[]) || [])) out.push({
        kind: 'dga', date: (m.sample_date || '').slice(0, 10), result: dgaConditionResult(m.condition),
        title: 'Analyse DGA', detail: [m.fault, m.duval ? `Duval ${m.duval}` : null].filter(Boolean).join(' · ') || null,
        dossierId: m.dossier_id,
      });
    }
  } catch { /* DGA absent */ }
  return out.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

/** Marque une échéance (maintenance_sheet) comme EFFECTUÉE aujourd'hui et recalcule la prochaine
 *  selon sa récurrence. Utilisé par le bouton « Fait » de la planification. */
export async function markSheetDone(tenant: string, sheetId: string): Promise<{ error?: string }> {
  const { data: row } = await supabase.from('maintenance_sheets').select('frequency').eq('tenant_id', tenant).eq('id', sheetId).maybeSingle();
  const freq = (row as any)?.frequency || null;
  const today = new Date().toISOString().slice(0, 10);
  const days = freq ? FREQ_DAYS[freq] : 0;
  const patch: Record<string, any> = { last_done_at: today, next_due_at: days ? addDays(today, days) : null, updated_at: new Date().toISOString() };
  const { error } = await supabase.from('maintenance_sheets').update(patch).eq('tenant_id', tenant).eq('id', sheetId);
  return { error: error?.message };
}

/** Nombre de PROJETS par client (lien maintenance ↔ projets via projects.end_client_id). */
export async function getClientProjectCounts(tenant: string): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('projects').select('end_client_id').eq('tenant_id', tenant);
  const m: Record<string, number> = {};
  if (error) return m;
  for (const p of (data as any[])) { const c = p.end_client_id; if (c) m[c] = (m[c] || 0) + 1; }
  return m;
}

// Condition DGA (IEEE, 1=bon → 4=critique) → clé de résultat RESULT_META (badge couleur).
function dgaConditionResult(condition?: number | null): string {
  if (condition === 4) return 'retrait';
  if (condition === 3) return 'non_conforme';
  if (condition === 2) return 'conditionnel';
  return 'conforme';
}

/** Dernière inspection par équipement (résultat + date). Fusionne le moteur UNIQUE (rapports
 *  docType='maintenance', via la route serveur car la table est fermée à l'anon), l'historique
 *  legacy (inspection_submissions) ET les rapports DGA (équipements reliés à un dossier DGA :
 *  dernière mesure → condition IEEE). La plus récente l'emporte. */
export async function getLastInspections(tenant: string): Promise<Record<string, LastInsp>> {
  const map: Record<string, LastInsp> = {};
  const consider = (eid: string | undefined, li: LastInsp) => {
    if (!eid) return; const ex = map[eid];
    if (!ex || (ex.date || '') < (li.date || '')) map[eid] = li;
  };
  // 1. Legacy inspection_submissions (accessible côté client).
  try {
    const { data } = await supabase.from('inspection_submissions')
      .select('equipment_id, overall_result, anomalies_count, created_at')
      .eq('tenant_id', tenant).order('created_at', { ascending: false }).limit(2000);
    for (const r of ((data as any[]) || [])) consider(r.equipment_id, { result: r.overall_result, date: (r.created_at || '').slice(0, 10), anomalies: r.anomalies_count });
  } catch { /* table absente */ }
  // 2. Moteur unique : rapports maintenance (via API serveur).
  try {
    const resp = await fetch(`/api/rapports/data?kind=reports&docType=maintenance&tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' });
    const j = await resp.json().catch(() => ({}));
    for (const row of (Array.isArray(j.items) ? j.items : [])) {
      const d = row.data || {};
      consider(d.equipment_id, { result: d.overall_result, date: (d.performed_at || row.updated_at || '').slice(0, 10), anomalies: d.anomalies_count });
    }
  } catch { /* hors ligne / non authentifié */ }
  // 3. DGA : équipements reliés à un dossier DGA → dernière mesure (condition IEEE → résultat).
  try {
    const { data: dos } = await supabase.from('dga_dossiers').select('id, equipment_id').eq('tenant_id', tenant).not('equipment_id', 'is', null);
    const link: Record<string, string> = {}; // dossier_id → equipment_id
    for (const d of ((dos as any[]) || [])) if (d.equipment_id) link[d.id] = d.equipment_id;
    if (Object.keys(link).length) {
      const { data: ms } = await supabase.from('dga_measures').select('dossier_id, sample_date, condition').eq('tenant_id', tenant).order('sample_date', { ascending: false });
      const best: Record<string, any> = {}; // dossier_id → mesure la plus récente
      for (const m of ((ms as any[]) || [])) { if (link[m.dossier_id] && !best[m.dossier_id]) best[m.dossier_id] = m; }
      for (const [did, m] of Object.entries(best)) {
        consider(link[did], { result: dgaConditionResult((m as any).condition), date: ((m as any).sample_date || '').slice(0, 10) });
      }
    }
  } catch { /* DGA absent */ }
  return map;
}
