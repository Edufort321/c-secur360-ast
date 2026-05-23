-- =====================================================
-- MIGRATION 026 — Table confined_space_permits (idempotent)
-- =====================================================

CREATE TABLE IF NOT EXISTS confined_space_permits (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_number TEXT        NOT NULL,
  data          JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ajout colonnes manquantes si table existait déjà
ALTER TABLE confined_space_permits ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS confined_space_permits_pnum_idx
  ON confined_space_permits (permit_number);

CREATE INDEX IF NOT EXISTS confined_space_permits_tenant_idx
  ON confined_space_permits (tenant_id, updated_at DESC);

ALTER TABLE confined_space_permits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS confined_space_permits_access ON confined_space_permits;
CREATE POLICY confined_space_permits_access ON confined_space_permits FOR ALL USING (true);
