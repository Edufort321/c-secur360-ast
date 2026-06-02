-- 105 — Catalogue de taux : barèmes additionnels libres (libellé + taux), par catalogue.
ALTER TABLE catalogue_taux ADD COLUMN IF NOT EXISTS custom_rates jsonb NOT NULL DEFAULT '[]'::jsonb;
