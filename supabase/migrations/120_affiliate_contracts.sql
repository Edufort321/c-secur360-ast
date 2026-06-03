-- 120: Contrats d'affiliation co-vendeur (#51)
-- Formalise l'entente entre Commerce CERDIA (cerdia.ai) et un vendeur (co-vendeur) pour un compte client (tenant).
-- CERDIA s'engage a verser une commission (defaut 20 %) sur les revenus du tenant, indexee a l'inflation
-- si applicable, recurrence annuelle a la date de creation du tenant. Un contrat par tenant.
-- RLS permissive (isolation applicative par tenant_id, comme le reste du projet) ; l'acces ecriture/lecture
-- passe par /api/admin/affiliate-contract garde par requireAdmin (service-role cote serveur).
-- Executer dans le SQL Editor de Supabase Dashboard.

CREATE TABLE IF NOT EXISTS tenant_affiliate_contracts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        text NOT NULL,
  vendor_name      text,
  vendor_email     text,
  commission_pct   numeric(7,4) NOT NULL DEFAULT 20,        -- % de commission au vendeur
  inflation_pct    numeric(7,4) NOT NULL DEFAULT 0,         -- indexation annuelle (0 = non indexee)
  recurrence       text NOT NULL DEFAULT 'annuelle',
  start_date       date,                                    -- = date de creation du tenant (tenants.created_at)
  clauses          text,                                    -- texte legal complet du contrat
  signataire_name  text,
  signataire_title text,
  signed_at        timestamptz,                             -- horodatage de la signature
  status           text NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon','signe','resilie')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id)                                        -- un seul contrat d'affiliation par tenant
);
CREATE INDEX IF NOT EXISTS tenant_affiliate_contracts_tenant_idx ON tenant_affiliate_contracts (tenant_id);

ALTER TABLE tenant_affiliate_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_affiliate_contracts_access ON tenant_affiliate_contracts;
CREATE POLICY tenant_affiliate_contracts_access ON tenant_affiliate_contracts FOR ALL USING (true) WITH CHECK (true);
