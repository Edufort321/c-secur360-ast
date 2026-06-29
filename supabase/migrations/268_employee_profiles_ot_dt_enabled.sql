-- 268 — RATTRAPAGE de colonnes de migrations sautées (causaient des 400 / erreurs console).
-- Toutes IDEMPOTENTES (IF NOT EXISTS) et SANS effet de bord néfaste sur les données existantes.
--   • employee_profiles.ot_enabled / dt_enabled (migration 104 sautée) : activer OT/DT par employé.
--     « column employee_profiles.ot_enabled does not exist » dans les Profils de paie.
--   • company_settings.pdf_styles (migration 216 sautée) : styles d'export PDF par module (JSONB).
--     400 sur company_settings?select=pdf_styles (lu par le PortalHeader pour la couleur de marque).
-- NOTE : on NE touche PAS à tenants.max_sites (migration 078). L'ajouter avec DEFAULT 1 imposerait
--        une limite de 1 site à TOUS les tenants existants. Le code retombe déjà sur « sans limite »
--        quand la colonne manque ; le 400 correspondant est neutralisé côté code (select('*')).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employee_profiles') THEN
    ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS ot_enabled boolean NOT NULL DEFAULT true;
    ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS dt_enabled boolean NOT NULL DEFAULT true;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_settings') THEN
    ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS pdf_styles JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

insert into schema_migrations (version) values ('268') on conflict (version) do nothing;
