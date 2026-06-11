-- 155 — Catalogue de TÂCHES RÉCURRENTES défini par le tenant.
-- Le tenant crée ses propres tâches (ex. bureau, atelier, soumission, administration, formation…).
-- Utilisé comme alternative au PROJET pour associer une ligne de feuille de temps ou une tâche du
-- planificateur. `billable` distingue les tâches refacturables des tâches internes.
-- (Interconnexion du temps — voir docs/INTERCONNEXION_TEMPS.md.)
CREATE TABLE IF NOT EXISTS public.tenant_recurring_tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   text NOT NULL,
  name        text NOT NULL,
  code        text NOT NULL DEFAULT '',         -- code court optionnel (ex. ADM, ATL)
  billable    boolean NOT NULL DEFAULT false,    -- refacturable au client (sinon interne)
  active      boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tenant_recurring_tasks_idx ON public.tenant_recurring_tasks (tenant_id, active, sort_order);

ALTER TABLE public.tenant_recurring_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_recurring_tasks_access ON public.tenant_recurring_tasks;
CREATE POLICY tenant_recurring_tasks_access ON public.tenant_recurring_tasks FOR ALL USING (true) WITH CHECK (true);

-- Temps réel (l'admin et la feuille de temps s'y abonnent pour refléter le catalogue à jour).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN CREATE PUBLICATION supabase_realtime; END IF;
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='tenant_recurring_tasks' AND c.relkind='r')
     AND NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='tenant_recurring_tasks') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_recurring_tasks';
  END IF;
  EXECUTE 'ALTER TABLE public.tenant_recurring_tasks REPLICA IDENTITY FULL';
END $$;
