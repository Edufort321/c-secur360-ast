-- 162 — Retirer les contraintes CHECK héritées du schéma d'origine de timesheet_entries.
--
-- Suite de la migration 161 : la table avait un schéma parallèle (start_time/end_time/total_hours…)
-- avec des contraintes CHECK (ex. « valid_times » : end_time > start_time) que l'APPLICATION ACTUELLE
-- NE RENSEIGNE PAS (elle utilise date + hrs_regular/overtime/premium). Ces contraintes bloquent donc
-- l'INSERT/UPSERT de l'app -> erreur « violates check constraint "valid_times" ».
--
-- On retire la contrainte connue, puis on supprime AUTOMATIQUEMENT toute autre contrainte CHECK qui
-- référence une colonne héritée non utilisée par l'app (start_time/end_time/break_minutes/total_hours/
-- billing_rate/mileage_km/travel_time_hours). Non destructif pour les données ; ne touche pas aux
-- colonnes ni aux contraintes portant sur les colonnes de l'app.

ALTER TABLE public.timesheet_entries DROP CONSTRAINT IF EXISTS valid_times;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT con.conname, pg_get_constraintdef(con.oid) AS def
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace ns ON ns.oid = rel.relnamespace
    WHERE ns.nspname = 'public'
      AND rel.relname = 'timesheet_entries'
      AND con.contype = 'c'  -- CHECK
  LOOP
    -- Si la définition de la contrainte mentionne une colonne héritée non remplie par l'app, on la retire.
    IF r.def ~* '(start_time|end_time|break_minutes|total_hours|billing_rate|mileage_km|travel_time_hours)' THEN
      EXECUTE format('ALTER TABLE public.timesheet_entries DROP CONSTRAINT IF EXISTS %I', r.conname);
      RAISE NOTICE 'Contrainte CHECK héritée retirée : %', r.conname;
    END IF;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
