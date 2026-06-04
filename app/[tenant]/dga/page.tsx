'use client';

// Module DGA complet — port natif de dga-diagnostic.html vers C-Secur360.
// Données Supabase, IA serveur (extract PDF + analyse experte), recherche/flags/filtres client+série,
// import drag PDF, historique, temps réel. Shell commun (header/FR-EN/jour-nuit), gaté par abonnement.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { PortalHeader } from '@/components/PortalHeader';
import { BackButton } from '@/components/BackButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useModuleEnabled } from '@/lib/modules/useModuleEnabled';
import { supabase } from '@/lib/supabase';
import { diagnoseFull, estimateDP, paperState, type GasInput } from '@/lib/dga/diagnose';
import {
  EQUIP_FIELDS, listDossiers, listAllMeasures, listMeasures, saveDossier, deleteDossier,
  saveMeasure, deleteMeasure, dueStatus, matchDossier, type Dossier, type Measure,
} from '@/lib/dga/dossiers';
import { FlaskConical, Lock, Loader2, Save, Plus, Search, Upload, Activity, Trash2, ArrowLeft, FileText, Sparkles } from 'lucide-react';
import { DuvalTriangle } from '@/components/dga/DuvalTriangle';
import { Trends } from '@/components/dga/Trends';
import { generateDgaReport } from '@/lib/dga/report';

const COND_COLOR: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  2: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  3: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  4: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};
const DUE_COLOR: Record<string, string> = {
  overdue: 'bg-red-100 text-red-700', soon: 'bg-amber-100 text-amber-700', uptodate: 'bg-emerald-100 text-emerald-700', none: 'bg-gray-100 text-gray-500',
};
const GASES: { key: keyof GasInput; label: string }[] = [
  { key: 'h2', label: 'H₂' }, { key: 'ch4', label: 'CH₄' }, { key: 'c2h6', label: 'C₂H₆' },
  { key: 'c2h4', label: 'C₂H₄' }, { key: 'c2h2', label: 'C₂H₂' }, { key: 'co', label: 'CO' }, { key: 'co2', label: 'CO₂' },
];
const emptyDraft = (): Dossier => { const o: any = { ident: '', flag: '' }; EQUIP_FIELDS.forEach(f => { if (o[f.key] === undefined) o[f.key] = ''; }); return o; };
// Auto-flag selon l'analyseur : condition/sévérité 4 -> critique, 3 -> surveillance, sinon ok.
const autoFlag = (c?: number) => (c === 4 ? 'critique' : c === 3 ? 'surveillance' : 'ok');

