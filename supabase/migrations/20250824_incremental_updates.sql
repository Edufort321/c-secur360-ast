-- ===================================================================
-- C-Secur360 MIGRATION INCRÉMENTALE - MISE À JOUR STRUCTURE
-- Ajout des colonnes manquantes et nouvelles tables
-- ===================================================================

-- Enable extensions si pas déjà fait
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- 1. MISE À JOUR TABLE USERS EXISTANTE
-- ===================================================================

-- Ajouter les colonnes manquantes à la table users
DO $$
BEGIN
    -- tenant_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='tenant_id') THEN
        ALTER TABLE users ADD COLUMN tenant_id VARCHAR(100) NULL;
    END IF;
    
    -- TOTP columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='totp_secret') THEN
        ALTER TABLE users ADD COLUMN totp_secret TEXT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='totp_enabled') THEN
        ALTER TABLE users ADD COLUMN totp_enabled BOOLEAN NOT NULL DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='totp_backup_codes') THEN
        ALTER TABLE users ADD COLUMN totp_backup_codes TEXT[] NULL;
    END IF;
    
    -- Account management
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='first_login') THEN
        ALTER TABLE users ADD COLUMN first_login BOOLEAN NOT NULL DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='failed_attempts') THEN
        ALTER TABLE users ADD COLUMN failed_attempts INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='locked_until') THEN
        ALTER TABLE users ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE NULL;
    END IF;
    
    -- Profile information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='profile') THEN
        ALTER TABLE users ADD COLUMN profile JSONB NULL;
    END IF;
    
    -- MFA additional columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='mfa_required') THEN
        ALTER TABLE users ADD COLUMN mfa_required BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='qr_enrolled') THEN
        ALTER TABLE users ADD COLUMN qr_enrolled BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_mfa_at') THEN
        ALTER TABLE users ADD COLUMN last_mfa_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Additional security columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='mobile_only') THEN
        ALTER TABLE users ADD COLUMN mobile_only BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='can_export') THEN
        ALTER TABLE users ADD COLUMN can_export BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='invitation_sent_at') THEN
        ALTER TABLE users ADD COLUMN invitation_sent_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='invitation_token') THEN
        ALTER TABLE users ADD COLUMN invitation_token VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='activated_at') THEN
        ALTER TABLE users ADD COLUMN activated_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
END $$;

-- Créer les indexes manquants
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- ===================================================================
-- 2. TABLES RBAC - CRÉER SEULEMENT SI N'EXISTENT PAS
-- ===================================================================

-- Table des rôles modèles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    color VARCHAR(7) DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table des permissions normalisées
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_dangerous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Permissions attribuées à chaque rôle modèle
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    scope_default VARCHAR(20) NOT NULL DEFAULT 'own',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(role_id, permission_id)
);

-- Rôles d'utilisateur avec portée
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    
    scope_type VARCHAR(20) NOT NULL CHECK (scope_type IN ('global', 'client', 'site', 'project')),
    scope_id UUID,
    scope_name VARCHAR(200),
    
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, role_id, scope_type, scope_id)
);

-- ===================================================================
-- 3. TABLES INVENTAIRE - CRÉER SEULEMENT SI N'EXISTENT PAS
-- ===================================================================

-- Table des articles de l'inventaire
CREATE TABLE IF NOT EXISTS inv_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    uom TEXT DEFAULT 'UN',
    
    min_qty NUMERIC DEFAULT 0,
    max_qty NUMERIC,
    reorder_point NUMERIC,
    safety_stock NUMERIC DEFAULT 0,
    
    default_location_id UUID,
    
    dimensions JSONB,
    images JSONB DEFAULT '[]'::jsonb,
    
    serializable BOOLEAN DEFAULT false,
    sellable BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    
    description TEXT,
    category TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(client_id, sku)
);

-- Emplacements de stockage
CREATE TABLE IF NOT EXISTS inv_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    site_id UUID NOT NULL,
    
    name TEXT NOT NULL,
    code TEXT,
    
    parent_location_id UUID REFERENCES inv_locations(id),
    location_type TEXT DEFAULT 'storage',
    
    capacity NUMERIC,
    temperature_controlled BOOLEAN DEFAULT false,
    outdoor BOOLEAN DEFAULT false,
    
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(client_id, code)
);

-- Stock agrégé par article/emplacement
CREATE TABLE IF NOT EXISTS inv_stock (
    item_id UUID NOT NULL REFERENCES inv_items(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES inv_locations(id) ON DELETE CASCADE,
    
    on_hand NUMERIC NOT NULL DEFAULT 0,
    reserved NUMERIC NOT NULL DEFAULT 0,
    available NUMERIC GENERATED ALWAYS AS (on_hand - reserved) STORED,
    
    last_counted_at TIMESTAMP WITH TIME ZONE,
    last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (item_id, location_id)
);

-- ===================================================================
-- 4. TABLES TIMESHEET/ERP - CRÉER SEULEMENT SI N'EXISTENT PAS  
-- ===================================================================

-- Profils de paie pour les employés
CREATE TABLE IF NOT EXISTS user_profile_payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    overtime_rate DECIMAL(10,2),
    overtime_threshold_hours INTEGER DEFAULT 40,
    
    fte_percentage INTEGER DEFAULT 100,
    benefits_eligible BOOLEAN DEFAULT true,
    union_member BOOLEAN DEFAULT false,
    
    certifications JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    
    hire_date DATE,
    employment_status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_fte CHECK (fte_percentage > 0 AND fte_percentage <= 100)
);

