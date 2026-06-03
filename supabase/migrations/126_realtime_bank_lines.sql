-- 126: #59 (temps reel) — ajoute les lignes de releve bancaire + lignes de transaction a la
-- publication supabase_realtime (la 109 couvrait deja commerce_transactions, pas ces tables
-- creees ensuite). Idempotent. REPLICA IDENTITY FULL pour recevoir l'ancienne ligne sur UPDATE/DELETE.
DO $$
DECLARE
  t text;
  tbls text[] := ARRAY['bank_statement_lines', 'commerce_transaction_items'];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = t AND c.relkind = 'r'
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      END IF;
      EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
    END IF;
  END LOOP;
END $$;
