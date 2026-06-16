-- 187: « À VÉRIFIER » — une transaction pré-remplie par l'IA (import par lot) reste EN ATTENTE de
-- vérification humaine et n'est PAS comptabilisée tant qu'un humain ne l'a pas confirmée. Drapeau
-- needs_review : true = à vérifier (non postée par la synchro), false = vérifiée. Idempotent.

ALTER TABLE commerce_transactions ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS commerce_transactions_needs_review_idx ON commerce_transactions(tenant_id, needs_review);

insert into schema_migrations (version) values ('187') on conflict (version) do nothing;
