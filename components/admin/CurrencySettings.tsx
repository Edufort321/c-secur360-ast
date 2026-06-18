'use client';
// Réglage MULTI-DEVISE (#43) — Admin › Système. Devise de base (compta) + devises activées + taux de
// change MANUELS vers la base. Persisté dans company_settings.currency_config (migration 221).
import { useEffect, useState } from 'react';
import { Loader2, Save, Coins } from 'lucide-react';
import { CURRENCIES, getCurrencyConfig, saveCurrencyConfig, type CurrencyConfig } from '@/lib/currency';

type Tr = (f: string, e: string) => string;

export function CurrencySettings({ tenant, tr, canEdit }: { tenant: string; tr: Tr; canEdit: boolean }) {
  const [cfg, setCfg] = useState<CurrencyConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => { getCurrencyConfig(tenant).then(setCfg, () => setCfg({ base: 'CAD', enabled: ['CAD'], rates: { CAD: 1 } })); }, [tenant]);
  if (!cfg) return <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>;

  const toggle = (code: string) => setCfg(c => { if (!c) return c; const has = c.enabled.includes(code); const enabled = has ? c.enabled.filter(x => x !== code) : [...c.enabled, code]; return { ...c, enabled: [...new Set([c.base, ...enabled])] }; });
  const setRate = (code: string, v: string) => setCfg(c => c ? ({ ...c, rates: { ...c.rates, [code]: Number(v) || 0 } }) : c);

  async function save() {
    if (!cfg) return; setSaving(true); setNotice(null);
    const { error } = await saveCurrencyConfig(tenant, cfg);
    setNotice(error ? ('Erreur (migration 221 ?) : ' + (error.message || 'DB')) : tr('Devises enregistrées ✓', 'Currencies saved ✓'));
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        {tr('La devise de BASE sert à la comptabilité (GL, rapports). Activez d’autres devises pour facturer/saisir en devise étrangère ; l’équivalent en devise de base est calculé avec le taux manuel saisi ici.', 'The BASE currency is used for accounting (GL, reports). Enable other currencies to invoice/enter in foreign currency; the base-currency equivalent uses the manual rate set here.')}
      </div>
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">{notice}</div>}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100"><Coins size={16} className="text-amber-600" /> {tr('Devise de base', 'Base currency')}
          <select value={cfg.base} disabled={!canEdit} onChange={e => setCfg(c => c ? ({ ...c, base: e.target.value }) : c)} className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900">
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.fr} ({c.symbol})</option>)}
          </select>
        </label>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-100">{tr('Devises activées et taux', 'Enabled currencies & rates')}</h3>
        <div className="space-y-2">
          {CURRENCIES.map(c => {
            const on = cfg.enabled.includes(c.code) || c.code === cfg.base;
            const isBase = c.code === cfg.base;
            return (
              <div key={c.code} className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-700">
                <label className="inline-flex min-w-[12rem] items-center gap-2 text-sm">
                  <input type="checkbox" checked={on} disabled={!canEdit || isBase} onChange={() => toggle(c.code)} className="accent-blue-600" />
                  <span className="font-semibold">{c.code}</span> <span className="text-gray-500">{c.fr} ({c.symbol})</span>
                </label>
                {on && (
                  isBase
                    ? <span className="text-xs font-semibold text-gray-400">{tr('devise de base (taux 1)', 'base currency (rate 1)')}</span>
                    : <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                        1 {c.code} =
                        <input type="number" step="0.0001" value={cfg.rates?.[c.code] ?? ''} disabled={!canEdit} onChange={e => setRate(c.code, e.target.value)} className="w-28 rounded-lg border border-gray-300 bg-white px-2 py-1 text-right text-sm dark:border-gray-600 dark:bg-gray-900" />
                        {cfg.base}
                      </label>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {canEdit && <div className="flex justify-end"><button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button></div>}
    </div>
  );
}
