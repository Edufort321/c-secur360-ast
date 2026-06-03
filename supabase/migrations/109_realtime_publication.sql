-- 109 — Active la diffusion temps réel (Supabase Realtime) sur les tables collaboratives.
-- Sans cela, les abonnements client (postgres_changes) ne reçoivent jamais d'événement -> pas de
-- synchro multi-utilisateur. Idempotent : n'ajoute une table que si elle n'est pas déjà publiée.
-- REPLICA IDENTITY FULL : permet de recevoir l'ancienne ligne sur UPDATE/DELETE (utile au client).

DO $$
DECLARE
  t text;
  tbls text[] := ARRAY[
    'items','item_locations','inventory_movements',
    'planner_jobs','planner_personnel','planner_equipements','planner_conges','planner_succursales',
    'timesheets','timesheet_entries','timesheet_expenses',
    'ast_permits','work_permits','confined_space_permits',
    'equipment_inspections','incident_reports','near_miss_events',
    'soumissions','soumission_items','soumission_lignes','projects','catalogue_taux','bons_commande',
    'todo_tasks','commerce_transactions','commerce_invoices'
  ];
BEGIN
  -- Crée la publication si absente (normalement fournie par Supabase).
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  FOREACH t IN ARRAY tbls LOOP
    -- Seulement les VRAIES TABLES (relkind 'r') — on ignore les vues (ex. near_miss_events
    -- est une vue sur incident_reports : non supporte par une publication).
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
