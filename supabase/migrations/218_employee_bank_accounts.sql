-- 218 — Coordonnées bancaires des employés pour l'EXPORT DÉPÔT DIRECT de la paie (#52 phase 1).
-- DONNÉE TRÈS SENSIBLE (Loi 25) : REVOKE anon — accès UNIQUEMENT par routes serveur service_role
-- (/api/hr/bank en lecture/écriture, /api/payroll/deposit-csv pour générer le fichier). Aucun numéro
-- de compte ne transite par la clé anon. Idempotent + auto-enregistré.

create table if not exists public.employee_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  personnel_id uuid not null,
  account_holder text,            -- nom du titulaire (si différent de l'employé)
  institution_number text,        -- 3 chiffres (banque)
  transit_number text,            -- 5 chiffres (succursale)
  account_number text,            -- 7 à 12 chiffres
  updated_at timestamptz not null default now(),
  unique (tenant_id, personnel_id)
);

alter table public.employee_bank_accounts enable row level security;
-- Aucune policy pour anon/authenticated -> seul le service_role (routes serveur) accède.
revoke all on public.employee_bank_accounts from anon, authenticated;

create index if not exists idx_emp_bank_tenant on public.employee_bank_accounts (tenant_id);

insert into schema_migrations (version) values ('218') on conflict (version) do nothing;
