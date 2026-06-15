-- 178: planner_jobs — quarts de travail (mode 24/24) + nettoyage de la redondance horaire.
-- Le module Planner (JobModal) unifie l'horaire sur "modeHoraire" ('heures-jour' | '24h-24')
-- et, en mode 24/24, enregistre des QUARTS (jour/soir/nuit) avec assignation par ressource.
-- planner_jobs stocke les champs de formData en colonnes camelCase (cf. migration 065) :
-- syncToSupabase RETIRE les colonnes absentes du schéma -> sans ces colonnes, les quarts
-- seraient silencieusement perdus à la sauvegarde (bug "ne reste pas coché"). Idempotent.

ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "gabaritQuarts"     TEXT  DEFAULT '3x8';   -- '3x8' (jour/soir/nuit) | '2x12' (jour/nuit)
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "quarts"            JSONB DEFAULT '[]'::jsonb;  -- [{ id, nom, debut, fin }] (heures éditables)
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "quartParRessource" JSONB DEFAULT '{}'::jsonb;  -- { [personnelId]: quartId }

-- Auto-enregistrement dans le journal des migrations (convention depuis 177).
insert into schema_migrations (version) values ('178') on conflict (version) do nothing;
