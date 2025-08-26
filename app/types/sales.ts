// ===================================================================
// C-Secur360 Types Système de Vente avec Stripe
// ===================================================================

export interface SaleItem {
  id: string;
  client_id: string;
  inventory_item_id: string;
  
  // Données article
  name: string;
  sku?: string;
  description?: string;
  
  // Prix et vente
  unit_price: number;
  currency: 'CAD' | 'USD';
  tax_rate?: number;
  discount_rate?: number;
  
  // Stock et disponibilité
  available_quantity: number;
  min_order_qty: number;
  max_order_qty?: number;
  
  // Catégorie et organisation
  category?: string;
  tags: string[];
  images: string[];
  
  // Statut
  is_active: boolean;
  is_public: boolean; // Visible dans boutique publique
  requires_approval: boolean; // Nécessite approbation avant vente
  
  // Métadonnées
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface SaleOrder {
  id: string;
  order_number: string;
  client_id: string;
  
  // Client/acheteur
  buyer_type: 'internal' | 'external' | 'public';
  buyer_id?: string; // ID utilisateur si interne
  buyer_info: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    shipping_address?: Address;
    billing_address?: Address;
  };
  
  // Articles commandés
  items: SaleOrderItem[];
  
  // Prix et taxes
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  currency: 'CAD' | 'USD';
  
  // Statut commande
  status: 'draft' | 'pending_approval' | 'approved' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';
  
  // Stripe intégration
  stripe_payment_intent_id?: string;
  stripe_payment_method?: string;
  payment_date?: string;
  
  // Workflow
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  
  // Expédition
  tracking_number?: string;
  shipping_method?: string;
  shipped_at?: string;
  delivered_at?: string;
  
  // Notes et métadonnées
  internal_notes?: string;
  customer_notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface SaleOrderItem {
  id: string;
  order_id: string;
  sale_item_id: string;
  inventory_item_id: string;
  
  // Détails article
  name: string;
  sku?: string;
  description?: string;
  
  // Quantité et prix
  quantity: number;
  unit_price: number;
  discount_rate: number;
  tax_rate: number;
  line_total: number;
  
  // Traçabilité inventaire
  reserved_stock?: number;
  allocated_instances?: string[]; // IDs des instances spécifiques si sérialisé
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface SaleConfiguration {
  id: string;
  client_id: string;
  
  // Stripe configuration
  stripe_public_key?: string;
  stripe_secret_key?: string; // Chiffré côté serveur
  stripe_webhook_secret?: string;
  
  // Taxes
  default_tax_rate: number;
  tax_included: boolean;
  
  // Politiques
  require_approval_threshold?: number; // Montant au-dessus duquel approbation requise
  auto_approve_internal: boolean;
  allow_public_sales: boolean;
  
  // Expédition
  shipping_methods: ShippingMethod[];
  free_shipping_threshold?: number;
  
  // Notifications
  notification_emails: string[];
  send_order_confirmations: boolean;
  
  // Boutique publique
  public_store_enabled: boolean;
  store_name?: string;
  store_description?: string;
  store_logo?: string;
  store_theme: 'light' | 'dark' | 'corporate';
  
  created_at: string;
  updated_at: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  cost: number;
  estimated_days: number;
  is_active: boolean;
}

export interface PaymentMethod {
  type: 'stripe' | 'invoice' | 'internal_transfer';
  stripe_payment_method_id?: string;
  details?: Record<string, any>;
}

// Types pour les APIs
export interface CreateSaleOrderRequest {
  buyer_type: 'internal' | 'external' | 'public';
  buyer_info: SaleOrder['buyer_info'];
  items: {
    sale_item_id: string;
    quantity: number;
  }[];
  shipping_method_id?: string;
  payment_method: PaymentMethod;
  customer_notes?: string;
}

export interface SaleAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  top_selling_items: {
    item_id: string;
    name: string;
    quantity_sold: number;
    revenue: number;
  }[];
  revenue_by_category: {
    category: string;
    revenue: number;
    percentage: number;
  }[];
  buyer_segments: {
    internal: number;
    external: number;
    public: number;
  };
}

export interface StockReservation {
  id: string;
  order_id: string;
  item_id: string;
  instance_ids?: string[]; // Pour items sérialisés
  quantity: number;
  reserved_at: string;
  expires_at: string;
  status: 'active' | 'fulfilled' | 'expired' | 'cancelled';
}

// Types pour Stripe webhooks
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface StripePaymentIntentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  metadata: {
    order_id: string;
    client_id: string;
  };
}

// Constantes
export const SALE_ORDER_STATUSES = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIAL: 'partial'
} as const;

export const BUYER_TYPES = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
  PUBLIC: 'public'
} as const;