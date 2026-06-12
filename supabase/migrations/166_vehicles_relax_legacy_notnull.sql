-- 166 — Véhicules : relâcher les NOT NULL hérités que l'app ne remplit pas.
-- L'app utilise « plate » ; une colonne héritée « plate_number » NOT NULL (sans défaut) faisait
-- échouer l'enregistrement (null value in column "plate_number" ... violates not-null constraint).
-- On relâche plate_number (et d'éventuelles autres colonnes héritées) si elles existent. Idempotent.
DO $$
DECLARE c text;
BEGIN
  FOREACH c IN ARRAY ARRAY['plate_number','vehicle_type','status','name','description'] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name='vehicles' AND column_name=c AND is_nullable='NO') THEN
      EXECUTE format('ALTER TABLE public.vehicles ALTER COLUMN %I DROP NOT NULL', c);
    END IF;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
