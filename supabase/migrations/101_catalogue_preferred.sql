-- 101 — Catalogue de taux : indicateur « préféré » (proposé par défaut dans la soumission).
-- Un seul modèle de catalogue, plusieurs enregistrés ; le préféré apparaît en premier.
ALTER TABLE catalogue_taux ADD COLUMN IF NOT EXISTS preferred boolean NOT NULL DEFAULT false;

-- Au plus un préféré par tenant (index partiel unique).
CREATE UNIQUE INDEX IF NOT EXISTS catalogue_taux_one_preferred
  ON catalogue_taux (tenant_id)
  WHERE preferred;
