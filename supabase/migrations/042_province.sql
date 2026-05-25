-- 042_province.sql
-- Province canadienne sur la fiche équipement et l'inspection

ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT 'QC';

ALTER TABLE equipment_inspections
  ADD COLUMN IF NOT EXISTS province TEXT;

-- Copier la province depuis la fiche équipement vers les inspections liées
UPDATE equipment_inspections ei
SET province = e.province
FROM equipment e
WHERE ei.equipment_id = e.id
  AND ei.province IS NULL;
