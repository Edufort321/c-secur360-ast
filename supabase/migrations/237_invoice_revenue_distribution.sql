-- 237 — RÉPARTITION du montant d'une facture en PLUSIEURS classes de revenu (ventilation état financier).
-- En plus de la classe unique d'entête (revenue_category, mig 231), une facture peut porter une
-- DISTRIBUTION : [{ "class": "Service", "pct": 60 }, { "class": "Matériel", "pct": 40 }]. La somme des
-- pourcentages = 100. Sert au donut « Revenus par classe » sans modifier la facture client. Idempotent.

alter table commerce_invoices add column if not exists revenue_distribution jsonb;

insert into schema_migrations (version) values ('237') on conflict (version) do nothing;
