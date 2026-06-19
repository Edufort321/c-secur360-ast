-- 248 — MODULE HSE (Santé & sécurité) : registres réglementaires + échéances + KPI.
-- ADAPTÉ à l'architecture C-Secur360 (vs le guide fourni) :
--   • tenant_id = TEXT (slug), pas d'UUID/FK tenants ; isolation APPLICATIVE (.eq tenant_id côté app).
--   • PAS de profiles/auth.uid() (auth custom) → RLS PERMISSIVE USING(true) (standard opérationnel du projet) ;
--     les fonctions hse_current_tenant_id()/role() du guide sont retirées (non applicables ici).
--   • created_by = TEXT (courriel). Le trigger d'échéances reste (lit le tenant_id de la ligne, pas l'auth).
--   • Vues KPI sans security_invoker (RLS permissive). ⚠️ Données « santé » : passer par routes service_role
--     pour l'écriture sensible (Loi 25) — l'app filtre toujours par tenant_id.
-- Idempotent + auto-enregistré. Données juridiques du SEED (249) = À VALIDER par un conseiller SST.

create extension if not exists "pgcrypto";

create or replace function hse_set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ── 1. RÉFÉRENTIEL RÉGLEMENTAIRE (global, versionné) ────────────────────────────────────────────────
create table if not exists public.hse_regulatory_framework (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, name_fr text not null, name_en text not null,
  jurisdiction text not null, is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.hse_deadline_rule (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.hse_regulatory_framework(id) on delete cascade,
  event_code text not null, label_fr text not null, label_en text not null,
  notify_within_hours integer, report_within_hours integer,
  clock_starts text not null default 'incident',     -- incident | awareness | threshold_crossed
  threshold_amount numeric(14,2), threshold_currency text default 'CAD',
  legal_reference text, effective_from date not null default '2000-01-01', effective_to date,
  created_at timestamptz not null default now(),
  unique (framework_id, event_code, effective_from)
);
create index if not exists idx_hse_deadline_rule_fw on public.hse_deadline_rule(framework_id);
create index if not exists idx_hse_deadline_rule_evt on public.hse_deadline_rule(event_code);

-- ── 2. CONFIG TENANT ────────────────────────────────────────────────────────────────────────────────
create table if not exists public.hse_tenant_settings (
  tenant_id text primary key,
  framework_id uuid references public.hse_regulatory_framework(id),
  rate_base_hours integer not null default 200000,   -- 200 000 (Amérique du N.) / 100 000 (UK)
  default_locale text not null default 'fr',
  brand_logo_url text, brand_currency text not null default 'CAD',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ── 3. MOTEUR DE REGISTRES GÉNÉRIQUE ─────────────────────────────────────────────────────────────────
create table if not exists public.hse_register_type (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, name_fr text not null, name_en text not null,
  framework_id uuid references public.hse_regulatory_framework(id),
  default_review_months integer, field_schema jsonb not null default '[]'::jsonb, icon text,
  created_at timestamptz not null default now()
);

create table if not exists public.hse_tenant_register (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null, register_type_id uuid not null references public.hse_register_type(id),
  is_enabled boolean not null default true, review_months_override integer,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (tenant_id, register_type_id)
);
create index if not exists idx_hse_treg_tenant on public.hse_tenant_register(tenant_id);

create table if not exists public.hse_register_entry (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  tenant_register_id uuid not null references public.hse_tenant_register(id) on delete cascade,
  reference text, title text not null, data jsonb not null default '{}'::jsonb,
  status text not null default 'active',             -- active | archived | expired
  last_review_at date, review_due_at date, created_by text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_hse_entry_tenant on public.hse_register_entry(tenant_id);
create index if not exists idx_hse_entry_reg on public.hse_register_entry(tenant_register_id);
create index if not exists idx_hse_entry_due on public.hse_register_entry(review_due_at) where status = 'active';

-- ── 4. INCIDENTS + ÉCHÉANCES ─────────────────────────────────────────────────────────────────────────
create table if not exists public.hse_incident (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null, project_id uuid,
  occurred_at timestamptz not null, reported_at timestamptz not null default now(),
  event_code text not null, severity text,
  is_lost_time boolean not null default false, lost_days integer not null default 0,
  body_part text, injury_type text, location_text text, description text,
  material_damage_amount numeric(14,2),
  is_reportable boolean, reported_to_authority boolean not null default false, authority_reference text,
  created_by text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_hse_incident_tenant on public.hse_incident(tenant_id);
create index if not exists idx_hse_incident_occurred on public.hse_incident(occurred_at);
create index if not exists idx_hse_incident_event on public.hse_incident(event_code);

create table if not exists public.hse_compliance_deadline (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  incident_id uuid not null references public.hse_incident(id) on delete cascade,
  rule_id uuid references public.hse_deadline_rule(id),
  kind text not null,                                -- notify | report
  due_at timestamptz not null, label_fr text, label_en text,
  status text not null default 'pending',            -- pending | done | overdue
  completed_at timestamptz, completed_by text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_hse_deadline_tenant on public.hse_compliance_deadline(tenant_id);
create index if not exists idx_hse_deadline_due on public.hse_compliance_deadline(due_at) where status = 'pending';

-- ── 5. HEURES TRAVAILLÉES (dénominateur KPI) ─────────────────────────────────────────────────────────
-- ⚠️ Si on branche les feuilles de temps plus tard : remplacer par une VUE d'agrégation (timesheets).
create table if not exists public.hse_hours_worked (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null, project_id uuid,
  period_start date not null, period_end date not null,
  hours numeric(12,2) not null default 0, headcount integer,
  created_at timestamptz not null default now(),
  unique (tenant_id, project_id, period_start)
);
create index if not exists idx_hse_hours_tenant on public.hse_hours_worked(tenant_id);
create index if not exists idx_hse_hours_period on public.hse_hours_worked(period_start);

-- ── 6. INDICATEURS PROACTIFS (leading) ───────────────────────────────────────────────────────────────
create table if not exists public.hse_proactive_metric (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null, project_id uuid, period_start date not null,
  metric_code text not null,                         -- TBM | JSA | HSE_VISIT | ENV_CONTROL | AAA | ASA
  count_value integer not null default 0,
  created_at timestamptz not null default now(),
  unique (tenant_id, project_id, period_start, metric_code)
);
create index if not exists idx_hse_proactive_tenant on public.hse_proactive_metric(tenant_id);

-- ── 7. RLS PERMISSIVE (isolation applicative, standard du projet) ────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['hse_regulatory_framework','hse_deadline_rule','hse_tenant_settings','hse_register_type',
                           'hse_tenant_register','hse_register_entry','hse_incident','hse_compliance_deadline',
                           'hse_hours_worked','hse_proactive_metric']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t||'_access', t);
    execute format('create policy %I on public.%I for all using (true) with check (true)', t||'_access', t);
  end loop;
end $$;

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['hse_tenant_settings','hse_tenant_register','hse_register_entry','hse_incident','hse_compliance_deadline']
  loop
    execute format('drop trigger if exists %I on public.%I', 'trg_'||t||'_updated', t);
    execute format('create trigger %I before update on public.%I for each row execute function hse_set_updated_at()', 'trg_'||t||'_updated', t);
  end loop;
end $$;

-- ── 8. MOTEUR D'ÉCHÉANCES : génération auto à l'insertion d'un incident ──────────────────────────────
create or replace function hse_generate_deadlines() returns trigger language plpgsql security definer set search_path = public as $$
declare v_framework uuid; r record; v_base timestamptz;
begin
  select framework_id into v_framework from public.hse_tenant_settings where tenant_id = new.tenant_id;
  if v_framework is null then return new; end if;
  for r in
    select * from public.hse_deadline_rule
    where framework_id = v_framework and event_code = new.event_code
      and effective_from <= new.occurred_at::date and (effective_to is null or effective_to >= new.occurred_at::date)
      and (threshold_amount is null or coalesce(new.material_damage_amount,0) >= threshold_amount)
  loop
    v_base := case r.clock_starts when 'awareness' then new.reported_at else new.occurred_at end;
    if r.notify_within_hours is not null then
      insert into public.hse_compliance_deadline (tenant_id, incident_id, rule_id, kind, due_at, label_fr, label_en)
      values (new.tenant_id, new.id, r.id, 'notify', v_base + (r.notify_within_hours || ' hours')::interval,
              'Notification : ' || r.label_fr, 'Notification: ' || r.label_en);
    end if;
    if r.report_within_hours is not null then
      insert into public.hse_compliance_deadline (tenant_id, incident_id, rule_id, kind, due_at, label_fr, label_en)
      values (new.tenant_id, new.id, r.id, 'report', v_base + (r.report_within_hours || ' hours')::interval,
              'Rapport écrit : ' || r.label_fr, 'Written report: ' || r.label_en);
    end if;
  end loop;
  return new;
end; $$;
drop trigger if exists trg_hse_incident_deadlines on public.hse_incident;
create trigger trg_hse_incident_deadlines after insert on public.hse_incident for each row execute function hse_generate_deadlines();

create or replace function hse_mark_overdue_deadlines() returns integer language sql security definer set search_path = public as $$
  with upd as (update public.hse_compliance_deadline set status = 'overdue', updated_at = now()
               where status = 'pending' and due_at < now() returning 1)
  select count(*)::int from upd;
$$;

-- ── 9. VUES KPI (calcul à la volée ; l'app filtre par tenant_id) ─────────────────────────────────────
create or replace view public.hse_v_safety_kpi as
with hours as (
  select tenant_id, date_trunc('month', period_start)::date as month, sum(hours) as hours
  from public.hse_hours_worked group by tenant_id, date_trunc('month', period_start)
),
inc as (
  select tenant_id, date_trunc('month', occurred_at)::date as month,
         count(*) filter (where is_lost_time) as lti_count,
         count(*) filter (where event_code in ('FATALITY','SPECIFIED_INJURY','OVER_7_DAY','RECORDABLE')) as recordable_count,
         count(*) filter (where event_code = 'NEAR_MISS') as near_miss_count,
         sum(lost_days) as lost_days
  from public.hse_incident group by tenant_id, date_trunc('month', occurred_at)
)
select h.tenant_id, h.month, h.hours,
  coalesce(i.lti_count,0) as lti_count, coalesce(i.recordable_count,0) as recordable_count,
  coalesce(i.near_miss_count,0) as near_miss_count, coalesce(i.lost_days,0) as lost_days,
  s.rate_base_hours,
  case when h.hours > 0 then round(coalesce(i.lti_count,0) * s.rate_base_hours / h.hours, 2) else 0 end as ltifr,
  case when h.hours > 0 then round(coalesce(i.recordable_count,0) * s.rate_base_hours / h.hours, 2) else 0 end as trir,
  case when h.hours > 0 then round(coalesce(i.lost_days,0) * s.rate_base_hours / h.hours, 2) else 0 end as severity_rate
from hours h
join public.hse_tenant_settings s on s.tenant_id = h.tenant_id
left join inc i on i.tenant_id = h.tenant_id and i.month = h.month;

create or replace view public.hse_v_open_deadlines as
select d.*, i.event_code, i.occurred_at, (d.due_at - now()) as time_remaining
from public.hse_compliance_deadline d
join public.hse_incident i on i.id = d.incident_id
where d.status in ('pending','overdue');

create or replace view public.hse_v_register_due as
select e.*, tr.register_type_id, rt.code as register_code, rt.name_fr, rt.name_en,
       (e.review_due_at - current_date) as days_until_due
from public.hse_register_entry e
join public.hse_tenant_register tr on tr.id = e.tenant_register_id
join public.hse_register_type rt on rt.id = tr.register_type_id
where e.status = 'active' and e.review_due_at is not null and e.review_due_at <= current_date + interval '30 days';

insert into schema_migrations (version) values ('248') on conflict (version) do nothing;
