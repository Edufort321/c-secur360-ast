-- =====================================================
-- MIGRATION 010 — CORE : Clients, Sites, Projets (pivot), Taux, Matériel, ERP
-- Comble le manque structurel (aucune table projects/clients/sites) et interconnecte
-- les modules via project_id (normalisé en uuid + FK).
-- À exécuter EN DERNIER (référence inv_items, ast_forms, planned_assignments, etc.).
-- Idempotent / non destructif.
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- 1. CLIENTS (clients finaux du tenant) --------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id     TEXT NOT NULL,
  name          TEXT NOT NULL,
  code          TEXT,
  industry      TEXT,
  type          TEXT,
  contacts      JSONB DEFAULT '[]'::jsonb,
  address       JSONB,
  notes         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  source_system TEXT DEFAULT 'native',
  external_id   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);

-- 2. SITES (sites physiques du tenant) ---------------------------------------
CREATE TABLE IF NOT EXISTS sites (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id     TEXT NOT NULL,
  end_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  code          TEXT,
  address       JSONB,
  type          TEXT DEFAULT 'site',     -- siege|chantier|bureau|site
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);

-- 3. PROJETS (hub inter-modules) ---------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id         TEXT NOT NULL,
  project_number    TEXT NOT NULL,
  title             TEXT,
  end_client_id     UUID REFERENCES clients(id) ON DELETE SET NULL,
  site_id           UUID REFERENCES sites(id) ON DELETE SET NULL,
  client_name       TEXT,
  location          TEXT,
  dossier           TEXT,
  submission_number TEXT,
  po_number         TEXT,
  po_amount         DECIMAL(14,2),
  status            TEXT DEFAULT 'soumission',
  project_type      TEXT DEFAULT 'budgetaire',
  pricing_mode      TEXT DEFAULT 'ventile',
  global_price      DECIMAL(14,2),
  date_submission   DATE,
  date_work_start   DATE,
  estimate          JSONB DEFAULT '{}'::jsonb,
  settings          JSONB DEFAULT '{}'::jsonb,
  source_system     TEXT DEFAULT 'native',
  external_id       TEXT,
  external_data     JSONB,
  created_by        TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, project_number)
);

-- 4. TAUX configurables ------------------------------------------------------
CREATE TABLE IF NOT EXISTS labor_rates (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id      TEXT NOT NULL,
  code           TEXT NOT NULL,
  label          TEXT,
  rate_regular   DECIMAL(10,2) DEFAULT 0,
  rate_overtime  DECIMAL(10,2) DEFAULT 0,
  rate_premium   DECIMAL(10,2) DEFAULT 0,
  currency       TEXT DEFAULT 'CAD',
  effective_date DATE DEFAULT CURRENT_DATE,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, code, effective_date)
);

CREATE TABLE IF NOT EXISTS rate_settings (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id      TEXT NOT NULL,
  category       TEXT NOT NULL,
  key            TEXT NOT NULL,
  value          DECIMAL(12,4) DEFAULT 0,
  meta           JSONB DEFAULT '{}'::jsonb,
  effective_date DATE DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, category, key, effective_date)
);

-- 5. MATÉRIEL DE PROJET (pont -> inv_items) ----------------------------------
CREATE TABLE IF NOT EXISTS project_materials (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item_id     UUID REFERENCES inv_items(id) ON DELETE SET NULL,
  description TEXT,
  qty         DECIMAL(12,2) DEFAULT 0,
  unit_price  DECIMAL(12,2) DEFAULT 0,
  line_type   TEXT DEFAULT 'estimate',     -- estimate | actual
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INTÉGRATIONS ERP --------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenant_integrations (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id    TEXT NOT NULL,
  provider     TEXT NOT NULL,
  direction    TEXT DEFAULT 'bidirectional',
  config       JSONB DEFAULT '{}'::jsonb,
  credentials  JSONB,
  is_active    BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, provider)
);

CREATE TABLE IF NOT EXISTS integration_sync_log (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id      TEXT NOT NULL,
  integration_id UUID REFERENCES tenant_integrations(id) ON DELETE CASCADE,
  entity_type    TEXT,
  local_id       TEXT,
  external_id    TEXT,
  action         TEXT,
  status         TEXT,
  payload        JSONB,
  error          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INTERCONNEXION : project_id -> uuid (si table vide) + FK -> projects -----
DO $$
DECLARE tbls TEXT[] := ARRAY['timesheet_entries','planned_assignments','vehicle_logs'];
        t TEXT; n BIGINT;
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('SELECT count(*) FROM %I', t) INTO n;
      IF n = 0 THEN
        EXECUTE format('ALTER TABLE %I ALTER COLUMN project_id DROP NOT NULL', t);
        EXECUTE format('ALTER TABLE %I ALTER COLUMN project_id TYPE uuid USING NULLIF(project_id, '''')::uuid', t);
      ELSE
        RAISE NOTICE '010: % non vide (% lignes) — project_id NON converti', t, n;
      END IF;
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE tbls TEXT[] := ARRAY['timesheet_entries','planned_assignments','vehicle_logs','inv_transactions'];
        t TEXT;
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name=t AND column_name='project_id' AND data_type='uuid') THEN
      EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS fk_%s_project', t, t);
      EXECUTE format('ALTER TABLE %I ADD CONSTRAINT fk_%s_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL', t, t);
    END IF;
  END LOOP;
END $$;

ALTER TABLE ast_forms              ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE confined_space_permits ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- 8. RLS (permissif, aligné sur l'existant — à durcir) -----------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clients','sites','projects','labor_rates','rate_settings','project_materials',
    'tenant_integrations','integration_sync_log'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS %I_access ON %I;', t, t);
    EXECUTE format('CREATE POLICY %I_access ON %I FOR ALL USING (true);', t, t);
  END LOOP;
END $$;

-- 9. Index -------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clients_tenant         ON clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sites_tenant           ON sites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_tenant        ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_number        ON projects(tenant_id, project_number);
CREATE INDEX IF NOT EXISTS idx_projects_external      ON projects(source_system, external_id);
CREATE INDEX IF NOT EXISTS idx_labor_rates_tenant     ON labor_rates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rate_settings_tenant   ON rate_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_materials_proj ON project_materials(project_id);
CREATE INDEX IF NOT EXISTS idx_project_materials_item ON project_materials(item_id);
CREATE INDEX IF NOT EXISTS idx_integrations_tenant    ON tenant_integrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_tenant        ON integration_sync_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ast_forms_project      ON ast_forms(project_id);

-- 10. Triggers updated_at ----------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients','sites','projects','labor_rates','rate_settings','tenant_integrations'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I;', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t, t);
  END LOOP;
END $$;
