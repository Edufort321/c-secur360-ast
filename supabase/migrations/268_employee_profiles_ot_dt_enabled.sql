-- 268 — Profils de paie : (re)assure les colonnes ot_enabled / dt_enabled sur employee_profiles.
-- La migration 104 (qui les ajoutait) n'avait pas été exécutée sur certains projets → la lecture/
-- sauvegarde des « Profils de paie » plantait : « column employee_profiles.ot_enabled does not exist ».
-- Idempotent (IF NOT EXISTS) et sans danger si la table n'existe pas encore.
-- Désactivé (false) => le multiplicateur OT/DT ne s'applique pas (heures payées au taux régulier).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employee_profiles') THEN
    ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS ot_enabled boolean NOT NULL DEFAULT true;
    ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS dt_enabled boolean NOT NULL DEFAULT true;
  ELSE
    RAISE NOTICE 'Table employee_profiles absente — exécutez d''abord 060_employee_profiles_allowances.sql.';
  END IF;
END $$;

insert into schema_migrations (version) values ('268') on conflict (version) do nothing;
