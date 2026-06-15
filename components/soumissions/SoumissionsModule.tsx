'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Loader2, Trash2, Copy, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  getCatalogues, saveCatalogue, deleteCatalogue, setPreferredCatalogue, getSoumissions, getSoumissionFull, saveSoumissionFull,
  reviseSoumission, accepterSoumission, genererFactureDepuisSoumission, deleteSoumission,
  genSoumissionNumero, siteInitials, computeLigneMontant, computeItemTotal, computeSoumissionTotal,
  computeSoumissionHours, applyMarkup, approvalForAmount, relanceInfo, hoursByCategory,
  getSoumissionStats, catLabel, CATEGORIE_LABELS, CATEGORIES_MO,
  getSoumissionSettings, saveSoumissionSettings,
  getSoumissionTemplates, saveSoumissionTemplate, deleteSoumissionTemplate,
  getSoumissionAttachments, uploadSoumissionAttachment, deleteSoumissionAttachment,
  type CatalogueTaux, type Soumission, type SoumissionItem, type SoumissionLigne, type Categorie, type SoumissionStats, type SoumissionSettings, type ConditionItem, type SoumissionTemplate, type SoumissionAttachment,
} from '@/lib/soumissions';
import { exportSoumissionPdf } from '@/lib/soumissions/pdf';
import { frLongDate } from '@/lib/pdf/letterhead';

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
  // Calculateur de ressources : durée des travaux + couverture -> personnel/véhicules/subsistances.
  const [planDays, setPlanDays] = useState(5);
  const [planHoursPerDay, setPlanHoursPerDay] = useState(8); // heures par QUART (max réaliste / personne)
  const [plan2424, setPlan2424] = useState(false);           // couverture 24/24 -> fait apparaître « nombre de quarts »
  const [planShifts, setPlanShifts] = useState(3);           // nombre de quarts / jour (24/24 = 3 × 8 h)
  const [planPerVehicle, setPlanPerVehicle] = useState(4);   // personnes par véhicule
  const [inclBureau, setInclBureau] = useState(true);        // inclure MO Bureau dans le calcul ressources
  const [inclChantier, setInclChantier] = useState(true);    // inclure MO Chantier dans le calcul ressources
  const [tab, setTab] = useState<'sommaire' | number>('sommaire'); // navigation édition : Sommaire ou item #i
  // Cascade Site -> Département (Administration) pour le PRÉFIXE du numéro (1re lettre de chaque niveau).
  const [sitesTree, setSitesTree] = useState<any[]>([]);
  const [companyLetter, setCompanyLetter] = useState('X'); // 1re lettre du tenant
  const [selSiteId, setSelSiteId] = useState('');
  const [selDeptId, setSelDeptId] = useState('');
  // Export PDF (façon DGA) : Sommaire + items à inclure ; logo tenant.
  const [expSummary, setExpSummary] = useState(true);
  const [expExcluded, setExpExcluded] = useState<number[]>([]); // items décochés
  const [pdfBusy, setPdfBusy] = useState(false);
  // Lettre de présentation (style DGA) — paramètres tenant + champs éditables à l'export.
  const [coverCfg, setCoverCfg] = useState<SoumissionSettings | null>(null);
  const [inclCover, setInclCover] = useState(false);
  const [coverTo, setCoverTo] = useState('');     // nom du destinataire (éditable)
  const [coverDate, setCoverDate] = useState(''); // date (défaut aujourd'hui, éditable)
  const [breakdownMode, setBreakdownMode] = useState<'detaille' | 'par_item' | 'global_desc'>('detaille');
  const [inclTaux, setInclTaux] = useState(false); // joindre la liste de taux (catalogue)
  const [condSel, setCondSel] = useState<string[]>([]); // ids des conditions cochées à l'export
  const [matMarge, setMatMarge] = useState(20); // marge à normaliser pour Matériaux/sous-traitance (%)
  useEffect(() => { getSoumissionSettings(tenant).then(setCoverCfg).catch(() => {}); }, [tenant]);
  useEffect(() => {
    setCoverDate(frLongDate(new Date(), coverCfg?.cover_letter?.ville));
    if (coverCfg?.default_breakdown_mode) setBreakdownMode(coverCfg.default_breakdown_mode);
    setCondSel((coverCfg?.conditions || []).filter(c => c.defaut_coche).map(c => c.id));
  }, [coverCfg]);
  // Gabarits de soumission (tâches récurrentes)
  const [templates, setTemplates] = useState<SoumissionTemplate[]>([]);
  const reloadTemplates = () => getSoumissionTemplates(tenant).then(setTemplates).catch(() => {});
  useEffect(() => { reloadTemplates(); }, [tenant]); // eslint-disable-line react-hooks/exhaustive-deps
  // Pièces jointes PDF (bibliothèque réutilisable) + sélection à l'export
  const [attachLib, setAttachLib] = useState<SoumissionAttachment[]>([]);
  const [attachSel, setAttachSel] = useState<string[]>([]);
  const [attachBusy, setAttachBusy] = useState(false);
  const reloadAttach = () => getSoumissionAttachments(tenant).then(setAttachLib).catch(() => {});
  useEffect(() => { reloadAttach(); }, [tenant]); // eslint-disable-line react-hooks/exhaustive-deps
  const uploadAttach = async (file?: File | null) => {
    if (!file) return; setAttachBusy(true);
    try { const { error } = await uploadSoumissionAttachment(tenant, file); if (error) setNotice(tr('Erreur (migration 179 appliquée ?) : ', 'Error (migration 179 applied?): ') + (error.message || error)); else reloadAttach(); }
    finally { setAttachBusy(false); }
  };
  const [logoUrl, setLogoUrl] = useState('/c-secur360-logo.png');
  const [companyName, setCompanyName] = useState('');
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
  const [personnel, setPersonnel] = useState<any[]>([]); // liste pour le champ « Vendeur »
  const [meId, setMeId] = useState<string | null>(null); // mon planner_personnel.id (pour droits d'approbation)
  const [meApprovalMax, setMeApprovalMax] = useState<number | null>(null); // montant max que je peux approuver (poste)

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
    // Liste du personnel pour le champ « Vendeur » (best-effort).
    try { const { data: pl } = await supabase.from('planner_personnel').select('id, name, email, current_grid_id').eq('tenant_id', tenant).order('name'); setPersonnel(pl || []); } catch { /* ignore */ }
    // Prefixe de numerotation = 1re lettre du TENANT + 1re lettre du SITE + 1re lettre du DEPARTEMENT.
    // Source = Administration (planner_succursales : Site -> Departement). Ex. CERDIA / Sherbrooke /
    // Bourque -> « CSB ». Sans departement -> « CS ». Numero : CSB26001S / CSB26001P.
    const firstAlpha = (s: string) => (String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z]/g, '')[0] || '').toUpperCase();
    let companyName = tenant;
    try { const { data: cs } = await supabase.from('company_settings').select('legal_name, logo_url').eq('tenant_id', tenant).maybeSingle(); if (cs?.legal_name) { companyName = cs.legal_name; setCompanyName(cs.legal_name); } if (cs?.logo_url) setLogoUrl(cs.logo_url); } catch { /* defaut */ }
    // 1re lettre du TENANT — toujours disponible (ne depend PAS de l'authentification).
    const tLetter = firstAlpha(companyName) || firstAlpha(tenant) || 'X';
    setCompanyLetter(tLetter);
    // Arbre des sites (Administration) — charge TOUJOURS pour que la cascade Site->Departement soit dispo,
    // meme sans session/poste resolu (sinon le prefixe restait fige a « XX »).
    let siteList: any[] = [];
    try { const { data: sucs } = await supabase.from('planner_succursales').select('id, name, parent_id').eq('tenant_id', tenant).order('name'); siteList = sucs || []; setSitesTree(siteList); } catch { /* admin indisponible */ }
    const byId = new Map(siteList.map((x: any) => [x.id, x]));
    const norm = (v: string) => String(v || '').trim().toLowerCase();
    let siteName = '', deptName = '', gotSel = false;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: p } = await supabase.from('planner_personnel').select('id, succursale, current_grid_id').eq('tenant_id', tenant).ilike('email', user.email).maybeSingle();
        if (p?.id) { setSellerId(p.id); setMeId(p.id); }
        // Resout le SITE et le DEPARTEMENT du poste de l'utilisateur dans l'arbre Administration.
        const mine = siteList.find((x: any) => norm(x.name) === norm(p?.succursale || '')) // correspondance exacte
          || siteList.find((x: any) => p?.succursale && norm(p.succursale).includes(norm(x.name)) && x.parent_id); // dept inclus dans la chaine
        if (mine) {
          if (mine.parent_id && byId.get(mine.parent_id)) { siteName = (byId.get(mine.parent_id) as any).name; deptName = mine.name; setSelSiteId(mine.parent_id); setSelDeptId(mine.id); gotSel = true; }
          else { siteName = mine.name; setSelSiteId(mine.id); gotSel = true; } // site sans departement
        }
        if (!siteName && p?.succursale) { const w = String(p.succursale).normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/).filter(Boolean); siteName = w[0] || ''; deptName = w[1] || ''; }
        // Montant max que CE poste peut approuver (colonne approval_max_amount sur la grille — facultative).
        // Mon plafond d'approbation via la route SERVEUR (grille salariale fermée à l'anon).
        try { const mg = await fetch('/api/hr/salary-grid?me=1', { credentials: 'include' }).then(r => r.ok ? r.json() : {}).catch(() => ({})); if ((mg as any)?.approvalMax != null) setMeApprovalMax(Number((mg as any).approvalMax) || 0); } catch { /* ignore */ }
      }
    } catch { /* pas de session : on garde au moins le prefixe tenant */ }
    // Repli : aucun site resolu via le poste -> 1er site de l'arbre (la cascade reste modifiable a la creation).
    if (!gotSel) { const s0 = siteList.find((x: any) => !x.parent_id); if (s0) { setSelSiteId(s0.id); siteName = siteName || s0.name; } }
    const px = (tLetter + firstAlpha(siteName) + (deptName ? firstAlpha(deptName) : ''));
    setSitePrefix(px || tLetter || 'XX'); // jamais « XX » des qu'on a la lettre du tenant ; pas de longueur max
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);
  useEffect(() => { if (sub === 'stats') getSoumissionStats(tenant).then(setStats).catch(() => setStats(null)); }, [sub, tenant]);

  // Pré-remplissage depuis le module RAPPORTS : un rapport a transmis des anomalies/recommandations
  // à chiffrer (sessionStorage). Une fois le chargement terminé, on ouvre une NOUVELLE soumission
  // avec un item par anomalie sélectionnée, rattachée au projet/client du rapport.
  const prefillDone = useRef(false);
  useEffect(() => {
    if (loading || prefillDone.current || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('prefill') !== 'rapport') return;
    let draft: any = null;
    try { draft = JSON.parse(window.sessionStorage.getItem('cs_soum_prefill_v1') || 'null'); } catch { draft = null; }
    prefillDone.current = true;
    // nettoie l'URL et le brouillon (one-shot)
    url.searchParams.delete('prefill'); window.history.replaceState({}, '', url.pathname + url.search);
    try { window.sessionStorage.removeItem('cs_soum_prefill_v1'); } catch { /* ignore */ }
    if (!draft || !Array.isArray(draft.items) || draft.items.length === 0) return;
    (async () => {
      const px = (selSiteId ? prefixFromSel(selSiteId, selDeptId) : sitePrefix) || sitePrefix || companyLetter || 'XX';
      let numero = ''; try { numero = await genSoumissionNumero(tenant, px); } catch { numero = ''; }
      const def = catalogues.find(c => c.preferred) || catalogues[0] || null;
      const cn = draft.clientName || '';
      setHdr({
        ...blankHdr(), numero, seller_id: sellerId, catalogue_id: def?.id || null,
        project_id: draft.projectId || null,
        notes: `${tr('Depuis le rapport', 'From report')}: ${draft.reportTitle || draft.reportId || ''}`.trim(),
        client_snapshot: { name: cn, lieu: '', source_report_id: draft.reportId || '', projet: draft.projectNumber || '' },
      });
      setClientName(cn);
      setItems(draft.items.map((it: any, i: number) => ({
        name: it.name || `Item ${i + 1}`, total: 0,
        lignes: [{ ...blankLigne('mo_chantier'), description: it.description || it.name || '' }],
      })));
      setSub('liste'); setView('edit');
      setNotice(tr(`Soumission pré-remplie depuis le rapport (${draft.items.length} item(s) à chiffrer).`, `Quote pre-filled from the report (${draft.items.length} item(s) to price).`));
    })();
    /* eslint-disable-next-line */
  }, [loading]);

  async function newSoumission() {
    const px = (selSiteId ? prefixFromSel(selSiteId, selDeptId) : sitePrefix) || sitePrefix || companyLetter || 'XX';
    const numero = await genSoumissionNumero(tenant, px);
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
      autoSig.current = JSON.stringify({ hdr, items, clientName });
      setNotice(tr('Soumission enregistrée.', 'Quote saved.')); await load(); setView('list');
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
    setSaving(false);
  }

  // ── Auto-enregistrement BROUILLON : sauve SILENCIEUSEMENT (debounce + en quittant l'édition).
  // Brouillon seulement (n'écrase jamais une soumission transmise/acceptée) ; capte l'id du nouveau
  // brouillon pour éviter les doublons ; pas de brouillon vide.
  const autoSig = useRef('');
  const autoTimer = useRef<any>(null);
  const autosaveDraft = async () => {
    if (view !== 'edit') return;
    if (hdr.status && hdr.status !== 'draft') return;
    const hasContent = !!(clientName.trim() || items.some(it => (it.lignes || []).length || (it.name && it.name !== 'Item 1')));
    if (!hdr.id && !hasContent) return;
    const sig = JSON.stringify({ hdr, items, clientName });
    if (sig === autoSig.current) return;
    try {
      const newId = await saveSoumissionFull(tenant, { ...hdr, status: hdr.status || 'draft', client_snapshot: { ...(hdr.client_snapshot || {}), name: clientName } }, items, cat);
      autoSig.current = sig;
      if (newId && !hdr.id) setHdr(h => ({ ...h, id: newId }));
    } catch { /* silencieux */ }
  };
  const autosaveRef = useRef(autosaveDraft); autosaveRef.current = autosaveDraft;
  // Debounce sur les changements pendant l'édition.
  useEffect(() => {
    if (view !== 'edit') return;
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => { autosaveRef.current(); }, 1800);
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [hdr, items, clientName, view]); // eslint-disable-line react-hooks/exhaustive-deps
  // Flush quand on QUITTE l'édition (bouton Retour) ou au démontage (on sort de la page).
  const prevView = useRef(view);
  useEffect(() => { if (prevView.current === 'edit' && view !== 'edit') autosaveRef.current(); prevView.current = view; }, [view]);
  useEffect(() => () => { autosaveRef.current(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function revise(s: Soumission) {
    setNotice(null);
    try { await reviseSoumission(tenant, s.id!); setNotice(tr('Révision créée (originale archivée).', 'Revision created (original archived).')); await load(); }
    catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }
  async function accept(s: Soumission) {
    setNotice(null);
    // BLOCAGE : si un niveau d'approbation est requis (catalogue), la soumission DOIT être approuvée avant l'acceptation.
    const scat = catalogues.find(c => c.id === s.catalogue_id) || cat;
    const reqLevel = approvalForAmount(scat, Number(s.total) || 0);
    if (reqLevel && !(s as any).approved_by) {
      setNotice(tr(`⛔ Approbation de niveau requise avant d'accepter (${reqLevel.level_name}${reqLevel.approver_label ? ' — ' + reqLevel.approver_label : ''}). Ouvre la soumission, fais approuver, puis enregistre.`, `⛔ Level approval required before accepting (${reqLevel.level_name}). Open the quote, get it approved, then save.`));
      return;
    }
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
  const addLigne = (i: number, c: Categorie) => setItems(p => p.map((it, j) => j === i ? { ...it, lignes: [...it.lignes, c === 'voyagement' ? { ...blankLigne(c), tech: 1, unit: 'km', unit_cost: Number(cat?.extras?.km) || 0 } : c === 'materiaux' ? { ...blankLigne(c), quantity: 1, maj: matMarge } : blankLigne(c)] } : it));
  // Ajoute une ligne pre-remplie depuis un barEme additionnel du catalogue (classe a la bonne categorie).
  const addCatalogueLigne = (i: number, c: Categorie, label: string, value: number) => setItems(p => p.map((it, j) => {
    if (j !== i) return it;
    const base = blankLigne(c);
    const filled = isMO(c) ? { ...base, description: label } : { ...base, description: label, quantity: 1, unit: tr('unité', 'unit'), unit_cost: value };
    return { ...it, lignes: [...it.lignes, filled] };
  }));
  const updLigne = (i: number, li: number, patch: Partial<SoumissionLigne>) => setItems(p => p.map((it, j) => j === i ? { ...it, lignes: it.lignes.map((l, k) => k === li ? { ...l, ...patch } : l) } : it));
  const delLigne = (i: number, li: number) => setItems(p => p.map((it, j) => j === i ? { ...it, lignes: it.lignes.filter((_, k) => k !== li) } : it));

  // ── Gabarits de soumission : charger la STRUCTURE (sans id, prix à ajuster) / enregistrer la courante ──
  const applyTemplate = (tpl: SoumissionTemplate) => {
    const its = (tpl.data?.items || []).map(it => ({ name: it.name, total: Number(it.total) || 0, year: it.year, lignes: (it.lignes || []).map(({ id, ...l }: any) => ({ ...l })) }));
    setItems(its.length ? its : [{ name: 'Item 1', total: 0, lignes: [] }]);
    if (tpl.data?.breakdown_mode) setBreakdownMode(tpl.data.breakdown_mode as any);
    setNotice(tr('Gabarit chargé : ajustez les prix.', 'Template loaded: adjust the prices.'));
  };
  const saveAsTemplate = async () => {
    const name = window.prompt(tr('Nom du gabarit :', 'Template name:'), (hdr as any).title || hdr.numero || '');
    if (!name) return;
    const cleanItems = items.map(it => ({ name: it.name, total: it.total, year: it.year, lignes: (it.lignes || []).map(({ id, ...l }: any) => ({ ...l })) }));
    const { error } = await saveSoumissionTemplate(tenant, name, { items: cleanItems as any, breakdown_mode: breakdownMode, notes: hdr.notes || '' });
    if (error) setNotice(tr('Erreur (migration 179 appliquée ?) : ', 'Error (migration 179 applied?): ') + (error.message || error));
    else { setNotice(tr('Gabarit enregistré.', 'Template saved.')); reloadTemplates(); }
  };
  const removeTemplate = async (id?: string) => {
    if (!id || !window.confirm(tr('Supprimer ce gabarit ?', 'Delete this template?'))) return;
    await deleteSoumissionTemplate(tenant, id); reloadTemplates();
  };

  // ── Préfixe du numéro = 1re lettre de chaque sélection (tenant + site + département), sans longueur max ──
  const firstAlpha = (s: string) => (String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z]/g, '')[0] || '').toUpperCase();
  const siteNameOf = (id: string) => sitesTree.find((x: any) => x.id === id)?.name || '';
  const sitesOnly = sitesTree.filter((x: any) => !x.parent_id);
  const deptsOf = (siteId: string) => sitesTree.filter((x: any) => x.parent_id === siteId);
  const prefixFromSel = (siteId: string, deptId: string) => (companyLetter + firstAlpha(siteNameOf(siteId)) + (deptId ? firstAlpha(siteNameOf(deptId)) : '')) || 'XX';
  // Change Site/Département -> recalcule le préfixe et régénère le numéro (brouillon non transféré).
  const applySiteDept = async (siteId: string, deptId: string) => {
    setSelSiteId(siteId); setSelDeptId(deptId);
    const px = prefixFromSel(siteId, deptId);
    setSitePrefix(px);
    if (!hdr.project_id) { try { const num = await genSoumissionNumero(tenant, px); setHdr(h => ({ ...h, numero: num })); } catch { /* ignore */ } }
  };

  // Export PDF (Sommaire + items cochés) avec logo, et partage par lien.
  const doExportPdf = async () => {
    if (pdfBusy) return; setPdfBusy(true);
    try {
      const idxs = items.map((_, i) => i).filter(i => !expExcluded.includes(i));
      // Lettre de présentation (optionnelle) : pré-remplie depuis les paramètres tenant + le client.
      const cl = coverCfg?.cover_letter || {};
      const coverLetter = inclCover ? {
        ville: cl.ville,
        date: coverDate || frLongDate(new Date(), cl.ville),
        destinataire: [coverTo, clientName, hdr.client_snapshot?.lieu].filter(Boolean) as string[],
        objet: (hdr as any).title || (hdr as any).objet || undefined,
        votreClient: (hdr.client_snapshot as any)?.votre_client || undefined,
        notreDossier: hdr.numero || undefined,
        numero: hdr.numero || undefined,
        body: cl.body,
        salutation: cl.salutation,
        signataireNom: cl.signataire_nom,
        signataireTitre: cl.signataire_titre,
        signatureUrl: cl.signature_url || null,
        companyName,
      } : null;
      await exportSoumissionPdf({ ...hdr, client_snapshot: { ...(hdr.client_snapshot || {}), name: clientName } } as Soumission, items, {
        cat, logoUrl, companyName, includeSummary: expSummary, coverLetter, breakdownMode, includeTaux: inclTaux,
        conditions: (coverCfg?.conditions || []).filter(c => condSel.includes(c.id)).map(c => ({ titre: c.titre, contenu: c.contenu })),
        attachments: attachLib.filter(a => a.id && attachSel.includes(a.id) && a.file_url).map(a => ({ url: a.file_url!, filename: a.filename })),
        itemIndexes: idxs.length === items.length ? null : idxs, filename: `${hdr.numero || 'soumission'}.pdf`,
      });
    } catch (e: any) { setNotice(tr('Export PDF impossible : ', 'PDF export failed: ') + (e?.message || e)); }
    finally { setPdfBusy(false); }
  };
  const copyShareLink = async () => {
    const url = `${window.location.origin}/${tenant}/projects/soumissions?id=${hdr.id || ''}`;
    try { await navigator.clipboard.writeText(url); setNotice(tr('Lien de la soumission copié.', 'Quote link copied.')); }
    catch { window.prompt(tr('Copie ce lien :', 'Copy this link:'), url); }
  };
  // Transmettre au client pour APPROBATION : lien tokenisé -> page publique où le client approuve/signe.
  const transmitForApproval = async () => {
    if (!hdr.id) { setNotice(tr("Enregistre la soumission d'abord.", 'Save the quote first.')); return; }
    try {
      const r = await fetch('/api/documents/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ docType: 'soumission', docId: hdr.id, docNumber: hdr.numero }) });
      const j = await r.json();
      if (!r.ok) { setNotice(j.error || tr('Erreur (migration 180 appliquée ?)', 'Error (migration 180 applied?)')); return; }
      try { await navigator.clipboard.writeText(j.url); setNotice(tr("Lien d'approbation client copié : ", 'Client approval link copied: ') + j.url); }
      catch { window.prompt(tr("Lien d'approbation client :", 'Client approval link:'), j.url); }
    } catch { setNotice(tr('Erreur réseau.', 'Network error.')); }
  };

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
  const editHoursByCat = hoursByCategory(items);        // heures live ventilées Bureau / Chantier
  const planCap = Math.max(1, (Number(planDays) || 1) * (Number(planHoursPerDay) || 1)); // h dispo / personne
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
          {/* Paramètres de présentation : lettre de présentation + conditions & modalités (modèle tenant) */}
          {canEdit && (() => {
            const cl = coverCfg?.cover_letter || {};
            const conds: ConditionItem[] = coverCfg?.conditions || [];
            const base = (): SoumissionSettings => coverCfg || { cover_letter: {}, conditions: [], default_breakdown_mode: 'detaille' };
            const setCL = (patch: any) => setCoverCfg({ ...base(), cover_letter: { ...(base().cover_letter || {}), ...patch } });
            const setConds = (next: ConditionItem[]) => setCoverCfg({ ...base(), conditions: next });
            const newId = () => 'c' + Math.random().toString(36).slice(2, 9);
            const inp = 'w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700';
            return (
              <details className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <summary className="cursor-pointer text-sm font-bold text-gray-700 dark:text-gray-200">⚙️ {tr('Paramètres de présentation (lettre + conditions)', 'Presentation settings (cover letter + terms)')}</summary>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <label className="text-xs text-gray-600 dark:text-gray-300">{tr('Ville (lettre)', 'City (letter)')}<input className={`mt-1 ${inp}`} value={cl.ville || ''} onChange={e => setCL({ ville: e.target.value })} placeholder="Sherbrooke" /></label>
                  <label className="text-xs text-gray-600 dark:text-gray-300">{tr('Signataire — nom', 'Signatory — name')}<input className={`mt-1 ${inp}`} value={cl.signataire_nom || ''} onChange={e => setCL({ signataire_nom: e.target.value })} /></label>
                  <label className="text-xs text-gray-600 dark:text-gray-300">{tr('Signataire — titre', 'Signatory — title')}<input className={`mt-1 ${inp}`} value={cl.signataire_titre || ''} onChange={e => setCL({ signataire_titre: e.target.value })} /></label>
                </div>
                <label className="mt-2 block text-xs text-gray-600 dark:text-gray-300">{tr('Corps (canevas de la lettre)', 'Body (letter template)')}<textarea rows={5} className={`mt-1 ${inp}`} value={cl.body || ''} onChange={e => setCL({ body: e.target.value })} /></label>
                <label className="mt-2 block text-xs text-gray-600 dark:text-gray-300">{tr('Salutation', 'Closing')}<input className={`mt-1 ${inp}`} value={cl.salutation || ''} onChange={e => setCL({ salutation: e.target.value })} /></label>
                <label className="mt-2 block text-xs text-gray-600 dark:text-gray-300">{tr('URL signature (image, optionnel)', 'Signature image URL (optional)')}<input className={`mt-1 ${inp}`} value={cl.signature_url || ''} onChange={e => setCL({ signature_url: e.target.value })} /></label>

                <div className="mt-4 mb-1 text-xs font-bold text-gray-600 dark:text-gray-300">📑 {tr('Conditions et modalités (cochables à l\'export)', 'Terms & conditions (selectable at export)')}</div>
                <div className="space-y-2">
                  {conds.map((c, i) => (
                    <div key={c.id} className="rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <input className={inp} value={c.titre} placeholder={tr('Titre', 'Title')} onChange={e => setConds(conds.map((x, k) => k === i ? { ...x, titre: e.target.value } : x))} />
                        <label className="flex items-center gap-1 whitespace-nowrap text-[11px] text-gray-500"><input type="checkbox" checked={!!c.defaut_coche} onChange={e => setConds(conds.map((x, k) => k === i ? { ...x, defaut_coche: e.target.checked } : x))} /> {tr('par défaut', 'default')}</label>
                        <button type="button" onClick={() => setConds(conds.filter((_, k) => k !== i))} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                      </div>
                      <textarea rows={2} className={`mt-1 ${inp}`} value={c.contenu} placeholder={tr('Contenu', 'Content')} onChange={e => setConds(conds.map((x, k) => k === i ? { ...x, contenu: e.target.value } : x))} />
                    </div>
                  ))}
                  <button type="button" onClick={() => setConds([...conds, { id: newId(), titre: '', contenu: '', defaut_coche: false }])} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">+ {tr('Ajouter une condition', 'Add a term')}</button>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <label className="text-xs text-gray-600 dark:text-gray-300">{tr('Ventilation par défaut', 'Default breakdown')} :
                    <select value={coverCfg?.default_breakdown_mode || 'detaille'} onChange={e => setCoverCfg({ ...base(), default_breakdown_mode: e.target.value as any })} className="ml-1 rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700">
                      <option value="detaille">{tr('Tout détaillé', 'Fully detailed')}</option>
                      <option value="par_item">{tr('Prix par item', 'Price per item')}</option>
                      <option value="global_desc">{tr('Prix global + descriptions', 'Global + descriptions')}</option>
                    </select>
                  </label>
                  <button type="button" onClick={async () => {
                    const { error } = await saveSoumissionSettings(tenant, { cover_letter: coverCfg?.cover_letter, conditions: coverCfg?.conditions, default_breakdown_mode: coverCfg?.default_breakdown_mode });
                    setNotice(error ? (tr('Erreur (migration 179 appliquée ?) : ', 'Error (migration 179 applied?): ') + (error.message || error)) : tr('Paramètres de présentation enregistrés.', 'Presentation settings saved.'));
                  }} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">{tr('Enregistrer les paramètres', 'Save settings')}</button>
                </div>
              </details>
            );
          })()}
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
          {/* Gabarits de soumission : charger une structure récurrente (on n'ajuste que les prix) / enregistrer la courante */}
          {canEdit && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3 text-sm dark:border-indigo-800 dark:bg-indigo-900/20">
              <span className="font-bold text-gray-700 dark:text-gray-200">🧩 {tr('Gabarits', 'Templates')}</span>
              <select value="" onChange={e => { const t = templates.find(x => x.id === e.target.value); if (t) applyTemplate(t); }} className={`${inputCls} max-w-[16rem]`}>
                <option value="">{templates.length ? tr('— Charger un gabarit —', '— Load a template —') : tr('(aucun gabarit)', '(no template)')}</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button type="button" onClick={saveAsTemplate} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-white dark:border-gray-600 dark:text-gray-300">💾 {tr('Enregistrer comme gabarit', 'Save as template')}</button>
              {templates.length > 0 && (
                <span className="flex flex-wrap items-center gap-1 text-[11px] text-gray-400">
                  {templates.map(t => <button key={t.id} type="button" onClick={() => removeTemplate(t.id)} className="inline-flex items-center gap-0.5 rounded border border-gray-200 px-1.5 py-0.5 hover:text-red-600 dark:border-gray-700" title={tr('Supprimer', 'Delete')}>{t.name} <Trash2 size={10} /></button>)}
                </span>
              )}
            </div>
          )}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="grid gap-3 sm:grid-cols-4">
              <label className="text-xs font-semibold text-gray-500">{tr('N° soumission', 'Quote #')}<input value={hdr.numero} onChange={e => setHdr(h => ({ ...h, numero: e.target.value }))} className={`mt-1 w-full ${inputCls}`} /></label>
              {sitesOnly.length > 0 && (
                <label className="text-xs font-semibold text-gray-500">{tr('Site (préfixe n°)', 'Site (number prefix)')}
                  <select value={selSiteId} onChange={e => applySiteDept(e.target.value, '')} className={`mt-1 w-full ${inputCls}`}>
                    <option value="">{tr('— Site —', '— Site —')}</option>
                    {sitesOnly.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
              )}
              {selSiteId && deptsOf(selSiteId).length > 0 && (
                <label className="text-xs font-semibold text-gray-500">{tr('Département', 'Department')}
                  <select value={selDeptId} onChange={e => applySiteDept(selSiteId, e.target.value)} className={`mt-1 w-full ${inputCls}`}>
                    <option value="">{tr('— Aucun —', '— None —')}</option>
                    {deptsOf(selSiteId).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </label>
              )}
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
              <label className="text-xs font-semibold text-gray-500 sm:col-span-2">{tr('Titre / Nom du mandat', 'Title / Mandate name')}
                <input value={hdr.client_snapshot?.projet || ''} onChange={e => setHdr(h => ({ ...h, client_snapshot: { ...(h.client_snapshot || {}), projet: e.target.value } }))} placeholder={tr('Ex. Arrêt planifié 2026 (sinon le n° de soumission)', 'e.g. Planned shutdown 2026 (else the quote #)')} className={`mt-1 w-full ${inputCls}`} />
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
              <label className="text-xs font-semibold text-gray-500 sm:col-span-2">{tr('Vendeur (commission au transfert)', 'Seller (commission on transfer)')}
                <select value={hdr.seller_id || ''} onChange={e => setHdr(h => ({ ...h, seller_id: e.target.value || null }))} className={`mt-1 w-full ${inputCls}`}>
                  <option value="">{tr('— Aucun —', '— None —')}</option>
                  {personnel.map(p => <option key={p.id} value={p.id}>{p.name || p.email}{p.id === meId ? tr(' (moi)', ' (me)') : ''}</option>)}
                </select>
                <span className="mt-0.5 block text-[10px] font-normal text-gray-400">{tr('La commission de vente est créditée selon sa grille salariale quand la soumission devient une VENTE.', 'Sales commission is credited per their salary grid when the quote becomes a SALE.')}</span>
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

          {/* Navigation : Sommaire + un onglet par item + « + Item » (chaque item = sa page) */}
          <div className="flex flex-wrap items-center gap-1 overflow-x-auto border-b border-gray-200 pb-2 dark:border-gray-700">
            <button type="button" onClick={() => setTab('sommaire')} className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === 'sommaire' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>📋 {tr('Sommaire', 'Summary')}</button>
            {items.map((it, i) => (
              <button key={i} type="button" onClick={() => setTab(i)} className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === i ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{it.name || `Item ${i + 1}`}</button>
            ))}
            {canEdit && <button type="button" onClick={() => { const ni = items.length; addItem(); setTab(ni); }} className="shrink-0 rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-800">+ {tr('Item', 'Item')}</button>}
          </div>

          {/* ===== TOUJOURS AU-DESSUS DES ITEMS : mini-dashboard global + majoration + calculateur ===== */}
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
          {/* Calculateur intelligent de ressources (cases Inclure/Exclure MO Bureau / Chantier) */}
          {(() => {
            const pBureau = inclBureau && editHoursByCat.bureau > 0 ? Math.ceil(editHoursByCat.bureau / planCap) : 0;
            const pChantier = inclChantier && editHoursByCat.chantier > 0 ? Math.ceil(editHoursByCat.chantier / planCap) : 0;
            const resPeople = pBureau + pChantier; // personnes retenues pour les ressources (total distinct)
            const shifts = plan2424 ? Math.max(1, Number(planShifts) || 1) : 1;
            const perShift = Math.ceil(pChantier / shifts); // personnes simultanées par quart (chantier)
            const vehicules = resPeople > 0 ? Math.ceil(resPeople / Math.max(1, Number(planPerVehicle) || 1)) : 0;
            const repasJours = resPeople * (Number(planDays) || 0);
            const nuitees = resPeople * (Number(planDays) || 0);
            return (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-800 dark:bg-indigo-900/10">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-indigo-700 dark:text-indigo-300">🧮 {tr('Calculateur de ressources', 'Resource calculator')}</div>
                <div className="flex flex-wrap items-end gap-3">
                  <label className="text-xs font-semibold text-gray-500">{tr('Durée (jours)', 'Duration (days)')}<input type="number" min={1} value={planDays} onChange={e => setPlanDays(Number(e.target.value) || 1)} className={`mt-1 w-20 ${inputCls}`} /></label>
                  <label className="text-xs font-semibold text-gray-500">{tr('Heures / quart', 'Hours / shift')}<input type="number" min={1} max={12} value={planHoursPerDay} onChange={e => setPlanHoursPerDay(Number(e.target.value) || 1)} className={`mt-1 w-20 ${inputCls}`} /></label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600"><input type="checkbox" checked={plan2424} onChange={e => { setPlan2424(e.target.checked); if (e.target.checked) setPlanShifts(Math.max(1, Math.round(24 / (Number(planHoursPerDay) || 8)))); }} /> {tr('Couverture 24/24', '24/7 coverage')}</label>
                  {plan2424 && (
                    <label className="text-xs font-semibold text-indigo-600">{tr('Nombre de quarts', 'Number of shifts')}<input type="number" min={1} max={4} value={planShifts} onChange={e => setPlanShifts(Math.max(1, Number(e.target.value) || 1))} className={`mt-1 w-20 ${inputCls}`} /></label>
                  )}
                  <label className="text-xs font-semibold text-gray-500">{tr('Pers. / véhicule', 'People / vehicle')}<input type="number" min={1} value={planPerVehicle} onChange={e => setPlanPerVehicle(Number(e.target.value) || 1)} className={`mt-1 w-20 ${inputCls}`} /></label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600"><input type="checkbox" checked={inclBureau} onChange={e => setInclBureau(e.target.checked)} /> {tr('Inclure Bureau', 'Include Office')}</label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600"><input type="checkbox" checked={inclChantier} onChange={e => setInclChantier(e.target.checked)} /> {tr('Inclure Chantier', 'Include Field')}</label>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                  <div className={`rounded-lg bg-blue-50 p-2 text-center dark:bg-blue-900/20 ${inclBureau ? '' : 'opacity-40'}`}><div className="text-xl font-extrabold text-blue-700 dark:text-blue-300">{editHoursByCat.bureau} h</div><div className="text-[10px] text-gray-500">{tr('MO Bureau', 'Office labor')}</div></div>
                  <div className={`rounded-lg bg-amber-50 p-2 text-center dark:bg-amber-900/20 ${inclChantier ? '' : 'opacity-40'}`}><div className="text-xl font-extrabold text-amber-700 dark:text-amber-300">{editHoursByCat.chantier} h</div><div className="text-[10px] text-gray-500">{tr('MO Chantier', 'Field labor')}</div></div>
                  <div className={`rounded-lg bg-blue-50 p-2 text-center dark:bg-blue-900/20 ${inclBureau ? '' : 'opacity-40'}`}><div className="text-xl font-extrabold text-blue-700 dark:text-blue-300">{pBureau}</div><div className="text-[10px] text-gray-500">{tr('Pers. bureau', 'Office people')}</div></div>
                  <div className={`rounded-lg bg-amber-50 p-2 text-center dark:bg-amber-900/20 ${inclChantier ? '' : 'opacity-40'}`}><div className="text-xl font-extrabold text-amber-700 dark:text-amber-300">{pChantier}</div><div className="text-[10px] text-gray-500">{tr('Pers. chantier', 'Field people')}</div></div>
                  <div className="rounded-lg bg-emerald-50 p-2 text-center dark:bg-emerald-900/20"><div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">{vehicules}</div><div className="text-[10px] text-gray-500">{tr('Véhicules', 'Vehicles')}</div></div>
                  <div className="rounded-lg bg-purple-50 p-2 text-center dark:bg-purple-900/20"><div className="text-xl font-extrabold text-purple-700 dark:text-purple-300">{repasJours}</div><div className="text-[10px] text-gray-500">{tr('Subsistances (repas-j)', 'Meals (per-day)')}</div></div>
                  <div className="rounded-lg bg-rose-50 p-2 text-center dark:bg-rose-900/20"><div className="text-xl font-extrabold text-rose-700 dark:text-rose-300">{nuitees}</div><div className="text-[10px] text-gray-500">{tr('Hébergement (nuitées)', 'Lodging (nights)')}</div></div>
                </div>
                {plan2424 && pChantier > 0 && (
                  <div className="mt-2 rounded-lg bg-indigo-100/60 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    🕐 {tr('24/24', '24/7')} : {pChantier} {tr('personnes au total réparties sur', 'people total across')} {shifts} {tr('quarts', 'shifts')} → ≈ {perShift} {tr('personnes / quart', 'people / shift')}.
                  </div>
                )}
                <p className="mt-2 text-[11px] text-gray-400">{tr('Personnes (total) = heures ÷ (jours × heures par QUART). Le total sert aux véhicules/subsistances/hébergement ; en 24/24 il se répartit sur les quarts (≈ personnes/quart).', 'People (total) = hours ÷ (days × hours per SHIFT). Total feeds vehicles/meals/lodging; with 24/7 it splits across shifts (≈ people/shift).')}</p>
              </div>
            );
          })()}

          {/* ===== Vendeurs (partage de commission) + Approbation de niveau ===== */}
          {(() => {
            const split = hdr.sellers_split || [];
            const splitSum = split.reduce((s, x) => s + (Number(x.pct) || 0), 0);
            const canApprove = canEdit && (meApprovalMax == null || meApprovalMax <= 0 || totals <= meApprovalMax);
            const approverName = hdr.approved_by ? (personnel.find(p => p.id === hdr.approved_by)?.name || tr('approuvée', 'approved')) : '';
            return (
              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold">👥 {tr('Vendeurs & approbation', 'Sellers & approval')}</span>
                  {editAppr && <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: (editAppr.color || '#64748b') + '22', color: editAppr.color || '#64748b' }}>{tr('Niveau requis', 'Required level')} : {editAppr.level_name}{editAppr.approver_label ? ` (${editAppr.approver_label})` : ''}</span>}
                </div>

                {/* Partage de commission (2-3 vendeurs). Vide = 100 % au vendeur principal du haut. */}
                <div className="mt-2">
                  <div className="mb-1 text-xs font-semibold text-gray-500">{tr('Partage de commission (optionnel)', 'Commission split (optional)')}</div>
                  {split.map((sp, idx) => (
                    <div key={idx} className="mb-1 flex items-center gap-2">
                      <select value={sp.seller_id} onChange={e => setHdr(h => ({ ...h, sellers_split: (h.sellers_split || []).map((x, i) => i === idx ? { ...x, seller_id: e.target.value } : x) }))} className={`flex-1 ${inputCls}`}>
                        <option value="">{tr('— Vendeur —', '— Seller —')}</option>
                        {personnel.map(p => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
                      </select>
                      <input type="number" min={0} max={100} value={sp.pct} onChange={e => setHdr(h => ({ ...h, sellers_split: (h.sellers_split || []).map((x, i) => i === idx ? { ...x, pct: Number(e.target.value) || 0 } : x) }))} className={`w-20 text-right ${inputCls}`} />
                      <span className="text-xs text-gray-400">%</span>
                      <button type="button" onClick={() => setHdr(h => ({ ...h, sellers_split: (h.sellers_split || []).filter((_, i) => i !== idx) }))} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  {canEdit && split.length < 3 && (
                    <button type="button" onClick={() => setHdr(h => ({ ...h, sellers_split: [...(h.sellers_split || []), { seller_id: h.seller_id || '', pct: split.length === 0 ? 100 : 0 }] }))} className="text-xs font-semibold text-blue-600 hover:underline">+ {tr('Ajouter un vendeur', 'Add a seller')}</button>
                  )}
                  {split.length > 0 && <span className={`ml-3 text-xs font-semibold ${splitSum === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{tr('Somme', 'Sum')} : {splitSum} %{splitSum !== 100 ? tr(' (≠ 100 %)', ' (≠ 100%)') : ''}</span>}
                  <p className="mt-1 text-[11px] text-gray-400">{tr('Vide = 100 % au vendeur principal. Sinon, chacun touche sa commission sur SA part, à SON % de grille, à la vente.', 'Empty = 100% to the primary seller. Otherwise each gets commission on their share, at their own grid %, on sale.')}</p>
                </div>

                {/* Approbation de niveau (selon le plafond du poste) */}
                {canEdit && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
                    {hdr.approved_by ? (
                      <>
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">✅ {tr('Approuvée par', 'Approved by')} {approverName}{hdr.approved_at ? ` · ${String(hdr.approved_at).slice(0, 10)}` : ''}</span>
                        <button type="button" onClick={() => setHdr(h => ({ ...h, approved_by: null, approved_at: null }))} className="text-xs text-gray-400 hover:underline">{tr('Retirer', 'Remove')}</button>
                      </>
                    ) : canApprove ? (
                      <button type="button" onClick={() => { setHdr(h => ({ ...h, approved_by: meId, approved_at: new Date().toISOString() })); setNotice(tr('Approuvée — enregistre pour confirmer.', 'Approved — save to confirm.')); }}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">✓ {tr('Approuver', 'Approve')}</button>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600">⛔ {tr('Au-dessus de ton plafond d\'approbation', 'Above your approval limit')}{meApprovalMax ? ` (${mny(meApprovalMax)})` : ''} — {tr('escalade requise', 'escalation required')}</span>
                    )}
                    <button type="button" onClick={() => { const n = window.prompt(tr('Note de révision :', 'Revision note:'), hdr.approval_note || ''); if (n != null) { setHdr(h => ({ ...h, approval_note: n, status: 'draft', approved_by: null, approved_at: null })); setNotice(tr('Révision demandée — enregistre.', 'Revision requested — save.')); } }}
                      className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-700">✎ {tr('Demander une révision', 'Request revision')}</button>
                    {hdr.approval_note && <span className="text-[11px] italic text-gray-500">« {hdr.approval_note} »</span>}
                  </div>
                )}
              </div>
            );
          })()}

          {tab === 'sommaire' && (
          /* SOMMAIRE GLOBAL PAR ITEM : toutes les colonnes ; une colonne vide = 0 $ */
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gray-100 text-left text-gray-500 dark:border-gray-700">
                <th className="px-3 py-2">{tr('Item', 'Item')}</th>
                {CATS.map(c => <th key={c} className="px-2 text-right">{catLabel(cat, c === 'voyagement' ? 'km' : c, CATEGORIE_LABELS[c])}</th>)}
                <th className="px-2 text-right">{tr('Heures', 'Hours')}</th>
                <th className="px-3 text-right">{tr('Total', 'Total')}</th>
              </tr></thead>
              <tbody>
                {items.map((it, i) => {
                  const ih = hoursByCategory([it]);
                  const catTotal = (c: Categorie) => (it.lignes || []).filter(l => l.categorie === c).reduce((s, l) => s + computeLigneMontant(l, cat), 0);
                  return (
                    <tr key={i} onClick={() => setTab(i)} className="cursor-pointer border-t border-gray-50 hover:bg-blue-50/50 dark:border-gray-700/50 dark:hover:bg-blue-900/10">
                      <td className="px-3 py-2 font-semibold text-blue-600">{it.name || `Item ${i + 1}`}</td>
                      {CATS.map(c => <td key={c} className="px-2 text-right">{mny(catTotal(c))}</td>)}
                      <td className="px-2 text-right">{ih.total} h</td>
                      <td className="px-3 text-right font-bold">{mny(computeItemTotal(it, cat))}</td>
                    </tr>
                  );
                })}
                {items.length === 0 && <tr><td colSpan={CATS.length + 3} className="px-3 py-6 text-center text-gray-400">{tr('Aucun item. Clique « + Item ».', 'No item. Click "+ Item".')}</td></tr>}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-bold dark:border-gray-600">
                  <td className="px-3 py-2">{tr('Total', 'Total')}</td>
                  {CATS.map(c => <td key={c} className="px-2 text-right">{mny(items.reduce((s, it) => s + (it.lignes || []).filter(l => l.categorie === c).reduce((ss, l) => ss + computeLigneMontant(l, cat), 0), 0))}</td>)}
                  <td className="px-2 text-right">{editHours} h</td>
                  <td className="px-3 text-right text-emerald-700 dark:text-emerald-300">{mny(rawTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          )}

          {/* Export PDF (façon DGA : cases à cocher) + partage par lien — onglet Sommaire */}
          {tab === 'sommaire' && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-sm font-bold">📄 {tr('Export PDF / partage', 'PDF export / share')}</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <label className="flex items-center gap-1.5 font-semibold text-gray-600"><input type="checkbox" checked={expSummary} onChange={e => setExpSummary(e.target.checked)} /> {tr('Sommaire', 'Summary')}</label>
                {items.map((it, i) => (
                  <label key={i} className="flex items-center gap-1.5 text-gray-600"><input type="checkbox" checked={!expExcluded.includes(i)} onChange={e => setExpExcluded(prev => e.target.checked ? prev.filter(x => x !== i) : [...prev, i])} /> {it.name || `Item ${i + 1}`}</label>
                ))}
              </div>

              {/* Lettre de présentation (page de tête, style DGA) */}
              <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-800 dark:bg-indigo-900/20">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  <input type="checkbox" checked={inclCover} onChange={e => setInclCover(e.target.checked)} />
                  ✉️ {tr('Joindre une lettre de présentation', 'Attach a cover letter')}
                </label>
                {inclCover && (
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="text-xs text-gray-600 dark:text-gray-300">{tr('Destinataire (nom)', 'Recipient (name)')}
                      <input value={coverTo} onChange={e => setCoverTo(e.target.value)} placeholder={tr('Ex. Madame Marie-Ève Bédard', 'E.g. Ms. Marie-Ève Bédard')} className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" />
                    </label>
                    <label className="text-xs text-gray-600 dark:text-gray-300">{tr('Date', 'Date')}
                      <input value={coverDate} onChange={e => setCoverDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" />
                    </label>
                    <p className="text-[11px] text-gray-400 sm:col-span-2">{tr('Texte, signataire et ville viennent des paramètres « Lettre de présentation ». Adresse client pré-remplie.', 'Body, signatory and city come from the cover-letter settings. Client address prefilled.')}</p>
                  </div>
                )}
              </div>

              {/* Ventilation des coûts + joindre la liste de taux */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <label className="flex items-center gap-1.5 font-semibold text-gray-600 dark:text-gray-300">
                  {tr('Ventilation', 'Breakdown')} :
                  <select value={breakdownMode} onChange={e => setBreakdownMode(e.target.value as any)} className="rounded-lg border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-700">
                    <option value="detaille">{tr('Tout détaillé', 'Fully detailed')}</option>
                    <option value="par_item">{tr('Prix par item', 'Price per item')}</option>
                    <option value="global_desc">{tr('Prix global + descriptions', 'Global price + descriptions')}</option>
                  </select>
                </label>
                <label className="flex items-center gap-1.5 font-semibold text-gray-600 dark:text-gray-300">
                  <input type="checkbox" checked={inclTaux} onChange={e => setInclTaux(e.target.checked)} /> {tr('Joindre la liste de taux', 'Attach rate list')}
                </label>
              </div>

              {/* Conditions & modalités à inclure (modèle tenant) */}
              {(coverCfg?.conditions || []).length > 0 && (
                <div className="mt-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <div className="mb-1 text-xs font-bold text-gray-600 dark:text-gray-300">📑 {tr('Conditions et modalités à inclure', 'Terms & conditions to include')}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {(coverCfg?.conditions || []).map(c => (
                      <label key={c.id} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <input type="checkbox" checked={condSel.includes(c.id)} onChange={e => setCondSel(prev => e.target.checked ? [...prev, c.id] : prev.filter(x => x !== c.id))} /> {c.titre || tr('(sans titre)', '(untitled)')}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Pièces jointes PDF (bibliothèque réutilisable) — fusionnées en fin de document */}
              <div className="mt-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">📎 {tr('Pièces jointes PDF', 'PDF attachments')}</span>
                  <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                    {attachBusy ? '…' : `+ ${tr('Importer un PDF', 'Upload a PDF')}`}
                    <input type="file" accept="application/pdf" className="hidden" disabled={attachBusy} onChange={e => { uploadAttach(e.target.files?.[0]); e.currentTarget.value = ''; }} />
                  </label>
                </div>
                {attachLib.length === 0 ? (
                  <p className="text-[11px] text-gray-400">{tr('Importe des PDF (conditions, formulaires…) à annexer à l\'export.', 'Upload PDFs (terms, forms…) to append to the export.')}</p>
                ) : (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {attachLib.map(a => (
                      <span key={a.id} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <input type="checkbox" checked={!!a.id && attachSel.includes(a.id)} onChange={e => a.id && setAttachSel(prev => e.target.checked ? [...prev, a.id!] : prev.filter(x => x !== a.id))} /> {a.filename || tr('(PDF)', '(PDF)')}
                        <button type="button" onClick={() => a.id && deleteSoumissionAttachment(tenant, a.id).then(reloadAttach)} className="text-gray-300 hover:text-red-500" title={tr('Supprimer', 'Delete')}><Trash2 size={11} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={doExportPdf} disabled={pdfBusy} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{pdfBusy ? '…' : tr('Exporter le PDF (sélection)', 'Export PDF (selection)')}</button>
                {hdr.id && <button type="button" onClick={transmitForApproval} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">✍️ {tr('Transmettre au client (approbation)', 'Send to client (approval)')}</button>}
                {hdr.id && <button type="button" onClick={copyShareLink} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">🔗 {tr('Copier le lien', 'Copy link')}</button>}
              </div>
              <p className="mt-1 text-[11px] text-gray-400">{tr('Coche les sections à inclure (façon DGA). Logo du tenant en haut à gauche (sinon C-Secur360).', 'Tick the sections to include. Tenant logo top-left (else C-Secur360).')}</p>
            </div>
          )}

          {items.map((it, i) => {
            if (tab !== i) return null; // navigation : on n'affiche que l'item de l'onglet actif
            const ih = hoursByCategory([it]); // heures de CET item (gestion séparée Bureau/Chantier)
            return (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-900/40">
                <input value={it.name} onChange={e => updItem(i, { name: e.target.value })} className={`font-semibold ${inputCls}`} />
                <div className="flex items-center gap-3">
                  {(ih.bureau > 0 || ih.chantier > 0) && (
                    <span className="text-[11px] text-gray-500">
                      {ih.bureau > 0 && <span className="mr-2 rounded bg-blue-50 px-1.5 py-0.5 font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">{tr('Bureau', 'Office')} {ih.bureau} h</span>}
                      {ih.chantier > 0 && <span className="rounded bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">{tr('Chantier', 'Field')} {ih.chantier} h</span>}
                    </span>
                  )}
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
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                        <span>{catLabel(cat, c === 'voyagement' ? 'km' : c, CATEGORIE_LABELS[c])}</span>
                        <span className="flex items-center gap-2">
                          {c === 'materiaux' && canEdit && (
                            <span className="flex items-center gap-1 font-normal text-gray-500" title={tr('Applique cette marge de profit à toutes les lignes matériaux (les lignes issues du catalogue gardent leur marge si vous ne cliquez pas).', 'Apply this profit margin to all material lines.')}>
                              {tr('Normaliser marge', 'Normalize margin')}
                              <input type="number" value={matMarge} onChange={e => setMatMarge(Number(e.target.value))} className="w-12 rounded border border-gray-300 px-1 py-0.5 text-right dark:border-gray-600 dark:bg-gray-700" /> %
                              <button type="button" onClick={() => setItems(p => p.map((itx, j) => j === i ? { ...itx, lignes: itx.lignes.map(l => l.categorie === 'materiaux' ? { ...l, maj: matMarge } : l) } : itx))} className="rounded border border-gray-300 px-1.5 py-0.5 font-semibold text-gray-600 hover:bg-white dark:border-gray-600 dark:text-gray-300">{tr('Appliquer', 'Apply')}</button>
                            </span>
                          )}
                          {canEdit && <button onClick={() => addLigne(i, c)} className="text-blue-600 hover:underline">+ {tr('Ligne', 'Line')}</button>}
                        </span>
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
                      {/* Subsistance / Hébergement : taux du catalogue (extras) en clic rapide (comme le km du voyagement) */}
                      {canEdit && c === 'subsistance' && cat?.extras && (
                        <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 px-3 py-1.5 dark:border-gray-700">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{tr('Du catalogue', 'From catalogue')} :</span>
                          {([['sub_h5', tr('Subsistance 5h', 'Per diem 5h')], ['sub_h12', tr('Subsistance 12h', 'Per diem 12h')], ['sub_h15', tr('Subsistance 15h', 'Per diem 15h')], ['sub_nuitee', tr('Subsistance nuitée', 'Per diem overnight')]] as const).filter(([k]) => Number((cat.extras as any)[k]) > 0).map(([k, label]) => (
                            <button key={k} type="button" onClick={() => addCatalogueLigne(i, c, label, Number((cat.extras as any)[k]) || 0)}
                              className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              + {label} ({mny(Number((cat.extras as any)[k]) || 0)})
                            </button>
                          ))}
                        </div>
                      )}
                      {canEdit && c === 'hebergement' && Number(cat?.extras?.hebergement) > 0 && (
                        <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 px-3 py-1.5 dark:border-gray-700">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{tr('Du catalogue', 'From catalogue')} :</span>
                          <button type="button" onClick={() => addCatalogueLigne(i, c, tr('Hébergement (nuit)', 'Lodging (night)'), Number(cat?.extras?.hebergement) || 0)}
                            className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            + {tr('Hébergement / nuit', 'Lodging / night')} ({mny(Number(cat?.extras?.hebergement) || 0)})
                          </button>
                        </div>
                      )}
                      {lignes.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead><tr className="text-left text-gray-400">
                              <th className="px-2 py-1">Description</th>
                              {isMO(c) ? (<><th className="px-2">Tech</th><th className="px-2">Rég</th><th className="px-2">Supp</th><th className="px-2">Maj</th></>) : c === 'voyagement' ? (<><th className="px-2">{tr('Véhicules', 'Vehicles')}</th><th className="px-2">Km</th><th className="px-2">{tr('Taux/km', 'Rate/km')}</th></>) : c === 'materiaux' ? (<><th className="px-2">Qté</th><th className="px-2">{tr('Marge %', 'Margin %')}</th><th className="px-2">{tr('Coût', 'Cost')}</th></>) : (<><th className="px-2">Qté</th><th className="px-2">Unité</th><th className="px-2">Coût</th></>)}
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
                                          // Catalogue : on garde le COÛT + la marge du catalogue (maj) -> la marge n'est comptée qu'une fois.
                                          if (mat) { updLigne(i, li, { description: val, unit_cost: Number(mat.cost_price) || Number(mat.sale_price) || 0, maj: Number(mat.margin_pct) || 0, quantity: l.quantity || 1 }); return; }
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
                                      {c === 'materiaux'
                                        ? <td className="px-2"><input type="number" step="0.1" value={l.maj} onChange={e => updLigne(i, li, { maj: Number(e.target.value) })} className={`w-16 text-right ${inputCls}`} title={tr('Marge de profit %', 'Profit margin %')} /></td>
                                        : <td className="px-2"><input value={l.unit || ''} onChange={e => updLigne(i, li, { unit: e.target.value })} className={`w-16 ${inputCls}`} /></td>}
                                      <td className="px-2"><input type="number" value={l.unit_cost} onChange={e => updLigne(i, li, { unit_cost: Number(e.target.value) })} className={`w-24 text-right ${inputCls}`} title={c === 'materiaux' ? tr('Coût (avant marge)', 'Cost (before margin)') : undefined} /></td>
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
          ); })}

          {canEdit && <button onClick={addItem} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-blue-600 dark:border-gray-700">+ {tr('Ajouter un item', 'Add item')}</button>}

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
