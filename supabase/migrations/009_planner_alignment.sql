-- =====================================================
-- MIGRATION 009 — ALIGNEMENT PLANIFICATEUR (planned_assignments existant)
-- Pas de tables planner_* redondantes : on s'aligne + on ajoute les congés.
-- Idempotent / non destructif.
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- 1. Ancrage tenant sur planned_assignments ---------------------------------
ALTER TABLE planned_assignments ADD COLUMN IF NOT EXISTS tenant_id TEXT;
CREATE INDEX IF NOT EXISTS idx_planned_assignments_tenant  ON planned_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_planned_assignments_project ON planned_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_planned_assignments_dates   ON planned_assignments(planned_start, planned_end);
-- (project_id normalisé en uuid + FK -> projects(id) dans la migration 010)

-- 2. Congés / absences (manquant) -------------------------------------------
CREATE TABLE IF NOT EXISTS planner_leaves (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id     TEXT NOT NULL,
  user_id       TEXT REFERENCES users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,                 -- vacances|maladie|personnel|formation|maternite|autre
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  status        TEXT DEFAULT 'demande',        -- demande|approuve|refuse
  reason        TEXT,
  approved_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE planner_leaves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS planner_leaves_access ON planner_leaves;
CREATE POLICY planner_leaves_access ON planner_leaves FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_planner_leaves_tenant ON planner_leaves(tenant_id);
CREATE INDEX IF NOT EXISTS idx_planner_leaves_dates  ON planner_leaves(tenant_id, start_date, end_date);

DROP TRIGGER IF EXISTS trg_planner_leaves_updated_at ON planner_leaves;
CREATE TRIGGER trg_planner_leaves_updated_at BEFORE UPDATE ON planner_leaves
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
