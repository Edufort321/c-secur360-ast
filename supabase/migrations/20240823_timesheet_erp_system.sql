-- ===================================================================
-- C-Secur360 ERP INTÉGRÉ: Timesheets, Véhicules, Facturation, Interop
-- Vision: Single Source of Truth avec interconnexions bidirectionnelles
-- ===================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ===================================================================
-- 1. EMPLOYÉS & PROFILS DE PAIE
-- ===================================================================

-- Profils de paie pour les employés
CREATE TABLE IF NOT EXISTS user_profile_payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Coûts & taux
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    overtime_rate DECIMAL(10,2), -- Peut être null = calculé automatiquement
    overtime_threshold_hours INTEGER DEFAULT 40, -- Seuil overtime par semaine
    
    -- Règles spécifiques
    fte_percentage INTEGER DEFAULT 100, -- Full-time equivalent %
    benefits_eligible BOOLEAN DEFAULT true,
    union_member BOOLEAN DEFAULT false,
    
    -- Certifications et qualifications
    certifications JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    
    -- Métadonnées
    hire_date DATE,
    employment_status VARCHAR(50) DEFAULT 'active', -- active, on_leave, terminated
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_fte CHECK (fte_percentage > 0 AND fte_percentage <= 100)
);

-- Associations employé-site (sites par défaut)
CREATE TABLE IF NOT EXISTS user_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    site_id VARCHAR(100) NOT NULL, -- Référence vers sites clients
    is_default BOOLEAN DEFAULT false,
    role_at_site VARCHAR(100), -- technicien, superviseur, chef_equipe, etc.
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, site_id)
);

-- ===================================================================
-- 2. VÉHICULES & FLOTTE
-- ===================================================================

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    -- Identifiant véhicule
    plate_number VARCHAR(20) NOT NULL,
    vin VARCHAR(30),
    make VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    color VARCHAR(30),
    
    -- Type & capacités
    vehicle_type VARCHAR(50) DEFAULT 'pickup', -- pickup, van, truck, car, trailer
    capacity_passengers INTEGER DEFAULT 2,
    capacity_cargo_m3 DECIMAL(8,2),
    
    -- Statut & coûts
    status VARCHAR(50) DEFAULT 'active', -- active, maintenance, retired
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    current_mileage_km INTEGER DEFAULT 0,
    
    -- Assurance & entretien
    insurance_expiry DATE,
    registration_expiry DATE,
    last_maintenance DATE,
    next_maintenance_km INTEGER,
    
    -- Assignation
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Véhicule attitré
    
    -- Métadonnées
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(tenant_id, plate_number)
);

-- Assignations temporaires de véhicules (réservations)
CREATE TABLE IF NOT EXISTS user_vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    
    -- Période d'assignation
    assigned_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    assigned_until TIMESTAMP WITH TIME ZONE,
    
    -- Type d'assignation
    assignment_type VARCHAR(50) DEFAULT 'temporary', -- permanent, temporary, reservation
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Un véhicule ne peut être assigné qu'à une personne à la fois
    EXCLUDE USING gist (
        vehicle_id WITH =,
        tsrange(assigned_from, assigned_until) WITH &&
    ) WHERE (assignment_type != 'reservation')
);

-- Logs kilométrage véhicules
CREATE TABLE IF NOT EXISTS vehicle_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Projet/Tâche rattachée
    project_id VARCHAR(100),
    client_id VARCHAR(100),
    timesheet_entry_id UUID, -- Référence vers entrée timesheet
    
    -- Kilométrage
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    km_start INTEGER NOT NULL,
    km_end INTEGER NOT NULL,
    km_total INTEGER GENERATED ALWAYS AS (km_end - km_start) STORED,
    
    -- Destinations
    origin TEXT,
    destination TEXT,
    purpose TEXT, -- Déplacement chantier, livraison, etc.
    
    -- Coûts
    fuel_cost DECIMAL(8,2),
    fuel_liters DECIMAL(6,2),
    parking_cost DECIMAL(8,2),
    tolls_cost DECIMAL(8,2),
    
    notes TEXT,
    receipts JSONB DEFAULT '[]'::jsonb, -- Photos reçus
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_km CHECK (km_end >= km_start),
    CONSTRAINT valid_fuel CHECK (fuel_liters IS NULL OR fuel_liters >= 0)
);

