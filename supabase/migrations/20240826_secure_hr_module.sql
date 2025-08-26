-- ===================================================================
-- C-SECUR360 SECURE HR MODULE
-- ===================================================================
-- Migration: 20240826_secure_hr_module.sql
-- Description: Secure HR module with minimal data storage and billing integration
-- Version: 1.0
-- ===================================================================

-- 1. SECURE EMPLOYEES TABLE (Minimal Data)
-- ===================================================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    -- Basic Identity (Minimal Required Data)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    employee_number VARCHAR(50), -- Optional internal employee number
    
    -- Contact Information (Encrypted)
    phone_number TEXT, -- AES-256 encrypted
    emergency_contact_name TEXT, -- AES-256 encrypted
    emergency_contact_phone TEXT, -- AES-256 encrypted
    
    -- Role and Status
    role VARCHAR(50) DEFAULT 'worker', -- worker, supervisor, manager, admin
    employment_status VARCHAR(50) DEFAULT 'active', -- active, inactive, terminated
    department VARCHAR(100),
    position VARCHAR(100),
    
    -- Safety Certifications (JSON) - Structured and versionable
    certifications JSONB DEFAULT '{
        "permis_conduire": {
            "valid": false, 
            "expiry": null,
            "issuer": null,
            "doc_id": null,
            "last_verified_at": null,
            "critical": false
        },
        "chariot_elevateur": {
            "valid": false, 
            "expiry": null,
            "issuer": "CNESST",
            "doc_id": null,
            "last_verified_at": null,
            "critical": true
        },
        "travail_hauteur": {
            "valid": false, 
            "expiry": null,
            "issuer": "CNESST",
            "doc_id": null,
            "last_verified_at": null,
            "critical": true
        },
        "premiers_secours": {
            "valid": false, 
            "expiry": null,
            "issuer": null,
            "doc_id": null,
            "last_verified_at": null,
            "critical": false
        },
        "manipulation_substances": {
            "valid": false, 
            "expiry": null,
            "issuer": "CNESST",
            "doc_id": null,
            "last_verified_at": null,
            "critical": true
        },
        "_meta": {
            "schema_version": 1,
            "last_updated": null
        }
    }'::jsonb,
    
    -- Vehicle Assignment (Optional)
    assigned_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    
    -- Timestamps
    hire_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(tenant_id, employee_number),
    CONSTRAINT valid_employment_status CHECK (employment_status IN ('active', 'inactive', 'terminated')),
    CONSTRAINT valid_role CHECK (role IN ('worker', 'supervisor', 'manager', 'admin'))
);

-- 2. EMPLOYEE SAFETY RECORDS (SST Tracking)
-- ===================================================================
CREATE TABLE IF NOT EXISTS employee_safety_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- AST Participation
    ast_filled INTEGER DEFAULT 0, -- Number of AST forms filled
    ast_participated INTEGER DEFAULT 0, -- Number of AST participations
    last_ast_date DATE,
    
    -- Safety Performance
    incidents INTEGER DEFAULT 0, -- Safety incidents count
    near_misses INTEGER DEFAULT 0, -- Near miss reports
    safety_score DECIMAL(5,2) DEFAULT 85.00, -- Out of 100
    
    -- Training Records
    training_completed JSONB DEFAULT '[]'::jsonb, -- Array of completed training
    certifications_expiring JSONB DEFAULT '[]'::jsonb, -- Certifications expiring soon
    
    -- Performance Metrics
    punctuality_score DECIMAL(5,2) DEFAULT 85.00, -- Out of 100
    tools_checkouts INTEGER DEFAULT 0,
    tools_returns INTEGER DEFAULT 0,
    equipment_damage_reports INTEGER DEFAULT 0,
    
    -- Timestamps
    last_evaluation_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_scores CHECK (
        safety_score >= 0 AND safety_score <= 100 AND
        punctuality_score >= 0 AND punctuality_score <= 100
    ),
    
    UNIQUE(employee_id) -- One record per employee
);

