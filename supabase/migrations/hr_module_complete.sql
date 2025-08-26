-- =================== MODULE RH COMPLET ===================
-- Migration complète pour gestion employés, performance et intégration
-- Focus sur gestion salariale, WIP temps réel et dashboard performance

-- 1. TABLE EMPLOYÉS PRINCIPALE
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informations personnelles
    employee_number VARCHAR(20) UNIQUE, -- Numéro employé unique
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    emergency_contact JSONB DEFAULT '{}', -- {name, phone, relation}
    
    -- Emploi
    position VARCHAR(100) NOT NULL, -- Poste/titre
    department VARCHAR(100), -- Département
    role VARCHAR(50) NOT NULL DEFAULT 'technician', -- tech, supervisor, manager, hr_admin, admin
    manager_id UUID REFERENCES employees(id), -- Superviseur direct
    
    -- Dates importantes  
    hire_date DATE NOT NULL,
    probation_end_date DATE,
    termination_date DATE,
    last_review_date DATE,
    next_review_date DATE,
    
    -- Statut
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated', 'on_leave', 'probation')),
    employment_type VARCHAR(20) DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'temporary')),
    
    -- Taux de rémunération
    hourly_rate_base DECIMAL(8,2) NOT NULL DEFAULT 25.00, -- Taux horaire de base
    overtime_rate_1_5 DECIMAL(8,2), -- Taux 1.5x (calculé auto si NULL)
    overtime_rate_2_0 DECIMAL(8,2), -- Taux 2.0x (calculé auto si NULL) 
    annual_salary DECIMAL(12,2), -- Salaire annuel (pour salariés)
    
    -- Taux de facturation client
    billable_rate DECIMAL(8,2) NOT NULL DEFAULT 75.00, -- Taux facturé au client
    billable_rate_overtime DECIMAL(8,2), -- Taux overtime client
    
    -- Avantages et déductions
    benefits JSONB DEFAULT '{}', -- Assurances, REER, etc.
    deductions JSONB DEFAULT '{}', -- Déductions diverses
    
    -- Compétences et certifications
    skills JSONB DEFAULT '[]', -- ["soudure", "electricite", "hydraulique"]
    certifications JSONB DEFAULT '[]', -- [{cert: "CNESST", number: "123", expires: "2025-12-31"}]
    training_records JSONB DEFAULT '[]', -- Formations suivies
    
    -- Équipement assigné
    vehicle_id UUID REFERENCES vehicles(id), -- Véhicule attitré
    tools_assigned JSONB DEFAULT '[]', -- Outils permanents
    uniform_size JSONB DEFAULT '{}', -- Tailles uniformes/EPI
    
    -- Permissions et accès
    permissions JSONB DEFAULT '{}', -- Accès aux modules par rôle
    security_clearance VARCHAR(20) DEFAULT 'basic', -- basic, confidential, secret
    
    -- Localisation et disponibilité
    home_location POINT, -- Adresse géographique
    assigned_sites JSONB DEFAULT '[]', -- Sites de travail habituels
    work_schedule JSONB DEFAULT '{"type": "standard", "hours": "8h-17h", "days": [1,2,3,4,5]}',
    availability_notes TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    last_modified_by UUID REFERENCES auth.users(id)
);

