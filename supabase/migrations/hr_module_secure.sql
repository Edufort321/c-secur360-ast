-- =================== MODULE RH SÉCURISÉ ===================
-- Version sécurisée conforme PIPEDA/LPRPDE
-- Données minimales nécessaires pour sécurité et planification
-- Facturation au niveau client plutôt qu'individuel

-- Supprimer l'ancien schéma si existe
DROP TABLE IF EXISTS hr_audit_logs CASCADE;
DROP TABLE IF EXISTS project_estimates CASCADE;
DROP TABLE IF EXISTS project_wip CASCADE;
DROP TABLE IF EXISTS employee_evaluations CASCADE;
DROP TABLE IF EXISTS employee_performance CASCADE;
DROP VIEW IF EXISTS employees_summary CASCADE;

-- Réinitialiser la table employees avec structure sécurisée
DROP TABLE IF EXISTS employees CASCADE;

-- 1. TABLE EMPLOYÉS - VERSION SÉCURISÉE
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informations personnelles minimales
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20), -- Chiffré AES-256 au repos
    
    -- Contact d'urgence (chiffré)
    emergency_contact_name VARCHAR(255), -- Chiffré
    emergency_contact_phone VARCHAR(20), -- Chiffré
    
    -- Emploi et rôles
    role VARCHAR(50) NOT NULL DEFAULT 'tech' CHECK (role IN ('tech', 'chef', 'gestionnaire', 'admin')),
    
    -- Certifications pour AST (JSON)
    certifications JSONB DEFAULT '[]'::jsonb, 
    -- Exemple: [
    --   {"type": "permis_conduire", "number": "123456", "expires": "2025-12-31"},
    --   {"type": "chariot_elevateur", "expires": "2024-06-15"},
    --   {"type": "travail_hauteur", "expires": "2025-03-20"}
    -- ]
    
    -- Statut
    status VARCHAR(20) DEFAULT 'actif' CHECK (status IN ('actif', 'inactif')),
    
    -- Véhicule assigné
    vehicle_id UUID REFERENCES equipment(id),
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABLE ENREGISTREMENTS SÉCURITÉ EMPLOYÉ
CREATE TABLE employee_safety_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Métriques AST
    ast_filled INTEGER DEFAULT 0, -- AST initiées
    ast_participated INTEGER DEFAULT 0, -- Participations AST
    
    -- Sécurité
    incidents INTEGER DEFAULT 0, -- Incidents rapportés
    
    -- Formations (JSON avec dates de validité)
    training_completed JSONB DEFAULT '[]'::jsonb,
    -- Exemple: [
    --   {"type": "secourisme", "completed": "2024-01-15", "expires": "2026-01-15"},
    --   {"type": "espaces_confines", "completed": "2024-03-10", "expires": "2025-03-10"}
    -- ]
    
    -- Score de ponctualité (%)
    punctuality_score DECIMAL(5,2) DEFAULT 100.0,
    
    -- Gestion outils
    tools_checkouts INTEGER DEFAULT 0,
    tools_returns INTEGER DEFAULT 0,
    
    -- Période de mesure
    period_start DATE NOT NULL DEFAULT CURRENT_DATE,
    period_end DATE NOT NULL DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABLE PROFILS FACTURATION CLIENT
CREATE TABLE client_billing_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Profil par défaut ou spécifique à un client
    client_id UUID REFERENCES clients(id), -- NULL = profil par défaut
    profile_name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Taux horaires facturables
    rate_normal DECIMAL(8,2) NOT NULL DEFAULT 140.00, -- $/heure normal
    rate_overtime_1_5 DECIMAL(8,2) NOT NULL DEFAULT 210.00, -- 1.5x
    rate_overtime_2_0 DECIMAL(8,2) NOT NULL DEFAULT 280.00, -- 2.0x
    
    -- Per diem et frais
    per_diem_rate DECIMAL(8,2) DEFAULT 75.00, -- $/jour
    
    -- Véhicules
    vehicle_rate_light DECIMAL(8,3) DEFAULT 0.450, -- $/km véhicule léger
    vehicle_rate_trailer DECIMAL(8,3) DEFAULT 0.650, -- $/km avec remorque
    
    -- Taux personnalisés (JSON flexible)
    custom_rates JSONB DEFAULT '{}'::jsonb,
    -- Exemple: {
    --   "engin_lourd": 350,
    --   "supervision": 160,
    --   "formation": 120,
    --   "urgence_weekend": 200
    -- }
    
    -- Validité
    effective_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. EXTENSION TABLE TIMESHEET_ENTRIES
