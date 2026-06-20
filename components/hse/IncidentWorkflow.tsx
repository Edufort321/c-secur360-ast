'use client';
// Workflow d'un incident (ISO 45001) : cycle de vie ouvert→enquête→actions→clôturé, analyse des causes
// racines, et registre CAPA (actions correctives/préventives : responsable, échéance, preuve).
import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Check, Trash2, GitBranch } from 'lucide-react';
import { updateIncidentWorkflow, getCapa, saveCapa, completeCapa, deleteCapa, type HseCapa, type HseIncident } from '@/lib/hse/data';

type Tr = (fr: string, en: string) => string;
const STATUSES = [
  { v: 'open', fr: 'Ouvert', en: 'Open' },
  { v: 'investigation', fr: 'Enquête', en: 'Investigation' },
  { v: 'capa', fr: 'Actions correctives', en: 'Corrective actions' },
  { v: 'closed', fr: 'Clôturé', en: 'Closed' },
];

export function IncidentWorkflow({ tenant, incident, tr, onChanged, userEmail }: { tenant: string; incident: HseIncident; tr: Tr; onChanged?: () => void; userEmail?: string }) {
  const [status, setStatus] = useState(incident.status || 'open');
  const [rootCause, setRootCause] = useState(incident.root_cause || '');
  const [factors, setFactors] = useState(incident.contributing_factors || '');
  const [savingWf, setSavingWf] = useState(false);
  const [capa, setCapa] = useState<HseCapa[]>([]);
  const [loadingC, setLoadingC] = useState(true);
  const [add, setAdd] = useState<HseCapa | null>(null);

  async function loadCapa() { setLoadingC(true); setCapa(await getCapa(tenant, incident.id!)); setLoadingC(false); }
  useEffect(() => { loadCapa(); /* eslint-disable-next-line */ }, [incident.id]);

  async function saveWf() {
    setSavingWf(true);
    await updateIncidentWorkflow(tenant, incident.id!, { status, root_cause: rootCause, contributing_factors: factors, closed_by: userEmail });
    setSavingWf(false); onChanged?.();
  }
  async function addCapa() {
    if (!add?.description) return;
    await saveCapa(tenant, { ...add, incident_id: incident.id!, created_by: userEmail });
    setAdd(null); await loadCapa();
  }

  const inp = 'w-full rounded-lg border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900';
  const overdue = (c: HseCapa) => c.status !== 'done' && c.due_date && c.due_date < new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300"><GitBranch size={13} /> {tr('Enquête & suivi', 'Investigation & follow-up')}</div>

      {/* Cycle de vie */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s, i) => (
          <button key={s.v} onClick={() => setStatus(s.v)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === s.v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>{i + 1}. {tr(s.fr, s.en)}</button>
        ))}
      </div>

      {/* Causes racines */}
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs font-semibold text-gray-500">{tr('Cause racine (5 pourquoi / arbre des causes)', 'Root cause (5 whys / cause tree)')}<textarea value={rootCause} onChange={e => setRootCause(e.target.value)} rows={2} className={`mt-1 ${inp}`} /></label>
        <label className="text-xs font-semibold text-gray-500">{tr('Facteurs contributifs', 'Contributing factors')}<textarea value={factors} onChange={e => setFactors(e.target.value)} rows={2} className={`mt-1 ${inp}`} /></label>
      </div>
      <div className="flex justify-end"><button onClick={saveWf} disabled={savingWf} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{savingWf ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} {tr('Enregistrer le suivi', 'Save follow-up')}</button></div>

      {/* CAPA */}
      <div className="border-t border-gray-100 pt-2 dark:border-gray-700">
        <div className="mb-1.5 flex items-center justify-between"><span className="text-xs font-bold text-gray-600 dark:text-gray-300">{tr('Actions correctives / préventives (CAPA)', 'Corrective / preventive actions (CAPA)')} ({capa.length})</span>
          {!add && <button onClick={() => setAdd({ incident_id: incident.id!, description: '', kind: 'corrective' })} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"><Plus size={13} /> {tr('Ajouter', 'Add')}</button>}
        </div>
        {add && (
          <div className="mb-2 grid gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-900/40 sm:grid-cols-2">
            <label className="text-[11px] font-semibold text-gray-500 sm:col-span-2">{tr('Description', 'Description')}<input value={add.description} onChange={e => setAdd({ ...add, description: e.target.value })} className={`mt-1 ${inp}`} /></label>
            <label className="text-[11px] font-semibold text-gray-500">{tr('Type', 'Type')}<select value={add.kind} onChange={e => setAdd({ ...add, kind: e.target.value })} className={`mt-1 ${inp}`}><option value="corrective">{tr('Corrective', 'Corrective')}</option><option value="preventive">{tr('Préventive', 'Preventive')}</option></select></label>
            <label className="text-[11px] font-semibold text-gray-500">{tr('Responsable', 'Assignee')}<input value={add.assigned_to || ''} onChange={e => setAdd({ ...add, assigned_to: e.target.value })} className={`mt-1 ${inp}`} /></label>
            <label className="text-[11px] font-semibold text-gray-500">{tr('Échéance', 'Due date')}<input type="date" value={add.due_date || ''} onChange={e => setAdd({ ...add, due_date: e.target.value })} className={`mt-1 ${inp}`} /></label>
            <div className="flex items-end justify-end gap-2"><button onClick={() => setAdd(null)} className="rounded-lg border border-gray-200 px-3 py-1 text-xs dark:border-gray-700">{tr('Annuler', 'Cancel')}</button><button onClick={addCapa} disabled={!add.description} className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50">{tr('Ajouter', 'Add')}</button></div>
          </div>
        )}
        {loadingC ? <Loader2 size={14} className="animate-spin text-gray-400" /> : capa.length === 0 ? <p className="text-[11px] text-gray-400">{tr('Aucune action.', 'No action.')}</p> : (
          <div className="space-y-1">
            {capa.map(c => (
              <div key={c.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1 text-xs dark:bg-gray-900/40">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${c.kind === 'preventive' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>{c.kind === 'preventive' ? tr('Prév.', 'Prev.') : tr('Corr.', 'Corr.')}</span>
                <span className={`flex-1 ${c.status === 'done' ? 'text-gray-400 line-through' : ''}`}>{c.description}{c.assigned_to ? ` · ${c.assigned_to}` : ''}</span>
                {c.due_date && <span className={`text-[10px] ${overdue(c) ? 'font-bold text-rose-600' : 'text-gray-400'}`}>{c.due_date}{overdue(c) ? ' ⚠' : ''}</span>}
                {c.status !== 'done' ? <button onClick={async () => { const ev = prompt(tr('Preuve de réalisation (note / lien) :', 'Completion evidence (note / link):')) || undefined; await completeCapa(tenant, c.id!, userEmail, ev); await loadCapa(); }} className="text-emerald-600 hover:underline">{tr('Clore', 'Close')}</button> : <Check size={13} className="text-emerald-500" />}
                <button onClick={async () => { await deleteCapa(tenant, c.id!); await loadCapa(); }} className="text-gray-300 hover:text-rose-500"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default IncidentWorkflow;
