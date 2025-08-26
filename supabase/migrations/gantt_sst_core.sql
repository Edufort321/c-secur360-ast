-- =================== PLANIFICATEUR GANTT SST ===================
-- Migration complète pour planificateur Gantt nouvelle génération
-- Focus Santé-Sécurité avec IA intégrée

-- 1. CALENDRIERS DE TRAVAIL
CREATE TABLE work_calendars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) DEFAULT 'standard' CHECK (type IN ('standard', 'shift', '24_7', 'custom')),
    timezone VARCHAR(50) DEFAULT 'America/Montreal',
    working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Lundi, 7=Dimanche
    working_hours JSONB DEFAULT '{"start": "08:00", "end": "17:00", "lunch_break": {"start": "12:00", "duration": 60}}',
    holidays JSONB DEFAULT '[]', -- [{date: "2024-12-25", name: "Noël"}]
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. RESSOURCES (Personnes, Équipements, EPI)
CREATE TABLE gantt_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('person', 'equipment', 'epi', 'vehicle', 'tool')),
    
    -- Référence vers tables existantes selon le type
    user_id UUID REFERENCES auth.users(id), -- Si type='person'
    vehicle_id UUID REFERENCES vehicles(id), -- Si type='vehicle' 
    inventory_item_id UUID REFERENCES inventory_items(id), -- Si type='epi'/'tool'
    
    -- Capacité et coûts
    max_capacity DECIMAL(8,2) DEFAULT 1.0, -- % ou heures max/jour
    cost_rate DECIMAL(10,2) DEFAULT 0, -- $/heure ou $/jour
    calendar_id UUID REFERENCES work_calendars(id),
    
    -- Compétences et certifications (pour personnes)
    skills JSONB DEFAULT '[]', -- ["soudure", "electricite", "sst"]
    certifications JSONB DEFAULT '[]', -- [{cert: "CNESST", expires: "2025-12-31"}]
    safety_level INTEGER DEFAULT 1 CHECK (safety_level >= 1 AND safety_level <= 5),
    
    -- Localisation et disponibilité
    location VARCHAR(200),
    is_available BOOLEAN DEFAULT TRUE,
    availability_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. DISPONIBILITÉS ET EXCEPTIONS
CREATE TABLE resource_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES gantt_resources(id) ON DELETE CASCADE,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('available', 'unavailable', 'vacation', 'sick', 'training', 'maintenance')),
    capacity_percent DECIMAL(5,2) DEFAULT 100.0 CHECK (capacity_percent >= 0 AND capacity_percent <= 100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. PROJETS GANTT (Extension des projets existants)
CREATE TABLE gantt_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id), -- Lien vers projet C-Secur360
    
    name VARCHAR(300) NOT NULL,
    description TEXT,
    client_id UUID REFERENCES clients(id),
    manager_id UUID REFERENCES auth.users(id),
    
    -- Dates et contraintes
    planned_start DATE NOT NULL,
    planned_end DATE NOT NULL,
    actual_start DATE,
    actual_end DATE,
    
    -- Budget et coûts
    planned_budget DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Paramètres Gantt
    calendar_id UUID REFERENCES work_calendars(id),
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    
    -- SST et conformité
    safety_requirements JSONB DEFAULT '[]', -- Exigences sécurité spécifiques
    required_certifications JSONB DEFAULT '[]',
    risk_level INTEGER DEFAULT 2 CHECK (risk_level >= 1 AND risk_level <= 5),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. TÂCHES GANTT