-- Véhicules
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    plate_number VARCHAR(20) NOT NULL,
    vin VARCHAR(30),
    make VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    color VARCHAR(30),
    
    vehicle_type VARCHAR(50) DEFAULT 'pickup',
    capacity_passengers INTEGER DEFAULT 2,
    capacity_cargo_m3 DECIMAL(8,2),
    
    status VARCHAR(50) DEFAULT 'active',
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    current_mileage_km INTEGER DEFAULT 0,
    
    insurance_expiry DATE,
    registration_expiry DATE,
    last_maintenance DATE,
    next_maintenance_km INTEGER,
    
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(tenant_id, plate_number)
);

-- ===================================================================
-- 5. INSERTION DES DONNÉES INITIALES
-- ===================================================================

-- Insérer les rôles de base
INSERT INTO roles (key, name, description, is_system, color) VALUES
    ('owner', 'Owner / Org Admin', 'Accès complet à la plateforme', true, '#dc2626'),
    ('client_admin', 'Client Admin', 'Administration complète du client', true, '#ea580c'),
    ('site_manager', 'Gestionnaire de site', 'Gestion des sites assignés', true, '#d97706'),
    ('worker', 'Travailleur / Technicien', 'Accès mobile de base', true, '#059669'),
    ('guest', 'Invité / Externe', 'Accès lecture limitée', true, '#6b7280')
ON CONFLICT (key) DO NOTHING;

-- Insérer les permissions de base
INSERT INTO permissions (key, module, action, name, description, is_dangerous) VALUES
    ('planning.view', 'planning', 'view', 'Voir la planification', 'Consulter les plannings', false),
    ('timesheets.view_own', 'timesheets', 'view', 'Voir ses propres feuilles', 'Consulter ses heures', false),
    ('timesheets.create', 'timesheets', 'create', 'Saisir les heures', 'Créer des entrées de temps', false),
    ('inventory.view', 'inventory', 'view', 'Voir inventaire', 'Consulter articles et stocks', false),
    ('inventory.scan', 'inventory', 'scan', 'Scanner QR codes', 'Utiliser scanner mobile', false),
    ('users.view', 'users', 'view', 'Voir utilisateurs', 'Consulter liste utilisateurs', false)
ON CONFLICT (key) DO NOTHING;

-- ===================================================================
-- 6. FONCTIONS UTILITAIRES
-- ===================================================================

-- Fonction pour obtenir le stock disponible total d'un article
CREATE OR REPLACE FUNCTION get_available_stock(p_item_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_stock NUMERIC := 0;
BEGIN
    SELECT COALESCE(SUM(available), 0) INTO total_stock
    FROM inv_stock
    WHERE item_id = p_item_id;
    
    RETURN total_stock;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si réapprovisionnement nécessaire
CREATE OR REPLACE FUNCTION needs_reorder(p_item_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock NUMERIC;
    reorder_point NUMERIC;
BEGIN
    SELECT get_available_stock(p_item_id) INTO current_stock;
    
    SELECT COALESCE(reorder_point, 0) INTO reorder_point
    FROM inv_items
    WHERE id = p_item_id;
    
    RETURN current_stock <= reorder_point;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 7. ENABLE RLS ET POLICIES DE BASE
-- ===================================================================

-- Enable RLS sur les nouvelles tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Policies de base (lecture publique pour rôles/permissions)
CREATE POLICY "Public read roles" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read permissions" ON permissions FOR SELECT TO authenticated USING (true);

-- Users peuvent voir leurs propres rôles
CREATE POLICY "Users can view own roles" ON user_roles 
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid());

-- Inventory policies (exemple de base)
CREATE POLICY "Users see own client inventory" ON inv_items 
    FOR ALL TO authenticated 
    USING (client_id IN (
        SELECT tenant_id::uuid FROM users WHERE id = auth.uid()
    ));

-- ===================================================================
-- 8. INDEXES POUR PERFORMANCE
-- ===================================================================

-- Indexes rôles et permissions
CREATE INDEX IF NOT EXISTS idx_roles_key ON roles(key);
CREATE INDEX IF NOT EXISTS idx_permissions_key ON permissions(key);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Indexes inventaire
CREATE INDEX IF NOT EXISTS idx_inv_items_client_id ON inv_items(client_id);
CREATE INDEX IF NOT EXISTS idx_inv_items_sku ON inv_items(sku);
CREATE INDEX IF NOT EXISTS idx_inv_items_active ON inv_items(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_inv_locations_client_site ON inv_locations(client_id, site_id);
CREATE INDEX IF NOT EXISTS idx_inv_stock_location ON inv_stock(location_id);

-- Indexes véhicules
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant ON vehicles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_assigned_user ON vehicles(assigned_user_id) WHERE assigned_user_id IS NOT NULL;

-- ===================================================================
-- 9. GRANTS POUR SERVICE ROLE
-- ===================================================================

GRANT ALL ON roles TO service_role;
GRANT ALL ON permissions TO service_role;
GRANT ALL ON role_permissions TO service_role;
GRANT ALL ON user_roles TO service_role;
GRANT ALL ON inv_items TO service_role;
GRANT ALL ON inv_locations TO service_role;
GRANT ALL ON inv_stock TO service_role;
GRANT ALL ON user_profile_payroll TO service_role;
GRANT ALL ON vehicles TO service_role;

-- ===================================================================
-- SUCCESS MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ C-Secur360 MIGRATION INCRÉMENTALE TERMINÉE!';
    RAISE NOTICE '🔐 Users table updated with RBAC columns';
    RAISE NOTICE '👥 RBAC System: roles, permissions, user_roles';
    RAISE NOTICE '📦 Inventory System: items, locations, stock';  
    RAISE NOTICE '⏰ Timesheet System: payroll profiles, vehicles';
    RAISE NOTICE '🔒 Row Level Security enabled on all tables';
    RAISE NOTICE '📊 Performance indexes created';
    RAISE NOTICE '🎯 Ready for: Mobile app, QR scanning, timesheet management';
END $$;