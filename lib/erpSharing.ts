// #74 — Partage API selectif par module (ERP). Le client pompe SES donnees (read-only).
// Couche client : lecture/ecriture de la config (cle + modules) ; le service des donnees est dans /api/erp/[module].
import { supabase } from '@/lib/supabase';

export type ErpModuleKey = 'financial' | 'timesheets' | 'personnel' | 'projects' | 'inventory' | 'incidents';

export type ErpModuleDef = {
  key: ErpModuleKey;
  fr: string; en: string;
  descFr: string; descEn: string;
  // Ressources exposees (table reelle) ; cle = nom logique dans la reponse JSON.
  resources: { name: string; table: string }[];
};

// Catalogue des modules exposables. « financial » couvre transactions + factures + grand livre.
export const ERP_MODULES: ErpModuleDef[] = [
  { key: 'financial', fr: 'Financier', en: 'Financial', descFr: 'Transactions, factures et grand livre (GL).', descEn: 'Transactions, invoices and general ledger.',
    resources: [{ name: 'transactions', table: 'commerce_transactions' }, { name: 'invoices', table: 'commerce_invoices' }, { name: 'ledger', table: 'gl_entries' }] },
  { key: 'timesheets', fr: 'Feuilles de temps', en: 'Timesheets', descFr: 'Heures saisies et depenses.', descEn: 'Recorded hours and expenses.',
    resources: [{ name: 'timesheets', table: 'timesheets' }, { name: 'expenses', table: 'timesheet_expenses' }] },
  { key: 'personnel', fr: 'Personnel', en: 'Personnel', descFr: 'Fiches du personnel (planificateur).', descEn: 'Personnel records (planner).',
    resources: [{ name: 'personnel', table: 'planner_personnel' }] },
  { key: 'projects', fr: 'Projets', en: 'Projects', descFr: 'Projets et mandats.', descEn: 'Projects and mandates.',
    resources: [{ name: 'projects', table: 'projects' }] },
  { key: 'inventory', fr: 'Inventaire', en: 'Inventory', descFr: 'Articles et emplacements.', descEn: 'Items and locations.',
    resources: [{ name: 'items', table: 'items' }, { name: 'locations', table: 'item_locations' }] },
  { key: 'incidents', fr: 'Incidents', en: 'Incidents', descFr: 'Rapports d incidents/accidents.', descEn: 'Incident/accident reports.',
    resources: [{ name: 'incidents', table: 'incident_reports' }] },
];

export type ErpConfig = { api_key: string; enabled: boolean; modules: Record<string, boolean>; last_used_at?: string | null };

// Genere un jeton porteur lisible (prefixe csk_ = c-secur360 key). 32 octets hex.
export function generateApiKey(): string {
  const bytes = new Uint8Array(24);
  (globalThis.crypto || (window as any).crypto).getRandomValues(bytes);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return 'csk_' + hex;
}

export async function getErpConfig(tenant: string): Promise<ErpConfig> {
  const { data } = await supabase.from('tenant_api_keys').select('api_key, enabled, modules, last_used_at').eq('tenant_id', tenant).maybeSingle();
  if (data) return { api_key: data.api_key, enabled: !!data.enabled, modules: (data.modules || {}) as Record<string, boolean>, last_used_at: data.last_used_at };
  return { api_key: '', enabled: false, modules: {} };
}

// Cree la cle si absente (premiere activation) ; retourne la config a jour.
export async function ensureErpKey(tenant: string): Promise<ErpConfig> {
  const cur = await getErpConfig(tenant);
  if (cur.api_key) return cur;
  const api_key = generateApiKey();
  await supabase.from('tenant_api_keys').upsert({ tenant_id: tenant, api_key, enabled: true, modules: {} }, { onConflict: 'tenant_id' });
  return { api_key, enabled: true, modules: {} };
}

export async function rotateErpKey(tenant: string): Promise<string> {
  const api_key = generateApiKey();
  await supabase.from('tenant_api_keys').upsert({ tenant_id: tenant, api_key, enabled: true, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
  return api_key;
}

export async function setErpEnabled(tenant: string, enabled: boolean): Promise<void> {
  await supabase.from('tenant_api_keys').upsert({ tenant_id: tenant, enabled, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
}

export async function setErpModule(tenant: string, mod: ErpModuleKey, on: boolean): Promise<Record<string, boolean>> {
  const cur = await getErpConfig(tenant);
  const modules = { ...cur.modules, [mod]: on };
  await supabase.from('tenant_api_keys').upsert({ tenant_id: tenant, modules, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
  return modules;
}
