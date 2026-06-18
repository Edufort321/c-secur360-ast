'use client';
// Gestionnaire de GABARITS de maintenance — LÉGER (pas le module Rapport terrain complet). Liste des
// gabarits, création depuis un modèle « Rapport d'inspection » ou vierge, éditeur de blocs simple
// (section / inspection / mesures / photos / note). Stockés dans rapport_templates (docType='maintenance').
import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, ClipboardList, ChevronUp, ChevronDown, FileText } from 'lucide-react';
import {
  getGabarits, saveGabarit, deleteGabarit, blankGabarit, newBlock, starterInspection,
  BLOCK_LABELS, BLOCK_ICON, type Gabarit, type GBlock, type GBlockType,
} from '@/lib/maintGabarits';

type Tr = (fr: string, en: string) => string;
const newId = () => (globalThis.crypto?.randomUUID?.() || `g${Date.now()}${Math.round(Math.random() * 1e6)}`);

export default function GabaritManager({ tenant, tr }: { tenant: string; tr: Tr }) {
  const [list, setList] = useState<Gabarit[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Gabarit | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function reload() { setLoading(true); setList(await getGabarits(tenant)); setLoading(false); }
  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tenant]);

  function startNew(starter: boolean) { const g = blankGabarit(); if (!starter) g.blocks = [newBlock('section')]; setEdit(g); setMsg(''); }

  async function save() {
    if (!edit) return;
    if (!edit.name.trim()) { setMsg(tr('Nom du gabarit requis.', 'Template name required.')); return; }
    setBusy(true); setMsg('');
    const r = await saveGabarit(tenant, edit);
    setBusy(false);
    if (r.error) { setMsg(tr('Erreur : ', 'Error: ') + r.error); return; }
    setEdit(null); reload();
  }
  async function remove(id: string) {
    if (!window.confirm(tr('Supprimer ce gabarit ?', 'Delete this template?'))) return;
    await deleteGabarit(tenant, id); reload();
  }

  // Helpers d'édition de blocs
  const setBlocks = (fn: (b: GBlock[]) => GBlock[]) => setEdit(e => e ? { ...e, blocks: fn(e.blocks) } : e);
  const addBlock = (t: GBlockType) => setBlocks(b => [...b, newBlock(t)]);
  const delBlock = (i: number) => setBlocks(b => b.filter((_, j) => j !== i));
  const moveBlock = (i: number, d: -1 | 1) => setBlocks(b => { const n = [...b]; const j = i + d; if (j < 0 || j >= n.length) return n; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const updTitle = (i: number, v: string) => setBlocks(b => b.map((x, j) => j === i ? { ...x, title: v } : x));
  const updItems = (i: number, v: string) => setBlocks(b => b.map((x, j) => j === i ? { ...x, items: v.split('\n').map(s => s.replace(/^[-•\s]+/, '')) } : x));

  if (edit) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200"><ClipboardList size={16} className="text-orange-600" /> {tr('Éditer le gabarit', 'Edit template')}</h3>
          <div className="flex gap-2">
            <button onClick={() => setEdit(null)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:border-gray-600 dark:text-gray-300">{tr('Annuler', 'Cancel')}</button>
            <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{busy ? <Loader2 size={14} className="animate-spin" /> : null} {tr('Enregistrer', 'Save')}</button>
          </div>
        </div>
        {msg && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">{msg}</p>}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <label className="block text-xs font-semibold text-slate-500">{tr('Nom du gabarit', 'Template name')}
            <input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} placeholder={tr('Ex. Rapport d’inspection — chariot élévateur', 'e.g. Inspection report — forklift')} className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" />
          </label>
        </div>

        {/* Blocs */}
        <div className="space-y-2">
          {edit.blocks.map((b, i) => (
            <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-100 text-sm text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">{BLOCK_ICON[b.type]}</span>
                <input value={b.title} onChange={e => updTitle(i, e.target.value)} className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-semibold dark:border-gray-600 dark:bg-gray-700" placeholder={BLOCK_LABELS[b.type]} />
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500 dark:bg-gray-700">{BLOCK_LABELS[b.type]}</span>
                <button onClick={() => moveBlock(i, -1)} disabled={i === 0} className="text-slate-300 hover:text-slate-600 disabled:opacity-30"><ChevronUp size={15} /></button>
                <button onClick={() => moveBlock(i, 1)} disabled={i === edit.blocks.length - 1} className="text-slate-300 hover:text-slate-600 disabled:opacity-30"><ChevronDown size={15} /></button>
                <button onClick={() => delBlock(i)} className="text-slate-300 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
              {(b.type === 'section' || b.type === 'inspect' || b.type === 'mesures') && (
                <label className="block text-[11px] font-semibold text-slate-400">
                  {b.type === 'inspect' ? tr('Points à vérifier (un par ligne)', 'Items to check (one per line)') : b.type === 'mesures' ? tr('Mesures à saisir (une par ligne)', 'Measures (one per line)') : tr('Champs (un par ligne)', 'Fields (one per line)')}
                  <textarea value={(b.items || []).join('\n')} onChange={e => updItems(i, e.target.value)} rows={Math.max(2, (b.items || []).length)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" />
                </label>
              )}
              {b.type === 'photos' && <p className="text-[11px] text-slate-400">{tr('Bloc photos : l’inspecteur ajoutera des photos terrain.', 'Photo block: the inspector will add field photos.')}</p>}
              {b.type === 'note' && <p className="text-[11px] text-slate-400">{tr('Bloc note : champ texte libre.', 'Note block: free text field.')}</p>}
            </div>
          ))}
        </div>

        {/* Ajouter un bloc */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
          <span className="text-xs font-semibold text-slate-500">{tr('Ajouter un bloc :', 'Add block:')}</span>
          {(['section', 'inspect', 'mesures', 'photos', 'note'] as GBlockType[]).map(t => (
            <button key={t} onClick={() => addBlock(t)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-gray-600 dark:text-gray-300"><span>{BLOCK_ICON[t]}</span> {BLOCK_LABELS[t]}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{tr('Un gabarit = un modèle réutilisable (genre « Rapport d’inspection »). Crée-le, puis assigne-le à un équipement dans « Clients & équipements ».', 'A template = a reusable model. Create it, then assign it to equipment in "Clients & equipment".')}</p>
        <div className="flex gap-2">
          <button onClick={() => startNew(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700"><FileText size={15} /> {tr('Modèle « Rapport d’inspection »', 'Inspection report model')}</button>
          <button onClick={() => startNew(false)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-gray-600 dark:text-gray-300"><Plus size={15} /> {tr('Vierge', 'Blank')}</button>
        </div>
      </div>

      {loading ? <div className="grid place-items-center py-16 text-slate-400"><Loader2 className="animate-spin" /></div>
        : list.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-gray-700 dark:bg-gray-800">{tr('Aucun gabarit. Crée ton premier modèle ci-dessus.', 'No template yet. Create your first model above.')}</div>
          : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map(g => (
                <div key={g.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{g.name}</div>
                    <button onClick={() => remove(g.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">{g.blocks.length} {tr('bloc(s)', 'block(s)')}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {g.blocks.slice(0, 6).map(b => <span key={b.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-gray-700">{BLOCK_ICON[b.type]} {b.title || BLOCK_LABELS[b.type]}</span>)}
                  </div>
                  <button onClick={() => setEdit(g)} className="mt-3 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-gray-600 dark:text-gray-300">{tr('Éditer', 'Edit')}</button>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}
