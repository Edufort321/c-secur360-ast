-- 203 — ESCOMPTE global sur la soumission ($ ou %). Appliqué après majoration/cible. Idempotent.
ALTER TABLE soumissions ADD COLUMN IF NOT EXISTS discount_type  TEXT;            -- 'amount' | 'percent'
ALTER TABLE soumissions ADD COLUMN IF NOT EXISTS discount_value NUMERIC(14,2);

insert into schema_migrations (version) values ('203') on conflict (version) do nothing;
