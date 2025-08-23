-- ===================================================================
-- C-Secur360 SYSTÈME INVENTAIRE QR-FIRST MOBILE
-- Gestion complète inventaire, vente, fournisseurs avec QR codes
-- ===================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- 1. ARTICLES & CATALOGUE
-- ===================================================================

-- Table des articles de l'inventaire
CREATE TABLE IF NOT EXISTS inv_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    uom TEXT DEFAULT 'UN', -- Unité de mesure: UN, KG, L, M, etc.
    
    -- Seuils de stock
    min_qty NUMERIC DEFAULT 0,
    max_qty NUMERIC,
    reorder_point NUMERIC,
    safety_stock NUMERIC DEFAULT 0,
    
    -- Localisation par défaut
    default_location_id UUID,
    
    -- Propriétés physiques
    dimensions JSONB, -- {L:mm, l:mm, H:mm, poids:g}
    images JSONB DEFAULT '[]'::jsonb, -- URLs des photos carrousel
    
    -- Comportement
    serializable BOOLEAN DEFAULT false, -- Traçabilité unitaire (série/lot)
    sellable BOOLEAN DEFAULT false, -- Disponible à la vente
    active BOOLEAN DEFAULT true,
    
    -- Métadonnées
    description TEXT,
    category TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(client_id, sku) -- SKU unique par client
);

-- ===================================================================
-- 2. INSTANCES PHYSIQUES (TRAÇABILITÉ UNITAIRE)
-- ===================================================================

-- Instances individuelles pour articles serializable
CREATE TABLE IF NOT EXISTS inv_item_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES inv_items(id) ON DELETE CASCADE,
    
    -- Identification unique
    instance_code TEXT NOT NULL, -- ex: "boite1-1", "lot-A-001"
    serial_number TEXT,
    batch_number TEXT,
    
    -- QR code payload
    qr_payload JSONB NOT NULL, -- {type:'instance', id:uuid, code:string}
    
    -- Localisation & statut
    location_id UUID, -- Référence vers inv_locations
    status TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock','reserved','sold','lost','retired')),
    
    -- Métadonnées
    manufacture_date DATE,
    expiry_date DATE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(instance_code) -- Code d'instance globalement unique
);

-- ===================================================================
-- 3. EMPLACEMENTS & SITES
-- ===================================================================

-- Emplacements de stockage
CREATE TABLE IF NOT EXISTS inv_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    site_id UUID NOT NULL, -- Référence vers la table sites (à créer si nécessaire)
    
    -- Identification
    name TEXT NOT NULL,
    code TEXT, -- Code court pour étiquettes
    
    -- Hiérarchie (optionnel)
    parent_location_id UUID REFERENCES inv_locations(id),
    location_type TEXT DEFAULT 'storage', -- storage, shipping, receiving, production
    
    -- Propriétés
    capacity NUMERIC,
    temperature_controlled BOOLEAN DEFAULT false,
    outdoor BOOLEAN DEFAULT false,
    
    -- Métadonnées
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(client_id, code) -- Code unique par client
);

-- ===================================================================
-- 4. STOCKS PAR EMPLACEMENT
-- ===================================================================

