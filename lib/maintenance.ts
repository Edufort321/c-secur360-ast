// Service Maintenance d'équipement (GMAO/CMMS). S'appuie sur le registre `equipment` (module Inspections).
// Gabarits dupliquables -> feuilles par machine (QR) -> exécutions (logs, chrono) -> correctifs (actions).
// Tables : maintenance_templates / maintenance_sheets / maintenance_logs / maintenance_actions (migration 191).
import { supabase } from '@/lib/supabase';

export type MaintLine = { id: string; description: string; allow_anomaly?: boolean };
export type MaintResult = { state: 'ok' | 'anomaly'; note?: string; photos?: string[] };

export type MaintTemplate = { id?: string; name: string; description?: string | null; equipment_type?: string | null; frequency?: string | null; lines: MaintLine[]; created_at?: string; updated_at?: string };
export type MaintSheet = { id?: string; equipment_id?: string | null; template_id?: string | null; name?: string | null; frequency?: string | null; lines: MaintLine[]; last_done_at?: string | null; next_due_at?: string | null; active?: boolean; created_at?: string; updated_at?: string };
export type MaintLog = { id?: string; sheet_id?: string | null; equipment_id?: string | null; performed_by?: string | null; performed_at?: string; duration_min?: number; labor_cost?: number; parts_cost?: number; results?: Record<string, MaintResult>; notes?: string | null; created_at?: string };
export type MaintAction = { id?: string; equipment_id?: string | null; sheet_id?: string | null; log_id?: string | null; description: string; priority?: 'low' | 'normal' | 'high' | 'critical'; status?: 'todo' | 'scheduled' | 'done'; photos?: string[]; due_date?: string | null; planner_job_id?: string | null; cost?: number; created_at?: string; updated_at?: string };

export type MaintEquipment = { id: string; equipment_type?: string; equipment_name?: string | null; equipment_serial?: string | null; equipment_location?: string | null; equipment_photos?: string[]; site_id?: string | null };

const newId = () => (globalThis.crypto?.randomUUID?.() || `m${Date.now()}${Math.round(Math.random() * 1e6)}`);
export const FREQ_DAYS: Record<string, number> = { quotidien: 1, hebdomadaire: 7, mensuel: 30, semestriel: 182, annuel: 365, par_quart: 1 };

// ── Registre d'équipement (réutilise la table `equipment` du module Inspections) ──
export async function getEquipmentList(tenant: string): Promise<MaintEquipment[]> {
  const { data, error } = await supabase.from('equipment').select('id, equipment_type, equipment_name, equipment_serial, equipment_location, equipment_photos, site_id').eq('tenant_id', tenant).order('equipment_name');
  if (error) throw error;
  return (data || []) as MaintEquipment[];
}

// ── Gabarits ──
export async function getMaintTemplates(tenant: string): Promise<MaintTemplate[]> {
  const { data, error } = await supabase.from('maintenance_templates').select('*').eq('tenant_id', tenant).order('name');
  if (error) throw error;
  return (data || []).map((t: any) => ({ ...t, lines: Array.isArray(t.lines) ? t.lines : [] }));
}
export async function saveMaintTemplate(tenant: string, t: MaintTemplate): Promise<string> {
  const row: any = { tenant_id: tenant, name: t.name, description: t.description ?? null, equipment_type: t.equipment_type ?? null, frequency: t.frequency ?? null, lines: t.lines || [], updated_at: new Date().toISOString() };
  if (t.id) { const { error } = await supabase.from('maintenance_templates').update(row).eq('id', t.id).eq('tenant_id', tenant); if (error) throw error; return t.id; }
  const { data, error } = await supabase.from('maintenance_templates').insert(row).select('id').single(); if (error) throw error; return data!.id;
}
export async function deleteMaintTemplate(tenant: string, id: string): Promise<void> {
  const { error } = await supabase.from('maintenance_templates').delete().eq('id', id).eq('tenant_id', tenant); if (error) throw error;
}

// ── Feuilles (instances par machine) ──
export async function getMaintSheets(tenant: string, equipmentId?: string): Promise<MaintSheet[]> {
  let q = supabase.from('maintenance_sheets').select('*').eq('tenant_id', tenant);
  if (equipmentId) q = q.eq('equipment_id', equipmentId);
  const { data, error } = await q.order('name'); if (error) throw error;
  return (data || []).map((s: any) => ({ ...s, lines: Array.isArray(s.lines) ? s.lines : [] }));
}
export async function saveMaintSheet(tenant: string, s: MaintSheet): Promise<string> {
  const row: any = { tenant_id: tenant, equipment_id: s.equipment_id ?? null, template_id: s.template_id ?? null, name: s.name ?? null, frequency: s.frequency ?? null, lines: s.lines || [], last_done_at: s.last_done_at ?? null, next_due_at: s.next_due_at ?? null, active: s.active !== false, updated_at: new Date().toISOString() };
  if (s.id) { const { error } = await supabase.from('maintenance_sheets').update(row).eq('id', s.id).eq('tenant_id', tenant); if (error) throw error; return s.id; }
  const { data, error } = await supabase.from('maintenance_sheets').insert(row).select('id').single(); if (error) throw error; return data!.id;
}
export async function deleteMaintSheet(tenant: string, id: string): Promise<void> {
  const { error } = await supabase.from('maintenance_sheets').delete().eq('id', id).eq('tenant_id', tenant); if (error) throw error;
}
/** Duplique un gabarit en une feuille rattachée à une machine (lignes copiées, éditables ensuite). */
export async function instantiateTemplate(tenant: string, tpl: MaintTemplate, equipmentId: string, name?: string): Promise<string> {
  return saveMaintSheet(tenant, {
    equipment_id: equipmentId, template_id: tpl.id || null, name: name || tpl.name,
    frequency: tpl.frequency || null, lines: (tpl.lines || []).map(l => ({ ...l, id: l.id || newId() })), active: true,
  });
}

