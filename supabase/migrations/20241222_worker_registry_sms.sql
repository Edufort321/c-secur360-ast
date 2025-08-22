-- Migration: Système de registre des travailleurs avec SMS et LOTO
-- Date: 2024-12-22
-- Description: Tables pour WorkerRegistryAST, gestion SMS et cadenas LOTO

-- =================== TABLE WORKER REGISTRY ===================

-- Extension de la table workers existante ou création
CREATE TABLE IF NOT EXISTS worker_registry_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ast_id UUID NOT NULL, -- Référence à l'AST
    tenant_id TEXT NOT NULL,
    
    -- Informations travailleur
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    employee_number TEXT,
    certification TEXT[] DEFAULT '{}',
    
    -- Signature et consentement
    signature_base64 TEXT, -- Signature électronique en base64
    consent_timestamp TIMESTAMPTZ,
    ast_validated BOOLEAN DEFAULT FALSE,
    consent_text TEXT, -- Texte du consentement signé
    
    -- Timer de travail
    work_start_time TIMESTAMPTZ,
    work_end_time TIMESTAMPTZ,
    total_work_time_ms BIGINT DEFAULT 0, -- Temps total en millisecondes
    is_timer_active BOOLEAN DEFAULT FALSE,
    
    -- Métadonnées
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    device_info JSONB,
    
    -- Index et contraintes
    CONSTRAINT valid_phone_number CHECK (phone_number ~ '^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$'),
    CONSTRAINT valid_work_times CHECK (work_end_time IS NULL OR work_end_time > work_start_time)
);

-- =================== TABLE WORK BREAKS ===================

CREATE TABLE IF NOT EXISTS worker_breaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_registry_id UUID NOT NULL REFERENCES worker_registry_entries(id) ON DELETE CASCADE,
    
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    reason TEXT NOT NULL DEFAULT 'pause',
    duration_ms BIGINT, -- Calculé automatiquement
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_break_times CHECK (end_time IS NULL OR end_time > start_time)
);

-- =================== TABLE LOTO LOCKS ===================

CREATE TABLE IF NOT EXISTS loto_locks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ast_id UUID NOT NULL,
    tenant_id TEXT NOT NULL,
    
    -- Informations du cadenas
    lock_number TEXT NOT NULL,
    energy_type TEXT NOT NULL CHECK (energy_type IN ('electrical', 'mechanical', 'hydraulic', 'pneumatic', 'thermal', 'chemical')),
    equipment_name TEXT NOT NULL,
    location_description TEXT NOT NULL,
    
    -- État du cadenas
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'applied', 'verified', 'removed')),
    is_applied BOOLEAN DEFAULT FALSE,
    
    -- Travailleur qui l'a appliqué
    applied_by_worker_id UUID REFERENCES worker_registry_entries(id),
    applied_at TIMESTAMPTZ,
    removed_at TIMESTAMPTZ,
    
    -- Photos et documentation
    photos TEXT[] DEFAULT '{}', -- URLs des photos
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(ast_id, lock_number),
    CONSTRAINT valid_lock_times CHECK (removed_at IS NULL OR removed_at > applied_at)
);

-- =================== TABLE SMS ALERTS ===================

CREATE TABLE IF NOT EXISTS sms_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ast_id UUID NOT NULL,
    tenant_id TEXT NOT NULL,
    
    -- Type et contenu
    alert_type TEXT NOT NULL CHECK (alert_type IN ('lock_applied', 'lock_removed', 'general_alert', 'emergency', 'work_completion')),
    message TEXT NOT NULL,
    
    -- Expéditeur
    sent_by_user_id UUID, -- ID du chargé de projet
    sent_by_name TEXT NOT NULL,
    sent_by_phone TEXT,
    
    -- Destinataires
    recipients TEXT[] NOT NULL, -- Numéros de téléphone
    recipient_names TEXT[], -- Noms correspondants
    
    -- Statut d'envoi
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'partial')),
    sent_at TIMESTAMPTZ,
    delivery_status JSONB, -- Statut par destinataire
    
    -- Métadonnées
    sms_service_provider TEXT DEFAULT 'twilio',
    cost_cents INTEGER, -- Coût en centimes
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index pour performance
    INDEX idx_sms_alerts_ast_id ON sms_alerts(ast_id),
    INDEX idx_sms_alerts_created_at ON sms_alerts(created_at)
);

-- =================== TABLE SMS CONSENT ===================

