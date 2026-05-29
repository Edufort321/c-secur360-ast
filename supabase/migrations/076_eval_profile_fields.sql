-- 076: Profil d'évaluation — évaluateur, objectifs, mode « salaire fixe »
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- Qui a réalisé l'évaluation + objectifs fixés pour la prochaine année
ALTER TABLE employee_evaluations
  ADD COLUMN IF NOT EXISTS evaluated_by TEXT,
  ADD COLUMN IF NOT EXISTS objectives   TEXT;

-- Poste à salaire fixe : false = pas de grille de compétences ni de paliers,
-- seulement les informations salariales (base + COLA + primes).
ALTER TABLE poste_salary_grids
  ADD COLUMN IF NOT EXISTS use_skill_grid BOOLEAN DEFAULT TRUE;

-- Objectifs courants de l'employé (dernier en date, pour affichage rapide)
ALTER TABLE planner_personnel
  ADD COLUMN IF NOT EXISTS objectives TEXT;
