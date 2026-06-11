'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProjectActuals } from '@/lib/projectActuals';

const money = (n: number) => `${(Math.round((n || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

// Vue LECTURE SEULE du coût réel : agrégée automatiquement depuis les feuilles de temps
// pointées sur ce projet (plus de double-saisie). Le pointage se fait dans le module Feuilles de temps.
export function ProjectTimesheetSummary({ actuals, tenant }: { actuals: ProjectActuals; tenant: string }) {
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const totalHours = actuals.hours.reg + actuals.hours.supp + actuals.hours.maj;

  const Stat = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className={`mt-0.5 text-lg font-bold tabular-nums ${tone || ''}`}>{value}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-lg font-bold">
          {tr('Coût réel (feuilles de temps)', 'Actual cost (timesheets)')} : <span className="text-blue-600 dark:text-blue-400">{money(actuals.total)}</span>
        </div>
        <Link href={`/${tenant}/timesheets`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
          <ExternalLink size={15} /> {tr('Ouvrir les feuilles de temps', 'Open timesheets')}
        </Link>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        {tr(
          'Agrégé automatiquement à partir des heures pointées sur ce projet. Aucune saisie ici : les employés pointent dans le module Feuilles de temps.',
          'Automatically aggregated from hours logged on this project. No entry here: employees log in the Timesheets module.',
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label={tr('Main-d’œuvre', 'Labor')} value={money(actuals.labor)} />
        <Stat label={tr('Kilométrage', 'Mileage')} value={money(actuals.km)} />
        <Stat label={tr('Matériel', 'Materials')} value={money(actuals.materiel)} />
        <Stat label={tr('Indemnités', 'Allowances')} value={money(actuals.allowances)} />
        <Stat label={tr('Dépenses (refact.)', 'Expenses (billable)')} value={money(actuals.expensesBillable)} tone="text-emerald-600 dark:text-emerald-400" />
        <Stat label={tr('Heures', 'Hours')} value={`${totalHours.toFixed(1)} h`} tone="text-gray-700 dark:text-gray-200" />
      </div>

      {actuals.count === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-600 dark:bg-gray-800">
          {tr('Aucune heure pointée sur ce projet pour le moment.', 'No hours logged on this project yet.')}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <th className="px-3 py-2">{tr('Date', 'Date')}</th>
                  <th className="px-3 py-2">{tr('Employé', 'Employee')}</th>
                  <th className="px-3 py-2 text-right">{tr('Rég', 'Reg')}</th>
                  <th className="px-3 py-2 text-right">{tr('Supp', 'OT')}</th>
                  <th className="px-3 py-2 text-right">{tr('Maj', 'Prem')}</th>
                  <th className="px-3 py-2 text-right">Km</th>
                  <th className="px-3 py-2 text-right">{tr('Matériel', 'Materials')}</th>
                  <th className="px-3 py-2 text-right">{tr('Coût', 'Cost')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {actuals.entries.map((e, i) => (
                  <tr key={i}>
                    <td className="px-3 py-1.5 whitespace-nowrap">{e.date || '—'}</td>
                    <td className="px-3 py-1.5">{e.employee}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{e.hrsReg || ''}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{e.hrsSupp || ''}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{e.hrsMaj || ''}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{e.km || ''}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{e.materiel ? money(e.materiel) : ''}</td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums">{money(e.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dépenses pointées sur le projet (refacturables → facture) */}
      {actuals.expenseEntries.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-gray-700">
            <span className="text-sm font-bold">{tr('Dépenses pointées', 'Logged expenses')}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {tr('Refacturables', 'Billable')} : <span className="font-semibold text-emerald-600 dark:text-emerald-400">{money(actuals.expensesBillable)}</span>
              {actuals.expensesTotal !== actuals.expensesBillable && <> · {tr('Total', 'Total')} {money(actuals.expensesTotal)}</>}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <th className="px-3 py-2">{tr('Date', 'Date')}</th>
                  <th className="px-3 py-2">{tr('Catégorie', 'Category')}</th>
                  <th className="px-3 py-2">{tr('Description', 'Description')}</th>
                  <th className="px-3 py-2">{tr('Fournisseur', 'Supplier')}</th>
                  <th className="px-3 py-2 text-center">{tr('Refact.', 'Billable')}</th>
                  <th className="px-3 py-2 text-right">{tr('Total', 'Total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {actuals.expenseEntries.map((x) => (
                  <tr key={x.id}>
                    <td className="px-3 py-1.5 whitespace-nowrap">{x.date || '—'}</td>
                    <td className="px-3 py-1.5">{x.category}</td>
                    <td className="px-3 py-1.5">{x.description || '—'}</td>
                    <td className="px-3 py-1.5">{x.supplier || '—'}</td>
                    <td className="px-3 py-1.5 text-center">{x.reimbursable ? '✓' : '—'}</td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums">{money(x.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
