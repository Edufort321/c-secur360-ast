-- 216 — Modèles d'export PDF unifiés. Le socle de marque est le style DGA/letterhead (commun à tous les
-- modules) ; seule la COULEUR D'ACCENT est personnalisable PAR MODULE. Stockée par tenant dans
-- company_settings.pdf_styles (JSONB) = { "modules": { "facture": { "accent": "#1f5fba" }, ... } }.
-- Idempotent + auto-enregistré.
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS pdf_styles JSONB NOT NULL DEFAULT '{}'::jsonb;

insert into schema_migrations (version) values ('216') on conflict (version) do nothing;
