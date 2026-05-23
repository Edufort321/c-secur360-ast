-- =====================================================
-- MIGRATION 014 — Rattrapage des colonnes (idempotent)
-- À exécuter dans le SQL editor si tu as exécuté des versions antérieures de 012/013.
-- Ajoute toutes les colonnes nécessaires en une fois.
-- =====================================================

-- tenant_subscriptions : facturable
ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS billable BOOLEAN DEFAULT TRUE;

-- tenants : profil + ERP
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_provider TEXT DEFAULT 'commerce_cerdia';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS erp_provider TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS erp_base_url TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS erp_company_id TEXT;

-- CERDIA : domaine officiel si vide
UPDATE tenants SET domain = 'cerdia.ai' WHERE id = 'cerdia' AND (domain IS NULL OR domain = '');
