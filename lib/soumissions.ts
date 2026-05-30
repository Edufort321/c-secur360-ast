// Service Soumissions + catalogue de taux (migration 090).
// Chaine devis -> planificateur -> facturation. Calcul des montants depuis le catalogue versionne
// (taux MO bureau/chantier + multiplicateurs supp/maj). Revision = clone + re-tarification + archivage.
import { supabase } from '@/lib/supabase';

export type Categorie = 'mo_bureau' | 'mo_chantier' | 'voyagement' | 'subsistance' | 'hebergement' | 'materiaux';
export const CATEGORIES_MO: Categorie[] = ['mo_bureau', 'mo_chantier'];
export const CATEGORIE_LABELS: Record<Categorie, string> = {
  mo_bureau: 'MO Bureau', mo_chantier: 'MO Chantier', voyagement: 'Voyagement',
  subsistance: 'Subsistance', hebergement: 'Hébergement', materiaux: 'Matériaux',
};

export type CatalogueTaux = {
  id?: string; name: string; year: number; revision: number; status: 'active' | 'archived';
  taux_mo_bureau: number; taux_mo_chantier: number; mult_supp: number; mult_maj: number; notes?: string | null;
};
export type SoumissionLigne = {
  id?: string; item_id?: string; categorie: Categorie; description?: string;
  tech: number; reg: number; supp: number; maj: number;
  quantity: number; unit?: string | null; unit_cost: number; montant: number; sort_order?: number;
};
export type SoumissionItem = { id?: string; name: string; year?: number | null; sort_order?: number; total: number; lignes: SoumissionLigne[] };
export type Soumission = {
  id?: string; numero: string; revision: number; parent_soumission_id?: string | null; year?: number | null;
  client_id?: string | null; client_snapshot?: any; project_id?: string | null; catalogue_id?: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'archived'; total: number; notes?: string | null;
};

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/** Montant d'une ligne : MO = tech × (reg·taux + supp·taux·multSupp + maj·taux·multMaj) ; autres = quantité × coût. */
export function computeLigneMontant(ligne: SoumissionLigne, cat?: CatalogueTaux | null): number {
  if (ligne.categorie === 'mo_bureau' || ligne.categorie === 'mo_chantier') {
    const taux = ligne.categorie === 'mo_bureau' ? (cat?.taux_mo_bureau || 0) : (cat?.taux_mo_chantier || 0);
    const multSupp = cat?.mult_supp ?? 1.5;
    const multMaj = cat?.mult_maj ?? 2.0;
    const tech = Number(ligne.tech) || 1;
    const base = (Number(ligne.reg) || 0) * taux
      + (Number(ligne.supp) || 0) * taux * multSupp
      + (Number(ligne.maj) || 0) * taux * multMaj;
    return r2(tech * base);
  }
  return r2((Number(ligne.quantity) || 0) * (Number(ligne.unit_cost) || 0));
}
export const computeItemTotal = (item: SoumissionItem, cat?: CatalogueTaux | null) =>
  r2((item.lignes || []).reduce((s, l) => s + computeLigneMontant(l, cat), 0));
export const computeSoumissionTotal = (items: SoumissionItem[], cat?: CatalogueTaux | null) =>
  r2((items || []).reduce((s, it) => s + computeItemTotal(it, cat), 0));

// ── Catalogue ─────────────────────────────────────────────────────────────────
export async function getCatalogues(tenant: string): Promise<CatalogueTaux[]> {
  const { data, error } = await supabase.from('catalogue_taux').select('*').eq('tenant_id', tenant).order('year', { ascending: false }).order('revision', { ascending: false });
  if (error) throw error;
  return (data || []) as CatalogueTaux[];
}
export async function getActiveCatalogue(tenant: string, year: number): Promise<CatalogueTaux | null> {
  const { data } = await supabase.from('catalogue_taux').select('*').eq('tenant_id', tenant).eq('year', year).eq('status', 'active').order('revision', { ascending: false }).limit(1);
  return (data?.[0] as CatalogueTaux) || null;
}
export async function saveCatalogue(tenant: string, c: CatalogueTaux): Promise<string> {
  const payload: any = { ...c, tenant_id: tenant, updated_at: new Date().toISOString() };
  if (c.id) { const { error } = await supabase.from('catalogue_taux').update(payload).eq('id', c.id); if (error) throw error; return c.id; }
  const { data, error } = await supabase.from('catalogue_taux').insert(payload).select('id').single();
  if (error) throw error; return data.id;
}

