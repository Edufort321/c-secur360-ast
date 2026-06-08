-- 139 — Approbation des soumissions.
--  - soumissions.approved_by / approved_at / approval_note : qui a approuvé / quand / note de révision.
--  - poste_salary_grids.approval_max_amount : montant max qu'un poste (grille) peut APPROUVER.
--    Un représentant peut approuver une soumission si son montant <= ce plafond (sinon, escalade).
ALTER TABLE soumissions ADD COLUMN IF NOT EXISTS approved_by   TEXT;
ALTER TABLE soumissions ADD COLUMN IF NOT EXISTS approved_at   TIMESTAMPTZ;
ALTER TABLE soumissions ADD COLUMN IF NOT EXISTS approval_note TEXT;
ALTER TABLE poste_salary_grids ADD COLUMN IF NOT EXISTS approval_max_amount NUMERIC;
