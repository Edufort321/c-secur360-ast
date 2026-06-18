'use client';

import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ProjectChainPanel from '@/components/maintenance/ProjectChainPanel';

const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

export function CoutsTab({ estimate, actuals, poAmount, tenant, projectId }: { estimate: any; actuals: any; poAmount?: number | null; tenant?: string; projectId?: string }) {
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const [showChain, setShowChain] = useState(false);

  const est = Number(estimate?.total || 0);
  const laborBase = Number(actuals?.labor || 0);
  const burden = Number(actuals?.laborBurden || 0);
  const burdenPct = Number(actuals?.laborBurdenPct ?? 0.35);
  // Coût RÉEL = main-d'œuvre CHARGÉE (fardeau) + autres coûts. Repli sur total si costReal absent (ancienne donnée).
  const real = Number(actuals?.costReal ?? actuals?.total ?? 0);
  const facture = Number(poAmount || 0);
  const ecart = real - est;
  const ecartPct = est > 0 ? (ecart / est) * 100 : 0;
  const marge = facture - real;
  const margePct = facture > 0 ? (marge / facture) * 100 : 0;
  const pctAvancement = facture > 0 ? Math.min(100, (real / facture) * 100) : 0; // avancement par les coûts

  const Card = ({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'pos' | 'neg' | 'neutral' }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${tone === 'pos' ? 'text-emerald-600' : tone === 'neg' ? 'text-red-600' : ''}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      {tenant && projectId && (
        <div className="flex justify-end">
          <button onClick={() => setShowChain(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 px-3 py-1.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 dark:border-orange-500/40 dark:text-orange-300">
            <Link2 size={15} /> {tr('Soumission ↔ temps réel ↔ facturation', 'Quote ↔ actual time ↔ billing')}
          </button>
        </div>
      )}
      {showChain && tenant && projectId && <ProjectChainPanel tenant={tenant} projectId={projectId} tr={tr} onClose={() => setShowChain(false)} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label={tr('Estimé (soumission)', 'Estimated (quote)')} value={money(est)} />
        <Card label={tr('Coût réel CHARGÉ', 'Real cost (burdened)')} value={money(real)} sub={burden > 0 ? `${tr('dont fardeau MO', 'incl. labor burden')} ${money(burden)} (${(burdenPct * 100).toFixed(0)} %)` : undefined} />
        <Card label={tr('Écart réel vs estimé', 'Actual vs estimated')} value={`${ecart >= 0 ? '+' : ''}${money(ecart)}`} sub={`${ecartPct >= 0 ? '+' : ''}${ecartPct.toFixed(1)} %`} tone={ecart > 0 ? 'neg' : 'pos'} />
        <Card label={tr('Montant facturé (BC)', 'Invoiced (PO)')} value={money(facture)} />
      </div>

      {/* Décomposition du coût réel (job costing chargé) */}
      {real > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 font-bold">{tr('Décomposition du coût réel', 'Real cost breakdown')}</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
            <div className="flex justify-between"><span className="text-gray-500">{tr('Main-d’œuvre (base)', 'Labor (base)')}</span><b>{money(laborBase)}</b></div>
            <div className="flex justify-between"><span className="text-amber-600">{tr('+ Fardeau MO', '+ Labor burden')} ({(burdenPct * 100).toFixed(0)} %)</span><b className="text-amber-600">{money(burden)}</b></div>
            <div className="flex justify-between"><span className="text-gray-500">{tr('Kilométrage', 'Mileage')}</span><b>{money(Number(actuals?.km || 0))}</b></div>
            <div className="flex justify-between"><span className="text-gray-500">{tr('Matériel', 'Materials')}</span><b>{money(Number(actuals?.materiel || 0))}</b></div>
            <div className="flex justify-between"><span className="text-gray-500">{tr('Primes/avantages', 'Allowances')}</span><b>{money(Number(actuals?.allowances || 0))}</b></div>
            <div className="flex justify-between"><span className="text-gray-500">{tr('Dépenses', 'Expenses')}</span><b>{money(Number(actuals?.expensesTotal || 0))}</b></div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 font-bold">{tr('Marge du projet (coût chargé)', 'Project margin (burdened cost)')}</h3>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <div className={`text-3xl font-bold ${marge >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{money(marge)}</div>
            <div className="text-xs text-gray-400">{tr('Facturé − Coût réel chargé', 'Invoiced − Real burdened cost')}{facture > 0 ? ` · ${margePct.toFixed(1)} %` : ''}</div>
          </div>
          {facture > 0 && (
            <div className="min-w-[180px] flex-1">
              <div className="mb-1 flex justify-between text-xs text-gray-500"><span>{tr('Avancement (coûts engagés)', 'Progress (cost-to-date)')}</span><b>{pctAvancement.toFixed(0)} %</b></div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700"><div className={`h-full ${pctAvancement >= 100 ? 'bg-red-500' : pctAvancement >= 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pctAvancement}%` }} /></div>
              <div className="mt-1 text-[11px] text-gray-400">{tr('Coût réel ÷ montant facturé. ≥100 % = dépassement.', 'Real cost ÷ invoiced. ≥100% = overrun.')}</div>
            </div>
          )}
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
