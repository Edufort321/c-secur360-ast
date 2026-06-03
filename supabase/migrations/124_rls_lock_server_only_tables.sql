-- 124: #17 (Option D) — verrouillage RLS des tables SERVEUR-SEUL.
-- Ces tables ne sont JAMAIS lues par le navigateur (client anon) ; elles ne sont accedees que
-- cote serveur via service_role (routes API / middleware), qui BYPASS la RLS. On remplace donc
-- leurs policies permissives 'USING (true)' par 'USING (false)' : le role anon (cle publique)
-- n'y a plus AUCUN acces direct via PostgREST, le serveur continue de fonctionner normalement.
-- NON-CASSANT pour l'app. Critique : auth_sessions (jetons) + password_reset_tokens etaient
-- lisibles par anon.
-- Idempotent : supprime toutes les policies existantes de chaque table puis pose la policy de refus.
-- 'workers' volontairement EXCLU (classification a verifier — registre travailleurs cote client ?).

DO $$
DECLARE
  t text;
  p record;
  server_only text[] := ARRAY[
    'auth_sessions',
    'password_reset_tokens',
    'audit_logs',
    'system_audit_logs',
    'demo_sessions',
    'sms_alerts',
    'checkout_sessions',
    'customers',
    'invoices',
    'payment_methods',
    'subscriptions',
    'price_adjustments',
    'price_config'
  ];
BEGIN
  FOREACH t IN ARRAY server_only LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      -- Retire toute policy existante (notamment les '... USING (true)')
      FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
      END LOOP;
      -- Refus total pour les roles non privilegies ; service_role bypass la RLS.
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (false) WITH CHECK (false)', t || '_no_anon', t);
    END IF;
  END LOOP;
END $$;
