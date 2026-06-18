-- 228 — Inspection phase 2 : rattacher un ÉQUIPEMENT à un CLIENT (arborescence Client → équipements).
-- Permet à une compagnie de service de regrouper les équipements à vérifier par client (clients de
-- l'admin OU custom). RLS déjà active sur equipment. Idempotent + auto-enregistré.

alter table equipment add column if not exists client_id uuid;
create index if not exists idx_equipment_client on equipment (client_id);

insert into schema_migrations (version) values ('228') on conflict (version) do nothing;
