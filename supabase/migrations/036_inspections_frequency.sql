-- 036_inspections_frequency.sql
-- Fréquence d'inspection, actions correctives, exception documentée

ALTER TABLE equipment_inspections
  ADD COLUMN IF NOT EXISTS inspection_frequency   TEXT,
  ADD COLUMN IF NOT EXISTS corrective_actions     JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS usable_with_conditions BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS usable_until_date      DATE;

CREATE INDEX IF NOT EXISTS idx_ei_frequency ON equipment_inspections(inspection_frequency);
CREATE INDEX IF NOT EXISTS idx_ei_serial    ON equipment_inspections(equipment_serial);

-- Politique de suppression (manquante dans la migration 035)
CREATE POLICY IF NOT EXISTS "ei_anon_delete" ON equipment_inspections
  FOR DELETE USING (true);
