-- 223 — Paie réelle (#43) : moteur de retenues à la source (RRQ/RQAP/AE + impôt féd/QC) et
-- cotisations de l'employeur. Stocke les RUNS de paie (un par période/fréquence) et les LIGNES par
-- employé (brut → retenues → net + coût employeur). Réglages de paie par tenant (taux CNESST/FSS,
-- fréquence, année). Profil fiscal par employé (montants de demande TD1/TP-1015.3, exemptions).
-- DONNÉE SENSIBLE (salaires, Loi 25) : REVOKE anon — accès UNIQUEMENT par routes serveur service_role.
-- Idempotent + auto-enregistré.

-- ── Réglages de paie du tenant ───────────────────────────────────────────────
create table if not exists public.payroll_settings (
  tenant_id text primary key,
  pay_frequency text not null default 'biweekly',  -- weekly | biweekly | semimonthly | monthly
  tax_year int not null default 2026,
  fss_rate numeric not null default 0.0165,         -- Fonds des services de santé (employeur)
  cnesst_rate numeric not null default 0.02,        -- taux CNESST (décimal, ex. 0.02 = 2,00 $/100 $)
  wsdrf_rate numeric not null default 0.01,         -- loi du 1 % (formation)
  wsdrf_threshold numeric not null default 2000000, -- seuil de masse salariale pour la loi du 1 %
  params_override jsonb,                            -- surcharge des PARAMÈTRES ANNUELS (taux/paliers) si besoin
  updated_at timestamptz not null default now()
);
alter table public.payroll_settings enable row level security;
revoke all on public.payroll_settings from anon, authenticated;

-- ── Profil fiscal de l'employé (réglages des retenues) ───────────────────────
alter table if exists public.employee_profiles
  add column if not exists claim_federal numeric,   -- montant de demande fédéral (TD1) — null = MPB de base
  add column if not exists claim_quebec numeric,     -- montant de demande Québec (TP-1015.3) — null = MPB
  add column if not exists extra_tax_per_period numeric default 0, -- retenue d'impôt additionnelle demandée
  add column if not exists deductions_annual numeric default 0,    -- autres déductions annuelles (REER retenu…)
  add column if not exists exempt_cpp boolean default false,       -- exempté RRQ
  add column if not exists exempt_ei boolean default false,        -- exempté AE
  add column if not exists pay_frequency text;                     -- fréquence propre à l'employé (sinon réglage tenant)

-- ── Runs de paie (un en-tête par traitement de période) ──────────────────────
create table if not exists public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  period_start date not null,
  period_end date not null,
  pay_date date,
  frequency text not null default 'biweekly',
  tax_year int not null default 2026,
  status text not null default 'draft',  -- draft | approved | paid
  employee_count int not null default 0,
  total_gross numeric not null default 0,
  total_deductions numeric not null default 0,
  total_net numeric not null default 0,
  total_employer numeric not null default 0,   -- cotisations employeur (au-delà du brut)
  gl_entry_id uuid,                              -- écriture comptable liée (à la comptabilisation)
  notes text,
  created_by text,
  created_at timestamptz not null default now()
);
alter table public.payroll_runs enable row level security;
revoke all on public.payroll_runs from anon, authenticated;
create index if not exists idx_payroll_runs_tenant on public.payroll_runs (tenant_id, period_start);

-- ── Lignes de paie (un détail par employé dans un run) ───────────────────────
create table if not exists public.payroll_lines (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.payroll_runs(id) on delete cascade,
  tenant_id text not null,
  personnel_id uuid,
  employee_name text,
  gross numeric not null default 0,        -- brut imposable de la période
  allowances numeric not null default 0,   -- avantages non imposables (ajoutés au net)
  reimbursable numeric not null default 0, -- dépenses remboursables (ajoutées au net)
  qpp numeric not null default 0,          -- RRQ (employé)
  ei numeric not null default 0,           -- AE (employé)
  qpip numeric not null default 0,         -- RQAP (employé)
  federal_tax numeric not null default 0,
  quebec_tax numeric not null default 0,
  extra_tax numeric not null default 0,
  total_deductions numeric not null default 0,
  net_pay numeric not null default 0,      -- net de la rémunération
  total_to_pay numeric not null default 0, -- net + avantages + remboursements = dépôt
  er_qpp numeric not null default 0,
  er_ei numeric not null default 0,
  er_qpip numeric not null default 0,
  er_fss numeric not null default 0,
  er_cnesst numeric not null default 0,
  er_wsdrf numeric not null default 0,
  er_total numeric not null default 0,
  detail jsonb,                            -- résultat complet du moteur (annualisé, etc.)
  created_at timestamptz not null default now()
);
alter table public.payroll_lines enable row level security;
revoke all on public.payroll_lines from anon, authenticated;
create index if not exists idx_payroll_lines_run on public.payroll_lines (run_id);
create index if not exists idx_payroll_lines_tenant on public.payroll_lines (tenant_id);

insert into schema_migrations (version) values ('223') on conflict (version) do nothing;
