-- =====================================================
-- MIGRATION 133 — Cascade client : SITES (adresses) + CONTACTS
-- Un client (table `clients`, 028) a plusieurs SITES (un nom, plusieurs adresses,
-- ex. ArcelorMittal -> Complexe Ouest) ; chaque site a ses CONTACTS (ex. Marcel Dionne).
-- Non destructif : `clients` garde son contact/adresse « principal » (auto-remplissage projets).
-- =====================================================

CREATE TABLE IF NOT EXISTS client_sites (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT        NOT NULL,
  client_id    UUID        NOT NULL,
  name         TEXT        NOT NULL DEFAULT '',
  address      TEXT        NOT NULL DEFAULT '',
  city         TEXT        NOT NULL DEFAULT '',
  province     TEXT        NOT NULL DEFAULT 'QC',
  postal_code  TEXT        NOT NULL DEFAULT '',
  notes        TEXT        NOT NULL DEFAULT '',
  active       BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS client_sites_tenant_client_idx ON client_sites (tenant_id, client_id);

CREATE TABLE IF NOT EXISTS client_contacts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT        NOT NULL,
  client_id    UUID        NOT NULL,
  site_id      UUID,                                  -- NULL = contact général du client
  name         TEXT        NOT NULL DEFAULT '',
  title        TEXT        NOT NULL DEFAULT '',       -- fonction / poste
  email        TEXT        NOT NULL DEFAULT '',
  phone        TEXT        NOT NULL DEFAULT '',
  mobile       TEXT        NOT NULL DEFAULT '',
  is_primary   BOOLEAN     NOT NULL DEFAULT false,
  active       BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS client_contacts_tenant_client_idx ON client_contacts (tenant_id, client_id);
CREATE INDEX IF NOT EXISTS client_contacts_site_idx ON client_contacts (site_id);

ALTER TABLE client_sites    ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS client_sites_access    ON client_sites;
DROP POLICY IF EXISTS client_contacts_access ON client_contacts;
CREATE POLICY client_sites_access    ON client_sites    FOR ALL USING (true);
CREATE POLICY client_contacts_access ON client_contacts FOR ALL USING (true);
