'use client';
// Remplissage LÉGER d'une inspection à partir d'un GABARIT (modèle « Rapport d'inspection »). Rend les
// blocs du gabarit (section / inspection / mesures / photos / note), calcule le résultat global + les
// anomalies, et enregistre dans la table `rapports` (docType='maintenance') via /api/rapports/data —
// avec le lien équipement / client / projet (interconnexion soumission↔projet à venir).
import { useEffect, useState } from 'react';
import { Loader2, X, AlertTriangle, Check, Camera, Link2 } from 'lucide-react';
import type { Gabarit } from '@/lib/maintGabarits';
import { upsertEquipmentSchedule, type SEquip } from '@/lib/serviceTree';
import { getProjectsLite, type ProjectLite } from '@/lib/projectChain';

type Tr = (fr: string, en: string) => string;
type ItemState = 'ok' | 'anomaly';
const newId = () => (globalThis.crypto?.randomUUID?.() || `r${Date.now()}${Math.round(Math.random() * 1e6)}`);

export default function MaintInspectFill({
  tenant, tr, gabarit, equipment, clientId, projectId, onClose, onSaved,
}: {
  tenant: string; tr: Tr; gabarit: Gabarit; equipment: SEquip; clientId?: string | null;
  projectId?: string | null; onClose: () => void; onSaved: () => void;
}) {
  const [inspector, setInspector] = useState('');
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [linkedProject, setLinkedProject] = useState<string>(projectId || '');
  useEffect(() => { getProjectsLite(tenant).then(setProjects, () => {}); }, [tenant]);
  // Réponses : par bloc.item → { state, note, retrait, photos } ou valeur (section/mesures/note)
  const [insp, setInsp] = useState<Record<string, { state: ItemState; note?: string; retrait?: boolean; photos?: string[] }>>({});
  const [fields, setFields] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const key = (bid: string, idx: number) => `${bid}:${idx}`;
  const setInspState = (k: string, patch: Partial<{ state: ItemState; note: string; retrait: boolean; photos: string[] }>) =>
    setInsp(p => ({ ...p, [k]: { ...(p[k] || { state: 'ok' as ItemState }), ...patch } }));

  function addPhoto(store: 'field' | string, k: string, file?: File) {
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      const url = String(rd.result);
      if (store === 'field') setInspState(k, { photos: [...(insp[k]?.photos || []), url] });
      else setPhotos(p => ({ ...p, [k]: [...(p[k] || []), url] }));
    };
    rd.readAsDataURL(file);
  }

  // Résultat global : retrait > non_conforme (anomalie) > conforme.
  function compute() {
    let anomalies = 0, retrait = false;
    for (const b of gabarit.blocks) if (b.type === 'inspect') (b.items || []).forEach((_, i) => {
      const r = insp[key(b.id, i)]; if (r?.state === 'anomaly') { anomalies++; if (r.retrait) retrait = true; }
    });
    const result = retrait ? 'retrait' : anomalies > 0 ? 'non_conforme' : 'conforme';
    return { result, anomalies };
  }

  async function save() {
    setBusy(true); setMsg('');
    const { result, anomalies } = compute();
    const blocks = gabarit.blocks.map(b => {
      if (b.type === 'inspect') return { ...b, results: (b.items || []).map((label, i) => ({ label, ...(insp[key(b.id, i)] || { state: 'ok' }) })) };
      if (b.type === 'section' || b.type === 'mesures') return { ...b, values: (b.items || []).map((label, i) => ({ label, value: fields[key(b.id, i)] || '' })) };
      if (b.type === 'photos') return { ...b, photos: photos[b.id] || [] };
      if (b.type === 'note') return { ...b, value: fields[`${b.id}:note`] || '' };
      return b;
    });
    const id = newId();
    const item: any = {
      id, title: `${gabarit.name} — ${equipment.name}`, template: gabarit.id, status: 'sent', num: null,
      equipment_id: equipment.id, equipment_name: equipment.name, client_id: clientId || equipment.client_id || null,
      inspector_name: inspector || null, performed_at: new Date().toISOString(),
      overall_result: result, anomalies_count: anomalies, blocks,
      link: linkedProject ? { projectId: linkedProject } : undefined,
    };
    try {
      const r = await fetch('/api/rapports/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ kind: 'reports', docType: 'maintenance', tenant, item }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg(tr('Erreur : ', 'Error: ') + (j.error || r.status)); setBusy(false); return; }
      // Inspection faite → MAJ l'échéance récurrente de l'équipement (dernière faite = aujourd'hui).
      if (equipment.frequency) await upsertEquipmentSchedule(tenant, equipment.id, equipment.frequency, new Date().toISOString());
      onSaved();
    } catch (e: any) { setMsg(tr('Erreur réseau : ', 'Network error: ') + (e?.message || '')); setBusy(false); }
  }

  const { result, anomalies } = compute();
  const resCls = result === 'conforme' ? 'bg-emerald-100 text-emerald-700' : result === 'retrait' ? 'bg-red-600 text-white' : 'bg-rose-100 text-rose-700';

  return (
    <div className="fixed inset-0 z-[9998] flex items-start justify-center overflow-auto bg-black/50 p-4">
      <div className="my-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{gabarit.name}</h3>
            <p className="text-xs text-slate-500">{equipment.name}{equipment.serial ? ` · ${equipment.serial}` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${resCls}`}>{result === 'conforme' ? tr('Conforme', 'Pass') : result === 'retrait' ? tr('Retrait', 'Out of service') : `${anomalies} ${tr('anomalie(s)', 'issue(s)')}`}</span>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
          </div>
        </div>

        <div className="space-y-3 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-500">{tr('Inspecteur', 'Inspector')}
              <input value={inspector} onChange={e => setInspector(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" placeholder={tr('Nom', 'Name')} />
            </label>
            <label className="block text-xs font-semibold text-slate-500"><span className="flex items-center gap-1"><Link2 size={12} /> {tr('Projet / soumission (optionnel)', 'Project / quote (optional)')}</span>
              <select value={linkedProject} onChange={e => setLinkedProject(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700">
                <option value="">{tr('— aucun (maintenance hors contrat) —', '— none —')}</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.number}{p.title ? ` — ${p.title}` : ''}</option>)}
              </select>
            </label>
          </div>
          <p className="-mt-1 text-[11px] text-slate-400">{tr('Lier à un projet permet de comparer le temps réel au temps prévu (soumission) et de chaîner à la facturation.', 'Linking to a project compares actual vs estimated time and chains to billing.')}</p>

          {gabarit.blocks.map(b => (
            <div key={b.id} className="rounded-xl border border-slate-200 p-3 dark:border-gray-700">
              <div className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">{b.title}</div>

              {(b.type === 'section' || b.type === 'mesures') && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {(b.items || []).map((label, i) => (
                    <label key={i} className="text-[11px] font-semibold text-slate-400">{label}
                      <input value={fields[key(b.id, i)] || ''} onChange={e => setFields(p => ({ ...p, [key(b.id, i)]: e.target.value }))} className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" />
                    </label>
                  ))}
                </div>
              )}

              {b.type === 'inspect' && (
                <div className="space-y-1.5">
                  {(b.items || []).map((label, i) => {
                    const k = key(b.id, i); const r = insp[k] || { state: 'ok' as ItemState };
                    return (
                      <div key={i} className="rounded-lg border border-slate-100 p-2 dark:border-gray-700">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex-1 text-sm">{label}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setInspState(k, { state: 'ok' })} className={`rounded px-2 py-1 text-xs font-semibold ${r.state === 'ok' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-gray-700'}`}><Check size={12} className="inline" /> {tr('OK', 'OK')}</button>
                            <button onClick={() => setInspState(k, { state: 'anomaly' })} className={`rounded px-2 py-1 text-xs font-semibold ${r.state === 'anomaly' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-gray-700'}`}><AlertTriangle size={12} className="inline" /> {tr('Anomalie', 'Issue')}</button>
                          </div>
                        </div>
                        {r.state === 'anomaly' && (
                          <div className="mt-1.5 space-y-1.5">
                            <input value={r.note || ''} onChange={e => setInspState(k, { note: e.target.value })} placeholder={tr('Description de l’anomalie', 'Issue description')} className="w-full rounded-lg border border-rose-200 px-2 py-1.5 text-sm dark:border-rose-800 dark:bg-gray-700" />
                            <div className="flex items-center gap-3">
                              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600"><input type="checkbox" checked={!!r.retrait} onChange={e => setInspState(k, { retrait: e.target.checked })} /> {tr('Retrait de service', 'Out of service')}</label>
                              <label className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-500"><Camera size={13} /> {tr('Photo', 'Photo')}<input type="file" accept="image/*" className="hidden" onChange={e => addPhoto('field', k, e.target.files?.[0])} /></label>
                              {(r.photos || []).length > 0 && <span className="text-xs text-emerald-600">{(r.photos || []).length} {tr('photo(s)', 'photo(s)')}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {b.type === 'photos' && (
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:border-gray-600 dark:text-gray-300"><Camera size={14} /> {tr('Ajouter une photo', 'Add photo')}<input type="file" accept="image/*" className="hidden" onChange={e => addPhoto(b.id, b.id, e.target.files?.[0])} />
                  {(photos[b.id] || []).length > 0 && <span className="ml-1 text-emerald-600">{(photos[b.id] || []).length}</span>}
                </label>
              )}

              {b.type === 'note' && (
                <textarea value={fields[`${b.id}:note`] || ''} onChange={e => setFields(p => ({ ...p, [`${b.id}:note`]: e.target.value }))} rows={3} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" />
              )}
            </div>
          ))}

          {msg && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">{msg}</p>}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 rounded-b-2xl border-t border-slate-200 bg-white px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:border-gray-600 dark:text-gray-300">{tr('Annuler', 'Cancel')}</button>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{busy ? <Loader2 size={14} className="animate-spin" /> : null} {tr('Enregistrer l’inspection', 'Save inspection')}</button>
        </div>
      </div>
    </div>
  );
}
