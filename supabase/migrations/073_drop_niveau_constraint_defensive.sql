-- 073: DROP défensif du constraint niveauAcces — trouve par contenu
-- Exécuter dans Supabase SQL Editor

-- 1. Trouver et supprimer tous les CHECK constraints qui réfèrent à niveauAcces
DO $$
DECLARE c_name TEXT; dropped_count INT := 0;
BEGIN
  FOR c_name IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'planner_personnel'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%niveauAcces%'
  LOOP
    EXECUTE format('ALTER TABLE planner_personnel DROP CONSTRAINT %I', c_name);
    dropped_count := dropped_count + 1;
    RAISE NOTICE 'Constraint supprimé : %', c_name;
  END LOOP;
  RAISE NOTICE 'Total supprimé : %', dropped_count;
END $$;

-- 2. Recréer avec les 8 niveaux
ALTER TABLE planner_personnel
  ADD CONSTRAINT planner_personnel_niveauAcces_check
    CHECK ("niveauAcces" IN (
      'consultation', 'modification', 'coordination', 'administration',
      'admin_paie', 'rh', 'direction', 'super_user'
    ));

-- 3. Test
INSERT INTO planner_personnel (tenant_id, name, "niveauAcces", is_active)
VALUES ('cerdia', 'TEST super_user ' || now()::text, 'super_user', true)
RETURNING id, name, "niveauAcces";

-- 4. Vérifier les contraintes actives
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'planner_personnel'::regclass AND contype = 'c';