-- Ajouter colonnes pour facturation automatique
ALTER TABLE timesheet_entries ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id);
ALTER TABLE timesheet_entries ADD COLUMN IF NOT EXISTS overtime_type VARCHAR(20) DEFAULT 'base' CHECK (overtime_type IN ('base', '1_5', '2_0'));
ALTER TABLE timesheet_entries ADD COLUMN IF NOT EXISTS billable_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE timesheet_entries ADD COLUMN IF NOT EXISTS billing_profile_id UUID REFERENCES client_billing_profiles(id);

-- 5. TABLE WIP PROJETS SIMPLIFIÉE
CREATE TABLE project_wip (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES gantt_projects(id),
    project_name VARCHAR(300) NOT NULL,
    client_id UUID REFERENCES clients(id),
    
    -- Snapshot date pour historique
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Coûts main-d'œuvre estimés
    estimated_hours DECIMAL(10,2) DEFAULT 0,
    estimated_labor_cost DECIMAL(12,2) DEFAULT 0,
    estimated_billable_amount DECIMAL(12,2) DEFAULT 0,
    estimated_gross_margin DECIMAL(12,2) DEFAULT 0,
    
    -- Coûts main-d'œuvre réels (calculés depuis timesheets)
    actual_hours_worked DECIMAL(10,2) DEFAULT 0,
    actual_labor_cost DECIMAL(12,2) DEFAULT 0,
    actual_billable_amount DECIMAL(12,2) DEFAULT 0,
    actual_gross_margin DECIMAL(12,2) DEFAULT 0,
    
    -- Métriques
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    cost_variance DECIMAL(12,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, snapshot_date)
);

-- 6. TABLE ESTIMATIONS PROJET
CREATE TABLE project_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES gantt_projects(id),
    
    -- Identification
    task_name VARCHAR(300) NOT NULL,
    
    -- Estimation
    estimated_hours DECIMAL(8,2) NOT NULL,
    hourly_rate DECIMAL(8,2) NOT NULL, -- Pris du billing profile
    estimated_cost DECIMAL(10,2) NOT NULL,
    
    -- Réalisation
    actual_hours DECIMAL(8,2),
    actual_cost DECIMAL(10,2),
    
    -- Assignation
    assigned_employee_id UUID REFERENCES employees(id),
    
    -- Statut
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. TABLE AUDIT LOGS SÉCURISÉS
CREATE TABLE hr_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Traçabilité
    user_id UUID NOT NULL REFERENCES auth.users(id),
    employee_id UUID REFERENCES employees(id),
    
    -- Action
    action_type VARCHAR(50) NOT NULL, -- 'certification_update', 'status_change', 'assignment', etc.
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    
    -- Détails
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    
    -- Sécurité
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =================== INDEX ET OPTIMISATIONS ===================

