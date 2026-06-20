-- 255 — HSE : destinataire des rappels + objectifs (cibles) KPI.
--  • reminder_email : courriel qui reçoit les rappels d'échéances réglementaires / révisions de registres
--    (cron quotidien J-7 / J-3 / J-jour / en retard).
--  • target_ltifr / target_trir / target_severity : objectifs annuels → lignes-cibles sur les graphiques
--    + comparaison vs réel. Idempotent + auto-enregistré.

alter table public.hse_tenant_settings add column if not exists reminder_email text;
alter table public.hse_tenant_settings add column if not exists target_ltifr numeric(8,2);
alter table public.hse_tenant_settings add column if not exists target_trir numeric(8,2);
alter table public.hse_tenant_settings add column if not exists target_severity numeric(8,2);

insert into schema_migrations (version) values ('255') on conflict (version) do nothing;
