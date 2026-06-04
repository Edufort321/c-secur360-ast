// Couche de données DGA (Supabase). Dossiers (transformateurs) + mesures + rapports.
import { supabase } from '@/lib/supabase';

export interface Dossier {
  id?: string; tenant_id?: string;
  company?: string; contact?: string; email?: string; sample_id?: string; report_id?: string; po_no?: string;
  client?: string; ident: string; serie?: string; equip_no?: string; apparatus?: string; description?: string;
  alarm?: string; kv?: number | null; mva?: number | null; oil_vol?: number | null; oil_type?: string;
  manufacturer?: string; year?: string; phone?: string;
  preservation?: string; paper_at?: string; category?: string; cooling?: string;
  sample_point?: string; reason?: string; authorized_by?: string; analyzed_by?: string;
  // extra (jsonb) — suivi par transformateur, repris du prototype : analyses (string[]),
  // interval_id, next_date_manual, targeted_analyses (string[]), targeted_months, full_next_date,
  // project_no, manual_reco, global_note.
  extra?: any; flag?: string; notes?: string;
  photos?: { id: string; data: string; name?: string }[]; // base64 compressé (colonne séparée)
  created_at?: string; updated_at?: string;
}
export interface Measure {
  id?: string; tenant_id?: string; dossier_id?: string; sample_date?: string | null;
  h2?: number; ch4?: number; c2h6?: number; c2h4?: number; c2h2?: number; co?: number; co2?: number; o2?: number | null; n2?: number | null;
  oil_quality?: any; tdcg?: number; condition?: number; duval?: string; fault?: string; methods?: any;
  ai_summary?: string; flag?: string; source?: string; attachment_url?: string; notes?: string; created_at?: string;
}

// Champs équipement (ordre + libellés) — repris fidèlement de l'app d'origine.
// Ordre et groupes IDENTIQUES au prototype dga-oil-app (EQUIP_FIELDS / EQUIP_GROUPS).
// contact/courriel/téléphone restent EXCLUS du rapport PDF (filtrés à l'export).
export const EQUIP_GROUPS: { id: 'order' | 'equip' | 'sampling'; fr: string; en: string }[] = [
  { id: 'order', fr: 'Information de la commande', en: 'Order information' },
  { id: 'equip', fr: "Information de l'équipement", en: 'Equipment information' },
  { id: 'sampling', fr: 'Échantillonnage', en: 'Sampling' },
];
export const EQUIP_FIELDS: { key: keyof Dossier; group: 'order' | 'equip' | 'sampling'; fr: string; en: string; ph?: string; num?: boolean }[] = [
  // — Information de la commande —
  { key: 'company', group: 'order', fr: 'Compagnie', en: 'Company', ph: 'ex. CDU06' },
  { key: 'contact', group: 'order', fr: 'Contact', en: 'Contact', ph: 'ex. Emmanuelle Schott' },
  { key: 'email', group: 'order', fr: 'Courriel', en: 'Email' },
  { key: 'phone', group: 'order', fr: 'Téléphone', en: 'Phone' },
  { key: 'sample_id', group: 'order', fr: 'ID échantillon', en: 'Sample ID' },
  { key: 'report_id', group: 'order', fr: 'ID rapport', en: 'Report ID' },
  { key: 'po_no', group: 'order', fr: 'N° de BC', en: 'PO No.' },
  // — Information de l'équipement —
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
  { key: 'preservation', group: 'equip', fr: 'Préservation', en: 'Preservation' },
  { key: 'paper_at', group: 'equip', fr: 'Papier A.T.', en: 'A.T. paper' },
  { key: 'category', group: 'equip', fr: 'Catégorie', en: 'Category' },
  { key: 'cooling', group: 'equip', fr: 'Refroidissement', en: 'Cooling' },
  // — Échantillonnage —
  { key: 'sample_point', group: 'sampling', fr: "Point d'échantillonnage", en: 'Sampling point' },
  { key: 'reason', group: 'sampling', fr: 'Raison', en: 'Reason' },
  { key: 'authorized_by', group: 'sampling', fr: 'Autorisé par', en: 'Authorized by' },
  { key: 'analyzed_by', group: 'sampling', fr: 'Analysé par', en: 'Analyzed by' },
];

