-- 123 — DGA : inspections de routine du transformateur (checklist Conforme/Anomalie/N/A par
-- catégorie + champs mesures + aide technique IA). Colonne séparée (chargée hors liste).
ALTER TABLE dga_dossiers ADD COLUMN IF NOT EXISTS inspections JSONB DEFAULT '[]'::jsonb;
