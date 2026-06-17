'use client';

// ============================================================================
// MODULE DGA — port fidèle du prototype dga-oil-app.jsx vers C-Secur360.
// App = liste en CARTES + filtres d'échéance + mode gestion (multi-suppr.) + import PDF
// (aperçu de fusion en colonnes) + formulaire nouveau transformateur (par groupes).
// Fiche = <TransfoView> ; saisie = <SampleEntry>. Données Supabase, IA serveur, temps réel.
// Shell commun conservé (PortalHeader : jour/nuit + FR/EN).
// ============================================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { PortalHeader } from '@/components/PortalHeader';
import { BackButton } from '@/components/BackButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useModuleEnabled } from '@/lib/modules/useModuleEnabled';
import { supabase } from '@/lib/supabase';
import { FlaskConical, Lock, Loader2, Plus, Search, Upload, Trash2, ArrowLeft, Mail } from 'lucide-react';
import {
  EQUIP_GROUPS, EQUIP_FIELDS, listDossiers, listAllMeasures, listMeasures, saveDossier, deleteDossier,
  saveMeasure, deleteMeasure, matchDossier, setTreated, type Dossier, type Measure,
} from '@/lib/dga/dossiers';
import { diagnoseFull, type GasInput } from '@/lib/dga/diagnose';
import { duvalPct, duvalZone } from '@/lib/dga/duval';
import { dueStatusByDate } from '@/lib/dga/catalog';
import { GAS_FIELDS, OIL_FIELDS, FURAN_FIELDS, gl, fl, COND_LABELS, COND_COLORS, worstCondition, effectiveNextDate, pcbStatus, latestPcb, lastGasMeasure } from '@/lib/dga/fields';
import { getSitesTree, siteLabel, type SiteNode } from '@/lib/sites';
import { voltageClass } from '@/lib/dga/oil';
import { TransfoView } from '@/components/dga/TransfoView';
import { SampleEntry, type SamplePayload } from '@/components/dga/SampleEntry';
import { InboundSetup } from '@/components/dga/InboundSetup';
import { parseLimsBuffer, isPdf, isSpreadsheet } from '@/lib/dga/insideview';
import { generateMultiDgaReport } from '@/lib/dga/report';

const num = (v: any) => (v == null || v === '' ? 0 : Number(v) || 0);
const norm = (s?: string) => (s || '').trim().toLowerCase();
const todayIso = () => new Date().toISOString().slice(0, 10);

