-- 068: Grilles salariales par poste + paliers + schéma de compétences
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- ─── Grille salariale (1 par poste, optionnelle) ────────────────────────────
CREATE TABLE IF NOT EXISTS poste_salary_grids (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               TEXT NOT NULL,
  poste_id                UUID NOT NULL REFERENCES planner_postes(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL DEFAULT 'Grille standard',
  mode                    TEXT NOT NULL DEFAULT 'percentage'
                            CHECK (mode IN ('percentage','fixed','custom')),
  base_salary             NUMERIC(12,2) DEFAULT 0,           -- salaire annuel de base
  annual_increase_pct     NUMERIC(5,2)  DEFAULT 3.0,         -- % augmentation annuelle (mode percentage)
  annual_increase_fixed   NUMERIC(10,2) DEFAULT 1500,        -- $ augmentation annuelle (mode fixed)
  years_plan              INTEGER       DEFAULT 5,           -- nombre de paliers à générer
  cola_pct                NUMERIC(5,2)  DEFAULT 0,           -- ajustement coût de la vie %
  hours_per_year          NUMERIC(6,1)  DEFAULT 2080,        -- pour calcul taux horaire (40h × 52)
  active                  BOOLEAN       DEFAULT TRUE,
  notes                   TEXT,
  created_at              TIMESTAMPTZ   DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE (tenant_id, poste_id)
);

CREATE INDEX IF NOT EXISTS psg_tenant_idx ON poste_salary_grids (tenant_id);
CREATE INDEX IF NOT EXISTS psg_poste_idx  ON poste_salary_grids (poste_id);
ALTER TABLE poste_salary_grids ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS psg_access ON poste_salary_grids;
CREATE POLICY psg_access ON poste_salary_grids FOR ALL USING (true) WITH CHECK (true);

-- ─── Paliers (tiers) — générés auto ou édités manuellement ──────────────────
CREATE TABLE IF NOT EXISTS poste_salary_tiers (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               TEXT NOT NULL,
  grid_id                 UUID NOT NULL REFERENCES poste_salary_grids(id) ON DELETE CASCADE,
  tier_level              INTEGER NOT NULL,                  -- 0 = entrée, 1, 2, 3...
  tier_name               TEXT,                              -- "Junior", "Intermédiaire", "Senior"
  annual_salary           NUMERIC(12,2) NOT NULL DEFAULT 0,
  hourly_rate             NUMERIC(8,4),                      -- calculé ou saisi
  required_skills         JSONB DEFAULT '[]'::jsonb,         -- [{ name, level }] requis pour atteindre ce palier
  min_months_experience   INTEGER DEFAULT 0,                 -- temps min. dans palier précédent
  sort_order              INTEGER DEFAULT 0,
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (grid_id, tier_level)
);

CREATE INDEX IF NOT EXISTS pst_grid_idx ON poste_salary_tiers (grid_id, tier_level);
ALTER TABLE poste_salary_tiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pst_access ON poste_salary_tiers;
CREATE POLICY pst_access ON poste_salary_tiers FOR ALL USING (true) WITH CHECK (true);

-- ─── Catalogue de compétences (par tenant, partagé entre postes) ────────────
CREATE TABLE IF NOT EXISTS poste_skills_catalog (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  name          TEXT NOT NULL,
  category      TEXT,                                          -- 'Technique', 'Sécurité', 'Gestion', 'Soft skills'
  description   TEXT,
  active        BOOLEAN DEFAULT TRUE,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, name)
);

CREATE INDEX IF NOT EXISTS psc_tenant_idx ON poste_skills_catalog (tenant_id, active, sort_order);
ALTER TABLE poste_skills_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS psc_access ON poste_skills_catalog;
CREATE POLICY psc_access ON poste_skills_catalog FOR ALL USING (true) WITH CHECK (true);

-- ─── Lien employé ↔ palier actuel (suivi des progressions) ──────────────────
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS current_tier_id UUID;
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS tier_since      DATE;
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS acquired_skills JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS pp_tier_idx ON planner_personnel (current_tier_id) WHERE current_tier_id IS NOT NULL;
