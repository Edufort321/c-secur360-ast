-- 221 — Multi-devise (#43) fondation. Config par tenant (devise de base + devises activées + taux manuels)
-- dans company_settings.currency_config (JSONB). Les documents face-client/fournisseur portent leur devise
-- + le taux vers la base (équivalent base = montant × fx_rate, sert à la compta). Défauts CAD/1 → ne casse
-- rien. Idempotent + auto-enregistré.
alter table company_settings add column if not exists currency_config jsonb not null default '{"base":"CAD","enabled":["CAD"],"rates":{"CAD":1}}'::jsonb;

alter table commerce_invoices add column if not exists currency text not null default 'CAD';
alter table commerce_invoices add column if not exists fx_rate numeric not null default 1;

alter table transactions add column if not exists currency text not null default 'CAD';
alter table transactions add column if not exists fx_rate numeric not null default 1;

alter table soumissions add column if not exists currency text not null default 'CAD';
alter table soumissions add column if not exists fx_rate numeric not null default 1;

insert into schema_migrations (version) values ('221') on conflict (version) do nothing;
