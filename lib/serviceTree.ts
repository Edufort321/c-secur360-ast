// Arborescence CLIENT → ÉQUIPEMENTS (module Maintenance/Inspection, phase 2).
// Une compagnie de service regroupe ses équipements à vérifier par client. Clients = table `clients`
// (admin) ou créés custom ici. Rattachement via equipment.client_id (migration 228).
import { supabase } from '@/lib/supabase';

export type SClient = { id: string; name: string; active?: boolean };
export type SEquip = { id: string; name: string; type?: string | null; serial?: string | null; location?: string | null; client_id?: string | null };
export type LastInsp = { result?: string; date?: string; anomalies?: number };

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
  const { data, error } = await supabase.from('equipment')
    .select('id, equipment_type, equipment_name, equipment_serial, equipment_location, client_id')
    .eq('tenant_id', tenant).order('equipment_name');
  if (error) return [];
  return (data as any[]).map(e => ({
    id: e.id, name: e.equipment_name || e.equipment_serial || e.equipment_type || 'Équipement',
    type: e.equipment_type, serial: e.equipment_serial, location: e.equipment_location, client_id: e.client_id,
  }));
}

export async function setEquipmentClient(tenant: string, equipmentId: string, clientId: string | null): Promise<{ error?: string }> {
  const { error } = await supabase.from('equipment').update({ client_id: clientId }).eq('tenant_id', tenant).eq('id', equipmentId);
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

/** Dernière inspection par équipement (résultat + date) pour l'état de l'arborescence. */
export async function getLastInspections(tenant: string): Promise<Record<string, LastInsp>> {
  const { data, error } = await supabase.from('inspection_submissions')
    .select('equipment_id, overall_result, anomalies_count, created_at')
    .eq('tenant_id', tenant).order('created_at', { ascending: false }).limit(2000);
  const map: Record<string, LastInsp> = {};
  if (error) return map;
  for (const r of (data as any[])) {
    const eid = r.equipment_id; if (!eid || map[eid]) continue;
    map[eid] = { result: r.overall_result, date: (r.created_at || '').slice(0, 10), anomalies: r.anomalies_count };
  }
  return map;
}
