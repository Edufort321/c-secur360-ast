'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

export function CoutsTab({ estimate, actuals, poAmount }: { estimate: any; actuals: any; poAmount?: number | null }) {
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  const est = Number(estimate?.total || 0);
  const real = Number(actuals?.total || 0);
  const facture = Number(poAmount || 0);
  const ecart = real - est;
  const ecartPct = est > 0 ? (ecart / est) * 100 : 0;
  const marge = facture - real;
  const margePct = facture > 0 ? (marge / facture) * 100 : 0;

  const Card = ({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'pos' | 'neg' | 'neutral' }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${tone === 'pos' ? 'text-emerald-600' : tone === 'neg' ? 'text-red-600' : ''}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label={tr('Estimé (soumission)', 'Estimated (quote)')} value={money(est)} />
        <Card label={tr('Réel (feuille de temps)', 'Actual (timesheet)')} value={money(real)} />
        <Card label={tr('Écart réel vs estimé', 'Actual vs estimated')} value={`${ecart >= 0 ? '+' : ''}${money(ecart)}`} sub={`${ecartPct >= 0 ? '+' : ''}${ecartPct.toFixed(1)} %`} tone={ecart > 0 ? 'neg' : 'pos'} />
        <Card label={tr('Montant facturé (BC)', 'Invoiced (PO)')} value={money(facture)} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 font-bold">{tr('Marge du projet', 'Project margin')}</h3>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <div className={`text-3xl font-bold ${marge >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{money(marge)}</div>
            <div className="text-xs text-gray-400">{tr('Facturé − Réel', 'Invoiced − Actual')}{facture > 0 ? ` · ${margePct.toFixed(1)} %` : ''}</div>
          </div>
          {facture === 0 && <div className="text-sm text-amber-600">{tr('Saisis le montant BC dans l’onglet Projet pour la marge.', 'Enter the PO amount in the Project tab for margin.')}</div>}
        </div>
      </div>

      {(est === 0 && real === 0) && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
          {tr('Remplis la Soumission (estimé) et la Feuille de temps (réel) pour voir les coûts.', 'Fill the Quote (estimated) and Timesheet (actual) to see costs.')}
        </div>
      )}
    </div>
  );
}