-- 2. TABLE PERFORMANCE EMPLOYÉ
CREATE TABLE employee_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Période de mesure
    measurement_period VARCHAR(20) NOT NULL, -- 'week', 'month', 'quarter', 'year'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER, -- NULL pour annual
    week INTEGER, -- NULL pour monthly/annual
    
    -- Métriques de productivité
    jobs_assigned INTEGER DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    jobs_completion_rate DECIMAL(5,2) DEFAULT 0, -- %
    
    -- Gestion de projet
    projects_led INTEGER DEFAULT 0, -- En tant que chef
    projects_participated INTEGER DEFAULT 0, -- En tant que membre
    projects_success_rate DECIMAL(5,2) DEFAULT 0, -- %
    
    -- AST et sécurité
    ast_forms_filled INTEGER DEFAULT 0, -- AST initiées
    ast_forms_participated INTEGER DEFAULT 0, -- Participations
    safety_incidents INTEGER DEFAULT 0, -- Incidents rapportés
    safety_near_misses INTEGER DEFAULT 0, -- Presqu'accidents
    epi_compliance_rate DECIMAL(5,2) DEFAULT 100, -- % respect EPI
    safety_score DECIMAL(5,2) DEFAULT 85, -- Score sécurité global
    
    -- Inventaire et outils
    tools_checked_out INTEGER DEFAULT 0,
    tools_returned_on_time INTEGER DEFAULT 0,
    tools_returned_late INTEGER DEFAULT 0,
    tools_lost_damaged INTEGER DEFAULT 0,
    inventory_accuracy_rate DECIMAL(5,2) DEFAULT 100, -- %
    
    -- Ponctualité et discipline
    days_worked INTEGER DEFAULT 0,
    days_late INTEGER DEFAULT 0,
    days_absent INTEGER DEFAULT 0,
    punctuality_score DECIMAL(5,2) DEFAULT 100, -- %
    timesheets_submitted_on_time INTEGER DEFAULT 0,
    timesheets_submitted_late INTEGER DEFAULT 0,
    
    -- Heures travaillées
    regular_hours DECIMAL(8,2) DEFAULT 0,
    overtime_hours DECIMAL(8,2) DEFAULT 0,
    double_time_hours DECIMAL(8,2) DEFAULT 0,
    total_hours DECIMAL(8,2) DEFAULT 0,
    
    -- Véhicule (si assigné)
    vehicle_km_traveled INTEGER DEFAULT 0,
    vehicle_fuel_consumed DECIMAL(8,2) DEFAULT 0, -- Litres
    vehicle_maintenance_issues INTEGER DEFAULT 0,
    vehicle_accidents INTEGER DEFAULT 0,
    
    -- Efficacité et qualité
    estimated_hours DECIMAL(8,2) DEFAULT 0, -- Temps estimé tâches
    actual_hours DECIMAL(8,2) DEFAULT 0, -- Temps réel tâches  
    efficiency_ratio DECIMAL(5,2) DEFAULT 100, -- estimated/actual * 100
    quality_score DECIMAL(5,2) DEFAULT 85, -- Évaluation qualité travail
    client_satisfaction DECIMAL(5,2) DEFAULT 85, -- Feedback client
    
    -- Formation et développement
    training_hours DECIMAL(5,2) DEFAULT 0,
    certifications_obtained INTEGER DEFAULT 0,
    certifications_expired INTEGER DEFAULT 0,
    
    -- Coûts et revenus
    total_salary_cost DECIMAL(12,2) DEFAULT 0, -- Coût salarial période
    total_benefits_cost DECIMAL(12,2) DEFAULT 0, -- Coût avantages
    total_billable_amount DECIMAL(12,2) DEFAULT 0, -- Montant facturé client
    gross_margin DECIMAL(12,2) DEFAULT 0, -- Marge brute
    margin_percentage DECIMAL(5,2) DEFAULT 0, -- % marge
    
    -- Métadonnées
    calculated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. EXTENSION TABLE TIMESHEET_ENTRIES (ajout champs RH)
ALTER TABLE timesheet_entries ADD COLUMN IF NOT EXISTS rate_type VARCHAR(20) DEFAULT 'regular' CHECK (rate_type IN ('regular', 'overtime_1_5', 'overtime_2_0', 'stat_holiday'));
ALTER TABLE timesheet_entries ADD COLUMN IF NOT EXISTS rate_applied DECIMAL(8,2);
ALTER TABLE timesheet_entries ADD COLUMN IF NOT EXISTS salary_amount DECIMAL(8,2); -- Coût salarial
ALTER TABLE timesheet_entries ADD COLUMN IF NOT EXISTS billable_rate DECIMAL(8,2);
ALTER TABLE timesheet_entries ADD COLUMN IF NOT EXISTS billable_amount DECIMAL(8,2); -- Montant facturable
ALTER TABLE timesheet_entries ADD COLUMN IF NOT EXISTS gross_margin DECIMAL(8,2); -- Marge brute
ALTER TABLE timesheet_entries ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id);

