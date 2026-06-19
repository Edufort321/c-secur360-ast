'use client';
// Soumissions rattachées à un projet (interconnexion Projets↔Soumissions) :
//  - RATTACHER une soumission montée (recherche dynamique dans les soumissions du tenant) ;
//  - assigner une AUGMENTATION ANNUELLE en % par soumission (indexation pluriannuelle) ;
//  - projection du montant indexé sur 5 ans.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Link2, Unlink, TrendingUp } from 'lucide-react';
import { listSoumissionsLite, linkSoumissionToProject, setSoumissionAnnualIncrease, projectAnnualAmounts, type SoumissionLite } from '@/lib/soumissions';
import { EntitySearch, type EntityOption } from '@/components/ui/EntitySearch';

type Tr = (fr: string, en: string) => string;
const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`;

export function LinkedSoumissions({ tenant, projectId, tr }: { tenant: string; projectId: string; tr: Tr }) {
  const [all, setAll] = useState<SoumissionLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [pctEdits, setPctEdits] = useState<Record<string, string>>({});

  async function load() { setLoading(true); try { setAll(await listSoumissionsLite(tenant)); } finally { setLoading(false); } }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const linked = all.filter(s => s.project_id === projectId);
  // Rattachables : pas déjà sur CE projet (on autorise le transfert depuis un autre projet, avec avertissement).
  const attachable = all.filter(s => s.project_id !== projectId);

  async function attach(soumissionId: string) {
    const s = all.find(x => x.id === soumissionId);
    if (s?.project_id && !confirm(tr('Cette soumission est déjà rattachée à un autre projet. La déplacer ici ?', 'This quote is linked to another project. Move it here?'))) return;
    setBusy(soumissionId);
    await linkSoumissionToProject(tenant, soumissionId, projectId);
    setQuery('');
    await load(); setBusy(null);
  }
  async function detach(soumissionId: string) {
    if (!confirm(tr('Détacher cette soumission du projet ?', 'Detach this quote from the project?'))) return;
    setBusy(soumissionId);
    await linkSoumissionToProject(tenant, soumissionId, null);
    await load(); setBusy(null);
  }
  async function savePct(s: SoumissionLite) {
    const raw = pctEdits[s.id];
    const pct = raw === '' || raw == null ? null : Number(raw);
    setBusy(s.id);
    const { error } = await setSoumissionAnnualIncrease(tenant, s.id, pct);
    if (!error) setAll(list => list.map(x => x.id === s.id ? { ...x, annual_increase_pct: pct } : x));
    setBusy(null);
  }

  const inp = 'rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800';
  const opts: EntityOption[] = attachable.map(s => ({ id: s.id, label: s.numero || s.id, sub: `${mny(s.total)} · ${s.status}` }));

  return (
    <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold"><Link2 size={14} className="text-emerald-600" /> {tr('Soumissions rattachées', 'Linked quotes')} ({linked.length})</h3>

      {/* Rattacher une soumission montée (recherche dynamique). */}
      <div className="mb-3 max-w-md">
        <EntitySearch value={query} options={opts} placeholder={tr('Rechercher une soumission à rattacher…', 'Search a quote to link…')}
          onText={setQuery} onPick={(o: EntityOption) => attach(o.id)} className={`w-full ${inp}`} />
        <p className="mt-1 text-[11px] text-gray-400">{tr('Choisissez une soumission montée pour la lier à ce projet.', 'Pick a built quote to link it to this project.')}</p>
      </div>

      {loading ? <div className="py-4 text-center text-gray-400"><Loader2 className="mx-auto animate-spin" size={16} /></div>
        : linked.length === 0 ? <p className="text-sm text-gray-400">{tr('Aucune soumission rattachée.', 'No linked quote.')}</p>
        : (
          <div className="space-y-3">
            {linked.map(s => {
              const pct = pctEdits[s.id] ?? (s.annual_increase_pct != null ? String(s.annual_increase_pct) : '');
              const proj = projectAnnualAmounts(s.total, s.annual_increase_pct, 5);
              return (
                <div key={s.id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/${tenant}/soumissions?s=${s.id}`} className="font-semibold hover:text-emerald-600">{s.numero || s.id}</Link>
                    <span className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-semibold">{mny(s.total)}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">{s.status}</span>
                      <button onClick={() => detach(s.id)} disabled={busy === s.id} className="inline-flex items-center gap-1 text-gray-400 hover:text-rose-500"><Unlink size={13} /> {tr('Détacher', 'Detach')}</button>
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300"><TrendingUp size={13} className="text-indigo-500" /> {tr('Augmentation annuelle', 'Annual increase')}</label>
                    <input type="number" step="0.1" value={pct} placeholder="0"
                      onChange={e => setPctEdits(p => ({ ...p, [s.id]: e.target.value }))}
                      onBlur={() => { if ((pctEdits[s.id] ?? '') !== (s.annual_increase_pct != null ? String(s.annual_increase_pct) : '')) savePct(s); }}
                      className={`w-20 text-right ${inp}`} />
                    <span className="text-xs text-gray-500">% / {tr('an', 'yr')}</span>
                    {busy === s.id && <Loader2 size={13} className="animate-spin text-gray-400" />}
                  </div>
                  {/* Projection pluriannuelle indexée. */}
                  {(Number(s.annual_increase_pct) || 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {proj.map(y => (
                        <span key={y.year} className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                          {tr('An', 'Yr')} {y.year} : {mny(y.amount)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
