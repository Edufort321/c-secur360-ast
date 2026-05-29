-- 074: Primes / bonifications discrétionnaires sur la grille salariale
-- Exécuter dans le SQL Editor de Supabase Dashboard
--
-- Permet de définir, par grille de poste, une liste de primes que la direction
-- peut octroyer à sa discrétion EN PLUS du palier de l'employé.
-- Exemple : un employé au palier « Niveau 2 » peut recevoir « Prime 1 = +2 000 $ ».
--
-- Format JSONB : [{ "label": "Prime 1", "amount": 2000, "unit": "fixed" }, ...]
--   unit = 'fixed'  → montant en $/an
--   unit = 'pct'    → pourcentage du salaire annuel du palier

ALTER TABLE poste_salary_grids
  ADD COLUMN IF NOT EXISTS discretionary_bonuses JSONB DEFAULT '[]'::jsonb;