CREATE TABLE IF NOT EXISTS sms_consent (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_registry_id UUID NOT NULL REFERENCES worker_registry_entries(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    
    -- Consentement
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    consent_timestamp TIMESTAMPTZ,
    consent_text TEXT, -- Texte du consentement
    consent_ip INET,
    
    -- Révocation
    revoked BOOLEAN DEFAULT FALSE,
    revoked_timestamp TIMESTAMPTZ,
    revoked_reason TEXT,
    
    -- Validation du numéro
    phone_verified BOOLEAN DEFAULT FALSE,
    verification_code TEXT,
    verification_attempts INTEGER DEFAULT 0,
    verification_timestamp TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(worker_registry_id, phone_number)
);

-- =================== TABLE AUDIT TRAIL ===================

CREATE TABLE IF NOT EXISTS worker_registry_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ast_id UUID NOT NULL,
    tenant_id TEXT NOT NULL,
    
    -- Événement
    event_type TEXT NOT NULL, -- 'worker_registered', 'work_started', 'work_ended', 'lock_applied', 'lock_removed', 'sms_sent'
    entity_type TEXT NOT NULL, -- 'worker', 'lock', 'sms'
    entity_id UUID, -- ID de l'entité concernée
    
    -- Acteur
    actor_type TEXT NOT NULL, -- 'worker', 'manager', 'system'
    actor_id UUID,
    actor_name TEXT,
    
    -- Détails
    old_data JSONB,
    new_data JSONB,
    description TEXT,
    
    -- Métadonnées
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index
    INDEX idx_audit_ast_id ON worker_registry_audit(ast_id),
    INDEX idx_audit_timestamp ON worker_registry_audit(timestamp),
    INDEX idx_audit_event_type ON worker_registry_audit(event_type)
);

-- =================== FONCTIONS TRIGGERS ===================

-- Fonction pour calculer la durée des pauses
CREATE OR REPLACE FUNCTION calculate_break_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) * 1000;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer automatiquement la durée des pauses
CREATE TRIGGER trigger_calculate_break_duration
    BEFORE INSERT OR UPDATE ON worker_breaks
    FOR EACH ROW
    EXECUTE FUNCTION calculate_break_duration();

-- Fonction pour mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at sur loto_locks
CREATE TRIGGER trigger_loto_locks_updated_at
    BEFORE UPDATE ON loto_locks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour updated_at sur sms_consent
CREATE TRIGGER trigger_sms_consent_updated_at
    BEFORE UPDATE ON sms_consent
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =================== RLS (ROW LEVEL SECURITY) ===================

-- Activer RLS sur toutes les tables
ALTER TABLE worker_registry_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE loto_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_registry_audit ENABLE ROW LEVEL SECURITY;

-- Politique pour worker_registry_entries (accès par tenant)
CREATE POLICY "Workers can access their own data" ON worker_registry_entries
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant', true) OR
        auth.uid()::text = ANY(
            SELECT user_id::text FROM user_tenants 
            WHERE tenant_id = worker_registry_entries.tenant_id
        )
    );

-- Politique pour loto_locks (accès par tenant)
CREATE POLICY "LOTO locks access by tenant" ON loto_locks
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant', true) OR
        auth.uid()::text = ANY(
            SELECT user_id::text FROM user_tenants 
            WHERE tenant_id = loto_locks.tenant_id
        )
    );

-- Politique pour sms_alerts (accès par tenant)
CREATE POLICY "SMS alerts access by tenant" ON sms_alerts
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant', true) OR
        auth.uid()::text = ANY(
            SELECT user_id::text FROM user_tenants 
            WHERE tenant_id = sms_alerts.tenant_id
        )
    );

-- Politique pour worker_breaks (via worker_registry_entries)
CREATE POLICY "Worker breaks access" ON worker_breaks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM worker_registry_entries wre
            WHERE wre.id = worker_breaks.worker_registry_id
            AND (
                wre.tenant_id = current_setting('app.current_tenant', true) OR
                auth.uid()::text = ANY(
                    SELECT user_id::text FROM user_tenants 
                    WHERE tenant_id = wre.tenant_id
                )
            )
        )
    );

-- Politique pour sms_consent (via worker_registry_entries)
CREATE POLICY "SMS consent access" ON sms_consent
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM worker_registry_entries wre
            WHERE wre.id = sms_consent.worker_registry_id
            AND (
                wre.tenant_id = current_setting('app.current_tenant', true) OR
                auth.uid()::text = ANY(
                    SELECT user_id::text FROM user_tenants 
                    WHERE tenant_id = wre.tenant_id
                )
            )
        )
    );

-- Politique pour audit (accès par tenant)
CREATE POLICY "Audit access by tenant" ON worker_registry_audit
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant', true) OR
        auth.uid()::text = ANY(
            SELECT user_id::text FROM user_tenants 
            WHERE tenant_id = worker_registry_audit.tenant_id
        )
    );

-- =================== FONCTIONS UTILITAIRES ===================