-- 3. CLIENT BILLING PROFILES (Tenant-level Billing Rates)
-- ===================================================================
CREATE TABLE IF NOT EXISTS client_billing_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL UNIQUE,
    
    -- Standard Rates (CAD per hour)
    rate_normal DECIMAL(10,2) NOT NULL DEFAULT 140.00, -- Regular time
    rate_overtime_1_5 DECIMAL(10,2) NOT NULL DEFAULT 210.00, -- 1.5x overtime
    rate_overtime_2_0 DECIMAL(10,2) NOT NULL DEFAULT 280.00, -- 2.0x overtime
    
    -- Per Diem and Travel
    per_diem_rate DECIMAL(8,2) DEFAULT 75.00, -- Daily allowance
    vehicle_rate_light DECIMAL(6,4) DEFAULT 0.68, -- Per km light vehicle
    vehicle_rate_trailer DECIMAL(6,4) DEFAULT 0.72, -- Per km with trailer
    
    -- Custom Rates (JSON for flexibility)
    custom_rates JSONB DEFAULT '{
        "supervision": 160.00,
        "emergency_call": 200.00,
        "specialized_equipment": 180.00,
        "weekend_premium": 1.25,
        "holiday_premium": 2.00
    }'::jsonb,
    
    -- Billing Configuration
    currency VARCHAR(3) DEFAULT 'CAD',
    tax_rate DECIMAL(5,4) DEFAULT 0.14975, -- Combined tax rate (TPS+TVQ Quebec)
    rounding_minutes INTEGER DEFAULT 15, -- Time rounding to nearest X minutes
    minimum_billable_hours DECIMAL(4,2) DEFAULT 0.25, -- Minimum charge (15 minutes)
    
    -- Invoice Settings
    payment_terms_days INTEGER DEFAULT 30,
    invoice_prefix VARCHAR(10) DEFAULT 'CSR',
    
    -- Timestamps
    effective_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_rates CHECK (
        rate_normal > 0 AND rate_overtime_1_5 > 0 AND rate_overtime_2_0 > 0
    )
);

-- 4. INDEXES FOR PERFORMANCE
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_certifications ON employees USING GIN (certifications);

CREATE INDEX IF NOT EXISTS idx_safety_records_employee ON employee_safety_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_safety_records_evaluation ON employee_safety_records(last_evaluation_date);
CREATE INDEX IF NOT EXISTS idx_safety_records_scores ON employee_safety_records(safety_score, punctuality_score);

CREATE INDEX IF NOT EXISTS idx_billing_profiles_tenant ON client_billing_profiles(tenant_id);

-- 5. ROW LEVEL SECURITY (RLS)
-- ===================================================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_safety_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_billing_profiles ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY "employees_tenant_isolation" ON employees
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.current_tenant', true), 'default')
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::uuid 
            AND role = 'super_admin'
        )
    );

CREATE POLICY "safety_records_access" ON employee_safety_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE employees.id = employee_safety_records.employee_id
            AND employees.tenant_id = COALESCE(current_setting('app.current_tenant', true), 'default')
        )
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::uuid 
            AND role = 'super_admin'
        )
    );

CREATE POLICY "billing_profiles_tenant_isolation" ON client_billing_profiles
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.current_tenant', true), 'default')
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::uuid 
            AND role = 'super_admin'
        )
    );

-- Admin and manager access policies
CREATE POLICY "hr_admin_access" ON employees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::uuid 
            AND role IN ('super_admin', 'client_admin', 'manager')
            AND (role = 'super_admin' OR tenant_id = employees.tenant_id)
        )
    );

-- 6. FUNCTIONS AND TRIGGERS
-- ===================================================================

-- Function to update employee safety scores
CREATE OR REPLACE FUNCTION update_employee_safety_score(
    p_employee_id UUID,
    p_incident_change INTEGER DEFAULT 0,
    p_ast_participation INTEGER DEFAULT 0
) RETURNS VOID AS $$
DECLARE
    current_record employee_safety_records%ROWTYPE;
    new_safety_score DECIMAL(5,2);
BEGIN
    -- Get current safety record
    SELECT * INTO current_record 
    FROM employee_safety_records 
    WHERE employee_id = p_employee_id;
    
    IF NOT FOUND THEN
        -- Create initial record
        INSERT INTO employee_safety_records (employee_id, ast_participated, incidents)
        VALUES (p_employee_id, GREATEST(p_ast_participation, 0), GREATEST(p_incident_change, 0));
        RETURN;
    END IF;
    
    -- Calculate new safety score
    new_safety_score := GREATEST(0, LEAST(100, 
        85.0 -- Base score
        + (current_record.ast_participated + p_ast_participation) * 2.0 -- +2 per AST
        - (current_record.incidents + GREATEST(p_incident_change, 0)) * 5.0 -- -5 per incident
    ));
    
    -- Update record
    UPDATE employee_safety_records 
    SET 
        incidents = incidents + GREATEST(p_incident_change, 0),
        ast_participated = ast_participated + GREATEST(p_ast_participation, 0),
        safety_score = new_safety_score,
        last_evaluation_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE employee_id = p_employee_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check certification validity with critical flag support
