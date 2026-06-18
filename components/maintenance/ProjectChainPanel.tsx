'use client';
// Panneau « remonter à la soumission » : pour une maintenance/projet, affiche la chaîne
// SOUMISSION (temps PRÉVU + montant) → TEMPS RÉEL fait (feuilles de temps) → FACTURÉ, avec le VERDICT
// « le temps était-il bon ? » (réel vs prévu) et l'historique des heures pointées.
import { useEffect, useState } from 'react';
import { Loader2, X, FileText, Clock, DollarSign, TrendingUp, TrendingDown, CheckCircle, Receipt } from 'lucide-react';
import { getProjectChain, type ProjectChain } from '@/lib/projectChain';

type Tr = (fr: string, en: string) => string;
const money = (n: number) => `${Math.round(Number(n) || 0).toLocaleString('fr-CA')} $`;
const h = (n: number) => `${(Math.round((Number(n) || 0) * 10) / 10).toLocaleString('fr-CA')} h`;

export default function ProjectChainPanel({ tenant, projectId, tr, onClose }: { tenant: string; projectId: string; tr: Tr; onClose: () => void }) {
  const [chain, setChain] = useState<ProjectChain | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getProjectChain(tenant, projectId).then(c => { setChain(c); setLoading(false); }, () => setLoading(false)); }, [tenant, projectId]);

  const v = chain?.variance;
  const onTime = v?.onTime;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-auto bg-black/50 p-4" onClick={onClose}>
      <div className="my-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-gray-700">
          <h3 className="flex items-center gap-1.5 text-base font-bold text-slate-900 dark:text-white"><FileText size={18} className="text-orange-600" /> {tr('Soumission → temps réel → facturation', 'Quote → actual time → billing')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
        </div>

        {loading ? <div className="grid place-items-center py-16 text-slate-400"><Loader2 className="animate-spin" /></div> : !chain ? (
          <p className="p-5 text-sm text-slate-400">{tr('Aucune donnée.', 'No data.')}</p>
        ) : (
          <div className="space-y-4 p-5">
            {/* En-tête projet */}
            <div className="rounded-xl border border-slate-200 p-3 dark:border-gray-700">
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{chain.project?.number || tr('Projet', 'Project')}{chain.project?.title ? ` — ${chain.project.title}` : ''}</div>
              {chain.soumission ? <div className="text-xs text-slate-500">{tr('Soumission', 'Quote')} {chain.soumission.numero} · {money(chain.soumission.total)}</div>
                : <div className="text-xs text-amber-600">{tr('Aucune soumission liée à ce projet (pas de temps prévu à comparer).', 'No quote linked (no estimated time to compare).')}</div>}
            </div>

            {/* Comparaison PRÉVU vs RÉEL */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 p-3 text-center dark:border-gray-700">
                <div className="text-[11px] font-semibold uppercase text-slate-400">{tr('Temps prévu', 'Estimated')}</div>
                <div className="text-xl font-extrabold text-slate-700 dark:text-slate-200">{chain.soumission ? h(v!.hoursEst) : '—'}</div>
                <div className="text-[10px] text-slate-400"><Clock size={10} className="inline" /> {tr('soumission', 'quote')}</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-center dark:border-gray-700">
                <div className="text-[11px] font-semibold uppercase text-slate-400">{tr('Temps réel', 'Actual')}</div>
                <div className="text-xl font-extrabold text-blue-600">{h(v!.hoursActual)}</div>
                <div className="text-[10px] text-slate-400"><Clock size={10} className="inline" /> {tr('feuilles de temps', 'timesheets')}</div>
              </div>
              <div className={`rounded-xl border p-3 text-center ${onTime === null ? 'border-slate-200 dark:border-gray-700' : onTime ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' : 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20'}`}>
                <div className="text-[11px] font-semibold uppercase text-slate-400">{tr('Écart', 'Variance')}</div>
                <div className={`text-xl font-extrabold ${onTime === null ? 'text-slate-400' : onTime ? 'text-emerald-600' : 'text-rose-600'}`}>{v!.hoursPct == null ? '—' : `${v!.hoursDelta >= 0 ? '+' : ''}${v!.hoursPct}%`}</div>
                <div className="text-[10px] text-slate-400">{onTime === null ? '—' : onTime ? <span className="text-emerald-600"><CheckCircle size={10} className="inline" /> {tr('dans le temps prévu', 'within estimate')}</span> : <span className="text-rose-600"><TrendingUp size={10} className="inline" /> {tr('dépassement', 'over')}</span>}</div>
              </div>
            </div>

            {/* Coût réel + facturé */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 p-3 dark:border-gray-700"><div className="text-[11px] font-semibold uppercase text-slate-400"><DollarSign size={11} className="inline" /> {tr('Coût réel chargé', 'Burdened cost')}</div><div className="text-lg font-extrabold text-rose-600">{money(chain.actuals.costReal)}</div></div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-gray-700"><div className="text-[11px] font-semibold uppercase text-slate-400"><Receipt size={11} className="inline" /> {tr('Facturé', 'Billed')}</div><div className="text-lg font-extrabold text-sky-600">{money(chain.billed)}</div></div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-gray-700"><div className="text-[11px] font-semibold uppercase text-slate-400">{tr('Marge', 'Margin')}</div><div className={`text-lg font-extrabold ${chain.billed - chain.actuals.costReal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{money(chain.billed - chain.actuals.costReal)}</div></div>
            </div>

            {/* Historique du temps fait */}
            <div>
              <div className="mb-1 text-xs font-bold text-slate-500">{tr('Historique du temps fait', 'Time history')} ({chain.actuals.entries.length})</div>
              {chain.actuals.entries.length === 0 ? <p className="text-xs text-slate-400">{tr('Aucune heure pointée sur ce projet. Pointez le temps sur ce projet dans la feuille de temps.', 'No time logged on this project.')}</p> : (
                <div className="max-h-52 overflow-auto rounded-xl border border-slate-200 dark:border-gray-700">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50 text-left text-slate-400 dark:bg-gray-900/40"><tr><th className="px-2 py-1">{tr('Date', 'Date')}</th><th className="px-2 py-1">{tr('Employé', 'Employee')}</th><th className="px-2 py-1 text-right">{tr('Heures', 'Hours')}</th><th className="px-2 py-1 text-right">{tr('Coût', 'Cost')}</th></tr></thead>
                    <tbody>
                      {chain.actuals.entries.map((e, i) => (
                        <tr key={i} className="border-t border-slate-100 dark:border-gray-700/50">
                          <td className="px-2 py-1 text-slate-600 dark:text-slate-300">{e.date}</td>
                          <td className="px-2 py-1 text-slate-600 dark:text-slate-300">{e.employee}</td>
                          <td className="px-2 py-1 text-right">{h(e.hrsReg + e.hrsSupp + e.hrsMaj)}</td>
                          <td className="px-2 py-1 text-right text-slate-500">{money(e.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400">{tr('Chaîne : soumission (prévu) → projet → feuilles de temps (réel) → factures. Le temps réel agrège les heures pointées sur le projet.', 'Chain: quote (estimate) → project → timesheets (actual) → invoices.')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
