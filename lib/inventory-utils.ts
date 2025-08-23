// ===================================================================
// C-Secur360 Utilitaires Inventaire QR-First Mobile
// ===================================================================

import { createClient } from '@/utils/supabase/client';
import type { 
  InventoryItem, 
  InventoryInstance, 
  InventoryTransaction,
  QRPayload,
  QRScanResult,
  StockMovementRequest,
  ItemCreationRequest,
  LabelPrintRequest
} from '@/app/types/inventory';

const supabase = createClient();

// ===================================================================
// QR CODE UTILITIES
// ===================================================================

/**
 * Génère un payload QR pour un article ou une instance
 */
export function generateQRPayload(
  type: 'item' | 'instance',
  id: string,
  code?: string
): QRPayload {
  return {
    type,
    id,
    code: code || id,
    timestamp: Math.floor(Date.now() / 1000)
  };
}

/**
 * Parse un QR code scanné et valide le payload
 */
export function parseQRCode(qrText: string): QRScanResult {
  try {
    const payload = JSON.parse(qrText) as QRPayload;
    
    // Validation du payload
    if (!payload.type || !payload.id) {
      return {
        success: false,
        error: 'QR code invalide: format incorrect'
      };
    }
    
    if (!['item', 'instance'].includes(payload.type)) {
      return {
        success: false,
        error: 'QR code invalide: type non reconnu'
      };
    }
    
    // Vérification de l'âge du QR (optionnel)
    const age = Date.now() / 1000 - (payload.timestamp || 0);
    if (age > 86400 * 365) { // Plus d'un an
      console.warn('QR code ancien détecté:', age / 86400, 'jours');
    }
    
    return {
      success: true,
      payload
    };
  } catch (error) {
    return {
      success: false,
      error: 'QR code invalide: impossible de décoder'
    };
  }
}

/**
 * Génère une chaîne QR encodée pour impression
 */
export function encodeQRPayload(payload: QRPayload): string {
  return JSON.stringify(payload);
}

// ===================================================================
// STOCK MANAGEMENT
// ===================================================================

/**
 * Obtient le stock disponible total d'un article
 */
export async function getAvailableStock(itemId: string): Promise<number> {
  const { data, error } = await supabase
    .rpc('get_available_stock', { p_item_id: itemId });
    
  if (error) {
    console.error('Erreur obtention stock:', error);
    return 0;
  }
  
  return data || 0;
}

/**
 * Vérifie si un article nécessite un réapprovisionnement
 */
export async function needsReorder(itemId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('needs_reorder', { p_item_id: itemId });
    
  if (error) {
    console.error('Erreur vérification réapprovisionnement:', error);
    return false;
  }
  
  return data || false;
}

/**
 * Effectue un mouvement de stock
 */
