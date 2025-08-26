-- ===================================================================
-- C-Secur360 SYSTÈME RBAC COMPLET
-- Rôles, Permissions, Portées, MFA, Audit Trail
-- ===================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- 1. RÔLES MODÈLES (TEMPLATES)
-- ===================================================================

-- Table des rôles modèles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false, -- Rôles système non modifiables
    color VARCHAR(7) DEFAULT '#3b82f6', -- Couleur pour l'UI
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 2. PERMISSIONS GRANULAIRES
-- ===================================================================

-- Table des permissions normalisées
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL, -- ex: 'planning.view', 'timesheets.approve'
    module VARCHAR(50) NOT NULL, -- ex: 'planning', 'timesheets', 'ast', 'billing'
    action VARCHAR(50) NOT NULL, -- ex: 'view', 'create', 'edit', 'delete', 'approve'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_dangerous BOOLEAN DEFAULT false, -- Permissions critiques (audit++)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 3. PERMISSIONS PAR RÔLE (TEMPLATES)
-- ===================================================================

-- Permissions attribuées à chaque rôle modèle
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    scope_default VARCHAR(20) NOT NULL DEFAULT 'own', -- own|team|site|client|global
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(role_id, permission_id)
);

-- ===================================================================
-- 4. RÔLES UTILISATEURS AVEC PORTÉE
-- ===================================================================

-- Rôles d'utilisateur avec portée (multi-assignation possible)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    
    -- Portée d'application
    scope_type VARCHAR(20) NOT NULL CHECK (scope_type IN ('global', 'client', 'site', 'project')),
    scope_id UUID, -- null si global, sinon référence vers client_configs, sites, etc.
    scope_name VARCHAR(200), -- Nom affiché pour l'UI (cache dénormalisé)
    
    -- Métadonnées
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Accès temporaire
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Un utilisateur peut avoir le même rôle sur plusieurs portées
    UNIQUE(user_id, role_id, scope_type, scope_id)
);

-- ===================================================================
-- 5. SURCHARGES FINES PAR UTILISATEUR
-- ===================================================================

-- Overrides fins par utilisateur (allow/deny précis)
CREATE TABLE IF NOT EXISTS user_permission_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    
    decision VARCHAR(10) NOT NULL CHECK (decision IN ('allow', 'deny')),
    
    -- Portée de la surcharge
    scope_type VARCHAR(20) NOT NULL CHECK (scope_type IN ('global', 'client', 'site', 'project')),
    scope_id UUID,
    scope_name VARCHAR(200),
    
    -- Métadonnées
    reason TEXT,
    assigned_by UUID REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, permission_id, scope_type, scope_id)
);

-- ===================================================================
-- 6. PROFIL SÉCURITÉ UTILISATEUR
-- ===================================================================

-- Extension du profil sécurité utilisateur
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_required BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_enrolled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_mfa_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_only BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS can_export BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Table dédiée pour les settings de sécurité avancés
CREATE TABLE IF NOT EXISTS user_security_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Restrictions d'accès
    ip_whitelist JSONB DEFAULT '[]'::jsonb, -- IPs autorisées
    device_restrictions BOOLEAN DEFAULT false,
    max_sessions INTEGER DEFAULT 3,
    session_timeout INTEGER DEFAULT 8, -- heures
    
    -- Restrictions temporelles
    working_hours_only BOOLEAN DEFAULT false,
    allowed_days JSONB DEFAULT '["monday","tuesday","wednesday","thursday","friday"]'::jsonb,
    allowed_hours_start TIME DEFAULT '07:00',
    allowed_hours_end TIME DEFAULT '18:00',
    timezone VARCHAR(50) DEFAULT 'America/Toronto',
    
    -- Restrictions fonctionnelles
    can_delete_records BOOLEAN DEFAULT true,
    can_export_data BOOLEAN DEFAULT true,
    can_modify_own_timesheet BOOLEAN DEFAULT true,
    require_approval_for JSONB DEFAULT '[]'::jsonb, -- ['expenses', 'overtime']
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 7. AUDIT TRAIL COMPLET
-- ===================================================================

