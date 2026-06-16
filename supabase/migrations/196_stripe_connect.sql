-- 196 : Stripe Connect par tenant — chaque tenant connecte SON compte pour encaisser ses clients.
-- On ne stocke que l'identifiant du compte connecté (jamais de clé secrète). Idempotent.
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS stripe_account_id      TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false;

-- Référence du paiement Stripe sur la facture encaissée (pour rapprochement / audit).
ALTER TABLE commerce_invoices ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT;

insert into schema_migrations (version) values ('196') on conflict (version) do nothing;
