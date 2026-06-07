-- 137 — Adresse de FACTURATION PAR SITE (elle peut différer d'un site à l'autre).
-- Chaque site (client_sites, 133) porte son adresse d'exécution ET, optionnellement, son adresse
-- de facturation. Les contacts restent rattachés au site (client_contacts).
ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS billing_address     TEXT NOT NULL DEFAULT '';
ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS billing_city        TEXT NOT NULL DEFAULT '';
ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS billing_province    TEXT NOT NULL DEFAULT '';
ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS billing_postal_code TEXT NOT NULL DEFAULT '';
