-- =====================================================
-- MIGRATION 030 — Logbook véhicules (odomètre hebdomadaire)
-- =====================================================

CREATE TABLE IF NOT EXISTS vehicle_logbook (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT        NOT NULL,
  employee_id      TEXT        NOT NULL,
  employee_name    TEXT        NOT NULL DEFAULT '',
  vehicle_id       UUID        NOT NULL,
  vehicle_name     TEXT        NOT NULL DEFAULT '',
  vehicle_type     TEXT        NOT NULL DEFAULT 'company',
  week_start       DATE        NOT NULL,
  odometer_start   NUMERIC     NOT NULL DEFAULT 0,
  odometer_end     NUMERIC     NOT NULL DEFAULT 0,
  km_total         NUMERIC     GENERATED ALWAYS AS (odometer_end - odometer_start) STORED,
  km_personal      NUMERIC     NOT NULL DEFAULT 0,
  km_professional  NUMERIC     GENERATED ALWAYS AS (GREATEST(0, (odometer_end - odometer_start) - km_personal)) STORED,
  notes            TEXT        NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT vehicle_logbook_unique_week UNIQUE (tenant_id, employee_id, vehicle_id, week_start)
);

CREATE INDEX IF NOT EXISTS vehicle_logbook_tenant_idx    ON vehicle_logbook (tenant_id, week_start DESC);
CREATE INDEX IF NOT EXISTS vehicle_logbook_employee_idx  ON vehicle_logbook (tenant_id, employee_id, week_start DESC);
CREATE INDEX IF NOT EXISTS vehicle_logbook_vehicle_idx   ON vehicle_logbook (vehicle_id, week_start DESC);

ALTER TABLE vehicle_logbook ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vehicle_logbook_access ON vehicle_logbook;
CREATE POLICY vehicle_logbook_access ON vehicle_logbook FOR ALL USING (true);
