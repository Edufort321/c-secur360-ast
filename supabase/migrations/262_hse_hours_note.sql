-- 262 — HSE : note sur les heures manuelles (ex. « Temps effectué par un sous-traitant »).
-- Permet de qualifier une ligne d'heures saisie à la main (les heures AUTO viennent des feuilles de temps).
-- Idempotent. À coller dans l'éditeur SQL Supabase du BON projet (nzjjgcccxlqhbtpitmpo), puis Run.

alter table if exists public.hse_hours_worked
  add column if not exists note text;

insert into schema_migrations (version) values ('262') on conflict (version) do nothing;
