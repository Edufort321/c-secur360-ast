-- 122 — DGA : documents du transformateur (documentation technique + rapports d'essais),
-- chaque entrée = PDF importé (base64) OU hyperlien. Colonne séparée (chargée hors liste).
ALTER TABLE dga_dossiers ADD COLUMN IF NOT EXISTS docs JSONB DEFAULT '[]'::jsonb;
