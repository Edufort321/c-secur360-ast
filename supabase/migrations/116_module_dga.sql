-- 116 — Module externe DGA (diagnostic de gaz dissous). Vendable à l'unité : visible seulement
-- si le super-admin coche l'abonnement (tenant_modules.enabled = true).
INSERT INTO modules (key, name_fr, name_en, monthly_price, sort_order) VALUES
  ('dga', 'Diagnostic DGA', 'DGA Diagnostic', 250, 110)
ON CONFLICT (key) DO NOTHING;

-- Cerdia (tenant tout inclus) : activer le module.
INSERT INTO tenant_modules (tenant_id, module_key, enabled, source)
VALUES ('cerdia', 'dga', TRUE, 'manual')
ON CONFLICT (tenant_id, module_key) DO NOTHING;

-- Historique des analyses DGA.
CREATE TABLE IF NOT EXISTS dga_analyses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT NOT NULL,
  asset_name   TEXT NOT NULL DEFAULT '',   -- transformateur / équipement
  sample_date  DATE,
  h2 NUMERIC DEFAULT 0, ch4 NUMERIC DEFAULT 0, c2h6 NUMERIC DEFAULT 0,
  c2h4 NUMERIC DEFAULT 0, c2h2 NUMERIC DEFAULT 0, co NUMERIC DEFAULT 0, co2 NUMERIC DEFAULT 0,
  tdcg NUMERIC DEFAULT 0,
  condition INT DEFAULT 1,                 -- IEEE 1..4
  duval TEXT,                              -- zone (PD/D1/D2/T1/T2/T3/DT/N)
  fault TEXT,                              -- libellé du défaut
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dga_analyses_tenant_idx ON dga_analyses (tenant_id, created_at DESC);

ALTER TABLE dga_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dga_analyses_access ON dga_analyses;
CREATE POLICY dga_analyses_access ON dga_analyses FOR ALL USING (true) WITH CHECK (true);
