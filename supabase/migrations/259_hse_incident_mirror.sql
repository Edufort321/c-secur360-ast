-- 259 — Fusion Accidents ↔ HSE : `incident_reports` (formulaire riche) devient la SOURCE UNIQUE.
-- Chaque rapport soumis est reflété par un MIROIR auto-généré dans `hse_incident` (lien source_report_id),
-- classé en code réglementaire (lib/hse/incidentClassify) → déclenche le moteur d'échéances + nourrit les KPI.
-- Zéro double saisie. Le miroir n'est JAMAIS saisi à la main (toujours via la route de synchro).
-- Idempotent. À coller dans l'éditeur SQL Supabase du BON projet (nzjjgcccxlqhbtpitmpo), puis Run.

alter table if exists public.hse_incident
  add column if not exists source_report_id uuid;

comment on column public.hse_incident.source_report_id is
  'Lien vers incident_reports.id quand cette ligne est un miroir auto-généré du module Accidents (sinon NULL = saisie HSE native).';

-- Un seul miroir par rapport source (upsert idempotent côté serveur).
create unique index if not exists hse_incident_source_report_uidx
  on public.hse_incident (source_report_id) where source_report_id is not null;

insert into schema_migrations (version) values ('259') on conflict (version) do nothing;
