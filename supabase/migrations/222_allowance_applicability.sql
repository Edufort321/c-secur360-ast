-- 222 — Avantages/primes : applicabilité + lien catalogue (prix vendant) + prix employé. Une subsistance a
-- DEUX prix : prix VENDANT (catalogue, facturé au client) et prix PAYÉ à l'employé (= amount). L'avantage
-- ne s'affiche en case à cocher dans la feuille de temps que s'il est APPLICABLE (employés + tâches
-- récurrentes/projets ; vide = tous/toutes). Idempotent + auto-enregistré.
alter table timesheet_allowances add column if not exists sell_amount numeric;                              -- prix vendant (catalogue), info
alter table timesheet_allowances add column if not exists source text not null default 'manual';            -- 'manual' | 'catalogue'
alter table timesheet_allowances add column if not exists catalogue_key text;                               -- clé de la condition du catalogue liée
alter table timesheet_allowances add column if not exists personnel_ids jsonb not null default '[]'::jsonb;  -- [] = tous les employés
alter table timesheet_allowances add column if not exists recurring_task_ids jsonb not null default '[]'::jsonb; -- [] = toutes les tâches/projets

insert into schema_migrations (version) values ('222') on conflict (version) do nothing;
