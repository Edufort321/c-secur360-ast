-- 181: Soumission — SNAPSHOT figé à l'acceptation. Quand une soumission est acceptée, on gèle
-- une copie de la version transmise (items/lignes/total/présentation) pour traçabilité : la
-- soumission acceptée s'affiche « telle qu'envoyée » même si quelqu'un tente de la modifier après.
-- Idempotent.

ALTER TABLE soumissions ADD COLUMN IF NOT EXISTS accepted_snapshot JSONB;

-- Auto-enregistrement dans le journal des migrations (convention depuis 177).
insert into schema_migrations (version) values ('181') on conflict (version) do nothing;
