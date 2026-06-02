-- 104 — Profils de paie : activer/désactiver le temps supplémentaire (OT) et double (DT) par employé.
-- Désactivé => le multiplicateur ne s'applique pas (heures payées au taux régulier).
-- PRÉREQUIS : la migration 060 (création de employee_profiles) doit avoir été exécutée.
-- Ce script est sans danger si la table n'existe pas encore (il ne fait rien dans ce cas).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employee_profiles') THEN
    ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS ot_enabled boolean NOT NULL DEFAULT true;
    ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS dt_enabled boolean NOT NULL DEFAULT true;
  ELSE
    RAISE NOTICE 'Table employee_profiles absente — exécutez d''abord la migration 060_employee_profiles_allowances.sql.';
  END IF;
END $$;
