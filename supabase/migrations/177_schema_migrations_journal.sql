-- 177 — Journal des migrations (projet C-Secur360 uniquement). Permet de SAVOIR depuis la base quelles
-- migrations sont appliquées (fini les devinettes/mémoire). CONVENTION : chaque NOUVELLE migration finit
-- désormais par s'auto-enregistrer ici (voir CLAUDE.md). Idempotent.

create table if not exists schema_migrations (
  version    text primary key,
  applied_at timestamptz not null default now()
);

-- Backfill : toutes les migrations 001→176 sont appliquées (confirmé 2026-06-14). Les numéros « trous »
-- (sans fichier) sont marqués aussi : sans effet (rien à appliquer pour eux).
insert into schema_migrations (version)
  select lpad(g::text, 3, '0') from generate_series(1, 176) g
on conflict (version) do nothing;

-- Cette migration 177 elle-même :
insert into schema_migrations (version) values ('177') on conflict (version) do nothing;

NOTIFY pgrst, 'reload schema';
