-- 219 — Mode DIFFUSION EN VEILLE (kiosque) : après N s d'inactivité, le dashboard fait défiler en boucle
-- les relevés des widgets en plein écran (jusqu'à un mouvement). Activé par tenant dans Admin › Système.
-- Idempotent + auto-enregistré.
alter table company_settings add column if not exists kiosk_broadcast boolean not null default false;
alter table company_settings add column if not exists kiosk_idle_seconds integer not null default 60;

insert into schema_migrations (version) values ('219') on conflict (version) do nothing;
