-- 161 — Aligner timesheet_entries sur le schéma réellement utilisé par l'application.
--
-- CONTEXTE : la table avait été créée à l'origine avec un schéma parallèle (work_date, total_hours,
-- mileage_km, notes, activity_type, is_billable, source, ast_id, planned_entry_id, location_*…) que
-- le CODE ACTUEL N'UTILISE NULLE PART. Les migrations 029/107 (qui définissent date/hrs_*/km/
-- description) étaient en CREATE TABLE IF NOT EXISTS : la table existant déjà, elles n'ont rien ajouté.
-- Résultat : l'app écrivait/lisait des colonnes inexistantes (date, hrs_*, km, description, tenant_id)
-- -> le SELECT .order('date') et l'INSERT échouaient -> « le temps ne reste jamais enregistré ».
--
-- CORRECTIF (non destructif) : on AJOUTE les colonnes attendues par l'app et on RELÂCHE les NOT NULL
-- hérités que l'app ne renseigne pas, pour que les écritures passent. On NE SUPPRIME aucune colonne
-- héritée (au cas où une intégration externe les lirait).

-- 1) Colonnes attendues par l'application (ajoutées si absentes)
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS tenant_id   text;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS date        date;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS hrs_regular  numeric NOT NULL DEFAULT 0;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS hrs_overtime numeric NOT NULL DEFAULT 0;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS hrs_premium  numeric NOT NULL DEFAULT 0;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS km           numeric NOT NULL DEFAULT 0;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS description  text    NOT NULL DEFAULT '';

-- 2) Relâcher les NOT NULL hérités que l'app ne remplit pas (sinon l'INSERT échoue). Sans risque :
--    rend simplement ces colonnes nullables, uniquement si elles existent.
DO $$
DECLARE c text;
BEGIN
  FOREACH c IN ARRAY ARRAY[
    'work_date','total_hours','user_id','client_id','site_id','billing_code',
    'start_time','end_time','break_minutes','activity_type','is_billable','billing_rate',
    'source','ast_id','planned_entry_id','travel_time_hours','mileage_km'
  ] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name='timesheet_entries' AND column_name=c) THEN
      EXECUTE format('ALTER TABLE public.timesheet_entries ALTER COLUMN %I DROP NOT NULL', c);
    END IF;
  END LOOP;
END $$;

-- 3) Cohérence des lignes existantes : refléter date <-> work_date quand l'une manque.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='timesheet_entries' AND column_name='work_date') THEN
    UPDATE public.timesheet_entries SET date = work_date WHERE date IS NULL AND work_date IS NOT NULL;
    UPDATE public.timesheet_entries SET work_date = date WHERE work_date IS NULL AND date IS NOT NULL;
  END IF;
END $$;

-- 4) Index utile (chargement par feuille, tri par date)
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_sheet_date ON public.timesheet_entries (timesheet_id, date);

-- 5) Recharger le cache de schéma PostgREST (sinon l'API continue d'ignorer les nouvelles colonnes)
NOTIFY pgrst, 'reload schema';
