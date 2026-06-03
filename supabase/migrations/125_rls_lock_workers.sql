-- 125: #17 (Option D, suite de 124) — verrouillage RLS de la table 'workers'.
-- Verification faite : 'workers' n'est lue/ecrite QUE par app/api/sms/inbound (serveur, service_role).
-- Aucun composant navigateur (client anon) ne l'utilise -> on peut refuser l'acces anon sans rien casser
-- (service_role bypass la RLS). Complete la migration 124 qui l'avait laissee de cote par prudence.
DO $$
DECLARE p record;
BEGIN
  IF to_regclass('public.workers') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY';
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'workers' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.workers', p.policyname);
    END LOOP;
    EXECUTE 'CREATE POLICY workers_no_anon ON public.workers FOR ALL USING (false) WITH CHECK (false)';
  END IF;
END $$;
