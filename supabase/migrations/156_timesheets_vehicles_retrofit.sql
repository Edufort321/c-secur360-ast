-- 156 — RETROFIT idempotent du module Feuille de temps + Véhicules.
-- Corrige les 404/400 observés (tables/colonnes manquantes parce que d'anciennes migrations
-- n'ont pas toutes ete appliquees dans ce projet Supabase) : employee_profiles, timesheet_allowances,
-- timesheet_hour_bonuses (060) ; colonnes timesheet_entries (sort_order, etc.) ; colonnes vehicles
-- (assigned_to 059, active 027, regime 062, km_rate_override 027, is_sales_employee). Tout en
-- CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS -> re-execution sans danger.

-- ── Profils de paie employes (060) ──
CREATE TABLE IF NOT EXISTS public.employee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL, employee_id text NOT NULL,
  employee_name text NOT NULL DEFAULT '', employee_email text NOT NULL DEFAULT '',
  hourly_rate numeric(10,2) NOT NULL DEFAULT 0,
  ot_multiplier numeric(4,2) NOT NULL DEFAULT 1.5, dt_multiplier numeric(4,2) NOT NULL DEFAULT 2.0,
  ot_daily_hrs numeric DEFAULT 8, dt_daily_hrs numeric DEFAULT NULL, ot_weekly_hrs numeric DEFAULT 40,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, employee_id)
);
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ep_access ON public.employee_profiles;
CREATE POLICY ep_access ON public.employee_profiles FOR ALL USING (true) WITH CHECK (true);

-- ── Avantages configurables (060) ──
CREATE TABLE IF NOT EXISTS public.timesheet_allowances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL,
  name text NOT NULL, amount numeric(10,2) NOT NULL DEFAULT 0,
  is_taxable boolean NOT NULL DEFAULT false, active boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.timesheet_allowances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ta_access ON public.timesheet_allowances;
CREATE POLICY ta_access ON public.timesheet_allowances FOR ALL USING (true) WITH CHECK (true);

-- ── Primes par plage d'heures (060) ──
CREATE TABLE IF NOT EXISTS public.timesheet_hour_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL,
  name text NOT NULL, trigger_hours numeric NOT NULL, bonus_amount numeric(10,2) NOT NULL DEFAULT 0,
  is_taxable boolean NOT NULL DEFAULT true, active boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.timesheet_hour_bonuses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS thb_access ON public.timesheet_hour_bonuses;
CREATE POLICY thb_access ON public.timesheet_hour_bonuses FOR ALL USING (true) WITH CHECK (true);

-- ── Colonnes timesheet_entries (corrige le 400 sur order=sort_order) ──
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'project';
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS project_id text;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS project_number text NOT NULL DEFAULT '';
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS project_title text NOT NULL DEFAULT '';
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS client_name text NOT NULL DEFAULT '';
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS vehicle_id uuid;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS vehicle_type text NOT NULL DEFAULT '';
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS vehicle_name text NOT NULL DEFAULT '';
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS materiel numeric NOT NULL DEFAULT 0;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS allowances jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ── Totaux sur timesheets ──
ALTER TABLE public.timesheets ADD COLUMN IF NOT EXISTS total_allowances numeric NOT NULL DEFAULT 0;
ALTER TABLE public.timesheets ADD COLUMN IF NOT EXISTS total_bonuses numeric NOT NULL DEFAULT 0;

-- ── Colonnes vehicles (corrige le 400 assigned_to / active / regime / is_sales_employee) ──
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS assigned_to text;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS regime text NOT NULL DEFAULT 'A_achat';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS km_rate_override numeric;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS is_sales_employee boolean NOT NULL DEFAULT false;
