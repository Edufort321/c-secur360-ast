-- 057: Vendors (représentants commerciaux) + commissions
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- Table des vendeurs
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  commission_rate numeric(5,4) NOT NULL DEFAULT 0.20,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors_open" ON vendors FOR ALL USING (true) WITH CHECK (true);

-- Table des commissions dues aux vendeurs (générée au renouvellement annuel)
CREATE TABLE IF NOT EXISTS vendor_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  tenant_id text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  due_date date,
  paid_at timestamptz,
  period_start date,
  period_end date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vendor_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendor_commissions_open" ON vendor_commissions FOR ALL USING (true) WITH CHECK (true);

-- Associer un vendeur à un tenant
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL;

-- Ajouter billable à tenant_subscriptions si pas encore là (migration 014 peut l'avoir déjà ajoutée)
ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS billable boolean NOT NULL DEFAULT true;
