-- 121 — DGA : rapport d'anomalie. Liste d'anomalies/recommandations par transformateur
-- (type, statut à corriger/corrigé, archivé, photos custom). Colonne séparée (hors liste).
ALTER TABLE dga_dossiers ADD COLUMN IF NOT EXISTS anomalies JSONB DEFAULT '[]'::jsonb;
