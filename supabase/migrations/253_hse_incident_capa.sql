-- 253 — WORKFLOW INCIDENT + CAPA (ISO 45001). L'incident ne s'arrête plus à la déclaration : il suit un
-- cycle de vie (ouvert → enquête → actions correctives → clôturé), avec analyse des causes racines et un
-- registre d'actions correctives/préventives (responsable, échéance, preuve de réalisation).
-- Idempotent + auto-enregistré. Données potentiellement sensibles → accès gated (tier≥4, RH pour le médical).

-- Cycle de vie + analyse des causes sur l'incident.
alter table public.hse_incident add column if not exists status text not null default 'open';        -- open|investigation|capa|closed
alter table public.hse_incident add column if not exists root_cause text;                            -- 5 pourquoi / arbre des causes
alter table public.hse_incident add column if not exists contributing_factors text;
alter table public.hse_incident add column if not exists closed_at timestamptz;
alter table public.hse_incident add column if not exists closed_by text;

-- Registre des actions correctives et préventives (CAPA) — cœur de l'amélioration continue ISO 45001.
create table if not exists public.hse_corrective_action (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    text not null,
  incident_id  uuid not null references public.hse_incident(id) on delete cascade,
  kind         text not null default 'corrective',   -- corrective | preventive
  description  text not null,
  assigned_to  text,                                  -- responsable (nom/courriel)
  due_date     date,
  status       text not null default 'open',          -- open | in_progress | done
  completed_at timestamptz,
  completed_by text,
  evidence     text,                                  -- preuve de réalisation (note / lien)
  created_by   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_hse_capa_incident on public.hse_corrective_action(tenant_id, incident_id);
create index if not exists idx_hse_capa_due on public.hse_corrective_action(due_date) where status <> 'done';

alter table public.hse_corrective_action enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'hse_corrective_action' and policyname = 'hse_capa_all') then
    create policy hse_capa_all on public.hse_corrective_action for all using (true) with check (true);
  end if;
end $$;
drop trigger if exists trg_hse_capa_updated on public.hse_corrective_action;
create trigger trg_hse_capa_updated before update on public.hse_corrective_action for each row execute function hse_set_updated_at();

insert into schema_migrations (version) values ('253') on conflict (version) do nothing;
