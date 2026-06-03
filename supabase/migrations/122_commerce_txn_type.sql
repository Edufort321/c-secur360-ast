-- 122: type de transaction (revenu / depense) sur commerce_transactions (#35).
-- (n° 121 reserve par l'agent incidents pour near_miss_events ; on prend 122.)
-- Permet de saisir des REVENUS (ventes / services) en plus des depenses/achats (migration 087).
-- 'expense' par defaut (retro-compatible : toutes les lignes existantes restent des depenses).
-- La comptabilisation GL des revenus (DR banque/clients, CR produits + CR taxes a remettre)
-- sera branchee plus tard (tache #45 / integrateur) ; ici on saisit et on classe seulement.
ALTER TABLE commerce_transactions
  ADD COLUMN IF NOT EXISTS txn_type TEXT NOT NULL DEFAULT 'expense'
  CHECK (txn_type IN ('expense','revenue'));

CREATE INDEX IF NOT EXISTS commerce_transactions_type_idx
  ON commerce_transactions (tenant_id, txn_type, txn_date);
