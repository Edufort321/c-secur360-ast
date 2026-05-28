-- 064: Sync véhicules → inspection (equipment) + planner (planner_equipements)
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- Lien retour vehicle → equipment (inspection)
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS vehicle_id UUID;
CREATE INDEX IF NOT EXISTS equipment_vehicle_id_idx ON equipment (vehicle_id) WHERE vehicle_id IS NOT NULL;

-- Lien retour vehicle → planner_equipements
ALTER TABLE planner_equipements ADD COLUMN IF NOT EXISTS vehicle_id UUID;
CREATE INDEX IF NOT EXISTS pe_vehicle_id_idx ON planner_equipements (vehicle_id) WHERE vehicle_id IS NOT NULL;

-- S'assurer que vehicles.photos existe (JSONB array d'URLs)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS photos JSONB NOT NULL DEFAULT '[]'::jsonb;
