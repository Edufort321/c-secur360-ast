-- =====================================================
-- MIGRATION 020 — Schéma Planner (tables VIDES + tenant_id + RLS)
-- Sans persistance = page /planificateur → 404 ou données perdues au refresh.
-- Tables namespacées planner_* pour éviter les conflits.
-- Idempotent.
-- =====================================================

-- JOBS (chantiers / affectations planifiées)
CREATE TABLE IF NOT EXISTS planner_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  site_id       TEXT,
  job_number    TEXT,
  project_id    TEXT,                         -- lien vers projects.id
  title         TEXT NOT NULL,
  client        TEXT,
  location      TEXT,
  start_date    DATE,
  end_date      DATE,
  status        TEXT DEFAULT 'planned'
                  CHECK (status IN ('planned','active','completed','cancelled')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- PERSONNEL
CREATE TABLE IF NOT EXISTS planner_personnel (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  site_id       TEXT,
  name          TEXT NOT NULL,
  role          TEXT,
  department_id UUID,
  phone         TEXT,
  email         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ÉQUIPEMENTS
CREATE TABLE IF NOT EXISTS planner_equipements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  site_id       TEXT,
  name          TEXT NOT NULL,
  type          TEXT,
  serial_number TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- POSTES (types de poste / métiers)
CREATE TABLE IF NOT EXISTS planner_postes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  name          TEXT NOT NULL,
  code          TEXT,
  color         TEXT DEFAULT '#6b7280',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- SUCCURSALES / SITES PLANNER
CREATE TABLE IF NOT EXISTS planner_succursales (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  name          TEXT NOT NULL,
  code          TEXT,
  address       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- DÉPARTEMENTS PLANNER
CREATE TABLE IF NOT EXISTS planner_departements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  succursale_id UUID REFERENCES planner_succursales(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  code          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- CONGÉS / ABSENCES
CREATE TABLE IF NOT EXISTS planner_conges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      TEXT NOT NULL,
  personnel_id   UUID REFERENCES planner_personnel(id) ON DELETE CASCADE,
  start_date     DATE NOT NULL,
  end_date       DATE NOT NULL,
  type           TEXT DEFAULT 'conge'
                   CHECK (type IN ('conge','maladie','formation','autre')),
  approved       BOOLEAN DEFAULT FALSE,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- AFFECTATIONS (personnel + équipement → job, par jour)
CREATE TABLE IF NOT EXISTS planner_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       TEXT NOT NULL,
  job_id          UUID REFERENCES planner_jobs(id) ON DELETE CASCADE,
  personnel_id    UUID REFERENCES planner_personnel(id) ON DELETE SET NULL,
  equipement_id   UUID REFERENCES planner_equipements(id) ON DELETE SET NULL,
  poste_id        UUID REFERENCES planner_postes(id) ON DELETE SET NULL,
  assigned_date   DATE NOT NULL,
  hours           NUMERIC(4,1) DEFAULT 8,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- INDEX
CREATE INDEX IF NOT EXISTS idx_planner_jobs_tenant       ON planner_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_planner_jobs_site         ON planner_jobs(site_id);
CREATE INDEX IF NOT EXISTS idx_planner_jobs_dates        ON planner_jobs(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_planner_personnel_tenant  ON planner_personnel(tenant_id);
CREATE INDEX IF NOT EXISTS idx_planner_assignments_job   ON planner_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_planner_assignments_date  ON planner_assignments(assigned_date);
CREATE INDEX IF NOT EXISTS idx_planner_assignments_pers  ON planner_assignments(personnel_id);
CREATE INDEX IF NOT EXISTS idx_planner_conges_pers       ON planner_conges(personnel_id);

-- RLS permissif (à durcir avec scoping multi-tenant)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'planner_jobs','planner_personnel','planner_equipements',
    'planner_postes','planner_succursales','planner_departements',
    'planner_conges','planner_assignments'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS %I_all ON %I;', t, t);
    EXECUTE format('CREATE POLICY %I_all ON %I FOR ALL USING (true) WITH CHECK (true);', t, t);
  END LOOP;
END $$;

-- Aucun seed : chaque tenant crée ses propres données.