export default function DgaPage() {
  const params = useParams<{ tenant: string }>();
  const tenant = String(params?.tenant || '');
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const access = useModuleEnabled(tenant, 'dga', false);

  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [allMeasures, setAllMeasures] = useState<Measure[]>([]);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [view, setView] = useState<'list' | 'fiche' | 'newMeasure'>('list');
  const [selId, setSelId] = useState<string | null>(null);
  const [newT, setNewT] = useState<Dossier | null>(null);
  const [editMeasure, setEditMeasure] = useState<Measure | null>(null); // mesure en cours d'édition (null = nouveau prélèvement)
  const [query, setQuery] = useState('');
  const [dueFilter, setDueFilter] = useState<'all' | 'overdue' | 'soon' | 'ok'>('all');
  const [treatFilter, setTreatFilter] = useState<'all' | 'todo' | 'done'>('all'); // traité / à traiter
  const [condFilter, setCondFilter] = useState(false); // « suivi rapproché » : condition élevée (≥ 3)
  const [pcbFilter, setPcbFilter] = useState(false);   // BPC détecté (traces 2-50 ou présent ≥ 50)
  const [sortBy, setSortBy] = useState<'due' | 'alert'>('due'); // défaut : reprise à venir
  const [sitesTree, setSitesTree] = useState<SiteNode[]>([]);
  const [siteFilter, setSiteFilter] = useState(''); // classer les transfos par site (admin)
  const [delMode, setDelMode] = useState(false);
  const [assembling, setAssembling] = useState(false);
  const [withCover, setWithCover] = useState(false); // inclure une lettre de présentation au rapport DGA
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importErr, setImportErr] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null); // lots (gros PDF)
  const [dragOver, setDragOver] = useState(false);
  const [showInbound, setShowInbound] = useState(false); // panneau « Import par courriel »
  const [logoUrl, setLogoUrl] = useState<string | null>('/c-secur360-logo.png');
  const [tenantName, setTenantName] = useState<string>('');
  // Confirmation in-app (window.confirm() est supprimé dans une PWA installée -> suppression sans avertissement).
  const [confirmAsk, setConfirmAsk] = useState<{ title: string; message: string; confirmLabel: string; onConfirm: () => void } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Ouverture directe d'un transformateur via ?open=<id> (lien « Ouvrir dans l'app » du QR public).
  const openedRef = useRef(false);
  useEffect(() => {
    if (openedRef.current || typeof window === 'undefined') return;
    const openId = new URLSearchParams(window.location.search).get('open');
    if (openId && dossiers.some(d => d.id === openId)) {
      openedRef.current = true;
      setSelId(openId); setView('fiche');
    }
  }, [dossiers]);

  async function reload() {
    const [ds, ms] = await Promise.all([listDossiers(tenant), listAllMeasures(tenant)]);
    setDossiers(ds); setAllMeasures(ms);
  }
  // Marque comme « vues » les mesures d'un transformateur (efface le badge « Nouveau » des
  // résultats reçus par courriel) dès que le tenant ouvre sa fiche.
  async function markDossierSeen(id: string) {
    if (!id) return;
    try { await supabase.from('dga_measures').update({ seen: true }).eq('tenant_id', tenant).eq('dossier_id', id).eq('seen', false); } catch { /* tolère (colonne seen via migration 153) */ }
  }
  // Bascule le drapeau manuel « traité / à traiter » (persiste, sert au filtre).
  async function toggleTreated(id: string, val: boolean) { await setTreated(id, val); reload(); }
  function openFiche(d: Dossier) {
    setSelId(d.id!); setView('fiche');
    if (d.id && (measuresByDossier[d.id] || []).some(m => (m as any).seen === false)) markDossierSeen(d.id).then(reload);
  }
  useEffect(() => { if (access === 'enabled') reload(); /* eslint-disable-next-line */ }, [access, tenant]);
  useEffect(() => { if (tenant) getSitesTree(tenant).then(setSitesTree); }, [tenant]);
  useEffect(() => {
    if (access !== 'enabled') return;
    (async () => {
      try {
        const { data } = await supabase.from('company_settings').select('logo_url, legal_name').eq('tenant_id', tenant).maybeSingle();
        if (data?.logo_url) setLogoUrl(data.logo_url);
        let name = data?.legal_name || '';
        // Repli sur le nom d'affichage du tenant (table tenants, toujours renseigné) si legal_name est vide.
        if (!name) { try { const { data: t } = await supabase.from('tenants').select('name').eq('subdomain', tenant).maybeSingle(); name = t?.name || ''; } catch { /* ignore */ } }
        if (name) setTenantName(name);
      } catch { /* défaut */ }
    })();
    const ch = supabase.channel('dga-' + tenant)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dga_dossiers', filter: `tenant_id=eq.${tenant}` }, () => reload())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dga_measures', filter: `tenant_id=eq.${tenant}` }, () => { reload(); if (selId) listMeasures(tenant, selId).then(setMeasures); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    /* eslint-disable-next-line */
  }, [access, tenant]);

  // Mesures de la fiche sélectionnée.
  useEffect(() => { if (selId) listMeasures(tenant, selId).then(setMeasures); else setMeasures([]); }, [selId, tenant]);

  const lastByDossier = useMemo(() => {
    const m: Record<string, Measure> = {};
    for (const x of allMeasures) { if (x.dossier_id) m[x.dossier_id] = x; } // asc -> dernier écrase
    return m;
  }, [allMeasures]);

  const measuresByDossier = useMemo(() => {
    const m: Record<string, Measure[]> = {};
    for (const x of allMeasures) { if (x.dossier_id) (m[x.dossier_id] = m[x.dossier_id] || []).push(x); }
    return m;
  }, [allMeasures]);

  const dueCounts = useMemo(() => {
    const a = { overdue: 0, soon: 0, ok: 0 };
    for (const d of dossiers) { const lg = (d.id ? lastGasMeasure(measuresByDossier[d.id]) : undefined) || (d.id ? lastByDossier[d.id] : undefined); const s = dueStatusByDate(effectiveNextDate(d.extra, lg)).code; if (s === 'overdue') a.overdue++; else if (s === 'soon') a.soon++; else if (s === 'ok') a.ok++; }
    return a;
  }, [dossiers, lastByDossier, measuresByDossier]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Clé de tri par dossier : pire condition (0..3, -1 si aucune mesure) + urgence de reprise.
    // Condition de gaz = DERNIÈRE mesure CONTENANT DES GAZ (portrait courant ; un relevé BPC/huile seul
    // ne masque pas l'état de gaz, et après réparation le dernier relevé de gaz reflète l'amélioration).
    const lastG = (d: Dossier) => d.id ? (lastGasMeasure(measuresByDossier[d.id]) || lastByDossier[d.id]) : undefined;
    const rank = (d: Dossier) => {
      const lg = lastG(d);
      const worst = lg ? worstCondition(lg) : -1;
      const due = dueStatusByDate(effectiveNextDate(d.extra, lg));
      const dueKey = due.code === 'none' ? Infinity : (due.days ?? Infinity); // plus en retard / plus tôt = plus petit
      return { worst, dueKey };
    };
    const arr = dossiers.filter(d => {
      if (siteFilter && d.extra?.site_id !== siteFilter) return false;
      if (treatFilter === 'todo' && d.treated !== false) return false;
      if (treatFilter === 'done' && d.treated === false) return false;
      if (q && ![d.ident, d.client, d.serie, d.apparatus, d.description, d.company, d.equip_no].some(v => (v || '').toLowerCase().includes(q))) return false;
      if (dueFilter !== 'all') { if (dueStatusByDate(effectiveNextDate(d.extra, lastG(d))).code !== dueFilter) return false; }
      // Suivi rapproché : pire condition IEEE de gaz élevée (≥ 3, soit Condition 3 ou 4).
      if (condFilter) { const lg = lastG(d); const w = lg ? worstCondition(lg) : -1; if (w < 2) return false; }
      // BPC détecté (traces 2-50 ppm ou présent ≥ 50 ppm).
      if (pcbFilter) { const ms = measuresByDossier[d.id!] || (d.id && lastByDossier[d.id] ? [lastByDossier[d.id]] : []); const code = pcbStatus(latestPcb(ms), lang).code; if (code !== 'trace' && code !== 'present') return false; }
      return true;
    });
    arr.sort((a, b) => {
      const ra = rank(a), rb = rank(b);
      if (sortBy === 'alert') { // du pire au mieux, puis reprise
        if (rb.worst !== ra.worst) return rb.worst - ra.worst;
        return ra.dueKey - rb.dueKey;
      }
      // 'due' : reprise à venir (plus en retard / plus tôt d'abord), puis pire condition
      if (ra.dueKey !== rb.dueKey) return ra.dueKey - rb.dueKey;
      return rb.worst - ra.worst;
    });
    // Regroupement : chaque OLTC est placé juste après son transformateur parent (par n° de série).
    const oltcByParent = new Map<string, Dossier[]>();
    arr.forEach(d => { if (d.extra?.is_oltc && d.extra?.parent_serie) { const k = String(d.extra.parent_serie); if (!oltcByParent.has(k)) oltcByParent.set(k, []); oltcByParent.get(k)!.push(d); } });
    const hasParentInList = (d: Dossier) => !!d.extra?.parent_serie && arr.some(x => x.serie === d.extra!.parent_serie && !x.extra?.is_oltc);
    const grouped: Dossier[] = [];
    arr.forEach(d => {
      if (d.extra?.is_oltc && hasParentInList(d)) return; // inséré après son parent
      grouped.push(d);
      if (d.serie && oltcByParent.has(d.serie)) grouped.push(...oltcByParent.get(d.serie)!);
    });
    return grouped;
  }, [dossiers, query, dueFilter, treatFilter, condFilter, pcbFilter, sortBy, lastByDossier, measuresByDossier, siteFilter, lang]);

  const todoCount = useMemo(() => dossiers.filter(d => d.treated === false).length, [dossiers]);

  const selected_d = dossiers.find(d => d.id === selId) || null;

  // ── CRUD ──
  async function saveDossierFromView(d: Dossier) {
    const res = await saveDossier(tenant, d);
    if (res.error) { setNotice('Erreur : ' + res.error); return; }
    await reload();
  }
  async function onNewMeasureSave(p: SamplePayload) {
    if (!selId) return;
    // Diagnostic : null -> 0 (un gaz non mesuré ne contribue pas). Mais on STOCKE les null tels quels
    // (les tendances de gaz ignorent les relevés sans données de gaz).
    const gasDiag: GasInput = { h2: num(p.gas.h2), ch4: num(p.gas.ch4), c2h6: num(p.gas.c2h6), c2h4: num(p.gas.c2h4), c2h2: num(p.gas.c2h2), co: num(p.gas.co), co2: num(p.gas.co2) };
    const dg = diagnoseFull(gasDiag);
    const res = await saveMeasure(tenant, selId, {
      ...(editMeasure?.id ? { id: editMeasure.id } : {}), // id présent = mise à jour (édition manuelle), sinon insertion
      sample_date: p.sample_date, ...p.gas, o2: p.o2, n2: p.n2, oil_quality: p.oil_quality,
      tdcg: dg.tdcg, condition: dg.condition, duval: dg.duval, fault: tr(dg.fault.fr, dg.fault.en), methods: dg.methods,
      source: editMeasure?.source || 'manual',
    });
    if (res.error) { setNotice('Erreur : ' + res.error); return; }
    setEditMeasure(null);
    setMeasures(await listMeasures(tenant, selId)); setView('fiche');
  }
  async function delMeasure(id?: string) { if (!id) return; await deleteMeasure(id); if (selId) setMeasures(await listMeasures(tenant, selId)); reload(); }
  function delDossier() {
    if (!selId) return;
    const d = dossiers.find(x => x.id === selId);
    setConfirmAsk({
      title: tr('Supprimer le transformateur', 'Delete transformer'),
      message: tr(`Supprimer « ${d?.ident || ''} » et toutes ses mesures ? Action irréversible.`, `Delete "${d?.ident || ''}" and all its measurements? This cannot be undone.`),
      confirmLabel: tr('Supprimer', 'Delete'),
      onConfirm: async () => { await deleteDossier(selId); setSelId(null); setView('list'); reload(); },
    });
  }

  // ── Nouveau transformateur ──
  function startNewT() { const o: any = { ident: '' }; EQUIP_FIELDS.forEach(f => { o[f.key] = ''; }); setNewT(o); }
  async function saveNewT() {
    if (!newT?.ident.trim()) { setNotice(tr("L'identification est requise.", 'Identification is required.')); return; }
    setBusy(true); const res = await saveDossier(tenant, newT); setBusy(false);
    if (res.error || !res.data?.id) { setNotice('Erreur : ' + (res.error || '')); return; }
    setNewT(null); await reload(); setSelId(res.data.id); setView('fiche');
  }

  // ── Mode gestion (multi-suppression) ──
  function toggleSel(id: string) { setSelected(s => ({ ...s, [id]: !s[id] })); }
  function exitDelMode() { setDelMode(false); setSelected({}); }
  function selectAllFiltered() {
    const allOn = filtered.length > 0 && filtered.every(x => selected[x.id!]);
    if (allOn) { setSelected({}); return; }
    const all: Record<string, boolean> = {}; filtered.forEach(x => { all[x.id!] = true; }); setSelected(all);
  }
  function onDeleteOne(id: string) {
    const d = dossiers.find(x => x.id === id);
    setConfirmAsk({
      title: tr('Supprimer le transformateur', 'Delete transformer'),
      message: tr(`Supprimer « ${d?.ident || ''} » et ses mesures ? Action irréversible.`, `Delete "${d?.ident || ''}" and its measurements? This cannot be undone.`),
      confirmLabel: tr('Supprimer', 'Delete'),
      onConfirm: async () => { await deleteDossier(id); reload(); },
    });
  }
  function deleteSelected() {
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (!ids.length) { exitDelMode(); return; }
    setConfirmAsk({
      title: tr('Supprimer la sélection', 'Delete selection'),
      message: tr(`Supprimer ${ids.length} transformateur(s) et leurs mesures ? Action irréversible.`, `Delete ${ids.length} transformer(s) and their measurements? This cannot be undone.`),
      confirmLabel: tr('Supprimer', 'Delete'),
      onConfirm: async () => { for (const id of ids) await deleteDossier(id); exitDelMode(); reload(); },
    });
  }

  // ── Assemble un rapport PDF multi-transformateurs (même client) à partir de la sélection ──
  async function assembleReport() {
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (!ids.length) { exitDelMode(); return; }
    const items = ids
      .map(id => dossiers.find(d => d.id === id))
      .filter(Boolean)
      .map((d: any) => ({ dossier: d, measures: measuresByDossier[d.id] || [] }));
    const clients = [...new Set(items.map((it: any) => String(it.dossier.client || it.dossier.company || '').trim()).filter(Boolean))];
    if (clients.length > 1 && !confirm(tr(
      `La sélection contient ${clients.length} clients différents. Assembler quand même un seul rapport ?`,
      `Selection has ${clients.length} different clients. Assemble a single report anyway?`))) return;
    setAssembling(true);
    try {
      const clientNom = clients[0] || tenantName;
      // Lettre de présentation optionnelle (même socle que le rapport terrain).
      const coverLetter = withCover ? {
        companyName: tenantName,
        destinataire: [clientNom].filter(Boolean),
        objet: tr('Diagnostic des gaz dissous (DGA)', 'Dissolved gas analysis (DGA)'),
        votreClient: clientNom,
        body: tr(
          `Madame, Monsieur,\n\nVeuillez trouver ci-joint notre rapport de diagnostic des gaz dissous (DGA) portant sur ${items.length} transformateur(s). Ce rapport présente l'interprétation des résultats, l'état de chaque appareil et nos recommandations.\n\nNous demeurons disponibles pour toute question.`,
          `Dear Sir or Madam,\n\nPlease find enclosed our dissolved gas analysis (DGA) report covering ${items.length} transformer(s). It presents the interpretation of results, the condition of each unit and our recommendations.\n\nWe remain available for any questions.`),
        salutation: tr('Veuillez agréer nos salutations distinguées.', 'Yours sincerely,'),
        signataireNom: tenantName,
      } : null;
      await generateMultiDgaReport({ items, clientName: clientNom, logoUrl, lang: lang === 'en' ? 'en' : 'fr', coverLetter, tenant });
      exitDelMode();
    } catch (e: any) { setImportErr(e?.message || String(e)); }
    finally { setAssembling(false); }
  }

  // ── Import PDF (drag/bouton) → aperçu de fusion ──
  function mapEquip(eq: any): Dossier {
    // Détection OLTC : flag IA (eq.isOltc) OU heuristique mots-clés sur type/description/identification.
    const blob = `${eq.apparatusType || ''} ${eq.description || ''} ${eq.identification || ''} ${eq.samplingPoint || ''}`.toLowerCase();
    const isOltc = eq.isOltc === true || /\boltc\b|\bltc\b|changeur de prise|prise sous charge|tap[\s-]?changer|s[ée]lecteur|diverter|r[ée]gleur en charge|commutateur de prise/.test(blob);
    return {
      ident: eq.identification || eq.equipment || ('Import ' + todayIso()), client: eq.location || '', serie: eq.serialNo || '',
      company: eq.company || '', contact: eq.contact || '', email: eq.email || '', equip_no: eq.equipNo || '', apparatus: eq.apparatusType || '',
      description: eq.description || '', kv: eq.kvClass ? Number(eq.kvClass) : null, mva: eq.maxMVA ? Number(eq.maxMVA) : null,
      oil_vol: eq.oilVolumeL ? Number(eq.oilVolumeL) : null, oil_type: eq.oilType || '', manufacturer: eq.manufacturer || '', year: eq.year ? String(eq.year) : '',
      sample_point: eq.samplingPoint || '',
      extra: { ...(isOltc ? { is_oltc: true } : {}), ...(eq.parentSerial ? { parent_serie: String(eq.parentSerial) } : {}) },
    };
  }
  function mapMeasure(mm: any): Measure {
    const oil_quality: Record<string, any> = {};
    OIL_FIELDS.forEach(f => { if (mm[f.key] != null) oil_quality[f.key] = f.text ? String(mm[f.key]) : Number(mm[f.key]); });
    FURAN_FIELDS.forEach(f => { if (mm[f.key] != null) oil_quality[f.key] = Number(mm[f.key]); });
    // Gaz NON mesuré (absent du fichier) -> null (pas 0). Un 0 réellement présent reste 0.
    const ng = (v: any) => (v == null || v === '' ? null : (isNaN(Number(v)) ? null : Number(v)));
    return { sample_date: mm.date || null, h2: ng(mm.H2), ch4: ng(mm.CH4), c2h6: ng(mm.C2H6), c2h4: ng(mm.C2H4), c2h2: ng(mm.C2H2), co: ng(mm.CO), co2: ng(mm.CO2), o2: mm.O2 != null ? num(mm.O2) : null, n2: mm.N2 != null ? num(mm.N2) : null, oil_quality };
  }
  // Découpe un gros PDF en sous-PDF (par pages) pour passer sous la limite de body de la plateforme,
  // comme l'import Excel de l'inventaire découpe en lots. Petit fichier = 1 seul lot (fichier brut).
  async function splitPdfForUpload(file: File): Promise<Blob[]> {
    const SAFE = 3.5 * 1024 * 1024; // marge sous la limite multipart (~4,5 Mo)
    const MAX_PAGES = 4; // borne le temps d'extraction IA par appel -> evite le FUNCTION_INVOCATION_TIMEOUT
    try {
      const { PDFDocument } = await import('pdf-lib');
      const bytes = new Uint8Array(await file.arrayBuffer());
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const n = src.getPageCount();
      if (n <= 1) return [file]; // 1 page indivisible -> on tente l'envoi direct
      // Petit fichier ET peu de pages -> un seul appel. Sinon on decoupe (par taille ET par nb de pages).
      if (file.size <= SAFE && n <= MAX_PAGES) return [file];
      const perBySize = Math.max(1, Math.floor((n * SAFE) / Math.max(bytes.length, 1)));
      const perBatch = Math.max(1, Math.min(perBySize, MAX_PAGES));
      const out: Blob[] = [];
      for (let i = 0; i < n; i += perBatch) {
        const sub = await PDFDocument.create();
        const idxs: number[] = [];
        for (let k = i; k < Math.min(i + perBatch, n); k++) idxs.push(k);
        const pages = await sub.copyPages(src, idxs);
        pages.forEach(pg => sub.addPage(pg));
        const data = await sub.save();
        out.push(new Blob([data], { type: 'application/pdf' }));
      }
      return out.length ? out : [file];
    } catch {
      return [file]; // pdf-lib indisponible/illisible -> envoi direct (le parsing défensif gère l'échec)
    }
  }

  // Extrait un lot (un sous-PDF) via l'API ; parsing défensif (un 413 renvoie du texte, pas du JSON).
  async function extractBatch(blob: Blob, total: number, idx: number): Promise<any[]> {
    const fd = new FormData();
    fd.append('file', blob, 'part.pdf');
    fd.append('tenant', tenant);
    const resp = await fetch('/api/dga/extract', { method: 'POST', body: fd });
    const raw = await resp.text();
    let j: any = {};
    if (raw) { try { j = JSON.parse(raw); } catch {
      if (resp.status === 413) throw new Error(tr(
        `Lot ${idx + 1}/${total} trop dense pour la limite — réduis la résolution du PDF.`,
        `Batch ${idx + 1}/${total} too dense for the limit — lower the PDF resolution.`));
      throw new Error((raw.slice(0, 160) || `Erreur ${resp.status}`) + (total > 1 ? ` (lot ${idx + 1}/${total})` : ''));
    } }
    if (!resp.ok || j.error) throw new Error((j.error || `Erreur ${resp.status}`) + (total > 1 ? ` (lot ${idx + 1}/${total})` : ''));
    return Array.isArray(j.transformers) && j.transformers.length ? j.transformers : (j.equipment ? [{ equipment: j.equipment, measurements: j.measurements }] : []);
  }

  // Fusionne les transformateurs venant de plusieurs lots (un même transfo peut être coupé entre 2 pages).
  function mergeTransformers(list: any[]): any[] {
    const byKey = new Map<string, any>();
    let anon = 0;
    for (const t of list) {
      const eq = t?.equipment || {};
      const key = String(eq.serialNo || eq.equipNo || eq.identification || eq.description || `__${anon++}`).trim().toLowerCase();
      if (!byKey.has(key)) byKey.set(key, { equipment: { ...eq }, measurements: [...(t?.measurements || [])] });
      else {
        const g = byKey.get(key);
        g.measurements.push(...(t?.measurements || []));
        for (const [k, v] of Object.entries(eq)) { if (v != null && g.equipment[k] == null) g.equipment[k] = v; } // complète les trous
      }
    }
    for (const g of byKey.values()) {
      const seen = new Set<string>();
      g.measurements = g.measurements.filter((m: any) => { const d = String(m?.date || JSON.stringify(m)); if (seen.has(d)) return false; seen.add(d); return true; });
    }
    return [...byKey.values()];
  }

  // Extraction d'UN fichier -> items de prévisualisation (sans toucher à l'état UI). Réutilisé en lot.
  async function extractItemsFromFile(file: File): Promise<any[]> {
      let transformers: any[];
      if (isSpreadsheet(file.name, file.type) && !isPdf(file.name, file.type)) {
        // Export Excel/CSV LIMS (InsideView / Morgan Schaffer) : mappage DIRECT, sans IA.
        const parsed = parseLimsBuffer(new Uint8Array(await file.arrayBuffer()));
        if (!parsed || !parsed.transformers.length) throw new Error(tr('Fichier Excel/CSV non reconnu comme un export DGA (InsideView/LIMS).', 'Excel/CSV file not recognized as a DGA export (InsideView/LIMS).'));
        transformers = parsed.transformers;
      } else {
        // 1) Découpe le PDF en lots (sous la limite plateforme), comme l'import Excel inventaire.
        const blobs = await splitPdfForUpload(file);
        setImportProgress({ done: 0, total: blobs.length });
        // 2) Traite les lots en parallèle (pool de 2), avec progression.
        const results: any[] = new Array(blobs.length);
        let nextIdx = 0, done = 0;
        const worker = async () => {
          while (nextIdx < blobs.length) {
            const idx = nextIdx++;
            results[idx] = await extractBatch(blobs[idx], blobs.length, idx);
            done++; setImportProgress({ done, total: blobs.length });
          }
        };
        await Promise.all(Array.from({ length: Math.min(2, blobs.length) }, () => worker()));
        // 3) Fusionne tous les transformateurs de tous les lots.
        const all: any[] = [];
        results.forEach(r => { if (Array.isArray(r)) all.push(...r); });
        transformers = mergeTransformers(all);
      }
      if (!transformers.length) throw new Error(tr('Aucun transformateur détecté dans le fichier.', 'No transformer detected in the file.'));
      // Un PDF peut contenir PLUSIEURS transformateurs -> un item par transformateur (séparés).
      const NAME_FIELDS: { key: keyof Dossier; fr: string; en: string }[] = [
        { key: 'company', fr: 'Compagnie', en: 'Company' },
        { key: 'ident', fr: 'Équipement', en: 'Equipment' },
        { key: 'client', fr: 'Localisation', en: 'Location' },
      ];
      const items = transformers.map((t: any) => {
        const rawEq = t.equipment || {};
        const eq = mapEquip(rawEq);
        const measuresN = (t.measurements || []).map(mapMeasure).sort((a: Measure, b: Measure) => String(a.sample_date).localeCompare(String(b.sample_date)));
        const match = matchDossier(dossiers, { serialNo: rawEq.serialNo, identification: rawEq.identification, equipment: rawEq.equipment });
        let newMeasures = measuresN, dupCount = 0;
        if (match?.id) { const existing = new Set((measuresByDossier[match.id] || []).filter(m => m.sample_date).map(m => m.sample_date)); newMeasures = measuresN.filter((m: Measure) => !existing.has(m.sample_date)); dupCount = measuresN.length - newMeasures.length; }
        // Conflits de NOM : même n° de série mais libellé différent -> on demandera quel nom garder.
        const conflicts = match ? NAME_FIELDS.map(f => {
          const ex = String((match as any)[f.key] || '').trim(); const nw = String((eq as any)[f.key] || '').trim();
          return (ex && nw && ex.toLowerCase() !== nw.toLowerCase()) ? { key: f.key, label: tr(f.fr, f.en), existing: ex, incoming: nw } : null;
        }).filter(Boolean) : [];
        return { rawEq, eq, measures: measuresN, match, newMeasures, dupCount, mode: match ? 'merge' : 'create', conflicts, useNew: {} as Record<string, boolean> };
      });
      return items;
  }

  async function handleImport(file: File) {
    if (!file) return;
    setImporting(true); setImportErr(null); setNotice(null); setImportProgress(null);
    try { setImportPreview({ items: await extractItemsFromFile(file) }); }
    catch (e: any) { setImportErr(e?.message || String(e)); }
    finally { setImporting(false); setImportProgress(null); }
  }

  // Import de PLUSIEURS fichiers d'un coup : on extrait chacun et on FUSIONNE tous les items dans une
  // seule prévisualisation (« Tout importer »). Un fichier en erreur n'arrête pas les autres.
  async function handleImportFiles(files: File[]) {
    const list = (files || []).filter(Boolean);
    if (!list.length) return;
    if (list.length === 1) return handleImport(list[0]);
    setImporting(true); setImportErr(null); setNotice(null); setImportProgress({ done: 0, total: list.length });
    const allItems: any[] = []; const errs: string[] = [];
    for (let i = 0; i < list.length; i++) {
      try { allItems.push(...await extractItemsFromFile(list[i])); }
      catch (e: any) { errs.push(`${list[i].name}: ${e?.message || e}`); }
      setImportProgress({ done: i + 1, total: list.length });
    }
    setImporting(false); setImportProgress(null);
    if (!allItems.length) { setImportErr(errs.join(' · ') || tr('Aucun transformateur détecté.', 'No transformer detected.')); return; }
    if (errs.length) setNotice(tr(`⚠️ ${errs.length} fichier(s) en erreur : ${errs.slice(0, 3).join(' · ')}`, `⚠️ ${errs.length} file(s) failed: ${errs.slice(0, 3).join(' · ')}`));
    setImportPreview({ items: allItems });
  }
  async function applyImport() {
    const items: any[] = importPreview?.items || [];
    if (!items.length) return;
    try {
      let created = 0, merged = 0, lastId: string | null = null;
      for (const it of items) {
        const useMatch = it.mode !== 'create' && it.match?.id;
        const measuresToAdd: Measure[] = useMatch ? it.newMeasures : it.measures;
        let did: string;
        if (useMatch) {
          did = it.match.id;
          const patch: any = { ...it.match };
          for (const k of Object.keys(it.eq) as (keyof Dossier)[]) { if ((it.match as any)[k] == null || (it.match as any)[k] === '') (patch as any)[k] = (it.eq as any)[k]; }
          // Conflits de nom : si l'utilisateur a choisi le NOUVEAU libellé, on l'applique (sinon on garde l'existant).
          for (const c of (it.conflicts || [])) { if (it.useNew?.[c.key]) (patch as any)[c.key] = c.incoming; }
          await saveDossier(tenant, patch); merged++;
        } else {
          const saved = await saveDossier(tenant, it.eq);
          if (saved.error || !saved.data?.id) throw new Error(saved.error || 'enregistrement');
          did = saved.data.id; created++;
        }
        for (const m of measuresToAdd) {
          const gas: GasInput = { h2: num(m.h2), ch4: num(m.ch4), c2h6: num(m.c2h6), c2h4: num(m.c2h4), c2h2: num(m.c2h2), co: num(m.co), co2: num(m.co2) };
          const dg = diagnoseFull(gas);
          await saveMeasure(tenant, did, { ...m, tdcg: dg.tdcg, condition: dg.condition, duval: dg.duval, fault: tr(dg.fault.fr, dg.fault.en), methods: dg.methods, source: 'pdf' });
        }
        // Nouveaux résultats importés -> statut « À TRAITER » (sinon le dossier reste affiché « Traité »).
        if (measuresToAdd.length) { try { await setTreated(did, false); } catch { /* colonne treated absente (migration 154) */ } }
        lastId = did;
      }
      setImportPreview(null); await reload();
      if (items.length === 1 && lastId) { setSelId(lastId); setView('fiche'); } else { setView('list'); }
      setNotice(tr(`Import terminé : ${created} créé(s), ${merged} fusionné(s) sur ${items.length} transformateur(s).`, `Import done: ${created} created, ${merged} merged across ${items.length} transformer(s).`));
    } catch (e: any) { setImportErr(e?.message || String(e)); }
  }

  if (access === 'loading') return <Shell tenant={tenant}><div className="grid place-items-center py-32 text-gray-400"><Loader2 className="animate-spin" /></div></Shell>;
  if (access === 'locked') return <Shell tenant={tenant}><div className="mx-auto max-w-md px-4 py-20 text-center"><Lock className="mx-auto text-gray-400" size={40} /><h1 className="mt-4 text-xl font-bold">{tr('Module non activé', 'Module not enabled')}</h1><p className="mt-2 text-sm text-gray-500">{tr("Le module DGA n'est pas inclus dans votre abonnement.", 'The DGA module is not in your subscription.')}</p></div></Shell>;

  return (
    <Shell tenant={tenant}>
      <div className="w-full max-w-none px-3 py-6 sm:px-5 lg:px-8 xl:px-10">
        {view === 'list' && <BackButton fallback={`/${tenant}/modules`} className="mb-3" />}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-600 text-white"><FlaskConical size={18} /></span>
            <div><h1 className="text-xl font-extrabold">{tr('Diagnostic de transformateurs', 'Transformer Diagnostics')}</h1>
              <p className="text-xs text-gray-500">IEEE C57.104-2019 / C57.106 · Duval · ASTM · {tr('Furanes (DP)', 'Furans (DP)')}</p></div>
          </div>
          {view !== 'list' && <button onClick={() => { setView('list'); setSelId(null); reload(); }} className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:underline dark:text-gray-300"><ArrowLeft size={15} /> {tr('Tous les transformateurs', 'All transformers')}</button>}
        </div>
        {notice && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{notice}</div>}

        {view === 'list' && delMode && (
          <label className="mb-3 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
            <input type="checkbox" checked={withCover} onChange={e => setWithCover(e.target.checked)} />
            ✉️ {tr('Inclure une lettre de présentation au rapport', 'Include a cover letter in the report')}
          </label>
        )}
        {view === 'list' && (
          <ListView {...{ tr, lang, dossiers, filtered, lastByDossier, measuresByDossier, dueCounts, query, setQuery, dueFilter, setDueFilter, sortBy, setSortBy, sitesTree, siteFilter, setSiteFilter, delMode, setDelMode, selected, toggleSel, exitDelMode, selectAllFiltered, deleteSelected, onDeleteOne, importing, importProgress, dragOver, setDragOver, fileRef, handleImport, handleImportFiles, newT, setNewT, startNewT, saveNewT, busy, openFiche, openInbound: () => setShowInbound(true), treatFilter, setTreatFilter, condFilter, setCondFilter, pcbFilter, setPcbFilter, todoCount, onToggleTreated: toggleTreated, assembleReport, assembling }} />
        )}

        {view === 'fiche' && selected_d && (
          <>
            <div className="mb-2 flex justify-end print:hidden">
              <button onClick={() => toggleTreated(selected_d.id!, selected_d.treated === false)}
                title={selected_d.treated !== false ? tr('Marquer à traiter', 'Mark as to-do') : tr('Marquer comme traité', 'Mark as treated')}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${selected_d.treated !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-500 text-white'}`}>
                {selected_d.treated !== false ? `✓ ${tr('Traité', 'Treated')}` : `◦ ${tr('À traiter', 'To treat')}`}
              </button>
            </div>
            <TransfoView
              tenant={tenant} tenantName={tenantName} siteText={siteLabel(sitesTree, selected_d.extra?.site_id, selected_d.extra?.department_id)} lang={lang} tr={tr} dossier={selected_d} measures={measures} logoUrl={logoUrl} allDossiers={dossiers}
              onSave={saveDossierFromView} onNewMeasure={() => { setEditMeasure(null); setView('newMeasure'); }} onEditMeasure={(m: Measure) => { setEditMeasure(m); setView('newMeasure'); }} onDeleteMeasure={delMeasure} onDeleteDossier={delDossier} setNotice={setNotice}
            />
          </>
        )}

        {view === 'newMeasure' && selected_d && (
          <SampleEntry lang={lang} tr={tr} dossierIdent={selected_d.ident} initial={editMeasure} onSave={onNewMeasureSave} onCancel={() => { setEditMeasure(null); setView('fiche'); }} />
        )}
      </div>

      {/* MODALE APERÇU IMPORT */}
      {importErr && (
        <Modal onClose={() => setImportErr(null)}><h2 className="mb-2 text-lg font-bold text-red-600">{tr("Échec de l'import :", 'Import failed:')}</h2><p className="break-words text-sm">{importErr}</p><div className="mt-3"><button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600" onClick={() => setImportErr(null)}>{tr('Fermer', 'Close')}</button></div></Modal>
      )}
      {importPreview && <ImportPreview {...{ tr, lang, importPreview, setImportPreview, applyImport }} />}

      {/* CONFIRMATION DE SUPPRESSION (in-app — fiable même en PWA) */}
      {confirmAsk && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4" onClick={() => setConfirmAsk(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="mb-1 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-red-100 text-red-600"><Trash2 size={16} /></span><h2 className="text-base font-bold">{confirmAsk.title}</h2></div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{confirmAsk.message}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600" onClick={() => setConfirmAsk(null)}>{tr('Annuler', 'Cancel')}</button>
              <button className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700" onClick={() => { const fn = confirmAsk.onConfirm; setConfirmAsk(null); fn(); }}>{confirmAsk.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}

      {showInbound && <InboundSetup onClose={() => setShowInbound(false)} />}
    </Shell>
  );
}

function Shell({ tenant, children }: { tenant: string; children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100"><PortalHeader tenant={tenant} />{children}</div>;
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}><div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-5 dark:bg-gray-800" onClick={e => e.stopPropagation()}>{children}</div></div>;
}

// ── LISTE EN CARTES ──
function ListView(p: any) {
  const { tr, lang, dossiers, filtered, lastByDossier, measuresByDossier, dueCounts, query, setQuery, dueFilter, setDueFilter, sortBy, setSortBy, sitesTree = [], siteFilter, setSiteFilter, delMode, setDelMode, selected, toggleSel, exitDelMode, selectAllFiltered, deleteSelected, onDeleteOne, importing, importProgress, dragOver, setDragOver, fileRef, handleImport, handleImportFiles, newT, setNewT, startNewT, saveNewT, busy, openFiche, openInbound, treatFilter, setTreatFilter, condFilter, setCondFilter, pcbFilter, setPcbFilter, todoCount, onToggleTreated, assembleReport, assembling } = p;
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Filtres principaux MUTUELLEMENT EXCLUSIFs : chaque sélection repart de la liste complète (sinon
  // les bascules « Suivi rapproché » / « BPC » restaient actives et la liste se vidait). Site + recherche
  // restent des refinements orthogonaux.
  const pickDue   = (k: any) => { setDueFilter(k); setTreatFilter('all'); setCondFilter(false); setPcbFilter(false); };
  const pickTreat = (k: any) => { setTreatFilter(k); setDueFilter('all'); setCondFilter(false); setPcbFilter(false); };
  const pickCond  = () => { const v = !condFilter; setCondFilter(v); if (v) { setDueFilter('all'); setTreatFilter('all'); setPcbFilter(false); } };
  const pickPcb   = () => { const v = !pcbFilter; setPcbFilter(v); if (v) { setDueFilter('all'); setTreatFilter('all'); setCondFilter(false); } };
  const inp = 'rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-rose-500 dark:border-gray-600';
  const selCount = Object.values(selected).filter(Boolean).length;
  // Transformateurs avec des résultats reçus par courriel non encore consultés (badge « Nouveau »).
  const unseenFor = (d: Dossier) => (measuresByDossier?.[d.id!] || []).filter((m: any) => m.seen === false).length;
  const newDossiers = dossiers.filter((d: Dossier) => unseenFor(d) > 0);
  const filterTabs: [string, string, number, string][] = [
    ['all', tr('Tous', 'All'), dossiers.length, '#6b5d4f'],
    ['overdue', tr('En retard', 'Overdue'), dueCounts.overdue, '#e63946'],
    ['soon', tr('Bientôt dû', 'Due soon'), dueCounts.soon, '#f4a261'],
    ['ok', tr('À jour', 'Up to date'), dueCounts.ok, '#2a9d8f'],
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{tr('Base de données', 'Database')} ({dossiers.length})</h2>
        <div className="flex flex-wrap gap-2">
          {!delMode && dossiers.length > 1 && <button className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => setDelMode(true)} title={tr('Sélectionner plusieurs transformateurs et assembler un rapport PDF', 'Select several transformers and assemble a PDF report')}>📄 {tr('Rapport multi-transfo', 'Multi-transformer report')}</button>}
          {!delMode && dossiers.length > 0 && <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600" onClick={() => setDelMode(true)}>🗑 {tr('Gérer', 'Manage')}</button>}
          {!delMode && <button onClick={openInbound} className="relative inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200"><Mail size={15} /> {tr('Import par courriel', 'Email import')}{newDossiers.length > 0 && <span className="ml-1 grid h-4 min-w-4 place-items-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">{newDossiers.length}</span>}</button>}
          {!delMode && <button onClick={startNewT} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700"><Plus size={15} /> {tr('Nouveau transformateur', 'New transformer')}</button>}
          {delMode && (<>
            <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600" onClick={selectAllFiltered}>{filtered.length > 0 && filtered.every((x: Dossier) => selected[x.id!]) ? tr('Tout désélectionner', 'Deselect all') : tr('Tout sélectionner', 'Select all')}</button>
            <button className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50" disabled={!selCount || assembling} onClick={assembleReport} title={tr('Assembler un rapport PDF de tous les transformateurs sélectionnés (même client)', 'Assemble a PDF report of all selected transformers (same client)')}>{assembling ? <Loader2 size={15} className="animate-spin" /> : '📄'} {tr('Assembler le rapport', 'Assemble report')} ({selCount})</button>
            <button className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50" disabled={!selCount} onClick={deleteSelected}>{tr('Supprimer la sélection', 'Delete selection')} ({selCount})</button>
            <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600" onClick={exitDelMode}>{tr('Terminer', 'Done')}</button>
          </>)}
        </div>
      </div>

      {/* Bannière : nouveaux résultats reçus par courriel à valider (cliquable -> panneau d'import). */}
      {newDossiers.length > 0 && (
        <button onClick={openInbound} className="flex w-full items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-left text-sm font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Mail size={16} /> {tr(`${newDossiers.length} transformateur(s) avec de nouveaux résultats reçus par courriel — à valider.`, `${newDossiers.length} transformer(s) with new results received by email — to review.`)}
        </button>
      )}

      {/* Import PDF (drag) */}
      <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const fs = Array.from(e.dataTransfer.files || []); if (fs.length) handleImportFiles(fs); }}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center ${dragOver ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10' : 'border-gray-300 dark:border-gray-600'}`}>
        {importing ? <Loader2 className="animate-spin text-rose-500" /> : <Upload className="text-gray-400" />}
        {importing && importProgress && importProgress.total > 1
          ? <p className="text-sm font-semibold text-rose-600 dark:text-rose-300">{tr(`Extraction IA… lot ${importProgress.done}/${importProgress.total}`, `AI extraction… batch ${importProgress.done}/${importProgress.total}`)}</p>
          : <p className="text-sm text-gray-600 dark:text-gray-300">{tr('Glissez un PDF de labo OU un export Excel/CSV (InsideView/LIMS) ici — PDF : extraction IA par lots ; Excel : mappage direct, fusion par date', 'Drop a lab PDF OR an Excel/CSV export (InsideView/LIMS) here — PDF: batched AI extraction; Excel: direct mapping, merge by date')}</p>}
        <input ref={fileRef} type="file" multiple accept="application/pdf,.pdf,.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" className="hidden" onChange={e => { const fs = Array.from(e.target.files || []); if (fs.length) handleImportFiles(fs); e.currentTarget.value = ''; }} />
        <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold dark:border-gray-600">📄 {tr('Importer PDF / Excel (plusieurs)', 'Import PDF / Excel (multiple)')}</button>
      </div>

      {/* Recherche + filtres (filtres repliés dans un hamburger sous 640px) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-lg"><Search size={14} className="absolute left-2 top-2.5 text-gray-400" /><input className={`${inp} w-full pl-7`} placeholder={tr('Rechercher (N° série, client, identification)…', 'Search (serial no., client, identification)…')} value={query} onChange={e => setQuery(e.target.value)} /></div>
        <button onClick={() => setFiltersOpen(o => !o)} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold dark:border-gray-600 sm:hidden">☰ {tr('Filtres', 'Filters')}{(condFilter || pcbFilter || dueFilter !== 'all' || treatFilter !== 'all' || siteFilter) ? ' •' : ''}</button>
      </div>
      <div className={`${filtersOpen ? 'flex' : 'hidden'} flex-wrap items-center gap-2 sm:flex`}>
        {filterTabs.map(([k, lbl, cnt, col]) => (
          <button key={k} onClick={() => pickDue(k)} className="rounded-full border px-3 py-1 text-xs font-semibold" style={dueFilter === k ? { background: col, color: '#fff', borderColor: col } : { color: col, borderColor: col }}>
            {lbl} <span className="ml-1 rounded-full bg-black/10 px-1.5">{cnt}</span>
          </button>
        ))}
        <span className="mx-0.5 h-4 w-px bg-gray-300 dark:bg-gray-600" />
        {([['all', tr('Tous', 'All'), null], ['todo', tr('À traiter', 'To treat'), todoCount], ['done', tr('Traités', 'Treated'), null]] as const).map(([k, lbl, cnt]) => (
          <button key={k} onClick={() => pickTreat(k)} className="rounded-full border px-3 py-1 text-xs font-semibold" style={treatFilter === k ? { background: '#f4a261', color: '#fff', borderColor: '#f4a261' } : { color: '#b45309', borderColor: '#e0a96d' }}>
            {lbl}{cnt != null ? <span className="ml-1 rounded-full bg-black/10 px-1.5">{cnt}</span> : null}
          </button>
        ))}
        <span className="mx-0.5 h-4 w-px bg-gray-300 dark:bg-gray-600" />
        <button onClick={pickCond} title={tr('Transformateurs en condition élevée (≥ 3) — suivi rapproché', 'Transformers in elevated condition (≥ 3) — close follow-up')} className="rounded-full border px-3 py-1 text-xs font-semibold" style={condFilter ? { background: '#e63946', color: '#fff', borderColor: '#e63946' } : { color: '#e63946', borderColor: '#e63946' }}>⚠ {tr('Suivi rapproché', 'Close follow-up')}</button>
        <button onClick={pickPcb} title={tr('BPC détecté (traces 2-50 ppm ou présent ≥ 50 ppm)', 'PCB detected (traces 2-50 ppm or present ≥ 50 ppm)')} className="rounded-full border px-3 py-1 text-xs font-semibold" style={pcbFilter ? { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' } : { color: '#7c3aed', borderColor: '#7c3aed' }}>🧪 {tr('BPC détecté', 'PCB detected')}</button>
        {sitesTree.length > 0 && (
          <select className={inp} value={siteFilter} onChange={e => setSiteFilter(e.target.value)} title={tr('Filtrer par site', 'Filter by site')}>
            <option value="">{tr('Tous les sites', 'All sites')}</option>
            {sitesTree.map((s: SiteNode) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-gray-500">{tr('Trier par', 'Sort by')} :</span>
          <select className={inp} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="due">{tr('Reprise à venir', 'Upcoming recheck')}</option>
            <option value="alert">{tr("Niveau d'alerte (pire → mieux)", 'Alert level (worst → best)')}</option>
          </select>
        </div>
      </div>

      {/* Formulaire nouveau transformateur */}
      {newT && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-lg font-bold">{tr('Nouveau transformateur — Équipement', 'New transformer — Equipment')}</h2>
          {EQUIP_GROUPS.map((grp: any) => (
            <div key={grp.id} className="mb-3">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">{lang === 'en' ? grp.en : grp.fr}</div>
              <div className="grid gap-2 sm:grid-cols-3">
                {EQUIP_FIELDS.filter((f: any) => f.group === grp.id).map((f: any) => (
                  <label key={f.key} className="block"><span className="mb-1 block text-[11px] font-semibold text-gray-500">{lang === 'en' ? f.en : f.fr}</span>
                    <input className={`${inp} w-full`} type={f.num ? 'number' : 'text'} value={(newT as any)[f.key] ?? ''} placeholder={f.ph || ''} onChange={e => setNewT({ ...newT, [f.key]: f.num ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value })} /></label>
                ))}
              </div>
            </div>
          ))}
          {newT.kv ? <p className="text-[11px] text-gray-500">{tr('Classe de tension détectée :', 'Detected voltage class:')} <b>{voltageClass(newT.kv, lang).label}</b> {tr("— les seuils huile s'ajustent (IEEE C57.106).", '— oil thresholds adjust (IEEE C57.106).')}</p> : null}
          <div className="mt-3 flex gap-2"><button onClick={saveNewT} disabled={busy} className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">{busy ? '…' : tr('Créer', 'Create')}</button><button onClick={() => setNewT(null)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600">{tr('Annuler', 'Cancel')}</button></div>
        </div>
      )}

      {dossiers.length === 0 && !newT && <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">{tr('Aucun transformateur. Clique « Nouveau transformateur ».', 'No transformer yet. Click "New transformer".')}</div>}
      {dossiers.length > 0 && filtered.length === 0 && <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">{tr('Aucun résultat pour cette recherche.', 'No results for this search.')}</div>}

      <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((d: Dossier) => {
          const last = d.id ? lastByDossier[d.id] : undefined;
          // État de GAZ : dernière mesure contenant des gaz (un relevé BPC/huile seul ne masque pas l'état ;
          // après réparation le dernier relevé de gaz reflète l'amélioration).
          const lastG = (d.id ? lastGasMeasure(measuresByDossier[d.id]) : undefined) || last;
          const worst = lastG ? worstCondition(lastG) : null;
          const zone = lastG ? duvalZone(duvalPct({ ch4: +(lastG.ch4 || 0), c2h4: +(lastG.c2h4 || 0), c2h2: +(lastG.c2h2 || 0) }), lang) : null;
          const isSel = !!selected[d.id!];
          const nextD = effectiveNextDate(d.extra, lastG);
          const due = dueStatusByDate(nextD);
          const dueColor = due.code === 'overdue' ? '#e63946' : due.code === 'soon' ? '#f4a261' : due.code === 'ok' ? '#2a9d8f' : '#999';
          const dueLabel = due.code === 'overdue' ? tr('En retard', 'Overdue') : due.code === 'soon' ? tr('Bientôt dû', 'Due soon') : due.code === 'ok' ? tr('À jour', 'Up to date') : '—';
          // Échéance d'inspection de routine (extra.next_inspection, posée par le module d'inspection).
          const inspNext = d.extra?.next_inspection || null;
          const insp = inspNext ? dueStatusByDate(inspNext) : null;
          const inspColor = !insp ? '#999' : insp.code === 'overdue' ? '#e63946' : insp.code === 'soon' ? '#f4a261' : '#2a9d8f';
          const inspLabel = !insp ? '' : insp.code === 'overdue' ? tr('Inspection en retard', 'Inspection overdue') : insp.code === 'soon' ? tr('Inspection bientôt', 'Inspection soon') : tr('Inspection à jour', 'Inspection up to date');
          // BPC : flag de conformité (la valeur ppm la plus récente connue).
          const pcb = pcbStatus(latestPcb(measuresByDossier?.[d.id!] || (last ? [last] : [])), lang);
          const isOltc = !!d.extra?.is_oltc;
          const newCount = (measuresByDossier?.[d.id!] || []).filter((m: any) => m.seen === false).length; // résultats reçus par courriel non vus
          const treated = d.treated !== false; // drapeau manuel persistant (false = à traiter)
          const parentSerie = d.extra?.parent_serie || '';
          const parentName = parentSerie ? (dossiers.find((x: Dossier) => x.serie === parentSerie)?.ident || `SN ${parentSerie}`) : '';
          return (
            <div key={d.id} onClick={() => (delMode ? toggleSel(d.id!) : openFiche(d))}
              className={`flex h-full cursor-pointer flex-col rounded-2xl border bg-white p-3 transition hover:shadow-md dark:bg-gray-800 ${delMode && isSel ? 'border-rose-500 ring-2 ring-rose-200' : 'border-gray-200 dark:border-gray-700'}`}
              style={due.code === 'overdue' && !delMode ? { borderLeft: '4px solid #e63946' } : undefined}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {delMode && <span className={`mt-0.5 grid h-4 w-4 place-items-center rounded border text-[10px] ${isSel ? 'border-rose-500 bg-rose-500 text-white' : 'border-gray-300'}`}>{isSel ? '✓' : ''}</span>}
                  <div>
                    {/* Ordre : Nom du client / Nom d'équipement / n° de série · emplacement */}
                    <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">{isOltc && <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white">OLTC</span>}{d.company || d.client || tr('Client —', 'Client —')}</div>
                    <div className="text-[12px] font-semibold text-gray-700 dark:text-gray-200">{d.ident || '—'}</div>
                    <div className="text-[11px] text-gray-500">{d.serie ? `SN ${d.serie}` : tr('SN —', 'SN —')}{d.client ? ` · 📍 ${d.client}` : ''}{d.kv ? ` · ${d.kv} kV` : ''}</div>
                    {siteLabel(sitesTree, d.extra?.site_id, d.extra?.department_id) && <div className="text-[11px] font-medium text-cyan-700 dark:text-cyan-400">📍 {siteLabel(sitesTree, d.extra?.site_id, d.extra?.department_id)}</div>}{isOltc && parentName && <div className="text-[11px] text-indigo-500">↳ {tr('Transfo.', 'Xfmr')} {parentName}</div>}
                  </div>
                </div>
                {isOltc
                  ? <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">OLTC</span>
                  : worst != null && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: COND_COLORS[worst] }}>{COND_LABELS[worst]}</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <button onClick={(e) => { e.stopPropagation(); onToggleTreated(d.id!, !treated); }} title={treated ? tr('Marquer à traiter', 'Mark as to-do') : tr('Marquer comme traité', 'Mark as treated')} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${treated ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-500 text-white'}`}>{treated ? `✓ ${tr('Traité', 'Treated')}` : `◦ ${tr('À traiter', 'To treat')}`}</button>
                {newCount > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">✦ {tr('Nouveau', 'New')}{newCount > 1 ? ` ×${newCount}` : ''}</span>}
                {nextD && <span className="inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold" style={{ background: dueColor + '22', color: dueColor, borderColor: dueColor }}>
                  {due.code === 'overdue' ? '⚠ ' : due.code === 'soon' ? '◷ ' : '✓ '}{dueLabel} · {nextD}{due.days != null ? ` (${due.days < 0 ? `${-due.days} ${tr('j. de retard', 'days late')}` : `${due.days} ${tr('j. restants', 'days left')}`})` : ''}
                </span>}
                {inspNext && <span className="inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold" style={{ background: inspColor + '22', color: inspColor, borderColor: inspColor }}>
                  🛠 {inspLabel} · {inspNext}{insp?.days != null ? ` (${insp.days < 0 ? `${-insp.days} ${tr('j. de retard', 'days late')}` : `${insp.days} ${tr('j. restants', 'days left')}`})` : ''}
                </span>}
                {pcb.code !== 'unknown' && <span className="inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold" style={{ background: pcb.color + '22', color: pcb.color, borderColor: pcb.color }}>
                  🧪 {pcb.label}{pcb.value != null ? ` · ${pcb.value} ppm` : ''}
                </span>}
              </div>
              <div className="mt-auto flex items-center gap-2 border-t border-gray-100 pt-2 text-[11px] text-gray-500 dark:border-gray-700/60">
                <span>{(measuresByDossier?.[d.id!]?.length) ?? 0} {tr('mesure(s)', 'measurement(s)')}</span>
                {last && <span>· {tr('dern.', 'last')} {last.sample_date} · Duval {zone?.code}</span>}
                {!delMode && <button className="ml-auto text-gray-300 hover:text-red-500" onClick={e => { e.stopPropagation(); onDeleteOne(d.id!); }}><Trash2 size={13} /></button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── APERÇU IMPORT (fusion en colonnes) ──
function ImportPreview({ tr, lang, importPreview, setImportPreview, applyImport }: any) {
  const items: any[] = importPreview.items || [];
  const multi = items.length > 1;
  const setMode = (i: number, mode: 'merge' | 'create') => setImportPreview({ ...importPreview, items: items.map((it, idx) => (idx === i ? { ...it, mode } : it)) });
  const setUseNew = (i: number, key: string, val: boolean) => setImportPreview({ ...importPreview, items: items.map((it, idx) => (idx === i ? { ...it, useNew: { ...(it.useNew || {}), [key]: val } } : it)) });
  const oilRows = (measures: Measure[]) => OIL_FIELDS.filter(f => measures.some(m => m.oil_quality?.[f.key] != null));
  const furanRows = (measures: Measure[]) => FURAN_FIELDS.filter(f => measures.some(m => m.oil_quality?.[f.key] != null));
  return (
    <Modal onClose={() => setImportPreview(null)}>
      <h2 className="mb-1 text-lg font-bold">📄 {tr("Vérifie les données extraites avant d'enregistrer.", 'Review extracted data before saving.')}</h2>
      {multi && <p className="mb-3 text-sm font-semibold text-rose-600">{items.length} {tr('transformateurs détectés — séparés ci-dessous (un dossier chacun).', 'transformers detected — separated below (one record each).')}</p>}
      <div className="space-y-4">
        {items.map((it, i) => {
          const merging = it.mode !== 'create' && it.match;
          const measures: Measure[] = it.measures;
          return (
            <div key={i} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm"><b>{it.eq.ident || '—'}</b>{it.eq.serie ? ` · SN ${it.eq.serie}` : ''}{it.eq.kv ? ` · ${it.eq.kv} kV` : ''}{it.eq.manufacturer ? ` · ${it.eq.manufacturer}` : ''} <span className="ml-1 text-emerald-600">{measures.length} {tr('mesure(s)', 'meas.')}</span></div>
                {it.match && (
                  <div className="flex gap-1">
                    <button onClick={() => setMode(i, 'merge')} className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${merging ? 'bg-emerald-600 text-white' : 'border border-gray-300 text-gray-600 dark:border-gray-600'}`}>🔗 {tr('Fusionner', 'Merge')}</button>
                    <button onClick={() => setMode(i, 'create')} className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${!merging ? 'bg-rose-600 text-white' : 'border border-gray-300 text-gray-600 dark:border-gray-600'}`}>＋ {tr('Créer', 'Create')}</button>
                  </div>
                )}
              </div>
              {it.match && merging && <div className="mb-2 text-xs text-emerald-700 dark:text-emerald-300">🔗 {tr('Fusion avec', 'Merge with')} <b>{it.match.ident}</b> — <b>{it.newMeasures.length}</b> {tr('nouvelle(s)', 'new')}{it.dupCount > 0 && <span className="text-amber-600"> · {it.dupCount} {tr('déjà présente(s)', 'already present')}</span>}</div>}
              {merging && (it.conflicts || []).length > 0 && (
                <div className="mb-2 rounded-lg border border-amber-300 bg-amber-50 p-2 dark:border-amber-500/30 dark:bg-amber-500/10">
                  <div className="mb-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">⚠ {tr('Le n° de série correspond, mais ces noms diffèrent — choisis lequel garder :', 'Serial matches, but these names differ — choose which to keep:')}</div>
                  {(it.conflicts || []).map((c: any) => { const useNew = !!it.useNew?.[c.key]; return (
                    <div key={c.key} className="flex flex-wrap items-center gap-2 py-0.5 text-[11px]">
                      <span className="font-semibold text-gray-600 dark:text-gray-300">{c.label} :</span>
                      <button onClick={() => setUseNew(i, c.key, false)} className={`rounded-full px-2 py-0.5 font-semibold ${!useNew ? 'bg-emerald-600 text-white' : 'border border-gray-300 text-gray-600 dark:border-gray-600'}`} title={tr('Garder l\'existant', 'Keep existing')}>{c.existing}</button>
                      <button onClick={() => setUseNew(i, c.key, true)} className={`rounded-full px-2 py-0.5 font-semibold ${useNew ? 'bg-rose-600 text-white' : 'border border-gray-300 text-gray-600 dark:border-gray-600'}`} title={tr('Utiliser le nouveau', 'Use new')}>{c.incoming} <span className="opacity-70">({tr('nouveau', 'new')})</span></button>
                    </div>
                  ); })}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr><th className="px-2 py-1 text-left font-semibold">{tr('Paramètre', 'Parameter')}</th>{measures.map((m, k) => <th key={k} className="px-2 py-1 text-right font-semibold">{m.sample_date}</th>)}</tr></thead>
                  <tbody>
                    {GAS_FIELDS.map(g => <tr key={g.u} className="border-t border-gray-100 dark:border-gray-700/50"><td className="px-2 py-1">{gl(g.u, lang)}</td>{measures.map((m: any, k) => <td key={k} className="px-2 py-1 text-right">{m[g.key] ?? '—'}</td>)}</tr>)}
                    {oilRows(measures).map(f => <tr key={f.key} className="border-t border-gray-100 dark:border-gray-700/50"><td className="px-2 py-1 italic">{fl(f, lang)}</td>{measures.map((m, k) => <td key={k} className="px-2 py-1 text-right">{m.oil_quality?.[f.key] ?? '—'}</td>)}</tr>)}
                    {furanRows(measures).map(f => <tr key={f.key} className="border-t border-gray-100 dark:border-gray-700/50"><td className="px-2 py-1 italic">{fl(f, lang)}</td>{measures.map((m, k) => <td key={k} className="px-2 py-1 text-right">{m.oil_quality?.[f.key] ?? '—'}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white" onClick={applyImport}>{multi ? tr(`Tout importer (${items.length})`, `Import all (${items.length})`) : tr('Importer', 'Import')}</button>
        <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600" onClick={() => setImportPreview(null)}>{tr('Annuler', 'Cancel')}</button>
      </div>
    </Modal>
  );
}
