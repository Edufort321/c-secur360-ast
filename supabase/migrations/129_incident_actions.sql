-- 129_incident_actions.sql
-- #80 CAPA : actions correctives/preventives liees aux incidents (incident_reports, migration 034).
-- Numero 129 : 125-128 etant pris par d'autres agents (non mergees), on prend le 1er libre > max.

create table if not exists public.incident_actions (
  id            uuid        default gen_random_uuid() primary key,
  tenant_id     text        not null,
  incident_id   uuid        references public.incident_reports(id) on delete cascade,
  description   text        not null default '',
  assignee      text,                                   -- nom du responsable (personnel)
  assignee_email text,
  due_date      date,
  status        text        not null default 'a_faire'
                            check (status in ('a_faire','en_cours','fait','verifie')),
  priority      text        not null default 'normale'
                            check (priority in ('basse','normale','haute','critique')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.incident_actions enable row level security;

-- RLS permissive (convention projet ; l'isolation tenant se fait par .eq('tenant_id') cote requete).
drop policy if exists incident_actions_all on public.incident_actions;
create policy incident_actions_all on public.incident_actions
  for all using (true) with check (true);

create index if not exists idx_incident_actions_tenant   on public.incident_actions(tenant_id, status);
create index if not exists idx_incident_actions_incident on public.incident_actions(incident_id);
create index if not exists idx_incident_actions_due      on public.incident_actions(due_date);

-- Temps reel (pour useRealtime sur la liste CAPA)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'incident_actions'
    ) then
      execute 'alter publication supabase_realtime add table public.incident_actions';
    end if;
  end if;
end $$;
