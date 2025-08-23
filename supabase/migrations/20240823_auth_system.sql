-- ===================================================================
-- C-Secur360 Authentication System Migration
-- Secure authentication with TOTP, role-based access, and audit logs
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table - Secure user management with TOTP support
-- ===================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'client_admin', 'user')),
    tenant_id VARCHAR(100) NULL, -- null for super_admin, set for client_admin
    
    -- TOTP (Two-Factor Authentication)
    totp_secret TEXT NULL,
    totp_enabled BOOLEAN NOT NULL DEFAULT false,
    totp_backup_codes TEXT[] NULL,
    
    -- Account management
    first_login BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE NULL,
    
    -- Profile information
    profile JSONB NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);

-- 2. Authentication Sessions table
-- ===================================================================
CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON auth_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON auth_sessions(expires_at);

-- 3. Authentication audit logs
-- ===================================================================
CREATE TABLE IF NOT EXISTS auth_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NULL,
    action VARCHAR(100) NOT NULL CHECK (action IN (
        'login_success', 'login_fail', 'totp_setup', 'totp_verify', 
        'password_reset', 'account_locked', 'logout', 'session_expired',
        'password_changed', 'totp_disabled', 'account_created'
    )),
    details JSONB NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_action ON auth_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_logs_ip ON auth_audit_logs(ip_address);

-- 4. Password reset tokens
-- ===================================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_id ON password_reset_tokens(user_id);

-- 5. Row Level Security (RLS) Policies
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Super admins can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u2 
            WHERE u2.id = auth.uid()::uuid 
            AND u2.role = 'super_admin'
        )
    );

CREATE POLICY "Client admins can manage users in their tenant" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u2 
            WHERE u2.id = auth.uid()::uuid 
            AND u2.role = 'client_admin'
            AND u2.tenant_id = users.tenant_id
        )
        OR
        (users.id = auth.uid()::uuid)
    );

CREATE POLICY "Users can read their own profile" ON users
    FOR SELECT USING (id = auth.uid()::uuid);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid()::uuid);

-- Sessions policies
CREATE POLICY "Users can manage their own sessions" ON auth_sessions
    FOR ALL USING (user_id = auth.uid()::uuid);

CREATE POLICY "Super admins can view all sessions" ON auth_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::uuid 
            AND role = 'super_admin'
        )
    );

-- Audit logs policies (read-only for users, full access for admins)
CREATE POLICY "Super admins can view all audit logs" ON auth_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::uuid 
            AND role = 'super_admin'
        )
    );

CREATE POLICY "Client admins can view their tenant audit logs" ON auth_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN users u2 ON u2.tenant_id = u.tenant_id
            WHERE u.id = auth.uid()::uuid 
            AND u.role = 'client_admin'
            AND u2.id = auth_audit_logs.user_id
        )
    );

CREATE POLICY "Users can view their own audit logs" ON auth_audit_logs
    FOR SELECT USING (user_id = auth.uid()::uuid);

-- Insert audit logs (system only)
CREATE POLICY "System can insert audit logs" ON auth_audit_logs
    FOR INSERT WITH CHECK (true);

-- 6. Functions and Triggers
-- ===================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM auth_sessions 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean old audit logs (keep 1 year)
CREATE OR REPLACE FUNCTION clean_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM auth_audit_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Default Super Admin Account
-- ===================================================================
-- NOTE: This creates a default super admin - change password immediately!
-- Default login: admin@c-secur360.ca / TempPassword123!

INSERT INTO users (
    email, 
    password_hash, 
    role, 
    tenant_id,
    totp_enabled,
    first_login,
    profile,
    created_at,
    updated_at
) VALUES (
    'admin@c-secur360.ca',
    '$2b$12$LQv3c1yqBwEHXw.Bf5q6FO.oLT.G3hFGJqNqFg4Px7jUzMZ6CZ4CC', -- TempPassword123!
    'super_admin',
    NULL,
    false,
    true,
    '{"first_name": "Admin", "last_name": "Principal", "company": "C-Secur360"}',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 8. Grants for service role
-- ===================================================================
GRANT ALL ON users TO service_role;
GRANT ALL ON auth_sessions TO service_role;
GRANT ALL ON auth_audit_logs TO service_role;
GRANT ALL ON password_reset_tokens TO service_role;

-- 9. Comments for documentation
-- ===================================================================
COMMENT ON TABLE users IS 'Secure user authentication with TOTP support';
COMMENT ON TABLE auth_sessions IS 'Active user sessions with expiry';
COMMENT ON TABLE auth_audit_logs IS 'Complete audit trail for authentication events';
COMMENT ON TABLE password_reset_tokens IS 'Secure password reset tokens';

COMMENT ON COLUMN users.role IS 'User role: super_admin (full access), client_admin (tenant access), user (limited access)';
COMMENT ON COLUMN users.tenant_id IS 'Tenant isolation - NULL for super_admin, tenant ID for client_admin/user';
COMMENT ON COLUMN users.totp_secret IS 'Base32 encoded TOTP secret for 2FA';
COMMENT ON COLUMN users.totp_backup_codes IS 'Array of backup codes for 2FA recovery';
COMMENT ON COLUMN users.failed_attempts IS 'Failed login attempts counter for account lockout';
COMMENT ON COLUMN users.locked_until IS 'Account locked until this timestamp';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ C-Secur360 Authentication System installed successfully!';
    RAISE NOTICE '🔐 Default admin account: admin@c-secur360.ca / TempPassword123!';
    RAISE NOTICE '⚠️  IMPORTANT: Change the default password immediately!';
    RAISE NOTICE '📱 TOTP setup required on first login for enhanced security';
END $$;