export async function recordStockMovement(
  request: StockMovementRequest
): Promise<{ success: boolean; error?: string; transaction?: InventoryTransaction }> {
  try {
    // Upload de la photo si fournie
    let photoUrl: string | undefined;
    if (request.photo) {
      const photoPath = `inventory/photos/${Date.now()}-${request.photo.name}`;
      const { data: photoData, error: photoError } = await supabase.storage
        .from('inventory-photos')
        .upload(photoPath, request.photo);
        
      if (photoError) {
        console.error('Erreur upload photo:', photoError);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('inventory-photos')
          .getPublicUrl(photoPath);
        photoUrl = publicUrl;
      }
    }
    
    // Création de la transaction
    const { data, error } = await supabase
      .from('inv_transactions')
      .insert({
        client_id: request.item_id, // TODO: Obtenir le client_id depuis le contexte
        item_id: request.item_id,
        instance_id: request.instance_id,
        location_id: request.location_id,
        location_from_id: request.location_from_id,
        delta: request.delta,
        reason: request.reason,
        project_id: request.project_id,
        task_id: request.task_id,
        billing_code: request.billing_code,
        note: request.note,
        photo_url: photoUrl,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
      
    if (error) {
      return {
        success: false,
        error: `Erreur enregistrement mouvement: ${error.message}`
      };
    }
    
    return {
      success: true,
      transaction: data
    };
  } catch (error) {
    return {
      success: false,
      error: `Erreur inattendue: ${error}`
    };
  }
}

/**
 * Transfère du stock entre emplacements
 */
export async function transferStock(
  itemId: string,
  fromLocationId: string,
  toLocationId: string,
  quantity: number,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  return await recordStockMovement({
    item_id: itemId,
    location_id: toLocationId,
    location_from_id: fromLocationId,
    delta: quantity,
    reason: 'transfer',
    note
  });
}

// ===================================================================
// ITEM & INSTANCE MANAGEMENT  
// ===================================================================

/**
 * Crée un nouvel article avec instances optionnelles
 */
export async function createInventoryItem(
  request: ItemCreationRequest
): Promise<{ success: boolean; error?: string; item?: InventoryItem }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { success: false, error: 'Utilisateur non authentifié' };
    }
    
    // TODO: Obtenir client_id depuis le contexte utilisateur
    const clientId = userData.user.user_metadata?.tenant_id;
    if (!clientId) {
      return { success: false, error: 'Client non identifié' };
    }
    
    // Upload des images
    const imageUrls: string[] = [];
    if (request.images?.length) {
      for (const image of request.images) {
        const imagePath = `inventory/items/${Date.now()}-${image.name}`;
        const { data: imageData, error: imageError } = await supabase.storage
          .from('inventory-images')
          .upload(imagePath, image);
          
        if (!imageError) {
          const { data: { publicUrl } } = supabase.storage
            .from('inventory-images')
            .getPublicUrl(imagePath);
          imageUrls.push(publicUrl);
        }
      }
    }
    
    // Création de l'article
    const { data: item, error: itemError } = await supabase
      .from('inv_items')
      .insert({
        client_id: clientId,
        name: request.name,
        sku: request.sku,
        uom: request.uom,
        description: request.description,
        category: request.category,
        min_qty: request.min_qty,
        max_qty: request.max_qty,
        reorder_point: request.reorder_point,
        safety_stock: request.safety_stock,
        dimensions: request.dimensions,
        images: imageUrls,
        serializable: request.serializable,
        sellable: request.sellable,
        default_location_id: request.default_location_id
      })
      .select()
      .single();
      
    if (itemError) {
      return {
        success: false,
        error: `Erreur création article: ${itemError.message}`
      };
    }
    
    // Génération des instances si serializable
    if (request.serializable && request.instance_count && request.instance_count > 0) {
      const instances = [];
      const prefix = request.instance_prefix || item.name.toLowerCase().replace(/\s+/g, '');
      
      for (let i = 1; i <= request.instance_count; i++) {
        const instanceCode = `${prefix}-${i}`;
        const qrPayload = generateQRPayload('instance', item.id, instanceCode);
        
        instances.push({
          item_id: item.id,
          instance_code: instanceCode,
          qr_payload: qrPayload,
          location_id: request.default_location_id,
          status: 'in_stock'
        });
      }
      
      const { error: instancesError } = await supabase
        .from('inv_item_instances')
        .insert(instances);
        
      if (instancesError) {
        console.error('Erreur création instances:', instancesError);
        // Ne pas faire échouer la création de l'article
      }
    }
    
    // Stock initial si spécifié
    if (request.initial_stock && request.initial_stock > 0 && request.default_location_id) {
      await recordStockMovement({
        item_id: item.id,
        location_id: request.default_location_id,
        delta: request.initial_stock,
        reason: 'receipt',
        note: 'Stock initial'
      });
    }
    
    return {
      success: true,
      item
    };
  } catch (error) {
    return {
      success: false,
      error: `Erreur inattendue: ${error}`
    };
  }
}

/**
 * Obtient les détails d'un article par QR scan
 */
