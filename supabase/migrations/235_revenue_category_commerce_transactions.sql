-- 235 — CORRECTIF : la classe de revenu doit être sur la BONNE table.
-- La migration 232 avait ajouté `revenue_category` sur `transactions` (table legacy), mais les transactions
-- réelles de l'app sont dans `commerce_transactions` (lib/transactions.ts). Résultat : la classe n'était pas
-- persistée (la sauvegarde retirait la colonne absente). On l'ajoute sur la bonne table. Idempotent.

alter table commerce_transactions add column if not exists revenue_category text;

insert into schema_migrations (version) values ('235') on conflict (version) do nothing;
