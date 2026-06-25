// Import SÉLECTIF d'équipements dans le module Maintenance depuis d'AUTRES modules.
// Une compagnie de service bâtit son arborescence (client → site → emplacement → type) en récupérant
// des équipements déjà saisis ailleurs (ex. transformateurs du module DGA) au lieu de tout ressaisir.
// On CRÉE des fiches `equipment` (avec provenance source/source_id, migration 264) et, quand le module
// d'origine porte un lien (ex. dga_dossiers.equipment_id), on le RELIE pour faire remonter ses rapports.
import { supabase } from '@/lib/supabase';
import { createServiceEquipment, type SEquip } from '@/lib/serviceTree';

export type ImportSource = 'dga' | 'vehicle' | 'rapport';

export type SourceMeta = { id: ImportSource; fr: string; en: string; descFr: string; descEn: string };
export const IMPORT_SOURCES: SourceMeta[] = [
  { id: 'dga', fr: 'DGA (transformateurs)', en: 'DGA (transformers)', descFr: 'Dossiers d’analyse d’huile — relie aussi les rapports DGA à l’équipement.', descEn: 'Oil analysis dossiers — also links DGA reports to the equipment.' },
  { id: 'vehicle', fr: 'Véhicules / Flotte', en: 'Vehicles / Fleet', descFr: 'Véhicules du tenant (marque, modèle, plaque) comme équipements à entretenir.', descEn: 'Tenant vehicles (make, model, plate) as maintainable equipment.' },
  { id: 'rapport', fr: 'Rapport terrain', en: 'Field reports', descFr: 'Équipements nommés dans les rapports terrain (listes d’inspection).', descEn: 'Equipment named in field reports (inspection lists).' },
];

export type Candidate = {
  source: ImportSource;
  sourceId: string;        // identifiant stable dans le module d'origine (dédoublonnage)
  name: string;
  serial?: string | null;
  type?: string | null;
  brand?: string | null;
  model?: string | null;
  location?: string | null;
  clientHint?: string | null;   // nom de client/localisation deviné (affichage)
  alreadyImported: boolean;
};

const norm = (s?: string | null) => (s || '').trim().toLowerCase();

// Clé d'unicité d'un équipement déjà présent (par provenance OU par nom+série).
function existingKeys(existing: SEquip[]): { bySource: Set<string>; byName: Set<string> } {
  const bySource = new Set<string>();
  const byName = new Set<string>();
  for (const e of existing) {
    if (e.source && e.source_id) bySource.add(`${e.source}:${e.source_id}`);
    byName.add(`${norm(e.name)}|${norm(e.serial)}`);
  }
  return { bySource, byName };
}

export async function getCandidates(tenant: string, source: ImportSource, existing: SEquip[]): Promise<Candidate[]> {
  const keys = existingKeys(existing);
  const isImported = (src: ImportSource, id: string, name: string, serial?: string | null) =>
    keys.bySource.has(`${src}:${id}`) || keys.byName.has(`${norm(name)}|${norm(serial)}`);

  if (source === 'dga') {
    const { data, error } = await supabase
      .from('dga_dossiers')
      .select('id, ident, serie, apparatus, description, client, equipment_id')
      .eq('tenant_id', tenant)
      .order('ident');
    if (error || !data) return [];
    return (data as any[]).map(d => {
      const name = (d.ident || d.serie || 'Transformateur').trim();
      return {
        source: 'dga' as const, sourceId: d.id, name,
        serial: d.serie || null, type: (d.apparatus || d.description || 'Transformateur') || null,
        location: d.client || null, clientHint: d.client || null,
        alreadyImported: !!d.equipment_id || isImported('dga', d.id, name, d.serie),
      };
    });
  }

  if (source === 'vehicle') {
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, name, make, model, year, plate, type')
      .eq('tenant_id', tenant)
      .order('name');
    if (error || !data) return [];
    return (data as any[]).map(v => {
      const name = (v.name || [v.make, v.model].filter(Boolean).join(' ') || 'Véhicule').trim();
      return {
        source: 'vehicle' as const, sourceId: v.id, name,
        serial: v.plate || null, type: 'Véhicule', brand: v.make || null, model: v.model || null,
        location: null, clientHint: null,
        alreadyImported: isImported('vehicle', v.id, name, v.plate),
      };
    });
  }

  // Rapport terrain : équipements DISTINCTS nommés dans les rapports (titres de listes d'inspection
  // + champ `equipment` des annotations). Lecture via la route serveur (table fermée à l'anon).
  try {
    const r = await fetch(`/api/rapports/data?kind=reports&docType=rapport&tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' });
    const j = await r.json().catch(() => ({}));
    const items: any[] = Array.isArray(j.items) ? j.items : [];
    const seen = new Map<string, Candidate>();
    for (const it of items) {
      const d = it.data || {};
      const names = new Set<string>();
      for (const b of (d.blocks || [])) if (b?.type === 'inspect' && (b.title || '').trim()) names.add(b.title.trim());
      for (const a of (d.annotations || [])) if ((a?.equipment || '').trim()) names.add(a.equipment.trim());
      for (const nm of names) {
        const k = norm(nm);
        if (!k || seen.has(k)) continue;
        seen.set(k, {
          source: 'rapport', sourceId: k, name: nm, serial: null, type: 'Rapport terrain',
          location: (d.location || '').trim() || null, clientHint: (d.client || '').trim() || null,
          alreadyImported: isImported('rapport', k, nm, null),
        });
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  } catch { return []; }
}

export type ImportTarget = { clientId?: string | null; siteId?: string | null };

/** Crée les fiches `equipment` pour les candidats choisis et relie la source quand c'est possible (DGA). */
export async function importCandidates(tenant: string, cands: Candidate[], target: ImportTarget): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;
  for (const c of cands) {
    const { id, error } = await createServiceEquipment(tenant, {
      name: c.name, serial: c.serial || '', type: c.type || 'Équipement',
      brand: c.brand || '', model: c.model || '', location: c.location || '',
      client_id: target.clientId || null, site_id: target.siteId || null,
      source: c.source, source_id: c.sourceId,
    });
    if (error || !id) { errors.push(`${c.name}: ${error || 'échec'}`); continue; }
    count++;
    if (c.source === 'dga') {
      // Relie le dossier DGA → ses rapports remontent dans l'historique de l'équipement.
      await supabase.from('dga_dossiers').update({ equipment_id: id }).eq('tenant_id', tenant).eq('id', c.sourceId);
    }
  }
  return { count, errors };
}
