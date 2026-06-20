-- 257 — HSE : travail restreint / mutation (DART rate).
-- DART (Days Away/Restricted/Transferred, OSHA 300) = arrêt de travail OU travail restreint/mutation.
-- On ajoute le drapeau `is_restricted` pour distinguer DART de LTIFR (arrêt seul).
-- Idempotent. À coller dans l'éditeur SQL Supabase du BON projet (nzjjgcccxlqhbtpitmpo), puis Run.

alter table if exists public.hse_incident
  add column if not exists is_restricted boolean not null default false;

comment on column public.hse_incident.is_restricted is
  'Travail restreint ou mutation suite à la lésion (compte dans le DART rate, pas seulement LTIFR).';

insert into schema_migrations (version) values ('257') on conflict (version) do nothing;
