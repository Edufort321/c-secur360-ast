-- 120 — DGA : photos du transformateur (base64 compressé, comme le prototype dga-oil-app).
-- Colonne séparée pour ne PAS alourdir la liste (listDossiers ne la sélectionne pas).
ALTER TABLE dga_dossiers ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
