-- 127: #59 (temps reel) — publication realtime du grand livre (gl_entries / gl_lines), absents de 109.
-- Permet au module Comptabilite de se rafraichir en direct quand une ecriture est passee.
-- Idempotent. REPLICA IDENTITY FULL pour recevoir l'ancienne ligne sur UPDATE/DELETE.
DO $$
DECLARE
  t text;
  tbls text[] := ARRAY['gl_entries', 'gl_lines'];
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