-- Audit des changements d'accès
CREATE TABLE IF NOT EXISTS audit_access_grants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Qui a fait le changement
    actor_id UUID REFERENCES users(id),
    actor_email VARCHAR(255),
    actor_role VARCHAR(50),
    
    -- Sur qui
    target_user_id UUID NOT NULL REFERENCES users(id),
    target_email VARCHAR(255),
    
    -- Quoi
    action VARCHAR(50) NOT NULL, -- 'grant_role', 'revoke_role', 'grant_permission', 'revoke_permission', 'update_security'
    change_type VARCHAR(50) NOT NULL, -- 'role', 'permission', 'security', 'activation'
    change_details JSONB NOT NULL, -- Diff complet avant/après
    
    -- Contexte
    reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_id VARCHAR(100), -- Pour tracer les requêtes
    
    -- Métadonnées
    severity VARCHAR(20) DEFAULT 'info', -- info|warning|critical
    requires_review BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_audit_access_grants_target_user ON audit_access_grants(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_access_grants_actor ON audit_access_grants(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_access_grants_created_at ON audit_access_grants(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_access_grants_action ON audit_access_grants(action);

-- ===================================================================
-- 8. INVITATIONS & ONBOARDING
-- ===================================================================

-- Table des invitations
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Invitation
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    token VARCHAR(100) UNIQUE NOT NULL,
    
    -- Rôle prévu
    intended_role_id UUID NOT NULL REFERENCES roles(id),
    intended_scope_type VARCHAR(20) NOT NULL,
    intended_scope_id UUID,
    intended_scope_name VARCHAR(200),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending|sent|clicked|completed|expired|cancelled
    
    -- Envoi
    sent_via JSONB DEFAULT '[]'::jsonb, -- ['email', 'sms']
    sent_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Métadonnées
    invited_by UUID REFERENCES users(id),
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 9. INDEXES DE PERFORMANCE
-- ===================================================================

-- Rôles
CREATE INDEX IF NOT EXISTS idx_roles_key ON roles(key);
CREATE INDEX IF NOT EXISTS idx_roles_is_system ON roles(is_system);

-- Permissions
CREATE INDEX IF NOT EXISTS idx_permissions_key ON permissions(key);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);

-- User roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_scope ON user_roles(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active) WHERE is_active = true;

-- User overrides
CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_user_id ON user_permission_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_permission ON user_permission_overrides(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_scope ON user_permission_overrides(scope_type, scope_id);

-- Invitations
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);

-- ===================================================================
-- 10. TRIGGERS POUR AUDIT AUTOMATIQUE
-- ===================================================================

-- Fonction trigger pour audit automatique
CREATE OR REPLACE FUNCTION audit_user_role_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_access_grants (
            target_user_id, action, change_type, change_details, 
            severity, created_at
        ) VALUES (
            NEW.user_id, 'grant_role', 'role',
            jsonb_build_object(
                'role_id', NEW.role_id,
                'scope_type', NEW.scope_type,
                'scope_id', NEW.scope_id,
                'expires_at', NEW.expires_at
            ),
            'info', NOW()
        );
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_access_grants (
            target_user_id, action, change_type, change_details,
            severity, created_at
        ) VALUES (
            OLD.user_id, 'revoke_role', 'role',
            jsonb_build_object(
                'role_id', OLD.role_id,
                'scope_type', OLD.scope_type,
                'scope_id', OLD.scope_id
            ),
            'warning', NOW()
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur user_roles
DROP TRIGGER IF EXISTS trigger_audit_user_roles ON user_roles;
CREATE TRIGGER trigger_audit_user_roles
    AFTER INSERT OR DELETE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION audit_user_role_changes();

-- ===================================================================
-- 11. RLS POLICIES DE BASE
-- ===================================================================

-- Enable RLS sur les nouvelles tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Policies de base (lecture publique authentifiée pour les rôles/permissions)
CREATE POLICY "Public read roles" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read permissions" ON permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read role_permissions" ON role_permissions FOR SELECT TO authenticated USING (true);

-- User roles: voir ses propres rôles
CREATE POLICY "Users can view own roles" ON user_roles 
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid());

-- Super admins peuvent tout voir/modifier sur user_roles
CREATE POLICY "Super admins full access user_roles" ON user_roles 
    FOR ALL TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'super_admin'
    ));

