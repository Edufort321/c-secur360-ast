-- 261 — HSE : causeries sécurité (toolbox / TBM) + observations comportementales (BBS).
-- Indicateurs LEADING numériques (jusqu'ici saisis à la main sans source). Une table simple, RLS permissive
-- (donnée opérationnelle, non sensible). Nourrit les métriques proactives TBM / ASA par mois.
-- Idempotent. À coller dans l'éditeur SQL Supabase du BON projet (nzjjgcccxlqhbtpitmpo), puis Run.

create table if not exists public.hse_safety_meeting (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     text not null,
  kind          text not null default 'tbm',     -- 'tbm' (causerie) | 'observation' (BBS)
  meeting_date  date not null default current_date,
  location      text,
  topic         text,
  attendees     text,                             -- participants (texte libre ou nb)
  notes         text,
  created_by    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists hse_safety_meeting_tenant_idx on public.hse_safety_meeting (tenant_id, meeting_date desc);

alter table public.hse_safety_meeting enable row level security;
drop policy if exists hse_safety_meeting_all on public.hse_safety_meeting;
create policy hse_safety_meeting_all on public.hse_safety_meeting for all using (true) with check (true);

insert into schema_migrations (version) values ('261') on conflict (version) do nothing;
