-- 245 — Audit P2-1 : NOTES DE CRÉDIT / remboursements (contre-écriture liée à la facture d'origine).
-- Une note de crédit annule (en tout ou partie) une facture : réduit le revenu + les taxes + les comptes
-- clients (DR 4000 + DR 2100/2110 / CR 1100). Si remboursement payé : écriture additionnelle DR 1100 / CR banque.
-- Idempotent + auto-enregistré.

create table if not exists public.commerce_credit_notes (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          text not null,
  credit_note_number text not null,
  invoice_id         uuid references public.commerce_invoices(id) on delete set null,
  invoice_number     text,
  client_name        text,
  issue_date         date not null default (now()::date),
  reason             text,
  province           text not null default 'QC',
  subtotal           numeric(14,2) not null default 0,
  gst_amount         numeric(14,2) not null default 0,
  qst_amount         numeric(14,2) not null default 0,
  pst_amount         numeric(14,2) not null default 0,
  total              numeric(14,2) not null default 0,
  refunded           boolean not null default false,   -- remboursement en argent versé (sortie banque)
  gl_entry_id        uuid,                              -- écriture de contre-passation (revenu/taxe/clients)
  refund_gl_entry_id uuid,                              -- écriture de remboursement (banque) si refunded
  created_at         timestamptz not null default now()
);
create index if not exists idx_credit_notes_tenant on public.commerce_credit_notes(tenant_id, issue_date);
create index if not exists idx_credit_notes_invoice on public.commerce_credit_notes(invoice_id);
alter table public.commerce_credit_notes enable row level security;
drop policy if exists credit_notes_access on public.commerce_credit_notes;
create policy credit_notes_access on public.commerce_credit_notes for all using (true) with check (true);

insert into schema_migrations (version) values ('245') on conflict (version) do nothing;