CREATE TABLE gantt_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES gantt_projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES gantt_tasks(id), -- Pour hiérarchie WBS
    
    -- Identification
    wbs_code VARCHAR(50), -- 1.2.3.1
    name VARCHAR(500) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) DEFAULT 'work', -- 'work', 'milestone', 'summary'
    
    -- Planification
    planned_start TIMESTAMP NOT NULL,
    planned_end TIMESTAMP NOT NULL,
    planned_duration INTERVAL NOT NULL, -- En heures de travail
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    actual_duration INTERVAL,
    
    -- Progression
    progress_percent DECIMAL(5,2) DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    physical_percent DECIMAL(5,2) DEFAULT 0, -- Avancement physique réel
    
    -- Ressources et coûts
    planned_effort DECIMAL(10,2) DEFAULT 0, -- Heures-personnes
    actual_effort DECIMAL(10,2) DEFAULT 0,
    planned_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Contraintes et priorité
    constraint_type VARCHAR(20) DEFAULT 'ASAP' CHECK (constraint_type IN ('ASAP', 'ALAP', 'MSO', 'MFO', 'SNET', 'SNLT', 'FNET', 'FNLT')),
    constraint_date TIMESTAMP,
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    is_critical BOOLEAN DEFAULT FALSE,
    
    -- SST et conformité
    safety_requirements JSONB DEFAULT '[]',
    required_certifications JSONB DEFAULT '[]',
    epi_requirements JSONB DEFAULT '[]', -- EPI obligatoires
    ast_form_id UUID REFERENCES ast_forms(id), -- AST auto-générée
    permits_required JSONB DEFAULT '[]', -- Permis nécessaires
    min_team_size INTEGER DEFAULT 1,
    max_team_size INTEGER,
    
    -- IA et automatisation
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_confidence DECIMAL(3,2) DEFAULT 0, -- Score de confiance IA
    auto_schedule BOOLEAN DEFAULT TRUE,
    
    -- Statut et validation
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'ready', 'active', 'paused', 'completed', 'cancelled')),
    approval_status VARCHAR(20) DEFAULT 'draft' CHECK (approval_status IN ('draft', 'submitted', 'approved', 'rejected')),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. LIENS DE DÉPENDANCES ENTRE TÂCHES
CREATE TABLE gantt_task_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    predecessor_id UUID NOT NULL REFERENCES gantt_tasks(id) ON DELETE CASCADE,
    successor_id UUID NOT NULL REFERENCES gantt_tasks(id) ON DELETE CASCADE,
    
    link_type VARCHAR(5) NOT NULL DEFAULT 'FS' CHECK (link_type IN ('FS', 'SS', 'FF', 'SF')),
    lag_duration INTERVAL DEFAULT '0 hours', -- Retard/avance
    
    -- Validation et contraintes
    is_hard_constraint BOOLEAN DEFAULT TRUE, -- Contrainte ferme ou souple
    safety_critical BOOLEAN DEFAULT FALSE, -- Lien critique pour sécurité
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Éviter les cycles
    CONSTRAINT no_self_link CHECK (predecessor_id != successor_id)
);

-- 7. ASSIGNATIONS DE RESSOURCES
CREATE TABLE gantt_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES gantt_tasks(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES gantt_resources(id) ON DELETE CASCADE,
    
    -- Allocation
    allocation_percent DECIMAL(5,2) DEFAULT 100 CHECK (allocation_percent > 0 AND allocation_percent <= 100),
    planned_work DECIMAL(10,2) NOT NULL, -- Heures planifiées
    actual_work DECIMAL(10,2) DEFAULT 0, -- Heures réelles
    
    -- Coûts
    cost_rate DECIMAL(10,2), -- Taux spécifique pour cette assignation
    planned_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Statut et validation SST
    assignment_status VARCHAR(20) DEFAULT 'assigned' CHECK (assignment_status IN ('assigned', 'accepted', 'started', 'completed', 'cancelled')),
    safety_clearance BOOLEAN DEFAULT FALSE, -- Validation sécurité
    certifications_verified BOOLEAN DEFAULT FALSE,
    epi_assigned BOOLEAN DEFAULT FALSE,
    
    -- Dates effectives
    assigned_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. BASELINES (Versions de référence)
CREATE TABLE gantt_baselines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES gantt_projects(id) ON DELETE CASCADE,
    
    baseline_number INTEGER NOT NULL DEFAULT 0,
    name VARCHAR(200),
    description TEXT,
    
    -- Dates de référence projet
    baseline_start TIMESTAMP NOT NULL,
    baseline_finish TIMESTAMP NOT NULL,
    baseline_cost DECIMAL(12,2) NOT NULL,
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, baseline_number)
);

