// Service Bons de commande (achats fournisseurs).
// Interrelie : planificateur (items « à commander » des mandats) -> bon de commande -> inventaire (réception) / projet.
// Lignes stockées en JSON (items). Numérotation <PREFIX><AA><NNN>BC. Résilience colonnes optionnelles + repli localStorage.
import { supabase } from '@/lib/supabase';
import { siteInitials } from '@/lib/soumissions';
import { computeInvoiceTotals } from '@/lib/invoicing';

export type BonCommandeLigne = {
  id?: string;
  code?: string;            // code article (catalogue/inventaire)
  designation: string;
  quantite: number;
  unite?: string;
  cout_unitaire: number;
  recu?: number;            // quantité reçue (réception partielle, cumulée)
  recu_synced?: number;     // quantité déjà poussée à l'inventaire (évite le double-comptage sur réceptions partielles)
  taxable?: boolean;        // défaut true
  source_job_id?: string;   // mandat d'origine (si importé du planificateur)
  source_index?: number;    // index dans preparation[] du mandat
};
export type BonCommandeStatus = 'brouillon' | 'envoye' | 'partiel' | 'recu' | 'annule';

// DESTINATION (classe d'achat) — pilote le routage à la réception (migration 217).
export type BonDestination = 'stock' | 'projet' | 'consommable' | 'capex' | 'revente';
export const BON_DESTINATIONS: { key: BonDestination; fr: string; en: string; hint: string }[] = [
  { key: 'stock',       fr: 'Stock / inventaire',      en: 'Inventory stock',   hint: 'Reçu → ajouté à l\'inventaire (actif 1300).' },
  { key: 'projet',      fr: 'Projet / chantier',       en: 'Project / job site', hint: 'Reçu → coût de projet (matériaux 5260), consommé directement.' },
  { key: 'consommable', fr: 'Consommable / charge',    en: 'Consumable / expense', hint: 'Reçu → charge directe (catégorie fiscale), pas de stock.' },
  { key: 'capex',       fr: 'Immobilisation (CAPEX)',  en: 'Fixed asset (CAPEX)', hint: 'Reçu → crée une immobilisation (actif 1500).' },
  { key: 'revente',     fr: 'Achat pour revente',      en: 'Purchase for resale', hint: 'Reçu → stock destiné à la vente (inventaire, marqué « revente »).' },
];
export const bonDestinationLabel = (d?: BonDestination | string, fr = true): string => {
  const m = BON_DESTINATIONS.find(x => x.key === d); return m ? (fr ? m.fr : m.en) : (fr ? 'Stock / inventaire' : 'Inventory stock');
};
/** Une destination « stock » (stock ou revente) alimente l'inventaire physique ; les autres passent une écriture GL. */
export const destFeedsInventory = (d?: BonDestination | string): boolean => d == null || d === 'stock' || d === 'revente';

export type BonCommande = {
  id?: string;
  numero: string;
  supplier?: string;
  supplier_contact?: string;
  project_id?: string | null;
  status: BonCommandeStatus;
  items: BonCommandeLigne[];
  notes?: string | null;
  province?: string;
  expected_date?: string | null;
  destination?: BonDestination;     // classe d'achat (défaut 'stock')
  fiscal_category?: string | null;  // clé FISCAL_CATEGORIES si destination = consommable
  gl_entry_id?: string | null;      // écriture GL passée à la réception (anti double-comptage)
  subtotal?: number;
  taxes?: number;
  total?: number;
  created_at?: string;
  updated_at?: string;
};

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/** Sous-total / taxes / total d'un bon (réutilise le calcul de taxes par province de la facturation). */
export function computeBonTotal(items: BonCommandeLigne[], province = 'QC'): { subtotal: number; taxes: number; total: number } {
  const invItems = (items || []).map(l => ({
    description: l.designation || '', quantity: Number(l.quantite) || 0,
    unit_price: Number(l.cout_unitaire) || 0, subtotal: 0, taxable: l.taxable !== false,
  }));
  const t = computeInvoiceTotals(invItems as any, province);
  return { subtotal: r2(t.subtotal), taxes: r2(t.gst_amount + t.qst_amount + t.pst_amount), total: r2(t.total) };
}

