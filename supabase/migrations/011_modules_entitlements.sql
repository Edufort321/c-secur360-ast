-- =====================================================
-- MIGRATION 011 — Catalogue de modules (prix) + entitlements par tenant + config facturation
-- Pilote l'activation des modules (gating) ET la facturation. Idempotent.
-- =====================================================

CREATE TABLE IF NOT EXISTS modules (
  key            TEXT PRIMARY KEY,
  name_fr        TEXT NOT NULL,
  name_en        TEXT NOT NULL,
  monthly_price  NUMERIC(10,2) DEFAULT 0,   -- $ / mois
  sort_order     INT DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_modules (
  tenant_id   TEXT NOT NULL,
  module_key  TEXT NOT NULL,              -- texte libre (pas de FK enum → extensible)
  enabled     BOOLEAN DEFAULT FALSE,
  source      TEXT DEFAULT 'manual',      -- manual | subscription | trial
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tenant_id, module_key)
);

-- Config de facturation (escompte cumulatif par module additionnel)
CREATE TABLE IF NOT EXISTS billing_config (
  id                  TEXT PRIMARY KEY DEFAULT 'default',
  discount_per_module NUMERIC(5,2) DEFAULT 5,    -- % par module additionnel
  discount_cap        NUMERIC(5,2) DEFAULT 30,   -- plafond %
  currency            TEXT DEFAULT 'CAD',
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- RLS permissif (aligné existant, à durcir)
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

-- Seed catalogue (prix par défaut, ajustables ensuite via l'Admin)
INSERT INTO modules (key, name_fr, name_en, monthly_price, sort_order) VALUES
  ('admin',       'Administration',     'Administration',   0,   0),
  ('projects',    'Projets',            'Projects',         500, 10),
  ('planner',     'Planificateur',      'Scheduler',        500, 20),
  ('ast',         'AST / Sécurité',     'JSA / Safety',     500, 30),
  ('permits',     'Permis',             'Permits',          500, 40),
  ('accidents',   'Accidents',          'Accidents',        500, 50),
  ('near_miss',   'Presque-accidents',  'Near-miss',        500, 60),
  ('inventory',   'Inventaire',         'Inventory',        500, 70),
  ('inspections', 'Inspections d''équip.', 'Equip. inspections', 500, 80),
  ('timesheets',  'Feuille de temps',   'Timesheets',       500, 90),
  ('todo',        'To-Do',              'To-Do',            0,   100)
ON CONFLICT (key) DO NOTHING;

INSERT INTO billing_config (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- CERDIA = tenant tout inclus (tous les modules activés)
INSERT INTO tenant_modules (tenant_id, module_key, enabled, source)
SELECT 'cerdia', key, TRUE, 'manual' FROM modules
ON CONFLICT (tenant_id, module_key) DO NOTHING;
