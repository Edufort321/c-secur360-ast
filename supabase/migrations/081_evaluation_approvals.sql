-- 081: Workflow de vérification / approbations multi-niveaux sur l'évaluation
-- Exécuter dans le SQL Editor de Supabase Dashboard
--
-- approvals (jsonb) :
--   { "verified": { "by": "Nom gestionnaire", "at": "ISO" },   -- vérifié par le gestionnaire
--     "employee": { "at": "ISO" },                             -- approuvé en direct par l'employé
--     "hr":       { "by": "Nom RH", "at": "ISO" } }            -- approbation RH (optionnelle)

ALTER TABLE employee_evaluations
  ADD COLUMN IF NOT EXISTS approvals JSONB DEFAULT '{}'::jsonb;
