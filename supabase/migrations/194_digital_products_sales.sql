-- 194 : Fondation « produits numériques » + suivi des ventes par produit/classe.
--  - items : type 'digital' (produit illimité, sans stock), CLASSE de produit, photo, drapeau illimité.
--  - commerce_invoice_items : lien vers l'article vendu (item_id) + capture de la CLASSE (rollup revenus par classe).
-- Permet : fiche produit -> ajout en soumission -> facture -> revenus ventilés par classe (bilan). Idempotent.

-- Type 'digital' autorisé (on remplace la contrainte CHECK historique de la migration 016).
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_article_type_check;
ALTER TABLE items ADD CONSTRAINT items_article_type_check CHECK (article_type IN ('sale', 'consumable', 'unique', 'digital'));

ALTER TABLE items ADD COLUMN IF NOT EXISTS product_class TEXT;     -- ex. « Module », « Service », « Logiciel »
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_unlimited  BOOLEAN DEFAULT false;  -- produit numérique : pas de suivi de stock
ALTER TABLE items ADD COLUMN IF NOT EXISTS photo_url     TEXT;

ALTER TABLE commerce_invoice_items ADD COLUMN IF NOT EXISTS item_id       UUID;  -- article vendu (référence items)
ALTER TABLE commerce_invoice_items ADD COLUMN IF NOT EXISTS product_class TEXT;  -- snapshot de la classe (rollup revenus)
CREATE INDEX IF NOT EXISTS idx_inv_items_item ON commerce_invoice_items (tenant_id, item_id);

insert into schema_migrations (version) values ('194') on conflict (version) do nothing;
