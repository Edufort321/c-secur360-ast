// Couche de données DGA (Supabase). Dossiers (transformateurs) + mesures + rapports.
import { supabase } from '@/lib/supabase';

export interface Dossier {
  id?: string; tenant_id?: string;
  company?: string; contact?: string; email?: string; sample_id?: string; report_id?: string; po_no?: string;
  client?: string; ident: string; serie?: string; equip_no?: string; apparatus?: string; description?: string;
  alarm?: string; kv?: number | null; mva?: number | null; oil_vol?: number | null; oil_type?: string;
  manufacturer?: string; year?: string; extra?: any; flag?: string; notes?: string;
  created_at?: string; updated_at?: string;
}
export interface Measure {
  id?: string; tenant_id?: string; dossier_id?: string; sample_date?: string | null;
  h2?: number; ch4?: number; c2h6?: number; c2h4?: number; c2h2?: number; co?: number; co2?: number; o2?: number | null; n2?: number | null;
  oil_quality?: any; tdcg?: number; condition?: number; duval?: string; fault?: string; methods?: any;
  ai_summary?: string; flag?: string; source?: string; attachment_url?: string; notes?: string; created_at?: string;
}

// Champs équipement (ordre + libellés) — repris fidèlement de l'app d'origine.
export const EQUIP_FIELDS: { key: keyof Dossier; group: 'order' | 'equip'; fr: string; en: string; ph?: string; num?: boolean }[] = [
  { key: 'company', group: 'order', fr: 'Compagnie', en: 'Company', ph: 'ex. CDU06' },
  { key: 'contact', group: 'order', fr: 'Contact', en: 'Contact' },
  { key: 'email', group: 'order', fr: 'Courriel', en: 'Email' },
  { key: 'sample_id', group: 'order', fr: 'ID échantillon', en: 'Sample ID' },
  { key: 'report_id', group: 'order', fr: 'ID rapport', en: 'Report ID' },
  { key: 'po_no', group: 'order', fr: 'N° de BC', en: 'PO No.' },
  { key: 'client', group: 'equip', fr: 'Localisation / Sous-station', en: 'Location / Substation', ph: 'ex. NEW RICHMOND' },
  { key: 'ident', group: 'equip', fr: 'Équipement (Nom) *', en: 'Equipment (Name) *', ph: 'ex. NEW RICHMOND TG1' },
  { key: 'serie', group: 'equip', fr: 'N° de série', en: 'Serial No.' },
  { key: 'equip_no', group: 'equip', fr: "N° d'équipement", en: 'Equipment No.' },
  { key: 'apparatus', group: 'equip', fr: "Type d'appareil", en: 'Apparatus type' },
  { key: 'description', group: 'equip', fr: 'Type / Description', en: 'Type / Description' },
  { key: 'alarm', group: 'equip', fr: "Set d'alarme", en: 'Alarm set' },
  { key: 'kv', group: 'equip', fr: 'Classe kV', en: 'kV class', num: true },
  { key: 'mva', group: 'equip', fr: 'Max MVA', en: 'Max MVA', num: true },
  { key: 'oil_vol', group: 'equip', fr: "Volume d'huile (L)", en: 'Oil volume (L)', num: true },
  { key: 'oil_type', group: 'equip', fr: "Type d'huile", en: 'Oil type' },
  { key: 'manufacturer', group: 'equip', fr: 'Fabricant', en: 'Manufacturer' },
  { key: 'year', group: 'equip', fr: 'Année', en: 'Year' },
];

export async function listDossiers(tenant: string): Promise<Dossier[]> {
  const { data } = await supabase.from('dga_dossiers').select('*').eq('tenant_id', tenant).order('ident');
  return (data || []) as Dossier[];
}
export async function listAllMeasures(tenant: string): Promise<Measure[]> {
  const { data } = await supabase.from('dga_measures').select('*').eq('tenant_id', tenant).order('sample_date', { ascending: true });
  return (data || []) as Measure[];
}
export async function listMeasures(tenant: string, dossierId: string): Promise<Measure[]> {
  const { data } = await supabase.from('dga_measures').select('*').eq('tenant_id', tenant).eq('dossier_id', dossierId).order('sample_date', { ascending: true });
  return (data || []) as Measure[];
}
export async function saveDossier(tenant: string, d: Dossier): Promise<{ data?: Dossier; error?: string }> {
  const payload: any = { ...d, tenant_id: tenant, updated_at: new Date().toISOString() };
  delete payload.id;
  if (d.id) {
    const { data, error } = await supabase.from('dga_dossiers').update(payload).eq('id', d.id).select().single();
    return error ? { error: error.message } : { data: data as Dossier };
  }
  const { data, error } = await supabase.from('dga_dossiers').insert(payload).select().single();
  return error ? { error: error.message } : { data: data as Dossier };
}
export async function deleteDossier(id: string) { await supabase.from('dga_dossiers').delete().eq('id', id); }

export async function saveMeasure(tenant: string, dossierId: string, m: Measure): Promise<{ data?: Measure; error?: string }> {
  const payload: any = { ...m, tenant_id: tenant, dossier_id: dossierId };
  delete payload.id;
  if (m.id) {
    const { data, error } = await supabase.from('dga_measures').update(payload).eq('id', m.id).select().single();
    return error ? { error: error.message } : { data: data as Measure };
  }
  const { data, error } = await supabase.from('dga_measures').insert(payload).select().single();
  return error ? { error: error.message } : { data: data as Measure };
}
export async function deleteMeasure(id: string) { await supabase.from('dga_measures').delete().eq('id', id); }

// Statut de suivi : échéance de re-test selon la dernière condition.
export type DueStatus = 'overdue' | 'soon' | 'uptodate' | 'none';
export function retestMonthsFor(condition?: number): number {
  if (condition === 4) return 1; if (condition === 3) return 3; if (condition === 2) return 6; return 12;
}
export function dueStatus(lastDate?: string | null, condition?: number): DueStatus {
  if (!lastDate) return 'none';
  const last = new Date(lastDate).getTime(); if (!isFinite(last)) return 'none';
  const due = last + retestMonthsFor(condition) * 30 * 86400000;
  const now = Date.now();
  if (now > due) return 'overdue';
  if (due - now <= 30 * 86400000) return 'soon';
  return 'uptodate';
}