-- Index principaux
CREATE INDEX idx_employees_tenant ON employees(tenant_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_vehicle ON employees(vehicle_id);

CREATE INDEX idx_safety_records_employee ON employee_safety_records(employee_id);
CREATE INDEX idx_safety_records_period ON employee_safety_records(period_start, period_end);

CREATE INDEX idx_billing_profiles_tenant ON client_billing_profiles(tenant_id);
CREATE INDEX idx_billing_profiles_client ON client_billing_profiles(client_id);
CREATE INDEX idx_billing_profiles_default ON client_billing_profiles(is_default);

CREATE INDEX idx_project_wip_tenant ON project_wip(tenant_id);
CREATE INDEX idx_project_wip_project ON project_wip(project_id);
CREATE INDEX idx_project_wip_date ON project_wip(snapshot_date);

CREATE INDEX idx_project_estimates_project ON project_estimates(project_id);
CREATE INDEX idx_project_estimates_employee ON project_estimates(assigned_employee_id);

CREATE INDEX idx_hr_audit_tenant ON hr_audit_logs(tenant_id);
CREATE INDEX idx_hr_audit_employee ON hr_audit_logs(employee_id);
CREATE INDEX idx_hr_audit_created ON hr_audit_logs(created_at);

-- =================== RLS (ROW LEVEL SECURITY) ===================

-- Activer RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_safety_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_billing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_wip ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "tenant_access_employees" ON employees
    FOR ALL USING (tenant_id = auth.uid());

CREATE POLICY "tenant_access_safety_records" ON employee_safety_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees e 
            WHERE e.id = employee_safety_records.employee_id 
            AND e.tenant_id = auth.uid()
        )
    );

CREATE POLICY "tenant_access_billing_profiles" ON client_billing_profiles
    FOR ALL USING (tenant_id = auth.uid());

CREATE POLICY "tenant_access_project_wip" ON project_wip
    FOR ALL USING (tenant_id = auth.uid());

CREATE POLICY "tenant_access_project_estimates" ON project_estimates
    FOR ALL USING (tenant_id = auth.uid());

CREATE POLICY "tenant_access_hr_audit" ON hr_audit_logs
    FOR ALL USING (tenant_id = auth.uid());

-- =================== FONCTIONS UTILITAIRES ===================

