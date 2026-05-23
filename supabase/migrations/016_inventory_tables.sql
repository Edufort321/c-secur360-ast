-- =====================================================
-- MIGRATION 016 — Tables RÉELLES du module Inventaire (porté) + tenant_id
-- VIDES (aucun seed) : chaque tenant crée ses départements/emplacements, catégories, articles.
-- NB : la table `users` du schéma source est EXCLUE (conflit avec la table users de l'hôte/auth).
--      movements.user_id est conservé en TEXT sans FK.
-- Idempotent.
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DÉPARTEMENTS (succursales / emplacements de haut niveau)
CREATE TABLE IF NOT EXISTS departments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   TEXT NOT NULL DEFAULT 'cerdia',
  name        TEXT NOT NULL,
  code        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);

-- CATÉGORIES (types de produits)
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   TEXT NOT NULL DEFAULT 'cerdia',
  name        TEXT NOT NULL,
  icon        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ARTICLES
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

-- EMPLACEMENTS D'ARTICLE (qté par département/emplacement)
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

-- MOUVEMENTS (historique)
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

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_items_tenant ON items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_item_locations_tenant ON item_locations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_item_locations_item_id ON item_locations(item_id);
CREATE INDEX IF NOT EXISTS idx_movements_tenant ON movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_movements_item_id ON movements(item_id);
CREATE INDEX IF NOT EXISTS idx_departments_tenant ON departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);

-- RLS permissif (à durcir avec le scoping multi-tenant complet)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['departments','categories','items','item_locations','movements'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS %I_all ON %I;', t, t);
    EXECUTE format('CREATE POLICY %I_all ON %I FOR ALL USING (true) WITH CHECK (true);', t, t);
  END LOOP;
END $$;

-- AUCUN SEED : tables vides, le tenant crée ses propres données.
