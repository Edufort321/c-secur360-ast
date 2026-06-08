// Service Soumissions + catalogue de taux (migration 090).
// Chaine devis -> planificateur -> facturation. Calcul des montants depuis le catalogue versionne
// (taux MO bureau/chantier + multiplicateurs supp/maj). Revision = clone + re-tarification + archivage.
import { supabase } from '@/lib/supabase';
import { syncProjectCommission } from '@/lib/commission';
import { saveInvoice, nextInvoiceNumber, type Invoice, type InvoiceItem } from '@/lib/invoicing';

export type Categorie = 'mo_bureau' | 'mo_chantier' | 'voyagement' | 'subsistance' | 'hebergement' | 'materiaux';
export const CATEGORIES_MO: Categorie[] = ['mo_bureau', 'mo_chantier'];
export const CATEGORIE_LABELS: Record<Categorie, string> = {
  mo_bureau: 'MO Bureau', mo_chantier: 'MO Chantier', voyagement: 'Voyagement',
  subsistance: 'Subsistance', hebergement: 'Hébergement', materiaux: 'Matériaux',
};

export type CatalogueExtras = {
  km?: number; sub_h5?: number; sub_h12?: number; sub_h15?: number; sub_nuitee?: number; hebergement?: number;
  fuel_price?: number;       // prix courant du litre (pour la surcharge carburant)
  temps_demi?: number;       // taux temps supplémentaire (1½) $/h
  temps_double?: number;     // taux temps double (2×) $/h
};
export type CatCustomRate = { label: string; value: number; categorie?: Categorie }; // barème additionnel libre, classé par catégorie de soumission
export type CatMaterial = { sku?: string; name: string; cost_price?: number; margin_pct?: number; sale_price?: number };
export type CatFuelTier = { price: number; surcharge_pct: number }; // palier : à ce prix du litre, ce % de surcharge s'applique
export type CatApproval = { level_name: string; max_amount: number; approver_label?: string; color?: string };
export type CatalogueTaux = {
  id?: string; name: string; year: number; revision: number; status: 'active' | 'archived';
  taux_mo_bureau: number; taux_mo_chantier: number; mult_supp: number; mult_maj: number; notes?: string | null;
  preferred?: boolean; // catalogue par défaut proposé en premier dans la soumission
  extras?: CatalogueExtras;           // barème scalaire complet (km, subsistance, hébergement, carburant)
  labels?: Record<string, string>;    // libellés personnalisés propagés à l'affichage
  materials?: CatMaterial[];          // catalogue matériel (par catalogue)
  fuel_tiers?: CatFuelTier[];         // paliers de surcharge carburant
  approval_levels?: CatApproval[];    // niveaux d'approbation des soumissions
  custom_rates?: CatCustomRate[];     // barèmes additionnels libres (libellé + taux)
};

/** Libellé d'un champ : libellé personnalisé du catalogue sinon le libellé par défaut. */
export function catLabel(cat: CatalogueTaux | null | undefined, key: string, fallback: string): string {
  const v = cat?.labels?.[key];
  return (typeof v === 'string' && v.trim()) ? v : fallback;
}
export type SoumissionLigne = {
  id?: string; item_id?: string; categorie: Categorie; description?: string;
  tech: number; reg: number; supp: number; maj: number;
  quantity: number; unit?: string | null; unit_cost: number; montant: number; sort_order?: number;
};
export type SoumissionItem = { id?: string; name: string; year?: number | null; sort_order?: number; total: number; lignes: SoumissionLigne[] };
export type Soumission = {
  id?: string; numero: string; revision: number; parent_soumission_id?: string | null; year?: number | null;
  client_id?: string | null; client_snapshot?: any; project_id?: string | null; catalogue_id?: string | null;
  seller_id?: string | null; // vendeur = createur de la soumission (planner_personnel.id) -> commission au transfert
  status: 'draft' | 'sent' | 'accepted' | 'archived'; total: number; notes?: string | null;
  // Suivi (migration 138) : transmission (début relance), heures totales, majoration appliquée.
  sent_at?: string | null; total_hours?: number; markup_pct?: number; created_at?: string;
  // Partage de commission entre vendeurs (migration 140) : [{ seller_id, pct }].
  sellers_split?: { seller_id: string; pct: number }[] | null;
  // Approbation (migration 139).
  approved_by?: string | null; approved_at?: string | null; approval_note?: string | null;
};

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/** Montant d'une ligne :
 *  - MO = tech × (reg·taux + supp·taux·multSupp + maj·taux·multMaj)
 *  - VOYAGEMENT = nb véhicules (tech) × km (quantity) × taux/km (unit_cost)
 *  - autres = quantité × coût. */