// Colonnes de la liste — on EXCLUT `photos` (base64 volumineux) pour garder la liste légère.
// Repli sur '*' si une colonne récente (migrations 119/120) n'est pas encore appliquée.
const LIST_COLS = 'id,tenant_id,company,contact,email,sample_id,report_id,po_no,client,ident,serie,equip_no,apparatus,description,alarm,kv,mva,oil_vol,oil_type,manufacturer,year,phone,preservation,paper_at,category,cooling,sample_point,reason,authorized_by,analyzed_by,extra,flag,notes,created_at,updated_at';
export async function listDossiers(tenant: string): Promise<Dossier[]> {
  let res = await supabase.from('dga_dossiers').select(LIST_COLS).eq('tenant_id', tenant).order('ident');
  if (res.error) res = await supabase.from('dga_dossiers').select('*').eq('tenant_id', tenant).order('ident');
  return (res.data || []) as Dossier[];
}
// Photos chargées à la demande (à l'ouverture de la fiche), jamais dans la liste.
export async function getPhotos(id: string): Promise<{ id: string; data: string; name?: string }[]> {
  const { data, error } = await supabase.from('dga_dossiers').select('photos').eq('id', id).maybeSingle();
  if (error || !data) return [];
  return ((data as any).photos as any[]) || [];
}
export async function savePhotos(id: string, photos: { id: string; data: string; name?: string }[]): Promise<{ error?: string }> {
  const { error } = await supabase.from('dga_dossiers').update({ photos }).eq('id', id);
  return error ? { error: error.message } : {};
}

// ── Rapport d'anomalie : anomalies / recommandations par transformateur (colonne séparée, lazy) ──
export interface AnomalyPhoto { id: string; data: string; name?: string }
export interface Anomaly {
  id: string;
  kind: 'anomalie' | 'reco';            // anomalie ou recommandation
  status: 'a_corriger' | 'corrige';      // à corriger -> corrigé
  archived?: boolean;                    // archivé (sorti de la liste active)
  title?: string;
  desc?: string;
  photos?: AnomalyPhoto[];               // photos custom (base64 compressé)
  created_at?: string;
}
export async function getAnomalies(id: string): Promise<Anomaly[]> {
  const { data, error } = await supabase.from('dga_dossiers').select('anomalies').eq('id', id).maybeSingle();
  if (error || !data) return [];
  return ((data as any).anomalies as Anomaly[]) || [];
}
export async function saveAnomalies(id: string, anomalies: Anomaly[]): Promise<{ error?: string }> {
  const { error } = await supabase.from('dga_dossiers').update({ anomalies }).eq('id', id);
  return error ? { error: error.message } : {};
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
  // Strip-retry : retire toute colonne absente du schéma (ex. phone avant migration 118) pour ne jamais bloquer l'enregistrement.
  const attempt = (p: any) => d.id
    ? supabase.from('dga_dossiers').update(p).eq('id', d.id).select().single()
    : supabase.from('dga_dossiers').insert(p).select().single();
  let res: any = await attempt(payload);
  let guard = 0;
  while (res.error && guard < 12) {
    const msg = res.error.message || '';
    const m = msg.match(/'([a-z_]+)' column|column "?([a-z_]+)"? .*does not exist|could not find the '([a-z_]+)'/i);
    const col = m ? (m[1] || m[2] || m[3]) : null;
    if (col && col in payload && col !== 'ident' && col !== 'tenant_id') { delete payload[col]; res = await attempt(payload); guard++; }
    else break;
  }
  return res.error ? { error: res.error.message } : { data: res.data as Dossier };
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

// Assemblage intelligent : retrouve un dossier existant correspondant (par n° série, sinon par nom).
export function matchDossier(dossiers: Dossier[], eq: { serialNo?: string; identification?: string; equipment?: string }): Dossier | null {
  const norm = (s?: string) => (s || '').trim().toLowerCase();
  const serie = norm(eq.serialNo);
  if (serie) { const bySerie = dossiers.find(d => norm(d.serie) === serie); if (bySerie) return bySerie; }
  const name = norm(eq.identification || eq.equipment);
  if (name) { const byName = dossiers.find(d => norm(d.ident) === name); if (byName) return byName; }
  return null;
}

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
