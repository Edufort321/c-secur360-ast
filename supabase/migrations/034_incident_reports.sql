-- 034_incident_reports.sql
-- Rapports d'accidents / passés proches + décompte de jours sécuritaires

-- ─── Table principale des rapports ────────────────────────────────────────────
create table if not exists public.incident_reports (
  id              uuid        default gen_random_uuid() primary key,
  tenant_id       text        not null,
  report_number   text        not null,
  incident_type   text        not null check (incident_type in ('accident','near_miss','vehicle','property','medical')),
  province        text        not null default 'QC',
  status          text        not null default 'draft' check (status in ('draft','submitted','closed')),
  data            jsonb       not null default '{}'::jsonb,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,
  submitted_at    timestamptz,
  created_by      uuid        references auth.users(id)
);

alter table public.incident_reports enable row level security;

create policy "incident_reports_select" on public.incident_reports
  for select using (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()), ''
    )
  );

create policy "incident_reports_insert" on public.incident_reports
  for insert with check (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()), ''
    )
  );

create policy "incident_reports_update" on public.incident_reports
  for update using (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()), ''
    )
  );

create policy "incident_reports_delete" on public.incident_reports
  for delete using (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()), ''
    )
  );

-- ─── Décompte de jours sécuritaires par tenant ────────────────────────────────
create table if not exists public.incident_day_counters (
  id                    uuid        default gen_random_uuid() primary key,
  tenant_id             text        not null unique,
  last_accident_date    date,
  last_near_miss_date   date,
  accident_record_days  int         not null default 0,
  near_miss_record_days int         not null default 0,
  updated_at            timestamptz default now() not null
);

alter table public.incident_day_counters enable row level security;

create policy "day_counters_select" on public.incident_day_counters
  for select using (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()), ''
    )
  );

create policy "day_counters_insert" on public.incident_day_counters
  for insert with check (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()), ''
    )
  );

create policy "day_counters_update" on public.incident_day_counters
  for update using (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()), ''
    )
  );

-- ─── Index ────────────────────────────────────────────────────────────────────
create index if not exists idx_incident_reports_tenant on public.incident_reports(tenant_id);
create index if not exists idx_incident_reports_type   on public.incident_reports(incident_type);
create index if not exists idx_incident_reports_status on public.incident_reports(status);
create index if not exists idx_day_counters_tenant     on public.incident_day_counters(tenant_id);
