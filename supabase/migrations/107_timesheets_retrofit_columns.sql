-- 107 — Rétro-ajout des colonnes manquantes de la table timesheets.
-- La migration 029 (CREATE TABLE IF NOT EXISTS) a été ignorée car une ancienne table
-- timesheets existait déjà (id, tenant_id, user_id, period_start, period_end, status).
-- Résultat : les colonnes du schéma riche (employee_id, totaux, etc.) n'ont jamais été créées,
-- ce qui provoque des 400 (« column timesheets.employee_id does not exist ») dans le module.
-- Ce script est idempotent (ADD COLUMN IF NOT EXISTS) et backfill employee_id depuis user_id.

ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS employee_id       TEXT;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS employee_email    TEXT NOT NULL DEFAULT '';
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS employee_name     TEXT NOT NULL DEFAULT '';
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS total_regular     NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS total_overtime    NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS total_premium     NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS total_km          NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS total_km_personal NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS total_amount      NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS submitted_at      TIMESTAMPTZ;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS approved_at       TIMESTAMPTZ;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS approved_by       TEXT;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS rejection_note    TEXT;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS paid_at           TIMESTAMPTZ;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS notes             TEXT NOT NULL DEFAULT '';
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS created_at        TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS updated_at        TIMESTAMPTZ NOT NULL DEFAULT now();

-- Backfill : les anciennes feuilles utilisaient user_id ; on copie vers employee_id si présent.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'timesheets' AND column_name = 'user_id') THEN
    UPDATE timesheets SET employee_id = user_id::text WHERE employee_id IS NULL AND user_id IS NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS timesheets_tenant_employee_idx ON timesheets (tenant_id, employee_id, period_start DESC);

-- S'assure que la table des lignes existe (référencée par le détail de feuille).
CREATE TABLE IF NOT EXISTS timesheet_entries (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id    UUID        NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
  tenant_id       TEXT        NOT NULL,
  sort_order      INT         NOT NULL DEFAULT 0,
  date            DATE        NOT NULL,
  category        TEXT        NOT NULL DEFAULT 'project',
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
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS timesheet_entries_access ON timesheet_entries;
CREATE POLICY timesheet_entries_access ON timesheet_entries FOR ALL USING (true) WITH CHECK (true);
