-- 037_inspections_custom_items.sql
-- Points d'inspection personnalisés ajoutés par l'utilisateur

ALTER TABLE equipment_inspections
  ADD COLUMN IF NOT EXISTS custom_items JSONB NOT NULL DEFAULT '[]';
