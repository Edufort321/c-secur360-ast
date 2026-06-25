-- 266 — Notification AUTO du client final (opt-in) pour les échéances de maintenance.
-- Par défaut DÉSACTIVÉ (consentement requis, Loi 25). L'adresse reste maintenance_alert_email (mig 230),
-- repli sur clients.email. Le cron maintenance-reminders envoie un digest par client opté-in. Idempotent.

alter table if exists clients add column if not exists maintenance_auto_notify boolean not null default false;

insert into schema_migrations (version) values ('266') on conflict (version) do nothing;
