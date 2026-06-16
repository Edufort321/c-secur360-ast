-- 202 — RELANCES AUTOMATIQUES (dunning) des factures en retard. Suivi par facture + réglages par
-- tenant. Le cron /api/cron/dunning évalue les factures « envoyées » échues et relance (in-app +
-- courriel) selon des paliers de jours. Idempotent.
ALTER TABLE commerce_invoices ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMPTZ;
ALTER TABLE commerce_invoices ADD COLUMN IF NOT EXISTS reminder_count   INTEGER NOT NULL DEFAULT 0;

-- Réglages dunning par tenant (sur company_settings). dunning_days = paliers de relance (jours de retard).
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS dunning_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS dunning_days    JSONB   NOT NULL DEFAULT '[1,7,15,30]'::jsonb;

insert into schema_migrations (version) values ('202') on conflict (version) do nothing;
