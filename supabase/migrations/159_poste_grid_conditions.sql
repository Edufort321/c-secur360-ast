-- 159 — Conditions/frais (subsistance, hébergement…) applicables à un POSTE, avec prix EMPLOYÉ.
-- Les conditions viennent du catalogue des taux (prix VENDANT). Sur la grille d'un poste, on coche
-- celles qui s'appliquent et on fixe le « prix donné à l'employé » (par défaut vendant × 0,8 = −20 %,
-- éditable). Stocké en JSONB : [{ key, label, sell_price, employee_price, applies }].
-- (Interconnexion du temps — voir docs/INTERCONNEXION_TEMPS.md, Point 2.)
ALTER TABLE public.poste_salary_grids ADD COLUMN IF NOT EXISTS grid_conditions jsonb NOT NULL DEFAULT '[]'::jsonb;