-- Fonction pour obtenir les statistiques d'un AST
CREATE OR REPLACE FUNCTION get_worker_registry_stats(ast_uuid UUID)
RETURNS TABLE (
    total_registered INTEGER,
    active_workers INTEGER,
    completed_workers INTEGER,
    total_work_time_ms BIGINT,
    total_locks INTEGER,
    active_locks INTEGER,
    average_work_time_ms BIGINT,
    companies_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_registered,
        COUNT(*) FILTER (WHERE is_timer_active = true)::INTEGER as active_workers,
        COUNT(*) FILTER (WHERE work_end_time IS NOT NULL)::INTEGER as completed_workers,
        COALESCE(SUM(total_work_time_ms), 0)::BIGINT as total_work_time_ms,
        (SELECT COUNT(*)::INTEGER FROM loto_locks WHERE ast_id = ast_uuid) as total_locks,
        (SELECT COUNT(*)::INTEGER FROM loto_locks WHERE ast_id = ast_uuid AND is_applied = true) as active_locks,
        CASE 
            WHEN COUNT(*) > 0 THEN (COALESCE(SUM(total_work_time_ms), 0) / COUNT(*))::BIGINT
            ELSE 0::BIGINT
        END as average_work_time_ms,
        COUNT(DISTINCT company)::INTEGER as companies_count
    FROM worker_registry_entries
    WHERE ast_id = ast_uuid;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour envoyer une alerte SMS (à appeler depuis l'API)
CREATE OR REPLACE FUNCTION create_sms_alert(
    p_ast_id UUID,
    p_tenant_id TEXT,
    p_alert_type TEXT,
    p_message TEXT,
    p_sent_by_name TEXT,
    p_recipients TEXT[],
    p_recipient_names TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO sms_alerts (
        ast_id, tenant_id, alert_type, message, 
        sent_by_name, recipients, recipient_names
    ) VALUES (
        p_ast_id, p_tenant_id, p_alert_type, p_message,
        p_sent_by_name, p_recipients, p_recipient_names
    ) RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- =================== INDEX POUR PERFORMANCE ===================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_worker_registry_ast_id ON worker_registry_entries(ast_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_worker_registry_tenant_id ON worker_registry_entries(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_worker_registry_phone ON worker_registry_entries(phone_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_worker_registry_timer_active ON worker_registry_entries(is_timer_active) WHERE is_timer_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loto_locks_ast_id ON loto_locks(ast_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loto_locks_applied ON loto_locks(is_applied) WHERE is_applied = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loto_locks_worker_id ON loto_locks(applied_by_worker_id) WHERE applied_by_worker_id IS NOT NULL;

-- =================== DONNÉES INITIALES ===================

-- Insérer des types d'énergie standards si nécessaire
CREATE TABLE IF NOT EXISTS energy_types (
    id TEXT PRIMARY KEY,
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT,
    color TEXT
);

INSERT INTO energy_types (id, name_fr, name_en, icon, color) VALUES
    ('electrical', '⚡ Électrique', '⚡ Electrical', '⚡', '#f59e0b'),
    ('mechanical', '⚙️ Mécanique', '⚙️ Mechanical', '⚙️', '#6b7280'),
    ('hydraulic', '🔧 Hydraulique', '🔧 Hydraulic', '🔧', '#3b82f6'),
    ('pneumatic', '💨 Pneumatique', '💨 Pneumatic', '💨', '#06b6d4'),
    ('thermal', '🔥 Thermique', '🔥 Thermal', '🔥', '#ef4444'),
    ('chemical', '🧪 Chimique', '🧪 Chemical', '🧪', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

-- =================== COMMENTAIRES ===================

COMMENT ON TABLE worker_registry_entries IS 'Registre des travailleurs avec signature électronique et timer';
COMMENT ON TABLE worker_breaks IS 'Pauses et reprises de travail pour chaque travailleur';
COMMENT ON TABLE loto_locks IS 'Cadenas LOTO avec système de coche/décoche par travailleur';
COMMENT ON TABLE sms_alerts IS 'Historique des alertes SMS envoyées';
COMMENT ON TABLE sms_consent IS 'Consentements SMS et validation des numéros';
COMMENT ON TABLE worker_registry_audit IS 'Audit trail pour toutes les actions';

COMMENT ON COLUMN worker_registry_entries.signature_base64 IS 'Signature électronique encodée en base64';
COMMENT ON COLUMN worker_registry_entries.total_work_time_ms IS 'Temps total de travail en millisecondes';
COMMENT ON COLUMN loto_locks.is_applied IS 'État coché/décoché par le travailleur';
COMMENT ON COLUMN sms_alerts.delivery_status IS 'Statut de livraison par destinataire (JSON)';