CREATE OR REPLACE FUNCTION check_certification_validity(
    p_employee_id UUID,
    p_certification_type VARCHAR(100)
) RETURNS TABLE (
    is_valid BOOLEAN,
    is_critical BOOLEAN,
    expires_in_days INTEGER,
    expiry_date DATE
) AS $$
DECLARE
    cert_data JSONB;
    cert_expiry DATE;
    cert_critical BOOLEAN;
    days_until_expiry INTEGER;
BEGIN
    SELECT certifications->p_certification_type INTO cert_data
    FROM employees 
    WHERE id = p_employee_id;
    
    IF cert_data IS NULL THEN
        RETURN QUERY SELECT FALSE, FALSE, NULL::INTEGER, NULL::DATE;
        RETURN;
    END IF;
    
    -- Extract certification properties
    cert_critical := COALESCE((cert_data->>'critical')::BOOLEAN, FALSE);
    
    -- Check if certification is marked as valid
    IF NOT COALESCE((cert_data->>'valid')::BOOLEAN, FALSE) THEN
        RETURN QUERY SELECT FALSE, cert_critical, NULL::INTEGER, NULL::DATE;
        RETURN;
    END IF;
    
    -- Check expiry date if present
    IF cert_data->>'expiry' IS NOT NULL THEN
        cert_expiry := (cert_data->>'expiry')::DATE;
        days_until_expiry := cert_expiry - CURRENT_DATE;
        
        RETURN QUERY SELECT 
            (cert_expiry >= CURRENT_DATE) as is_valid,
            cert_critical,
            days_until_expiry,
            cert_expiry;
    ELSE
        -- No expiry date means perpetual validity if marked valid
        RETURN QUERY SELECT TRUE, cert_critical, NULL::INTEGER, NULL::DATE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get all expiring certifications for an employee
CREATE OR REPLACE FUNCTION get_expiring_certifications(
    p_employee_id UUID,
    p_warning_days INTEGER DEFAULT 30
) RETURNS TABLE (
    certification_type VARCHAR(100),
    expiry_date DATE,
    days_until_expiry INTEGER,
    is_critical BOOLEAN,
    is_expired BOOLEAN
) AS $$
DECLARE
    cert_key TEXT;
    cert_data JSONB;
    employee_certs JSONB;
BEGIN
    SELECT certifications INTO employee_certs
    FROM employees 
    WHERE id = p_employee_id;
    
    IF employee_certs IS NULL THEN
        RETURN;
    END IF;
    
    -- Iterate through all certifications
    FOR cert_key IN SELECT jsonb_object_keys(employee_certs) 
    WHERE jsonb_object_keys(employee_certs) != '_meta'
    LOOP
        cert_data := employee_certs->cert_key;
        
        -- Only process valid certifications with expiry dates
        IF COALESCE((cert_data->>'valid')::BOOLEAN, FALSE) 
           AND cert_data->>'expiry' IS NOT NULL THEN
            
            RETURN QUERY SELECT 
                cert_key as certification_type,
                (cert_data->>'expiry')::DATE as expiry_date,
                ((cert_data->>'expiry')::DATE - CURRENT_DATE) as days_until_expiry,
                COALESCE((cert_data->>'critical')::BOOLEAN, FALSE) as is_critical,
                ((cert_data->>'expiry')::DATE < CURRENT_DATE) as is_expired
            WHERE (cert_data->>'expiry')::DATE - CURRENT_DATE <= p_warning_days;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check if employee can be assigned to AST work
CREATE OR REPLACE FUNCTION can_assign_to_ast(
    p_employee_id UUID,
    p_required_certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    p_strict_mode BOOLEAN DEFAULT NULL
) RETURNS TABLE (
    can_assign BOOLEAN,
    blocking_certifications TEXT[],
    warning_certifications TEXT[],
    message TEXT
) AS $$
DECLARE
    employee_certs JSONB;
    tenant_strict_mode BOOLEAN;
    employee_tenant_id VARCHAR(100);
    cert_type TEXT;
    cert_validity RECORD;
    blocking_list TEXT[] := ARRAY[]::TEXT[];
    warning_list TEXT[] := ARRAY[]::TEXT[];
    final_can_assign BOOLEAN := TRUE;
