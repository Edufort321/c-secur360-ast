-- =====================================================================================
-- 272 — RLS : isolation tenant sur les 7 tables oubliées par la 271 (fin de la longue traîne).
--
-- Ces tables étaient encore en policy permissive `USING(true)` (dont work_permits avec un
-- `anon UPDATE` !). Toutes ont une colonne tenant_id directe et AUCUNE n'est lue par une route
-- publique (/scan, /approbation) -> isolation tenant standard, comme 270/271 Groupe A.
--
--   poste_salary_tiers      (paliers de salaires — sensible)
--   work_permits            (permis de travail ; avait un anon UPDATE — legacy/erreur)
--   transaction_attachments (pièces jointes financières)
--   vehicles, vehicle_logbook
--   todo_tasks, todo_steps
--
-- Idempotente. S'auto-enregistre dans schema_migrations.
-- =====================================================================================
do $$
declare
  t   text;
  pol record;
  cibles text[] := array[
    'poste_salary_tiers','work_permits','transaction_attachments','vehicles','vehicle_logbook',
    'todo_tasks','todo_steps'
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
    raise notice '272 OK % -> isolation tenant', t;
  end loop;
end $$;

insert into schema_migrations (version) values ('272') on conflict (version) do nothing;
