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

-- ===========================================
-- TÂCHE CRON (À CONFIGURER DANS SUPABASE)
-- ===========================================

-- Pour automatiser l'exécution, configurer une tâche cron dans Supabase:
-- 
-- 1. Aller dans Database > Functions
-- 2. Créer une edge function qui appelle apply_automatic_price_adjustment()
-- 3. Configurer cron job pour s'exécuter le 1er janvier de chaque année
-- 
-- Exemple de requête à exécuter automatiquement:
-- SELECT * FROM apply_automatic_price_adjustment('system_cron');