export default function DgaPage() {
  const params = useParams<{ tenant: string }>();
  const tenant = String(params?.tenant || '');
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const access = useModuleEnabled(tenant, 'dga', false);

  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [allMeasures, setAllMeasures] = useState<Measure[]>([]);
  const [view, setView] = useState<'list' | 'fiche'>('list');
  const [draft, setDraft] = useState<Dossier | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [fClient, setFClient] = useState('');
  const [fSerie, setFSerie] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function reload() {
    const [ds, ms] = await Promise.all([listDossiers(tenant), listAllMeasures(tenant)]);
    setDossiers(ds); setAllMeasures(ms);
  }
  useEffect(() => { if (access === 'enabled') reload(); /* eslint-disable-next-line */ }, [access, tenant]);
  // Temps réel
  useEffect(() => {
    if (access !== 'enabled') return;
    const ch = supabase.channel('dga-' + tenant)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dga_dossiers', filter: `tenant_id=eq.${tenant}` }, () => reload())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dga_measures', filter: `tenant_id=eq.${tenant}` }, () => reload())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    /* eslint-disable-next-line */
  }, [access, tenant]);

  const lastByDossier = useMemo(() => {
    const m: Record<string, Measure> = {};
    for (const x of allMeasures) { if (x.dossier_id) m[x.dossier_id] = x; } // ordonné asc -> dernier écrase
    return m;
  }, [allMeasures]);

  const stats = useMemo(() => {
    let overdue = 0, soon = 0, uptodate = 0, surveillance = 0;
    for (const d of dossiers) {
      const last = d.id ? lastByDossier[d.id] : undefined;
      const st = dueStatus(last?.sample_date, last?.condition);
      if (st === 'overdue') overdue++; else if (st === 'soon') soon++; else if (st === 'uptodate') uptodate++;
      if (d.flag === 'surveillance' || (last?.condition || 0) >= 3) surveillance++;
    }
    return { all: dossiers.length, overdue, soon, uptodate, surveillance };
  }, [dossiers, lastByDossier]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dossiers.filter(d => {
      if (fClient && !(d.client || '').toLowerCase().includes(fClient.toLowerCase())) return false;
      if (fSerie && !(d.serie || '').toLowerCase().includes(fSerie.toLowerCase())) return false;
      if (!q) return true;
      return [d.ident, d.client, d.serie, d.company, d.equip_no].some(v => (v || '').toLowerCase().includes(q));
    });
  }, [dossiers, query, fClient, fSerie]);

  // ── Import PDF (drag) → IA extract ──
  async function handleImport(file: File) {
    if (!file) return;
    setImporting(true); setNotice(null);
    try {
      const b64 = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = () => rej(new Error('read')); r.readAsDataURL(file); });
      const resp = await fetch('/api/dga/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pdfBase64: b64 }) });
      const j = await resp.json();
      if (!resp.ok || j.error) throw new Error(j.error || 'extraction');
      const eq = j.equipment || {};
      // Assemblage intelligent : rattacher au dossier existant (n° série / nom) sinon créer.
      const match = matchDossier(dossiers, eq);
      const fields: Dossier = {
        ident: eq.identification || eq.equipment || file.name.replace(/\.pdf$/i, ''), client: eq.location || '', serie: eq.serialNo || '',
        company: eq.company || '', contact: eq.contact || '', email: eq.email || '', equip_no: eq.equipNo || '', apparatus: eq.apparatusType || '',
        description: eq.description || '', kv: eq.kvClass ? Number(eq.kvClass) : null, mva: eq.maxMVA ? Number(eq.maxMVA) : null,
        oil_vol: eq.oilVolumeL ? Number(eq.oilVolumeL) : null, oil_type: eq.oilType || '', manufacturer: eq.manufacturer || '', year: eq.year ? String(eq.year) : '',
      };
      let did: string;
      if (match?.id) {
        did = match.id;
        // Compléter uniquement les champs vides du dossier existant (ne pas écraser).
        const patch: any = { ...match };
        for (const k of Object.keys(fields) as (keyof Dossier)[]) { if ((match as any)[k] == null || (match as any)[k] === '') (patch as any)[k] = (fields as any)[k]; }
        await saveDossier(tenant, patch);
      } else {
        const saved = await saveDossier(tenant, fields);
        if (saved.error || !saved.data?.id) throw new Error(saved.error || 'enregistrement dossier');
        did = saved.data.id;
      }
      // Dédoublonnage par date d'échantillon (fusion des rapports en un seul historique).
      const existingDates = new Set(allMeasures.filter(m => m.dossier_id === did && m.sample_date).map(m => m.sample_date));
      const num = (v: any) => (v == null || v === '' ? 0 : Number(v) || 0);
      let added = 0;
      for (const mm of (j.measurements || [])) {
        if (mm.date && existingDates.has(mm.date)) continue; // déjà présent
        const gas: GasInput = { h2: num(mm.H2), ch4: num(mm.CH4), c2h6: num(mm.C2H6), c2h4: num(mm.C2H4), c2h2: num(mm.C2H2), co: num(mm.CO), co2: num(mm.CO2) };
        const dg = diagnoseFull(gas);
        await saveMeasure(tenant, did, {
          sample_date: mm.date || null, ...gas, o2: mm.O2 != null ? num(mm.O2) : null, n2: mm.N2 != null ? num(mm.N2) : null,
          oil_quality: { moisture: mm.moisture, ift: mm.ift, acid: mm.acid, color: mm.color, dielectric: mm.dielectric, dbd877: mm.dbd877, pf25: mm.pf25, pf100: mm.pf100, f_2fal: mm.f_2fal },
          tdcg: dg.tdcg, condition: dg.condition, duval: dg.duval, fault: tr(dg.fault.fr, dg.fault.en), methods: dg.methods, source: 'pdf',
        });
        added++;
      }
      // Analyse IA automatique sur l'historique assemblé (l'IA "suit" le dossier).
      try {
        const hist = await listMeasures(tenant, did);
        if (hist.length) {
          const ar = await fetch('/api/dga/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dossier: { ...fields }, measures: hist }) });
          const aj = await ar.json();
          if (ar.ok && aj.analysis) { const lastM = hist[hist.length - 1]; if (lastM?.id) await saveMeasure(tenant, did, { ...lastM, ai_summary: tr(aj.analysis.summaryFr, aj.analysis.summaryEn) }); }
        }
      } catch { /* analyse best-effort */ }
      await reload(); setSelId(did); setDraft(null); setView('fiche');
      setNotice(match
        ? tr(`Rapport assemblé au dossier existant « ${match.ident} » : ${added} nouvelle(s) mesure(s).`, `Report merged into existing dossier "${match.ident}": ${added} new measure(s).`)
        : tr(`Nouveau dossier créé : ${added} mesure(s).`, `New dossier created: ${added} measure(s).`));
    } catch (e: any) { setNotice(tr('Import PDF impossible : ', 'PDF import failed: ') + (e?.message || e)); }
    finally { setImporting(false); }
  }

  if (access === 'loading') return <Shell tenant={tenant}><div className="grid place-items-center py-32 text-gray-400"><Loader2 className="animate-spin" /></div></Shell>;
  if (access === 'locked') return <Shell tenant={tenant}><div className="mx-auto max-w-md px-4 py-20 text-center"><Lock className="mx-auto text-gray-400" size={40} /><h1 className="mt-4 text-xl font-bold">{tr('Module non activé', 'Module not enabled')}</h1><p className="mt-2 text-sm text-gray-500">{tr('Le module DGA n’est pas inclus dans votre abonnement.', 'The DGA module is not in your subscription.')}</p></div></Shell>;

  const selected = dossiers.find(d => d.id === selId) || null;

  return (
    <Shell tenant={tenant}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-600 text-white"><FlaskConical size={18} /></span>
          <div><h1 className="text-xl font-extrabold">{tr('Diagnostic DGA', 'DGA Diagnostic')}</h1>
            <p className="text-xs text-gray-500">{tr('Gestion des dossiers, analyse IA, normes IEEE/IEC/Duval', 'Dossier management, AI analysis, IEEE/IEC/Duval norms')}</p></div>
        </div>
        {notice && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{notice}</div>}

        {view === 'list' ? (
          <ListView {...{ tr, lang, stats, filtered, lastByDossier, query, setQuery, fClient, setFClient, fSerie, setFSerie, importing, dragOver, setDragOver, fileRef, handleImport, openFiche: (d: Dossier) => { setSelId(d.id!); setDraft(null); setView('fiche'); }, newDossier: () => { setDraft(emptyDraft()); setSelId(null); setView('fiche'); } }} />
        ) : (
          <Fiche {...{ tenant, tr, lang, selected, draft, setDraft, busy, setBusy, setNotice, onBack: () => { setView('list'); reload(); }, reload, setSelId, setView }} />
        )}
      </div>
    </Shell>
  );
}

