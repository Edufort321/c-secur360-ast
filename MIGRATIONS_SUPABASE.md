# 🚀 MIGRATIONS SUPABASE - C-SECUR360

## ⚡ Instructions d'exécution

**IMPORTANT**: Exécutez ces migrations dans l'ordre exact suivant dans l'éditeur SQL de Supabase.

---

## 📋 MIGRATION 1: Tables de facturation principales

```sql
-- ===========================================
-- MIGRATION SUPABASE - SYSTÈME DE FACTURATION
-- Création des tables pour intégration Stripe
-- ===========================================

-- === TABLE CUSTOMERS ===
-- Clients avec informations de facturation
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  company_name VARCHAR(255) NOT NULL,
  stripe_customer_id VARCHAR(255) UNIQUE,
  
  -- Informations géographiques
  province VARCHAR(2) DEFAULT 'QC',
  address JSONB,
  
  -- Informations fiscales
  tax_ids JSONB, -- {gst: "123456789RT0001", qst: "1234567890TQ0001"}
  
  -- Statut abonnement
  subscription_status VARCHAR(50) DEFAULT 'inactive', -- active, inactive, suspended, canceled
  stripe_subscription_id VARCHAR(255),
  trial_end TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index
  CONSTRAINT customers_province_check CHECK (province IN ('QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU')),
  CONSTRAINT customers_status_check CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'canceled', 'past_due'))
);

-- === TABLE SUBSCRIPTIONS ===
-- Abonnements Stripe avec détails
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Identifiants Stripe
  stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  
  -- Détails du plan
  plan_type VARCHAR(50) NOT NULL, -- monthly, annual
  additional_sites INTEGER DEFAULT 0,
  
  -- Statut et périodes
  status VARCHAR(50) NOT NULL, -- active, past_due, canceled, incomplete, etc.
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  
  -- Paiements
  last_payment_at TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT subscriptions_plan_check CHECK (plan_type IN ('monthly', 'annual')),
  CONSTRAINT subscriptions_status_check CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid'))
);

-- === TABLE INVOICES ===
-- Factures Stripe pour historique et rapports
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identifiants Stripe
  stripe_invoice_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255),
  
  -- Montants (en cents CAD)
  amount_total INTEGER NOT NULL,
  amount_subtotal INTEGER,
  tax_amount INTEGER DEFAULT 0,
  amount_paid INTEGER DEFAULT 0,
  amount_due INTEGER DEFAULT 0,
  
  -- Statut et dates
  status VARCHAR(50) NOT NULL, -- paid, open, void, uncollectible
  paid_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  
  -- Liens vers documents
  hosted_invoice_url TEXT,
  invoice_pdf TEXT,
  
  -- Gestion échecs de paiement
  attempt_count INTEGER DEFAULT 0,
  next_payment_attempt TIMESTAMPTZ,
  
  -- Metadata
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT invoices_status_check CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  CONSTRAINT invoices_amount_positive CHECK (amount_total >= 0)
);

-- === TABLE CHECKOUT_SESSIONS ===
-- Sessions de paiement pour suivi des conversions
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Identifiants Stripe
  stripe_session_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_subscription_id VARCHAR(255),
  
  -- Détails de la session
  plan_type VARCHAR(50) NOT NULL,
  additional_sites INTEGER DEFAULT 0,
  amount_total INTEGER NOT NULL, -- en cents CAD
  
  -- Statut
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, expired
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT checkout_sessions_status_check CHECK (status IN ('pending', 'completed', 'expired'))
);

-- === TABLE PAYMENT_METHODS ===
-- Méthodes de paiement (cartes, PAD/ACSS)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Identifiants Stripe
  stripe_payment_method_id VARCHAR(255),
  stripe_mandate_id VARCHAR(255), -- Pour PAD/ACSS
  
  -- Type et détails
  type VARCHAR(50) NOT NULL, -- card, acss_debit
  last4 VARCHAR(4), -- 4 derniers chiffres
  brand VARCHAR(50), -- visa, mastercard, etc.
  
  -- Statut
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, revoked
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Dates
  expires_month INTEGER,
  expires_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT payment_methods_type_check CHECK (type IN ('card', 'acss_debit', 'sepa_debit')),
  CONSTRAINT payment_methods_status_check CHECK (status IN ('active', 'inactive', 'revoked'))
);

-- === TABLE BILLING_EVENTS ===
-- Log des événements de facturation pour audit
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Type d'événement
  event_type VARCHAR(100) NOT NULL,
  stripe_event_id VARCHAR(255),
  
  -- Données de l'événement
  event_data JSONB,
  
  -- Métadonnées
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  processing_status VARCHAR(50) DEFAULT 'success', -- success, failed, pending
  error_message TEXT,
  
  -- Contraintes
  CONSTRAINT billing_events_status_check CHECK (processing_status IN ('success', 'failed', 'pending'))
);

-- ===========================================
-- INDEX POUR PERFORMANCE
-- ===========================================

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_subscription_status ON customers(subscription_status);
CREATE INDEX IF NOT EXISTS idx_customers_province ON customers(province);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Checkout Sessions
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_customer_id ON checkout_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_status ON checkout_sessions(status);

-- Payment Methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_id ON payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(is_default);

-- Billing Events
CREATE INDEX IF NOT EXISTS idx_billing_events_customer_id ON billing_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_events_processed_at ON billing_events(processed_at);

-- ===========================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- ===========================================

-- Trigger pour updated_at sur customers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Activer RLS sur toutes les tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins (accès complet)
CREATE POLICY "Admins can manage all billing data" ON customers
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all subscriptions" ON subscriptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all invoices" ON invoices
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all checkout sessions" ON checkout_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all payment methods" ON payment_methods
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all billing events" ON billing_events
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Politique pour les clients (accès à leurs propres données)
CREATE POLICY "Customers can view their own data" ON customers
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Customers can view their own subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = subscriptions.customer_id 
      AND customers.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Customers can view their own invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.stripe_customer_id = invoices.stripe_customer_id 
      AND customers.email = auth.jwt() ->> 'email'
    )
  );

-- ===========================================
-- FONCTIONS UTILITAIRES
-- ===========================================

-- Fonction pour calculer MRR (Monthly Recurring Revenue)
CREATE OR REPLACE FUNCTION calculate_mrr()
RETURNS TABLE(province VARCHAR(2), mrr_cents BIGINT, customer_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.province,
    SUM(
      CASE 
        WHEN s.plan_type = 'monthly' THEN 4900 + (s.additional_sites * 5000) -- 49$ + 600$/12 par site additionnel
        WHEN s.plan_type = 'annual' THEN 4083 + (s.additional_sites * 5000) -- 490$/12 + 600$/12 par site
        ELSE 0
      END
    ) as mrr_cents,
    COUNT(DISTINCT c.id) as customer_count
  FROM customers c
  JOIN subscriptions s ON c.id = s.customer_id
  WHERE s.status = 'active'
  GROUP BY c.province
  ORDER BY mrr_cents DESC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le statut de santé d'un abonnement
CREATE OR REPLACE FUNCTION get_subscription_health(customer_uuid UUID)
RETURNS TABLE(
  status VARCHAR(50),
  days_until_renewal INTEGER,
  overdue_invoices_count BIGINT,
  total_overdue_amount BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.status,
    EXTRACT(DAY FROM s.current_period_end - NOW())::INTEGER as days_until_renewal,
    COUNT(i.id) as overdue_invoices_count,
    COALESCE(SUM(i.amount_due), 0) as total_overdue_amount
  FROM subscriptions s
  LEFT JOIN customers c ON c.id = s.customer_id
  LEFT JOIN invoices i ON i.stripe_customer_id = c.stripe_customer_id 
    AND i.status IN ('open', 'past_due') 
    AND i.due_date < NOW()
  WHERE s.customer_id = customer_uuid
  GROUP BY s.status, s.current_period_end;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- DONNÉES INITIALES
-- ===========================================

-- Insertion du client admin par défaut
INSERT INTO customers (
  email, 
  company_name, 
  province,
  subscription_status
) VALUES (
  'eric.dufort@cerdia.ai',
  'CERDIA - Administration',
  'QC',
  'active'
) ON CONFLICT (email) DO NOTHING;
```

