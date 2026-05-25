-- 039_inspections_shifts.sql
-- Quarts de travail applicables (jour/soir/nuit) pour la fréquence par_quart

ALTER TABLE equipment_inspections
  ADD COLUMN IF NOT EXISTS inspection_shifts JSONB NOT NULL DEFAULT '[]';
