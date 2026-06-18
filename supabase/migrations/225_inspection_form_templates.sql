-- 225 — Constructeur de FORMULAIRES D'INSPECTION customisables (module Maintenance/Inspection, phase 1).
-- Gabarits réutilisables à la façon des rapports chantier : sections + items TYPÉS (conforme/non-conforme,
-- texte, nombre, liste, date, photo, case), flags critique/retrait. Servent à inspecter machines/équipements
-- et (phase 3) à alimenter le scan QR public. RLS permissive (isolation applicative par tenant, comme les
-- autres tables opérationnelles) — la lecture anon est permise pour le futur scan public. Idempotent + auto-enregistré.

create table if not exists public.inspection_form_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  name text not null,
  category text,                                 -- famille / type d'équipement (libre)
  description text,
  sections jsonb not null default '[]'::jsonb,   -- [{id,title,items:[{id,label,type,options[],critical,withdrawal,required,help}]}]
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inspection_form_templates enable row level security;
drop policy if exists insp_form_templates_all on public.inspection_form_templates;
create policy insp_form_templates_all on public.inspection_form_templates for all using (true) with check (true);

create index if not exists idx_insp_form_tpl_tenant on public.inspection_form_templates (tenant_id);

insert into schema_migrations (version) values ('225') on conflict (version) do nothing;
