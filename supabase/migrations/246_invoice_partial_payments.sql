-- 246 — Audit P2-2 : PAIEMENTS PARTIELS des factures. Le statut était binaire (payée/non payée) ; on suit
-- le cumul encaissé (paid_amount) + le journal des encaissements (invoice_payments). Le solde dû = total −
-- paid_amount alimente le vieillissement AR. Idempotent + auto-enregistré.

alter table public.commerce_invoices add column if not exists paid_amount numeric(14,2) not null default 0;

create table if not exists public.invoice_payments (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       text not null,
  invoice_id      uuid not null references public.commerce_invoices(id) on delete cascade,
  pay_date        date not null default (now()::date),
  amount          numeric(14,2) not null default 0,
  bank_gl_account text,                 -- compte de trésorerie crédité (gl_account_id)
  gl_entry_id     uuid,                  -- écriture DR banque / CR clients
  created_at      timestamptz not null default now()
);
create index if not exists idx_invoice_payments_inv on public.invoice_payments(tenant_id, invoice_id);
alter table public.invoice_payments enable row level security;
drop policy if exists invoice_payments_access on public.invoice_payments;
create policy invoice_payments_access on public.invoice_payments for all using (true) with check (true);

insert into schema_migrations (version) values ('246') on conflict (version) do nothing;
