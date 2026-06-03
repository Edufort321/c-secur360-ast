-- 125: Paiements de commission d'affiliation co-vendeur (#69)
-- Enregistre le versement effectif d'une commission (vendor_commissions, migration 057) au co-vendeur :
-- echeance, montant, methode, reference, date de paiement, statut (du/paye/annule).
-- Lien comptable (additif, lecture seule cote app) : compte de charge 5050 « Commissions sur ventes » (085).
-- RLS permissive (isolation applicative) ; l'acces passe par /api/admin/affiliate-payments garde par requireAdmin.
-- Executer dans le SQL Editor de Supabase Dashboard.

CREATE TABLE IF NOT EXISTS affiliate_commission_payments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id  uuid REFERENCES vendor_commissions(id) ON DELETE SET NULL,  -- commission reglee
  vendor_id      uuid REFERENCES vendors(id) ON DELETE SET NULL,
  tenant_id      text REFERENCES tenants(id) ON DELETE SET NULL,
  due_date       date,                                  -- echeance d'origine de la commission
  amount         numeric(12,2) NOT NULL DEFAULT 0,
  method         text,                                  -- virement, cheque, autre
  reference      text,                                  -- n° de paiement / transaction
  paid_at        timestamptz,                           -- paye_le
  status         text NOT NULL DEFAULT 'paid' CHECK (status IN ('due','paid','cancelled')),
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS affiliate_commission_payments_vendor_idx     ON affiliate_commission_payments (vendor_id, status);
CREATE INDEX IF NOT EXISTS affiliate_commission_payments_tenant_idx     ON affiliate_commission_payments (tenant_id);
CREATE INDEX IF NOT EXISTS affiliate_commission_payments_commission_idx ON affiliate_commission_payments (commission_id);

ALTER TABLE affiliate_commission_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS affiliate_commission_payments_access ON affiliate_commission_payments;
CREATE POLICY affiliate_commission_payments_access ON affiliate_commission_payments FOR ALL USING (true) WITH CHECK (true);
