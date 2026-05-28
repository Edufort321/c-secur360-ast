-- 066: Tables manquantes — audit complet 2026-05-28
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- ─── 1. tax_benefit_rates — taux ARC/RQ versionnés par année ─────────────────
-- Actuellement hardcodé dans admin/page.tsx — doit être en BD pour multi-tenant
CREATE TABLE IF NOT EXISTS tax_benefit_rates (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_year                      INTEGER NOT NULL,
  jurisdiction                  TEXT    NOT NULL DEFAULT 'federal',  -- 'federal' | 'QC' | 'territories'
  standby_monthly_rate          NUMERIC(5,4)  DEFAULT 0.02,    -- 2 %/mois
  standby_lease_fraction        NUMERIC(5,4)  DEFAULT 0.6667,  -- 2/3 bail
  operating_rate_per_km         NUMERIC(5,3)  DEFAULT 0.34,    -- $/km fonctionnement
  operating_rate_per_km_qc      NUMERIC(5,3)  DEFAULT 0.33,    -- Revenu Québec
  operating_rate_per_km_sales   NUMERIC(5,3)  DEFAULT 0.31,    -- vendeurs autos
  operating_rate_sales_qc       NUMERIC(5,3)  DEFAULT 0.30,
  km_allowance_tier1            NUMERIC(5,3)  DEFAULT 0.73,    -- Régime B palier 1
  km_allowance_tier2            NUMERIC(5,3)  DEFAULT 0.67,    -- Régime B palier 2
  km_allowance_tier1_threshold  INTEGER       DEFAULT 5000,
  km_allowance_tier1_territories NUMERIC(5,3) DEFAULT 0.77,
  km_allowance_tier2_territories NUMERIC(5,3) DEFAULT 0.71,
  reduced_standby_km_per_30days INTEGER       DEFAULT 1667,
  reduced_standby_km_annual     INTEGER       DEFAULT 20004,
  half_method_fraction          NUMERIC(4,3)  DEFAULT 0.50,
  lease_cap_monthly             NUMERIC(8,2)  DEFAULT 1100.00,
  interest_cap_monthly          NUMERIC(8,2)  DEFAULT 300.00,
  cca_class10_rate              NUMERIC(4,3)  DEFAULT 0.30,
  cca_class10_cap               NUMERIC(10,2) DEFAULT 39000.00,
  cca_class54_rate              NUMERIC(4,3)  DEFAULT 1.00,
  cca_class54_cap               NUMERIC(10,2) DEFAULT 61000.00,
  personal_km_utilitaire_max    INTEGER       DEFAULT 1000,
  effective_from                DATE          DEFAULT '2026-01-01',
  source_url                    TEXT,
  notes                         TEXT,
  created_at                    TIMESTAMPTZ   DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS tbr_year_jurisdiction ON tax_benefit_rates (tax_year, jurisdiction);
ALTER TABLE tax_benefit_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tbr_access ON tax_benefit_rates;
CREATE POLICY tbr_access ON tax_benefit_rates FOR ALL USING (true) WITH CHECK (true);

-- Seed 2026 fédéral (valeurs ARC confirmées)
INSERT INTO tax_benefit_rates (tax_year, jurisdiction) VALUES (2026, 'federal')
ON CONFLICT (tax_year, jurisdiction) DO NOTHING;

INSERT INTO tax_benefit_rates (tax_year, jurisdiction, operating_rate_per_km_qc, operating_rate_sales_qc)
VALUES (2026, 'QC', 0.33, 0.30)
ON CONFLICT (tax_year, jurisdiction) DO NOTHING;

-- ─── 2. sms_alerts — alertes SMS référencées dans le code ────────────────────
CREATE TABLE IF NOT EXISTS sms_alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL,
  type        TEXT NOT NULL,          -- 'inspection_due' | 'permit_expiry' | 'custom'
  recipient   TEXT NOT NULL,          -- numéro de téléphone
  message     TEXT NOT NULL,
  status      TEXT DEFAULT 'pending'  -- 'pending' | 'sent' | 'failed'
               CHECK (status IN ('pending','sent','failed')),
  sent_at     TIMESTAMPTZ,
  error       TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sms_alerts_tenant_idx ON sms_alerts (tenant_id, status);
ALTER TABLE sms_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sms_alerts_access ON sms_alerts;
CREATE POLICY sms_alerts_access ON sms_alerts FOR ALL USING (true) WITH CHECK (true);

-- ─── 3. tenant_loto_templates — templates LOTO/CADENASSAGE ───────────────────
CREATE TABLE IF NOT EXISTS tenant_loto_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL,
  name        TEXT NOT NULL,
  equipment   TEXT,
  steps       JSONB DEFAULT '[]',     -- étapes de cadenassage
  points      JSONB DEFAULT '[]',     -- points d'énergie
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS loto_tenant_idx ON tenant_loto_templates (tenant_id, is_active);
ALTER TABLE tenant_loto_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS loto_access ON tenant_loto_templates;
CREATE POLICY loto_access ON tenant_loto_templates FOR ALL USING (true) WITH CHECK (true);

-- ─── 4. system_audit_logs — logs d'audit référencés dans lib/audit.ts ────────
CREATE TABLE IF NOT EXISTS system_audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT,
  user_id     TEXT,
  user_email  TEXT,
  action      TEXT NOT NULL,          -- 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | etc.
  resource    TEXT,                   -- nom de la table/ressource
  resource_id TEXT,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_tenant_idx  ON system_audit_logs (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_action_idx  ON system_audit_logs (action, resource);
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_access ON system_audit_logs;
CREATE POLICY audit_access ON system_audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ─── 5. vehicles — colonnes potentiellement manquantes (idempotent) ──────────
-- La migration 058 les ajoute déjà, mais on s'assure qu'elles existent
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS purchase_price     NUMERIC(12,2);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS km_at_year_start   NUMERIC(10,0) DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS km_year_start_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER;

-- ─── 6. planner_jobs — s'assurer que updated_at existe (sync l'exige) ────────
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
