-- ===========================================
-- MIGRATION SUPABASE - TABLE ENTITLEMENTS
-- Selon spécifications handoff technique
-- ===========================================

-- === TABLE ENTITLEMENTS ===
-- Contrôle d'accès aux fonctionnalités par client
CREATE TABLE IF NOT EXISTS entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Fonctionnalités disponibles (JSONB flexible)
  features JSONB DEFAULT '{
    "ast_creation": true,
    "multi_sites": false,
    "advanced_reports": false,
    "api_access": false,
    "priority_support": false,
    "max_users": 5,
    "max_asts_per_month": 100
  }'::jsonb,
  
  -- Statut et dates
  is_active BOOLEAN DEFAULT TRUE,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  suspended_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  UNIQUE(customer_id)
);

-- === TABLE AUDIT_LOGS ===
-- Logs d'audit pour traçabilité selon specs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Acteur et action
  actor VARCHAR(255), -- Email ou système
  action VARCHAR(100) NOT NULL, -- subscription_created, entitlements_activated, etc.
  target_id UUID, -- ID de l'objet affecté (customer, subscription, etc.)
  
  -- Métadonnées et contexte
  meta JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEX POUR PERFORMANCE
-- ===========================================

-- Entitlements
CREATE INDEX IF NOT EXISTS idx_entitlements_customer_id ON entitlements(customer_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_active ON entitlements(is_active);
CREATE INDEX IF NOT EXISTS idx_entitlements_expires_at ON entitlements(expires_at);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Trigger pour updated_at sur entitlements
CREATE TRIGGER update_entitlements_updated_at BEFORE UPDATE ON entitlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Activer RLS
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques pour admins
CREATE POLICY "Admins can manage all entitlements" ON entitlements
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Politiques pour clients (lecture seule de leurs entitlements)
CREATE POLICY "Customers can view their own entitlements" ON entitlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = entitlements.customer_id 
      AND customers.email = auth.jwt() ->> 'email'
    )
  );

-- ===========================================
-- FONCTIONS UTILITAIRES
-- ===========================================

-- Fonction pour activer/désactiver entitlements
CREATE OR REPLACE FUNCTION update_customer_entitlements(
  customer_uuid UUID,
  new_features JSONB,
  active BOOLEAN DEFAULT TRUE
)
RETURNS VOID AS $$
BEGIN
  -- Upsert entitlements
  INSERT INTO entitlements (customer_id, features, is_active)
  VALUES (customer_uuid, new_features, active)
  ON CONFLICT (customer_id) 
  DO UPDATE SET 
    features = new_features,
    is_active = active,
    updated_at = NOW(),
    activated_at = CASE WHEN active AND NOT entitlements.is_active THEN NOW() ELSE entitlements.activated_at END,
    suspended_at = CASE WHEN NOT active AND entitlements.is_active THEN NOW() ELSE entitlements.suspended_at END;
  
  -- Log de l'action
  INSERT INTO audit_logs (actor, action, target_id, meta)
  VALUES (
    'system',
    CASE WHEN active THEN 'entitlements_activated' ELSE 'entitlements_suspended' END,
    customer_uuid,
    jsonb_build_object('features', new_features, 'active', active)
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les entitlements d'un client
CREATE OR REPLACE FUNCTION get_customer_entitlements(customer_uuid UUID)
RETURNS TABLE(
  features JSONB,
  is_active BOOLEAN,
  activated_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.features,
    e.is_active,
    e.activated_at,
    e.suspended_at,
    e.expires_at
  FROM entitlements e
  WHERE e.customer_id = customer_uuid;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier une fonctionnalité spécifique
CREATE OR REPLACE FUNCTION check_customer_feature(
  customer_uuid UUID,
  feature_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  has_feature BOOLEAN := FALSE;
BEGIN
  SELECT COALESCE((e.features ->> feature_name)::boolean, FALSE) AND e.is_active
  INTO has_feature
  FROM entitlements e
  WHERE e.customer_id = customer_uuid;
  
  RETURN COALESCE(has_feature, FALSE);
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- DONNÉES INITIALES
-- ===========================================

-- Créer entitlements pour le client admin par défaut
INSERT INTO entitlements (
  customer_id,
  features,
  is_active
) 
SELECT 
  c.id,
  '{
    "ast_creation": true,
    "multi_sites": true,
    "advanced_reports": true,
    "api_access": true,
    "priority_support": true,
    "max_users": 999,
    "max_asts_per_month": 9999
  }'::jsonb,
  TRUE
FROM customers c 
WHERE c.email = 'eric.dufort@cerdia.ai'
ON CONFLICT (customer_id) DO NOTHING;