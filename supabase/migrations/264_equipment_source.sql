-- 264 — Provenance des équipements importés dans le module Maintenance.
-- Quand on importe un équipement depuis un autre module (DGA, Rapport terrain…), on trace d'où il vient
-- (source) et son identifiant d'origine (source_id) pour éviter les ré-imports en double et permettre
-- de relier l'historique (ex. rapports DGA via dga_dossiers.equipment_id). Idempotent.

alter table if exists equipment add column if not exists source    text;
alter table if exists equipment add column if not exists source_id text;

-- Index de dédoublonnage : un équipement par (tenant, source, source_id) importé.
create index if not exists idx_equipment_source on equipment (tenant_id, source, source_id) where source is not null;

insert into schema_migrations (version) values ('264') on conflict (version) do nothing;
