-- ===============================================
-- MIGRATION 006 - CORRIGER LES PRIX À 250$/MOIS ET 3000$/AN
-- ===============================================

-- 1. METTRE À JOUR LA CONFIGURATION DES PRIX
UPDATE price_config SET 
  monthly_price = 25000,  -- 250$ CAD
  annual_price = 300000,  -- 3000$ CAD
  additional_site_price = 60000,  -- 600$ CAD (on garde ça)
  updated_at = NOW()
WHERE effective_date = CURRENT_DATE;

-- 2. METTRE À JOUR LA FONCTION CALCULATE_MRR
CREATE OR REPLACE FUNCTION calculate_mrr()
RETURNS TABLE(province VARCHAR(2), mrr_cents BIGINT, customer_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.province,
    SUM(
      CASE 
        WHEN s.plan_type = 'monthly' THEN 25000 + (s.additional_sites * 5000) -- 250$ + 600$/12 par site additionnel
        WHEN s.plan_type = 'annual' THEN 25000 + (s.additional_sites * 5000) -- 3000$/12 + 600$/12 par site
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

-- 3. METTRE À JOUR LA FONCTION GET_CURRENT_PRICING POUR REFLÉTER LES BONS PRIX
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

-- 4. LOG DE L'AJUSTEMENT DANS AUDIT_LOGS
INSERT INTO audit_logs (actor, action, target_id, meta)
VALUES (
  'system',
  'pricing_correction',
  NULL,
  jsonb_build_object(
    'corrected_from', '49$/490$',
    'corrected_to', '250$/3000$',
    'reason', 'Retour aux prix originaux corrects',
    'additional_site_price', '600$/an'
  )
);