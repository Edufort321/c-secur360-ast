-- 220 — Paramètres d'expéditeur CPA-005 (Desjardins AccèsD Affaires) pour l'export de dépôt direct (#52
-- phase 2). Viennent de l'enrôlement AccèsD : n° d'expéditeur/client, centre de données, compte de retour,
-- noms court/long, n° de création de fichier (incrémenté à chaque génération). Idempotent + auto-enregistré.
alter table company_settings add column if not exists cpa_originator_id text;
alter table company_settings add column if not exists cpa_short_name text;
alter table company_settings add column if not exists cpa_long_name text;
alter table company_settings add column if not exists cpa_data_centre text;
alter table company_settings add column if not exists cpa_return_institution text default '815';
alter table company_settings add column if not exists cpa_return_transit text;
alter table company_settings add column if not exists cpa_return_account text;
alter table company_settings add column if not exists cpa_transaction_type text default '200';
alter table company_settings add column if not exists cpa_file_creation_number integer not null default 1;

insert into schema_migrations (version) values ('220') on conflict (version) do nothing;