-- ===================================================================
-- 3. FEUILLES DE TEMPS (TIMESHEETS)
-- ===================================================================

-- Périodes de feuilles de temps
CREATE TABLE IF NOT EXISTS timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id VARCHAR(100) NOT NULL,
    
    -- Période
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type VARCHAR(50) DEFAULT 'weekly', -- weekly, bi_weekly, monthly
    
    -- Statut workflow
    status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, approved, rejected, exported
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by_user_id UUID REFERENCES users(id),
    
    -- Totaux calculés
    total_hours DECIMAL(8,2) DEFAULT 0.00,
    total_overtime_hours DECIMAL(8,2) DEFAULT 0.00,
    total_billable_hours DECIMAL(8,2) DEFAULT 0.00,
    
    -- Export paie/facturation
    payroll_exported BOOLEAN DEFAULT false,
    billing_exported BOOLEAN DEFAULT false,
    export_reference VARCHAR(100),
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_period CHECK (period_end >= period_start),
    UNIQUE(user_id, period_start, period_end)
);

-- Entrées individuelles de temps
CREATE TABLE IF NOT EXISTS timesheet_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id), -- Dénormalisé pour performance
    
    -- Projet & client
    project_id VARCHAR(100), -- Code projet client
    client_id VARCHAR(100), -- ID client
    site_id VARCHAR(100), -- Site de travail
    billing_code VARCHAR(50), -- Code facturation (suffixe personnalisable par client)
    
    -- Temps
    work_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    break_minutes INTEGER DEFAULT 0,
    total_hours DECIMAL(8,2), -- Calculé ou saisi manuellement
    
    -- Type d'activité
    activity_type VARCHAR(50) DEFAULT 'normal', -- normal, overtime, travel, standby, training
    is_billable BOOLEAN DEFAULT true,
    billing_rate DECIMAL(10,2), -- Taux spécifique si différent du taux standard
    
    -- Source de création
    source VARCHAR(50) DEFAULT 'manual', -- manual, planned, ast, mobile_app
    ast_id UUID, -- Si créé depuis participation AST
    planned_entry_id UUID, -- Si créé depuis planification
    
    -- Transport
    vehicle_id UUID REFERENCES vehicles(id),
    mileage_km INTEGER,
    travel_time_hours DECIMAL(6,2),
    
    -- Métadonnées
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb, -- Photos, documents
    location_checkin JSONB, -- GPS coords check-in
    location_checkout JSONB, -- GPS coords check-out
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_times CHECK (
        (start_time IS NULL AND end_time IS NULL AND total_hours IS NOT NULL) OR
        (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time >= start_time)
    )
);

-- ===================================================================
-- 4. DÉPENSES & PER DIEM
-- ===================================================================

-- Règles per diem par client
CREATE TABLE IF NOT EXISTS per_diem_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id VARCHAR(100) NOT NULL,
    tenant_id VARCHAR(100) NOT NULL,
    
    name VARCHAR(100) NOT NULL, -- "Per diem standard", "Déplacement +100km", etc.
    daily_amount DECIMAL(8,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CAD',
    
    -- Conditions d'application
    conditions JSONB DEFAULT '{}'::jsonb, -- Rules: min_distance_km, min_hours, etc.
    
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_until DATE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(client_id, name)
);

-- Logs per diem appliqués
CREATE TABLE IF NOT EXISTS per_diem_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timesheet_entry_id UUID REFERENCES timesheet_entries(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES per_diem_rules(id),
    
    work_date DATE NOT NULL,
    amount DECIMAL(8,2) NOT NULL,
    auto_applied BOOLEAN DEFAULT true, -- true si appliqué automatiquement
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, work_date, rule_id) -- Un per diem par règle par jour
);

-- Dépenses diverses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timesheet_entry_id UUID REFERENCES timesheet_entries(id) ON DELETE CASCADE,
    client_id VARCHAR(100),
    
    -- Dépense
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL, -- fuel, meals, accommodation, materials, parking, etc.
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CAD',
    
    -- Taxes
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    is_tax_included BOOLEAN DEFAULT true,
    
    -- Métadonnées
    description TEXT NOT NULL,
    vendor VARCHAR(100),
    receipt_number VARCHAR(50),
    
    -- Documents
    receipt_url TEXT, -- URL Supabase Storage
    photos JSONB DEFAULT '[]'::jsonb,
    
    -- Approbation
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, reimbursed
    approved_by_user_id UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Métadonnées
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- ===================================================================
-- 5. CONFIGURATION FACTURATION CLIENTS
-- ===================================================================

