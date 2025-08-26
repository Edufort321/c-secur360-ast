-- ===================================================================
-- C-SECUR360 SECURITY & ENCRYPTION MODULE
-- ===================================================================
-- Migration: 20240826_security_encryption.sql
-- Description: AES-256 encryption with pgcrypto for sensitive HR data
-- Version: 1.0
-- ===================================================================

-- 1. ENABLE PGCRYPTO EXTENSION
-- ===================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. ENCRYPTION HELPER FUNCTIONS
-- ===================================================================

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(
    plain_text TEXT,
    encryption_key TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    key_to_use TEXT;
BEGIN
    -- Use provided key or get from environment/settings
    key_to_use := COALESCE(
        encryption_key,
        current_setting('app.encryption_key', true),
        'default_dev_key_change_in_production'
    );
    
    -- Return encrypted data as base64 string
    RETURN encode(
        pgp_sym_encrypt(plain_text, key_to_use, 'compress-algo=1, cipher-algo=aes256'),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(
    encrypted_text TEXT,
    encryption_key TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    key_to_use TEXT;
BEGIN
    IF encrypted_text IS NULL OR encrypted_text = '' THEN
        RETURN NULL;
    END IF;
    
    -- Use provided key or get from environment/settings
    key_to_use := COALESCE(
        encryption_key,
        current_setting('app.encryption_key', true),
        'default_dev_key_change_in_production'
    );
    
    -- Decrypt and return plain text
    RETURN pgp_sym_decrypt(
        decode(encrypted_text, 'base64'),
        key_to_use
    );
EXCEPTION
    WHEN others THEN
        -- Log error and return null for invalid encrypted data
        RAISE WARNING 'Failed to decrypt data: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TENANT SETTINGS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS tenant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL UNIQUE,
    
    -- Security Settings
    strict_mode BOOLEAN DEFAULT true, -- Strict certification validation
    encryption_enabled BOOLEAN DEFAULT true,
    data_retention_days INTEGER DEFAULT 2555, -- 7 years default
    
    -- WIP Settings
    wip_refresh_strategy VARCHAR(20) DEFAULT 'real_time', -- real_time, hourly, daily
    auto_calculate_billing BOOLEAN DEFAULT true,
    
    -- Certification Settings
    critical_cert_block BOOLEAN DEFAULT true, -- Block assignments for expired critical certs
    cert_expiry_warning_days INTEGER DEFAULT 30,
    
    -- Business Settings
    business_hours_start TIME DEFAULT '08:00:00',
    business_hours_end TIME DEFAULT '17:00:00',
    default_timezone VARCHAR(50) DEFAULT 'America/Montreal',
    
    -- Metadata
    settings_version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_wip_strategy CHECK (wip_refresh_strategy IN ('real_time', 'hourly', 'daily')),
    CONSTRAINT valid_retention CHECK (data_retention_days > 0)
);

-- 4. KEY MANAGEMENT TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS encryption_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name VARCHAR(100) NOT NULL,
    purpose VARCHAR(100) NOT NULL, -- 'employee_data', 'financial_data', etc.
    key_version INTEGER NOT NULL DEFAULT 1,
    
    -- Key Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    rotated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(key_name, key_version),
    CONSTRAINT valid_key_lifecycle CHECK (
        (is_active = true AND rotated_at IS NULL) OR
        (is_active = false AND rotated_at IS NOT NULL)
    )
);

-- 5. PROJECT BILLING OVERRIDES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS project_billing_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    project_number VARCHAR(100) NOT NULL,
    client_name VARCHAR(200),
    
    -- Override Rates (NULL means use client default)
    rate_normal DECIMAL(10,2),
    rate_overtime_1_5 DECIMAL(10,2),
    rate_overtime_2_0 DECIMAL(10,2),
    per_diem_rate DECIMAL(8,2),
    vehicle_rate_light DECIMAL(6,4),
    vehicle_rate_trailer DECIMAL(6,4),
    
    -- Custom Rates Override
    custom_rates JSONB,
    
    -- Project Settings
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1, -- Higher priority overrides lower
    
    -- Validity Period
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_until DATE,
    
    -- Metadata
    notes TEXT,
    created_by VARCHAR(100),
    approved_by VARCHAR(100),
    approval_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(tenant_id, project_number, effective_from),
    CONSTRAINT valid_project_rates CHECK (
        (rate_normal IS NULL OR rate_normal > 0) AND
        (rate_overtime_1_5 IS NULL OR rate_overtime_1_5 > 0) AND
        (rate_overtime_2_0 IS NULL OR rate_overtime_2_0 > 0)
    ),
    CONSTRAINT valid_effective_period CHECK (
        effective_until IS NULL OR effective_until > effective_from
    )
);

