-- 126: Parrainage co-vendeur (#78) — lien de parrainage unique + attribution des inscriptions.
-- Chaque vendeur a un code de parrainage unique (ex. lien /signup?ref=<code>). A la creation d'un tenant
-- via ce lien, le tenant est attribue au vendeur (referred_by) et le vendeur lui est assigne (vendor_id)
-- pour que la commission recurrente s'applique. RLS deja active sur vendors/tenants.
-- Executer dans le SQL Editor de Supabase Dashboard.

ALTER TABLE vendors  ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE tenants  ADD COLUMN IF NOT EXISTS referred_by   uuid REFERENCES vendors(id) ON DELETE SET NULL;

-- Unicite du code (en ignorant les NULL).
CREATE UNIQUE INDEX IF NOT EXISTS vendors_referral_code_key ON vendors (referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS tenants_referred_by_idx ON tenants (referred_by);
