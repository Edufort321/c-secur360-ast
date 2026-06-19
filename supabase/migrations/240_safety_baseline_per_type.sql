-- 240 — Compteur sécurité : réinitialisation PAR TYPE (accident vs presque-accident), pas générale.
-- Plancher « jours sans » par type : la plus récente entre l'événement réel et cette date de réinit.
-- (Sinon = date de création du tenant.) Idempotent + auto-enregistré.

alter table company_settings add column if not exists safety_baseline_accident date;
alter table company_settings add column if not exists safety_baseline_nearmiss date;

insert into schema_migrations (version) values ('240') on conflict (version) do nothing;
