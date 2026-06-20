-- 254 — JOURNAL D'AUDIT HSE (traçabilité SST obligatoire). Qui a créé/modifié/clôturé quoi et quand,
-- de façon IMMUABLE. Alimenté par TRIGGER (security definer) sur les tables clés → l'app ne peut
-- qu'INSÉRER via le trigger et LIRE ; pas de modification/suppression du journal (REVOKE).
-- L'« acteur » est best-effort : lu sur la ligne (closed_by/completed_by/uploaded_by/created_by) que
-- l'app estampille avec le courriel de l'utilisateur. Idempotent + auto-enregistré.

create table if not exists public.hse_audit_log (
  id          bigint generated always as identity primary key,
  tenant_id   text,
  table_name  text not null,
  row_id      uuid,
  operation   text not null,            -- INSERT | UPDATE | DELETE
  actor       text,                     -- courriel estampillé par l'app (best-effort)
  summary     jsonb,
  at          timestamptz not null default now()
);
create index if not exists idx_hse_audit_tenant on public.hse_audit_log(tenant_id, at desc);
create index if not exists idx_hse_audit_row on public.hse_audit_log(table_name, row_id);

alter table public.hse_audit_log enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'hse_audit_log' and policyname = 'hse_audit_select') then
    create policy hse_audit_select on public.hse_audit_log for select using (true);
  end if;
end $$;
-- Immuable depuis l'app : seul le trigger (definer) écrit ; pas d'écriture directe.
revoke insert, update, delete on public.hse_audit_log from anon, authenticated;

create or replace function hse_audit() returns trigger language plpgsql security definer set search_path = public as $$
declare j jsonb; ten text; rid uuid; act text;
begin
  if (tg_op = 'DELETE') then j := to_jsonb(old); else j := to_jsonb(new); end if;
  ten := j->>'tenant_id';
  begin rid := (j->>'id')::uuid; exception when others then rid := null; end;
  act := coalesce(j->>'closed_by', j->>'completed_by', j->>'uploaded_by', j->>'created_by');
  insert into public.hse_audit_log (tenant_id, table_name, row_id, operation, actor, summary)
  values (ten, tg_table_name, rid, tg_op, act,
          jsonb_build_object('label', coalesce(j->>'title', j->>'description', j->>'event_code', j->>'label_fr', j->>'kind'),
                             'status', j->>'status'));
  return null;
end; $$;

do $$
declare t text;
begin
  foreach t in array array['hse_incident','hse_register_entry','hse_compliance_deadline','hse_corrective_action','hse_attachment']
  loop
    execute format('drop trigger if exists trg_%s_audit on public.%I', t, t);
    execute format('create trigger trg_%s_audit after insert or update or delete on public.%I for each row execute function hse_audit()', t, t);
  end loop;
end $$;

insert into schema_migrations (version) values ('254') on conflict (version) do nothing;