-- Stock agrégé par article/emplacement
CREATE TABLE IF NOT EXISTS inv_stock (
    item_id UUID NOT NULL REFERENCES inv_items(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES inv_locations(id) ON DELETE CASCADE,
    
    -- Quantités
    on_hand NUMERIC NOT NULL DEFAULT 0,
    reserved NUMERIC NOT NULL DEFAULT 0, -- Réservé pour commandes
    available NUMERIC GENERATED ALWAYS AS (on_hand - reserved) STORED,
    
    -- Métadonnées
    last_counted_at TIMESTAMP WITH TIME ZONE,
    last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (item_id, location_id)
);

-- ===================================================================
-- 5. TRANSACTIONS INVENTAIRE
-- ===================================================================

-- Mouvements de stock (audit trail complet)
CREATE TABLE IF NOT EXISTS inv_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    site_id UUID,
    
    -- Article concerné
    item_id UUID NOT NULL REFERENCES inv_items(id) ON DELETE RESTRICT,
    instance_id UUID REFERENCES inv_item_instances(id) ON DELETE SET NULL,
    
    -- Mouvement
    location_id UUID REFERENCES inv_locations(id) ON DELETE SET NULL,
    location_from_id UUID REFERENCES inv_locations(id) ON DELETE SET NULL, -- Pour transferts
    delta NUMERIC NOT NULL, -- +/- quantité
    
    -- Raison du mouvement
    reason TEXT NOT NULL CHECK (reason IN ('receipt','issue','adjust','transfer','sale','return')),
    
    -- Contexte projet/tâche
    project_id UUID,
    task_id UUID,
    billing_code TEXT,
    
    -- Traçabilité
    user_id UUID REFERENCES users(id),
    photo_url TEXT,
    note TEXT,
    
    -- Référence externe
    reference_type TEXT, -- 'po', 'so', 'wo' (work order), etc.
    reference_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 6. FOURNISSEURS
-- ===================================================================

-- Catalogue des fournisseurs
CREATE TABLE IF NOT EXISTS inv_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    
    -- Identification
    name TEXT NOT NULL,
    code TEXT,
    
    -- Contact
    email TEXT,
    phone TEXT,
    website TEXT,
    
    -- Adresse
    address JSONB, -- {street, city, province, postal_code, country}
    
    -- Conditions commerciales
    default_terms TEXT, -- ex: "Net 30", "2/10 Net 30"
    default_lead_time_days INTEGER DEFAULT 7,
    default_currency TEXT DEFAULT 'CAD',
    
    -- Statut
    active BOOLEAN DEFAULT true,
    preferred BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(client_id, code) -- Code fournisseur unique par client
);

-- Articles par fournisseur (catalogue fournisseur)
CREATE TABLE IF NOT EXISTS inv_vendor_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES inv_vendors(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inv_items(id) ON DELETE CASCADE,
    
    -- Référence fournisseur
    vendor_sku TEXT,
    vendor_name TEXT, -- Nom chez le fournisseur
    
    -- Prix & conditions
    price NUMERIC,
    currency TEXT DEFAULT 'CAD',
    min_order_qty NUMERIC DEFAULT 1,
    lead_time_days INTEGER,
    
    -- Préférences
    preferred BOOLEAN DEFAULT false,
    
    -- Métadonnées
    last_price_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(vendor_id, item_id) -- Un article par fournisseur
);

-- ===================================================================
-- 7. COMMANDES D'ACHAT (PURCHASE ORDERS)
-- ===================================================================

-- En-tête des commandes d'achat
CREATE TABLE IF NOT EXISTS inv_purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    po_number TEXT NOT NULL, -- Numéro de PO généré
    
    -- Fournisseur
    vendor_id UUID NOT NULL REFERENCES inv_vendors(id) ON DELETE RESTRICT,
    
    -- Statut
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_approval', 'approved', 'ordered', 
        'partially_received', 'received', 'cancelled'
    )),
    
    -- Montants
    subtotal NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'CAD',
    
    -- Dates
    order_date DATE,
    expected_date DATE,
    received_date DATE,
    
    -- Approbation
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    notes TEXT,
    terms TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(client_id, po_number)
);

-- Lignes de commande
CREATE TABLE IF NOT EXISTS inv_po_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID NOT NULL REFERENCES inv_purchase_orders(id) ON DELETE CASCADE,
    
    -- Article
    item_id UUID NOT NULL REFERENCES inv_items(id) ON DELETE RESTRICT,
    
    -- Quantités
    qty_ordered NUMERIC NOT NULL,
    qty_received NUMERIC DEFAULT 0,
    qty_remaining NUMERIC GENERATED ALWAYS AS (qty_ordered - qty_received) STORED,
    
    -- Prix
    unit_price NUMERIC NOT NULL,
    line_total NUMERIC GENERATED ALWAYS AS (qty_ordered * unit_price) STORED,
    
    -- Contexte (optionnel)
    project_id UUID,
    location_id UUID REFERENCES inv_locations(id), -- Destination
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 8. VENTE & E-COMMERCE
-- ===================================================================

