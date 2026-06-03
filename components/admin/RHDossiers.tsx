'use client';

// #73 — Hub RH « Dossier 360 » : agrège l'info existante (employé/éval/paie/sites) EN LECTURE
// et ajoute ce qui manque (documents, certifications avec expiration, onboarding). Pas de doublon.
import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Paperclip, FileText, Award, ClipboardList, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadReceipt } from '@/lib/transactions';

type Pers = { id: string; name: string; email?: string; role?: string; succursale?: string; niveauAcces?: string; hire_date?: string; current_salary?: number; last_evaluation_date?: string; next_evaluation_date?: string };
type Doc = { id?: string; type: string; name: string; url: string; expiry_date?: string | null };
type Cert = { id?: string; name: string; issuer: string; issued_date?: string | null; expiry_date?: string | null; doc_url?: string };
type Onb = { id?: string; phase: string; item: string; done: boolean; sort_order: number };

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

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('planner_personnel')
        .select('*')
        .eq('tenant_id', tenant).order('name');
      setPers((data || []).filter((p: any) => p.name) as Pers[]);
      setLoading(false);
    })();
  }, [tenant]);

  async function openFiche(p: Pers) {
    setSel(p); setDocs([]); setCerts([]); setOnb([]);
    const [d, c, o] = await Promise.all([
      supabase.from('hr_documents').select('*').eq('tenant_id', tenant).eq('personnel_id', p.id).order('created_at'),
      supabase.from('hr_certifications').select('*').eq('tenant_id', tenant).eq('personnel_id', p.id).order('expiry_date'),
      supabase.from('hr_onboarding').select('*').eq('tenant_id', tenant).eq('personnel_id', p.id).order('sort_order'),
    ]);
    setDocs((d.data || []) as Doc[]); setCerts((c.data || []) as Cert[]); setOnb((o.data || []) as Onb[]);
  }

  // ── Certifications ──
  async function addCert() { if (!sel) return; const { data } = await supabase.from('hr_certifications').insert({ tenant_id: tenant, personnel_id: sel.id, name: '', issuer: '', issued_date: null, expiry_date: null }).select().single(); if (data) setCerts(p => [...p, data as Cert]); }
  async function updCert(i: number, patch: Partial<Cert>) { const c = { ...certs[i], ...patch }; setCerts(p => p.map((x, j) => j === i ? c : x)); if (c.id) { setBusy(`cert${c.id}`); await supabase.from('hr_certifications').update({ name: c.name, issuer: c.issuer, issued_date: c.issued_date || null, expiry_date: c.expiry_date || null, doc_url: c.doc_url || null }).eq('id', c.id); setBusy(null); } }
  async function delCert(i: number) { const c = certs[i]; if (c.id) await supabase.from('hr_certifications').delete().eq('id', c.id); setCerts(p => p.filter((_, j) => j !== i)); }
  async function certUpload(i: number, f: File) { try { const url = await uploadReceipt(tenant, f); updCert(i, { doc_url: url }); } catch { /* ignore */ } }

  // ── Documents ──
  async function addDoc() { if (!sel) return; const { data } = await supabase.from('hr_documents').insert({ tenant_id: tenant, personnel_id: sel.id, type: 'document', name: '' }).select().single(); if (data) setDocs(p => [...p, data as Doc]); }
  async function updDoc(i: number, patch: Partial<Doc>) { const d = { ...docs[i], ...patch }; setDocs(p => p.map((x, j) => j === i ? d : x)); if (d.id) await supabase.from('hr_documents').update({ type: d.type, name: d.name, url: d.url || null, expiry_date: d.expiry_date || null }).eq('id', d.id); }
  async function delDoc(i: number) { const d = docs[i]; if (d.id) await supabase.from('hr_documents').delete().eq('id', d.id); setDocs(p => p.filter((_, j) => j !== i)); }
  async function docUpload(i: number, f: File) { try { const url = await uploadReceipt(tenant, f); updDoc(i, { url, name: docs[i].name || f.name }); } catch { /* ignore */ } }

  // ── Onboarding ──
  async function addOnb(phase: string) { if (!sel) return; const { data } = await supabase.from('hr_onboarding').insert({ tenant_id: tenant, personnel_id: sel.id, phase, item: '', done: false, sort_order: onb.length }).select().single(); if (data) setOnb(p => [...p, data as Onb]); }
  async function updOnb(i: number, patch: Partial<Onb>) { const o = { ...onb[i], ...patch }; setOnb(p => p.map((x, j) => j === i ? o : x)); if (o.id) await supabase.from('hr_onboarding').update({ item: o.item, done: o.done }).eq('id', o.id); }
  async function delOnb(i: number) { const o = onb[i]; if (o.id) await supabase.from('hr_onboarding').delete().eq('id', o.id); setOnb(p => p.filter((_, j) => j !== i)); }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
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
