-- =====================================================
-- MIGRATION 029 — Feuilles de temps employé
-- =====================================================

-- Feuille de temps (en-tête, par période/semaine)
CREATE TABLE IF NOT EXISTS timesheets (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      TEXT        NOT NULL,
  employee_id    TEXT        NOT NULL,
  employee_email TEXT        NOT NULL DEFAULT '',
  employee_name  TEXT        NOT NULL DEFAULT '',
  period_start   DATE        NOT NULL,
  period_end     DATE        NOT NULL,
  status         TEXT        NOT NULL DEFAULT 'draft',
  -- 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid'
  total_regular  NUMERIC     NOT NULL DEFAULT 0,
  total_overtime NUMERIC     NOT NULL DEFAULT 0,
  total_premium  NUMERIC     NOT NULL DEFAULT 0,
  total_km       NUMERIC     NOT NULL DEFAULT 0,
  total_km_personal NUMERIC  NOT NULL DEFAULT 0,
  total_amount   NUMERIC     NOT NULL DEFAULT 0,
  submitted_at   TIMESTAMPTZ,
  approved_at    TIMESTAMPTZ,
  approved_by    TEXT,
  rejection_note TEXT,
  paid_at        TIMESTAMPTZ,
  notes          TEXT        NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS timesheets_tenant_employee_idx ON timesheets (tenant_id, employee_id, period_start DESC);
CREATE INDEX IF NOT EXISTS timesheets_tenant_status_idx  ON timesheets (tenant_id, status, period_start DESC);

-- Lignes de la feuille de temps
CREATE TABLE IF NOT EXISTS timesheet_entries (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id    UUID        NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
  tenant_id       TEXT        NOT NULL,
  sort_order      INT         NOT NULL DEFAULT 0,
  date            DATE        NOT NULL,
  category        TEXT        NOT NULL DEFAULT 'project',
  -- 'project' | 'admin' | 'atelier' | 'autre'
  project_id      TEXT,
  project_number  TEXT        NOT NULL DEFAULT '',
  project_title   TEXT        NOT NULL DEFAULT '',
  client_name     TEXT        NOT NULL DEFAULT '',
  description     TEXT        NOT NULL DEFAULT '',
  hrs_regular     NUMERIC     NOT NULL DEFAULT 0,
  hrs_overtime    NUMERIC     NOT NULL DEFAULT 0,
  hrs_premium     NUMERIC     NOT NULL DEFAULT 0,
  km              NUMERIC     NOT NULL DEFAULT 0,
  vehicle_id      UUID,
  vehicle_type    TEXT        NOT NULL DEFAULT '',
  vehicle_name    TEXT        NOT NULL DEFAULT '',
  materiel        NUMERIC     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS timesheet_entries_sheet_idx ON timesheet_entries (timesheet_id, sort_order);

-- RLS
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS timesheets_access ON timesheets;
CREATE POLICY timesheets_access ON timesheets FOR ALL USING (true);

ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS timesheet_entries_access ON timesheet_entries;
CREATE POLICY timesheet_entries_access ON timesheet_entries FOR ALL USING (true);
