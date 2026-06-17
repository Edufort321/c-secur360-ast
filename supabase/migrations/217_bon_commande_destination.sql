-- 217 — Bon de commande : DESTINATION (classe d'achat) + catégorie fiscale + lien GL.
-- Permet d'automatiser le routage à la réception : stock/inventaire, projet/chantier (coût de projet),
-- consommable (charge directe), immobilisation (CAPEX → actif), revente (stock destiné à la vente).
-- Idempotent. S'auto-enregistre dans schema_migrations.

alter table if exists bons_commande add column if not exists destination text not null default 'stock';
alter table if exists bons_commande add column if not exists fiscal_category text;     -- catégorie fiscale (si destination = consommable)
alter table if exists bons_commande add column if not exists gl_entry_id uuid;          -- écriture GL passée à la réception (évite le double-comptage)

comment on column bons_commande.destination is 'Classe d''achat : stock | projet | consommable | capex | revente — pilote le routage comptable à la réception.';

insert into schema_migrations (version) values ('217') on conflict (version) do nothing;
