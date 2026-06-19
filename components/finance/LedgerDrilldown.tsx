'use client';
// Drill-down d'une carte KPI → écritures du GRAND LIVRE qui la composent (BLOC C). Réconcilié : le total
// du détail = la valeur de la carte. Export Excel (CSV FR) du détail.
import { useMemo } from 'react';
import { X, Download } from 'lucide-react';
import { extractLedgerLines, type DrillCategory, type LedgerEntry } from '@/lib/financialAnalytics';
import { downloadCsv } from '@/lib/csv';

type Tr = (fr: string, en: string) => string;
const mny = (n: number) => `${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

export default function LedgerDrilldown({ ledger, category, title, from, to, tr, onClose }: {
  ledger: LedgerEntry[]; category: DrillCategory; title: string; from?: string; to?: string; tr: Tr; onClose: () => void;
}) {
  const { lines, total } = useMemo(() => extractLedgerLines(ledger, { category, from, to }), [ledger, category, from, to]);

  function exportCsv() {
    downloadCsv(`detail-${category}.csv`, lines, [
      { key: 'date', label: tr('Date', 'Date'), type: 'date' },
      { key: 'code', label: tr('Compte', 'Account') },
      { key: 'account', label: tr('Libellé du compte', 'Account name') },
      { key: 'description', label: tr('Description', 'Description') },
      { key: 'amount', label: tr('Montant', 'Amount'), type: 'money' },
    ]);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-auto bg-black/50 p-4" onClick={onClose}>
      <div className="my-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-xs text-slate-500">{lines.length} {tr('écriture(s)', 'entries')} · {tr('total', 'total')} <b className="text-slate-700 dark:text-slate-200">{mny(total)}</b></p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCsv} disabled={!lines.length} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"><Download size={13} /> Excel</button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
          </div>
        </div>
        <div className="p-5">
          {lines.length === 0 ? <p className="text-sm text-slate-400">{tr('Aucune écriture comptabilisée pour cette catégorie sur la période.', 'No posted entries for this category in the period.')}</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="text-slate-400"><tr>
                  <th className="px-2 py-1 text-left">{tr('Date', 'Date')}</th><th className="px-2 py-1 text-left">{tr('Compte', 'Account')}</th><th className="px-2 py-1 text-left">{tr('Description', 'Description')}</th><th className="px-2 py-1">{tr('Montant', 'Amount')}</th>
                </tr></thead>
                <tbody>
                  {lines.slice(0, 500).map((l, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-gray-700/50">
                      <td className="px-2 py-1.5 text-left text-slate-600 dark:text-slate-300">{l.date}</td>
                      <td className="px-2 py-1.5 text-left"><span className="font-mono text-slate-500">{l.code}</span> <span className="text-slate-700 dark:text-slate-200">{l.account}</span></td>
                      <td className="px-2 py-1.5 text-left text-slate-500">{l.description}</td>
                      <td className="px-2 py-1.5 font-semibold text-slate-800 dark:text-slate-100">{mny(l.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="border-t-2 border-slate-200 font-bold dark:border-gray-600"><td className="px-2 py-1.5 text-left" colSpan={3}>{tr('Total', 'Total')}</td><td className="px-2 py-1.5">{mny(total)}</td></tr></tfoot>
              </table>
              {lines.length > 500 && <p className="mt-2 text-[11px] text-slate-400">{tr('500 premières écritures affichées — exportez en Excel pour le détail complet.', 'First 500 shown — export to Excel for full detail.')}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
