-- 145 — SÉCURITÉ : ferme l'accès anon/authenticated aux données SALARIALES des grilles.
-- Désormais lues/écrites via /api/hr/salary-grid & /api/hr/commission (service role + niveau RH).
-- Particularité : `poste_salary_grids` contient AUSSI la grille de COMPÉTENCES (skill_form,
-- use_skill_grid) utilisée par le planificateur (non sensible). On ferme donc UNIQUEMENT les
-- colonnes de rémunération (REVOKE par colonne), en gardant l'accès aux colonnes de compétences.

-- Écritures : interdites à l'anon (toutes via le serveur).
REVOKE INSERT, UPDATE, DELETE ON public.poste_salary_grids FROM anon, authenticated;

-- Colonnes de RÉMUNÉRATION fermées en lecture (salaires, primes, commissions).
REVOKE SELECT (
  mode, base_salary, annual_increase_pct, annual_increase_fixed, years_plan,
  cola_pct, hours_per_year, commission_enabled, commission_pct, commission_basis,
  commission_threshold, commission_cap, discretionary_bonuses
) ON public.poste_salary_grids FROM anon, authenticated;
-- (Restent lisibles : id, tenant_id, poste_id, name, skill_form, use_skill_grid, notes — pour la
--  grille de compétences du planificateur.)

-- Les paliers (poste_salary_tiers) sont 100 % salariaux et désormais 100 % serveur : on ferme tout.
REVOKE ALL ON public.poste_salary_tiers FROM anon, authenticated;
DROP POLICY IF EXISTS pst_access ON public.poste_salary_tiers;
