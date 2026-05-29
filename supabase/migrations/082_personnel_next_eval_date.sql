-- 082: Garantit la colonne next_evaluation_date sur planner_personnel
-- (idempotent — au cas où la migration 071 n'aurait pas été exécutée).
-- Exécuter dans le SQL Editor de Supabase Dashboard.

ALTER TABLE planner_personnel
  ADD COLUMN IF NOT EXISTS next_evaluation_date DATE;
