'use client';
// REMPLIR une feuille d'inspection (module Maintenance, phase 1b). Un gabarit « poussé » → on coche
// conforme/non-conforme/S.O. ; une non-conformité ouvre un détail d'anomalie + photos (façon rapport
// chantier). Résultat global calculé en direct (conforme/conditionnel/non_conforme/retrait).
import { useMemo, useState } from 'react';
import { Loader2, Save, X, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadPhoto } from '@/lib/utils/photo';
import {
  computeResult, saveSubmission, createMaintActionsFromSubmission, RESULT_META,
  type InspectionFormTemplate, type InspectionAnswer, type InspectionSubmission,
} from '@/lib/inspectionForms';

type Tr = (fr: string, en: string) => string;
type EquipOpt = { id: string; name: string };
const INP = 'rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900';

export default function InspectionFill({ tenant, tr, template, equipmentOptions = [], presetEquipmentId, clientId, onClose, onSaved }:
  { tenant: string; tr: Tr; template: InspectionFormTemplate; equipmentOptions?: EquipOpt[]; presetEquipmentId?: string; clientId?: string | null; onClose: () => void; onSaved: () => void }) {
  const [answers, setAnswers] = useState<Record<string, InspectionAnswer>>({});
  const [inspector, setInspector] = useState('');
  const [equipmentId, setEquipmentId] = useState(presetEquipmentId || '');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const upd = (id: string, p: Partial<InspectionAnswer>) => setAnswers(a => ({ ...a, [id]: { ...a[id], ...p } }));
  const { result, anomalies } = useMemo(() => computeResult(template, answers), [template, answers]);
  const rMeta = RESULT_META[result];
  const rCls: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    red: 'bg-red-600 text-white',
  };

  async function addPhoto(itemId: string, files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(itemId);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) { try { urls.push(await uploadPhoto(f, tenant, supabase)); } catch { /* skip */ } }
      upd(itemId, { photos: [...(answers[itemId]?.photos || []), ...urls] });
    } finally { setUploading(null); }
  }
  const rmPhoto = (itemId: string, url: string) => upd(itemId, { photos: (answers[itemId]?.photos || []).filter(u => u !== url) });

  async function save(status: 'draft' | 'submitted') {
    if (status === 'submitted') {
      for (const s of template.sections) for (const it of s.items) {
        const v = answers[it.id]?.value;
        if (it.required && (v == null || v === '')) { setMsg(tr('Point requis non renseigné : ', 'Required item missing: ') + it.label); return; }
      }
    }
    setSaving(true); setMsg('');
    const eq = equipmentOptions.find(e => e.id === equipmentId);
    const sub: InspectionSubmission = {
      template_id: template.id, template_name: template.name, template_snapshot: template,
      equipment_id: equipmentId || null, equipment_name: eq?.name || null, client_id: clientId || null,
      title: template.name, inspector_name: inspector || null, status,
      answers, overall_result: result, anomalies_count: anomalies, notes,
    };
    const r = await saveSubmission(tenant, sub);
    if (r.error) { setSaving(false); setMsg(tr('Enregistrement impossible : ', 'Save failed: ') + r.error + tr(' (migration 226 appliquée ?)', ' (migration 226 applied?)')); return; }
    // Interconnexion : une feuille soumise avec anomalies crée des actions correctives de maintenance.
    if (status === 'submitted' && equipmentId && anomalies > 0) {
      try { await createMaintActionsFromSubmission(tenant, sub); } catch { /* best-effort */ }
    }
    setSaving(false);
    onSaved();
  }

  const PF = [
    { v: 'conforme', fr: 'Conforme', cls: 'border-emerald-500 bg-emerald-600 text-white' },
    { v: 'non_conforme', fr: 'Non conforme', cls: 'border-rose-500 bg-rose-600 text-white' },
    { v: 'na', fr: 'S.O.', cls: 'border-gray-400 bg-gray-500 text-white' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={onClose} className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-gray-400">← {tr('Annuler', 'Cancel')}</button>
        <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${rCls[rMeta.color]}`}>{tr(rMeta.fr, rMeta.en)}{anomalies > 0 ? ` · ${anomalies} ${tr('anomalie(s)', 'anomaly(ies)')}` : ''}</span>
        <button onClick={() => save('submitted')} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {tr('Enregistrer l’inspection', 'Save inspection')}</button>
      </div>
      {msg && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">{msg}</p>}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="text-lg font-bold text-gray-900 dark:text-white">{template.name}</div>
        {template.category && <div className="text-xs text-gray-500">{template.category}</div>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs font-semibold text-gray-500"><span>{tr('Équipement', 'Equipment')}</span>
            <select className={INP} value={equipmentId} onChange={e => setEquipmentId(e.target.value)}>
              <option value="">{tr('— Aucun / général —', '— None / general —')}</option>
              {equipmentOptions.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select></label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-gray-500"><span>{tr('Inspecteur', 'Inspector')}</span>
            <input className={INP} value={inspector} onChange={e => setInspector(e.target.value)} placeholder={tr('Votre nom', 'Your name')} /></label>
        </div>
      </div>

      {template.sections.map(s => (
        <div key={s.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 font-bold text-gray-800 dark:text-gray-100">{s.title}</div>
          <div className="space-y-3">
            {s.items.map(it => {
              const a = answers[it.id] || {};
              const failed = (it.type === 'pass_fail' && a.value === 'non_conforme') || (it.type === 'checkbox' && a.value === false);
              return (
                <div key={it.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-700/50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{it.label || tr('(sans titre)', '(untitled)')}</span>
                      {it.required && <span className="ml-1 text-rose-500">*</span>}
                      {it.withdrawal && <span className="ml-1 rounded bg-red-100 px-1 text-[9px] font-bold text-red-700">{tr('RETRAIT', 'WITHDRAW')}</span>}
                      {!it.withdrawal && it.critical && <span className="ml-1 rounded bg-amber-100 px-1 text-[9px] font-bold text-amber-700">{tr('CRITIQUE', 'CRITICAL')}</span>}
                      {it.help && <div className="text-[11px] text-gray-400">{it.help}</div>}
                    </div>
                    <div className="shrink-0">
                      {it.type === 'pass_fail' && (
                        <div className="flex gap-1">
                          {PF.map(o => <button key={o.v} onClick={() => upd(it.id, { value: o.v, anomaly: o.v === 'non_conforme' })} className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${a.value === o.v ? o.cls : 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-300'}`}>{o.fr}</button>)}
                        </div>
                      )}
                      {it.type === 'checkbox' && (
                        <div className="flex gap-1">
                          <button onClick={() => upd(it.id, { value: true, anomaly: false })} className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${a.value === true ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-300'}`}>{tr('Oui', 'Yes')}</button>
                          <button onClick={() => upd(it.id, { value: false, anomaly: true })} className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${a.value === false ? 'border-rose-500 bg-rose-600 text-white' : 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-300'}`}>{tr('Non', 'No')}</button>
                        </div>
                      )}
                      {it.type === 'text' && <input className={INP + ' w-48'} value={a.value || ''} onChange={e => upd(it.id, { value: e.target.value })} />}
                      {it.type === 'number' && <input type="number" className={INP + ' w-28'} value={a.value ?? ''} onChange={e => upd(it.id, { value: e.target.value })} />}
                      {it.type === 'date' && <input type="date" className={INP} value={a.value || ''} onChange={e => upd(it.id, { value: e.target.value })} />}
                      {it.type === 'select' && (
                        <select className={INP} value={a.value || ''} onChange={e => upd(it.id, { value: e.target.value })}>
                          <option value="">—</option>
                          {(it.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      )}
                      {it.type === 'photo' && (
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300">
                          {uploading === it.id ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />} {tr('Photo', 'Photo')}
                          <input type="file" accept="image/*" multiple className="hidden" onChange={e => addPhoto(it.id, e.target.files)} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Non-conformité (ou type photo) → détail d'anomalie + photos, façon rapport chantier. */}
                  {(failed || it.type === 'photo' || (a.photos && a.photos.length > 0)) && (
                    <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50/60 p-2.5 dark:border-rose-500/30 dark:bg-rose-500/10">
                      {failed && <textarea className={INP + ' w-full text-xs'} rows={2} value={a.detail || ''} onChange={e => upd(it.id, { detail: e.target.value })} placeholder={tr('Détail de l’anomalie (description, gravité, action requise)…', 'Anomaly detail (description, severity, required action)…')} />}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {(a.photos || []).map(u => (
                          <div key={u} className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={u} alt="" className="h-14 w-14 rounded object-cover" />
                            <button onClick={() => rmPhoto(it.id, u)} className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-rose-600 text-white"><X size={10} /></button>
                          </div>
                        ))}
                        {it.type !== 'photo' && (
                          <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300">
                            {uploading === it.id ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />} {tr('Ajouter photo', 'Add photo')}
                            <input type="file" accept="image/*" multiple className="hidden" onChange={e => addPhoto(it.id, e.target.files)} />
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-500"><span>{tr('Notes générales', 'General notes')}</span>
          <textarea className={INP + ' w-full'} rows={2} value={notes} onChange={e => setNotes(e.target.value)} /></label>
      </div>
      <div className="flex justify-end gap-2 pb-4">
        <button onClick={() => save('draft')} disabled={saving} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300">{tr('Brouillon', 'Draft')}</button>
        <button onClick={() => save('submitted')} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {tr('Enregistrer l’inspection', 'Save inspection')}</button>
      </div>
    </div>
  );
}
