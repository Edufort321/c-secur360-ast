-- 136 — Cascade client : distinguer SITE (adresse d'exécution, avec contacts) et ADRESSE DE
-- FACTURATION. On réutilise client_sites (133) avec une colonne `kind` : 'site' | 'billing'.
ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'site';
