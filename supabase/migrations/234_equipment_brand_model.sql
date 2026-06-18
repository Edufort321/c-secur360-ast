-- 234_equipment_brand_model.sql
-- Fiche équipement (module Maintenance) : ajoute MARQUE + MODÈLE pour la création de fiche.
-- La récurrence de maintenance réutilise `inspection_frequency` (040) ; la case « Alertes publiques
-- (scan QR) » réutilise `public_alerts_enabled` (215). Idempotent.

ALTER TABLE equipment ADD COLUMN IF NOT EXISTS equipment_brand TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS equipment_model TEXT;

-- Gabarit d'inspection par défaut rattaché à l'équipement (rapport_templates.id, lien souple).
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS default_gabarit_id UUID;

insert into schema_migrations (version) values ('234') on conflict (version) do nothing;