-- 4. TABLE ÉVALUATIONS EMPLOYÉ
CREATE TABLE employee_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES employees(id), -- Manager qui évalue
    
    -- Période d'évaluation
    evaluation_type VARCHAR(20) NOT NULL DEFAULT 'annual', -- annual, probation, disciplinary, promotion
    evaluation_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Scores par catégorie (1-5)
    technical_skills INTEGER CHECK (technical_skills >= 1 AND technical_skills <= 5),
    communication_skills INTEGER CHECK (communication_skills >= 1 AND communication_skills <= 5),
    teamwork INTEGER CHECK (teamwork >= 1 AND teamwork <= 5),
    leadership INTEGER CHECK (leadership >= 1 AND leadership <= 5),
    problem_solving INTEGER CHECK (problem_solving >= 1 AND problem_solving <= 5),
    safety_compliance INTEGER CHECK (safety_compliance >= 1 AND safety_compliance <= 5),
    punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
    initiative INTEGER CHECK (initiative >= 1 AND initiative <= 5),
    
    -- Score global
    overall_score DECIMAL(3,2), -- Moyenne pondérée
    
    -- Commentaires
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_next_period TEXT,
    additional_comments TEXT,
    
    -- Actions recommandées
    recommended_actions JSONB DEFAULT '[]', -- training, promotion, disciplinary, etc.
    salary_adjustment_recommended DECIMAL(5,2), -- % augmentation suggérée
    
    -- Statut
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'acknowledged', 'disputed')),
    employee_acknowledgment_date DATE,
    employee_comments TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. TABLE WIP (Work In Progress) - PROJETS
CREATE TABLE project_wip (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES gantt_projects(id),
    
    -- Identification
    project_name VARCHAR(300) NOT NULL,
    client_id UUID REFERENCES clients(id),
    project_status VARCHAR(20) DEFAULT 'active',
    
    -- Dates
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    project_start_date DATE,
    project_end_date DATE,
    
    -- Coûts main-d'œuvre planifiés
    estimated_labor_hours DECIMAL(10,2) DEFAULT 0,
    estimated_labor_cost DECIMAL(12,2) DEFAULT 0, -- Coût salarial estimé
    estimated_billable_amount DECIMAL(12,2) DEFAULT 0, -- Montant client estimé
    estimated_gross_margin DECIMAL(12,2) DEFAULT 0,
    
    -- Coûts main-d'œuvre réels (à date)
    actual_labor_hours DECIMAL(10,2) DEFAULT 0,
    actual_labor_cost DECIMAL(12,2) DEFAULT 0,
    actual_billable_amount DECIMAL(12,2) DEFAULT 0,
    actual_gross_margin DECIMAL(12,2) DEFAULT 0,
    
    -- Coûts matériaux et équipements
    estimated_materials_cost DECIMAL(12,2) DEFAULT 0,
    actual_materials_cost DECIMAL(12,2) DEFAULT 0,
    estimated_equipment_cost DECIMAL(12,2) DEFAULT 0,
    actual_equipment_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Totaux projet
    total_estimated_cost DECIMAL(12,2) DEFAULT 0,
    total_actual_cost DECIMAL(12,2) DEFAULT 0,
    total_estimated_revenue DECIMAL(12,2) DEFAULT 0,
    total_actual_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Métriques de performance
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    cost_variance DECIMAL(12,2) DEFAULT 0, -- Actual - Estimated
    cost_variance_percentage DECIMAL(5,2) DEFAULT 0,
    schedule_variance_days INTEGER DEFAULT 0,
    margin_variance DECIMAL(12,2) DEFAULT 0,
    
    -- Répartition par employé
    employee_breakdown JSONB DEFAULT '[]', -- [{employee_id, hours, cost, revenue}]
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, snapshot_date)
);

