-- 089: Liens P4 du mandat (planner_jobs) — role, interconnexions modules, geolocalisation
-- Le code est tolerant : la sauvegarde ignore ces colonnes tant que la migration n'est pas passee
-- (retrait automatique des colonnes absentes), puis les persiste une fois executee.
-- Colonnes en camelCase quote pour matcher les cles de formData (objet insere tel quel).
-- Executer dans le SQL Editor de Supabase Dashboard.

ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "responsableId" TEXT;   -- responsable de l'evenement (planner_personnel.id)
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "projectId"     TEXT;   -- lien module Projets
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "clientId"      TEXT;   -- lien module Clients
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "astId"         TEXT;   -- lien AST (si module debarre)
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "lieuLat"       NUMERIC(10,6);  -- geocodage Google Maps
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "lieuLng"       NUMERIC(10,6);
