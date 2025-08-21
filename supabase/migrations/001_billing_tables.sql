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
        WHEN s.plan_type = 'monthly' THEN 25000 + (s.additional_sites * 4166) -- 500$/12 par site additionnel
        WHEN s.plan_type = 'annual' THEN 25000 + (s.additional_sites * 4166) -- 3000$/12 + 500$/12 par site
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