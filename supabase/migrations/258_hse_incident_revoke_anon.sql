-- 258 — Durcissement Loi 25 : les incidents HSE portent des renseignements de SANTÉ (partie du corps,
-- nature de la blessure, description). On RETIRE tout accès direct de la clé anon à `hse_incident`.
-- Tout passe désormais par la route serveur service_role `app/api/hse/incidents` (garde tier ≥ 4,
-- champs médicaux masqués si non-RH). Les VUES KPI/échéances restent lisibles (owner/definer, non sensibles).
-- Idempotent. À coller dans l'éditeur SQL Supabase du BON projet (nzjjgcccxlqhbtpitmpo), puis Run.

do $$
begin
  revoke select, insert, update, delete on public.hse_incident from anon;
exception when others then null;  -- best-effort : ne casse pas si le rôle/grant diffère
end $$;

-- Les vues agrégées (definer) qui s'appuient sur hse_incident continuent de fonctionner pour anon car
-- elles s'exécutent avec les droits de leur propriétaire (créées sans security_invoker, migration 248).

insert into schema_migrations (version) values ('258') on conflict (version) do nothing;
