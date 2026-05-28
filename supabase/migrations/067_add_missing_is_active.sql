-- 067: Ajout de is_active manquant sur toutes les tables qui en ont besoin
-- Idempotent — sans effet si la colonne existe déjà
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- planner_personnel
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- planner_equipements
ALTER TABLE planner_equipements ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- sites
ALTER TABLE sites ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- clients (utilise "active" dans le code — s'assurer que les deux existent)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS active    BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- planner_postes (pas de is_active mais active utilisé ailleurs)
ALTER TABLE planner_postes ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- planner_succursales
ALTER TABLE planner_succursales ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- equipment (module inspection)
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- planner_jobs
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- planner_conges
ALTER TABLE planner_conges ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
