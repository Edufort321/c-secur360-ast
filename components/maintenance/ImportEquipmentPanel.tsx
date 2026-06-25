'use client';
// Hub d'import SÉLECTIF d'équipements depuis d'autres modules (DGA, Rapport terrain…).
// L'utilisateur choisit une source → voit la liste → coche ceux qu'il veut (ou tout) → les importe
// vers un client/site. Les équipements déjà importés sont grisés. Voir lib/maintImport.ts.
import { useEffect, useMemo, useState } from 'react';
import { Loader2, X, Download, CheckSquare, Square, Building2, MapPin, ChevronRight } from 'lucide-react';
import { IMPORT_SOURCES, getCandidates, importCandidates, type ImportSource, type Candidate } from '@/lib/maintImport';
import type { SClient, SEquip } from '@/lib/serviceTree';
import type { SiteNode } from '@/lib/sites';

type Tr = (fr: string, en: string) => string;

export default function ImportEquipmentPanel({ tenant, tr, clients, sites, existing, onClose, onImported }: {
  tenant: string; tr: Tr; clients: SClient[]; sites: SiteNode[]; existing: SEquip[];
  onClose: () => void; onImported: () => void;
}) {
  const [source, setSource] = useState<ImportSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [cands, setCands] = useState<Candidate[]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [clientId, setClientId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function pickSource(s: ImportSource) {
    setSource(s); setLoading(true); setSel(new Set()); setNotice(null);
    try { setCands(await getCandidates(tenant, s, existing)); }
    catch { setCands([]); }
    finally { setLoading(false); }
  }

  const importable = useMemo(() => cands.filter(c => !c.alreadyImported), [cands]);
  const allSel = importable.length > 0 && importable.every(c => sel.has(c.sourceId));
  const toggle = (id: string) => setSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSel(allSel ? new Set() : new Set(importable.map(c => c.sourceId)));

  async function doImport() {
    const chosen = cands.filter(c => sel.has(c.sourceId) && !c.alreadyImported);
    if (!chosen.length) return;
    setBusy(true); setNotice(null);
    const { count, errors } = await importCandidates(tenant, chosen, { clientId: clientId || null, siteId: siteId || null });
    setBusy(false);
    if (errors.length) setNotice(tr(`${count} importé(s), ${errors.length} en erreur.`, `${count} imported, ${errors.length} failed.`));
    else onImported();
  }

  const meta = IMPORT_SOURCES.find(s => s.id === source);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700">
          <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white"><Download size={18} className="text-indigo-600" /> {tr('Importer des équipements', 'Import equipment')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {/* Étape 1 — choisir la source */}
          {!source ? (
            <div className="space-y-2">
              <p className="mb-2 text-sm text-gray-500">{tr('Choisis un module source. Tu verras sa liste et tu synchroniseras seulement ce que tu veux.', 'Pick a source module. You will see its list and import only what you want.')}</p>
              {IMPORT_SOURCES.map(s => (
                <button key={s.id} onClick={() => pickSource(s.id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-700 dark:hover:bg-indigo-900/20">
                  <span>
                    <span className="block text-sm font-bold text-gray-800 dark:text-gray-100">{tr(s.fr, s.en)}</span>
                    <span className="block text-xs text-gray-500">{tr(s.descFr, s.descEn)}</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-gray-400" />
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2">
                <button onClick={() => { setSource(null); setCands([]); setSel(new Set()); }} className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">← {tr('Sources', 'Sources')}</button>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{meta ? tr(meta.fr, meta.en) : ''}</span>
              </div>

              {/* Cible : client + site appliqués à tous les éléments cochés */}
              <div className="mb-3 grid grid-cols-1 gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-900/40 sm:grid-cols-2">
                <label className="text-xs font-semibold text-gray-500"><span className="mb-1 flex items-center gap-1"><Building2 size={12} /> {tr('Rattacher au client', 'Assign to client')}</span>
                  <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700">
                    <option value="">{tr('— non assigné —', '— unassigned —')}</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold text-gray-500"><span className="mb-1 flex items-center gap-1"><MapPin size={12} /> {tr('Site / département', 'Site / department')}</span>
                  <select value={siteId} onChange={e => setSiteId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700">
                    <option value="">{tr('— aucun —', '— none —')}</option>
                    {sites.map(s => [
                      <option key={s.id} value={s.id}>{s.name}</option>,
                      ...s.departments.map(d => <option key={d.id} value={d.id}>{`  · ${d.name}`}</option>),
                    ])}
                  </select>
                </label>
                {source === 'planner' && <p className="text-[11px] text-gray-400 sm:col-span-2">{tr('Astuce : laisse « Site » vide pour conserver le site d’origine de chaque équipement du planificateur.', 'Tip: leave “Site” empty to keep each planner equipment’s original site.')}</p>}
              </div>

              {loading ? (
                <div className="grid place-items-center py-12 text-gray-400"><Loader2 className="animate-spin" /></div>
              ) : cands.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">{tr('Aucun équipement à importer depuis cette source.', 'No equipment to import from this source.')}</p>
              ) : (
                <>
                  <div className="mb-2 flex items-center justify-between">
                    <button onClick={toggleAll} disabled={!importable.length} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 disabled:opacity-40 dark:text-indigo-300">
                      {allSel ? <CheckSquare size={14} /> : <Square size={14} />} {tr('Tout sélectionner', 'Select all')} ({importable.length})
                    </button>
                    <span className="text-xs text-gray-400">{tr(`${cands.length - importable.length} déjà importé(s)`, `${cands.length - importable.length} already imported`)}</span>
                  </div>
                  <div className="space-y-1">
                    {cands.map(c => {
                      const checked = sel.has(c.sourceId);
                      return (
                        <button key={c.sourceId} disabled={c.alreadyImported} onClick={() => toggle(c.sourceId)}
                          className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ${c.alreadyImported ? 'cursor-default border-gray-100 bg-gray-50 opacity-50 dark:border-gray-700/50 dark:bg-gray-900/30' : checked ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20' : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40'}`}>
                          {c.alreadyImported ? <CheckSquare size={15} className="shrink-0 text-gray-300" /> : checked ? <CheckSquare size={15} className="shrink-0 text-indigo-600" /> : <Square size={15} className="shrink-0 text-gray-400" />}
                          <span className="min-w-0 flex-1 truncate">
                            <span className="font-semibold text-gray-800 dark:text-gray-100">{c.name}</span>
                            {c.serial ? <span className="text-gray-400"> · {c.serial}</span> : ''}
                            {c.type ? <span className="text-gray-400"> · {c.type}</span> : ''}
                            {c.location ? <span className="text-gray-400"> · {c.location}</span> : ''}
                          </span>
                          {c.alreadyImported && <span className="shrink-0 text-[10px] font-semibold uppercase text-gray-400">{tr('importé', 'imported')}</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {source && (
          <div className="flex items-center justify-between gap-2 border-t border-gray-200 px-5 py-3 dark:border-gray-700">
            <span className="text-xs text-gray-500">{notice || tr(`${sel.size} sélectionné(s)`, `${sel.size} selected`)}</span>
            <div className="flex gap-2">
              <button onClick={onClose} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300">{tr('Fermer', 'Close')}</button>
              <button onClick={doImport} disabled={busy || sel.size === 0} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} {tr('Importer la sélection', 'Import selection')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
