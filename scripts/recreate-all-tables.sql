-- =====================================================
-- RECRÉATION COMPLÈTE TOUTES TABLES - C-SECUR360
-- À exécuter dans Supabase Dashboard
-- =====================================================

-- 1. ========== TABLE AST_FORMS (VERSION DÉMO) ==========
DROP TABLE IF EXISTS ast_forms CASCADE;

CREATE TABLE ast_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  project_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  work_location TEXT NOT NULL,
  client_rep TEXT,
  emergency_number TEXT,
  ast_number TEXT NOT NULL,        -- FORMAT DÉMO: AST-2025-001
  client_reference TEXT,
  work_description TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  general_info JSONB,
  team_discussion JSONB,
  isolation JSONB,
  hazards JSONB,
  control_measures JSONB,
  workers JSONB,
  photos JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS et policies pour ast_forms
ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_ast_access" ON ast_forms FOR ALL USING (true);

CREATE INDEX idx_ast_forms_tenant_id ON ast_forms(tenant_id);
CREATE INDEX idx_ast_forms_ast_number ON ast_forms(ast_number);
CREATE INDEX idx_ast_forms_created_at ON ast_forms(created_at);

-- 2. ========== WORKER REGISTRY ENTRIES ==========
CREATE TABLE worker_registry_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ast_id UUID,  -- Référence optionnelle à l'AST
  tenant_id TEXT NOT NULL,
  
  -- Informations travailleur
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  employee_number TEXT,
  certification TEXT[] DEFAULT '{}',
  
  -- Signature et consentement
  signature_base64 TEXT,
  consent_timestamp TIMESTAMPTZ,
  ast_validated BOOLEAN DEFAULT FALSE,
  consent_text TEXT,
  
  -- Timer de travail
  work_start_time TIMESTAMPTZ,
  work_end_time TIMESTAMPTZ,
  total_work_time_ms BIGINT DEFAULT 0,
  is_timer_active BOOLEAN DEFAULT FALSE,
  
  -- Métadonnées
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  device_info JSONB,
  
  -- Contraintes
  CONSTRAINT valid_phone_number CHECK (phone_number ~ '^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$'),
  CONSTRAINT valid_work_times CHECK (work_end_time IS NULL OR work_end_time > work_start_time)
);

ALTER TABLE worker_registry_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "worker_registry_tenant_access" ON worker_registry_entries 
  FOR ALL USING (true);

-- 3. ========== LOTO LOCKS ==========
CREATE TABLE loto_locks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_registry_id UUID REFERENCES worker_registry_entries(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  
  lock_number TEXT NOT NULL,
  lock_type TEXT NOT NULL,
  equipment_description TEXT,
  lock_location TEXT,
  
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  removed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE loto_locks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loto_locks_tenant_access" ON loto_locks 
  FOR ALL USING (true);

-- 4. ========== SMS ALERTS ==========
CREATE TABLE sms_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  worker_registry_id UUID REFERENCES worker_registry_entries(id),
  
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'loto_applied', 'loto_removed', 'work_start', 'work_end'
  
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  twilio_sid TEXT,
  
  metadata JSONB
);

ALTER TABLE sms_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sms_alerts_tenant_access" ON sms_alerts 
  FOR ALL USING (true);

-- 5. ========== NEAR MISS EVENTS ==========
CREATE TABLE near_miss_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  reporter_id TEXT,
  
  incident_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  potential_consequences TEXT,
  
  severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
  category TEXT, -- 'safety', 'environmental', 'quality', 'security'
  
  immediate_actions TEXT,
  corrective_actions TEXT,
  status TEXT DEFAULT 'reported', -- 'reported', 'investigating', 'resolved'
  
  photos JSONB,
  witnesses JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE near_miss_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "near_miss_tenant_access" ON near_miss_events 
  FOR ALL USING (true);

