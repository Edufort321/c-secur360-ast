-- ════════════════════════════════════════════════════════════════════════════
-- MIGRATION CONSOLIDÉE — exécuter dans le SQL Editor de Supabase Dashboard
-- Idempotente : peut être ré-exécutée sans danger
-- Couvre : 062 à 071 (tous les ajouts récents)
-- ════════════════════════════════════════════════════════════════════════════

-- ───────────────────── 047 + 048 : Personnel ─────────────────────────────────
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS "niveauAcces" TEXT NOT NULL DEFAULT 'consultation';
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS succursale TEXT;

-- ───────────────────── 067 : is_active partout ──────────────────────────────
ALTER TABLE planner_personnel   ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE planner_equipements ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE planner_postes      ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- ───────────────────── 070 : sous-classes (legacy JSONB) ─────────────────────
ALTER TABLE planner_postes    ADD COLUMN IF NOT EXISTS subclasses JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS subclass TEXT;

-- ───────────────────── 071 : catalogue sous-classes (nouveau) ───────────────
ALTER TABLE planner_postes ADD COLUMN IF NOT EXISTS subclass_ids JSONB DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS poste_subclasses_catalog (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  name          TEXT NOT NULL,
  code          TEXT,
  color         TEXT DEFAULT '#06b6d4',
  category      TEXT,
  description   TEXT,
  active        BOOLEAN DEFAULT TRUE,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, name)
);
CREATE INDEX IF NOT EXISTS subcat_tenant_idx ON poste_subclasses_catalog (tenant_id, active, sort_order);
ALTER TABLE poste_subclasses_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS subcat_access ON poste_subclasses_catalog;
CREATE POLICY subcat_access ON poste_subclasses_catalog FOR ALL USING (true) WITH CHECK (true);

-- ───────────────────── 068 : grilles salariales ─────────────────────────────
CREATE TABLE IF NOT EXISTS poste_salary_grids (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               TEXT NOT NULL,
  poste_id                UUID NOT NULL REFERENCES planner_postes(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL DEFAULT 'Grille standard',
  mode                    TEXT NOT NULL DEFAULT 'percentage' CHECK (mode IN ('percentage','fixed','custom')),
  base_salary             NUMERIC(12,2) DEFAULT 0,
  annual_increase_pct     NUMERIC(5,2)  DEFAULT 3.0,
  annual_increase_fixed   NUMERIC(10,2) DEFAULT 1500,
  years_plan              INTEGER       DEFAULT 5,
  cola_pct                NUMERIC(5,2)  DEFAULT 0,
  hours_per_year          NUMERIC(6,1)  DEFAULT 2080,
  active                  BOOLEAN       DEFAULT TRUE,
  notes                   TEXT,
  created_at              TIMESTAMPTZ   DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE (tenant_id, poste_id)
);
ALTER TABLE poste_salary_grids ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS psg_access ON poste_salary_grids;
CREATE POLICY psg_access ON poste_salary_grids FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS poste_salary_tiers (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               TEXT NOT NULL,
  grid_id                 UUID NOT NULL REFERENCES poste_salary_grids(id) ON DELETE CASCADE,
  tier_level              INTEGER NOT NULL,
  tier_name               TEXT,
  annual_salary           NUMERIC(12,2) NOT NULL DEFAULT 0,
  hourly_rate             NUMERIC(8,4),
  required_skills         JSONB DEFAULT '[]'::jsonb,
  min_months_experience   INTEGER DEFAULT 0,
  sort_order              INTEGER DEFAULT 0,
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (grid_id, tier_level)
);
ALTER TABLE poste_salary_tiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pst_access ON poste_salary_tiers;
CREATE POLICY pst_access ON poste_salary_tiers FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS poste_skills_catalog (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  name          TEXT NOT NULL,
  category      TEXT,
  description   TEXT,
  active        BOOLEAN DEFAULT TRUE,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, name)
);
ALTER TABLE poste_skills_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS psc_access ON poste_skills_catalog;
CREATE POLICY psc_access ON poste_skills_catalog FOR ALL USING (true) WITH CHECK (true);

-- ───────────────────── 069 : commissions ─────────────────────────────────────
ALTER TABLE poste_salary_grids ADD COLUMN IF NOT EXISTS commission_enabled   BOOLEAN       NOT NULL DEFAULT FALSE;
ALTER TABLE poste_salary_grids ADD COLUMN IF NOT EXISTS commission_pct       NUMERIC(5,2)  DEFAULT 0;
ALTER TABLE poste_salary_grids ADD COLUMN IF NOT EXISTS commission_basis     TEXT          DEFAULT 'gross' CHECK (commission_basis IN ('gross','net','margin','custom'));
ALTER TABLE poste_salary_grids ADD COLUMN IF NOT EXISTS commission_threshold NUMERIC(12,2) DEFAULT 0;
ALTER TABLE poste_salary_grids ADD COLUMN IF NOT EXISTS commission_cap       NUMERIC(12,2);
ALTER TABLE poste_salary_tiers ADD COLUMN IF NOT EXISTS commission_pct       NUMERIC(5,2);

-- ───────────────────── 071 : skill weight + employee evaluation ─────────────
ALTER TABLE poste_skills_catalog ADD COLUMN IF NOT EXISTS weight     NUMERIC(4,2) NOT NULL DEFAULT 1.00;
ALTER TABLE poste_skills_catalog ADD COLUMN IF NOT EXISTS max_level  INTEGER      NOT NULL DEFAULT 5;

ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS hire_date              DATE;
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS hire_salary            NUMERIC(12,2);
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS current_salary         NUMERIC(12,2);
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS current_grid_id        UUID;
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS last_evaluation_date   DATE;
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS next_evaluation_date   DATE;
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS acquired_skills        JSONB DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS employee_evaluations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             TEXT NOT NULL,
  personnel_id          UUID NOT NULL REFERENCES planner_personnel(id) ON DELETE CASCADE,
  grid_id               UUID REFERENCES poste_salary_grids(id) ON DELETE SET NULL,
  tier_id               UUID REFERENCES poste_salary_tiers(id) ON DELETE SET NULL,
  evaluation_date       DATE NOT NULL,
  effective_date        DATE,
  salary_before         NUMERIC(12,2),
  salary_after          NUMERIC(12,2),
  cola_pct              NUMERIC(5,2) DEFAULT 0,
  cola_amount           NUMERIC(12,2) DEFAULT 0,
  skill_score           NUMERIC(5,2),
  skill_increase_pct    NUMERIC(5,2) DEFAULT 0,
  skill_increase_amount NUMERIC(12,2) DEFAULT 0,
  total_increase_pct    NUMERIC(5,2),
  total_increase_amount NUMERIC(12,2),
  notes                 TEXT,
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','applied','cancelled')),
  approved_by           TEXT,
  approved_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE employee_evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ee_access ON employee_evaluations;
CREATE POLICY ee_access ON employee_evaluations FOR ALL USING (true) WITH CHECK (true);

-- ───────────────────── VÉRIFICATION ──────────────────────────────────────────
SELECT 'planner_personnel' AS t, column_name FROM information_schema.columns WHERE table_name='planner_personnel'
  AND column_name IN ('niveauAcces','succursale','subclass','hire_date','hire_salary','current_salary','acquired_skills')
ORDER BY column_name;
