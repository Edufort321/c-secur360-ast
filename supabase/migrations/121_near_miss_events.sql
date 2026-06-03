-- 121_near_miss_events.sql
-- Vue near_miss_events : expose les incident_reports a plat pour les vues du tableau de bord
-- (components/dashboard/AnomaliesPanel.tsx et app/[tenant]/dashboard/ManagerDashboard.tsx).
--
-- Contexte : le module passe-proche / incident existe deja et ecrit dans public.incident_reports
-- (migration 034) via un jsonb `data`. Le dashboard interroge une table plate `near_miss_events`
-- (colonnes severity_level, incident_date, reporter_name, type, status, tenant_id) qui n'existait pas.
-- Plutot que de dupliquer le module, on expose incident_reports sous ces colonnes via une VUE.
-- Source unique de verite : tout signalement saisi dans le module alimente automatiquement le dashboard.
--
-- security_invoker = on : la vue applique la RLS de incident_reports (PG15+). Le comportement
-- d'acces est donc IDENTIQUE a une lecture directe de incident_reports (isolation par tenant heritee).

drop view if exists public.near_miss_events;

create view public.near_miss_events
  with (security_invoker = on)
as
select
  ir.id,
  ir.tenant_id,
  -- declarant : stocke dans data.reportedBy par le formulaire IncidentReport
  nullif(ir.data->>'reportedBy', '')                                    as reporter_name,
  -- date de l'evenement : data.incidentDate (garde-fou contre les valeurs non datees)
  case
    when ir.data->>'incidentDate' ~ '^\d{4}-\d{2}-\d{2}'
      then (ir.data->>'incidentDate')::date
    else null
  end                                                                   as incident_date,
  -- severite (1=mineur .. 5=grave ; 1-3 = passe-proche, 4-5 = incident) :
  -- valeur explicite saisie dans le formulaire (data.severityLevel) sinon derivee du type.
  coalesce(
    case when ir.data->>'severityLevel' ~ '^[1-5]$'
      then (ir.data->>'severityLevel')::int end,
    case ir.incident_type
      when 'accident' then 5
      when 'medical'  then 5
      when 'vehicle'  then 4
      when 'property' then 4
      when 'near_miss' then 2
      else 3
    end
  )                                                                     as severity_level,
  ir.incident_type                                                      as type,
  ir.status,
  nullif(ir.data->>'description', '')                                   as description,
  ir.created_at
from public.incident_reports ir;

comment on view public.near_miss_events is
  'Vue a plat de incident_reports pour le tableau de bord (severity_level derive du type). Lecture seule. Migration 121.';
