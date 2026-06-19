-- 244 — Audit P2-3 : ÉCHÉANCE des dépenses fournisseurs (vieillissement AP par conditions de paiement).
-- commerce_transactions n'avait pas de date d'échéance → l'âge des comptes à payer se calculait sur la date
-- d'écriture. On ajoute due_date (échéance explicite) + payment_terms (nb de jours, ex. net 30). Idempotent.

alter table public.commerce_transactions add column if not exists due_date date;
alter table public.commerce_transactions add column if not exists payment_terms integer;

insert into schema_migrations (version) values ('244') on conflict (version) do nothing;