-- Articles mis en vente
CREATE TABLE IF NOT EXISTS inv_sellable_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    item_id UUID NOT NULL REFERENCES inv_items(id) ON DELETE CASCADE,
    
    -- Vente
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Prix
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'CAD',
    taxable BOOLEAN DEFAULT true,
    
    -- Visibilité
    publish BOOLEAN DEFAULT false,
    public_slug TEXT UNIQUE, -- URL publique: /shop/{slug}
    internal_only BOOLEAN DEFAULT true, -- Visible seulement aux clients internes
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Commandes de vente
CREATE TABLE IF NOT EXISTS inv_shop_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    
    -- Vendeur/acheteur
    seller_client_id UUID NOT NULL, -- Client qui vend
    buyer_client_id UUID, -- Client qui achète (si interne)
    buyer_email TEXT, -- Email acheteur (si externe)
    buyer_info JSONB, -- Nom, adresse, etc.
    
    -- Statut
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'paid', 'fulfilled', 'shipped', 'delivered', 'cancelled', 'refunded'
    )),
    
    -- Montants
    subtotal NUMERIC NOT NULL DEFAULT 0,
    taxes NUMERIC NOT NULL DEFAULT 0,
    shipping NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'CAD',
    
    -- Paiement Stripe
    stripe_payment_intent TEXT,
    stripe_session_id TEXT,
    
    -- Commission (si vente publique)
    commission_rate NUMERIC DEFAULT 0.05, -- 5% par défaut
    commission_amount NUMERIC DEFAULT 0,
    
    -- Expédition
    shipping_address JSONB,
    tracking_number TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Lignes de commande de vente
CREATE TABLE IF NOT EXISTS inv_shop_order_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES inv_shop_orders(id) ON DELETE CASCADE,
    
    -- Article vendu
    sellable_item_id UUID NOT NULL REFERENCES inv_sellable_items(id) ON DELETE RESTRICT,
    item_id UUID NOT NULL REFERENCES inv_items(id) ON DELETE RESTRICT,
    instance_id UUID REFERENCES inv_item_instances(id) ON DELETE SET NULL,
    
    -- Quantité & prix
    qty NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    line_total NUMERIC GENERATED ALWAYS AS (qty * unit_price) STORED,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 9. PARAMÈTRES & CONFIGURATION
-- ===================================================================

