-- 242 — Correctifs audit financier P1 :
--  (P1-2) Amortissement comptabilisé : journal des dotations par bien et par exercice (DR 5600 / CR 1590).
--         L'amortissement CUMULÉ = somme des dotations d'un bien ; la valeur nette = coût − cumul.
--  (P1-3) Remises TPS/TVQ : journal des remises par période (DR 2100/2110 / CR banque) + suivi du statut.
-- (P1-1 = isoler les charges employeur dans 5100 au moment du run de paie : pas de table, code seulement.)
-- Le compte d'amortissement cumulé 1590 est créé à la volée par le code (par tenant). Idempotent + auto-enregistré.

create table if not exists public.asset_depreciation (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    text not null,
  asset_id     uuid not null references public.company_assets(id) on delete cascade,
  fiscal_year  int  not null,
  amount       numeric(16,2) not null default 0,   -- dotation de l'exercice
  gl_entry_id  uuid,                                -- écriture DR 5600 / CR 1590
  created_at   timestamptz not null default now(),
  unique (tenant_id, asset_id, fiscal_year)         -- idempotence : une dotation par bien et par exercice
);
create index if not exists idx_asset_dep_tenant on public.asset_depreciation(tenant_id, asset_id);
alter table public.asset_depreciation enable row level security;
drop policy if exists asset_dep_access on public.asset_depreciation;
create policy asset_dep_access on public.asset_depreciation for all using (true) with check (true);

create table if not exists public.tax_remittances (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    text not null,
  period_start date not null,
  period_end   date not null,
  frequency    text not null default 'trimestriel',  -- mensuel | trimestriel | annuel
  gst_net      numeric(16,2) not null default 0,      -- TPS/TVH nette remise (perçue − CTI)
  qst_net      numeric(16,2) not null default 0,      -- TVQ nette remise (perçue − RTI)
  total        numeric(16,2) not null default 0,
  pay_date     date,
  status       text not null default 'posted',        -- posted | paid
  gl_entry_id  uuid,                                   -- écriture DR 2100/2110 / CR banque
  created_at   timestamptz not null default now(),
  unique (tenant_id, period_start, period_end)         -- idempotence : une remise par période
);
create index if not exists idx_tax_remit_tenant on public.tax_remittances(tenant_id, period_end);
alter table public.tax_remittances enable row level security;
drop policy if exists tax_remit_access on public.tax_remittances;
create policy tax_remit_access on public.tax_remittances for all using (true) with check (true);

insert into schema_migrations (version) values ('242') on conflict (version) do nothing;
