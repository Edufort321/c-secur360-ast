-- 267 — « Admin de base » par tenant.
-- Quand admin_base = true, l'admin du tenant (rôle client_admin) ne voit QUE les fonctions de base de
-- l'admin : Organisation & RH → Sites, Personnel, Postes, Comptes d'accès. Le super_admin (plateforme)
-- garde l'admin complet. Défaut false = aucun changement pour les tenants existants. Idempotent.

alter table if exists tenants add column if not exists admin_base boolean not null default false;

insert into schema_migrations (version) values ('267') on conflict (version) do nothing;
