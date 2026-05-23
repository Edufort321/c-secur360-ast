-- =====================================================
-- SCRIPT COMBINÉ — Migrations 011 à 016
-- À exécuter UNE SEULE FOIS dans le SQL Editor Supabase.
-- Toutes les migrations sont idempotentes (IF NOT EXISTS / ON CONFLICT DO NOTHING).
-- =====================================================


-- =====================================================
-- MIGRATION 011 — Catalogue de modules + entitlements par tenant + billing_config
-- =====================================================

CREATE TABLE IF NOT EXISTS modules (
  key            TEXT PRIMARY KEY,
  name_fr        TEXT NOT NULL,
  name_en        TEXT NOT NULL,
  monthly_price  NUMERIC(10,2) DEFAULT 0,
  sort_order     INT DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_modules (
  tenant_id   TEXT NOT NULL,
  module_key  TEXT NOT NULL,
  enabled     BOOLEAN DEFAULT FALSE,
  source      TEXT DEFAULT 'manual',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tenant_id, module_key)
);

CREATE TABLE IF NOT EXISTS billing_config (
  id                  TEXT PRIMARY KEY DEFAULT 'default',
  discount_per_module NUMERIC(5,2) DEFAULT 5,
  discount_cap        NUMERIC(5,2) DEFAULT 30,
  currency            TEXT DEFAULT 'CAD',
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['modules','tenant_modules','billing_config'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS %I_access ON %I;', t, t);
    EXECUTE format('CREATE POLICY %I_access ON %I FOR ALL USING (true);', t, t);
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_tenant_modules_tenant ON tenant_modules(tenant_id);

INSERT INTO modules (key, name_fr, name_en, monthly_price, sort_order) VALUES
  ('admin',       'Administration',        'Administration',      0,   0),
  ('projects',    'Projets',               'Projects',            500, 10),
  ('planner',     'Planificateur',         'Scheduler',           500, 20),
  ('ast',         'AST / Sécurité',        'JSA / Safety',        500, 30),
  ('permits',     'Permis',                'Permits',             500, 40),
  ('accidents',   'Accidents',             'Accidents',           500, 50),
  ('near_miss',   'Presque-accidents',     'Near-miss',           500, 60),
  ('inventory',   'Inventaire',            'Inventory',           500, 70),
  ('inspections', 'Inspections d''équip.', 'Equip. inspections',  500, 80),
  ('timesheets',  'Feuille de temps',      'Timesheets',          500, 90),
  ('todo',        'To-Do',                 'To-Do',               0,   100)
ON CONFLICT (key) DO NOTHING;

INSERT INTO billing_config (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

INSERT INTO tenant_modules (tenant_id, module_key, enabled, source)
SELECT 'cerdia', key, TRUE, 'manual' FROM modules
ON CONFLICT (tenant_id, module_key) DO NOTHING;


-- =====================================================
-- MIGRATION 012 — Cycle d'abonnement par tenant
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  tenant_id          TEXT PRIMARY KEY,
  status             TEXT DEFAULT 'active',
  cycle              TEXT DEFAULT 'annual',
  start_date         DATE DEFAULT CURRENT_DATE,
  next_billing_date  DATE,
  last_payment_at    TIMESTAMPTZ,
  reminder_days      INT DEFAULT 60,
  grace_days         INT DEFAULT 30,
  amount             NUMERIC(12,2),
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_subscriptions_access ON tenant_subscriptions;
CREATE POLICY tenant_subscriptions_access ON tenant_subscriptions FOR ALL USING (true);

ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS billable BOOLEAN DEFAULT TRUE;

INSERT INTO tenant_subscriptions (tenant_id, status, next_billing_date, start_date, last_payment_at)
VALUES ('cerdia', 'active', CURRENT_DATE + INTERVAL '1 year', CURRENT_DATE, NOW())
ON CONFLICT (tenant_id) DO NOTHING;


-- =====================================================
-- MIGRATION 013 — Profil tenant : domaine + courriel facturation + ERP
-- =====================================================

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_provider TEXT DEFAULT 'commerce_cerdia';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS erp_provider TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS erp_base_url TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS erp_company_id TEXT;

UPDATE tenants SET domain = 'cerdia.ai' WHERE id = 'cerdia' AND (domain IS NULL OR domain = '');


-- =====================================================
-- MIGRATION 014 — Rattrapage colonnes (idempotent, sécuritaire de re-exécuter)
-- =====================================================

ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS billable BOOLEAN DEFAULT TRUE;

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_provider TEXT DEFAULT 'commerce_cerdia';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS erp_provider TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS erp_base_url TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS erp_company_id TEXT;

UPDATE tenants SET domain = 'cerdia.ai' WHERE id = 'cerdia' AND (domain IS NULL OR domain = '');


-- =====================================================
-- MIGRATION 015 — Coûts réels du projet (feuille de temps) en JSONB
-- =====================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS actuals JSONB;


-- =====================================================
-- MIGRATION 016 — Tables du module Inventaire + tenant_id (tables vides)
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS departments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   TEXT NOT NULL DEFAULT 'cerdia',
  name        TEXT NOT NULL,
  code        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   TEXT NOT NULL DEFAULT 'cerdia',
  name        TEXT NOT NULL,
  icon        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id               TEXT NOT NULL DEFAULT 'cerdia',
  code                    TEXT NOT NULL,
  name                    TEXT NOT NULL,
  category                TEXT NOT NULL,
  description             TEXT,
  unit                    TEXT DEFAULT 'Pièce',
  cost_price              NUMERIC(10,2) DEFAULT 0,
  sale_price              NUMERIC(10,2) DEFAULT 0,
  supplier                TEXT,
  article_type            TEXT DEFAULT 'sale' CHECK (article_type IN ('sale','consumable','unique')),
  different_codes         BOOLEAN DEFAULT FALSE,
  last_price_update       TIMESTAMPTZ,
  price_update_frequency  INTEGER DEFAULT 365,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item_locations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        TEXT NOT NULL DEFAULT 'cerdia',
  item_id          UUID REFERENCES items(id) ON DELETE CASCADE,
  department       TEXT NOT NULL,
  department_code  TEXT NOT NULL,
  location         TEXT,
  custom_code      TEXT,
  qr_code          TEXT,
  quantity         INTEGER DEFAULT 0,
  min_quantity     INTEGER DEFAULT 0,
  max_quantity     INTEGER DEFAULT 100,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (item_id, department)
);

CREATE TABLE IF NOT EXISTS movements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      TEXT NOT NULL DEFAULT 'cerdia',
  item_id        UUID REFERENCES items(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('entry','exit','adjustment','transfer')),
  quantity       INTEGER NOT NULL,
  from_location  TEXT,
  to_location    TEXT,
  reason         TEXT,
  user_id        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_tenant ON items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_item_locations_tenant ON item_locations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_item_locations_item_id ON item_locations(item_id);
CREATE INDEX IF NOT EXISTS idx_movements_tenant ON movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_movements_item_id ON movements(item_id);
CREATE INDEX IF NOT EXISTS idx_departments_tenant ON departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['departments','categories','items','item_locations','movements'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS %I_all ON %I;', t, t);
    EXECUTE format('CREATE POLICY %I_all ON %I FOR ALL USING (true) WITH CHECK (true);', t, t);
  END LOOP;
END $$;