function Shell({ tenant, children }: { tenant: string; children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100"><PortalHeader tenant={tenant} />{children}</div>;
}

function Tile({ label, value, color, onClick, active }: { label: string; value: number; color: string; onClick?: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={`rounded-xl border p-3 text-center transition ${active ? 'border-rose-400 ring-2 ring-rose-200' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}>
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-[11px] text-gray-500">{label}</div>
    </button>
  );
}

function ListView(p: any) {
  const { tr, stats, filtered, lastByDossier, query, setQuery, fClient, setFClient, fSerie, setFSerie, importing, dragOver, setDragOver, fileRef, handleImport, openFiche, newDossier } = p;
  const inp = 'rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-rose-500 dark:border-gray-600';
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Tile label={tr('Tous', 'All')} value={stats.all} color="text-gray-800 dark:text-gray-100" />
        <Tile label={tr('En retard', 'Overdue')} value={stats.overdue} color="text-red-600" />
        <Tile label={tr('Bientôt dû', 'Soon due')} value={stats.soon} color="text-amber-600" />
        <Tile label={tr('À jour', 'Up to date')} value={stats.uptodate} color="text-emerald-600" />
        <Tile label={tr('En surveillance', 'Monitoring')} value={stats.surveillance} color="text-orange-600" />
      </div>

      {/* Import PDF drag */}
      <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleImport(f); }}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center ${dragOver ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10' : 'border-gray-300 dark:border-gray-600'}`}>
        {importing ? <Loader2 className="animate-spin text-rose-500" /> : <Upload className="text-gray-400" />}
        <p className="text-sm text-gray-600 dark:text-gray-300">{tr('Glissez un PDF de labo (DGA) ici — extraction IA automatique', 'Drop a lab PDF (DGA) here — automatic AI extraction')}</p>
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); }} />
        <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold dark:border-gray-600">{tr('Choisir un fichier', 'Choose file')}</button>
      </div>

      {/* Barre de recherche unique : équipement + client + n° de série */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[14rem]"><Search size={14} className="absolute left-2 top-2.5 text-gray-400" /><input className={`${inp} w-full pl-7`} placeholder={tr('Rechercher : équipement, client ou n° de série', 'Search: equipment, client or serial no.')} value={query} onChange={e => setQuery(e.target.value)} /></div>
        <button onClick={newDossier} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700"><Plus size={15} /> {tr('Nouveau', 'New')}</button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-gray-900/40"><tr>
            <th className="px-3 py-2">{tr('Équipement', 'Equipment')}</th><th className="px-3 py-2">{tr('Client', 'Client')}</th><th className="px-3 py-2">{tr('N° série', 'Serial')}</th>
            <th className="px-3 py-2">{tr('Dernier', 'Last')}</th><th className="px-3 py-2">IEEE</th><th className="px-3 py-2">{tr('Échéance', 'Due')}</th><th className="px-3 py-2">Flag</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">{tr('Aucun dossier.', 'No dossier.')}</td></tr>}
            {filtered.map((d: Dossier) => {
              const last = d.id ? lastByDossier[d.id] : undefined;
              const st = dueStatus(last?.sample_date, last?.condition);
              return (
                <tr key={d.id} onClick={() => openFiche(d)} className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/30">
                  <td className="px-3 py-2 font-medium">{d.ident}</td><td className="px-3 py-2 text-gray-500">{d.client || '—'}</td><td className="px-3 py-2 text-gray-500">{d.serie || '—'}</td>
                  <td className="px-3 py-2 text-gray-500">{last?.sample_date || '—'}</td>
                  <td className="px-3 py-2">{last?.condition ? <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${COND_COLOR[last.condition]}`}>{last.condition}</span> : '—'}</td>
                  <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${DUE_COLOR[st]}`}>{tr({ overdue: 'En retard', soon: 'Bientôt', uptodate: 'À jour', none: '—' }[st], { overdue: 'Overdue', soon: 'Soon', uptodate: 'OK', none: '—' }[st])}</span></td>
                  <td className="px-3 py-2 text-xs text-gray-500">{d.flag === 'surveillance' ? '👁️ ' + tr('Surveillance', 'Monitoring') : (d.flag || '')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Fiche(p: any) {
  const { tenant, tr, lang, selected, draft, setDraft, busy, setBusy, setNotice, onBack, reload, setSelId, setView } = p;
  const cur: Dossier = draft || selected || { ident: '' };
  const isNew = !selected;
  const [form, setForm] = useState<Dossier>(cur);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [gas, setGas] = useState<GasInput>({ h2: 0, ch4: 0, c2h6: 0, c2h4: 0, c2h2: 0, co: 0, co2: 0 });
  const [sampleDate, setSampleDate] = useState('');
  const [oilQ, setOilQ] = useState<any>({});
  const [reportType, setReportType] = useState<'full' | 'dga' | 'summary'>('full');
  const [aiBusy, setAiBusy] = useState(false);
  const [ai, setAi] = useState<any>(null);
  const [aiText, setAiText] = useState('');   // commentaire IA éditable
  const [aiSaved, setAiSaved] = useState(false);
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-rose-500 dark:border-gray-600';
  // Gaz tracés : le formulaire si saisi, sinon la dernière mesure du dossier (-> le point Duval s'affiche).
  const hasInput = (gas.h2 + gas.ch4 + gas.c2h6 + gas.c2h4 + gas.c2h2 + gas.co + gas.co2) > 0;
  const shown: GasInput = useMemo(() => {
    if (hasInput) return gas;
    const lm = measures[measures.length - 1];
    if (lm) return { h2: +(lm.h2 || 0), ch4: +(lm.ch4 || 0), c2h6: +(lm.c2h6 || 0), c2h4: +(lm.c2h4 || 0), c2h2: +(lm.c2h2 || 0), co: +(lm.co || 0), co2: +(lm.co2 || 0) };
    return gas;
  }, [gas, hasInput, measures]);
  const live = useMemo(() => diagnoseFull(shown), [shown]);

  useEffect(() => { setForm(draft || selected || { ident: '' }); }, [draft, selected]);
  useEffect(() => { (async () => { if (selected?.id) { const ms = await listMeasures(tenant, selected.id); setMeasures(ms); const lm = ms[ms.length - 1]; if (lm?.ai_summary) { setAiText(lm.ai_summary); setAiSaved(true); } else { setAiText(''); } } else { setMeasures([]); setAiText(''); } setAi(null); })(); }, [selected, tenant]);
  async function saveAiComment() {
    if (!selected?.id || measures.length === 0) return;
    const lastM = measures[measures.length - 1];
    if (!lastM?.id) return;
    await saveMeasure(tenant, selected.id, { ...lastM, ai_summary: aiText });
    setAiSaved(true); setMeasures(await listMeasures(tenant, selected.id));
  }

  async function save() {
    if (!form.ident.trim()) { setNotice(tr('L’identification est requise.', 'Identification is required.')); return; }
    setBusy(true); setNotice(null);
    const res = await saveDossier(tenant, form);
    setBusy(false);
    if (res.error) { setNotice('Erreur : ' + res.error); return; }
    setNotice(tr('Dossier enregistré ✓', 'Dossier saved ✓'));
    if (res.data?.id) { setSelId(res.data.id); setDraft(null); }
    reload();
  }
  async function addMeasure() {
    if (!selected?.id) { setNotice(tr('Enregistrez d’abord le dossier.', 'Save the dossier first.')); return; }
    const dg = diagnoseFull(gas);
    const res = await saveMeasure(tenant, selected.id, { sample_date: sampleDate || null, ...gas, oil_quality: oilQ, tdcg: dg.tdcg, condition: dg.condition, duval: dg.duval, fault: tr(dg.fault.fr, dg.fault.en), methods: dg.methods, source: 'manual' });
    if (res.error) { setNotice('Erreur : ' + res.error); return; }
    setGas({ h2: 0, ch4: 0, c2h6: 0, c2h4: 0, c2h2: 0, co: 0, co2: 0 }); setSampleDate(''); setOilQ({});
    // Auto-flag selon l'analyseur (la dernière condition la plus défavorable).
    const fl = autoFlag(dg.condition);
    if (fl !== form.flag) { const nf = { ...form, flag: fl }; setForm(nf); await saveDossier(tenant, nf); }
    setMeasures(await listMeasures(tenant, selected.id)); reload();
  }
  async function runAI() {
    if (!selected?.id || measures.length === 0) { setNotice(tr('Aucune mesure à analyser.', 'No measure to analyze.')); return; }
    setAiBusy(true); setAi(null); setNotice(null);
    try {
      const resp = await fetch('/api/dga/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dossier: form, measures }) });
      const j = await resp.json();
      if (!resp.ok || j.error) throw new Error(j.error || 'IA');
      setAi(j.analysis);
      const txt = tr(j.analysis.summaryFr, j.analysis.summaryEn);
      setAiText(txt); setAiSaved(false);
      const lastM = measures[measures.length - 1];
      if (lastM?.id) await saveMeasure(tenant, selected.id, { ...lastM, ai_summary: txt });
      // Auto-flag du dossier selon la sévérité de l'analyseur.
      const fl = autoFlag(Number(j.analysis.severity));
      if (fl !== form.flag) { const nf = { ...form, flag: fl }; setForm(nf); await saveDossier(tenant, nf); }
      reload();
    } catch (e: any) { setNotice(tr('Analyse IA impossible : ', 'AI analysis failed: ') + (e?.message || e)); }
    finally { setAiBusy(false); }
  }
  async function delMeasure(id?: string) { if (!id) return; await deleteMeasure(id); if (selected?.id) setMeasures(await listMeasures(tenant, selected.id)); reload(); }
  async function delDossier() { if (!selected?.id) return; if (!confirm(tr('Supprimer ce dossier et ses mesures ?', 'Delete this dossier and its measures?'))) return; await deleteDossier(selected.id); onBack(); }
  async function exportReport() {
    let logoUrl: string | null = '/c-secur360-logo.png';
    try { const { data } = await supabase.from('company_settings').select('logo_url').eq('tenant_id', tenant).maybeSingle(); if (data?.logo_url) logoUrl = data.logo_url; } catch { /* défaut */ }
    await generateDgaReport({ dossier: form, measures, ai, logoUrl, lang, reportType });
  }

  const setG = (k: keyof GasInput, v: string) => setGas(g => ({ ...g, [k]: v === '' ? 0 : Number(v) }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:underline dark:text-gray-300"><ArrowLeft size={15} /> {tr('Liste', 'List')}</button>
        <div className="flex gap-2">
          {!isNew && <select value={reportType} onChange={e => setReportType(e.target.value as any)} className="rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600">
            <option value="full">{tr('Rapport complet', 'Full report')}</option>
            <option value="dga">{tr('DGA seulement', 'DGA only')}</option>
            <option value="summary">{tr('Sommaire', 'Summary')}</option>
          </select>}
          {!isNew && <button onClick={exportReport} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200"><FileText size={14} /> {tr('Exporter PDF', 'Export PDF')}</button>}
          {!isNew && <button onClick={delDossier} className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>}
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">{busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {tr('Enregistrer', 'Save')}</button>
        </div>
      </div>

      {/* Fiche équipement */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid gap-3 sm:grid-cols-3">
          {EQUIP_FIELDS.map(f => (
            <label key={f.key as string} className="block"><span className="mb-1 block text-[11px] font-semibold text-gray-500">{tr(f.fr, f.en)}</span>
              <input className={inp} type={f.num ? 'number' : 'text'} value={(form as any)[f.key] ?? ''} placeholder={f.ph || ''} onFocus={e => e.target.select()}
                onChange={e => setForm(s => ({ ...s, [f.key]: f.num ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value }))} /></label>
          ))}
          <label className="block"><span className="mb-1 block text-[11px] font-semibold text-gray-500">Flag</span>
            <select className={inp} value={form.flag || ''} onChange={e => setForm(s => ({ ...s, flag: e.target.value }))}>
              <option value="">—</option><option value="surveillance">{tr('En surveillance', 'Monitoring')}</option><option value="critique">{tr('Critique', 'Critical')}</option><option value="ok">OK</option>
            </select></label>
        </div>
      </div>

      {!isNew && (
        <>
          {/* Ajouter une mesure */}
          <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-2 text-sm font-bold">{tr('Ajouter une mesure', 'Add a measure')}</h3>
              <label className="mb-2 block w-48"><span className="mb-1 block text-[11px] text-gray-500">{tr('Date', 'Date')}</span><input type="date" className={inp} value={sampleDate} onChange={e => setSampleDate(e.target.value)} /></label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {GASES.map(g => <label key={g.key} className="block"><span className="mb-1 block text-[11px] text-gray-500">{g.label} (ppm)</span>
                  <input type="number" min="0" className={inp} value={gas[g.key] === 0 ? '' : gas[g.key]} placeholder="0" onFocus={e => e.target.select()} onChange={e => setG(g.key, e.target.value)} /></label>)}
              </div>
              {/* Qualité d'huile (avancé) */}
              <details className="mt-3 rounded-lg border border-gray-100 p-2 dark:border-gray-700">
                <summary className="cursor-pointer text-xs font-semibold text-gray-600 dark:text-gray-300">{tr('Qualité d’huile (avancé)', 'Oil quality (advanced)')}</summary>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { k: 'moisture', fr: 'Eau (ppm)', en: 'Moisture (ppm)' }, { k: 'acid', fr: 'Acidité (mgKOH/g)', en: 'Acidity (mgKOH/g)' },
                    { k: 'ift', fr: 'IFT (mN/m)', en: 'IFT (mN/m)' }, { k: 'dielectric', fr: 'Rigidité D1816 (kV)', en: 'Dielectric D1816 (kV)' },
                    { k: 'dbd877', fr: 'Rigidité D877 (kV)', en: 'Dielectric D877 (kV)' }, { k: 'color', fr: 'Couleur (ASTM)', en: 'Color (ASTM)' },
                    { k: 'pf25', fr: 'PF 25°C (%)', en: 'PF 25°C (%)' }, { k: 'pf100', fr: 'PF 100°C (%)', en: 'PF 100°C (%)' },
                    { k: 'f_2fal', fr: '2-FAL (ppm)', en: '2-FAL (ppm)' },
                  ].map(o => (
                    <label key={o.k} className="block"><span className="mb-1 block text-[10px] text-gray-500">{tr(o.fr, o.en)}</span>
                      <input type="number" className={inp} value={oilQ[o.k] ?? ''} onFocus={e => e.target.select()} onChange={e => setOilQ((s: any) => ({ ...s, [o.k]: e.target.value === '' ? undefined : Number(e.target.value) }))} /></label>
                  ))}
                </div>
                {estimateDP(oilQ.f_2fal) != null && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">{tr('DP estimé (papier)', 'Estimated DP (paper)')} : <b>{estimateDP(oilQ.f_2fal)}</b> — {tr(paperState(estimateDP(oilQ.f_2fal))?.fr || '', paperState(estimateDP(oilQ.f_2fal))?.en || '')}</p>
                )}
              </details>
              <button onClick={addMeasure} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={14} /> {tr('Ajouter', 'Add')}</button>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><Activity size={15} /> {tr('Diagnostic live', 'Live diagnosis')}</h3>
              <div className="flex items-center justify-between text-sm"><span className="text-gray-500">TDCG</span><b>{Math.round(live.tdcg)}</b></div>
              <div className="my-2 text-center"><span className={`rounded-full px-3 py-1 text-sm font-bold ${COND_COLOR[live.condition]}`}>IEEE {live.condition}/4</span></div>
              <div className="text-center text-lg font-extrabold text-rose-600 dark:text-rose-400">{live.duval}</div>
              <div className="text-center text-xs text-gray-600 dark:text-gray-300">{tr(live.fault.fr, live.fault.en)}</div>
              <div className="mt-2 text-gray-500"><DuvalTriangle ch4={shown.ch4} c2h2={shown.c2h2} c2h4={shown.c2h4} zone={live.duval} /></div>
            </div>
          </div>

          {/* Analyse IA */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold"><Sparkles size={15} className="text-violet-500" /> {tr('Analyse IA experte', 'Expert AI analysis')}</h3>
              <button onClick={runAI} disabled={aiBusy} className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">{aiBusy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {tr('Analyser', 'Analyze')}</button>
            </div>
            <div className="space-y-2 text-sm">
              {ai && (
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${COND_COLOR[ai.severity] || COND_COLOR[1]}`}>{tr('Sévérité', 'Severity')} {ai.severity}/4</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">{ai.faultType}</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{tr('Tendance', 'Trend')}: {ai.trend}</span>
                  {ai.retestMonths != null && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{tr('Re-test', 'Re-test')}: {ai.retestMonths} {tr('mois', 'mo')}</span>}
                </div>
              )}
              {(aiText || ai) ? (
                <>
                  <textarea className="w-full rounded-lg border border-gray-300 bg-transparent p-2 text-sm dark:border-gray-600" rows={5} value={aiText} onChange={e => { setAiText(e.target.value); setAiSaved(false); }} placeholder={tr('Commentaire (éditable)…', 'Comment (editable)…')} />
                  <div className="flex items-center gap-2">
                    <button onClick={saveAiComment} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700">{tr('Enregistrer le commentaire', 'Save comment')}</button>
                    {aiSaved && <span className="text-xs text-emerald-600">✓ {tr('enregistré', 'saved')}</span>}
                  </div>
                  {ai && <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300">{((lang === 'fr' ? ai.recommendationsFr : ai.recommendationsEn) || []).map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>}
                </>
              ) : <p className="text-xs text-gray-400">{tr('Lance l’analyse pour un diagnostic basé sur l’historique et les normes (commentaire ensuite éditable).', 'Run analysis for a history- and norm-based diagnosis (comment is then editable).')}</p>}
            </div>
          </div>

          {/* Tendances */}
          {measures.length >= 2 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-2 text-sm font-bold">{tr('Tendances (gaz / TDCG)', 'Trends (gas / TDCG)')}</h3>
              <Trends measures={measures} tr={tr} />
            </div>
          )}

          {/* Historique */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-gray-900/40"><tr>
                <th className="px-2 py-1.5">{tr('Date', 'Date')}</th>{GASES.map(g => <th key={g.key} className="px-2 py-1.5">{g.label}</th>)}<th className="px-2 py-1.5">TDCG</th><th className="px-2 py-1.5">IEEE</th><th className="px-2 py-1.5">Duval</th><th className="px-2 py-1.5"></th>
              </tr></thead>
              <tbody>
                {measures.length === 0 && <tr><td colSpan={11} className="px-2 py-4 text-center text-gray-400">{tr('Aucune mesure.', 'No measure.')}</td></tr>}
                {measures.map(m => (
                  <tr key={m.id} className="border-t border-gray-100 dark:border-gray-700/50">
                    <td className="px-2 py-1.5 text-gray-500">{m.sample_date || '—'}{m.source === 'pdf' ? ' 📄' : ''}</td>
                    {GASES.map(g => <td key={g.key} className="px-2 py-1.5">{(m as any)[g.key] ?? 0}</td>)}
                    <td className="px-2 py-1.5">{Math.round(m.tdcg || 0)}</td>
                    <td className="px-2 py-1.5">{m.condition ? <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${COND_COLOR[m.condition]}`}>{m.condition}</span> : '—'}</td>
                    <td className="px-2 py-1.5 font-semibold text-rose-600 dark:text-rose-400">{m.duval}</td>
                    <td className="px-2 py-1.5"><button onClick={() => delMeasure(m.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
