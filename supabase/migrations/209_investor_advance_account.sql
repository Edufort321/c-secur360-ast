-- 209 — Compte de PASSIF pour les AVANCES D'INVESTISSEURS / actionnaires (dette à rembourser).
-- Une entrée d'argent qui est une avance n'est PAS un revenu : DR Banque / CR 2400 (dette).
-- Le remboursement : DR 2400 / CR Banque. Back-fill pour tous les tenants ayant un plan comptable. Idempotent.
INSERT INTO public.gl_accounts (tenant_id, code, name, type, normal_balance, is_system)
SELECT DISTINCT tenant_id, '2400', 'Avances/dû aux actionnaires-investisseurs (à rembourser)', 'liability', 'credit', true
FROM public.gl_accounts
ON CONFLICT (tenant_id, code) DO NOTHING;

insert into schema_migrations (version) values ('209') on conflict (version) do nothing;
