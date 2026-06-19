-- 247 — Audit P2-7 : catégorie DPA (ACP/CCA) par immobilisation, pour l'amortissement FISCAL (T2 annexe 8),
-- distinct de l'amortissement comptable. cca_class = n° de catégorie ARC (ex. '8','10','50'). Idempotent.

alter table public.company_assets add column if not exists cca_class text;

insert into schema_migrations (version) values ('247') on conflict (version) do nothing;
