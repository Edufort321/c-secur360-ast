-- 088: Retenues a la source sur les feuilles de temps (Phase 5 - rapports fiscaux)
-- Permet de ventiler l'ecriture de paie : CR 2300 net + CR 2200 (federal) + CR 2210 (Quebec).
-- Colonnes optionnelles (defaut 0) : si laissees a 0, la paie se comporte comme avant.
-- Executer dans le SQL Editor de Supabase Dashboard.

ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS federal_deductions NUMERIC(14,2) DEFAULT 0;  -- RPC/AE/impot federal retenus
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS quebec_deductions  NUMERIC(14,2) DEFAULT 0;  -- RRQ/RQAP/impot QC/FSS retenus
