-- 226 — FEUILLES D'INSPECTION remplies (module Maintenance/Inspection, phase 1b).
-- Une feuille = un gabarit (inspection_form_templates) « poussé » et rempli pour un équipement :
-- réponses par item (conforme/non-conforme/S.O., case, texte…), anomalie + détail + photos, résultat
-- global calculé (conforme/conditionnel/non_conforme/retrait). template_snapshot = copie du gabarit au
-- moment de l'inspection (traçabilité même si le gabarit change après). RLS permissive (lecture anon =
-- futur scan QR public). Idempotent + auto-enregistré.

create table if not exists public.inspection_submissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  template_id uuid,
  template_name text,
  template_snapshot jsonb,          -- sections+items figés au moment de l'inspection
  equipment_id uuid,
  equipment_name text,
  client_id uuid,                   -- arborescence client (phase 2)
  title text,
  inspector_name text,
  status text not null default 'submitted',   -- draft | submitted
  answers jsonb not null default '{}'::jsonb,  -- { itemId: { value, anomaly, detail, photos[] } }
  overall_result text,              -- conforme | conditionnel | non_conforme | retrait
  anomalies_count int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  submitted_at timestamptz
);

alter table public.inspection_submissions enable row level security;
drop policy if exists insp_submissions_all on public.inspection_submissions;
create policy insp_submissions_all on public.inspection_submissions for all using (true) with check (true);

create index if not exists idx_insp_sub_tenant on public.inspection_submissions (tenant_id, created_at desc);
create index if not exists idx_insp_sub_equip on public.inspection_submissions (equipment_id);

insert into schema_migrations (version) values ('226') on conflict (version) do nothing;
