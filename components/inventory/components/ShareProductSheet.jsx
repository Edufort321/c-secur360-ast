import React, { useState, useEffect } from 'react';
import { X, Download, Link as LinkIcon, Mail, Check, FileText, DollarSign, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from './UI/Logo';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ShareProductSheet = ({ item, onClose, isOpen }) => {
  const { t } = useLanguage();

  // Champs sélectionnables
  const [selectedFields, setSelectedFields] = useState({
    code: true,
    name: true,
    description: true,
    category: true,
    photos: true,
    dimensions: false,
    weight: false,
    colors: false,
    brand: false,
    model: false,
    serialNumber: false,
    condition: false,
    warranty: false,
    quantity: false,
    minQuantity: false,
    maxQuantity: false,
    location: false,
    supplier: false,
    price: false,
    customPrice: false
  });

  // Prix personnalisé
  const [customPricing, setCustomPricing] = useState(() => ({
    enabled: false,
    showOnlySalePrice: false,
    costPrice: 0,
    salePrice: 0
  }));

  // Style de template
  const [template, setTemplate] = useState('professional'); // professional, minimal, detailed

  // Initialiser les prix quand item change
  useEffect(() => {
    if (item) {
      setCustomPricing(prev => ({
        ...prev,
        costPrice: item.costPrice || 0,
        salePrice: item.salePrice || 0
      }));
    }
  }, [item]);

  const toggleField = (field) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const toggleAllBasicInfo = () => {
    const basicFields = ['code', 'name', 'description', 'category'];
    const allSelected = basicFields.every(field => selectedFields[field]);

    const updates = {};
    basicFields.forEach(field => {
      updates[field] = !allSelected;
    });

    setSelectedFields(prev => ({ ...prev, ...updates }));
  };

  const toggleAllAdvancedInfo = () => {
    const advancedFields = ['photos', 'dimensions', 'weight', 'colors', 'brand', 'model', 'serialNumber', 'condition', 'warranty'];
    const allSelected = advancedFields.every(field => selectedFields[field]);

    const updates = {};
    advancedFields.forEach(field => {
      updates[field] = !allSelected;
    });

    setSelectedFields(prev => ({ ...prev, ...updates }));
  };

  const toggleAllStockInfo = () => {
    const stockFields = ['quantity', 'minQuantity', 'maxQuantity', 'location', 'supplier'];
    const allSelected = stockFields.every(field => selectedFields[field]);

    const updates = {};
    stockFields.forEach(field => {
      updates[field] = !allSelected;
    });

    setSelectedFields(prev => ({ ...prev, ...updates }));
  };

  const generatePDF = async () => {
    try {
      const element = document.getElementById('product-sheet-preview');

      // Attendre que toutes les images soient chargées
      const images = element.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue même si une image échoue
          });
        })
      );

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `fiche-produit-${item.code || 'article'}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  const copyLink = () => {
    if (!item) return;
    const link = `${window.location.origin}/product-sheet/${item.id}`;
    navigator.clipboard.writeText(link);
    alert(t('share.linkCopied'));
  };

  const shareByEmail = () => {
    if (!item) return;
    const subject = encodeURIComponent(`Fiche produit - ${item.name}`);
    const body = encodeURIComponent(`Consultez la fiche produit: ${item.name}\n\nCode: ${item.code}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Ne rien afficher si le modal n'est pas ouvert ou si item est null
  if (!isOpen || !item) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="normal" showText={true} />
            <div className="border-l border-gray-700 pl-4">
              <div className="flex items-center gap-2">
                <FileText size={20} />
                <h2 className="text-xl font-bold">{t('share.productSheet')}</h2>
              </div>
              <p className="text-gray-400 text-sm mt-1">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panneau de gauche - Configuration */}
            <div className="space-y-6">
              {/* Sélection de template */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FileText size={18} />
                  {t('share.templateStyle')}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {['professional', 'minimal', 'detailed'].map(style => (
                    <button
                      key={style}
                      onClick={() => setTemplate(style)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        template === style
                          ? 'bg-slate-700 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {t(`share.template${style.charAt(0).toUpperCase() + style.slice(1)}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Informations de base */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white">{t('share.basicInfo')}</h3>
                  <button
                    onClick={toggleAllBasicInfo}
                    className="text-sm text-slate-700 hover:text-slate-800"
                  >
                    {t('share.toggleAll')}
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'code', label: t('articles.code') },
                    { key: 'name', label: t('articles.name') },
                    { key: 'description', label: t('articles.description') },
                    { key: 'category', label: t('articles.category') }
                  ].map(field => (
                    <label key={field.key} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedFields[field.key]}
                        onChange={() => toggleField(field.key)}
                        className="w-4 h-4 text-slate-700 rounded focus:ring-2 focus:ring-slate-700"
                      />
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-slate-700 transition-colors">
                        {field.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Informations avancées */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white">{t('share.advancedInfo')}</h3>
                  <button
                    onClick={toggleAllAdvancedInfo}
                    className="text-sm text-slate-700 hover:text-slate-800"
                  >
                    {t('share.toggleAll')}
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'photos', label: t('articles.photos') },
                    { key: 'dimensions', label: t('articles.dimensions') },
                    { key: 'weight', label: t('articles.weight') },
                    { key: 'colors', label: t('articles.colors') },
                    { key: 'brand', label: t('articles.brand') },
                    { key: 'model', label: t('articles.model') },
                    { key: 'serialNumber', label: t('articles.serialNumber') },
                    { key: 'condition', label: t('articles.condition') },
                    { key: 'warranty', label: t('articles.warranty') }
                  ].map(field => (
                    <label key={field.key} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedFields[field.key]}
                        onChange={() => toggleField(field.key)}
                        className="w-4 h-4 text-slate-700 rounded focus:ring-2 focus:ring-slate-700"
                      />
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-slate-700 transition-colors">
                        {field.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Informations stock */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white">{t('share.stockInfo')}</h3>
                  <button
                    onClick={toggleAllStockInfo}
                    className="text-sm text-slate-700 hover:text-slate-800"
                  >
                    {t('share.toggleAll')}
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'quantity', label: t('articles.quantity') },
                    { key: 'minQuantity', label: t('articles.minQuantity') },
                    { key: 'maxQuantity', label: t('articles.maxQuantity') },
                    { key: 'location', label: t('articles.location') },
                    { key: 'supplier', label: t('articles.supplier') }
                  ].map(field => (
                    <label key={field.key} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedFields[field.key]}
                        onChange={() => toggleField(field.key)}
                        className="w-4 h-4 text-slate-700 rounded focus:ring-2 focus:ring-slate-700"
                      />
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-slate-700 transition-colors">
                        {field.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prix personnalisé */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={18} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-gray-900 dark:text-white">{t('share.customPricing')}</h3>
                </div>

                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={customPricing.enabled}
                    onChange={(e) => setCustomPricing(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {t('share.useCustomPrice')}
                  </span>
                </label>

                {customPricing.enabled && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={customPricing.showOnlySalePrice}
                        onChange={(e) => setCustomPricing(prev => ({ ...prev, showOnlySalePrice: e.target.checked }))}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Afficher seulement le prix de vente
                      </span>
                    </label>

                    {!customPricing.showOnlySalePrice && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('articles.costPrice')} ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={customPricing.costPrice}
                          onChange={(e) => setCustomPricing(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('articles.salePrice')} ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={customPricing.salePrice}
                        onChange={(e) => setCustomPricing(prev => ({ ...prev, salePrice: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                      />
                    </div>

                    {!customPricing.showOnlySalePrice && (
                      <div className="bg-blue-100 dark:bg-blue-900/30 rounded p-2 text-sm text-blue-800 dark:text-blue-300">
                        <strong>{t('share.margin')}:</strong> {((customPricing.salePrice - customPricing.costPrice) / customPricing.salePrice * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Panneau de droite - Prévisualisation */}
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">{t('share.preview')}</h3>

                <div id="product-sheet-preview" className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Header with logo - Style navy blue */}
                  <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <img
                          src="/assets/images/logo.png"
                          alt="C-Secur360 Logo"
                          crossOrigin="anonymous"
                          className="w-10 h-10 object-contain"
                        />
                        <div>
                          <h1 className="text-lg font-bold">C-SECUR360</h1>
                          <p className="text-xs text-gray-400">{t('share.productSheet')}</p>
                        </div>
                      </div>
                    </div>
                    {selectedFields.photos && item.photos && item.photos.length > 0 && (
                      <img
                        src={item.photos[0].url}
                        alt={item.name}
                        crossOrigin="anonymous"
                        className="w-20 h-20 object-cover rounded border-2 border-gray-700"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-3">
                    {selectedFields.code && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 min-w-[120px]">{t('articles.code')}:</span>
                        <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{item.code}</span>
                      </div>
                    )}

                    {selectedFields.name && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 min-w-[120px]">{t('articles.name')}:</span>
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                    )}

                    {selectedFields.description && item.description && (
                      <div>
                        <span className="font-semibold text-gray-700">{t('articles.description')}:</span>
                        <p className="text-gray-900 mt-1 text-sm">{item.description}</p>
                      </div>
                    )}

                    {selectedFields.category && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 min-w-[120px]">{t('articles.category')}:</span>
                        <span className="text-gray-900">{item.category}</span>
                      </div>
                    )}

                    {/* Prix */}
                    {customPricing.enabled && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-4">
                        {customPricing.showOnlySalePrice ? (
                          <div className="text-center">
                            <span className="text-sm font-semibold text-gray-700 block mb-1">{t('articles.salePrice')}:</span>
                            <p className="text-2xl font-bold text-green-600">${customPricing.salePrice.toFixed(2)}</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-sm font-semibold text-gray-700">{t('articles.costPrice')}:</span>
                              <p className="text-lg font-bold text-gray-900">${customPricing.costPrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-700">{t('articles.salePrice')}:</span>
                              <p className="text-lg font-bold text-green-600">${customPricing.salePrice.toFixed(2)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Informations avancées sélectionnées */}
                    {(selectedFields.brand || selectedFields.model) && (
                      <div className="border-t pt-3 mt-3">
                        {selectedFields.brand && item.brand && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-700 min-w-[120px]">{t('articles.brand')}:</span>
                            <span className="text-gray-900">{item.brand}</span>
                          </div>
                        )}
                        {selectedFields.model && item.model && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700 min-w-[120px]">{t('articles.model')}:</span>
                            <span className="text-gray-900">{item.model}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="border-t pt-4 mt-6">
                      <p className="text-xs text-gray-500 text-center">
                        {new Date().toLocaleDateString()} - C-SECUR360 Inventory System
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-100 dark:bg-gray-900 p-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              <Download size={20} />
              {t('share.downloadPDF')}
            </button>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <LinkIcon size={20} />
              {t('share.copyLink')}
            </button>
            <button
              onClick={shareByEmail}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              <Mail size={20} />
              {t('share.shareEmail')}
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
          >
            {t('actions.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