-- 6. TABLE SOUMISSIONS/ESTIMATIONS
CREATE TABLE project_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Identification
    estimate_number VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(300) NOT NULL,
    client_id UUID REFERENCES clients(id),
    
    -- Statut et dates
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'won', 'lost')),
    created_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    
    -- Détails main-d'œuvre
    labor_items JSONB DEFAULT '[]', -- [{role, hours, rate, total}]
    total_labor_hours DECIMAL(10,2) DEFAULT 0,
    total_labor_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Détails matériaux
    material_items JSONB DEFAULT '[]', -- [{description, quantity, unit_cost, total}]
    total_materials_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Détails équipements
    equipment_items JSONB DEFAULT '[]', -- [{equipment, days, rate, total}]
    total_equipment_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Sous-traitance
    subcontractor_items JSONB DEFAULT '[]',
    total_subcontractor_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Marges et prix
    direct_costs DECIMAL(12,2) DEFAULT 0,
    markup_percentage DECIMAL(5,2) DEFAULT 25.0,
    markup_amount DECIMAL(12,2) DEFAULT 0,
    total_price DECIMAL(12,2) DEFAULT 0,
    
    -- Conditions
    payment_terms VARCHAR(100),
    delivery_timeline VARCHAR(200),
    warranty_terms TEXT,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 7. TABLE AUDIT RH (Changements sensibles)
CREATE TABLE hr_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Qui et quand
    user_id UUID NOT NULL REFERENCES auth.users(id),
    employee_id UUID REFERENCES employees(id),
    
    -- Action
    action_type VARCHAR(50) NOT NULL, -- salary_change, rate_change, hire, terminate, etc.
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    
    -- Changements
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    
    -- Contexte
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =================== INDEX ET OPTIMISATIONS ===================

-- Index principaux pour performance
CREATE INDEX idx_employees_tenant ON employees(tenant_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_manager ON employees(manager_id);

CREATE INDEX idx_employee_performance_employee ON employee_performance(employee_id);
CREATE INDEX idx_employee_performance_period ON employee_performance(year, month, week);

CREATE INDEX idx_employee_evaluations_employee ON employee_evaluations(employee_id);
CREATE INDEX idx_employee_evaluations_date ON employee_evaluations(evaluation_date);

CREATE INDEX idx_project_wip_tenant ON project_wip(tenant_id);
CREATE INDEX idx_project_wip_project ON project_wip(project_id);
CREATE INDEX idx_project_wip_date ON project_wip(snapshot_date);

CREATE INDEX idx_project_estimates_tenant ON project_estimates(tenant_id);
CREATE INDEX idx_project_estimates_status ON project_estimates(status);

CREATE INDEX idx_hr_audit_tenant ON hr_audit_logs(tenant_id);
CREATE INDEX idx_hr_audit_employee ON hr_audit_logs(employee_id);
CREATE INDEX idx_hr_audit_created ON hr_audit_logs(created_at);

-- Index pour géolocalisation
CREATE INDEX idx_employees_location ON employees USING GIST(home_location);

-- =================== RLS (ROW LEVEL SECURITY) ===================

-- Activer RLS sur toutes les tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_wip ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS multi-tenant pour employees
CREATE POLICY "Users can access their own tenant employees" ON employees
    FOR ALL USING (tenant_id = auth.uid());

CREATE POLICY "Users can access their own tenant performance" ON employee_performance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees e 
            WHERE e.id = employee_performance.employee_id 
            AND e.tenant_id = auth.uid()
        )
    );

-- Politiques similaires pour les autres tables
CREATE POLICY "Users can access their own tenant evaluations" ON employee_evaluations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees e 
            WHERE e.id = employee_evaluations.employee_id 
            AND e.tenant_id = auth.uid()
        )
    );

CREATE POLICY "Users can access their own tenant wip" ON project_wip
    FOR ALL USING (tenant_id = auth.uid());

CREATE POLICY "Users can access their own tenant estimates" ON project_estimates
    FOR ALL USING (tenant_id = auth.uid());

CREATE POLICY "Users can access their own tenant audit logs" ON hr_audit_logs
    FOR ALL USING (tenant_id = auth.uid());

-- =================== FONCTIONS UTILITAIRES ===================