-- Similar policies pour les autres tables...
-- (Les policies complètes seront ajoutées selon les besoins spécifiques)

-- ===================================================================
-- 12. DONNÉES INITIALES (SEEDS)
-- ===================================================================

-- Rôles modèles
INSERT INTO roles (key, name, description, is_system, color) VALUES
    ('owner', 'Owner / Org Admin', 'Accès complet à la plateforme', true, '#dc2626'),
    ('client_admin', 'Client Admin', 'Administration complète du client', true, '#ea580c'),
    ('site_manager', 'Gestionnaire de site', 'Gestion des sites assignés', true, '#d97706'),
    ('planner', 'Planificateur / Dispatcher', 'Planification et répartition', true, '#65a30d'),
    ('safety_officer', 'Responsable SST / AST', 'Sécurité et analyses de tâches', true, '#dc2626'),
    ('project_manager', 'Gestionnaire de projet', 'Gestion de projets', true, '#2563eb'),
    ('accounting', 'Facturation & Comptabilité', 'Gestion financière', true, '#7c3aed'),
    ('fleet_manager', 'Gestionnaire de flotte', 'Gestion des véhicules', true, '#0891b2'),
    ('worker', 'Travailleur / Technicien', 'Accès mobile de base', true, '#059669'),
    ('guest', 'Invité / Externe', 'Accès lecture limitée', true, '#6b7280')
ON CONFLICT (key) DO NOTHING;