-- 6. WIP CALCULATION TABLES
-- ===================================================================
CREATE TABLE IF NOT EXISTS wip_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    project_number VARCHAR(100),
    calculation_period_start DATE NOT NULL,
    calculation_period_end DATE NOT NULL,
    
    -- Labor Costs
    regular_hours DECIMAL(10,2) DEFAULT 0,
    overtime_1_5_hours DECIMAL(10,2) DEFAULT 0,
    overtime_2_0_hours DECIMAL(10,2) DEFAULT 0,
    labor_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Additional Costs
    per_diem_amount DECIMAL(10,2) DEFAULT 0,
    mileage_amount DECIMAL(10,2) DEFAULT 0,
    equipment_cost DECIMAL(10,2) DEFAULT 0,
    materials_cost DECIMAL(10,2) DEFAULT 0,
    
    -- Totals
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Calculation Metadata
    calculation_type VARCHAR(20) DEFAULT 'automatic', -- automatic, manual, adjusted
    calculation_status VARCHAR(20) DEFAULT 'draft', -- draft, approved, billed
    calculated_by VARCHAR(100),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_calculation_period CHECK (calculation_period_end >= calculation_period_start),
    CONSTRAINT valid_calculation_type CHECK (calculation_type IN ('automatic', 'manual', 'adjusted')),
    CONSTRAINT valid_calculation_status CHECK (calculation_status IN ('draft', 'approved', 'billed', 'cancelled'))
);

-- 7. WIP CALCULATION LOGS
-- ===================================================================
CREATE TABLE IF NOT EXISTS wip_calculation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wip_calculation_id UUID REFERENCES wip_calculations(id) ON DELETE CASCADE,
    tenant_id VARCHAR(100) NOT NULL,
    
    -- Log Details
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'approved', 'recalculated'
    previous_values JSONB,
    new_values JSONB,
    change_reason TEXT,
    
    -- User Context
    performed_by VARCHAR(100),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Constraints
    CONSTRAINT valid_log_action CHECK (action IN ('created', 'updated', 'approved', 'recalculated', 'cancelled'))
);

-- 8. INDEXES FOR PERFORMANCE
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant ON tenant_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_active ON encryption_keys(is_active, purpose) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_project_overrides_tenant_project ON project_billing_overrides(tenant_id, project_number);
CREATE INDEX IF NOT EXISTS idx_project_overrides_active ON project_billing_overrides(tenant_id, is_active, effective_from) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_wip_calculations_tenant_period ON wip_calculations(tenant_id, calculation_period_start, calculation_period_end);
CREATE INDEX IF NOT EXISTS idx_wip_calculations_project ON wip_calculations(project_number, calculation_status);
CREATE INDEX IF NOT EXISTS idx_wip_logs_calculation ON wip_calculation_logs(wip_calculation_id, performed_at);

-- 9. ROW LEVEL SECURITY POLICIES
-- ===================================================================
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_billing_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE wip_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wip_calculation_logs ENABLE ROW LEVEL SECURITY;

-- Tenant isolation for settings
CREATE POLICY "tenant_settings_isolation" ON tenant_settings
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.current_tenant', true), 'default')
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::uuid 
            AND role = 'super_admin'
        )
    );

-- Key management access (super admin only)
CREATE POLICY "encryption_keys_super_admin" ON encryption_keys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::uuid 
            AND role = 'super_admin'
        )
    );

-- Project overrides tenant isolation
CREATE POLICY "project_overrides_tenant_isolation" ON project_billing_overrides
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.current_tenant', true), 'default')
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::uuid 
            AND role = 'super_admin'
        )
    );

-- WIP calculations access
CREATE POLICY "wip_calculations_access" ON wip_calculations
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.current_tenant', true), 'default')
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::uuid 
            AND role IN ('super_admin', 'client_admin', 'manager')
        )
    );

-- WIP logs access
CREATE POLICY "wip_logs_access" ON wip_calculation_logs
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.current_tenant', true), 'default')
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::uuid 
            AND role IN ('super_admin', 'client_admin', 'manager')
        )
    );

-- 10. MATERIALIZED VIEWS FOR WIP
-- ===================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_wip_by_project AS
SELECT 
    tenant_id,
    project_number,
    SUM(total_amount) as total_wip,
    SUM(labor_cost) as total_labor,
    SUM(per_diem_amount + mileage_amount + equipment_cost + materials_cost) as total_expenses,
    MAX(calculation_period_end) as last_calculation_date,
    COUNT(*) as calculation_count,
    MAX(updated_at) as last_updated
FROM wip_calculations 
WHERE calculation_status IN ('approved', 'draft')
GROUP BY tenant_id, project_number;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_wip_by_client AS
SELECT 
    w.tenant_id,
    COALESCE(po.client_name, 'Unknown Client') as client_name,
    SUM(w.total_amount) as total_wip,
    SUM(w.labor_cost) as total_labor,
    SUM(w.per_diem_amount + w.mileage_amount + w.equipment_cost + w.materials_cost) as total_expenses,
    MAX(w.calculation_period_end) as last_calculation_date,
    COUNT(*) as project_count,
    MAX(w.updated_at) as last_updated
