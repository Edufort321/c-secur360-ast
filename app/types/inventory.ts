// ===================================================================
// C-Secur360 Types pour Système d'Inventaire QR-First
// ===================================================================

export interface InventoryItem {
  id: string;
  client_id: string;
  name: string;
  sku?: string;
  uom: string; // Unité de mesure: 'UN', 'KG', 'L', 'M', etc.
  
  // Seuils de stock
  min_qty: number;
  max_qty?: number;
  reorder_point?: number;
  safety_stock: number;
  
  // Localisation
  default_location_id?: string;
  
  // Propriétés physiques
  dimensions?: {
    L?: number; // Longueur en mm
    l?: number; // Largeur en mm  
    H?: number; // Hauteur en mm
    poids?: number; // Poids en grammes
  };
  images?: string[]; // URLs des photos
  
  // Comportement
  serializable: boolean;
  sellable: boolean;
  active: boolean;
  
  // Métadonnées
  description?: string;
  category?: string;
  tags?: string[];
  
  created_at: string;
  updated_at: string;
}

export interface InventoryInstance {
  id: string;
  item_id: string;
  instance_code: string; // ex: "boite1-1"
  serial_number?: string;
  batch_number?: string;
  
  // QR payload
  qr_payload: QRPayload;
  
  // État
  location_id?: string;
  status: 'in_stock' | 'reserved' | 'sold' | 'lost' | 'retired';
  
  // Dates
  manufacture_date?: string;
  expiry_date?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations (chargées dynamiquement)
  item?: InventoryItem;
  location?: InventoryLocation;
}

export interface QRPayload {
  type: 'item' | 'instance';
  id: string;
  code: string;
  timestamp: number;
}

export interface InventoryLocation {
  id: string;
  client_id: string;
  site_id: string;
  name: string;
  code?: string;
  
  // Hiérarchie
  parent_location_id?: string;
  location_type: 'storage' | 'shipping' | 'receiving' | 'production';
  
  // Propriétés
  capacity?: number;
  temperature_controlled: boolean;
  outdoor: boolean;
  
  description?: string;
  created_at: string;
  
  // Relations
  children?: InventoryLocation[];
  parent?: InventoryLocation;
}

export interface InventoryStock {
  item_id: string;
  location_id: string;
  on_hand: number;
  reserved: number;
  available: number; // Calculé: on_hand - reserved
  last_counted_at?: string;
  last_updated_at: string;
  
  // Relations
  item?: InventoryItem;
  location?: InventoryLocation;
}

export interface InventoryTransaction {
  id: string;
  client_id: string;
  site_id?: string;
  
  // Article
  item_id: string;
  instance_id?: string;
  
  // Mouvement  
  location_id?: string;
  location_from_id?: string; // Pour transferts
  delta: number; // +/- quantité
  
  // Raison
  reason: 'receipt' | 'issue' | 'adjust' | 'transfer' | 'sale' | 'return';
  
  // Contexte
  project_id?: string;
  task_id?: string;
  billing_code?: string;
  
  // Traçabilité
  user_id?: string;
  photo_url?: string;
  note?: string;
  
  // Référence externe
  reference_type?: string; // 'po', 'so', 'wo'
  reference_id?: string;
  
  created_at: string;
  
  // Relations
  item?: InventoryItem;
  instance?: InventoryInstance;
  location?: InventoryLocation;
  location_from?: InventoryLocation;
  user?: { name: string; email: string };
}

export interface Vendor {
  id: string;
  client_id: string;
  name: string;
  code?: string;
  
  // Contact
  email?: string;
  phone?: string;
  website?: string;
  
  // Adresse
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country?: string;
  };
  
  // Conditions
  default_terms?: string;
  default_lead_time_days: number;
  default_currency: string;
  
  active: boolean;
  preferred: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface VendorItem {
  id: string;
  vendor_id: string;
  item_id: string;
  vendor_sku?: string;
  vendor_name?: string;
  
  // Prix
  price?: number;
  currency: string;
  min_order_qty: number;
  lead_time_days?: number;
  
  preferred: boolean;
  last_price_update: string;
  created_at: string;
  
  // Relations
  vendor?: Vendor;
  item?: InventoryItem;
}

export interface PurchaseOrder {
  id: string;
  client_id: string;
  po_number: string;
  vendor_id: string;
  
  status: 'draft' | 'pending_approval' | 'approved' | 'ordered' | 
         'partially_received' | 'received' | 'cancelled';
  
  // Montants
  subtotal: number;
  tax_amount: number;
  total: number;
  currency: string;
  
  // Dates
  order_date?: string;
  expected_date?: string;
  received_date?: string;
  
  // Approbation
  requested_by?: string;
  approved_by?: string;
  approved_at?: string;
  
  notes?: string;
  terms?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  vendor?: Vendor;
  lines?: PurchaseOrderLine[];
}

export interface PurchaseOrderLine {
  id: string;
  po_id: string;
  item_id: string;
  
  // Quantités
  qty_ordered: number;
  qty_received: number;
  qty_remaining: number; // Calculé
  
  // Prix
  unit_price: number;
  line_total: number; // Calculé
  
  // Contexte
  project_id?: string;
  location_id?: string;
  
  created_at: string;
  
  // Relations
  item?: InventoryItem;
  location?: InventoryLocation;
}

export interface SellableItem {
  id: string;
  client_id: string;
  item_id: string;
  
  // Vente
  title: string;
  description?: string;
  image_url?: string;
  
  // Prix
  price: number;
  currency: string;
  taxable: boolean;
  
  // Visibilité
  publish: boolean;
  public_slug?: string;
  internal_only: boolean;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  item?: InventoryItem;
}