-- Permissions par module
INSERT INTO permissions (key, module, action, name, description, is_dangerous) VALUES
    -- Planning
    ('planning.view', 'planning', 'view', 'Voir la planification', 'Consulter les plannings', false),
    ('planning.create', 'planning', 'create', 'Créer des plannings', 'Créer de nouveaux plannings', false),
    ('planning.edit', 'planning', 'edit', 'Modifier les plannings', 'Éditer les plannings existants', false),
    ('planning.delete', 'planning', 'delete', 'Supprimer des plannings', 'Supprimer des éléments de planning', true),
    ('planning.assign', 'planning', 'assign', 'Affecter des ressources', 'Assigner du personnel/équipement', false),
    
    -- Projects
    ('projects.view', 'projects', 'view', 'Voir les projets', 'Consulter les projets', false),
    ('projects.create', 'projects', 'create', 'Créer des projets', 'Créer de nouveaux projets', false),
    ('projects.edit', 'projects', 'edit', 'Modifier les projets', 'Éditer les projets existants', false),
    ('projects.close', 'projects', 'close', 'Clôturer des projets', 'Marquer les projets comme terminés', false),
    
    -- Timesheets
    ('timesheets.view_own', 'timesheets', 'view', 'Voir ses propres feuilles', 'Consulter ses heures', false),
    ('timesheets.view_team', 'timesheets', 'view', 'Voir feuilles équipe', 'Consulter les heures de son équipe', false),
    ('timesheets.view_all', 'timesheets', 'view', 'Voir toutes les feuilles', 'Consulter toutes les feuilles de temps', false),
    ('timesheets.create', 'timesheets', 'create', 'Saisir les heures', 'Créer des entrées de temps', false),
    ('timesheets.edit', 'timesheets', 'edit', 'Modifier les heures', 'Éditer les feuilles de temps', false),
    ('timesheets.approve', 'timesheets', 'approve', 'Approuver les heures', 'Valider les feuilles de temps', false),
    ('timesheets.export', 'timesheets', 'export', 'Exporter pour paie', 'Exporter données de paie', false),
    
    -- Expenses
    ('expenses.view_own', 'expenses', 'view', 'Voir ses dépenses', 'Consulter ses propres dépenses', false),
    ('expenses.view_team', 'expenses', 'view', 'Voir dépenses équipe', 'Consulter dépenses de son équipe', false),
    ('expenses.create', 'expenses', 'create', 'Créer des dépenses', 'Saisir de nouvelles dépenses', false),
    ('expenses.approve', 'expenses', 'approve', 'Approuver dépenses', 'Valider les remboursements', false),
    ('expenses.reimburse', 'expenses', 'reimburse', 'Rembourser', 'Effectuer les remboursements', true),
    
    -- AST / Work Permits
    ('ast.view', 'ast', 'view', 'Voir les AST', 'Consulter les analyses de tâches', false),
    ('ast.create', 'ast', 'create', 'Créer des AST', 'Créer de nouvelles analyses', false),
    ('ast.edit', 'ast', 'edit', 'Modifier les AST', 'Éditer les analyses existantes', false),
    ('ast.sign', 'ast', 'sign', 'Signer les AST', 'Apposer sa signature', false),
    ('ast.approve', 'ast', 'approve', 'Approuver AST', 'Validation finale des analyses', false),
    ('permits.create', 'permits', 'create', 'Émettre des permis', 'Créer des permis de travail', false),
    ('permits.approve', 'permits', 'approve', 'Approuver permis', 'Validation des permis', true),
    
    -- Fleet & Equipment
    ('fleet.view', 'fleet', 'view', 'Voir la flotte', 'Consulter véhicules/équipements', false),
    ('fleet.reserve', 'fleet', 'reserve', 'Réserver du matériel', 'Réserver véhicules/équipements', false),
    ('fleet.manage', 'fleet', 'manage', 'Gérer la flotte', 'Administration complète flotte', false),
    ('fleet.maintenance', 'fleet', 'maintenance', 'Gérer maintenance', 'Planifier/suivre maintenance', false),
    
    -- Billing
    ('billing.view', 'billing', 'view', 'Voir la facturation', 'Consulter factures/brouillons', false),
    ('billing.create', 'billing', 'create', 'Générer factures', 'Créer de nouvelles factures', false),
    ('billing.send', 'billing', 'send', 'Envoyer factures', 'Envoyer via Stripe/email', false),
    ('billing.refund', 'billing', 'refund', 'Créer avoirs', 'Émettre des remboursements', true),
    
    -- Reports
    ('reports.view', 'reports', 'view', 'Voir les rapports', 'Consulter rapports générés', false),
    ('reports.export', 'reports', 'export', 'Exporter données', 'Exporter vers Excel/PDF', false),
    
    -- User Management
    ('users.view', 'users', 'view', 'Voir utilisateurs', 'Consulter liste utilisateurs', false),
    ('users.create', 'users', 'create', 'Créer utilisateurs', 'Ajouter de nouveaux utilisateurs', false),
    ('users.edit', 'users', 'edit', 'Modifier utilisateurs', 'Éditer profils utilisateurs', false),
    ('users.deactivate', 'users', 'deactivate', 'Désactiver', 'Suspendre des comptes utilisateurs', true),
    ('users.reset_mfa', 'users', 'reset_mfa', 'Reset MFA', 'Réinitialiser authentification 2FA', true),
    
    -- Settings
    ('settings.client', 'settings', 'edit', 'Config client', 'Modifier configuration client', false),
    ('settings.billing_codes', 'settings', 'edit', 'Codes facturation', 'Gérer codes/tarifs facturation', false),
    ('settings.per_diem', 'settings', 'edit', 'Règles per diem', 'Configurer indemnités journalières', false),
    ('settings.api_keys', 'settings', 'edit', 'Clés API', 'Gérer intégrations externes', true),
    ('settings.system', 'settings', 'edit', 'Paramètres système', 'Configuration système globale', true)
    