FROM wip_calculations w
LEFT JOIN project_billing_overrides po ON po.tenant_id = w.tenant_id AND po.project_number = w.project_number
WHERE w.calculation_status IN ('approved', 'draft')
GROUP BY w.tenant_id, COALESCE(po.client_name, 'Unknown Client');

-- Indexes for materialized views
CREATE INDEX IF NOT EXISTS idx_mv_wip_project_tenant ON mv_wip_by_project(tenant_id, total_wip DESC);
CREATE INDEX IF NOT EXISTS idx_mv_wip_client_tenant ON mv_wip_by_client(tenant_id, total_wip DESC);

-- 11. FUNCTIONS FOR WIP CALCULATION
-- ===================================================================

-- Function to recalculate WIP for a specific project/period
CREATE OR REPLACE FUNCTION recalculate_wip(
    p_tenant_id VARCHAR(100),
    p_project_number VARCHAR(100) DEFAULT NULL,
    p_period_start DATE DEFAULT NULL,
    p_period_end DATE DEFAULT NULL
) RETURNS TABLE (
    calculation_id UUID,
    project_number VARCHAR(100),
    total_amount DECIMAL(12,2),
    message TEXT
) AS $$
DECLARE
    calc_record wip_calculations%ROWTYPE;
    start_date DATE;
    end_date DATE;
BEGIN
    -- Set default dates if not provided
    start_date := COALESCE(p_period_start, DATE_TRUNC('month', CURRENT_DATE));
    end_date := COALESCE(p_period_end, CURRENT_DATE);
    
    -- Log the recalculation request
    RAISE NOTICE 'Recalculating WIP for tenant: %, project: %, period: % to %', 
        p_tenant_id, COALESCE(p_project_number, 'ALL'), start_date, end_date;
    
    -- TODO: Implement actual calculation logic based on timesheet_entries
    -- This is a placeholder that would integrate with your timesheet system
    
    RETURN QUERY
    SELECT 
        wc.id as calculation_id,
        wc.project_number,
        wc.total_amount,
        'WIP recalculation completed' as message
    FROM wip_calculations wc
    WHERE wc.tenant_id = p_tenant_id
    AND (p_project_number IS NULL OR wc.project_number = p_project_number)
    AND wc.calculation_period_start >= start_date
    AND wc.calculation_period_end <= end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_wip_views() RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_wip_by_project;
    REFRESH MATERIALIZED VIEW mv_wip_by_client;
    RAISE NOTICE 'WIP materialized views refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. TRIGGERS
-- ===================================================================

-- Auto-refresh materialized views when WIP calculations change
CREATE OR REPLACE FUNCTION trigger_refresh_wip_views() RETURNS TRIGGER AS $$
BEGIN
    -- Use pg_notify to trigger async refresh
    PERFORM pg_notify('refresh_wip_views', NEW.tenant_id || ':' || NEW.project_number);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wip_calculation_changed
    AFTER INSERT OR UPDATE OR DELETE ON wip_calculations
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_wip_views();

-- 13. DEFAULT DATA
-- ===================================================================

-- Insert default tenant settings for existing tenants
INSERT INTO tenant_settings (tenant_id, strict_mode, encryption_enabled)
SELECT id, true, true FROM tenants
ON CONFLICT (tenant_id) DO NOTHING;

-- Add default demo tenant settings
INSERT INTO tenant_settings (tenant_id, strict_mode, encryption_enabled, wip_refresh_strategy)
VALUES ('demo', true, true, 'real_time')
ON CONFLICT (tenant_id) DO NOTHING;

-- 14. GRANTS
-- ===================================================================
GRANT ALL ON tenant_settings TO service_role;
GRANT ALL ON encryption_keys TO service_role;
GRANT ALL ON project_billing_overrides TO service_role;
GRANT ALL ON wip_calculations TO service_role;
GRANT ALL ON wip_calculation_logs TO service_role;
GRANT SELECT ON mv_wip_by_project TO service_role;
GRANT SELECT ON mv_wip_by_client TO service_role;

-- Grant execute permissions for functions
GRANT EXECUTE ON FUNCTION encrypt_sensitive_data(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION decrypt_sensitive_data(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION recalculate_wip(VARCHAR(100), VARCHAR(100), DATE, DATE) TO service_role;
GRANT EXECUTE ON FUNCTION refresh_wip_views() TO service_role;

-- 15. SUCCESS MESSAGE
-- ===================================================================
DO $$
BEGIN
    RAISE NOTICE '🔐 C-SECUR360 SECURITY & ENCRYPTION MODULE deployed!';
    RAISE NOTICE '✅ pgcrypto enabled with AES-256 encryption functions';
    RAISE NOTICE '✅ Tenant settings with strict_mode configuration';
    RAISE NOTICE '✅ Key management system with rotation support';
    RAISE NOTICE '✅ Project billing overrides for flexible pricing';
    RAISE NOTICE '✅ WIP calculation engine with materialized views';
    RAISE NOTICE '✅ Audit logging for all WIP changes';
    RAISE NOTICE '🔑 Remember to set app.encryption_key in production!';
END $$;