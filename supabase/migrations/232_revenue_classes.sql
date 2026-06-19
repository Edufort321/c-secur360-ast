-- 232 — CLASSES DE REVENU gérables (indépendantes du catalogue produit) pour la ventilation de l'état
-- financier. L'utilisateur crée ses classes (ex. Service, Projet, Maintenance, Location…) et les assigne
-- à la saisie d'un REVENU (transaction de type 'revenue' OU facture). RLS permissive par tenant.
-- Idempotent + auto-enregistré.

create table if not exists public.revenue_classes (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  name text not null,
  color text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.revenue_classes enable row level security;
drop policy if exists revenue_classes_all on public.revenue_classes;
create policy revenue_classes_all on public.revenue_classes for all using (true) with check (true);
create index if not exists idx_revenue_classes_tenant on public.revenue_classes (tenant_id, sort_order);

-- Catégorie de revenu sur la transaction (revenu saisi directement, sans facture).
-- La table réelle de l'app est `commerce_transactions`. On l'ajoute là. (La table legacy `transactions`
-- n'existe pas partout → on la traite seulement SI elle existe, pour ne jamais faire échouer la migration.)
alter table commerce_transactions add column if not exists revenue_category text;
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'transactions') then
    alter table public.transactions add column if not exists revenue_category text;
  end if;
end $$;

insert into schema_migrations (version) values ('232') on conflict (version) do nothing;