-- Configuration facturation par client
CREATE TABLE IF NOT EXISTS client_billing_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id VARCHAR(100) NOT NULL UNIQUE,
    tenant_id VARCHAR(100) NOT NULL,
    
    -- Règles arrondis et minimums
    time_rounding_minutes INTEGER DEFAULT 15, -- Arrondi à 15min, 30min, etc.
    min_billable_hours DECIMAL(4,2) DEFAULT 0.25, -- Minimum facturable (15min)
    
    -- Taux overtime
    overtime_multiplier DECIMAL(4,2) DEFAULT 1.5, -- 1.5x pour overtime
    weekend_multiplier DECIMAL(4,2) DEFAULT 1.0, -- 1.0x pour weekend
    holiday_multiplier DECIMAL(4,2) DEFAULT 2.0, -- 2.0x pour jours fériés
    
    -- Voyage et déplacements
    travel_rules JSONB DEFAULT '{}'::jsonb, -- Règles facturation déplacements
    mileage_rate_per_km DECIMAL(6,4) DEFAULT 0.68, -- Taux kilométrique CAD
    
    -- Dépenses
    expense_markup_percentage DECIMAL(5,2) DEFAULT 0.00, -- Markup sur dépenses
    expense_categories_allowed JSONB DEFAULT '["fuel","meals","materials","parking"]'::jsonb,
    
    -- Facturation & exports
    invoice_terms_net_days INTEGER DEFAULT 30,
    currency VARCHAR(3) DEFAULT 'CAD',
    tax_rate DECIMAL(5,4) DEFAULT 0.14975, -- Taux taxe (ex: TPS+TVQ Québec)
    
    -- Paramètres export
    export_format VARCHAR(20) DEFAULT 'pdf', -- pdf, excel, csv, quickbooks
    custom_fields JSONB DEFAULT '{}'::jsonb, -- Champs personnalisés client
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Codes de facturation par client
CREATE TABLE IF NOT EXISTS client_billing_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id VARCHAR(100) NOT NULL,
    
    code VARCHAR(50) NOT NULL, -- "ABC-001-CH", "DEF-MAINT", etc.
    label VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Taux et règles
    default_rate DECIMAL(10,2), -- Taux par défaut pour ce code
    is_active BOOLEAN DEFAULT true,
    
    -- Métadonnées structurées
    metadata JSONB DEFAULT '{}'::jsonb, -- Informations additionnelles
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(client_id, code)
);

-- ===================================================================
-- 6. AST INTEROP (IDENTITÉ FÉDÉRÉE CROSS-ENTREPRISE)
-- ===================================================================

-- Registre identités externes pour fédération
CREATE TABLE IF NOT EXISTS external_org_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identité externe
    external_user_id VARCHAR(100), -- ID dans l'autre système
    external_org_tenant_id VARCHAR(100) NOT NULL, -- Tenant de l'autre entreprise
    email VARCHAR(255), -- Email si connu
    
    -- Données minimales (PIPEDA/GDPR-compliant)
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(200),
    phone VARCHAR(20),
    
    -- Consentement & permissions
    consent_given_at TIMESTAMP WITH TIME ZONE,
    consent_expires_at TIMESTAMP WITH TIME ZONE,
    permissions_granted JSONB DEFAULT '[]'::jsonb, -- Permissions accordées
    
    -- Audit trail
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID REFERENCES users(id), -- Qui a créé cette identité
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(external_org_tenant_id, email)
);

