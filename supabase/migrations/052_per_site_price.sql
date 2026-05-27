-- Migration 052 : prix par site supplementaire dans billing_config
ALTER TABLE billing_config
  ADD COLUMN IF NOT EXISTS per_site_monthly NUMERIC(10,2) DEFAULT 50;

-- Insere la ligne par defaut si elle n'existe pas
INSERT INTO billing_config (id, per_site_monthly)
VALUES ('default', 50)
ON CONFLICT (id) DO NOTHING;
