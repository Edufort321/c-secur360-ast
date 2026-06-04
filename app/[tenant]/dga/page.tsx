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
import { useLanguage } from '@/contexts/LanguageContext';
import { useModuleEnabled } from '@/lib/modules/useModuleEnabled';
import { supabase } from '@/lib/supabase';
import { FlaskConical, Lock, Loader2, Plus, Search, Upload, Trash2, ArrowLeft } from 'lucide-react';
import {
  EQUIP_GROUPS, EQUIP_FIELDS, listDossiers, listAllMeasures, listMeasures, saveDossier, deleteDossier,
  saveMeasure, deleteMeasure, matchDossier, type Dossier, type Measure,
} from '@/lib/dga/dossiers';
import { diagnoseFull, type GasInput } from '@/lib/dga/diagnose';
import { duvalPct, duvalZone } from '@/lib/dga/duval';
import { dueStatusByDate } from '@/lib/dga/catalog';
import { GAS_FIELDS, OIL_FIELDS, FURAN_FIELDS, gl, fl, COND_LABELS, COND_COLORS, worstCondition, effectiveNextDate } from '@/lib/dga/fields';
import { voltageClass } from '@/lib/dga/oil';
import { TransfoView } from '@/components/dga/TransfoView';
import { SampleEntry, type SamplePayload } from '@/components/dga/SampleEntry';

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
  const [query, setQuery] = useState('');
  const [dueFilter, setDueFilter] = useState<'all' | 'overdue' | 'soon' | 'ok'>('all');
  const [delMode, setDelMode] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importErr, setImportErr] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>('/c-secur360-logo.png');
  // Confirmation in-app (window.confirm() est supprimé dans une PWA installée -> suppression sans avertissement).
  const [confirmAsk, setConfirmAsk] = useState<{ title: string; message: string; confirmLabel: string; onConfirm: () => void } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function reload() {
    const [ds, ms] = await Promise.all([listDossiers(tenant), listAllMeasures(tenant)]);
    setDossiers(ds); setAllMeasures(ms);
  }
  useEffect(() => { if (access === 'enabled') reload(); /* eslint-disable-next-line */ }, [access, tenant]);
  useEffect(() => {
    if (access !== 'enabled') return;
    (async () => { try { const { data } = await supabase.from('company_settings').select('logo_url').eq('tenant_id', tenant).maybeSingle(); if (data?.logo_url) setLogoUrl(data.logo_url); } catch { /* défaut */ } })();
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
    for (const d of dossiers) { const last = d.id ? lastByDossier[d.id] : undefined; const s = dueStatusByDate(effectiveNextDate(d.extra, last)).code; if (s === 'overdue') a.overdue++; else if (s === 'soon') a.soon++; else if (s === 'ok') a.ok++; }
    return a;
  }, [dossiers, lastByDossier]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dossiers.filter(d => {
      if (q && ![d.ident, d.client, d.serie, d.apparatus, d.description, d.company, d.equip_no].some(v => (v || '').toLowerCase().includes(q))) return false;
      if (dueFilter !== 'all') { const last = d.id ? lastByDossier[d.id] : undefined; if (dueStatusByDate(effectiveNextDate(d.extra, last)).code !== dueFilter) return false; }
      return true;
    });
  }, [dossiers, query, dueFilter, lastByDossier]);

  const selected_d = dossiers.find(d => d.id === selId) || null;

  // ── CRUD ──
  async function saveDossierFromView(d: Dossier) {
    const res = await saveDossier(tenant, d);
    if (res.error) { setNotice('Erreur : ' + res.error); return; }
    await reload();
  }
  async function onNewMeasureSave(p: SamplePayload) {
    if (!selId) return;
    const dg = diagnoseFull(p.gas);
    const res = await saveMeasure(tenant, selId, {
      sample_date: p.sample_date, ...p.gas, o2: p.o2, n2: p.n2, oil_quality: p.oil_quality,
      tdcg: dg.tdcg, condition: dg.condition, duval: dg.duval, fault: tr(dg.fault.fr, dg.fault.en), methods: dg.methods, source: 'manual',
    });
    if (res.error) { setNotice('Erreur : ' + res.error); return; }
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

  // ── Import PDF (drag/bouton) → aperçu de fusion ──
  function mapEquip(eq: any): Dossier {
    return {
      ident: eq.identification || eq.equipment || ('Import ' + todayIso()), client: eq.location || '', serie: eq.serialNo || '',
      company: eq.company || '', contact: eq.contact || '', email: eq.email || '', equip_no: eq.equipNo || '', apparatus: eq.apparatusType || '',
      description: eq.description || '', kv: eq.kvClass ? Number(eq.kvClass) : null, mva: eq.maxMVA ? Number(eq.maxMVA) : null,
      oil_vol: eq.oilVolumeL ? Number(eq.oilVolumeL) : null, oil_type: eq.oilType || '', manufacturer: eq.manufacturer || '', year: eq.year ? String(eq.year) : '',
      sample_point: eq.samplingPoint || '',
    };
  }
  function mapMeasure(mm: any): Measure {
    const oil_quality: Record<string, any> = {};
    OIL_FIELDS.forEach(f => { if (mm[f.key] != null) oil_quality[f.key] = f.text ? String(mm[f.key]) : Number(mm[f.key]); });
    FURAN_FIELDS.forEach(f => { if (mm[f.key] != null) oil_quality[f.key] = Number(mm[f.key]); });
    return { sample_date: mm.date || null, h2: num(mm.H2), ch4: num(mm.CH4), c2h6: num(mm.C2H6), c2h4: num(mm.C2H4), c2h2: num(mm.C2H2), co: num(mm.CO), co2: num(mm.CO2), o2: mm.O2 != null ? num(mm.O2) : null, n2: mm.N2 != null ? num(mm.N2) : null, oil_quality };
  }
  async function handleImport(file: File) {
    if (!file) return;
    setImporting(true); setImportErr(null); setNotice(null);
    try {
      const b64 = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = () => rej(new Error('read')); r.readAsDataURL(file); });
      const resp = await fetch('/api/dga/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pdfBase64: b64 }) });
      const j = await resp.json();
      if (!resp.ok || j.error) throw new Error(j.error || 'extraction');
      const eq = j.equipment || {};
      const measuresN = (j.measurements || []).map(mapMeasure).sort((a: Measure, b: Measure) => String(a.sample_date).localeCompare(String(b.sample_date)));
      const match = matchDossier(dossiers, { serialNo: eq.serialNo, identification: eq.identification, equipment: eq.equipment });
      let newMeasures = measuresN, dupCount = 0;
      if (match?.id) { const existing = new Set((measuresByDossier[match.id] || []).filter(m => m.sample_date).map(m => m.sample_date)); newMeasures = measuresN.filter((m: Measure) => !existing.has(m.sample_date)); dupCount = measuresN.length - newMeasures.length; }
      setImportPreview({ rawEq: eq, eq: mapEquip(eq), measures: measuresN, match, newMeasures, dupCount });
    } catch (e: any) { setImportErr(e?.message || String(e)); }
    finally { setImporting(false); }
  }
  async function applyImport() {
    if (!importPreview) return;
    const { eq, match, newMeasures } = importPreview as { eq: Dossier; match: Dossier | null; newMeasures: Measure[] };
    try {
      let did: string;
      if (match?.id) {
        did = match.id;
        const patch: any = { ...match };
        for (const k of Object.keys(eq) as (keyof Dossier)[]) { if ((match as any)[k] == null || (match as any)[k] === '') (patch as any)[k] = (eq as any)[k]; }
        await saveDossier(tenant, patch);
      } else {
        const saved = await saveDossier(tenant, eq);
        if (saved.error || !saved.data?.id) throw new Error(saved.error || 'enregistrement');
        did = saved.data.id;
      }
      for (const m of newMeasures) {
        const gas: GasInput = { h2: num(m.h2), ch4: num(m.ch4), c2h6: num(m.c2h6), c2h4: num(m.c2h4), c2h2: num(m.c2h2), co: num(m.co), co2: num(m.co2) };
        const dg = diagnoseFull(gas);
        await saveMeasure(tenant, did, { ...m, tdcg: dg.tdcg, condition: dg.condition, duval: dg.duval, fault: tr(dg.fault.fr, dg.fault.en), methods: dg.methods, source: 'pdf' });
      }
      setImportPreview(null); await reload(); setSelId(did); setView('fiche');
      setNotice(match ? tr(`Fusionné au transformateur « ${match.ident} » : ${newMeasures.length} nouvelle(s) mesure(s).`, `Merged into "${match.ident}": ${newMeasures.length} new measurement(s).`) : tr(`Nouveau transformateur créé : ${newMeasures.length} mesure(s).`, `New transformer created: ${newMeasures.length} measurement(s).`));
    } catch (e: any) { setImportErr(e?.message || String(e)); }
  }

  if (access === 'loading') return <Shell tenant={tenant}><div className="grid place-items-center py-32 text-gray-400"><Loader2 className="animate-spin" /></div></Shell>;
  if (access === 'locked') return <Shell tenant={tenant}><div className="mx-auto max-w-md px-4 py-20 text-center"><Lock className="mx-auto text-gray-400" size={40} /><h1 className="mt-4 text-xl font-bold">{tr('Module non activé', 'Module not enabled')}</h1><p className="mt-2 text-sm text-gray-500">{tr("Le module DGA n'est pas inclus dans votre abonnement.", 'The DGA module is not in your subscription.')}</p></div></Shell>;

  return (
    <Shell tenant={tenant}>
      <div className={`mx-auto px-4 py-6 ${view === 'fiche' ? 'max-w-screen-2xl' : 'max-w-6xl'}`}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-600 text-white"><FlaskConical size={18} /></span>
            <div><h1 className="text-xl font-extrabold">{tr('Diagnostic de transformateurs', 'Transformer Diagnostics')}</h1>
              <p className="text-xs text-gray-500">IEEE C57.104-2019 / C57.106 · Duval · ASTM · {tr('Furanes (DP)', 'Furans (DP)')}</p></div>
          </div>
          {view !== 'list' && <button onClick={() => { setView('list'); setSelId(null); reload(); }} className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:underline dark:text-gray-300"><ArrowLeft size={15} /> {tr('Tous les transformateurs', 'All transformers')}</button>}
        </div>
        {notice && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{notice}</div>}

        {view === 'list' && (
          <ListView {...{ tr, lang, dossiers, filtered, lastByDossier, measuresByDossier, dueCounts, query, setQuery, dueFilter, setDueFilter, delMode, setDelMode, selected, toggleSel, exitDelMode, selectAllFiltered, deleteSelected, onDeleteOne, importing, dragOver, setDragOver, fileRef, handleImport, newT, setNewT, startNewT, saveNewT, busy, openFiche: (d: Dossier) => { setSelId(d.id!); setView('fiche'); } }} />
        )}

        {view === 'fiche' && selected_d && (
          <TransfoView
            tenant={tenant} lang={lang} tr={tr} dossier={selected_d} measures={measures} logoUrl={logoUrl}
            onSave={saveDossierFromView} onNewMeasure={() => setView('newMeasure')} onDeleteMeasure={delMeasure} onDeleteDossier={delDossier} setNotice={setNotice}
          />
        )}

        {view === 'newMeasure' && selected_d && (
          <SampleEntry lang={lang} tr={tr} dossierIdent={selected_d.ident} onSave={onNewMeasureSave} onCancel={() => setView('fiche')} />
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
  const { tr, lang, dossiers, filtered, lastByDossier, measuresByDossier, dueCounts, query, setQuery, dueFilter, setDueFilter, delMode, setDelMode, selected, toggleSel, exitDelMode, selectAllFiltered, deleteSelected, onDeleteOne, importing, dragOver, setDragOver, fileRef, handleImport, newT, setNewT, startNewT, saveNewT, busy, openFiche } = p;
  const inp = 'rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-rose-500 dark:border-gray-600';
  const selCount = Object.values(selected).filter(Boolean).length;
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
          {!delMode && dossiers.length > 0 && <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600" onClick={() => setDelMode(true)}>🗑 {tr('Gérer', 'Manage')}</button>}
          {!delMode && <button onClick={startNewT} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700"><Plus size={15} /> {tr('Nouveau transformateur', 'New transformer')}</button>}
          {delMode && (<>
            <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600" onClick={selectAllFiltered}>{filtered.length > 0 && filtered.every((x: Dossier) => selected[x.id!]) ? tr('Tout désélectionner', 'Deselect all') : tr('Tout sélectionner', 'Select all')}</button>
            <button className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50" disabled={!selCount} onClick={deleteSelected}>{tr('Supprimer la sélection', 'Delete selection')} ({selCount})</button>
            <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600" onClick={exitDelMode}>{tr('Terminer', 'Done')}</button>
          </>)}
        </div>
      </div>

      {/* Import PDF (drag) */}
      <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleImport(f); }}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center ${dragOver ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10' : 'border-gray-300 dark:border-gray-600'}`}>
        {importing ? <Loader2 className="animate-spin text-rose-500" /> : <Upload className="text-gray-400" />}
        <p className="text-sm text-gray-600 dark:text-gray-300">{tr('Glissez un PDF de labo (DGA) ici — extraction IA, fusion par date', 'Drop a lab PDF (DGA) here — AI extraction, merge by date')}</p>
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); e.currentTarget.value = ''; }} />
        <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold dark:border-gray-600">📄 {tr('Importer PDF', 'Import PDF')}</button>
      </div>

      {/* Recherche + filtres */}
      <div className="relative"><Search size={14} className="absolute left-2 top-2.5 text-gray-400" /><input className={`${inp} w-full max-w-lg pl-7`} placeholder={tr('Rechercher (N° série, client, identification)…', 'Search (serial no., client, identification)…')} value={query} onChange={e => setQuery(e.target.value)} /></div>
      <div className="flex flex-wrap gap-2">
        {filterTabs.map(([k, lbl, cnt, col]) => (
          <button key={k} onClick={() => setDueFilter(k)} className="rounded-full border px-3 py-1 text-xs font-semibold" style={dueFilter === k ? { background: col, color: '#fff', borderColor: col } : { color: col, borderColor: col }}>
            {lbl} <span className="ml-1 rounded-full bg-black/10 px-1.5">{cnt}</span>
          </button>
        ))}
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d: Dossier) => {
          const last = d.id ? lastByDossier[d.id] : undefined;
          const worst = last ? worstCondition(last) : null;
          const zone = last ? duvalZone(duvalPct({ ch4: +(last.ch4 || 0), c2h4: +(last.c2h4 || 0), c2h2: +(last.c2h2 || 0) }), lang) : null;
          const isSel = !!selected[d.id!];
          const nextD = effectiveNextDate(d.extra, last);
          const due = dueStatusByDate(nextD);
          const dueColor = due.code === 'overdue' ? '#e63946' : due.code === 'soon' ? '#f4a261' : due.code === 'ok' ? '#2a9d8f' : '#999';
          const dueLabel = due.code === 'overdue' ? tr('En retard', 'Overdue') : due.code === 'soon' ? tr('Bientôt dû', 'Due soon') : due.code === 'ok' ? tr('À jour', 'Up to date') : '—';
          return (
            <div key={d.id} onClick={() => (delMode ? toggleSel(d.id!) : openFiche(d))}
              className={`cursor-pointer rounded-2xl border bg-white p-3 transition dark:bg-gray-800 ${delMode && isSel ? 'border-rose-500 ring-2 ring-rose-200' : 'border-gray-200 dark:border-gray-700'}`}
              style={due.code === 'overdue' && !delMode ? { borderLeft: '4px solid #e63946' } : undefined}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {delMode && <span className={`mt-0.5 grid h-4 w-4 place-items-center rounded border text-[10px] ${isSel ? 'border-rose-500 bg-rose-500 text-white' : 'border-gray-300'}`}>{isSel ? '✓' : ''}</span>}
                  <div><div className="font-bold text-gray-900 dark:text-gray-100">{d.ident}</div><div className="text-[11px] text-gray-500">{d.client || '—'}{d.serie ? ` · SN ${d.serie}` : ''}{d.kv ? ` · ${d.kv} kV` : ''}</div></div>
                </div>
                {worst != null && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: COND_COLORS[worst] }}>{COND_LABELS[worst]}</span>}
              </div>
              {nextD && <div className="mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold" style={{ background: dueColor + '22', color: dueColor, borderColor: dueColor }}>
                {due.code === 'overdue' ? '⚠ ' : due.code === 'soon' ? '◷ ' : '✓ '}{dueLabel} · {nextD}{due.days != null ? ` (${due.days < 0 ? `${-due.days} ${tr('j. de retard', 'days late')}` : `${due.days} ${tr('j. restants', 'days left')}`})` : ''}
              </div>}
              <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
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
  const { eq, measures, match, newMeasures, dupCount } = importPreview;
  const isNew = (m: Measure) => !match || newMeasures.some((nm: Measure) => nm.sample_date === m.sample_date);
  return (
    <Modal onClose={() => setImportPreview(null)}>
      <h2 className="mb-3 text-lg font-bold">📄 {tr('Vérifie les données extraites avant d\'enregistrer.', 'Review extracted data before saving.')}</h2>
      {match && (
        <div className="mb-3 rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-2 dark:bg-emerald-500/10">
          <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">🔗 {tr('Transformateur existant trouvé', 'Existing transformer found')}</div>
          <div className="mt-0.5 text-xs"><b>{match.ident}</b>{match.serie ? ` · SN ${match.serie}` : ''}</div>
          <div className="mt-1 text-xs">{tr('Les nouvelles mesures seront ajoutées.', 'New measurements will be added.')} <b className="text-emerald-700 dark:text-emerald-300">{newMeasures.length} {tr('nouvelle(s) mesure(s)', 'new measurement(s)')}</b>{dupCount > 0 && <span className="text-amber-600"> · {dupCount} {tr('déjà présente(s), ignorée(s)', 'already present, skipped')}</span>}</div>
          {newMeasures.length === 0 && <div className="mt-1 text-xs font-semibold text-red-600">{tr('Aucune nouvelle mesure (toutes déjà présentes).', 'No new measurements (all already present).')}</div>}
        </div>
      )}
      <div className="mb-2 text-sm"><b>{eq.ident || '—'}</b>{eq.kv ? ` · ${eq.kv} kV` : ''}{eq.manufacturer ? ` · ${eq.manufacturer}` : ''} <span className="ml-2 text-emerald-600">{measures.length} {tr('mesure(s) trouvée(s)', 'measurement(s) found')}</span></div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr><th className="px-2 py-1 text-left font-semibold">{tr('Paramètre', 'Parameter')}</th>{measures.map((m: Measure, i: number) => <th key={i} className="px-2 py-1 text-right font-semibold" style={{ color: isNew(m) ? '#1e7d6f' : '#b0a290' }}>{m.sample_date}{!isNew(m) ? ' ✓' : ''}</th>)}</tr></thead>
          <tbody>
            {GAS_FIELDS.map(g => <tr key={g.u} className="border-t border-gray-100 dark:border-gray-700/50"><td className="px-2 py-1">{gl(g.u, lang)}</td>{measures.map((m: any, i: number) => <td key={i} className="px-2 py-1 text-right">{m[g.key] ?? '—'}</td>)}</tr>)}
            {OIL_FIELDS.filter(f => measures.some((m: Measure) => m.oil_quality?.[f.key] != null)).map(f => <tr key={f.key} className="border-t border-gray-100 dark:border-gray-700/50"><td className="px-2 py-1 italic">{fl(f, lang)}</td>{measures.map((m: Measure, i: number) => <td key={i} className="px-2 py-1 text-right">{m.oil_quality?.[f.key] ?? '—'}</td>)}</tr>)}
            {FURAN_FIELDS.filter(f => measures.some((m: Measure) => m.oil_quality?.[f.key] != null)).map(f => <tr key={f.key} className="border-t border-gray-100 dark:border-gray-700/50"><td className="px-2 py-1 italic">{fl(f, lang)}</td>{measures.map((m: Measure, i: number) => <td key={i} className="px-2 py-1 text-right">{m.oil_quality?.[f.key] ?? '—'}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {match ? (<>
          <button className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50" disabled={!newMeasures.length} onClick={applyImport}>🔗 {tr('Fusionner', 'Merge')}</button>
          <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600" onClick={() => setImportPreview({ ...importPreview, match: null, newMeasures: measures, dupCount: 0 })}>{tr('Créer un nouveau à la place', 'Create a new one instead')}</button>
        </>) : <button className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white" onClick={applyImport}>{tr('Appliquer', 'Apply')}</button>}
        <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600" onClick={() => setImportPreview(null)}>{tr('Annuler', 'Cancel')}</button>
      </div>
    </Modal>
  );
}