export async function getItemByQR(payload: QRPayload): Promise<{
  success: boolean;
  error?: string;
  item?: InventoryItem;
  instance?: InventoryInstance;
  stock?: number;
}> {
  try {
    if (payload.type === 'item') {
      // Charger l'article
      const { data: item, error: itemError } = await supabase
        .from('inv_items')
        .select(`
          *,
          default_location:inv_locations(*)
        `)
        .eq('id', payload.id)
        .single();
        
      if (itemError || !item) {
        return {
          success: false,
          error: 'Article non trouvé'
        };
      }
      
      // Obtenir le stock total
      const stock = await getAvailableStock(item.id);
      
      return {
        success: true,
        item,
        stock
      };
    } else {
      // Charger l'instance
      const { data: instance, error: instanceError } = await supabase
        .from('inv_item_instances')
        .select(`
          *,
          item:inv_items(*),
          location:inv_locations(*)
        `)
        .eq('id', payload.id)
        .single();
        
      if (instanceError || !instance) {
        return {
          success: false,
          error: 'Instance non trouvée'
        };
      }
      
      return {
        success: true,
        item: instance.item,
        instance
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Erreur récupération données: ${error}`
    };
  }
}

// ===================================================================
// LABEL PRINTING
// ===================================================================

/**
 * Génère un PDF d'étiquettes QR
 */
export async function generateLabelPDF(request: LabelPrintRequest): Promise<{
  success: boolean;
  error?: string;
  pdfUrl?: string;
}> {
  try {
    // Cette fonction nécessiterait une implémentation complète avec pdf-lib
    // Pour l'instant, retourner une URL placeholder
    
    const response = await fetch('/api/inventory/labels/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `Erreur génération PDF: ${error}`
      };
    }
    
    const blob = await response.blob();
    const pdfUrl = URL.createObjectURL(blob);
    
    return {
      success: true,
      pdfUrl
    };
  } catch (error) {
    return {
      success: false,
      error: `Erreur génération étiquettes: ${error}`
    };
  }
}

// ===================================================================
// SEARCH & FILTERS
// ===================================================================

/**
 * Recherche d'articles avec filtres
 */
export async function searchInventoryItems(
  clientId: string,
  filters: {
    search?: string;
    category?: string;
    location_id?: string;
    low_stock?: boolean;
    sellable?: boolean;
    active?: boolean;
  }
): Promise<InventoryItem[]> {
  let query = supabase
    .from('inv_items')
    .select(`
      *,
      default_location:inv_locations(*)
    `)
    .eq('client_id', clientId);
    
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
  }
  
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.sellable !== undefined) {
    query = query.eq('sellable', filters.sellable);
  }
  
  if (filters.active !== undefined) {
    query = query.eq('active', filters.active);
  }
  
  const { data, error } = await query.order('name');
  
  if (error) {
    console.error('Erreur recherche articles:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Obtient l'historique des transactions d'un article
 */
export async function getItemTransactionHistory(
  itemId: string,
  limit: number = 50
): Promise<InventoryTransaction[]> {
  const { data, error } = await supabase
    .from('inv_transactions')
    .select(`
      *,
      location:inv_locations(name),
      location_from:inv_locations!inv_transactions_location_from_id_fkey(name),
      user:users(name, email)
    `)
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Erreur historique transactions:', error);
    return [];
  }
  
  return data || [];
}

// ===================================================================
// VALIDATION UTILITIES
// ===================================================================

/**
 * Valide un SKU unique pour un client
 */
export async function validateUniqueSKU(
  clientId: string, 
  sku: string, 
  excludeItemId?: string
): Promise<boolean> {
  let query = supabase
    .from('inv_items')
    .select('id')
    .eq('client_id', clientId)
    .eq('sku', sku);
    
  if (excludeItemId) {
    query = query.neq('id', excludeItemId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Erreur validation SKU:', error);
    return false;
  }
  
  return !data || data.length === 0;
}

/**
 * Valide qu'un projet est requis pour les sorties
 */
export async function validateProjectRequired(
  clientId: string,
  reason: InventoryTransaction['reason']
): Promise<boolean> {
  if (reason !== 'issue') return true;
  
  const { data, error } = await supabase
    .from('inv_settings')
    .select('require_project_on_issue')
    .eq('client_id', clientId)
    .single();
    
  if (error) {
    console.error('Erreur validation projet:', error);
    return false;
  }
  
  return !data?.require_project_on_issue;
}

// ===================================================================
// CONSTANTS
// ===================================================================

export const QR_SCAN_CONFIG = {
  constraints: {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'environment' // Caméra arrière sur mobile
    }
  },
  decodeFormats: ['QR_CODE'],
  tryPlayingVideo: true
};

export const STORAGE_BUCKETS = {
  INVENTORY_IMAGES: 'inventory-images',
  INVENTORY_PHOTOS: 'inventory-photos',
  LABELS: 'inventory-labels'
};

export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  PHOTO: 10 * 1024 * 1024 // 10MB
};