ON CONFLICT (key) DO NOTHING;

-- Attribution des permissions aux rôles (exemples de base)
INSERT INTO role_permissions (role_id, permission_id, scope_default) 
SELECT 
    r.id as role_id,
    p.id as permission_id,
    CASE 
        WHEN r.key = 'owner' THEN 'global'
        WHEN r.key = 'client_admin' THEN 'client'
        WHEN r.key = 'site_manager' THEN 'site'
        WHEN r.key = 'worker' THEN 'own'
        ELSE 'team'
    END as scope_default
FROM roles r
CROSS JOIN permissions p
WHERE 
    -- Owner: toutes les permissions
    (r.key = 'owner') OR
    -- Client Admin: tout sauf settings système
    (r.key = 'client_admin' AND p.key NOT LIKE 'settings.system') OR
    -- Worker: permissions de base seulement
    (r.key = 'worker' AND p.key IN (
        'timesheets.view_own', 'timesheets.create', 'expenses.view_own', 'expenses.create',
        'ast.view', 'ast.create', 'ast.sign', 'fleet.view', 'fleet.reserve'
    )) OR
    -- Site Manager: gestion site
    (r.key = 'site_manager' AND (
        p.key LIKE 'planning.%' OR p.key LIKE 'projects.%' OR 
        p.key LIKE 'timesheets.%' OR p.key LIKE 'ast.%' OR
        p.key LIKE 'fleet.%' OR p.key = 'users.view'
    ))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ===================================================================
-- 13. FONCTIONS UTILITAIRES
-- ===================================================================

-- Fonction pour vérifier les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_permission_key TEXT,
    p_scope_type TEXT DEFAULT 'global',
    p_scope_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Vérifier via les rôles
    SELECT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = p_user_id
        AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        AND p.key = p_permission_key
        AND (
            ur.scope_type = 'global' OR
            (ur.scope_type = p_scope_type AND ur.scope_id = p_scope_id) OR
            (rp.scope_default = 'global')
        )
    ) INTO has_permission;
    
    -- Si pas de permission via rôle, vérifier les overrides positifs
    IF NOT has_permission THEN
        SELECT EXISTS (
            SELECT 1
            FROM user_permission_overrides upo
            JOIN permissions p ON p.id = upo.permission_id
            WHERE upo.user_id = p_user_id
            AND upo.is_active = true
            AND (upo.expires_at IS NULL OR upo.expires_at > NOW())
            AND p.key = p_permission_key
            AND upo.decision = 'allow'
            AND (
                upo.scope_type = 'global' OR
                (upo.scope_type = p_scope_type AND upo.scope_id = p_scope_id)
            )
        ) INTO has_permission;
    END IF;
    
    -- Vérifier les overrides négatifs (deny)
    IF has_permission THEN
        SELECT NOT EXISTS (
            SELECT 1
            FROM user_permission_overrides upo
            JOIN permissions p ON p.id = upo.permission_id
            WHERE upo.user_id = p_user_id
            AND upo.is_active = true
            AND (upo.expires_at IS NULL OR upo.expires_at > NOW())
            AND p.key = p_permission_key
            AND upo.decision = 'deny'
            AND (
                upo.scope_type = 'global' OR
                (upo.scope_type = p_scope_type AND upo.scope_id = p_scope_id)
            )
        ) INTO has_permission;
    END IF;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- MIGRATION TERMINÉE
-- ===================================================================

-- Log de migration
INSERT INTO audit_access_grants (
    action, change_type, change_details, severity, created_at
) VALUES (
    'system_migration', 'rbac_setup', 
    jsonb_build_object(
        'version', '20240823_rbac_system',
        'tables_created', jsonb_build_array(
            'roles', 'permissions', 'role_permissions', 'user_roles',
            'user_permission_overrides', 'user_security_settings',
            'audit_access_grants', 'user_invitations'
        ),
        'initial_roles', 10,
        'initial_permissions', 35
    ),
    'info', NOW()
);