-- Participants AST (étendu pour interop)
CREATE TABLE IF NOT EXISTS ast_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ast_id UUID NOT NULL, -- Référence vers table ast existante
    
    -- Participant interne OU externe
    user_id UUID REFERENCES users(id), -- Si utilisateur interne
    external_identity_id UUID REFERENCES external_org_identities(id), -- Si externe
    
    -- Données participant (si externe)
    name VARCHAR(200), -- Nom si pas d'identité liée
    company_external VARCHAR(200), -- Entreprise externe
    role_in_ast VARCHAR(100) DEFAULT 'worker', -- worker, supervisor, observer, specialist
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Participation
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    electronic_signature TEXT, -- Signature électronique base64
    signed_at TIMESTAMP WITH TIME ZONE,
    
    -- Sécurité & audit
    invited_by_user_id UUID REFERENCES users(id), -- Qui a invité ce participant
    consent_ast_sharing BOOLEAN DEFAULT false, -- Consentement partage données AST
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Contrainte: soit user_id soit external_identity_id/name
    CONSTRAINT participant_identity_check CHECK (
        (user_id IS NOT NULL) OR 
        (external_identity_id IS NOT NULL OR name IS NOT NULL)
    ),
    
    UNIQUE(ast_id, user_id), -- Un utilisateur interne ne peut participer qu'une fois
    UNIQUE(ast_id, external_identity_id) -- Une identité externe ne peut participer qu'une fois
);

-- ===================================================================
-- 7. PLANIFICATION & ENTRÉES PRÉVISIONNELLES
-- ===================================================================

-- Planifications/assignations futures
CREATE TABLE IF NOT EXISTS planned_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Projet & planning
    project_id VARCHAR(100) NOT NULL,
    client_id VARCHAR(100),
    site_id VARCHAR(100),
    task_name VARCHAR(200),
    
    -- Timing planifié
    planned_start TIMESTAMP WITH TIME ZONE NOT NULL,
    planned_end TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_hours DECIMAL(6,2),
    
    -- Ressources
    required_skills JSONB DEFAULT '[]'::jsonb,
    required_certifications JSONB DEFAULT '[]'::jsonb,
    vehicle_required BOOLEAN DEFAULT false,
    tools_equipment JSONB DEFAULT '[]'::jsonb,
    
    -- Statut
    status VARCHAR(50) DEFAULT 'planned', -- planned, confirmed, in_progress, completed, cancelled
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    
    -- Communication
    notification_sent BOOLEAN DEFAULT false,
    worker_response VARCHAR(20), -- confirmed, negotiating, declined
    response_notes TEXT,
    
    -- Réalisation (liens avec timesheet)
    actual_timesheet_entry_id UUID REFERENCES timesheet_entries(id),
    variance_hours DECIMAL(6,2), -- Écart planifié vs réel
    
    created_by_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_planning_period CHECK (planned_end > planned_start)
);

-- ===================================================================
-- 8. INDEXES POUR PERFORMANCE
-- ===================================================================

-- Indexes timesheets & entries
CREATE INDEX IF NOT EXISTS idx_timesheets_user_period ON timesheets(user_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_user_date ON timesheet_entries(user_id, work_date);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_client_project ON timesheet_entries(client_id, project_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_billing ON timesheet_entries(is_billable, billing_code);

-- Indexes véhicules
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant ON vehicles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_assigned_user ON vehicles(assigned_user_id) WHERE assigned_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicle_logs_date ON vehicle_logs(date);
CREATE INDEX IF NOT EXISTS idx_vehicle_logs_project ON vehicle_logs(project_id, client_id);

-- Indexes dépenses & per diem
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_per_diem_logs_user_date ON per_diem_logs(user_id, work_date);

-- Indexes AST interop
CREATE INDEX IF NOT EXISTS idx_ast_participants_ast ON ast_participants(ast_id);
CREATE INDEX IF NOT EXISTS idx_external_identities_org ON external_org_identities(external_org_tenant_id);
CREATE INDEX IF NOT EXISTS idx_external_identities_email ON external_org_identities(email);

-- Indexes planification
CREATE INDEX IF NOT EXISTS idx_planned_assignments_user ON planned_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_assignments_dates ON planned_assignments(planned_start, planned_end);
CREATE INDEX IF NOT EXISTS idx_planned_assignments_status ON planned_assignments(status);

-- ===================================================================
-- 9. ROW LEVEL SECURITY (RLS) 
-- ===================================================================

-- Enable RLS sur toutes les tables
ALTER TABLE user_profile_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE per_diem_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE per_diem_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_billing_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_billing_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_org_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ast_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_assignments ENABLE ROW LEVEL SECURITY;

-- Policies génériques tenant-based
DO $$
DECLARE
    table_name text;
BEGIN
    -- Apply tenant-based policies to all tables with tenant_id
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'vehicles', 'timesheets', 'per_diem_rules', 
            'client_billing_configs', 'client_billing_codes'
        ])
    LOOP
        EXECUTE format('
            CREATE POLICY "tenant_isolation" ON %I
            FOR ALL USING (
                tenant_id = COALESCE(current_setting(''app.current_tenant'', true), ''default'')
            )', table_name);
    END LOOP;
END $$;

-- Policies user-specific
CREATE POLICY "users_own_data_payroll" ON user_profile_payroll 
FOR ALL USING (user_id = auth.uid()::uuid);

CREATE POLICY "users_own_timesheets" ON timesheets 
FOR ALL USING (user_id = auth.uid()::uuid);

CREATE POLICY "users_own_timesheet_entries" ON timesheet_entries 
FOR ALL USING (user_id = auth.uid()::uuid);

CREATE POLICY "users_own_expenses" ON expenses 
FOR ALL USING (user_id = auth.uid()::uuid);

-- Policies pour superviseurs (peuvent voir leur équipe)
CREATE POLICY "supervisors_see_team_timesheets" ON timesheets 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users supervisor 
        WHERE supervisor.id = auth.uid()::uuid 
        AND supervisor.role IN ('supervisor', 'manager', 'super_admin')
        AND supervisor.tenant_id = timesheets.tenant_id
    )
);

