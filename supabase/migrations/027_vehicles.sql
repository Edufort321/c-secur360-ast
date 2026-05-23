-- =====================================================
-- MIGRATION 027 — Table véhicules du tenant
-- =====================================================

CREATE TABLE IF NOT EXISTS vehicles (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         TEXT        NOT NULL,
  type              TEXT        NOT NULL DEFAULT 'company', -- 'company' | 'personal'
  name              TEXT        NOT NULL DEFAULT '',
  make              TEXT        NOT NULL DEFAULT '',
  model             TEXT        NOT NULL DEFAULT '',
  year              INT,
  plate             TEXT        NOT NULL DEFAULT '',
  employee_name     TEXT        NOT NULL DEFAULT '',
  km_rate_override  NUMERIC,
  active            BOOLEAN     NOT NULL DEFAULT true,
  notes             TEXT        NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vehicles_tenant_idx ON vehicles (tenant_id, active);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vehicles_access ON vehicles;
CREATE POLICY vehicles_access ON vehicles FOR ALL USING (true);
