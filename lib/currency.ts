// Multi-devise (#43) — socle. Devise de BASE du tenant (compta/GL/rapports) + devises ÉTRANGÈRES avec
// taux de change manuels. Un document (facture, transaction…) porte sa devise + le taux vers la base au
// moment de l'opération ; l'équivalent en devise de base (montant × taux) sert à la comptabilité.
import { supabase } from '@/lib/supabase';

export type CurrencyCode = string;
export const CURRENCIES: { code: CurrencyCode; symbol: string; fr: string; en: string }[] = [
  { code: 'CAD', symbol: '$',   fr: 'Dollar canadien',   en: 'Canadian dollar' },
  { code: 'USD', symbol: 'US$', fr: 'Dollar américain',  en: 'US dollar' },
  { code: 'EUR', symbol: '€',   fr: 'Euro',               en: 'Euro' },
  { code: 'GBP', symbol: '£',   fr: 'Livre sterling',     en: 'Pound sterling' },
  { code: 'MXN', symbol: 'MX$', fr: 'Peso mexicain',      en: 'Mexican peso' },
  { code: 'CHF', symbol: 'CHF', fr: 'Franc suisse',       en: 'Swiss franc' },
  { code: 'AUD', symbol: 'A$',  fr: 'Dollar australien',  en: 'Australian dollar' },
  { code: 'JPY', symbol: '¥',   fr: 'Yen japonais',       en: 'Japanese yen' },
];
export const currencyMeta = (code?: string) => CURRENCIES.find(c => c.code === (code || 'CAD').toUpperCase()) || CURRENCIES[0];

export type CurrencyConfig = {
  base: CurrencyCode;                       // devise de base (compta)
  enabled: CurrencyCode[];                  // devises proposées dans les formulaires
  rates: Record<string, number>;            // taux MANUELS : 1 unité de <code> = rates[code] unités de base
  updated_at?: string | null;
};

export const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = { base: 'CAD', enabled: ['CAD'], rates: { CAD: 1 } };

/** Lit la config devise du tenant (company_settings.currency_config JSONB). Repli = CAD seul. */
export async function getCurrencyConfig(tenant: string): Promise<CurrencyConfig> {
  try {
    const { data } = await supabase.from('company_settings').select('currency_config').eq('tenant_id', tenant).maybeSingle();
    const v = (data as any)?.currency_config;
    if (v && typeof v === 'object' && v.base) {
      return { base: v.base, enabled: Array.isArray(v.enabled) && v.enabled.length ? v.enabled : [v.base], rates: { ...(v.rates || {}), [v.base]: 1 } };
    }
  } catch { /* migration 221 ? */ }
  return DEFAULT_CURRENCY_CONFIG;
}

export async function saveCurrencyConfig(tenant: string, cfg: CurrencyConfig): Promise<{ error?: any }> {
  const clean: CurrencyConfig = { base: cfg.base, enabled: [...new Set([cfg.base, ...cfg.enabled])], rates: { ...cfg.rates, [cfg.base]: 1 } };
  const { error } = await supabase.from('company_settings').upsert({ tenant_id: tenant, currency_config: clean, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
  return { error };
}

/** Taux de <code> vers la base (1 unité <code> = N base). 1 si base ou inconnu. */
export function rateToBase(cfg: CurrencyConfig, code?: string): number {
  const c = (code || cfg.base).toUpperCase();
  if (c === cfg.base) return 1;
  const r = Number(cfg.rates?.[c]); return r > 0 ? r : 1;
}

/** Convertit un montant d'une devise vers la base. */
export function toBase(cfg: CurrencyConfig, amount: number, code?: string): number {
  return Math.round((Number(amount) || 0) * rateToBase(cfg, code) * 100) / 100;
}

/** Formate un montant avec le symbole de la devise (fr-CA). */
export function formatMoney(amount: number, code?: string): string {
  const m = currencyMeta(code);
  const n = (Number(amount) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // Symboles « collés » devant pour les dollars/€, derrière pour CHF.
  return m.code === 'CHF' ? `${n} ${m.symbol}` : `${m.symbol}${n}`;
}
