-- 124 — Inspection d'équipement : rattachement au Site/Département GÉRÉS PAR L'ADMIN
-- (hiérarchie planner_succursales : site -> département). Fin de l'emplacement en texte libre.
-- IDs souples (pas de FK stricte, cohérent avec le reste du schéma).
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS site_id UUID;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS department_id UUID;
ALTER TABLE equipment_inspections ADD COLUMN IF NOT EXISTS site_id UUID;
ALTER TABLE equipment_inspections ADD COLUMN IF NOT EXISTS department_id UUID;
