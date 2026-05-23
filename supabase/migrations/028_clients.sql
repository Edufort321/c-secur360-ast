-- =====================================================
-- MIGRATION 028 — Répertoire clients du tenant
-- =====================================================

CREATE TABLE IF NOT EXISTS clients (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT        NOT NULL,
  name          TEXT        NOT NULL DEFAULT '',
  contact_name  TEXT        NOT NULL DEFAULT '',
  contact_email TEXT        NOT NULL DEFAULT '',
  contact_phone TEXT        NOT NULL DEFAULT '',
  phone         TEXT        NOT NULL DEFAULT '',
  email         TEXT        NOT NULL DEFAULT '',
  address       TEXT        NOT NULL DEFAULT '',
  city          TEXT        NOT NULL DEFAULT '',
  province      TEXT        NOT NULL DEFAULT 'QC',
  postal_code   TEXT        NOT NULL DEFAULT '',
  notes         TEXT        NOT NULL DEFAULT '',
  active        BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clients_tenant_idx ON clients (tenant_id, name);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS clients_access ON clients;
CREATE POLICY clients_access ON clients FOR ALL USING (true);
