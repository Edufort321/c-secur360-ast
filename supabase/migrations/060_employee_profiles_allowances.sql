-- 060: Profils employés + avantages configurables + primes d'heures
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- ─── Profils de paie employés ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employee_profiles (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       TEXT        NOT NULL,
  employee_id     TEXT        NOT NULL,  -- users.id
  employee_name   TEXT        NOT NULL DEFAULT '',
  employee_email  TEXT        NOT NULL DEFAULT '',
  hourly_rate     NUMERIC(10,2) NOT NULL DEFAULT 0,
  ot_multiplier   NUMERIC(4,2)  NOT NULL DEFAULT 1.5,  -- 1.5x OT
  dt_multiplier   NUMERIC(4,2)  NOT NULL DEFAULT 2.0,  -- 2x DT
  ot_daily_hrs    NUMERIC       DEFAULT 8,    -- seuil heures/jour avant OT
  dt_daily_hrs    NUMERIC       DEFAULT NULL, -- seuil heures/jour avant DT (null = pas de DT)
  ot_weekly_hrs   NUMERIC       DEFAULT 40,   -- seuil heures/semaine avant OT
  active          BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, employee_id)
);
CREATE INDEX IF NOT EXISTS ep_tenant_idx ON employee_profiles (tenant_id);
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ep_access ON employee_profiles;
CREATE POLICY ep_access ON employee_profiles FOR ALL USING (true);

-- ─── Avantages configurables (Dîner 35$, Coucher 100$, etc.) ─────────────
CREATE TABLE IF NOT EXISTS timesheet_allowances (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT        NOT NULL,
  name        TEXT        NOT NULL,           -- "Dîner", "Coucher", "Déplacement"
  amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_taxable  BOOLEAN     NOT NULL DEFAULT false,
  active      BOOLEAN     NOT NULL DEFAULT true,
  sort_order  INT         NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ta_tenant_idx ON timesheet_allowances (tenant_id, active, sort_order);
ALTER TABLE timesheet_allowances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ta_access ON timesheet_allowances;
CREATE POLICY ta_access ON timesheet_allowances FOR ALL USING (true);

-- ─── Primes par plage d'heures (prime 5h, prime 12h...) ──────────────────
CREATE TABLE IF NOT EXISTS timesheet_hour_bonuses (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT        NOT NULL,
  name          TEXT        NOT NULL,          -- "Prime 5h", "Prime 12h"
  trigger_hours NUMERIC     NOT NULL,          -- seuil heures/jour qui déclenche
  bonus_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_taxable    BOOLEAN     NOT NULL DEFAULT true,
  active        BOOLEAN     NOT NULL DEFAULT true,
  sort_order    INT         NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS thb_tenant_idx ON timesheet_hour_bonuses (tenant_id, active, sort_order);
ALTER TABLE timesheet_hour_bonuses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS thb_access ON timesheet_hour_bonuses;
CREATE POLICY thb_access ON timesheet_hour_bonuses FOR ALL USING (true);

-- ─── Colonnes sur timesheet_entries ──────────────────────────────────────
-- Avantages cochés sur la ligne (snapshot: [{id, name, amount}])
ALTER TABLE timesheet_entries
  ADD COLUMN IF NOT EXISTS allowances JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ─── Colonnes sur timesheets (totaux) ────────────────────────────────────
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS total_allowances NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS total_bonuses    NUMERIC NOT NULL DEFAULT 0;
