-- 252 — PIÈCES JOINTES HSE (registres + incidents). Demande Eric : pouvoir joindre tout document à
-- l'intérieur des registres/incidents, SANS DOUBLON — une pièce peut être TÉLÉVERSÉE ou simplement
-- LIÉE à un document déjà existant dans un autre module (projet, inspection…).
--
-- ⚠️ Loi 25 : documents potentiellement SENSIBLES (attestation médicale, surveillance santé). Le bucket
-- 'hse-documents' est PRIVÉ (public=false) et n'a PAS de policy anon → l'accès passe par des routes
-- service_role (URLs signées) ; les pièces marquées `sensitive` ne sont visibles qu'aux profils RH/admin.
-- Idempotent + auto-enregistré.

create table if not exists public.hse_attachment (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     text not null,
  entity_type   text not null,                 -- 'incident' | 'register_entry'
  entity_id     uuid not null,
  file_name     text not null,
  storage_path  text,                          -- chemin dans le bucket privé (si TÉLÉVERSÉ)
  file_url       text,                         -- URL d'un doc DÉJÀ existant (si LIÉ — anti-doublon)
  source_module text not null default 'upload',-- 'upload' | 'project' | 'inspection' | 'maintenance' | 'rh' | 'autre'
  source_ref_id text,                          -- id de l'enregistrement source (anti-doublon / traçabilité)
  mime_type     text,
  file_size     bigint,
  sensitive     boolean not null default false,-- document santé → accès restreint (RH/admin)
  uploaded_by   text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_hse_attach_entity on public.hse_attachment(tenant_id, entity_type, entity_id);
create index if not exists idx_hse_attach_tenant on public.hse_attachment(tenant_id);
-- Anti-doublon : un même document lié n'est rattaché qu'une fois à une même entité.
create unique index if not exists uq_hse_attach_link on public.hse_attachment(tenant_id, entity_type, entity_id, source_module, source_ref_id)
  where source_ref_id is not null;

alter table public.hse_attachment enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'hse_attachment' and policyname = 'hse_attachment_all') then
    create policy hse_attachment_all on public.hse_attachment for all using (true) with check (true);
  end if;
end $$;

-- Bucket PRIVÉ (santé). 25 Mo. PAS de policy anon → service_role uniquement (URLs signées).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hse-documents', 'hse-documents', false, 26214400,
        array['application/pdf','image/jpeg','image/png','image/webp','image/heic','image/heif',
              'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do nothing;

insert into schema_migrations (version) values ('252') on conflict (version) do nothing;
