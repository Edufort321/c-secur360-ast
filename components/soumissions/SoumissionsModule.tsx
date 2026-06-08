'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Loader2, Trash2, Copy, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  getCatalogues, saveCatalogue, deleteCatalogue, setPreferredCatalogue, getSoumissions, getSoumissionFull, saveSoumissionFull,
  reviseSoumission, accepterSoumission, genererFactureDepuisSoumission, deleteSoumission,
  genSoumissionNumero, siteInitials, computeLigneMontant, computeItemTotal, computeSoumissionTotal,
  computeSoumissionHours, applyMarkup, approvalForAmount, relanceInfo,
  getSoumissionStats, catLabel, CATEGORIE_LABELS, CATEGORIES_MO,
  type CatalogueTaux, type Soumission, type SoumissionItem, type SoumissionLigne, type Categorie, type SoumissionStats,
} from '@/lib/soumissions';

type SubTab = 'liste' | 'catalogue' | 'stats';

// Module Soumissions partage : catalogue de taux (niveau admin), soumissions + tableau de bord (Projets).
// `allowed` restreint les sous-onglets visibles selon l'endroit ou il est monte.
export function SoumissionsModule({ tenant, tr, canEdit, allowed = ['liste', 'catalogue', 'stats'] }: {
  tenant: string; tr: (f: string, e: string) => string; canEdit: boolean; allowed?: SubTab[];
}) {
  const nowYear = new Date().getFullYear();
  const [sub, setSub] = useState<SubTab>(allowed[0] || 'liste');
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [stats, setStats] = useState<SoumissionStats | null>(null);
  const [soumissions, setSoumissions] = useState<Soumission[]>([]);
  const [catalogues, setCatalogues] = useState<CatalogueTaux[]>([]);
  const [loading, setLoading] = useState(true);
  const [migMissing, setMigMissing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const blankHdr = (): Soumission => ({ numero: '', revision: 1, year: nowYear, status: 'draft', total: 0, client_snapshot: {} });
  const [hdr, setHdr] = useState<Soumission>(blankHdr());
  const [items, setItems] = useState<SoumissionItem[]>([]);
  const [clientName, setClientName] = useState('');
  const [listView, setListView] = useState<'grid' | 'gallery'>('grid'); // liste soumissions : grille (défaut) / galerie
  // Recherche dynamique des clients existants (admin/clients) — comme le planner.
  const [clientSuggestions, setClientSuggestions] = useState<any[]>([]);
  const [clientSearching, setClientSearching] = useState(false);
  const clientTimer = useRef<any>(null);
  const searchClients = (text: string) => {
    clearTimeout(clientTimer.current);
    const q = (text || '').trim();
    clientTimer.current = setTimeout(async () => {
      setClientSearching(true);
      try {
        let req = supabase.from('clients').select('id, name, city, province, address').eq('tenant_id', tenant).eq('active', true).order('name').limit(q.length < 2 ? 25 : 8);
        if (q.length >= 2) req = supabase.from('clients').select('id, name, city, province, address').eq('tenant_id', tenant).eq('active', true).ilike('name', `%${q}%`).order('name').limit(8);
        const { data } = await req;
        setClientSuggestions(data || []);
      } catch { setClientSuggestions([]); }
      setClientSearching(false);
    }, q.length < 2 ? 0 : 300);
  };
  const applyClient = (c: any) => {
    setClientName(c.name);
    setHdr(h => ({ ...h, client_snapshot: { ...(h.client_snapshot || {}), name: c.name, clientId: c.id, lieu: c.address || [c.city, c.province].filter(Boolean).join(', ') || (h.client_snapshot as any)?.lieu } }));
    setClientSuggestions([]);
  };
  const [saving, setSaving] = useState(false);
  const [catForm, setCatForm] = useState<CatalogueTaux | null>(null);
  const [sitePrefix, setSitePrefix] = useState('XX'); // initiales du site de l'utilisateur, pour la numerotation
  const [globalMargin, setGlobalMargin] = useState(''); // marge % appliquée à tous les articles du catalogue
  const [numDraft, setNumDraft] = useState<Record<string, string>>({}); // texte en cours de frappe pour les champs numériques (permet . ou , et décimales)
  const [sellerId, setSellerId] = useState<string | null>(null); // vendeur = createur (pour la commission au transfert)

  const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
  // Parse un nombre en acceptant le point OU la virgule comme séparateur décimal.
  const numFR = (s: string) => { const n = Number(String(s).replace(',', '.').replace(/[^0-9.\-]/g, '')); return isNaN(n) ? 0 : n; };
  // Champ numérique robuste : garde le texte brut pendant la frappe (permet « 1.50 », « 1,5 »),
  // écrit le nombre parsé dans le modèle, et réaffiche la valeur canonique au blur.
  const numInput = (id: string, value: number, onValue: (n: number) => void, className: string) => (
    <input type="text" inputMode="decimal" className={className}
      value={numDraft[id] ?? String(value ?? 0)}
      onFocus={e => { setNumDraft(d => ({ ...d, [id]: String(value ?? 0) })); (e.target as HTMLInputElement).select(); }}
      onChange={e => { const raw = e.target.value; setNumDraft(d => ({ ...d, [id]: raw })); onValue(numFR(raw)); }}
      onBlur={() => setNumDraft(d => { const n = { ...d }; delete n[id]; return n; })} />
  );
  const inputCls = 'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800';
  const CATS: Categorie[] = ['mo_bureau', 'mo_chantier', 'voyagement', 'subsistance', 'hebergement', 'materiaux'];
  const isMO = (c: Categorie) => CATEGORIES_MO.includes(c);
  const blankLigne = (categorie: Categorie): SoumissionLigne => ({ categorie, description: '', tech: 1, reg: 0, supp: 0, maj: 0, quantity: 0, unit: '', unit_cost: 0, montant: 0 });

  // Catalogue appliqué = celui sélectionné sur la soumission, sinon le préféré, sinon le 1er.
  const cat = useMemo(() => {
    return catalogues.find(c => c.id === hdr.catalogue_id)
      || catalogues.find(c => c.preferred)
      || catalogues[0] || null;
  }, [catalogues, hdr.catalogue_id]);

  async function load() {
    setLoading(true); setMigMissing(false);
    try { const [s, c] = await Promise.all([getSoumissions(tenant), getCatalogues(tenant)]); setSoumissions(s); setCatalogues(c); }
    catch { setMigMissing(true); }
    // Resoudre le site de l'utilisateur connecte -> prefixe de numerotation (initiales du site)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: p } = await supabase.from('planner_personnel').select('id, succursale').eq('tenant_id', tenant).ilike('email', user.email).maybeSingle();
        if (p?.id) setSellerId(p.id);
        if (p?.succursale) setSitePrefix(siteInitials(p.succursale));
        else setSitePrefix(siteInitials(tenant));
      }
    } catch { /* defaut XX */ }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);
  useEffect(() => { if (sub === 'stats') getSoumissionStats(tenant).then(setStats).catch(() => setStats(null)); }, [sub, tenant]);

  async function newSoumission() {
    const numero = await genSoumissionNumero(tenant, sitePrefix);
    const def = catalogues.find(c => c.preferred) || catalogues[0] || null;
    setHdr({ ...blankHdr(), numero, seller_id: sellerId, catalogue_id: def?.id || null }); setClientName(''); setItems([{ name: 'Item 1', total: 0, lignes: [] }]); setView('edit');
  }
  async function editSoumission(s: Soumission) {
    const full = await getSoumissionFull(tenant, s.id!);
    if (!full) return;
    setHdr(full.soumission); setClientName(full.soumission.client_snapshot?.name || ''); setItems(full.items.length ? full.items : [{ name: 'Item 1', total: 0, lignes: [] }]); setView('edit');
  }
  async function save() {
    setSaving(true); setNotice(null);
    try {
      await saveSoumissionFull(tenant, { ...hdr, client_snapshot: { ...(hdr.client_snapshot || {}), name: clientName } }, items, cat);
      setNotice(tr('Soumission enregistrée.', 'Quote saved.')); await load(); setView('list');
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
    setSaving(false);
  }
  async function revise(s: Soumission) {
    setNotice(null);
    try { await reviseSoumission(tenant, s.id!); setNotice(tr('Révision créée (originale archivée).', 'Revision created (original archived).')); await load(); }
    catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }
  async function accept(s: Soumission) {
    setNotice(null);
    try { const r = await accepterSoumission(tenant, s.id!); setNotice(tr(`Soumission acceptée → projet ${r.projectNumber} créé/mis à jour.${r.commission ? ' Commission : ' + r.commission : ''}`, `Quote accepted → project ${r.projectNumber}.${r.commission ? ' Commission: ' + r.commission : ''}`)); await load(); }
    catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }
  async function facturer(s: Soumission) {
    setNotice(null);
    try { const r = await genererFactureDepuisSoumission(tenant, s.id!); setNotice(tr(`Facture ${r.numero} créée (brouillon) — voir l'onglet Factures pour la comptabiliser.`, `Invoice ${r.numero} created (draft) — see the Invoices tab.`)); }
    catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }
  async function remove(s: Soumission) {
    if (s.status === 'accepted') { setNotice(tr('Soumission acceptée : liée à un projet, non supprimable ici.', 'Accepted quote: linked to a project, not deletable here.')); return; }
    try { await deleteSoumission(tenant, s.id!); await load(); } catch (e: any) { setNotice(e?.message); }
  }

  // Operations items / lignes
  const updItem = (i: number, patch: Partial<SoumissionItem>) => setItems(p => p.map((it, j) => j === i ? { ...it, ...patch } : it));
  const addItem = () => setItems(p => [...p, { name: `Item ${p.length + 1}`, total: 0, lignes: [] }]);
  const delItem = (i: number) => setItems(p => p.filter((_, j) => j !== i));
  const addLigne = (i: number, c: Categorie) => setItems(p => p.map((it, j) => j === i ? { ...it, lignes: [...it.lignes, c === 'voyagement' ? { ...blankLigne(c), tech: 1, unit: 'km', unit_cost: Number(cat?.extras?.km) || 0 } : blankLigne(c)] } : it));
  // Ajoute une ligne pre-remplie depuis un barEme additionnel du catalogue (classe a la bonne categorie).
  const addCatalogueLigne = (i: number, c: Categorie, label: string, value: number) => setItems(p => p.map((it, j) => {
    if (j !== i) return it;
    const base = blankLigne(c);
    const filled = isMO(c) ? { ...base, description: label } : { ...base, description: label, quantity: 1, unit: tr('unité', 'unit'), unit_cost: value };
    return { ...it, lignes: [...it.lignes, filled] };
  }));
  const updLigne = (i: number, li: number, patch: Partial<SoumissionLigne>) => setItems(p => p.map((it, j) => j === i ? { ...it, lignes: it.lignes.map((l, k) => k === li ? { ...l, ...patch } : l) } : it));
  const delLigne = (i: number, li: number) => setItems(p => p.map((it, j) => j === i ? { ...it, lignes: it.lignes.filter((_, k) => k !== li) } : it));

  async function saveCat() {
    if (!catForm) return;
    setNotice(null);
    try {
      // Le repli local (lib) garantit la persistance de toutes les sections meme si une colonne manque encore en base.
      await saveCatalogue(tenant, catForm);
      setNotice(tr('Catalogue enregistré.', 'Catalogue saved.'));
      setCatForm(null);
      await load();
    }
    catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }
  // Dupliquer : ouvre le formulaire pré-rempli (sans id) pour juste mettre à jour puis enregistrer.
  function duplicateCat(c: CatalogueTaux) {
    setCatForm({ ...c, id: undefined, name: `${c.name} (copie)`, revision: (Number(c.revision) || 1) + 1, status: 'active', preferred: false });
    setNotice(tr('Copie pré-remplie : ajustez puis Enregistrer.', 'Pre-filled copy: adjust then Save.'));
  }
  async function removeCat(c: CatalogueTaux) {
    if (!c.id) return;
    if (!window.confirm(tr(`Supprimer le catalogue « ${c.name} » ?`, `Delete catalogue "${c.name}"?`))) return;
    setNotice(null);
    try { await deleteCatalogue(tenant, c.id); await load(); }
    catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }
  async function setPreferred(c: CatalogueTaux) {
    if (!c.id) return;
    setNotice(null);
    try { await setPreferredCatalogue(tenant, c.id); await load(); }
    catch (e: any) { setNotice(e?.message || tr('Erreur (migration 101 requise ?).', 'Error (migration 101 needed?).')); }
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;
  if (migMissing) return (<div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"><p className="font-semibold">{tr('Module soumissions non initialisé', 'Quotes module not initialized')}</p><p className="mt-1 text-sm">{tr('Exécutez la migration 090 dans Supabase, puis rechargez.', 'Run migration 090 in Supabase, then reload.')}</p></div>);

  const STATUS: Record<string, string> = { draft: tr('Brouillon', 'Draft'), sent: tr('Envoyée', 'Sent'), accepted: tr('Acceptée', 'Accepted'), archived: tr('Archivée', 'Archived') };
  const STATUS_COLOR: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', sent: 'bg-blue-100 text-blue-700', accepted: 'bg-emerald-100 text-emerald-700', archived: 'bg-amber-100 text-amber-700' };
  const rawTotal = computeSoumissionTotal(items, cat);
  const totals = applyMarkup(rawTotal, hdr.markup_pct); // total final (majoration + arrondi)
  const editHours = computeSoumissionHours(items);      // heures MO totales (live)
  const editAppr = approvalForAmount(cat, totals);      // niveau d'approbation requis (catalogue)
  const subTabs: [SubTab, string][] = [['liste', tr('Soumissions', 'Quotes')], ['catalogue', tr('Catalogue de taux', 'Rate catalogue')], ['stats', tr('Tableau de bord', 'Dashboard')]];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {subTabs.filter(([k]) => allowed.includes(k)).map(([k, lbl]) => (
            <button key={k} onClick={() => setSub(k)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${sub === k ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300'}`}>{lbl}</button>
          ))}
        </div>
        {sub === 'liste' && view === 'list' && canEdit && <button onClick={newSoumission} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">+ {tr('Nouvelle soumission', 'New quote')}</button>}
        {sub === 'catalogue' && canEdit && <button onClick={() => setCatForm({ name: 'Catalogue', year: nowYear, revision: 1, status: 'active', taux_mo_bureau: 0, taux_mo_chantier: 0, mult_supp: 1.5, mult_maj: 2.0 })} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">+ {tr('Nouveau catalogue', 'New catalogue')}</button>}
      </div>
      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">{notice}</div>}

      {sub === 'stats' ? (
        !stats ? (
          <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-xs text-gray-500">{tr('Taux de conversion', 'Conversion rate')}</div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">{(stats.tauxConversion * 100).toFixed(0)} %</div>
                <div className="text-xs text-gray-400">{(stats.byStatus['accepted'] || 0)} {tr('acceptée(s)', 'accepted')} / {stats.total}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-xs text-gray-500">{tr('Soumissions', 'Quotes')}</div>
                <div className="mt-1 text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-gray-400">{stats.nbProjets} {tr('projet(s) issus', 'projects created')}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-xs text-gray-500">{tr('Montant soumissionné', 'Quoted amount')}</div>
                <div className="mt-1 text-2xl font-bold">{mny(stats.montantTotal)}</div>
                <div className="text-xs text-gray-400">{tr('moy.', 'avg')} {mny(stats.valeurMoyenne)}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-xs text-gray-500">{tr('Montant accepté', 'Accepted amount')}</div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">{mny(stats.montantAccepte)}</div>
                <div className="text-xs text-gray-400">{tr('moy.', 'avg')} {mny(stats.valeurMoyenneAcceptee)}</div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-900/40">{tr('Pipeline par statut', 'Pipeline by status')}</div>
              <table className="w-full text-sm"><tbody>
                {([['draft', tr('Brouillon', 'Draft')], ['sent', tr('Envoyée', 'Sent')], ['accepted', tr('Acceptée', 'Accepted')], ['archived', tr('Archivée', 'Archived')]] as const).map(([k, lbl]) => (
                  <tr key={k} className="border-t border-gray-50 dark:border-gray-700/50">
                    <td className="px-4 py-2">{lbl}</td>
                    <td className="px-4 py-2 text-right font-medium">{stats.byStatus[k] || 0}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <p className="text-xs text-gray-400">{tr('Conversion = soumissions acceptées / total. Les projets issus proviennent des soumissions transférées (n° de projet renseigné).', 'Conversion = accepted quotes / total. Projects come from transferred quotes.')}</p>
          </div>
        )
      ) : sub === 'catalogue' ? (
        <div className="space-y-3">
          {catForm && (() => {
            const cf = catForm;
            const setLabel = (k: string, v: string) => setCatForm({ ...cf, labels: { ...(cf.labels || {}), [k]: v } });
            const setExtra = (k: string, v: number) => setCatForm({ ...cf, extras: { ...(cf.extras || {}), [k]: v } });
            // Listes auto-contenues (matériel, paliers carburant, niveaux d'approbation).
            const addList = (key: string, blank: any) => setCatForm({ ...cf, [key]: [...(((cf as any)[key]) || []), blank] });
            const updList = (key: string, i: number, patch: any) => setCatForm({ ...cf, [key]: (((cf as any)[key]) || []).map((x: any, j: number) => j === i ? { ...x, ...patch } : x) });
            const delList = (key: string, i: number) => setCatForm({ ...cf, [key]: (((cf as any)[key]) || []).filter((_: any, j: number) => j !== i) });
            // Champ de taux : libellé ÉDITABLE (propagé) + valeur.
            // NB: fonction (pas un composant <RateField/>) pour éviter le remount/perte de focus à chaque frappe.
            const rateField = (lblKey: string, defLabel: string, value: number, onValue: (n: number) => void) => (
              <div key={lblKey} className="rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                <input value={cf.labels?.[lblKey] ?? defLabel} placeholder={defLabel} onChange={e => setLabel(lblKey, e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-gray-600 outline-none dark:text-gray-300" title={tr('Libellé éditable (propagé)', 'Editable label (propagated)')} />
                {numInput(`rate_${lblKey}`, value, onValue, `mt-1 w-full ${inputCls}`)}
              </div>
            );
            return (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-xs font-semibold text-gray-500">{tr('Nom', 'Name')}<input value={cf.name} onChange={e => setCatForm({ ...cf, name: e.target.value })} className={`mt-1 w-full ${inputCls}`} /></label>
                <label className="text-xs font-semibold text-gray-500">{tr('Année', 'Year')}<input type="number" value={cf.year} onChange={e => setCatForm({ ...cf, year: Number(e.target.value) })} className={`mt-1 w-full ${inputCls}`} /></label>
                <label className="text-xs font-semibold text-gray-500">{tr('Révision', 'Revision')}<input type="number" value={cf.revision} onChange={e => setCatForm({ ...cf, revision: Number(e.target.value) })} className={`mt-1 w-full ${inputCls}`} /></label>
                <label className="text-xs font-semibold text-gray-500">{tr('Statut', 'Status')}<select value={cf.status} onChange={e => setCatForm({ ...cf, status: e.target.value as any })} className={`mt-1 w-full ${inputCls}`}><option value="active">{tr('Actif', 'Active')}</option><option value="archived">{tr('Archivé', 'Archived')}</option></select></label>
                <label className="text-xs font-semibold text-gray-500">{tr('Mult. supp.', 'OT mult.')}<input type="number" step="0.1" value={cf.mult_supp} onChange={e => setCatForm({ ...cf, mult_supp: Number(e.target.value) })} className={`mt-1 w-full ${inputCls}`} /></label>
                <label className="text-xs font-semibold text-gray-500">{tr('Mult. maj. (défaut 2)', 'Premium mult.')}<input type="number" step="0.1" value={cf.mult_maj} onChange={e => setCatForm({ ...cf, mult_maj: Number(e.target.value) })} className={`mt-1 w-full ${inputCls}`} /></label>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 sm:col-span-3">
                  <input type="checkbox" checked={!!cf.preferred} onChange={e => setCatForm({ ...cf, preferred: e.target.checked })} className="rounded" />
                  {tr('Catalogue préféré (proposé par défaut dans les soumissions)', 'Preferred catalogue (default in quotes)')}
                </label>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{tr('Barème — libellés éditables', 'Rates — editable labels')}</div>
                  <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">{tr('Chaque taux est classé par section et se retrouve dans la section correspondante de la soumission. Le changement de libellé est propagé.', 'Each rate is classified by section and appears in the matching quote section. Label changes propagate.')}</p>
                </div>

                {/* Main-d'œuvre (-> sections MO bureau / MO chantier) */}
                <div className="rounded-lg border border-gray-100 p-2 dark:border-gray-700">
                  <div className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">👷 {tr("Main-d'œuvre", 'Labor')}</div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {rateField('mo_bureau', tr('Taux MO bureau ($/h)', 'Office labor ($/h)'), cf.taux_mo_bureau, v => setCatForm({ ...cf, taux_mo_bureau: v }))}
                    {rateField('mo_chantier', tr('Taux MO chantier ($/h)', 'Field labor ($/h)'), cf.taux_mo_chantier, v => setCatForm({ ...cf, taux_mo_chantier: v }))}
                    {rateField('temps_demi', tr('Temps demi 1½ ($/h)', 'Time-and-a-half ($/h)'), cf.extras?.temps_demi || 0, v => setExtra('temps_demi', v))}
                    {rateField('temps_double', tr('Temps double 2× ($/h)', 'Double time ($/h)'), cf.extras?.temps_double || 0, v => setExtra('temps_double', v))}
                  </div>
                </div>

                {/* Voyagement (-> section Voyagement) */}
                <div className="rounded-lg border border-gray-100 p-2 dark:border-gray-700">
                  <div className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">🚚 {tr('Voyagement', 'Travel')}</div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {rateField('km', tr('Kilométrage ($/km)', 'Mileage ($/km)'), cf.extras?.km || 0, v => setExtra('km', v))}
                  </div>
                </div>

                {/* Subsistance (-> section Subsistance) */}
                <div className="rounded-lg border border-gray-100 p-2 dark:border-gray-700">
                  <div className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">🍽️ {tr('Subsistance', 'Per diem')}</div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {rateField('sub_h5', tr('Subsistance 5h ($)', 'Per diem 5h ($)'), cf.extras?.sub_h5 || 0, v => setExtra('sub_h5', v))}
                    {rateField('sub_h12', tr('Subsistance 12h ($)', 'Per diem 12h ($)'), cf.extras?.sub_h12 || 0, v => setExtra('sub_h12', v))}
                    {rateField('sub_h15', tr('Subsistance 15h ($)', 'Per diem 15h ($)'), cf.extras?.sub_h15 || 0, v => setExtra('sub_h15', v))}
                    {rateField('sub_nuitee', tr('Subsistance nuitée ($)', 'Per diem overnight ($)'), cf.extras?.sub_nuitee || 0, v => setExtra('sub_nuitee', v))}
                  </div>
                </div>

                {/* Hébergement (-> section Hébergement) */}
                <div className="rounded-lg border border-gray-100 p-2 dark:border-gray-700">
                  <div className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">🏨 {tr('Hébergement', 'Lodging')}</div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {rateField('hebergement', tr('Hébergement ($/nuit)', 'Lodging ($/night)'), cf.extras?.hebergement || 0, v => setExtra('hebergement', v))}
                  </div>
                </div>

                {/* Barèmes additionnels libres — classés par catégorie (s'injectent dans la bonne section de soumission) */}
                <div className="rounded-lg border border-dashed border-gray-200 p-2 dark:border-gray-700">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">➕ {tr('Barèmes additionnels (autres taux)', 'Additional rates (other)')}</div>
                    <button type="button" onClick={() => addList('custom_rates', { label: '', value: 0, categorie: 'mo_chantier' })} className="text-xs font-semibold text-blue-600 hover:underline">+ {tr('Barème', 'Rate')}</button>
                  </div>
                  {(cf.custom_rates || []).length > 0 && (
                    <div className="mt-1 hidden items-center gap-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:flex">
                      <span className="min-w-[8rem] flex-1">{tr('Libellé', 'Label')}</span>
                      <span className="w-40">{tr('Catégorie (section)', 'Category (section)')}</span>
                      <span className="w-24 text-right">{tr('Taux ($)', 'Rate ($)')}</span>
                      <span className="w-6" />
                    </div>
                  )}
                  {(cf.custom_rates || []).map((rrow, i) => (
                    <div key={i} className="mt-1 flex flex-wrap items-center gap-1 text-xs">
                      <input value={rrow.label} onFocus={e => (e.target as HTMLInputElement).select()} onChange={e => updList('custom_rates', i, { label: e.target.value })} placeholder={tr('Libellé', 'Label')} className={`min-w-[8rem] flex-1 ${inputCls}`} />
                      <select value={rrow.categorie || 'mo_chantier'} onChange={e => updList('custom_rates', i, { categorie: e.target.value })} className={`w-40 ${inputCls}`}>
                        {CATS.map(c => <option key={c} value={c}>{CATEGORIE_LABELS[c]}</option>)}
                      </select>
                      {numInput(`cr_${i}`, rrow.value, v => updList('custom_rates', i, { value: v }), `w-24 text-right ${inputCls}`)}
                      <button type="button" onClick={() => delList('custom_rates', i)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                    </div>
                  ))}
                  <p className="mt-1 text-[10px] text-gray-400">{tr('La colonne « Catégorie » EST l’export : chaque barème est routé vers cette section de la soumission. Aucun bouton séparé — le bouton « Enregistrer le catalogue » (bas du formulaire) sauvegarde tout (barèmes inclus).', 'The "Category" column IS the routing: each rate goes to that quote section. No separate button — "Save catalogue" (bottom of the form) persists everything, rates included.')}</p>
                </div>
              </div>

              {/* Catalogue matériel (par catalogue) */}
              <div className="mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{tr('Catalogue matériel standardisé', 'Standardized materials catalog')}</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Marge globale appliquée à tous les articles (modifiable individuellement ensuite) */}
                    <span className="text-xs text-gray-500">{tr('Marge globale', 'Global margin')}</span>
                    <input type="text" inputMode="decimal" value={globalMargin} onFocus={e => e.target.select()} onChange={e => setGlobalMargin(e.target.value)} placeholder="%" className={`w-16 text-right ${inputCls}`} />
                    <button type="button"
                      onClick={() => { const g = numFR(globalMargin); setCatForm({ ...cf, materials: (cf.materials || []).map(m => ({ ...m, margin_pct: g, sale_price: Math.round((m.cost_price || 0) * (1 + g / 100) * 100) / 100 })) }); }}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                      {tr('Appliquer à tous', 'Apply to all')}
                    </button>
                    <button type="button"
                      title={tr('Genere un code = 4 lettres de la designation + 4 chiffres chrono. Les codes deja saisis (custom) sont conserves.', 'Generate code = 4 letters of name + 4-digit sequence. Existing (custom) codes are kept.')}
                      onClick={() => {
                        const used = new Set((cf.materials || []).map(m => (m.sku || '').trim()).filter(Boolean));
                        let n = 0;
                        const mats = (cf.materials || []).map(m => {
                          if ((m.sku || '').trim()) return m; // conserver les codes custom deja saisis
                          let code: string;
                          do { n += 1; const letters = ((m.name || '').toUpperCase().replace(/[^A-Z]/g, '') + 'XXXX').slice(0, 4); code = letters + String(n).padStart(4, '0'); } while (used.has(code));
                          used.add(code);
                          return { ...m, sku: code };
                        });
                        setCatForm({ ...cf, materials: mats });
                      }}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                      {tr('Codes auto', 'Auto codes')}
                    </button>
                    <button type="button" onClick={() => addList('materials', { sku: '', name: '', cost_price: 0, margin_pct: numFR(globalMargin) || undefined, sale_price: 0 })} className="text-xs font-semibold text-blue-600 hover:underline">+ {tr('Article', 'Item')}</button>
                  </div>
                </div>
                {(cf.materials || []).length > 0 && (
                  <div className="mt-1 hidden items-center gap-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:flex">
                    <span className="w-24">{tr('Code', 'Code')}</span>
                    <span className="min-w-[8rem] flex-1">{tr('Désignation', 'Name')}</span>
                    <span className="w-24 text-right">{tr('Coûtant ($)', 'Cost ($)')}</span>
                    <span className="w-20 text-right">{tr('Marge (%)', 'Margin (%)')}</span>
                    <span className="w-24 text-right">{tr('Prix de vente ($)', 'Sale price ($)')}</span>
                    <span className="w-6" />
                  </div>
                )}
                {(cf.materials || []).map((m, i) => (
                  <div key={i} className="mt-1 flex flex-wrap items-center gap-1">
                    <input value={m.sku || ''} onFocus={e => (e.target as HTMLInputElement).select()} onChange={e => updList('materials', i, { sku: e.target.value })} placeholder={tr('Code', 'Code')} className={`w-24 ${inputCls}`} />
                    <input value={m.name} onFocus={e => (e.target as HTMLInputElement).select()} onChange={e => updList('materials', i, { name: e.target.value })} placeholder={tr('Désignation', 'Name')} className={`min-w-[8rem] flex-1 ${inputCls}`} />
                    {/* Coûtant : recalcule la vente à partir de la marge si une marge est définie */}
                    {numInput(`mat_${i}_cost`, m.cost_price ?? 0, cost => { const mg = m.margin_pct; updList('materials', i, mg != null ? { cost_price: cost, sale_price: Math.round(cost * (1 + mg / 100) * 100) / 100 } : { cost_price: cost }); }, `w-24 text-right ${inputCls}`)}
                    {/* Marge % désirée -> calcule le prix de vente */}
                    {numInput(`mat_${i}_margin`, m.margin_pct ?? 0, mg => { const cost = m.cost_price || 0; updList('materials', i, { margin_pct: mg, sale_price: Math.round(cost * (1 + mg / 100) * 100) / 100 }); }, `w-20 text-right ${inputCls}`)}
                    {/* Prix de vente : si une marge est définie -> calcule le COÛTANT ; sinon -> calcule la marge */}
                    {numInput(`mat_${i}_sale`, m.sale_price ?? 0, sale => { const mg = m.margin_pct;
                      if (mg != null) updList('materials', i, { sale_price: sale, cost_price: Math.round((sale / (1 + mg / 100)) * 100) / 100 });
                      else { const cost = m.cost_price || 0; updList('materials', i, { sale_price: sale, margin_pct: cost > 0 ? Math.round(((sale / cost) - 1) * 1000) / 10 : m.margin_pct }); }
                    }, `w-24 text-right ${inputCls}`)}
                    <button type="button" onClick={() => delList('materials', i)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              {/* Surcharge carburant (paliers + prix courant) */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{tr('Surcharge carburant', 'Fuel surcharge')}</div>
                  <button type="button" onClick={() => addList('fuel_tiers', { price: 0, surcharge_pct: 0 })} className="text-xs font-semibold text-blue-600 hover:underline">+ {tr('Palier', 'Tier')}</button>
                </div>
                <label className="mt-1 inline-flex items-center gap-2 text-xs text-gray-500">{tr('Prix courant / de base ($/L)', 'Current / base price ($/L)')}
                  {numInput('fuel_price', cf.extras?.fuel_price || 0, v => setExtra('fuel_price', v), `w-24 text-right ${inputCls}`)}
                </label>
                {(cf.fuel_tiers || []).length > 0 && (
                  <div className="mt-1 hidden items-center gap-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:flex">
                    <span className="w-24 text-right">{tr("Palier d'augmentation ($/L)", 'Increase tier ($/L)')}</span>
                    <span className="w-20 text-right">{tr('% de plus', '% more')}</span>
                    <span className="w-6" />
                  </div>
                )}
                {(cf.fuel_tiers || []).map((t, i) => (
                  <div key={i} className="mt-1 flex flex-wrap items-center gap-1 text-xs">
                    {numInput(`tier_${i}_price`, t.price, v => updList('fuel_tiers', i, { price: v }), `w-24 text-right ${inputCls}`)}
                    <span className="text-gray-400">→</span>
                    {numInput(`tier_${i}_pct`, t.surcharge_pct, v => updList('fuel_tiers', i, { surcharge_pct: v }), `w-20 text-right ${inputCls}`)}<span className="text-gray-400">%</span>
                    <button type="button" onClick={() => delList('fuel_tiers', i)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>

              {/* Niveaux d'approbation des soumissions */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{tr("Niveaux d'approbation", 'Approval levels')}</div>
                  <button type="button" onClick={() => addList('approval_levels', { level_name: '', max_amount: 0, approver_label: '', color: 'blue' })} className="text-xs font-semibold text-blue-600 hover:underline">+ {tr('Niveau', 'Level')}</button>
                </div>
                {(cf.approval_levels || []).length > 0 && (
                  <div className="mt-1 hidden items-center gap-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:flex">
                    <span className="w-32">{tr('Niveau', 'Level')}</span>
                    <span className="min-w-[8rem] flex-1">{tr('Approbateur', 'Approver')}</span>
                    <span className="w-28 text-right">{tr('Montant max ($)', 'Max amount ($)')}</span>
                    <span className="w-6" />
                  </div>
                )}
                {(cf.approval_levels || []).map((a, i) => (
                  <div key={i} className="mt-1 flex flex-wrap items-center gap-1 text-xs">
                    <input value={a.level_name} onFocus={e => (e.target as HTMLInputElement).select()} onChange={e => updList('approval_levels', i, { level_name: e.target.value })} placeholder={tr('Niveau', 'Level')} className={`w-32 ${inputCls}`} />
                    <input value={a.approver_label || ''} onFocus={e => (e.target as HTMLInputElement).select()} onChange={e => updList('approval_levels', i, { approver_label: e.target.value })} placeholder={tr('Approbateur', 'Approver')} className={`min-w-[8rem] flex-1 ${inputCls}`} />
                    {numInput(`appr_${i}_max`, a.max_amount, v => updList('approval_levels', i, { max_amount: v }), `w-28 text-right ${inputCls}`)}
                    <button type="button" onClick={() => delList('approval_levels', i)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => setCatForm(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">{tr('Annuler', 'Cancel')}</button>
                <button onClick={saveCat} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{tr('Enregistrer', 'Save')}</button>
              </div>
            </div>
            );
          })()}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <table className="mobile-cards w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400"><th className="px-4 py-2">{tr('Nom', 'Name')}</th><th className="px-4">{tr('Année', 'Year')}</th><th className="px-4">{tr('Rév.', 'Rev.')}</th><th className="px-4 text-right">{tr('MO bureau', 'Office')}</th><th className="px-4 text-right">{tr('MO chantier', 'Field')}</th><th className="px-4">Supp/Maj</th><th className="px-4">{tr('Statut', 'Status')}</th><th className="px-4"></th></tr></thead>
              <tbody>
                {catalogues.map(c => (
                  <tr key={c.id} className="border-t border-gray-50 dark:border-gray-700/50">
                    <td className="px-4 py-2" data-label={tr('Nom', 'Name')}>{c.name}</td>
                    <td className="px-4 py-2" data-label={tr('Année', 'Year')}>{c.year}</td>
                    <td className="px-4 py-2" data-label={tr('Rév.', 'Rev.')}>{c.revision}</td>
                    <td className="px-4 py-2 text-right" data-label={tr('MO bureau', 'Office')}>{mny(c.taux_mo_bureau)}</td>
                    <td className="px-4 py-2 text-right" data-label={tr('MO chantier', 'Field')}>{mny(c.taux_mo_chantier)}</td>
                    <td className="px-4 py-2" data-label="Supp/Maj">×{c.mult_supp} / ×{c.mult_maj}</td>
                    <td className="px-4 py-2" data-label={tr('Statut', 'Status')}>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.status === 'active' ? tr('Actif', 'Active') : tr('Archivé', 'Archived')}</span>
                      {c.preferred && <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700"><Star size={11} className="fill-blue-700" /> {tr('Préféré', 'Preferred')}</span>}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {canEdit && (
                        <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
                          {!c.preferred && <button onClick={() => setPreferred(c)} title={tr('Définir comme préféré', 'Set as preferred')} className="inline-flex items-center gap-0.5 text-blue-600 hover:underline"><Star size={13} /> {tr('Préférer', 'Prefer')}</button>}
                          <button onClick={() => setCatForm(c)} className="text-blue-600 hover:underline">{tr('Éditer', 'Edit')}</button>
                          <button onClick={() => duplicateCat(c)} className="inline-flex items-center gap-0.5 text-indigo-600 hover:underline"><Copy size={13} /> {tr('Dupliquer', 'Duplicate')}</button>
                          <button onClick={() => removeCat(c)} className="inline-flex items-center gap-0.5 text-red-500 hover:underline"><Trash2 size={13} /> {tr('Suppr.', 'Del.')}</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {catalogues.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">{tr('Aucun catalogue. Créez-en un pour tarifer les soumissions.', 'No catalogue yet.')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : view === 'edit' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="grid gap-3 sm:grid-cols-4">
              <label className="text-xs font-semibold text-gray-500">{tr('N° soumission', 'Quote #')}<input value={hdr.numero} onChange={e => setHdr(h => ({ ...h, numero: e.target.value }))} className={`mt-1 w-full ${inputCls}`} /></label>
              <label className="relative text-xs font-semibold text-gray-500 sm:col-span-2">
                {tr('Client', 'Client')}{clientSearching && <span className="ml-2 font-normal text-gray-400">{tr('Recherche…', 'Searching…')}</span>}
                <input value={clientName}
                  onChange={e => { setClientName(e.target.value); setHdr(h => ({ ...h, client_snapshot: { ...(h.client_snapshot || {}), name: e.target.value } })); searchClients(e.target.value); }}
                  onFocus={() => searchClients(clientName)}
                  onBlur={() => setTimeout(() => setClientSuggestions([]), 200)}
                  placeholder={tr('Nom du client…', 'Client name…')} autoComplete="off"
                  className={`mt-1 w-full ${inputCls}`} />
                {clientSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                    {clientSuggestions.map(c => (
                      <button key={c.id} type="button" onMouseDown={() => applyClient(c)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <span className="font-medium text-gray-800 dark:text-gray-100">{c.name}</span>
                        {(c.city || c.province) && <span className="ml-auto text-xs text-gray-400">{[c.city, c.province].filter(Boolean).join(', ')}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </label>
              <label className="text-xs font-semibold text-gray-500">{tr('Année', 'Year')}<input type="number" value={hdr.year || nowYear} onChange={e => setHdr(h => ({ ...h, year: Number(e.target.value) }))} className={`mt-1 w-full ${inputCls}`} /></label>
              <label className="text-xs font-semibold text-gray-500">{tr('Catalogue de taux', 'Rate catalogue')}
                <select value={hdr.catalogue_id || ''} onChange={e => setHdr(h => ({ ...h, catalogue_id: e.target.value || null }))} className={`mt-1 w-full ${inputCls}`}>
                  {catalogues.length === 0 && <option value="">{tr('— Aucun catalogue —', '— No catalogue —')}</option>}
                  {catalogues.map(c => (
                    <option key={c.id} value={c.id}>{c.preferred ? '★ ' : ''}{c.name} · {c.year} rév.{c.revision}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-gray-500">{tr('Statut de suivi', 'Tracking status')}
                <select value={hdr.status || 'draft'} onChange={e => setHdr(h => ({ ...h, status: e.target.value as any }))} className={`mt-1 w-full ${inputCls}`}>
                  <option value="draft">{tr('Brouillon', 'Draft')}</option>
                  <option value="sent">{tr('Transmise au client (relance 30 j)', 'Sent to client (30-day follow-up)')}</option>
                  <option value="accepted">{tr('Acceptée → Projet', 'Accepted → Project')}</option>
                  <option value="archived">{tr('Fermée / archivée', 'Closed / archived')}</option>
                </select>
              </label>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {cat ? tr(`Tarification : ${cat.name} ${cat.year} rév.${cat.revision} (MO bureau ${mny(cat.taux_mo_bureau)}/h, chantier ${mny(cat.taux_mo_chantier)}/h)`, `Pricing: ${cat.name} ${cat.year}`) : <span className="text-amber-600">{tr('⚠ Aucun catalogue actif pour cette année — montants MO à 0. Créez un catalogue.', '⚠ No active catalogue for this year.')}</span>}
            </div>
          </div>

          {/* Liste deroulante alimentee par le catalogue materiel standardise (lignes Materiaux) */}
          <datalist id="cat-materials">
            {(cat?.materials || []).map((m, mi) => (
              <option key={mi} value={m.name}>{m.sku ? `${m.sku} - ` : ''}{mny(m.sale_price ?? m.cost_price ?? 0)}</option>
            ))}
          </datalist>

          {items.map((it, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-900/40">
                <input value={it.name} onChange={e => updItem(i, { name: e.target.value })} className={`font-semibold ${inputCls}`} />
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{mny(computeItemTotal(it, cat))}</span>
                  {canEdit && <button onClick={() => delItem(i)} className="text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>}
                </div>
              </div>
              <div className="space-y-3 p-3">
                {CATS.map(c => {
                  const lignes = it.lignes.map((l, li) => ({ l, li })).filter(x => x.l.categorie === c);
                  if (lignes.length === 0 && !canEdit) return null;
                  return (
                    <div key={c} className="rounded-lg border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                        <span>{catLabel(cat, c === 'voyagement' ? 'km' : c, CATEGORIE_LABELS[c])}</span>
                        {canEdit && <button onClick={() => addLigne(i, c)} className="text-blue-600 hover:underline">+ {tr('Ligne', 'Line')}</button>}
                      </div>
                      {/* Barèmes additionnels du catalogue classés dans CETTE section : clic = ligne pré-remplie */}
                      {canEdit && (cat?.custom_rates || []).filter(r => (r.categorie || 'mo_chantier') === c).length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 px-3 py-1.5 dark:border-gray-700">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{tr('Du catalogue', 'From catalogue')} :</span>
                          {(cat?.custom_rates || []).filter(r => (r.categorie || 'mo_chantier') === c).map((r, ri) => (
                            <button key={ri} type="button" onClick={() => addCatalogueLigne(i, c, r.label, r.value)}
                              className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              + {r.label || tr('barème', 'rate')}{r.value ? ` (${mny(r.value)})` : ''}
                            </button>
                          ))}
                        </div>
                      )}
                      {lignes.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead><tr className="text-left text-gray-400">
                              <th className="px-2 py-1">Description</th>
                              {isMO(c) ? (<><th className="px-2">Tech</th><th className="px-2">Rég</th><th className="px-2">Supp</th><th className="px-2">Maj</th></>) : c === 'voyagement' ? (<><th className="px-2">{tr('Véhicules', 'Vehicles')}</th><th className="px-2">Km</th><th className="px-2">{tr('Taux/km', 'Rate/km')}</th></>) : (<><th className="px-2">Qté</th><th className="px-2">Unité</th><th className="px-2">Coût</th></>)}
                              <th className="px-2 text-right">Montant</th><th className="px-2"></th>
                            </tr></thead>
                            <tbody>
                              {lignes.map(({ l, li }) => (
                                <tr key={li} className="border-t border-gray-50 dark:border-gray-700/50">
                                  <td className="px-2 py-1">
                                    <input
                                      value={l.description || ''}
                                      list={c === 'materiaux' ? 'cat-materials' : undefined}
                                      placeholder={c === 'materiaux' ? tr('Choisir / saisir un matériel…', 'Pick / type a material…') : undefined}
                                      onChange={e => {
                                        const val = e.target.value;
                                        if (c === 'materiaux') {
                                          const mat = (cat?.materials || []).find(m => m.name === val);
                                          if (mat) { const price = mat.sale_price ?? mat.cost_price ?? 0; updLigne(i, li, { description: val, unit_cost: price, unit: l.unit || tr('unité', 'unit'), quantity: l.quantity || 1 }); return; }
                                        }
                                        updLigne(i, li, { description: val });
                                      }}
                                      className={`w-full ${inputCls}`}
                                    />
                                  </td>
                                  {isMO(c) ? (
                                    <>
                                      <td className="px-2"><input type="number" value={l.tech} onChange={e => updLigne(i, li, { tech: Number(e.target.value) })} className={`w-16 text-right ${inputCls}`} /></td>
                                      <td className="px-2"><input type="number" value={l.reg} onChange={e => updLigne(i, li, { reg: Number(e.target.value) })} className={`w-16 text-right ${inputCls}`} /></td>
                                      <td className="px-2"><input type="number" value={l.supp} onChange={e => updLigne(i, li, { supp: Number(e.target.value) })} className={`w-16 text-right ${inputCls}`} /></td>
                                      <td className="px-2"><input type="number" value={l.maj} onChange={e => updLigne(i, li, { maj: Number(e.target.value) })} className={`w-16 text-right ${inputCls}`} /></td>
                                    </>
                                  ) : c === 'voyagement' ? (
                                    <>
                                      {/* Voyagement : nb véhicules × km × taux/km (taux pré-rempli depuis le catalogue) */}
                                      <td className="px-2"><input type="number" min={1} value={l.tech} onChange={e => updLigne(i, li, { tech: Number(e.target.value) })} className={`w-20 text-right ${inputCls}`} /></td>
                                      <td className="px-2"><input type="number" value={l.quantity} onChange={e => updLigne(i, li, { quantity: Number(e.target.value) })} className={`w-20 text-right ${inputCls}`} placeholder="km" /></td>
                                      <td className="px-2"><input type="number" step="0.01" value={l.unit_cost} onChange={e => updLigne(i, li, { unit_cost: Number(e.target.value) })} className={`w-20 text-right ${inputCls}`} title={tr('Taux $/km (catalogue)', 'Rate $/km (catalogue)')} /></td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="px-2"><input type="number" value={l.quantity} onChange={e => updLigne(i, li, { quantity: Number(e.target.value) })} className={`w-20 text-right ${inputCls}`} /></td>
                                      <td className="px-2"><input value={l.unit || ''} onChange={e => updLigne(i, li, { unit: e.target.value })} className={`w-16 ${inputCls}`} /></td>
                                      <td className="px-2"><input type="number" value={l.unit_cost} onChange={e => updLigne(i, li, { unit_cost: Number(e.target.value) })} className={`w-24 text-right ${inputCls}`} /></td>
                                    </>
                                  )}
                                  <td className="px-2 text-right font-medium">{mny(computeLigneMontant(l, cat))}</td>
                                  <td className="px-2 text-right">{canEdit && <button onClick={() => delLigne(i, li)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {canEdit && <button onClick={addItem} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-blue-600 dark:border-gray-700">+ {tr('Ajouter un item', 'Add item')}</button>}

          {/* Mini-dashboard + Majoration / arrondi du prix */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-2 text-center dark:bg-blue-900/20"><div className="text-xl font-bold text-blue-700 dark:text-blue-300">{editHours || 0}</div><div className="text-[10px] text-blue-600/80">{tr('heures MO', 'labor hours')}</div></div>
              <div className="rounded-lg bg-slate-50 p-2 text-center dark:bg-slate-900/30"><div className="text-sm font-bold text-slate-700 dark:text-slate-200">{mny(rawTotal)}</div><div className="text-[10px] text-slate-500">{tr('sous-total', 'subtotal')}</div></div>
              <div className="rounded-lg bg-emerald-50 p-2 text-center dark:bg-emerald-900/20"><div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">{mny(totals)}</div><div className="text-[10px] text-emerald-600/80">{tr('total final', 'final total')}</div></div>
              <div className="rounded-lg p-2 text-center" style={{ background: editAppr ? (editAppr.color || '#64748b') + '18' : undefined }}>
                <div className="text-sm font-bold" style={{ color: editAppr?.color || '#64748b' }}>{editAppr ? editAppr.level_name : '—'}</div>
                <div className="text-[10px] text-gray-400">{tr('approbation', 'approval')}{editAppr?.approver_label ? ` · ${editAppr.approver_label}` : ''}</div>
              </div>
            </div>
            {canEdit && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
                <span className="text-xs font-semibold text-gray-500">{tr('Majoration / arrondi', 'Markup / rounding')} :</span>
                <input type="number" step="0.5" value={hdr.markup_pct ?? 0} onChange={e => setHdr(h => ({ ...h, markup_pct: Number(e.target.value) || 0 }))} className={`w-20 text-right ${inputCls}`} />
                <span className="text-xs text-gray-400">%</span>
                <button type="button" onClick={() => setHdr(h => ({ ...h, markup_pct: 10 }))} className="rounded-lg border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-800">+10 %</button>
                <button type="button" onClick={() => setHdr(h => ({ ...h, markup_pct: 0 }))} className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-700">0 %</button>
                <span className="ml-auto text-[11px] text-gray-400">{tr('Total arrondi au dollar', 'Total rounded to the dollar')}</span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setView('list')} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">{tr('Retour', 'Back')}</button>
            {canEdit && <button onClick={save} disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40">{saving ? <Loader2 size={15} className="inline animate-spin" /> : tr('Enregistrer', 'Save')}</button>}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Bascule Grille / Galerie */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">{soumissions.length} {tr('soumission(s)', 'quote(s)')}</span>
            <div className="flex items-center rounded-lg border border-gray-200 p-0.5 text-xs dark:border-gray-600">
              <button onClick={() => setListView('grid')} className={`rounded-md px-2 py-1 font-semibold ${listView === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{tr('Grille', 'Grid')}</button>
              <button onClick={() => setListView('gallery')} className={`rounded-md px-2 py-1 font-semibold ${listView === 'gallery' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{tr('Galerie', 'Gallery')}</button>
            </div>
          </div>

          {soumissions.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">{tr('Aucune soumission.', 'No quote yet.')}</div>
          ) : (
            <div className={listView === 'gallery' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : 'space-y-2'}>
              {soumissions.map(s => {
                const sc = catalogues.find(c => c.id === s.catalogue_id) || cat;
                const appr = approvalForAmount(sc, Number(s.total) || 0);
                const ri = relanceInfo(s);
                const hours = Number(s.total_hours) || 0;
                const statusBadge = <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[s.status]}`}>{STATUS[s.status]}</span>;
                const relanceBadge = ri.needsRelance ? <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">⏰ {tr('Relance requise', 'Follow-up due')} ({ri.sinceSentDays} j)</span> : null;
                const apprBadge = appr ? <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: (appr.color || '#64748b') + '22', color: appr.color || '#64748b' }} title={tr('Niveau d\'approbation', 'Approval level')}>✓ {appr.level_name}</span> : null;
                const actions = canEdit && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <button onClick={() => editSoumission(s)} className="font-semibold text-blue-600 hover:underline">{tr('Éditer', 'Edit')}</button>
                    {s.status !== 'archived' && <button onClick={() => revise(s)} className="text-indigo-600 hover:underline">{tr('Réviser', 'Revise')}</button>}
                    {s.status !== 'accepted' && s.status !== 'archived' && <button onClick={() => accept(s)} className="text-emerald-600 hover:underline">{tr('Accepter → Projet', 'Accept → Project')}</button>}
                    {s.status === 'accepted' && <button onClick={() => facturer(s)} className="text-violet-600 hover:underline">{tr('Facturer', 'Invoice')}</button>}
                    <button onClick={() => remove(s)} className="text-red-500 hover:underline">{tr('Suppr.', 'Del.')}</button>
                  </div>
                );

                if (listView === 'grid') {
                  // GRILLE = une LIGNE COMPLÈTE par soumission, avec mini-dashboard inline.
                  return (
                    <div key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800">
                      <div className="min-w-[160px] flex-1">
                        <div className="font-mono text-[11px] text-gray-400">{s.numero}{s.revision > 1 ? ` · rév. ${s.revision}` : ''}</div>
                        <div className="truncate font-bold text-gray-900 dark:text-white">{s.client_snapshot?.name || '—'}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span title={tr('Heures MO', 'Labor hours')}><b className="text-gray-800 dark:text-gray-200">{hours || '—'}</b> h</span>
                        <span title={tr('Soumissionné depuis', 'Quoted since')}>{ri.ageDays != null ? `${ri.ageDays} j` : '—'}</span>
                        {statusBadge}{relanceBadge}{apprBadge}
                      </div>
                      <div className="ml-auto text-lg font-extrabold text-gray-900 dark:text-white">{mny(s.total)}</div>
                      {actions}
                    </div>
                  );
                }

                // GALERIE = carte + mini-dashboard.
                return (
                  <div key={s.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-gray-400">{s.numero}{s.revision > 1 ? ` · rév. ${s.revision}` : ''}</div>
                        <div className="truncate font-bold text-gray-900 dark:text-white">{s.client_snapshot?.name || '—'}</div>
                      </div>
                      {statusBadge}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20"><div className="text-lg font-bold text-blue-700 dark:text-blue-300">{hours || '—'}</div><div className="text-[10px] text-blue-600/80">{tr('heures', 'hours')}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-900/30"><div className="text-lg font-bold text-slate-700 dark:text-slate-200">{ri.ageDays != null ? ri.ageDays : '—'}</div><div className="text-[10px] text-slate-500">{tr('jours', 'days')}</div></div>
                      <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/20"><div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{mny(s.total)}</div><div className="text-[10px] text-emerald-600/80">{tr('total', 'total')}</div></div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">{relanceBadge}{apprBadge}</div>
                    {canEdit && <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-700">{actions}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SoumissionsModule;
