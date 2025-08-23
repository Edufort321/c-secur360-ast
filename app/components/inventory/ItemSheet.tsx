'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  Hash, 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft,
  Settings,
  ShoppingCart,
  Printer,
  Camera,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  X,
  Edit
} from 'lucide-react';
import type { 
  InventoryItem, 
  InventoryInstance, 
  QuickAction,
  QRPayload
} from '@/app/types/inventory';
import { 
  getItemByQR,
  getAvailableStock,
  needsReorder,
  recordStockMovement
} from '@/lib/inventory-utils';
import StockMovementModal from './StockMovementModal';

interface ItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  qrPayload?: QRPayload;
  itemId?: string;
  instanceId?: string;
}

export default function ItemSheet({
  isOpen,
  onClose,
  qrPayload,
  itemId,
  instanceId
}: ItemSheetProps) {
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [instance, setInstance] = useState<InventoryInstance | null>(null);
  const [stock, setStock] = useState<number>(0);
  const [needsRestock, setNeedsRestock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<'issue' | 'receive' | 'adjust' | 'transfer'>('issue');

  useEffect(() => {
    if (isOpen && (qrPayload || itemId)) {
      loadItemData();
    }
  }, [isOpen, qrPayload, itemId, instanceId]);

  const loadItemData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (qrPayload) {
        result = await getItemByQR(qrPayload);
      } else if (itemId) {
        // Charger par ID direct
        result = await getItemByQR({ 
          type: 'item', 
          id: itemId, 
          code: itemId,
          timestamp: Date.now() / 1000
        });
      } else {
        throw new Error('Aucune donnée à charger');
      }
      
      if (!result.success) {
        setError(result.error || 'Erreur de chargement');
        return;
      }
      
      setItem(result.item || null);
      setInstance(result.instance || null);
      setStock(result.stock || 0);
      
      // Vérifier si réapprovisionnement nécessaire
      if (result.item) {
        const reorderNeeded = await needsReorder(result.item.id);
        setNeedsRestock(reorderNeeded);
      }
    } catch (err) {
      console.error('Erreur chargement article:', err);
      setError('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'issue':
        setMovementType('issue');
        setShowMovementModal(true);
        break;
      case 'receive':
        setMovementType('receive');
        setShowMovementModal(true);
        break;
      case 'adjust':
        setMovementType('adjust');
        setShowMovementModal(true);
        break;
      case 'transfer':
        setMovementType('transfer');
        setShowMovementModal(true);
        break;
      case 'sell':
        // TODO: Ouvrir modal de mise en vente
        console.log('Mettre en vente');
        break;
      case 'print':
        // TODO: Ajouter au panier d'impression
        console.log('Imprimer étiquette');
        break;
      default:
        break;
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'issue',
      label: 'Sortie (-)',
      icon: 'minus',
      color: 'bg-red-500 hover:bg-red-600',
      action: () => handleQuickAction('issue')
    },
    {
      id: 'receive',
      label: 'Entrée (+)',
      icon: 'plus',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => handleQuickAction('receive')
    },
    {
      id: 'transfer',
      label: 'Transfert',
      icon: 'arrow-right-left',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => handleQuickAction('transfer')
    },
    {
      id: 'adjust',
      label: 'Ajustement',
      icon: 'settings',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      action: () => handleQuickAction('adjust')
    }
  ];

  const sellAction: QuickAction = {
    id: 'sell',
    label: 'Mettre en vente',
    icon: 'shopping-cart',
    color: 'bg-purple-500 hover:bg-purple-600',
    action: () => handleQuickAction('sell')
  };

  const printAction: QuickAction = {
    id: 'print',
    label: 'Imprimer QR',
    icon: 'printer',
    color: 'bg-gray-500 hover:bg-gray-600',
    action: () => handleQuickAction('print')
  };

  const getIcon = (iconName: string) => {
    const icons = {
      'minus': <Minus className="w-5 h-5" />,
      'plus': <Plus className="w-5 h-5" />,
      'arrow-right-left': <ArrowRightLeft className="w-5 h-5" />,
      'settings': <Settings className="w-5 h-5" />,
      'shopping-cart': <ShoppingCart className="w-5 h-5" />,
      'printer': <Printer className="w-5 h-5" />
    };
    return icons[iconName as keyof typeof icons] || null;
  };

  const handleMovementComplete = () => {
    setShowMovementModal(false);
    loadItemData(); // Recharger les données
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
        
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[90vh] overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Erreur</h3>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Fermer
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {instance ? <Hash className="w-5 h-5 text-blue-600" /> : <Package className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{item?.name}</h2>
                    <p className="text-sm text-gray-500">
                      {instance ? `Instance ${instance.instance_code}` : `Article ${item?.sku || 'sans SKU'}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Alert */}
              {needsRestock && (
                <div className="mx-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 text-sm font-medium">
                    Réapprovisionnement recommandé (seuil atteint)
                  </span>
                </div>
              )}

              {/* Main Info */}
              <div className="p-4 space-y-6">
                {/* Stock Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Stock disponible</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {instance ? (instance.status === 'in_stock' ? '1' : '0') : stock}
                    </div>
                    <div className="text-sm text-gray-500">{item?.uom || 'UN'}</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Emplacement</div>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">
                        {instance?.location?.name || item?.default_location?.name || 'Non défini'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions rapides</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={action.action}
                        className={`${action.color} text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
                      >
                        {getIcon(action.icon)}
                        {action.label}
                      </button>
                    ))}
                  </div>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {item?.sellable && (
                      <button
                        onClick={sellAction.action}
                        className={`${sellAction.color} text-white p-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
                      >
                        {getIcon(sellAction.icon)}
                        {sellAction.label}
                      </button>
                    )}
                    <button
                      onClick={printAction.action}
                      className={`${printAction.color} text-white p-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
                    >
                      {getIcon(printAction.icon)}
                      {printAction.label}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Détails</h3>
                  <div className="space-y-2 text-sm">
                    {item?.sku && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">SKU:</span>
                        <span className="font-medium">{item.sku}</span>
                      </div>
                    )}
                    
                    {item?.category && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Catégorie:</span>
                        <span className="font-medium">{item.category}</span>
                      </div>
                    )}
                    
                    {item?.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="font-medium">
                          {item.dimensions.L}×{item.dimensions.l}×{item.dimensions.H} mm
                        </span>
                      </div>
                    )}
                    
                    {item?.dimensions?.poids && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Poids:</span>
                        <span className="font-medium">{item.dimensions.poids} g</span>
                      </div>
                    )}

                    {/* Instance specific */}
                    {instance && (
                      <>
                        {instance.serial_number && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">N° Série:</span>
                            <span className="font-medium">{instance.serial_number}</span>
                          </div>
                        )}
                        
                        {instance.batch_number && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">N° Lot:</span>
                            <span className="font-medium">{instance.batch_number}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Statut:</span>
                          <span className={`font-medium ${
                            instance.status === 'in_stock' ? 'text-green-600' :
                            instance.status === 'sold' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`}>
                            {instance.status === 'in_stock' ? 'En stock' :
                             instance.status === 'sold' ? 'Vendu' :
                             instance.status === 'reserved' ? 'Réservé' : instance.status}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Stock thresholds */}
                    {!instance && (
                      <>
                        {item?.reorder_point && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Seuil réappro:</span>
                            <span className="font-medium">{item.reorder_point} {item.uom}</span>
                          </div>
                        )}
                        
                        {item?.safety_stock && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stock sécurité:</span>
                            <span className="font-medium">{item.safety_stock} {item.uom}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {item?.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                )}

                {/* Images */}
                {item?.images && item.images.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Photos</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {item.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${item.name} ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Movement Modal */}
      <StockMovementModal
        isOpen={showMovementModal}
        onClose={() => setShowMovementModal(false)}
        onComplete={handleMovementComplete}
        item={item}
        instance={instance}
        movementType={movementType}
      />
    </>
  );
}