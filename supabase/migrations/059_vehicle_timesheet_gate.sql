-- 059: Véhicule attitré → gate odomètre sur feuille de temps
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- Lien véhicule → utilisateur (employee_id from users table)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS assigned_to TEXT;

-- Déduction véhicule hebdomadaire sur la feuille de temps
-- = km_personal × taux ARC, déduit du net de l'employé
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS vehicle_deduction NUMERIC NOT NULL DEFAULT 0;

-- Index lookup rapide du véhicule attitré par employé
CREATE INDEX IF NOT EXISTS vehicles_assigned_to_idx
  ON vehicles (tenant_id, assigned_to)
  WHERE assigned_to IS NOT NULL;
