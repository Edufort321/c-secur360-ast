-- 🔧 FIX RLS — Si le save échoue silencieusement après la purge
-- Cause probable : policies RLS restrictives ou absentes après cleanup
-- Exécuter dans Supabase SQL Editor

-- ─── 1. DIAGNOSTIC — Voir ce qui bloque ──────────────────────────────────────
SELECT
  schemaname, tablename, rowsecurity AS rls_active,
  (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) AS nb_policies
FROM pg_tables t
WHERE tablename IN ('planner_personnel','planner_postes','poste_subclasses_catalog',
                    'poste_salary_grids','poste_salary_tiers','poste_skills_catalog',
                    'employee_evaluations','planner_succursales','planner_equipements');

-- ─── 2. RÉPARATION — Recréer les policies permissives ───────────────────────
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'planner_personnel','planner_postes','planner_succursales','planner_equipements',
    'poste_subclasses_catalog','poste_salary_grids','poste_salary_tiers',
    'poste_skills_catalog','employee_evaluations'
  ] LOOP
    -- S'assurer que la table existe avant de toucher
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = t) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
      EXECUTE format('DROP POLICY IF EXISTS %I_all ON %I;', t, t);
      EXECUTE format('CREATE POLICY %I_all ON %I FOR ALL USING (true) WITH CHECK (true);', t, t);
      RAISE NOTICE 'Policy recréée pour %', t;
    END IF;
  END LOOP;
END $$;

-- ─── 3. VÉRIFICATION FINALE ──────────────────────────────────────────────────
SELECT
  tablename, rowsecurity AS rls_active,
  (SELECT string_agg(policyname || ' (' || cmd || ')', ', ')
   FROM pg_policies WHERE pg_policies.tablename = t.tablename) AS policies
FROM pg_tables t
WHERE tablename IN ('planner_personnel','planner_postes','poste_subclasses_catalog',
                    'poste_salary_grids','employee_evaluations');

-- ─── 4. TEST D'INSERTION ─────────────────────────────────────────────────────
INSERT INTO planner_personnel (tenant_id, name, "niveauAcces", is_active)
VALUES ('cerdia', 'TEST RLS ' || now()::text, 'consultation', true)
RETURNING id, name;

-- Si la ligne ci-dessus s'insère, RLS est OK. Sinon, l'erreur affichée pointe le problème.
