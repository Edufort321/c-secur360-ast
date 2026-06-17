// Classes fiscales GUIDÉES (style Commerce CERDIA) : on choisit une CATÉGORIE lisible et le bon compte
// du grand livre + la catégorie de taxe sont déduits. Chaque catégorie a un COMPTE GL dédié (provisionné
// dans le plan comptable si absent) -> le grand livre garde la granularité (pas tout dans « divers »).
import { supabase } from '@/lib/supabase';
import type { TaxCategory } from '@/lib/invoicing';

// 'expense' = OPEX (charge 5xxx) ; 'capex' = immobilisation (actif 1xxx, paraît au bilan) ; 'revenue' = produit 4xxx.
export type FiscalKind = 'expense' | 'capex' | 'revenue';
export type FiscalCategory = {
  key: string; group: string; fr: string; en: string;
  glCode: string; glName: string; kind: FiscalKind; tax: TaxCategory;
};

// kind 'expense' -> compte de CHARGE (5xxx, solde débiteur) ; 'revenue' -> PRODUIT (4xxx, créditeur).
export const FISCAL_CATEGORIES: FiscalCategory[] = [
  // — Dépenses véhicule / déplacements —
  { key: 'carburant',     group: 'Véhicule & déplacements', fr: 'Carburant / essence',        en: 'Fuel',                 glCode: '5210', glName: 'Carburant',                kind: 'expense', tax: 'standard' },
  { key: 'vehicule',      group: 'Véhicule & déplacements', fr: 'Entretien véhicule',         en: 'Vehicle maintenance',  glCode: '5200', glName: 'Frais de véhicules',       kind: 'expense', tax: 'standard' },
  { key: 'hebergement',   group: 'Véhicule & déplacements', fr: 'Hébergement / voyage',       en: 'Lodging / travel',     glCode: '5225', glName: 'Hébergement et voyage',    kind: 'expense', tax: 'standard' },
  { key: 'repas',         group: 'Véhicule & déplacements', fr: 'Repas & représentation',     en: 'Meals & entertainment', glCode: '5220', glName: 'Repas et représentation', kind: 'expense', tax: 'standard' },
  // — Chantier / opérations —
  { key: 'materiaux',     group: 'Chantier & opérations',   fr: 'Matériaux',                  en: 'Materials',            glCode: '5260', glName: 'Matériaux',               kind: 'expense', tax: 'standard' },
  { key: 'outillage',     group: 'Chantier & opérations',   fr: 'Outillage & équipement',     en: 'Tools & equipment',    glCode: '5240', glName: 'Outillage et équipement',  kind: 'expense', tax: 'standard' },
  { key: 'sous_traitance', group: 'Chantier & opérations',  fr: 'Sous-traitance',             en: 'Subcontracting',       glCode: '5250', glName: 'Sous-traitance',          kind: 'expense', tax: 'standard' },
  { key: 'location_eq',   group: 'Chantier & opérations',   fr: 'Location d’équipement',      en: 'Equipment rental',     glCode: '5245', glName: 'Location d’équipement',    kind: 'expense', tax: 'standard' },
  { key: 'epi',           group: 'Chantier & opérations',   fr: 'ÉPI / sécurité',             en: 'PPE / safety',         glCode: '5265', glName: 'ÉPI et sécurité',         kind: 'expense', tax: 'standard' },
  // — Administration —
  { key: 'fournitures',   group: 'Administration',          fr: 'Fournitures de bureau',      en: 'Office supplies',      glCode: '5230', glName: 'Fournitures de bureau',   kind: 'expense', tax: 'standard' },
  { key: 'telecom',       group: 'Administration',          fr: 'Télécommunications',         en: 'Telecom',              glCode: '5270', glName: 'Télécommunications',      kind: 'expense', tax: 'standard' },
  { key: 'loyer',         group: 'Administration',          fr: 'Loyer / local',              en: 'Rent / premises',      glCode: '5295', glName: 'Loyer et local',          kind: 'expense', tax: 'standard' },
  { key: 'honoraires',    group: 'Administration',          fr: 'Honoraires (compta/juri.)',  en: 'Professional fees',    glCode: '5290', glName: 'Honoraires professionnels', kind: 'expense', tax: 'standard' },
  { key: 'formation',     group: 'Administration',          fr: 'Formation',                  en: 'Training',             glCode: '5310', glName: 'Formation',               kind: 'expense', tax: 'standard' },
  { key: 'frais_bancaires', group: 'Administration',        fr: 'Frais bancaires',            en: 'Bank fees',            glCode: '5320', glName: 'Frais bancaires',         kind: 'expense', tax: 'exempt' },
  { key: 'assurances',    group: 'Administration',          fr: 'Assurances',                 en: 'Insurance',            glCode: '5280', glName: 'Assurances',              kind: 'expense', tax: 'exempt' },
  { key: 'divers',        group: 'Administration',          fr: 'Charges diverses',           en: 'Misc. expenses',       glCode: '5300', glName: 'Charges diverses',        kind: 'expense', tax: 'standard' },
  { key: 'salaires_op',   group: 'Personnel',               fr: 'Salaires & avantages',       en: 'Wages & benefits',     glCode: '5000', glName: 'Salaires et avantages',   kind: 'expense', tax: 'exempt' },
  { key: 'charges_soc',   group: 'Personnel',               fr: 'Charges sociales (RRQ/AE…)', en: 'Payroll taxes',        glCode: '5100', glName: 'Charges sociales employeur', kind: 'expense', tax: 'exempt' },
  { key: 'pub_marketing', group: 'Administration',          fr: 'Publicité & marketing',      en: 'Advertising & marketing', glCode: '5330', glName: 'Publicité et marketing', kind: 'expense', tax: 'standard' },
  { key: 'logiciels_op',  group: 'Administration',          fr: 'Logiciels & abonnements',    en: 'Software & SaaS',      glCode: '5340', glName: 'Logiciels et abonnements', kind: 'expense', tax: 'standard' },
  { key: 'amortissement', group: 'Hors exploitation',       fr: 'Amortissement',              en: 'Depreciation',         glCode: '5600', glName: 'Amortissement',           kind: 'expense', tax: 'exempt' },
  { key: 'interets_exp',  group: 'Hors exploitation',       fr: 'Intérêts & frais financiers', en: 'Interest & finance',  glCode: '5700', glName: 'Intérêts et frais financiers', kind: 'expense', tax: 'exempt' },
  { key: 'impots_exp',    group: 'Hors exploitation',       fr: 'Impôts sur le résultat',     en: 'Income taxes',         glCode: '5800', glName: 'Impôts sur le résultat',  kind: 'expense', tax: 'exempt' },
  // — CAPEX (immobilisations → ACTIF, paraissent au bilan) —
  { key: 'capex_info',    group: 'CAPEX · Immobilisations', fr: 'Informatique / ordinateur',  en: 'IT / computer',        glCode: '1520', glName: 'Immobilisations — Informatique', kind: 'capex', tax: 'standard' },
  { key: 'capex_mobilier', group: 'CAPEX · Immobilisations', fr: 'Mobilier de bureau',        en: 'Office furniture',     glCode: '1510', glName: 'Immobilisations — Mobilier', kind: 'capex', tax: 'standard' },
  { key: 'capex_equip',   group: 'CAPEX · Immobilisations', fr: 'Équipement / machinerie',    en: 'Equipment / machinery', glCode: '1500', glName: 'Immobilisations (équipement)', kind: 'capex', tax: 'standard' },
  { key: 'capex_vehicule', group: 'CAPEX · Immobilisations', fr: 'Véhicule',                  en: 'Vehicle',              glCode: '1530', glName: 'Immobilisations — Véhicules', kind: 'capex', tax: 'standard' },
  { key: 'capex_amelio',  group: 'CAPEX · Immobilisations', fr: 'Améliorations locatives',    en: 'Leasehold improvements', glCode: '1540', glName: 'Améliorations locatives',  kind: 'capex', tax: 'standard' },
  // — Revenus (produits) —
  { key: 'ventes',        group: 'Revenus',                 fr: 'Ventes & services',          en: 'Sales & services',     glCode: '4000', glName: 'Ventes et services',      kind: 'revenue', tax: 'standard' },
  { key: 'honoraires_rev', group: 'Revenus',                fr: 'Honoraires / consultation',  en: 'Fees / consulting',    glCode: '4020', glName: 'Honoraires et consultation', kind: 'revenue', tax: 'standard' },
  { key: 'commissions_rev', group: 'Revenus',               fr: 'Commissions reçues',         en: 'Commissions earned',   glCode: '4070', glName: 'Commissions reçues',      kind: 'revenue', tax: 'standard' },
  { key: 'location_rev',  group: 'Revenus',                 fr: 'Location / équipement',      en: 'Rental income',        glCode: '4010', glName: 'Revenus de location',     kind: 'revenue', tax: 'standard' },
  { key: 'abonnements_rev', group: 'Revenus',               fr: 'Abonnements / récurrent',    en: 'Subscriptions',        glCode: '4015', glName: 'Revenus d’abonnement',    kind: 'revenue', tax: 'standard' },
  // — Revenus NON taxables / hors exploitation —
  { key: 'interets_rev',  group: 'Revenus financiers',      fr: 'Intérêts / placements',      en: 'Interest / investment', glCode: '4030', glName: 'Intérêts et revenus de placement', kind: 'revenue', tax: 'exempt' },
  { key: 'dividendes_rev', group: 'Revenus financiers',     fr: 'Dividendes reçus',           en: 'Dividends received',   glCode: '4035', glName: 'Dividendes reçus',        kind: 'revenue', tax: 'exempt' },
  { key: 'subventions_rev', group: 'Revenus financiers',    fr: 'Subventions / aides',        en: 'Grants / subsidies',   glCode: '4040', glName: 'Subventions et aides',    kind: 'revenue', tax: 'exempt' },
  { key: 'gain_actif_rev', group: 'Revenus financiers',     fr: 'Gain sur vente d’actif',     en: 'Gain on asset sale',   glCode: '4060', glName: 'Gain sur disposition d’actif', kind: 'revenue', tax: 'exempt' },
  { key: 'remboursement_rev', group: 'Revenus financiers',  fr: 'Remboursement / crédit reçu', en: 'Refund / credit',     glCode: '4050', glName: 'Remboursements reçus',    kind: 'revenue', tax: 'exempt' },
  { key: 'autres_rev',    group: 'Revenus financiers',      fr: 'Autres produits',            en: 'Other income',         glCode: '4100', glName: 'Produits — Autres',       kind: 'revenue', tax: 'exempt' },
];

export const fiscalByCode = (code: string) => FISCAL_CATEGORIES.find(c => c.glCode === code);

/** Provisionne (idempotent) les comptes GL des catégories fiscales absents du plan comptable du tenant. */
export async function ensureFiscalAccounts(tenant: string): Promise<void> {
  try {
    const { data } = await supabase.from('gl_accounts').select('code').eq('tenant_id', tenant);
    if (!data) return; // plan comptable indisponible (migration 085) -> rien
    const have = new Set(data.map((a: any) => String(a.code)));
    const seen = new Set<string>();
    const glType = (k: FiscalKind) => (k === 'revenue' ? 'revenue' : k === 'capex' ? 'asset' : 'expense');
    const rows = FISCAL_CATEGORIES
      .filter(c => !have.has(c.glCode) && !seen.has(c.glCode) && (seen.add(c.glCode), true))
      .map(c => ({ tenant_id: tenant, code: c.glCode, name: c.glName, type: glType(c.kind), normal_balance: c.kind === 'revenue' ? 'credit' : 'debit', is_active: true, is_system: false }));
    if (rows.length) await supabase.from('gl_accounts').insert(rows);
  } catch { /* best-effort */ }
}