// ── Exécutions (logs) ──
export async function getMaintLogs(tenant: string, opts?: { equipmentId?: string; sheetId?: string }): Promise<MaintLog[]> {
  let q = supabase.from('maintenance_logs').select('*').eq('tenant_id', tenant);
  if (opts?.equipmentId) q = q.eq('equipment_id', opts.equipmentId);
  if (opts?.sheetId) q = q.eq('sheet_id', opts.sheetId);
  const { data, error } = await q.order('performed_at', { ascending: false }); if (error) throw error;
  return (data || []) as MaintLog[];
}
export async function saveMaintLog(tenant: string, l: MaintLog): Promise<string> {
  const row: any = { tenant_id: tenant, sheet_id: l.sheet_id ?? null, equipment_id: l.equipment_id ?? null, performed_by: l.performed_by ?? null, performed_at: l.performed_at || new Date().toISOString(), duration_min: Number(l.duration_min) || 0, labor_cost: Number(l.labor_cost) || 0, parts_cost: Number(l.parts_cost) || 0, results: l.results || {}, notes: l.notes ?? null };
  const { data, error } = await supabase.from('maintenance_logs').insert(row).select('id').single(); if (error) throw error; return data!.id;
}

// ── Correctifs (actions) ──
export async function getMaintActions(tenant: string, opts?: { equipmentId?: string; status?: string }): Promise<MaintAction[]> {
  let q = supabase.from('maintenance_actions').select('*').eq('tenant_id', tenant);
  if (opts?.equipmentId) q = q.eq('equipment_id', opts.equipmentId);
  if (opts?.status) q = q.eq('status', opts.status);
  const { data, error } = await q.order('created_at', { ascending: false }); if (error) throw error;
  return (data || []) as MaintAction[];
}
export async function saveMaintAction(tenant: string, a: MaintAction): Promise<string> {
  const row: any = { tenant_id: tenant, equipment_id: a.equipment_id ?? null, sheet_id: a.sheet_id ?? null, log_id: a.log_id ?? null, description: a.description, priority: a.priority || 'normal', status: a.status || 'todo', photos: a.photos || [], due_date: a.due_date ?? null, planner_job_id: a.planner_job_id ?? null, cost: Number(a.cost) || 0, updated_at: new Date().toISOString() };
  if (a.id) { const { error } = await supabase.from('maintenance_actions').update(row).eq('id', a.id).eq('tenant_id', tenant); if (error) throw error; return a.id; }
  const { data, error } = await supabase.from('maintenance_actions').insert(row).select('id').single(); if (error) throw error; return data!.id;
}
export async function setMaintActionStatus(tenant: string, id: string, status: MaintAction['status'], plannerJobId?: string): Promise<void> {
  const patch: any = { status, updated_at: new Date().toISOString() };
  if (plannerJobId !== undefined) patch.planner_job_id = plannerJobId;
  const { error } = await supabase.from('maintenance_actions').update(patch).eq('id', id).eq('tenant_id', tenant); if (error) throw error;
}

// ── Rollups dashboard ──
export type EquipRollup = { equipment_id: string; name: string; logs: number; minutes: number; cost: number; openActions: number; lastDone: string | null; nextDue: string | null; overdue: boolean };
export function rollupByEquipment(equipment: MaintEquipment[], sheets: MaintSheet[], logs: MaintLog[], actions: MaintAction[]): EquipRollup[] {
  const today = new Date().toISOString().slice(0, 10);
  return equipment.map(e => {
    const eLogs = logs.filter(l => l.equipment_id === e.id);
    const eSheets = sheets.filter(s => s.equipment_id === e.id);
    const minutes = eLogs.reduce((s, l) => s + (Number(l.duration_min) || 0), 0);
    const cost = eLogs.reduce((s, l) => s + (Number(l.labor_cost) || 0) + (Number(l.parts_cost) || 0), 0);
    const openActions = actions.filter(a => a.equipment_id === e.id && a.status !== 'done').length;
    const lastDone = eLogs.map(l => (l.performed_at || '').slice(0, 10)).sort().pop() || eSheets.map(s => s.last_done_at || '').filter(Boolean).sort().pop() || null;
    const nextDue = eSheets.map(s => s.next_due_at || '').filter(Boolean).sort()[0] || null;
    return { equipment_id: e.id, name: e.equipment_name || e.equipment_serial || e.equipment_type || '—', logs: eLogs.length, minutes, cost, openActions, lastDone, nextDue, overdue: !!(nextDue && nextDue < today) };
  });
}