// ── Soumissions ─────────────────────────────────────────────────────────────
export async function nextSoumissionNumero(tenant: string, prefix = 'S'): Promise<string> {
  const year = new Date().getFullYear();
  const { data } = await supabase.from('soumissions').select('numero').eq('tenant_id', tenant).like('numero', `${prefix}-${year}-%`).order('numero', { ascending: false }).limit(1);
  let seq = 1; const last = data?.[0]?.numero as string | undefined;
  if (last) { const m = last.match(/(\d+)\s*$/); if (m) seq = parseInt(m[1], 10) + 1; }
  return `${prefix}-${year}-${String(seq).padStart(3, '0')}`;
}

export async function getSoumissions(tenant: string): Promise<Soumission[]> {
  const { data, error } = await supabase.from('soumissions').select('*').eq('tenant_id', tenant).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Soumission[];
}

/** Soumission complète (en-tête + items + lignes triés). */
export async function getSoumissionFull(tenant: string, id: string): Promise<{ soumission: Soumission; items: SoumissionItem[] } | null> {
  const { data: s } = await supabase.from('soumissions').select('*').eq('id', id).eq('tenant_id', tenant).maybeSingle();
  if (!s) return null;
  const { data: items } = await supabase.from('soumission_items').select('*').eq('soumission_id', id).order('sort_order');
  const { data: lignes } = await supabase.from('soumission_lignes').select('*').in('item_id', (items || []).map((i: any) => i.id).length ? (items || []).map((i: any) => i.id) : ['00000000-0000-0000-0000-000000000000']).order('sort_order');
  const byItem: Record<string, SoumissionLigne[]> = {};
  for (const l of (lignes || []) as any[]) { (byItem[l.item_id] ||= []).push(l); }
  const full = (items || []).map((it: any) => ({ ...it, lignes: byItem[it.id] || [] })) as SoumissionItem[];
  return { soumission: s as Soumission, items: full };
}

/** Enregistre une soumission complète : upsert en-tête, puis remplace items + lignes (recalcul des montants). */
export async function saveSoumissionFull(tenant: string, header: Soumission, items: SoumissionItem[], cat?: CatalogueTaux | null): Promise<string> {
  const total = computeSoumissionTotal(items, cat);
  const hPayload: any = {
    tenant_id: tenant, numero: header.numero, revision: header.revision ?? 1, parent_soumission_id: header.parent_soumission_id ?? null,
    year: header.year ?? null, client_id: header.client_id ?? null, client_snapshot: header.client_snapshot ?? null,
    project_id: header.project_id ?? null, catalogue_id: header.catalogue_id ?? null, status: header.status || 'draft',
    total, notes: header.notes ?? null, updated_at: new Date().toISOString(),
  };
  let id = header.id;
  if (id) { const { error } = await supabase.from('soumissions').update(hPayload).eq('id', id); if (error) throw error; }
  else { const { data, error } = await supabase.from('soumissions').insert(hPayload).select('id').single(); if (error) throw error; id = data.id; }

  // Remplacer items + lignes (cascade delete sur items supprime leurs lignes)
  await supabase.from('soumission_items').delete().eq('soumission_id', id);
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const itemTotal = computeItemTotal(it, cat);
    const { data: itemRow, error: e1 } = await supabase.from('soumission_items').insert({
      tenant_id: tenant, soumission_id: id, name: it.name, year: it.year ?? header.year ?? null, sort_order: i, total: itemTotal,
    }).select('id').single();
    if (e1) throw e1;
    const ligneRows = (it.lignes || []).map((l, j) => ({
      tenant_id: tenant, item_id: itemRow.id, categorie: l.categorie, description: l.description ?? null,
      tech: Number(l.tech) || 0, reg: Number(l.reg) || 0, supp: Number(l.supp) || 0, maj: Number(l.maj) || 0,
      quantity: Number(l.quantity) || 0, unit: l.unit ?? null, unit_cost: Number(l.unit_cost) || 0,
      montant: computeLigneMontant(l, cat), sort_order: j,
    }));
    if (ligneRows.length) { const { error: e2 } = await supabase.from('soumission_lignes').insert(ligneRows); if (e2) throw e2; }
  }
  return id as string;
}

