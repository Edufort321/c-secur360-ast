-- 236 — Classe PAR LIGNE sur les transactions (ventilation des coûts/revenus par classe).
-- En plus de la classe d'entête (commerce_transactions.revenue_category, mig 232/235), chaque LIGNE
-- peut porter sa propre classe → ventilation fine de l'état financier. Idempotent + auto-enregistré.

alter table commerce_transaction_items add column if not exists revenue_category text;

insert into schema_migrations (version) values ('236') on conflict (version) do nothing;
