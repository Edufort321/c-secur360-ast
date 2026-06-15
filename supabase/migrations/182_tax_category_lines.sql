-- 182: Catégorie de taxe par LIGNE (facture + transaction) — codes fiscaux corrects.
-- 'standard' = TPS+TVQ ; 'zero_rated' = détaxé 0% (fourniture taxable à 0%, CTI possible sur intrants) ;
-- 'exempt' = exonéré (pas de taxe, pas de CTI). Le booléen `taxable` reste synchronisé (taxé = standard).
-- Idempotent. (La taxe se calcule déjà correctement via `taxable` même sans ces colonnes.)

ALTER TABLE commerce_invoice_items     ADD COLUMN IF NOT EXISTS tax_category TEXT DEFAULT 'standard';
ALTER TABLE commerce_transaction_items ADD COLUMN IF NOT EXISTS tax_category TEXT DEFAULT 'standard';

insert into schema_migrations (version) values ('182') on conflict (version) do nothing;
