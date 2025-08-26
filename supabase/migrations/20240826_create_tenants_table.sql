-- Migration pour créer la table tenants pour la gestion client par Eric
-- Date: 2024-08-26
-- Description: Table complète de gestion des tenants avec intégration Stripe

-- Create tenants table if not exists
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informations de base
    company_name VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Informations de contact
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    billing_email VARCHAR(255) NOT NULL,
    inventory_email VARCHAR(255),
    accident_email VARCHAR(255),
    
    -- Adresse
    address TEXT,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(10) NOT NULL,
    postal_code VARCHAR(10),
    
    -- Facturation et abonnement
    subscription_type VARCHAR(20) DEFAULT 'monthly' CHECK (subscription_type IN ('monthly', 'annual')),
    monthly_revenue DECIMAL(10,2) DEFAULT 250.00,
    stripe_customer_id VARCHAR(100),
    
    -- Statistiques d'usage
    total_users INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    
    -- Notes internes
    notes TEXT,
    
    -- Metadata
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_tenant_id ON tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_type ON tenants(subscription_type);
CREATE INDEX IF NOT EXISTS idx_tenants_billing_email ON tenants(billing_email);
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer_id ON tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Policy pour super admin (Eric) - accès complet
CREATE POLICY "Super admin full access" ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Policy pour lecture publique des stats agrégées (pour dashboards publics si nécessaire)
CREATE POLICY "Public aggregate stats" ON tenants
    FOR SELECT USING (true);

-- Insert some demo data
INSERT INTO tenants (
    company_name, tenant_id, status, billing_email, inventory_email, accident_email,
    subscription_type, monthly_revenue, contact_person, contact_phone,
    address, city, province, postal_code, stripe_customer_id, total_users, last_activity
) VALUES 
(
    'Construction ABC Inc.',
    'construction-abc',
    'active',
    'facturation@construction-abc.com',
    'inventaire@construction-abc.com',
    'securite@construction-abc.com',
    'annual',
    250.00,
    'Pierre Martin',
    '+1 (514) 555-0123',
    '123 Rue Principale',
    'Montréal',
    'QC',
    'H1A 1A1',
    'cus_construction_abc',
    15,
    '2024-08-26'
),
(
    'Sécurité Plus Ltée',
    'securite-plus',
    'active',
    'admin@securite-plus.ca',
    'materiel@securite-plus.ca',
    NULL,
    'monthly',
    180.00,
    'Sophie Tremblay',
    '+1 (418) 555-0456',
    '456 Boulevard Industriel',
    'Québec',
    'QC',
    'G1V 4H6',
    'cus_securite_plus',
    8,
    '2024-08-25'
),
(
    'TechnoMaint Solutions',
    'technomaint',
    'pending',
    'finance@technomaint.ca',
    NULL,
    NULL,
    'monthly',
    0.00,
    'Marc Dubois',
    '+1 (819) 555-0789',
    '789 Avenue Innovation',
    'Gatineau',
    'QC',
    'J8X 3X7',
    NULL,
    2,
    '2024-08-24'
),
(
    'Industries Nordiques',
    'nordiques-ind',
    'suspended',
    'comptabilite@nordiques.ca',
    NULL,
    NULL,
    'annual',
    300.00,
    'Julie Lapointe',
    '+1 (418) 555-0321',
    '321 Chemin du Nord',
    'Chicoutimi',
    'QC',
    'G7H 2N4',
    'cus_nordiques_ind',
    25,
    '2024-08-10'
) ON CONFLICT (tenant_id) DO NOTHING;

-- Create a view for financial stats
CREATE OR REPLACE VIEW tenant_financial_stats AS
SELECT 
    COUNT(*) as total_tenants,
    COUNT(*) FILTER (WHERE status = 'active') as active_tenants,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_tenants,
    COUNT(*) FILTER (WHERE status = 'suspended') as suspended_tenants,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_tenants,
    COALESCE(SUM(monthly_revenue) FILTER (WHERE status = 'active'), 0) as total_mrr,
    COALESCE(SUM(monthly_revenue * 12) FILTER (WHERE status = 'active'), 0) as total_arr,
    COALESCE(AVG(monthly_revenue) FILTER (WHERE status = 'active'), 0) as avg_monthly_revenue,
    COUNT(*) FILTER (WHERE subscription_type = 'monthly' AND status = 'active') as monthly_subscribers,
    COUNT(*) FILTER (WHERE subscription_type = 'annual' AND status = 'active') as annual_subscribers
FROM tenants;

-- Permissions pour la vue
GRANT SELECT ON tenant_financial_stats TO authenticated;
GRANT SELECT ON tenant_financial_stats TO anon;

-- Comment sur la table
COMMENT ON TABLE tenants IS 'Table de gestion des tenants/clients pour Eric admin panel';
COMMENT ON COLUMN tenants.tenant_id IS 'Identifiant unique utilisé dans l''URL (ex: construction-abc.csecur360.ca)';
COMMENT ON COLUMN tenants.billing_email IS 'Email pour factures et notifications financières';
COMMENT ON COLUMN tenants.inventory_email IS 'Email pour notifications d''inventaire';
COMMENT ON COLUMN tenants.accident_email IS 'Email pour notifications d''urgence/sécurité';
COMMENT ON COLUMN tenants.monthly_revenue IS 'Revenu mensuel récurrent de ce client';
COMMENT ON COLUMN tenants.stripe_customer_id IS 'ID client Stripe pour facturation automatique';

-- Log pour migration
INSERT INTO system_logs (log_level, component, message, metadata) 
VALUES (
    'INFO', 
    'MIGRATION', 
    'Created tenants table and financial stats view',
    jsonb_build_object(
        'migration', '20240826_create_tenants_table.sql',
        'tables_created', ARRAY['tenants'],
        'views_created', ARRAY['tenant_financial_stats'],
        'demo_records', 4
    )
) ON CONFLICT DO NOTHING;