-- Configuration inventaire par client
CREATE TABLE IF NOT EXISTS inv_settings (
    client_id UUID PRIMARY KEY,
    
    -- Règles de gestion
    require_project_on_issue BOOLEAN DEFAULT true, -- Projet obligatoire sur sorties
    auto_create_po BOOLEAN DEFAULT true, -- PO automatiques
    po_approval_required BOOLEAN DEFAULT true, -- Approbation PO requise
    
    -- Numérotation
    po_number_prefix TEXT DEFAULT 'PO',
    po_number_counter INTEGER DEFAULT 1,
    order_number_prefix TEXT DEFAULT 'SO',
    order_number_counter INTEGER DEFAULT 1,
    
    -- Seuils par défaut
    default_reorder_point NUMERIC DEFAULT 10,
    default_safety_stock NUMERIC DEFAULT 5,
    
    -- QR codes
    qr_base_url TEXT, -- Base URL pour QR codes
    label_template TEXT DEFAULT 'avery_5160', -- Template étiquettes
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 10. INDEXES POUR PERFORMANCE
-- ===================================================================

-- Articles
CREATE INDEX IF NOT EXISTS idx_inv_items_client_id ON inv_items(client_id);
CREATE INDEX IF NOT EXISTS idx_inv_items_sku ON inv_items(sku);
CREATE INDEX IF NOT EXISTS idx_inv_items_active ON inv_items(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_inv_items_sellable ON inv_items(sellable) WHERE sellable = true;

-- Instances
CREATE INDEX IF NOT EXISTS idx_inv_instances_item_id ON inv_item_instances(item_id);
CREATE INDEX IF NOT EXISTS idx_inv_instances_location ON inv_item_instances(location_id);
CREATE INDEX IF NOT EXISTS idx_inv_instances_status ON inv_item_instances(status);
CREATE INDEX IF NOT EXISTS idx_inv_instances_qr_payload ON inv_item_instances USING gin(qr_payload);

-- Emplacements
CREATE INDEX IF NOT EXISTS idx_inv_locations_client_site ON inv_locations(client_id, site_id);

-- Stock
CREATE INDEX IF NOT EXISTS idx_inv_stock_location ON inv_stock(location_id);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_inv_tx_client_id ON inv_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_inv_tx_item_id ON inv_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inv_tx_created_at ON inv_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inv_tx_reason ON inv_transactions(reason);
CREATE INDEX IF NOT EXISTS idx_inv_tx_project ON inv_transactions(project_id) WHERE project_id IS NOT NULL;

-- Fournisseurs
CREATE INDEX IF NOT EXISTS idx_inv_vendors_client_id ON inv_vendors(client_id);
CREATE INDEX IF NOT EXISTS idx_inv_vendors_active ON inv_vendors(active) WHERE active = true;

-- PO
CREATE INDEX IF NOT EXISTS idx_inv_po_client_id ON inv_purchase_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_inv_po_status ON inv_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_inv_po_vendor ON inv_purchase_orders(vendor_id);

-- Vente
CREATE INDEX IF NOT EXISTS idx_inv_sellable_client ON inv_sellable_items(client_id);
CREATE INDEX IF NOT EXISTS idx_inv_sellable_publish ON inv_sellable_items(publish) WHERE publish = true;
CREATE INDEX IF NOT EXISTS idx_inv_orders_seller ON inv_shop_orders(seller_client_id);
CREATE INDEX IF NOT EXISTS idx_inv_orders_status ON inv_shop_orders(status);

-- ===================================================================
-- 11. TRIGGERS POUR AUDIT & MISE À JOUR AUTOMATIQUE
-- ===================================================================

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_inventory()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer aux tables appropriées
CREATE TRIGGER update_inv_items_updated_at 
    BEFORE UPDATE ON inv_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_inventory();

CREATE TRIGGER update_inv_instances_updated_at 
    BEFORE UPDATE ON inv_item_instances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_inventory();

CREATE TRIGGER update_inv_vendors_updated_at 
    BEFORE UPDATE ON inv_vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_inventory();

CREATE TRIGGER update_inv_po_updated_at 
    BEFORE UPDATE ON inv_purchase_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_inventory();

-- Trigger pour mettre à jour les stocks après transaction
CREATE OR REPLACE FUNCTION update_stock_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le stock à la localisation
    INSERT INTO inv_stock (item_id, location_id, on_hand, last_updated_at)
    VALUES (NEW.item_id, NEW.location_id, NEW.delta, NOW())
    ON CONFLICT (item_id, location_id)
    DO UPDATE SET 
        on_hand = inv_stock.on_hand + NEW.delta,
        last_updated_at = NOW();
    
    -- Si transfert, déduire du stock source
    IF NEW.reason = 'transfer' AND NEW.location_from_id IS NOT NULL THEN
        INSERT INTO inv_stock (item_id, location_id, on_hand, last_updated_at)
        VALUES (NEW.item_id, NEW.location_from_id, -NEW.delta, NOW())
        ON CONFLICT (item_id, location_id)
        DO UPDATE SET 
            on_hand = inv_stock.on_hand - NEW.delta,
            last_updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock 
    AFTER INSERT ON inv_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_stock_after_transaction();

-- ===================================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Enable RLS sur toutes les tables
ALTER TABLE inv_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_item_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_vendor_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_po_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_sellable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_shop_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_settings ENABLE ROW LEVEL SECURITY;

-- Policies de base (à affiner selon RBAC)
-- Les utilisateurs voient seulement les données de leur client

CREATE POLICY "Users see own client inventory" ON inv_items 
    FOR ALL TO authenticated 
    USING (client_id IN (
        SELECT tenant_id::uuid FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users see own client instances" ON inv_item_instances
    FOR ALL TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM inv_items 
        WHERE id = inv_item_instances.item_id 
        AND client_id IN (
            SELECT tenant_id::uuid FROM users WHERE id = auth.uid()
        )
    ));

-- Policies similaires pour toutes les autres tables...
-- (À compléter selon les besoins spécifiques de chaque table)

-- ===================================================================
-- 13. FONCTIONS UTILITAIRES
-- ===================================================================

-- Fonction pour générer un QR payload
CREATE OR REPLACE FUNCTION generate_qr_payload(
    p_type TEXT, -- 'item' ou 'instance'
    p_id UUID,
    p_code TEXT DEFAULT NULL
) RETURNS JSONB AS $$
BEGIN
    RETURN jsonb_build_object(
        'type', p_type,
        'id', p_id,
        'code', COALESCE(p_code, p_id::text),
        'timestamp', extract(epoch from now())::integer
    );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le stock disponible total d'un article
CREATE OR REPLACE FUNCTION get_available_stock(p_item_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_stock NUMERIC := 0;
BEGIN
    SELECT COALESCE(SUM(available), 0) INTO total_stock
    FROM inv_stock
    WHERE item_id = p_item_id;
    
    RETURN total_stock;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si réapprovisionnement nécessaire
CREATE OR REPLACE FUNCTION needs_reorder(p_item_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock NUMERIC;
    reorder_point NUMERIC;
BEGIN
    -- Obtenir stock actuel
    SELECT get_available_stock(p_item_id) INTO current_stock;
    
    -- Obtenir seuil de réapprovisionnement
    SELECT COALESCE(reorder_point, 0) INTO reorder_point
    FROM inv_items
    WHERE id = p_item_id;
    
    RETURN current_stock <= reorder_point;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 14. DONNÉES INITIALES / SEEDS
-- ===================================================================

-- Permissions inventaire à ajouter dans la table permissions
INSERT INTO permissions (key, module, action, name, description, is_dangerous) VALUES
    ('inventory.view', 'inventory', 'view', 'Voir inventaire', 'Consulter articles et stocks', false),
    ('inventory.scan', 'inventory', 'scan', 'Scanner QR codes', 'Utiliser scanner mobile', false),
    ('inventory.receive', 'inventory', 'receive', 'Réceptionner', 'Entrées de stock', false),
    ('inventory.issue', 'inventory', 'issue', 'Sortir du stock', 'Sorties de stock', false),
    ('inventory.transfer', 'inventory', 'transfer', 'Transférer', 'Mouvements entre emplacements', false),
    ('inventory.adjust', 'inventory', 'adjust', 'Ajuster stocks', 'Corrections d\'inventaire', true),
    ('inventory.manage', 'inventory', 'manage', 'Gérer articles', 'Créer/modifier articles', false),
    ('inventory.sell', 'inventory', 'sell', 'Mettre en vente', 'Publier articles à la vente', false),
    ('inventory.purchase', 'inventory', 'purchase', 'Commandes d\'achat', 'Créer/gérer PO', false),
    ('inventory.approve_po', 'inventory', 'approve', 'Approuver PO', 'Validation commandes d\'achat', true),
    ('inventory.reports', 'inventory', 'reports', 'Rapports inventaire', 'Exports et analyses', false)
ON CONFLICT (key) DO NOTHING;

-- Configuration par défaut
-- (Sera insérée lors de la création du premier client)

-- ===================================================================
-- COMMENTAIRES DE DOCUMENTATION
-- ===================================================================

COMMENT ON TABLE inv_items IS 'Articles du catalogue inventaire avec paramètres de gestion';
COMMENT ON TABLE inv_item_instances IS 'Instances individuelles pour traçabilité unitaire (série/lot)';
COMMENT ON TABLE inv_locations IS 'Emplacements de stockage hiérarchiques';
COMMENT ON TABLE inv_stock IS 'Stock agrégé par article/emplacement avec quantités réservées';
COMMENT ON TABLE inv_transactions IS 'Audit trail complet de tous les mouvements de stock';
COMMENT ON TABLE inv_vendors IS 'Fournisseurs avec conditions commerciales';
COMMENT ON TABLE inv_purchase_orders IS 'Commandes d\'achat avec workflow d\'approbation';
COMMENT ON TABLE inv_sellable_items IS 'Articles mis en vente (interne/public) avec Stripe';
COMMENT ON TABLE inv_shop_orders IS 'Commandes de vente avec paiement et expédition';

COMMENT ON COLUMN inv_items.serializable IS 'Si true, génère des instances individuelles traçables';
COMMENT ON COLUMN inv_items.dimensions IS 'Format JSON: {L:mm, l:mm, H:mm, poids:g}';
COMMENT ON COLUMN inv_item_instances.qr_payload IS 'Données encodées dans le QR code';
COMMENT ON COLUMN inv_stock.available IS 'Quantité disponible calculée (on_hand - reserved)';
COMMENT ON COLUMN inv_transactions.delta IS 'Variation de stock: positif=entrée, négatif=sortie';

-- Message de succès
DO $$
BEGIN
    RAISE NOTICE '✅ C-Secur360 Inventory System installed successfully!';
    RAISE NOTICE '📦 Tables created: articles, instances, locations, stock, transactions';
    RAISE NOTICE '🏪 E-commerce: sellable items, orders with Stripe integration';  
    RAISE NOTICE '🔄 Purchase Orders: vendors, PO workflow, auto-reorder';
    RAISE NOTICE '📱 QR-first mobile: scan, track, manage from any device';
    RAISE NOTICE '📊 Ready for: stock management, sales, procurement, reporting';
END $$;