export function computeLigneMontant(ligne: SoumissionLigne, cat?: CatalogueTaux | null): number {
  if (ligne.categorie === 'voyagement') {
    const vehicules = Number(ligne.tech) || 1;
    const km = Number(ligne.quantity) || 0;
    const tauxKm = Number(ligne.unit_cost) || 0; // pré-rempli depuis le catalogue (extras.km)
    return r2(vehicules * km * tauxKm);
  }
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

/** Nombre d'HEURES de main-d'œuvre total (tech × (rég+supp+maj)) sur toute la soumission. */
export function computeSoumissionHours(items: SoumissionItem[]): number {
  let h = 0;
  for (const it of items || []) for (const l of it.lignes || []) {
    if (l.categorie === 'mo_bureau' || l.categorie === 'mo_chantier') {
      h += (Number(l.tech) || 1) * ((Number(l.reg) || 0) + (Number(l.supp) || 0) + (Number(l.maj) || 0));
    }
  }
  return r2(h);
}

/** Heures MO ventilées par statut : bureau vs chantier (pour le calculateur de ressources). */
export function hoursByCategory(items: SoumissionItem[]): { bureau: number; chantier: number; total: number } {
  let bureau = 0, chantier = 0;
  for (const it of items || []) for (const l of it.lignes || []) {
    const h = (Number(l.tech) || 1) * ((Number(l.reg) || 0) + (Number(l.supp) || 0) + (Number(l.maj) || 0));
    if (l.categorie === 'mo_bureau') bureau += h;
    else if (l.categorie === 'mo_chantier') chantier += h;
  }
  return { bureau: r2(bureau), chantier: r2(chantier), total: r2(bureau + chantier) };
}

/** Applique la MAJORATION (%) au total et ARRONDIT au dollar (prix de soumission « propre »). */
export function applyMarkup(total: number, markupPct?: number): number {
  const m = Number(markupPct) || 0;
  return Math.round((Number(total) || 0) * (1 + m / 100));
}

/** Niveau d'approbation requis selon le montant (catalogue.approval_levels). */
export function approvalForAmount(cat: CatalogueTaux | null | undefined, amount: number): CatApproval | null {
  const levels = (cat?.approval_levels || []).slice().sort((a, b) => (a.max_amount || 0) - (b.max_amount || 0));
  if (!levels.length) return null;
  for (const lv of levels) if ((Number(amount) || 0) <= (Number(lv.max_amount) || 0)) return lv;
  return levels[levels.length - 1]; // au-delà du dernier seuil -> niveau le plus élevé
}

/** Suivi/relance d'une soumission : âge, jours depuis transmission, relance requise (≥30 j transmis non accepté). */
export function relanceInfo(s: Soumission): { ageDays: number | null; sinceSentDays: number | null; needsRelance: boolean } {
  const now = Date.now();
  const created = s.created_at ? new Date(s.created_at).getTime() : null;
  const sent = s.sent_at ? new Date(s.sent_at).getTime() : null;
  const ageDays = created != null ? Math.floor((now - created) / 86400000) : null;
  const sinceSentDays = sent != null ? Math.floor((now - sent) / 86400000) : null;
  const needsRelance = s.status === 'sent' && sinceSentDays != null && sinceSentDays >= 30;
  return { ageDays, sinceSentDays, needsRelance };
}

// ── Catalogue ─────────────────────────────────────────────────────────────────
// Un seul MODÈLE de catalogue, plusieurs enregistrés. Le « préféré » est proposé en
// premier dans la soumission, suivi des autres par ordre chronologique (année/révision).
const sortCatalogues = (list: CatalogueTaux[]): CatalogueTaux[] =>
  [...list].sort((a, b) =>
    (b.preferred ? 1 : 0) - (a.preferred ? 1 : 0)
    || (Number(b.year) || 0) - (Number(a.year) || 0)
    || (Number(b.revision) || 0) - (Number(a.revision) || 0));

// ── Repli local (localStorage) : si la base ne peut pas stocker une colonne optionnelle
// (migration non encore propagee au cache de schema PostgREST), on conserve la valeur localement
// pour que materiel/baremes/etc. persistent quand meme. Efface des qu'un enregistrement complet reussit.
const CAT_FALLBACK_KEY = (tenant: string, id: string) => `cat_fallback_${tenant}_${id}`;
function readCatFallback(tenant: string, id?: string): Partial<CatalogueTaux> | null {
  if (!id || typeof window === 'undefined') return null;
  try { const s = window.localStorage.getItem(CAT_FALLBACK_KEY(tenant, id)); return s ? JSON.parse(s) : null; } catch { return null; }
}
function writeCatFallback(tenant: string, id: string, data: Partial<CatalogueTaux>): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(CAT_FALLBACK_KEY(tenant, id), JSON.stringify(data)); } catch { /* quota */ }
}
function clearCatFallback(tenant: string, id: string): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(CAT_FALLBACK_KEY(tenant, id)); } catch { /* noop */ }
}

