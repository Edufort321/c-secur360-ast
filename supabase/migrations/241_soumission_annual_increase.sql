-- 241 — Soumission rattachée à un projet : augmentation annuelle EN % (indexation pluriannuelle).
-- annual_increase_pct : ex. 3.5 = +3,5 %/an appliqué au montant année après année. Null = aucune indexation.
-- Idempotent + auto-enregistré.

alter table public.soumissions add column if not exists annual_increase_pct numeric(6,3);

insert into schema_migrations (version) values ('241') on conflict (version) do nothing;