---

## 📋 MIGRATION 2: Tables d'entitlements et audit

```sql
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
```

---

## 📋 MIGRATION 3: Système d'ajustement automatique des prix

```sql
-- ===========================================
-- MIGRATION SUPABASE - AJUSTEMENT AUTOMATIQUE PRIX
-- Fonction pour ajuster les prix de 3.5% annuellement
-- ===========================================

-- === TABLE PRICE_ADJUSTMENTS ===
-- Historique des ajustements de prix
CREATE TABLE IF NOT EXISTS price_adjustments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Détails de l'ajustement
  adjustment_date DATE NOT NULL,
  adjustment_percentage DECIMAL(5,2) NOT NULL DEFAULT 3.5,
  
  -- Prix précédents (en cents CAD)
  previous_monthly_price INTEGER NOT NULL,
  previous_annual_price INTEGER NOT NULL,
  previous_additional_site_price INTEGER NOT NULL,
  
  -- Nouveaux prix (en cents CAD)
  new_monthly_price INTEGER NOT NULL,
  new_annual_price INTEGER NOT NULL,
  new_additional_site_price INTEGER NOT NULL,
  
  -- Statut et métadonnées
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  applied_by VARCHAR(255),
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === TABLE PRICE_CONFIG ===
-- Configuration des prix actuels
CREATE TABLE IF NOT EXISTS price_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Prix actuels (en cents CAD)
  monthly_price INTEGER NOT NULL DEFAULT 4900, -- 49$ CAD
  annual_price INTEGER NOT NULL DEFAULT 49000, -- 490$ CAD
  additional_site_price INTEGER NOT NULL DEFAULT 60000, -- 600$ CAD/an
  
  -- Configuration ajustement automatique
  auto_adjustment_enabled BOOLEAN DEFAULT TRUE,
  adjustment_percentage DECIMAL(5,2) DEFAULT 3.5,
  next_adjustment_date DATE,
  
  -- Metadata
  effective_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  UNIQUE(effective_date)
);

-- ===========================================
-- INDEX POUR PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_price_adjustments_date ON price_adjustments(adjustment_date);
CREATE INDEX IF NOT EXISTS idx_price_adjustments_applied ON price_adjustments(applied);
CREATE INDEX IF NOT EXISTS idx_price_config_effective_date ON price_config(effective_date);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Trigger pour updated_at sur price_config
CREATE TRIGGER update_price_config_updated_at BEFORE UPDATE ON price_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- FONCTIONS UTILITAIRES
-- ===========================================

-- Fonction pour calculer les nouveaux prix avec ajustement
CREATE OR REPLACE FUNCTION calculate_adjusted_prices(
  current_monthly INTEGER,
  current_annual INTEGER,
  current_additional_site INTEGER,
  adjustment_percentage DECIMAL DEFAULT 3.5
)
RETURNS TABLE(
  new_monthly INTEGER,
  new_annual INTEGER,
  new_additional_site INTEGER
) AS $$
DECLARE
  multiplier DECIMAL := 1 + (adjustment_percentage / 100);
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(current_monthly * multiplier)::INTEGER as new_monthly,
    ROUND(current_annual * multiplier)::INTEGER as new_annual,
    ROUND(current_additional_site * multiplier)::INTEGER as new_additional_site;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour prévoir le prochain ajustement de prix
CREATE OR REPLACE FUNCTION preview_next_price_adjustment()
RETURNS TABLE(
  current_monthly_price INTEGER,
  current_annual_price INTEGER,
  current_additional_site_price INTEGER,
  projected_monthly_price INTEGER,
  projected_annual_price INTEGER,
  projected_additional_site_price INTEGER,
  adjustment_percentage DECIMAL,
  next_adjustment_date DATE,
  revenue_impact_monthly DECIMAL,
  revenue_impact_annual DECIMAL
) AS $$
DECLARE
  config_row RECORD;
  adjusted_prices RECORD;
  active_monthly_subs INTEGER;
  active_annual_subs INTEGER;
BEGIN
  -- Récupérer la configuration actuelle
  SELECT * INTO config_row FROM price_config ORDER BY effective_date DESC LIMIT 1;
  
  IF config_row IS NULL THEN
    RAISE EXCEPTION 'Aucune configuration de prix trouvée';
  END IF;
  
  -- Calculer les nouveaux prix
  SELECT * INTO adjusted_prices FROM calculate_adjusted_prices(
    config_row.monthly_price,
    config_row.annual_price,
    config_row.additional_site_price,
    config_row.adjustment_percentage
  );
  
  -- Compter les abonnements actifs
  SELECT 
    COUNT(*) FILTER (WHERE s.plan_type = 'monthly'),
    COUNT(*) FILTER (WHERE s.plan_type = 'annual')
  INTO active_monthly_subs, active_annual_subs
  FROM subscriptions s
  WHERE s.status = 'active';
  
  RETURN QUERY
  SELECT 
    config_row.monthly_price,
    config_row.annual_price,
    config_row.additional_site_price,
    adjusted_prices.new_monthly,
    adjusted_prices.new_annual,
    adjusted_prices.new_additional_site,
    config_row.adjustment_percentage,
    config_row.next_adjustment_date,
    (adjusted_prices.new_monthly - config_row.monthly_price) * active_monthly_subs / 100.0 as revenue_impact_monthly,
    (adjusted_prices.new_annual - config_row.annual_price) * active_annual_subs / 100.0 as revenue_impact_annual;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour appliquer l'ajustement automatique des prix
CREATE OR REPLACE FUNCTION apply_automatic_price_adjustment(
  applied_by_user VARCHAR DEFAULT 'system'
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  adjustment_id UUID,
  new_monthly INTEGER,
  new_annual INTEGER,
  new_additional_site INTEGER
) AS $$
DECLARE
  config_row RECORD;
  adjusted_prices RECORD;
  adjustment_id_var UUID;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Vérifier si un ajustement est dû
  SELECT * INTO config_row FROM price_config 
  WHERE auto_adjustment_enabled = TRUE 
  AND next_adjustment_date <= today_date
  ORDER BY effective_date DESC LIMIT 1;
  
  IF config_row IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Aucun ajustement programmé ou auto-ajustement désactivé', NULL::UUID, 0, 0, 0;
    RETURN;
  END IF;
  
  -- Vérifier qu'aucun ajustement n'a déjà été fait cette année
  IF EXISTS (
    SELECT 1 FROM price_adjustments 
    WHERE EXTRACT(YEAR FROM adjustment_date) = EXTRACT(YEAR FROM today_date)
    AND applied = TRUE
  ) THEN
    RETURN QUERY SELECT FALSE, 'Ajustement déjà effectué cette année', NULL::UUID, 0, 0, 0;
    RETURN;
  END IF;
  
  -- Calculer les nouveaux prix
  SELECT * INTO adjusted_prices FROM calculate_adjusted_prices(
    config_row.monthly_price,
    config_row.annual_price,
    config_row.additional_site_price,
    config_row.adjustment_percentage
  );
  
  -- Enregistrer l'ajustement dans l'historique
  INSERT INTO price_adjustments (
    adjustment_date,
    adjustment_percentage,
    previous_monthly_price,
    previous_annual_price,
    previous_additional_site_price,
    new_monthly_price,
    new_annual_price,
    new_additional_site_price,
    applied,
    applied_at,
    applied_by,
    notes
  ) VALUES (
    today_date,
    config_row.adjustment_percentage,
    config_row.monthly_price,
    config_row.annual_price,
    config_row.additional_site_price,
    adjusted_prices.new_monthly,
    adjusted_prices.new_annual,
    adjusted_prices.new_additional_site,
    TRUE,
    NOW(),
    applied_by_user,
    'Ajustement automatique annuel de ' || config_row.adjustment_percentage || '%'
  ) RETURNING id INTO adjustment_id_var;
  
  -- Mettre à jour la configuration des prix
  INSERT INTO price_config (
    monthly_price,
    annual_price,
    additional_site_price,
    auto_adjustment_enabled,
    adjustment_percentage,
    next_adjustment_date,
    effective_date
  ) VALUES (
    adjusted_prices.new_monthly,
    adjusted_prices.new_annual,
    adjusted_prices.new_additional_site,
    config_row.auto_adjustment_enabled,
    config_row.adjustment_percentage,
    today_date + INTERVAL '1 year', -- Prochain ajustement dans 1 an
    today_date
  );
  
  -- Log dans audit_logs
  INSERT INTO audit_logs (actor, action, target_id, meta)
  VALUES (
    applied_by_user,
    'price_adjustment_applied',
    adjustment_id_var,
    jsonb_build_object(
      'previous_monthly', config_row.monthly_price,
      'previous_annual', config_row.annual_price,
      'new_monthly', adjusted_prices.new_monthly,
      'new_annual', adjusted_prices.new_annual,
      'adjustment_percentage', config_row.adjustment_percentage
    )
  );
  
  RETURN QUERY SELECT 
    TRUE, 
    'Ajustement de prix appliqué avec succès (+' || config_row.adjustment_percentage || '%)',
    adjustment_id_var,
    adjusted_prices.new_monthly,
    adjusted_prices.new_annual,
    adjusted_prices.new_additional_site;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les prix actuels
CREATE OR REPLACE FUNCTION get_current_pricing()
RETURNS TABLE(
  monthly_price_cents INTEGER,
  annual_price_cents INTEGER,
  additional_site_price_cents INTEGER,
  monthly_price_cad DECIMAL,
  annual_price_cad DECIMAL,
  additional_site_price_cad DECIMAL,
  effective_date DATE,
  next_adjustment_date DATE,
  auto_adjustment_enabled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.monthly_price,
    pc.annual_price,
    pc.additional_site_price,
    pc.monthly_price / 100.0 as monthly_price_cad,
    pc.annual_price / 100.0 as annual_price_cad,
    pc.additional_site_price / 100.0 as additional_site_price_cad,
    pc.effective_date,
    pc.next_adjustment_date,
    pc.auto_adjustment_enabled
  FROM price_config pc
  ORDER BY pc.effective_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Activer RLS
ALTER TABLE price_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_config ENABLE ROW LEVEL SECURITY;

-- Politiques pour admins seulement
CREATE POLICY "Admins can manage price adjustments" ON price_adjustments
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage price config" ON price_config
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Politiques lecture pour clients (prix actuels seulement)
CREATE POLICY "Users can view current pricing" ON price_config
  FOR SELECT USING (effective_date <= CURRENT_DATE);

-- ===========================================
-- DONNÉES INITIALES
-- ===========================================

-- Insérer la configuration initiale des prix
INSERT INTO price_config (
  monthly_price,
  annual_price,
  additional_site_price,
  auto_adjustment_enabled,
  adjustment_percentage,
  next_adjustment_date,
  effective_date
) VALUES (
  4900,  -- 49$ CAD
  49000, -- 490$ CAD
  60000, -- 600$ CAD
  TRUE,
  3.5,
  CURRENT_DATE + INTERVAL '1 year', -- Premier ajustement dans 1 an
  CURRENT_DATE
) ON CONFLICT (effective_date) DO NOTHING;
```

---

## ✅ ORDRE D'EXÉCUTION

1. **Copier et exécuter la MIGRATION 1** dans l'éditeur SQL Supabase
2. **Copier et exécuter la MIGRATION 2** dans l'éditeur SQL Supabase  
3. **Copier et exécuter la MIGRATION 3** dans l'éditeur SQL Supabase

---

## 🔧 CONFIGURATION STRIPE REQUISE

Après les migrations, configurer ces variables d'environnement:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_... # 49$ CAD
STRIPE_PRICE_ANNUAL=price_... # 490$ CAD
STRIPE_ACCOUNT_COUNTRY=CA

# Supabase  
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 🚀 SYSTÈME COMPLET

Le système inclut:
- ✅ Tables de facturation Stripe complètes
- ✅ Gestion des entitlements par client  
- ✅ Logs d'audit complets
- ✅ Ajustement automatique des prix (+3.5% annuel)
- ✅ Interface admin de gestion des prix
- ✅ Sécurité RLS (Row Level Security)
- ✅ Fonctions utilitaires (MRR, santé abonnements)
- ✅ Prix actuels: $49/mois, $490/an, $600/an par site additionnel