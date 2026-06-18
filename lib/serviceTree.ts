// Arborescence CLIENT → ÉQUIPEMENTS (module Maintenance/Inspection, phase 2).
// Une compagnie de service regroupe ses équipements à vérifier par client. Clients = table `clients`
// (admin) ou créés custom ici. Rattachement via equipment.client_id (migration 228).
import { supabase } from '@/lib/supabase';

export type SClient = { id: string; name: string; active?: boolean };
export type SEquip = {
  id: string; name: string; type?: string | null; serial?: string | null; location?: string | null;
  client_id?: string | null; brand?: string | null; model?: string | null; frequency?: string | null;
  public_alerts?: boolean; default_gabarit_id?: string | null;
};
export type LastInsp = { result?: string; date?: string; anomalies?: number };

// Champs d'une fiche équipement (création/édition depuis le module Maintenance).
export type EquipInput = {
  type?: string; name?: string; serial?: string; brand?: string; model?: string;
  location?: string; frequency?: string; public_alerts?: boolean; client_id?: string | null; default_gabarit_id?: string | null;
};

export async function getServiceClients(tenant: string): Promise<SClient[]> {
  const { data, error } = await supabase.from('clients').select('id, name, active').eq('tenant_id', tenant).order('name');
  if (error) return [];
  return (data as any[]).map(c => ({ id: c.id, name: c.name || '(client)', active: c.active !== false }));
}

export async function createServiceClient(tenant: string, name: string): Promise<{ id?: string; error?: string }> {
  const n = (name || '').trim();
  if (!n) return { error: 'Nom requis' };
  const { data, error } = await supabase.from('clients').insert({ tenant_id: tenant, name: n }).select('id').single();
  return { id: (data as any)?.id, error: error?.message };
}

export async function getServiceEquipment(tenant: string): Promise<SEquip[]> {
  // select('*') = résilient si les colonnes marque/modèle/récurrence (mig 234) ne sont pas encore appliquées.
  const { data, error } = await supabase.from('equipment').select('*').eq('tenant_id', tenant).order('equipment_name');
  if (error) return [];
  return (data as any[]).map(e => ({
    id: e.id, name: e.equipment_name || e.equipment_serial || e.equipment_type || 'Équipement',
    type: e.equipment_type, serial: e.equipment_serial, location: e.equipment_location, client_id: e.client_id,
    brand: e.equipment_brand ?? null, model: e.equipment_model ?? null, frequency: e.inspection_frequency ?? null,
    public_alerts: e.public_alerts_enabled === true, default_gabarit_id: e.default_gabarit_id ?? null,
  }));
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
  if (input.default_gabarit_id !== undefined) row.default_gabarit_id = input.default_gabarit_id || null;
  return row;
}
// Colonnes potentiellement absentes (selon migrations appliquées) — retirées au repli.
const OPTIONAL_EQUIP_COLS = ['equipment_brand', 'equipment_model', 'public_alerts_enabled', 'default_gabarit_id', 'client_id'];
function stripOptional(row: Record<string, any>): Record<string, any> {
  const r = { ...row }; for (const c of OPTIONAL_EQUIP_COLS) delete r[c]; return r;
}

export async function createServiceEquipment(tenant: string, input: EquipInput): Promise<{ id?: string; error?: string }> {
  const row = { tenant_id: tenant, ...equipRow({ type: input.type || 'Équipement', ...input }) };
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

/** Nombre de PROJETS par client (lien maintenance ↔ projets via projects.end_client_id). */
export async function getClientProjectCounts(tenant: string): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('projects').select('end_client_id').eq('tenant_id', tenant);
  const m: Record<string, number> = {};
  if (error) return m;
  for (const p of (data as any[])) { const c = p.end_client_id; if (c) m[c] = (m[c] || 0) + 1; }
  return m;
}

/** Dernière inspection par équipement (résultat + date). Fusionne le moteur UNIQUE (rapports
 *  docType='maintenance', via la route serveur car la table est fermée à l'anon) et l'historique
 *  legacy (inspection_submissions). La plus récente l'emporte. */
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
  return map;
}