-- 6. ========== EMPLOYEES (MODULE RH) ==========
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  
  employee_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  
  department TEXT,
  position TEXT,
  hire_date DATE,
  employment_status TEXT DEFAULT 'active', -- 'active', 'inactive', 'terminated'
  
  certifications JSONB, -- Structure JSON pour certifications
  emergency_contact JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, employee_number)
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees_tenant_access" ON employees 
  FOR ALL USING (true);

-- 7. ========== EMPLOYEE SAFETY RECORDS ==========
CREATE TABLE employee_safety_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  
  record_date DATE DEFAULT CURRENT_DATE,
  incident_count INTEGER DEFAULT 0,
  near_miss_count INTEGER DEFAULT 0,
  training_hours DECIMAL(5,2) DEFAULT 0,
  safety_score INTEGER CHECK (safety_score BETWEEN 0 AND 100),
  
  ast_participation_count INTEGER DEFAULT 0,
  last_safety_training DATE,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE employee_safety_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "safety_records_tenant_access" ON employee_safety_records 
  FOR ALL USING (true);

-- 8. ========== CLIENT BILLING PROFILES ==========
CREATE TABLE client_billing_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL UNIQUE,
  
  hourly_rate DECIMAL(8,2) NOT NULL DEFAULT 0,
  overtime_multiplier DECIMAL(3,2) DEFAULT 1.5,
  weekend_multiplier DECIMAL(3,2) DEFAULT 1.25,
  holiday_multiplier DECIMAL(3,2) DEFAULT 2.0,
  
  per_diem_rate DECIMAL(8,2) DEFAULT 0,
  mileage_rate DECIMAL(5,3) DEFAULT 0.68, -- CAD per km
  
  currency TEXT DEFAULT 'CAD',
  tax_rate DECIMAL(5,4) DEFAULT 0.14975, -- GST+PST Quebec
  
  custom_rates JSONB, -- Rates spécifiques par projet/type
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE client_billing_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_profiles_tenant_access" ON client_billing_profiles 
  FOR ALL USING (true);

-- 9. ========== TENANT SETTINGS ==========
CREATE TABLE tenant_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL UNIQUE,
  
  encryption_key_hash TEXT, -- Hash de la clé de chiffrement
  strict_mode BOOLEAN DEFAULT true,
  
  sms_enabled BOOLEAN DEFAULT false,
  sms_provider TEXT DEFAULT 'twilio',
  sms_credentials JSONB, -- Chiffré
  
  notification_settings JSONB,
  security_settings JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_settings_access" ON tenant_settings 
  FOR ALL USING (true);

-- 10. ========== PROJECT BILLING OVERRIDES ==========
CREATE TABLE project_billing_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  
  project_identifier TEXT NOT NULL, -- Numéro de projet ou nom
  override_type TEXT NOT NULL, -- 'hourly_rate', 'fixed_price', 'custom'
  
  hourly_rate DECIMAL(8,2),
  fixed_price DECIMAL(10,2),
  custom_rates JSONB,
  
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_billing_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_overrides_tenant_access" ON project_billing_overrides 
  FOR ALL USING (true);

-- 11. ========== WIP CALCULATIONS ==========
CREATE TABLE wip_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  
  calculation_date DATE DEFAULT CURRENT_DATE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  total_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  hourly_breakdown JSONB, -- Détail par taux horaire
  expense_breakdown JSONB, -- Frais et dépenses
  
  status TEXT DEFAULT 'draft', -- 'draft', 'calculated', 'approved', 'invoiced'
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wip_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wip_calculations_tenant_access" ON wip_calculations 
  FOR ALL USING (true);