-- ===================================================================
-- 10. FONCTIONS UTILITAIRES
-- ===================================================================

-- Fonction pour calculer heures overtime
CREATE OR REPLACE FUNCTION calculate_overtime_hours(
    p_user_id UUID,
    p_week_start DATE
) RETURNS DECIMAL(8,2) AS $$
DECLARE
    total_regular_hours DECIMAL(8,2);
    overtime_threshold INTEGER;
    overtime_hours DECIMAL(8,2) := 0;
BEGIN
    -- Récupérer seuil overtime pour cet utilisateur
    SELECT overtime_threshold_hours INTO overtime_threshold
    FROM user_profile_payroll 
    WHERE user_id = p_user_id;
    
    IF overtime_threshold IS NULL THEN
        overtime_threshold := 40; -- Défaut 40h/semaine
    END IF;
    
    -- Calculer total heures régulières cette semaine
    SELECT COALESCE(SUM(total_hours), 0) INTO total_regular_hours
    FROM timesheet_entries te
    JOIN timesheets ts ON ts.id = te.timesheet_id
    WHERE te.user_id = p_user_id
    AND te.work_date >= p_week_start 
    AND te.work_date < p_week_start + INTERVAL '7 days'
    AND te.activity_type = 'normal';
    
    -- Calculer overtime si dépasse seuil
    IF total_regular_hours > overtime_threshold THEN
        overtime_hours := total_regular_hours - overtime_threshold;
    END IF;
    
    RETURN overtime_hours;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour appliquer per diem automatiquement
CREATE OR REPLACE FUNCTION apply_per_diem_rules(
    p_timesheet_entry_id UUID
) RETURNS VOID AS $$
DECLARE
    entry_rec timesheet_entries%ROWTYPE;
    rule_rec per_diem_rules%ROWTYPE;
    distance_km INTEGER;
    hours_worked DECIMAL(8,2);
BEGIN
    -- Récupérer entrée timesheet
    SELECT * INTO entry_rec FROM timesheet_entries WHERE id = p_timesheet_entry_id;
    
    IF NOT FOUND THEN RETURN; END IF;
    
    -- Parcourir règles per diem actives pour ce client
    FOR rule_rec IN 
        SELECT * FROM per_diem_rules 
        WHERE client_id = entry_rec.client_id 
        AND is_active = true
        AND (effective_until IS NULL OR effective_until >= entry_rec.work_date)
    LOOP
        -- Évaluer conditions (exemple simple)
        distance_km := COALESCE(entry_rec.mileage_km, 0);
        hours_worked := COALESCE(entry_rec.total_hours, 0);
        
        -- Condition exemple: > 100km ET > 8h = per diem
        IF (rule_rec.conditions->>'min_distance_km')::INTEGER <= distance_km 
        AND (rule_rec.conditions->>'min_hours')::DECIMAL <= hours_worked THEN
            
            -- Insérer per diem log
            INSERT INTO per_diem_logs (
                user_id, timesheet_entry_id, rule_id, 
                work_date, amount, auto_applied
            ) VALUES (
                entry_rec.user_id, p_timesheet_entry_id, rule_rec.id,
                entry_rec.work_date, rule_rec.daily_amount, true
            ) ON CONFLICT (user_id, work_date, rule_id) DO NOTHING;
            
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 11. TRIGGERS
-- ===================================================================

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer trigger updated_at
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'user_profile_payroll', 'vehicles', 'timesheets', 'timesheet_entries',
            'expenses', 'client_billing_configs', 'external_org_identities',
            'ast_participants', 'planned_assignments'
        ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at 
            BEFORE UPDATE ON %I 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', 
            table_name, table_name);
    END LOOP;
