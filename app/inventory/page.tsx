'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Package,
  Plus,
  Search,
  Filter,
  Truck,
  ShoppingCart,
  BarChart3,
  Settings,
  MapPin,
  AlertTriangle,
  Scan
} from 'lucide-react';
import QRScanner, { useQRScanner } from '@/app/components/inventory/QRScanner';
import ItemSheet from '@/app/components/inventory/ItemSheet';
import type { InventoryItem, QRScanResult } from '@/app/types/inventory';
import { searchInventoryItems } from '@/lib/inventory-utils';

export default function InventoryPage() {
  // Scanner QR
  const {
    isOpen: scannerOpen,
    openScanner,
    closeScanner,
    handleScan,
    lastResult,
    clearResult
  } = useQRScanner();

  // Item Sheet
  const [itemSheetOpen, setItemSheetOpen] = useState(false);
  const [selectedItemPayload, setSelectedItemPayload] = useState<any>(null);

  // Data state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    lowStock: false,
    sellable: false,
    active: true
  });

  // Stats
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    sellableItems: 0,
    totalValue: 0
  });

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchTerm, filters]);

  useEffect(() => {
    if (lastResult) {
      handleQRScanResult(lastResult);
    }
  }, [lastResult]);

  const loadItems = async () => {
    setLoading(true);
    try {
      // TODO: Obtenir le client_id depuis l'authentification
      const clientId = 'demo-client-id';
      const itemsData = await searchInventoryItems(clientId, { active: true });
      setItems(itemsData);
      updateStats(itemsData);
    } catch (error) {
      console.error('Erreur chargement items:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = items;

    // Search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Low stock filter
    if (filters.lowStock) {
      // TODO: Implémenter la vérification du stock faible
      filtered = filtered.filter(item => false); // Placeholder
    }

    // Sellable filter
    if (filters.sellable) {
      filtered = filtered.filter(item => item.sellable);
    }

    // Active filter
    if (filters.active) {
      filtered = filtered.filter(item => item.active);
    }

    setFilteredItems(filtered);
  };

  const updateStats = (itemsList: InventoryItem[]) => {
    setStats({
      totalItems: itemsList.length,
      lowStockItems: 0, // TODO: Calculer réellement
      sellableItems: itemsList.filter(item => item.sellable).length,
      totalValue: 0 // TODO: Calculer valeur totale
    });
  };

  const handleQRScanResult = (result: QRScanResult) => {
    if (result.success && result.payload) {
      setSelectedItemPayload(result.payload);
      setItemSheetOpen(true);
      clearResult();
    } else {
      // Afficher erreur de scan
      alert(result.error || 'Erreur de scan QR');
      clearResult();
    }
  };

  const quickActions = [
    {
      id: 'scan',
      label: 'Scanner QR',
      icon: <Scan className="w-6 h-6" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: openScanner
    },
    {
      id: 'add-item',
      label: 'Nouvel article',
      icon: <Plus className="w-6 h-6" />,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => console.log('Créer article')
    },
    {
      id: 'purchase-order',
      label: 'Commande',
      icon: <Truck className="w-6 h-6" />,
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => console.log('Nouvelle commande')
    },
    {
      id: 'shop',
      label: 'Boutique',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => console.log('Ouvrir boutique')
    }
  ];

  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Inventaire</h1>
            <button
              onClick={() => console.log('Settings')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Filter className="w-4 h-4" />
            Filtres
          </button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full border rounded px-3 py-1 text-sm"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.lowStock}
                    onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Stock faible</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.sellable}
                    onChange={(e) => setFilters({ ...filters, sellable: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Vendable</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Articles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock faible</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className={`${action.color} text-white p-4 rounded-lg flex items-center gap-3 font-medium transition-colors`}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Articles ({filteredItems.length})
            </h2>
            <button
              onClick={loadItems}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || Object.values(filters).some(Boolean) ? 
                'Aucun article trouvé avec ces critères' : 
                'Aucun article dans l\'inventaire'
              }
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItemPayload({
                      type: 'item',
                      id: item.id,
                      code: item.sku || item.id,
                      timestamp: Date.now() / 1000
                    });
                    setItemSheetOpen(true);
                  }}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        {item.sku && (
                          <span>SKU: {item.sku}</span>
                        )}
                        {item.category && (
                          <span>{item.category}</span>
                        )}
                      </div>
                      
                      {item.default_location_id && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />
                          <span>Emplacement par défaut</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        -
                      </div>
                      <div className="text-xs text-gray-500">{item.uom}</div>
                      
                      {item.sellable && (
                        <div className="mt-1">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner */}
      <QRScanner
        isOpen={scannerOpen}
        onClose={closeScanner}
        onScan={handleScan}
        title="Scanner article QR"
      />

      {/* Item Sheet */}
      <ItemSheet
        isOpen={itemSheetOpen}
        onClose={() => {
          setItemSheetOpen(false);
          setSelectedItemPayload(null);
        }}
        qrPayload={selectedItemPayload}
      />

      {/* Floating Action Button */}
      <button
        onClick={openScanner}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <QrCode className="w-6 h-6" />
      </button>
    </div>
  );
}