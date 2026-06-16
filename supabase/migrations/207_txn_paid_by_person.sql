-- 207 — Dépense engagée par une PERSONNE + nature du règlement. Permet : « dépense faite par un
-- employé » (choisi dans le personnel) marquée comme REMBOURSEMENT (CR 2300 à rembourser) ou
-- INVESTISSEMENT/apport (CR 3100 capital). Idempotent.
ALTER TABLE commerce_transactions ADD COLUMN IF NOT EXISTS paid_by_person_id UUID;
ALTER TABLE commerce_transactions ADD COLUMN IF NOT EXISTS settlement_kind   TEXT NOT NULL DEFAULT 'standard'; -- standard | reimbursement | investment

insert into schema_migrations (version) values ('207') on conflict (version) do nothing;
