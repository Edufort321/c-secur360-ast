'use client';
// Constructeur de FORMULAIRES D'INSPECTION customisables (module Maintenance, phase 1).
// Liste des gabarits + éditeur : sections, items typés (conforme/non-conforme, texte, nombre, liste,
// date, photo, case), flags critique/retrait, réordonnancement. Stocke dans inspection_form_templates.
import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Save, ChevronUp, ChevronDown, ClipboardList, Copy, FilePlus2 } from 'lucide-react';
import {
  getInspectionTemplates, saveInspectionTemplate, deleteInspectionTemplate, emptyTemplate, newId, countItems,
  STARTER_TEMPLATES, starterToTemplate,
  ITEM_TYPES, type InspectionFormTemplate, type FormSection, type FormItem, type FormItemType,
} from '@/lib/inspectionForms';

type Tr = (fr: string, en: string) => string;
const INP = 'rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900';

export default function InspectionFormBuilder({ tenant, tr }: { tenant: string; tr: Tr }) {
  const [list, setList] = useState<InspectionFormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<InspectionFormTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function reload() { setLoading(true); setList(await getInspectionTemplates(tenant)); setLoading(false); }
  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tenant]);

  // ── Mutations locales sur le gabarit en édition ──
  const patch = (p: Partial<InspectionFormTemplate>) => setEdit(e => e ? { ...e, ...p } : e);
  const setSections = (sections: FormSection[]) => patch({ sections });
  const addSection = () => edit && setSections([...edit.sections, { id: newId(), title: `Section ${edit.sections.length + 1}`, items: [] }]);
  const updSection = (sid: string, p: Partial<FormSection>) => edit && setSections(edit.sections.map(s => s.id === sid ? { ...s, ...p } : s));
  const delSection = (sid: string) => edit && setSections(edit.sections.filter(s => s.id !== sid));
  const moveSection = (i: number, d: -1 | 1) => {
    if (!edit) return; const a = [...edit.sections]; const j = i + d; if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; setSections(a);
  };
  const addItem = (sid: string) => edit && setSections(edit.sections.map(s => s.id === sid
    ? { ...s, items: [...s.items, { id: newId(), label: '', type: 'pass_fail' as FormItemType }] } : s));
  const updItem = (sid: string, iid: string, p: Partial<FormItem>) => edit && setSections(edit.sections.map(s => s.id === sid
    ? { ...s, items: s.items.map(it => it.id === iid ? { ...it, ...p } : it) } : s));
  const delItem = (sid: string, iid: string) => edit && setSections(edit.sections.map(s => s.id === sid
    ? { ...s, items: s.items.filter(it => it.id !== iid) } : s));
  const moveItem = (sid: string, i: number, d: -1 | 1) => edit && setSections(edit.sections.map(s => {
    if (s.id !== sid) return s; const a = [...s.items]; const j = i + d; if (j < 0 || j >= a.length) return s;
    [a[i], a[j]] = [a[j], a[i]]; return { ...s, items: a };
  }));

  async function save() {
    if (!edit) return;
    if (!edit.name.trim()) { setMsg(tr('Donnez un nom au formulaire.', 'Name the form.')); return; }
    setSaving(true); setMsg('');
    const r = await saveInspectionTemplate(tenant, edit);
    setSaving(false);
    if (r.error) { setMsg((tr('Enregistrement impossible : ', 'Save failed: ')) + r.error + tr(' (migration 225 appliquée ?)', ' (migration 225 applied?)')); return; }
    setEdit(null); reload();
  }
  async function remove(id?: string) {
    if (!id || !confirm(tr('Supprimer ce formulaire ?', 'Delete this form?'))) return;
    await deleteInspectionTemplate(tenant, id); if (edit?.id === id) setEdit(null); reload();
  }
  function duplicate(t: InspectionFormTemplate) {
    setEdit({ ...t, id: undefined, name: t.name + tr(' (copie)', ' (copy)'),
      sections: (t.sections || []).map(s => ({ ...s, id: newId(), items: s.items.map(it => ({ ...it, id: newId() })) })) });
  }

  // ── Vue ÉDITEUR ──
  if (edit) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setEdit(null)} className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-gray-400">← {tr('Retour aux formulaires', 'Back to forms')}</button>
          <div className="ml-auto flex gap-2">
            {edit.id && <button onClick={() => remove(edit.id)} className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"><Trash2 size={13} /> {tr('Supprimer', 'Delete')}</button>}
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {tr('Enregistrer', 'Save')}</button>
          </div>
        </div>
        {msg && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">{msg}</p>}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold text-gray-500"><span>{tr('Nom du formulaire', 'Form name')} *</span>
              <input className={INP} value={edit.name} onChange={e => patch({ name: e.target.value })} placeholder={tr('Ex. Inspection chariot élévateur', 'Ex. Forklift inspection')} /></label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-gray-500"><span>{tr('Famille / type d’équipement', 'Equipment family / type')}</span>
              <input className={INP} value={edit.category || ''} onChange={e => patch({ category: e.target.value })} placeholder={tr('Ex. Levage, Véhicule, Pont roulant…', 'Ex. Lifting, Vehicle, Crane…')} /></label>
          </div>
          <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-gray-500"><span>{tr('Description', 'Description')}</span>
            <input className={INP} value={edit.description || ''} onChange={e => patch({ description: e.target.value })} /></label>
          <label className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <input type="checkbox" checked={edit.active !== false} onChange={e => patch({ active: e.target.checked })} /> {tr('Actif (disponible pour les inspections)', 'Active (available for inspections)')}
          </label>
        </div>

        {edit.sections.map((s, si) => (
          <div key={s.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-center gap-2">
              <input className={INP + ' flex-1 font-bold'} value={s.title} onChange={e => updSection(s.id, { title: e.target.value })} placeholder={tr('Titre de section', 'Section title')} />
              <button onClick={() => moveSection(si, -1)} disabled={si === 0} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700"><ChevronUp size={16} /></button>
              <button onClick={() => moveSection(si, 1)} disabled={si === edit.sections.length - 1} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700"><ChevronDown size={16} /></button>
              <button onClick={() => delSection(s.id)} className="rounded p-1 text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></button>
            </div>
            <div className="space-y-2">
              {s.items.length === 0 && <p className="text-xs text-gray-400">{tr('Aucun point. Ajoutez-en ci-dessous.', 'No item yet. Add one below.')}</p>}
              {s.items.map((it, ii) => (
                <div key={it.id} className="rounded-xl border border-gray-100 p-2.5 dark:border-gray-700/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <input className={INP + ' min-w-[180px] flex-1'} value={it.label} onChange={e => updItem(s.id, it.id, { label: e.target.value })} placeholder={tr('Point à vérifier', 'Item to check')} />
                    <select className={INP} value={it.type} onChange={e => updItem(s.id, it.id, { type: e.target.value as FormItemType })}>
                      {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{tr(t.fr, t.en)}</option>)}
                    </select>
                    <button onClick={() => moveItem(s.id, ii, -1)} disabled={ii === 0} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700"><ChevronUp size={15} /></button>
                    <button onClick={() => moveItem(s.id, ii, 1)} disabled={ii === s.items.length - 1} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700"><ChevronDown size={15} /></button>
                    <button onClick={() => delItem(s.id, it.id)} className="rounded p-1 text-rose-500 hover:bg-rose-50"><Trash2 size={15} /></button>
                  </div>
                  {it.type === 'select' && (
                    <input className={INP + ' mt-2 w-full text-xs'} value={(it.options || []).join(', ')} onChange={e => updItem(s.id, it.id, { options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })} placeholder={tr('Choix séparés par des virgules (ex. Bon, Usé, À remplacer)', 'Choices separated by commas')} />
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                    <input className={INP + ' flex-1 !py-1 text-xs'} value={it.help || ''} onChange={e => updItem(s.id, it.id, { help: e.target.value })} placeholder={tr('Aide / consigne (optionnel)', 'Help / hint (optional)')} />
                    <label className="inline-flex items-center gap-1"><input type="checkbox" checked={!!it.required} onChange={e => updItem(s.id, it.id, { required: e.target.checked })} /> {tr('Requis', 'Required')}</label>
                    {(it.type === 'pass_fail' || it.type === 'checkbox') && <>
                      <label className="inline-flex items-center gap-1 text-amber-600"><input type="checkbox" checked={!!it.critical} onChange={e => updItem(s.id, it.id, { critical: e.target.checked })} /> {tr('Critique', 'Critical')}</label>
                      <label className="inline-flex items-center gap-1 text-rose-600"><input type="checkbox" checked={!!it.withdrawal} onChange={e => updItem(s.id, it.id, { withdrawal: e.target.checked })} /> {tr('Retrait si échec', 'Withdraw if fail')}</label>
                    </>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => addItem(s.id)} className="mt-3 inline-flex items-center gap-1 rounded-lg border border-orange-300 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-50 dark:border-orange-500/40 dark:text-orange-300"><Plus size={13} /> {tr('Ajouter un point', 'Add item')}</button>
          </div>
        ))}
        <button onClick={addSection} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter une section', 'Add section')}</button>
      </div>
    );
  }

  // ── Vue LISTE ──
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-gray-500">{tr('Créez des formulaires d’inspection sur mesure (check-lists) à coller en QR sur vos équipements.', 'Build custom inspection forms (checklists) to attach via QR to your equipment.')}</p>
        <button onClick={() => setEdit(emptyTemplate())} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"><FilePlus2 size={15} /> {tr('Nouveau formulaire', 'New form')}</button>
      </div>

      {/* Gabarits pré-montés : démarrage rapide (ouvre l'éditeur pré-rempli, modifiable avant d'enregistrer). */}
      <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-3 dark:border-orange-500/30 dark:bg-orange-500/10">
        <div className="mb-2 text-xs font-bold text-orange-800 dark:text-orange-300">⚡ {tr('Partir d’un gabarit pré-monté', 'Start from a pre-built template')}</div>
        <div className="flex flex-wrap gap-2">
          {STARTER_TEMPLATES.map((s, i) => (
            <button key={i} onClick={() => setEdit(starterToTemplate(s))} className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-white px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 dark:border-orange-500/40 dark:bg-gray-800 dark:text-orange-300">
              <Plus size={12} /> {s.name.replace(/^Inspection — /, '')}
            </button>
          ))}
        </div>
      </div>
      {loading ? <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>
        : list.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">{tr('Aucun formulaire. Cliquez « Nouveau formulaire ».', 'No form yet. Click "New form".')}</div>
        : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map(t => (
              <div key={t.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-100"><ClipboardList size={15} className="text-orange-600" /> {t.name}</span>
                  {t.active === false && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-700">{tr('Inactif', 'Inactive')}</span>}
                </div>
                {t.category && <div className="text-xs text-gray-500">{t.category}</div>}
                <div className="mt-1 text-[11px] text-gray-400">{t.sections?.length || 0} {tr('section(s)', 'section(s)')} · {countItems(t)} {tr('point(s)', 'item(s)')}</div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setEdit(t)} className="flex-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-700">{tr('Éditer', 'Edit')}</button>
                  <button onClick={() => duplicate(t)} title={tr('Dupliquer', 'Duplicate')} className="rounded-lg border border-gray-300 px-2 py-1.5 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"><Copy size={14} /></button>
                  <button onClick={() => remove(t.id)} title={tr('Supprimer', 'Delete')} className="rounded-lg border border-rose-300 px-2 py-1.5 text-rose-500 hover:bg-rose-50"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
