-- 231 — Ventilation des revenus de l'état financier pour les TENANTS DE SERVICE (sans catalogue produit) :
-- catégorie de revenu au niveau de la facture (ex. Service, Projet, Maintenance, Produit, Location).
-- Le camembert « Revenus par classe » utilise : classe du produit (ligne) → sinon cette catégorie → sinon
-- « Non classé ». Idempotent + auto-enregistré.

alter table commerce_invoices add column if not exists revenue_category text;

insert into schema_migrations (version) values ('231') on conflict (version) do nothing;