-- 12. ========== WIP CALCULATION LOGS ==========
CREATE TABLE wip_calculation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wip_calculation_id UUID REFERENCES wip_calculations(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  
  action TEXT NOT NULL, -- 'created', 'updated', 'approved', 'rejected'
  performed_by TEXT,
  
  changes JSONB, -- Détail des changements
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wip_calculation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wip_logs_tenant_access" ON wip_calculation_logs 
  FOR ALL USING (true);

-- =====================================================
-- INDEX POUR PERFORMANCE
-- =====================================================

-- Index généraux par tenant
CREATE INDEX idx_worker_registry_tenant_id ON worker_registry_entries(tenant_id);
CREATE INDEX idx_loto_locks_tenant_id ON loto_locks(tenant_id);
CREATE INDEX idx_sms_alerts_tenant_id ON sms_alerts(tenant_id);
CREATE INDEX idx_near_miss_tenant_id ON near_miss_events(tenant_id);
CREATE INDEX idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX idx_safety_records_tenant_id ON employee_safety_records(tenant_id);
CREATE INDEX idx_billing_profiles_tenant_id ON client_billing_profiles(tenant_id);
CREATE INDEX idx_tenant_settings_tenant_id ON tenant_settings(tenant_id);
CREATE INDEX idx_billing_overrides_tenant_id ON project_billing_overrides(tenant_id);
CREATE INDEX idx_wip_calculations_tenant_id ON wip_calculations(tenant_id);
CREATE INDEX idx_wip_logs_tenant_id ON wip_calculation_logs(tenant_id);

-- Index fonctionnels
CREATE INDEX idx_worker_registry_active ON worker_registry_entries(tenant_id, is_timer_active);
CREATE INDEX idx_loto_locks_active ON loto_locks(tenant_id, is_active);
CREATE INDEX idx_near_miss_date ON near_miss_events(tenant_id, incident_date);
CREATE INDEX idx_wip_period ON wip_calculations(tenant_id, period_start, period_end);

-- =====================================================
-- DONNÉES DE TEST POUR DÉMONSTRATION
-- =====================================================

-- AST de démonstration
INSERT INTO ast_forms (
  tenant_id, user_id, project_number, client_name, work_location,
  ast_number, work_description, status, general_info
) VALUES (
  'demo', 'system', 'DEMO-2025-001', 'Client Démonstration',
  'Site de démonstration C-Secur360', 'AST-2025-001',
  'AST de validation pour démonstration du système', 'draft',
  '{"datetime": "2025-01-01T12:00:00Z", "language": "fr", "demo": true}'::jsonb
);

-- Travailleur de démonstration
INSERT INTO worker_registry_entries (
  tenant_id, name, company, phone_number, employee_number, certification
) VALUES (
  'demo', 'Jean Demo', 'Entreprise Démonstration', '+15141234567', 'EMP-001',
  ARRAY['SST Générale', 'Espaces Confinés']
);

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE ast_forms IS 'Formulaires AST - Version démo avec numérotation générique';
COMMENT ON TABLE worker_registry_entries IS 'Registre des travailleurs avec timer et LOTO';
COMMENT ON TABLE loto_locks IS 'Cadenas LOTO assignés aux travailleurs';
COMMENT ON TABLE sms_alerts IS 'Alertes SMS pour événements de sécurité';
COMMENT ON TABLE near_miss_events IS 'Événements de presque accidents';
COMMENT ON TABLE employees IS 'Base de données employés pour module RH';
COMMENT ON TABLE employee_safety_records IS 'Dossiers de sécurité des employés';
COMMENT ON TABLE client_billing_profiles IS 'Profils de facturation par tenant';
COMMENT ON TABLE tenant_settings IS 'Paramètres de sécurité par tenant';
COMMENT ON TABLE project_billing_overrides IS 'Tarifs personnalisés par projet';
COMMENT ON TABLE wip_calculations IS 'Calculs WIP pour facturation';
COMMENT ON TABLE wip_calculation_logs IS 'Logs des modifications WIP';

-- =====================================================
-- FIN DE LA CRÉATION - TOUTES LES TABLES SONT PRÊTES
-- =====================================================

SELECT 'Toutes les tables ont été créées avec succès!' as message,
       COUNT(*) as nombre_tables_creees
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'ast_forms', 'worker_registry_entries', 'loto_locks', 'sms_alerts',
  'near_miss_events', 'employees', 'employee_safety_records',
  'client_billing_profiles', 'tenant_settings', 'project_billing_overrides',
  'wip_calculations', 'wip_calculation_logs'
);