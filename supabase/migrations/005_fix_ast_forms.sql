-- ===============================================
-- MIGRATION 005 - CORRIGER AST_FORMS + FINALISER
-- ===============================================

-- 1. AJOUTER TENANT_ID À AST_FORMS
ALTER TABLE ast_forms ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(255);

-- 2. CRÉER TABLES MANQUANTES SI ELLES N'EXISTENT PAS
CREATE TABLE IF NOT EXISTS entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  features JSONB DEFAULT '{
    "ast_creation": true,
    "multi_sites": false,
    "advanced_reports": false,
    "api_access": false,
    "priority_support": false,
    "max_users": 5,
    "max_asts_per_month": 100
  }'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  suspended_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  target_id UUID,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_adjustments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  adjustment_date DATE NOT NULL,
  adjustment_percentage DECIMAL(5,2) NOT NULL DEFAULT 3.5,
  previous_monthly_price INTEGER NOT NULL,
  previous_annual_price INTEGER NOT NULL,
  previous_additional_site_price INTEGER NOT NULL,
  new_monthly_price INTEGER NOT NULL,
  new_annual_price INTEGER NOT NULL,
  new_additional_site_price INTEGER NOT NULL,
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  applied_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  monthly_price INTEGER NOT NULL DEFAULT 4900,
  annual_price INTEGER NOT NULL DEFAULT 49000,
  additional_site_price INTEGER NOT NULL DEFAULT 60000,
  auto_adjustment_enabled BOOLEAN DEFAULT TRUE,
  adjustment_percentage DECIMAL(5,2) DEFAULT 3.5,
  next_adjustment_date DATE,
  effective_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(effective_date)
);

-- 3. ACTIVER RLS
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_config ENABLE ROW LEVEL SECURITY;

-- 4. POLITIQUES RLS POUR AST_FORMS (MAINTENANT QUE TENANT_ID EXISTE)
DROP POLICY IF EXISTS "ast_forms_tenant_access" ON ast_forms;
CREATE POLICY "ast_forms_tenant_access" ON ast_forms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.tenant_id = ast_forms.tenant_id
    )
  );

-- 5. POLITIQUES RLS POUR LES NOUVELLES TABLES
DROP POLICY IF EXISTS "entitlements_admin_only" ON entitlements;
CREATE POLICY "entitlements_admin_only" ON entitlements
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "audit_logs_admin_only" ON audit_logs;
CREATE POLICY "audit_logs_admin_only" ON audit_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "price_config_admin_write" ON price_config;
CREATE POLICY "price_config_admin_write" ON price_config
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "price_config_public_read" ON price_config;
CREATE POLICY "price_config_public_read" ON price_config
  FOR SELECT USING (effective_date <= CURRENT_DATE);

-- 6. FONCTIONS UTILITAIRES
CREATE OR REPLACE FUNCTION get_current_pricing()
RETURNS TABLE(
  monthly_price_cents INTEGER,
  annual_price_cents INTEGER,
  additional_site_price_cents INTEGER,
  monthly_price_cad DECIMAL,
  annual_price_cad DECIMAL,
  additional_site_price_cad DECIMAL,
  effective_date DATE,
  next_adjustment_date DATE,
  auto_adjustment_enabled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.monthly_price,
    pc.annual_price,
    pc.additional_site_price,
    pc.monthly_price / 100.0 as monthly_price_cad,
    pc.annual_price / 100.0 as annual_price_cad,
    pc.additional_site_price / 100.0 as additional_site_price_cad,
    pc.effective_date,
    pc.next_adjustment_date,
    pc.auto_adjustment_enabled
  FROM price_config pc
  ORDER BY pc.effective_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 7. DONNÉES INITIALES
INSERT INTO price_config (
  monthly_price,
  annual_price,
  additional_site_price,
  auto_adjustment_enabled,
  adjustment_percentage,
  next_adjustment_date,
  effective_date
) VALUES (
  4900,  -- 49$ CAD
  49000, -- 490$ CAD  
  60000, -- 600$ CAD
  TRUE,
  3.5,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE
) ON CONFLICT (effective_date) DO NOTHING;

-- Client admin avec entitlements
INSERT INTO entitlements (
  customer_id,
  features,
  is_active
) 
SELECT 
  c.id,
  '{
    "ast_creation": true,
    "multi_sites": true,
    "advanced_reports": true,
    "api_access": true,
    "priority_support": true,
    "max_users": 999,
    "max_asts_per_month": 9999
  }'::jsonb,
  TRUE
FROM customers c 
WHERE c.email = 'eric.dufort@cerdia.ai'
ON CONFLICT (customer_id) DO NOTHING;

-- Mettre à jour le profil admin
UPDATE profiles SET 
  tenant_id = 'cerdia-admin',
  role = 'admin',
  company_name = 'CERDIA',
  province = 'QC'
WHERE email = 'eric.dufort@cerdia.ai';