export async function getCatalogues(tenant: string): Promise<CatalogueTaux[]> {
  const { data, error } = await supabase.from('catalogue_taux').select('*').eq('tenant_id', tenant);
  if (error) throw error;
  // Fusionne le repli local par-dessus les colonnes que la base n'a pas pu stocker.
  const merged = (data || []).map((c: any) => {
    const fb = readCatFallback(tenant, c.id);
    return fb ? { ...c, ...fb } : c;
  });
  return sortCatalogues(merged as CatalogueTaux[]);
}
/** Catalogue par défaut : le « préféré » sinon le plus récent actif. */
export async function getActiveCatalogue(tenant: string, _year?: number): Promise<CatalogueTaux | null> {
  const all = (await getCatalogues(tenant)).filter(c => c.status === 'active');
  return all.find(c => c.preferred) || all[0] || null;
}
// Colonnes ajoutées par les migrations 101–105 ; retirées automatiquement si absentes
// (l'enregistrement de base fonctionne avant l'exécution des migrations).
const CATALOGUE_OPTIONAL_COLS = ['preferred', 'extras', 'labels', 'materials', 'fuel_tiers', 'approval_levels', 'custom_rates'];

export async function saveCatalogue(tenant: string, c: CatalogueTaux): Promise<{ id: string; stripped: string[] }> {
  const payload: any = { ...c, tenant_id: tenant, updated_at: new Date().toISOString() };
  const write = async (p: any): Promise<{ id?: string; error: any }> => {
    if (c.id) { const { error } = await supabase.from('catalogue_taux').update(p).eq('id', c.id); return { id: c.id, error }; }
    const { data, error } = await supabase.from('catalogue_taux').insert(p).select('id').single();
    return { id: data?.id, error };
  };
  let id: string | undefined;
  const stripped: string[] = []; // colonnes optionnelles retirees faute de migration/cache (repli localStorage)
  for (let attempt = 0; attempt < CATALOGUE_OPTIONAL_COLS.length + 1; attempt++) {
    const res = await write(payload);
    if (!res.error) { id = res.id; break; }
    const msg = res.error.message || '';
    const code = res.error.code || '';
    // Ne retire QUE sur une vraie erreur de colonne manquante / cache de schema PostgREST — pas sur une autre erreur.
    const isMissingCol = code === 'PGRST204' || /schema cache|could not find|does not exist/i.test(msg);
    const m = msg.match(/'([a-z_]+)' column/i) || msg.match(/column ["']?([a-z_]+)["']?/i) || msg.match(/the '([a-z_]+)' column/i);
    const col = m?.[1];
    if (isMissingCol && col && CATALOGUE_OPTIONAL_COLS.includes(col) && payload[col] !== undefined) { delete payload[col]; if (!stripped.includes(col)) stripped.push(col); continue; }
    throw res.error;
  }
  // Un seul préféré à la fois (ignore si la colonne n'existe pas encore).
  if (c.preferred && id) { try { await supabase.from('catalogue_taux').update({ preferred: false }).eq('tenant_id', tenant).neq('id', id); } catch { /* colonne preferred absente */ } }
  // Repli local : si des colonnes ont ete retirees, on conserve leurs valeurs localement (et on relit a getCatalogues).
  if (id) {
    if (stripped.length) {
      const fb: any = {};
      for (const col of stripped) fb[col] = (c as any)[col];
      writeCatFallback(tenant, id, fb);
    } else {
      clearCatFallback(tenant, id); // tout est en base : plus besoin du repli
    }
  }
  return { id: id as string, stripped };
}
export async function deleteCatalogue(tenant: string, id: string): Promise<void> {
  const { error } = await supabase.from('catalogue_taux').delete().eq('tenant_id', tenant).eq('id', id);
  if (error) throw error;
}
/** Marque un catalogue comme préféré (et retire le préféré des autres). */
export async function setPreferredCatalogue(tenant: string, id: string): Promise<void> {
  const { error } = await supabase.from('catalogue_taux').update({ preferred: true }).eq('tenant_id', tenant).eq('id', id);
  if (error) throw error;
  await supabase.from('catalogue_taux').update({ preferred: false }).eq('tenant_id', tenant).neq('id', id);
}

// ── Numérotation (spec client) : <PREFIX><AA><NNN><S|P> ─────────────────────
// PREFIX = initiales des mots du site (« CERDIA Sherbrooke » -> « CS »). AA = 2 chiffres année.
// NNN = séquentiel monotone (001+). Suffixe S = soumission, P = projet. Compteurs séparés.
export function siteInitials(siteName?: string | null): string {
  if (!siteName) return 'XX';
  const ini = siteName.trim().split(/\s+/).map(w => (w[0] || '')).join('').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return ini || 'XX';
}

/** Prochain séquentiel pour un (prefix, année, suffixe) donné, dans la table/colonne indiquée. */
async function nextSeq(tenant: string, table: string, column: string, prefix: string, suffix: string): Promise<number> {
  const yy = String(new Date().getFullYear()).slice(-2);
  const { data } = await supabase.from(table).select(column).eq('tenant_id', tenant).like(column, `${prefix}${yy}%${suffix}`);
  const re = new RegExp(`^${prefix}${yy}(\\d{3})${suffix}$`);
  let max = 0;
  for (const row of (data || []) as any[]) {
    const m = String(row[column] || '').match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

/** Numéro de soumission : <PREFIX><AA><NNN>S. */
export async function genSoumissionNumero(tenant: string, sitePrefix: string): Promise<string> {
  const prefix = (sitePrefix || 'XX').toUpperCase();
  const yy = String(new Date().getFullYear()).slice(-2);
  const seq = await nextSeq(tenant, 'soumissions', 'numero', prefix, 'S');
  return `${prefix}${yy}${String(seq).padStart(3, '0')}S`;
}

/** Numéro de projet : <PREFIX><AA><NNN>P (compteur séparé des soumissions). */
export async function genProjetNumero(tenant: string, sitePrefix: string): Promise<string> {
  const prefix = (sitePrefix || 'XX').toUpperCase();
  const yy = String(new Date().getFullYear()).slice(-2);
  const seq = await nextSeq(tenant, 'projects', 'project_number', prefix, 'P');
  return `${prefix}${yy}${String(seq).padStart(3, '0')}P`;
}

/** Extrait le PREFIX (lettres de tête) d'un numéro <PREFIX><AA><NNN><S|P>. */
export function prefixFromNumero(numero?: string | null): string {
  const m = String(numero || '').match(/^([A-Za-z]+)\d{2}\d{3}[A-Za-z]$/);
  return m ? m[1].toUpperCase() : 'XX';
}

// ── Soumissions ─────────────────────────────────────────────────────────────
/** Compat : ancien format. Préférer genSoumissionNumero(tenant, sitePrefix). */
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
  const rawTotal = computeSoumissionTotal(items, cat);
  const total = applyMarkup(rawTotal, header.markup_pct); // majoration + arrondi -> prix final
  // Transmission : on pose sent_at la 1re fois que le statut passe à « sent » (début du décompte relance).
  const sentAt = header.status === 'sent' ? (header.sent_at || new Date().toISOString()) : (header.sent_at ?? null);
  const hPayload: any = {
    tenant_id: tenant, numero: header.numero, revision: header.revision ?? 1, parent_soumission_id: header.parent_soumission_id ?? null,
    year: header.year ?? null, client_id: header.client_id ?? null, client_snapshot: header.client_snapshot ?? null,
    project_id: header.project_id ?? null, catalogue_id: header.catalogue_id ?? null, seller_id: header.seller_id ?? null,
    status: header.status || 'draft', total, notes: header.notes ?? null, updated_at: new Date().toISOString(),
    // Suivi (migration 138) — retirés automatiquement si les colonnes n'existent pas encore.
    sent_at: sentAt, total_hours: computeSoumissionHours(items), markup_pct: Number(header.markup_pct) || 0,
    // Partage de commission (migration 140).
    sellers_split: Array.isArray(header.sellers_split) && header.sellers_split.length ? header.sellers_split : null,
    // Approbation (migration 139).
    approved_by: header.approved_by ?? null, approved_at: header.approved_at ?? null, approval_note: header.approval_note ?? null,
  };
  let id = header.id;
  // Upsert résilient : si une colonne de suivi manque (migration 138 non passée), on la retire et on réessaie.
  const attempt = (p: any) => id ? supabase.from('soumissions').update(p).eq('id', id).select('id').single() : supabase.from('soumissions').insert(p).select('id').single();
  let res: any = await attempt(hPayload); let guard = 0;
  while (res.error && guard < 6) {
    const m = String(res.error.message || '').match(/'([a-z_]+)' column|column "?([a-z_]+)"? .*does not exist|could not find the '([a-z_]+)'/i);
    const col = m ? (m[1] || m[2] || m[3]) : null;
    if (col && col in hPayload && !['numero', 'tenant_id', 'status', 'total'].includes(col)) { delete hPayload[col]; res = await attempt(hPayload); guard++; }
    else break;
  }
  if (res.error) throw res.error;
  if (!id) id = res.data.id;

  // Remplacer items + lignes (cascade delete sur items supprime leurs lignes)
  // Securite : filtrer par tenant_id pour eviter toute suppression cross-tenant.
  await supabase.from('soumission_items').delete().eq('tenant_id', tenant).eq('soumission_id', id);
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
export async function accepterSoumission(tenant: string, soumissionId: string): Promise<{ projectId: string; projectNumber: string; commission?: string }> {
  const full = await getSoumissionFull(tenant, soumissionId);
  if (!full) throw new Error('Soumission introuvable.');
  const s = full.soumission;
  // N° de projet = compteur SEPARE (suffixe P), meme PREFIX de site que la soumission.
  // Idempotent : si la soumission est deja liee a un projet, on reutilise son numero (pas de doublon).
  let projectNumber: string;
  if (s.project_id) {
    const { data: ex } = await supabase.from('projects').select('project_number').eq('id', s.project_id).maybeSingle();
    projectNumber = ex?.project_number || await genProjetNumero(tenant, prefixFromNumero(s.numero));
  } else {
    projectNumber = await genProjetNumero(tenant, prefixFromNumero(s.numero));
  }
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
    submission_number: s.numero, project_type: 'budgetaire',
    // 'vente' = vente conclue -> declenche la commission du/des vendeur(s) (lib/commission.ts)
    status: 'vente', primary_seller_id: s.seller_id || (s.sellers_split?.[0]?.seller_id) || null,
    sellers_split: Array.isArray(s.sellers_split) && s.sellers_split.length ? s.sellers_split : null,
    global_price: s.total, po_amount: s.total, estimate, updated_at: new Date().toISOString(),
  };
  // Upsert tolérant : si une colonne récente manque (ex. sellers_split avant migration 140), on la retire.
  let { data, error } = await supabase.from('projects').upsert(payload, { onConflict: 'tenant_id,project_number' }).select('*').single();
  let guardP = 0;
  while (error && guardP < 4) {
    const m = String(error.message || '').match(/'([a-z_]+)' column|column "?([a-z_]+)"? .*does not exist|could not find the '([a-z_]+)'/i);
    const col = m ? (m[1] || m[2] || m[3]) : null;
    if (col && col in payload && !['tenant_id', 'project_number', 'status'].includes(col)) { delete payload[col]; ({ data, error } = await supabase.from('projects').upsert(payload, { onConflict: 'tenant_id,project_number' }).select('*').single()); guardP++; }
    else break;
  }
  if (error) throw error;
  await supabase.from('soumissions').update({ project_id: data.id, status: 'accepted', updated_at: new Date().toISOString() }).eq('id', soumissionId).eq('tenant_id', tenant);

  // Commission de vente : le vendeur (createur) touche sa commission si son poste l'active
  let commission: string | undefined;
  if (s.seller_id) {
    try { const r = await syncProjectCommission(supabase, tenant, data); commission = r.msg; }
    catch (e: any) { commission = e?.message; }
  }
  return { projectId: data.id, projectNumber: data.project_number, commission };
}

// ── Tableau de bord / stats de gestion (taux de conversion, pipeline) ────────
export type SoumissionStats = {
  total: number;
  byStatus: Record<string, number>;
  montantTotal: number;       // somme de toutes les soumissions
  montantAccepte: number;     // somme des soumissions acceptées
  tauxConversion: number;     // acceptées / total (0..1)
  valeurMoyenne: number;      // montant moyen par soumission
  valeurMoyenneAcceptee: number;
  nbProjets: number;          // projets issus de soumissions (submission_number renseigné)
};
export async function getSoumissionStats(tenant: string): Promise<SoumissionStats> {
  const { data, error } = await supabase.from('soumissions').select('status, total').eq('tenant_id', tenant);
  if (error) throw error;
  const list = (data || []) as { status: string; total: number }[];
  const byStatus: Record<string, number> = {};
  let montantTotal = 0, montantAccepte = 0;
  for (const s of list) {
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    montantTotal += Number(s.total) || 0;
    if (s.status === 'accepted') montantAccepte += Number(s.total) || 0;
  }
  const total = list.length;
  const accepted = byStatus['accepted'] || 0;
  let nbProjets = 0;
  try {
    const { count } = await supabase.from('projects').select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenant).not('submission_number', 'is', null);
    nbProjets = count || 0;
  } catch { /* module projets indisponible */ }
  return {
    total, byStatus, montantTotal, montantAccepte,
    tauxConversion: total ? accepted / total : 0,
    valeurMoyenne: total ? r2(montantTotal / total) : 0,
    valeurMoyenneAcceptee: accepted ? r2(montantAccepte / accepted) : 0,
    nbProjets,
  };
}

/**
 * Convergence Facturation (S5) : génère une facture (commerce_invoices) depuis une soumission.
 * Chaque item de la soumission devient une ligne de facture (montant = total de l'item).
 * La facture est en brouillon ; elle suit ensuite le flux Factures existant (Comptabiliser = vente→GL).
 */
export async function genererFactureDepuisSoumission(tenant: string, soumissionId: string): Promise<{ invoiceId: string; numero: string }> {
  const full = await getSoumissionFull(tenant, soumissionId);
  if (!full) throw new Error('Soumission introuvable.');
  const s = full.soumission;
  const numero = await nextInvoiceNumber(tenant, 'F');
  const items: InvoiceItem[] = (full.items.length ? full.items.map((it, i) => ({
    description: it.name || `Item ${i + 1}`, quantity: 1, unit_price: Number(it.total) || 0,
    subtotal: Number(it.total) || 0, taxable: true, sort_order: i,
  })) : [{ description: s.numero, quantity: 1, unit_price: Number(s.total) || 0, subtotal: Number(s.total) || 0, taxable: true, sort_order: 0 }]);
  const header: Invoice = {
    invoice_number: numero, client_id: s.client_id ?? null, client_snapshot: s.client_snapshot ?? null,
    status: 'draft', issue_date: new Date().toISOString().slice(0, 10), province: 'QC',
    subtotal: 0, gst_rate: 0, qst_rate: 0, pst_rate: 0, gst_amount: 0, qst_amount: 0, pst_amount: 0, total: 0,
    notes: `Émise depuis la soumission ${s.numero}`,
  };
  const invoiceId = await saveInvoice(tenant, header, items);
  return { invoiceId, numero };
}

export async function setSoumissionStatus(tenant: string, id: string, status: Soumission['status']) {
  const { error } = await supabase.from('soumissions').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}
export async function deleteSoumission(tenant: string, id: string) {
  const { error } = await supabase.from('soumissions').delete().eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}
