-- 071: Catalogue de sous-classes partagé + évaluation salariale employé
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- ─── 1. Catalogue de sous-classes (partagé entre postes) ────────────────────
-- Permet de créer "Technique" une fois et de l'appliquer à plusieurs postes
CREATE TABLE IF NOT EXISTS poste_subclasses_catalog (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  name          TEXT NOT NULL,
  code          TEXT,
  color         TEXT DEFAULT '#06b6d4',
  category      TEXT,                   -- 'Métier', 'Spécialité', 'Domaine'
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

-- ─── 2. Lien M:N poste ↔ sous-classes du catalogue ──────────────────────────
ALTER TABLE planner_postes ADD COLUMN IF NOT EXISTS subclass_ids JSONB DEFAULT '[]'::jsonb;
-- Array d'UUIDs vers poste_subclasses_catalog.id

-- ─── 3. Pondération + niveau max sur compétences du catalogue ───────────────
ALTER TABLE poste_skills_catalog ADD COLUMN IF NOT EXISTS weight     NUMERIC(4,2) NOT NULL DEFAULT 1.00; -- 0.5 = moins important, 2 = très important
ALTER TABLE poste_skills_catalog ADD COLUMN IF NOT EXISTS max_level  INTEGER      NOT NULL DEFAULT 5;    -- niveau de maîtrise max (1=débutant, 5=expert)

-- ─── 4. Suivi salaire employé : embauche, actuel, dernière éval ─────────────
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS hire_date              DATE;
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS hire_salary            NUMERIC(12,2);   -- salaire d'embauche
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS current_salary         NUMERIC(12,2);   -- salaire courant (peut différer de l'embauche)
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS current_grid_id        UUID;            -- grille appliquée (peut être null = custom)
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS last_evaluation_date   DATE;
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS next_evaluation_date   DATE;

-- ─── 5. Acquired_skills déjà existant (migration 068) — on étend le format ──
-- Format attendu : [{ skill_id, name, level: 0-max_level }]
-- (déjà JSONB '[]' par défaut)

-- ─── 6. Historique des évaluations (audit + projection) ─────────────────────
CREATE TABLE IF NOT EXISTS employee_evaluations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             TEXT NOT NULL,
  personnel_id          UUID NOT NULL REFERENCES planner_personnel(id) ON DELETE CASCADE,
  grid_id               UUID REFERENCES poste_salary_grids(id) ON DELETE SET NULL,
  tier_id               UUID REFERENCES poste_salary_tiers(id) ON DELETE SET NULL,
  evaluation_date       DATE NOT NULL,
  effective_date        DATE,                       -- date à laquelle l'ajustement entre en vigueur
  salary_before         NUMERIC(12,2),
  salary_after          NUMERIC(12,2),
  cola_pct              NUMERIC(5,2) DEFAULT 0,
  cola_amount           NUMERIC(12,2) DEFAULT 0,
  skill_score           NUMERIC(5,2),               -- 0 à 100 (% compétences acquises pondérées)
  skill_increase_pct    NUMERIC(5,2) DEFAULT 0,
  skill_increase_amount NUMERIC(12,2) DEFAULT 0,
  total_increase_pct    NUMERIC(5,2),
  total_increase_amount NUMERIC(12,2),
  notes                 TEXT,
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','approved','applied','cancelled')),
  approved_by           TEXT,
  approved_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ee_personnel_idx ON employee_evaluations (personnel_id, evaluation_date DESC);
CREATE INDEX IF NOT EXISTS ee_tenant_idx    ON employee_evaluations (tenant_id, status);
ALTER TABLE employee_evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ee_access ON employee_evaluations;
CREATE POLICY ee_access ON employee_evaluations FOR ALL USING (true) WITH CHECK (true);
