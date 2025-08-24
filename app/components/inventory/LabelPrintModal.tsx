'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Settings,
  Package,
  QrCode,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import type { InventoryItem, InventoryInstance } from '@/app/types/inventory';

interface LabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: (InventoryItem | InventoryInstance)[];
  title?: string;
}

interface LabelPrintRequest {
  items: Array<{
    id: string;
    name: string;
    sku?: string;
    instance_code?: string;
    category?: string;
    qrPayload: any;
  }>;
  labelTemplate: string;
  includeQR: boolean;
  includeName: boolean;
  includeSKU: boolean;
  includeCode: boolean;
  qrSize: 'small' | 'medium' | 'large';
}

const LABEL_TEMPLATES = {
  avery_5160: {
    name: 'Avery 5160 (3×10)',
    description: '30 étiquettes par page - 66.7×25.4mm',
    dimensions: '2.625" × 1"'
  },
  avery_8160: {
    name: 'Avery 8160 (3×10)',
    description: '30 étiquettes par page - 66.7×25.4mm',  
    dimensions: '2.625" × 1"'
  }
};

export default function LabelPrintModal({ 
  isOpen, 
  onClose, 
  items, 
  title = "Impression d'étiquettes" 
}: LabelPrintModalProps) {
  const [settings, setSettings] = useState({
    labelTemplate: 'avery_5160',
    includeQR: true,
    includeName: true,
    includeSKU: true,
    includeCode: true,
    qrSize: 'medium' as const
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (items.length === 0) {
      setError('Aucun article sélectionné');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      // Préparer les données pour l'API
      const requestData: LabelPrintRequest = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          instance_code: (item as InventoryInstance).instance_code,
          category: item.category,
          qrPayload: {
            type: (item as InventoryInstance).instance_code ? 'instance' : 'item',
            id: item.id,
            code: (item as InventoryInstance).instance_code || item.sku || item.id,
            timestamp: Math.floor(Date.now() / 1000)
          }
        })),
        ...settings
      };

      console.log(`🏷️ Génération de ${items.length} étiquettes...`);

      const response = await fetch('/api/inventory/labels/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération');
      }

      // Télécharger le PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `etiquettes-inventaire-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`${items.length} étiquettes générées et téléchargées avec succès!`);
      
      // Fermer automatiquement après succès
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      console.error('❌ Erreur génération étiquettes:', err);
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTemplate = LABEL_TEMPLATES[settings.labelTemplate];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl max-h-[90vh] overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Printer className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-gray-600">
                  {items.length} article{items.length > 1 ? 's' : ''} sélectionné{items.length > 1 ? 's' : ''}
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

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Messages d'état */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-green-800 text-sm">{success}</span>
              </div>
            )}

            {/* Template d'étiquette */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Settings className="w-4 h-4 inline mr-2" />
                Template d'étiquette
              </label>
              <div className="space-y-2">
                {Object.entries(LABEL_TEMPLATES).map(([key, template]) => (
                  <div key={key} className="flex items-center">
                    <input
                      type="radio"
                      id={key}
                      name="template"
                      value={key}
                      checked={settings.labelTemplate === key}
                      onChange={(e) => setSettings({ ...settings, labelTemplate: e.target.value })}
                      className="mr-3"
                    />
                    <label htmlFor={key} className="flex-1 cursor-pointer">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.description}</div>
                      <div className="text-xs text-gray-400">{template.dimensions}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Options d'affichage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <FileText className="w-4 h-4 inline mr-2" />
                Éléments à inclure
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.includeQR}
                    onChange={(e) => setSettings({ ...settings, includeQR: e.target.checked })}
                    className="mr-3"
                  />
                  <QrCode className="w-4 h-4 mr-2 text-gray-600" />
                  <span>Code QR</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.includeName}
                    onChange={(e) => setSettings({ ...settings, includeName: e.target.checked })}
                    className="mr-3"
                  />
                  <Package className="w-4 h-4 mr-2 text-gray-600" />
                  <span>Nom de l'article</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.includeSKU}
                    onChange={(e) => setSettings({ ...settings, includeSKU: e.target.checked })}
                    className="mr-3"
                  />
                  <span className="w-4 h-4 mr-2 text-center text-xs font-bold text-gray-600">SKU</span>
                  <span>Code SKU</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.includeCode}
                    onChange={(e) => setSettings({ ...settings, includeCode: e.target.checked })}
                    className="mr-3"
                  />
                  <span className="w-4 h-4 mr-2 text-center text-xs font-bold text-gray-600">#</span>
                  <span>Code d'instance</span>
                </label>
              </div>
            </div>

            {/* Taille du QR Code */}
            {settings.includeQR && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <QrCode className="w-4 h-4 inline mr-2" />
                  Taille du QR Code
                </label>
                <div className="flex gap-4">
                  {[
                    { key: 'small', label: 'Petit' },
                    { key: 'medium', label: 'Moyen' },
                    { key: 'large', label: 'Grand' }
                  ].map(size => (
                    <label key={size.key} className="flex items-center">
                      <input
                        type="radio"
                        name="qrSize"
                        value={size.key}
                        checked={settings.qrSize === size.key}
                        onChange={(e) => setSettings({ ...settings, qrSize: e.target.value as any })}
                        className="mr-2"
                      />
                      <span>{size.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Aperçu des articles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Articles à imprimer
              </label>
              <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                {items.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center gap-2 py-1">
                    <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm truncate">
                      {item.name}
                      {item.sku && ` (${item.sku})`}
                      {(item as InventoryInstance).instance_code && ` - ${(item as InventoryInstance).instance_code}`}
                    </span>
                  </div>
                ))}
                {items.length > 5 && (
                  <div className="text-xs text-gray-500 py-1">
                    ... et {items.length - 5} autre{items.length - 5 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium"
                disabled={isGenerating}
              >
                Annuler
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || items.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Générer PDF
                  </>
                )}
              </button>
            </div>
            
            {selectedTemplate && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                {selectedTemplate.description}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}