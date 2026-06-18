'use client';
// Gestionnaire des CLASSES DE REVENU (migration 232) — créer/éditer/supprimer ses classes (ex. Service,
// Projet, Maintenance, Location…). Les classes alimentent la saisie de revenu (factures + transactions)
// et la ventilation « Revenus par classe » de l'état financier. Indépendant du catalogue produit.
import { useState } from 'react';
import { Loader2, Plus, Trash2, Tags } from 'lucide-react';
import { useRevenueClasses, saveRevenueClass, deleteRevenueClass } from '@/lib/revenueClasses';

type Tr = (fr: string, en: string) => string;

export default function RevenueClassManager({ tenant, tr }: { tenant: string; tr: Tr }) {
  const { classes, reload } = useRevenueClasses(tenant);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');

  async function add() {
    if (!name.trim()) return;
    setBusy(true); setMsg('');
    const r = await saveRevenueClass(tenant, { name, sort_order: classes.length });
    setBusy(false);
    if (r.error) setMsg(r.error + tr(' (migration 232 appliquée ?)', ' (migration 232 applied?)')); else { setName(''); reload(); }
  }
  async function remove(id?: string) { if (!id) return; await deleteRevenueClass(tenant, id); reload(); }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/40">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
        <Tags size={14} className="text-indigo-500" /> {tr('Gérer les classes de revenu', 'Manage revenue classes')}
        <span className="ml-auto text-slate-400">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          <p className="text-[11px] text-slate-400">{tr('Créez vos classes ici, puis choisissez-les à la saisie d’un revenu (facture ou transaction). La ventilation ci-dessus les utilise.', 'Create your classes here, then pick them when entering revenue (invoice or transaction). The breakdown above uses them.')}</p>
          <div className="flex flex-wrap gap-1.5">
            {classes.map(c => (
              <span key={c.id} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
                {c.name}
                <button onClick={() => remove(c.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={11} /></button>
              </span>
            ))}
            {classes.length === 0 && <span className="text-[11px] text-slate-400">{tr('Aucune classe. Ajoutez-en une.', 'No class yet. Add one.')}</span>}
          </div>
          <div className="flex items-center gap-2">
            <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder={tr('Nouvelle classe (ex. Service, Projet…)', 'New class (e.g. Service, Project…)')} className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900" />
            <button onClick={add} disabled={busy || !name.trim()} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{busy ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} {tr('Ajouter', 'Add')}</button>
          </div>
          {msg && <p className="text-[11px] text-amber-600">{msg}</p>}
        </div>
      )}
    </div>
  );
}