-- 9. DONNÉES BASELINE PAR TÂCHE
CREATE TABLE gantt_task_baselines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baseline_id UUID NOT NULL REFERENCES gantt_baselines(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES gantt_tasks(id) ON DELETE CASCADE,
    
    baseline_start TIMESTAMP NOT NULL,
    baseline_finish TIMESTAMP NOT NULL,
    baseline_duration INTERVAL NOT NULL,
    baseline_work DECIMAL(10,2) NOT NULL,
    baseline_cost DECIMAL(12,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(baseline_id, task_id)
);

-- 10. JOURNAUX DE BORD (Texte libre → IA)
CREATE TABLE gantt_work_journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES gantt_projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES gantt_tasks(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Journal libre
    journal_date DATE NOT NULL,
    work_description TEXT NOT NULL, -- Texte libre utilisateur
    hours_worked DECIMAL(5,2),
    
    -- Photos et fichiers
    attachments JSONB DEFAULT '[]', -- URLs photos/docs
    location_gps POINT,
    location_name VARCHAR(200),
    
    -- Résumé IA
    ai_summary TEXT, -- Résumé structuré par IA
    ai_tags JSONB DEFAULT '[]', -- Tags automatiques
    ai_processed_at TIMESTAMP,
    
    -- Validation et statut
    is_validated BOOLEAN DEFAULT FALSE,
    validated_by UUID REFERENCES auth.users(id),
    validated_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11. RÉSERVATIONS D'ÉQUIPEMENTS/EPI
CREATE TABLE gantt_equipment_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES gantt_tasks(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES gantt_resources(id) ON DELETE CASCADE,
    
    reservation_start TIMESTAMP NOT NULL,
    reservation_end TIMESTAMP NOT NULL,
    quantity DECIMAL(8,2) DEFAULT 1,
    
    -- Statut réservation
    status VARCHAR(20) DEFAULT 'reserved' CHECK (status IN ('reserved', 'confirmed', 'checked_out', 'in_use', 'returned', 'cancelled')),
    
    -- QR Code pour check-in/out
    qr_code VARCHAR(100) UNIQUE,
    checked_out_at TIMESTAMP,
    checked_in_at TIMESTAMP,
    checked_out_by UUID REFERENCES auth.users(id),
    checked_in_by UUID REFERENCES auth.users(id),
    
    -- Validation sécurité
    safety_inspection BOOLEAN DEFAULT FALSE,
    inspection_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- 12. MÉTRIQUES EVM (Earned Value Management)
CREATE TABLE gantt_evm_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES gantt_projects(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    
    -- Métriques EVM
    planned_value DECIMAL(12,2) NOT NULL, -- PV
    earned_value DECIMAL(12,2) NOT NULL,  -- EV
    actual_cost DECIMAL(12,2) NOT NULL,   -- AC
    
    -- Indices calculés
    cost_performance_index DECIMAL(6,4), -- CPI = EV/AC
    schedule_performance_index DECIMAL(6,4), -- SPI = EV/PV
    
    -- Variances
    cost_variance DECIMAL(12,2), -- CV = EV - AC
    schedule_variance DECIMAL(12,2), -- SV = EV - PV
    
    -- Prévisions
    estimate_at_completion DECIMAL(12,2), -- EAC
    estimate_to_complete DECIMAL(12,2), -- ETC
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, snapshot_date)
);

-- 13. ÉVÉNEMENTS DE PLANIFICATION (Audit)
CREATE TABLE gantt_planning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES gantt_projects(id),
    task_id UUID REFERENCES gantt_tasks(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    event_type VARCHAR(50) NOT NULL, -- 'task_created', 'rescheduled', 'resource_assigned', etc.
    event_data JSONB NOT NULL,
    
    -- Contexte
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =================== INDEX ET OPTIMISATIONS ===================

-- Index principaux pour performance
CREATE INDEX idx_gantt_resources_tenant ON gantt_resources(tenant_id);
CREATE INDEX idx_gantt_resources_type ON gantt_resources(type);
CREATE INDEX idx_gantt_projects_tenant ON gantt_projects(tenant_id);
CREATE INDEX idx_gantt_tasks_project ON gantt_tasks(project_id);
CREATE INDEX idx_gantt_tasks_dates ON gantt_tasks(planned_start, planned_end);
CREATE INDEX idx_gantt_assignments_task ON gantt_assignments(task_id);
CREATE INDEX idx_gantt_assignments_resource ON gantt_assignments(resource_id);
CREATE INDEX idx_gantt_task_links_pred ON gantt_task_links(predecessor_id);
CREATE INDEX idx_gantt_task_links_succ ON gantt_task_links(successor_id);
CREATE INDEX idx_gantt_journals_project ON gantt_work_journals(project_id);
CREATE INDEX idx_gantt_journals_date ON gantt_work_journals(journal_date);
CREATE INDEX idx_gantt_events_project ON gantt_planning_events(project_id);
CREATE INDEX idx_gantt_events_created ON gantt_planning_events(created_at);

-- Index GiST pour géolocalisation
CREATE INDEX idx_gantt_journals_location ON gantt_work_journals USING GIST(location_gps);

-- =================== RLS (ROW LEVEL SECURITY) ===================

-- Activer RLS sur toutes les tables
ALTER TABLE work_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_task_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_task_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_work_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_equipment_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_evm_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_planning_events ENABLE ROW LEVEL SECURITY;

-- Politiques RLS multi-tenant
CREATE POLICY "Users can access their own tenant data" ON work_calendars
    FOR ALL USING (tenant_id = auth.uid());

CREATE POLICY "Users can access their own tenant data" ON gantt_resources
    FOR ALL USING (tenant_id = auth.uid());

CREATE POLICY "Users can access their own tenant data" ON gantt_projects
    FOR ALL USING (tenant_id = auth.uid());

CREATE POLICY "Users can access project tasks" ON gantt_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM gantt_projects gp 
            WHERE gp.id = gantt_tasks.project_id 
            AND gp.tenant_id = auth.uid()
        )
    );

-- Politiques similaires pour les autres tables (par souci de brièveté)

-- =================== FONCTIONS UTILITAIRES ===================

-- Fonction pour calculer le chemin critique
CREATE OR REPLACE FUNCTION calculate_critical_path(p_project_id UUID)
RETURNS TABLE (
    task_id UUID,
    is_critical BOOLEAN,
    total_float INTERVAL,
    free_float INTERVAL
) AS $$
BEGIN
    -- Algorithme CPM simplifié (à implémenter complètement)
    RETURN QUERY
    SELECT 
        gt.id,
        TRUE::BOOLEAN, -- Placeholder
        '0 hours'::INTERVAL,
        '0 hours'::INTERVAL
    FROM gantt_tasks gt
    WHERE gt.project_id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour les EVM
CREATE OR REPLACE FUNCTION update_evm_snapshot(p_project_id UUID, p_snapshot_date DATE)
RETURNS VOID AS $$
DECLARE
    v_pv DECIMAL(12,2);
    v_ev DECIMAL(12,2);
    v_ac DECIMAL(12,2);
BEGIN
    -- Calculer PV (Planned Value)
    SELECT COALESCE(SUM(planned_cost), 0)
    INTO v_pv
    FROM gantt_tasks
    WHERE project_id = p_project_id
    AND planned_start <= p_snapshot_date::TIMESTAMP;
    
    -- Calculer EV (Earned Value)
    SELECT COALESCE(SUM(planned_cost * progress_percent / 100), 0)
    INTO v_ev
    FROM gantt_tasks
    WHERE project_id = p_project_id
    AND planned_start <= p_snapshot_date::TIMESTAMP;
    
    -- Calculer AC (Actual Cost)
    SELECT COALESCE(SUM(actual_cost), 0)
    INTO v_ac
    FROM gantt_tasks
    WHERE project_id = p_project_id
    AND actual_start IS NOT NULL;
    
    -- Insérer/mettre à jour le snapshot
    INSERT INTO gantt_evm_snapshots (
        project_id, snapshot_date, planned_value, earned_value, actual_cost,
        cost_performance_index, schedule_performance_index,
        cost_variance, schedule_variance
    ) VALUES (
        p_project_id, p_snapshot_date, v_pv, v_ev, v_ac,
        CASE WHEN v_ac > 0 THEN v_ev / v_ac ELSE NULL END,
        CASE WHEN v_pv > 0 THEN v_ev / v_pv ELSE NULL END,
        v_ev - v_ac,
        v_ev - v_pv
    )
    ON CONFLICT (project_id, snapshot_date)
    DO UPDATE SET
        planned_value = EXCLUDED.planned_value,
        earned_value = EXCLUDED.earned_value,
        actual_cost = EXCLUDED.actual_cost,
        cost_performance_index = EXCLUDED.cost_performance_index,
        schedule_performance_index = EXCLUDED.schedule_performance_index,
        cost_variance = EXCLUDED.cost_variance,
        schedule_variance = EXCLUDED.schedule_variance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour audit automatique
CREATE OR REPLACE FUNCTION log_gantt_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO gantt_planning_events (
        project_id, task_id, user_id, event_type, event_data
    ) VALUES (
        COALESCE(NEW.project_id, OLD.project_id),
        COALESCE(NEW.id, OLD.id),
        auth.uid(),
        TG_OP || '_' || TG_TABLE_NAME,
        jsonb_build_object(
            'old', row_to_json(OLD),
            'new', row_to_json(NEW)
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger sur les tables critiques
CREATE TRIGGER audit_gantt_tasks
    AFTER INSERT OR UPDATE OR DELETE ON gantt_tasks
    FOR EACH ROW EXECUTE FUNCTION log_gantt_changes();

CREATE TRIGGER audit_gantt_assignments
    AFTER INSERT OR UPDATE OR DELETE ON gantt_assignments
    FOR EACH ROW EXECUTE FUNCTION log_gantt_changes();

-- =================== VUES MATÉRIALISÉES ===================

-- Vue pour performance du dashboard
CREATE MATERIALIZED VIEW gantt_project_summary AS
SELECT 
    gp.id AS project_id,
    gp.tenant_id,
    gp.name,
    gp.status,
    COUNT(gt.id) AS total_tasks,
    COUNT(CASE WHEN gt.status = 'completed' THEN 1 END) AS completed_tasks,
    COALESCE(AVG(gt.progress_percent), 0) AS avg_progress,
    COALESCE(SUM(gt.planned_cost), 0) AS total_planned_cost,
    COALESCE(SUM(gt.actual_cost), 0) AS total_actual_cost,
    COUNT(DISTINCT ga.resource_id) AS assigned_resources,
    gp.planned_start,
    gp.planned_end,
    gp.created_at
FROM gantt_projects gp
LEFT JOIN gantt_tasks gt ON gt.project_id = gp.id
LEFT JOIN gantt_assignments ga ON ga.task_id = gt.id
GROUP BY gp.id, gp.tenant_id, gp.name, gp.status, gp.planned_start, gp.planned_end, gp.created_at;

-- Index pour la vue matérialisée
CREATE INDEX idx_gantt_project_summary_tenant ON gantt_project_summary(tenant_id);

-- Refresh automatique (optionnel)
-- SELECT cron.schedule('refresh-gantt-summary', '*/15 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY gantt_project_summary;');

COMMENT ON TABLE gantt_projects IS 'Projets Gantt avec focus santé-sécurité et IA';
COMMENT ON TABLE gantt_tasks IS 'Tâches avec contraintes SST, EPI et certifications';
COMMENT ON TABLE gantt_work_journals IS 'Journaux terrain libres transformés par IA';