export interface ShopOrder {
  id: string;
  order_number: string;
  
  // Vendeur/Acheteur
  seller_client_id: string;
  buyer_client_id?: string;
  buyer_email?: string;
  buyer_info?: {
    name?: string;
    phone?: string;
    company?: string;
  };
  
  status: 'pending' | 'paid' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  
  // Montants
  subtotal: number;
  taxes: number;
  shipping: number;
  total: number;
  currency: string;
  
  // Paiement Stripe
  stripe_payment_intent?: string;
  stripe_session_id?: string;
  
  // Commission
  commission_rate: number;
  commission_amount: number;
  
  // Expédition
  shipping_address?: {
    name: string;
    street: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  };
  tracking_number?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  lines?: ShopOrderLine[];
}

export interface ShopOrderLine {
  id: string;
  order_id: string;
  sellable_item_id: string;
  item_id: string;
  instance_id?: string;
  
  qty: number;
  unit_price: number;
  line_total: number; // Calculé
  
  created_at: string;
  
  // Relations
  sellable_item?: SellableItem;
  item?: InventoryItem;
  instance?: InventoryInstance;
}

export interface InventorySettings {
  client_id: string;
  
  // Règles
  require_project_on_issue: boolean;
  auto_create_po: boolean;
  po_approval_required: boolean;
  
  // Numérotation
  po_number_prefix: string;
  po_number_counter: number;
  order_number_prefix: string;
  order_number_counter: number;
  
  // Seuils par défaut
  default_reorder_point: number;
  default_safety_stock: number;
  
  // QR codes
  qr_base_url?: string;
  label_template: string;
  
  created_at: string;
  updated_at: string;
}

// ===================================================================
// TYPES POUR L'UI MOBILE
// ===================================================================

export interface QRScanResult {
  success: boolean;
  payload?: QRPayload;
  error?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: () => void;
}

export interface StockMovementRequest {
  item_id: string;
  instance_id?: string;
  location_id?: string;
  location_from_id?: string; // Pour transferts
  delta: number;
  reason: InventoryTransaction['reason'];
  project_id?: string;
  task_id?: string;
  billing_code?: string;
  note?: string;
  photo?: File;
}

export interface ItemCreationRequest {
  name: string;
  sku?: string;
  uom: string;
  description?: string;
  category?: string;
  
  // Seuils
  min_qty: number;
  max_qty?: number;
  reorder_point?: number;
  safety_stock: number;
  
  // Propriétés
  dimensions?: InventoryItem['dimensions'];
  images?: File[];
  
  // Comportement
  serializable: boolean;
  sellable: boolean;
  
  // Si serializable, nombre d'instances à générer
  instance_count?: number;
  instance_prefix?: string; // ex: "boite1"
  
  // Localisation initiale
  default_location_id?: string;
  initial_stock?: number;
}

export interface LabelPrintRequest {
  items: Array<{
    id: string;
    type: 'item' | 'instance';
    name: string;
    sku?: string;
    qr_payload: QRPayload;
    location?: string;
  }>;
  template: 'avery_5160' | 'avery_5167' | 'a4_grid' | 'custom';
  options: {
    include_name: boolean;
    include_sku: boolean;
    include_location: boolean;
    include_logo: boolean;
    font_size: 'small' | 'medium' | 'large';
  };
}

// ===================================================================
// CONSTANTES & UTILITAIRES
// ===================================================================

export const INVENTORY_REASONS = {
  receipt: 'Réception',
  issue: 'Sortie',
  adjust: 'Ajustement',
  transfer: 'Transfert',
  sale: 'Vente',
  return: 'Retour'
} as const;

export const INSTANCE_STATUSES = {
  in_stock: 'En stock',
  reserved: 'Réservé',
  sold: 'Vendu',
  lost: 'Perdu',
  retired: 'Retiré'
} as const;

export const PO_STATUSES = {
  draft: 'Brouillon',
  pending_approval: 'En attente d\'approbation',
  approved: 'Approuvé',
  ordered: 'Commandé',
  partially_received: 'Partiellement reçu',
  received: 'Reçu',
  cancelled: 'Annulé'
} as const;

export const ORDER_STATUSES = {
  pending: 'En attente',
  paid: 'Payé',
  fulfilled: 'Traité',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
  refunded: 'Remboursé'
} as const;

export const UNITS_OF_MEASURE = [
  { value: 'UN', label: 'Unité' },
  { value: 'KG', label: 'Kilogramme' },
  { value: 'G', label: 'Gramme' },
  { value: 'L', label: 'Litre' },
  { value: 'ML', label: 'Millilitre' },
  { value: 'M', label: 'Mètre' },
  { value: 'CM', label: 'Centimètre' },
  { value: 'M2', label: 'Mètre carré' },
  { value: 'M3', label: 'Mètre cube' },
  { value: 'HR', label: 'Heure' },
  { value: 'LOT', label: 'Lot' },
  { value: 'BOITE', label: 'Boîte' }
];

export const LABEL_TEMPLATES = [
  { value: 'avery_5160', label: 'Avery 5160 (30 étiquettes)' },
  { value: 'avery_5167', label: 'Avery 5167 (80 étiquettes)' },
  { value: 'a4_grid', label: 'A4 Grille 4x6' },
  { value: 'custom', label: 'Format personnalisé' }
];

export const INVENTORY_PERMISSIONS = [
  'inventory.view',
  'inventory.scan',
  'inventory.receive',
  'inventory.issue', 
  'inventory.transfer',
  'inventory.adjust',
  'inventory.manage',
  'inventory.sell',
  'inventory.purchase',
  'inventory.approve_po',
  'inventory.reports'
] as const;

export type InventoryPermission = typeof INVENTORY_PERMISSIONS[number];