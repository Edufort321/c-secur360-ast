-- =====================================================================================
-- 271 — RLS : isolation tenant sur TOUTE la longue traîne (suite de la 270).
--
-- CONTEXTE : après la 270 (finance), un audit de la base PROD a montré que ~99 tables
-- restaient en policy permissive `USING(true)` vers {public} AVEC grant anon ET authenticated
-- -> lisibles/écrivables cross-tenant par quiconque a la clé anon publique. En plus, 8 tables
-- avaient carrément le RLS DÉSACTIVÉ (tenants, RBAC legacy, inventaire legacy) -> grand ouvert.
-- Cette migration ferme l'ensemble, en respectant la nature de chaque table (classification).
--
-- Le rôle du JWT tenant est `authenticated` (voir lib/supabaseToken.ts + migration 270). Les
-- routes serveur (service_role) bypassent le RLS et ne sont pas affectées.
--
-- ⚠️ PRÉREQUIS : le code JWT (270) est déjà déployé, donc le navigateur envoie déjà un JWT
-- `authenticated` porteur de tenant_id. Cette migration peut donc être appliquée directement.
--
-- Groupes :
--   A TENANT           -> policy FOR ALL : tenant_id = jwt.tenant_id OR app_role=super_admin
--   B PUBLIC_CONTENT   -> SELECT public conservé ; écritures réservées au super_admin
--   C QR_PUBLIC_READ   -> SELECT public conservé (accès secours QR) ; écritures tenant-scopées
--   D GLOBAL_ADMIN     -> super_admin only (données de l'opérateur SaaS)
--   E DEMO_SIGNUPS     -> INSERT public (formulaire) ; lecture/màj réservées au super_admin
--   F LEGACY_LOCK      -> RLS on + revoke anon/authenticated + aucune policy (deny-all/service_role)
--   G TENANTS          -> sa propre ligne (subdomain/id = jwt.tenant_id) OR super_admin
--   H HSE_AUDIT_LOG    -> SELECT tenant-scopé ; conserve le write-lock existant (trigger-only)
--
-- Idempotente (rejouable). S'auto-enregistre dans schema_migrations à la fin.
-- =====================================================================================

-- ────────────────────────────────────────────────────────────────────────────────────
-- GROUPE A — TENANT : prédicat tenant_id + bypass super_admin (même pattern que 270).
-- ────────────────────────────────────────────────────────────────────────────────────
do $$
declare
  t   text;
  pol record;
  cibles text[] := array[
    'ast_forms','inv_categories','planner_leaves','sites','projects','labor_rates','rate_settings',
    'project_materials','tenant_integrations','integration_sync_log','tenant_modules','departments',
    'categories','items','item_locations','movements','planner_jobs','planner_personnel',
    'planner_equipements','planner_postes','planner_succursales','planner_departements','planner_conges',
    'planner_assignments','approval_levels','surcharge_fuel_tiers','confined_space_permits','timesheets',
    'timesheet_entries','ast_permits','tenant_ast_options','equipment_inspections','equipment',
    'employee_profiles','timesheet_allowances','timesheet_hour_bonuses','poste_salary_grids',
    'poste_skills_catalog','poste_subclasses_catalog','employee_evaluations','hr_items','timesheet_expenses',
    'tenant_permissions','inventory_state','dga_analyses','dga_dossiers','dga_measures','dga_reports',
    'tenant_affiliate_contracts','bank_statement_lines','incident_actions','dashboard_archived_anomalies',
    'client_sites','client_contacts','tenant_recurring_tasks','tenant_marketing_profile','conge_types',
    'maintenance_templates','maintenance_sheets','maintenance_logs','maintenance_actions','suppliers',
    'recurring_subscriptions','company_assets','annual_budgets','project_attachments','maintenance_alerts',
    'inspection_form_templates','inspection_submissions','revenue_classes','asset_depreciation',
    'tax_remittances','hse_tenant_settings','hse_tenant_register','hse_register_entry','hse_incident',
    'hse_compliance_deadline','hse_hours_worked','hse_proactive_metric','hse_attachment',
    'hse_corrective_action','hse_safety_meeting','inv_items'
  ];
begin
  foreach t in array cibles loop
    if to_regclass('public.'||t) is null then raise notice 'SKIP % (absente)', t; continue; end if;
    for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format(
      'create policy %I on public.%I for all '
      'using (tenant_id = (auth.jwt() ->> ''tenant_id'') or (auth.jwt() ->> ''app_role'') = ''super_admin'') '
      'with check (tenant_id = (auth.jwt() ->> ''tenant_id'') or (auth.jwt() ->> ''app_role'') = ''super_admin'')',
      t||'_tenant_isolation', t);
    raise notice 'A OK % -> isolation tenant', t;
  end loop;
end $$;

-- ────────────────────────────────────────────────────────────────────────────────────
-- GROUPE B — PUBLIC_CONTENT : lecture publique conservée, écritures réservées au super_admin.
-- (contenu global : slides, témoignages, catalogues, référentiels HSE, catalogue modules)
-- ────────────────────────────────────────────────────────────────────────────────────
do $$
declare
  t   text;
  pol record;
  cibles text[] := array[
    'landing_slides','module_slides','landing_testimonials','ai_plans','cs_norm_cache',
    'hse_regulatory_framework','hse_deadline_rule','hse_register_type','modules'
  ];
begin
  foreach t in array cibles loop
    if to_regclass('public.'||t) is null then raise notice 'SKIP % (absente)', t; continue; end if;
    for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    -- lecture publique : anon+authenticated gardent SELECT ; écritures retirées à anon.
    execute format('revoke insert, update, delete on public.%I from anon', t);
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy %I on public.%I for select using (true)', t||'_public_read', t);
    execute format(
      'create policy %I on public.%I for all '
      'using ((auth.jwt() ->> ''app_role'') = ''super_admin'') '
      'with check ((auth.jwt() ->> ''app_role'') = ''super_admin'')',
      t||'_admin_write', t);
    raise notice 'B OK % -> lecture publique + ecriture super_admin', t;
  end loop;
end $$;

-- ────────────────────────────────────────────────────────────────────────────────────
-- GROUPE C — QR_PUBLIC_READ : espaces clos accessibles au secours via QR (lecture publique
-- VOULUE), mais écritures tenant-scopées. (168:99-106)
-- ────────────────────────────────────────────────────────────────────────────────────
do $$
declare
  t   text;
  pol record;
  cibles text[] := array['confined_spaces','cs_permits','cs_atm_readings','cs_entries'];
begin
  foreach t in array cibles loop
    if to_regclass('public.'||t) is null then raise notice 'SKIP % (absente)', t; continue; end if;
    for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke insert, update, delete on public.%I from anon', t);
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy %I on public.%I for select using (true)', t||'_qr_public_read', t);
    -- écritures : tenant ou super_admin
    execute format(
      'create policy %I on public.%I for insert '
      'with check (tenant_id = (auth.jwt() ->> ''tenant_id'') or (auth.jwt() ->> ''app_role'') = ''super_admin'')',
      t||'_tenant_insert', t);
    execute format(
      'create policy %I on public.%I for update '
      'using (tenant_id = (auth.jwt() ->> ''tenant_id'') or (auth.jwt() ->> ''app_role'') = ''super_admin'') '
      'with check (tenant_id = (auth.jwt() ->> ''tenant_id'') or (auth.jwt() ->> ''app_role'') = ''super_admin'')',
      t||'_tenant_update', t);
    execute format(
      'create policy %I on public.%I for delete '
      'using (tenant_id = (auth.jwt() ->> ''tenant_id'') or (auth.jwt() ->> ''app_role'') = ''super_admin'')',
      t||'_tenant_delete', t);
    raise notice 'C OK % -> lecture QR publique + ecriture tenant', t;
  end loop;
end $$;

-- ────────────────────────────────────────────────────────────────────────────────────
-- GROUPE D — GLOBAL_ADMIN : données de l'opérateur SaaS, réservées au super_admin.
-- (csecur360_* : pas de CREATE TABLE dans les migrations — créées hors-migration ; la policy
--  super_admin est agnostique aux colonnes, donc sûre quel que soit leur schéma.)
-- ────────────────────────────────────────────────────────────────────────────────────
do $$
declare
  t   text;
  pol record;
  cibles text[] := array['billing_config','csecur360_clients','csecur360_vendors'];
begin
  foreach t in array cibles loop
    if to_regclass('public.'||t) is null then raise notice 'SKIP % (absente)', t; continue; end if;
    for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format(
      'create policy %I on public.%I for all '
      'using ((auth.jwt() ->> ''app_role'') = ''super_admin'') '
      'with check ((auth.jwt() ->> ''app_role'') = ''super_admin'')',
      t||'_admin_only', t);
    raise notice 'D OK % -> super_admin only', t;
  end loop;
end $$;

-- ────────────────────────────────────────────────────────────────────────────────────
-- GROUPE E — demo_signups : le formulaire public doit pouvoir INSÉRER, mais les leads
-- (nom + courriel) ne doivent PAS être lisibles publiquement -> lecture/màj = super_admin.
-- ────────────────────────────────────────────────────────────────────────────────────
do $$
declare pol record;
begin
  if to_regclass('public.demo_signups') is not null then
    for pol in select policyname from pg_policies where schemaname='public' and tablename='demo_signups' loop
      execute format('drop policy if exists %I on public.demo_signups', pol.policyname);
    end loop;
    alter table public.demo_signups enable row level security;
    revoke select, update, delete on public.demo_signups from anon;
    grant insert on public.demo_signups to anon;                       -- formulaire public
    grant select, insert, update, delete on public.demo_signups to authenticated;
    create policy demo_signups_public_insert on public.demo_signups for insert with check (true);
    create policy demo_signups_admin_read   on public.demo_signups for select using ((auth.jwt() ->> 'app_role') = 'super_admin');
    create policy demo_signups_admin_manage on public.demo_signups for update using ((auth.jwt() ->> 'app_role') = 'super_admin') with check ((auth.jwt() ->> 'app_role') = 'super_admin');
    create policy demo_signups_admin_delete on public.demo_signups for delete using ((auth.jwt() ->> 'app_role') = 'super_admin');
    raise notice 'E OK demo_signups -> INSERT public + lecture super_admin';
  end if;
end $$;

-- ────────────────────────────────────────────────────────────────────────────────────
-- GROUPE F — LEGACY_LOCK : tables sans usage dans l'app + RLS était DÉSACTIVÉ -> verrouillage
-- total (RLS on, aucun droit anon/authenticated, aucune policy = deny-all ; service_role bypass).
-- roles/permissions/role_permissions/user_roles = RBAC legacy (risque escalade). inv_* = inventaire legacy.
-- ────────────────────────────────────────────────────────────────────────────────────
do $$
declare
  t   text;
  pol record;
  cibles text[] := array['roles','permissions','role_permissions','user_roles','inv_locations','inv_stock'];
begin
  foreach t in array cibles loop
    if to_regclass('public.'||t) is null then raise notice 'SKIP % (absente)', t; continue; end if;
    for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('revoke all on public.%I from authenticated', t);
    raise notice 'F OK % -> verrouillage total (deny-all, service_role only)', t;
  end loop;
end $$;

-- ────────────────────────────────────────────────────────────────────────────────────
-- GROUPE G — tenants : registre des tenants (RLS était DÉSACTIVÉ). Un utilisateur ne voit
-- que SA ligne ; super_admin voit tout. tenant_id de l'app = le slug/subdomain (ex. 'cerdia'),
-- donc on matche subdomain OU id (cast en texte) pour être robuste.
-- ────────────────────────────────────────────────────────────────────────────────────
do $$
declare pol record;
begin
  if to_regclass('public.tenants') is not null then
    for pol in select policyname from pg_policies where schemaname='public' and tablename='tenants' loop
      execute format('drop policy if exists %I on public.tenants', pol.policyname);
    end loop;
    alter table public.tenants enable row level security;
    revoke all on public.tenants from anon;
    grant select, insert, update, delete on public.tenants to authenticated;
    create policy tenants_self_or_admin on public.tenants for all
      using (
        subdomain = (auth.jwt() ->> 'tenant_id')
        or id::text = (auth.jwt() ->> 'tenant_id')
        or (auth.jwt() ->> 'app_role') = 'super_admin'
      )
      with check ((auth.jwt() ->> 'app_role') = 'super_admin');
    raise notice 'G OK tenants -> ligne propre (lecture) + ecriture super_admin';
  end if;
end $$;

-- ────────────────────────────────────────────────────────────────────────────────────
-- GROUPE H — hse_audit_log : journal d'audit déjà write-locké (254 : trigger-only, ins/upd/del
-- révoqués). On ne touche PAS aux écritures ; on remplace juste le SELECT public par un SELECT
-- tenant-scopé (les lignes tenant_id NULL restent visibles au super_admin uniquement).
-- ────────────────────────────────────────────────────────────────────────────────────
do $$
declare pol record;
begin
  if to_regclass('public.hse_audit_log') is not null then
    for pol in select policyname from pg_policies where schemaname='public' and tablename='hse_audit_log' loop
      execute format('drop policy if exists %I on public.hse_audit_log', pol.policyname);
    end loop;
    alter table public.hse_audit_log enable row level security;
    revoke select on public.hse_audit_log from anon;
    grant select on public.hse_audit_log to authenticated;
    create policy hse_audit_log_tenant_read on public.hse_audit_log for select
      using (tenant_id = (auth.jwt() ->> 'tenant_id') or (auth.jwt() ->> 'app_role') = 'super_admin');
    raise notice 'H OK hse_audit_log -> lecture tenant (write-lock conserve)';
  end if;
end $$;

-- Journal des migrations.
insert into schema_migrations (version) values ('271') on conflict (version) do nothing;
