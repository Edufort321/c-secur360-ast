-- 118 — DGA : téléphone du client sur le dossier (coordonnées client, exclues du rapport).
ALTER TABLE dga_dossiers ADD COLUMN IF NOT EXISTS phone TEXT;