// ── Numérotation <PREFIX><AA><NNN>BC ────────────────────────────────────────
async function nextBcSeq(tenant: string, prefix: string): Promise<number> {
  const yy = String(new Date().getFullYear()).slice(-2);
  const { data } = await supabase.from('bons_commande').select('numero').eq('tenant_id', tenant).like('numero', `${prefix}${yy}%BC`);
  const re = new RegExp(`^${prefix}${yy}(\\d{3})BC$`);
  let max = 0;
  for (const row of (data || []) as any[]) { const m = String(row.numero || '').match(re); if (m) max = Math.max(max, parseInt(m[1], 10)); }
  return max + 1;
}
export async function genBonNumero(tenant: string, sitePrefix: string): Promise<string> {
  const prefix = (sitePrefix || 'XX').toUpperCase();
  const yy = String(new Date().getFullYear()).slice(-2);
  const seq = await nextBcSeq(tenant, prefix);
  return `${prefix}${yy}${String(seq).padStart(3, '0')}BC`;
}

// ── Repli local pour colonnes optionnelles (migration 106 non encore propagée au cache de schéma) ──
const BC_OPTIONAL_COLS = ['supplier', 'supplier_contact', 'project_id', 'items', 'notes', 'province', 'expected_date', 'destination', 'fiscal_category', 'gl_entry_id', 'subtotal', 'taxes', 'total'];
const BC_FALLBACK_KEY = (tenant: string, id: string) => `bc_fallback_${tenant}_${id}`;
function readBcFallback(tenant: string, id?: string): Partial<BonCommande> | null {
  if (!id || typeof window === 'undefined') return null;
  try { const s = window.localStorage.getItem(BC_FALLBACK_KEY(tenant, id)); return s ? JSON.parse(s) : null; } catch { return null; }
}
function writeBcFallback(tenant: string, id: string, data: Partial<BonCommande>): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(BC_FALLBACK_KEY(tenant, id), JSON.stringify(data)); } catch { /* quota */ }
}
function clearBcFallback(tenant: string, id: string): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(BC_FALLBACK_KEY(tenant, id)); } catch { /* noop */ }
}

export async function getBonsCommande(tenant: string): Promise<BonCommande[]> {
  const { data, error } = await supabase.from('bons_commande').select('*').eq('tenant_id', tenant).order('created_at', { ascending: false });
  if (error) throw error;
  const merged = (data || []).map((b: any) => { const fb = readBcFallback(tenant, b.id); return fb ? { ...b, ...fb } : b; });
  return merged as BonCommande[];
}

