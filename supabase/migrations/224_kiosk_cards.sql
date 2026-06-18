-- 224 — Diffusion en veille (kiosque) : CARTES sélectionnées à faire défiler. L'admin coche les widgets
-- du dashboard à diffuser ; null/[] = toutes les cartes disponibles (rétrocompatible avec migration 219).
-- Idempotent + auto-enregistré.

alter table company_settings add column if not exists kiosk_cards jsonb;

insert into schema_migrations (version) values ('224') on conflict (version) do nothing;
