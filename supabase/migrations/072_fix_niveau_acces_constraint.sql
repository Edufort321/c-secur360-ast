-- 072: Étendre le CHECK constraint de niveauAcces aux 8 niveaux
-- Bloquant : le constraint de migration 047 ne connaît que 4 valeurs
-- Exécuter dans Supabase SQL Editor

-- 1. Retirer l'ancien constraint
ALTER TABLE planner_personnel DROP CONSTRAINT IF EXISTS planner_personnel_niveauAcces_check;

-- 2. Recréer avec les 8 niveaux de la cascade complète
ALTER TABLE planner_personnel
  ADD CONSTRAINT planner_personnel_niveauAcces_check
    CHECK ("niveauAcces" IN (
      'consultation',     -- 1
      'modification',     -- 2
      'coordination',     -- 3
      'administration',   -- 4
      'admin_paie',       -- 5
      'rh',               -- 6
      'direction',        -- 7
      'super_user'        -- 8
    ));

-- 3. Vérification
SELECT conname, pg_get_constraintdef(oid) AS def
FROM pg_constraint
WHERE conname = 'planner_personnel_niveauAcces_check';
