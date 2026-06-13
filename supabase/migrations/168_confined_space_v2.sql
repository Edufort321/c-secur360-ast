-- 168 — Espace clos (refonte). Registre permanent scannable par QR + permis d'entrée intelligents +
-- relevés atmosphériques horodatés (timer de reprise) + registre d'entrées (timer in/out) + cache de
-- normes rafraîchi par IA. Conserve l'ancienne table confined_space_permits (legacy) intacte.

-- 1) REGISTRE des espaces clos (un par lieu physique ; porte le QR permanent).
create table if not exists public.confined_spaces (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     text not null,
  space_code    text,                              -- code humain/QR (unique par tenant)
  name          text not null,
  location      text,
  site_id       uuid,
  space_type    text,                              -- tank|vessel|sewer|silo|pit|vault|trench|duct|tunnel|manhole|other
  province      text default 'QC',
  description   text,
  characteristics jsonb not null default '{}'::jsonb,  -- dimensions, accès, contenu, ventilation… (IA)
  hazards       jsonb not null default '[]'::jsonb,    -- dangers identifiés (IA)
  emergency     jsonb not null default '{}'::jsonb,    -- plan de sauvetage, contacts, équipement, hôpital
  custom_limits jsonb,                                  -- surcharge des seuils de gaz (sinon norme province)
  retest_minutes int not null default 15,
  risk_level    text,                                  -- faible|moyen|élevé|critique
  photo_url     text,
  qr_active     boolean not null default true,
  status        text not null default 'active',        -- active|archived
  created_by    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index if not exists ux_confined_spaces_code on public.confined_spaces (tenant_id, space_code) where space_code is not null;
create index if not exists idx_confined_spaces_tenant on public.confined_spaces (tenant_id, status);

-- 2) PERMIS d'entrée (lié à un espace ; cycle de vie + approbation superviseur).
create table if not exists public.cs_permits (
  id              uuid primary key default gen_random_uuid(),
  permit_number   text unique,
  tenant_id       text not null,
  space_id        uuid references public.confined_spaces(id) on delete set null,
  project_id      uuid,
  work_description text,
  province        text default 'QC',
  status          text not null default 'draft',       -- draft|pending_approval|approved|active|closed|cancelled
  supervisor_name text, supervisor_user_id text,
  approved_by     text, approved_at timestamptz, approval_signature text,
  attendants      jsonb not null default '[]'::jsonb,  -- surveillants
  entrants_expected int,
  retest_minutes  int not null default 15,
  valid_from      timestamptz, valid_to timestamptz, closed_at timestamptz,
  data            jsonb not null default '{}'::jsonb,  -- checklist matériel, notes, signatures additionnelles
  created_by      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_cs_permits_tenant on public.cs_permits (tenant_id, status);
create index if not exists idx_cs_permits_space on public.cs_permits (space_id);

-- 3) RELEVÉS atmosphériques (chaque mesure ; pilote le timer de reprise + voyant vert/rouge).
create table if not exists public.cs_atm_readings (
  id          uuid primary key default gen_random_uuid(),
  permit_id   uuid references public.cs_permits(id) on delete cascade,
  tenant_id   text not null,
  taken_by    text,
  taken_at    timestamptz not null default now(),
  point       text,                                    -- haut|milieu|bas
  o2 numeric, lel numeric, h2s numeric, co numeric,
  extra       jsonb not null default '{}'::jsonb,      -- autres gaz mesurés
  result      text,                                    -- safe|danger|incomplete
  failures    jsonb not null default '[]'::jsonb,
  next_due_at timestamptz,                             -- prochaine reprise (taken_at + retest_minutes)
  note        text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_cs_readings_permit on public.cs_atm_readings (permit_id, taken_at desc);

-- 4) REGISTRE d'entrées (timer in/out par personne + matériel entré).
create table if not exists public.cs_entries (
  id            uuid primary key default gen_random_uuid(),
  permit_id     uuid references public.cs_permits(id) on delete cascade,
  tenant_id     text not null,
  person_name   text not null,
  person_user_id text,
  role          text not null default 'entrant',       -- entrant|attendant|surveillant
  entered_at    timestamptz,
  exited_at     timestamptz,
  equipment_in  jsonb not null default '[]'::jsonb,     -- check-list matériel entré
  equipment_returned boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists idx_cs_entries_permit on public.cs_entries (permit_id);

-- 5) CACHE de normes rafraîchi par IA (par province) — pour rester à jour automatiquement.
create table if not exists public.cs_norm_cache (
  province     text primary key,
  norm         jsonb not null,                         -- ProvinceNorm rafraîchie
  citations    jsonb not null default '[]'::jsonb,     -- sources/URL citées par l'IA
  refreshed_at timestamptz not null default now(),
  refreshed_by text
);

-- RLS : lecture PUBLIQUE des espaces + relevés + entrées (le QR doit être lisible sans connexion par
-- les secouristes/intervenants) ; écriture côté app comme les autres modules. (Pas de données person.
-- sensibles ; alignement sur confined_space_permits/inventory_state.)
alter table public.confined_spaces  enable row level security;
alter table public.cs_permits       enable row level security;
alter table public.cs_atm_readings  enable row level security;
alter table public.cs_entries       enable row level security;
alter table public.cs_norm_cache    enable row level security;

do $$ begin
  perform 1;
  -- Politiques permissives (création idempotente).
  if not exists (select 1 from pg_policies where tablename='confined_spaces' and policyname='cs_all') then
    create policy "cs_all" on public.confined_spaces for all using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='cs_permits' and policyname='csp_all') then
    create policy "csp_all" on public.cs_permits for all using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='cs_atm_readings' and policyname='csr_all') then
    create policy "csr_all" on public.cs_atm_readings for all using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='cs_entries' and policyname='cse_all') then
    create policy "cse_all" on public.cs_entries for all using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='cs_norm_cache' and policyname='csn_read') then
    create policy "csn_read" on public.cs_norm_cache for select using (true); end if;
end $$;

notify pgrst, 'reload schema';