/**
 * Révise une soumission « au taux actuel » : archive l'originale, crée une nouvelle révision (revision+1)
 * re-tarifée sur le catalogue fourni (ou actuel), liée à l'originale via parent_soumission_id.
 * Retourne l'id de la nouvelle soumission active.
 */
export async function reviseSoumission(tenant: string, sourceId: string, catalogue?: CatalogueTaux | null): Promise<string> {
  const full = await getSoumissionFull(tenant, sourceId);
  if (!full) throw new Error('Soumission introuvable.');
  const cat = catalogue || (full.soumission.year ? await getActiveCatalogue(tenant, full.soumission.year) : null);
  // Archiver l'originale
  await supabase.from('soumissions').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', sourceId);
  // Nouvelle revision re-tarifee
  const newHeader: Soumission = {
    ...full.soumission, id: undefined,
    revision: (full.soumission.revision || 1) + 1,
    parent_soumission_id: full.soumission.parent_soumission_id || sourceId,
    catalogue_id: cat?.id ?? full.soumission.catalogue_id ?? null,
    status: 'draft', total: 0,
  };
  return await saveSoumissionFull(tenant, newHeader, full.items, cat);
}

/**
 * Transfert soumission -> projet (réconciliation avec le hub Projets, migration 010).
 * À l'acceptation : crée ou met à jour un `projects` (upsert sur tenant_id+project_number),
 * y dépose l'estimé (snapshot items/lignes + total), pose `soumissions.project_id` et statut 'accepted'.
 * Le planificateur recherche ensuite par `project_number` pour le pré-montage du Gantt.
 * (Décision : la soumission alimente Projets ; catalogue_taux = devis, labor_rates = paie/réel.)
 */
export async function accepterSoumission(tenant: string, soumissionId: string): Promise<{ projectId: string; projectNumber: string }> {
  const full = await getSoumissionFull(tenant, soumissionId);
  if (!full) throw new Error('Soumission introuvable.');
  const s = full.soumission;
  const projectNumber = s.numero; // le n° de soumission devient le n° de projet (upsert si re-accepte/revise)
  const estimate = {
    source: 'soumission', soumission_id: soumissionId, revision: s.revision, total: s.total,
    items: full.items.map(it => ({ name: it.name, total: it.total, lignes: it.lignes })),
    generated_at: new Date().toISOString(),
  };
  const payload: any = {
    tenant_id: tenant, project_number: projectNumber,
    title: s.client_snapshot?.projet || s.numero,
    client_name: s.client_snapshot?.name || null,
    location: s.client_snapshot?.lieu || null,
    submission_number: s.numero, status: 'actif', project_type: 'budgetaire',
    global_price: s.total, estimate, updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('projects').upsert(payload, { onConflict: 'tenant_id,project_number' }).select('id, project_number').single();
  if (error) throw error;
  await supabase.from('soumissions').update({ project_id: data.id, status: 'accepted', updated_at: new Date().toISOString() }).eq('id', soumissionId).eq('tenant_id', tenant);
  return { projectId: data.id, projectNumber: data.project_number };
}

export async function setSoumissionStatus(tenant: string, id: string, status: Soumission['status']) {
  const { error } = await supabase.from('soumissions').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}
export async function deleteSoumission(tenant: string, id: string) {
  const { error } = await supabase.from('soumissions').delete().eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}