BEGIN
    -- Get employee and tenant info
    SELECT certifications, tenant_id INTO employee_certs, employee_tenant_id
    FROM employees 
    WHERE id = p_employee_id;
    
    IF employee_certs IS NULL THEN
        RETURN QUERY SELECT FALSE, ARRAY['employee_not_found'], ARRAY[]::TEXT[], 'Employee not found';
        RETURN;
    END IF;
    
    -- Get strict mode setting for tenant
    IF p_strict_mode IS NULL THEN
        SELECT strict_mode INTO tenant_strict_mode
        FROM tenant_settings 
        WHERE tenant_id = employee_tenant_id;
        tenant_strict_mode := COALESCE(tenant_strict_mode, TRUE);
    ELSE
        tenant_strict_mode := p_strict_mode;
    END IF;
    
    -- Check required certifications
    FOREACH cert_type IN ARRAY p_required_certifications
    LOOP
        SELECT * INTO cert_validity 
        FROM check_certification_validity(p_employee_id, cert_type);
        
        IF NOT cert_validity.is_valid THEN
            IF cert_validity.is_critical OR tenant_strict_mode THEN
                blocking_list := array_append(blocking_list, cert_type);
                final_can_assign := FALSE;
            ELSE
                warning_list := array_append(warning_list, cert_type);
            END IF;
        END IF;
    END LOOP;
    
    -- Check all critical certifications even if not specifically required
    FOR cert_type IN SELECT jsonb_object_keys(employee_certs) 
    WHERE jsonb_object_keys(employee_certs) != '_meta'
    LOOP
        IF COALESCE(((employee_certs->cert_type)->>'critical')::BOOLEAN, FALSE) THEN
            SELECT * INTO cert_validity 
            FROM check_certification_validity(p_employee_id, cert_type);
            
            IF NOT cert_validity.is_valid THEN
                IF NOT (cert_type = ANY(blocking_list)) THEN
                    blocking_list := array_append(blocking_list, cert_type);
                    final_can_assign := FALSE;
                END IF;
            END IF;
        END IF;
    END LOOP;
    
    RETURN QUERY SELECT 
        final_can_assign,
        blocking_list,
        warning_list,
        CASE 
            WHEN NOT final_can_assign THEN 'Assignment blocked due to expired critical certifications'
            WHEN array_length(warning_list, 1) > 0 THEN 'Assignment possible but requires justification'
            ELSE 'Assignment approved'
        END;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at timestamps
CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_records_updated_at 
    BEFORE UPDATE ON employee_safety_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_profiles_updated_at 
    BEFORE UPDATE ON client_billing_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. SAMPLE DATA FOR DEVELOPMENT
-- ===================================================================

-- Default billing profile for demo tenant
INSERT INTO client_billing_profiles (tenant_id, rate_normal, rate_overtime_1_5, rate_overtime_2_0)
VALUES ('demo', 140.00, 210.00, 280.00)
ON CONFLICT (tenant_id) DO NOTHING;

-- 8. GRANTS FOR SERVICE ROLE
-- ===================================================================
GRANT ALL ON employees TO service_role;
GRANT ALL ON employee_safety_records TO service_role;
GRANT ALL ON client_billing_profiles TO service_role;

-- 9. SUCCESS MESSAGE
-- ===================================================================
DO $$
BEGIN
    RAISE NOTICE '🛡️ C-SECUR360 SECURE HR MODULE deployed successfully!';
    RAISE NOTICE '✅ Employees: Minimal data with AES-256 encryption for sensitive fields';
    RAISE NOTICE '✅ Safety Records: Complete SST tracking with certification management';  
    RAISE NOTICE '✅ Billing Profiles: Tenant-level billing rates with flexible custom rates';
    RAISE NOTICE '✅ Security: RLS policies with tenant isolation and role-based access';
    RAISE NOTICE '✅ Functions: Safety score calculation and certification validation';
    RAISE NOTICE '📱 Ready for: HR API routes, mobile interface, and AST integration';
END $$;