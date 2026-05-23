-- =====================================================
-- MIGRATION 013 — Profil tenant : domaine personnalisé + courriel de facturation
-- Idempotent.
-- =====================================================

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_provider TEXT DEFAULT 'commerce_cerdia';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
-- Connexion ERP (config non-secrète ; les secrets/API key seront gérés côté serveur chiffré)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS erp_provider TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS erp_base_url TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS erp_company_id TEXT;

-- CERDIA : domaine officiel
UPDATE tenants SET domain = 'cerdia.ai' WHERE id = 'cerdia' AND (domain IS NULL OR domain = '');