-- Fonction pour calculer les taux overtime automatiquement
CREATE OR REPLACE FUNCTION calculate_overtime_rates()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculer taux 1.5x si NULL
    IF NEW.overtime_rate_1_5 IS NULL THEN
        NEW.overtime_rate_1_5 := NEW.hourly_rate_base * 1.5;
    END IF;
    
    -- Calculer taux 2.0x si NULL  
    IF NEW.overtime_rate_2_0 IS NULL THEN
        NEW.overtime_rate_2_0 := NEW.hourly_rate_base * 2.0;
    END IF;
    
    -- Calculer taux overtime facturable si NULL
    IF NEW.billable_rate_overtime IS NULL THEN
        NEW.billable_rate_overtime := NEW.billable_rate * 1.5;
    END IF;
    
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calcul automatique des taux
CREATE TRIGGER auto_calculate_overtime_rates
    BEFORE INSERT OR UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION calculate_overtime_rates();

-- Fonction pour mettre à jour les métriques WIP
CREATE OR REPLACE FUNCTION update_project_wip_metrics(p_project_id UUID, p_snapshot_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    v_tenant_id UUID;
    v_project_name VARCHAR(300);
    v_actual_hours DECIMAL(10,2);
    v_actual_labor_cost DECIMAL(12,2);
    v_actual_billable DECIMAL(12,2);
BEGIN
    -- Récupérer les informations du projet
    SELECT gp.tenant_id, gp.name 
    INTO v_tenant_id, v_project_name
    FROM gantt_projects gp 
    WHERE gp.id = p_project_id;
    
    IF v_tenant_id IS NULL THEN
        RETURN; -- Projet non trouvé
    END IF;
    
    -- Calculer les heures et coûts réels à partir des timesheets
    SELECT 
        COALESCE(SUM(te.actual_hours), 0),
        COALESCE(SUM(te.salary_amount), 0),
        COALESCE(SUM(te.billable_amount), 0)
    INTO v_actual_hours, v_actual_labor_cost, v_actual_billable
    FROM timesheet_entries te
    JOIN gantt_tasks gt ON gt.id = te.task_id
    WHERE gt.project_id = p_project_id
    AND te.date <= p_snapshot_date;
    
    -- Insérer ou mettre à jour les métriques WIP
    INSERT INTO project_wip (
        tenant_id, project_id, project_name, snapshot_date,
        actual_labor_hours, actual_labor_cost, actual_billable_amount,
        actual_gross_margin, updated_at
    ) VALUES (
        v_tenant_id, p_project_id, v_project_name, p_snapshot_date,
        v_actual_hours, v_actual_labor_cost, v_actual_billable,
        v_actual_billable - v_actual_labor_cost, NOW()
    )
    ON CONFLICT (project_id, snapshot_date)
    DO UPDATE SET
        actual_labor_hours = EXCLUDED.actual_labor_hours,
        actual_labor_cost = EXCLUDED.actual_labor_cost,
        actual_billable_amount = EXCLUDED.actual_billable_amount,
        actual_gross_margin = EXCLUDED.actual_gross_margin,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour calculer les métriques de performance automatiquement
CREATE OR REPLACE FUNCTION calculate_employee_performance(
    p_employee_id UUID,
    p_period_type VARCHAR(20),
    p_year INTEGER,
    p_month INTEGER DEFAULT NULL,
    p_week INTEGER DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_period_start DATE;
    v_period_end DATE;
    v_performance RECORD;
BEGIN
    -- Calculer les dates de la période
    CASE p_period_type
        WHEN 'week' THEN
            v_period_start := DATE_TRUNC('week', MAKE_DATE(p_year, 1, 1)) + (p_week - 1) * INTERVAL '1 week';
            v_period_end := v_period_start + INTERVAL '6 days';
        WHEN 'month' THEN
            v_period_start := MAKE_DATE(p_year, p_month, 1);
            v_period_end := v_period_start + INTERVAL '1 month' - INTERVAL '1 day';
        WHEN 'year' THEN
            v_period_start := MAKE_DATE(p_year, 1, 1);
            v_period_end := MAKE_DATE(p_year, 12, 31);
    END CASE;
    
    -- Calculer les métriques depuis les timesheets et autres tables
    SELECT 
        COUNT(DISTINCT te.task_id) as jobs_participated,
        COALESCE(SUM(te.actual_hours), 0) as total_hours,
        COALESCE(SUM(CASE WHEN te.rate_type = 'overtime_1_5' THEN te.actual_hours ELSE 0 END), 0) as overtime_hours,
        COALESCE(SUM(te.salary_amount), 0) as total_salary_cost,
        COALESCE(SUM(te.billable_amount), 0) as total_billable_amount
    INTO v_performance
    FROM timesheet_entries te
    WHERE te.employee_id = p_employee_id
    AND te.date BETWEEN v_period_start AND v_period_end;
    
    -- Insérer/mettre à jour la performance
    INSERT INTO employee_performance (
        employee_id, measurement_period, period_start, period_end,
        year, month, week, jobs_participated, total_hours, overtime_hours,
        total_salary_cost, total_billable_amount, 
        gross_margin, margin_percentage, calculated_at
    ) VALUES (
        p_employee_id, p_period_type, v_period_start, v_period_end,
        p_year, p_month, p_week, v_performance.jobs_participated,
        v_performance.total_hours, v_performance.overtime_hours,
        v_performance.total_salary_cost, v_performance.total_billable_amount,
        v_performance.total_billable_amount - v_performance.total_salary_cost,
        CASE WHEN v_performance.total_billable_amount > 0 
             THEN ((v_performance.total_billable_amount - v_performance.total_salary_cost) / v_performance.total_billable_amount) * 100
             ELSE 0 END,
        NOW()
    )
    ON CONFLICT (employee_id, measurement_period, year, month, week)
    DO UPDATE SET
        jobs_participated = EXCLUDED.jobs_participated,
        total_hours = EXCLUDED.total_hours,
        overtime_hours = EXCLUDED.overtime_hours,
        total_salary_cost = EXCLUDED.total_salary_cost,
        total_billable_amount = EXCLUDED.total_billable_amount,
        gross_margin = EXCLUDED.gross_margin,
        margin_percentage = EXCLUDED.margin_percentage,
        calculated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour audit automatique des changements sensibles
CREATE OR REPLACE FUNCTION log_hr_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log des changements de salaire
    IF TG_OP = 'UPDATE' AND (
        OLD.hourly_rate_base != NEW.hourly_rate_base OR
        OLD.billable_rate != NEW.billable_rate OR
        OLD.status != NEW.status
    ) THEN
        INSERT INTO hr_audit_logs (
            tenant_id, user_id, employee_id, action_type, table_name, record_id,
            field_changed, old_value, new_value
        ) VALUES (
            NEW.tenant_id, auth.uid(), NEW.id, 'SALARY_CHANGE', TG_TABLE_NAME, NEW.id,
            'hourly_rate_base', OLD.hourly_rate_base::text, NEW.hourly_rate_base::text
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger d'audit
CREATE TRIGGER audit_employee_changes
    AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE FUNCTION log_hr_changes();

-- =================== VUES UTILES ===================

-- Vue résumé employés actifs
CREATE VIEW employees_summary AS
SELECT 
    e.id,
    e.employee_number,
    e.first_name || ' ' || e.last_name as full_name,
    e.position,
    e.department,
    e.role,
    e.status,
    e.hire_date,
    e.hourly_rate_base,
    e.billable_rate,
    e.billable_rate - e.hourly_rate_base as margin_per_hour,
    v.make || ' ' || v.model as vehicle_assigned,
    COUNT(DISTINCT te.task_id) as active_tasks_count
FROM employees e
LEFT JOIN vehicles v ON v.id = e.vehicle_id
LEFT JOIN timesheet_entries te ON te.employee_id = e.id 
    AND te.date >= CURRENT_DATE - INTERVAL '7 days'
WHERE e.status = 'active'
GROUP BY e.id, e.employee_number, e.first_name, e.last_name, 
         e.position, e.department, e.role, e.status, e.hire_date,
         e.hourly_rate_base, e.billable_rate, v.make, v.model;

COMMENT ON TABLE employees IS 'Table principale employés avec gestion salariale et facturable';
COMMENT ON TABLE employee_performance IS 'Métriques de performance calculées automatiquement';
COMMENT ON TABLE project_wip IS 'Work In Progress - suivi coûts/revenus projets temps réel';
COMMENT ON VIEW employees_summary IS 'Vue résumé pour dashboard RH';