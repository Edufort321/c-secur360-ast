-- 083: Capture des notes détaillées par évaluation (pour rouvrir une éval passée)
-- Exécuter dans le SQL Editor de Supabase Dashboard
--
-- Permet de rouvrir une ancienne évaluation avec exactement les mêmes notes par
-- compétence (le formulaire se recharge à l'identique), puis de faire la
-- progression / le nouvel ajustement à partir de là.

ALTER TABLE employee_evaluations
  ADD COLUMN IF NOT EXISTS scores JSONB DEFAULT '{}'::jsonb;
