-- 265 — Notifications de maintenance (auto).
-- Deux mécanismes :
--   1) DIGEST quotidien des échéances (cron) → maintenance_reminders_enabled + email + horizon.
--   2) DEMANDE DE SERVICE auto sur scan QR d'un problème → maintenance_scan_email_enabled.
-- Le destinataire opérateur = maintenance_reminder_email (repli sur support_email existant). Idempotent.

alter table if exists company_settings add column if not exists maintenance_reminder_email   text;
alter table if exists company_settings add column if not exists maintenance_reminders_enabled boolean not null default false;
alter table if exists company_settings add column if not exists maintenance_reminder_days     integer not null default 14;
alter table if exists company_settings add column if not exists maintenance_scan_email_enabled boolean not null default true;

insert into schema_migrations (version) values ('265') on conflict (version) do nothing;
