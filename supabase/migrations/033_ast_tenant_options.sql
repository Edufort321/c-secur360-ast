-- 033_ast_tenant_options.sql
-- Options AST personnalisées par tenant (EPI, contrôles, dangers) + gabarits LOTO nommés

-- ─── Options AST personnalisées ────────────────────────────────────────────
create table if not exists public.tenant_ast_options (
  id          uuid        default gen_random_uuid() primary key,
  tenant_id   text        not null,
  category    text        not null check (category in ('ppe', 'control', 'hazard')),
  label       text        not null,
  permanent   boolean     not null default true,
  created_at  timestamptz default now() not null,
  created_by  uuid        references auth.users(id)
);

alter table public.tenant_ast_options enable row level security;

-- Lecture : tenant courant seulement
drop policy if exists "tenant_ast_options_select" on public.tenant_ast_options;
create policy "tenant_ast_options_select" on public.tenant_ast_options
  for select using (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()),
      ''
    )
  );

-- Insertion
drop policy if exists "tenant_ast_options_insert" on public.tenant_ast_options;
create policy "tenant_ast_options_insert" on public.tenant_ast_options
  for insert with check (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()),
      ''
    )
  );

-- Suppression
drop policy if exists "tenant_ast_options_delete" on public.tenant_ast_options;
create policy "tenant_ast_options_delete" on public.tenant_ast_options
  for delete using (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()),
      ''
    )
  );

-- ─── Gabarits LOTO nommés ─────────────────────────────────────────────────
create table if not exists public.tenant_loto_templates (
  id              uuid        default gen_random_uuid() primary key,
  tenant_id       text        not null,
  name            text        not null,
  description     text        not null default '',
  energy_sources  jsonb       not null default '[]'::jsonb,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,
  created_by      uuid        references auth.users(id)
);

alter table public.tenant_loto_templates enable row level security;

drop policy if exists "loto_templates_select" on public.tenant_loto_templates;
create policy "loto_templates_select" on public.tenant_loto_templates
  for select using (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()),
      ''
    )
  );

drop policy if exists "loto_templates_insert" on public.tenant_loto_templates;
create policy "loto_templates_insert" on public.tenant_loto_templates
  for insert with check (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()),
      ''
    )
  );

drop policy if exists "loto_templates_update" on public.tenant_loto_templates;
create policy "loto_templates_update" on public.tenant_loto_templates
  for update using (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()),
      ''
    )
  );

drop policy if exists "loto_templates_delete" on public.tenant_loto_templates;
create policy "loto_templates_delete" on public.tenant_loto_templates
  for delete using (
    tenant_id = coalesce(
      (select raw_user_meta_data->>'tenant_id' from auth.users where id = auth.uid()),
      ''
    )
  );

-- Index
create index if not exists idx_tenant_ast_options_tenant  on public.tenant_ast_options(tenant_id);
create index if not exists idx_loto_templates_tenant       on public.tenant_loto_templates(tenant_id);
