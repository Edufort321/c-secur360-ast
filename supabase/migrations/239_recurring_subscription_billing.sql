-- 239 — Abonnements ↔ transactions : ventilation par classe + suivi des paiements + historique.
-- revenue_category : classe de revenu (ventilation état financier, comme les transactions).
-- last_paid_at / proof_url : dernier paiement + preuve. history : journal des paiements (jsonb).
-- last_transaction_id : lien vers la dernière transaction créée (réconciliation bidirectionnelle).
-- (client_id existe déjà depuis la migration 204.) Idempotent + auto-enregistré.

alter table public.recurring_subscriptions add column if not exists revenue_category text;
alter table public.recurring_subscriptions add column if not exists last_paid_at date;
alter table public.recurring_subscriptions add column if not exists proof_url text;
alter table public.recurring_subscriptions add column if not exists history jsonb not null default '[]'::jsonb;
alter table public.recurring_subscriptions add column if not exists last_transaction_id uuid;

insert into schema_migrations (version) values ('239') on conflict (version) do nothing;