-- Fonction pour vérifier les certifications valides
CREATE OR REPLACE FUNCTION check_employee_certifications(p_employee_id UUID, p_required_certs TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    employee_certs JSONB;
    cert_record JSONB;
    required_cert TEXT;
    cert_found BOOLEAN;
    cert_valid BOOLEAN;
BEGIN
    -- Récupérer les certifications de l'employé
    SELECT certifications INTO employee_certs
    FROM employees 
    WHERE id = p_employee_id;
    
    -- Vérifier chaque certification requise
    FOREACH required_cert IN ARRAY p_required_certs LOOP
        cert_found := FALSE;
        cert_valid := FALSE;
        
        -- Chercher la certification dans le JSON
        FOR cert_record IN SELECT * FROM jsonb_array_elements(employee_certs) LOOP
            IF cert_record->>'type' = required_cert THEN
                cert_found := TRUE;
                -- Vérifier si elle n'est pas expirée
                IF (cert_record->>'expires')::DATE >= CURRENT_DATE THEN
                    cert_valid := TRUE;
                END IF;
                EXIT;
            END IF;
        END LOOP;
        
        -- Si une certification requise manque ou est expirée
        IF NOT cert_found OR NOT cert_valid THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour calculer le montant facturable automatiquement
CREATE OR REPLACE FUNCTION calculate_billable_amount(
    p_hours DECIMAL,
    p_overtime_type VARCHAR,
    p_tenant_id UUID,
    p_client_id UUID DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
    v_rate DECIMAL;
    billing_profile RECORD;
BEGIN
    -- Récupérer le profil de facturation (client spécifique ou par défaut)
    SELECT * INTO billing_profile
    FROM client_billing_profiles 
    WHERE tenant_id = p_tenant_id 
    AND (client_id = p_client_id OR (client_id IS NULL AND is_default = TRUE))
    ORDER BY client_id NULLS LAST, is_default DESC
    LIMIT 1;
    
    IF billing_profile IS NULL THEN
        -- Utiliser des taux par défaut si aucun profil trouvé
        v_rate := 140.00;
    ELSE
        -- Sélectionner le taux selon le type d'overtime
        CASE p_overtime_type
            WHEN '1_5' THEN v_rate := billing_profile.rate_overtime_1_5;
            WHEN '2_0' THEN v_rate := billing_profile.rate_overtime_2_0;
            ELSE v_rate := billing_profile.rate_normal;
        END CASE;
    END IF;
    
    RETURN p_hours * v_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour calcul automatique du montant facturable dans timesheets
CREATE OR REPLACE FUNCTION auto_calculate_billable()
RETURNS TRIGGER AS $$
DECLARE
    v_client_id UUID;
    v_tenant_id UUID;
BEGIN
    -- Récupérer le client du projet
    SELECT gp.client_id, gp.tenant_id 
    INTO v_client_id, v_tenant_id
    FROM gantt_tasks gt
    JOIN gantt_projects gp ON gp.id = gt.project_id
    WHERE gt.id = NEW.task_id;
    
    -- Calculer le montant facturable
    NEW.billable_amount := calculate_billable_amount(
        NEW.actual_hours, 
        NEW.overtime_type, 
        v_tenant_id, 
        v_client_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER timesheet_auto_billable
    BEFORE INSERT OR UPDATE ON timesheet_entries
    FOR EACH ROW 
    WHEN (NEW.employee_id IS NOT NULL)
    EXECUTE FUNCTION auto_calculate_billable();

-- Trigger pour audit automatique
CREATE OR REPLACE FUNCTION log_hr_security_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log des changements sensibles
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            INSERT INTO hr_audit_logs (
                tenant_id, user_id, employee_id, action_type, table_name, record_id,
                field_changed, old_value, new_value
            ) VALUES (
                NEW.tenant_id, auth.uid(), NEW.id, 'status_change', TG_TABLE_NAME, NEW.id,
                'status', OLD.status, NEW.status
            );
        END IF;
        
        IF OLD.certifications::text != NEW.certifications::text THEN
            INSERT INTO hr_audit_logs (
                tenant_id, user_id, employee_id, action_type, table_name, record_id,
                field_changed, old_value, new_value
            ) VALUES (
                NEW.tenant_id, auth.uid(), NEW.id, 'certification_update', TG_TABLE_NAME, NEW.id,
                'certifications', OLD.certifications::text, NEW.certifications::text
            );
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_hr_changes
    AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE FUNCTION log_hr_security_changes();

-- =================== DONNÉES INITIALES ===================

-- Créer un profil de facturation par défaut
INSERT INTO client_billing_profiles (
    tenant_id, profile_name, is_default,
    rate_normal, rate_overtime_1_5, rate_overtime_2_0,
    per_diem_rate, vehicle_rate_light, vehicle_rate_trailer,
    custom_rates
) 
SELECT 
    auth.uid() as tenant_id,
    'Profil Standard' as profile_name,
    TRUE as is_default,
    140.00, 210.00, 280.00,
    75.00, 0.450, 0.650,
    '{"engin_lourd": 350, "supervision": 160, "formation": 120, "urgence_weekend": 200}'::jsonb
WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid());

-- =================== VUES UTILES ===================

-- Vue employés avec statut certifications
CREATE VIEW employees_with_cert_status AS
SELECT 
    e.id,
    e.first_name || ' ' || e.last_name as full_name,
    e.role,
    e.status,
    e.certifications,
    -- Vérifier les certifications critiques
    CASE 
        WHEN jsonb_path_exists(e.certifications, '$[*] ? (@.expires < $date)', 
                              jsonb_build_object('date', CURRENT_DATE::text)) 
        THEN 'EXPIRÉ'
        WHEN jsonb_path_exists(e.certifications, '$[*] ? (@.expires < $date)', 
                              jsonb_build_object('date', (CURRENT_DATE + INTERVAL '30 days')::text))
        THEN 'EXPIRE_BIENTÔT'
        ELSE 'VALIDE'
    END as cert_status,
    esr.punctuality_score,
    esr.ast_filled,
    esr.incidents,
    v.license_plate as vehicle_assigned
FROM employees e
LEFT JOIN employee_safety_records esr ON esr.employee_id = e.id 
    AND esr.period_end >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN equipment v ON v.id = e.vehicle_id
WHERE e.status = 'actif';

COMMENT ON TABLE employees IS 'Table employés sécurisée - données minimales pour sécurité et planification';
COMMENT ON TABLE employee_safety_records IS 'Enregistrements sécurité et performance SST';
COMMENT ON TABLE client_billing_profiles IS 'Profils de facturation au niveau client/entreprise';
COMMENT ON VIEW employees_with_cert_status IS 'Vue employés avec statut des certifications';