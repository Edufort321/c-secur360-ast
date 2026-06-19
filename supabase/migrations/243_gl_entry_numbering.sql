-- 243 — Audit P2-4 : NUMÉROTATION SÉQUENTIELLE des écritures du grand livre (attendu par un auditeur).
-- gl_entries.entry_number existait mais n'était jamais renseigné. On l'attribue AUTOMATIQUEMENT à l'insertion,
-- par tenant, via un compteur atomique (anti-collision concurrente). Format zéro-comblé « 000001 ».
-- ⚠️ On NE renumérote PAS l'historique (entries déjà nulles restent nulles, conformément à la règle « ne pas
-- réécrire l'historique »). Idempotent + auto-enregistré.

create table if not exists public.gl_entry_counters (
  tenant_id text primary key,
  last_no   bigint not null default 0
);
alter table public.gl_entry_counters enable row level security;
drop policy if exists gl_entry_counters_access on public.gl_entry_counters;
create policy gl_entry_counters_access on public.gl_entry_counters for all using (true) with check (true);

create or replace function public.gl_assign_entry_number() returns trigger as $$
declare n bigint;
begin
  if NEW.entry_number is null or NEW.entry_number = '' then
    insert into public.gl_entry_counters(tenant_id, last_no) values (NEW.tenant_id, 1)
      on conflict (tenant_id) do update set last_no = public.gl_entry_counters.last_no + 1
      returning last_no into n;
    NEW.entry_number := to_char(n, 'FM000000');
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_gl_assign_entry_number on public.gl_entries;
create trigger trg_gl_assign_entry_number before insert on public.gl_entries
  for each row execute function public.gl_assign_entry_number();

-- Aligne le compteur sur le plus grand numéro déjà présent (évite les collisions si des numéros existaient).
insert into public.gl_entry_counters (tenant_id, last_no)
select tenant_id, max((entry_number)::bigint)
from public.gl_entries
where entry_number ~ '^[0-9]+$'
group by tenant_id
on conflict (tenant_id) do update set last_no = greatest(public.gl_entry_counters.last_no, excluded.last_no);

insert into schema_migrations (version) values ('243') on conflict (version) do nothing;
