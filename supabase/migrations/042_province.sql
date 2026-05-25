-- 042_province.sql
-- Province canadienne sur la fiche équipement et l'inspection

ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT 'QC';

ALTER TABLE equipment_inspections
  ADD COLUMN IF NOT EXISTS province TEXT;

-- Backfill province depuis equipment (seulement si equipment_id existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'equipment_inspections'
      AND column_name = 'equipment_id'
  ) THEN
    UPDATE equipment_inspections ei
    SET province = e.province
    FROM equipment e
    WHERE ei.equipment_id = e.id
      AND ei.province IS NULL;
  END IF;
END $$;
