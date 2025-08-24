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
  Scan,
  Printer,
  CheckSquare,
  Square,
  ArrowLeft,
  Info
} from 'lucide-react';

// Types pour la démo
interface DemoInventoryItem {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  uom: string;
  sellable: boolean;
  active: boolean;
  default_location_id?: string;
  description?: string;
}

export default function DemoInventoryPage() {
  // État de la démo
  const [items, setItems] = useState<DemoInventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DemoInventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [labelPrintOpen, setLabelPrintOpen] = useState(false);
  
  // Filtres
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
    lowStockItems: 2,
    sellableItems: 0,
    totalValue: 0
  });

  // Données démo
  const DEMO_ITEMS: DemoInventoryItem[] = [
    {
      id: 'demo-001',
      name: 'Casque de sécurité MSA V-Gard',
      sku: 'HELMET-MSA-001',
      category: 'Équipement de Protection',
      uom: 'UN',
      sellable: true,
      active: true,
      default_location_id: 'loc-warehouse',
      description: 'Casque de sécurité industriel certifié ANSI'
    },
    {
      id: 'demo-002',
      name: 'Perceuse sans fil DeWalt 20V',
      sku: 'DRILL-DW-20V',
      category: 'Outils électriques',
      uom: 'UN',
      sellable: true,
      active: true,
      default_location_id: 'loc-tools',
      description: 'Perceuse-visseuse sans fil avec batterie lithium'
    },
    {
      id: 'demo-003',
      name: 'Gants de protection nitrile',
      sku: 'GLOVES-NIT-100',
      category: 'Équipement de Protection',
      uom: 'BOITE',
      sellable: true,
      active: true,
      default_location_id: 'loc-warehouse',
      description: 'Gants jetables en nitrile, boîte de 100 pièces'
    },
    {
      id: 'demo-004',
      name: 'Échelle télescopique 3.8m',
      sku: 'LADDER-TEL-38',
      category: 'Équipement d\'accès',
      uom: 'UN',
      sellable: true,
      active: true,
      default_location_id: 'loc-yard',
      description: 'Échelle télescopique aluminium hauteur max 3.8m'
    },
    {
      id: 'demo-005',
      name: 'Détecteur de gaz portable',
      sku: 'GAS-DET-PRT',
      category: 'Instruments de mesure',
      uom: 'UN',
      sellable: false,
      active: true,
      default_location_id: 'loc-equipment',
      description: 'Détecteur multi-gaz portable avec alarmes'
    },
    {
      id: 'demo-006',
      name: 'Câble électrique 14 AWG',
      sku: 'CABLE-14AWG-100M',
      category: 'Matériel électrique',
      uom: 'M',
      sellable: true,
      active: true,
      default_location_id: 'loc-warehouse',
      description: 'Câble électrique cuivre 14 AWG, rouleau 100m'
    }
  ];

  useEffect(() => {
    // Simuler le chargement
    setLoading(true);
    setTimeout(() => {
      setItems(DEMO_ITEMS);
      updateStats(DEMO_ITEMS);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchTerm, filters]);

  const applyFilters = () => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.sellable) {
      filtered = filtered.filter(item => item.sellable);
    }

    if (filters.active) {
      filtered = filtered.filter(item => item.active);
    }

    setFilteredItems(filtered);
  };

  const updateStats = (itemsList: DemoInventoryItem[]) => {
    setStats({
      totalItems: itemsList.length,
      lowStockItems: 2,
      sellableItems: itemsList.filter(item => item.sellable).length,
      totalValue: 12450
    });
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const selectAllItems = () => {
    setSelectedItems(new Set(filteredItems.map(item => item.id)));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setSelectionMode(false);
  };

  const openLabelPrint = () => {
    if (selectedItems.size === 0) {
      setSelectionMode(true);
    } else {
      // Simuler la génération de PDF
      alert(`🏷️ PDF généré avec succès!\n${selectedItems.size} étiquette(s) prête(s) à imprimer.\n\n(En mode démo, aucun fichier n'est créé)`);
      clearSelection();
    }
  };

  const quickActions = [
    {
      id: 'scan',
      label: 'Scanner QR',
      icon: <Scan className="w-6 h-6" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => alert('📱 Scanner QR ouvert!\n(Démo: fonctionnalité disponible en version complète)')
    },
    {
      id: 'print-labels',
      label: 'Étiquettes',
      icon: <Printer className="w-6 h-6" />,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: openLabelPrint
    },
    {
      id: 'add-item',
      label: 'Nouvel article',
      icon: <Plus className="w-6 h-6" />,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => alert('➕ Création d\'article\n(Démo: données temporaires uniquement)')
    },
    {
      id: 'purchase-order',
      label: 'Commande',
      icon: <Truck className="w-6 h-6" />,
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => alert('🚚 Nouvelle commande\n(Démo: workflow disponible en version complète)')
    }
  ];

  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec retour démo */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-4">
          {/* Bandeau démo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Mode Démo</p>
              <p className="text-xs text-blue-700">Données temporaires - Aucune sauvegarde</p>
            </div>
            <a 
              href="/demo"
              className="text-blue-600 hover:text-blue-700 p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Inventaire QR</h1>
            <button className="p-2 rounded-full hover:bg-gray-100">
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

        {/* Selection Mode Header */}
        {selectionMode && (
          <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-indigo-900">
                Sélectionner articles pour étiquettes
              </h3>
              <button
                onClick={clearSelection}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Annuler
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-700">
                {selectedItems.size} article{selectedItems.size > 1 ? 's' : ''} sélectionné{selectedItems.size > 1 ? 's' : ''}
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={selectAllItems}
                  className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                >
                  Tout sélectionner
                </button>
                {selectedItems.size > 0 && (
                  <button
                    onClick={openLabelPrint}
                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-1"
                  >
                    <Printer className="w-3 h-3" />
                    Imprimer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Articles ({filteredItems.length})
            </h2>
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
                  className={`bg-white rounded-lg p-4 shadow-sm border transition-colors ${
                    selectedItems.has(item.id) 
                      ? 'border-indigo-300 bg-indigo-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  } ${selectionMode ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Selection Checkbox */}
                    {selectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItemSelection(item.id);
                        }}
                        className="flex-shrink-0 p-1"
                      >
                        {selectedItems.has(item.id) ? (
                          <CheckSquare className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    )}

                    <div className="flex items-center gap-3 flex-1">
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
                          {Math.floor(Math.random() * 50) + 5}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => alert('📱 Scanner QR mobile!\n(Version complète avec caméra)')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <QrCode className="w-6 h-6" />
      </button>
    </div>
  );
}