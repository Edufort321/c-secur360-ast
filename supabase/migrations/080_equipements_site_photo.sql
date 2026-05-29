-- 080: Site + photo + identification sur les équipements du planificateur
-- Exécuter dans le SQL Editor de Supabase Dashboard

ALTER TABLE planner_equipements
  ADD COLUMN IF NOT EXISTS succursale  TEXT,
  ADD COLUMN IF NOT EXISTS photo_url   TEXT;
-- (le N° de série existant `serial_number` sert d'identification)
