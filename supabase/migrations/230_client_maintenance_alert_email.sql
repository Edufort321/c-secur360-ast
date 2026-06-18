-- 230 — Planification maintenance (phase 2/3) : adresse d'ALERTE CLIENT pour les « travaux à planifier »
-- (notification manuelle/auto « votre entretien est bientôt à planifier »). Si vide → on retombe sur
-- clients.email. Idempotent + auto-enregistré.

alter table clients add column if not exists maintenance_alert_email text;

insert into schema_migrations (version) values ('230') on conflict (version) do nothing;
