'use client';
// Assistant d'onboarding d'un tenant (#39) : checklist de configuration + « Configuration automatique »
// (seed du plan comptable, compte de trésorerie par défaut, fiche société). Chaque étape pointe vers son onglet.
import { useEffect, useState } from 'react';
import { Loader2, Check, ChevronRight, Wand2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCompanySettings, saveCompanySettings } from '@/lib/invoicing';
import { seedAccountingDefaults } from '@/lib/accounting';
import { getTreasuryAccounts, createTreasuryAccount } from '@/lib/treasuryAccounts';

type Tr = (f: string, e: string) => string;
type Checks = { company: boolean; accounting: boolean; sites: boolean; staff: boolean; treasury: boolean; catalogue: boolean };

export function OnboardingWizard({ tenant, tr, canEdit, goTab }: { tenant: string; tr: Tr; canEdit: boolean; goTab: (k: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [c, setC] = useState<Checks>({ company: false, accounting: false, sites: false, staff: false, treasury: false, catalogue: false });

  async function load() {
    setLoading(true);
    const count = async (table: string) => { try { const { count } = await supabase.from(table).select('id', { count: 'exact', head: true }).eq('tenant_id', tenant); return (count || 0) > 0; } catch { return false; } };
    try {
      const [cs, acc, sites, staff, treas, cat] = await Promise.all([
        getCompanySettings(tenant).then(s => !!s?.legal_name).catch(() => false),
        count('gl_accounts'), count('planner_succursales'), count('planner_personnel'),
        getTreasuryAccounts(tenant).then(t => t.length > 0).catch(() => false),
        count('catalogue_taux'),
      ]);
      setC({ company: cs, accounting: acc, sites, staff, treasury: treas, catalogue: cat });
    } catch { /* noop */ }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  // Configure automatiquement ce qui peut l'être sans saisie : plan comptable, compte de trésorerie, fiche société.
  async function autoConfig() {
    setBusy(true); setNotice(null);
    try {
      if (!c.accounting) await seedAccountingDefaults(tenant);
      if (!c.treasury) await createTreasuryAccount(tenant, { name: tr('Compte courant', 'Operating account'), kind: 'bank' });
      if (!c.company) { const s = await getCompanySettings(tenant).catch(() => null); await saveCompanySettings(tenant, { ...(s || {}), province: (s as any)?.province || 'QC' }); }
      setNotice(tr('Configuration automatique appliquée. Complétez les étapes restantes.', 'Auto-configuration applied. Complete the remaining steps.'));
      await load();
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
    setBusy(false);
  }

  if (loading) return <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>;

  const STEPS: { key: keyof Checks; tab: string; fr: string; en: string; auto?: boolean }[] = [
    { key: 'company', tab: 'factures', fr: 'Fiche société (raison sociale, n° de taxes)', en: 'Company profile (legal name, tax #s)', auto: true },
    { key: 'accounting', tab: 'comptabilite', fr: 'Initialiser le plan comptable', en: 'Initialize the chart of accounts', auto: true },
    { key: 'treasury', tab: 'transactions', fr: 'Créer un compte (banque / carte)', en: 'Create an account (bank / card)', auto: true },
    { key: 'sites', tab: 'sitesdepts', fr: 'Ajouter au moins un site', en: 'Add at least one site' },
    { key: 'staff', tab: 'employes', fr: 'Ajouter au moins un employé', en: 'Add at least one employee' },
    { key: 'catalogue', tab: 'soumissions', fr: 'Créer un catalogue de taux', en: 'Create a rate catalogue' },
  ];
  const done = STEPS.filter(s => c[s.key]).length;
  const pct = Math.round((done / STEPS.length) * 100);
  const autoLeft = STEPS.some(s => s.auto && !c[s.key]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">🚀 {tr('Démarrage de votre espace', 'Set up your workspace')}</h2>
            <p className="text-sm text-gray-500">{done === STEPS.length ? tr('Tout est configuré — bravo !', 'All set — well done!') : tr(`${done}/${STEPS.length} étapes complétées`, `${done}/${STEPS.length} steps completed`)}</p>
          </div>
          {canEdit && autoLeft && <button onClick={autoConfig} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40">{busy ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />} {tr('Configuration automatique', 'Auto-configure')}</button>}
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} /></div>
        {notice && <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">{notice}</div>}

        <div className="mt-4 space-y-2">
          {STEPS.map(s => (
            <div key={s.key} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${c[s.key] ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${c[s.key] ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400 dark:bg-gray-600'}`}>{c[s.key] ? <Check size={14} /> : ''}</span>
              <span className={`flex-1 text-sm ${c[s.key] ? 'text-gray-500 line-through' : 'font-medium text-gray-800 dark:text-gray-100'}`}>{tr(s.fr, s.en)}{s.auto && !c[s.key] ? <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">{tr('auto possible', 'auto')}</span> : null}</span>
              {!c[s.key] && <button onClick={() => goTab(s.tab)} className="inline-flex items-center gap-0.5 text-sm font-semibold text-blue-600 hover:underline">{tr('Configurer', 'Set up')} <ChevronRight size={14} /></button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
