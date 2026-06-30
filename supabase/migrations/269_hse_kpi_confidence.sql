-- 269 — Fiabilisation des KPI sécurité HSE : base du taux de gravité corrigée (base 1000),
-- niveau de confiance statistique (heures cumulées 12 mois glissants) et nouvelle vue de taux
-- GLISSANTS sur 12 mois (pour les graphes de tendance, au lieu des taux mensuels bruts volatils).
--
-- Convention HSE (cf. 248/258) : vues agrégées créées SANS security_invoker (droits du propriétaire) —
-- les KPI agrégés ne sont pas des données de santé individuelles, ils restent lisibles. On ne touche
-- pas aux grants. Tout reste CALCULÉ À LA VOLÉE (aucun taux figé).
--
-- Note Postgres : un cadre de fenêtre `RANGE ... interval '11 months'` sur une colonne `date` n'est pas
-- supporté ; on ordonne sur un INDEX DE MOIS entier (année*12 + mois) avec `RANGE BETWEEN 11 PRECEDING`,
-- ce qui capture les 12 mois glissants (mois courant + 11 précédents) en tolérant les mois manquants.
--
-- Idempotent (create or replace view). À coller dans l'éditeur SQL du BON projet (nzjjgcccxlqhbtpitmpo).

-- ───────────────────────── 1) Vue mensuelle enrichie (colonnes existantes conservées + ajouts) ─────────────────────────
create or replace view public.hse_v_safety_kpi as
with hours as (
  select tenant_id, date_trunc('month', period_start)::date as month, sum(hours) as hours
  from public.hse_hours_worked group by tenant_id, date_trunc('month', period_start)
),
hours_roll as (
  select tenant_id, month, hours,
    sum(hours) over (
      partition by tenant_id
      order by (extract(year from month) * 12 + extract(month from month))::int
      range between 11 preceding and current row
    ) as rolling_12m_hours
  from hours
),
inc as (
  select tenant_id, date_trunc('month', occurred_at)::date as month,
         count(*) filter (where is_lost_time) as lti_count,
         count(*) filter (where event_code in ('FATALITY','SPECIFIED_INJURY','OVER_7_DAY','RECORDABLE')) as recordable_count,
         count(*) filter (where event_code = 'NEAR_MISS') as near_miss_count,
         sum(lost_days) as lost_days
  from public.hse_incident group by tenant_id, date_trunc('month', occurred_at)
)
select h.tenant_id, h.month, h.hours,
  coalesce(i.lti_count,0) as lti_count, coalesce(i.recordable_count,0) as recordable_count,
  coalesce(i.near_miss_count,0) as near_miss_count, coalesce(i.lost_days,0) as lost_days,
  s.rate_base_hours,
  case when h.hours > 0 then round(coalesce(i.lti_count,0) * s.rate_base_hours / h.hours, 2) else 0 end as ltifr,
  case when h.hours > 0 then round(coalesce(i.recordable_count,0) * s.rate_base_hours / h.hours, 2) else 0 end as trir,
  -- CORRECTIF : taux de gravité = base 1000 (jours perdus × 1000 / heures), JAMAIS rate_base_hours
  -- (sinon identique au LTIFR). rate_base_hours reste réservé au LTIFR et au TRIR.
  case when h.hours > 0 then round(coalesce(i.lost_days,0) * 1000 / h.hours, 2) else 0 end as severity_rate,
  -- AJOUT : heures cumulées sur 12 mois glissants + niveau de confiance statistique associé.
  h.rolling_12m_hours,
  case
    when coalesce(h.rolling_12m_hours,0) < 10000  then 'insufficient'
    when h.rolling_12m_hours          < 100000 then 'indicative'
    when h.rolling_12m_hours          < 500000 then 'stabilizing'
    else 'reliable'
  end as confidence_level
from hours_roll h
join public.hse_tenant_settings s on s.tenant_id = h.tenant_id
left join inc i on i.tenant_id = h.tenant_id and i.month = h.month;

-- ───────────────────────── 2) Vue des TAUX GLISSANTS 12 mois (à utiliser pour les graphes de tendance) ─────────────────────────
create or replace view public.hse_v_safety_kpi_rolling12 as
with monthly as (
  select coalesce(hh.tenant_id, ii.tenant_id) as tenant_id,
         coalesce(hh.month, ii.month) as month,
         coalesce(hh.hours, 0) as hours,
         coalesce(ii.lti_count, 0) as lti_count,
         coalesce(ii.recordable_count, 0) as recordable_count,
         coalesce(ii.lost_days, 0) as lost_days
  from (
    select tenant_id, date_trunc('month', period_start)::date as month, sum(hours) as hours
    from public.hse_hours_worked group by tenant_id, date_trunc('month', period_start)
  ) hh
  full outer join (
    select tenant_id, date_trunc('month', occurred_at)::date as month,
           count(*) filter (where is_lost_time) as lti_count,
           count(*) filter (where event_code in ('FATALITY','SPECIFIED_INJURY','OVER_7_DAY','RECORDABLE')) as recordable_count,
           sum(lost_days) as lost_days
    from public.hse_incident group by tenant_id, date_trunc('month', occurred_at)
  ) ii on hh.tenant_id = ii.tenant_id and hh.month = ii.month
),
roll as (
  select tenant_id, month,
    sum(hours)            over w as r_hours,
    sum(lti_count)        over w as r_lti,
    sum(recordable_count) over w as r_rec,
    sum(lost_days)        over w as r_lost
  from monthly
  window w as (
    partition by tenant_id
    order by (extract(year from month) * 12 + extract(month from month))::int
    range between 11 preceding and current row
  )
)
select r.tenant_id, r.month,
  r.r_hours as rolling_12m_hours,
  case when r.r_hours > 0 then round(r.r_lti  * s.rate_base_hours / r.r_hours, 2) else 0 end as rolling_ltifr,
  case when r.r_hours > 0 then round(r.r_rec  * s.rate_base_hours / r.r_hours, 2) else 0 end as rolling_trir,
  case when r.r_hours > 0 then round(r.r_lost * 1000 / r.r_hours, 2)            else 0 end as rolling_severity,
  case
    when coalesce(r.r_hours,0) < 10000  then 'insufficient'
    when r.r_hours            < 100000 then 'indicative'
    when r.r_hours            < 500000 then 'stabilizing'
    else 'reliable'
  end as confidence_level
from roll r
join public.hse_tenant_settings s on s.tenant_id = r.tenant_id;

-- ───────────────────────── 3) Test : 459 h cumulées => 'insufficient' (logique de seuil, sans données) ─────────────────────────
do $$
declare v text; h numeric := 459;
begin
  v := case
         when coalesce(h,0) < 10000  then 'insufficient'
         when h            < 100000 then 'indicative'
         when h            < 500000 then 'stabilizing'
         else 'reliable'
       end;
  if v <> 'insufficient' then
    raise exception 'TEST 269 ÉCHOUÉ : 459 h attendu insufficient, obtenu %', v;
  end if;
  raise notice 'TEST 269 OK : 459 h cumulées -> confidence_level = %', v;
end $$;

insert into schema_migrations (version) values ('269') on conflict (version) do nothing;
