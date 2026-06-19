-- 221 — Multi-devise (#43) fondation. Config par tenant (devise de base + devises activées + taux manuels)
-- dans company_settings.currency_config (JSONB). Les documents face-client/fournisseur portent leur devise
-- + le taux vers la base (équivalent base = montant × fx_rate, sert à la compta). Défauts CAD/1 → ne casse
-- rien. Idempotent + auto-enregistré.
alter table company_settings add column if not exists currency_config jsonb not null default '{"base":"CAD","enabled":["CAD"],"rates":{"CAD":1}}'::jsonb;

alter table commerce_invoices add column if not exists currency text not null default 'CAD';
alter table commerce_invoices add column if not exists fx_rate numeric not null default 1;

-- Table réelle = commerce_transactions. La legacy `transactions` n'existe pas partout → IF EXISTS (anti 42P01).
alter table commerce_transactions add column if not exists currency text not null default 'CAD';
alter table commerce_transactions add column if not exists fx_rate numeric not null default 1;
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'transactions') then
    alter table public.transactions add column if not exists currency text not null default 'CAD';
    alter table public.transactions add column if not exists fx_rate numeric not null default 1;
  end if;
end $$;

alter table soumissions add column if not exists currency text not null default 'CAD';
alter table soumissions add column if not exists fx_rate numeric not null default 1;

insert into schema_migrations (version) values ('221') on conflict (version) do nothing;
