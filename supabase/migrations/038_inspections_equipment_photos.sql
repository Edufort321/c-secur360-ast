-- 038_inspections_equipment_photos.sql
-- Plusieurs photos par équipement (remplace le champ simple equipment_photo)

ALTER TABLE equipment_inspections
  ADD COLUMN IF NOT EXISTS equipment_photos JSONB NOT NULL DEFAULT '[]';
