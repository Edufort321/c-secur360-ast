-- 077: Commission de vente reportée sur la feuille de temps
-- Exécuter dans le SQL Editor de Supabase Dashboard
--
-- Quand un projet passe au statut 'vente' et qu'un vendeur (primary_seller_id)
-- est défini, une commission est calculée selon la grille salariale du vendeur
-- et reportée sur sa feuille de temps de la semaine de conclusion.

-- Feuille de temps : total des commissions + détail par projet
ALTER TABLE timesheets
  ADD COLUMN IF NOT EXISTS total_commissions  NUMERIC      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_details  JSONB        DEFAULT '[]'::jsonb;
-- commission_details : [{ project_id, project_number, title, amount }]

-- Lien commission ↔ feuille de temps + semaine d'application
ALTER TABLE project_commissions
  ADD COLUMN IF NOT EXISTS week_start    DATE,
  ADD COLUMN IF NOT EXISTS timesheet_id  UUID;

CREATE INDEX IF NOT EXISTS pc_personnel_week_idx ON project_commissions (personnel_id, week_start);

-- Le statut 'vente' n'a pas besoin de migration : projects.status est un TEXT libre
-- (pas de contrainte CHECK). On ajoute juste la valeur côté application.
