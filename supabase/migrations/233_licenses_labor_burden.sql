-- 233 — Conformité entrepreneur (Québec) + coût de main-d'œuvre CHARGÉ (best practice job costing).
--  A) Licences sur company_settings : RBQ, n° de membre CMEQ, NEQ — affichées sur soumissions/factures.
--  B) payroll_settings.labor_burden_pct : fardeau de main-d'œuvre (charges patronales + avantages) appliqué
--     au COÛT DE PROJET (défaut 0.35 = +35 %). Pratique : la MO réelle ≈ salaire × (1 + fardeau).
-- Idempotent + auto-enregistré.

alter table company_settings add column if not exists rbq_license text;
alter table company_settings add column if not exists cmeq_member text;
alter table company_settings add column if not exists neq text;

alter table payroll_settings add column if not exists labor_burden_pct numeric not null default 0.35;

insert into schema_migrations (version) values ('233') on conflict (version) do nothing;
