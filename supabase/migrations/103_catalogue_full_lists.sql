-- 103 — Catalogue de taux auto-contenu : matériel, paliers carburant, niveaux d'approbation
-- stockés PAR catalogue (JSON). Le « + Nouveau catalogue » contient désormais le barème complet.
ALTER TABLE catalogue_taux ADD COLUMN IF NOT EXISTS materials       jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE catalogue_taux ADD COLUMN IF NOT EXISTS fuel_tiers      jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE catalogue_taux ADD COLUMN IF NOT EXISTS approval_levels jsonb NOT NULL DEFAULT '[]'::jsonb;
