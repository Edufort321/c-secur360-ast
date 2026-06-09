'use client';

// #73 — Hub RH « Dossier 360 » : agrège l'info existante (employé/éval/paie/sites) EN LECTURE
// et ajoute ce qui manque (documents, certifications avec expiration, onboarding). Pas de doublon.
import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Paperclip, FileText, Award, ClipboardList, AlertTriangle, ShieldCheck, BookOpen, ChevronDown, Info, UploadCloud, Sparkles, X } from 'lucide-react';
import { uploadReceipt } from '@/lib/transactions';

type Pers = { id: string; name: string; email?: string; role?: string; succursale?: string; niveauAcces?: string; hire_date?: string; current_salary?: number; last_evaluation_date?: string; next_evaluation_date?: string };
type Doc = { id?: string; type: string; name: string; url: string; expiry_date?: string | null };
type Cert = { id?: string; name: string; issuer: string; issued_date?: string | null; expiry_date?: string | null; doc_url?: string };
type Onb = { id?: string; phase: string; item: string; done: boolean; sort_order: number };
type Incident = { id: string; report_number: string; incident_type: string; status: string; created_at: string };

const INC_LABEL: Record<string, string> = { accident: 'Accident', near_miss: 'Passé proche', vehicle: 'Véhicule', property: 'Matériel', medical: 'Médical' };

const money = (n?: number) => n != null ? `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 0 })} $` : '—';
function expStatus(d?: string | null): 'ok' | 'soon' | 'expired' | null {
  if (!d) return null;
  const days = Math.ceil((new Date(d + 'T00:00').getTime() - Date.now()) / 86400000);
  if (days < 0) return 'expired';
  if (days <= 30) return 'soon';
  return 'ok';
}

