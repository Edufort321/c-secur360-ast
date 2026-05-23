-- =====================================================
-- MIGRATION 027 — Table véhicules du tenant (idempotent)
-- =====================================================

CREATE TABLE IF NOT EXISTS vehicles (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  type      TEXT NOT NULL DEFAULT 'company',
  name      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ajout colonnes manquantes si table existait déjà
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS make              TEXT        NOT NULL DEFAULT '';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS model             TEXT        NOT NULL DEFAULT '';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS year              INT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS plate             TEXT        NOT NULL DEFAULT '';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS employee_name     TEXT        NOT NULL DEFAULT '';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS km_rate_override  NUMERIC;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS active            BOOLEAN     NOT NULL DEFAULT true;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS notes             TEXT        NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS vehicles_tenant_idx ON vehicles (tenant_id, active);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vehicles_access ON vehicles;
CREATE POLICY vehicles_access ON vehicles FOR ALL USING (true);