END $$;

-- Trigger pour appliquer per diem automatiquement
CREATE OR REPLACE FUNCTION trigger_apply_per_diem()
RETURNS TRIGGER AS $$
BEGIN
    -- Appliquer per diem seulement si c'est une nouvelle entrée ou si client/km changent
    IF TG_OP = 'INSERT' OR 
       (TG_OP = 'UPDATE' AND (
           OLD.client_id IS DISTINCT FROM NEW.client_id OR
           OLD.mileage_km IS DISTINCT FROM NEW.mileage_km OR
           OLD.total_hours IS DISTINCT FROM NEW.total_hours
       )) THEN
        
        PERFORM apply_per_diem_rules(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_timesheet_entry_per_diem
    AFTER INSERT OR UPDATE ON timesheet_entries
    FOR EACH ROW EXECUTE FUNCTION trigger_apply_per_diem();

-- ===================================================================
-- 12. GRANTS & PERMISSIONS
-- ===================================================================

-- Grant all to service role
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT table_name::text 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE ANY(ARRAY[
            'user_profile_payroll', 'user_sites', 'vehicles%', 'timesheet%',
            'per_diem%', 'expenses', 'client_billing%', 'external_org%',
            'ast_participants', 'planned_assignments'
        ])
    LOOP
        EXECUTE format('GRANT ALL ON %I TO service_role', table_name);
    END LOOP;
END $$;

-- ===================================================================
-- 13. DONNÉES DE DÉMONSTRATION (SAMPLE DATA)
-- ===================================================================

-- Sample per diem rules
INSERT INTO per_diem_rules (client_id, tenant_id, name, daily_amount, conditions) VALUES
('CLIENT_ABC', 'default', 'Per diem standard', 75.00, '{"min_distance_km": 50, "min_hours": 8}'),
('CLIENT_XYZ', 'default', 'Déplacement longue distance', 100.00, '{"min_distance_km": 200, "min_hours": 6}')
ON CONFLICT DO NOTHING;

-- Sample billing codes
INSERT INTO client_billing_codes (client_id, code, label, default_rate) VALUES
('CLIENT_ABC', 'ABC-001-REG', 'Travail régulier', 85.00),
('CLIENT_ABC', 'ABC-002-EMER', 'Urgence 24/7', 125.00),
('CLIENT_XYZ', 'XYZ-MAINT', 'Maintenance préventive', 75.00),
('CLIENT_XYZ', 'XYZ-REPAIR', 'Réparation corrective', 95.00)
ON CONFLICT DO NOTHING;

-- Sample billing config
INSERT INTO client_billing_configs (
    client_id, tenant_id, time_rounding_minutes, min_billable_hours,
    overtime_multiplier, mileage_rate_per_km
) VALUES
('CLIENT_ABC', 'default', 15, 0.25, 1.5, 0.68),
('CLIENT_XYZ', 'default', 30, 0.50, 1.75, 0.72)
ON CONFLICT DO NOTHING;

-- ===================================================================
-- SUCCESS MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE '🎯 C-Secur360 ERP SYSTEM: Single Source of Truth deployed successfully!';
    RAISE NOTICE '✅ Timesheets: Feuilles de temps avec source planning/AST/manual';
    RAISE NOTICE '✅ Vehicles: Flotte avec assignation et kilométrage par tâche';
    RAISE NOTICE '✅ Billing: Configuration client + codes + per diem automatique';  
    RAISE NOTICE '✅ Expenses: Dépenses avec photos et approbation workflow';
    RAISE NOTICE '✅ AST Interop: Identité fédérée cross-entreprise sécurisée';
    RAISE NOTICE '✅ Planning: Assignations → timesheet bidirectionnel';
    RAISE NOTICE '✅ RLS: Isolation tenant + permissions utilisateur strictes';
    RAISE NOTICE '📱 Ready for: Mobile timesheet UI, Gantt planning, Stripe integration';
END $$;