export function RHDossiers({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const inp = 'rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';
  const [pers, setPers] = useState<Pers[]>([]);
  const [sel, setSel] = useState<Pers | null>(null);
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [onb, setOnb] = useState<Onb[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [genDocs, setGenDocs] = useState<Doc[]>([]);
  const [classifying, setClassifying] = useState(false);
  const [review, setReview] = useState<any | null>(null);

  // Accès RH via routes SERVEUR (service role + vérif niveau + tenant de session) — plus aucune
  // lecture directe des tables sensibles depuis le navigateur (clé anon fermée).
  async function hrGet(qs: string): Promise<any> {
    try { const r = await fetch(`/api/hr/dossier?${qs}`, { credentials: 'include' }); return r.ok ? await r.json() : {}; } catch { return {}; }
  }
  async function hrInsert(table: string, row: any): Promise<any> {
    try { const r = await fetch('/api/hr/dossier', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ table, row }) }); const j = await r.json().catch(() => ({})); return j.row || null; } catch { return null; }
  }
  async function hrUpdate(table: string, id: string, patch: any): Promise<void> {
    try { await fetch('/api/hr/dossier', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ table, id, patch }) }); } catch { /* ignore */ }
  }
  async function hrDelete(table: string, id: string): Promise<void> {
    try { await fetch(`/api/hr/dossier?table=${table}&id=${id}`, { method: 'DELETE', credentials: 'include' }); } catch { /* ignore */ }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await hrGet('list=1');
      setPers(((list.personnel || []) as Pers[]).filter((p: any) => p.name));
      const inc = await hrGet('incidents=1');
      setIncidents((inc.incidents || []) as Incident[]);
      const gen = await hrGet('general=1');
      setGenDocs((gen.documents || []) as Doc[]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  // ── Dépôt + classement automatique par IA (type, catégorie, employé concerné, expiration) ──
  const norm = (s: string) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  async function handleClassify(file: File) {
    setClassifying(true); setReview(null);
    try {
      const url = await uploadReceipt(tenant, file);
      const fd = new FormData(); fd.append('file', file); fd.append('tenant', tenant);
      const resp = await fetch('/api/hr/classify', { method: 'POST', body: fd });
      const raw = await resp.text();
      let j: any = {};
      try { j = raw ? JSON.parse(raw) : {}; } catch { throw new Error(raw.slice(0, 160) || `Erreur ${resp.status}`); }
      if (!resp.ok || j.error) throw new Error(j.error || 'Classement impossible');
      const c = j.classification || {};
      // Rapprochement employé LOCAL (le roster n'est jamais envoyé à l'IA).
      let matched = '';
      if (c.personName && !c.isGeneral) {
        const pn = norm(c.personName);
        const hit = pers.find(p => norm(p.name) === pn) || pers.find(p => pn && (norm(p.name).includes(pn) || pn.includes(norm(p.name))));
        if (hit) matched = hit.id;
      }
      setReview({ url, type: c.type || 'autre', category: c.category || 'autre', title: c.title || file.name, expiry_date: c.expiryDate || '', personnel_id: matched, personName: c.personName || '' });
    } catch (e: any) { setReview({ error: e?.message || 'Erreur' }); }
    finally { setClassifying(false); }
  }
  async function saveClassified() {
    if (!review || review.error) return;
    const row: any = { personnel_id: review.personnel_id || null, type: review.type, category: review.category, name: review.title, url: review.url, expiry_date: review.expiry_date || null, classified_by: 'ia' };
    const data = await hrInsert('hr_documents', row);
    if (data) {
      if (!row.personnel_id) setGenDocs(p => [data as Doc, ...p]);
      else if (sel && row.personnel_id === sel.id) setDocs(p => [...p, data as Doc]);
    }
    setReview(null);
  }

  async function openFiche(p: Pers) {
    setSel(p); setDocs([]); setCerts([]); setOnb([]);
    const j = await hrGet(`personnelId=${p.id}`);
    setDocs((j.documents || []) as Doc[]); setCerts((j.certifications || []) as Cert[]); setOnb((j.onboarding || []) as Onb[]);
  }

  // ── Certifications ──
  async function addCert() { if (!sel) return; const data = await hrInsert('hr_certifications', { personnel_id: sel.id, name: '', issuer: '', issued_date: null, expiry_date: null }); if (data) setCerts(p => [...p, data as Cert]); }
  async function updCert(i: number, patch: Partial<Cert>) { const c = { ...certs[i], ...patch }; setCerts(p => p.map((x, j) => j === i ? c : x)); if (c.id) { setBusy(`cert${c.id}`); await hrUpdate('hr_certifications', c.id, { name: c.name, issuer: c.issuer, issued_date: c.issued_date || null, expiry_date: c.expiry_date || null, doc_url: c.doc_url || null }); setBusy(null); } }
  async function delCert(i: number) { const c = certs[i]; if (c.id) await hrDelete('hr_certifications', c.id); setCerts(p => p.filter((_, j) => j !== i)); }
  async function certUpload(i: number, f: File) { try { const url = await uploadReceipt(tenant, f); updCert(i, { doc_url: url }); } catch { /* ignore */ } }

  // ── Documents ──
  async function addDoc() { if (!sel) return; const data = await hrInsert('hr_documents', { personnel_id: sel.id, type: 'document', name: '' }); if (data) setDocs(p => [...p, data as Doc]); }
  async function updDoc(i: number, patch: Partial<Doc>) { const d = { ...docs[i], ...patch }; setDocs(p => p.map((x, j) => j === i ? d : x)); if (d.id) await hrUpdate('hr_documents', d.id, { type: d.type, name: d.name, url: d.url || null, expiry_date: d.expiry_date || null }); }
  async function delDoc(i: number) { const d = docs[i]; if (d.id) await hrDelete('hr_documents', d.id); setDocs(p => p.filter((_, j) => j !== i)); }
  async function docUpload(i: number, f: File) { try { const url = await uploadReceipt(tenant, f); updDoc(i, { url, name: docs[i].name || f.name }); } catch { /* ignore */ } }

  // ── Onboarding ──
  async function addOnb(phase: string) { if (!sel) return; const data = await hrInsert('hr_onboarding', { personnel_id: sel.id, phase, item: '', done: false, sort_order: onb.length }); if (data) setOnb(p => [...p, data as Onb]); }
  async function updOnb(i: number, patch: Partial<Onb>) { const o = { ...onb[i], ...patch }; setOnb(p => p.map((x, j) => j === i ? o : x)); if (o.id) await hrUpdate('hr_onboarding', o.id, { item: o.item, done: o.done }); }
  async function delOnb(i: number) { const o = onb[i]; if (o.id) await hrDelete('hr_onboarding', o.id); setOnb(p => p.filter((_, j) => j !== i)); }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Guide de conformité (Loi 25 + SST) — toujours accessible en tête du module RH */}
      <ComplianceGuide tr={tr} open={showGuide} setOpen={setShowGuide} />

      {/* Accidents / incidents — hébergés dans le module RH (lecture), source = module Accidents */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-100"><AlertTriangle size={15} className="text-rose-500" /> {tr('Accidents et incidents', 'Accidents & incidents')} ({incidents.length})</h3>
          <a href={`/${tenant}/accidents`} className="text-xs font-semibold text-blue-600 hover:underline">{tr('Ouvrir le module', 'Open module')} →</a>
        </div>
        {incidents.length === 0 ? (
          <p className="py-2 text-center text-xs text-gray-400">{tr('Aucun rapport d’accident ou d’incident.', 'No accident or incident report.')}</p>
        ) : (
          <div className="space-y-1">
            {incidents.map(r => {
              const st = r.status === 'closed' ? 'bg-emerald-100 text-emerald-700' : r.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600';
              return (
                <a key={r.id} href={`/${tenant}/accidents`} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-gray-100 px-2 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
                  <span className="font-mono text-gray-400">{r.report_number}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{INC_LABEL[r.incident_type] || r.incident_type}</span>
                  <span className="text-gray-400">{String(r.created_at).slice(0, 10)}</span>
                  <span className={`ml-auto rounded-full px-2 py-0.5 font-semibold ${st}`}>{r.status === 'closed' ? tr('Fermé', 'Closed') : r.status === 'submitted' ? tr('Soumis', 'Submitted') : tr('Brouillon', 'Draft')}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Dépôt centralisé + classement automatique par IA (employé concerné ou général) */}
      <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-800/40 dark:bg-violet-900/10">
        <h3 className="mb-1 flex items-center gap-1.5 text-sm font-bold text-violet-800 dark:text-violet-300"><Sparkles size={15} /> {tr('Déposer un document — classement automatique', 'Drop a document — auto-filing')}</h3>
        <p className="mb-3 text-[11px] text-violet-700/80 dark:text-violet-300/70">{tr('L’IA détecte le type, la catégorie, l’employé concerné et la date d’expiration, puis range le document dans le bon dossier (ou en général). Vous validez avant l’enregistrement.', 'AI detects type, category, the employee and expiry date, then files the document (or marks it general). You confirm before saving.')}</p>
        <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-300 bg-white px-4 py-4 text-sm font-semibold text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:bg-gray-800 ${classifying ? 'pointer-events-none opacity-60' : ''}`}>
          {classifying ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
          {classifying ? tr('Analyse en cours…', 'Analyzing…') : tr('Choisir un fichier (PDF ou image)', 'Pick a file (PDF or image)')}
          <input type="file" accept="image/*,.pdf" className="hidden" disabled={classifying} onChange={e => { const f = e.target.files?.[0]; if (f) handleClassify(f); e.currentTarget.value = ''; }} />
        </label>

        {/* Carte de revue de la classification */}
        {review && (
          <div className="mt-3 rounded-xl border border-violet-200 bg-white p-3 dark:border-violet-800/40 dark:bg-gray-800">
            {review.error ? (
              <div className="flex items-center justify-between gap-2 text-sm text-red-600"><span><AlertTriangle size={14} className="mr-1 inline" />{review.error}</span><button onClick={() => setReview(null)}><X size={15} /></button></div>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-700 dark:text-violet-300"><Sparkles size={12} className="mr-1 inline" />{tr('Classement proposé', 'Suggested filing')}</span>
                  <button onClick={() => setReview(null)} className="text-gray-300 hover:text-red-500"><X size={15} /></button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-[10px] text-gray-400">{tr('Titre', 'Title')}<input className={`${inp} block w-full`} value={review.title} onChange={e => setReview({ ...review, title: e.target.value })} /></label>
                  <label className="text-[10px] text-gray-400">{tr('Type', 'Type')}
                    <select className={`${inp} block w-full`} value={review.type} onChange={e => setReview({ ...review, type: e.target.value })}>
                      {['contrat', 'cv', 'certification', 'attestation', 'carte_competence', 'politique', 'formulaire', 'paie', 'evaluation', 'medical', 'autre'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="text-[10px] text-gray-400">{tr('Catégorie', 'Category')}
                    <select className={`${inp} block w-full`} value={review.category} onChange={e => setReview({ ...review, category: e.target.value })}>
                      {['SST', 'Loi25', 'paie', 'contrat', 'formation', 'administratif', 'autre'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="text-[10px] text-gray-400">{tr('Employé concerné', 'Employee')}
                    <select className={`${inp} block w-full`} value={review.personnel_id} onChange={e => setReview({ ...review, personnel_id: e.target.value })}>
                      <option value="">{tr('— Général (aucun employé) —', '— General (no employee) —')}</option>
                      {pers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </label>
                  <label className="text-[10px] text-gray-400">{tr('Expiration', 'Expiry')}<input type="date" className={`${inp} block w-full`} value={review.expiry_date || ''} onChange={e => setReview({ ...review, expiry_date: e.target.value })} /></label>
                </div>
                {review.personName && !review.personnel_id && <p className="mt-1 text-[10px] text-amber-600">{tr(`Nom détecté « ${review.personName} » non rapproché — choisissez l’employé ou laissez en général.`, `Detected name “${review.personName}” not matched — pick the employee or keep general.`)}</p>}
                <div className="mt-2 flex justify-end gap-2">
                  <a href={review.url} target="_blank" rel="noreferrer" className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:border-gray-600">{tr('Aperçu', 'Preview')}</a>
                  <button onClick={saveClassified} className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700">{tr('Classer le document', 'File document')}</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Documents généraux */}
        {genDocs.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-violet-700/70 dark:text-violet-300/60">{tr('Documents généraux', 'General documents')} ({genDocs.length})</div>
            <div className="space-y-1">
              {genDocs.map((d, i) => (
                <div key={d.id || i} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 bg-white px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 font-semibold text-gray-600 dark:bg-gray-700">{d.type}</span>
                  <span className="min-w-0 flex-1 truncate font-medium text-gray-800 dark:text-gray-100">{d.name}</span>
                  {d.expiry_date && <span className="text-gray-400">{tr('exp.', 'exp.')} {d.expiry_date}</span>}
                  {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="font-semibold text-emerald-600">📎</a>}
                  <button onClick={async () => { if (d.id) await hrDelete('hr_documents', d.id); setGenDocs(p => p.filter((_, j) => j !== i)); }} className="text-gray-300 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      {/* Liste employés */}
      <div className="rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
        <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">{tr('Employés', 'Employees')} ({pers.length})</div>
        <div className="max-h-[70vh] space-y-1 overflow-y-auto">
          {pers.map(p => (
            <button key={p.id} onClick={() => openFiche(p)} className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm ${sel?.id === p.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-700">{(p.name || '?')[0]?.toUpperCase()}</span>
              <span className="min-w-0 flex-1"><span className="block truncate font-medium">{p.name}</span><span className="block truncate text-xs text-gray-400">{p.role || p.succursale || ''}</span></span>
            </button>
          ))}
        </div>
      </div>

      {/* Fiche 360 */}
      {!sel ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400 dark:border-gray-600">👈 {tr('Sélectionnez un employé pour voir son dossier RH 360.', 'Pick an employee to view their 360 HR file.')}</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-bold">{sel.name}</h2>
            <div className="text-xs text-gray-500">{sel.role || '—'}{sel.succursale ? ` · ${sel.succursale}` : ''}{sel.niveauAcces ? ` · ${sel.niveauAcces}` : ''}{sel.email ? ` · ${sel.email}` : ''}</div>
            {/* Agrégé (lecture seule, source = autres modules) */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { k: tr('Embauche', 'Hired'), v: sel.hire_date || '—' },
                { k: tr('Salaire actuel', 'Current salary'), v: money(sel.current_salary) },
                { k: tr('Dernière éval.', 'Last eval'), v: sel.last_evaluation_date || '—' },
                { k: tr('Prochaine éval.', 'Next eval'), v: sel.next_evaluation_date || '—' },
              ].map(t => <div key={t.k} className="rounded-lg border border-gray-100 p-2 text-center dark:border-gray-700"><div className="text-sm font-bold text-gray-800 dark:text-gray-100">{t.v}</div><div className="text-[10px] text-gray-400">{t.k}</div></div>)}
            </div>
            <p className="mt-1 text-[11px] text-gray-400">{tr('Agrégé depuis Évaluation/Paie/Planning (modifiable dans ces modules).', 'Aggregated from Evaluation/Payroll/Planning (edit there).')}</p>
          </div>

          {/* Certifications */}
          <Section icon={<Award size={15} />} title={tr('Certifications & formations', 'Certifications & training')} onAdd={addCert} addLabel={tr('Certification', 'Certification')}>
            {certs.length === 0 ? <Empty tr={tr} /> : certs.map((c, i) => {
              const st = expStatus(c.expiry_date);
              return (
                <div key={c.id || i} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 p-2 dark:border-gray-700">
                  <input className={`${inp} min-w-[8rem] flex-1`} value={c.name} placeholder={tr('Nom (ex. SIMDUT)', 'Name')} onChange={e => updCert(i, { name: e.target.value })} />
                  <input className={`${inp} w-32`} value={c.issuer} placeholder={tr('Émetteur', 'Issuer')} onChange={e => updCert(i, { issuer: e.target.value })} />
                  <label className="text-[10px] text-gray-400">{tr('Émise', 'Issued')}<input type="date" className={`${inp} block`} value={c.issued_date || ''} onChange={e => updCert(i, { issued_date: e.target.value })} /></label>
                  <label className="text-[10px] text-gray-400">{tr('Expire', 'Expiry')}<input type="date" className={`${inp} block`} value={c.expiry_date || ''} onChange={e => updCert(i, { expiry_date: e.target.value })} /></label>
                  {st && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st === 'expired' ? 'bg-red-100 text-red-700' : st === 'soon' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{st === 'expired' ? <><AlertTriangle size={10} className="mr-0.5 inline" />{tr('Expirée', 'Expired')}</> : st === 'soon' ? tr('Expire bientôt', 'Expiring') : tr('Valide', 'Valid')}</span>}
                  {c.doc_url ? <a href={c.doc_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-600">📎</a> : <label className="cursor-pointer text-xs text-violet-600"><Paperclip size={13} /><input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) certUpload(i, f); }} /></label>}
                  <button onClick={() => delCert(i)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              );
            })}
          </Section>

          {/* Documents */}
          <Section icon={<FileText size={15} />} title={tr('Documents', 'Documents')} onAdd={addDoc} addLabel={tr('Document', 'Document')}>
            <div className="mb-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
              <Info size={13} className="mt-0.5 shrink-0" />
              <span>{tr(
                'Votre organisation est responsable des documents déposés ici (licéité, exactitude, conservation, accès). Ne déposez que les renseignements nécessaires et légalement justifiés ; restreignez l’accès aux personnes autorisées. Les renseignements sensibles ou de santé exigent une prudence accrue.',
                'Your organization is responsible for the documents stored here (lawfulness, accuracy, retention, access). Only upload necessary and legally justified information; restrict access to authorized people. Sensitive or health data requires extra care.')}</span>
            </div>
            {docs.length === 0 ? <Empty tr={tr} /> : docs.map((d, i) => (
              <div key={d.id || i} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 p-2 dark:border-gray-700">
                <select className={`${inp} w-32`} value={d.type} onChange={e => updDoc(i, { type: e.target.value })}>
                  {['contrat', 'cv', 'certification', 'attestation', 'autre'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input className={`${inp} min-w-[8rem] flex-1`} value={d.name} placeholder={tr('Nom du document', 'Document name')} onChange={e => updDoc(i, { name: e.target.value })} />
                {d.url ? <a href={d.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-600">📎 {tr('Ouvrir', 'Open')}</a> : <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-violet-300 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700"><Paperclip size={11} /> {tr('Joindre', 'Attach')}<input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) docUpload(i, f); }} /></label>}
                <button onClick={() => delDoc(i)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
              </div>
            ))}
          </Section>

          {/* Onboarding */}
          <Section icon={<ClipboardList size={15} />} title={tr('Intégration (onboarding)', 'Onboarding')} onAdd={() => addOnb('onboarding')} addLabel={tr('Étape', 'Step')}>
            {onb.filter(o => o.phase === 'onboarding').length === 0 ? <Empty tr={tr} /> : onb.map((o, i) => o.phase !== 'onboarding' ? null : (
              <label key={o.id || i} className="flex items-center gap-2 rounded-lg border border-gray-100 p-2 text-sm dark:border-gray-700">
                <input type="checkbox" checked={o.done} onChange={e => updOnb(i, { done: e.target.checked })} className="accent-emerald-600" />
                <input className={`${inp} flex-1 ${o.done ? 'line-through text-gray-400' : ''}`} value={o.item} placeholder={tr('Étape d’intégration', 'Onboarding step')} onChange={e => updOnb(i, { item: e.target.value })} />
                <button onClick={() => delOnb(i)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
              </label>
            ))}
          </Section>
        </div>
      )}
    </div>
    </div>
  );
}

function Section({ icon, title, onAdd, addLabel, children }: { icon: React.ReactNode; title: string; onAdd: () => void; addLabel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-100">{icon} {title}</h3>
        <button onClick={onAdd} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"><Plus size={13} /> {addLabel}</button>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
function Empty({ tr }: { tr: (f: string, e: string) => string }) { return <p className="py-2 text-center text-xs text-gray-400">{tr('Aucun élément.', 'None.')}</p>; }

// Guide de conformité (Québec) intégré au module RH : SST (LSST/CNESST) + protection des
// renseignements personnels (Loi 25). Liste de référence des documents et obligations usuels.
function ComplianceGuide({ tr, open, setOpen }: { tr: (f: string, e: string) => string; open: boolean; setOpen: (v: boolean) => void }) {
  const blocks: { title: string; items: string[] }[] = [
    {
      title: tr('Santé et sécurité du travail (LSST / CNESST)', 'Occupational health & safety (CNESST)'),
      items: [
        tr('Programme de prévention ou plan d’action (selon le secteur et la taille).', 'Prevention program or action plan (per sector and size).'),
        tr('Registre des accidents, incidents et premiers soins (à jour).', 'Register of accidents, incidents and first aid (kept current).'),
        tr('Analyses sécuritaires de tâches (AST) et identification des risques.', 'Job safety analyses (JSA) and hazard identification.'),
        tr('Fiches de données de sécurité (SIMDUT/SDS) accessibles aux travailleurs.', 'Safety data sheets (WHMIS/SDS) accessible to workers.'),
        tr('Permis de travail (cadenassage, espace clos, travail à chaud, hauteur, excavation).', 'Work permits (LOTO, confined space, hot work, height, excavation).'),
        tr('Inspections et entretien préventif des équipements documentés.', 'Documented equipment inspections and preventive maintenance.'),
        tr('Comité ou représentant SST ; mécanisme de participation des travailleurs.', 'OHS committee or representative; worker participation mechanism.'),
        tr('Politique contre le harcèlement psychologique et la violence au travail.', 'Policy against psychological harassment and workplace violence.'),
      ],
    },
    {
      title: tr('Certifications et formations obligatoires', 'Mandatory certifications & training'),
      items: [
        tr('SIMDUT, cadenassage, espace clos, secourisme, ASP Construction selon les tâches.', 'WHMIS, LOTO, confined space, first aid, sector cards per tasks.'),
        tr('Suivi des dates d’expiration (alertes dans la fiche de l’employé).', 'Track expiry dates (alerts in the employee file).'),
        tr('Preuves de formation conservées au dossier de chaque travailleur.', 'Proof of training kept in each worker’s file.'),
      ],
    },
    {
      title: tr('Protection des renseignements personnels (Loi 25)', 'Personal information protection (Law 25)'),
      items: [
        tr('Responsable de la protection des renseignements personnels désigné.', 'Designated privacy officer.'),
        tr('Politique de confidentialité publiée et à jour.', 'Published and up-to-date privacy policy.'),
        tr('Collecte limitée au nécessaire ; finalités déterminées ; accès par rôle.', 'Minimal collection; defined purposes; role-based access.'),
        tr('Registre des incidents de confidentialité ; avis à la CAI si risque sérieux.', 'Register of confidentiality incidents; notify CAI on serious risk.'),
        tr('Droits des personnes (accès, rectification, suppression) traités sous 30 jours.', 'Individual rights (access, rectification, deletion) handled within 30 days.'),
        tr('Conservation limitée puis destruction/anonymisation ; encadrement des sous-traitants.', 'Limited retention then destruction/anonymization; vendor agreements.'),
      ],
    },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-900/10">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
        <span className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
          <ShieldCheck size={18} /> {tr('Guide de conformité (SST + Loi 25)', 'Compliance guide (OHS + Law 25)')}
        </span>
        <ChevronDown size={18} className={`shrink-0 text-emerald-700 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="grid gap-3 px-4 pb-4 md:grid-cols-3">
          {blocks.map(b => (
            <div key={b.title} className="rounded-xl border border-emerald-100 bg-white p-3 dark:border-emerald-900/30 dark:bg-gray-800">
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-100"><BookOpen size={14} className="text-emerald-600" /> {b.title}</h4>
              <ul className="space-y-1.5">
                {b.items.map((it, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300"><span className="mt-0.5 text-emerald-500">✓</span><span>{it}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      {open && <p className="px-4 pb-3 text-[11px] text-emerald-700/80 dark:text-emerald-400/70">{tr('Liste de référence non exhaustive — adaptez à votre secteur et à la réglementation applicable.', 'Non-exhaustive reference list — adapt to your sector and applicable regulations.')}</p>}
    </div>
  );
}
