-- 238 — Primes au SEUIL D'HEURES/JOUR (timesheet_hour_bonuses) : CIBLAGE par CODE et par EMPLOYÉ.
-- La prime « ≥ N h/jour = X $ » peut maintenant s'appliquer SEULEMENT à des tâches récurrentes (codes)
-- précises (recurring_task_ids ; vide = tous les codes) et/ou à des employés précis (personnel_ids ; vide
-- = tous). Le seuil compte alors uniquement les heures du JOUR pour ces codes. Idempotent + auto-enregistré.
-- (is_taxable existe déjà : la prime peut être versée comme avantage imposable.)

alter table timesheet_hour_bonuses add column if not exists recurring_task_ids jsonb not null default '[]'::jsonb;
alter table timesheet_hour_bonuses add column if not exists personnel_ids jsonb not null default '[]'::jsonb;

insert into schema_migrations (version) values ('238') on conflict (version) do nothing;
