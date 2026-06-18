'use client';
// Rapport WIP (travaux en cours) — état des chantiers ACTIFS : contrat, coût réel chargé à date,
// facturé, % avancé, marge projetée, sur/sous-facturation. Best practice CFO.
import { useEffect, useState } from 'react';
import { Loader2, HardHat } from 'lucide-react';
import { getWipReport, type WipRow, type WipTotals } from '@/lib/wipReport';

type Tr = (fr: string, en: string) => string;
const money = (n: number) => `${(Math.round((Number(n) || 0)) ).toLocaleString('fr-CA')} $`;

export default function WipReport({ tenant, tr }: { tenant: string; tr: Tr }) {
  const [rows, setRows] = useState<WipRow[]>([]);
  const [totals, setTotals] = useState<WipTotals | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getWipReport(tenant).then(r => { setRows(r.rows); setTotals(r.totals); setLoading(false); }, () => setLoading(false)); }, [tenant]);

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"><div className="flex items-center gap-2 text-slate-400"><Loader2 size={15} className="animate-spin" /> {tr('Calcul WIP…', 'Computing WIP…')}</div></div>;
  if (!rows.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><HardHat size={16} className="text-amber-600" /> {tr('Travaux en cours (WIP)', 'Work in progress (WIP)')}</h3>
      {totals && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { l: tr('Chantiers actifs', 'Active jobs'), v: String(totals.count), c: 'text-slate-800 dark:text-slate-100' },
            { l: tr('Contrats', 'Contracts'), v: money(totals.contract), c: 'text-slate-800 dark:text-slate-100' },
            { l: tr('Coût à date', 'Cost-to-date'), v: money(totals.costToDate), c: 'text-rose-600' },
            { l: tr('Facturé à date', 'Billed-to-date'), v: money(totals.billedToDate), c: 'text-sky-600' },
            { l: tr('Marge projetée', 'Projected margin'), v: money(totals.projectedMargin), c: totals.projectedMargin >= 0 ? 'text-emerald-600' : 'text-red-600' },
          ].map((k, i) => (
            <div key={i} className="rounded-xl border border-slate-100 px-3 py-2 dark:border-gray-700"><div className={`text-lg font-extrabold ${k.c}`}>{k.v}</div><div className="text-[10px] text-slate-400">{k.l}</div></div>
          ))}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="text-slate-400"><tr>
            <th className="px-2 py-1 text-left">{tr('Projet', 'Project')}</th><th className="px-2 py-1">{tr('Contrat', 'Contract')}</th><th className="px-2 py-1">{tr('Coût chargé', 'Burdened cost')}</th><th className="px-2 py-1">{tr('Avancé', 'Progress')}</th><th className="px-2 py-1">{tr('Facturé', 'Billed')}</th><th className="px-2 py-1">{tr('Marge proj.', 'Proj. margin')}</th><th className="px-2 py-1">{tr('Sur/sous-fact.', 'Over/under')}</th>
          </tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-slate-100 dark:border-gray-700/50">
                <td className="px-2 py-1.5 text-left font-semibold text-slate-800 dark:text-slate-100">{r.number || r.title || '—'}<div className="text-[10px] font-normal text-slate-400">{r.title}</div></td>
                <td className="px-2 py-1.5">{money(r.contract)}</td>
                <td className="px-2 py-1.5 text-rose-600">{money(r.costToDate)}</td>
                <td className="px-2 py-1.5"><span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${r.pctComplete >= 100 ? 'bg-red-100 text-red-700' : r.pctComplete >= 85 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{r.pctComplete}%</span></td>
                <td className="px-2 py-1.5 text-sky-600">{money(r.billedToDate)}</td>
                <td className={`px-2 py-1.5 font-semibold ${r.projectedMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{money(r.projectedMargin)}</td>
                <td className={`px-2 py-1.5 ${r.overUnder >= 0 ? 'text-slate-500' : 'text-amber-600'}`}>{money(r.overUnder)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">{tr('Coût RÉEL chargé (fardeau MO inclus). Avancé = coût ÷ contrat. Sur/sous-fact. = facturé − coût (négatif = sous-facturé, attention à la trésorerie).', 'Real burdened cost. Progress = cost ÷ contract. Over/under = billed − cost (negative = under-billed, watch cash).')}</p>
    </div>
  );
}