export async function saveBonCommande(tenant: string, b: BonCommande): Promise<{ id: string; stripped: string[] }> {
  const totals = computeBonTotal(b.items || [], b.province || 'QC');
  const candidate: any = { ...b, ...totals }; // valeurs d'origine (pour le repli local si une colonne est retirée)
  const payload: any = { ...b, ...totals, tenant_id: tenant, updated_at: new Date().toISOString() };
  const write = async (p: any): Promise<{ id?: string; error: any }> => {
    if (b.id) { const { error } = await supabase.from('bons_commande').update(p).eq('id', b.id); return { id: b.id, error }; }
    const { data, error } = await supabase.from('bons_commande').insert(p).select('id').single();
    return { id: data?.id, error };
  };
  let id: string | undefined;
  const stripped: string[] = [];
  for (let attempt = 0; attempt < BC_OPTIONAL_COLS.length + 1; attempt++) {
    const res = await write(payload);
    if (!res.error) { id = res.id; break; }
    const msg = res.error.message || ''; const code = res.error.code || '';
    const isMissingCol = code === 'PGRST204' || /schema cache|could not find|does not exist/i.test(msg);
    const m = msg.match(/'([a-z_]+)' column/i) || msg.match(/column ["']?([a-z_]+)["']?/i) || msg.match(/the '([a-z_]+)' column/i);
    const col = m?.[1];
    if (isMissingCol && col && BC_OPTIONAL_COLS.includes(col) && payload[col] !== undefined) { delete payload[col]; if (!stripped.includes(col)) stripped.push(col); continue; }
    throw res.error;
  }
  if (id) {
    if (stripped.length) { const fb: any = {}; for (const col of stripped) fb[col] = candidate[col]; writeBcFallback(tenant, id, fb); }
    else clearBcFallback(tenant, id);
  }
  return { id: id as string, stripped };
}

export async function deleteBonCommande(tenant: string, id: string): Promise<void> {
  const { error } = await supabase.from('bons_commande').delete().eq('tenant_id', tenant).eq('id', id);
  if (error) throw error;
  clearBcFallback(tenant, id);
}

// ── Lien planificateur : items « à commander » des mandats ───────────────────
export type ItemACommander = {
  job_id: string; job_nom: string; project_id?: string | null; index: number;
  text: string; quantite: number; unite?: string; code?: string; cout_unitaire?: number;
};
export async function scanItemsACommander(tenant: string): Promise<ItemACommander[]> {
  const { data, error } = await supabase.from('planner_jobs').select('id, nom, title, project_id, preparation').eq('tenant_id', tenant);
  if (error) throw error;
  const out: ItemACommander[] = [];
  for (const job of (data || []) as any[]) {
    const prep = Array.isArray(job.preparation) ? job.preparation : [];
    prep.forEach((p: any, index: number) => {
      if (p && p.approStatut === 'a-commander') {
        out.push({
          job_id: job.id, job_nom: job.nom || job.title || 'Mandat', project_id: job.project_id || null, index,
          text: p.text || p.designation || '', quantite: Number(p.quantite) || 1, unite: p.unite || '', code: p.code || '',
          cout_unitaire: Number(p.cout_unitaire ?? p.prix ?? 0) || 0,
        });
      }
    });
  }
  return out;
}
/** Met à jour le statut d'appro des items source dans les mandats (a-commander -> nouveau statut). */
export async function setJobsApproStatut(tenant: string, refs: { job_id: string; index: number }[], statut: string): Promise<number> {
  const byJob: Record<string, number[]> = {};
  for (const r of refs) { (byJob[r.job_id] ||= []).push(r.index); }
  let updated = 0;
  for (const [jobId, indices] of Object.entries(byJob)) {
    try {
      const { data } = await supabase.from('planner_jobs').select('preparation').eq('tenant_id', tenant).eq('id', jobId).maybeSingle();
      const prep = Array.isArray(data?.preparation) ? [...data!.preparation] : [];
      let touched = false;
      for (const i of indices) { if (prep[i]) { prep[i] = { ...prep[i], approStatut: statut }; touched = true; } }
      if (touched) { await supabase.from('planner_jobs').update({ preparation: prep, updated_at: new Date().toISOString() }).eq('tenant_id', tenant).eq('id', jobId); updated += indices.length; }
    } catch { /* mandat introuvable / hors-ligne : ignore */ }
  }
  return updated;
}

// ── Lien inventaire : réception (best-effort) ────────────────────────────────
/** Pousse les quantités NOUVELLEMENT reçues vers l'inventaire (delta = recu − recu_synced) et met à jour
 *  `recu_synced` sur les lignes passées (mutation), pour éviter tout double-comptage sur réceptions partielles.
 *  Best-effort, non bloquant. */
export async function receiveToInventory(tenant: string, b: BonCommande, department = 'Réception'): Promise<{ synced: number; errors: number }> {
  let synced = 0, errors = 0;
  for (const l of (b.items || [])) {
    const recu = Number(l.recu) || 0;
    const already = Number(l.recu_synced) || 0;
    const delta = recu - already;       // seules les unités non encore comptabilisées sont ajoutées
    if (delta <= 0) continue;
    try {
      let itemId: string | undefined;
      if (l.code) {
        const { data: found } = await supabase.from('items').select('id').eq('tenant_id', tenant).eq('code', l.code).maybeSingle();
        itemId = found?.id;
      }
      if (!itemId) {
        const { data: ins } = await supabase.from('items').insert({
          tenant_id: tenant, code: l.code || `BC${Date.now().toString().slice(-6)}`, name: l.designation || 'Article',
          category: 'Bon de commande', unit: l.unite || 'Pièce', cost_price: Number(l.cout_unitaire) || 0,
        }).select('id').single();
        itemId = ins?.id;
      }
      if (!itemId) { errors++; continue; }
      const { data: loc } = await supabase.from('item_locations').select('id, quantity').eq('tenant_id', tenant).eq('item_id', itemId).limit(1).maybeSingle();
      if (loc?.id) { await supabase.from('item_locations').update({ quantity: (Number(loc.quantity) || 0) + delta }).eq('id', loc.id); }
      else { await supabase.from('item_locations').insert({ tenant_id: tenant, item_id: itemId, department, quantity: delta, min_quantity: 0, max_quantity: 0 }); }
      l.recu_synced = recu; // marque comme comptabilisé (delta inclus)
      synced++;
    } catch { errors++; }
  }
  return { synced, errors };
}

// ── Contrôle de réception : quantité reçue vs commandée (best-practice « 3-way / receiving control ») ──
export type LineReception = 'none' | 'partial' | 'complete' | 'over';
/** État de réception d'une ligne : rien / partiel / complet / surplus (reçu > commandé). */
export function lineReception(l: BonCommandeLigne): LineReception {
  const q = Number(l.quantite) || 0; const r = Number(l.recu) || 0;
  if (r <= 0) return 'none';
  if (q > 0 && r > q) return 'over';
  if (r < q) return 'partial';
  return 'complete';
}
/** Statut global déduit des lignes : tout reçu → recu ; au moins une ligne reçue → partiel ; sinon inchangé. */
export function computeReceptionStatus(items: BonCommandeLigne[], current: BonCommandeStatus): BonCommandeStatus {
  if (current === 'annule') return 'annule';
  const recs = (items || []).map(lineReception);
  if (recs.length === 0) return current;
  const anyRecu = recs.some(s => s !== 'none');
  const allDone = recs.every(s => s === 'complete' || s === 'over');
  if (allDone) return 'recu';
  if (anyRecu) return 'partiel';
  // Plus rien de reçu : on retombe sur « envoyé » si on était en réception, sinon on garde l'état (brouillon/envoyé).
  return current === 'recu' || current === 'partiel' ? 'envoye' : current;
}

// ── Création rapide depuis un autre module (inventaire, projet…) ─────────────
/** Crée un bon de commande (brouillon) avec le PROCHAIN numéro séquentiel et des lignes pré-remplies.
 *  Utilisé par les liens « Créer un bon de commande » des modules. Retourne l'id + le numéro généré. */
export async function createBonFromLines(tenant: string, opts: {
  sitePrefix?: string; supplier?: string; supplier_contact?: string; project_id?: string | null;
  destination?: BonDestination; fiscal_category?: string | null; province?: string;
  expected_date?: string | null; notes?: string | null; items: BonCommandeLigne[];
}): Promise<{ id: string; numero: string }> {
  const numero = await genBonNumero(tenant, opts.sitePrefix || 'XX');
  const bon: BonCommande = {
    numero, supplier: opts.supplier || '', supplier_contact: opts.supplier_contact || '',
    project_id: opts.project_id ?? null, status: 'brouillon', items: opts.items || [],
    notes: opts.notes ?? null, province: opts.province || 'QC', expected_date: opts.expected_date ?? null,
    destination: opts.destination || 'stock', fiscal_category: opts.fiscal_category ?? null,
  };
  const { id } = await saveBonCommande(tenant, bon);
  return { id, numero };
}

// ── Automatisation comptable à la réception (selon la destination) ───────────
/** Passe l'écriture GL d'un bon ENTIÈREMENT reçu selon sa destination (projet/consommable/capex).
 *  Stock/revente = géré par l'inventaire (pas d'écriture ici). Idempotent via gl_entry_id (anti double-post).
 *  CTI/RTI (TPS/TVQ) récupérables → comptes 1200/1210 ; PST non récupérable → ajoutée au coût. Best-effort. */
export async function postBonReceptionGL(tenant: string, bon: BonCommande): Promise<{ posted: boolean; entryId?: string; assetId?: string; skipped?: string; error?: string }> {
  const dest = bon.destination || 'stock';
  if (destFeedsInventory(dest)) return { posted: false, skipped: 'inventory' };  // stock/revente → inventaire
  if (bon.gl_entry_id) return { posted: false, skipped: 'already' };
  try {
    const { computeInvoiceTotals } = await import('@/lib/invoicing');
    const invItems = (bon.items || []).map(l => ({ description: l.designation || '', quantity: Number(l.quantite) || 0, unit_price: Number(l.cout_unitaire) || 0, subtotal: 0, taxable: l.taxable !== false }));
    const t = computeInvoiceTotals(invItems as any, bon.province || 'QC');
    const subtotal = r2(t.subtotal), gst = r2(t.gst_amount), qst = r2(t.qst_amount), pst = r2(t.pst_amount), total = r2(t.total);
    if (total <= 0) return { posted: false, skipped: 'zero' };

    const { getAccounts, createEntry } = await import('@/lib/accounting');
    const { ensureFiscalAccounts, FISCAL_CATEGORIES } = await import('@/lib/fiscalCategories');
    await ensureFiscalAccounts(tenant);
    const accs = await getAccounts(tenant);
    const byCode: Record<string, string> = {}; accs.forEach((a: any) => { byCode[a.code] = a.id; });
    const ap = byCode['2000'];
    if (!ap) return { posted: false, error: 'Compte 2000 (Fournisseurs) absent — initialisez la comptabilité (migration 085).' };

    // Compte de destination (débit).
    let destCode = '5260'; // matériaux par défaut (projet)
    if (dest === 'consommable') { const fc = FISCAL_CATEGORIES.find(c => c.key === bon.fiscal_category); destCode = fc?.glCode || '5260'; }
    else if (dest === 'capex') destCode = '1500'; // immobilisations (équipement)
    const destAcc = byCode[destCode] || byCode['5260'];
    if (!destAcc) return { posted: false, error: `Compte ${destCode} absent du plan comptable.` };

    // CTI/RTI récupérables si les comptes existent ; sinon (et PST toujours) on ajoute la taxe au coût.
    const gstAcc = gst > 0 ? byCode['1200'] : undefined;
    const qstAcc = qst > 0 ? byCode['1210'] : undefined;
    let destDebit = r2(subtotal + pst);
    let gstLine = 0, qstLine = 0;
    if (gstAcc) gstLine = gst; else destDebit = r2(destDebit + gst);
    if (qstAcc) qstLine = qst; else destDebit = r2(destDebit + qst);

    const lines: any[] = [{ account_id: destAcc, debit: destDebit, credit: 0, description: `${bonDestinationLabel(dest)} — ${bon.numero}` }];
    if (gstLine) lines.push({ account_id: gstAcc, debit: gstLine, credit: 0, description: 'CTI (TPS/TVH à récupérer)' });
    if (qstLine) lines.push({ account_id: qstAcc, debit: qstLine, credit: 0, description: 'RTI (TVQ à récupérer)' });
    lines.push({ account_id: ap, debit: 0, credit: total, description: bon.supplier || 'Fournisseur' });

    const today = new Date().toISOString().slice(0, 10);
    const entryId = await createEntry(tenant, {
      entry_date: bon.expected_date || today, description: `Réception ${bon.numero} — ${bonDestinationLabel(dest)}${bon.supplier ? ' · ' + bon.supplier : ''}`,
      reference: bon.numero, journal_code: 'ACH', source_type: 'bon_commande', source_id: bon.id, lines,
    });

    let assetId: string | undefined;
    if (dest === 'capex') {
      const { saveAsset } = await import('@/lib/assets');
      assetId = await saveAsset(tenant, {
        name: `${bon.supplier || 'Achat'} — ${bon.numero}`, category: 'Équipement', cost: destDebit,
        supplier: bon.supplier || null, acquisition_date: bon.expected_date || today, gl_entry_id: entryId,
      });
    }
    return { posted: true, entryId, assetId };
  } catch (e: any) {
    return { posted: false, error: e?.message || 'Écriture GL impossible.' };
  }
}

export function bonStatusLabel(s: BonCommandeStatus, fr = true): string {
  const map: Record<BonCommandeStatus, [string, string]> = {
    brouillon: ['Brouillon', 'Draft'], envoye: ['Envoyé', 'Sent'], partiel: ['Partiellement reçu', 'Partially received'],
    recu: ['Reçu', 'Received'], annule: ['Annulé', 'Cancelled'],
  };
  return fr ? map[s][0] : map[s][1];
}
